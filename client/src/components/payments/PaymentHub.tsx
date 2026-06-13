import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewards } from '../../context/RewardsContext';
import { useWealthStore } from '../../store/wealthStore';
import { syncTransactionToSupabase } from '../../hooks/useSupabaseSync';
import { computeCashback } from '../../services/cashbackEngine';
import { getStreak } from '../../services/streakService';
import MPINInput from './MPINInput';
import QrScannerSimulator from './QrScannerSimulator';
import AnimatedTransactionToast from './AnimatedTransactionToast';
import VoicePayment from './VoicePayment';
import SpinWheel from './SpinWheel';
import { modalOverlay, modalContent, staggerContainer, staggerItem } from '../../utils/animations';

interface Transaction {
  id: string;
  amount: number;
  payee: string;
  date: string;
  status: 'success' | 'failed';
  cashbackEarned: number;
}

const TABS = [
  { id: 'send', label: 'Send', icon: 'fa-paper-plane' },
  { id: 'request', label: 'Request', icon: 'fa-hand-holding-dollar' },
  { id: 'scan', label: 'Scan', icon: 'fa-qrcode' },
  { id: 'account', label: 'To A/C', icon: 'fa-building-columns' },
  { id: 'voice', label: 'Voice', icon: 'fa-microphone' },
];

function getPayeeName(input: string): string {
  const names: Record<string, string> = {
    'swiggy@upi': 'Swiggy', 'zomato@upi': 'Zomato', 'bigbasket@upi': 'BigBasket',
    'amazon@upi': 'Amazon India', 'reliancefresh@upi': 'Reliance Fresh',
    'merchant@paytm': 'Local Store', '9876543210@paytm': 'Deepanshu Sharma',
    'deepanshu@okaxis': 'Deepanshu Bansal', 'priya@paytm': 'Priya Verma',
  };
  return names[input] || input.split('@')[0] || 'Contact';
}

export default function PaymentHub() {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('send');
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [remark, setRemark] = useState('');
  const [showMPIN, setShowMPIN] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [pendingTx, setPendingTx] = useState<{ amount: number; payee: string; remark?: string } | null>(null);
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error'; title: string; message: string; cashback?: number }>({
    show: false, type: 'success', title: '', message: '',
  });
  const [showSpinWheel, setShowSpinWheel] = useState(false);

  const { addCashback } = useRewards();
  const streak = getStreak();

  const showToast = (type: 'success' | 'error', title: string, message: string, cashback?: number) => {
    setToast({ show: true, type, title, message, cashback });
  };

  const handlePay = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { showToast('error', 'Invalid Amount', 'Enter a valid amount'); return; }

    let payee = '';
    if (activeTab === 'send' || activeTab === 'request') {
      payee = beneficiary || getPayeeName(upiId) || 'Contact';
    } else if (activeTab === 'account') {
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) { showToast('error', 'Invalid IFSC', 'Format: SBIN0123456'); return; }
      if (accountNo.length < 9) { showToast('error', 'Invalid Account', 'Enter valid account number'); return; }
      payee = beneficiary || 'Bank Account';
    }

    if (activeTab === 'request') {
      showToast('success', 'Request Sent!', `₹${amt} requested from ${payee}`);
      setAmount(''); setUpiId(''); setBeneficiary('');
      return;
    }

    setPendingTx({ amount: amt, payee, remark });
    setShowMPIN(true);
  };

  const handleMPINSubmit = (pin: string) => {
    setShowMPIN(false);
    if (!pendingTx) return;
    const isSuccess = pin.length === 6;
    if (!isSuccess) {
      showToast('error', 'Payment Failed', 'Incorrect MPIN. Please try again.');
      return;
    }

    const isP2P = activeTab === 'send';
    const isUtility = (remark || '').toLowerCase().includes('bill');
    const merchant = upiId || pendingTx.payee || '';

    const cashback = computeCashback({
      amount: pendingTx.amount || 0,
      merchant,
      streakDays: streak.days,
      isUtility,
      isP2P,
    });

    const tx: Transaction = {
      id: 'TXN' + Date.now(),
      amount: pendingTx.amount || 0,
      payee: pendingTx.payee || '',
      date: new Date().toISOString(),
      status: 'success',
      cashbackEarned: cashback.total,
    };

    // Save transaction to localStorage
    const existing = JSON.parse(localStorage.getItem('sw_upi_transactions') || '[]');
    localStorage.setItem('sw_upi_transactions', JSON.stringify([tx, ...existing].slice(0, 50)));

    // Record in global wealth store (deducts from bank + shows in Recent Transactions)
    const store = useWealthStore.getState();
    const primaryBank = store.assets.find((a) => a.type === 'bank');
    if (primaryBank && tx.amount > 0) {
      store.updateAsset(primaryBank.id, { value: Math.max(0, primaryBank.value - tx.amount) });
    }
    const storeTx = {
      id: tx.id,
      date: new Date().toISOString().split('T')[0],
      description: `UPI Payment — ${tx.payee}`,
      category: isUtility ? 'Utilities' : isP2P ? 'Transfer' : 'Shopping',
      amount: tx.amount,
      type: 'debit' as const,
      status: 'ALLOWED' as const,
      riskLevel: 'LOW' as const,
    };
    store.addTransaction(storeTx);
    syncTransactionToSupabase(storeTx);

    addCashback(cashback.total, 'transaction', tx.payee);

    const parts: string[] = [];
    if (cashback.base > 0) parts.push(`₹${cashback.base.toFixed(2)} merchant-funded`);
    if (cashback.streakBonus > 0) parts.push(`₹${cashback.streakBonus.toFixed(2)} streak bonus`);
    if (cashback.utilityBonus > 0) parts.push(`₹${cashback.utilityBonus.toFixed(2)} green action`);

    showToast('success', 'Payment Successful!', `Paid ₹${tx.amount.toLocaleString()} to ${tx.payee}`, cashback.total);
    setShowSpinWheel(true);

    // Reset
    setAmount(''); setUpiId(''); setAccountNo(''); setIfsc(''); setBeneficiary(''); setRemark('');
  };

  const handleQRScan = (scannedUpi: string, scannedName: string, scannedAmount?: number) => {
    setShowQR(false);
    setUpiId(scannedUpi);
    setBeneficiary(scannedName);
    if (scannedAmount) setAmount(String(scannedAmount));
    setActiveTab('send');
    showToast('success', 'QR Scanned', `${scannedName} (${scannedUpi})`);
  };

  const handleVoicePay = (voiceAmount: number, voicePayee: string) => {
    setAmount(String(voiceAmount));
    setBeneficiary(voicePayee);
    setUpiId(voicePayee.toLowerCase().replace(/\s/g, '') + '@upi');
    setActiveTab('send');
  };

  // Quick pay from bar
  const [quickInput, setQuickInput] = useState('');
  const handleQuickPay = () => {
    if (!quickInput) return;
    setUpiId(quickInput);
    setBeneficiary(getPayeeName(quickInput));
    setExpanded(true);
    setActiveTab('send');
    setQuickInput('');
  };

  // Listen for mood bonus & open hub events
  useEffect(() => {
    const moodHandler = (e: any) => {
      addCashback(e.detail.amount, 'mood-bonus', e.detail.mood);
    };
    const openHandler = () => setExpanded(true);
    window.addEventListener('sw-mood-bonus', moodHandler);
    window.addEventListener('sw-open-payment-hub', openHandler);
    return () => {
      window.removeEventListener('sw-mood-bonus', moodHandler);
      window.removeEventListener('sw-open-payment-hub', openHandler);
    };
  }, [addCashback]);

  return (
    <>
      {/* Sticky Payment Bar */}
      <div className="sticky top-0 z-40 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <i className="fas fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickPay()}
              placeholder="Enter UPI ID, Phone, or Name..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 dark:text-white transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleQuickPay}
            className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <i className="fas fa-bolt" />
            Pay
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setExpanded(true)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-sm flex items-center gap-2"
          >
            <i className="fas fa-expand" />
            <span className="hidden sm:inline">More</span>
          </motion.button>
        </div>
      </div>

      {/* Expanded Payment Modal */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            variants={modalOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <i className="fas fa-bolt text-primary" />
                  Pay Anyone
                </h2>
                <button
                  onClick={() => setExpanded(false)}
                  className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700"
                >
                  <i className="fas fa-xmark" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-2 bg-slate-50 dark:bg-slate-800/50 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <i className={`fas ${tab.icon}`} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Amount */}
                <div className="text-center py-2">
                  <p className="text-xs text-slate-400 mb-1">Amount (₹)</p>
                  <div className="flex items-center justify-center">
                    <span className="text-2xl text-slate-400 mr-1">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="text-5xl font-bold bg-transparent text-center text-slate-800 dark:text-white outline-none w-40 placeholder:text-slate-200 dark:placeholder:text-slate-700"
                    />
                  </div>
                </div>

                {/* Fields */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {activeTab === 'voice' ? (
                    <motion.div variants={staggerItem}>
                      <VoicePayment onPay={handleVoicePay} />
                    </motion.div>
                  ) : activeTab === 'scan' ? (
                    <motion.div variants={staggerItem} className="text-center py-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowQR(true)}
                        className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-3"
                      >
                        <i className="fas fa-qrcode text-primary text-3xl" />
                      </motion.button>
                      <p className="text-sm text-slate-500">Tap to scan any QR code</p>
                    </motion.div>
                  ) : (
                    <>
                      {(activeTab === 'send' || activeTab === 'request') && (
                        <>
                          <motion.input
                            variants={staggerItem}
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="UPI ID or Phone (e.g. rahul@paytm)"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-primary/50 dark:text-white"
                          />
                          <motion.input
                            variants={staggerItem}
                            value={beneficiary}
                            onChange={(e) => setBeneficiary(e.target.value)}
                            placeholder="Beneficiary Name"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-primary/50 dark:text-white"
                          />
                        </>
                      )}
                      {activeTab === 'account' && (
                        <>
                          <motion.input variants={staggerItem} value={accountNo} onChange={(e) => setAccountNo(e.target.value)} placeholder="Account Number" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-primary/50 dark:text-white" />
                          <motion.input variants={staggerItem} value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} placeholder="IFSC (SBIN0123456)" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-primary/50 dark:text-white" />
                          <motion.input variants={staggerItem} value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} placeholder="Beneficiary Name" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-primary/50 dark:text-white" />
                        </>
                      )}
                      <motion.input
                        variants={staggerItem}
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="Remark (optional)"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-primary/50 dark:text-white"
                      />
                    </>
                  )}
                </motion.div>

                {/* Cashback Preview */}
                {amount && parseFloat(amount) > 0 && activeTab !== 'voice' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center gap-2 text-xs text-green-700 dark:text-green-400"
                  >
                    <i className="fas fa-gift" />
                    <span>
                      Estimated cashback: ₹
                      {computeCashback({
                        amount: parseFloat(amount),
                        merchant: upiId || beneficiary,
                        streakDays: streak.days,
                        isUtility: remark.toLowerCase().includes('bill'),
                        isP2P: activeTab === 'send',
                      }).total.toFixed(2)}
                    </span>
                  </motion.div>
                )}

                {/* Action Button */}
                {activeTab !== 'voice' && activeTab !== 'scan' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePay}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-shield-halved" />
                    {activeTab === 'request' ? 'Request Money' : 'Pay Securely'}
                  </motion.button>
                )}

                {/* Streak badge */}
                {streak.days > 0 && (
                  <div className="flex items-center justify-center gap-2 text-xs text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl">
                    <motion.i
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="fas fa-fire"
                    />
                    <span>{streak.days} day streak — extra {Math.min(streak.days * 0.1, 5).toFixed(1)}% cashback</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MPIN */}
      {showMPIN && pendingTx && (
        <MPINInput
          onSubmit={handleMPINSubmit}
          onCancel={() => setShowMPIN(false)}
          amount={pendingTx.amount || 0}
          payee={pendingTx.payee || ''}
        />
      )}

      {/* QR */}
      {showQR && <QrScannerSimulator onScan={handleQRScan} onClose={() => setShowQR(false)} />}

      {/* Spin Wheel */}
      <AnimatePresence>
        {showSpinWheel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowSpinWheel(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <SpinWheel />
              <div className="text-center mt-4">
                <button
                  onClick={() => setShowSpinWheel(false)}
                  className="px-6 py-2 bg-white/20 text-white rounded-xl text-sm font-bold hover:bg-white/30"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatedTransactionToast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        amount={toast.cashback}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </>
  );
}

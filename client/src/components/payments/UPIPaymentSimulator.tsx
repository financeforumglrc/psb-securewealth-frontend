import { useState, useCallback } from 'react';
import { useRewards } from '../../context/RewardsContext';
import { computeCashback } from '../../services/cashbackEngine';
import { getStreak } from '../../services/streakService';
import { addTransactionToChain } from '../../services/blockchainService';
import { backendApi } from '../../lib/backendApi';
import MPINInput from './MPINInput';
import QrScannerSimulator from './QrScannerSimulator';

interface Transaction {
  id: string;
  amount: number;
  payee: string;
  date: string;
  status: 'success' | 'failed';
  cashbackEarned: number;
  upiId?: string;
  accountNo?: string;
  remark?: string;
}

interface ContactManager {
  getProperties: () => Promise<string[]>;
  select: (props: string[], opts: { multiple: boolean }) => Promise<Array<{ name?: string[]; tel?: string[] }>>;
}

const TAB_CONFIG = [
  { id: 'send', label: 'Send Money', icon: 'fa-paper-plane' },
  { id: 'scan', label: 'Scan QR', icon: 'fa-qrcode' },
  { id: 'account', label: 'To Account', icon: 'fa-building-columns' },
  { id: 'upi', label: 'UPI ID', icon: 'fa-at' },
];

function getPayeeName(input: string): string {
  const names: Record<string, string> = {
    'swiggy@upi': 'Swiggy',
    'zomato@upi': 'Zomato',
    'bigbasket@upi': 'BigBasket',
    'amazon@upi': 'Amazon India',
    'reliancefresh@upi': 'Reliance Fresh',
    'merchant@paytm': 'Local Store',
    '9876543210@paytm': 'Deepanshu Sharma',
    'deepanshu@okaxis': 'Deepanshu Bansal',
    'priya@paytm': 'Priya Verma',
  };
  return names[input] || 'Merchant / User';
}

export default function UPIPaymentSimulator() {
  const [activeTab, setActiveTab] = useState('send');
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [remark, setRemark] = useState('');
  const [showMPIN, setShowMPIN] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try { return JSON.parse(localStorage.getItem('sw_upi_transactions') || '[]'); }
    catch { return []; }
  });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pendingTx, setPendingTx] = useState<Partial<Transaction> | null>(null);
  const [isPickingContact, setIsPickingContact] = useState(false);
  const [isPaymentRequesting, setIsPaymentRequesting] = useState(false);

  const { addCashback } = useRewards();
  const streak = getStreak();

  const canPickContacts = typeof navigator !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window;
  const canUsePaymentRequest = typeof window !== 'undefined' && 'PaymentRequest' in window;

  const saveTx = useCallback((tx: Transaction) => {
    setTransactions((prev) => {
      const updated = [tx, ...prev].slice(0, 50);
      localStorage.setItem('sw_upi_transactions', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const validateAndPrepare = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { showToast('error', 'Enter a valid amount'); return null; }

    let payee = '';
    let upi = '';
    let acc = '';

    if (activeTab === 'send') {
      payee = beneficiary || 'Contact';
    } else if (activeTab === 'upi') {
      if (!upiId.includes('@')) { showToast('error', 'Invalid UPI ID (must contain @)'); return null; }
      payee = getPayeeName(upiId);
      upi = upiId;
    } else if (activeTab === 'account') {
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) { showToast('error', 'Invalid IFSC (format: SBIN0123456)'); return null; }
      if (accountNo.length < 9) { showToast('error', 'Invalid account number'); return null; }
      payee = beneficiary || 'Bank Account';
      acc = accountNo;
    } else if (activeTab === 'scan') {
      showToast('error', 'Use the Scan QR button'); return null;
    }

    return { amt, payee, upi, acc };
  };

  const handlePay = () => {
    const data = validateAndPrepare();
    if (!data) return;
    setPendingTx({ amount: data.amt, payee: data.payee, upiId: data.upi, accountNo: data.acc, remark });
    setShowMPIN(true);
  };

  const handleMPINSubmit = async (pin: string) => {
    setShowMPIN(false);
    if (!pendingTx) return;

    if (!/^\d{6}$/.test(pin)) {
      showToast('error', 'MPIN must be exactly 6 digits.');
      return;
    }

    const verify = await backendApi.verifyMpin(pin);
    if (!verify.ok || !verify.data?.valid) {
      showToast('error', 'Payment failed. Incorrect MPIN.');
      return;
    }

    // Simulate processing
    setTimeout(() => {
      const cashback = computeCashback({
        amount: pendingTx.amount || 0,
        merchant: pendingTx.upiId || pendingTx.payee || '',
        streakDays: streak.days,
        isUtility: (pendingTx.remark || '').toLowerCase().includes('bill'),
        isP2P: activeTab === 'send',
      });

      const tx: Transaction = {
        id: 'TXN' + Date.now(),
        amount: pendingTx.amount || 0,
        payee: pendingTx.payee || '',
        date: new Date().toISOString(),
        status: 'success',
        cashbackEarned: cashback.total,
        upiId: pendingTx.upiId,
        accountNo: pendingTx.accountNo,
        remark: pendingTx.remark,
      };

      saveTx(tx);
      addCashback(cashback.total, 'transaction', tx.payee);

      // Add to blockchain audit
      addTransactionToChain(tx.id, {
        amount: tx.amount,
        payee: tx.payee,
        upiId: tx.upiId,
        accountNo: tx.accountNo,
        remark: tx.remark,
        cashback: cashback.total,
        timestamp: tx.date,
      }).catch(() => { /* silent fail */ });

      // Haptic feedback on supported devices
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }

      const parts: string[] = [];
      if (cashback.base > 0) parts.push(`₹${cashback.base.toFixed(2)} merchant-funded`);
      if (cashback.streakBonus > 0) parts.push(`₹${cashback.streakBonus.toFixed(2)} streak bonus`);
      if (cashback.utilityBonus > 0) parts.push(`₹${cashback.utilityBonus.toFixed(2)} green action`);

      showToast('success', `Paid ₹${tx.amount.toLocaleString()}! Cashback: ${parts.join(', ') || 'None'}`);
      setAmount(''); setUpiId(''); setAccountNo(''); setIfsc(''); setBeneficiary(''); setRemark('');
    }, 600);
  };

  const handleQRScan = (scannedUpi: string, scannedName: string, scannedAmount?: number) => {
    setShowQR(false);
    setActiveTab('scan');
    setUpiId(scannedUpi);
    setBeneficiary(scannedName);
    if (scannedAmount) setAmount(String(scannedAmount));
    showToast('success', `Scanned: ${scannedName} (${scannedUpi})`);
  };

  const handlePickContact = async () => {
    if (!canPickContacts) {
      showToast('error', 'Contact picker not supported on this browser');
      return;
    }
    setIsPickingContact(true);
    try {
      const props = ['name', 'tel'];
      const contactsManager = (navigator as unknown as { contacts: ContactManager }).contacts;
      const supported = await contactsManager.getProperties();
      if (!supported.includes('name') || !supported.includes('tel')) {
        showToast('error', 'Required contact properties not supported');
        return;
      }
      const contacts = await contactsManager.select(props, { multiple: false });
      if (contacts && contacts.length > 0) {
        const contact = contacts[0];
        const name = contact.name?.[0] || '';
        const tel = contact.tel?.[0] || '';
        if (name) setBeneficiary(name);
        if (tel) setUpiId(`${tel}@upi`);
        showToast('success', `Contact selected: ${name || tel}`);
      }
    } catch {
      showToast('error', 'Contact picker cancelled or failed');
    } finally {
      setIsPickingContact(false);
    }
  };

  const handlePayWithDevice = async () => {
    const data = validateAndPrepare();
    if (!data) return;
    if (!canUsePaymentRequest) {
      showToast('error', 'Payment Request API not supported');
      return;
    }
    setIsPaymentRequesting(true);
    try {
      const paymentMethods = [{
        supportedMethods: 'basic-card',
        data: {
          supportedNetworks: ['visa', 'mastercard', 'amex'],
          supportedTypes: ['debit', 'credit']
        }
      }];
      const paymentDetails = {
        total: { label: 'Total', amount: { currency: 'INR', value: data.amt.toFixed(2) } },
        displayItems: [
          { label: `Payment to ${data.payee}`, amount: { currency: 'INR', value: data.amt.toFixed(2) } }
        ]
      };
      const RequestCtor = (window as unknown as { PaymentRequest: new (...args: unknown[]) => { canMakePayment?: () => Promise<boolean>; show: () => Promise<{ complete: (status: string) => Promise<void> }> } }).PaymentRequest;
      const request = new RequestCtor(paymentMethods, paymentDetails);
      let canMakePayment = true;
      try {
        if (request.canMakePayment) {
          canMakePayment = await request.canMakePayment();
        }
      } catch {
        canMakePayment = true;
      }
      if (!canMakePayment) {
        showToast('error', 'No payment methods available on this device');
        return;
      }
      const response = await request.show();
      const tx: Transaction = {
        id: 'TXN' + Date.now(),
        amount: data.amt,
        payee: data.payee,
        date: new Date().toISOString(),
        status: 'success',
        cashbackEarned: 0,
        upiId: data.upi,
        accountNo: data.acc,
        remark: remark || 'Device Payment',
      };
      saveTx(tx);
      await response.complete('success');
      showToast('success', `Paid ₹${data.amt.toLocaleString()} via device`);
      setAmount(''); setUpiId(''); setAccountNo(''); setIfsc(''); setBeneficiary(''); setRemark('');
    } catch {
      showToast('error', 'Payment request cancelled');
    } finally {
      setIsPaymentRequesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Glassmorphic Payment Card */}
      <div className="card rounded-3xl shadow-xl p-6">
        {/* Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-3 px-1 rounded-xl text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <i className={`fas ${tab.icon} text-lg mb-1`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <div className="text-center mb-6">
          <p className="text-xs text-slate-400 mb-1">Enter Amount (₹)</p>
          <div className="flex items-center justify-center">
            <span className="text-3xl text-slate-400 mr-1">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="text-5xl font-bold bg-transparent text-center text-slate-800 dark:text-white outline-none w-48 placeholder:text-slate-200 dark:placeholder:text-slate-700"
            />
          </div>
        </div>

        {/* Form Fields by Tab */}
        <div className="space-y-3 mb-6">
          {activeTab === 'send' && (
            <>
              <div className="flex gap-2">
                <input
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                  placeholder="Beneficiary Name"
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-primary/50 dark:text-white"
                />
                {canPickContacts && (
                  <button
                    onClick={handlePickContact}
                    disabled={isPickingContact}
                    className="px-3 py-3 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1.5 whitespace-nowrap disabled:opacity-60"
                  >
                    <i className={`fas ${isPickingContact ? 'fa-spinner fa-spin' : 'fa-address-book'}`} />
                    Pick Contacts
                  </button>
                )}
              </div>
              <input
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="UPI ID or Mobile Number"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-primary/50 dark:text-white"
              />
            </>
          )}
          {activeTab === 'upi' && (
            <input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="username@bank (e.g. deepanshu@okaxis)"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-primary/50 dark:text-white"
            />
          )}
          {activeTab === 'account' && (
            <>
              <input
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                placeholder="Account Number"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-primary/50 dark:text-white"
              />
              <input
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                placeholder="IFSC Code (SBIN0123456)"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-primary/50 dark:text-white"
              />
              <input
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                placeholder="Beneficiary Name"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-primary/50 dark:text-white"
              />
            </>
          )}
          {activeTab === 'scan' && (
            <div className="text-center py-8">
              <button
                onClick={() => setShowQR(true)}
                className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-3 hover:bg-primary/20 transition-colors"
              >
                <i className="fas fa-qrcode text-primary text-3xl" />
              </button>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tap to scan any QR code</p>
            </div>
          )}

          {/* Remark */}
          {activeTab !== 'scan' && (
            <input
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Remark (optional)"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-primary/50 dark:text-white"
            />
          )}
        </div>

        {/* Pay Buttons */}
        {activeTab !== 'scan' && (
          <div className="space-y-3">
            {/* Real UPI Deep Link */}
            {(activeTab === 'upi' || activeTab === 'send') && upiId.includes('@') && (
              <a
                href={`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(beneficiary || getPayeeName(upiId))}&am=${encodeURIComponent(amount || '0')}&cu=INR&tn=${encodeURIComponent(remark || 'SecureWealth Payment')}`}
                className="block w-full py-3 bg-emerald-500 text-white rounded-2xl font-bold text-base hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                onClick={() => {
                  const data = validateAndPrepare();
                  if (!data) return;
                  const tx: Transaction = {
                    id: 'TXN' + Date.now(),
                    amount: data.amt,
                    payee: data.payee,
                    date: new Date().toISOString(),
                    status: 'success',
                    cashbackEarned: 0,
                    upiId: data.upi,
                    remark: remark || 'UPI App Payment',
                  };
                  saveTx(tx);
                  showToast('success', `UPI app opened for ₹${data.amt.toLocaleString()}`);
                }}
              >
                <i className="fas fa-mobile-screen-button" />
                Pay with UPI App (GPay / PhonePe)
              </a>
            )}
            {canUsePaymentRequest && (
              <button
                onClick={handlePayWithDevice}
                disabled={isPaymentRequesting}
                className="w-full py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl font-bold text-base hover:bg-slate-900 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
              >
                <i className={`fas ${isPaymentRequesting ? 'fa-spinner fa-spin' : 'fa-credit-card'}`} />
                Pay with Device
              </button>
            )}
            <button
              onClick={handlePay}
              className="w-full py-3 bg-primary text-white rounded-2xl font-bold text-base hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <i className="fas fa-shield-halved" />
              Demo Payment
            </button>
          </div>
        )}

        {/* Streak badge */}
        {streak.days > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl">
            <i className="fas fa-fire" />
            <span>{streak.days} day streak — extra {Math.min(streak.days * 0.1, 5).toFixed(1)}% cashback applied</span>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="card rounded-3xl shadow-xl p-6">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <i className="fas fa-clock-rotate-left text-primary" />
            Recent Transactions
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <i className="fas fa-arrow-right text-primary text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{tx.payee}</p>
                    <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">-₹{tx.amount.toLocaleString()}</p>
                  {tx.cashbackEarned > 0 && (
                    <p className="text-xs text-green-500">+₹{tx.cashbackEarned.toFixed(2)} cashback</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showMPIN && pendingTx && (
        <MPINInput
          onSubmit={handleMPINSubmit}
          onCancel={() => setShowMPIN(false)}
          amount={pendingTx.amount || 0}
          payee={pendingTx.payee || ''}
        />
      )}
      {showQR && <QrScannerSimulator onScan={handleQRScan} onClose={() => setShowQR(false)} />}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[60] px-5 py-3 rounded-xl shadow-2xl text-white font-medium animate-in slide-in-from-bottom-4 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-rose-500'
        }`}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-circle-xmark'} mr-2`} />
          {toast.message}
        </div>
      )}
    </div>
  );
}

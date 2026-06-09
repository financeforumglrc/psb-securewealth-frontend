import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearDuressLockdown } from '../../services/duressService';
import { logSecurityEvent } from '../../utils/securityLogger';

const FAKE_BALANCE = 12430;
const FAKE_TRANSACTIONS = [
  { id: 1, date: 'Today', desc: 'UPI to Swiggy', amount: -340, type: 'debit' },
  { id: 2, date: 'Yesterday', desc: 'Salary Credit', amount: 45000, type: 'credit' },
  { id: 3, date: 'Yesterday', desc: 'ATM Withdrawal', amount: -5000, type: 'debit' },
  { id: 4, date: '2 days ago', desc: 'Electricity Bill', amount: -1200, type: 'debit' },
  { id: 5, date: '3 days ago', desc: 'UPI to Zomato', amount: -280, type: 'debit' },
];

export default function DecoyAccountView() {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferStep, setTransferStep] = useState<'input' | 'confirm' | 'fake-success'>('input');
  const [gpsLocation, setGpsLocation] = useState<string | null>(null);
  const [silentAlerts, setSilentAlerts] = useState<string[]>([]);

  useEffect(() => {
    // Capture "GPS" location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
          setGpsLocation(loc);
          logSecurityEvent('Duress', 'Decoy Mode GPS Captured', 'critical', `Location: ${loc}`);
        },
        () => setGpsLocation('Permission denied — IP geolocation fallback active')
      );
    }
    // Log silent alerts
    const alerts = [
      `SILENT ALERT sent to PSB Fraud Team at ${new Date().toLocaleTimeString()}`,
      `Alternate device (Priya Sharma) notified via SMS`,
      `Real account frozen. Decoy mode active.`,
      `Session recording enabled for evidence collection.`,
    ];
    setSilentAlerts(alerts);
    alerts.forEach((a) => logSecurityEvent('Duress', a, 'critical', 'Coercion Response System'));
  }, []);

  function handleTransfer() {
    const amount = Number(transferAmount);
    if (amount > 500) {
      alert('Transfer limit exceeded. Maximum ₹500 per transaction.');
      return;
    }
    setTransferStep('fake-success');
    logSecurityEvent('Duress', `Fake transfer of ₹${amount} to ${transferTo} executed`, 'critical', 'Attacker satisfied with decoy');
    setTimeout(() => {
      setShowTransferModal(false);
      setTransferStep('input');
      setTransferAmount('');
      setTransferTo('');
    }, 3000);
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Coercion Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-rose-600 text-white rounded-xl flex items-center gap-3"
      >
        <i className="fas fa-user-secret text-xl animate-pulse" />
        <div>
          <p className="text-sm font-bold">DECOY ACCOUNT MODE — ATTACKER IS BEING FED FAKE DATA</p>
          <p className="text-[10px] text-white/80">Your real account is safe. Silent alerts active. GPS captured.</p>
        </div>
        <button
          onClick={() => { clearDuressLockdown(); window.location.reload(); }}
          className="ml-auto px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-bold"
        >
          <i className="fas fa-unlock mr-1" /> Exit Decoy
        </button>
      </motion.div>

      {/* Fake Balance */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white"
      >
        <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Available Balance (DECOY)</p>
        <p className="text-4xl font-extrabold">₹{FAKE_BALANCE.toLocaleString()}</p>
        <p className="text-xs text-slate-400 mt-2">
          <i className="fas fa-circle-info mr-1" />
          This is a fake balance shown to the attacker. Your real funds are secure.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: 'fa-paper-plane', label: 'Transfer', color: 'bg-primary', onClick: () => setShowTransferModal(true) },
          { icon: 'fa-qrcode', label: 'Scan & Pay', color: 'bg-slate-600', onClick: () => {} },
          { icon: 'fa-clock-rotate-left', label: 'History', color: 'bg-slate-600', onClick: () => {} },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            className={`p-3 ${btn.color} text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity`}
          >
            <i className={`fas ${btn.icon} mb-1 block text-lg`} />
            {btn.label}
          </button>
        ))}
      </div>

      {/* Fake Transactions */}
      <div className="card">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Recent Transactions (FAKE)</h3>
        <div className="space-y-2">
          {FAKE_TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{tx.desc}</p>
                <p className="text-[10px] text-slate-400">{tx.date}</p>
              </div>
              <p className={`text-xs font-bold ${tx.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {tx.type === 'credit' ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Silent Alert Log */}
      <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-900/10">
        <p className="text-xs font-bold text-rose-700 dark:text-rose-300 mb-2">
          <i className="fas fa-satellite-dish mr-1 animate-pulse" /> SILENT ALERT LOG (Visible to you only)
        </p>
        <div className="space-y-1">
          {silentAlerts.map((alert, i) => (
            <p key={i} className="text-[10px] text-rose-600 dark:text-rose-400 font-mono">{i + 1}. {alert}</p>
          ))}
          {gpsLocation && (
            <p className="text-[10px] text-rose-600 dark:text-rose-400 font-mono">
              {silentAlerts.length + 1}. GPS: {gpsLocation}
            </p>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      <AnimatePresence>
        {showTransferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6"
            >
              {transferStep === 'input' && (
                <>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Transfer Money (DECOY)</h3>
                  <p className="text-[10px] text-amber-600 mb-3">
                    <i className="fas fa-triangle-exclamation mr-1" />
                    Attacker sees this as real. Transfer limit: ₹500 max.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold">To</label>
                      <input
                        value={transferTo}
                        onChange={(e) => setTransferTo(e.target.value)}
                        placeholder="Enter payee name"
                        className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Amount (₹)</label>
                      <input
                        type="number"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="Max ₹500"
                        className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                      />
                    </div>
                    <button
                      onClick={() => setTransferStep('confirm')}
                      className="w-full py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
                    >
                      Continue
                    </button>
                    <button
                      onClick={() => setShowTransferModal(false)}
                      className="w-full py-2 text-xs text-slate-400"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
              {transferStep === 'confirm' && (
                <>
                  <div className="text-center mb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <i className="fas fa-paper-plane text-primary text-xl" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Confirm Transfer</p>
                    <p className="text-xs text-slate-500">₹{transferAmount} to {transferTo}</p>
                  </div>
                  <button
                    onClick={handleTransfer}
                    className="w-full py-2.5 bg-primary text-white rounded-xl font-bold text-sm mb-2"
                  >
                    Transfer (Fake)
                  </button>
                  <button
                    onClick={() => setTransferStep('input')}
                    className="w-full py-2 text-xs text-slate-400"
                  >
                    Back
                  </button>
                </>
              )}
              {transferStep === 'fake-success' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-check text-emerald-500 text-2xl" />
                  </div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">Transfer Successful!</p>
                  <p className="text-xs text-slate-500 mt-1">₹{transferAmount} sent to {transferTo}</p>
                  <p className="text-[10px] text-rose-500 mt-3 font-bold">
                    <i className="fas fa-user-secret mr-1" />
                    ATTACKER FOOLED. Real account untouched.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

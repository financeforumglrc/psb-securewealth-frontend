import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDuressPin, triggerDuressLockdown } from '../../services/duressService';
import { logSecurityEvent } from '../../utils/securityLogger';

export default function DuressTrigger() {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [stage, setStage] = useState<'input' | 'activated' | 'error'>('input');

  function activate() {
    const duress = getDuressPin();
    if (!duress) {
      alert('Please set a duress PIN in Protection settings first.');
      return;
    }
    if (pin === duress) {
      triggerDuressLockdown();
      logSecurityEvent('Duress', 'Duress PIN activated — Decoy Mode triggered', 'critical', `PIN: ${pin}`);
      setStage('activated');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      setStage('error');
      setTimeout(() => { setStage('input'); setPin(''); }, 1500);
    }
  }

  return (
    <>
      {/* Emergency Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-rose-500 text-white shadow-2xl flex items-center justify-center text-lg hover:bg-rose-600 transition-colors"
        title="Emergency Duress Trigger"
      >
        <i className="fas fa-user-secret" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6"
            >
              {stage === 'input' && (
                <>
                  <div className="text-center mb-4">
                    <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <i className="fas fa-user-secret text-rose-500 text-2xl" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Duress Activation</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter your duress PIN to activate decoy mode.
                    </p>
                    <p className="text-[10px] text-rose-500 mt-2 font-bold">
                      <i className="fas fa-triangle-exclamation mr-1" />
                      This will trigger silent alerts and show a fake account.
                    </p>
                  </div>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={6}
                    placeholder="Enter 6-digit duress PIN"
                    className="w-full px-4 py-3 border-2 border-rose-200 dark:border-rose-900 rounded-xl text-center text-lg tracking-[0.5em] font-bold mb-3 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={activate}
                    className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-colors"
                  >
                    Activate Decoy Mode
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-full py-2 text-xs text-slate-400 mt-2"
                  >
                    Cancel
                  </button>
                </>
              )}
              {stage === 'activated' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-check text-emerald-500 text-2xl" />
                  </div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">Decoy Mode Activated!</p>
                  <p className="text-xs text-slate-500 mt-1">Redirecting to fake account...</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-3">
                    <i className="fas fa-satellite-dish mr-1 animate-pulse" />
                    Silent alerts sent. GPS captured.
                  </p>
                </motion.div>
              )}
              {stage === 'error' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-xmark text-amber-500 text-2xl" />
                  </div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">Incorrect PIN</p>
                  <p className="text-xs text-slate-500 mt-1">Please try again.</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

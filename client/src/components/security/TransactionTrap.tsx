import { useState, useEffect, useCallback } from 'react';
import { useSecurityActions } from '../../context/SecurityContext';
import { getOrCreateTotpSecret, generateTotp, verifyTotp, getTotpTimeRemaining } from '../../services/totpService';

export default function TransactionTrap() {
  const { state, triggerTrap, resetTrap } = useSecurityActions();
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [code, setCode] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [currentOtp, setCurrentOtp] = useState<string>('------');
  const [timeLeft, setTimeLeft] = useState(30);

  const amountNum = parseFloat(amount) || 0;
  const secret = getOrCreateTotpSecret();

  const refreshOtp = useCallback(async () => {
    const otp = await generateTotp(secret);
    setCurrentOtp(otp);
    setTimeLeft(getTotpTimeRemaining());
  }, [secret]);

  useEffect(() => {
    refreshOtp();
    const interval = setInterval(() => {
      refreshOtp();
    }, 1000);
    return () => clearInterval(interval);
  }, [refreshOtp]);

  const handleSubmit = async () => {
    setError(false);
    setSuccess(false);

    if (code === '1234') {
      triggerTrap();
      return;
    }

    const valid = await verifyTotp(code, secret);
    if (valid) {
      setSuccess(true);
      setCode('');
    } else {
      setError(true);
      setCode('');
    }
  };

  return (
    <>
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center">
          <i className="fas fa-shield-halved text-danger mr-2" />
          Transaction Trap
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Dynamic anti-phishing protection for high-value transfers (&gt;₹50,000).
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Payee Name
            </label>
            <input
              type="text"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {amountNum > 50000 && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center">
              <i className="fas fa-triangle-exclamation mr-1.5" />
              High-value transfer detected. Verification required.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Current TOTP</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tracking-widest font-mono">
                  {currentOtp}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Refreshes in {timeLeft}s</p>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Trap Code</p>
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400 tracking-widest font-mono">
                  1234
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Attacker bait</p>
              </div>
            </div>

            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
              maxLength={6}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm text-center tracking-widest font-mono focus:ring-2 focus:ring-primary outline-none"
            />

            <button
              onClick={handleSubmit}
              className="mt-2 w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <i className="fas fa-paper-plane mr-2" />
              Verify & Transfer
            </button>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center animate-fade-in">
            <i className="fas fa-check-circle text-emerald-500 text-2xl mb-1" />
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              Transfer Authorized
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
              TOTP accepted. Transaction proceeding securely.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-center animate-fade-in">
            <i className="fas fa-circle-xmark text-rose-500 text-xl mb-1" />
            <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
              Invalid Code
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
              Please enter the current TOTP shown above.
            </p>
          </div>
        )}

        <div className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
          <i className="fas fa-circle-info mr-1" />
          Anti-phishing traps work by presenting decoy credentials to attackers. Entering the trap
          code immediately freezes the account and alerts security ops — while the real user knows
          to use the dynamic TOTP only.
        </div>
      </div>

      {state.trapTriggered && (
        <div className="fixed inset-0 bg-rose-950 z-[100] flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" style={{ animationDuration: '1.5s' }} />
            <div className="relative w-20 h-20 rounded-full bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center">
              <i className="fas fa-skull-crossbones text-3xl text-rose-500" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-white tracking-wider mb-2">
            PHISHING TRAP ACTIVATED
          </h2>
          <p className="text-rose-300 font-medium mb-1">Fraud attempt detected</p>
          <p className="text-sm text-rose-200/80 mb-6">
            All transactions blocked for 24 hours
          </p>

          <button
            onClick={resetTrap}
            className="px-6 py-2.5 bg-white text-rose-700 rounded-xl font-semibold hover:bg-rose-50 transition-colors"
          >
            <i className="fas fa-rotate-left mr-2" />
            Admin Reset
          </button>
        </div>
      )}
    </>
  );
}

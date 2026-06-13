import { useState, useRef, useEffect } from 'react';
import { isDuressPin, triggerDuressLockdown } from '../../services/duressService';
import { getOrCreateTotpSecret, verifyTotp, getTotpTimeRemaining } from '../../services/totpService';
import { useWealthStore } from '../../store/wealthStore';

interface OTPSimulationProps {
  actionType: string;
  amount?: number;
  onConfirm: () => void;
  onCancel: () => void;
  skip?: boolean;
}

export default function OTPSimulation({ actionType, amount = 0, onConfirm, onCancel, skip = false }: OTPSimulationProps) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(getTotpTimeRemaining());
  const [error, setError] = useState(false);
  const [verified, setVerified] = useState(false);
  const [duressTriggered, setDuressTriggered] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const setLockdownActive = useWealthStore((s) => s.setLockdownActive);
  const secret = getOrCreateTotpSecret();

  useEffect(() => {
    if (skip) {
      onConfirm();
      return;
    }
    inputRefs.current[0]?.focus();
  }, [skip, onConfirm]);

  useEffect(() => {
    if (skip || verified) return;
    const interval = setInterval(() => setTimer(getTotpTimeRemaining()), 1000);
    return () => clearInterval(interval);
  }, [skip, verified]);

  useEffect(() => {
    if (verified) {
      setTimeout(onConfirm, 500);
    }
  }, [verified, onConfirm]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    setDigits((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (isDuressPin(code)) {
      setDuressTriggered(true);
      triggerDuressLockdown();
      setTimeout(() => {
        setVerified(true);
        setLockdownActive(true);
      }, 1200);
      return;
    }
    const valid = await verifyTotp(code, secret);
    if (valid) {
      setVerified(true);
    } else {
      setError(true);
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => setError(false), 500);
      inputRefs.current[0]?.focus();
    }
  };

  if (skip || (verified && !duressTriggered)) return null;

  if (duressTriggered) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[75] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-fade-in">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-3">
            <i className="fas fa-check-circle text-xl" />
          </div>
          <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mb-1">Transaction Successful</h3>
          <p className="text-xs text-slate-500 mb-1">Reference: TXN-{Math.random().toString(36).slice(2, 10).toUpperCase()}</p>
          <p className="text-[10px] text-slate-400 mb-4">₹{amount.toLocaleString()} transferred successfully.</p>
          <p className="text-[10px] text-slate-400">Closing in a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[75] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-fade-in">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-3">
          <i className="fas fa-mobile-screen-button text-xl" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Verify Transaction</h3>
        <p className="text-xs text-slate-500 mb-1">Enter the 6-digit TOTP from your authenticator</p>
        <p className="text-[10px] text-slate-400 mb-1">Action: {actionType} {amount > 0 ? `· ₹${amount.toLocaleString()}` : ''}</p>
        <p className="text-[10px] text-rose-500 mb-4 font-medium">
          <i className="fas fa-shield-halved mr-1" />
          Duress PIN active if set
        </p>
        <div className="flex justify-center gap-2 mb-4">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="password"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-10 h-12 text-center text-lg font-bold border rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary ${error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-600'}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 mb-4 text-xs text-slate-500">
          <span>Code refreshes in {timer}s</span>
        </div>
        <button onClick={handleVerify} disabled={digits.some((d) => !d)} className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
          Verify
        </button>
        <button onClick={onCancel} className="mt-2 text-xs text-slate-400 hover:text-slate-600">Cancel Transaction</button>
      </div>
    </div>
  );
}

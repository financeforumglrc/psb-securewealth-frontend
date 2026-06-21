import { useState, useRef, useEffect, useCallback } from 'react';
import { isDuressPin, triggerDuressLockdown } from '@/shared/services/duressService';
import { useWealthStore } from '@/shared/store/wealthStore';
import { backendApi } from '@/shared/lib/backendApi';
import { useAuth } from '@/shared/context/AuthContext';

interface OTPSimulationProps {
  actionType: string;
  amount?: number;
  onConfirm: () => void;
  onCancel: () => void;
  skip?: boolean;
  purpose?: string;
}

const OTP_TTL_SECONDS = 300;
const MAX_RESENDS = 3;

export default function OTPSimulation({ actionType, amount = 0, onConfirm, onCancel, skip = false, purpose = 'secure transaction' }: OTPSimulationProps) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(OTP_TTL_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [duressTriggered, setDuressTriggered] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendCount, setSendCount] = useState(0);
  const [maskedRecipient, setMaskedRecipient] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const onConfirmRef = useRef(onConfirm);
  const onCancelRef = useRef(onCancel);
  const setLockdownActive = useWealthStore((s) => s.setLockdownActive);
  const { state: authState } = useAuth();

  const recipient = authState.userEmail || authState.userId || '';

  useEffect(() => { onConfirmRef.current = onConfirm; }, [onConfirm]);
  useEffect(() => { onCancelRef.current = onCancel; }, [onCancel]);

  const sendOtp = useCallback(async () => {
    if (!recipient) {
      setError('No authenticated user email found.');
      return;
    }
    if (sendCount >= MAX_RESENDS) {
      setError('Maximum OTP resend limit reached. Please try again later.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await backendApi.sendOtp({
        email: authState.userEmail || undefined,
        userId: authState.userId || undefined,
        purpose,
      });
      if (res.ok && res.data?.success) {
        setEmailSent(true);
        setSendCount((c) => c + 1);
        setTimer(OTP_TTL_SECONDS);
        setMaskedRecipient(res.data.data?.recipient || 'your email');
      } else {
        setError(res.data?.error || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setError('Network error while sending OTP.');
    } finally {
      setSending(false);
    }
  }, [recipient, sendCount, authState.userEmail, authState.userId, purpose]);

  // Send OTP automatically on first mount
  useEffect(() => {
    if (skip) return;
    if (!emailSent && !verified && !duressTriggered) {
      sendOtp();
    }
  }, [skip, emailSent, verified, duressTriggered, sendOtp]);

  // Countdown timer
  useEffect(() => {
    if (skip || verified || duressTriggered) return;
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, [skip, verified, duressTriggered, timer]);

  useEffect(() => {
    if (skip) {
      onConfirmRef.current();
      return;
    }
    inputRefs.current[0]?.focus();
  }, [skip]);

  useEffect(() => {
    if (!verified) return;
    const timerId = setTimeout(() => onConfirmRef.current(), 500);
    return () => clearTimeout(timerId);
  }, [verified]);

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

    if (!recipient) {
      setError('No authenticated user email found.');
      return;
    }

    setError(null);
    try {
      const res = await backendApi.verifyOtp({
        email: authState.userEmail || undefined,
        userId: authState.userId || undefined,
        otp: code,
        purpose,
      });
      if (res.ok && res.data?.success) {
        setVerified(true);
      } else {
        setError(res.data?.error || 'Invalid OTP. Please try again.');
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Network error while verifying OTP.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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
        <p className="text-xs text-slate-500 mb-1">
          {emailSent ? `Enter the 6-digit code sent to ${maskedRecipient || 'your email'}` : 'Sending OTP to your registered email...'}
        </p>
        <p className="text-[10px] text-slate-400 mb-1">Action: {actionType} {amount > 0 ? `· ₹${amount.toLocaleString()}` : ''}</p>
        <p className="text-[10px] text-rose-500 mb-4 font-medium">
          <i className="fas fa-shield-halved mr-1" />
          Duress PIN active if set
        </p>

        {error && (
          <div className="mb-4 p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-800">
            <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
              <i className="fas fa-circle-exclamation mr-1" />
              {error}
            </p>
          </div>
        )}

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
          <span>Code expires in {formatTime(timer)}</span>
        </div>
        <button
          onClick={handleVerify}
          disabled={digits.some((d) => !d) || sending}
          className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {sending ? <i className="fas fa-spinner fa-spin mr-1" /> : null}
          Verify
        </button>
        <div className="mt-3 flex items-center justify-center gap-3 text-xs">
          <button
            onClick={sendOtp}
            disabled={sending || sendCount >= MAX_RESENDS || timer > OTP_TTL_SECONDS - 10}
            className="text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Resend OTP {sendCount > 0 ? `(${sendCount}/${MAX_RESENDS})` : ''}
          </button>
          <span className="text-slate-300">|</span>
          <button onClick={() => onCancelRef.current()} className="text-slate-400 hover:text-slate-600">Cancel Transaction</button>
        </div>
      </div>
    </div>
  );
}

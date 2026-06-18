import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';
import { DEMO_ACCOUNTS } from '../../data/userProfiles';
import { backendApi } from '../../lib/backendApi';

interface CreateAccountModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (account: { id: string; email: string; profile: { name: string; riskProfile: string; taxBracket: number; monthlyIncome: number; monthlyExpenses: number; monthlySavings: number } }) => void;
}

const OTP_TTL_SECONDS = 300;
const MAX_RESENDS = 3;
const OTP_PURPOSE = 'registration';

export default function CreateAccountModal({ open, onClose, onCreated }: CreateAccountModalProps) {
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [riskProfile, setRiskProfile] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncWarning, setSyncWarning] = useState<string | null>(null);
  const [createdAccount, setCreatedAccount] = useState<{ id: string; email: string; profile: { name: string; riskProfile: string; taxBracket: number; monthlyIncome: number; monthlyExpenses: number; monthlySavings: number } } | null>(null);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSending, setOtpSending] = useState(false);
  const [otpTimer, setOtpTimer] = useState(OTP_TTL_SECONDS);
  const [otpResends, setOtpResends] = useState(0);
  const [maskedEmail, setMaskedEmail] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP countdown timer
  useEffect(() => {
    if (step !== 'otp' || otpTimer <= 0) return;
    const id = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [step, otpTimer]);

  const validateForm = () => {
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill all required fields');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setError('Password must contain uppercase, lowercase and a number');
      return false;
    }
    return true;
  };

  const sendRegistrationOtp = async () => {
    setOtpSending(true);
    setError('');
    setOtpError(null);
    try {
      const res = await backendApi.sendOtp({
        email: email.trim().toLowerCase(),
        purpose: OTP_PURPOSE,
      });
      if (res.ok && res.data?.success) {
        setMaskedEmail(res.data.data?.recipient || email.trim().toLowerCase());
        setOtpTimer(OTP_TTL_SECONDS);
        setStep('otp');
      } else {
        setError(res.data?.error || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setError('Network error while sending OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setLoading(true);
    await sendRegistrationOtp();
    setLoading(false);
  };

  const registerAndLogin = async () => {
    // Attempt to register with the backend so the account is persisted.
    const registerRes = await backendApi.register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    if (!registerRes.ok && registerRes.status === 409) {
      setLoading(false);
      setStep('form');
      setError(registerRes.data?.error || 'An account with this email already exists');
      return;
    }

    // Generate initials
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const income = parseInt(monthlyIncome) || 50000;
    const expenses = Math.round(income * 0.55);
    const savings = income - expenses;

    const backendUser = registerRes.ok ? registerRes.data?.data?.user : null;

    // Add to DEMO_ACCOUNTS (mutating for demo) so the user can quick-login later
    const newAccount = {
      id: backendUser?.id || email.replace(/[@.]/g, '-'),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      tagline: 'New Account · Portfolio: ₹0',
      netWorth: 0,
      avatar: initials,
      profile: {
        name: name.trim(),
        riskProfile,
        taxBracket: (income > 1500000 ? 30 : income > 750000 ? 20 : 10) as 0 | 10 | 20 | 30,
        monthlyIncome: income,
        monthlyExpenses: expenses,
        monthlySavings: savings,
      },
      assets: [
        { id: `${initials}-1`, name: 'PSB Savings Account', type: 'bank' as const, value: 0, liquidity: 'high' as const },
      ],
      goals: [],
      transactions: [],
    };

    DEMO_ACCOUNTS.push(newAccount);

    // Load the new account into the store
    useWealthStore.setState({
      user: newAccount.profile,
      assets: newAccount.assets,
      goals: [],
      transactions: [],
      bills: [],
      isAuthenticated: true,
    });

    onCreated?.({
      id: newAccount.id,
      email: newAccount.email,
      profile: newAccount.profile,
    });

    if (!registerRes.ok) {
      setSyncWarning(registerRes.data?.error || 'Account created locally, but server sync failed.');
    }

    setCreatedAccount({
      id: newAccount.id,
      email: newAccount.email,
      profile: newAccount.profile,
    });
    setStep('success');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setOtpError(null);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setOtpError('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    setOtpError(null);
    try {
      const res = await backendApi.verifyOtp({
        email: email.trim().toLowerCase(),
        otp: code,
        purpose: OTP_PURPOSE,
      });
      if (res.ok && res.data?.success) {
        await registerAndLogin();
      } else {
        setOtpError(res.data?.error || 'Invalid OTP. Please try again.');
      }
    } catch {
      setOtpError('Network error while verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpResends >= MAX_RESENDS) {
      setOtpError('Maximum resend limit reached. Please try again later.');
      return;
    }
    setOtpSending(true);
    setOtpError(null);
    try {
      const res = await backendApi.sendOtp({
        email: email.trim().toLowerCase(),
        purpose: OTP_PURPOSE,
      });
      if (res.ok && res.data?.success) {
        setOtpTimer(OTP_TTL_SECONDS);
        setOtpResends((c) => c + 1);
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      } else {
        setOtpError(res.data?.error || 'Failed to resend OTP.');
      }
    } catch {
      setOtpError('Network error while resending OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setName('');
    setEmail('');
    setPassword('');
    setMonthlyIncome('');
    setError('');
    setSyncWarning(null);
    setLoading(false);
    setOtp(['', '', '', '', '', '']);
    setOtpError(null);
    setOtpTimer(OTP_TTL_SECONDS);
    setOtpResends(0);
    setMaskedEmail('');
    setCreatedAccount(null);
    onClose();
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {step === 'form' && (
              <>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Open New Account</h2>
                    <p className="text-xs text-gray-500">Create a new PSB SecureWealth account</p>
                  </div>
                  <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                    <i className="fas fa-xmark" />
                  </button>
                </div>

                <div className="px-6 py-4 space-y-4">
                  {error && (
                    <div className="px-3 py-2 bg-rose-50 text-rose-600 text-sm rounded-lg flex items-center gap-2">
                      <i className="fas fa-circle-exclamation" /> {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Amit Kumar"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="amit@email.com"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 chars, A-Z, a-z, 0-9"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Monthly Income (₹)</label>
                      <input
                        type="number"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(e.target.value)}
                        placeholder="50000"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Risk Profile</label>
                      <select
                        value={riskProfile}
                        onChange={(e) => setRiskProfile(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      >
                        <option value="Conservative">Conservative</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Aggressive">Aggressive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={loading || otpSending}
                    className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading || otpSending ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending OTP…
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </>
            )}

            {step === 'otp' && (
              <>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Verify your email</h2>
                    <p className="text-xs text-gray-500">Enter the 6-digit code sent to {maskedEmail}</p>
                  </div>
                  <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                    <i className="fas fa-xmark" />
                  </button>
                </div>

                <div className="px-6 py-6 space-y-5">
                  {otpError && (
                    <div className="px-3 py-2 bg-rose-50 text-rose-600 text-sm rounded-lg flex items-center gap-2">
                      <i className="fas fa-circle-exclamation" /> {otpError}
                    </div>
                  )}

                  <div className="flex justify-center gap-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-11 h-12 text-center text-lg font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    ))}
                  </div>

                  <div className="text-center text-xs text-gray-500">
                    {otpTimer > 0 ? (
                      <span>Code expires in <span className="font-medium text-gray-700">{formatTimer(otpTimer)}</span></span>
                    ) : (
                      <span className="text-rose-500">Code expired</span>
                    )}
                  </div>

                  <div className="text-center text-xs">
                    {otpResends < MAX_RESENDS ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={otpSending || otpTimer > 0}
                        className="text-cyan-600 hover:text-cyan-500 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {otpSending ? 'Resending…' : 'Resend OTP'}
                      </button>
                    ) : (
                      <span className="text-gray-400">Resend limit reached</span>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={() => setStep('form')}
                    className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.join('').length !== 6}
                    className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Verifying…
                      </>
                    ) : (
                      'Verify & Create Account'
                    )}
                  </button>
                </div>
              </>
            )}

            {step === 'success' && (
              <div className="px-6 py-10 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <i className="fas fa-check text-2xl text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Account Created!</h2>
                <p className="text-sm text-gray-500 mb-6">Welcome to PSB SecureWealth, {name}.</p>
                {syncWarning && (
                  <p className="mb-4 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                    <i className="fas fa-triangle-exclamation mr-1" /> {syncWarning}
                  </p>
                )}
                <button
                  onClick={() => {
                    if (createdAccount) {
                      onCreated?.(createdAccount);
                    }
                    handleClose();
                  }}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

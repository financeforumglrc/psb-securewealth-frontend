import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, KeyRound, Shield, ShieldCheck, ShieldX, Smartphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  isWebAuthnSupported,
  hasRegisteredPasskey,
  getPasskeyUser,
  registerPasskey,
  authenticateWithPasskey,
} from '../../services/passkeyService';
import { checkPasswordStrength, getStrengthColor, getStrengthTextColor } from '../../services/passwordStrength';
import { useWealthStore } from '../../store/wealthStore';
import { backendApi } from '../../lib/backendApi';
import { DEMO_ACCOUNTS } from '../../data/userProfiles';
import FaceLoginModal from './FaceLoginModal';

export default function LoginPage() {
  const { state, dispatch } = useAuth();
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return getPasskeyUser() || '';
    }
    return '';
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'id' | 'otp'>('id');
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [faceLoginOpen, setFaceLoginOpen] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'checking' | 'trusted' | 'untrusted' | 'denied' | null>(null);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyError, setPasskeyError] = useState('');
  const [passkeySuccess, setPasskeySuccess] = useState('');
  const [webAuthnSupported] = useState(() => isWebAuthnSupported());
  const [password, setPassword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const passwordStrength = useMemo(() => checkPasswordStrength(password), [password]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  // Location-based auth
  useEffect(() => {
    if (step !== 'id') return;
    if (!navigator.geolocation) {
      queueMicrotask(() => setLocationStatus('denied'));
      return;
    }
    queueMicrotask(() => setLocationStatus('checking'));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const trustedLocs = JSON.parse(localStorage.getItem('sw_trusted_locations') || '[]');
        const isTrusted = trustedLocs.some((loc: { lat: number; lng: number }) => {
          const d = Math.sqrt(
            Math.pow(pos.coords.latitude - loc.lat, 2) +
            Math.pow(pos.coords.longitude - loc.lng, 2)
          ) * 111000;
          return d < 500;
        });
        setLocationStatus(isTrusted ? 'trusted' : 'untrusted');
      },
      () => setLocationStatus('denied')
    );
  }, [step]);

  // Timer
  useEffect(() => {
    if (step !== 'otp' || timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
        },
      });

      if (otpError) throw otpError;

      setStep('otp');
      setTimer(60);
      setOtp('');

      // Show toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 z-[100] bg-primary text-white px-4 py-3 rounded-xl shadow-2xl text-sm font-bold animate-fade-in';
      const icon = document.createElement('i');
      icon.className = 'fas fa-envelope mr-2';
      toast.appendChild(icon);
      toast.appendChild(document.createTextNode(`OTP sent to ${email}`));
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const entered = otp.trim();
    if (entered.length < 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: entered,
        type: 'email',
      });

      if (verifyError) throw verifyError;

      if (data.session) {
        dispatch({ type: 'LOGIN', userId: data.user!.id, userEmail: data.user!.email ?? null });
        const store = useWealthStore.getState();
        if (store.assets.length === 0) store.seedRealData();
        if (rememberDevice) {
          localStorage.setItem('sw_trusted_locations', JSON.stringify([]));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
      dispatch({ type: 'FAIL_ATTEMPT' });
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleTrustedLocationLogin = () => {
    // Trusted location bypass not available with Supabase OTP
    // Show message to use OTP
    setError('Please use OTP for secure login.');
  };

  const handlePasskeySignIn = async () => {
    setPasskeyError('');
    setPasskeySuccess('');
    setPasskeyLoading(true);
    try {
      const authUser = await authenticateWithPasskey();
      dispatch({ type: 'LOGIN', userId: authUser, userEmail: null });
      const store = useWealthStore.getState();
      if (store.assets.length === 0) store.seedRealData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Passkey authentication failed. Please try again.';
      setPasskeyError(message);
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleCreatePasskey = async () => {
    if (!email.trim()) {
      setPasskeyError('Please enter your email first.');
      return;
    }
    setPasskeyError('');
    setPasskeySuccess('');
    setPasskeyLoading(true);
    try {
      await registerPasskey(email.trim());
      dispatch({ type: 'REGISTER_PASSKEY', userId: email.trim() });
      setPasskeySuccess('Passkey created successfully! You can now sign in with your biometric.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Passkey registration failed. Please try again.';
      setPasskeyError(message);
    } finally {
      setPasskeyLoading(false);
    }
  };

  const passkeyRegistered = hasRegisteredPasskey();
  const passkeyUser = getPasskeyUser();
  const passkeyUserMismatch = passkeyRegistered && email.trim() && passkeyUser !== email.trim();

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark dark:to-dark-light p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 border-2 border-secondary">
            <svg viewBox="0 0 40 40" className="w-10 h-10">
              <circle cx="20" cy="20" r="18" fill="white" />
              <circle cx="20" cy="20" r="14" fill="#FFD700" />
              <circle cx="20" cy="20" r="10" fill="white" />
              <path d="M15 25 L20 15 L25 25" stroke="#1B5E20" strokeWidth="1.5" fill="none" />
              <path d="M14 22 L20 18 L26 22" stroke="#1B5E20" strokeWidth="1.2" fill="none" />
              <circle cx="20" cy="15" r="2" fill="#B71C1C" />
              <text x="20" y="24" textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="#1B5E20">PSB</text>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Punjab & Sind Bank</h1>
          <p className="text-sm text-slate-400 mt-1">Internet Banking Portal</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
          {step === 'id' && (
            <>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Welcome back</h2>
              <p className="text-xs text-slate-400 mb-4">Enter your email to continue</p>

              {locationStatus === 'trusted' && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800 mb-4">
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    <i className="fas fa-location-dot mr-1" />
                    You are at your trusted location — instant login available!
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1 block">Email Address</label>
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul.sharma@email.com"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1 block">Password (optional)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <AnimatePresence>
                    {password.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Strength</span>
                          <span className={`text-[11px] font-bold ${getStrengthTextColor(passwordStrength.score)}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${getStrengthColor(passwordStrength.score)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${passwordStrength.score}%` }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                          />
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <ul className="mt-1.5 space-y-0.5">
                            {passwordStrength.feedback.map((tip, i) => (
                              <li key={i} className="text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1">
                                <i className="fas fa-lightbulb text-amber-400 mt-0.5 text-[8px]" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-xs text-slate-500">Remember this device</span>
                </label>

                {/* Passkey Section */}
                {webAuthnSupported && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Passkey</span>
                      {passkeyRegistered ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <ShieldCheck className="w-3 h-3" /> Registered
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                          <ShieldX className="w-3 h-3" /> Not registered
                        </span>
                      )}
                    </div>

                    <AnimatePresence mode="wait">
                      {passkeyRegistered && (
                        <motion.button
                          key="signin-passkey"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handlePasskeySignIn}
                          disabled={passkeyLoading || !!passkeyUserMismatch}
                          className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:opacity-40 transition-shadow flex items-center justify-center gap-2"
                        >
                          {passkeyLoading ? (
                            <i className="fas fa-circle-notch animate-spin" />
                          ) : (
                            <Fingerprint className="w-5 h-5" />
                          )}
                          Sign in with Passkey
                        </motion.button>
                      )}

                      {passkeyUserMismatch && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg flex items-start gap-1"
                        >
                          <i className="fas fa-triangle-exclamation mt-0.5" />
                          Passkey is registered for <strong>{passkeyUser}</strong>. Sign in with that account or create a new passkey.
                        </motion.p>
                      )}

                      {!passkeyRegistered && (
                        <motion.button
                          key="create-passkey"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleCreatePasskey}
                          disabled={passkeyLoading}
                          className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                        >
                          {passkeyLoading ? (
                            <i className="fas fa-circle-notch animate-spin" />
                          ) : (
                            <KeyRound className="w-4 h-4" />
                          )}
                          Create Passkey
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {passkeyError && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-900/10 p-2 rounded-lg"
                      >
                        <i className="fas fa-circle-exclamation mr-1" /> {passkeyError}
                      </motion.p>
                    )}

                    {passkeySuccess && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded-lg"
                      >
                        <i className="fas fa-check-circle mr-1" /> {passkeySuccess}
                      </motion.p>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">or continue with OTP</span>
                      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                )}

                {!webAuthnSupported && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
                    <p className="text-[11px] text-slate-400">
                      Passkeys are not supported in this browser. Use OTP to sign in.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSendOtp}
                  disabled={!email.trim() || loading}
                  className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-40 transition-colors"
                >
                  {loading ? <i className="fas fa-circle-notch animate-spin mr-2" /> : <i className="fas fa-paper-plane mr-2" />}
                  Send OTP
                </button>
                {locationStatus === 'trusted' && (
                  <button
                    onClick={handleTrustedLocationLogin}
                    className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
                  >
                    <i className="fas fa-location-dot mr-2" /> Trusted Location Login
                  </button>
                )}
              </div>
            </>
          )}

          {step === 'otp' && (
            <>
              <button onClick={() => setStep('id')} className="text-xs text-slate-400 hover:text-slate-600 mb-3 flex items-center gap-1">
                <i className="fas fa-arrow-left" /> Back
              </button>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Enter OTP</h2>
              <p className="text-xs text-slate-400 mb-4">
                We sent a 6-digit code to {email}
              </p>

              <div className="space-y-3">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm tracking-[0.5em] text-center font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />

                {error && (
                  <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-900/10 p-2 rounded-lg">
                    <i className="fas fa-circle-exclamation mr-1" /> {error}
                    {state.failedAttempts > 0 && (
                      <span className="block mt-0.5">Attempt {state.failedAttempts}/3</span>
                    )}
                  </p>
                )}

                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-40 transition-colors"
                >
                  {loading ? <i className="fas fa-circle-notch animate-spin mr-2" /> : null}
                  Verify & Login
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setTimer(60); handleSendOtp(); }}
                    disabled={timer > 0 || loading}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold disabled:opacity-40"
                  >
                    Resend {timer > 0 ? `(${timer}s)` : ''}
                  </button>
                </div>
              </div>
            </>
          )}

          <p className="text-[10px] text-slate-400 text-center mt-4">
            Secure login powered by PSB SecureWealth · Supabase Auth
          </p>
        </div>

        {/* Face Login */}
        <div className="mt-5">
          <button
            onClick={() => setFaceLoginOpen(true)}
            className="w-full py-2.5 bg-gradient-to-r from-primary/90 to-secondary/90 text-white rounded-xl text-sm font-semibold hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <i className="fas fa-face-viewfinder" />
            Login with Face
          </button>
        </div>

        {/* Demo Account Switcher */}
        <div className="mt-5">
          <p className="text-xs text-slate-400 text-center mb-3 font-medium">
            <i className="fas fa-users mr-1" /> Quick Login — Select Account
          </p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <motion.button
                key={account.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  const res = await backendApi.demoLogin({ email: account.email, name: account.profile.name });
                  if (!res.ok) {
                    setError(res.data?.error || 'Demo login failed');
                    return;
                  }
                  const store = useWealthStore.getState();
                  store.updateUser({ name: account.profile.name, monthlyIncome: account.profile.monthlyIncome, monthlyExpenses: account.profile.monthlyExpenses, monthlySavings: account.profile.monthlySavings, riskProfile: account.profile.riskProfile, taxBracket: account.profile.taxBracket });
                  if (store.assets.length === 0) store.seedRealData();
                  dispatch({ type: 'LOGIN', userId: account.id, userEmail: account.email });
                }}
                className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  account.id === 'deepanshu-sharma' ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                  account.id === 'mrigesh-mohanty' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                  account.id === 'rikshita-barua' ? 'bg-gradient-to-br from-pink-400 to-pink-600' :
                  account.id === 'ishita-anand' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                  account.id === 'tripti-jain' ? 'bg-gradient-to-br from-violet-400 to-violet-600' :
                  'bg-gradient-to-br from-orange-400 to-orange-600'
                }`}>
                  {account.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                    {account.profile.name}
                    {account.id === 'deepanshu-sharma' && (
                      <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Richest</span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{account.tagline}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    ₹{(account.netWorth / 1e7).toFixed(2)}Cr
                  </p>
                  <p className="text-[9px] text-slate-400">Net Worth</p>
                </div>
              </motion.button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-3">
            Password for all demo accounts: <strong className="text-slate-600 dark:text-slate-300">Firstname@123</strong>
          </p>
        </div>
      </div>

      {/* Admin Portal Link */}
      <div className="mt-4 text-center">
        <button
          onClick={() => useWealthStore.getState().setView('admin')}
          className="text-xs text-slate-400 hover:text-emerald-500 font-medium transition-colors flex items-center justify-center gap-1.5 mx-auto"
        >
          <Shield className="w-3.5 h-3.5" /> Admin Portal
        </button>
      </div>

      <FaceLoginModal
        isOpen={faceLoginOpen}
        onClose={() => setFaceLoginOpen(false)}
        onSuccess={(user) => {
          localStorage.setItem('sw-user', JSON.stringify(user));
          dispatch({ type: 'LOGIN', userId: user.id, userEmail: user.email });
          useWealthStore.getState().updateUser({ name: user.name || user.email?.split('@')[0] || 'User' });
          setFaceLoginOpen(false);
        }}
      />
    </div>
  );
}

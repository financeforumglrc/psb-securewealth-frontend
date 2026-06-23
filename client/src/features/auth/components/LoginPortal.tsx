import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Check,
  ChevronRight,
  Cpu,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Landmark,
  Lock,
  Mail,
  ScanFace,
  Search,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import { supabase } from '@/shared/lib/supabase';
import { backendApi } from '@/shared/lib/backendApi';
import { useWealthStore } from '@/shared/store/wealthStore';
import { DEMO_ACCOUNTS } from '@/shared/data/userProfiles';
import {
  isWebAuthnSupported,
  hasRegisteredPasskey,
  getPasskeyUser,
  registerPasskey,
  authenticateWithPasskey,
} from '@/shared/services/passkeyService';
import FaceLoginModal from '@/features/auth/components/FaceLoginModal';
import CreateAccountModal from '@/features/auth/components/CreateAccountModal';

const GRADIENTS = [
  'from-amber-400 to-amber-600',
  'from-blue-400 to-blue-600',
  'from-pink-400 to-pink-600',
  'from-emerald-400 to-emerald-600',
  'from-violet-400 to-violet-600',
  'from-orange-400 to-orange-600',
  'from-cyan-400 to-cyan-600',
  'from-rose-400 to-rose-600',
  'from-lime-400 to-lime-600',
  'from-indigo-400 to-indigo-600',
  'from-teal-400 to-teal-600',
  'from-fuchsia-400 to-fuchsia-600',
  'from-sky-400 to-sky-600',
  'from-yellow-400 to-yellow-600',
  'from-red-400 to-red-600',
  'from-green-400 to-green-600',
  'from-purple-400 to-purple-600',
  'from-stone-400 to-stone-600',
];

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function avatarGradient(id: string): string {
  return GRADIENTS[hashStr(id) % GRADIENTS.length];
}

function deriveTier(netWorth: number): 'enterprise' | 'premium' | 'free' {
  if (netWorth >= 3_00_00_000) return 'enterprise';
  if (netWorth >= 1_00_00_000) return 'premium';
  return 'free';
}

const tierStyle: Record<string, string> = {
  enterprise: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  premium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  free: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const FEATURES = [
  {
    icon: Shield,
    title: 'Zero-knowledge encryption',
    desc: 'Credentials are never stored in plain text.',
  },
  {
    icon: Fingerprint,
    title: 'Biometric-ready access',
    desc: 'Face and passkey verification on supported devices.',
  },
  {
    icon: Cpu,
    title: 'AI fraud shield',
    desc: 'Real-time anomaly detection across every login.',
  },
];

export default function LoginPortal() {
  const { state, dispatch } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [trustDevice, setTrustDevice] = useState(() => localStorage.getItem('sw-trust-device') === 'true');
  const [error, setError] = useState<string | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [faceLoginOpen, setFaceLoginOpen] = useState(false);
  const [demoSearch, setDemoSearch] = useState('');

  const sortedDemoAccounts = useMemo(() => {
    return [...DEMO_ACCOUNTS].sort((a, b) => b.netWorth - a.netWorth);
  }, []);

  const filteredDemoAccounts = useMemo(() => {
    const q = demoSearch.trim().toLowerCase();
    if (!q) return sortedDemoAccounts;
    return sortedDemoAccounts.filter(
      (a) =>
        a.profile.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
    );
  }, [sortedDemoAccounts, demoSearch]);
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [passkeySuccess, setPasskeySuccess] = useState<string | null>(null);
  const [webAuthnSupported] = useState(() =>
    typeof window !== 'undefined' ? isWebAuthnSupported() : false
  );

  const passkeyRegistered = hasRegisteredPasskey();
  const passkeyUser = getPasskeyUser();
  const passkeyUserMismatch = passkeyRegistered && !!email.trim() && passkeyUser !== email.trim();

  useEffect(() => {
    localStorage.setItem('sw-trust-device', String(trustDevice));
  }, [trustDevice]);

  // Lockout countdown
  useEffect(() => {
    if (!state.lockoutUntil) return;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((state.lockoutUntil! - Date.now()) / 1000));
      setLockoutRemaining(remaining);
      if (remaining === 0) dispatch({ type: 'SET_LOCKOUT', until: null });
    };

    // First tick in a microtask avoids synchronous setState inside the effect body.
    const timeout = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [state.lockoutUntil, dispatch]);

  // Warm up the Render backend while the user is reading the login page.
  useEffect(() => {
    backendApi.health().catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setError('Please accept the consent statement to continue.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (lockoutRemaining > 0) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;
      // AuthContext listens to Supabase SIGNED_IN event and updates global auth state.
    } catch (err: unknown) {
      dispatch({ type: 'FAIL_ATTEMPT' });
      const message = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      setError(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const applyDemoAccount = (account: (typeof DEMO_ACCOUNTS)[0]) => {
    const store = useWealthStore.getState();
    store.updateUser({
      name: account.profile.name,
      monthlyIncome: account.profile.monthlyIncome,
      monthlyExpenses: account.profile.monthlyExpenses,
      monthlySavings: account.profile.monthlySavings,
      riskProfile: account.profile.riskProfile,
      taxBracket: account.profile.taxBracket,
    });
    if (store.assets.length === 0) store.seedRealData();
    dispatch({ type: 'LOGIN', userId: account.id, userEmail: account.email });
  };

  const handleDemoLogin = async (account: (typeof DEMO_ACCOUNTS)[0]) => {
    setError(null);
    // Demo login uses local data instantly so the UI never hangs on a cold backend.
    applyDemoAccount(account);
    // Ping the backend in the background to wake Render up for later API calls.
    backendApi.demoLogin({ email: account.email, name: account.profile.name }).catch(() => {});
  };

  const handlePasskeySignIn = async () => {
    setPasskeyError(null);
    setPasskeySuccess(null);
    setPasskeyLoading(true);
    try {
      const authUser = await authenticateWithPasskey();
      dispatch({ type: 'LOGIN', userId: authUser, userEmail: null });
      const store = useWealthStore.getState();
      if (store.assets.length === 0) store.seedRealData();
    } catch (err) {
      setPasskeyError(err instanceof Error ? err.message : 'Passkey authentication failed.');
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleCreatePasskey = async () => {
    if (!email.trim()) {
      setPasskeyError('Please enter your email first.');
      return;
    }
    setPasskeyError(null);
    setPasskeySuccess(null);
    setPasskeyLoading(true);
    try {
      await registerPasskey(email.trim());
      dispatch({ type: 'REGISTER_PASSKEY', userId: email.trim() });
      setPasskeySuccess('Passkey created successfully! You can now sign in with your biometric.');
    } catch (err) {
      setPasskeyError(err instanceof Error ? err.message : 'Passkey registration failed.');
    } finally {
      setPasskeyLoading(false);
    }
  };

  const isLocked = lockoutRemaining > 0;
  const canSubmit = consent && email.trim() && password && !isLocked && !state.loading;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-slate-950 text-slate-200 lg:flex-row">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      {/* Demo mode shortcut */}
      <a
        href="/demo"
        target="_blank"
        rel="noreferrer"
        className="absolute top-4 right-4 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-primary-dark text-xs font-bold hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20"
      >
        <Sparkles className="w-4 h-4" /> Demo Mode
      </a>

      {/* LEFT: login form */}
      <section className="relative z-10 flex w-full items-center justify-center p-6 sm:p-10 lg:w-[42%]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Brand */}
          <div className="mb-8 flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20"
            >
              <Landmark className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">PSB SecureWealth</h1>
              <p className="text-xs font-medium text-slate-500">Twin · Public Sector Banking</p>
            </div>
          </div>

          {/* Glass card */}
          <div className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-7 shadow-2xl shadow-cyan-900/10 backdrop-blur-xl sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
              <p className="mt-1 text-sm text-slate-400">
                Enter your credentials to access your secure vault.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-300">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@bank.in"
                    className="w-full rounded-xl border border-slate-700/60 bg-slate-950/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 transition-all focus:border-cyan-500/50 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-700/60 bg-slate-950/50 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-slate-600 transition-all focus:border-cyan-500/50 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300 focus:text-slate-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Consent checkbox */}
              <label className="group flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-600 bg-slate-950/50 text-slate-950 transition-all peer-checked:border-cyan-500 peer-checked:bg-cyan-400">
                  <Check className="h-3.5 w-3.5 opacity-0 transition-opacity peer-checked:opacity-100" />
                </div>
                <span className="text-xs leading-relaxed text-slate-400">
                  I consent to the{' '}
                  <a href="#privacy" className="text-cyan-400 hover:underline">
                    Privacy Policy
                  </a>{' '}
                  and processing of my data for KYC, fraud prevention and account safeguarding.
                </span>
              </label>

              {/* Device trust toggle */}
              <div className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-slate-300">Trust this device</span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={trustDevice}
                    onChange={(e) => setTrustDevice(e.target.checked)}
                  />
                  <div className="h-6 w-11 rounded-full border border-slate-700 bg-slate-800 transition-colors peer-checked:border-cyan-500/50 peer-checked:bg-cyan-500" />
                  <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                </label>
              </div>

              {/* Error message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={!canSubmit}
                whileHover={canSubmit ? { scale: 1.015 } : {}}
                whileTap={canSubmit ? { scale: 0.985 } : {}}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {state.loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Verifying…
                    </>
                  ) : isLocked ? (
                    `Locked for ${lockoutRemaining}s`
                  ) : (
                    <>
                      Sign in securely
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
                {/* Shimmer */}
                {!state.loading && !isLocked && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  />
                )}
              </motion.button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs">
              <a
                href="#forgot"
                className="text-slate-400 transition-colors hover:text-cyan-400"
              >
                Forgot password?
              </a>
              <button
                type="button"
                onClick={() => window.location.href = '/admin'}
                className="text-xs bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent font-bold hover:from-emerald-400 hover:to-teal-400 transition-all"
              >
                ⚙ Admin Portal
              </button>
            </div>

            <div className="mt-4 text-center text-xs">
              <span className="text-slate-500">New to PSB SecureWealth? </span>
              <button
                type="button"
                onClick={() => setCreateAccountOpen(true)}
                className="font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
              >
                Create account
              </button>
            </div>

            {/* Security badge */}
            <div className="mt-6 flex items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] font-medium uppercase tracking-wide text-emerald-400">
                256-bit TLS · RBI Compliant
              </span>
            </div>

            {/* Biometric quick access */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Or sign in with</span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFaceLoginOpen(true)}
                  disabled={state.loading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950/50 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-500/40 hover:bg-slate-900 hover:text-cyan-300 disabled:opacity-50"
                >
                  <ScanFace className="h-4 w-4" />
                  Face ID
                </motion.button>

                {webAuthnSupported && (
                  <>
                    {passkeyRegistered ? (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePasskeySignIn}
                        disabled={passkeyLoading || !!passkeyUserMismatch || state.loading}
                        className="flex items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 py-2.5 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/20 disabled:opacity-50"
                      >
                        {passkeyLoading ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-300" />
                        ) : (
                          <Fingerprint className="h-4 w-4" />
                        )}
                        Passkey
                      </motion.button>
                    ) : (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreatePasskey}
                        disabled={passkeyLoading || !email.trim() || state.loading}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950/50 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-500/40 hover:bg-slate-900 hover:text-cyan-300 disabled:opacity-50"
                      >
                        {passkeyLoading ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-500/30 border-t-slate-300" />
                        ) : (
                          <KeyRound className="h-4 w-4" />
                        )}
                        Create Passkey
                      </motion.button>
                    )}
                  </>
                )}
              </div>

              {passkeyUserMismatch && (
                <p className="rounded-lg bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-400">
                  Passkey is registered for <strong>{passkeyUser}</strong>. Use that account or create a new passkey.
                </p>
              )}

              <AnimatePresence>
                {passkeyError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg bg-red-500/10 px-2 py-1.5 text-[11px] text-red-400"
                  >
                    {passkeyError}
                  </motion.p>
                )}
                {passkeySuccess && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg bg-emerald-500/10 px-2 py-1.5 text-[11px] text-emerald-400"
                  >
                    {passkeySuccess}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Demo profiles */}
            <div className="mt-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
              <p className="mb-3 text-center text-xs font-medium text-slate-400">
                <Users className="mr-1 inline h-3.5 w-3.5" />
                Quick Login — Select Demo Profile
              </p>
              <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={demoSearch}
                  onChange={(e) => setDemoSearch(e.target.value)}
                  placeholder="Search profiles..."
                  className="w-full rounded-xl border border-slate-800/60 bg-slate-950/40 py-2 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
                />
              </div>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {filteredDemoAccounts.map((account) => {
                  const tier = deriveTier(account.netWorth);
                  const topAccount = sortedDemoAccounts[0];
                  return (
                    <motion.button
                      key={account.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleDemoLogin(account)}
                      disabled={state.loading}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-800/50 bg-slate-950/40 p-3 text-left transition-colors hover:border-slate-700 hover:bg-slate-800/40 disabled:opacity-50"
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white bg-gradient-to-br ${avatarGradient(account.id)}`}
                      >
                        {account.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-200 truncate">
                          {account.profile.name}
                          {account.id === topAccount?.id && (
                            <span className="ml-2 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                              Richest
                            </span>
                          )}
                          <span
                            className={`ml-2 inline-block rounded-full border px-1.5 py-0.5 text-[10px] font-medium capitalize ${tierStyle[tier]}`}
                          >
                            {tier}
                          </span>
                        </p>
                        <p className="truncate text-[11px] text-slate-500">{account.tagline}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-300">₹{(account.netWorth / 1e7).toFixed(2)}Cr</p>
                        <p className="text-[9px] text-slate-600">Net Worth</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              <p className="mt-3 text-center text-[10px] text-slate-600">
                Password for all demo accounts:{' '}
                <span className="font-medium text-slate-400">Firstname@123</span>
              </p>
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

            <CreateAccountModal
              open={createAccountOpen}
              onClose={() => setCreateAccountOpen(false)}
              onCreated={(account) => {
                // Notify AuthContext so the authenticated app renders.
                dispatch({ type: 'LOGIN', userId: account.id, userEmail: account.email });
                setCreateAccountOpen(false);
              }}
            />
          </div>

          <p className="mt-6 text-center text-[11px] text-slate-600">
            © {new Date().getFullYear()} PSB SecureWealth Twin. All rights reserved.
          </p>
        </motion.div>
      </section>

      {/* RIGHT: hero */}
      <section className="relative hidden w-full flex-col justify-between overflow-hidden bg-[#0B0F19] p-16 lg:flex lg:w-[58%]">
        {/* Animated background */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-orange-500/10 blur-3xl"
          />
          <svg className="absolute inset-0 h-full w-full text-slate-500 opacity-[0.05]">
            <defs>
              <pattern id="login-grid" width="44" height="44" patternUnits="userSpaceOnUse">
                <path d="M 44 0 L 0 0 0 44" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#login-grid)" />
          </svg>

          {/* Floating nodes */}
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-2 w-2 rounded-full bg-cyan-400/40"
                style={{
                  top: `${20 + i * 15}%`,
                  left: `${15 + i * 18}%`,
                }}
                animate={{ y: [0, -12, 0], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Next-gen public sector banking
            </div>
            <h2 className="mt-8 max-w-lg text-5xl font-bold leading-[1.1] text-white">
              Your wealth.{' '}
              <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                Protected.
              </span>
            </h2>
            <p className="mt-6 max-w-md text-lg text-slate-400">
              A unified, consent-first dashboard that merges your accounts, goals and risk cover into one intelligent twin.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 grid gap-4"
          >
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-4 rounded-2xl border border-slate-800/50 bg-slate-900/40 p-4 backdrop-blur-sm transition-colors hover:border-slate-700/60"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 shadow-lg shadow-cyan-500/5">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{feature.title}</h4>
                  <p className="text-xs text-slate-500">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="relative z-10 flex items-center gap-4 text-xs text-slate-500"
        >
          <div className="flex -space-x-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full border-2 border-[#0B0F19] bg-gradient-to-br from-slate-700 to-slate-800"
              />
            ))}
          </div>
          <p>Trusted by 2.4M+ PSB customers</p>
        </motion.div>
      </section>
    </div>
  );
}

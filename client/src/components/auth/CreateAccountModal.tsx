import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';
import { DEMO_ACCOUNTS } from '../../data/userProfiles';
import { backendApi } from '../../lib/backendApi';

interface CreateAccountModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (account: { id: string; email: string; profile: { name: string; riskProfile: string; taxBracket: number; monthlyIncome: number; monthlyExpenses: number; monthlySavings: number } }) => void;
}

export default function CreateAccountModal({ open, onClose, onCreated }: CreateAccountModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [riskProfile, setRiskProfile] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncWarning, setSyncWarning] = useState<string | null>(null);

  const handleCreate = async () => {
    setError('');
    setSyncWarning(null);
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill all required fields');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setError('Password must contain uppercase, lowercase and a number');
      return;
    }

    setLoading(true);

    // Attempt to register with the backend so the account is persisted.
    const registerRes = await backendApi.register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    if (!registerRes.ok && registerRes.status === 409) {
      setLoading(false);
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

    setLoading(false);
    setStep('success');
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
    onClose();
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
            {step === 'form' ? (
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
                    disabled={loading}
                    className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating…
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </>
            ) : (
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
                  onClick={handleClose}
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

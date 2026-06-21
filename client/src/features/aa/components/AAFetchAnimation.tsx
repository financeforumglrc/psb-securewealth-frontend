import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Landmark, TrendingUp, PiggyBank, FileHeart, Loader2, CheckCircle2 } from 'lucide-react';
import { backendApi } from '@/shared/lib/backendApi';
import { protectionApi, type AAFetchItem } from '@/shared/lib/protectionApi';

const ICON_MAP: Record<string, React.ElementType> = {
  'State Bank of India (SBI)': Landmark,
  'HDFC Bank': TrendingUp,
  'Zerodha': PiggyBank,
  'LIC of India': FileHeart,
};

const FALLBACK_STEPS: AAFetchItem[] = [
  { bank: 'State Bank of India (SBI)', type: 'Savings Account', amount: '₹45,200', icon: '🏦' },
  { bank: 'HDFC Bank', type: 'Mutual Funds', amount: '₹1,20,000', icon: '📈' },
  { bank: 'Zerodha', type: 'Equity Portfolio', amount: '₹85,500', icon: '💹' },
  { bank: 'LIC of India', type: 'Endowment Policy', amount: '₹50,000', icon: '🛡️' },
];

function formatINR(amount: number) {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function iconForType(type?: string) {
  const t = (type || '').toLowerCase();
  if (t.includes('saving')) return '🏦';
  if (t.includes('current')) return '🏛️';
  if (t.includes('fixed') || t.includes('recurring')) return '🔒';
  if (t.includes('mutual')) return '📈';
  if (t.includes('equity') || t.includes('stock')) return '💹';
  if (t.includes('insurance') || t.includes('policy')) return '🛡️';
  return '🏦';
}

interface Props {
  onComplete: () => void;
}

export default function AAFetchAnimation({ onComplete }: Props) {
  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  const [steps, setSteps] = useState<AAFetchItem[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showTwin, setShowTwin] = useState(false);
  const completingRef = useRef(false);
  const [totalNetWorth, setTotalNetWorth] = useState('');
  const [twinMessage, setTwinMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Try the real AA sync endpoint first (discovers accounts + transactions
        // from active consents). Fall back to the legacy protection persona fetch
        // and then to hardcoded demo data.
        const res = await backendApi.aaSync();
        if (cancelled) return;

        let fetchedSteps = FALLBACK_STEPS;
        let netWorth = '₹3,00,700';
        let message =
          'Welcome back! Your SecureWealth Twin is now monitoring across all linked institutions.';

        if (res.ok && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          const allAccounts = res.data.data.flatMap((group: any) => group.accounts || []);
          if (allAccounts.length > 0) {
            fetchedSteps = allAccounts.map((acc: any) => ({
              bank: acc.bankName || 'Linked Institution',
              type: acc.accountType || 'Account',
              amount: formatINR(acc.balance || 0),
              icon: iconForType(acc.accountType),
            }));
            const total = allAccounts.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0);
            netWorth = formatINR(total);
            message = `Synced ${allAccounts.length} account(s) via the RBI Account Aggregator network.`;
          } else {
            setError('No AA-linked accounts found yet — showing demo aggregation.');
          }
        } else {
          const fallback = await protectionApi.fetchAA();
          if (!cancelled && fallback.ok && fallback.data?.steps) {
            fetchedSteps = fallback.data.steps;
            netWorth = fallback.data.total_net_worth || netWorth;
            message = fallback.data.message || message;
          } else {
            setError('AA service unreachable — showing demo aggregation.');
          }
        }

        setSteps(fetchedSteps);
        setTotalNetWorth(netWorth);
        setTwinMessage(message);
      } catch {
        setSteps(FALLBACK_STEPS);
        setTotalNetWorth('₹3,00,700');
        setTwinMessage('Welcome back! Your SecureWealth Twin is now monitoring across all linked institutions.');
        setError('AA service unreachable — showing demo aggregation.');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Step reveal animation + completion sequence
  useEffect(() => {
    if (steps.length === 0) return;
    if (currentStep < steps.length) {
      const timer = setTimeout(() => setCurrentStep((s) => s + 1), 700);
      return () => clearTimeout(timer);
    }
    if (!completingRef.current) {
      completingRef.current = true;
      setIsCalculating(true);
      const timer = setTimeout(() => {
        setShowTwin(true);
        setTimeout(() => completeRef.current(), 2200);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [steps, currentStep]);

  return (
    <div className="min-h-screen bg-psb-bg dark:bg-[#0b1120] flex flex-col items-center justify-center p-6 text-psb-text dark:text-slate-100">
      {/* Glowing AI Twin Orb */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-primary-dark shadow-2xl shadow-primary/30 flex items-center justify-center mb-8"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-secondary/30 border-t-secondary"
        />
        <Shield className="w-10 h-10 text-white" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mb-2 text-center"
      >
        Connecting to Account Aggregator Network...
      </motion.h2>
      <p className="text-sm text-psb-muted dark:text-slate-400 mb-8 text-center max-w-md">
        Securely fetching your unified financial picture via RBI regulated Account Aggregator framework.
      </p>

      {error && (
        <div className="mb-4 px-4 py-2 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs rounded-xl border border-amber-200 dark:border-amber-800">
          {error}
        </div>
      )}

      <div className="w-full max-w-md space-y-3">
        <AnimatePresence>
          {steps.slice(0, currentStep).map((step, index) => {
            const Icon = ICON_MAP[step.bank] || Landmark;
            return (
              <motion.div
                key={step.bank + step.type}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-psb-border dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{step.bank}</p>
                    <p className="text-xs text-psb-muted dark:text-slate-400">{step.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-primary font-medium">{step.amount}</span>
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isCalculating && !showTwin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-5"
          >
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-primary font-medium">Calculating Unified Net Worth & Risk Profile...</p>
          </motion.div>
        )}

        {showTwin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 border border-primary/20 dark:border-primary/30 rounded-2xl p-5 mt-4"
          >
            <p className="text-primary font-bold mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              SecureWealth Twin Initialized
            </p>
            <p className="text-slate-700 dark:text-slate-200 text-sm">
              {twinMessage} Your aggregated net worth is{' '}
              <span className="font-bold text-primary">{totalNetWorth}</span>.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

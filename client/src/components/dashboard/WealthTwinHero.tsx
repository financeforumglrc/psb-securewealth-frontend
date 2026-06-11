import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';
import { useRecommendationEngine } from '../../hooks/useRecommendationEngine';
import CosmosCard from '../ui/CosmosCard';

/* ═══════════════════════════════════════════════════════════════
   WEALTH TWIN HERO — Hackathon Centerpiece
   Visualizes the "SecureWealth Twin" concept:
   • Digital financial avatar of the user
   • Real-time Protection Shield
   • Wealth Protection Risk Score (Low / Medium / High)
   • Live market intelligence pulse
   ═══════════════════════════════════════════════════════════════ */

interface RiskSignal {
  label: string;
  status: 'safe' | 'warn' | 'danger';
  icon: string;
  detail: string;
}

export default function WealthTwinHero() {
  const user = useWealthStore((s) => s.user);
  const assets = useWealthStore((s) => s.assets);
  const marketData = useWealthStore((s) => s.marketData);
  const transactions = useWealthStore((s) => s.transactions);
  const recommendations = useRecommendationEngine(user, marketData);
  const setView = useWealthStore((s) => s.setView);

  const netWorth = assets.reduce((sum, a) => sum + a.value, 0);
  const savingsRate = user.monthlyIncome > 0
    ? ((user.monthlySavings / user.monthlyIncome) * 100)
    : 0;

  // Compute Wealth Protection Risk Score (0-100, higher = more risk)
  const riskScore = useMemo(() => {
    let score = 0;
    // Device trust (simulated)
    score += 5; // Trusted device assumed
    // Amount vs history check
    const avgTxn = transactions.length > 0
      ? transactions.reduce((s, t) => s + t.amount, 0) / transactions.length
      : 5000;
    const maxTxn = transactions.length > 0
      ? Math.max(...transactions.map((t) => t.amount))
      : 10000;
    if (maxTxn > avgTxn * 3) score += 20;
    else if (maxTxn > avgTxn * 2) score += 10;
    // Behavior: savings rate
    if (savingsRate < 10) score += 15;
    else if (savingsRate < 20) score += 5;
    // Market volatility
    if (marketData.niftyPe > 28) score += 10;
    if (marketData.inflation > 6) score += 10;
    // New investment type (simulated first-timer)
    const hasInvested = assets.some((a) => a.type === 'mutualFund' || a.type === 'stock');
    if (!hasInvested) score += 8;

    return Math.min(Math.round(score), 100);
  }, [transactions, savingsRate, marketData, assets]);

  const riskLevel = riskScore < 40 ? 'LOW' : riskScore < 70 ? 'MEDIUM' : 'HIGH';
  const riskColor = riskScore < 40 ? 'emerald' : riskScore < 70 ? 'amber' : 'rose';
  const riskText = riskScore < 40 ? 'text-emerald-600' : riskScore < 70 ? 'text-amber-600' : 'text-rose-600';
  const riskBg = riskScore < 40 ? 'bg-emerald-500' : riskScore < 70 ? 'bg-amber-500' : 'bg-rose-500';
  const riskRing = riskScore < 40 ? 'ring-emerald-400' : riskScore < 70 ? 'ring-amber-400' : 'ring-rose-400';
  const riskGlow = riskScore < 40 ? 'shadow-emerald-500/30' : riskScore < 70 ? 'shadow-amber-500/30' : 'shadow-rose-500/30';

  // Animated score
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    const duration = 1000;
    const start = performance.now();
    let raf: number;
    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(riskScore * eased));
      if (progress < 1) raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [riskScore]);

  // Risk signals for display
  const signals: RiskSignal[] = useMemo(() => {
    const list: RiskSignal[] = [
      {
        label: 'Device Trust',
        status: 'safe',
        icon: 'fa-mobile-screen-button',
        detail: 'Trusted device verified',
      },
      {
        label: 'Behavior Pattern',
        status: savingsRate < 15 ? 'warn' : 'safe',
        icon: 'fa-fingerprint',
        detail: savingsRate < 15 ? `Savings rate low (${savingsRate.toFixed(1)}%)` : 'Spending pattern normal',
      },
      {
        label: 'Market Risk',
        status: marketData.niftyPe > 26 || marketData.inflation > 6 ? 'warn' : 'safe',
        icon: 'fa-chart-line',
        detail: marketData.niftyPe > 26
          ? `NIFTY P/E elevated (${marketData.niftyPe})`
          : `Markets stable (P/E ${marketData.niftyPe})`,
      },
      {
        label: 'Transaction History',
        status: 'safe',
        icon: 'fa-receipt',
        detail: `${transactions.length} transactions analyzed`,
      },
    ];
    return list;
  }, [savingsRate, marketData, transactions]);

  const activeWarnings = signals.filter((s) => s.status !== 'safe').length;

  // Top strategic recommendation
  const topRec = recommendations[0];

  return (
    <div className="space-y-5">
      {/* ═══ MAIN HERO CARD ═══ */}
      <CosmosCard
        variant="gradient"
        className="relative overflow-hidden"
        padding="lg"
        glow
        glowColor={riskScore < 40 ? '#10b981' : riskScore < 70 ? '#f59e0b' : '#f43f5e'}
      >
        {/* Animated background orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-secondary/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT: Twin Visual */}
          <div className="lg:col-span-4 flex flex-col items-center">
            {/* Twin Avatar Circle */}
            <motion.div
              className={`relative w-40 h-40 rounded-full flex items-center justify-center ring-4 ${riskRing} ${riskGlow} shadow-2xl`}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Outer rotating ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-dashed border-slate-300/50 dark:border-slate-600/50"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              {/* Inner gradient */}
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-${riskColor}-100 to-${riskColor}-50 dark:from-${riskColor}-900/30 dark:to-${riskColor}-900/10 flex flex-col items-center justify-center`}>
                <i className={`fas fa-user-shield text-3xl text-${riskColor}-500 mb-1`} />
                <span className={`text-2xl font-black ${riskText}`}>{displayScore}</span>
                <span className="text-[10px] text-slate-400 font-medium">/ 100 Risk</span>
              </div>
              {/* Shield badge */}
              <motion.div
                className={`absolute -bottom-1 px-3 py-1 rounded-full text-[10px] font-extrabold text-white ${riskBg} shadow-lg`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: 'spring' }}
              >
                {riskLevel} RISK
              </motion.div>
            </motion.div>

            <p className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">
              Your SecureWealth Twin
            </p>
            <p className="text-xs text-slate-400 text-center max-w-[200px]">
              AI-powered digital guardian monitoring your wealth 24/7
            </p>
          </div>

          {/* CENTER: Status & Signals */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-shield-heart text-primary" />
                Wealth Protection Status
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeWarnings === 0
                  ? 'All protection layers active. Your wealth is secure.'
                  : `${activeWarnings} advisory signal${activeWarnings > 1 ? 's' : ''} detected — review below.`}
              </p>
            </div>

            {/* Signal Grid */}
            <div className="grid grid-cols-2 gap-3">
              {signals.map((sig, i) => (
                <motion.div
                  key={sig.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                    sig.status === 'safe'
                      ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30'
                      : sig.status === 'warn'
                      ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30'
                      : 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                    sig.status === 'safe'
                      ? 'bg-emerald-100 text-emerald-600'
                      : sig.status === 'warn'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-rose-100 text-rose-600'
                  }`}>
                    <i className={`fas ${sig.icon}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{sig.label}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{sig.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* AI Strategic Rec */}
            {topRec && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-3 bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-xl border border-primary/10 dark:border-primary/20"
              >
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] mt-0.5">
                    <i className="fas fa-wand-magic-sparkles" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      AI Insight: {topRec.title}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {topRec.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT: Quick Stats */}
          <div className="lg:col-span-3 space-y-3">
            <CosmosCard variant="stat" padding="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Net Worth</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white">₹{(netWorth / 1e7).toFixed(2)}Cr</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <i className="fas fa-wallet" />
                </div>
              </div>
            </CosmosCard>

            <CosmosCard variant="stat" padding="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Savings Rate</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white">{savingsRate.toFixed(1)}%</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <i className="fas fa-piggy-bank" />
                </div>
              </div>
            </CosmosCard>

            <CosmosCard variant="stat" padding="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Goals</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white">
                    {useWealthStore((s) => s.goals).filter((g) => g.currentAmount < g.targetAmount).length}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <i className="fas fa-bullseye" />
                </div>
              </div>
            </CosmosCard>

            <button
              onClick={() => setView('protection')}
              className="w-full py-2.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all"
            >
              <i className="fas fa-shield-halved" />
              Open Protection Center
            </button>
          </div>
        </div>
      </CosmosCard>
    </div>
  );
}

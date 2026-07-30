import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Star, Award, Gift, Target, Users, Zap, Crown } from 'lucide-react';
import { useWealthStore } from '@/shared/store/wealthStore';

interface ValueTier {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  minValue: number;
  maxValue: number;
  features: string[];
  benefits: string[];
}

const VALUE_TIERS: ValueTier[] = [
  {
    id: 'basic',
    label: 'Basic',
    icon: Users,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
    minValue: 0,
    maxValue: 100000,
    features: ['Basic banking', 'Simple UI', 'Standard support'],
    benefits: ['No minimum balance', 'Basic features'],
  },
  {
    id: 'silver',
    label: 'Silver',
    icon: Star,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    minValue: 100000,
    maxValue: 500000,
    features: ['AI assistant', 'Goal tracking', 'Basic investments', 'Email support'],
    benefits: ['Lower fees', 'Better rates', 'Priority service'],
  },
  {
    id: 'gold',
    label: 'Gold',
    icon: Award,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    minValue: 500000,
    maxValue: 2000000,
    features: ['Wealth Twin GPT', 'Advanced investments', 'Cross-device approval', 'Priority support'],
    benefits: ['Fee waivers', 'Premium rates', 'Dedicated RM', 'Exclusive offers'],
  },
  {
    id: 'platinum',
    label: 'Platinum',
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    minValue: 2000000,
    maxValue: 10000000,
    features: ['Quantum security', 'Coercion detection', 'Emotion-adaptive limits', '24/7 support'],
    benefits: ['Zero fees', 'Best rates', 'Private banking', 'Custom solutions'],
  },
  {
    id: 'diamond',
    label: 'Diamond',
    icon: Zap,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
    minValue: 10000000,
    maxValue: Infinity,
    features: ['Enterprise security', 'Multi-sig approval', 'I4C integration', 'Concierge service'],
    benefits: ['All benefits', 'Global access', 'Family office', 'Legacy planning'],
  },
];

export default function CustomerValueTiering() {
  const [selectedTier, setSelectedTier] = useState<string>('gold');
  const user = useWealthStore((s) => s.user);
  const assets = useWealthStore((s) => s.assets);
  const transactions = useWealthStore((s) => s.transactions);

  const netWorth = assets.reduce((sum, a) => sum + a.value, 0);
  const monthlyVolume = transactions.reduce((sum, t) => sum + (t.type === 'debit' ? t.amount : 0), 0);

  // Calculate customer value score
  const customerValue = useMemo(() => {
    const netWorthScore = Math.min(netWorth / 100000, 100); // 1L = 1 point
    const incomeScore = Math.min(user.monthlyIncome / 10000, 50); // 10K = 1 point
    const volumeScore = Math.min(monthlyVolume / 50000, 30); // 50K = 1 point
    const loyaltyScore = 10; // Base loyalty

    return Math.round(netWorthScore + incomeScore + volumeScore + loyaltyScore);
  }, [netWorth, user.monthlyIncome, monthlyVolume]);

  // Determine tier based on value score
  const autoTier = useMemo(() => {
    if (customerValue >= 150) return 'diamond';
    if (customerValue >= 100) return 'platinum';
    if (customerValue >= 60) return 'gold';
    if (customerValue >= 30) return 'silver';
    return 'basic';
  }, [customerValue]);

  const currentTier = VALUE_TIERS.find((t) => t.id === selectedTier) || VALUE_TIERS[2];
  const Icon = currentTier.icon;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" /> Customer Value Tiering
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Features tiered based on your customer value. Higher value = more features and benefits.</p>
      </div>

      {/* Value Score */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70 uppercase tracking-wider">Customer Value Score</p>
            <p className="text-4xl font-black mt-1">{customerValue}<span className="text-lg text-white/50">/200</span></p>
            <p className="text-xs text-white/70 mt-1">
              {customerValue >= 150 ? 'Diamond Tier' : customerValue >= 100 ? 'Platinum Tier' : customerValue >= 60 ? 'Gold Tier' : customerValue >= 30 ? 'Silver Tier' : 'Basic Tier'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60">Net Worth</p>
            <p className="text-xl font-black text-emerald-300">₹{(netWorth / 100000).toFixed(1)}L</p>
          </div>
        </div>

        {/* Value Breakdown */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          <div className="text-center">
            <p className="text-[10px] text-white/50">Net Worth</p>
            <p className="text-sm font-bold text-white">{Math.min(netWorth / 100000, 100)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-white/50">Income</p>
            <p className="text-sm font-bold text-white">{Math.min(user.monthlyIncome / 10000, 50)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-white/50">Volume</p>
            <p className="text-sm font-bold text-white">{Math.min(monthlyVolume / 50000, 30)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-white/50">Loyalty</p>
            <p className="text-sm font-bold text-white">10</p>
          </div>
        </div>
      </div>

      {/* Tier Selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {VALUE_TIERS.map((tier) => {
          const TierIcon = tier.icon;
          const isAuto = tier.id === autoTier;
          return (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                selectedTier === tier.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              <TierIcon className={`w-5 h-5 mx-auto ${tier.color}`} />
              <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">{tier.label}</p>
              {isAuto && <span className="text-[9px] px-1 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">YOUR TIER</span>}
            </button>
          );
        })}
      </div>

      {/* Selected Tier Details */}
      <motion.div
        key={selectedTier}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 rounded-2xl border ${currentTier.bgColor}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl ${currentTier.color.replace('text-', 'bg-')} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white">{currentTier.label} Tier</h3>
            <p className="text-xs text-slate-500">
              Value Range: ₹{(currentTier.minValue / 100000).toFixed(0)}L - {currentTier.maxValue === Infinity ? '∞' : `₹${(currentTier.maxValue / 100000).toFixed(0)}L`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Features */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Features</h4>
            <div className="space-y-2">
              {currentTier.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Target className="w-4 h-4 text-indigo-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Benefits</h4>
            <div className="space-y-2">
              {currentTier.benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Gift className="w-4 h-4 text-emerald-500" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upgrade Path */}
        {selectedTier !== 'diamond' && (
          <div className="mt-4 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Upgrade to {VALUE_TIERS[VALUE_TIERS.findIndex(t => t.id === selectedTier) + 1]?.label || 'Diamond'}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {selectedTier === 'basic' && 'Increase your net worth to ₹1L+ to unlock Silver tier features.'}
              {selectedTier === 'silver' && 'Increase your net worth to ₹5L+ to unlock Gold tier features.'}
              {selectedTier === 'gold' && 'Increase your net worth to ₹20L+ to unlock Platinum tier features.'}
              {selectedTier === 'platinum' && 'Increase your net worth to ₹1Cr+ to unlock Diamond tier features.'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Feature Access Comparison */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-black text-slate-800 dark:text-white mb-3">Feature Access by Tier</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 text-slate-500">Feature</th>
                {VALUE_TIERS.map((tier) => (
                  <th key={tier.id} className="text-center py-2 text-slate-500">{tier.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Basic Banking', tiers: [true, true, true, true, true] },
                { name: 'AI Assistant', tiers: [false, true, true, true, true] },
                { name: 'Wealth Twin GPT', tiers: [false, false, true, true, true] },
                { name: 'Cross-Device Approval', tiers: [false, false, true, true, true] },
                { name: 'Quantum Security', tiers: [false, false, false, true, true] },
                { name: 'Coercion Detection', tiers: [false, false, false, true, true] },
                { name: 'Emotion-Adaptive Limits', tiers: [false, false, false, true, true] },
                { name: 'I4C Integration', tiers: [false, false, false, false, true] },
                { name: 'Multi-Sig Approval', tiers: [false, false, false, false, true] },
              ].map((row, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 text-slate-600 dark:text-slate-400">{row.name}</td>
                  {row.tiers.map((hasAccess, j) => (
                    <td key={j} className="text-center py-2">
                      {hasAccess ? (
                        <span className="text-emerald-500">✓</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

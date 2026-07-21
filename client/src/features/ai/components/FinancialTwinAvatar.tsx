import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';

function getAvatarState(score: number) {
  if (score >= 80) return { emoji: '🤩', color: 'from-emerald-400 to-teal-500', mood: 'Thriving', pulse: false };
  if (score >= 60) return { emoji: '😊', color: 'from-blue-400 to-indigo-500', mood: 'Growing', pulse: false };
  if (score >= 40) return { emoji: '😐', color: 'from-amber-400 to-orange-500', mood: 'Cautious', pulse: true };
  return { emoji: '😟', color: 'from-rose-400 to-red-500', mood: 'Stressed', pulse: true };
}

function getAura(score: number) {
  if (score >= 80) return 'bg-emerald-400/30';
  if (score >= 60) return 'bg-blue-400/30';
  if (score >= 40) return 'bg-amber-400/30';
  return 'bg-rose-400/30';
}

export default function FinancialTwinAvatar() {
  const user = useWealthStore((s) => s.user);
  const assets = useWealthStore((s) => s.assets);
  const goals = useWealthStore((s) => s.goals);

  const healthScore = useMemo(() => {
    if (user.monthlyIncome <= 0) return 0;
    const savingsRate = (user.monthlySavings / user.monthlyIncome) * 100;
    const netWorth = assets.reduce((sum, a) => sum + a.value, 0);
    const goalProgress = goals.length > 0 ? goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount), 0) / goals.length : 0;
    return Math.min(Math.round(savingsRate * 0.4 + (netWorth / 1000000) * 0.3 + goalProgress * 100 * 0.3), 100);
  }, [user, assets, goals]);

  const state = getAvatarState(healthScore);
  const aura = getAura(healthScore);

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
      {/* Aura */}
      <motion.div
        className={`absolute inset-0 ${aura} blur-3xl`}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Avatar */}
        <motion.div
          className={`w-24 h-24 rounded-full bg-gradient-to-br ${state.color} flex items-center justify-center text-5xl shadow-2xl mb-3`}
          animate={state.pulse ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {state.emoji}
        </motion.div>

        {/* Mood */}
        <motion.p
          key={state.mood}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-bold uppercase tracking-wider text-white/80"
        >
          {state.mood}
        </motion.p>

        {/* Score */}
        <div className="mt-3 w-full max-w-[200px]">
          <div className="flex items-center justify-between text-[10px] text-white/60 mb-1">
            <span>Financial Health</span>
            <span>{healthScore}/100</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${state.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${healthScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Message */}
        <p className="mt-4 text-xs text-white/70 text-center max-w-[240px]">
          {healthScore >= 80 && 'Your wealth twin is glowing! Keep up the excellent savings discipline.'}
          {healthScore >= 60 && healthScore < 80 && 'Your twin is growing steadily. A bit more consistency will make it shine.'}
          {healthScore >= 40 && healthScore < 60 && 'Your twin looks worried. Overspending is slowing down your wealth journey.'}
          {healthScore < 40 && 'Your twin is stressed. Let\'s rebuild your financial foundation together.'}
        </p>
      </div>
    </div>
  );
}

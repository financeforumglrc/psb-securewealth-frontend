import { motion } from 'framer-motion';
import { getStreak, getNextReward } from '../../services/streakService';

export default function StreakFire() {
  const streak = getStreak();
  const next = getNextReward();
  const progress = next ? Math.min((streak.days / next.days) * 100, 100) : 100;

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <motion.i
            className="fas fa-fire text-amber-500"
            animate={{
              scale: [1, 1.15, 1],
              filter: [
                'drop-shadow(0 0 0px rgba(245,158,11,0))',
                'drop-shadow(0 0 8px rgba(245,158,11,0.5))',
                'drop-shadow(0 0 0px rgba(245,158,11,0))',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          Streak
        </h3>
        <span className="text-2xl font-bold text-slate-800 dark:text-white">{streak.days}</span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
        {next ? `${next.days - streak.days} days until ${next.reward}` : 'Max streak achieved! 🎉'}
      </p>

      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>

      <div className="flex justify-between mt-2">
        {[7, 30, 100].map((m) => (
          <div key={m} className="text-center">
            <motion.div
              animate={streak.days >= m ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.5 }}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mx-auto ${
                streak.days >= m
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
              }`}
            >
              {streak.days >= m ? <i className="fas fa-check" /> : m}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}

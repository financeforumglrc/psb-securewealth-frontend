import { useRewards } from '../../context/RewardsContext';
import { getStreak } from '../../services/streakService';

export default function RewardsDashboardCard() {
  const { cashbackBalance } = useRewards();
  const streak = getStreak();

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 shadow-xl border cursor-pointer group hover:shadow-2xl transition-all bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
      onClick={() => window.dispatchEvent(new CustomEvent('sw-nav', { detail: 'payments' }))}
    >
      {/* Gradient accent */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:from-primary/30 transition-colors" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-gift text-primary" />
            Rewards Hub
          </h3>
          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-lg">
            {streak.days > 0 ? `${streak.days}🔥` : 'Active'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4">
            <p className="text-xs text-green-600 dark:text-green-400 mb-1">Cashback</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">₹{cashbackBalance.toFixed(2)}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4">
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Streak</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{streak.days}d</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {['fa-wallet', 'fa-fire', 'fa-qrcode', 'fa-user-plus'].map((icon, i) => (
              <div key={i} className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                <i className={`fas ${icon} text-xs text-slate-500`} />
              </div>
            ))}
          </div>
          <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Open Payments <i className="fas fa-arrow-right" />
          </span>
        </div>
      </div>
    </div>
  );
}

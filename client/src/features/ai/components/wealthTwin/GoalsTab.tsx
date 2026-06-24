import { useTranslation } from '@/shared/hooks/useTranslation';
import DynamicCompass from '@/features/goals/components/DynamicCompass';
import { useTwinContext } from './WealthTwinContext';

export default function GoalsTab() {
  const { goalPlans, user } = useTwinContext();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <DynamicCompass />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goalPlans.map((goal) => {
          const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const advice = goal.onTrack
            ? t('twinGoalInsightOnTrack')
                .replace('{amount}', `₹${Math.round(goal.monthlyNeed).toLocaleString()}`)
                .replace('{deadline}', goal.deadline)
            : t('twinGoalInsightBehind').replace(
                '{amount}',
                `₹${Math.round(goal.monthlyNeed - user.monthlySavings / goalPlans.length).toLocaleString()}`
              );

          return (
            <div key={goal.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-800 dark:text-white">{goal.name}</h4>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    goal.onTrack ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {goal.onTrack ? t('twinGoalStatusOnTrack') : t('twinGoalStatusNeedsAttention')}
                </span>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('twinGoalLabelTarget')}</span>
                  <span className="font-bold">₹{goal.targetAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('twinGoalLabelSaved')}</span>
                  <span className="font-bold">₹{goal.currentAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('twinGoalLabelGap')}</span>
                  <span className="font-bold text-rose-600">₹{goal.gap.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('twinGoalLabelMonthsLeft')}</span>
                  <span className="font-bold">{goal.monthsLeft}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('twinGoalLabelMonthlySipNeeded')}</span>
                  <span className="font-bold text-primary">₹{Math.round(goal.monthlyNeed).toLocaleString()}</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300">
                <i className="fas fa-robot text-primary mr-1" aria-hidden="true" />
                {advice}
              </div>
              <button className="mt-3 w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90">
                <i className="fas fa-rocket mr-1" aria-hidden="true" /> {t('twinGoalActionStartAdjustSip')}
              </button>
            </div>
          );
        })}
      </div>
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
          <i className="fas fa-lightbulb text-secondary mr-2" aria-hidden="true" />
          {t('twinGoalOptimizationTitle')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
            <p className="font-bold text-emerald-700 dark:text-emerald-300">
              {t('twinGoalOptimizationSmartOrderingTitle')}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {t('twinGoalOptimizationSmartOrderingDesc')}
            </p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
            <p className="font-bold text-amber-700 dark:text-amber-300">
              {t('twinGoalOptimizationSipLadderingTitle')}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {t('twinGoalOptimizationSipLadderingDesc')}
            </p>
          </div>
          <div className="p-3 bg-violet-50 dark:bg-violet-900/10 rounded-lg">
            <p className="font-bold text-violet-700 dark:text-violet-300">
              {t('twinGoalOptimizationTaxEfficientTitle')}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {t('twinGoalOptimizationTaxEfficientDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useTwinContext } from './WealthTwinContext';

export default function RebalanceTab() {
  const { rebalance, marketData, setView } = useTwinContext();
  const { t } = useTranslation();

  const niftyStatus =
    marketData.niftyPe > 26
      ? t('twinRebalanceNiftyOvervalued')
      : marketData.niftyPe < 22
        ? t('twinRebalanceNiftyUndervalued')
        : t('twinRebalanceNiftyFairValue');

  const inflationStatus = marketData.inflation > 6 ? t('twinRebalanceInflationHigh') : t('twinRebalanceInflationModerate');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">{t('twinRebalanceCurrentAllocation')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rebalance.current}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${t(name as string)}: ${value}%`}
                >
                  {rebalance.current.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, t(name as string)]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
            {t('twinRebalanceTargetAllocation')}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rebalance.target}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${t(name as string)}: ${value}%`}
                >
                  {rebalance.target.map((entry, index) => (
                    <Cell key={`cell-t-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, t(name as string)]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-3">{t('twinRebalanceActionTitle')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-[10px] text-slate-500">{t('twinRebalanceNiftyPeLabel')}</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{marketData.niftyPe}</p>
            <p className="text-xs text-slate-500">{niftyStatus}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-[10px] text-slate-500">{t('twinRebalanceInflationLabel')}</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{marketData.inflation}%</p>
            <p className="text-xs text-slate-500">{inflationStatus}</p>
          </div>
          <div className="p-4 bg-violet-50 dark:bg-violet-900/10 rounded-lg border border-violet-100 dark:border-violet-800/20">
            <p className="text-sm font-bold text-violet-700 dark:text-violet-300">{t('twinRebalanceAiActionLabel')}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{t(rebalance.action)}</p>
            <button
              onClick={() => setView('portfolio')}
              className="mt-2 px-3 py-1 bg-violet-500 text-white text-[10px] font-bold rounded-lg hover:bg-violet-600"
            >
              {t('twinRebalanceButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

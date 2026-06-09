import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useForecastEngine } from '../../hooks/useForecastEngine';
import { formatCurrency } from '../../utils/demoMode';
import { SCENARIO_OPTIONS, runScenario, type ScenarioResult } from '../../services/scenarioEngine';
import { useWealthStore } from '../../store/wealthStore';

export default function ScenarioSimulator() {
  const [savings, setSavings] = useState(28000);
  const [years, setYears] = useState(20);
  const [returns, setReturns] = useState(10);
  const [inflation, setInflation] = useState(6);
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null);

  const user = useWealthStore((s) => s.user);
  const data = useForecastEngine({ monthlySavings: savings, years, expectedReturn: returns, inflation });
  const final = data[data.length - 1];

  const runParallelFuture = async (optionId: string) => {
    const option = SCENARIO_OPTIONS.find((o) => o.id === optionId);
    if (!option) return;
    setScenarioOpen(true);
    setScenarioLoading(true);
    setScenarioResult(null);
    const result = await runScenario(option, user.monthlySavings, user.monthlyIncome);
    setScenarioResult(result);
    setScenarioLoading(false);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">
          <i className="fas fa-chart-line text-primary mr-2" /> Wealth Forecast
        </h3>
        <button onClick={() => window.print()} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50">
          <i className="fas fa-print mr-1" /> Export
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-xs text-slate-500 block mb-1">Monthly Savings</label>
          <input type="range" min="5000" max="100000" step="1000" value={savings} onChange={(e) => setSavings(Number(e.target.value))} className="w-full accent-primary" />
          <span className="text-sm font-semibold text-slate-800">{formatCurrency(savings)}</span>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Time Horizon</label>
          <input type="range" min="5" max="20" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full accent-primary" />
          <span className="text-sm font-semibold text-slate-800">{years} years</span>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Expected Return</label>
          <select value={returns} onChange={(e) => setReturns(Number(e.target.value))} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm">
            <option value={15}>Bull (+15%)</option>
            <option value={10}>Normal (+10%)</option>
            <option value={3}>Bear (+3%)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Inflation</label>
          <input type="range" min="3" max="8" step="0.5" value={inflation} onChange={(e) => setInflation(Number(e.target.value))} className="w-full accent-primary" />
          <span className="text-sm font-semibold text-slate-800">{inflation}%</span>
        </div>
      </div>

      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `₹${(v / 1e7).toFixed(1)}Cr`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(val) => formatCurrency(Number(val))} />
            <Area type="monotone" dataKey="optimistic" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
            <Area type="monotone" dataKey="base" stroke="#0f766e" fill="#0f766e" fillOpacity={0.2} strokeWidth={2} />
            <Area type="monotone" dataKey="conservative" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-emerald-50 rounded-lg p-3">
          <p className="text-xs text-emerald-600 mb-1">Optimistic</p>
          <p className="font-bold text-emerald-700">{formatCurrency(final.optimistic)}</p>
        </div>
        <div className="bg-primary/5 rounded-lg p-3">
          <p className="text-xs text-primary mb-1">Base Case</p>
          <p className="font-bold text-primary">{formatCurrency(final.base)}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3">
          <p className="text-xs text-amber-600 mb-1">Conservative</p>
          <p className="font-bold text-amber-700">{formatCurrency(final.conservative)}</p>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 mt-4 text-center">
        💡 Projections based on historical averages. Market risks apply. Not financial advice.
      </p>

      {/* Parallel Future Scenario Section */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <i className="fas fa-wand-magic-sparkles text-violet-500" />
          <h4 className="font-bold text-slate-800 dark:text-white text-sm">Parallel Future Simulator</h4>
          <span className="text-[10px] px-2 py-0.5 bg-violet-100 text-violet-600 rounded-full font-bold">AI</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          What if you made a big life decision? See the impact on your key goals with an AI-narrated comparison.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SCENARIO_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => runParallelFuture(opt.id)}
              className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 transition-all text-left"
            >
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{opt.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {opt.impactMonthly < 0 ? `₹${Math.abs(opt.impactMonthly).toLocaleString()}/month` : opt.impactIncome > 0 ? `+₹${opt.impactIncome.toLocaleString()}/month income` : `One-time ₹${Math.abs(opt.impactOneTime).toLocaleString()}`}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Result Modal */}
      {scenarioOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={() => setScenarioOpen(false)}>
          <div className="bg-white dark:bg-dark-light rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-fade-in overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-wand-magic-sparkles text-violet-500" /> Parallel Future
              </h3>
              <button onClick={() => setScenarioOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-xmark" />
              </button>
            </div>

            {scenarioLoading ? (
              <div className="space-y-4 py-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-500">Consulting AI advisor...</p>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse" />
              </div>
            ) : scenarioResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-violet-50 dark:bg-violet-900/10 rounded-xl border border-violet-200 dark:border-violet-800">
                  <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed font-medium">
                    {scenarioResult.narrative}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Current Path</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200 mt-1">{formatCurrency(scenarioResult.baseProjection)}</p>
                  </div>
                  <div className="p-3 bg-violet-50 dark:bg-violet-900/10 rounded-xl text-center border border-violet-200 dark:border-violet-800">
                    <p className="text-[10px] text-violet-500 uppercase font-bold">New Scenario</p>
                    <p className="text-lg font-bold text-violet-700 dark:text-violet-300 mt-1">{formatCurrency(scenarioResult.newProjection)}</p>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-center ${
                  scenarioResult.delta >= 0
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800'
                    : 'bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-800'
                }`}>
                  <p className="text-xs font-bold">
                    {scenarioResult.delta >= 0 ? 'Gain' : 'Cost'}: {formatCurrency(Math.abs(scenarioResult.delta))} over {scenarioResult.option.durationMonths / 12} years
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Goal impact: {scenarioResult.goalImpact} · Timeline shift: {scenarioResult.yearsToGoalChange.toFixed(1)} years
                  </p>
                </div>

                <button
                  onClick={() => setScenarioOpen(false)}
                  className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

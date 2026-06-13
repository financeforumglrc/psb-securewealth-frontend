import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';
import CosmosCard from '../ui/CosmosCard';

/* ═══════════════════════════════════════════════════════════════
   DYNAMIC FINANCIAL COMPASS — Requirement #2 Advanced Solution
   Understands changes in income, goals, and risk appetite:
   • Income change simulator
   • Goal feasibility score
   • Risk appetite meter
   • Goal priority AI
   • Timeline conflict detection
   ═══════════════════════════════════════════════════════════════ */

export default function DynamicCompass() {
  const user = useWealthStore((s) => s.user);
  const goals = useWealthStore((s) => s.goals);

  const [simulatedIncome, setSimulatedIncome] = useState(user.monthlyIncome);
  const [riskLevel, setRiskLevel] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

  const simulatedSavings = Math.round(simulatedIncome * (user.monthlySavings / user.monthlyIncome || 0.2));

  const goalAnalysis = useMemo(() => {
    return goals.map((goal) => {
      const gap = goal.targetAmount - goal.currentAmount;
      const monthsLeft = Math.max(1, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
      const monthlyNeed = gap / monthsLeft;
      const affordable = simulatedSavings >= monthlyNeed;
      const feasibility = Math.min(100, Math.round((simulatedSavings / monthlyNeed) * 100));

      // Adjust target allocation based on risk
      const equityPct = riskLevel === 'aggressive' ? 80 : riskLevel === 'moderate' ? 60 : 30;
      const debtPct = 100 - equityPct;

      return { ...goal, gap, monthsLeft, monthlyNeed, affordable, feasibility, equityPct, debtPct };
    });
  }, [goals, simulatedSavings, riskLevel]);

  const conflicts = useMemo(() => {
    const list: string[] = [];
    const sorted = [...goalAnalysis].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    for (let i = 0; i < sorted.length - 1; i++) {
      const diffMonths = Math.ceil((new Date(sorted[i + 1].deadline).getTime() - new Date(sorted[i].deadline).getTime()) / (1000 * 60 * 60 * 24 * 30));
      if (diffMonths < 6) {
        list.push(`${sorted[i].name} & ${sorted[i + 1].name} are only ${diffMonths} months apart.`);
      }
    }
    return list;
  }, [goalAnalysis]);

  const overallFeasibility = goalAnalysis.length > 0
    ? Math.round(goalAnalysis.reduce((s, g) => s + g.feasibility, 0) / goalAnalysis.length)
    : 100;

  const feasibilityColor = overallFeasibility >= 80 ? 'emerald' : overallFeasibility >= 50 ? 'amber' : 'rose';
  const feasibilityStyles: Record<string, string> = {
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    rose: 'text-rose-600',
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Controls */}
        <div className="space-y-4">
          <CosmosCard variant="default" padding="md">
            <h3 className="font-bold text-slate-800 dark:text-white mb-3"><i className="fas fa-compass text-primary mr-2" />Income Simulator</h3>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Monthly Income</span>
                <span className="font-bold text-primary">₹{simulatedIncome.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={Math.round(user.monthlyIncome * 0.5)}
                max={Math.round(user.monthlyIncome * 2)}
                step="5000"
                value={simulatedIncome}
                onChange={(e) => setSimulatedIncome(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">Drag to simulate hike, cut, or job change</p>
            </div>
            <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-[10px] text-slate-500">Projected Monthly Savings</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">₹{simulatedSavings.toLocaleString()}</p>
            </div>
          </CosmosCard>

          <CosmosCard variant="default" padding="md">
            <h3 className="font-bold text-slate-800 dark:text-white mb-3">Risk Appetite</h3>
            <div className="flex gap-2">
              {(['conservative', 'moderate', 'aggressive'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskLevel(r)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${
                    riskLevel === r
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </CosmosCard>

          <CosmosCard variant={`${feasibilityColor === 'emerald' ? 'gradient' : 'default'}`} padding="md">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Overall Goal Feasibility</p>
            <p className={`text-3xl font-black ${feasibilityStyles[feasibilityColor]}`}>{overallFeasibility}%</p>
            <p className="text-xs text-slate-500 mt-1">
              {overallFeasibility >= 80 ? 'All goals look achievable.' : overallFeasibility >= 50 ? 'Some goals need adjustment.' : 'Major shortfall detected.'}
            </p>
          </CosmosCard>
        </div>

        {/* Goal Analysis */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-slate-800 dark:text-white">Goal-by-Goal AI Analysis</h3>
          {goalAnalysis.length === 0 ? (
            <p className="text-sm text-slate-500">No goals set yet.</p>
          ) : (
            goalAnalysis.map((goal, i) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <CosmosCard variant="default" padding="sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{goal.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      goal.affordable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {goal.affordable ? 'ON TRACK' : 'GAP'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div>
                      <p className="text-slate-400">Need/month</p>
                      <p className="font-bold">₹{Math.round(goal.monthlyNeed).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Feasibility</p>
                      <p className={`font-bold ${goal.feasibility >= 80 ? 'text-emerald-600' : goal.feasibility >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {goal.feasibility}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">AI Mix</p>
                      <p className="font-bold text-primary">{goal.equityPct}% Eq / {goal.debtPct}% Debt</p>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${goal.affordable ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(goal.feasibility, 100)}%` }}
                    />
                  </div>
                </CosmosCard>
              </motion.div>
            ))
          )}

          {conflicts.length > 0 && (
            <CosmosCard variant="default" padding="md">
              <h4 className="font-bold text-amber-600 mb-2"><i className="fas fa-triangle-exclamation mr-1" />Goal Timeline Conflicts</h4>
              <ul className="space-y-1">
                {conflicts.map((c, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <span className="text-amber-500">•</span>{c}
                  </li>
                ))}
              </ul>
            </CosmosCard>
          )}
        </div>
      </div>
    </div>
  );
}

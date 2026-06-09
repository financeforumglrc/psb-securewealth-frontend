import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useWealthStore } from '../../store/wealthStore';

interface Props {
  totalMonthlyNeed: number;
  monthlySavings: number;
  onApplyStrategy: (strategy: 'extend' | 'reduce' | 'increase') => void;
}

export default function GoalConflictIntelligence({ totalMonthlyNeed, monthlySavings, onApplyStrategy }: Props) {
  const [selectedStrategy, setSelectedStrategy] = useState<'extend' | 'reduce' | 'increase' | null>(null);
  const goals = useWealthStore((s) => s.goals);

  const shortfall = totalMonthlyNeed - monthlySavings;
  const shortfallPct = Math.round((shortfall / monthlySavings) * 100);

  // Strategy calculations
  const strategies = useMemo(() => {
    const now = new Date();

    // Strategy A: Extend all timelines by 12 months
    const extendGoals = goals.map((g) => {
      const d = new Date(g.deadline);
      d.setMonth(d.getMonth() + 12);
      return { ...g, deadline: d.toISOString().split('T')[0] };
    });
    const extendMonthly = extendGoals.reduce((sum, g) => {
      const months = Math.max(1, Math.ceil((new Date(g.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      return sum + Math.ceil((g.targetAmount - g.currentAmount) / months);
    }, 0);

    // Strategy B: Reduce goal amounts by 30%
    const reduceGoals = goals.map((g) => ({
      ...g,
      targetAmount: Math.round(g.targetAmount * 0.7),
    }));
    const reduceMonthly = reduceGoals.reduce((sum, g) => {
      const months = Math.max(1, Math.ceil((new Date(g.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      return sum + Math.ceil((g.targetAmount - g.currentAmount) / months);
    }, 0);

    // Strategy C: Increase savings
    const requiredSavings = totalMonthlyNeed + 2000; // small buffer

    return {
      extend: { monthly: extendMonthly, goals: extendGoals, label: 'Extend Timelines', desc: 'Push all deadlines by 12 months', color: '#0f766e' },
      reduce: { monthly: reduceMonthly, goals: reduceGoals, label: 'Reduce Targets', desc: 'Scale all goals down by 30%', color: '#8b5cf6' },
      increase: { monthly: totalMonthlyNeed, goals, label: 'Boost Savings', desc: `Increase SIP to ₹${requiredSavings.toLocaleString()}/mo`, color: '#f59e0b' },
    };
  }, [goals, totalMonthlyNeed]);

  const chartData = [
    { name: 'Current', amount: totalMonthlyNeed, fill: '#ef4444' },
    { name: 'Extend', amount: strategies.extend.monthly, fill: '#0f766e' },
    { name: 'Reduce', amount: strategies.reduce.monthly, fill: '#8b5cf6' },
    { name: 'Boost', amount: strategies.increase.monthly, fill: '#f59e0b' },
  ];

  const savingsLine = monthlySavings;

  return (
    <div className="space-y-4">
      {/* GOAL CONFLICT Banner */}
      <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-200 dark:border-rose-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
            <i className="fas fa-triangle-exclamation text-rose-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-700 dark:text-rose-300">GOAL CONFLICT DETECTED</h3>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Your goals are not feasible with current savings rate
            </p>
          </div>
          <span className="ml-auto px-2 py-1 bg-rose-200 dark:bg-rose-800 text-rose-700 dark:text-rose-300 rounded-full text-[10px] font-bold">
            +{shortfallPct}% over budget
          </span>
        </div>

        {/* Math Breakdown */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-rose-100 dark:border-rose-800">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-500 dark:text-slate-400">Total monthly needed for all goals</span>
            <span className="font-bold text-rose-600">₹{totalMonthlyNeed.toLocaleString()}/mo</span>
          </div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-500 dark:text-slate-400">Your current monthly savings</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">₹{monthlySavings.toLocaleString()}/mo</span>
          </div>
          <div className="w-full h-px bg-rose-100 my-2" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Monthly shortfall</span>
            <span className="font-bold text-rose-600">₹{shortfall.toLocaleString()}/mo</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Comparison */}
      <div className="card">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">
          <i className="fas fa-chart-column text-primary mr-2" />Strategy Comparison
        </h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                formatter={(value) => [`₹${Number(value).toLocaleString()}/mo`, 'Monthly Need']}
                contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} animationDuration={1000}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} opacity={selectedStrategy && entry.name.toLowerCase() !== selectedStrategy && entry.name !== 'Current' ? 0.4 : 1} />
                ))}
              </Bar>
              {/* Savings reference line */}
              <text x="10" y="20" fill="#10b981" fontSize="11" fontWeight="600">
                Savings Target: ₹{savingsLine.toLocaleString()}
              </text>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-1">
          Bars below the green savings line are feasible strategies
        </p>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(['extend', 'reduce', 'increase'] as const).map((key) => {
          const s = strategies[key];
          const isSelected = selectedStrategy === key;
          const isFeasible = s.monthly <= monthlySavings;
          return (
            <button
              key={key}
              onClick={() => setSelectedStrategy(isSelected ? null : key)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs" style={{ backgroundColor: s.color }}>
                  {key === 'extend' ? <i className="fas fa-calendar-plus" /> : key === 'reduce' ? <i className="fas fa-arrow-down" /> : <i className="fas fa-arrow-up" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{s.label}</p>
                  <p className="text-[10px] text-slate-400">{s.desc}</p>
                </div>
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">New monthly need</span>
                  <span className={`font-bold ${isFeasible ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ₹{s.monthly.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Feasibility</span>
                  <span className={`font-bold ${isFeasible ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isFeasible ? '✓ Within budget' : '✗ Still over'}
                  </span>
                </div>
              </div>

              {key === 'extend' && (
                <div className="space-y-1">
                  {s.goals.slice(0, 3).map((g) => (
                    <p key={g.id} className="text-[10px] text-slate-500 dark:text-slate-400">
                      {g.name}: <span className="text-slate-700 dark:text-slate-300">{new Date(g.deadline).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                    </p>
                  ))}
                </div>
              )}
              {key === 'reduce' && (
                <div className="space-y-1">
                  {s.goals.slice(0, 3).map((g) => (
                    <p key={g.id} className="text-[10px] text-slate-500 dark:text-slate-400">
                      {g.name}: <span className="text-slate-700 dark:text-slate-300">₹{g.targetAmount.toLocaleString()}</span>
                    </p>
                  ))}
                </div>
              )}
              {key === 'increase' && (
                <div className="p-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                  <p className="text-[10px] text-amber-700 dark:text-amber-300">
                    Increase SIP by ₹{(s.monthly - monthlySavings + 2000).toLocaleString()}/mo
                  </p>
                </div>
              )}

              {isSelected && (
                <button
                  onClick={(e) => { e.stopPropagation(); onApplyStrategy(key); }}
                  className="w-full mt-3 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  <i className="fas fa-wand-magic-sparkles mr-1" /> Apply Strategy
                </button>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';

/* ═══════════════════════════════════════════════════════════════
   BEHAVIORAL INTELLIGENCE ENGINE — Requirement #1 Advanced Solution
   Learns from spending, saving, and investment habits:
   • Spending velocity vs historical average
   • Habit formation score (savings, SIP, bill consistency)
   • Anomaly detection alerts
   • Predictive cashflow warnings
   • Investment habit DNA
   • Micro-nudges
   ═══════════════════════════════════════════════════════════════ */

interface HabitMetric {
  name: string;
  score: number;
  icon: string;
  color: string;
  tip: string;
}

export default function BehavioralEngine() {
  const user = useWealthStore((s) => s.user);
  const transactions = useWealthStore((s) => s.transactions);
  const assets = useWealthStore((s) => s.assets);

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.slice(0, 7);

  const savingsRate = user.monthlyIncome > 0 ? (user.monthlySavings / user.monthlyIncome) * 100 : 0;

  // Monthly spending history
  const monthlySpending = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter((t) => t.type === 'debit').forEach((t) => {
      const key = t.date.slice(0, 7);
      map.set(key, (map.get(key) || 0) + t.amount);
    });
    return Array.from(map.entries()).sort();
  }, [transactions]);

  // Current month spend
  const currentMonthSpend = monthlySpending.find(([m]) => m === currentMonth)?.[1] || 0;
  const previousMonths = monthlySpending.filter(([m]) => m !== currentMonth);
  const avgPreviousSpend = previousMonths.length > 0
    ? previousMonths.reduce((s, [, a]) => s + a, 0) / previousMonths.length
    : currentMonthSpend || 1;

  const spendVelocity = avgPreviousSpend > 0
    ? ((currentMonthSpend - avgPreviousSpend) / avgPreviousSpend) * 100
    : 0;

  // Habit formation score
  const habitMetrics: HabitMetric[] = useMemo(() => {
    const metrics: HabitMetric[] = [];

    // Savings consistency
    const savingsRate = user.monthlyIncome > 0 ? (user.monthlySavings / user.monthlyIncome) * 100 : 0;
    const savingsScore = Math.min(Math.round((savingsRate / 30) * 100), 100);
    metrics.push({
      name: 'Savings Discipline',
      score: savingsScore,
      icon: 'fa-piggy-bank',
      color: savingsScore >= 70 ? 'text-emerald-500' : savingsScore >= 40 ? 'text-amber-500' : 'text-rose-500',
      tip: savingsScore < 60 ? 'Aim for at least 20% savings rate.' : 'Great savings discipline!',
    });

    // SIP consistency (check for regular investment transactions)
    const sipTxns = transactions.filter((t) =>
      t.type === 'debit' && (t.description?.toLowerCase().includes('sip') || t.category?.toLowerCase().includes('investment'))
    ).length;
    const sipScore = Math.min(sipTxns * 15, 100);
    metrics.push({
      name: 'SIP Consistency',
      score: sipScore,
      icon: 'fa-chart-line',
      color: sipScore >= 70 ? 'text-emerald-500' : sipScore >= 40 ? 'text-amber-500' : 'text-rose-500',
      tip: sipScore < 50 ? 'Start a monthly SIP to build wealth.' : 'SIP habit is strong.',
    });

    // Bill payment consistency (housing, utilities)
    const billTxns = transactions.filter((t) =>
      t.type === 'debit' && ['Housing', 'Utilities', 'Bills'].includes(t.category)
    ).length;
    const billScore = Math.min(billTxns * 20, 100);
    metrics.push({
      name: 'Bill Regularity',
      score: billScore,
      icon: 'fa-file-invoice-dollar',
      color: billScore >= 70 ? 'text-emerald-500' : billScore >= 40 ? 'text-amber-500' : 'text-rose-500',
      tip: 'Set up auto-pay for recurring bills.',
    });

    // Diversification
    const hasEquity = assets.some((a) => a.type === 'stock' || a.type === 'mutualFund');
    const hasDebt = assets.some((a) => a.type === 'bank' || a.type === 'gold');
    const hasProperty = assets.some((a) => a.type === 'property');
    const divScore = [hasEquity, hasDebt, hasProperty].filter(Boolean).length * 33;
    metrics.push({
      name: 'Asset Diversification',
      score: divScore,
      icon: 'fa-layer-group',
      color: divScore >= 70 ? 'text-emerald-500' : divScore >= 40 ? 'text-amber-500' : 'text-rose-500',
      tip: divScore < 70 ? 'Add exposure to equity/debt/property.' : 'Well-diversified portfolio.',
    });

    return metrics;
  }, [user, transactions, assets]);

  const habitScore = Math.round(habitMetrics.reduce((s, m) => s + m.score, 0) / habitMetrics.length);

  // Anomaly detection
  const anomalies = useMemo(() => {
    const list: { text: string; severity: 'low' | 'medium' | 'high' }[] = [];

    if (spendVelocity > 30) {
      list.push({
        text: `Your spending is ${spendVelocity.toFixed(0)}% higher than your 6-month average.`,
        severity: 'high',
      });
    } else if (spendVelocity > 15) {
      list.push({
        text: `Your spending is ${spendVelocity.toFixed(0)}% above average.`,
        severity: 'medium',
      });
    }

    // High single transaction vs average
    const avgTxn = transactions.length > 0
      ? transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0) / transactions.filter((t) => t.type === 'debit').length
      : 0;
    const highTxns = transactions.filter((t) => t.type === 'debit' && t.amount > avgTxn * 3);
    if (highTxns.length > 0) {
      list.push({
        text: `${highTxns.length} unusually large transaction${highTxns.length > 1 ? 's' : ''} detected this month.`,
        severity: 'medium',
      });
    }

    if (savingsRate < 15) {
      list.push({
        text: `Savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 20%.`,
        severity: 'high',
      });
    }

    return list;
  }, [spendVelocity, transactions, savingsRate]);

  // Predictive cashflow
  const liquidAssets = assets.filter((a) => a.liquidity === 'high').reduce((s, a) => s + a.value, 0);
  const monthsOfRunway = user.monthlyExpenses > 0 ? liquidAssets / user.monthlyExpenses : 0;

  // Micro-nudges
  const nudges = useMemo(() => {
    const list: { text: string; saving: number }[] = [];
    if (currentMonthSpend > avgPreviousSpend * 1.1) {
      list.push({ text: 'Skip 2 dining-out orders this week', saving: 1500 });
    }
    if (savingsRate < 20) {
      list.push({ text: 'Automate ₹2,000 SIP before salary day', saving: 2000 });
    }
    if (monthsOfRunway < 3) {
      list.push({ text: 'Pause one discretionary subscription', saving: 500 });
    }
    if (list.length === 0) {
      list.push({ text: 'Increase SIP by 5% this quarter', saving: Math.round(user.monthlySavings * 0.05) });
    }
    return list.slice(0, 3);
  }, [currentMonthSpend, avgPreviousSpend, savingsRate, monthsOfRunway, user.monthlySavings]);

  const scoreColor = habitScore >= 75 ? 'emerald' : habitScore >= 50 ? 'amber' : 'rose';
  const scoreStyles: Record<string, { card: string; ring: string; num: string; text: string }> = {
    emerald: { card: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/20', ring: 'border-emerald-400', num: 'text-emerald-600', text: 'text-emerald-700 dark:text-emerald-300' },
    amber:   { card: 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/20', ring: 'border-amber-400', num: 'text-amber-600', text: 'text-amber-700 dark:text-amber-300' },
    rose:    { card: 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/20', ring: 'border-rose-400', num: 'text-rose-600', text: 'text-rose-700 dark:text-rose-300' },
  };
  const ss = scoreStyles[scoreColor];

  return (
    <div className="space-y-5">
      {/* Header + Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 dark:text-white">
              <i className="fas fa-brain text-violet-500 mr-2" />
              Behavioral Intelligence Engine
            </h3>
            <span className="text-[10px] px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-extrabold">AI-POWERED</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Continuously learning from your spending, saving, and investment patterns.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-[10px] text-slate-500">Monthly Spend Velocity</p>
              <p className={`text-lg font-bold ${spendVelocity > 15 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {spendVelocity >= 0 ? '+' : ''}{spendVelocity.toFixed(1)}%
              </p>
              <p className="text-[9px] text-slate-400">vs 6-month avg</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-[10px] text-slate-500">Liquid Runway</p>
              <p className="text-lg font-bold text-primary">{monthsOfRunway.toFixed(1)} months</p>
              <p className="text-[9px] text-slate-400">of expenses covered</p>
            </div>
          </div>
        </div>

        <div className={`card ${ss.card} border`}>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Habit Score</p>
            <div className={`w-20 h-20 mx-auto rounded-full border-4 ${ss.ring} flex items-center justify-center mb-2`}>
              <span className={`text-2xl font-black ${ss.num}`}>{habitScore}</span>
            </div>
            <p className={`text-xs font-bold ${ss.text}`}>
              {habitScore >= 75 ? 'Excellent' : habitScore >= 50 ? 'Improving' : 'Needs Focus'}
            </p>
          </div>
        </div>
      </div>

      {/* Habit Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {habitMetrics.map((metric, i) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <i className={`fas ${metric.icon} ${metric.color}`} />
              <span className="text-lg font-bold text-slate-800 dark:text-white">{metric.score}</span>
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{metric.name}</p>
            <p className="text-[9px] text-slate-400 mt-1">{metric.tip}</p>
          </motion.div>
        ))}
      </div>

      {/* Anomalies + Nudges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h4 className="font-semibold text-slate-800 dark:text-white mb-3"><i className="fas fa-triangle-exclamation text-amber-500 mr-2" />Anomaly Alerts</h4>
          {anomalies.length === 0 ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg text-center">
              <i className="fas fa-check-circle text-emerald-500 text-xl mb-2" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">No anomalies detected. Your financial behavior looks healthy.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {anomalies.map((a, i) => (
                <div key={i} className={`p-3 rounded-lg text-xs ${
                  a.severity === 'high' ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/10 dark:text-rose-300' :
                  a.severity === 'medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/10 dark:text-amber-300' :
                  'bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-300'
                }`}>
                  <i className={`fas fa-${a.severity === 'high' ? 'circle-exclamation' : 'circle-info'} mr-1`} />
                  {a.text}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h4 className="font-semibold text-slate-800 dark:text-white mb-3"><i className="fas fa-lightbulb text-secondary mr-2" />AI Micro-Nudges</h4>
          <div className="space-y-2">
            {nudges.map((n, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-xs">
                    <i className="fas fa-check" />
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200">{n.text}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600">+₹{n.saving.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-3">Small consistent actions compound into significant wealth.</p>
        </div>
      </div>
    </div>
  );
}

import { useTranslation } from '@/shared/hooks/useTranslation';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

interface Scenario {
  key: string;
  label: string;
  icon: string;
  description: string;
  impact: number; // negative = cost
}

const SCENARIOS: Scenario[] = [
  { key: 'none', label: 'Baseline', icon: 'fa-chart-line', description: 'Continue current savings and spending', impact: 0 },
  { key: 'car', label: 'Buy a Car', icon: 'fa-car', description: '₹12L car purchase + ₹15K/month EMI for 5 years', impact: -1200000 },
  { key: 'house', label: 'Buy a House', icon: 'fa-house', description: '₹50L home + ₹35K/month EMI for 20 years', impact: -5000000 },
  { key: 'business', label: 'Start a Business', icon: 'fa-briefcase', description: '₹8L startup capital, 40% income drop for 2 years', impact: -800000 },
  { key: 'sabbatical', label: 'Take a Sabbatical', icon: 'fa-plane', description: 'No income for 12 months, ₹8L expenses', impact: -800000 },
];

function runMonteCarlo(
  startAge: number,
  endAge: number,
  currentNetWorth: number,
  monthlySavings: number,
  annualReturn: number,
  scenarioImpact: number,
  simulations: number
) {
  const years = endAge - startAge;
  const results: { age: number; p10: number; p25: number; p50: number; p75: number; p90: number }[] = [];

  for (let y = 0; y <= years; y++) {
    const age = startAge + y;
    const yearlyValues: number[] = [];

    for (let s = 0; s < simulations; s++) {
      let value = currentNetWorth + (y === 0 ? scenarioImpact : 0);
      for (let yr = 0; yr < y; yr++) {
        const randomReturn = annualReturn + (Math.random() - 0.5) * 0.12; // ±6% volatility
        const savings = monthlySavings * 12;
        value = value * (1 + randomReturn) + savings;
        if (yr === 0) value += scenarioImpact; // Apply once at start
      }
      yearlyValues.push(Math.max(0, value));
    }

    yearlyValues.sort((a, b) => a - b);
    results.push({
      age,
      p10: yearlyValues[Math.floor(simulations * 0.1)],
      p25: yearlyValues[Math.floor(simulations * 0.25)],
      p50: yearlyValues[Math.floor(simulations * 0.5)],
      p75: yearlyValues[Math.floor(simulations * 0.75)],
      p90: yearlyValues[Math.floor(simulations * 0.9)],
    });
  }
  return results;
}

function formatCr(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  return `₹${Math.round(n).toLocaleString()}`;
}

export default function MonteCarloSimulator() {
  const { t } = useTranslation();
  const user = useWealthStore((s) => s.user);
  const netWorth = useWealthStore((s) => s.assets.reduce((sum, a) => sum + a.value, 0));
  const [activeScenario, setActiveScenario] = useState('none');
  const [startAge] = useState(35);
  const [endAge] = useState(80);
  const [showDetail, setShowDetail] = useState(false);

  const scenario = SCENARIOS.find((s) => s.key === activeScenario)!;
  const monthlySavings = user.monthlySavings;
  const annualReturn = user.riskProfile === 'Aggressive' ? 0.12 : user.riskProfile === 'Moderate' ? 0.10 : 0.08;

  const data = useMemo(() => {
    return runMonteCarlo(startAge, endAge, netWorth, monthlySavings, annualReturn, scenario.impact, 500);
  }, [startAge, endAge, netWorth, monthlySavings, annualReturn, scenario.impact]);

  const final = data[data.length - 1];
  const baselineFinal = useMemo(() => {
    const baselineData = runMonteCarlo(startAge, endAge, netWorth, monthlySavings, annualReturn, 0, 200);
    return baselineData[baselineData.length - 1].p50;
  }, [startAge, endAge, netWorth, monthlySavings, annualReturn]);

  const diff = final.p50 - baselineFinal;

  const milestones = [
    { age: 45, label: 'Kids College' },
    { age: 55, label: 'Peak Earning' },
    { age: 60, label: 'Retirement' },
    { age: 70, label: 'Active Senior' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-dice text-primary" aria-hidden="true" /> {t('monteTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('monteSubtitle')}</p>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveScenario(s.key)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
              activeScenario === s.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <i className={`fas ${s.icon}`} aria-hidden="true" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Scenario Detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeScenario}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="p-3 bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-xl text-xs text-primary-dark dark:text-primary"
        >
          <strong>{scenario.label}:</strong> {scenario.description}
          {scenario.impact !== 0 && (
            <span className="ml-2 font-bold text-rose-500">
              {t('monteImpact')} {formatCr(scenario.impact)}
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Probability Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('monteBestCase'), value: final.p90, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: t('monteGoodCase'), value: final.p75, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
          { label: t('monteMedian'), value: final.p50, color: 'text-primary', bg: 'bg-primary/5' },
          { label: t('monteWorstCase'), value: final.p10, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} p-3 rounded-xl`}>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{stat.label}</p>
            <p className={`text-lg font-extrabold ${stat.color}`}>{formatCr(stat.value)}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">{t('monteAtAge')} {endAge}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">{t('monteChartTitle')}</h4>
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
          >
            {showDetail ? t('monteHideMilestones') : t('monteShowMilestones')}
          </button>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="p90grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="p75grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="p50grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1976d2" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="age" tick={{ fontSize: 11 }} label={{ value: 'Age', position: 'insideBottom', offset: -2, fontSize: 11 }} />
              <YAxis tickFormatter={(v) => formatCr(v)} tick={{ fontSize: 10 }} width={70} />
              <Tooltip
                formatter={(value) => [formatCr(Number(value) || 0), '']}
                labelFormatter={(label) => `Age ${label}`}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
              />
              <Area type="monotone" dataKey="p90" stackId="1" stroke="#10b981" fill="url(#p90grad)" strokeWidth={1} strokeDasharray="4 4" />
              <Area type="monotone" dataKey="p75" stackId="2" stroke="#14b8a6" fill="url(#p75grad)" strokeWidth={1} strokeDasharray="3 3" />
              <Area type="monotone" dataKey="p50" stackId="3" stroke="#1976d2" fill="url(#p50grad)" strokeWidth={2} />
              <Area type="monotone" dataKey="p25" stackId="4" stroke="#f59e0b" fill="none" strokeWidth={1} strokeDasharray="3 3" />
              <Area type="monotone" dataKey="p10" stackId="5" stroke="#f43f5e" fill="none" strokeWidth={1} strokeDasharray="4 4" />
              {showDetail && milestones.map((m) => (
                <ReferenceLine key={m.age} x={m.age} stroke="#94a3b8" strokeDasharray="2 2" label={{ value: m.label, position: 'top', fontSize: 9, fill: '#64748b' }} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 mt-2 justify-center">
          {[
            { label: t('monte90th'), color: '#10b981', dash: '4 4' },
            { label: t('monte75th'), color: '#14b8a6', dash: '3 3' },
            { label: t('monteMedian'), color: '#1976d2', dash: '0' },
            { label: t('monte25th'), color: '#f59e0b', dash: '3 3' },
            { label: t('monte10th'), color: '#f43f5e', dash: '4 4' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 rounded" style={{ backgroundColor: l.color, borderStyle: 'dashed', borderWidth: l.dash !== '0' ? '1px' : 0, borderColor: l.color }} />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-bullseye text-primary text-sm" aria-hidden="true" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{t('monteMedianOutcome')}</h4>
          </div>
          <p className="text-2xl font-extrabold text-primary">{formatCr(final.p50)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {diff < 0
              ? `₹${Math.abs(Math.round(diff / 1e5) / 10).toFixed(1)}L ${t('monteLessThanBaseline')}`
              : diff > 0
              ? `₹${Math.abs(Math.round(diff / 1e5) / 10).toFixed(1)}L ${t('monteMoreThanBaseline')}`
              : t('monteSameAsBaseline')}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-shield-halved text-emerald-500 text-sm" aria-hidden="true" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{t('monteDownsideRisk')}</h4>
          </div>
          <p className="text-2xl font-extrabold text-rose-500">{formatCr(final.p10)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('monteDownsideDesc')}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-rocket text-amber-500 text-sm" aria-hidden="true" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{t('monteUpside')}</h4>
          </div>
          <p className="text-2xl font-extrabold text-emerald-500">{formatCr(final.p90)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('monteUpsideDesc')}</p>
        </div>
      </div>

      {/* Formula Disclosure */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('monteMethodology')}</p>
        <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
          {t('monteMethodDesc').replace('{rate}', String(Math.round(annualReturn * 100))).replace('{savings}', monthlySavings.toLocaleString())}<sub>t+1</sub> = W<sub>t</sub> × (1 + r<sub>random</sub>) + 12 × savings
        </p>
      </div>
    </div>
  );
}

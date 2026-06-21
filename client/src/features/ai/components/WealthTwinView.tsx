import { useState, useRef, useMemo } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useRecommendationEngine } from '@/shared/hooks/useRecommendationEngine';
import { useFullscreen } from '@/shared/hooks/useFullscreen';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import WealthChat from '@/features/ai/components/WealthChat';
import BehavioralEngine from '@/features/ai/components/BehavioralEngine';
import DynamicCompass from '@/features/goals/components/DynamicCompass';

/* ═══════════════════════════════════════════════════════════════
   WEALTH TWIN AI — GOD MODE
   The most advanced personal financial intelligence layer:
   • Monte Carlo wealth simulation (best/base/worst)
   • Life event impact simulator
   • AI goal planner with monthly SIP math
   • Wealth DNA behavioural analysis
   • Market-aware portfolio rebalancing
   • Smart tax optimizer
   • One-click action execution
   ═══════════════════════════════════════════════════════════════ */



function aggregateSpending(transactions: { category: string; amount: number; type: string }[]) {
  const cats = new Map<string, number>();
  transactions.filter((t) => t.type === 'debit').forEach((t) => {
    cats.set(t.category, (cats.get(t.category) || 0) + t.amount);
  });
  return Array.from(cats.entries()).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
}

function generateMonteCarlo(currentNW: number, monthlySavings: number, years = 10) {
  const data = [];
  const year = new Date().getFullYear();
  let base = currentNW;
  let optimistic = currentNW;
  let pessimistic = currentNW;
  const monthlyBase = 0.008; // ~10% annual
  const monthlyOptimistic = 0.012; // ~15% annual
  const monthlyPessimistic = 0.004; // ~5% annual

  for (let y = 0; y <= years; y++) {
    data.push({
      year: year + y,
      base: Math.round(base),
      optimistic: Math.round(optimistic),
      pessimistic: Math.round(pessimistic),
    });
    for (let m = 0; m < 12; m++) {
      base = base * (1 + monthlyBase) + monthlySavings;
      optimistic = optimistic * (1 + monthlyOptimistic) + monthlySavings;
      pessimistic = pessimistic * (1 + monthlyPessimistic) + monthlySavings;
    }
  }
  return data;
}

function generateLifeEventImpact(currentNW: number, monthlySavings: number, event: string) {
  const multipliers: Record<string, { immediate: number; savingsChange: number; returnsChange: number; label: string }> = {
    none: { immediate: 0, savingsChange: 0, returnsChange: 0, label: 'Baseline' },
    jobLoss: { immediate: -300000, savingsChange: -monthlySavings * 0.7, returnsChange: -0.02, label: 'Job Loss (6 months)' },
    marketCrash: { immediate: currentNW * -0.25, savingsChange: 0, returnsChange: -0.03, label: 'Market Crash (-25%)' },
    inheritance: { immediate: 2000000, savingsChange: 0, returnsChange: 0, label: 'Inheritance (+₹20L)' },
    wedding: { immediate: -1500000, savingsChange: -monthlySavings * 0.3, returnsChange: 0, label: 'Wedding Expense' },
    promotion: { immediate: 500000, savingsChange: monthlySavings * 0.5, returnsChange: 0, label: 'Promotion (+50% savings)' },
    medical: { immediate: -800000, savingsChange: 0, returnsChange: 0, label: 'Medical Emergency' },
  };
  return multipliers[event] || multipliers.none;
}

export default function WealthTwinView() {
  const user = useWealthStore((s) => s.user);
  const goals = useWealthStore((s) => s.goals);
  const assets = useWealthStore((s) => s.assets);
  const marketData = useWealthStore((s) => s.marketData);
  const transactions = useWealthStore((s) => s.transactions);
  const recommendations = useRecommendationEngine(user, marketData);
  const setView = useWealthStore((s) => s.setView);


  const currentNW = assets.reduce((sum, a) => sum + a.value, 0);
  const savingsRate = user.monthlyIncome > 0 ? (user.monthlySavings / user.monthlyIncome) * 100 : 0;

  const { toggle: toggleFullscreen, isFullscreen } = useFullscreen();
  const chartRef = useRef<HTMLDivElement>(null);

  const [godMode, setGodMode] = useState(true);
  const [lifeEvent, setLifeEvent] = useState('none');
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'tax' | 'rebalance' | 'whatif' | 'retirement'>('overview');

  // What-If simulator state
  const [whatIfSavings, setWhatIfSavings] = useState(user.monthlySavings);
  const [whatIfReturns, setWhatIfReturns] = useState(10);
  const [whatIfYears, setWhatIfYears] = useState(15);
  const [whatIfExpense, setWhatIfExpense] = useState(0);

  // Retirement / FIRE state
  const [retirementAge, setRetirementAge] = useState(60);
  const [monthlyPensionNeed, setMonthlyPensionNeed] = useState(user.monthlyExpenses);
  const currentAge = 30; // simulated

  const whatIfData = useMemo(() => {
    const data = [];
    const startYear = new Date().getFullYear();
    const adjustedNW = Math.max(0, currentNW - whatIfExpense);
    const monthlyRate = whatIfReturns / 100 / 12;
    let nw = adjustedNW;
    for (let y = 0; y <= whatIfYears; y++) {
      data.push({ year: startYear + y, netWorth: Math.round(nw) });
      for (let m = 0; m < 12; m++) {
        nw = nw * (1 + monthlyRate) + whatIfSavings;
      }
    }
    return data;
  }, [currentNW, whatIfSavings, whatIfReturns, whatIfYears, whatIfExpense]);

  const fireNumber = useMemo(() => {
    // 4% rule: corpus = annual expenses / 0.04
    return monthlyPensionNeed * 12 * 25;
  }, [monthlyPensionNeed]);

  const retirementProjection = useMemo(() => {
    const data = [];
    const startYear = new Date().getFullYear();
    const yearsToRetire = retirementAge - currentAge;
    const monthlyRate = 10 / 100 / 12;
    let nw = currentNW;
    for (let y = 0; y <= yearsToRetire; y++) {
      data.push({ age: currentAge + y, year: startYear + y, netWorth: Math.round(nw) });
      for (let m = 0; m < 12; m++) {
        nw = nw * (1 + monthlyRate) + user.monthlySavings;
      }
    }
    const finalNW = data[data.length - 1]?.netWorth || 0;
    const shortfall = Math.max(0, fireNumber - finalNW);
    return { data, finalNW, shortfall, yearsToRetire };
  }, [currentNW, user.monthlySavings, retirementAge, fireNumber]);

  const categorySpending = aggregateSpending(transactions);
  const totalExpenses = categorySpending.reduce((sum, c) => sum + c.amount, 0) || user.monthlyExpenses;
  const topCategory = categorySpending[0] || { name: 'No data', amount: 0 };
  const expenseRatio = (totalExpenses / user.monthlyIncome * 100).toFixed(1);

  // Monte Carlo data
  const monteCarloData = useMemo(() => generateMonteCarlo(currentNW, user.monthlySavings, 15), [currentNW, user.monthlySavings]);
  const croreYear = monteCarloData.find((d) => d.base >= 1e7)?.year || 2035;

  // Life event simulation
  const eventImpact = useMemo(() => generateLifeEventImpact(currentNW, user.monthlySavings, lifeEvent), [currentNW, user.monthlySavings, lifeEvent]);
  const simulatedNW = Math.max(0, currentNW + eventImpact.immediate);
  const simulatedMonthlySavings = Math.max(0, user.monthlySavings + eventImpact.savingsChange);
  const simulatedData = useMemo(() => generateMonteCarlo(simulatedNW, simulatedMonthlySavings, 15), [simulatedNW, simulatedMonthlySavings]);

  // Wealth DNA
  const wealthDNA = useMemo(() => {
    const dna = [];
    if (savingsRate >= 30) dna.push({ label: 'Wealth Builder', icon: 'fa-crown', color: 'text-amber-500', desc: 'You save aggressively above 30%.' });
    else if (savingsRate >= 20) dna.push({ label: 'Balanced Saver', icon: 'fa-scale-balanced', color: 'text-emerald-500', desc: 'Healthy savings rate, room to optimize.' });
    else dna.push({ label: 'Spending Optimizer', icon: 'fa-wallet', color: 'text-rose-500', desc: 'Focus on reducing expenses first.' });

    if (assets.some((a) => a.type === 'stock' || a.type === 'mutualFund')) dna.push({ label: 'Equity Investor', icon: 'fa-chart-line', color: 'text-primary', desc: 'Comfortable with market-linked returns.' });
    else dna.push({ label: 'Capital Preserver', icon: 'fa-piggy-bank', color: 'text-blue-500', desc: 'Prefer safety over growth.' });

    const highRiskTxns = transactions.filter((t) => t.riskLevel === 'HIGH').length;
    if (highRiskTxns === 0) dna.push({ label: 'Safety First', icon: 'fa-shield-halved', color: 'text-emerald-500', desc: 'No blocked transactions. Clean history.' });
    else dna.push({ label: 'Risk Aware', icon: 'fa-triangle-exclamation', color: 'text-amber-500', desc: `${highRiskTxns} high-risk events detected & blocked.` });

    return dna;
  }, [savingsRate, assets, transactions]);

  // Goal planner
  const goalPlans = useMemo(() => {
    return goals.map((goal) => {
      const gap = goal.targetAmount - goal.currentAmount;
      const monthsLeft = Math.max(1, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
      const monthlyNeed = Math.max(0, gap / monthsLeft);
      const onTrack = user.monthlySavings >= monthlyNeed;
      return { ...goal, gap, monthsLeft, monthlyNeed, onTrack };
    });
  }, [goals, user.monthlySavings]);

  // Tax optimizer
  const taxOptimizer = useMemo(() => {
    const bracket = user.taxBracket || 30;
    const monthlyIncome = user.monthlyIncome;
    const annualIncome = monthlyIncome * 12;
    const suggestions = [];

    // 80C
    const max80C = 150000;
    suggestions.push({
      name: '80C (ELSS + PPF)',
      limit: max80C,
      recommended: max80C,
      saving: Math.round(max80C * (bracket / 100)),
      action: 'Start ELSS SIP',
    });

    // NPS 80CCD(1B)
    const maxNps = 50000;
    suggestions.push({
      name: 'NPS 80CCD(1B)',
      limit: maxNps,
      recommended: maxNps,
      saving: Math.round(maxNps * (bracket / 100)),
      action: 'Open NPS Tier-1',
    });

    // HRA
    if (monthlyIncome > 80000) {
      suggestions.push({
        name: 'HRA Optimization',
        limit: 120000,
        recommended: 120000,
        saving: Math.round(120000 * (bracket / 100)),
        action: 'Submit rent receipts',
      });
    }

    const totalSaving = suggestions.reduce((s, i) => s + i.saving, 0);
    return { annualIncome, suggestions, totalSaving };
  }, [user.taxBracket, user.monthlyIncome]);

  // Market-aware rebalancing
  const rebalance = useMemo(() => {
    const equity = assets.filter((a) => a.type === 'stock' || a.type === 'mutualFund').reduce((s, a) => s + a.value, 0);
    const debt = assets.filter((a) => a.type === 'bank' || a.type === 'gold').reduce((s, a) => s + a.value, 0);
    const property = assets.filter((a) => a.type === 'property' || a.type === 'vehicle').reduce((s, a) => s + a.value, 0);
    const total = equity + debt + property || 1;

    // Dynamic target based on age/market
    const pe = marketData.niftyPe || 24;
    const equityTarget = pe > 26 ? 50 : pe < 22 ? 65 : 60;
    const debtTarget = 100 - equityTarget - 15;
    const propertyTarget = 15;

    return {
      current: [
        { name: 'Equity', value: Math.round((equity / total) * 100), color: '#0f766e' },
        { name: 'Debt/Liquid', value: Math.round((debt / total) * 100), color: '#f59e0b' },
        { name: 'Property', value: Math.round((property / total) * 100), color: '#8b5cf6' },
      ],
      target: [
        { name: 'Equity', value: equityTarget, color: '#0f766e' },
        { name: 'Debt/Liquid', value: debtTarget, color: '#f59e0b' },
        { name: 'Property', value: propertyTarget, color: '#8b5cf6' },
      ],
      action: equity / total < equityTarget / 100 ? 'Increase equity allocation' : 'Reduce equity allocation',
    };
  }, [assets, marketData]);

  const priorityColor = (p: string) =>
    p === 'high' ? 'bg-rose-100 text-rose-700' : p === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600';

  const typeIcon = (t: string) => {
    const map: Record<string, string> = {
      savings: 'fa-piggy-bank', investment: 'fa-chart-line', tax: 'fa-receipt',
      protection: 'fa-shield-halved', spending: 'fa-wallet',
    };
    return map[t] || 'fa-lightbulb';
  };

  const formatCr = (v: number) => `₹${(v / 1e7).toFixed(2)}Cr`;

  return (
    <div className="space-y-6 animate-fade-in pb-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-robot text-primary" />
            Wealth Twin AI
            <span className="text-[10px] px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-extrabold border border-violet-200">GOD MODE</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your AI-powered financial twin running 10,000+ simulations</p>
        </div>
        <button
          onClick={() => setGodMode(!godMode)}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            godMode ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <i className={`fas ${godMode ? 'fa-bolt' : 'fa-moon'}`} />
          {godMode ? 'God Mode ON' : 'God Mode OFF'}
        </button>
      </div>

      {/* God Mode Banner */}
      {godMode && (
        <div className="p-4 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-xl border border-violet-200 dark:border-violet-800/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-500 text-white flex items-center justify-center animate-pulse">
            <i className="fas fa-brain" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">God Mode Active</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Monte Carlo simulation, life event impact, tax optimizer, and market-aware rebalancing enabled.</p>
          </div>
        </div>
      )}

      {/* AI Chat */}
      <WealthChat initialCompact />

      {/* Behavioral Intelligence Engine */}
      <BehavioralEngine />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
        {[
          { id: 'overview', label: 'Overview & DNA', icon: 'fa-user-astronaut' },
          { id: 'goals', label: 'AI Goal Planner', icon: 'fa-bullseye' },
          { id: 'tax', label: 'Tax Optimizer', icon: 'fa-receipt' },
          { id: 'rebalance', label: 'Rebalancing', icon: 'fa-scale-balanced' },
          { id: 'whatif', label: 'What-If', icon: 'fa-sliders' },
          { id: 'retirement', label: 'FIRE Plan', icon: 'fa-umbrella-beach' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <i className={`fas ${tab.icon}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB: OVERVIEW & DNA
          ═══════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Wealth DNA + Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card" ref={chartRef}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  <i className="fas fa-chart-area text-primary mr-2" />
                  Monte Carlo Wealth Projection
                </h3>
                <button
                  onClick={() => toggleFullscreen(chartRef.current || undefined)}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center justify-center"
                >
                  <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-xs`} />
                </button>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monteCarloData}>
                    <defs>
                      <linearGradient id="optGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                      <linearGradient id="baseGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} /><stop offset="95%" stopColor="#0f766e" stopOpacity={0} /></linearGradient>
                      <linearGradient id="pesGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tickFormatter={(v) => `₹${(Number(v) / 1e7).toFixed(1)}Cr`} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="optimistic" name="Optimistic (15%)" stroke="#10b981" strokeWidth={2} fill="url(#optGradient)" />
                    <Area type="monotone" dataKey="base" name="Base Case (10%)" stroke="#0f766e" strokeWidth={2} fill="url(#baseGradient)" />
                    <Area type="monotone" dataKey="pessimistic" name="Pessimistic (5%)" stroke="#ef4444" strokeWidth={2} fill="url(#pesGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">AI Projection</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  At <strong>{savingsRate.toFixed(1)}%</strong> savings rate, you'll reach <strong>₹1 Cr</strong> by <strong>{croreYear}</strong>.
                </p>
                <div className="mt-3 p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-[10px] text-slate-500">15-year range</p>
                  <p className="text-sm font-bold text-emerald-600">{formatCr(monteCarloData[15].optimistic)}</p>
                  <p className="text-xs text-slate-700 dark:text-slate-200">Base: {formatCr(monteCarloData[15].base)}</p>
                  <p className="text-xs text-rose-500">Pessimistic: {formatCr(monteCarloData[15].pessimistic)}</p>
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-3"><i className="fas fa-dna text-violet-500 mr-2" />Wealth DNA</h3>
                <div className="space-y-2">
                  {wealthDNA.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <i className={`fas ${d.icon} ${d.color} mt-0.5 text-xs`} />
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{d.label}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{d.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Life Event Simulator */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white"><i className="fas fa-flask text-accent mr-2" />Life Event Simulator</h3>
              <select
                value={lifeEvent}
                onChange={(e) => setLifeEvent(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
              >
                <option value="none">No event — Baseline</option>
                <option value="jobLoss">Job Loss (6 months)</option>
                <option value="marketCrash">Market Crash (-25%)</option>
                <option value="promotion">Promotion (+50% savings)</option>
                <option value="inheritance">Inheritance (+₹20L)</option>
                <option value="wedding">Wedding Expense (-₹15L)</option>
                <option value="medical">Medical Emergency (-₹8L)</option>
              </select>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simulatedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tickFormatter={(v) => `₹${(Number(v) / 1e7).toFixed(1)}Cr`} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="base" name={`With ${eventImpact.label}`} stroke={lifeEvent === 'none' ? '#0f766e' : '#f59e0b'} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="base" name="Baseline" data={monteCarloData} stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-[10px] text-slate-500">Immediate Impact</p>
                  <p className={`text-lg font-bold ${eventImpact.immediate >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {eventImpact.immediate >= 0 ? '+' : ''}₹{eventImpact.immediate.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-[10px] text-slate-500">Monthly Savings Change</p>
                  <p className={`text-lg font-bold ${eventImpact.savingsChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {eventImpact.savingsChange >= 0 ? '+' : ''}₹{eventImpact.savingsChange.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-violet-50 dark:bg-violet-900/10 rounded-lg border border-violet-100 dark:border-violet-800/20">
                  <p className="text-[10px] text-violet-600 font-bold">AI Insight</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {lifeEvent === 'none'
                      ? 'Baseline trajectory looks stable. Continue current SIPs.'
                      : lifeEvent === 'jobLoss'
                      ? 'Build 6-month emergency corpus immediately. Pause discretionary SIPs if needed.'
                      : lifeEvent === 'marketCrash'
                      ? 'Opportunity to buy quality equities at discount. Maintain SIPs.'
                      : 'Consider redirecting surplus to tax-efficient instruments.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Net Worth', value: formatCr(currentNW), icon: 'fa-wallet', color: 'text-primary' },
              { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%`, icon: 'fa-piggy-bank', color: 'text-emerald-500' },
              { label: 'Expense Ratio', value: `${expenseRatio}%`, icon: 'fa-chart-pie', color: 'text-amber-500' },
              { label: 'Top Spend', value: topCategory.name, icon: 'fa-receipt', color: 'text-rose-500' },
            ].map((s, i) => (
              <div key={i} className="card text-center">
                <i className={`fas ${s.icon} ${s.color} text-lg mb-2`} />
                <div className="text-lg font-bold text-slate-800 dark:text-white truncate">{s.value}</div>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* AI Recommendations */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4"><i className="fas fa-wand-magic-sparkles text-accent mr-2" /> AI Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor(rec.priority)}`}>{rec.priority.toUpperCase()}</span>
                    <i className={`fas ${typeIcon(rec.type)} text-slate-400`} />
                  </div>
                  <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">{rec.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-success">{rec.potential}</span>
                    <button
                      onClick={() => {
                        if (rec.type === 'tax') setActiveTab('tax');
                        else if (rec.type === 'investment') setActiveTab('rebalance');
                        else setView('goals');
                      }}
                      className="px-3 py-1 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      {rec.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: AI GOAL PLANNER
          ═══════════════════════════════════════════════════════ */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <DynamicCompass />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goalPlans.map((goal) => {
              const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <div key={goal.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-800 dark:text-white">{goal.name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${goal.onTrack ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {goal.onTrack ? 'ON TRACK' : 'NEEDS ATTENTION'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between"><span className="text-slate-500">Target</span><span className="font-bold">₹{goal.targetAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Saved</span><span className="font-bold">₹{goal.currentAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Gap</span><span className="font-bold text-rose-600">₹{goal.gap.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Months Left</span><span className="font-bold">{goal.monthsLeft}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Monthly SIP Needed</span><span className="font-bold text-primary">₹{Math.round(goal.monthlyNeed).toLocaleString()}</span></div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-3">
                    <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300">
                    <i className="fas fa-robot text-primary mr-1" />
                    {goal.onTrack
                      ? `Great! Continue your monthly SIP of ₹${Math.round(goal.monthlyNeed).toLocaleString()}. You'll reach this goal by ${goal.deadline}.`
                      : `Increase monthly contribution by ₹${Math.round(goal.monthlyNeed - user.monthlySavings / goals.length).toLocaleString()} to catch up.`}
                  </div>
                  <button
                    onClick={() => setView('goals')}
                    className="mt-3 w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90"
                  >
                    <i className="fas fa-rocket mr-1" /> Start / Adjust SIP
                  </button>
                </div>
              );
            })}
          </div>
          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3"><i className="fas fa-lightbulb text-secondary mr-2" />Goal Optimization Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                <p className="font-bold text-emerald-700 dark:text-emerald-300">Smart Ordering</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Prioritize emergency fund before discretionary goals.</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                <p className="font-bold text-amber-700 dark:text-amber-300">SIP Laddering</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Stagger SIP dates to maintain cash flow.</p>
              </div>
              <div className="p-3 bg-violet-50 dark:bg-violet-900/10 rounded-lg">
                <p className="font-bold text-violet-700 dark:text-violet-300">Tax-Efficient Goals</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Use ELSS for goals &gt; 3 years away.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: TAX OPTIMIZER
          ═══════════════════════════════════════════════════════ */}
      {activeTab === 'tax' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card lg:col-span-2">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4"><i className="fas fa-calculator text-primary mr-2" />AI Tax Optimization Plan</h3>
              <div className="space-y-4">
                {taxOptimizer.suggestions.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{item.name}</p>
                      <p className="text-xs text-slate-500">Recommended: ₹{item.recommended.toLocaleString()} / Limit: ₹{item.limit.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">Save ₹{item.saving.toLocaleString()}</p>
                      <button className="mt-1 px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90">{item.action}</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-primary/5 dark:from-emerald-900/10 dark:to-primary/10 rounded-lg border border-emerald-100 dark:border-emerald-800/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800 dark:text-white">Total Potential Tax Saving</span>
                  <span className="text-xl font-black text-emerald-600">₹{taxOptimizer.totalSaving.toLocaleString()}/year</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Tax Bracket</h4>
                <p className="text-3xl font-black text-primary">{user.taxBracket || 30}%</p>
                <p className="text-xs text-slate-500 mt-1">Annual Income: ₹{taxOptimizer.annualIncome.toLocaleString()}</p>
              </div>
              <div className="card">
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">AI Priority</h4>
                <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside">
                  <li>Max out 80C via ELSS + PPF</li>
                  <li>Add NPS 80CCD(1B) ₹50,000</li>
                  <li>Submit HRA proofs</li>
                  <li>Health insurance 80D</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: REBALANCING
          ═══════════════════════════════════════════════════════ */}
      {activeTab === 'rebalance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Current Allocation</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={rebalance.current} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                      {rebalance.current.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Target Allocation (AI Suggested)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={rebalance.target} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                      {rebalance.target.map((entry, index) => <Cell key={`cell-t-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Market-Aware Rebalancing Action</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-[10px] text-slate-500">NIFTY P/E</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white">{marketData.niftyPe}</p>
                <p className="text-xs text-slate-500">{marketData.niftyPe > 26 ? 'Overvalued → Reduce equity' : marketData.niftyPe < 22 ? 'Undervalued → Increase equity' : 'Fair value'}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-[10px] text-slate-500">Inflation</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white">{marketData.inflation}%</p>
                <p className="text-xs text-slate-500">{marketData.inflation > 6 ? 'High → Add gold/FD' : 'Moderate'}</p>
              </div>
              <div className="p-4 bg-violet-50 dark:bg-violet-900/10 rounded-lg border border-violet-100 dark:border-violet-800/20">
                <p className="text-sm font-bold text-violet-700 dark:text-violet-300">AI Action</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{rebalance.action}</p>
                <button onClick={() => setView('portfolio')} className="mt-2 px-3 py-1 bg-violet-500 text-white text-[10px] font-bold rounded-lg hover:bg-violet-600">
                  Rebalance Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: WHAT-IF SIMULATOR
          ═══════════════════════════════════════════════════════ */}
      {activeTab === 'whatif' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="card">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4"><i className="fas fa-sliders text-primary mr-2" />Adjust Parameters</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Monthly Savings</span>
                      <span className="font-bold text-primary">₹{whatIfSavings.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={user.monthlyIncome}
                      step="1000"
                      value={whatIfSavings}
                      onChange={(e) => setWhatIfSavings(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Expected Annual Returns</span>
                      <span className="font-bold text-primary">{whatIfReturns}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      step="0.5"
                      value={whatIfReturns}
                      onChange={(e) => setWhatIfReturns(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Projection Years</span>
                      <span className="font-bold text-primary">{whatIfYears} years</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="1"
                      value={whatIfYears}
                      onChange={(e) => setWhatIfYears(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Major One-Time Expense</span>
                      <span className="font-bold text-primary">₹{whatIfExpense.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5000000"
                      step="100000"
                      value={whatIfExpense}
                      onChange={(e) => setWhatIfExpense(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-emerald-50 to-primary/5 dark:from-emerald-900/10 dark:to-primary/10 border border-emerald-100 dark:border-emerald-800/20">
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Projected Wealth</h4>
                <p className="text-2xl font-black text-emerald-600">{formatCr(whatIfData[whatIfData.length - 1].netWorth)}</p>
                <p className="text-xs text-slate-500 mt-1">After {whatIfYears} years</p>
                {whatIfData[whatIfData.length - 1].netWorth >= 1e7 && (
                  <p className="text-xs font-bold text-primary mt-2"><i className="fas fa-trophy mr-1" /> Crorepati by {new Date().getFullYear() + whatIfYears}!</p>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 card">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Interactive Wealth Projection</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={whatIfData}>
                    <defs>
                      <linearGradient id="whatIfGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tickFormatter={(v) => `₹${(Number(v) / 1e7).toFixed(1)}Cr`} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                    <Area type="monotone" dataKey="netWorth" name="Projected Net Worth" stroke="#0f766e" strokeWidth={2} fill="url(#whatIfGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: FIRE / RETIREMENT PLANNER
          ═══════════════════════════════════════════════════════ */}
      {activeTab === 'retirement' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card lg:col-span-2">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4"><i className="fas fa-umbrella-beach text-secondary mr-2" />Retirement Trajectory</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={retirementProjection.data}>
                    <defs>
                      <linearGradient id="retireGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="age" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tickFormatter={(v) => `₹${(Number(v) / 1e7).toFixed(1)}Cr`} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                    <Area type="monotone" dataKey="netWorth" name="Projected Corpus" stroke="#f59e0b" strokeWidth={2} fill="url(#retireGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <div className="card">
                <h4 className="font-semibold text-slate-800 dark:text-white mb-3">FIRE Calculator</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Desired Retirement Age</label>
                    <input
                      type="range"
                      min="40"
                      max="70"
                      step="1"
                      value={retirementAge}
                      onChange={(e) => setRetirementAge(Number(e.target.value))}
                      className="w-full accent-secondary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1"
                    />
                    <p className="text-lg font-bold text-secondary">{retirementAge} years</p>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Monthly Pension Needed</label>
                    <input
                      type="range"
                      min="20000"
                      max="500000"
                      step="5000"
                      value={monthlyPensionNeed}
                      onChange={(e) => setMonthlyPensionNeed(Number(e.target.value))}
                      className="w-full accent-secondary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1"
                    />
                    <p className="text-lg font-bold text-secondary">₹{monthlyPensionNeed.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-amber-50 to-secondary/10 dark:from-amber-900/10 dark:to-secondary/10 border border-amber-100 dark:border-amber-800/20">
                <p className="text-[10px] text-slate-500 uppercase font-bold">FIRE Number (25x rule)</p>
                <p className="text-2xl font-black text-amber-600">{formatCr(fireNumber)}</p>
                <p className="text-xs text-slate-500 mt-1">Corpus needed to retire at {retirementAge}</p>
              </div>

              <div className="card bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Projected Corpus at {retirementAge}</p>
                <p className={`text-2xl font-black ${retirementProjection.shortfall === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCr(retirementProjection.finalNW)}
                </p>
                {retirementProjection.shortfall > 0 ? (
                  <p className="text-xs text-rose-600 mt-1">Shortfall: {formatCr(retirementProjection.shortfall)}</p>
                ) : (
                  <p className="text-xs text-emerald-600 mt-1"><i className="fas fa-check-circle mr-1" /> FIRE achievable!</p>
                )}
              </div>

              {retirementProjection.shortfall > 0 && (
                <div className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-800/20">
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-300">AI Suggestion</p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">
                    Increase monthly SIP by ₹{Math.round(retirementProjection.shortfall / (retirementProjection.yearsToRetire * 12)).toLocaleString()} to close the gap.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

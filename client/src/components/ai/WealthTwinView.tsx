import { useRef } from 'react';
import { useWealthStore } from '../../store/wealthStore';
import { useRecommendationEngine } from '../../hooks/useRecommendationEngine';
import { useFullscreen } from '../../hooks/useFullscreen';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import WealthChat from './WealthChat';

const SPEND_COLORS = ['#0f766e', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

function aggregateSpending(transactions: { category: string; amount: number; type: string }[]) {
  const cats = new Map<string, number>();
  transactions.filter((t) => t.type === 'debit').forEach((t) => {
    cats.set(t.category, (cats.get(t.category) || 0) + t.amount);
  });
  return Array.from(cats.entries()).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
}

function monthlySpendingHistory(transactions: { amount: number; type: string; date: string }[]) {
  const months = new Map<string, number>();
  transactions.filter((t) => t.type === 'debit').forEach((t) => {
    const key = t.date.slice(0, 7); // YYYY-MM
    months.set(key, (months.get(key) || 0) + t.amount);
  });
  return Array.from(months.entries()).sort().slice(-12).map(([, amount]) => amount);
}

function generateProjectionData(currentNW: number, monthlySavings: number, rate: number) {
  const data = [];
  const year = new Date().getFullYear();
  let nw = currentNW;
  const monthlyRate = rate / 100 / 12;
  for (let y = 0; y <= 10; y++) {
    data.push({ year: year + y, netWorth: Math.round(nw) });
    for (let m = 0; m < 12; m++) {
      nw = nw * (1 + monthlyRate) + monthlySavings;
    }
  }
  return data;
}



export default function WealthTwinView() {
  const user = useWealthStore((s) => s.user);
  const goals = useWealthStore((s) => s.goals);
  const assets = useWealthStore((s) => s.assets);
  const marketData = useWealthStore((s) => s.marketData);
  const recommendations = useRecommendationEngine(user, marketData);

  const transactions = useWealthStore((s) => s.transactions);
  const currentNW = assets.reduce((sum, a) => sum + a.value, 0);
  const projectionData = generateProjectionData(currentNW, user.monthlySavings, 10);
  const savingsRate = ((user.monthlySavings / user.monthlyIncome) * 100).toFixed(1);
  const croreYear = projectionData.find((d) => d.netWorth >= 1e7)?.year || 2035;

  const { toggle: toggleFullscreen, isFullscreen } = useFullscreen();
  const chartRef = useRef<HTMLDivElement>(null);

  const categorySpending = aggregateSpending(transactions);
  const spendingHistory = monthlySpendingHistory(transactions);
  const totalExpenses = categorySpending.reduce((sum, c) => sum + c.amount, 0) || user.monthlyExpenses;
  const topCategory = categorySpending[0] || { name: 'No data', amount: 0 };
  const avgMonthly = spendingHistory.length > 0 ? Math.round(spendingHistory.reduce((a, b) => a + b, 0) / spendingHistory.length) : user.monthlyExpenses;
  const trend = spendingHistory.length > 1 && spendingHistory[spendingHistory.length - 1] > avgMonthly ? 'increasing' : 'stable';
  const expenseRatio = (totalExpenses / user.monthlyIncome * 100).toFixed(1);

  const insights = [
    `Your highest expense is ${topCategory.name} at ₹${topCategory.amount.toLocaleString()}/month`,
    trend === 'increasing' ? 'Spending trend is rising. Consider setting category budgets.' : 'Spending is stable. Good financial discipline!',
    `You spend ${expenseRatio}% of your income on expenses`,
  ];



  const priorityColor = (p: string) =>
    p === 'high' ? 'bg-rose-100 text-rose-700' : p === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600';

  const typeIcon = (t: string) => {
    const map: Record<string, string> = {
      savings: 'fa-piggy-bank', investment: 'fa-chart-line', tax: 'fa-receipt',
      protection: 'fa-shield-halved', spending: 'fa-wallet',
    };
    return map[t] || 'fa-lightbulb';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Wealth Twin</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered projection of your financial future</p>
        </div>
        <div className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
          <i className="fas fa-robot mr-1" />AI Active
        </div>
      </div>

      {/* Wealth Twin AI — Explainable Chat (Compact Popup → Fullscreen) */}
      <WealthChat initialCompact />

      {/* Chart + Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div ref={chartRef} className={`lg:col-span-2 card ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-950 p-6 overflow-auto' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white">Net Worth Projection</h3>
            <button
              onClick={() => toggleFullscreen(chartRef.current || undefined)}
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-xs`} />
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tickFormatter={(v) => `₹${(Number(v) / 1e7).toFixed(1)}Cr`} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                <Area type="monotone" dataKey="netWorth" stroke="#0f766e" strokeWidth={2} fill="url(#nwGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Current Snapshot</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Total Net Worth</span><span className="font-bold text-slate-800 dark:text-white">₹{(currentNW / 1e5).toFixed(1)}L</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Liquid Assets</span><span className="font-bold text-slate-800 dark:text-white">₹{(assets.filter(a => a.liquidity === 'high').reduce((s, a) => s + a.value, 0) / 1e5).toFixed(1)}L</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Investments</span><span className="font-bold text-slate-800 dark:text-white">₹{(assets.filter(a => ['stock', 'mutualFund'].includes(a.type)).reduce((s, a) => s + a.value, 0) / 1e5).toFixed(1)}L</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Physical Assets</span><span className="font-bold text-slate-800 dark:text-white">₹{(assets.filter(a => ['property', 'gold', 'vehicle'].includes(a.type)).reduce((s, a) => s + a.value, 0) / 1e5).toFixed(1)}L</span></div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
            <h4 className="font-semibold text-slate-800 dark:text-white mb-2">AI Projection</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">At your current savings rate of <strong>{savingsRate}%</strong>, you'll reach <strong>₹1 Cr</strong> by <strong>{croreYear}</strong>.</p>
            <button onClick={() => useWealthStore.getState().setView('goals')} className="mt-3 px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary/90">Adjust Goals</button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary">₹{(user.monthlyIncome / 1e5).toFixed(1)}L</div>
          <p className="text-xs text-slate-500 mt-1">Monthly Income</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-success">₹{user.monthlySavings.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1">Monthly Savings</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-accent">₹{user.monthlyExpenses.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1">Monthly Expenses</p>
        </div>
      </div>

      {/* Spending Intelligence + Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4"><i className="fas fa-chart-pie text-primary mr-2" /> Spending Intelligence</h3>
          <div className="space-y-3 mb-4">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{insight}</p>
              </div>
            ))}
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categorySpending.slice(0, 6)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="amount">
                  {categorySpending.slice(0, 6).map((_, i) => (
                    <Cell key={`cell-${i}`} fill={SPEND_COLORS[i % SPEND_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-lg">
            <p className="text-sm font-medium text-accent"><i className="fas fa-lightbulb mr-2" /> AI Insight</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Your entertainment spending is 14% higher than similar income profiles. Consider setting a weekly budget of ₹2,000.</p>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4"><i className="fas fa-rocket text-secondary mr-2" /> Future Projections</h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">1 Year Projection</span>
                <span className="text-lg font-bold text-primary">₹{(user.monthlySavings * 12 * 1.1 / 1e5).toFixed(1)}L</span>
              </div>
              <div className="progress-bar"><div className="progress-bar-fill bg-primary" style={{ width: '35%' }} /></div>
              <p className="text-xs text-slate-400 mt-1">At current savings rate + 10% returns</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">5 Year Projection</span>
                <span className="text-lg font-bold text-secondary">₹{(user.monthlySavings * 60 * Math.pow(1.1, 5) / 1e5).toFixed(1)}L</span>
              </div>
              <div className="progress-bar"><div className="progress-bar-fill bg-secondary" style={{ width: '55%' }} /></div>
              <p className="text-xs text-slate-400 mt-1">Compound growth with consistent SIPs</p>
            </div>
            <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
              <p className="text-sm font-medium text-success"><i className="fas fa-star mr-2" />AI Recommendation</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Increase your monthly SIP by ₹2,000 to reach your home goal 8 months earlier.</p>
            </div>
          </div>
        </div>
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
                <button className="px-3 py-1 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 transition-colors">{rec.action}</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goal Timeline */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Goal Timeline</h3>
        <div className="space-y-4">
          {goals.map((goal) => {
            const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            return (
              <div key={goal.id} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-slate-700 dark:text-slate-300">{goal.name}</div>
                <div className="flex-1 progress-bar"><div className="progress-bar-fill gradient-primary" style={{ width: `${pct}%` }} /></div>
                <div className="w-20 text-right text-xs text-slate-500">{pct.toFixed(0)}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

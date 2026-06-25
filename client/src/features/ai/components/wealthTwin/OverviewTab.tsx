import { useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useFullscreen } from '@/shared/hooks/useFullscreen';
import { useTwinContext } from './WealthTwinContext';
import {
  AreaChart as AreaChartIcon,
  Maximize2,
  Minimize2,
  Dna,
  FlaskConical,
  Wallet,
  PiggyBank,
  PieChart as PieChartIcon,
  Receipt,
  Wand2,
  Lightbulb,
  TrendingUp,
  ShieldCheck,
  Crown,
  Scale,
  AlertTriangle
} from 'lucide-react';

const priorityColor = (p: string) =>
  p === 'high' ? 'bg-rose-100 text-rose-700' : p === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600';

const typeIcons: Record<string, React.ElementType> = {
  savings: PiggyBank,
  investment: TrendingUp,
  tax: Receipt,
  protection: ShieldCheck,
  spending: Wallet,
};

function TypeIcon({ type }: { type: string }) {
  const Icon = typeIcons[type] || Lightbulb;
  return <Icon className="w-4 h-4 text-slate-400" />;
}

export default function OverviewTab() {
  const {
    currentNW,
    savingsRate,
    expenseRatio,
    topCategory,
    monteCarloData,
    croreYear,
    lifeEvent,
    setLifeEvent,
    eventImpact,
    simulatedData,
    wealthDNA,
    recommendations,
    setView,
    setActiveTab,
    formatCr,
  } = useTwinContext();

  const { toggle: toggleFullscreen, isFullscreen } = useFullscreen();
  const chartRef = useRef<HTMLDivElement>(null);

  const statItems = [
    { label: 'Net Worth', value: formatCr(currentNW), icon: Wallet, color: 'text-primary' },
    { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%`, icon: PiggyBank, color: 'text-emerald-500' },
    { label: 'Expense Ratio', value: `${expenseRatio}%`, icon: PieChartIcon, color: 'text-amber-500' },
    { label: 'Top Spend', value: topCategory.name, icon: Receipt, color: 'text-rose-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card" ref={chartRef}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <AreaChartIcon className="w-5 h-5 text-primary" />
              Monte Carlo Wealth Projection
            </h3>
            <button
              onClick={() => toggleFullscreen(chartRef.current || undefined)}
              aria-label={isFullscreen ? 'Exit fullscreen chart' : 'Open chart fullscreen'}
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center justify-center"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
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
              At <strong>{savingsRate.toFixed(1)}%</strong> savings rate, you will reach <strong>₹1 Cr</strong> by <strong>{croreYear}</strong>.
            </p>
            <div className="mt-3 p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-[10px] text-slate-500">15-year range</p>
              <p className="text-sm font-bold text-emerald-600">{formatCr(monteCarloData[15].optimistic)}</p>
              <p className="text-xs text-slate-700 dark:text-slate-200">Base: {formatCr(monteCarloData[15].base)}</p>
              <p className="text-xs text-rose-500">Pessimistic: {formatCr(monteCarloData[15].pessimistic)}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <Dna className="w-5 h-5 text-violet-500" />
              Wealth DNA
            </h3>
            <div className="space-y-2">
              {wealthDNA.map((d: { label: string; icon: string; color: string; desc: string }, i: number) => {
                const iconMap: Record<string, React.ElementType> = {
                  'fa-crown': Crown,
                  'fa-scale-balanced': Scale,
                  'fa-wallet': Wallet,
                  'fa-chart-line': TrendingUp,
                  'fa-piggy-bank': PiggyBank,
                  'fa-shield-halved': ShieldCheck,
                  'fa-triangle-exclamation': AlertTriangle,
                };
                const Icon = iconMap[d.icon] || Lightbulb;
                return (
                  <div key={i} className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Icon className={`w-4 h-4 ${d.color} mt-0.5 shrink-0`} />
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{d.label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{d.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Life Event Simulator */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-accent" />
            Life Event Simulator
          </h3>
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
        {statItems.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card text-center">
              <Icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
              <div className="text-lg font-bold text-slate-800 dark:text-white truncate">{s.value}</div>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* AI Recommendations */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-accent" />
          AI Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor(rec.priority)}`}>{rec.priority.toUpperCase()}</span>
                <TypeIcon type={rec.type} />
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
  );
}

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import DashboardWidget from '@/features/dashboard/components/DashboardWidget';
import CosmosCard from '@/shared/components/ui/CosmosCard';
import EmptyState from '@/shared/components/EmptyState';
import ESGScore from '@/features/portfolio/components/ESGScore';
import {
  PieChart as PieChartIcon,
  TrendingUp,
  RotateCw,
  Percent,
  Landmark,
  ArrowLeft,
  Lightbulb,
  SlidersHorizontal
} from 'lucide-react';

const COLORS = ['#0f766e', '#14b8a6', '#f59e0b', '#8b5cf6', '#64748b'];

const TYPE_META: Record<string, { label: string; returns: number; benchmark: number }> = {
  equity: { label: 'Equity', returns: 12.4, benchmark: 12.5 },
  debt: { label: 'Debt', returns: 3.5, benchmark: 3.2 },
  gold: { label: 'Gold', returns: 8.1, benchmark: 7.8 },
  realEstate: { label: 'Real Estate', returns: 7.0, benchmark: 7.0 },
  other: { label: 'Other', returns: 0, benchmark: 0 },
};

function assetToCategory(asset: { type: string }) {
  if (asset.type === 'stock' || asset.type === 'mutualFund') return 'equity';
  if (asset.type === 'bank') return 'debt';
  if (asset.type === 'gold') return 'gold';
  if (asset.type === 'property') return 'realEstate';
  return 'other';
}

export default function PortfolioView() {
  const assets = useWealthStore((s) => s.assets);
  const goals = useWealthStore((s) => s.goals);
  const setView = useWealthStore((s) => s.setView);
  const [showRebalance, setShowRebalance] = useState(false);

  const totalValue = assets.reduce((s, a) => s + a.value, 0);

  const allocation = useMemo(
    () =>
      [
        { name: 'Equity', value: assets.filter((a) => assetToCategory(a) === 'equity').reduce((s, a) => s + a.value, 0), ideal: 50 },
        { name: 'Debt', value: assets.filter((a) => assetToCategory(a) === 'debt').reduce((s, a) => s + a.value, 0), ideal: 25 },
        { name: 'Gold', value: assets.filter((a) => assetToCategory(a) === 'gold').reduce((s, a) => s + a.value, 0), ideal: 10 },
        { name: 'Real Estate', value: assets.filter((a) => assetToCategory(a) === 'realEstate').reduce((s, a) => s + a.value, 0), ideal: 10 },
        { name: 'Other', value: assets.filter((a) => assetToCategory(a) === 'other').reduce((s, a) => s + a.value, 0), ideal: 5 },
      ]
        .filter((d) => d.value > 0)
        .map((d) => ({ ...d, pct: totalValue > 0 ? Math.round((d.value / totalValue) * 100) : 0 })),
    [assets, totalValue]
  );

  const holdings = useMemo(
    () =>
      assets.map((a) => {
        const category = assetToCategory(a);
        const meta = TYPE_META[category];
        return {
          name: a.name,
          type: category,
          typeLabel: meta.label,
          value: a.value,
          returns: meta.returns,
          benchmark: meta.benchmark,
        };
      }),
    [assets]
  );

  const sips = useMemo(() => {
    const now = new Date();
    return goals.map((g) => {
      const monthsLeft = Math.max(1, Math.ceil((new Date(g.deadline).getTime() - now.getTime()) / (30 * 24 * 60 * 60 * 1000)));
      const monthly = Math.max(0, Math.round((g.targetAmount - g.currentAmount) / monthsLeft));
      const next = new Date();
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      return {
        id: g.id,
        name: `${g.name} SIP`,
        amount: monthly,
        frequency: 'Monthly',
        status: 'Active',
        nextDate: next.toISOString().split('T')[0],
      };
    }).filter((s) => s.amount > 0);
  }, [goals]);

  const benchmarkData = holdings.map((h) => ({
    name: h.name.split(' ').slice(0, 2).join(' '),
    portfolio: h.returns,
    benchmark: h.benchmark,
  }));

  const activeSipCount = sips.length;

  const headerStats = [
    { label: 'Portfolio Value', value: totalValue > 0 ? `₹${(totalValue / 1e5).toFixed(1)}L` : '—', icon: PieChartIcon, color: 'text-primary' },
    { label: 'Total Returns', value: '+12.4%', icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Active SIPs', value: String(activeSipCount), icon: RotateCw, color: 'text-secondary' },
    { label: 'XIRR', value: '14.2%', icon: Percent, color: 'text-accent' },
  ];

  if (assets.length === 0) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <PieChartIcon className="w-6 h-6 text-primary" />
                Portfolio
              </h1>
              <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-extrabold border border-primary/20">
                LIVE HOLDINGS
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track allocation, SIPs, performance vs benchmark, and ESG alignment.
            </p>
          </div>
        </div>
        <EmptyState
          icon={Landmark}
          title="No portfolio data yet"
          subtitle="Link an account or add a manual asset to see your allocation, SIPs, and performance."
          action={{ label: 'Go to Assets', onClick: () => setView('assets') }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <PieChartIcon className="w-6 h-6 text-primary" />
              Portfolio
            </h1>
            <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-extrabold border border-primary/20">
              LIVE HOLDINGS
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track allocation, SIPs, performance vs benchmark, and ESG alignment.
          </p>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {headerStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <CosmosCard variant="stat" padding="md" hover>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</span>
                </div>
                <p className="text-xl font-extrabold text-slate-800 dark:text-white">{s.value}</p>
              </CosmosCard>
            </motion.div>
          );
        })}
      </div>

      {/* Allocation + Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <DashboardWidget title="Asset Allocation" icon="fa-chart-pie" subtitle="Current vs Ideal" className="lg:col-span-1">
          {allocation.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No allocation data available.</p>
          ) : (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocation} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {allocation.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `₹${(Number(val) / 1e5).toFixed(1)}L`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-2">
                {allocation.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-600 dark:text-slate-400 text-xs">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-8 text-right">{d.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DashboardWidget>

        <DashboardWidget title="Performance vs Benchmark" icon="fa-scale-balanced" subtitle="Trailing 1 year returns" className="lg:col-span-2">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarkData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip formatter={(val) => `${Number(val)}%`} />
                <Bar dataKey="portfolio" name="Your Portfolio" fill="#0f766e" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="benchmark" name="Benchmark" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardWidget>
      </div>

      {/* SIPs */}
      <DashboardWidget
        title="Active SIPs"
        icon="fa-rotate"
        subtitle={`${activeSipCount} recurring investment${activeSipCount === 1 ? '' : 's'}`}
        action={
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
            {activeSipCount} Active
          </span>
        }
      >
        {sips.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No active SIPs. Add a goal to generate a monthly SIP plan.</p>
        ) : (
          <div className="space-y-3">
            {sips.map((sip, i) => (
              <motion.div
                key={sip.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                    <RotateCw className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{sip.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Next: {new Date(sip.nextDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 dark:text-white">₹{sip.amount.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{sip.frequency}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold">{sip.status}</span>
              </motion.div>
            ))}
          </div>
        )}
      </DashboardWidget>

      {/* Holdings Table + ESG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <DashboardWidget title="Investment Holdings" icon="fa-list" subtitle={`${holdings.length} asset${holdings.length === 1 ? '' : 's'} tracked`} className="lg:col-span-2">
          <div className="overflow-x-auto -mx-4 -my-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  <th className="pb-3 font-medium text-xs px-5 pt-4">Asset</th>
                  <th className="pb-3 font-medium text-xs pt-4">Type</th>
                  <th className="pb-3 font-medium text-xs text-right pt-4">Value</th>
                  <th className="pb-3 font-medium text-xs text-right pt-4">Returns</th>
                  <th className="pb-3 font-medium text-xs text-right pt-4">vs Benchmark</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <tr key={h.name} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-800 dark:text-white">{h.name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${h.type === 'equity' ? 'bg-primary/10 text-primary' : h.type === 'gold' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-secondary/10 text-secondary'}`}>
                        {h.typeLabel}
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium text-slate-700 dark:text-slate-300">₹{h.value.toLocaleString()}</td>
                    <td className="py-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">+{h.returns}%</td>
                    <td className="py-3 text-right">
                      <span className={`text-xs font-bold ${h.returns > h.benchmark ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {h.returns > h.benchmark ? '+' : ''}{(h.returns - h.benchmark).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardWidget>
        <ESGScore />
      </div>

      {/* Rebalancing Simulator */}
      <DashboardWidget
        title="Rebalancing Simulator"
        icon="fa-sliders"
        subtitle="Align your portfolio with ideal allocation"
        action={
          <button
            onClick={() => setShowRebalance(!showRebalance)}
            className="text-[10px] font-bold px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-1"
          >
            {showRebalance ? <ArrowLeft className="w-3 h-3" /> : <SlidersHorizontal className="w-3 h-3" />}
            {showRebalance ? 'Hide' : 'Show'} Simulation
          </button>
        }
      >
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Compare current allocation with recommended targets</p>
        {showRebalance && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
            {allocation.map((d, i) => {
              const diff = d.pct - d.ideal;
              return (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-20 text-xs font-bold text-slate-600 dark:text-slate-400">{d.name}</div>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${d.ideal}%`, background: 'rgba(148,163,184,0.3)' }} />
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: COLORS[i % COLORS.length] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${d.pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{d.pct}%</span>
                    <span className={`text-[10px] ml-1 ${diff > 5 ? 'text-rose-500' : diff < -5 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      ({diff > 0 ? '+' : ''}{diff}%)
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="mt-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/10">
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Recommendation:</strong> Consider increasing equity allocation by ₹{(totalValue * 0.05 / 1e5).toFixed(1)}L to reach your target 50% allocation.
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </DashboardWidget>
    </div>
  );
}

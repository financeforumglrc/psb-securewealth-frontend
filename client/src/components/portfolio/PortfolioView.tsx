import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import CosmosCard, { CosmosBadge } from '../ui/CosmosCard';
import ESGScore from './ESGScore';

const COLORS = ['#0f766e', '#14b8a6', '#f59e0b', '#8b5cf6', '#64748b'];

export default function PortfolioView() {
  const assets = useWealthStore((s) => s.assets);
  const [showRebalance, setShowRebalance] = useState(false);

  const totalValue = assets.reduce((s, a) => s + a.value, 0);

  const allocation = useMemo(() => [
    { name: 'Equity', value: assets.filter((a) => a.type === 'stock' || a.type === 'mutualFund').reduce((s, a) => s + a.value, 0), ideal: 50 },
    { name: 'Debt', value: assets.filter((a) => a.type === 'bank').reduce((s, a) => s + a.value, 0), ideal: 25 },
    { name: 'Gold', value: assets.filter((a) => a.type === 'gold').reduce((s, a) => s + a.value, 0), ideal: 10 },
    { name: 'Real Estate', value: assets.filter((a) => a.type === 'property').reduce((s, a) => s + a.value, 0), ideal: 10 },
    { name: 'Other', value: assets.filter((a) => a.type === 'vehicle' || a.type === 'other').reduce((s, a) => s + a.value, 0), ideal: 5 },
  ].filter((d) => d.value > 0).map(d => ({ ...d, pct: totalValue > 0 ? Math.round((d.value / totalValue) * 100) : 0 })), [assets, totalValue]);

  const sips = [
    { name: 'Axis Bluechip SIP', amount: 15000, frequency: 'Monthly', status: 'Active', startDate: '2024-01-15', nextDate: '2024-12-15' },
    { name: 'Nifty 50 Index SIP', amount: 10000, frequency: 'Monthly', status: 'Active', startDate: '2024-03-01', nextDate: '2024-12-01' },
    { name: 'PPF Contribution', amount: 12500, frequency: 'Monthly', status: 'Active', startDate: '2023-04-01', nextDate: '2024-12-05' },
  ];

  const holdings = [
    { name: 'Axis Bluechip Fund', type: 'equity', value: 280000, returns: 14.2, benchmark: 12.5 },
    { name: 'Nifty 50 ETF', type: 'equity', value: 150000, returns: 12.8, benchmark: 12.5 },
    { name: 'SBI Savings', type: 'debt', value: 450000, returns: 3.5, benchmark: 3.2 },
    { name: 'HDFC Savings', type: 'debt', value: 320000, returns: 3.5, benchmark: 3.2 },
    { name: 'Physical Gold', type: 'gold', value: 200000, returns: 8.1, benchmark: 7.8 },
  ];

  const benchmarkData = holdings.map(h => ({
    name: h.name.split(' ').slice(0, 2).join(' '),
    portfolio: h.returns,
    benchmark: h.benchmark,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Portfolio Value', value: `₹${(totalValue / 1e5).toFixed(1)}L`, icon: 'fa-chart-pie', color: 'text-primary' },
          { label: 'Total Returns', value: '+12.4%', icon: 'fa-arrow-trend-up', color: 'text-emerald-500' },
          { label: 'Active SIPs', value: '3', icon: 'fa-rotate', color: 'text-secondary' },
          { label: 'XIRR', value: '14.2%', icon: 'fa-percent', color: 'text-accent' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <CosmosCard variant="stat" padding="md" hover>
              <div className="flex items-center gap-2 mb-2">
                <i className={`fas ${s.icon} ${s.color} text-xs`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</span>
              </div>
              <p className="text-xl font-extrabold text-slate-800 dark:text-white">{s.value}</p>
            </CosmosCard>
          </motion.div>
        ))}
      </div>

      {/* Allocation + Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <CosmosCard variant="default" className="lg:col-span-1" header={{ icon: 'fa-pie-chart', iconColor: '#0f766e', title: 'Asset Allocation', subtitle: 'Current vs Ideal' }}>
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
        </CosmosCard>

        <CosmosCard variant="default" className="lg:col-span-2" header={{ icon: 'fa-scale-balanced', iconColor: '#f59e0b', title: 'Performance vs Benchmark', subtitle: 'Trailing 1 year returns' }}>
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
        </CosmosCard>
      </div>

      {/* SIPs */}
      <CosmosCard variant="default" header={{ icon: 'fa-rotate', iconColor: '#14b8a6', title: 'Active SIPs', subtitle: `${sips.length} recurring investments`, action: <CosmosBadge color="success" size="sm">{sips.length} Active</CosmosBadge> }}>
        <div className="space-y-3">
          {sips.map((sip, i) => (
            <motion.div
              key={sip.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <i className="fas fa-rotate text-sm" />
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
      </CosmosCard>

      {/* Holdings Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <CosmosCard variant="default" className="lg:col-span-2" header={{ icon: 'fa-list', iconColor: '#8b5cf6', title: 'Investment Holdings', subtitle: `${holdings.length} assets tracked` }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  <th className="pb-3 font-medium text-xs">Asset</th>
                  <th className="pb-3 font-medium text-xs">Type</th>
                  <th className="pb-3 font-medium text-xs text-right">Value</th>
                  <th className="pb-3 font-medium text-xs text-right">Returns</th>
                  <th className="pb-3 font-medium text-xs text-right">vs Benchmark</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <tr key={h.name} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 font-medium text-slate-800 dark:text-white">{h.name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${h.type === 'equity' ? 'bg-primary/10 text-primary' : h.type === 'gold' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-secondary/10 text-secondary'}`}>
                        {h.type}
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
        </CosmosCard>
        <ESGScore />
      </div>

      {/* Rebalancing Simulator */}
      <CosmosCard
        variant="gradient"
        header={{ icon: 'fa-sliders', iconColor: '#0f766e', title: 'Rebalancing Simulator', subtitle: 'Align your portfolio with ideal allocation' }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Compare current allocation with recommended targets</p>
          <button
            onClick={() => setShowRebalance(!showRebalance)}
            className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
          >
            {showRebalance ? 'Hide' : 'Show'} Simulation
          </button>
        </div>

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
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <i className="fas fa-lightbulb text-amber-500 mr-1" />
                <strong>Recommendation:</strong> Consider increasing equity allocation by ₹{(totalValue * 0.05 / 1e5).toFixed(1)}L to reach your target 50% allocation.
              </p>
            </div>
          </motion.div>
        )}
      </CosmosCard>
    </div>
  );
}

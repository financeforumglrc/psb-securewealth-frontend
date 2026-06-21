import { useState } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const TEAL = '#0f766e';
const SLATE_LIGHT = '#cbd5e1';
const AMBER = '#f59e0b';

export default function WealthBenchmark() {
  const user = useWealthStore((s) => s.user);
  const assets = useWealthStore((s) => s.assets);
  const includeInCommunityData = useWealthStore((s) => s.includeInCommunityData);
  const toggleCommunityData = useWealthStore((s) => s.toggleCommunityData);
  const [activeTab, setActiveTab] = useState<'networth' | 'savings' | 'allocation'>('networth');

  const netWorth = assets.reduce((sum, a) => sum + a.value, 0);
  const savingsRate = Math.round((user.monthlySavings / user.monthlyIncome) * 100);

  // Equity = stocks + mutual funds as % of total investable assets (excluding property)
  const investableAssets = assets.filter((a) => a.type !== 'property').reduce((s, a) => s + a.value, 0);
  const equityValue = assets.filter((a) => ['stock', 'mutualFund'].includes(a.type)).reduce((s, a) => s + a.value, 0);
  const equityPct = investableAssets > 0 ? Math.round((equityValue / investableAssets) * 100) : 0;

  // Net worth percentile data (in Lakhs)
  const netWorthData = [
    { label: '90th percentile', value: 150, type: 'peer', desc: 'Top 10%' },
    { label: '75th percentile', value: 80, type: 'peer', desc: 'Top 25%' },
    { label: '50th percentile', value: 45, type: 'peer', desc: 'Median' },
    { label: 'You', value: Math.round(netWorth / 100000), type: 'you', desc: 'Your position' },
  ];

  const userNetWorthL = Math.round(netWorth / 100000);
  let netWorthMessage = '';
  if (userNetWorthL >= 150) {
    netWorthMessage = 'You are in the top 10% for your age! Incredible work.';
    // top 10%
  } else if (userNetWorthL >= 80) {
    netWorthMessage = 'You are in the top 25% for your age! Keep building.';
    // top 25%
  } else if (userNetWorthL >= 45) {
    netWorthMessage = 'You are above the median for your age. Well done!';
    // above median
  } else {
    netWorthMessage = 'You are building wealth. Consistency is key!';
    // below median
  }

  // Savings rate data
  const savingsData = [
    { label: 'Peer average', value: 18, type: 'peer' },
    { label: 'You', value: savingsRate, type: 'you' },
  ];

  const savingsDiff = savingsRate - 18;
  const savingsMessage = savingsDiff >= 0
    ? `You save ${savingsRate}% of income — that's ${savingsDiff} points higher than peers!`
    : `You save ${savingsRate}% of income — room to grow vs the ${18}% peer average.`;

  // Allocation data
  const allocationData = [
    { label: 'Peer equity %', value: 22, type: 'peer' },
    { label: 'Your equity %', value: equityPct, type: 'you' },
  ];

  const allocDiff = equityPct - 22;
  const allocMessage = allocDiff >= 0
    ? `Your ${equityPct}% equity exposure is ${allocDiff} points above peers. Growth-oriented!`
    : `Your ${equityPct}% equity exposure is ${Math.abs(allocDiff)} points below peers. Consider rebalancing.`;

  function formatLakhs(val: number) {
    return val >= 100 ? `₹${(val / 100).toFixed(1)}Cr` : `₹${val}L`;
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
            <i className="fas fa-users-line text-secondary mr-2" />
            How do you compare?
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Anonymized peer data · Age 25-30 bracket</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div className={`relative w-9 h-5 rounded-full transition-colors ${includeInCommunityData ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${includeInCommunityData ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-[10px] text-slate-400" onClick={toggleCommunityData}>
            {includeInCommunityData ? 'Included' : 'Excluded'}
          </span>
        </label>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'networth' as const, label: 'Net Worth', icon: 'fa-wallet' },
          { key: 'savings' as const, label: 'Savings Rate', icon: 'fa-piggy-bank' },
          { key: 'allocation' as const, label: 'Equity %', icon: 'fa-chart-pie' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <i className={`fas ${tab.icon}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'networth' ? (
            <BarChart data={netWorthData} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val) => [formatLakhs(Number(val)), 'Net Worth']}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                {netWorthData.map((entry, i) => (
                  <Cell key={i} fill={entry.type === 'you' ? TEAL : SLATE_LIGHT} />
                ))}
              </Bar>
            </BarChart>
          ) : activeTab === 'savings' ? (
            <BarChart data={savingsData} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val) => [`${Number(val)}%`, 'Savings Rate']}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }}
              />
              <ReferenceLine x={18} stroke={AMBER} strokeDasharray="4 4" label={{ value: 'Peer avg 18%', position: 'top', fontSize: 10, fill: AMBER }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                {savingsData.map((entry, i) => (
                  <Cell key={i} fill={entry.type === 'you' ? TEAL : SLATE_LIGHT} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart data={allocationData} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val) => [`${Number(val)}%`, 'Equity Allocation']}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }}
              />
              <ReferenceLine x={22} stroke={AMBER} strokeDasharray="4 4" label={{ value: 'Peer avg 22%', position: 'top', fontSize: 10, fill: AMBER }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                {allocationData.map((entry, i) => (
                  <Cell key={i} fill={entry.type === 'you' ? TEAL : SLATE_LIGHT} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Message */}
      <div className={`mt-3 p-3 rounded-lg text-xs flex items-start gap-2 ${
        activeTab === 'networth' && userNetWorthL >= 80
          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
          : activeTab === 'networth' && userNetWorthL >= 45
          ? 'bg-primary/5 dark:bg-primary/10 text-primary'
          : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
      }`}>
        <i className={`fas ${
          activeTab === 'networth' && userNetWorthL >= 45 ? 'fa-trophy' : 'fa-lightbulb'
        } mt-0.5`} />
        <div>
          <p className="font-medium">
            {activeTab === 'networth' ? netWorthMessage : activeTab === 'savings' ? savingsMessage : allocMessage}
          </p>
          {activeTab === 'networth' && (
            <p className="text-[10px] opacity-70 mt-1">
              Based on anonymized data from 12,400 users in your age bracket.
            </p>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <div className="w-3 h-3 rounded-sm" style={{ background: TEAL }} />
          You
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <div className="w-3 h-3 rounded-sm" style={{ background: SLATE_LIGHT }} />
          Peers
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <div className="w-3 h-0.5" style={{ background: AMBER, borderTop: '2px dashed' }} />
          Peer average
        </div>
      </div>
    </div>
  );
}

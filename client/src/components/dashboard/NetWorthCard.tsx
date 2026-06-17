import { useState } from 'react';
import { useWealthStore } from '../../store/wealthStore';
import { formatCurrency } from '../../utils/demoMode';
import { formatCurrencyMask, maskValue } from '../../utils/duressMask';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CosmosEmptyState } from '../ui/CosmosCard';

const COLORS = ['#0f766e', '#14b8a6', '#f59e0b', '#8b5cf6', '#64748b', '#ef4444'];

export default function NetWorthCard() {
  const assets = useWealthStore((s) => s.assets);
  const duressModeActive = useWealthStore((s) => s.duressModeActive);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const netWorth = assets.reduce((sum, a) => sum + a.value, 0);
  const liquid = assets.filter((a) => a.liquidity === 'high').reduce((s, a) => s + a.value, 0);
  const investments = assets.filter((a) => ['stock', 'mutualFund'].includes(a.type)).reduce((s, a) => s + a.value, 0);
  const physical = assets.filter((a) => ['gold', 'property', 'vehicle'].includes(a.type)).reduce((s, a) => s + a.value, 0);

  const data = [
    { name: 'Bank', value: assets.filter((a) => a.type === 'bank').reduce((s, a) => s + a.value, 0) },
    { name: 'Mutual Funds', value: assets.filter((a) => a.type === 'mutualFund').reduce((s, a) => s + a.value, 0) },
    { name: 'Stocks', value: assets.filter((a) => a.type === 'stock').reduce((s, a) => s + a.value, 0) },
    { name: 'Gold', value: assets.filter((a) => a.type === 'gold').reduce((s, a) => s + a.value, 0) },
    { name: 'Property', value: assets.filter((a) => a.type === 'property').reduce((s, a) => s + a.value, 0) },
    { name: 'Other', value: assets.filter((a) => a.type === 'other' || a.type === 'vehicle').reduce((s, a) => s + a.value, 0) },
  ].filter((d) => d.value > 0);

  const hasAssets = assets.length > 0;

  async function handleCopyNetWorth() {
    const text = `My net worth is ${formatCurrency(netWorth)} on SecureWealth Twin`;
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      } catch {
        // Silent fail
      }
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-white">Net Worth Overview</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyNetWorth}
            className="text-[10px] px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary rounded-full hover:bg-primary/20 transition-colors flex items-center gap-1"
            title="Copy net worth"
          >
            <i className={`fas ${copyFeedback ? 'fa-check' : 'fa-copy'}`} />
            {copyFeedback ? 'Copied' : 'Copy'}
          </button>
          <ComplianceBadge />
        </div>
      </div>

      {!hasAssets ? (
        <CosmosEmptyState
          icon="fa-wallet"
          title="No Assets Added"
          subtitle="Link your accounts via Account Aggregator or add assets manually to see your net worth."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Stat label="Total Net Worth" value={formatCurrencyMask(netWorth, duressModeActive)} icon="fa-wallet" color="text-primary" />
            <Stat label="Liquid Assets" value={formatCurrencyMask(liquid, duressModeActive)} icon="fa-droplet" color="text-secondary" />
            <Stat label="Investments" value={formatCurrencyMask(investments, duressModeActive)} icon="fa-chart-pie" color="text-accent" />
            <Stat label="Physical" value={formatCurrencyMask(physical, duressModeActive)} icon="fa-gem" color="text-purple-500" />
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {data.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrencyMask(maskValue(Number(val), duressModeActive), false)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {data.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/40 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <i className={`fas ${icon} text-xs ${color}`} />
        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">{label}</span>
      </div>
      <p className="text-lg font-bold text-slate-800 dark:text-white">{value}</p>
    </div>
  );
}

function ComplianceBadge() {
  return (
    <span className="text-[10px] px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-800/50">
      <i className="fas fa-lock mr-1" /> Secured
    </span>
  );
}

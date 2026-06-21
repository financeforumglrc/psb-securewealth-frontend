import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import TransactionDetailModal from '@/features/transactions/components/TransactionDetailModal';
import ScanReceipt from '@/features/transactions/components/ScanReceipt';
import AICategorization from '@/features/transactions/components/AICategorization';
import SmartDuplicateDetection from '@/features/transactions/components/SmartDuplicateDetection';
import TransactionTagger from '@/features/transactions/components/TransactionTagger';
import CosmosCard, { CosmosEmptyState } from '@/shared/components/ui/CosmosCard';
import type { Transaction } from '@/shared/types';

type FilterType = 'all' | 'allowed' | 'blocked' | 'delayed';

const STATUS_STYLES: Record<string, string> = {
  ALLOWED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  BLOCKED: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  DELAYED: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
};

const RISK_STYLES: Record<string, string> = {
  LOW: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
  MEDIUM: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800',
  HIGH: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800',
};

const CATEGORY_ICONS: Record<string, string> = {
  Income: 'fa-wallet',
  Food: 'fa-utensils',
  Utilities: 'fa-bolt',
  Investment: 'fa-chart-line',
  Housing: 'fa-house',
  Transfer: 'fa-money-bill-transfer',
  Shopping: 'fa-bag-shopping',
  Transport: 'fa-car',
};

const CAT_COLORS = ['#0f766e', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b', '#06b6d4', '#84cc16'];

export default function TransactionsView() {
  const transactions = useWealthStore((s) => s.transactions);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesFilter = filter === 'all' || t.status.toLowerCase() === filter;
      const matchesSearch = !search || t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [transactions, filter, search]);

  const stats = useMemo(() => ({
    total: transactions.length,
    allowed: transactions.filter((t) => t.status === 'ALLOWED').length,
    blocked: transactions.filter((t) => t.status === 'BLOCKED').length,
    delayed: transactions.filter((t) => t.status === 'DELAYED').length,
    blockedAmount: transactions.filter((t) => t.status === 'BLOCKED').reduce((s, t) => s + t.amount, 0),
    delayedAmount: transactions.filter((t) => t.status === 'DELAYED').reduce((s, t) => s + t.amount, 0),
    totalIn: transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0),
    totalOut: transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0),
  }), [transactions]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((t) => {
      if (t.type === 'debit') {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      }
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [transactions]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, sub: `${transactions.filter(t => t.type === 'credit').length} in`, color: 'text-slate-800 dark:text-white' },
          { label: 'Allowed', value: stats.allowed, sub: 'Clean', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Blocked', value: `₹${stats.blockedAmount.toLocaleString()}`, sub: `${stats.blocked} fraud attempts`, color: 'text-rose-600 dark:text-rose-400' },
          { label: 'Delayed', value: `₹${stats.delayedAmount.toLocaleString()}`, sub: `${stats.delayed} in cooling`, color: 'text-amber-600 dark:text-amber-400' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <CosmosCard variant="stat" padding="md">
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{s.label}</p>
              <p className="text-[10px] text-slate-400">{s.sub}</p>
            </CosmosCard>
          </motion.div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search transactions, categories, merchants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {([
            { key: 'all', label: 'All', count: stats.total },
            { key: 'allowed', label: 'Allowed', count: stats.allowed },
            { key: 'blocked', label: 'Blocked', count: stats.blocked },
            { key: 'delayed', label: 'Delayed', count: stats.delayed },
          ] as { key: FilterType; label: string; count: number }[]).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                filter === f.key ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {f.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === f.key ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Categorization + Spending Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ScanReceipt />
        </div>
        <CosmosCard variant="default" header={{ icon: 'fa-chart-pie', iconColor: '#f59e0b', title: 'Spending by Category', subtitle: 'AI-categorized breakdown' }}>
          {categoryData.length === 0 ? (
            <CosmosEmptyState icon="fa-chart-pie" title="No Spending Data" subtitle="Add transactions to see your spending breakdown." />
          ) : (
            <>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                      {categoryData.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={CAT_COLORS[i % CAT_COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `₹${Number(val).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2">
                {categoryData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
                      <span className="text-slate-600 dark:text-slate-400">{d.name}</span>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">₹{(d.value / 1e3).toFixed(0)}k</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CosmosCard>
      </div>

      <AICategorization />
      <SmartDuplicateDetection />

      {/* Transactions Table */}
      <CosmosCard variant="default" padding="none" header={{ icon: 'fa-list', iconColor: '#0f766e', title: 'Transaction History', subtitle: `${filtered.length} transactions` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                <th className="pb-3 font-medium px-5 pt-4 text-xs">Date</th>
                <th className="pb-3 font-medium pt-4 text-xs">Description</th>
                <th className="pb-3 font-medium pt-4 text-xs">Category</th>
                <th className="pb-3 font-medium text-right pt-4 text-xs">Amount</th>
                <th className="pb-3 font-medium text-center pt-4 text-xs">Status</th>
                <th className="pb-3 font-medium text-center pt-4 text-xs">Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => setSelectedTx(t)}
                  className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-5 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                    {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                        t.status === 'BLOCKED' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' :
                        t.status === 'DELAYED' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                        'bg-slate-100 dark:bg-slate-700 text-slate-500'
                      }`}>
                        <i className={`fas ${t.status === 'BLOCKED' ? 'fa-shield-virus' : t.status === 'DELAYED' ? 'fa-hourglass-half' : CATEGORY_ICONS[t.category] || 'fa-circle'}`} />
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">{t.description}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-[10px]">{t.category}</span>
                  </td>
                  <td className={`py-3 text-right font-medium whitespace-nowrap text-xs ${t.type === 'credit' ? 'text-emerald-600' : 'text-slate-800 dark:text-white'}`}>
                    {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${RISK_STYLES[t.riskLevel]}`}>
                      {t.riskLevel}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <CosmosEmptyState icon="fa-search" title="No matches found" subtitle="Try adjusting your search or filter criteria." />
        )}
      </CosmosCard>

      <TransactionTagger />

      {/* Security Summary */}
      <CosmosCard variant="default" header={{ icon: 'fa-shield-halved', iconColor: '#0f766e', title: 'Security Summary', subtitle: 'Protection at a glance' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-center border border-emerald-100 dark:border-emerald-800/50">
            <p className="text-3xl font-bold text-emerald-600">{stats.allowed}</p>
            <p className="text-xs text-emerald-600 mt-1">Allowed Transactions</p>
            <p className="text-[10px] text-emerald-400">Passed all security checks</p>
          </div>
          <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl text-center border border-rose-100 dark:border-rose-800/50">
            <p className="text-3xl font-bold text-rose-600">₹{stats.blockedAmount.toLocaleString()}</p>
            <p className="text-xs text-rose-600 mt-1">Blocked Amount</p>
            <p className="text-[10px] text-rose-400">Fraud prevention active</p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl text-center border border-amber-100 dark:border-amber-800/50">
            <p className="text-3xl font-bold text-amber-600">₹{stats.delayedAmount.toLocaleString()}</p>
            <p className="text-xs text-amber-600 mt-1">Delayed Amount</p>
            <p className="text-[10px] text-amber-400">Cooling vault protection</p>
          </div>
        </div>
      </CosmosCard>

      <TransactionDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
    </div>
  );
}

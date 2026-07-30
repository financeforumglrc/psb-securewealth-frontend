import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Download, ArrowDownLeft, PiggyBank, Target, Gift, Zap, Shield, CheckCircle2 } from 'lucide-react';
import { useWealthStore } from '@/shared/store/wealthStore';

interface IncomeSource {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  amount: string;
  frequency: string;
}

const INCOME_SOURCES: IncomeSource[] = [
  {
    id: 'salary',
    title: 'Salary',
    description: 'Primary employment income',
    icon: TrendingUp,
    color: 'text-blue-600',
    amount: '₹1,50,000',
    frequency: 'Monthly',
  },
  {
    id: 'fd-interest',
    title: 'FD Interest',
    description: 'Fixed deposit returns',
    icon: PiggyBank,
    color: 'text-emerald-600',
    amount: '₹8,500',
    frequency: 'Quarterly',
  },
  {
    id: 'dividends',
    title: 'Dividends',
    description: 'Stock and mutual fund dividends',
    icon: Target,
    color: 'text-purple-600',
    amount: '₹12,000',
    frequency: 'Quarterly',
  },
  {
    id: 'rental',
    title: 'Rental Income',
    description: 'Property rental income',
    icon: Download,
    color: 'text-amber-600',
    amount: '₹25,000',
    frequency: 'Monthly',
  },
  {
    id: 'cashback',
    title: 'Cashback & Rewards',
    description: 'UPI cashback and credit card rewards',
    icon: Gift,
    color: 'text-rose-600',
    amount: '₹3,200',
    frequency: 'Monthly',
  },
  {
    id: 'side-income',
    title: 'Side Income',
    description: 'Freelance and consulting',
    icon: Zap,
    color: 'text-indigo-600',
    amount: '₹45,000',
    frequency: 'Variable',
  },
];

export default function ReceivingMoneyFocus() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'goals'>('overview');
  const user = useWealthStore((s) => s.user);
  const assets = useWealthStore((s) => s.assets);
  const goals = useWealthStore((s) => s.goals);

  const totalIncome = user.monthlyIncome;
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const passiveIncome = totalIncome * 0.3; // 30% passive

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <ArrowDownLeft className="w-5 h-5 text-emerald-600" /> Receiving Money Focus
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Shift emphasis toward wealth management and receiving money. Growing your income is as important as managing your spending.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'sources', label: 'Income Sources' },
          { id: 'goals', label: 'Income Goals' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Income Hero */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-800 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/70 uppercase tracking-wider">Total Monthly Income</p>
                <p className="text-4xl font-black mt-1">₹{totalIncome.toLocaleString('en-IN')}</p>
                <p className="text-xs text-white/70 mt-1">
                  Passive: ₹{Math.round(passiveIncome).toLocaleString('en-IN')} ({Math.round((passiveIncome / totalIncome) * 100)}%)
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/60">Net Worth</p>
                <p className="text-xl font-black text-emerald-300">₹{(totalAssets / 100000).toFixed(1)}L</p>
              </div>
            </div>
          </div>

          {/* Income Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Active Income', value: totalIncome - passiveIncome, color: 'bg-blue-500' },
              { label: 'Passive Income', value: passiveIncome, color: 'bg-emerald-500' },
              { label: 'Investment Returns', value: totalIncome * 0.15, color: 'bg-purple-500' },
              { label: 'Other Income', value: totalIncome * 0.05, color: 'bg-amber-500' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{item.label}</span>
                </div>
                <p className="text-sm font-black text-slate-800 dark:text-white">₹{Math.round(item.value).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>

          {/* Wealth Growth */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-black text-slate-800 dark:text-white mb-3">Wealth Growth Strategy</h3>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Increase passive income to 50% of total income in 5 years</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Build 6-month emergency fund</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Invest 20% of income in high-growth assets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Diversify income sources (salary + investments + side income)</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sources Tab */}
      {activeTab === 'sources' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {INCOME_SOURCES.map((source) => {
            const Icon = source.icon;
            return (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${source.color}`} />
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{source.title}</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">{source.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-emerald-600">{source.amount}</span>
                  <span className="text-[10px] text-slate-400">{source.frequency}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {goals.slice(0, 5).map((goal) => (
            <div key={goal.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-800 dark:text-white">{goal.name}</span>
                <span className="text-xs text-slate-500">
                  {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>₹{goal.currentAmount.toLocaleString('en-IN')} / ₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                <span>₹{(goal.targetAmount - goal.currentAmount).toLocaleString('en-IN')} remaining</span>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Receiving vs Paying */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Receiving Money</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            Focus on growing your income through salary increments, investments, side income, and passive income streams.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Paying Money</span>
          </div>
          <p className="text-xs text-slate-500">
            Manage your expenses wisely, but don't forget that growing your income is the key to wealth creation.
          </p>
        </div>
      </div>
    </div>
  );
}

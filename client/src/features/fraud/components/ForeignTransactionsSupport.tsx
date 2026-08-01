import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, DollarSign, TrendingUp, Shield, AlertTriangle } from 'lucide-react';

interface ForeignTransaction {
  id: string;
  type: 'send' | 'receive';
  currency: string;
  amount: number;
  convertedAmount: number;
  country: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
}

const FOREIGN_TRANSACTIONS: ForeignTransaction[] = [
  {
    id: '1',
    type: 'receive',
    currency: 'USD',
    amount: 5000,
    convertedAmount: 417500,
    country: 'United States',
    status: 'completed',
    date: '2026-07-20',
  },
  {
    id: '2',
    type: 'send',
    currency: 'EUR',
    amount: 3000,
    convertedAmount: 267000,
    country: 'Germany',
    status: 'pending',
    date: '2026-07-21',
  },
  {
    id: '3',
    type: 'receive',
    currency: 'GBP',
    amount: 2000,
    convertedAmount: 210000,
    country: 'United Kingdom',
    status: 'completed',
    date: '2026-07-19',
  },
];

const SUPPORTED_COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
  { code: 'EU', name: 'European Union', currency: 'EUR', flag: '🇪🇺' },
  { code: 'AE', name: 'UAE', currency: 'AED', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', flag: '🇸🇬' },
  { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
];

export default function ForeignTransactionsSupport() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'send'>('overview');

  const totalReceived = FOREIGN_TRANSACTIONS.filter((t) => t.type === 'receive' && t.status === 'completed').reduce((sum, t) => sum + t.convertedAmount, 0);
  const totalSent = FOREIGN_TRANSACTIONS.filter((t) => t.type === 'send' && t.status === 'completed').reduce((sum, t) => sum + t.convertedAmount, 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" /> Foreign Transactions
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Support for international transactions with foreign exchange conversion and compliance.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'transactions', label: 'Transactions' },
          { id: 'send', label: 'Send Money' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 text-xs font-bold rounded-md transition-colors ${
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
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Received', value: `₹${totalReceived.toLocaleString('en-IN')}`, color: 'text-emerald-600' },
              { label: 'Total Sent', value: `₹${totalSent.toLocaleString('en-IN')}`, color: 'text-blue-600' },
              { label: 'Supported Countries', value: SUPPORTED_COUNTRIES.length, color: 'text-purple-600' },
              { label: 'Exchange Rate', value: 'Live', color: 'text-amber-600' },
            ].map((stat, i) => (
              <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 uppercase font-bold">{stat.label}</p>
                <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Supported Countries */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-black text-slate-800 dark:text-white mb-3">Supported Countries</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SUPPORTED_COUNTRIES.map((country) => (
                <div key={country.code} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-lg">{country.flag}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{country.name}</p>
                    <p className="text-[10px] text-slate-400">{country.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { title: 'Live Exchange Rates', desc: 'Real-time currency conversion with transparent fees', icon: TrendingUp },
              { title: 'Compliance', desc: 'RBI and FEMA compliant international transfers', icon: Shield },
              { title: 'Low Fees', desc: 'Competitive exchange rates and low transfer fees', icon: DollarSign },
              { title: 'Fast Processing', desc: 'Same-day processing for most countries', icon: Zap },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{feature.title}</span>
                  </div>
                  <p className="text-xs text-slate-500">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {FOREIGN_TRANSACTIONS.map((transaction) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${transaction.type === 'receive' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  <span className="text-sm font-bold text-slate-800 dark:text-white capitalize">{transaction.type}</span>
                  <span className="text-xs text-slate-500">{transaction.country}</span>
                </div>
                <span className={`text-xs font-bold ${
                  transaction.status === 'completed' ? 'text-emerald-600' :
                  transaction.status === 'pending' ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {transaction.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-slate-400">Currency</p>
                  <p className="font-bold text-slate-800 dark:text-white">{transaction.currency}</p>
                </div>
                <div>
                  <p className="text-slate-400">Amount</p>
                  <p className="font-bold text-slate-800 dark:text-white">{transaction.amount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-slate-400">Converted (INR)</p>
                  <p className="font-bold text-slate-800 dark:text-white">₹{transaction.convertedAmount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-slate-400">Date</p>
                  <p className="font-bold text-slate-800 dark:text-white">{transaction.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Send Money Tab */}
      {activeTab === 'send' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-black text-slate-800 dark:text-white mb-3">Send Money Internationally</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 font-bold block mb-1">Destination Country</label>
                <select className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white">
                  {SUPPORTED_COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>{country.flag} {country.name} ({country.currency})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold block mb-1">Amount (INR)</label>
                <input
                  type="number"
                  placeholder="Enter amount in INR"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold block mb-1">Recipient Details</label>
                <input
                  type="text"
                  placeholder="Recipient name and account details"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white"
                />
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Exchange Rate</span>
                  <span className="font-bold text-slate-800 dark:text-white">1 USD = ₹83.50</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-slate-500">Transfer Fee</span>
                  <span className="font-bold text-slate-800 dark:text-white">₹500</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-slate-500">Recipient Gets</span>
                  <span className="font-bold text-emerald-600">$100.00</span>
                </div>
              </div>
              <button className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700">
                Send Money
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Compliance Notice</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              All international transactions are subject to RBI and FEMA regulations. Large transactions may require additional documentation.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Zap({ className }: { className?: string }) {
  return <span className={className}>⚡</span>;
}

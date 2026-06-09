import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { backendApi } from '../../lib/backendApi';
import { mockAccounts, mockTransactions } from '../../data/mockBankingData';
import { useToast } from '../../components/ui/ToastProvider';

interface Account {
  id: number;
  account_number: string;
  account_type: string;
  balance: number;
  bank_name: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  to_account?: number;
  from_account?: number;
  metadata?: string;
}

const txnTypeMeta: Record<string, { icon: string; color: string; label: string }> = {
  credit: { icon: 'fa-arrow-down', color: 'text-emerald-500', label: 'Received' },
  debit: { icon: 'fa-arrow-up', color: 'text-rose-500', label: 'Sent' },
  transfer: { icon: 'fa-right-left', color: 'text-blue-500', label: 'Transfer' },
  upi: { icon: 'fa-bolt', color: 'text-amber-500', label: 'UPI' },
  bill_payment: { icon: 'fa-file-invoice', color: 'text-violet-500', label: 'Bill' },
  investment: { icon: 'fa-chart-line', color: 'text-emerald-500', label: 'Invest' },
  interest: { icon: 'fa-coins', color: 'text-amber-500', label: 'Interest' },
};

export default function AccountStatement() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { showToast } = useToast();

  useEffect(() => { loadAccounts(); }, []);

  async function loadAccounts() {
    try {
      const res = await backendApi.getAccounts();
      const accs = res.data?.data;
      if (accs && accs.length > 0) {
        setAccounts(accs);
        if (!selectedAccount) setSelectedAccount(accs[0].id);
      } else if (!res.ok) {
        const demoAccs = mockAccounts.map(a => ({ ...a, bank_name: 'Punjab & Sind Bank' }));
        setAccounts(demoAccs);
        if (!selectedAccount) setSelectedAccount(demoAccs[0].id);
      }
    } catch (e) {
      const demoAccs = mockAccounts.map(a => ({ ...a, bank_name: 'Punjab & Sind Bank' }));
      setAccounts(demoAccs);
      if (!selectedAccount) setSelectedAccount(demoAccs[0].id);
    }
  }

  useEffect(() => { if (selectedAccount) loadStatement(); }, [selectedAccount]);

  async function loadStatement() {
    if (!selectedAccount) return;
    setLoading(true);
    try {
      const res = await backendApi.getStatement(selectedAccount, startDate || undefined, endDate || undefined);
      const txns = res.data?.data?.transactions;
      if (txns && txns.length > 0) {
        setTransactions(txns);
      } else if (!res.ok) {
        setTransactions(mockTransactions as any);
      } else {
        setTransactions([]);
      }
    } catch (e) {
      setTransactions(mockTransactions as any);
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    if (!transactions.length) { showToast('No transactions to export', 'error'); return; }
    const csv = [
      ['Date', 'Type', 'Description', 'Amount', 'Status'].join(','),
      ...transactions.map(t => [new Date(t.created_at).toLocaleDateString('en-IN'), t.type, `"${t.description}"`, t.amount, t.status].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statement-${selectedAccount}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Statement downloaded', 'success');
  }

  const filtered = filterType ? transactions.filter(t => t.type === filterType) : transactions;
  const totalCredit = filtered.filter(t => t.type === 'credit' || t.type === 'interest').reduce((s, t) => s + t.amount, 0);
  const totalDebit = filtered.filter(t => ['debit', 'transfer', 'upi', 'bill_payment'].includes(t.type)).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-file-invoice text-primary" /> Account Statement
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">View, filter and export transaction history</p>
        </div>
        <button onClick={handleExport}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2">
          <i className="fas fa-download" /> Export CSV
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {accounts.map(acc => (
          <button key={acc.id} onClick={() => setSelectedAccount(acc.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedAccount === acc.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>
            <div className="flex items-center gap-2">
              <i className={`fas ${acc.account_type === 'savings' ? 'fa-piggy-bank' : acc.account_type === 'current' ? 'fa-building-columns' : 'fa-vault'}`} />
              <span className="capitalize">{acc.account_type}</span>
              <span className="opacity-70">· ₹{acc.balance.toLocaleString()}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="w-36 mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm">
              <option value="">All Types</option><option value="credit">Credit</option><option value="debit">Debit</option>
              <option value="transfer">Transfer</option><option value="upi">UPI</option><option value="bill_payment">Bill Payment</option>
              <option value="investment">Investment</option><option value="interest">Interest</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">From</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-36 mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">To</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-36 mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm" />
          </div>
          <button onClick={loadStatement}
            className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors">
            <i className="fas fa-filter mr-1" /> Apply
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Total Inflow</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">+₹{totalCredit.toLocaleString()}</p>
        </div>
        <div className="card bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800">
          <p className="text-xs text-rose-600 dark:text-rose-400">Total Outflow</p>
          <p className="text-xl font-bold text-rose-700 dark:text-rose-300">-₹{totalDebit.toLocaleString()}</p>
        </div>
        <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-400">Net Change</p>
          <p className={`text-xl font-bold ${totalCredit - totalDebit >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
            {totalCredit - totalDebit >= 0 ? '+' : ''}₹{(totalCredit - totalDebit).toLocaleString()}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-file-invoice text-slate-400 text-2xl" />
          </div>
          <h3 className="font-bold text-slate-700 dark:text-slate-300">No Transactions</h3>
          <p className="text-sm text-slate-500 mt-1">No transactions match your filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((txn, idx) => {
            const meta = txnTypeMeta[txn.type] || txnTypeMeta.debit;
            const isCredit = txn.type === 'credit' || txn.type === 'interest';
            return (
              <motion.div key={txn.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                className="card flex items-center gap-4 py-3 hover:shadow-md transition-shadow">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-opacity-10 ${meta.color.replace('text-', 'bg-').replace('500', '100')}`}>
                  <i className={`fas ${meta.icon} ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-slate-800 dark:text-white truncate">{txn.description}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      txn.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : txn.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>{txn.status}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {new Date(txn.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    <span className="mx-1">·</span><span className="capitalize">{meta.label}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${isCredit ? 'text-emerald-600' : 'text-slate-800 dark:text-white'}`}>
                    {isCredit ? '+' : ''}₹{txn.amount.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

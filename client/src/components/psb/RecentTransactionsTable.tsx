import { useState } from 'react';
import { motion } from 'framer-motion';

interface Transaction {
  id: string;
  date: string;
  payee: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  type: 'debit' | 'credit';
  cashback?: number;
}

export default function RecentTransactionsTable() {
  const [txs] = useState<Transaction[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('sw_upi_transactions') || '[]');
      return stored.map((t: any) => ({
        id: t.id,
        date: new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        payee: t.payee,
        amount: t.amount,
        status: t.status,
        type: 'debit' as const,
        cashback: t.cashbackEarned,
      })).slice(0, 10);
    } catch { return []; }
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case 'success': return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-sm text-[10px] font-bold border border-green-200"><i className="fas fa-check" /> Success</span>;
      case 'pending': return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-sm text-[10px] font-bold border border-amber-200"><i className="fas fa-clock" /> Pending</span>;
      case 'failed': return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded-sm text-[10px] font-bold border border-red-200"><i className="fas fa-xmark" /> Failed</span>;
      default: return null;
    }
  };

  const downloadCSV = () => {
    const headers = 'Date,Payee,Amount,Status\n';
    const rows = txs.map(t => `${t.date},${t.payee},${t.amount},${t.status}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PSB_Bank_Statement.csv';
    a.click();
  };

  return (
    <div className="card-psb bg-white border border-gray-200 rounded-md shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-primary flex items-center gap-2">
          <i className="fas fa-list-ul" />
          Recent Transactions
        </h2>
        <button
          onClick={downloadCSV}
          className="text-[11px] text-primary font-semibold flex items-center gap-1.5 hover:underline px-2 py-1 rounded-sm hover:bg-primary-light transition-colors"
        >
          <i className="fas fa-download" /> Download Statement
        </button>
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="table-psb">
          <thead>
            <tr>
              <th>Date</th>
              <th>Payee</th>
              <th className="text-right">Amount</th>
              <th className="text-center">Status</th>
              <th className="text-right">Cashback</th>
            </tr>
          </thead>
          <tbody>
            {txs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                  <i className="fas fa-inbox text-2xl mb-2 block text-gray-300" />
                  No transactions yet. Make your first payment above.
                </td>
              </tr>
            ) : (
              txs.map((tx, i) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <td className="text-gray-500">{tx.date}</td>
                  <td className="font-semibold text-gray-800">{tx.payee}</td>
                  <td className="text-right font-bold text-gray-800">-₹{tx.amount.toLocaleString()}</td>
                  <td className="text-center">{statusBadge(tx.status)}</td>
                  <td className="text-right">
                    {tx.cashback ? (
                      <span className="text-green-700 font-bold text-[11px]">+₹{tx.cashback.toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-300 text-[11px]">—</span>
                    )}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

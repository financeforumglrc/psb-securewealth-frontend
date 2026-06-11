import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';
import type { Transaction } from '../../types';

/* ═══════════════════════════════════════════════════════════════
   RECENT TRANSACTIONS TABLE v2 — With Protection Layer Badges
   Shows ALLOWED / BLOCKED / DELAYED status with risk scores.
   Judges see the protection decisions in action.
   ═══════════════════════════════════════════════════════════════ */

export default function RecentTransactionsTable() {
  const storeTxs = useWealthStore((s) => s.transactions);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  // Use wealth store transactions (with risk data) — fallback to localStorage UPI txs
  // Use wealth store transactions with full protection metadata
  const allTxs: Transaction[] = storeTxs.length > 0 ? storeTxs.slice(-15).reverse() : [];

  const riskBadge = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'LOW': return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-sm text-[9px] font-bold border border-emerald-200"><i className="fas fa-check" /> LOW</span>;
      case 'MEDIUM': return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-sm text-[9px] font-bold border border-amber-200"><i className="fas fa-clock" /> MED</span>;
      case 'HIGH': return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded-sm text-[9px] font-bold border border-rose-200"><i className="fas fa-triangle-exclamation" /> HIGH</span>;
      default: return null;
    }
  };

  const statusBadge = (status?: string) => {
    switch (status) {
      case 'ALLOWED': return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-sm text-[10px] font-bold border border-emerald-200"><i className="fas fa-check" /> Allowed</span>;
      case 'DELAYED': return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-sm text-[10px] font-bold border border-amber-200"><i className="fas fa-clock" /> Delayed</span>;
      case 'BLOCKED': return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 rounded-sm text-[10px] font-bold border border-rose-200"><i className="fas fa-ban" /> Blocked</span>;
      case 'success': return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-sm text-[10px] font-bold border border-green-200"><i className="fas fa-check" /> Success</span>;
      case 'pending': return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-sm text-[10px] font-bold border border-amber-200"><i className="fas fa-clock" /> Pending</span>;
      case 'failed': return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded-sm text-[10px] font-bold border border-red-200"><i className="fas fa-xmark" /> Failed</span>;
      default: return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-600 rounded-sm text-[10px] font-bold border border-slate-200"><i className="fas fa-circle" /> {status}</span>;
    }
  };

  const downloadCSV = () => {
    const headers = 'Date,Description,Amount,Status,RiskLevel,Score\n';
    const rows = allTxs.map((t) => `${t.date},${t.description},${t.amount},${t.status},${t.riskLevel || ''},${t.score || ''}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PSB_Protected_Transactions.csv';
    a.click();
  };

  return (
    <div className="card-psb bg-white border border-gray-200 rounded-md shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-primary flex items-center gap-2">
          <i className="fas fa-list-ul" />
          Recent Transactions
          <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-extrabold">PROTECTED</span>
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
              <th>Description</th>
              <th className="text-right">Amount</th>
              <th className="text-center">Status</th>
              <th className="text-center">Risk</th>
              <th className="text-center"></th>
            </tr>
          </thead>
          <tbody>
            {allTxs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">
                  <i className="fas fa-inbox text-2xl mb-2 block text-gray-300" />
                  No transactions yet. Make your first protected payment above.
                </td>
              </tr>
            ) : (
              allTxs.map((tx, i) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={tx.status === 'BLOCKED' ? 'bg-rose-50/30 dark:bg-rose-900/5' : tx.status === 'DELAYED' ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''}
                >
                  <td className="text-gray-500 text-xs">{tx.date}</td>
                  <td className="font-semibold text-gray-800 text-xs max-w-[180px] truncate">{tx.description}</td>
                  <td className="text-right font-bold text-gray-800 text-xs">
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </td>
                  <td className="text-center">{statusBadge(tx.status)}</td>
                  <td className="text-center">{riskBadge(tx.riskLevel)}</td>
                  <td className="text-center">
                    {(tx.score !== undefined || tx.signals) && (
                      <button
                        onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                        className="text-primary text-[10px] font-bold hover:underline"
                      >
                        {expandedTx === tx.id ? 'Hide' : 'Details'}
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Expanded Detail Panel */}
      <AnimatePresence>
        {expandedTx && (() => {
          const tx = allTxs.find((t) => t.id === expandedTx);
          if (!tx) return null;
          return (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mx-2 mb-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 text-xs space-y-2">
                {tx.score !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Protection Score</span>
                    <span className={`font-bold ${tx.score < 40 ? 'text-emerald-600' : tx.score < 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {tx.score}/100
                    </span>
                  </div>
                )}
                {tx.decision && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Decision</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{tx.decision.action} — {tx.decision.level}</span>
                  </div>
                )}
                {tx.decision?.referenceId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Reference ID</span>
                    <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">{tx.decision.referenceId}</span>
                  </div>
                )}
                {tx.signals && (
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-500 mb-1">Risk Signals</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(tx.signals).map(([key, val]) => (
                        <span key={key} className={`text-[9px] px-1.5 py-0.5 rounded border ${val ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          {val ? '⚠' : '✓'} {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {tx.decision?.message && (
                  <div className={`p-2 rounded text-[10px] ${
                    tx.status === 'BLOCKED' ? 'bg-rose-50 text-rose-700' : tx.status === 'DELAYED' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    <i className="fas fa-circle-info mr-1" />{tx.decision.message}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

import type { Transaction } from '../../types';

interface Props {
  tx: Transaction | null;
  onClose: () => void;
}

export default function TransactionDetailModal({ tx, onClose }: Props) {
  if (!tx) return null;

  const activeSignals = tx.signals
    ? Object.entries(tx.signals).filter(([, v]) => v).map(([k]) => k.replace(/([A-Z])/g, ' $1').trim())
    : [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between ${
          tx.status === 'BLOCKED' ? 'bg-gradient-to-r from-rose-500 to-red-600' :
          tx.status === 'DELAYED' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
          'bg-gradient-to-r from-primary to-secondary'
        }`}>
          <div>
            <h3 className="text-lg font-bold">Transaction Details</h3>
            <p className="text-xs text-white/80 mt-0.5">{new Date(tx.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Amount & Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Amount</p>
              <p className={`text-2xl font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800 dark:text-white'}`}>
                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              tx.status === 'BLOCKED' ? 'bg-rose-100 text-rose-700' :
              tx.status === 'DELAYED' ? 'bg-amber-100 text-amber-700' :
              'bg-emerald-100 text-emerald-700'
            }`}>
              {tx.status}
            </span>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Description</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{tx.description}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Category</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{tx.category}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Type</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 capitalize">{tx.type}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Risk Level</p>
              <p className={`text-sm font-medium ${
                tx.riskLevel === 'HIGH' ? 'text-rose-600' :
                tx.riskLevel === 'MEDIUM' ? 'text-amber-600' :
                'text-emerald-600'
              }`}>{tx.riskLevel}</p>
            </div>
          </div>

          {/* Protection Layer Reasoning */}
          {(tx.status === 'BLOCKED' || tx.status === 'DELAYED') && tx.decision && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">
                <i className="fas fa-shield-halved text-primary mr-2" />Protection Layer Reasoning
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Protection Score</span>
                  <span className={`font-bold ${tx.score && tx.score >= 80 ? 'text-rose-600' : tx.score && tx.score >= 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {tx.score}/100
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className={`h-full rounded-full ${
                    tx.score && tx.score >= 80 ? 'bg-rose-500' : tx.score && tx.score >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} style={{ width: `${tx.score}%` }} />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Decision Level</span>
                  <span className={`font-bold ${tx.decision.level === 'HIGH' ? 'text-rose-600' : tx.decision.level === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {tx.decision.level}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Action Taken</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{tx.decision.action}</span>
                </div>

                {tx.decision.cooldown && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Cooldown</span>
                    <span className="font-bold text-amber-600">{tx.decision.cooldown}s</span>
                  </div>
                )}

                {tx.decision.delay && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Delay</span>
                    <span className="font-bold text-rose-600">{tx.decision.delay}s</span>
                  </div>
                )}

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{tx.decision.message}"</p>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Reference ID</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{tx.decision.referenceId}</span>
                </div>

                {activeSignals.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1.5">Triggered Signals</p>
                    <div className="flex flex-wrap gap-1">
                      {activeSignals.map((sig) => (
                        <span key={sig} className="px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 rounded text-[10px] font-medium">
                          <i className="fas fa-triangle-exclamation mr-1" />{sig}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tx.status === 'ALLOWED' && tx.riskLevel === 'LOW' && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-800">
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                <i className="fas fa-check-circle mr-1" />This transaction passed all security checks and was processed normally.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <button onClick={onClose} className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

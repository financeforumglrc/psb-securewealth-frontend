import { motion } from 'framer-motion';
import type { Transaction } from '@/shared/types';

interface Props {
  tx: Transaction | null;
  onClose: () => void;
}

const signalLabels: Record<string, { label: string; desc: string; icon: string }> = {
  newDevice: { label: 'New Device', desc: 'Transaction from unrecognized device', icon: 'fa-laptop' },
  rushedAction: { label: 'Rushed Action', desc: 'Completed unusually fast after login', icon: 'fa-bolt' },
  unusualAmount: { label: 'Unusual Amount', desc: 'Amount exceeds typical spending pattern', icon: 'fa-chart-line' },
  otpRetries: { label: 'OTP Retries', desc: 'Multiple OTP verification attempts', icon: 'fa-key' },
  firstTimeInvest: { label: 'First Time', desc: 'First transaction of this type', icon: 'fa-clock' },
  abnormalBehavior: { label: 'Abnormal Behavior', desc: 'Deviation from usual transaction pattern', icon: 'fa-shield-exclamation' },
};

function RiskGauge({ score }: { score?: number }) {
  const s = score ?? 0;
  const color = s >= 80 ? '#ef4444' : s >= 50 ? '#f59e0b' : '#10b981';
  const rotation = -120 + (s / 100) * 240;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-14 overflow-hidden">
        <svg width="96" height="56" viewBox="0 0 96 56">
          <path d="M8 48 A40 40 0 0 1 88 48" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
          <path d="M8 48 A40 40 0 0 1 88 48" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${(s / 100) * 125.6} 125.6`} />
          <circle cx="48" cy="48" r="3" fill={color} />
          <line x1="48" y1="48" x2={48 + 32 * Math.cos((rotation - 90) * Math.PI / 180)}
            y2={48 + 32 * Math.sin((rotation - 90) * Math.PI / 180)} stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-lg font-bold" style={{ color }}>{s}/100</span>
      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
        {s >= 80 ? 'High Risk' : s >= 50 ? 'Medium Risk' : 'Low Risk'}
      </span>
    </div>
  );
}

const signalIcons: Record<string, string> = {
  newDevice: 'fa-laptop',
  rushedAction: 'fa-bolt',
  unusualAmount: 'fa-chart-line',
  otpRetries: 'fa-key',
  firstTimeInvest: 'fa-clock',
  abnormalBehavior: 'fa-shield-exclamation',
};

export default function TransactionDetailModal({ tx, onClose }: Props) {
  if (!tx) return null;

  const activeSignals = tx.signals
    ? Object.entries(tx.signals).filter(([, v]) => v).map(([k]) => k)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`p-5 text-white ${tx.status === 'BLOCKED' ? 'bg-gradient-to-r from-rose-600 to-red-700' :
          tx.status === 'DELAYED' ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
          'bg-gradient-to-r from-emerald-600 to-teal-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20">{tx.status}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20">{tx.riskLevel} RISK</span>
              </div>
              <h3 className="text-lg font-bold">Transaction Analysis</h3>
              <p className="text-xs text-white/70 mt-0.5">
                {new Date(tx.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
              <i className="fas fa-times text-sm" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Amount + Risk Score side by side */}
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Amount</p>
              <p className={`text-3xl font-black ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800 dark:text-white'}`}>
                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 capitalize">{tx.type} · {tx.category}</p>
            </div>
            <RiskGauge score={tx.score ?? (tx.riskLevel === 'HIGH' ? 85 : tx.riskLevel === 'MEDIUM' ? 55 : 15)} />
          </div>

          {/* Signals — Explainable AI factors */}
          {activeSignals.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <i className="fas fa-microchip text-primary" /> Risk Signals Detected
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeSignals.map((key) => {
                  const cfg = signalLabels[key] || { label: key, desc: '', icon: 'fa-circle' };
                  const isHigh = ['unusualAmount', 'abnormalBehavior', 'rushedAction'].includes(key);
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={key}
                      className={`p-3 rounded-xl border ${isHigh ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <i className={`fas ${signalIcons[key] || 'fa-circle'} ${isHigh ? 'text-rose-500' : 'text-amber-500'} text-xs`} />
                        <span className={`text-xs font-bold ${isHigh ? 'text-rose-700' : 'text-amber-700'}`}>{cfg.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 ml-5">{cfg.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Protection Decision */}
          {tx.decision && (
            <div className={`p-4 rounded-xl border ${
              tx.status === 'BLOCKED' ? 'bg-rose-50 border-rose-200' :
              tx.status === 'DELAYED' ? 'bg-amber-50 border-amber-200' :
              'bg-emerald-50 border-emerald-200'
            }`}>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <i className="fas fa-shield-halved text-primary" /> Protection Decision
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Decision Level</span>
                  <span className={`font-bold ${tx.decision.level === 'HIGH' ? 'text-rose-600' : tx.decision.level === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {tx.decision.level}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Action</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{tx.decision.action}</span>
                </div>
                {tx.decision.cooldown && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Cooldown</span>
                    <span className="font-bold text-amber-600">{tx.decision.cooldown}s</span>
                  </div>
                )}
                {tx.decision.delay && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Delay Applied</span>
                    <span className="font-bold text-rose-600">{tx.decision.delay}s</span>
                  </div>
                )}
                <div className="p-3 mt-2 rounded-lg bg-white/70 border border-white">
                  <p className="text-xs text-slate-600 italic">"{tx.decision.message}"</p>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Reference</span>
                  <span className="font-mono text-slate-500">{tx.decision.referenceId}</span>
                </div>
              </div>
            </div>
          )}

          {/* Full details grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Description</p>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-0.5">{tx.description}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Category</p>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-0.5">{tx.category}</p>
            </div>
          </div>

          {/* Safe transaction note */}
          {tx.status === 'ALLOWED' && tx.riskLevel === 'LOW' && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <i className="fas fa-check-circle text-emerald-500" />
              <p className="text-xs text-emerald-700 font-medium">Transaction passed all security checks — processed normally.</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <button onClick={onClose}
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
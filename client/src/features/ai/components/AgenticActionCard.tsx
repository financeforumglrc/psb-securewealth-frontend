import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { backendApi } from '@/shared/lib/backendApi';
import RegulatoryDisclaimer from '@/shared/components/ui/RegulatoryDisclaimer';

export type AgenticActionType = 'sweep' | 'rebalance' | 'sip_start';

interface Props {
  actionId: string;
  actionType: AgenticActionType;
  description: string;
  potentialGain: string;
  riskLevel: 'low' | 'medium' | 'high';
  onApprove?: () => void;
  onDismiss?: () => void;
}

const TYPE_META: Record<AgenticActionType, { icon: string; label: string; color: string; bg: string }> = {
  sweep: { icon: 'fa-arrow-right-arrow-left', label: 'Smart Sweep', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  rebalance: { icon: 'fa-scale-balanced', label: 'Auto Rebalance', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  sip_start: { icon: 'fa-calendar-plus', label: 'SIP Top-up', color: 'text-violet-600', bg: 'bg-violet-500/10' },
};

const RISK_COLORS = {
  low: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  high: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
};

function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    angle: (i / 24) * 360,
    distance: 60 + Math.random() * 80,
    color: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][i % 5],
    size: 4 + Math.random() * 4,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

export default function AgenticActionCard({
  actionId,
  actionType,
  description,
  potentialGain,
  riskLevel,
  onApprove,
  onDismiss,
}: Props) {
  const [status, setStatus] = useState<'idle' | 'executing' | 'done' | 'dismissed'>('idle');
  const [toast, setToast] = useState<string | null>(null);
  const meta = TYPE_META[actionType];

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async () => {
    setStatus('executing');
    try {
      const res = await backendApi.executeAgentAction({ actionId, approved: true });
      if (res.ok && res.data?.success) {
        setStatus('done');
        showToast(res.data.message || 'Action executed by Agentic AI');
        onApprove?.();
      } else {
        setStatus('idle');
        showToast(res.data?.error || 'Execution failed');
      }
    } catch {
      setStatus('idle');
      showToast('Network error. Please try again.');
    }
  };

  const handleDismiss = async () => {
    setStatus('dismissed');
    try {
      await backendApi.executeAgentAction({ actionId, approved: false });
    } catch {
      // ignore background dismiss call
    }
    onDismiss?.();
  };

  return (
    <>
      <RegulatoryDisclaimer compact className="mb-2" />
      <AnimatePresence>
        {status !== 'dismissed' && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg p-4"
          >
            <ConfettiBurst active={status === 'done'} />

            <div className="flex items-start gap-3 relative z-10">
              <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center ${meta.color} shrink-0`}>
                <i className={`fas ${meta.icon} text-sm`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{meta.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${RISK_COLORS[riskLevel]}`}>
                    {riskLevel} risk
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-1 leading-snug">{description}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  <i className="fas fa-arrow-trend-up mr-1" />
                  Potential gain: {potentialGain}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  {status === 'done' ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <i className="fas fa-check text-[10px]" />
                      </div>
                      Executed
                    </motion.div>
                  ) : (
                    <>
                      <button
                        onClick={handleApprove}
                        disabled={status === 'executing'}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1.5"
                      >
                        {status === 'executing' ? (
                          <>
                            <i className="fas fa-circle-notch fa-spin" /> Executing…
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check" /> Approve & Execute
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleDismiss}
                        className="px-3 py-1.5 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[11px] font-bold transition-colors"
                      >
                        <i className="fas fa-xmark mr-1" /> Dismiss
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-6 right-6 z-[100] px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold shadow-xl"
        >
          {toast}
        </motion.div>
      )}
    </>
  );
}

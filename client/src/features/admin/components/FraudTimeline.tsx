import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, MousePointer2, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { FraudCase, FraudHop } from '@/features/admin/lib/fraudTypes';

interface Props {
  cases: FraudCase[];
  selectedCase: FraudCase | null;
  onSelectCase: (c: FraudCase) => void;
}

export default function FraudTimeline({ cases, selectedCase, onSelectCase }: Props) {
  const { t } = useTranslation();
  const activeCase = selectedCase || cases[0];

  const allHops = useMemo(() => {
    if (activeCase) return activeCase.hops || [];
    return cases.slice(0, 20).flatMap(c => (c.hops || []).map(h => ({ ...h, caseRef: c.caseRef, caseId: c.id })));
  }, [activeCase, cases]);

  const sorted = useMemo(() => {
    return [...allHops].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [allHops]);

  if (!cases.length) {
    return <div className="p-10 text-center text-slate-500 dark:text-slate-400">No timeline data.</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          {activeCase ? `${t('fraudIntelTimelineTitle')} — ${activeCase.caseRef}` : t('fraudIntelTimelineTitle')}
        </h3>
        {!selectedCase && (
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <MousePointer2 className="w-3 h-3" /> {t('fraudIntelTimelineHint')}
          </span>
        )}
      </div>
      <div className="space-y-0">
        {sorted.map((h, i) => {
          const hop = h as FraudHop & { caseRef?: string; caseId?: number };
          const isLast = i === sorted.length - 1;
          return (
            <div key={`${hop.id}-${i}`} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full ${hop.isSanctioned ? 'bg-red-500' : hop.hopType === 'origin' ? 'bg-emerald-500' : hop.hopType === 'destination' ? 'bg-indigo-500' : 'bg-amber-500'}`} />
                {!isLast && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 my-1" />}
              </div>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="pb-5 flex-1"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(hop.timestamp).toLocaleString('en-IN')}</span>
                  {!activeCase && hop.caseRef && (
                    <button
                      onClick={() => onSelectCase(cases.find(c => c.id === hop.caseId) || cases[0])}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {hop.caseRef}
                    </button>
                  )}
                  {hop.isSanctioned && <AlertTriangle className="w-3 h-3 text-red-500" />}
                </div>
                <p className="text-sm font-medium">{hop.nodeName} — {hop.amount.toLocaleString('en-IN')} {hop.currency}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{hop.institution || hop.entityType} · {hop.entityValue}</p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

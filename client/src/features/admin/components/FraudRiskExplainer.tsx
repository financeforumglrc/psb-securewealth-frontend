import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { FraudCase } from '@/features/admin/lib/fraudTypes';

interface Props {
  cases: FraudCase[];
  selectedCase: FraudCase | null;
}

export default function FraudRiskExplainer({ cases, selectedCase }: Props) {
  const { t } = useTranslation();
  const activeCase = selectedCase || cases[0];

  const factorCounts = useMemo(() => {
    const map: Record<string, number> = {};
    cases.forEach(c => (c.riskFactors || []).forEach(f => { map[f] = (map[f] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [cases]);

  if (!activeCase) {
    return <div className="p-10 text-center text-slate-500 dark:text-slate-400">No case selected.</div>;
  }

  const factors = [
    { label: 'Base category risk', score: 25, color: 'bg-blue-500' },
    { label: 'Cross-border hops', score: 20, color: 'bg-indigo-500' },
    { label: 'Risk factor count', score: Math.min(25, (activeCase.riskFactors || []).length * 4), color: 'bg-amber-500' },
    { label: 'Sanctioned jurisdiction', score: activeCase.countryRiskTags.some(t => ['Belize', 'Panama', 'Russia'].includes(t)) ? 20 : 5, color: 'bg-red-500' },
    { label: 'Amount velocity', score: activeCase.riskFactors.includes('velocity_spike') ? 15 : 5, color: 'bg-purple-500' },
  ];

  const total = factors.reduce((a, b) => a + b.score, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm"
      >
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <ShieldAlert className="w-4 h-4 text-indigo-500" />
          Risk Breakdown — {activeCase.caseRef}
        </h3>
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
            <span className="text-3xl font-bold">{activeCase.riskScore}</span>
            <svg className="absolute inset-0 -rotate-90" width="128" height="128">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-200 dark:text-slate-700" />
              <circle
                cx="64" cy="64" r="58"
                stroke={activeCase.riskScore >= 80 ? '#ef4444' : activeCase.riskScore >= 60 ? '#f97316' : '#6366f1'}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${activeCase.riskScore * 3.64} 364`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <div className="space-y-3">
          {factors.map(f => (
            <div key={f.label}>
              <div className="flex justify-between text-xs mb-1">
                <span>{f.label}</span>
                <span className="font-semibold">+{f.score}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${f.color}`} style={{ width: `${(f.score / total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
          Total computed contribution: {total}. Final risk score is normalized and combined with model confidence.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm"
      >
        <h3 className="font-semibold mb-4">{t('fraudIntelRiskTopFactors')}</h3>
        <div className="space-y-2">
          {factorCounts.map(([factor, count]) => (
            <div key={factor} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-sm capitalize">{factor.replace(/_/g, ' ')}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">{count}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Attach to index for lazy export
export { FraudRiskExplainer };

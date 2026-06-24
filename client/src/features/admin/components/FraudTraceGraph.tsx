import { useMemo } from 'react';
import { Share2, MousePointer2 } from 'lucide-react';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { FraudCase } from '@/features/admin/lib/fraudTypes';

interface Props {
  cases: FraudCase[];
  selectedCase: FraudCase | null;
  onSelectCase: (c: FraudCase) => void;
}

export default function FraudTraceGraph({ cases, selectedCase, onSelectCase }: Props) {
  const { t } = useTranslation();
  const activeCase = selectedCase || cases[0];
  const hops = activeCase?.hops || [];

  const nodes = useMemo(() => {
    return hops.map((h, i) => ({
      id: h.id,
      x: 80 + i * 180,
      y: 160 + (i % 2 === 0 ? -40 : 40),
      label: h.nodeName,
      type: h.hopType,
      sanctioned: h.isSanctioned,
      amount: h.amount,
      currency: h.currency,
    }));
  }, [hops]);

  if (!activeCase) {
    return <div className="p-10 text-center text-slate-500 dark:text-slate-400">No cases to trace.</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Share2 className="w-4 h-4 text-indigo-500" />
          {t('fraudIntelTraceTitle')} — {activeCase.caseRef}
        </h3>
        {!selectedCase && (
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <MousePointer2 className="w-3 h-3" /> {t('fraudIntelTraceHint')}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <svg width={Math.max(800, nodes.length * 180)} height="320" className="block mx-auto">
          {/* edges */}
          {nodes.slice(0, -1).map((n, idx) => {
            const next = nodes[idx + 1];
            return (
              <g key={`edge-${n.id}`}>
                <line x1={n.x} y1={n.y} x2={next.x} y2={next.y} stroke="#94a3b8" strokeWidth={2} strokeDasharray="6,4" markerEnd="url(#arrow)" />
              </g>
            );
          })}
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="20" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#94a3b8" />
            </marker>
          </defs>
          {/* nodes */}
          {nodes.map((n) => {
            const color = n.sanctioned ? '#ef4444' : n.type === 'origin' ? '#10b981' : n.type === 'destination' ? '#6366f1' : '#f59e0b';
            return (
              <g key={n.id} transform={`translate(${n.x},${n.y})`} className="cursor-pointer" onClick={() => onSelectCase(activeCase)}>
                <circle r="24" fill={color} opacity="0.15" />
                <circle r="10" fill={color} stroke="#fff" strokeWidth="2" />
                <text y="-16" textAnchor="middle" className="fill-slate-700 dark:fill-slate-200 text-[11px] font-semibold">{n.label}</text>
                <text y="28" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[10px]">{n.amount.toLocaleString('en-IN')} {n.currency}</text>
                <text y="42" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500 text-[9px] uppercase">{n.type}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        {t('fraudIntelTraceDescription')}
      </p>
    </div>
  );
}

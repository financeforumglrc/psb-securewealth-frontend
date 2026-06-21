import { useState } from 'react';
import type { Recommendation } from '@/shared/types';

interface Props {
  rec: Recommendation;
}

export default function ExplainableTooltip({ rec }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="text-[10px] text-primary hover:text-primary/80 font-medium flex items-center gap-1"
      >
        <i className="fas fa-lightbulb" /> Why?
      </button>
      {open && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 text-xs">
          <p className="font-semibold text-slate-800 mb-2">Why am I seeing this?</p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <i className="fas fa-user text-primary mt-0.5" />
              <span className="text-slate-600">{rec.why.userPattern}</span>
            </div>
            <div className="flex gap-2">
              <i className="fas fa-chart-line text-secondary mt-0.5" />
              <span className="text-slate-600">{rec.why.marketCondition}</span>
            </div>
            <div className="flex gap-2">
              <i className="fas fa-cogs text-accent mt-0.5" />
              <span className="text-slate-600">{rec.why.ruleLogic}</span>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="mt-2 text-[10px] text-slate-400 hover:text-slate-600">Close</button>
        </div>
      )}
    </div>
  );
}

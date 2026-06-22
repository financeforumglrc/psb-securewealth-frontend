import { useMemo } from 'react';
import { findGroupForView } from '@/shared/config/navigation';

interface DecisionFlowStripProps {
  currentView: string;
}

const STEPS = [
  { id: 'app', label: 'Customer App', icon: 'fa-mobile-screen' },
  { id: 'twin', label: 'Wealth Intelligence Twin', icon: 'fa-brain' },
  { id: 'check', label: 'Wealth Protection Check', icon: 'fa-shield-halved' },
  { id: 'decision', label: 'Risk Decision', icon: 'fa-scale-balanced' },
  { id: 'action', label: 'Action / Simulation', icon: 'fa-play' },
];

export default function DecisionFlowStrip({ currentView }: DecisionFlowStripProps) {
  const activeStep = useMemo(() => {
    const group = findGroupForView(currentView);
    switch (group?.id) {
      case 'wealth-intelligence':
        return 1;
      case 'fraud-protection':
        return 2;
      case 'financial-tools':
        return 1;
      case 'lifestyle':
      case 'innovation':
        return 0;
      default:
        return 0;
    }
  }, [currentView]);

  return (
    <div className="bg-slate-50/80 border-b border-slate-200/80 dark:bg-slate-900/50 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {STEPS.map((step, idx) => {
            const isActive = idx === activeStep;
            const isPast = idx < activeStep;
            return (
              <div key={step.id} className="flex items-center gap-2 shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold transition-colors ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-white text-slate-500 border-slate-200'
                  }`}
                >
                  <i className={`fas ${step.icon}`} />
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <i className="fas fa-chevron-right text-[8px] text-slate-300 hidden sm:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

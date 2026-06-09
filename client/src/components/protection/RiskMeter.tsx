import { useEffect, useState } from 'react';
import { calculateProtectionScore } from '../../hooks/useProtectionEngine';
import type { RiskSignals } from '../../types';

interface Props {
  signals: RiskSignals;
}

export default function RiskMeter({ signals }: Props) {
  const targetScore = calculateProtectionScore(signals);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 600;
    const start = displayScore;
    const diff = targetScore - start;
    const startTime = performance.now();
    let raf: number;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(start + diff * eased));
      if (progress < 1) raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [targetScore]);

  const color = displayScore < 60 ? 'text-emerald-500' : displayScore < 80 ? 'text-amber-500' : 'text-rose-500';
  const bg = displayScore < 60 ? 'bg-emerald-500' : displayScore < 80 ? 'bg-amber-500' : 'bg-rose-500';
  const label = displayScore < 60 ? 'LOW' : displayScore < 80 ? 'MEDIUM' : 'HIGH';
  const activeSignals = Object.entries(signals).filter(([, v]) => v);

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
        <i className="fas fa-shield-halved text-primary mr-2" /> Protection Score
      </h3>
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path className="text-slate-100 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
            <path
              className={`${color} transition-all duration-700 ease-out`}
              strokeDasharray={`${displayScore}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${color}`}>{displayScore}</span>
            <span className="text-[10px] text-slate-400">/ 100</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${bg}`}>{label} RISK</span>
      </div>
      <div className="space-y-2 text-xs">
        {Object.entries(signals).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            <i className={`fas fa-${val ? 'triangle-exclamation text-danger' : 'check-circle text-success'}`} />
          </div>
        ))}
      </div>
      {activeSignals.length > 0 && (
        <div className="mt-3 p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-800">
          <p className="text-[10px] text-rose-600 dark:text-rose-300 font-medium">
            <i className="fas fa-bolt mr-1" />
            {activeSignals.length} signal{activeSignals.length > 1 ? 's' : ''} active: +{targetScore} pts
          </p>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import type { ProtectionDecision } from '../../types';

interface Props {
  decision: ProtectionDecision;
  onProceed: () => void;
  onCancel: () => void;
}

export default function ProtectionModal({ decision, onProceed, onCancel }: Props) {
  const [countdown, setCountdown] = useState(decision.cooldown || 0);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (decision.level !== 'MEDIUM' || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [decision.level, countdown]);

  if (decision.level === 'LOW') {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce">
        <i className="fas fa-check-circle" />
        <span className="text-sm">{decision.message}</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-md w-full p-6" style={{ animation: 'modalIn 0.3s ease-out' }}>
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${decision.level === 'HIGH' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
          <i className={`fas fa-${decision.level === 'HIGH' ? 'shield-virus' : 'triangle-exclamation'} text-2xl`} />
        </div>
        <h3 className="text-xl font-bold text-center text-slate-800 dark:text-white mb-2">
          {decision.level === 'HIGH' ? 'Action Blocked' : 'Security Warning'}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 text-center mb-4">{decision.message}</p>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 mb-4 text-xs text-slate-500">
          <p><strong>Reference ID:</strong> {decision.referenceId}</p>
          <p><strong>Time:</strong> {new Date().toLocaleString('en-IN')}</p>
        </div>

        {decision.level === 'MEDIUM' && (
          <>
            <label className="flex items-start gap-2 mb-4 cursor-pointer">
              <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 accent-primary" />
              <span className="text-xs text-slate-600 dark:text-slate-300">I understand this action is flagged and I still want to proceed.</span>
            </label>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${((decision.cooldown! - countdown) / decision.cooldown!) * 100}%` }} />
            </div>
            <button
              onClick={onProceed}
              disabled={!checked || countdown > 0}
              className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {countdown > 0 ? `Proceed in ${countdown}s` : 'Proceed'}
            </button>
          </>
        )}

        {decision.level === 'HIGH' && (
          <button onClick={onCancel} className="w-full py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors">
            Contact Support
          </button>
        )}

        <button onClick={onCancel} className="w-full mt-2 py-2 text-xs text-slate-400 hover:text-slate-600">
          Cancel Action
        </button>
      </div>
    </div>
  );
}

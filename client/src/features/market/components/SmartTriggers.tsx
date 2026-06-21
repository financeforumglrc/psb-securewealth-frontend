import { useState, useEffect } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import type { InvestmentTrigger } from '@/shared/types';

export default function SmartTriggers() {
  const triggers = useWealthStore((s) => s.triggers);
  const toggleTrigger = useWealthStore((s) => s.toggleTrigger);
  const dismissTrigger = useWealthStore((s) => s.dismissTrigger);
  const fireTrigger = useWealthStore((s) => s.fireTrigger);
  const [showFireModal, setShowFireModal] = useState<InvestmentTrigger | null>(null);
  const [demoFired, setDemoFired] = useState(false);

  // Auto-show fired triggers on mount
  useEffect(() => {
    const fired = triggers.find((t) => t.fired && !t.dismissed);
    if (fired && !demoFired) {
      setShowFireModal(fired);
      setDemoFired(true);
    }
  }, [triggers, demoFired]);

  function getProgressColor(progress: number) {
    if (progress >= 100) return 'bg-emerald-500';
    if (progress >= 70) return 'bg-amber-500';
    return 'bg-primary';
  }

  function getProgressLabel(trigger: InvestmentTrigger) {
    if (trigger.fired && !trigger.dismissed) return { text: 'TRIGGERED!', class: 'bg-emerald-100 text-emerald-700 animate-pulse' };
    if (!trigger.enabled) return { text: 'Paused', class: 'bg-slate-100 text-slate-500' };
    if (trigger.progress >= 70) return { text: 'Approaching', class: 'bg-amber-100 text-amber-700' };
    return { text: 'Monitoring', class: 'bg-primary/10 text-primary' };
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
            <i className="fas fa-bolt text-accent mr-2" />
            Smart Investment Triggers
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Auto-execute rules based on market conditions</p>
        </div>
        <button
          onClick={() => {
            const buyDip = triggers.find((t) => t.id === 'trigger-1');
            if (buyDip) {
              fireTrigger('trigger-1');
              setShowFireModal({ ...buyDip, fired: true, progress: 100 });
            }
          }}
          className="text-xs px-3 py-1.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors font-medium"
        >
          <i className="fas fa-vial mr-1" /> Demo Fire
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {triggers.map((trigger) => {
          const badge = getProgressLabel(trigger);
          return (
            <div key={trigger.id} className={`card border transition-all ${trigger.fired && !trigger.dismissed ? 'border-emerald-300 shadow-lg shadow-emerald-500/10' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${trigger.color} text-white flex items-center justify-center`}>
                  <i className={`fas ${trigger.icon}`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badge.class}`}>{badge.text}</span>
                  <button
                    onClick={() => toggleTrigger(trigger.id)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${trigger.enabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${trigger.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>

              <h4 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">{trigger.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{trigger.description}</p>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{trigger.currentValue}</span>
                  <span>{trigger.targetValue}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getProgressColor(trigger.progress)}`}
                    style={{ width: `${trigger.progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 text-right">{trigger.progress}% to trigger</p>
              </div>

              {/* Action row */}
              {trigger.fired && !trigger.dismissed ? (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => setShowFireModal(trigger)}
                    className="flex-1 py-2 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    <i className="fas fa-check mr-1" /> Review & Confirm
                  </button>
                  <button
                    onClick={() => dismissTrigger(trigger.id)}
                    className="px-3 py-2 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-400"
                  >
                    Dismiss
                  </button>
                </div>
              ) : trigger.enabled && trigger.progress >= 70 && trigger.progress < 100 ? (
                <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <i className="fas fa-triangle-exclamation" />
                  Getting close! Watch this space.
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Trigger Fired Modal */}
      {showFireModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-3 animate-bounce">
              <i className="fas fa-rocket text-3xl text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 dark:text-white mb-1">
              Trigger Fired!
            </h3>
            <p className="text-center text-sm text-slate-500 mb-4">
              Your <span className="font-semibold text-primary">{showFireModal.name}</span> condition was met.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Condition</span>
                <span className="font-medium text-slate-800 dark:text-white">{showFireModal.condition}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Detected</span>
                <span className="font-medium text-emerald-600">{showFireModal.currentValue}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Suggested Action</span>
                <span className="font-medium text-slate-800 dark:text-white">{showFireModal.action}</span>
              </div>
            </div>

            {showFireModal.id === 'trigger-1' && (
              <div className="bg-primary/5 rounded-xl p-4 mb-4 border border-primary/20">
                <p className="text-sm font-medium text-primary mb-1">
                  <i className="fas fa-chart-line mr-1" /> NIFTY dropped 3.2% yesterday
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Your ₹10,000 additional SIP into Axis Bluechip Fund is ready to execute.
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Fund:</span>
                  <span className="font-medium text-slate-800 dark:text-white">Axis Bluechip Fund (G)</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Amount:</span>
                  <span className="font-medium text-slate-800 dark:text-white">₹10,000</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Expected NAV:</span>
                  <span className="font-medium text-slate-800 dark:text-white">₹42.15 (down 3.2%)</span>
                </div>
              </div>
            )}

            {showFireModal.id === 'trigger-3' && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 mb-4 border border-emerald-200">
                <p className="text-sm font-medium text-emerald-700 mb-1">
                  <i className="fas fa-building-columns mr-1" /> High FD rate detected!
                </p>
                <div className="space-y-2 mt-2">
                  {[
                    { bank: 'IDFC First Bank', rate: '8.10%', tenure: '2 years' },
                    { bank: 'RBL Bank', rate: '8.05%', tenure: '18 months' },
                    { bank: 'DCB Bank', rate: '8.00%', tenure: '3 years' },
                  ].map((fd) => (
                    <div key={fd.bank} className="flex items-center justify-between text-xs bg-white dark:bg-slate-800 rounded-lg p-2">
                      <span className="text-slate-700 dark:text-slate-200">{fd.bank}</span>
                      <span className="font-bold text-emerald-600">{fd.rate} <span className="text-slate-400 font-normal">({fd.tenure})</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => { dismissTrigger(showFireModal.id); setShowFireModal(null); }}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                <i className="fas fa-check mr-2" /> Confirm & Execute
              </button>
              <button
                onClick={() => { dismissTrigger(showFireModal.id); setShowFireModal(null); }}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-400"
              >
                Dismiss for now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

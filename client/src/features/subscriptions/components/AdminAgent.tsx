import { useState } from 'react';
import { simulateCancellation, simulateNegotiation, type AgentStep } from '@/shared/services/agentService';
import { useWealthStore } from '@/shared/store/wealthStore';
import type { Subscription } from '@/shared/types';

interface AdminAgentProps {
  subscription: Subscription;
  onComplete: () => void;
}

export default function AdminAgent({ subscription, onComplete }: AdminAgentProps) {
  const [mode, setMode] = useState<'idle' | 'running' | 'done'>('idle');
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [result, setResult] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const cancelSubscription = useWealthStore((s) => s.cancelSubscription);
  const pauseSubscription = useWealthStore((s) => s.pauseSubscription);

  const startCancellation = async () => {
    setMode('running');
    const res = await simulateCancellation(subscription.name);
    setSteps(res.steps);
    setResult(res.message);
    setSuccess(res.success);
    setMode('done');
    if (res.success) {
      cancelSubscription(subscription.id);
    }
  };

  const startNegotiation = async () => {
    setMode('running');
    const res = await simulateNegotiation(subscription.name);
    setSteps(res.steps);
    setResult(res.message);
    setSuccess(res.success);
    setMode('done');
    if (res.success && res.message.includes('pause')) {
      pauseSubscription(subscription.id);
    }
  };

  if (mode === 'idle') {
    return (
      <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <i className="fas fa-robot" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Financial Life Admin Agent</h4>
            <p className="text-[10px] text-slate-400">AI-powered subscription management</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
          I can try to cancel or negotiate your <strong>{subscription.name}</strong> subscription automatically.
        </p>
        <div className="flex gap-2">
          <button
            onClick={startCancellation}
            className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <i className="fas fa-ban" /> Cancel It
          </button>
          <button
            onClick={startNegotiation}
            className="flex-1 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <i className="fas fa-handshake" /> Negotiate
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'running') {
    return (
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-800 dark:text-white">Agent is working on {subscription.name}...</span>
        </div>
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 p-2.5 rounded-lg transition-all ${
              step.status === 'running'
                ? 'bg-primary/5 border border-primary/20'
                : step.status === 'done'
                ? 'opacity-60'
                : 'opacity-30'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                step.status === 'done'
                  ? 'bg-emerald-500 text-white'
                  : step.status === 'running'
                  ? 'bg-primary text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step.status === 'done' ? '✓' : idx + 1}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{step.title}</p>
              <p className="text-[10px] text-slate-500">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border ${success ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800'}`}>
      <div className="flex items-center gap-2 mb-2">
        <i className={`fas ${success ? 'fa-check-circle text-emerald-500' : 'fa-circle-info text-amber-500'} text-lg`} />
        <h4 className="text-sm font-bold text-slate-800 dark:text-white">Agent Result</h4>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">{result}</p>
      <button
        onClick={onComplete}
        className="w-full py-2 bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition-colors"
      >
        Done
      </button>
    </div>
  );
}

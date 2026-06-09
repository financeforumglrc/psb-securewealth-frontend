import { useState } from 'react';

interface DemoState {
  deviceTrust: boolean;
  highUrgency: boolean;
  newSession: boolean;
  otpSpeed: number;
  highVolatility: boolean;
  skipOTP: boolean;
}

const DEFAULT_STATE: DemoState = {
  deviceTrust: true,
  highUrgency: false,
  newSession: false,
  otpSpeed: 4.0,
  highVolatility: false,
  skipOTP: false,
};

export function useDemoControls() {
  const [state, setState] = useState<DemoState>(() => {
    const saved = localStorage.getItem('sw_demo_controls');
    return saved ? JSON.parse(saved) : DEFAULT_STATE;
  });

  const update = (patch: Partial<DemoState>) => {
    const next = { ...state, ...patch };
    setState(next);
    localStorage.setItem('sw_demo_controls', JSON.stringify(next));
  };

  const reset = () => {
    setState(DEFAULT_STATE);
    localStorage.setItem('sw_demo_controls', JSON.stringify(DEFAULT_STATE));
  };

  return { state, update, reset };
}

export default function DemoControls() {
  const [open, setOpen] = useState(false);
  const { state, update, reset } = useDemoControls();

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open && (
        <div className="mb-3 w-64 bg-white dark:bg-dark-light rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 dark:text-white"><i className="fas fa-sliders mr-1" />Demo Controls</span>
            <button onClick={reset} className="text-[10px] text-primary hover:underline">Reset All</button>
          </div>
          <div className="space-y-2">
            <label className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300 cursor-pointer">
              <span>Simulate New Device</span>
              <input type="checkbox" checked={!state.deviceTrust} onChange={(e) => update({ deviceTrust: !e.target.checked })} className="accent-primary w-3.5 h-3.5" />
            </label>
            <label className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300 cursor-pointer">
              <span>Simulate High Urgency</span>
              <input type="checkbox" checked={state.highUrgency} onChange={(e) => update({ highUrgency: e.target.checked })} className="accent-primary w-3.5 h-3.5" />
            </label>
            <label className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300 cursor-pointer">
              <span>New Session (&lt;5 min)</span>
              <input type="checkbox" checked={state.newSession} onChange={(e) => update({ newSession: e.target.checked })} className="accent-primary w-3.5 h-3.5" />
            </label>
            <label className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300 cursor-pointer">
              <span>Skip OTP (Fast Demo)</span>
              <input type="checkbox" checked={state.skipOTP} onChange={(e) => update({ skipOTP: e.target.checked })} className="accent-primary w-3.5 h-3.5" />
            </label>
            <div>
              <span className="text-[10px] text-slate-600 dark:text-slate-300">OTP Speed: <strong>{state.otpSpeed.toFixed(1)}s</strong></span>
              <input
                type="range" min={1.5} max={8} step={0.1} value={state.otpSpeed}
                onChange={(e) => update({ otpSpeed: parseFloat(e.target.value) })}
                className="w-full accent-primary h-1 mt-1"
              />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 text-[10px] text-slate-400">
            Use these toggles to demonstrate different risk scenarios during your presentation.
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
        title="Demo Controls"
      >
        <i className="fas fa-sliders" />
      </button>
    </div>
  );
}

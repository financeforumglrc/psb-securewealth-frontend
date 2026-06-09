import { useState, useMemo } from 'react';
import { useWealthStore } from '../../store/wealthStore';

export default function WhatIfSimulator() {
  const [open, setOpen] = useState(false);
  const [savings, setSavings] = useState(28000);
  const [ret, setRet] = useState(12);
  const assets = useWealthStore((s) => s.assets);
  const currentNW = useMemo(() => assets.reduce((sum, a) => sum + a.value, 0), [assets]);

  const monthlyRate = ret / 100 / 12;
  const y1 = useMemo(() => {
    let v = currentNW;
    for (let m = 0; m < 12; m++) v = v * (1 + monthlyRate) + savings;
    return Math.round(v);
  }, [currentNW, savings, monthlyRate]);

  const y5 = useMemo(() => {
    let v = currentNW;
    for (let m = 0; m < 60; m++) v = v * (1 + monthlyRate) + savings;
    return Math.round(v);
  }, [currentNW, savings, monthlyRate]);

  const extra = savings - 28000;
  const insight = extra > 0
    ? `Saving an extra ₹${extra.toLocaleString()}/month grows your net worth by ₹${(y5 - currentNW).toLocaleString()} in 5 years.`
    : extra < 0
    ? `Reducing savings by ₹${Math.abs(extra).toLocaleString()}/month costs you significantly over 5 years.`
    : `At your current savings rate, you'll reach ₹${y5.toLocaleString()} in 5 years.`;

  return (
    <>
      <button onClick={() => setOpen(true)} className="card text-left hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
            <i className="fas fa-wand-magic-sparkles" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">What-If Simulator</h3>
            <p className="text-[10px] text-slate-400">See how small changes impact your future</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Try different savings rates and returns to see projected net worth.</p>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-primary to-secondary p-5 text-white">
              <h3 className="text-lg font-bold"><i className="fas fa-wand-magic-sparkles mr-2" />What-If Simulator</h3>
              <p className="text-xs text-white/80 mt-1">See how small changes impact your future net worth.</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  <span>Monthly Savings</span>
                  <span className="text-primary font-bold">₹{savings.toLocaleString()}</span>
                </label>
                <input type="range" min={5000} max={100000} step={1000} value={savings} onChange={(e) => setSavings(parseInt(e.target.value))} className="w-full accent-primary h-1.5" />
              </div>
              <div>
                <label className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  <span>Expected Return</span>
                  <span className="text-primary font-bold">{ret}%</span>
                </label>
                <input type="range" min={6} max={18} step={0.5} value={ret} onChange={(e) => setRet(parseFloat(e.target.value))} className="w-full accent-primary h-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-center">
                  <p className="text-[10px] text-slate-500">1 Year Projection</p>
                  <p className="text-lg font-bold text-primary mt-1">₹{(y1 / 1e5).toFixed(1)}L</p>
                </div>
                <div className="p-3 bg-secondary/5 rounded-xl border border-secondary/10 text-center">
                  <p className="text-[10px] text-slate-500">5 Year Projection</p>
                  <p className="text-lg font-bold text-secondary mt-1">₹{(y5 / 1e5).toFixed(1)}L</p>
                </div>
              </div>
              <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 text-[11px] text-amber-700 dark:text-amber-300">
                <i className="fas fa-lightbulb mr-1" />{insight}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => setOpen(false)} className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

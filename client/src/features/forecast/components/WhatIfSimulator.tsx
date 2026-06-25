import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';

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

  // Life-shock simulator
  const [activeShock, setActiveShock] = useState<null | { id: string; label: string; amount: number }>(null);
  const user = useWealthStore((s) => s.user);
  const goals = useWealthStore((s) => s.goals);
  const monthlyExpenses = user.monthlyExpenses || 35000;
  const emergencyGoal = goals.find((g) => g.name.toLowerCase().includes('emergency'));
  const emergencyFund = emergencyGoal?.currentAmount || 125000;
  const liquidAssets = assets.filter((a) => a.liquidity === 'high' || a.type === 'bank');
  const digitalGoldAssets = assets.filter((a) => a.name.toLowerCase().includes('digital gold') || a.name.toLowerCase().includes('crypto'));
  const fdAssets = assets.filter((a) => a.name.toLowerCase().includes('fd') || a.name.toLowerCase().includes('fixed deposit'));
  const liquidBuffer = liquidAssets.reduce((s, a) => s + a.value, 0) + emergencyFund;
  const digitalGoldBuffer = digitalGoldAssets.reduce((s, a) => s + a.value, 0);
  const fdBuffer = fdAssets.reduce((s, a) => s + a.value, 0);

  const SHOCKS = [
    { id: 'job-loss', label: 'Job Loss (4 months)', amount: monthlyExpenses * 4, icon: 'fa-briefcase' },
    { id: 'medical', label: 'Medical Emergency', amount: 800000, icon: 'fa-heart-pulse' },
    { id: 'market-crash', label: 'Market Crash (-30%)', amount: Math.round(currentNW * 0.3), icon: 'fa-chart-line' },
  ];

  const shockPlan = useMemo(() => {
    if (!activeShock) return null;
    let remaining = activeShock.amount;
    const steps: { source: string; amount: number; note?: string }[] = [];

    const useEmergency = Math.min(remaining, emergencyFund);
    if (useEmergency > 0) {
      steps.push({ source: 'Emergency Fund', amount: useEmergency, note: `${Math.floor(emergencyFund / monthlyExpenses)} months expenses` });
      remaining -= useEmergency;
    }

    const useLiquid = Math.min(remaining, liquidBuffer - emergencyFund);
    if (useLiquid > 0) {
      steps.push({ source: 'Liquid Savings', amount: useLiquid, note: 'Instant access, no penalty' });
      remaining -= useLiquid;
    }

    const useDigitalGold = Math.min(remaining, digitalGoldBuffer);
    if (useDigitalGold > 0) {
      const saved = Math.round(useDigitalGold * 0.015);
      steps.push({ source: 'Digital Gold', amount: useDigitalGold, note: `Saves ~₹${saved.toLocaleString('en-IN')} vs breaking FD` });
      remaining -= useDigitalGold;
    }

    const useFd = Math.min(remaining, fdBuffer);
    if (useFd > 0) {
      const penalty = Math.round(useFd * 0.01);
      steps.push({ source: 'Fixed Deposit', amount: useFd, note: `Penalty ~₹${penalty.toLocaleString('en-IN')}` });
      remaining -= useFd;
    }

    const shortfall = remaining;
    return { steps, shortfall, isCovered: shortfall <= 0 };
  }, [activeShock, emergencyFund, liquidBuffer, digitalGoldBuffer, fdBuffer, monthlyExpenses]);

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

              {/* Life-Shock Auto-Remediation */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                  <i className="fas fa-kit-medical text-rose-500" /> Life-Shock Simulator
                </h4>
                <p className="text-[10px] text-slate-500 mb-2">Test real emergencies and get an AI rescue plan.</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {SHOCKS.map((shock) => (
                    <button
                      key={shock.id}
                      onClick={() => setActiveShock(activeShock?.id === shock.id ? null : shock)}
                      className={`p-2 rounded-lg text-[10px] font-bold border transition-colors flex flex-col items-center gap-1 ${
                        activeShock?.id === shock.id
                          ? 'bg-rose-100 dark:bg-rose-900/20 border-rose-300 text-rose-700 dark:text-rose-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <i className={`fas ${shock.icon}`} />
                      {shock.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {activeShock && shockPlan && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 mb-3">
                        <p className="text-xs text-rose-800 dark:text-rose-200 font-bold mb-1">
                          {activeShock.label}: ₹{activeShock.amount.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300">
                          {shockPlan.isCovered
                            ? 'Your buffers can absorb this shock. Long-term wealth stays intact.'
                            : `Shortfall of ₹${shockPlan.shortfall.toLocaleString('en-IN')}. Consider a low-interest loan against FD instead of equity redemption.`}
                        </p>
                      </div>

                      <div className="space-y-2 mb-3">
                        {shockPlan.steps.map((step, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                              <div>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{step.source}</p>
                                {step.note && <p className="text-[9px] text-slate-400">{step.note}</p>}
                              </div>
                            </div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">₹{step.amount.toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setActiveShock(null)}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold"
                      >
                        <i className="fas fa-rotate-left mr-1" /> Reset Scenario
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
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

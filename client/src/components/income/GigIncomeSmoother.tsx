import { useState, useMemo, useCallback } from 'react';

interface MonthIncome {
  month: string;
  amount: number;
}

const DEFAULT_INCOME: MonthIncome[] = [
  { month: 'Jun 2025', amount: 80000 },
  { month: 'Jul 2025', amount: 120000 },
  { month: 'Aug 2025', amount: 45000 },
  { month: 'Sep 2025', amount: 200000 },
  { month: 'Oct 2025', amount: 60000 },
  { month: 'Nov 2025', amount: 150000 },
  { month: 'Dec 2025', amount: 90000 },
  { month: 'Jan 2026', amount: 180000 },
  { month: 'Feb 2026', amount: 55000 },
  { month: 'Mar 2026', amount: 130000 },
  { month: 'Apr 2026', amount: 70000 },
  { month: 'May 2026', amount: 160000 },
];

const SMOOTH_KEY = 'sw_gig_smoothing';

function loadData(): MonthIncome[] {
  try { return JSON.parse(localStorage.getItem(SMOOTH_KEY) || 'null') || DEFAULT_INCOME; } catch { return DEFAULT_INCOME; }
}
function saveData(d: MonthIncome[]) { localStorage.setItem(SMOOTH_KEY, JSON.stringify(d)); }

export default function GigIncomeSmoother() {
  const [income, setIncome] = useState<MonthIncome[]>(loadData);
  const [paused, setPaused] = useState(false);
  const [simMonth, setSimMonth] = useState(120000);

  const avg = useMemo(() => income.reduce((s, m) => s + m.amount, 0) / income.length, [income]);
  const buffer = avg * 0.1;
  const smoothSalary = Math.max(0, Math.round(avg - buffer));
  const maxIncome = Math.max(...income.map((m) => m.amount), 1);

  const updateMonth = useCallback((idx: number, val: number) => {
    setIncome((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], amount: val };
      saveData(next);
      return next;
    });
  }, []);

  const projection = useMemo(() => {
    const next6 = [];
    for (let i = 0; i < 6; i++) {
      const projected = Math.round(avg + (Math.random() - 0.5) * avg * 0.4);
      next6.push({ month: `Month ${i + 1}`, amount: projected, smooth: smoothSalary });
    }
    return next6;
  }, [avg, smoothSalary]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-wave-square text-teal-500" /> Gig Income Smoother
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Turn irregular income into a predictable monthly salary</p>
        </div>
        <button
          onClick={() => setPaused((p) => !p)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            paused ? 'bg-amber-500 text-white' : 'bg-teal-500 text-white'
          }`}
        >
          <i className={`fas ${paused ? 'fa-pause' : 'fa-play'}`} />
          {paused ? 'PAUSED' : 'ACTIVE'}
        </button>
      </div>

      {/* Smooth Salary Card */}
      <div className="card bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/10 dark:to-cyan-900/10 border-2 border-teal-200 dark:border-teal-800">
        <div className="text-center">
          <p className="text-xs text-teal-600 dark:text-teal-400 font-medium uppercase tracking-wide">Your Synthetic Monthly Salary</p>
          <p className="text-4xl font-bold text-teal-800 dark:text-teal-300 mt-1">₹{smoothSalary.toLocaleString()}</p>
          <p className="text-xs text-teal-500 mt-1">
            Average ₹{Math.round(avg).toLocaleString()} — 10% safety buffer = ₹{Math.round(buffer).toLocaleString()}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/60 dark:bg-white/5 rounded-xl text-center">
            <p className="text-lg font-bold text-teal-700 dark:text-teal-400">
              ₹{income.reduce((s, m) => s + Math.max(0, m.amount - smoothSalary), 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-teal-500">Excess Saved (Buffer)</p>
          </div>
          <div className="p-3 bg-white/60 dark:bg-white/5 rounded-xl text-center">
            <p className="text-lg font-bold text-teal-700 dark:text-teal-400">
              ₹{income.reduce((s, m) => s + Math.max(0, smoothSalary - m.amount), 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-teal-500">Draws from Buffer</p>
          </div>
        </div>
      </div>

      {/* Income Chart */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">
          <i className="fas fa-chart-bar text-primary mr-2" /> Last 12 Months Income
        </h3>
        <div className="flex items-end gap-2 h-40 mb-2">
          {income.map((m, i) => {
            const h = (m.amount / maxIncome) * 100;
            const isAbove = m.amount > smoothSalary;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end relative" style={{ height: '120px' }}>
                  {isAbove && (
                    <div className="absolute w-full bg-teal-200 dark:bg-teal-800/30 rounded-t" style={{ bottom: `${(smoothSalary / maxIncome) * 100}%`, height: `${((m.amount - smoothSalary) / maxIncome) * 100}%` }} />
                  )}
                  <div className={`w-full rounded-t ${isAbove ? 'bg-teal-500' : 'bg-amber-400'}`} style={{ height: `${Math.min(h, (smoothSalary / maxIncome) * 100)}%` }} />
                </div>
                <span className="text-[9px] text-slate-400 -rotate-45 origin-top-left translate-y-2">{m.month.slice(0, 3)}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-4">
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-teal-500 rounded-sm" /> Above smooth salary (saves to buffer)</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-400 rounded-sm" /> Below smooth salary (draws from buffer)</span>
        </div>
      </div>

      {/* Income Editor */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">
          <i className="fas fa-pen-to-square text-primary mr-2" /> Edit Income History
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {income.map((m, i) => (
            <div key={i} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-[10px] text-slate-400 mb-1">{m.month}</p>
              <input
                type="number"
                value={m.amount}
                onChange={(e) => updateMonth(i, Number(e.target.value))}
                className="w-full px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm font-medium"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Projection Simulator */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">
          <i className="fas fa-wand-magic-sparkles text-primary mr-2" /> What-If Simulator
        </h3>
        <div className="mb-4">
          <label className="text-xs text-slate-500 block mb-1">Simulate next month's income</label>
          <input
            type="range"
            min={0}
            max={300000}
            step={5000}
            value={simMonth}
            onChange={(e) => setSimMonth(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>₹0</span>
            <span className="font-bold text-teal-600">₹{simMonth.toLocaleString()}</span>
            <span>₹3L</span>
          </div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">Smooth salary you receive:</span>
            <span className="font-bold text-teal-700 dark:text-teal-400">₹{smoothSalary.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-slate-600 dark:text-slate-300">Actual income this month:</span>
            <span className="font-bold text-slate-800 dark:text-white">₹{simMonth.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-slate-600 dark:text-slate-300">Buffer movement:</span>
            <span className={`font-bold ${simMonth > smoothSalary ? 'text-teal-600' : 'text-amber-600'}`}>
              {simMonth > smoothSalary ? `+₹${(simMonth - smoothSalary).toLocaleString()} saved` : `-₹${(smoothSalary - simMonth).toLocaleString()} drawn`}
            </span>
          </div>
        </div>
      </div>

      {/* 6-Month Projection */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">
          <i className="fas fa-chart-line text-primary mr-2" /> Forward Projection
        </h3>
        <div className="space-y-2">
          {projection.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-16">{p.month}</span>
              <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <div className="absolute h-full bg-teal-500/30 rounded-full" style={{ width: `${(p.amount / 300000) * 100}%` }} />
                <div className="absolute h-full border-r-2 border-dashed border-teal-600" style={{ left: `${(p.smooth / 300000) * 100}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-16 text-right">₹{(p.amount / 1000).toFixed(0)}K</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-2">
          <i className="fas fa-circle text-teal-500 text-[8px] mr-1" /> Solid area = projected income · Dashed line = smooth salary
        </p>
      </div>
    </div>
  );
}

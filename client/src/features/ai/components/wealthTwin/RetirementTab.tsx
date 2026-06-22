import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTwinContext } from './WealthTwinContext';

export default function RetirementTab() {
  const {
    retirementAge,
    setRetirementAge,
    monthlyPensionNeed,
    setMonthlyPensionNeed,
    retirementProjection,
    fireNumber,
    formatCr,
  } = useTwinContext();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4"><i className="fas fa-umbrella-beach text-secondary mr-2" />Retirement Trajectory</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={retirementProjection.data}>
                <defs>
                  <linearGradient id="retireGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="age" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tickFormatter={(v) => `₹${(Number(v) / 1e7).toFixed(1)}Cr`} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                <Area type="monotone" dataKey="netWorth" name="Projected Corpus" stroke="#f59e0b" strokeWidth={2} fill="url(#retireGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h4 className="font-semibold text-slate-800 dark:text-white mb-3">FIRE Calculator</h4>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase">Desired Retirement Age</label>
                <input
                  type="range"
                  min={40}
                  max={70}
                  step={1}
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(Number(e.target.value))}
                  className="w-full accent-secondary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1"
                />
                <p className="text-lg font-bold text-secondary">{retirementAge} years</p>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase">Monthly Pension Needed</label>
                <input
                  type="range"
                  min={20000}
                  max={500000}
                  step={5000}
                  value={monthlyPensionNeed}
                  onChange={(e) => setMonthlyPensionNeed(Number(e.target.value))}
                  className="w-full accent-secondary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1"
                />
                <p className="text-lg font-bold text-secondary">₹{monthlyPensionNeed.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-amber-50 to-secondary/10 dark:from-amber-900/10 dark:to-secondary/10 border border-amber-100 dark:border-amber-800/20">
            <p className="text-[10px] text-slate-500 uppercase font-bold">FIRE Number (25x rule)</p>
            <p className="text-2xl font-black text-amber-600">{formatCr(fireNumber)}</p>
            <p className="text-xs text-slate-500 mt-1">Corpus needed to retire at {retirementAge}</p>
          </div>

          <div className="card bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Projected Corpus at {retirementAge}</p>
            <p className={`text-2xl font-black ${retirementProjection.shortfall === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCr(retirementProjection.finalNW)}
            </p>
            {retirementProjection.shortfall > 0 ? (
              <p className="text-xs text-rose-600 mt-1">Shortfall: {formatCr(retirementProjection.shortfall)}</p>
            ) : (
              <p className="text-xs text-emerald-600 mt-1"><i className="fas fa-check-circle mr-1" /> FIRE achievable!</p>
            )}
          </div>

          {retirementProjection.shortfall > 0 && (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-800/20">
              <p className="text-xs font-bold text-rose-700 dark:text-rose-300">AI Suggestion</p>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">
                Increase monthly SIP by ₹{Math.round(retirementProjection.shortfall / (retirementProjection.yearsToRetire * 12)).toLocaleString()} to close the gap.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

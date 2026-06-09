import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Legend, Line, ComposedChart } from 'recharts';

const GOLD_PRICE = 7850;

// Generate 30 days of mock gold price data
const sparklineData = Array.from({ length: 30 }, (_, i) => {
  const base = 7700;
  const trend = i * 5;
  const noise = Math.sin(i * 0.8) * 80 + Math.cos(i * 1.3) * 40;
  return { day: i + 1, price: Math.round(base + trend + noise) };
});

// Gold vs Inflation data (10 years)
const inflationData = [
  { year: '2016', gold: 8.5, inflation: 4.9 },
  { year: '2017', gold: 6.2, inflation: 3.3 },
  { year: '2018', gold: 7.8, inflation: 3.9 },
  { year: '2019', gold: 18.5, inflation: 3.4 },
  { year: '2020', gold: 24.0, inflation: 6.2 },
  { year: '2021', gold: -4.1, inflation: 5.1 },
  { year: '2022', gold: 14.0, inflation: 6.7 },
  { year: '2023', gold: 8.5, inflation: 5.4 },
  { year: '2024', gold: 12.3, inflation: 5.0 },
  { year: '2025', gold: 15.2, inflation: 5.8 },
];

export default function DigitalGold() {
  const [sipAmount, setSipAmount] = useState(5000);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const currentGrams = 12.3;
  const targetGrams = 100;
  const currentValue = currentGrams * GOLD_PRICE;
  const neededGrams = targetGrams - currentGrams;
  const timelineMonths = 24;
  const sipRequired = Math.ceil((neededGrams * GOLD_PRICE) / timelineMonths);

  // SIP projection
  const projectedMonthlyGrams = sipAmount / GOLD_PRICE;
  const projectedYearlyGrams = projectedMonthlyGrams * 12;

  const freqMultiplier = frequency === 'daily' ? 30 : frequency === 'weekly' ? 4 : 1;
  const freqLabel = frequency === 'daily' ? 'day' : frequency === 'weekly' ? 'week' : 'month';
  const projectedFreqGrams = (sipAmount * freqMultiplier) / GOLD_PRICE;

  // Vault fill percentage
  const vaultFill = Math.min((currentGrams / targetGrams) * 100, 100);

  // Generate coin positions for vault
  const coins = useMemo(() => {
    const count = Math.floor(vaultFill / 3);
    return Array.from({ length: Math.min(count, 30) }, (_, i) => ({
      id: i,
      left: 15 + (i % 6) * 12 + Math.random() * 4,
      bottom: 5 + Math.floor(i / 6) * 10 + Math.random() * 3,
      size: 18 + Math.random() * 8,
      delay: i * 50,
    }));
  }, [vaultFill]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header: Price + Sparkline */}
      <div className="card">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Digital Gold Price</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-800 dark:text-white">₹{GOLD_PRICE.toLocaleString()}</p>
              <span className="text-sm text-slate-400">/ gram</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                <i className="fas fa-arrow-trend-up mr-1" />+2.1% today
              </span>
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                <i className="fas fa-bolt mr-1" />Live
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-[10px] px-2 py-1 bg-yellow-500/10 text-yellow-700 border border-yellow-200 rounded-full">
                <i className="fas fa-certificate mr-1" />24K 99.9% Pure
              </span>
              <span className="text-[10px] px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full">
                <i className="fas fa-building-columns mr-1" />RBI Regulated
              </span>
              <span className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-200 rounded-full">
                <i className="fas fa-clock mr-1" />Sell in 2 mins
              </span>
            </div>
          </div>
          <div className="lg:col-span-2 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
                <Tooltip
                  formatter={(val) => [`₹${Number(val)}`, 'Price']}
                  contentStyle={{ borderRadius: 8, fontSize: 11 }}
                  labelFormatter={() => ''}
                />
                <Area type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={2} fill="url(#goldGradient)" />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-slate-400 text-right">Last 30 days · Updated 2 min ago</p>
          </div>
        </div>
      </div>

      {/* Gold Vault + Goal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gold Vault Visual */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-4">
            <i className="fas fa-vault text-amber-500 mr-2" />
            My Gold Vault
          </h3>
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-48">
              {/* Chest body */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b-2xl border-4 border-amber-600">
                {/* Chest bands */}
                <div className="absolute top-0 bottom-0 left-8 w-3 bg-amber-800/50" />
                <div className="absolute top-0 bottom-0 right-8 w-3 bg-amber-800/50" />
                {/* Lock */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-500 rounded-lg border-2 border-amber-300 flex items-center justify-center">
                  <i className="fas fa-lock text-amber-800 text-xs" />
                </div>
              </div>
              {/* Chest lid */}
              <div className="absolute bottom-32 left-0 right-0 h-12 bg-gradient-to-b from-amber-600 to-amber-700 rounded-t-xl border-4 border-b-0 border-amber-500" />
              {/* Coins inside */}
              {coins.map((coin) => (
                <div
                  key={coin.id}
                  className="absolute rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 border-2 border-yellow-400 shadow-sm flex items-center justify-center animate-fade-in"
                  style={{
                    left: `${coin.left}%`,
                    bottom: `${coin.bottom}%`,
                    width: coin.size,
                    height: coin.size,
                    animationDelay: `${coin.delay}ms`,
                  }}
                >
                  <span className="text-[8px] font-bold text-yellow-900">Au</span>
                </div>
              ))}
              {/* Fill level indicator */}
              <div className="absolute -right-2 top-4 bottom-4 w-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-amber-500 transition-all duration-1000 rounded-full"
                  style={{ height: `${vaultFill}%` }}
                />
              </div>
            </div>
          </div>
          <div className="text-center mt-3">
            <p className="text-2xl font-bold text-amber-600">{currentGrams.toFixed(1)} <span className="text-sm font-normal text-slate-400">grams</span></p>
            <p className="text-xs text-slate-400">₹{currentValue.toLocaleString()} · {vaultFill.toFixed(1)}% of goal</p>
          </div>
        </div>

        {/* My Gold Goal */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-4">
            <i className="fas fa-bullseye text-rose-500 mr-2" />
            Gold Goal: Daughter's Wedding
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-xs text-slate-400">Current</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{currentGrams}g</p>
                <p className="text-[10px] text-slate-400">₹{currentValue.toLocaleString()}</p>
              </div>
              <div className="text-center px-4">
                <i className="fas fa-arrow-right text-slate-300" />
              </div>
              <div className="text-center flex-1">
                <p className="text-xs text-slate-400">Target</p>
                <p className="text-lg font-bold text-amber-600">{targetGrams}g</p>
                <p className="text-[10px] text-slate-400">₹{(targetGrams * GOLD_PRICE).toLocaleString()}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all" style={{ width: `${vaultFill}%` }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-3 text-center border border-rose-100">
                <p className="text-xs text-rose-500 mb-1">Still Need</p>
                <p className="text-xl font-bold text-rose-600">{neededGrams.toFixed(1)}g</p>
                <p className="text-[10px] text-slate-400">₹{(neededGrams * GOLD_PRICE).toLocaleString()}</p>
              </div>
              <div className="bg-primary/5 rounded-xl p-3 text-center border border-primary/10">
                <p className="text-xs text-primary mb-1">SIP Required</p>
                <p className="text-xl font-bold text-primary">₹{sipRequired.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400">/ month · {timelineMonths} months</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Gold SIP */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-4">
          <i className="fas fa-coins text-amber-500 mr-2" />
          Start Gold SIP
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 block mb-2">Amount per {freqLabel}</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={500}
                  max={50000}
                  step={500}
                  value={sipAmount}
                  onChange={(e) => setSipAmount(Number(e.target.value))}
                  className="flex-1 accent-amber-500"
                />
                <span className="text-sm font-bold text-slate-800 dark:text-white w-20 text-right">₹{sipAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹500</span>
                <span>₹50,000</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-2">Frequency</label>
              <div className="flex gap-2">
                {(['daily', 'weekly', 'monthly'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                      frequency === f
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25">
              <i className="fas fa-play mr-2" /> Start Gold SIP
            </button>
          </div>

          {/* Projections */}
          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-200">
            <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider mb-3">Projected Accumulation</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Per {freqLabel}</span>
                <span className="text-sm font-bold text-amber-700">{projectedFreqGrams.toFixed(2)}g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Per Month</span>
                <span className="text-sm font-bold text-amber-700">{projectedMonthlyGrams.toFixed(2)}g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Per Year</span>
                <span className="text-sm font-bold text-amber-700">{projectedYearlyGrams.toFixed(1)}g</span>
              </div>
              <div className="border-t border-amber-200 pt-2 flex items-center justify-between">
                <span className="text-sm text-slate-600">10-Year Value</span>
                <span className="text-sm font-bold text-amber-800">₹{(projectedYearlyGrams * 10 * GOLD_PRICE * 1.8).toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-amber-600 mt-1">
                <i className="fas fa-circle-info mr-1" />
                Assumes 6% annual gold appreciation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gold vs Inflation Chart */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-4">
          <i className="fas fa-chart-line text-primary mr-2" />
          Gold Returns vs. Inflation (10 Years)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={inflationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                formatter={(val) => `${Number(val)}%`}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="gold" name="Gold Returns" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="inflation" name="CPI Inflation" stroke="#0f766e" strokeWidth={2} dot={{ r: 4, fill: '#0f766e' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 flex items-start gap-2">
          <i className="fas fa-trophy text-emerald-500 mt-0.5" />
          <p className="text-xs text-emerald-700">
            <strong>Gold beat inflation in 8 out of 10 years.</strong> Average gold return: 11.1% vs. inflation: 5.0%.
            Digital gold is one of the best inflation hedges for Indian investors.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: 'fa-shield-halved', title: 'Secure Vault', desc: 'Insured & audited', color: 'text-primary' },
          { icon: 'fa-bolt', title: 'Instant Sell', desc: 'Money in 2 minutes', color: 'text-amber-500' },
          { icon: 'fa-gift', title: 'Gift Gold', desc: 'Send to anyone', color: 'text-rose-500' },
          { icon: 'fa-receipt', title: 'No GST', desc: 'On buyback', color: 'text-emerald-500' },
        ].map((f) => (
          <div key={f.title} className="card text-center p-4">
            <i className={`fas ${f.icon} ${f.color} text-xl mb-2`} />
            <p className="text-sm font-medium text-slate-800 dark:text-white">{f.title}</p>
            <p className="text-[10px] text-slate-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

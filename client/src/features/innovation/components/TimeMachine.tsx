import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelineEvent {
  year: number;
  age: number;
  title: string;
  netWorth: number;
  income: number;
  expenses: number;
  investments: number;
  milestones: string[];
  avatar: string;
  mood: string;
}

const TIMELINE: TimelineEvent[] = [
  { year: 2026, age: 32, title: 'Present Day', netWorth: 45, income: 150000, expenses: 95000, investments: 35000, milestones: ['Baseline'], avatar: '🙂', mood: 'Optimistic' },
  { year: 2028, age: 34, title: 'First Home', netWorth: 78, income: 175000, expenses: 105000, investments: 52000, milestones: ['Home purchase', 'Child planning'], avatar: '😊', mood: 'Excited' },
  { year: 2030, age: 36, title: 'Parent Mode', netWorth: 112, income: 200000, expenses: 120000, investments: 68000, milestones: ['Child born', 'Education fund start'], avatar: '🥰', mood: 'Blessed' },
  { year: 2032, age: 38, title: 'Promotion Year', netWorth: 158, income: 250000, expenses: 130000, investments: 95000, milestones: ['VP Promotion', 'First international trip'], avatar: '🤩', mood: 'Proud' },
  { year: 2034, age: 40, title: 'Wealth Acceleration', netWorth: 215, income: 280000, expenses: 140000, investments: 125000, milestones: ['Second property', 'Portfolio crosses ₹1Cr'], avatar: '😎', mood: 'Confident' },
  { year: 2036, age: 42, title: 'Mid-Life Peak', netWorth: 285, income: 320000, expenses: 150000, investments: 165000, milestones: ['Child starts school', 'Passive income = 50% salary'], avatar: '👑', mood: 'Wealthy' },
  { year: 2038, age: 44, title: 'Business Venture', netWorth: 370, income: 400000, expenses: 160000, investments: 220000, milestones: ['Side business launched', 'Angel investor'], avatar: '🚀', mood: 'Ambitious' },
  { year: 2040, age: 46, title: 'Freedom Threshold', netWorth: 465, income: 450000, expenses: 170000, investments: 280000, milestones: ['FIRE achieved', 'Nomad year planned'], avatar: '🏝️', mood: 'Free' },
  { year: 2045, age: 51, title: 'Legacy Builder', netWorth: 720, income: 350000, expenses: 200000, investments: 450000, milestones: ['Family trust created', 'Generational wealth seed'], avatar: '🎓', mood: 'Wise' },
  { year: 2050, age: 56, title: 'Retirement', netWorth: 1100, income: 200000, expenses: 220000, investments: 680000, milestones: ['Full retirement', 'Grandchild born'], avatar: '🌅', mood: 'Peaceful' },
  { year: 2055, age: 61, title: 'Philanthropist', netWorth: 1580, income: 150000, expenses: 250000, investments: 950000, milestones: ['Charitable foundation', 'Mentoring 100 entrepreneurs'], avatar: '🕊️', mood: 'Fulfilled' },
  { year: 2060, age: 66, title: 'Golden Years', netWorth: 2200, income: 100000, expenses: 300000, investments: 1200000, milestones: ['World cruise', 'Autobiography published'], avatar: '✨', mood: 'Legendary' },
];

export default function TimeMachine() {
  const [year, setYear] = useState(2036);
  const current = TIMELINE.find(t => t.year === year) || TIMELINE[0];
  const index = TIMELINE.findIndex(t => t.year === year);

  const nextYear = () => {
    const nextIdx = Math.min(index + 1, TIMELINE.length - 1);
    setYear(TIMELINE[nextIdx].year);
  };

  const prevYear = () => {
    const prevIdx = Math.max(index - 1, 0);
    setYear(TIMELINE[prevIdx].year);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Years Scanned', value: '34', icon: 'fa-clock-rotate-left', color: 'bg-blue-50 text-blue-600' },
          { label: 'Timeline Events', value: TIMELINE.length, icon: 'fa-timeline', color: 'bg-violet-50 text-violet-600' },
          { label: 'Peak Net Worth', value: '₹22Cr', icon: 'fa-mountain', color: 'bg-amber-50 text-amber-600' },
          { label: 'FIRE Age', value: '46', icon: 'fa-fire', color: 'bg-rose-50 text-rose-600' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="card-psb flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
              <i className={`fas ${stat.icon}`} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-[10px] text-gray-500 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card-psb">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-clock-rotate-left text-violet-600" aria-hidden="true" /> Financial Time Machine
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Travel to any year of your financial future. See your life, wealth, and milestones unfold.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={prevYear} aria-label="Previous year" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
              <i className="fas fa-chevron-left text-gray-600 text-xs" aria-hidden="true" />
            </button>
            <button onClick={nextYear} aria-label="Next year" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
              <i className="fas fa-chevron-right text-gray-600 text-xs" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="mb-6">
          <input
            type="range"
            min={2026}
            max={2060}
            step={1}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-label="Select projected year"
            className="w-full h-2 bg-gradient-to-r from-blue-200 via-violet-200 to-amber-200 rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[9px] text-gray-400 mt-1">
            <span>2026 (Age 32)</span>
            <span>2043</span>
            <span>2060 (Age 66)</span>
          </div>
        </div>

        {/* Timeline Dots */}
        <div className="flex justify-between mb-6 px-2">
          {TIMELINE.map((t) => (
            <button
              key={t.year}
              onClick={() => setYear(t.year)}
              aria-label={`Jump to year ${t.year}`}
              className={`relative w-3 h-3 rounded-full transition-all ${
                t.year === year ? 'bg-primary scale-150 shadow-lg shadow-primary/30' :
                t.year < year ? 'bg-primary/40' : 'bg-gray-200'
              }`}
            >
              {t.year === year && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-primary whitespace-nowrap">
                  {t.year}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Year Detail Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={year}
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{current.avatar}</div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">{current.year}</p>
                  <p className="text-sm font-bold text-violet-600">{current.title}</p>
                  <p className="text-[11px] text-gray-500">Age {current.age} · {current.mood}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-primary">₹{(current.netWorth / 100).toFixed(1)}Cr</p>
                <p className="text-[10px] text-gray-500">Net Worth</p>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Monthly Income', value: `₹${(current.income / 12).toLocaleString()}`, icon: 'fa-money-bill-wave', color: 'text-green-600' },
                { label: 'Monthly Expenses', value: `₹${(current.expenses / 12).toLocaleString()}`, icon: 'fa-cart-shopping', color: 'text-rose-600' },
                { label: 'Monthly Invested', value: `₹${(current.investments / 12).toLocaleString()}`, icon: 'fa-chart-line', color: 'text-blue-600' },
                { label: 'Savings Rate', value: `${Math.round((current.investments / current.income) * 100)}%`, icon: 'fa-piggy-bank', color: 'text-amber-600' },
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 bg-white/70 rounded-lg">
                  <p className="text-[9px] text-gray-400">{item.label}</p>
                  <p className={`text-sm font-extrabold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Milestones */}
            <div className="flex flex-wrap gap-2">
              {current.milestones.map((m, i) => (
                <span key={i} className="px-3 py-1.5 bg-white rounded-full text-[10px] font-bold text-violet-700 border border-violet-100">
                  <i className="fas fa-star text-amber-400 mr-1 text-[8px]" aria-hidden="true" />{m}
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Comparison Bar */}
        <div className="mt-4">
          <p className="text-[10px] text-gray-400 mb-2">Net Worth Trajectory</p>
          <div className="flex items-end gap-1 h-[80px]">
            {TIMELINE.map((t, idx) => {
              const height = (t.netWorth / 2200) * 100;
              const isCurrent = t.year === year;
              return (
                <motion.div
                  key={t.year}
                  className={`flex-1 rounded-t-sm cursor-pointer transition-all ${isCurrent ? 'bg-primary' : 'bg-gray-200 hover:bg-gray-300'}`}
                  style={{ height: `${height}%` }}
                  role="button"
                  tabIndex={0}
                  onClick={() => setYear(t.year)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setYear(t.year); } }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: idx * 0.03, duration: 0.5 }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

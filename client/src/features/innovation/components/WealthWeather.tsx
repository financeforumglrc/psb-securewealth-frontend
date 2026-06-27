import { useTranslation } from '@/shared/hooks/useTranslation';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DayForecast {
  day: string;
  date: string;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'rainbow';
  temp: number;
  cashflow: number;
  risk: 'low' | 'medium' | 'high';
  events: string[];
  advice: string;
}

const FORECAST: DayForecast[] = [
  { day: 'Today', date: 'Jun 4', condition: 'sunny', temp: 82, cashflow: 12500, risk: 'low', events: ['Salary credited', 'SIP auto-debited'], advice: 'Great day for investments. Market sentiment positive.' },
  { day: 'Tomorrow', date: 'Jun 5', condition: 'cloudy', temp: 68, cashflow: -3200, risk: 'medium', events: ['EMI due', 'Grocery run'], advice: 'Avoid large discretionary spends. EMI day.' },
  { day: 'Jun 6', date: 'Fri', condition: 'rainy', temp: 45, cashflow: -8500, risk: 'high', events: ['Credit card bill', 'Weekend prep'], advice: 'Rainy financial day. Stay indoors, no shopping.' },
  { day: 'Jun 7', date: 'Sat', condition: 'stormy', temp: 32, cashflow: -15200, risk: 'high', events: ['Weekend outing', 'Party expense'], advice: 'Storm warning! Set a hard budget cap of ₹3,000.' },
  { day: 'Jun 8', date: 'Sun', condition: 'cloudy', temp: 55, cashflow: -4800, risk: 'medium', events: ['Family lunch', 'Fuel refill'], advice: 'Moderate spending expected. Use fuel card for cashback.' },
  { day: 'Jun 9', date: 'Mon', condition: 'sunny', temp: 78, cashflow: 3200, risk: 'low', events: ['Cashback credited', 'No major bills'], advice: 'Sunny Monday! Review portfolio, rebalance if needed.' },
  { day: 'Jun 10', date: 'Tue', condition: 'rainbow', temp: 95, cashflow: 18500, risk: 'low', events: ['FD interest', 'Side income', 'Bonus rumor'], advice: 'Rainbow day! Consider increasing SIP by 10%.' },
];

const CONDITION_CONFIG = {
  sunny: { icon: 'fa-sun', color: '#F59E0B', bg: 'from-amber-50 to-yellow-50', text: 'text-amber-700 dark:text-amber-300', desc: 'Bright & Prosperous' },
  cloudy: { icon: 'fa-cloud', color: '#6B7280', bg: 'from-gray-50 to-slate-50', text: 'text-gray-700 dark:text-slate-300', desc: 'Cautious & Steady' },
  rainy: { icon: 'fa-cloud-rain', color: '#3B82F6', bg: 'from-blue-50 to-indigo-50', text: 'text-blue-700 dark:text-blue-300', desc: 'Drain Alert' },
  stormy: { icon: 'fa-bolt', color: '#DC2626', bg: 'from-rose-50 to-red-50', text: 'text-rose-700 dark:text-rose-300', desc: 'High Risk Zone' },
  rainbow: { icon: 'fa-rainbow', color: '#8B5CF6', bg: 'from-violet-50 to-purple-50', text: 'text-violet-700 dark:text-violet-300', desc: 'Wealth Multiplier' },
};

export default function WealthWeather() {
  const { t } = useTranslation();
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(0);

  const outlookDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const conditions = ['sunny', 'sunny', 'cloudy', 'cloudy', 'rainy', 'stormy', 'rainbow'] as const;
    const start = selectedMonth * 30;
    return Array.from({ length: Math.min(90 - start, 30) }).map((_, idx) => {
      const dayOffset = start + idx;
      const d = new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const c = conditions[Math.floor(Math.abs(Math.sin(dayOffset * 7.3) * 7))];
      return {
        date: `${d.getDate()}`,
        dayName: d.toLocaleDateString('en-IN', { weekday: 'narrow' }),
        condition: c,
        label: d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
      };
    });
  }, [selectedMonth]);

  const monthOptions = useMemo(() => {
    const today = new Date();
    return [0, 1, 2].map((offset) => {
      const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      return {
        value: offset,
        label: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      };
    });
  }, []);
  const [animating, setAnimating] = useState(false);
  const current = FORECAST[selectedDay];
  const cfg = CONDITION_CONFIG[current.condition];

  useEffect(() => {
    setAnimating(true);
    const t = setTimeout(() => setAnimating(false), 500);
    return () => clearTimeout(t);
  }, [selectedDay]);

  return (
    <div className="space-y-5">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('weatherClimate'), value: 'Sunny', icon: 'fa-sun', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300' },
          { label: t('weatherOutlook'), value: '+₹8.5K', icon: 'fa-chart-line', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300' },
          { label: t('weatherStormDays'), value: '1', icon: 'fa-bolt', color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300' },
          { label: t('weatherAccuracy'), value: '91%', icon: 'fa-bullseye', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300' },
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
              <p className="text-lg font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Weather Card */}
      <div className={`card-psb bg-gradient-to-br ${cfg.bg} overflow-hidden`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <i className="fas fa-cloud-sun text-blue-600 dark:text-blue-300" aria-hidden="true" /> {t('weatherTitle')}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
              {t('weatherSubtitle')}
            </p>
          </div>
        </div>

        {/* 7-Day Strip */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {FORECAST.map((day, idx) => {
            const dc = CONDITION_CONFIG[day.condition];
            const isSelected = selectedDay === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(idx)}
                className={`flex-shrink-0 p-2.5 rounded-xl border transition-all text-center min-w-[80px] ${
                  isSelected
                    ? 'border-primary bg-white dark:bg-slate-900 shadow-md scale-105'
                    : 'border-gray-100 dark:border-slate-700 bg-white/60 hover:bg-white hover:shadow-sm'
                }`}
              >
                <p className="text-[10px] text-gray-400 dark:text-slate-500">{day.day}</p>
                <p className="text-[10px] font-bold text-gray-600 dark:text-slate-400">{day.date}</p>
                <div className="my-1.5">
                  <i className={`fas ${dc.icon} text-lg`} style={{ color: dc.color }} aria-hidden="true" />
                </div>
                <p className="text-[11px] font-extrabold" style={{ color: dc.color }}>{day.temp}°</p>
              </button>
            );
          })}
        </div>

        {/* Selected Day Detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-5 rounded-xl bg-gradient-to-br ${cfg.bg} border ${cfg.text.replace('text', 'border')}-200`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={animating ? { rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <i className={`fas ${cfg.icon} text-5xl`} style={{ color: cfg.color }} aria-hidden="true" />
                </motion.div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{current.temp}°W</p>
                  <p className="text-sm font-bold" style={{ color: cfg.color }}>{cfg.desc}</p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">{current.day}, {current.date} · Cashflow: {current.cashflow >= 0 ? '+' : ''}₹{current.cashflow.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  current.risk === 'low' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                  current.risk === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                  'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                }`}>
                  {current.risk.toUpperCase()} {t('weatherRiskSuffix')}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white/70 rounded-lg">
                <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1">{t('weatherExpectedEvents')}</p>
                <div className="space-y-1">
                  {current.events.map((evt, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-slate-300">
                      <i className="fas fa-circle text-[4px]" style={{ color: cfg.color }} aria-hidden="true" />
                      {evt}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-white/70 rounded-lg">
                <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1">{t('weatherAiAdvice')}</p>
                <p className="text-[11px] text-gray-700 dark:text-slate-300 leading-relaxed">{current.advice}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Monthly Climate Trend */}
      <div className="card-psb">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
            <i className="fas fa-calendar-days text-primary" aria-hidden="true" /> {t('weather90DayOutlook')}
          </h4>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {outlookDays.map((d, idx) => {
            const cc = CONDITION_CONFIG[d.condition];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.003 }}
                className="aspect-square rounded-md flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform p-0.5"
                style={{ backgroundColor: cc.color + '20' }}
                title={`${d.label}: ${cc.desc}`}
              >
                <span className="text-[8px] text-gray-500 dark:text-slate-400 leading-none">{d.date}</span>
                <i className={`fas ${cc.icon} text-[10px] my-0.5`} style={{ color: cc.color }} aria-hidden="true" />
                <span className="text-[7px] font-bold" style={{ color: cc.color }}>{d.dayName}</span>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-500 dark:text-slate-400">
          {Object.entries(CONDITION_CONFIG).map(([key, val]) => (
            <span key={key} className="flex items-center gap-1">
              <i className={`fas ${val.icon}`} style={{ color: val.color }} aria-hidden="true" />
              {val.desc}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useTranslation } from '@/shared/hooks/useTranslation';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useChartSize } from '@/shared/hooks/useChartSize';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useToast } from '@/shared/components/ui/ToastProvider';

interface Festival {
  id: string;
  name: string;
  date: string;
  estimatedSpend: string;
  aiRecommendation: string;
  autoSaveAmount: number;
  icon: string;
  color: string;
  category: 'family' | 'religious' | 'cultural' | 'seasonal';
}

const FESTIVALS_2026: Festival[] = [
  {
    id: 'f-1',
    name: 'Holi',
    date: '2026-03-04',
    estimatedSpend: '₹12,000',
    aiRecommendation: 'Colours + sweets + celebration. Auto-sweep ₹750/week to festival fund.',
    autoSaveAmount: 750,
    icon: 'fa-palette',
    color: '#9C27B0',
    category: 'cultural',
  },
  {
    id: 'f-2',
    name: 'Akshaya Tritiya',
    date: '2026-04-19',
    estimatedSpend: '₹25,000',
    aiRecommendation: 'Auspicious gold buying day. Pre-book gold at current rates. Lock price via gold ETF.',
    autoSaveAmount: 700,
    icon: 'fa-coins',
    color: '#FFD700',
    category: 'religious',
  },
  {
    id: 'f-3',
    name: 'Raksha Bandhan',
    date: '2026-08-28',
    estimatedSpend: '₹8,000',
    aiRecommendation: 'Start ₹500/week auto-save now. Gift + travel budget. Consider digital gold.',
    autoSaveAmount: 500,
    icon: 'fa-gift',
    color: '#E91E63',
    category: 'family',
  },
  {
    id: 'f-4',
    name: 'Ganesh Chaturthi',
    date: '2026-09-14',
    estimatedSpend: '₹15,000',
    aiRecommendation: 'Festival + decoration + hosting. Auto-sweep ₹850/week to festival fund.',
    autoSaveAmount: 850,
    icon: 'fa-om',
    color: '#FF9800',
    category: 'religious',
  },
  {
    id: 'f-5',
    name: 'Diwali',
    date: '2026-11-08',
    estimatedSpend: '₹45,000',
    aiRecommendation: 'Biggest spend of year. Start ₹2,200/week now. Gold purchase optimal 2 weeks before.',
    autoSaveAmount: 2200,
    icon: 'fa-fire',
    color: '#FF5722',
    category: 'religious',
  },
  {
    id: 'f-6',
    name: 'Christmas / New Year',
    date: '2026-12-25',
    estimatedSpend: '₹22,000',
    aiRecommendation: 'Vacation + gifts + parties. ₹900/week auto-save. Book flights 8 weeks early.',
    autoSaveAmount: 900,
    icon: 'fa-sleigh',
    color: '#4CAF50',
    category: 'cultural',
  },
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function daysUntil(iso: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(iso + 'T00:00:00');
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function parseSpend(f: Festival) {
  return parseInt(f.estimatedSpend.replace('₹', '').replace(',', ''), 10);
}

export default function FestivalAwareEngine() {
  const { t } = useTranslation();
  const { ref: chartRef, width: chartWidth, height: chartHeight } = useChartSize<HTMLDivElement>();
  const [selected, setSelected] = useState<string | null>(null);
  const [showPlanner, setShowPlanner] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const addGoal = useWealthStore((s) => s.addGoal);
  const { showToast } = useToast();

  const festivals = useMemo(() => {
    return [...FESTIVALS_2026]
      .map((f) => ({ ...f, daysAway: daysUntil(f.date) }))
      .sort((a, b) => a.daysAway - b.daysAway);
  }, []);

  const totalFestivalSpend = festivals.reduce((sum, f) => sum + parseSpend(f), 0);
  const monthlyAutoSave = festivals.reduce((sum, f) => sum + f.autoSaveAmount, 0);

  const chartData = useMemo(() => {
    return MONTH_NAMES.map((month) => {
      const normal = 45000;
      const extra = festivals
        .filter((f) => new Date(f.date + 'T00:00:00').getMonth() === MONTH_NAMES.indexOf(month))
        .reduce((sum, f) => sum + parseSpend(f), 0);
      const festival = normal + extra;
      return { month, normal, extra, festival, isHigh: festival > 60000 };
    });
  }, [festivals]);

  const handleSetupFund = (festival: Festival) => {
    addGoal({
      id: `goal-festival-${festival.id}-${Date.now()}`,
      name: `${festival.name} Fund`,
      type: 'other',
      targetAmount: parseSpend(festival),
      currentAmount: 0,
      deadline: festival.date,
    });
    showToast(`Festival fund created for ${festival.name}`, 'success');
  };

  const calendar = useMemo(() => {
    const year = 2026;
    const months = MONTH_NAMES.map((name, monthIdx) => {
      const firstDay = new Date(year, monthIdx, 1).getDay();
      const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      return { name, monthIdx, firstDay, days };
    });
    return months;
  }, []);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('festivalTracked'), value: festivals.length, icon: 'fa-calendar-days', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' },
          { label: t('festivalSpend'), value: `₹${(totalFestivalSpend / 100000).toFixed(1)}L`, icon: 'fa-money-bill-wave', color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300' },
          { label: t('festivalAutoSave'), value: `₹${monthlyAutoSave.toLocaleString()}/mo`, icon: 'fa-piggy-bank', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300' },
          { label: t('festivalDiwali'), value: `${festivals.find((f) => f.name === 'Diwali')?.daysAway ?? '-'}`, icon: 'fa-fire', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300' },
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

      {/* Festival Planner */}
      <div className="card-psb">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <i className="fas fa-om text-orange-600" aria-hidden="true" /> {t('festivalTitle')}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">{t('festivalSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-1">
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-colors ${view === 'list' ? 'bg-primary text-white' : 'text-gray-600 dark:text-slate-300'}`}
              >
                <i className="fas fa-list mr-1" /> List
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-colors ${view === 'calendar' ? 'bg-primary text-white' : 'text-gray-600 dark:text-slate-300'}`}
              >
                <i className="fas fa-calendar mr-1" /> Calendar
              </button>
            </div>
            <button
              onClick={() => setShowPlanner(!showPlanner)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                showPlanner ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              <i className={`fas ${showPlanner ? 'fa-check' : 'fa-wand-magic-sparkles'} mr-1`} aria-hidden="true" />
              {showPlanner ? t('festivalPlannerActive') : t('festivalAutoPlan')}
            </button>
          </div>
        </div>

        {view === 'list' ? (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {festivals.map((festival, idx) => {
                const isOpen = selected === festival.id;
                return (
                  <motion.div
                    key={festival.id}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`rounded-xl border transition-all duration-200 ${
                      isOpen ? 'border-orange-200 dark:border-orange-800 bg-orange-50/30 shadow-md' : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-gray-200'
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(isOpen ? null : festival.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(isOpen ? null : festival.id); } }}
                  >
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: festival.color + '12' }}
                          >
                            <i className={`fas ${festival.icon}`} style={{ color: festival.color, fontSize: '15px' }} aria-hidden="true" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-bold text-gray-800 dark:text-slate-200">{festival.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded-full text-gray-500 dark:text-slate-400 capitalize">{festival.category}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">
                              <span><i className="fas fa-calendar mr-1" aria-hidden="true" />{formatDate(festival.date)}</span>
                              <span><i className="fas fa-hourglass-half mr-1" aria-hidden="true" />{festival.daysAway} {t('festivalDays')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-gray-900 dark:text-white">{festival.estimatedSpend}</p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500">{t('festivalEstimated')}</p>
                        </div>
                      </div>

                      <div className="mt-2.5">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-slate-500 mb-1">
                          <span>{t('festivalCountdown')}</span>
                          <span>{Math.round((1 - festival.daysAway / 365) * 100)}{t('festivalThroughYear')}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-orange-400"
                            style={{ width: `${Math.min(100, (1 - festival.daysAway / 365) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-dashed border-gray-200 dark:border-slate-600"
                        >
                          <div className="p-3 space-y-3">
                            <div className="flex items-start gap-2">
                              <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i className="fas fa-wand-magic-sparkles text-orange-500 text-xs" aria-hidden="true" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-700 dark:text-slate-300 mb-0.5">{t('festivalAiRecommendation')}</p>
                                <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed">{festival.aiRecommendation}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                <p className="text-[10px] text-gray-400 dark:text-slate-500">{t('festivalAutoSaveWeek')}</p>
                                <p className="text-[11px] font-semibold text-gray-700 dark:text-slate-300">₹{festival.autoSaveAmount.toLocaleString()}</p>
                              </div>
                              <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                <p className="text-[10px] text-gray-400 dark:text-slate-500">{t('festivalFundReady')}</p>
                                <p className="text-[11px] font-semibold text-gray-700 dark:text-slate-300">{formatDate(festival.date)}</p>
                              </div>
                            </div>
                            {showPlanner && (
                              <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={(e) => { e.stopPropagation(); handleSetupFund(festival); }}
                                className="w-full py-2 bg-orange-600 text-white text-[11px] font-bold rounded-lg hover:bg-orange-700 transition-colors"
                              >
                                <i className="fas fa-robot mr-1" aria-hidden="true" /> {t('festivalSetupFund')}
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-1">
            {calendar.map((m) => (
              <div key={m.name} className="p-3 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                <p className="text-xs font-bold text-gray-800 dark:text-slate-200 mb-2">{m.name} 2026</p>
                <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-gray-400 dark:text-slate-500 mb-1">
                  {WEEK_DAYS.map((d) => <span key={d}>{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: m.firstDay }).map((_, i) => <div key={`pad-${i}`} />)}
                  {m.days.map((day) => {
                    const iso = `2026-${String(m.monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const f = festivals.find((x) => x.date === iso);
                    return (
                      <div
                        key={day}
                        className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-medium ${
                          f
                            ? 'text-white'
                            : 'text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800'
                        }`}
                        style={{ backgroundColor: f ? f.color : undefined }}
                        title={f ? `${f.name} — ${f.estimatedSpend}` : undefined}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spending Pattern Chart */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <i className="fas fa-chart-column text-primary" aria-hidden="true" /> {t('festivalChartTitle')}
        </h4>
        <div ref={chartRef} className="h-[220px] w-full">
          {chartWidth > 0 && chartHeight > 0 && (
            <BarChart width={chartWidth} height={chartHeight} data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                formatter={(value, name) => [`${Number(value).toLocaleString('en-IN')}`, name === 'normal' ? 'Normal' : 'Festival Spend']}
                contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px' }}
              />
              <Bar dataKey="normal" stackId="a" fill="rgba(15, 118, 110, 0.2)" radius={[0, 0, 4, 4]} />
              <Bar dataKey="extra" stackId="a" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isHigh ? '#F87171' : '#FBBF24'} />
                ))}
              </Bar>
            </BarChart>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-[10px] text-gray-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-teal-700/20 rounded" /> {t('festivalNormal')}</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-300 rounded" /> {t('festivalExtra')}</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-400 rounded" /> {t('festivalHighAlert')}</span>
        </div>
      </div>
    </div>
  );
}

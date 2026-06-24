import { useTranslation } from '@/shared/hooks/useTranslation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Festival {
  id: string;
  name: string;
  date: string;
  daysAway: number;
  estimatedSpend: string;
  aiRecommendation: string;
  autoSaveAmount: number;
  icon: string;
  color: string;
  category: 'family' | 'religious' | 'cultural' | 'seasonal';
}

const FESTIVALS: Festival[] = [
  {
    id: 'f-1',
    name: 'Raksha Bandhan',
    date: 'Aug 09, 2025',
    daysAway: 72,
    estimatedSpend: '₹8,000',
    aiRecommendation: 'Start ₹2,000/week auto-save now. Gift + travel budget. Consider digital gold for sister.',
    autoSaveAmount: 2000,
    icon: 'fa-gift',
    color: '#E91E63',
    category: 'family',
  },
  {
    id: 'f-2',
    name: 'Ganesh Chaturthi',
    date: 'Aug 27, 2025',
    daysAway: 90,
    estimatedSpend: '₹15,000',
    aiRecommendation: 'Festival + decoration + hosting. Auto-sweep ₹1,600/week to festival fund.',
    autoSaveAmount: 1600,
    icon: 'fa-om',
    color: '#FF9800',
    category: 'religious',
  },
  {
    id: 'f-3',
    name: 'Diwali',
    date: 'Oct 21, 2025',
    daysAway: 145,
    estimatedSpend: '₹45,000',
    aiRecommendation: 'Biggest spend of year. Start ₹3,100/week now. Gold purchase optimal 2 weeks before.',
    autoSaveAmount: 3100,
    icon: 'fa-fire',
    color: '#FF5722',
    category: 'religious',
  },
  {
    id: 'f-4',
    name: 'Christmas/New Year',
    date: 'Dec 25, 2025',
    daysAway: 210,
    estimatedSpend: '₹22,000',
    aiRecommendation: 'Vacation + gifts + parties. ₹1,000/week auto-save. Book flights 8 weeks early.',
    autoSaveAmount: 1000,
    icon: 'fa-sleigh',
    color: '#4CAF50',
    category: 'cultural',
  },
  {
    id: 'f-5',
    name: 'Holi',
    date: 'Mar 14, 2026',
    daysAway: 300,
    estimatedSpend: '₹12,000',
    aiRecommendation: 'Colors + sweets + celebration. ₹400/week auto-save. Consider group package deals.',
    autoSaveAmount: 400,
    icon: 'fa-palette',
    color: '#9C27B0',
    category: 'cultural',
  },
  {
    id: 'f-6',
    name: 'Akshaya Tritiya',
    date: 'Apr 30, 2026',
    daysAway: 347,
    estimatedSpend: '₹25,000',
    aiRecommendation: 'Auspicious gold buying day. Pre-book gold at current rates. Lock price via gold ETF.',
    autoSaveAmount: 700,
    icon: 'fa-coins',
    color: '#FFD700',
    category: 'religious',
  },
];

const SPENDING_PATTERN = [
  { month: 'Jun', normal: 45000, festival: 45000 },
  { month: 'Jul', normal: 45000, festival: 45000 },
  { month: 'Aug', normal: 45000, festival: 62000 },
  { month: 'Sep', normal: 45000, festival: 58000 },
  { month: 'Oct', normal: 45000, festival: 90000 },
  { month: 'Nov', normal: 45000, festival: 48000 },
  { month: 'Dec', normal: 45000, festival: 67000 },
  { month: 'Jan', normal: 45000, festival: 52000 },
  { month: 'Feb', normal: 45000, festival: 45000 },
  { month: 'Mar', normal: 45000, festival: 57000 },
  { month: 'Apr', normal: 45000, festival: 70000 },
  { month: 'May', normal: 45000, festival: 45000 },
];

export default function FestivalAwareEngine() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const [showPlanner, setShowPlanner] = useState(false);

  const totalFestivalSpend = FESTIVALS.reduce((sum, f) => sum + parseInt(f.estimatedSpend.replace('₹', '').replace(',', '')), 0);
  const monthlyAutoSave = FESTIVALS.reduce((sum, f) => sum + f.autoSaveAmount, 0);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('festivalTracked'), value: FESTIVALS.length, icon: 'fa-calendar-days', color: 'bg-orange-50 text-orange-600' },
          { label: t('festivalSpend'), value: `₹${(totalFestivalSpend / 100000).toFixed(1)}L`, icon: 'fa-money-bill-wave', color: 'bg-rose-50 text-rose-600' },
          { label: t('festivalAutoSave'), value: `₹${monthlyAutoSave.toLocaleString()}/mo`, icon: 'fa-piggy-bank', color: 'bg-green-50 text-green-600' },
          { label: t('festivalDiwali'), value: '145', icon: 'fa-fire', color: 'bg-amber-50 text-amber-600' },
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

      {/* Festival Calendar */}
      <div className="card-psb">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-om text-orange-600" aria-hidden="true" /> {t('festivalTitle')}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {t('festivalSubtitle')}
            </p>
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

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {FESTIVALS.map((festival, idx) => {
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
                    isOpen ? 'border-orange-200 bg-orange-50/30 shadow-md' : 'border-gray-100 bg-white hover:border-gray-200'
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
                            <span className="text-[12px] font-bold text-gray-800">{festival.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-500 capitalize">{festival.category}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-0.5">
                            <span><i className="fas fa-calendar mr-1" aria-hidden="true" />{festival.date}</span>
                            <span><i className="fas fa-hourglass-half mr-1" aria-hidden="true" />{festival.daysAway} days</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-gray-900">{festival.estimatedSpend}</p>
                        <p className="text-[10px] text-gray-400">{t('festivalEstimated')}</p>
                      </div>
                    </div>

                    {/* Progress bar to festival */}
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                        <span>{t('festivalCountdown')}</span>
                        <span>{Math.round((1 - festival.daysAway / 365) * 100)}{t('festivalThroughYear')}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
                        className="border-t border-dashed border-gray-200"
                      >
                        <div className="p-3 space-y-3">
                          <div className="flex items-start gap-2">
                            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <i className="fas fa-wand-magic-sparkles text-orange-500 text-xs" aria-hidden="true" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-700 mb-0.5">{t('festivalAiRecommendation')}</p>
                              <p className="text-[11px] text-gray-600 leading-relaxed">{festival.aiRecommendation}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-gray-50 rounded-lg">
                              <p className="text-[10px] text-gray-400">{t('festivalAutoSaveWeek')}</p>
                              <p className="text-[11px] font-semibold text-gray-700">₹{festival.autoSaveAmount.toLocaleString()}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-lg">
                              <p className="text-[10px] text-gray-400">{t('festivalFundReady')}</p>
                              <p className="text-[11px] font-semibold text-gray-700">{festival.date}</p>
                            </div>
                          </div>
                          {showPlanner && (
                            <motion.button
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
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
      </div>

      {/* Spending Pattern Chart */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <i className="fas fa-chart-column text-primary" aria-hidden="true" /> {t('festivalChartTitle')}
        </h4>
        <div className="flex items-end gap-1 h-[180px]">
          {SPENDING_PATTERN.map((d) => {
            const maxVal = 100000;
            const normalHeight = (d.normal / maxVal) * 100;
            const festivalHeight = ((d.festival - d.normal) / maxVal) * 100;
            const isHigh = d.festival > 60000;
            return (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center" style={{ height: `${(d.festival / maxVal) * 100}%` }}>
                  <div className="w-full bg-primary/20 rounded-t-sm" style={{ height: `${normalHeight}%` }} />
                  <div className={`w-full rounded-b-sm ${isHigh ? 'bg-rose-400' : 'bg-amber-300'}`} style={{ height: `${festivalHeight}%` }} />
                </div>
                <span className="text-[10px] text-gray-400">{d.month}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-4 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-primary/20 rounded" /> {t('festivalNormal')}</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-300 rounded" /> {t('festivalExtra')}</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-400 rounded" /> {t('festivalHighAlert')}</span>
        </div>
      </div>
    </div>
  );
}

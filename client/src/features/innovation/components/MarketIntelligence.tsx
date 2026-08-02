import { useTranslation } from '@/shared/hooks/useTranslation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Line, XAxis, YAxis, Tooltip, Area, ComposedChart } from 'recharts';
import { useChartSize } from '@/shared/hooks/useChartSize';

const MARKET_CYCLES = [
  { month: 'Jun', market: 100, optimalEntry: 105, yourTiming: 98 },
  { month: 'Jul', market: 103, optimalEntry: 108, yourTiming: 101 },
  { month: 'Aug', market: 101, optimalEntry: 112, yourTiming: 99 },
  { month: 'Sep', market: 107, optimalEntry: 115, yourTiming: 104 },
  { month: 'Oct', market: 112, optimalEntry: 110, yourTiming: 109 },
  { month: 'Nov', market: 108, optimalEntry: 118, yourTiming: 106 },
  { month: 'Dec', market: 115, optimalEntry: 122, yourTiming: 113 },
  { month: 'Jan', market: 120, optimalEntry: 125, yourTiming: 118 },
  { month: 'Feb', market: 118, optimalEntry: 128, yourTiming: 116 },
  { month: 'Mar', market: 125, optimalEntry: 130, yourTiming: 122 },
  { month: 'Apr', market: 130, optimalEntry: 135, yourTiming: 127 },
  { month: 'May', market: 128, optimalEntry: 138, yourTiming: 125 },
];

const EXTERNAL_SIGNALS = [
  { name: 'RBI Policy Meeting', date: 'Jun 07, 2025', impact: 'High', direction: 'Rate Hold', icon: 'fa-landmark', color: '#1B5E20' },
  { name: 'Union Budget 2025', date: 'Jul 23, 2025', impact: 'Critical', direction: 'Tax Reform', icon: 'fa-file-invoice-dollar', color: '#FFD700' },
  { name: 'US Fed Decision', date: 'Jun 18, 2025', impact: 'High', direction: 'Rate Cut?', icon: 'fa-globe', color: '#2196F3' },
  { name: 'Monsoon Forecast', date: 'Jun 01, 2025', impact: 'Medium', direction: 'Above Normal', icon: 'fa-cloud-rain', color: '#00BCD4' },
  { name: 'Crude Oil OPEC+', date: 'Jun 15, 2025', impact: 'Medium', direction: 'Supply Cut', icon: 'fa-oil-well', color: '#FF9800' },
  { name: 'Q1 GDP Release', date: 'Aug 30, 2025', impact: 'High', direction: '6.2% Est.', icon: 'fa-chart-area', color: '#9C27B0' },
];

const PREDICTIVE_TIMING = [
  { action: 'Increase Equity SIP', timing: 'Jul 15-20', confidence: 87, reason: 'Post-budget dip + monsoon boost historically creates entry window', potentialGain: '+₹2.4L/yr' },
  { action: 'Buy Gold ETF', timing: 'Aug 01-07', confidence: 78, reason: 'Pre-festive demand + USD weakness predicted by forex model', potentialGain: '+₹85K/yr' },
  { action: 'Switch to Debt Fund', timing: 'Sep 10-15', confidence: 72, reason: 'Q2 earnings season volatility expected — preserve capital', potentialGain: 'Avoid ₹1.2L loss' },
  { action: 'Real Estate REIT Entry', timing: 'Oct 01-10', confidence: 81, reason: 'Post-monsoon infra push + declining mortgage rates', potentialGain: '+₹3.1L/yr' },
];

export default function MarketIntelligence() {
  const { t } = useTranslation();
  const { ref: chartRef, width: chartWidth, height: chartHeight } = useChartSize<HTMLDivElement>();
  const [selectedSignal, setSelectedSignal] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('marketSignals'), value: '47', icon: 'fa-satellite-dish', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300' },
          { label: t('marketAccuracy'), value: '81%', icon: 'fa-bullseye', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300' },
          { label: t('marketAlpha'), value: '+₹4.2L', icon: 'fa-chart-line', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300' },
          { label: t('marketMissed'), value: '2', icon: 'fa-eye', color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300' },
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

      {/* Predictive Timing Chart */}
      <div className="card-psb">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <i className="fas fa-chart-line text-primary" aria-hidden="true" /> {t('marketTitle')}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
              {t('marketSubtitle')}
            </p>
          </div>
        </div>

        <div ref={chartRef} className="h-[280px] w-full">
          {chartWidth > 0 && chartHeight > 0 && (
            <ComposedChart width={chartWidth} height={chartHeight} data={MARKET_CYCLES} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="marketGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1B5E20" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="market" name={t('marketIndex')} stroke="#1B5E20" strokeWidth={2} fill="url(#marketGrad)" dot={false} />
              <Line type="monotone" dataKey="optimalEntry" name={t('marketAiEntry')} stroke="#FFD700" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 4, fill: '#FFD700', stroke: '#1B5E20', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="yourTiming" name={t('marketYourTiming')} stroke="#F44336" strokeWidth={2} dot={{ r: 3, fill: '#F44336' }} />
            </ComposedChart>
          )}
        </div>

        <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 bg-primary rounded-full" />
            <span>{t('marketIndex')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 bg-amber-400 rounded-full" />
            <span>{t('marketAiEntry')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 bg-rose-500 rounded-full" />
            <span>{t('marketYourTiming')}</span>
          </div>
        </div>
      </div>

      {/* Predictive Timing Recommendations */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <i className="fas fa-wand-magic-sparkles text-amber-500" aria-hidden="true" /> {t('marketRecommendationsTitle')}
        </h4>
        <div className="space-y-3">
          {PREDICTIVE_TIMING.map((rec, idx) => (
            <motion.div
              key={rec.action}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-amber-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-gray-800 dark:text-slate-200">{rec.action}</span>
                    <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-full">{rec.confidence}% confidence</span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 mb-1">
                    <i className="fas fa-calendar-day mr-1 text-primary" aria-hidden="true" /> {t('marketOptimalWindow')} <span className="font-semibold text-gray-700 dark:text-slate-300">{rec.timing}</span>
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 leading-relaxed">{rec.reason}</p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-sm font-extrabold text-green-600 dark:text-green-300">{rec.potentialGain}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">{t('marketPotential')}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* External Signal Calendar */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <i className="fas fa-calendar-days text-primary" aria-hidden="true" /> {t('marketRadarTitle')}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EXTERNAL_SIGNALS.map((sig, idx) => (
            <motion.div
              key={sig.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedSignal === idx ? 'border-gray-300 shadow-md' : 'border-gray-100 dark:border-slate-700 hover:border-gray-200'
              }`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedSignal(selectedSignal === idx ? null : idx)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedSignal(selectedSignal === idx ? null : idx); } }}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: sig.color + '12' }}>
                  <i className={`fas ${sig.icon}`} style={{ color: sig.color, fontSize: '12px' }} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-gray-800 dark:text-slate-200 truncate">{sig.name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">{sig.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  sig.impact === 'Critical' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300' : sig.impact === 'High' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                }`}>
                  {sig.impact}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-slate-400">{sig.direction}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

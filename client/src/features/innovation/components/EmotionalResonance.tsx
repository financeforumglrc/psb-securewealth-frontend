import { useTranslation } from '@/shared/hooks/useTranslation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useToast } from '@/shared/components/ui/ToastProvider';

const EMOTION_DATA = [
  { emotion: 'Joy', score: 72, impact: 'Positive', financialEffect: '+12% savings rate' },
  { emotion: 'Anxiety', score: 58, impact: 'Negative', financialEffect: '-8% impulse buys' },
  { emotion: 'Fear', score: 45, impact: 'Negative', financialEffect: '-15% risk investments' },
  { emotion: 'Greed', score: 62, impact: 'Mixed', financialEffect: '+23% crypto exposure' },
  { emotion: 'Envy', score: 51, impact: 'Negative', financialEffect: '+18% status purchases' },
  { emotion: 'Contentment', score: 78, impact: 'Positive', financialEffect: '+9% long-term investing' },
  { emotion: 'Stress', score: 67, impact: 'Negative', financialEffect: '+31% convenience spending' },
  { emotion: 'Hope', score: 81, impact: 'Positive', financialEffect: '+14% SIP consistency' },
];

const WEEKLY_MOOD_SPEND = [
  { day: 'Mon', mood: 65, spend: 1200 },
  { day: 'Tue', mood: 72, spend: 950 },
  { day: 'Wed', mood: 58, spend: 2100 },
  { day: 'Thu', mood: 78, spend: 800 },
  { day: 'Fri', mood: 82, spend: 3400 },
  { day: 'Sat', mood: 88, spend: 5200 },
  { day: 'Sun', mood: 75, spend: 2800 },
];

const EMOTIONAL_TRIGGERS = [
  { trigger: 'Instagram Shopping Ads', frequency: '4.2x/week', cost: '₹2,400/week', emotion: 'Envy', icon: 'fa-mobile-screen' },
  { trigger: 'Office Stress', frequency: 'Daily', cost: '₹850/week', emotion: 'Stress', icon: 'fa-briefcase' },
  { trigger: 'Weekend FOMO', frequency: 'Every Sat', cost: '₹5,200/week', emotion: 'FOMO', icon: 'fa-champagne-glasses' },
  { trigger: 'Salary Day Euphoria', frequency: 'Monthly', cost: '₹8,500/month', emotion: 'Joy', icon: 'fa-money-bill-wave' },
  { trigger: 'Family Comparison', frequency: '2.1x/week', cost: '₹3,100/week', emotion: 'Envy', icon: 'fa-people-arrows' },
  { trigger: 'Market Dip Panic', frequency: '3-4x/year', cost: '₹15,000/year', emotion: 'Fear', icon: 'fa-chart-line' },
];

const COACHING_INSIGHTS = [
  { title: 'Wednesday is your danger day', detail: 'You spend 75% more when mood drops below 60. Activate "Cooling Vault" on Wednesdays.', action: 'Set Wednesday Lock', icon: 'fa-lock' },
  { title: 'Instagram = ₹2,400/week drain', detail: '4.2 shopping ad clicks/week correlate with 89% impulse purchase rate. Block shopping ads during work hours.', action: 'Block Ads Now', icon: 'fa-ban' },
  { title: 'Friday euphoria is expensive', detail: 'Your "weekend celebration" spending is 3.2x your weekday average. Create a Friday budget cap.', action: 'Set Friday Cap', icon: 'fa-piggy-bank' },
  { title: 'Fear makes you sell low', detail: 'You exit equity investments 2.3x faster during market dips than optimal. Enable "Fear Lock" on portfolio.', action: 'Enable Fear Lock', icon: 'fa-shield-halved' },
];

export default function EmotionalResonance() {
  const { t } = useTranslation();
  const [selectedTrigger, setSelectedTrigger] = useState<number | null>(null);
  const addGoal = useWealthStore((s) => s.addGoal);
  const { showToast } = useToast();

  const handleCoachAction = (insight: typeof COACHING_INSIGHTS[number]) => {
    addGoal({
      id: `goal-emotion-${Date.now()}`,
      name: insight.action,
      type: 'other',
      targetAmount: 100000,
      currentAmount: 0,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    showToast(`${insight.action} activated`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('emotionalResonanceStates'), value: '8', icon: 'fa-face-smile', color: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600' },
          { label: t('emotionalResonanceTriggers'), value: '6', icon: 'fa-bolt', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300' },
          { label: t('emotionalResonanceCorrelation'), value: '-0.74', icon: 'fa-link', color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300' },
          { label: t('emotionalResonanceSavings'), value: '₹4.2L/yr', icon: 'fa-piggy-bank', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300' },
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

      {/* Radar + Weekly Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card-psb">
          <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            <i className="fas fa-brain text-violet-500" aria-hidden="true" /> {t('emotionalResonanceProfileTitle')}
          </h4>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={EMOTION_DATA} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="emotion" tick={{ fontSize: 10, fill: '#6B7280' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name={t('emotionalResonanceYourScore')} dataKey="score" stroke="#8B5CF6" strokeWidth={2.5} fill="#8B5CF6" fillOpacity={0.15} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px' }}
                  formatter={(value: any, _name: any, props: any) => [
                    `${value}/100 — ${props.payload.financialEffect}`,
                    props.payload.emotion
                  ]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-psb">
          <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            <i className="fas fa-calendar-week text-primary" aria-hidden="true" /> {t('emotionalResonancePatternTitle')}
          </h4>
          <div className="space-y-2.5">
            {WEEKLY_MOOD_SPEND.map((d, idx) => (
              <div key={d.day} className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-gray-600 dark:text-slate-400 w-8">{d.day}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-violet-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${d.mood}%` }}
                        transition={{ delay: idx * 0.1, duration: 0.6 }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 w-8 text-right">{t('emotionalResonanceMood')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${d.spend > 3000 ? 'bg-rose-400' : d.spend > 1500 ? 'bg-amber-400' : 'bg-green-400'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(d.spend / 6000) * 100}%` }}
                        transition={{ delay: idx * 0.1 + 0.2, duration: 0.6 }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-slate-400 w-10 text-right font-bold">₹{d.spend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-violet-400" aria-hidden="true" /> {t('emotionalResonanceMood')}</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true" /> {t('emotionalResonanceLowSpend')}</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" /> {t('emotionalResonanceMedSpend')}</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-400" aria-hidden="true" /> {t('emotionalResonanceHighSpend')}</span>
          </div>
        </div>
      </div>

      {/* Emotional Triggers */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <i className="fas fa-bolt text-amber-500" aria-hidden="true" /> {t('emotionalResonanceTriggersTitle')}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EMOTIONAL_TRIGGERS.map((trig, idx) => (
            <motion.div
              key={trig.trigger}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.06 }}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedTrigger === idx ? 'border-amber-200 dark:border-amber-800 bg-amber-50/30 shadow-md' : 'border-gray-100 dark:border-slate-700 hover:border-gray-200'
              }`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedTrigger(selectedTrigger === idx ? null : idx)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedTrigger(selectedTrigger === idx ? null : idx); } }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gray-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <i className={`fas ${trig.icon} text-gray-500 dark:text-slate-400 text-xs`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-gray-800 dark:text-slate-200 truncate">{trig.trigger}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">{trig.frequency}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-300">{trig.cost}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded-full text-gray-500 dark:text-slate-400">{trig.emotion}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Coaching Insights */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <i className="fas fa-user-doctor text-emerald-600" aria-hidden="true" /> {t('emotionalResonanceCoachTitle')}
        </h4>
        <div className="space-y-3">
          {COACHING_INSIGHTS.map((insight, idx) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-gray-800 dark:text-slate-200 mb-0.5">{insight.title}</p>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 leading-relaxed">{insight.detail}</p>
                </div>
                <button
                  onClick={() => handleCoachAction(insight)}
                  className="ml-3 px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
                >
                  <i className={`fas ${insight.icon} mr-1`} aria-hidden="true" />{insight.action}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

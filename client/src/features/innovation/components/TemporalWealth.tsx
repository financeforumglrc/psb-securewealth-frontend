import { useTranslation } from '@/shared/hooks/useTranslation';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useWealthStore } from '@/shared/store/wealthStore';
import CosmosCard from '@/shared/components/ui/CosmosCard';

interface TimelinePoint {
  year: number;
  age: number;
  netWorth: number;
  monthlySavings: number;
  milestone?: string;
  milestoneIcon?: string;
}

function generateTimeline(
  startYear: number,
  currentAge: number,
  currentNW: number,
  monthlySavings: number,
  rate: number,
  years: number
): TimelinePoint[] {
  const data: TimelinePoint[] = [];
  let nw = currentNW;
  const monthlyRate = rate / 100 / 12;
  const milestones: Record<number, { text: string; icon: string }> = {
    0: { text: 'Today', icon: 'fa-location-dot' },
    5: { text: '₹50L Milestone', icon: 'fa-flag' },
    10: { text: '₹1 Crore', icon: 'fa-trophy' },
    15: { text: 'Financial Freedom', icon: 'fa-dove' },
    20: { text: 'Retirement Ready', icon: 'fa-umbrella-beach' },
    25: { text: 'Generational Wealth', icon: 'fa-crown' },
  };

  for (let y = 0; y <= years; y++) {
    const milestone = milestones[y];
    data.push({
      year: startYear + y,
      age: currentAge + y,
      netWorth: Math.round(nw),
      monthlySavings,
      milestone: milestone?.text,
      milestoneIcon: milestone?.icon,
    });
    for (let m = 0; m < 12; m++) {
      nw = nw * (1 + monthlyRate) + monthlySavings;
    }
  }
  return data;
}

export default function TemporalWealth() {
  const { t } = useTranslation();
  const user = useWealthStore((s) => s.user);
  const assets = useWealthStore((s) => s.assets);
  const goals = useWealthStore((s) => s.goals);
  const currentNW = assets.reduce((sum, a) => sum + a.value, 0);
  const currentAge = 30; // would come from user profile
  const startYear = new Date().getFullYear();

  const [sliderYear, setSliderYear] = useState(10);
  const [scenario, setScenario] = useState<'actual' | 'early' | 'late'>('actual');

  const scenarios = useMemo(() => ({
    actual: generateTimeline(startYear, currentAge, currentNW, user.monthlySavings, 10, 30),
    early: generateTimeline(startYear, currentAge, currentNW, user.monthlySavings + 5000, 12, 30),
    late: generateTimeline(startYear, currentAge, currentNW * 0.7, user.monthlySavings - 5000, 10, 30),
  }), [startYear, currentAge, currentNW, user.monthlySavings]);

  const activeData = scenarios[scenario];
  const selectedPoint = activeData[sliderYear];

  const diffEarly = scenarios.early[sliderYear].netWorth - selectedPoint.netWorth;
  const diffLate = selectedPoint.netWorth - scenarios.late[sliderYear].netWorth;

  return (
    <div className="space-y-6">
      {/* Scenario Toggles */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'actual', label: t('temporalYourPath'), icon: 'fa-user', color: 'bg-primary' },
          { key: 'early', label: t('temporalStartedEarly'), icon: 'fa-rocket', color: 'bg-emerald-500' },
          { key: 'late', label: t('temporalDelayed'), icon: 'fa-hourglass-half', color: 'bg-amber-500' },
        ] as const).map((s) => (
          <button
            key={s.key}
            onClick={() => setScenario(s.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              scenario === s.key ? `${s.color} text-white shadow-lg` : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <i className={`fas ${s.icon}`} aria-hidden="true" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Time Slider + Stats */}
      <CosmosCard variant="gradient">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Current Point Stats */}
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{t('temporalYear').replace('{year}', String(selectedPoint.year))}</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{t('temporalAge').replace('{age}', String(selectedPoint.age))}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{t('temporalProjectedNetWorth')}</p>
              <motion.p key={selectedPoint.netWorth} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-extrabold text-primary">
                ₹{(selectedPoint.netWorth / 1e5).toFixed(1)}L
              </motion.p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{t('temporalMonthlySIP')}</p>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200">₹{selectedPoint.monthlySavings.toLocaleString()}</p>
            </div>
            {selectedPoint.milestone && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                <i className={`fas ${selectedPoint.milestoneIcon} text-amber-500`} aria-hidden="true" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{selectedPoint.milestone}</span>
              </motion.div>
            )}
          </div>

          {/* Year Slider */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{t('temporalToday')}</span>
                <span className="text-xs font-bold text-primary">{t('temporalYear').replace('{year}', String(sliderYear))}</span>
                <span className="text-xs font-bold text-slate-500">{t('temporal30Years')}</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={sliderYear}
                onChange={(e) => setSliderYear(Number(e.target.value))}
                aria-label="Select projected year"
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-1">
                {activeData.filter((_, i) => i % 5 === 0).map((p) => (
                  <span key={p.year} className="text-[10px] text-slate-400">{p.year}</span>
                ))}
              </div>
            </div>

            {/* Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{t('temporalVsStartedEarly')}</p>
                <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                  {diffEarly > 0 ? '+' : ''}₹{(diffEarly / 1e5).toFixed(1)}L
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800">
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">{t('temporalVsDelayed')}</p>
                <p className="text-sm font-extrabold text-amber-700 dark:text-amber-300">
                  +₹{(diffLate / 1e5).toFixed(1)}L
                </p>
              </div>
            </div>
          </div>
        </div>
      </CosmosCard>

      {/* Wealth Trajectory Chart */}
      <CosmosCard variant="default" header={{ icon: 'fa-chart-area', iconColor: '#0f766e', title: t('temporalWealthTrajectory'), subtitle: t('temporalWealthTrajectorySubtitle') }}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${(Number(v) / 1e5).toFixed(0)}L`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `₹${(Number(v) / 1e5).toFixed(1)}L`} contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <ReferenceLine x={startYear + sliderYear} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} />
              {activeData.filter((d) => d.milestone).map((d) => (
                <ReferenceLine key={d.year} x={d.year} stroke="#0f766e" strokeDasharray="2 2" strokeOpacity={0.3} />
              ))}
              <Area type="monotone" dataKey="netWorth" stroke="#0f766e" fill="url(#wealthGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {activeData.filter((d) => d.milestone).map((d) => (
            <div key={d.year} className="flex items-center gap-1 text-[10px] text-slate-500">
              <div className="w-2 h-2 rounded-full bg-primary/30" />
              {d.year}: {t(`temporalMilestone${d.milestone?.replace(/[₹\\s]+/g, '')}` as any)}
            </div>
          ))}
        </div>
      </CosmosCard>

      {/* Milestone Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {activeData.filter((d) => d.milestone).map((d, i) => (
          <motion.div
            key={d.year}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <CosmosCard variant={sliderYear >= i * 5 ? 'gradient' : 'default'} padding="sm">
              <div className="text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${sliderYear >= i * 5 ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                  <i className={`fas ${d.milestoneIcon}`} aria-hidden="true" />
                </div>
                <p className="text-[10px] font-bold text-slate-400">{d.year}</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{d.milestone}</p>
                <p className="text-[10px] text-primary font-bold">₹{(d.netWorth / 1e5).toFixed(1)}L</p>
              </div>
            </CosmosCard>
          </motion.div>
        ))}
      </div>

      {/* Goals Overlay */}
      {goals.length > 0 && (
        <CosmosCard variant="default" header={{ icon: 'fa-bullseye', iconColor: '#1565C0', title: t('temporalGoalAlignment'), subtitle: t('temporalGoalAlignmentSubtitle') }}>
          <div className="space-y-2">
            {goals.map((goal) => {
              const goalYear = new Date(goal.deadline).getFullYear();
              const projectedAtGoal = activeData.find((d) => d.year === goalYear)?.netWorth || 0;
              const onTrack = projectedAtGoal >= goal.targetAmount;

              return (
                <div key={goal.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${onTrack ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    <i className={`fas fa-${onTrack ? 'check' : 'triangle-exclamation'}`} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{goal.name}</p>
                    <p className="text-[10px] text-slate-400">{t('temporalGoalTarget').replace('{amount}', goal.targetAmount.toLocaleString()).replace('{year}', String(goalYear))}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">₹{projectedAtGoal.toLocaleString()}</p>
                    <p className={`text-[10px] font-bold ${onTrack ? 'text-emerald-500' : 'text-amber-500'}`}>{onTrack ? t('temporalOnTrack') : t('temporalGap').replace('{amount}', (goal.targetAmount - projectedAtGoal).toLocaleString())}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CosmosCard>
      )}
    </div>
  );
}

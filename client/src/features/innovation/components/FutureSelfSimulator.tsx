import { useTranslation } from '@/shared/hooks/useTranslation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ProjectionScenario {
  year: number;
  currentPath: number;
  optimizedPath: number;
  milestone?: string;
  icon?: string;
}

const PROJECTION_DATA: ProjectionScenario[] = [
  { year: 2026, currentPath: 45, optimizedPath: 45, milestone: 'Today', icon: 'fa-location-dot' },
  { year: 2027, currentPath: 52, optimizedPath: 58 },
  { year: 2028, currentPath: 59, optimizedPath: 74, milestone: 'Home Purchase', icon: 'fa-house' },
  { year: 2029, currentPath: 66, optimizedPath: 92 },
  { year: 2030, currentPath: 73, optimizedPath: 112, milestone: 'Child Education', icon: 'fa-graduation-cap' },
  { year: 2031, currentPath: 80, optimizedPath: 135 },
  { year: 2032, currentPath: 87, optimizedPath: 160 },
  { year: 2033, currentPath: 94, optimizedPath: 188 },
  { year: 2034, currentPath: 101, optimizedPath: 219, milestone: 'Financial Freedom', icon: 'fa-gem' },
  { year: 2035, currentPath: 108, optimizedPath: 253 },
  { year: 2036, currentPath: 115, optimizedPath: 291 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  const data = PROJECTION_DATA.find(d => d.year === label);
  return (
    <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-xs">
      <p className="font-bold text-gray-800 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-bold">₹{p.value}L</span>
        </div>
      ))}
      {data?.milestone && (
        <div className="mt-1.5 pt-1.5 border-t border-gray-100 text-violet-600 font-semibold">
          <i className={`fas ${data.icon} mr-1`} aria-hidden="true" />{data.milestone}
        </div>
      )}
    </div>
  );
};

export default function FutureSelfSimulator() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState(2030);
  const [showAvatar, setShowAvatar] = useState(true);

  const AVATAR_STATES = [
    { label: t('futureSelfStruggling'), emoji: '😰', netWorth: '< ₹10L', color: '#EF4444' },
    { label: t('futureSelfSurviving'), emoji: '😐', netWorth: '₹10-50L', color: '#F59E0B' },
    { label: t('futureSelfStable'), emoji: '🙂', netWorth: '₹50L-1Cr', color: '#3B82F6' },
    { label: t('futureSelfThriving'), emoji: '😊', netWorth: '₹1-3Cr', color: '#8B5CF6' },
    { label: t('futureSelfWealthy'), emoji: '🤩', netWorth: '₹3-7Cr', color: '#10B981' },
    { label: t('futureSelfFree'), emoji: '👑', netWorth: '> ₹7Cr', color: '#FFD700' },
  ];

  const currentData = PROJECTION_DATA.find(d => d.year === selectedYear) || PROJECTION_DATA[0];
  const avatarIndex = Math.min(
    Math.floor((currentData.optimizedPath - 10) / 50),
    AVATAR_STATES.length - 1
  );
  const avatar = AVATAR_STATES[Math.max(0, avatarIndex)];

  const wealthGap = currentData.optimizedPath - currentData.currentPath;
  const gapPercent = Math.round((wealthGap / currentData.currentPath) * 100);

  return (
    <div className="card-psb">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <i className="fas fa-user-clock text-amber-600" aria-hidden="true" /> {t('futureSelfTitle')}
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {t('futureSelfSubtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowAvatar(!showAvatar)}
          className="px-2.5 py-1 bg-amber-50 rounded-lg text-[10px] font-bold text-amber-700 hover:bg-amber-100 transition-colors"
        >
          <i className={`fas ${showAvatar ? 'fa-eye' : 'fa-eye-slash'} mr-1`} aria-hidden="true" />
          {showAvatar ? t('futureSelfAvatarOn') : t('futureSelfAvatarOff')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <div className="lg:col-span-2">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PROJECTION_DATA} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1B5E20" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v}L`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x={selectedYear} stroke="#8B5CF6" strokeDasharray="4 4" strokeWidth={1.5} />
                <Area
                  type="monotone"
                  dataKey="currentPath"
                  name={t('futureSelfCurrentPath')}
                  stroke="#9CA3AF"
                  strokeWidth={2}
                  fill="url(#currentGrad)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="optimizedPath"
                  name={t('futureSelfOptimizedPath')}
                  stroke="#1B5E20"
                  strokeWidth={2.5}
                  fill="url(#optGrad)"
                  dot={(props: any) => {
                    const data = PROJECTION_DATA[props.index];
                    if (!data?.milestone) return <></>;
                    return (
                      <circle 
                        cx={props.cx} 
                        cy={props.cy} 
                        r={5} 
                        fill="#FFD700" 
                        stroke="#1B5E20" 
                        strokeWidth={2}
                      />
                    );
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Year slider */}
          <div className="mt-3 px-2">
            <input
              type="range"
              min={2026}
              max={2036}
              step={1}
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label={t('futureSelfSelectYear')}
              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>2026</span>
              <span>2031</span>
              <span>2036</span>
            </div>
          </div>
        </div>

        {/* Future Self Card */}
        <div className="space-y-3">
          {showAvatar && (
            <motion.div
              key={selectedYear}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl border text-center"
              style={{ borderColor: avatar.color + '40', backgroundColor: avatar.color + '08' }}
            >
              <div className="text-5xl mb-2">{avatar.emoji}</div>
              <p className="text-lg font-extrabold" style={{ color: avatar.color }}>{avatar.label}</p>
              <p className="text-[11px] text-gray-500">{avatar.netWorth} {t('futureSelfEstimatedNetWorth')}</p>
              <p className="text-[10px] text-gray-400 mt-1">{t('futureSelfYear').replace('{year}', String(selectedYear))}</p>
            </motion.div>
          )}

          {/* Wealth Gap */}
          <div className="p-3 bg-gradient-to-br from-primary/5 to-amber-50 rounded-xl border border-primary/10">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">{t('futureSelfGapTitle')}</p>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-gray-600">{t('futureSelfCurrentTrajectory')}</span>
              <span className="text-[11px] font-bold text-gray-400">₹{currentData.currentPath}L</span>
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-gray-600">{t('futureSelfOptimized')}</span>
              <span className="text-[11px] font-bold text-primary">₹{currentData.optimizedPath}L</span>
            </div>
            <div className="h-px bg-gray-200 my-2" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-primary">{t('futureSelfPotentialGain')}</span>
              <span className="text-sm font-extrabold text-primary">
                +₹{wealthGap}L <span className="text-[10px]">({gapPercent}%)</span>
              </span>
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{t('futureSelfMilestones')}</p>
            {PROJECTION_DATA.filter(d => d.milestone && d.year >= selectedYear).slice(0, 3).map(m => (
              <div key={m.year} className="flex items-center gap-2 text-[11px]">
                <div className="w-6 h-6 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className={`fas ${m.icon} text-amber-600 text-[10px]`} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-700">{m.milestone}</p>
                  <p className="text-gray-400">{m.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

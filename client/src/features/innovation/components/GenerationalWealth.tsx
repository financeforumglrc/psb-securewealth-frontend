import { useTranslation } from '@/shared/hooks/useTranslation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const GENERATION_DATA = [
  { year: '2026', you: 45, child: 0, grandchild: 0, milestone: 'You (Age 32)' },
  { year: '2031', you: 78, child: 0, grandchild: 0 },
  { year: '2036', you: 112, child: 8, grandchild: 0, milestone: 'Child starts college' },
  { year: '2041', you: 158, child: 24, grandchild: 0 },
  { year: '2046', you: 215, child: 45, grandchild: 0, milestone: 'Child marries' },
  { year: '2051', you: 285, child: 78, grandchild: 2 },
  { year: '2056', you: 370, child: 118, grandchild: 8, milestone: 'Grandchild born' },
  { year: '2061', you: 465, child: 168, grandchild: 24 },
  { year: '2066', you: 580, child: 235, grandchild: 52, milestone: 'You retire' },
  { year: '2071', you: 710, child: 310, grandchild: 95 },
  { year: '2076', you: 850, child: 405, grandchild: 158, milestone: 'Legacy transfer' },
  { year: '2081', you: 0, child: 520, grandchild: 245, milestone: 'Estate distribution' },
];

const INHERITANCE_PLAN = [
  { asset: 'Primary Home', value: '₹2.8Cr', to: 'Child', type: 'Physical', icon: 'fa-house', status: 'planned' },
  { asset: 'Equity Portfolio', value: '₹1.5Cr', to: 'Child (60%) + Grandchild (40%)', type: 'Financial', icon: 'fa-chart-pie', status: 'active' },
  { asset: 'Gold Holdings', value: '₹45L', to: 'Spouse → Child', type: 'Physical', icon: 'fa-coins', status: 'planned' },
  { asset: 'Family Trust', value: '₹3.2Cr', to: 'Grandchild Education', type: 'Trust', icon: 'fa-scale-balanced', status: 'setup' },
  { asset: 'Life Insurance', value: '₹1Cr', to: 'Spouse', type: 'Insurance', icon: 'fa-shield-heart', status: 'active' },
  { asset: 'Digital Assets', value: '₹12L', to: 'Child', type: 'Digital', icon: 'fa-bitcoin-sign', status: 'planned' },
];

const TIMELINE_EVENTS = [
  { age: '32', year: '2026', event: 'You today', type: 'present', icon: 'fa-user' },
  { age: '42', year: '2036', event: "Child's education fund matures", type: 'milestone', icon: 'fa-graduation-cap' },
  { age: '47', year: '2041', event: 'Child marriage corpus ready', type: 'milestone', icon: 'fa-ring' },
  { age: '52', year: '2046', event: 'First grandchild expected', type: 'milestone', icon: 'fa-baby' },
  { age: '62', year: '2056', event: 'Grandchild education seed fund', type: 'milestone', icon: 'fa-seedling' },
  { age: '72', year: '2066', event: 'Your retirement — corpus handover begins', type: 'critical', icon: 'fa-umbrella-beach' },
  { age: '82', year: '2076', event: 'Legacy vault unlocks for next gen', type: 'legacy', icon: 'fa-vault' },
  { age: '—', year: '2081', event: 'Estate fully distributed via smart will', type: 'legacy', icon: 'fa-file-signature' },
];

export default function GenerationalWealth() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState('2056');

  return (
    <div className="space-y-5">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('generationalGenerations'), value: '3', icon: 'fa-people-roof', color: 'bg-amber-50 text-amber-600' },
          { label: t('generationalHorizon'), value: '55 Years', icon: 'fa-hourglass-half', color: 'bg-blue-50 text-blue-600' },
          { label: t('generationalCorpus'), value: '₹8.5Cr+', icon: 'fa-vault', color: 'bg-violet-50 text-violet-600' },
          { label: t('generationalWillStatus'), value: t('generationalActive'), icon: 'fa-file-signature', color: 'bg-green-50 text-green-600' },
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

      {/* Multi-Gen Wealth Chart */}
      <div className="card-psb">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-people-roof text-amber-600" aria-hidden="true" /> {t('generationalTitle')}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {t('generationalSubtitle')}
            </p>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={GENERATION_DATA} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="youGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1B5E20" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="childGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2196F3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px' }} />
              <ReferenceLine x={selectedYear} stroke="#8B5CF6" strokeDasharray="4 4" strokeWidth={1.5} />
              <Area type="monotone" dataKey="you" name={t('generationalYou')} stroke="#1B5E20" strokeWidth={2.5} fill="url(#youGrad)" />
              <Area type="monotone" dataKey="child" name={t('generationalChild')} stroke="#2196F3" strokeWidth={2} fill="url(#childGrad)" />
              <Area type="monotone" dataKey="grandchild" name={t('generationalGrandchild')} stroke="#FFD700" strokeWidth={2} fill="url(#grandGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-500">
          <span className="flex items-center gap-1.5"><div className="w-3 h-1 bg-primary rounded-full" /> {t('generationalYou')}</span>
          <span className="flex items-center gap-1.5"><div className="w-3 h-1 bg-blue-500 rounded-full" /> {t('generationalChild')}</span>
          <span className="flex items-center gap-1.5"><div className="w-3 h-1 bg-amber-400 rounded-full" /> {t('generationalGrandchild')}</span>
        </div>

        {/* Year slider */}
        <div className="mt-4 px-2">
          <input
            type="range"
            min={2026}
            max={2081}
            step={5}
            value={parseInt(selectedYear)}
            onChange={(e) => setSelectedYear(e.target.value)}
            aria-label="Select projected year"
            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>2026 ({t('generationalYou')})</span>
            <span>2056</span>
            <span>2081 ({t('generationalLegacy')})</span>
          </div>
        </div>
      </div>

      {/* Inheritance Plan */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <i className="fas fa-file-signature text-primary" aria-hidden="true" /> {t('generationalInheritanceTitle')}
        </h4>
        <div className="space-y-2">
          {INHERITANCE_PLAN.map((item, idx) => (
            <motion.div
              key={item.asset}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-all"
            >
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className={`fas ${item.icon} text-gray-500 text-sm`} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-bold text-gray-800">{item.asset}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    item.status === 'active' ? 'bg-green-50 text-green-700' : item.status === 'setup' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'
                  }`}>
                    {t(`generationalStatus${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500">{t('generationalTo')} {item.to}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-gray-900">{item.value}</p>
                <p className="text-[10px] text-gray-400">{t(`generationalType${item.type.replace(/\s/g, '')}`)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Life Timeline */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-clock-rotate-left text-primary" aria-hidden="true" /> {t('generationalTimelineTitle')}
        </h4>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-amber-300 to-amber-500" />
          <div className="space-y-4">
            {TIMELINE_EVENTS.map((evt, idx) => (
              <motion.div
                key={evt.event}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="relative ml-10"
              >
                <div className={`absolute -left-[26px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                  evt.type === 'present' ? 'bg-primary' : evt.type === 'critical' ? 'bg-rose-500' : evt.type === 'legacy' ? 'bg-amber-500' : 'bg-blue-400'
                }`} />
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-gray-400">{t('generationalAge')} {evt.age} · {evt.year}</span>
                    {evt.type === 'critical' && <span className="text-[10px] px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-full font-bold">{t('generationalCritical')}</span>}
                    {evt.type === 'legacy' && <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full font-bold">{t('generationalLegacy')}</span>}
                  </div>
                  <p className="text-[11px] font-semibold text-gray-800">{evt.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useTranslation } from '@/shared/hooks/useTranslation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

interface DreamScene {
  id: number;
  title: string;
  year: number;
  description: string;
  elements: { emoji: string; label: string; x: number; y: number; size: number }[];
  colors: string[];
}

const DREAMS: DreamScene[] = [
  {
    id: 1,
    title: 'The Home Vision',
    year: 2028,
    description: 'AI dreams of you unlocking the door to your first home. The SIP you started in 2025 has grown into a ₹12L down payment.',
    elements: [
      { emoji: '🏠', label: 'Home', x: 50, y: 40, size: 80 },
      { emoji: '🔑', label: 'Key', x: 45, y: 55, size: 40 },
      { emoji: '🌳', label: 'Garden', x: 20, y: 70, size: 50 },
      { emoji: '🚗', label: 'Car', x: 75, y: 65, size: 45 },
      { emoji: '👨‍👩‍👧', label: 'Family', x: 55, y: 75, size: 55 },
    ],
    colors: ['#10B981', '#34D399', '#6EE7B7'],
  },
  {
    id: 2,
    title: 'The Education Bloom',
    year: 2036,
    description: 'AI sees your child graduating with honors — the education fund you planted in 2025 has bloomed into ₹28L of opportunity.',
    elements: [
      { emoji: '🎓', label: 'Degree', x: 50, y: 30, size: 70 },
      { emoji: '📚', label: 'Books', x: 30, y: 55, size: 45 },
      { emoji: '🌸', label: 'Bloom', x: 70, y: 50, size: 50 },
      { emoji: '✨', label: 'Stars', x: 45, y: 20, size: 35 },
      { emoji: '🏛️', label: 'College', x: 60, y: 70, size: 60 },
    ],
    colors: ['#8B5CF6', '#A78BFA', '#C4B5FD'],
  },
  {
    id: 3,
    title: 'The Freedom Beach',
    year: 2040,
    description: 'AI visualizes your FIRE moment — passive income now exceeds expenses. You are working because you want to, not because you must.',
    elements: [
      { emoji: '🏖️', label: 'Beach', x: 50, y: 60, size: 90 },
      { emoji: '🌅', label: 'Sunset', x: 50, y: 20, size: 70 },
      { emoji: '✈️', label: 'Travel', x: 25, y: 45, size: 45 },
      { emoji: '📖', label: 'Reading', x: 75, y: 50, size: 40 },
      { emoji: '☕', label: 'Coffee', x: 60, y: 75, size: 35 },
    ],
    colors: ['#F59E0B', '#FBBF24', '#FCD34D'],
  },
  {
    id: 4,
    title: 'The Legacy Garden',
    year: 2055,
    description: 'AI dreams of your grandchildren playing in a garden funded by your wisdom. Your wealth has become a forest of opportunity for generations.',
    elements: [
      { emoji: '🌳', label: 'Oak', x: 30, y: 50, size: 80 },
      { emoji: '🌱', label: 'Seedling', x: 55, y: 70, size: 35 },
      { emoji: '👶', label: 'Child', x: 70, y: 55, size: 45 },
      { emoji: '🦋', label: 'Butterfly', x: 45, y: 35, size: 30 },
      { emoji: '🏡', label: 'Estate', x: 65, y: 30, size: 55 },
    ],
    colors: ['#059669', '#10B981', '#34D399'],
  },
];

export default function DreamVisualizer() {
  const { t } = useTranslation();
  const [activeDream, setActiveDream] = useState(0);
  const [floating, setFloating] = useState(true);
  const dream = DREAMS[activeDream];
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setFloating(f => !f);
    }, 2000);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('dreamsVisualized'), value: DREAMS.length, icon: 'fa-cloud-moon', color: 'bg-violet-50 text-violet-600' },
          { label: t('dreamYearsAhead'), value: '29', icon: 'fa-hourglass-half', color: 'bg-blue-50 text-blue-600' },
          { label: t('dreamConfidence'), value: '89%', icon: 'fa-wand-magic-sparkles', color: 'bg-amber-50 text-amber-600' },
          { label: t('dreamVisualizationPower'), value: '4K', icon: 'fa-eye', color: 'bg-rose-50 text-rose-600' },
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

      <div className="card-psb overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-cloud-moon text-violet-600" aria-hidden="true" /> {t('dreamTitle')}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {t('dreamSubtitle')}
            </p>
          </div>
        </div>

        {/* Dream Selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {DREAMS.map((d, idx) => (
            <button
              key={d.id}
              onClick={() => setActiveDream(idx)}
              className={`px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                activeDream === idx
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {d.year} · {d.title}
            </button>
          ))}
        </div>

        {/* Dream Canvas */}
        <AnimatePresence mode="wait">
          <motion.div
            key={dream.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="relative h-[350px] rounded-xl overflow-hidden"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${dream.colors[0]}20, ${dream.colors[1]}10, ${dream.colors[2]}05)`,
            }}
          >
            {/* Floating particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: dream.colors[i % 3],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={prefersReducedMotion ? false : {
                  y: [0, -20, 0],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={prefersReducedMotion ? undefined : {
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}

            {/* Dream Elements */}
            {dream.elements.map((el, idx) => (
              <motion.div
                key={el.label}
                className="absolute flex flex-col items-center cursor-pointer"
                style={{
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={prefersReducedMotion ? false : {
                  y: floating ? [0, -8, 0] : [0, 5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={prefersReducedMotion ? undefined : {
                  duration: 3 + idx * 0.5,
                  repeat: Infinity,
                  delay: idx * 0.3,
                }}
                whileHover={{ scale: 1.2, zIndex: 10 }}
              >
                <span className="text-4xl filter drop-shadow-lg">{el.emoji}</span>
                <span className="text-[10px] text-gray-500 mt-1 bg-white/80 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                  {el.label}
                </span>
              </motion.div>
            ))}

            {/* Year watermark */}
            <div className="absolute bottom-3 right-4">
              <p className="text-5xl font-extrabold text-gray-200/50">{dream.year}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dream Description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={dream.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100"
          >
            <p className="text-sm font-bold text-violet-800 mb-1">{dream.title} · Year {dream.year}</p>
            <p className="text-[11px] text-violet-600 leading-relaxed italic">"{dream.description}"</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dream Frequency Analysis */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <i className="fas fa-chart-pie text-primary" aria-hidden="true" /> {t('dreamThemesTitle')}
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { theme: 'Home & Security', frequency: '34%', color: '#10B981', icon: '🏠' },
            { theme: 'Education Growth', frequency: '28%', color: '#8B5CF6', icon: '🎓' },
            { theme: 'Travel Freedom', frequency: '22%', color: '#F59E0B', icon: '✈️' },
            { theme: 'Legacy Creation', frequency: '16%', color: '#059669', icon: '🌳' },
          ].map((theme, idx) => (
            <motion.div
              key={theme.theme}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.08 }}
              className="p-3 rounded-xl border border-gray-100 text-center hover:shadow-sm transition-all"
            >
              <span className="text-2xl">{theme.icon}</span>
              <p className="text-[11px] font-bold text-gray-800 mt-1">{theme.theme}</p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div className="h-full rounded-full" style={{ width: theme.frequency, backgroundColor: theme.color }} />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">{theme.frequency} {t('dreamThemesOf')}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

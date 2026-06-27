import { useTranslation } from '@/shared/hooks/useTranslation';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface Chakra {
  name: string;
  sanskrit: string;
  financialAspect: string;
  score: number;
  color: string;
  icon: string;
  description: string;
}

const CHAKRAS: Chakra[] = [
  { name: 'Root', sanskrit: 'मूलाधार', financialAspect: 'Emergency Fund & Stability', score: 62, color: '#DC2626', icon: 'fa-shield-halved', description: 'Foundation of financial security — emergency corpus, basic needs coverage' },
  { name: 'Sacral', sanskrit: 'स्वाधिष्ठान', financialAspect: 'Cash Flow & Flexibility', score: 78, color: '#EA580C', icon: 'fa-water', description: 'Ability to handle income fluctuations — liquidity, side income, adaptability' },
  { name: 'Solar Plexus', sanskrit: 'मणिपुर', financialAspect: 'Confidence & Decision Power', score: 71, color: '#F59E0B', icon: 'fa-sun', description: 'Financial self-esteem — ability to negotiate, invest confidently, say no' },
  { name: 'Heart', sanskrit: 'अनाहत', financialAspect: 'Generosity & Family Wealth', score: 85, color: '#16A34A', icon: 'fa-heart', description: 'Giving capacity — family support, charitable giving, shared wealth' },
  { name: 'Throat', sanskrit: 'विशुद्ध', financialAspect: 'Communication & Transparency', score: 58, color: '#06B6D4', icon: 'fa-microphone', description: 'Financial honesty — discussing money with family, advisor communication' },
  { name: 'Third Eye', sanskrit: 'आज्ञा', financialAspect: 'Intuition & Pattern Recognition', score: 74, color: '#4F46E5', icon: 'fa-eye', description: 'Financial intuition — spotting scams, market timing instincts, gut checks' },
  { name: 'Crown', sanskrit: 'सहस्रार', financialAspect: 'Legacy & Purpose', score: 68, color: '#9333EA', icon: 'fa-crown', description: 'Wealth purpose — generational vision, impact investing, life meaning' },
];

export default function ChakraBalance() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number | null>(null);
  const avgScore = Math.round(CHAKRAS.reduce((s, c) => s + c.score, 0) / CHAKRAS.length);

  return (
    <div className="card-psb">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <i className="fas fa-om text-violet-600 dark:text-violet-300" aria-hidden="true" /> {t('chakraTitle')}
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
            {t('chakraSubtitle')}
          </p>
        </div>
        <div className="px-2.5 py-1 bg-violet-50 dark:bg-violet-900/20 rounded-full text-[10px] font-bold text-violet-700 dark:text-violet-300">
          {t('chakraBalance')}: {avgScore}%
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chakra Visualization */}
        <div className="relative h-[380px] flex items-center justify-center">
          {/* Background glow */}
          <div className="absolute w-64 h-64 bg-gradient-to-br from-violet-200/30 to-amber-200/20 rounded-full blur-3xl" />
          
          {/* Center circle */}
          <div className="absolute w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg z-10">
            <span className="text-white text-lg font-extrabold">₹</span>
          </div>

          {/* Chakra nodes arranged vertically */}
          <div className="relative flex flex-col items-center gap-4 z-10">
            {CHAKRAS.map((chakra, idx) => {
              const isSelected = selected === idx;
              const size = 36 + (chakra.score / 100) * 20;
              return (
                <motion.div
                  key={chakra.name}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1, type: 'spring' }}
                  className="flex items-center gap-3 cursor-pointer group"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(isSelected ? null : idx)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(isSelected ? null : idx); } }}
                >
                  {/* Node */}
                  <motion.div
                    animate={{ 
                      boxShadow: isSelected 
                        ? `0 0 20px ${chakra.color}60` 
                        : `0 0 8px ${chakra.color}30`
                    }}
                    className="rounded-full flex items-center justify-center transition-all duration-300"
                    style={{ 
                      width: size, 
                      height: size, 
                      backgroundColor: chakra.color + '15',
                      border: `2px solid ${chakra.color}${isSelected ? 'FF' : '60'}`
                    }}
                  >
                    <i className={`fas ${chakra.icon}`} style={{ color: chakra.color, fontSize: size * 0.35 }} aria-hidden="true" />
                  </motion.div>

                  {/* Label */}
                  <div className={`transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                    <p className="text-[10px] font-bold" style={{ color: chakra.color }}>{chakra.sanskrit}</p>
                    <p className="text-[11px] font-semibold text-gray-700 dark:text-slate-300">{chakra.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500">{chakra.financialAspect}</p>
                  </div>

                  {/* Score */}
                  <div className="ml-auto text-right">
                    <span className="text-sm font-extrabold" style={{ color: chakra.color }}>{chakra.score}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Connecting lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 380">
            {CHAKRAS.map((_, idx) => {
              if (idx === CHAKRAS.length - 1) return null;
              const y1 = 50 + idx * 46;
              const y2 = 50 + (idx + 1) * 46;
              return (
                <line
                  key={idx}
                  x1={200}
                  y1={y1}
                  x2={200}
                  y2={y2}
                  stroke="#E5E7EB"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>
        </div>

        {/* Detail Panel */}
        <div className="space-y-3">
          {selected !== null ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-xl border-2"
              style={{ borderColor: CHAKRAS[selected].color + '30', backgroundColor: CHAKRAS[selected].color + '05' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: CHAKRAS[selected].color + '15' }}
                >
                  <i className={`fas ${CHAKRAS[selected].icon} text-lg`} style={{ color: CHAKRAS[selected].color }} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-lg font-extrabold" style={{ color: CHAKRAS[selected].color }}>
                    {CHAKRAS[selected].name} Chakra
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">{CHAKRAS[selected].sanskrit} · {CHAKRAS[selected].financialAspect}</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed mb-3">{CHAKRAS[selected].description}</p>
              <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: CHAKRAS[selected].color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${CHAKRAS[selected].score}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">Score: {CHAKRAS[selected].score}/100</p>

              <div className="mt-3 p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] font-bold text-gray-700 dark:text-slate-300 mb-1">{t('chakraAiRecommendation')}</p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 leading-relaxed">
                  {CHAKRAS[selected].score < 60 
                    ? `Your ${CHAKRAS[selected].name} chakra needs attention. Focus on ${CHAKRAS[selected].financialAspect.toLowerCase()} for the next 30 days.`
                    : `Your ${CHAKRAS[selected].name} chakra is strong. Maintain current practices and consider mentoring others.`}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 dark:text-slate-500">
              <i className="fas fa-hand-pointer text-3xl mb-3 text-gray-300 dark:text-slate-600" aria-hidden="true" />
              <p className="text-sm font-medium">{t('chakraSelectEmptyTitle')}</p>
              <p className="text-[11px] mt-1">{t('chakraSelectEmptySubtitle')}</p>
            </div>
          )}

          {/* Mini chakra bars */}
          <div className="space-y-2">
            {CHAKRAS.map((chakra, idx) => (
              <motion.div
                key={chakra.name}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07 }}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${selected === idx ? 'bg-gray-50 dark:bg-slate-800' : 'hover:bg-gray-50/50'}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(idx)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(idx); } }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chakra.color }} aria-hidden="true" />
                <span className="text-[10px] text-gray-600 dark:text-slate-400 flex-1">{chakra.name}</span>
                <div className="w-20 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${chakra.score}%`, backgroundColor: chakra.color }} />
                </div>
                <span className="text-[10px] font-bold w-6 text-right" style={{ color: chakra.color }}>{chakra.score}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

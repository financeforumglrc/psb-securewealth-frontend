import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CosmosCard from '@/shared/components/ui/CosmosCard';

interface Dimension {
  name: string;
  score: number;
  icon: string;
  color: string;
  subscores: { label: string; value: number }[];
}

const DIMENSIONS: Dimension[] = [
  {
    name: 'Financial DNA',
    score: 78,
    icon: 'fa-dna',
    color: '#0f766e',
    subscores: [
      { label: 'Risk Appetite', value: 82 },
      { label: 'Savings Discipline', value: 71 },
      { label: 'Investment Agility', value: 85 },
      { label: 'Debt Management', value: 74 },
    ],
  },
  {
    name: 'Chakra Balance',
    score: 64,
    icon: 'fa-om',
    color: '#8b5cf6',
    subscores: [
      { label: 'Muladhara (Security)', value: 88 },
      { label: 'Svadhisthana (Flow)', value: 62 },
      { label: 'Manipura (Power)', value: 55 },
      { label: 'Anahata (Giving)', value: 70 },
    ],
  },
  {
    name: 'Preparedness',
    score: 71,
    icon: 'fa-shield-halved',
    color: '#1565C0',
    subscores: [
      { label: 'Emergency Fund', value: 65 },
      { label: 'Insurance Cover', value: 78 },
      { label: 'Health Buffer', value: 72 },
      { label: 'Job Security', value: 68 },
    ],
  },
  {
    name: 'Emotional Wealth',
    score: 59,
    icon: 'fa-brain',
    color: '#C2185B',
    subscores: [
      { label: 'Impulse Control', value: 52 },
      { label: 'Stress Resilience', value: 61 },
      { label: 'Money Mindfulness', value: 58 },
      { label: 'Social Comparison', value: 65 },
    ],
  },
];

const ROADMAP = [
  { step: 1, title: 'Build Emergency Corpus', desc: '6 months of expenses in liquid funds', impact: '+12 pts Preparedness', done: true },
  { step: 2, title: 'Reduce Discretionary Spend', desc: 'Cut 15% from dining & entertainment', impact: '+8 pts Emotional', done: false },
  { step: 3, title: 'Diversify Investments', desc: 'Add gold + international equity exposure', impact: '+10 pts DNA', done: false },
  { step: 4, title: 'Chakra Meditation Practice', desc: '10-min daily financial mindfulness', impact: '+15 pts Chakra', done: false },
  { step: 5, title: 'Automate SIP Increases', desc: 'Auto-step-up SIP by 10% yearly', impact: '+10 pts DNA', done: false },
];

function RadialScore({ score, size = 80, stroke = 6, color, label, icon }: {
  score: number; size?: number; stroke?: number; color: string; label: string; icon: string;
}) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;
  const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${circ}` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-extrabold" style={{ color }}>{score}</span>
          <span className="text-[9px] font-bold text-slate-400">{grade}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <i className={`fas ${icon} text-[10px]`} style={{ color }} />
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{label}</span>
      </div>
    </div>
  );
}

export default function ProsperityScore() {
  const [selectedDim, setSelectedDim] = useState<number | null>(null);

  const overall = Math.round(DIMENSIONS.reduce((s, d) => s + d.score, 0) / DIMENSIONS.length);
  const overallColor = overall >= 75 ? '#10b981' : overall >= 50 ? '#f59e0b' : '#ef4444';
  const overallLabel = overall >= 75 ? 'Flourishing' : overall >= 50 ? 'Growing' : 'Needs Care';

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <CosmosCard variant="gradient">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="10" />
                <motion.circle
                  cx="80" cy="80" r="70" fill="none" stroke={overallColor} strokeWidth="10"
                  strokeLinecap="round" strokeDasharray={`${overall * 4.4} 440`}
                  initial={{ strokeDasharray: '0 440' }}
                  animate={{ strokeDasharray: `${overall * 4.4} 440` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span className="text-4xl font-extrabold" style={{ color: overallColor }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  {overall}
                </motion.span>
                <span className="text-[10px] font-bold text-slate-400">PROSPERITY</span>
              </div>
            </div>
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-2 px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: overallColor }}
            >
              {overallLabel}
            </motion.span>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Your Prosperity Score synthesizes four dimensions of financial wellness —
              not just how much you have, but how balanced, prepared, and emotionally aligned you are with wealth.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DIMENSIONS.map((dim, i) => (
                <motion.button
                  key={dim.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setSelectedDim(selectedDim === i ? null : i)}
                  className={`p-3 rounded-xl border transition-all text-center ${
                    selectedDim === i ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-700 hover:border-slate-200'
                  }`}
                >
                  <RadialScore score={dim.score} size={60} stroke={4} color={dim.color} label={dim.name} icon={dim.icon} />
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </CosmosCard>

      {/* Selected Dimension Detail */}
      <AnimatePresence>
        {selectedDim !== null && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <CosmosCard variant="default" header={{ icon: DIMENSIONS[selectedDim].icon, iconColor: DIMENSIONS[selectedDim].color, title: `${DIMENSIONS[selectedDim].name} Breakdown` }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DIMENSIONS[selectedDim].subscores.map((sub) => (
                  <div key={sub.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{sub.label}</span>
                      <span className="text-xs font-bold" style={{ color: DIMENSIONS[selectedDim].color }}>{sub.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: DIMENSIONS[selectedDim].color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${sub.value}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CosmosCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Improvement Roadmap */}
      <CosmosCard variant="default" header={{ icon: 'fa-route', iconColor: '#f59e0b', title: 'Prosperity Roadmap', subtitle: '5 steps to holistic financial wellness' }}>
        <div className="space-y-3">
          {ROADMAP.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-start gap-3 p-3 rounded-xl border ${
                step.done
                  ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                step.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
              }`}>
                {step.done ? <i className="fas fa-check" /> : step.step}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs font-bold ${step.done ? 'text-emerald-700 dark:text-emerald-300 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                    {step.title}
                  </p>
                  <span className="text-[9px] font-bold text-amber-600 flex-shrink-0">{step.impact}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-xs text-primary font-bold text-center">
            <i className="fas fa-seedling mr-1" />
            Complete all 5 steps to reach Prosperity Score 85+ (Grade A)
          </p>
        </div>
      </CosmosCard>

      {/* Wisdom Quote */}
      <CosmosCard variant="glass">
        <div className="text-center py-4">
          <i className="fas fa-quote-left text-slate-300 text-lg mb-2" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic">
            "Prosperity is not just the accumulation of wealth, but the harmonious alignment of purpose, preparedness, and peace."
          </p>
          <p className="text-[10px] text-slate-400 mt-2">— BHAVISHYA Financial Philosophy</p>
        </div>
      </CosmosCard>
    </div>
  );
}

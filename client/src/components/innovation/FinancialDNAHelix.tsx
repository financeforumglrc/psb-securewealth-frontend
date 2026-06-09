import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';

interface DNAStrand {
  trait: string;
  value: number;
  color: string;
  description: string;
  category: 'behavioral' | 'cognitive' | 'emotional' | 'social';
}

const DNA_TRAITS: DNAStrand[] = [
  { trait: 'Savings Velocity', value: 78, color: '#1B5E20', description: 'Rate at which you accumulate savings vs peers', category: 'behavioral' },
  { trait: 'Risk Appetite', value: 62, color: '#FFD700', description: 'Willingness to take calculated financial risks', category: 'behavioral' },
  { trait: 'Impulse Control', value: 85, color: '#4CAF50', description: 'Ability to resist unplanned expenditures', category: 'cognitive' },
  { trait: 'Goal Orientation', value: 71, color: '#FF9800', description: 'Consistency in pursuing long-term objectives', category: 'cognitive' },
  { trait: 'Financial Literacy', value: 68, color: '#2196F3', description: 'Understanding of financial instruments & markets', category: 'cognitive' },
  { trait: 'Social Influence', value: 45, color: '#9C27B0', description: 'Impact of peer/social spending on your habits', category: 'social' },
  { trait: 'Emergency Preparedness', value: 54, color: '#F44336', description: 'Readiness for unexpected financial shocks', category: 'behavioral' },
  { trait: 'Investment Discipline', value: 73, color: '#00BCD4', description: 'Consistency in investment contributions', category: 'behavioral' },
  { trait: 'Emotional Spending', value: 38, color: '#E91E63', description: 'How emotions drive purchase decisions', category: 'emotional' },
  { trait: 'Decision Fatigue', value: 67, color: '#795548', description: 'Quality degradation in financial decisions over time', category: 'cognitive' },
  { trait: 'FOMO Resistance', value: 82, color: '#607D8B', description: 'Ability to resist fear-of-missing-out investments', category: 'emotional' },
  { trait: 'Delayed Gratification', value: 76, color: '#3F51B5', description: 'Capacity to wait for larger future rewards', category: 'cognitive' },
];

const BEHAVIORAL_BIOMETRICS = [
  { name: 'Typing Cadence', value: 87, icon: 'fa-keyboard', desc: 'Unique keystroke rhythm during UPI PIN entry' },
  { name: 'Swipe Signature', value: 92, icon: 'fa-fingerprint', desc: 'Screen touch pressure & velocity pattern' },
  { name: 'Transaction Timing', value: 64, icon: 'fa-clock', desc: 'Hour-of-day & day-of-week spending patterns' },
  { name: 'Scroll Behavior', value: 78, icon: 'fa-computer-mouse', desc: 'Content consumption speed before investment decisions' },
  { name: 'Decision Latency', value: 71, icon: 'fa-hourglass-half', desc: 'Time taken to confirm high-value transactions' },
  { name: 'App Navigation', value: 83, icon: 'fa-route', desc: 'Unique click-path fingerprint across banking flows' },
];

const COGNITIVE_PATTERNS = [
  { label: 'Morning Optimist', score: 78, detail: 'Best financial decisions made 6–10 AM' },
  { label: 'Weekend Spender', score: 42, detail: '23% higher discretionary spend on weekends' },
  { label: 'Sale Triggered', score: 35, detail: '3.2x more likely to buy during discount events' },
  { label: 'Round-Up Saver', score: 89, detail: 'Automatically rounds 94% of transactions' },
  { label: 'Goal Visualizer', score: 71, detail: 'Responds 2.4x better to visual goal tracking' },
  { label: 'Social Proof Driven', score: 56, detail: 'Influenced by peer investment choices' },
];

export default function FinancialDNAHelix() {
  const [hoveredTrait, setHoveredTrait] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  useEffect(() => {
    let animId: number;
    const animate = () => {
      setRotation((r) => (r + 0.3) % 360);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const getHelixPoint = (index: number, strand: 'left' | 'right', total: number) => {
    const angle = (index / total) * Math.PI * 4 + (rotation * Math.PI) / 180;
    const y = (index / total) * 320;
    const radius = 70;
    const x = strand === 'left' 
      ? Math.cos(angle) * radius 
      : Math.cos(angle + Math.PI) * radius;
    const z = strand === 'left'
      ? Math.sin(angle) * radius
      : Math.sin(angle + Math.PI) * radius;
    return { x, y, z, opacity: (z + radius) / (2 * radius) * 0.6 + 0.4 };
  };

  const filteredTraits = useMemo(() => 
    activeCategory === 'all' ? DNA_TRAITS : DNA_TRAITS.filter(t => t.category === activeCategory),
  [activeCategory]);

  const categories = [
    { key: 'all', label: 'All Traits', count: DNA_TRAITS.length },
    { key: 'behavioral', label: 'Behavioral', count: DNA_TRAITS.filter(t => t.category === 'behavioral').length },
    { key: 'cognitive', label: 'Cognitive', count: DNA_TRAITS.filter(t => t.category === 'cognitive').length },
    { key: 'emotional', label: 'Emotional', count: DNA_TRAITS.filter(t => t.category === 'emotional').length },
    { key: 'social', label: 'Social', count: DNA_TRAITS.filter(t => t.category === 'social').length },
  ];

  const avgScore = Math.round(DNA_TRAITS.reduce((s, t) => s + t.value, 0) / DNA_TRAITS.length);

  return (
    <div className="space-y-5">
      {/* DNA Card */}
      <div className="card-psb overflow-hidden" ref={containerRef}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-dna text-primary" /> Financial DNA Helix
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Your unique financial genome — 12 behavioral dimensions mapped in real-time</p>
          </div>
          <div className="flex gap-2">
            <div className="px-2.5 py-1 bg-primary/10 rounded-full text-[10px] font-bold text-primary">
              Gen 3.0 AI
            </div>
            <div className="px-2.5 py-1 bg-amber-50 rounded-full text-[10px] font-bold text-amber-700">
              Avg: {avgScore}%
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Helix Visualization */}
          <div className="relative h-[340px] bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="-100 0 200 320" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                {Array.from({ length: 40 }).map((_, i) => {
                  const left = getHelixPoint(i, 'left', 40);
                  const right = getHelixPoint(i, 'right', 40);
                  return (
                    <line
                      key={`conn-${i}`}
                      x1={left.x}
                      y1={left.y}
                      x2={right.x}
                      y2={right.y}
                      stroke={i % 5 === 0 ? '#1B5E20' : '#E0E0E0'}
                      strokeWidth={i % 5 === 0 ? 2 : 0.5}
                      opacity={Math.min(left.opacity, right.opacity) * (i % 5 === 0 ? 0.8 : 0.3)}
                    />
                  );
                })}
                {Array.from({ length: 40 }).map((_, i) => {
                  const p = getHelixPoint(i, 'left', 40);
                  return (
                    <circle
                      key={`left-${i}`}
                      cx={p.x}
                      cy={p.y}
                      r={i % 5 === 0 ? 4.5 : 2.5}
                      fill={i % 5 === 0 ? '#FFD700' : '#1B5E20'}
                      opacity={p.opacity}
                    />
                  );
                })}
                {Array.from({ length: 40 }).map((_, i) => {
                  const p = getHelixPoint(i, 'right', 40);
                  return (
                    <circle
                      key={`right-${i}`}
                      cx={p.x}
                      cy={p.y}
                      r={i % 5 === 0 ? 4.5 : 2.5}
                      fill={i % 5 === 0 ? '#FFD700' : '#1B5E20'}
                      opacity={p.opacity}
                    />
                  );
                })}
              </svg>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex justify-between text-[9px] text-gray-400">
              <span>Behavioral Genotype v3.0</span>
              <span>Updated: Live</span>
            </div>
            <div className="absolute top-3 right-3 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100">
              <p className="text-[9px] text-gray-500">Uniqueness</p>
              <p className="text-sm font-extrabold text-primary">94.2%</p>
            </div>
          </div>

          {/* Trait Bars */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {filteredTraits.map((trait, idx) => (
              <motion.div
                key={trait.trait}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: idx * 0.06, duration: 0.4 }}
                className={`group cursor-pointer rounded-lg p-2.5 transition-all duration-200 ${
                  hoveredTrait === idx ? 'bg-primary/5 shadow-sm' : 'hover:bg-gray-50'
                }`}
                onMouseEnter={() => setHoveredTrait(idx)}
                onMouseLeave={() => setHoveredTrait(null)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: trait.color }}
                    />
                    <span className="text-[11px] font-semibold text-gray-700">{trait.trait}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">{trait.category}</span>
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: trait.color }}>
                    {trait.value}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: trait.color }}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${trait.value}%` } : {}}
                    transition={{ delay: idx * 0.08 + 0.3, duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                {hoveredTrait === idx && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-[10px] text-gray-500 mt-1 leading-relaxed"
                  >
                    {trait.description}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Behavioral Biometrics Grid */}
      <div className="card-psb">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-fingerprint text-violet-600" /> Behavioral Biometric DNA
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              6 unique biometric signatures create an unforgeable financial identity
            </p>
          </div>
          <div className="px-2.5 py-1 bg-violet-50 rounded-full text-[10px] font-bold text-violet-700">
            Continuous Auth
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {BEHAVIORAL_BIOMETRICS.map((bio, idx) => (
            <motion.div
              key={bio.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: idx * 0.08 }}
              className="p-3 rounded-xl border border-gray-100 hover:border-violet-200 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                  <i className={`fas ${bio.icon} text-violet-600 text-xs`} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-800">{bio.name}</p>
                  <p className="text-[10px] text-gray-500">{bio.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-violet-500"
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${bio.value}%` } : {}}
                    transition={{ delay: idx * 0.1 + 0.4, duration: 0.8 }}
                  />
                </div>
                <span className="text-[11px] font-bold text-violet-600">{bio.value}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cognitive Patterns */}
      <div className="card-psb">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-brain text-rose-500" /> Cognitive Spending Patterns
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              How your brain makes financial decisions — decoded by AI
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COGNITIVE_PATTERNS.map((pat, idx) => (
            <motion.div
              key={pat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.07 }}
              className="p-3 rounded-xl border border-gray-100 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-700">{pat.label}</span>
                <span className={`text-[11px] font-extrabold ${pat.score >= 70 ? 'text-green-600' : pat.score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {pat.score}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                <motion.div
                  className={`h-full rounded-full ${pat.score >= 70 ? 'bg-green-500' : pat.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${pat.score}%` } : {}}
                  transition={{ delay: idx * 0.1 + 0.3, duration: 0.7 }}
                />
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed">{pat.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* DNA Match & Peer Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-r from-primary/5 to-amber-50 rounded-xl border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="fas fa-fingerprint text-primary text-lg" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">Financial DNA Uniqueness Score</p>
              <p className="text-[11px] text-gray-500">Your profile matches 0.003% of Indian banking customers</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-primary">94.2</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-wide">Percentile</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
              <i className="fas fa-shield-halved text-violet-600 text-lg" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">Biometric Authentication</p>
              <p className="text-[11px] text-gray-500">Continuous behavioral verification active — 99.7% accuracy</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-violet-600">99.7%</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-wide">Accuracy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

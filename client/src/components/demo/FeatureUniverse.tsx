import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Snowflake,
  UserX,
  Ghost,
  Umbrella,
  Bot,
  Users,
  Sparkles,
  BrainCircuit,
  ShieldCheck,
  Database,
  Globe,
  Calculator,
  Leaf,
  Trophy,
  Timer,
  Search,
  Play,
  Lock,
  Eye,
  HeartPulse,
  Plane,
  CloudRain,
  PhoneCall,
  X,
  CheckCircle,
  AlertTriangle,
  Fingerprint,
  EyeOff,
  Bell,
  MessageSquare,
  PhoneOff,
  Activity,
  Zap,
  TrendingUp,
  UserPlus,
  Target,
  Calendar,
  Moon,
  MapPin,
  Radio,
  Briefcase,
  User,
  Download,
  Factory,
  HeartHandshake,
  Crown,
  FileKey,
  type LucideIcon,
} from 'lucide-react';

interface FeatureNode {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  tag: string;
  category: 'Security' | 'AI' | 'Wealth' | 'Inclusive' | 'Privacy';
  desc: string;
  demo: 'cooling' | 'decoy' | 'ghost' | 'parametric' | 'agent' | 'social' | 'bhavishya' | 'neuro' | 'immune' | 'sovereign' | 'modes' | 'tax' | 'values' | 'fantasy' | 'dms';
}

const FEATURES: FeatureNode[] = [
  { id: 'cooling', title: 'Cooling Vault', icon: Snowflake, color: 'cyan', gradient: 'from-cyan-500 to-blue-600', tag: 'Security', category: 'Security', desc: 'Time-locks high-risk actions so impulsive or coerced transfers cannot move instantly.', demo: 'cooling' },
  { id: 'decoy', title: 'Decoy Account', icon: UserX, color: 'rose', gradient: 'from-rose-500 to-pink-600', tag: 'Duress', category: 'Security', desc: 'Duress PIN shows a fake low-balance account while silently freezing the real one.', demo: 'decoy' },
  { id: 'ghost', title: 'Ghost Mode', icon: Ghost, color: 'violet', gradient: 'from-violet-500 to-fuchsia-600', tag: 'AI Defense', category: 'AI', desc: "AI bot answers scam calls and wastes fraudsters' time with confused replies.", demo: 'ghost' },
  { id: 'parametric', title: 'Parametric Insurance', icon: Umbrella, color: 'emerald', gradient: 'from-emerald-500 to-teal-600', tag: 'Insurance', category: 'Wealth', desc: 'Flight delay, border crossing or rainfall triggers auto-payout — no forms, no wait.', demo: 'parametric' },
  { id: 'agent', title: 'Autonomous Agent', icon: Bot, color: 'amber', gradient: 'from-amber-500 to-orange-600', tag: 'AI CFO', category: 'AI', desc: '24/7 personal CFO that hunts FD rates, negotiates bills, boosts SIPs and files taxes.', demo: 'agent' },
  { id: 'social', title: 'Social Collateral Loan', icon: Users, color: 'blue', gradient: 'from-blue-500 to-indigo-600', tag: 'Lending', category: 'Wealth', desc: 'Friends and family vouch for you to lower interest rates without cash collateral.', demo: 'social' },
  { id: 'bhavishya', title: 'BHAVISHYA Engine', icon: Sparkles, color: 'purple', gradient: 'from-purple-500 to-violet-600', tag: 'Predictive AI', category: 'AI', desc: 'Predictive life-cycle engine: chat with your 2035 self, crisis shield, generational wealth.', demo: 'bhavishya' },
  { id: 'neuro', title: 'Neuro-Friction', icon: BrainCircuit, color: 'fuchsia', gradient: 'from-fuchsia-500 to-pink-600', tag: 'Behavioral', category: 'AI', desc: 'Blocks late-night stress spends by reading simulated HRV, sleep and stress signals.', demo: 'neuro' },
  { id: 'immune', title: 'Collective Immune', icon: ShieldCheck, color: 'green', gradient: 'from-green-500 to-lime-600', tag: 'Network', category: 'Security', desc: '2.8M users share anonymized threat signals to auto-immunize the community.', demo: 'immune' },
  { id: 'sovereign', title: 'Sovereign Vault', icon: Database, color: 'slate', gradient: 'from-slate-500 to-zinc-600', tag: 'Privacy', category: 'Privacy', desc: 'Financial history stays on-device; bank sees only zero-knowledge proofs.', demo: 'sovereign' },
  { id: 'modes', title: 'NRI / Senior / Business', icon: Globe, color: 'orange', gradient: 'from-orange-500 to-red-600', tag: 'Inclusive', category: 'Inclusive', desc: 'One app adapts to NRIs, senior citizens, business owners and students.', demo: 'modes' },
  { id: 'tax', title: 'Tax Optimizer', icon: Calculator, color: 'emerald', gradient: 'from-emerald-500 to-green-600', tag: 'Tax', category: 'Wealth', desc: 'Live sliders for 80C, 80D, NPS, HRA — instant tax-saved counter.', demo: 'tax' },
  { id: 'values', title: 'Values Alignment', icon: Leaf, color: 'lime', gradient: 'from-lime-500 to-green-600', tag: 'ESG', category: 'Wealth', desc: 'Flags portfolio holdings that conflict with your values and suggests ethical alternatives.', demo: 'values' },
  { id: 'fantasy', title: 'Fantasy Finance League', icon: Trophy, color: 'yellow', gradient: 'from-yellow-500 to-amber-600', tag: 'Gamification', category: 'Wealth', desc: 'Compete with AI peers in weekly portfolio themes with leaderboards.', demo: 'fantasy' },
  { id: 'dms', title: "Dead Man's Switch", icon: Timer, color: 'red', gradient: 'from-red-500 to-rose-600', tag: 'Legacy', category: 'Security', desc: 'Auto-transfers wealth to beneficiaries if you miss check-ins for a set period.', demo: 'dms' },
];

const CATEGORIES: FeatureNode['category'][] = ['Security', 'AI', 'Wealth', 'Inclusive', 'Privacy'];

const categoryStyles: Record<FeatureNode['category'], { pill: string; border: string; chip: string }> = {
  Security: { pill: 'bg-rose-500/10 text-rose-400 border-rose-500/20', border: 'hover:border-rose-500/50', chip: 'bg-rose-500/20 text-rose-300' },
  AI: { pill: 'bg-violet-500/10 text-violet-400 border-violet-500/20', border: 'hover:border-violet-500/50', chip: 'bg-violet-500/20 text-violet-300' },
  Wealth: { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', border: 'hover:border-emerald-500/50', chip: 'bg-emerald-500/20 text-emerald-300' },
  Inclusive: { pill: 'bg-orange-500/10 text-orange-400 border-orange-500/20', border: 'hover:border-orange-500/50', chip: 'bg-orange-500/20 text-orange-300' },
  Privacy: { pill: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', border: 'hover:border-cyan-500/50', chip: 'bg-cyan-500/20 text-cyan-300' },
};

export default function FeatureUniverse() {
  const [selected, setSelected] = useState<FeatureNode | null>(null);
  const [activeCategory, setActiveCategory] = useState<'All' | FeatureNode['category']>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = FEATURES.filter((f) => {
    const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || [f.title, f.tag, f.desc].some((s) => s.toLowerCase().includes(term));
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="relative min-h-screen py-24 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto mb-12 relative z-10">
        <div className="text-center mb-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-4"
          >
            Feature Lab
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl font-black tracking-tight mb-4"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent">
              SecureWealth Feature Lab
            </span>
          </motion.h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            15 live simulations. One dashboard.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {(['All', ...CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-lg shadow-cyan-500/25'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search features, tags, demos..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 text-sm placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((f) => {
              const Icon = f.icon;
              const styles = categoryStyles[f.category];
              return (
                <motion.div
                  layout
                  key={f.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}
                  onClick={() => setSelected(f)}
                  className={`cursor-pointer group p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl transition-colors ${styles.border}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${styles.pill}`}>
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors">{f.title}</h3>
                  <p className="text-sm text-slate-400 mb-5 leading-relaxed">{f.desc}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(f);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:from-cyan-500 hover:to-blue-500 transition-all"
                  >
                    <Play className="w-4 h-4" />
                    Run Demo
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No features match your search.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <FeatureModal feature={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}

function FeatureModal({ feature, onClose }: { feature: FeatureNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50, rotateX: 20 }}
        animate={{ scale: 1, y: 0, rotateX: 0 }}
        exit={{ scale: 0.8, y: 50, rotateX: -20 }}
        transition={{ type: 'spring', damping: 20 }}
        style={{ perspective: '1000px' }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900/80 border border-slate-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-100">{feature.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full bg-${feature.color}-500/10 text-${feature.color}-400 border border-${feature.color}-500/20`}>{feature.tag}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-slate-400 mb-6">{feature.desc}</p>
          <MiniDemo type={feature.demo} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function MiniDemo({ type }: { type: FeatureNode['demo'] }) {
  switch (type) {
    case 'cooling': return <CoolingDemo />;
    case 'decoy': return <DecoyDemo />;
    case 'ghost': return <GhostDemo />;
    case 'parametric': return <ParametricDemo />;
    case 'agent': return <AgentDemo />;
    case 'social': return <SocialLoanDemo />;
    case 'bhavishya': return <BhavishyaDemo />;
    case 'neuro': return <NeuroDemo />;
    case 'immune': return <ImmuneDemo />;
    case 'sovereign': return <SovereignDemo />;
    case 'modes': return <ModesDemo />;
    case 'tax': return <TaxDemo />;
    case 'values': return <ValuesDemo />;
    case 'fantasy': return <FantasyDemo />;
    case 'dms': return <DMSDemo />;
    default: return null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   MINI DEMOS
   ═══════════════════════════════════════════════════════════════ */

function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-5 rounded-2xl bg-slate-800/50 border border-slate-700 ${className}`}>{children}</div>;
}

function CoolingDemo() {
  const [step, setStep] = useState<'idle' | 'cooling' | 'verify' | 'done'>('idle');
  const [left, setLeft] = useState(15);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);

  useEffect(() => {
    if (step !== 'cooling') return;
    if (left <= 0) {
      setStep('verify');
      return;
    }
    const t = setInterval(() => setLeft((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(t);
  }, [step, left]);

  useEffect(() => {
    if (step !== 'verify') return;
    const t = setTimeout(() => {
      setResult(Math.random() > 0.2 ? 'success' : 'fail');
      setStep('done');
    }, 2200);
    return () => clearTimeout(t);
  }, [step]);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = left / 15;

  const reset = () => {
    setStep('idle');
    setLeft(15);
    setResult(null);
  };

  const badge =
    step === 'idle' ? 'IDLE' : step === 'cooling' ? 'COOLING' : step === 'verify' ? 'VERIFYING' : result === 'success' ? 'RELEASED' : 'BLOCKED';
  const badgeClass =
    step === 'idle'
      ? 'bg-slate-700 text-slate-400'
      : step === 'done' && result === 'fail'
      ? 'bg-rose-500/20 text-rose-300'
      : 'bg-cyan-500/20 text-cyan-300';

  return (
    <Glass>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Snowflake className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-slate-200">High-risk transfer</span>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeClass}`}>{badge}</span>
      </div>
      <p className="text-sm text-slate-400 mb-4">₹2,50,000 to Unknown Merchant. The Cooling Vault time-locks this action.</p>

      {step === 'idle' && (
        <button
          onClick={() => setStep('cooling')}
          className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
        >
          Start Transfer
        </button>
      )}

      {step === 'cooling' && (
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90">
              <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                strokeLinecap="round"
                className="text-cyan-400 transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-cyan-300 font-mono">{left}s</div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Wait + OTP + biometric required to release</p>
        </div>
      )}

      {step === 'verify' && (
        <div className="text-center py-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 mb-3"
          >
            <Fingerprint className="w-8 h-8 text-cyan-400" />
          </motion.div>
          <p className="text-sm text-cyan-300 font-bold">Verifying OTP + biometric...</p>
        </div>
      )}

      {step === 'done' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center p-4 rounded-2xl border ${
            result === 'success' ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-rose-900/20 border-rose-500/30'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
              result === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
            }`}
          >
            {result === 'success' ? <ShieldCheck className="w-7 h-7 text-emerald-400" /> : <AlertTriangle className="w-7 h-7 text-rose-400" />}
          </div>
          <p className={`text-xl font-black ${result === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>
            {result === 'success' ? 'Transfer released safely' : 'Release blocked by vault'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {result === 'success' ? 'Biometric matched · OTP valid' : 'Biometric mismatch · contact support'}
          </p>
          <button onClick={reset} className="mt-4 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm font-bold">
            Reset
          </button>
        </motion.div>
      )}
    </Glass>
  );
}

function DecoyDemo() {
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState<'input' | 'real' | 'decoy' | 'wrong'>('input');
  const REAL_PIN = '1234';
  const DURESS_PIN = '9999';

  const press = (d: string) => {
    if (pin.length < 4) setPin((p) => p + d);
  };
  const clear = () => {
    setPin('');
    setMode('input');
  };
  const submit = () => {
    if (pin === REAL_PIN) setMode('real');
    else if (pin === DURESS_PIN) setMode('decoy');
    else setMode('wrong');
  };

  return (
    <Glass>
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-slate-200">Secure PIN entry</span>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${
            mode === 'decoy' ? 'bg-rose-500/20 text-rose-300' : mode === 'real' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
          }`}
        >
          {mode === 'input' ? 'ENTER PIN' : mode === 'decoy' ? 'DECOY' : mode === 'real' ? 'AUTHENTICATED' : 'WRONG PIN'}
        </span>
      </div>

      <div
        className={`p-4 rounded-xl border mb-4 ${
          mode === 'decoy' ? 'bg-rose-900/20 border-rose-500/40' : mode === 'real' ? 'bg-emerald-900/20 border-emerald-500/40' : 'bg-slate-900/50 border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Available balance</span>
          {mode === 'decoy' && <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500 text-white font-bold">DECOY MODE</span>}
        </div>
        <p className={`text-3xl font-black ${mode === 'decoy' ? 'text-rose-300' : mode === 'real' ? 'text-emerald-400' : 'text-slate-300'}`}>
          {mode === 'decoy' ? '₹12,430' : mode === 'real' ? '₹3,00,700' : '₹—,——'}
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 ${i < pin.length ? 'bg-cyan-400 border-cyan-400' : 'border-slate-600'}`} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map((k) => {
          const isAction = k === 'C' || k === 'OK';
          return (
            <button
              key={k}
              onClick={() => {
                if (k === 'C') clear();
                else if (k === 'OK') submit();
                else press(k);
              }}
              className={`py-3 rounded-xl text-sm font-bold ${
                isAction ? 'bg-rose-600 text-white' : mode === 'decoy' ? 'bg-rose-900/30 text-rose-200 hover:bg-rose-900/50' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {k}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {mode === 'decoy' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300"
          >
            <Bell className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Silent alert sent</p>
              <p className="text-rose-300/80">Real account frozen. Emergency contact & authorities notified without unlocking.</p>
            </div>
            <EyeOff className="w-4 h-4 shrink-0 mt-0.5 ml-auto" />
          </motion.div>
        )}
      </AnimatePresence>
      {mode === 'wrong' && <p className="mt-3 text-center text-xs text-rose-400">Incorrect PIN. Tap C to retry.</p>}
    </Glass>
  );
}

function GhostDemo() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [messages, setMessages] = useState<{ side: 'scammer' | 'ghost'; text: string }[]>([]);

  const full = [
    { side: 'scammer' as const, text: 'Sir, your KYC is expired. Share the OTP now.' },
    { side: 'ghost' as const, text: 'OTP? I thought KYC needs PAN and Aadhaar?' },
    { side: 'scammer' as const, text: 'Just tell me the OTP. Your account will be blocked!' },
    { side: 'ghost' as const, text: 'Wait, which bank? I have 7 accounts across India.' },
    { side: 'scammer' as const, text: 'The one ending 4521. Hurry!' },
    { side: 'ghost' as const, text: 'Strange, I only have accounts ending in 9999 and 0001...' },
    { side: 'ghost' as const, text: 'Also, is this call recorded for training?' },
  ];

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    setMessages([]);
    full.forEach((m, i) => {
      setTimeout(() => {
        setMessages((prev) => [...prev, m]);
        if (i === full.length - 1) setRunning(false);
      }, 900 + i * 1200);
    });
  }, [running]);

  const start = () => {
    setSeconds(0);
    setRunning(true);
  };

  return (
    <Glass>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-violet-400" />
          <span className="font-bold text-slate-200">Incoming scam call</span>
        </div>
        <div className="text-xs font-mono text-violet-300 bg-violet-500/10 px-2 py-1 rounded-full flex items-center gap-1">
          <Timer className="w-3 h-3" />
          {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
        </div>
      </div>
      <button
        onClick={start}
        disabled={running}
        className="mb-4 px-4 py-2 rounded-lg bg-violet-600 disabled:opacity-50 text-white text-sm font-bold flex items-center gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        Receive Scam Call
      </button>
      <div className="space-y-2 h-48 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: m.side === 'scammer' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex ${m.side === 'scammer' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                m.side === 'scammer' ? 'bg-slate-800 text-slate-300 rounded-bl-none' : 'bg-violet-600 text-white rounded-br-none'
              }`}
            >
              {m.text}
            </div>
          </motion.div>
        ))}
        {!running && messages.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 pt-2 text-xs text-violet-300">
            <PhoneOff className="w-4 h-4" /> Scammer hung up · wasted {Math.floor(seconds / 60)}m {seconds % 60}s
          </motion.div>
        )}
      </div>
    </Glass>
  );
}

function ParametricDemo() {
  const [selected, setSelected] = useState<string | null>(null);
  const [stage, setStage] = useState<'pick' | 'verify' | 'paid'>('pick');
  const policies = [
    { id: 'flight', label: 'Flight Delay', icon: Plane, event: 'AI101 delayed 62 min', payout: 25000 },
    { id: 'rain', label: 'Crop Rain', icon: CloudRain, event: 'Rainfall > 120mm in district', payout: 50000 },
    { id: 'travel', label: 'Travel Cover', icon: Globe, event: 'Border crossing detected', payout: 10000 },
  ];

  const choose = (id: string) => {
    setSelected(id);
    setStage('verify');
    setTimeout(() => setStage('paid'), 2000);
  };
  const reset = () => {
    setSelected(null);
    setStage('pick');
  };

  const policy = policies.find((p) => p.id === selected);

  return (
    <Glass>
      <p className="text-sm text-slate-400 mb-4">No forms. Verified data triggers instant payout.</p>
      {stage === 'pick' && (
        <div className="grid sm:grid-cols-3 gap-3">
          {policies.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => choose(p.id)}
                className="p-4 rounded-xl border text-left transition-colors bg-slate-900/40 border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-900/10"
              >
                <Icon className="w-6 h-6 mb-2 text-emerald-400" />
                <p className="text-xs font-bold text-slate-200">{p.label}</p>
              </button>
            );
          })}
        </div>
      )}

      {stage === 'verify' && policy && (
        <div className="text-center py-6">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="inline-block mb-3">
            <Zap className="w-8 h-8 text-emerald-400" />
          </motion.div>
          <p className="text-sm font-bold text-emerald-300">Oracle verifying {policy.label.toLowerCase()} event...</p>
          <p className="text-xs text-slate-500 mt-1">{policy.event}</p>
        </div>
      )}

      {stage === 'paid' && policy && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-5 rounded-2xl bg-emerald-900/20 border border-emerald-500/30"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <p className="text-sm text-emerald-300 font-bold">{policy.event}</p>
          <p className="text-3xl font-black text-white mt-1">
            ₹{policy.payout.toLocaleString('en-IN')} <span className="text-xs font-normal text-emerald-400">auto-credited</span>
          </p>
          <button onClick={reset} className="mt-4 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm font-bold">
            Claim another
          </button>
        </motion.div>
      )}
    </Glass>
  );
}

function AgentDemo() {
  const [tasks, setTasks] = useState([
    { label: 'Auto FD hunt', on: true, win: 'Switched FD to 7.8%' },
    { label: 'Bill negotiation', on: false, win: 'Broadband bill reduced ₹200' },
    { label: 'SIP booster', on: true, win: 'Boosted SIP by ₹2,000' },
    { label: 'Tax-loss harvest', on: false, win: 'Harvested ₹18,000 loss' },
  ]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>(['Agent online · monitoring 14 opportunities']);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const toggle = (i: number) => {
    setTasks((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], on: !next[i].on };
      return next;
    });
  };

  const run = () => {
    setRunning(true);
    setProgress(0);
    setLog(['Agent run started...']);
    const active = tasks.filter((t) => t.on);
    const total = active.length || 1;
    active.forEach((t, i) => {
      setTimeout(() => {
        setProgress(((i + 0.5) / total) * 100);
        setLog((l) => [...l, `Scanning ${t.label.toLowerCase()}...`].slice(-6));
      }, i * 900 + 400);
      setTimeout(() => {
        setProgress(((i + 1) / total) * 100);
        setLog((l) => [...l, `Win: ${t.win}`].slice(-6));
      }, i * 900 + 1100);
    });
    setTimeout(() => {
      setRunning(false);
      setProgress(100);
      setLog((l) => [...l, 'Run complete · 24/7 watch resumed'].slice(-6));
    }, active.length * 900 + 1600);
  };

  return (
    <Glass>
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-5 h-5 text-amber-400" />
        <span className="font-bold text-slate-200">Your 24/7 CFO</span>
      </div>
      <div className="space-y-2 mb-4">
        {tasks.map((t, i) => (
          <label key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-700 cursor-pointer">
            <span className="text-sm text-slate-300">{t.label}</span>
            <input type="checkbox" checked={t.on} onChange={() => toggle(i)} className="w-4 h-4 accent-amber-500" />
          </label>
        ))}
      </div>
      <button
        onClick={run}
        disabled={running || !tasks.some((t) => t.on)}
        className="w-full py-2 rounded-lg bg-amber-600 disabled:opacity-50 text-white text-sm font-bold mb-4"
      >
        {running ? 'Agent running...' : 'Run Agent Now'}
      </button>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-amber-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div ref={logRef} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 font-mono text-xs space-y-1 max-h-32 overflow-y-auto">
        {log.map((l, i) => (
          <motion.p
            key={`${i}-${l}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${l.startsWith('Win') ? 'text-emerald-400' : l.includes('complete') ? 'text-cyan-400' : 'text-amber-300'} flex items-center gap-2`}
          >
            {l.startsWith('Win') ? <TrendingUp className="w-3 h-3" /> : l.includes('complete') ? <CheckCircle className="w-3 h-3" /> : <span>➜</span>}
            {l}
          </motion.p>
        ))}
      </div>
    </Glass>
  );
}

function SocialLoanDemo() {
  const friends = ['Amit', 'Priya', 'Rohan', 'Sneha', 'Vikram', 'Ananya'];
  const [vouched, setVouched] = useState<string[]>(['Amit', 'Priya']);
  const [disbursing, setDisbursing] = useState(false);
  const [disbursed, setDisbursed] = useState(false);
  const rate = Math.max(8, 18 - vouched.length * 2.5).toFixed(1);
  const amount = 500000 + vouched.length * 150000;

  const toggle = (name: string) => {
    setVouched((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
    setDisbursed(false);
  };
  const disburse = () => {
    setDisbursing(true);
    setTimeout(() => {
      setDisbursing(false);
      setDisbursed(true);
    }, 1500);
  };

  return (
    <Glass>
      <p className="text-sm text-slate-400 mb-3">Friends vouch → lower rate · no cash collateral.</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {friends.map((name) => {
          const active = vouched.includes(name);
          return (
            <button
              key={name}
              onClick={() => toggle(name)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                active ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {active ? <CheckCircle className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
              {name}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-slate-900/40 text-center">
          <p className="text-xs text-slate-500">Interest rate</p>
          <p className="text-2xl font-black text-emerald-400">{rate}%</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/40 text-center">
          <p className="text-xs text-slate-500">Eligible amount</p>
          <p className="text-2xl font-black text-blue-400">₹{amount.toLocaleString('en-IN')}</p>
        </div>
      </div>
      <button
        onClick={disburse}
        disabled={disbursing || vouched.length === 0}
        className="w-full py-2 rounded-lg bg-blue-600 disabled:opacity-50 text-white text-sm font-bold"
      >
        {disbursing ? 'Disbursing...' : 'Disburse Loan'}
      </button>
      <AnimatePresence>
        {disbursed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 p-3 rounded-xl bg-emerald-900/20 border border-emerald-500/30 text-center"
          >
            <p className="text-sm font-bold text-emerald-300">₹{amount.toLocaleString('en-IN')} credited</p>
            <p className="text-xs text-slate-400">First EMI due 30 days</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Glass>
  );
}

function BhavishyaDemo() {
  const [score, setScore] = useState(72);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [predKey, setPredKey] = useState(0);
  const [sip, setSip] = useState(15000);

  const n = 10 * 12;
  const r = 0.12 / 12;
  const corpus = Math.round(sip * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));

  const predictions = [
    'By 2035 your SIP discipline puts you at ₹{c} — enough for a dream home.',
    '2035 self says: emergency shield fully funded. Sleep easy.',
    'Crisis radar: your health + term cover is 3× expenses. Well done.',
    'Generational wealth mode: your family corpus crosses ₹{c}.',
    'You are on track to retire 5 years early at age 50.',
  ];

  const ask = () => {
    setScore((s) => Math.min(95, s + Math.floor(Math.random() * 5) + 1));
    const tmpl = predictions[Math.floor(Math.random() * predictions.length)];
    setPrediction(tmpl.replace('{c}', corpus.toLocaleString('en-IN')));
    setPredKey((k) => k + 1);
  };

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <Glass>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="text-purple-500 transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white">{score}</span>
            <span className="text-[10px] text-slate-400">score</span>
          </div>
        </div>
        <div>
          <p className="font-bold text-slate-200 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            Prosperity Score
          </p>
          <p className="text-xs text-slate-500">174 signals analyzed · goal trajectory on track</p>
        </div>
      </div>

      <button
        onClick={ask}
        className="mb-4 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Chat with 2035 Self
      </button>

      <AnimatePresence>
        {prediction && (
          <motion.div
            key={predKey}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 rounded-xl bg-purple-900/20 border border-purple-500/20 text-sm text-purple-200"
          >
            <Calendar className="w-4 h-4 inline mr-1 text-purple-400" />
            {prediction}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-700">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Monthly SIP</span>
          <span>₹{sip.toLocaleString('en-IN')}</span>
        </div>
        <input
          type="range"
          min={5000}
          max={100000}
          step={5000}
          value={sip}
          onChange={(e) => setSip(Number(e.target.value))}
          className="w-full accent-purple-500 mb-3"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Projected corpus by 2035</span>
          <span className="text-xl font-black text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            ₹{corpus.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </Glass>
  );
}

function NeuroDemo() {
  const [stress, setStress] = useState(75);
  const [sleep, setSleep] = useState(4.5);
  const status = stress > 70 || sleep < 5 ? 'BLOCK' : stress > 45 || sleep < 7 ? 'DELAY' : 'ALLOW';
  const color = status === 'BLOCK' ? 'text-rose-400' : status === 'DELAY' ? 'text-amber-400' : 'text-emerald-400';
  const reason =
    status === 'BLOCK'
      ? 'HRV low + sleep < 5h + high stress'
      : status === 'DELAY'
      ? 'Elevated stress asks for a 10-min cooldown'
      : 'Biometrics calm · spend approved';
  const bars = [45, 62, 38, 85, 55, 70, 48, 90, 60, 75, 50, 80];

  return (
    <Glass>
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit className="w-5 h-5 text-fuchsia-400" />
        <span className="font-bold text-slate-200">Neuro-Friction</span>
      </div>
      <p className="text-sm text-slate-400 mb-4">Simulated biometrics decide if the spend goes through.</p>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Stress</span>
            <span>{stress}%</span>
          </div>
          <input type="range" min={0} max={100} value={stress} onChange={(e) => setStress(Number(e.target.value))} className="w-full accent-fuchsia-500" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>
              <Moon className="w-3 h-3 inline mr-1" />
              Sleep
            </span>
            <span>{sleep}h</span>
          </div>
          <input
            type="range"
            min={0}
            max={12}
            step={0.5}
            value={sleep}
            onChange={(e) => setSleep(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-700 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-fuchsia-400" />
          <span className="text-xs text-slate-400">Biometric waveform</span>
        </div>
        <div className="flex items-end gap-1 h-16">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t-sm bg-fuchsia-500/60"
              animate={{ height: [`${h * 0.6}%`, `${h}%`, `${h * 0.6}%`] }}
              transition={{ repeat: Infinity, duration: 1.2 + i * 0.1, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>

      <div
        className={`p-4 rounded-xl border ${
          status === 'BLOCK' ? 'bg-rose-900/20 border-rose-500/30' : status === 'DELAY' ? 'bg-amber-900/20 border-amber-500/30' : 'bg-emerald-900/20 border-emerald-500/30'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-slate-300">Late-night Swiggy · ₹1,200</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-slate-950/50 ${color}`}>{status}</span>
        </div>
        <p className="text-xs text-slate-500">{reason}</p>
      </div>
    </Glass>
  );
}

function ImmuneDemo() {
  const threatsSeed = [
    { id: 1, name: 'Fake UPI handle', city: 'Delhi' },
    { id: 2, name: 'SIM-swap attempt', city: 'Mumbai' },
    { id: 3, name: 'Phishing link blast', city: 'Bangalore' },
    { id: 4, name: 'Investment scam', city: 'Chennai' },
    { id: 5, name: 'OTP harvester', city: 'Kolkata' },
  ];
  const [index, setIndex] = useState(0);
  const [neutralized, setNeutralized] = useState(12847);
  const [live, setLive] = useState<{ id: number; name: string; city: string; status: 'active' | 'neutralized' }[]>([]);

  useEffect(() => {
    const t = setInterval(() => setNeutralized((n) => n + Math.floor(Math.random() * 3) + 1), 800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (index >= threatsSeed.length) return;
    const threat = { ...threatsSeed[index], status: 'active' as const };
    setLive((prev) => [threat, ...prev].slice(0, 6));
    const n = setTimeout(() => {
      setLive((prev) => prev.map((t) => (t.id === threat.id ? { ...t, status: 'neutralized' } : t)));
    }, 1400);
    const next = setTimeout(() => setIndex((i) => i + 1), 2200);
    return () => {
      clearTimeout(n);
      clearTimeout(next);
    };
  }, [index]);

  return (
    <Glass>
      <p className="text-sm text-slate-400 mb-4">Community threat signals auto-immunize every user.</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-slate-900/40 text-center">
          <p className="text-xs text-slate-500">Threats neutralized today</p>
          <p className="text-2xl font-black text-emerald-400">{neutralized.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/40 text-center">
          <p className="text-xs text-slate-500">Community shield</p>
          <p className="text-2xl font-black text-cyan-400">2.8M</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-slate-300">Live threat feed</span>
          </div>
          <div className="space-y-2 h-36 overflow-y-auto">
            {live.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                  t.status === 'active'
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                }`}
              >
                <span>
                  {t.name} · {t.city}
                </span>
                <span className="font-bold">{t.status === 'active' ? 'ACTIVE' : 'BLOCKED'}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col items-center justify-center">
          <div className="w-24 h-24 relative">
            <svg viewBox="0 0 100 120" className="w-full h-full text-emerald-500/30 fill-emerald-500/20 stroke-emerald-500/40">
              <path d="M45 5 L55 8 L65 18 L70 30 L68 45 L75 55 L78 70 L70 85 L60 95 L52 115 L45 105 L35 90 L25 75 L22 60 L28 45 L35 30 L40 15 Z" />
            </svg>
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full border-2 border-emerald-400/50"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-1 mt-2">
            {['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'].map((c) => (
              <span
                key={c}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] border border-green-500/20"
              >
                <MapPin className="w-2 h-2" />
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Glass>
  );
}

function SovereignDemo() {
  const [mode, setMode] = useState<'device' | 'bank'>('device');
  const [proving, setProving] = useState(false);

  const prove = () => {
    setProving(true);
    setTimeout(() => setProving(false), 2000);
  };

  const items = [
    { label: 'Transaction history', icon: Database },
    { label: 'Biometric template', icon: Fingerprint },
    { label: 'Portfolio DNA', icon: Lock },
    { label: 'Risk profile', icon: ShieldCheck },
  ];

  return (
    <Glass>
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-slate-200">Data locality</span>
        <button
          onClick={() => setMode((m) => (m === 'device' ? 'bank' : 'device'))}
          className={`px-3 py-1 rounded-full text-xs font-bold ${mode === 'device' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
        >
          {mode === 'device' ? 'Device Only' : 'Bank Copy'}
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40">
              <span className="text-sm text-slate-300 flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-400" />
                {item.label}
              </span>
              <span className={`text-xs font-bold flex items-center gap-1 ${mode === 'device' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {mode === 'device' ? (
                  <>
                    <Lock className="w-3 h-3" /> On device
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" /> Shared
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {mode === 'device' && (
        <div className="p-4 rounded-2xl bg-emerald-900/10 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-emerald-300">Zero-knowledge proof</span>
            {proving ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Zap className="w-4 h-4 text-emerald-400" />
              </motion.div>
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          {proving ? (
            <div className="space-y-2">
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} />
              </div>
              <p className="text-xs text-slate-400 font-mono">Generating zk-proof...</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs text-emerald-300 font-mono mb-1">π = 0x7a3f...9e2c</p>
              <p className="text-[10px] text-slate-500">Bank verified without exposing data</p>
              <button onClick={prove} className="mt-3 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                Regenerate proof
              </button>
            </div>
          )}
        </div>
      )}

      {mode === 'bank' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl bg-rose-900/10 border border-rose-500/20 text-center">
          <Eye className="w-6 h-6 text-rose-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-rose-300">Data exposure risk elevated</p>
          <p className="text-xs text-slate-400">Bank receives raw history. Not recommended.</p>
        </motion.div>
      )}
    </Glass>
  );
}

function ModesDemo() {
  const [mode, setMode] = useState<'nri' | 'senior' | 'business'>('nri');
  const data = {
    nri: {
      label: 'NRI Wealth Center',
      color: 'text-orange-400',
      border: 'border-orange-500/30',
      bg: 'bg-orange-500/10',
      icon: Plane,
      stats: [
        { label: 'NRE balance', value: '$42,300' },
        { label: 'FCNR rate', value: '6.25%' },
        { label: 'FEMA guardrails', value: 'Active' },
      ],
      chart: [40, 70, 55, 90, 65],
    },
    senior: {
      label: 'Senior Citizen Center',
      color: 'text-rose-400',
      border: 'border-rose-500/30',
      bg: 'bg-rose-500/10',
      icon: User,
      stats: [
        { label: 'FD interest', value: '8.20%' },
        { label: 'Pension credit', value: '₹32,400' },
        { label: 'Voice mode', value: 'On' },
      ],
      chart: [80, 85, 82, 88, 90],
    },
    business: {
      label: 'Business Wealth Center',
      color: 'text-blue-400',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      icon: Briefcase,
      stats: [
        { label: 'Cash runway', value: '14 months' },
        { label: 'Liquidity ratio', value: '1.8x' },
        { label: 'Surplus deployed', value: '₹4.2L' },
      ],
      chart: [60, 75, 50, 85, 70],
    },
  };

  const current = data[mode];
  const Icon = current.icon;

  return (
    <Glass>
      <div className="flex gap-2 mb-4">
        {(['nri', 'senior', 'business'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-1 ${
              mode === m ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {m === 'nri' ? <Plane className="w-3 h-3" /> : m === 'senior' ? <User className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
            {m}
          </button>
        ))}
      </div>

      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-2xl border ${current.border} ${current.bg}`}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-2 rounded-lg bg-slate-950/30 ${current.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h4 className={`text-lg font-black ${current.color}`}>{current.label}</h4>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {current.stats.map((s, i) => (
            <div key={i} className="p-2 rounded-xl bg-slate-950/30 text-center">
              <p className="text-[10px] text-slate-400">{s.label}</p>
              <p className={`text-sm font-black ${current.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-1 h-20">
          {current.chart.map((v, i) => (
            <div key={i} className={`flex-1 rounded-t-md opacity-60 ${current.color.replace('text-', 'bg-')}`} style={{ height: `${v}%` }} />
          ))}
        </div>
        <p className="text-[10px] text-slate-500 mt-2 text-center">Quick actions appear in your preferred language & layout</p>
      </motion.div>
    </Glass>
  );
}

function TaxDemo() {
  const [c80, setC80] = useState(100000);
  const [d80, setD80] = useState(25000);
  const [nps, setNps] = useState(50000);
  const [hra, setHra] = useState(180000);
  const [regime, setRegime] = useState<'old' | 'new'>('old');
  const [downloading, setDownloading] = useState(false);

  const oldDeductions = c80 + d80 + nps + hra;
  const taxableOld = Math.max(0, 1500000 - oldDeductions);
  const taxOld = regime === 'old' ? Math.round(taxableOld * 0.3) : 0;
  const taxableNew = 1500000;
  const taxNew = regime === 'new' ? Math.round(taxableNew * 0.25) : 0;
  const saved = regime === 'old' ? Math.round(oldDeductions * 0.3) : 0;

  const sliders = [
    { label: '80C investments', val: c80, max: 150000, set: setC80 },
    { label: '80D health insurance', val: d80, max: 75000, set: setD80 },
    { label: 'NPS contribution', val: nps, max: 75000, set: setNps },
    { label: 'HRA exemption', val: hra, max: 300000, set: setHra },
  ];

  const download = () => {
    setDownloading(true);
    const plan = [
      'SecureWealth Twin — Tax Optimizer Plan',
      `Generated: ${new Date().toLocaleString('en-IN')}`,
      '',
      `Regime: ${regime === 'old' ? 'Old' : 'New'}`,
      `80C investments: ₹${c80.toLocaleString('en-IN')}`,
      `80D health insurance: ₹${d80.toLocaleString('en-IN')}`,
      `NPS contribution: ₹${nps.toLocaleString('en-IN')}`,
      `HRA exemption: ₹${hra.toLocaleString('en-IN')}`,
      '',
      `Total deductions: ₹${oldDeductions.toLocaleString('en-IN')}`,
      `Taxable income (Old): ₹${taxableOld.toLocaleString('en-IN')}`,
      `Tax payable (Old): ₹${taxOld.toLocaleString('en-IN')}`,
      `Tax payable (New): ₹${taxNew.toLocaleString('en-IN')}`,
      `Tax saved under Old Regime: ₹${saved.toLocaleString('en-IN')}`,
      '',
      'Suggestions:',
      '- Max out 80C (₹1,50,000) for full benefit.',
      '- Increase NPS contribution up to ₹50,000 for extra deduction.',
      '- Compare Old vs New regime every financial year.',
    ].join('\n');
    const blob = new Blob([plan], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `securewealth-tax-plan-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(false), 1200);
  };

  return (
    <Glass>
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-slate-200">Tax Optimizer</span>
        <div className="flex rounded-lg bg-slate-800 p-1">
          <button
            onClick={() => setRegime('old')}
            className={`px-3 py-1 rounded-md text-xs font-bold ${regime === 'old' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
          >
            Old
          </button>
          <button
            onClick={() => setRegime('new')}
            className={`px-3 py-1 rounded-md text-xs font-bold ${regime === 'new' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
          >
            New
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {sliders.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{s.label}</span>
              <span>₹{s.val.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={0}
              max={s.max}
              step={5000}
              value={s.val}
              onChange={(e) => s.set(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-emerald-900/20 border border-emerald-500/30 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">{regime === 'old' ? 'Tax saved under Old Regime' : 'Tax payable under New Regime'}</p>
            <p className="text-3xl font-black text-emerald-300">₹{saved.toLocaleString('en-IN')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Effective tax</p>
            <p className="text-lg font-bold text-white">₹{(regime === 'old' ? taxOld : taxNew).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <button
        onClick={download}
        disabled={downloading}
        className="w-full py-2 rounded-lg bg-emerald-600 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2"
      >
        {downloading ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Download className="w-4 h-4" />
            </motion.div>
            Downloading plan...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Download plan
          </>
        )}
      </button>
    </Glass>
  );
}

function ValuesDemo() {
  const [values, setValues] = useState({ carbon: true, labor: true, tobacco: true });
  const holdings = [
    { name: 'Coal India', sector: 'carbon', alt: 'Renewable Energy ETF' },
    { name: 'Fast Fashion Ltd', sector: 'labor', alt: 'Ethical Apparel Fund' },
    { name: 'Tobacco Corp', sector: 'tobacco', alt: 'Healthcare Innovation ETF' },
  ];
  const conflict = holdings.reduce((acc, h) => acc + (values[h.sector as keyof typeof values] ? 0 : 12), 0);

  return (
    <Glass>
      <p className="text-sm text-slate-400 mb-3">Toggle your values to scan portfolio conflicts.</p>
      <div className="space-y-2 mb-4">
        {Object.entries(values).map(([k, v]) => (
          <label key={k} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 cursor-pointer">
            <span className="text-sm text-slate-300 capitalize flex items-center gap-2">
              {k === 'carbon' ? <Leaf className="w-4 h-4 text-emerald-400" /> : k === 'labor' ? <HeartHandshake className="w-4 h-4 text-blue-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
              {k === 'carbon' ? 'Low carbon' : k === 'labor' ? 'Fair labor' : 'Tobacco-free'}
            </span>
            <input type="checkbox" checked={v} onChange={() => setValues((s) => ({ ...s, [k]: !v }))} className="w-4 h-4 accent-lime-500" />
          </label>
        ))}
      </div>

      <div className="space-y-2 mb-4">
        {holdings.map((h) => {
          const flagged = !values[h.sector as keyof typeof values];
          return (
            <div
              key={h.name}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                flagged ? 'bg-rose-900/10 border-rose-500/30' : 'bg-slate-900/40 border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-200">{h.name}</span>
              </div>
              {flagged ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">CONFLICT</span>
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Portfolio conflict</span>
          <span className={`text-xl font-black ${conflict === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{conflict}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-500 ${conflict === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${conflict}%` }} />
        </div>
      </div>

      {conflict > 0 && (
        <div className="p-3 rounded-xl bg-lime-900/10 border border-lime-500/20">
          <p className="text-xs font-bold text-lime-300 mb-1">Suggested ethical alternatives</p>
          <ul className="space-y-1">
            {holdings
              .filter((h) => !values[h.sector as keyof typeof values])
              .map((h) => (
                <li key={h.name} className="text-xs text-slate-400 flex items-center gap-2">
                  <Leaf className="w-3 h-3 text-lime-400" />
                  Swap {h.name} → {h.alt}
                </li>
              ))}
          </ul>
        </div>
      )}
    </Glass>
  );
}

function FantasyDemo() {
  const themes = [
    { id: 'green', name: 'Green Energy' },
    { id: 'ev', name: 'EV Revolution' },
    { id: 'ai', name: 'AI Boom' },
  ];
  const [theme, setTheme] = useState('green');
  const [leaders, setLeaders] = useState([
    { name: 'You', score: 12400 },
    { name: 'AI Bull', score: 13100 },
    { name: 'AI Bear', score: 11200 },
    { name: 'AI Value', score: 11900 },
  ]);
  const [scouting, setScouting] = useState(false);

  const rank = [...leaders].sort((a, b) => b.score - a.score).findIndex((l) => l.name === 'You') + 1;

  const scout = () => {
    setScouting(true);
    const base = theme === 'green' ? 11000 : theme === 'ev' ? 12500 : 14000;
    const next = leaders.map((l) => ({ ...l, score: base + Math.floor(Math.random() * 5000) }));
    setLeaders(next);
    setTimeout(() => setScouting(false), 800);
  };

  return (
    <Glass>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="font-bold text-slate-200">Fantasy Finance League</span>
        </div>
        <div className="flex gap-1">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`px-2 py-1 rounded-md text-[10px] font-bold ${theme === t.id ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {[...leaders].sort((a, b) => b.score - a.score).map((l, i) => (
          <motion.div
            key={l.name}
            layout
            className={`flex items-center justify-between p-3 rounded-xl ${i === 0 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-slate-900/40'}`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  i === 0 ? 'bg-yellow-500 text-slate-950' : i === 1 ? 'bg-slate-600 text-white' : i === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {i + 1}
              </span>
              <span className="font-bold text-slate-200">{l.name}</span>
              {i === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
            </div>
            <span className="text-yellow-400 font-black">{l.score.toLocaleString('en-IN')}</span>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Your rank: <span className={`font-bold ${rank === 1 ? 'text-yellow-400' : 'text-slate-300'}`}>#{rank}</span>
        </div>
        <button
          onClick={scout}
          disabled={scouting}
          className="px-4 py-2 rounded-lg bg-yellow-600 disabled:opacity-50 text-white text-sm font-bold flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Scout next pick
        </button>
      </div>
    </Glass>
  );
}

function DMSDemo() {
  const [days, setDays] = useState(30);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [pulse, setPulse] = useState(0);

  const beneficiaries = [
    { name: 'Spouse', pct: 60 },
    { name: 'Daughter', pct: 25 },
    { name: 'Parents', pct: 15 },
  ];

  useEffect(() => {
    if (!running) return;
    setPulse(0);
    const iv = setInterval(() => setPulse((p) => p + 1), 600);
    const t = setTimeout(() => {
      clearInterval(iv);
      setRunning(false);
      setDone(true);
    }, days < 15 ? 2000 : 3500);
    return () => {
      clearInterval(iv);
      clearTimeout(t);
    };
  }, [running, days]);

  const simulate = () => {
    setDone(false);
    setRunning(true);
  };

  return (
    <Glass>
      <p className="text-sm text-slate-400 mb-4">Miss check-ins and wealth auto-transfers to beneficiaries.</p>
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Inactivity threshold</span>
          <span>{days} days</span>
        </div>
        <input type="range" min={7} max={90} value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full accent-red-500" />
      </div>

      <div className="space-y-2 mb-4">
        {beneficiaries.map((b) => (
          <div key={b.name} className="flex items-center gap-3">
            <HeartPulse className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-sm text-slate-300 w-24">{b.name}</span>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500" style={{ width: `${b.pct}%` }} />
            </div>
            <span className="text-xs text-slate-400 w-8 text-right">{b.pct}%</span>
          </div>
        ))}
      </div>

      {!done ? (
        <button
          onClick={simulate}
          disabled={running}
          className="w-full py-2 rounded-lg bg-rose-600 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2"
        >
          {running ? (
            <>
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>
                <HeartPulse className="w-4 h-4" />
              </motion.div>
              Heartbeat check {pulse}/5
            </>
          ) : (
            'Simulate execution'
          )}
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-rose-900/20 border border-rose-500/30">
          <div className="flex items-center gap-2 mb-2">
            <FileKey className="w-5 h-5 text-rose-400" />
            <span className="text-sm font-bold text-rose-300">Legacy executed & audit block forged</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono break-all">
            sha-256: {Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Timestamp: {new Date().toLocaleString('en-IN')}</p>
          <button onClick={() => setDone(false)} className="mt-3 px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold">
            Reset
          </button>
        </motion.div>
      )}
    </Glass>
  );
}

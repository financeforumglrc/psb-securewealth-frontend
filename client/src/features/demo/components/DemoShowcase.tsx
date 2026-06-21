import { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence, useAnimation, useScroll, useTransform } from 'framer-motion';
import {
  Shield,
  Brain,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Link,
  Target,
  Fingerprint,
  Loader2,
  Clock,
  Ban,
  Sparkles,
  Terminal,
  Server,
  Activity,
  Lock,
  Eye,
  Zap,
  ShieldCheck,
  ArrowRight,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Square,
  Trophy,
  Users,
  Radio,
  Network,
  FileCode,
  Globe,
  Cpu,
  Bell,
  LockKeyhole,
  Bot,
} from 'lucide-react';
import {
  protectionApi,
  type AAFetchItem,
  type ProtectionResponse,
  type GraphRiskResponse,
  type BiometricRiskResponse,
  type GuardianMessageResponse,
} from '@/shared/lib/protectionApi';
import CinematicIntro from '@/features/demo/components/CinematicIntro';
import DemoAssistant from '@/features/demo/components/DemoAssistant';
import BlockchainAudit from '@/features/demo/components/BlockchainAudit';
import { FraudRadar, MissionControlStats } from '@/features/demo/components/FraudRadar';
import { PersonaSelector, DEMO_PERSONAS, DEFAULT_PERSONA, type PersonaKey, type DemoPersona } from '@/features/demo/components/DemoPersonas';
import FeatureUniverse from '@/features/demo/components/FeatureUniverse';
import CursorSpotlight from '@/features/demo/components/CursorSpotlight';

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface ApiLogEntry {
  id: string;
  method: string;
  path: string;
  status: number;
  ok: boolean;
  timestamp: Date;
  payload?: object;
  response?: object;
  summary: string;
}

interface DemoScenario {
  id: string;
  label: string;
  amount: number;
  payee: string;
  device: boolean;
  seconds: number;
  otp: number;
  first: boolean;
  deviation: number;
  description: string;
}

/* ═══════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════ */

const PROTECTION_API_URL = import.meta.env.VITE_PROTECTION_API_URL || '/protection';

const protectionScenarios: DemoScenario[] = [
  {
    id: 'low',
    label: 'Everyday UPI',
    amount: 350,
    payee: 'chai-wala@upi',
    device: true,
    seconds: 180,
    otp: 0,
    first: false,
    deviation: 0.05,
    description: 'Trusted device, small amount, known payee — instant allowance.',
  },
  {
    id: 'medium',
    label: 'New Gadget Purchase',
    amount: 72000,
    payee: 'Flipkart',
    device: false,
    seconds: 12,
    otp: 0,
    first: true,
    deviation: 0.35,
    description: 'New device + larger-than-usual amount triggers a cooling-off vault.',
  },
  {
    id: 'high',
    label: 'Fraud Attempt',
    amount: 250000,
    payee: 'Unknown Merchant',
    device: false,
    seconds: 5,
    otp: 3,
    first: true,
    deviation: 0.85,
    description: 'Untrusted device, rushed action, huge amount, repeated OTPs — blocked.',
  },
];

const insights = [
  {
    type: 'danger' as const,
    icon: AlertTriangle,
    title: 'Emergency Fund Critical',
    desc: 'Only ₹45,200 liquid savings. Target for 6-month buffer is ₹3,00,000.',
    action: 'Start ₹10k/month liquid SIP',
    reason: 'Twin compares monthly expenses × 6 against liquid assets and flags shortfall.',
  },
  {
    type: 'success' as const,
    icon: CheckCircle,
    title: 'Tax Saving Window',
    desc: 'Invest ₹1,50,000 in ELSS before 31 March to save ~₹46,800 tax.',
    action: 'Explore ELSS',
    reason: 'Calendar-aware rule engine detects Section 80C headroom from your aggregated portfolio.',
  },
  {
    type: 'info' as const,
    icon: TrendingUp,
    title: 'Portfolio Drift Detected',
    desc: 'Equity is 78% vs your 65% target. Rebalance 13% into debt.',
    action: 'One-tap rebalance',
    reason: 'AA-linked holdings are re-evaluated daily against your risk profile.',
  },
  {
    type: 'warning' as const,
    icon: Bell,
    title: 'Subscription Leak',
    desc: 'You are paying ₹2,400/year for 3 unused OTT apps.',
    action: 'Cancel unused subs',
    reason: 'Recurring spends are matched against actual login activity from linked accounts.',
  },
];

type GoalColor = 'cyan' | 'blue' | 'purple' | 'emerald' | 'green' | 'violet' | 'rose' | 'amber';
const goalBarClass: Record<GoalColor, string> = {
  cyan: 'bg-cyan-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  emerald: 'bg-emerald-500',
  green: 'bg-green-500',
  violet: 'bg-violet-500',
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
};

const riskSteps = [
  { label: 'Device Trust', weight: 20, desc: 'Is this a known, trusted device?' },
  { label: 'Session Speed', weight: 25, desc: 'How fast after login was the action?' },
  { label: 'Amount vs History', weight: 30, desc: 'Is amount >2× historical average?' },
  { label: 'OTP Retry Pattern', weight: 15, desc: 'Multiple failed OTP attempts?' },
  { label: 'First-time Payee', weight: 15, desc: 'Never paid this entity before?' },
  { label: 'Behavioral Biometrics', weight: 20, desc: 'Typing/mouse rhythm match?' },
  { label: 'Graph Intelligence', weight: 20, desc: 'Any link to known fraud ring?' },
];

const features = [
  { icon: ShieldCheck, title: '7-Layer Risk Engine', desc: 'Real-time scoring across device, behavior, amount, OTP, biometrics & graph.', color: 'rose' },
  { icon: Link, title: 'Account Aggregation', desc: 'RBI-approved consent bridge to banks, brokers, insurers.', color: 'cyan' },
  { icon: Brain, title: 'AI Wealth Twin', desc: 'Generative insights, tax alerts, portfolio drift & goal tracking.', color: 'violet' },
  { icon: Fingerprint, title: 'Behavioral Biometrics', desc: 'Keystroke, mouse & session anomaly detection.', color: 'emerald' },
  { icon: Network, title: 'Fraud Graph Intelligence', desc: 'NetworkX-powered mule-ring & shared-device detection.', color: 'amber' },
  { icon: LockKeyhole, title: 'Cooling Vault', desc: 'Virtual smart-contract time-lock for high-risk actions.', color: 'blue' },
  { icon: FileCode, title: 'Immutable Audit Chain', desc: 'SHA-256 blockchain-style log of every protection decision.', color: 'purple' },
  { icon: Globe, title: 'Bharat-First Design', desc: 'Multilingual, senior mode, offline queue & accessibility.', color: 'orange' },
];

const featureColorMap: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  rose: { border: 'border-rose-500/30', bg: 'bg-rose-500/10', text: 'text-rose-400', glow: 'shadow-rose-500/20' },
  cyan: { border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
  violet: { border: 'border-violet-500/30', bg: 'bg-violet-500/10', text: 'text-violet-400', glow: 'shadow-violet-500/20' },
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  amber: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
  blue: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
  purple: { border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
  orange: { border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400', glow: 'shadow-orange-500/20' },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */

export default function DemoShowcase() {
  const [apiLog, setApiLog] = useState<ApiLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState('hero');
  const [showLog, setShowLog] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [presSlide, setPresSlide] = useState(0);
  const [presPlaying, setPresPlaying] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [personaKey, setPersonaKey] = useState<PersonaKey>(DEFAULT_PERSONA.key);
  const [speaking, setSpeaking] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [assistantMessage, setAssistantMessage] = useState('Welcome, judge. I am your Wealth Twin guide. Press “Start Judge Tour” for a cinematic walkthrough.');
  const [auditDecision, setAuditDecision] = useState<{ ref: string; action: string } | null>(null);
  const [guardianMsg, setGuardianMsg] = useState<string | null>(null);

  const currentPersona = DEMO_PERSONAS.find((p) => p.key === personaKey) || DEFAULT_PERSONA;

  const logEndRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const aaDemoRef = useRef<{ run: () => void } | null>(null);
  const protectionDemoRef = useRef<{ runHighRisk: () => void } | null>(null);
  const biometricsDemoRef = useRef<{ run: () => void } | null>(null);

  const { scrollYProgress } = useScroll({ container: mainRef });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const addLog = (entry: Omit<ApiLogEntry, 'id' | 'timestamp'>) => {
    setApiLog((prev) => [
      ...prev,
      { ...entry, id: Math.random().toString(36).slice(2), timestamp: new Date() },
    ]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [apiLog]);

  const scrollTo = (id: string) => {
    setActiveTab(id);
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Dynamic assistant message based on section / persona
  useEffect(() => {
    if (tourActive) return;
    const messages: Record<string, string> = {
      hero: `${currentPersona.name}, ${currentPersona.role}. ${currentPersona.tagline} Explore the tabs or start the guided tour.`,
      aa: 'Account Aggregation: one RBI-approved consent unifies banks, brokers and insurers into a single live net-worth view.',
      protection: 'Wealth Protection Shield: every transaction runs through a 7-layer risk engine in under 2.5 seconds.',
      insights: 'AI Twin Insights: the engine generates contextual, explainable advice from your aggregated financial DNA.',
      goals: 'Goal-Based Engine: simulate extra SIPs and watch every milestone shift in real time.',
      biometrics: 'Behavioral Biometrics: typing rhythm, mouse curves and session behavior detect bots and coercion.',
      compare: 'Traditional banks are reactive. SecureWealth Twin is predictive, unified and self-protecting.',
      architecture: 'End-to-end architecture: Device → AA Network → FastAPI Protection → Graph Engine → Blockchain Audit.',
    };
    setAssistantMessage(messages[activeTab] || messages.hero);
  }, [activeTab, personaKey, currentPersona, tourActive]);

  // Judge tour sequencer
  useEffect(() => {
    if (!tourActive) return;
    const steps = [
      { id: 'hero', msg: `Judge tour started. Meet ${currentPersona.name}, ${currentPersona.role}. Let's see the Wealth Twin in action.`, delay: 2500, action: () => scrollTo('aa') },
      { id: 'aa', msg: `First, Account Aggregation. ${currentPersona.name} consents once and the Twin fetches live accounts from banks, brokers and insurers.`, delay: 4500, action: () => aaDemoRef.current?.run() },
      { id: 'protection', msg: 'Now the Fraud Shield. A high-risk transaction is attempted — watch the 7-layer engine block it before money moves.', delay: 6000, action: () => protectionDemoRef.current?.runHighRisk() },
      { id: 'insights', msg: 'The AI Twin scans the unified picture and surfaces personalized, explainable insights.', delay: 4000, action: () => scrollTo('goals') },
      { id: 'goals', msg: 'Goal engine shows exactly when milestones are reached — adjust SIPs to see the future change instantly.', delay: 4000, action: () => scrollTo('biometrics') },
      { id: 'biometrics', msg: 'Finally, behavioral biometrics. The Twin measures keystroke rhythm and flags anomalies in real time.', delay: 4500, action: () => biometricsDemoRef.current?.run() },
      { id: 'architecture', msg: 'That is the revolution: consent-first, explainable, immutable, and built for Bharat. Thank you, judge!', delay: 4000, action: () => { scrollTo('architecture'); setTourActive(false); } },
    ];
    const step = steps[tourStep];
    if (!step) { setTourActive(false); return; }
    if (step.id !== 'hero') scrollTo(step.id);
    setAssistantMessage(step.msg);
    const t = setTimeout(() => {
      step.action();
      if (tourStep < steps.length - 1) setTourStep((s) => s + 1);
    }, step.delay);
    return () => clearTimeout(t);
  }, [tourActive, tourStep, currentPersona]);

  const startTour = () => {
    setTourStep(0);
    setTourActive(true);
  };

  const stopTour = () => {
    setTourActive(false);
    setTourStep(0);
    setAssistantMessage('Judge tour stopped. Explore freely or restart anytime.');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'p' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setPresentationMode((m) => !m);
      }
      if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (tourActive) stopTour();
        else startTour();
      }
      if (e.key === 'Escape') {
        if (presentationMode) setPresentationMode(false);
        else if (tourActive) stopTour();
      }
      if (presentationMode) {
        if (e.key === 'ArrowRight' || e.key === ' ') setPresSlide((s) => Math.min(s + 1, presentationSlides.length - 1));
        if (e.key === 'ArrowLeft') setPresSlide((s) => Math.max(s - 1, 0));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [presentationMode, tourActive, startTour, stopTour]);

  const tabs = [
    { id: 'hero', label: 'Overview', icon: Sparkles },
    { id: 'aa', label: 'AA Network', icon: Link },
    { id: 'protection', label: 'Fraud Shield', icon: Shield },
    { id: 'insights', label: 'AI Twin', icon: Brain },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'biometrics', label: 'Biometrics', icon: Fingerprint },
    { id: 'compare', label: 'vs Traditional', icon: ArrowRight },
    { id: 'architecture', label: 'Architecture', icon: Server },
  ];

  const handleProtectionDecision = async (res: ProtectionResponse, scenario: DemoScenario) => {
    setAuditDecision({ ref: res.reference_id, action: res.action });
    const gm = await protectionApi.guardianMessage({
      risk_level: res.risk_level,
      action: res.action,
      factors: res.explainable_factors.slice(0, 3),
      amount: scenario.amount,
      payee: scenario.payee,
    });
    if (gm.ok && gm.data?.message) {
      setGuardianMsg((gm.data as GuardianMessageResponse).message);
      if (tourActive) setAssistantMessage((gm.data as GuardianMessageResponse).message);
    }
  };

  return (
    <>
      {!introDone && <CinematicIntro onComplete={() => setIntroDone(true)} />}
      <div ref={mainRef} className={`min-h-screen bg-slate-950 text-slate-100 overflow-y-auto overflow-x-hidden scroll-smooth ${introDone ? '' : 'hidden'}`}>
        <CursorSpotlight />
        <ParticleBackground />
        <motion.div style={{ width: progressWidth }} className="fixed top-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 z-[60]" />

        {/* Floating Quick Actions */}
        <QuickActions onPresent={() => setPresentationMode(true)} onConsole={() => setShowLog((s) => !s)} />

        {/* Demo Assistant */}
        <DemoAssistant
          message={assistantMessage}
          speaking={speaking}
          onToggleSpeak={() => setSpeaking((s) => !s)}
          onStartTour={startTour}
          onStopTour={stopTour}
          tourActive={tourActive}
        />

        {/* Sections */}
        <section id="section-hero">
          <Hero
            persona={currentPersona}
            onPersonaChange={setPersonaKey}
            onPresent={() => setPresentationMode(true)}
            onStart={() => scrollTo('aa')}
          />
        </section>
        <section id="section-aa"><AADemo ref={aaDemoRef} addLog={addLog} aaFallback={currentPersona.aaItems} totalFallback={currentPersona.aaTotal} persona={personaKey} /></section>
        <section id="section-protection">
          <ProtectionDemo
            ref={protectionDemoRef}
            addLog={addLog}
            onDecision={handleProtectionDecision}
            guardianMsg={guardianMsg}
            auditDecision={auditDecision}
          />
        </section>
        <section id="section-insights"><InsightsDemo /></section>
        <section id="section-goals"><GoalsDemo goals={currentPersona.goals as any} /></section>
        <section id="section-biometrics"><BiometricsDemo ref={biometricsDemoRef} addLog={addLog} /></section>
        <section id="section-compare"><ComparisonSection /></section>
        <section id="section-architecture"><ArchitectureDemo /></section>
        <section id="section-universe"><FeatureUniverse /></section>
        <PersonasSection />
        <TrustBadges />
        <Footer />

        {/* Sticky Nav */}
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden lg:block pointer-events-none">
          <div className="flex items-center gap-1 px-2 py-2 rounded-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl pointer-events-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => scrollTo(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeTab === t.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile Nav */}
        <nav className="fixed bottom-20 left-0 right-0 z-40 lg:hidden px-4 pointer-events-none">
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-2 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 pointer-events-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => scrollTo(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap ${
                  activeTab === t.id ? 'bg-cyan-600 text-white' : 'text-slate-400 bg-slate-800/50'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        {/* API Console */}
        <ApiConsole log={apiLog} show={showLog} onToggle={() => setShowLog((s) => !s)} endRef={logEndRef} />

        {/* Presentation Mode */}
        <PresentationMode
          show={presentationMode}
          onClose={() => setPresentationMode(false)}
          slide={presSlide}
          setSlide={setPresSlide}
          playing={presPlaying}
          setPlaying={setPresPlaying}
        />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PARTICLE BACKGROUND
   ═══════════════════════════════════════════════════════════════ */

function ParticleBackground() {
  const particles = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
  })), []);
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-[40%] left-[30%] w-[35%] h-[35%] bg-emerald-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-400/20"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ y: [0, -40, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   QUICK ACTIONS
   ═══════════════════════════════════════════════════════════════ */

function QuickActions({ onPresent, onConsole }: { onPresent: () => void; onConsole: () => void }) {
  return (
    <div className="fixed right-4 top-24 z-50 flex flex-col gap-2 pointer-events-none">
      <button
        onClick={onPresent}
        className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:scale-105 transition-transform"
        title="Presentation Mode (P)"
      >
        <Play className="w-5 h-5" />
      </button>
      <button
        onClick={onConsole}
        className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500/50 transition-colors"
        title="Toggle API Console"
      >
        <Terminal className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════════ */

function Hero({
  persona,
  onPersonaChange,
  onPresent,
  onStart,
}: {
  persona: DemoPersona;
  onPersonaChange: (key: PersonaKey) => void;
  onPresent: () => void;
  onStart: () => void;
}) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-12 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-semibold mb-6"
      >
        <Radio className="w-4 h-4 animate-pulse" />
        Live FastAPI-Powered Demo
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-6xl sm:text-8xl font-black tracking-tight mb-6"
      >
        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent">
          SecureWealth Twin
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-xl sm:text-2xl text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed"
      >
        The world's first public-sector wealth twin with built-in fraud shield,
        <span className="text-slate-200"> real-time Account Aggregation</span>, and
        <span className="text-slate-200"> behavioral biometrics</span>.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25 }}
        className="max-w-3xl mx-auto mb-8"
      >
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Choose a persona to personalise the demo</p>
        <PersonaSelector active={persona.key} onChange={onPersonaChange} />
        <p className="mt-3 text-sm text-slate-400">
          Currently viewing: <span className="text-cyan-400 font-bold">{persona.name}</span> — {persona.role} — Net worth {persona.netWorth}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="flex flex-wrap justify-center gap-4 mb-12"
      >
        <button
          onClick={onPresent}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <Play className="w-5 h-5" /> Start Presentation
        </button>
        <button
          onClick={onStart}
          className="px-8 py-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-200 font-bold text-lg hover:bg-slate-800 hover:border-cyan-500/50 transition-all flex items-center gap-2"
        >
          Explore Demo <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>

      <MissionControlStats fraudBlocked={persona.fraudBlocked} />
      <FraudRadar />
      <div className="mt-12">
        <LiveTicker />
        <FeatureBento />
      </div>
    </section>
  );
}

function LiveTicker() {
  const items = [
    '✅ SBI Savings connected',
    '🛡️ High-risk UPI blocked',
    '📈 Portfolio rebalanced',
    '🔐 Cooling vault activated',
    '🧠 Tax-saving ELSS suggested',
    '🌍 NRI mode enabled',
  ];
  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-full border border-slate-800 bg-slate-900/50 py-2 mb-12">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-sm text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function FeatureBento() {
  return (
    <div className="max-w-6xl mx-auto w-full px-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">Why it is world-class</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((f, i) => {
          const colors = featureColorMap[f.color];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
              className={`p-5 rounded-2xl bg-slate-900/60 border ${colors.border} ${colors.glow} transition-all`}
            >
              <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center mb-3`}>
                <f.icon className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-100 text-sm mb-1">{f.title}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION WRAPPER
   ═══════════════════════════════════════════════════════════════ */

function Section({ id, title, subtitle, children, badge, className = '' }: { id: string; title: string; subtitle: string; children: React.ReactNode; badge?: string; className?: string }) {
  return (
    <motion.div
      id={`section-${id}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6 }}
      className={`min-h-screen py-20 px-4 sm:px-6 scroll-mt-28 ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          {badge && <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold mb-4 border border-cyan-500/20">{badge}</span>}
          <h2 className="text-4xl sm:text-6xl font-black text-slate-100 mb-4">{title}</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">{subtitle}</p>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AA DEMO
   ═══════════════════════════════════════════════════════════════ */

interface AADemoProps {
  addLog: (e: Omit<ApiLogEntry, 'id' | 'timestamp'>) => void;
  aaFallback: AAFetchItem[];
  totalFallback: string;
  persona: PersonaKey;
}

const AADemo = forwardRef<{ run: () => void }, AADemoProps>(function AADemo({ addLog, aaFallback, totalFallback, persona }, ref) {
  const [consent, setConsent] = useState(false);
  const [items, setItems] = useState<AAFetchItem[]>([]);
  const [total, setTotal] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!consent) {
      setConsent(true);
      // allow state to update before run continues
      await new Promise((r) => setTimeout(r, 50));
    }
    setLoading(true);
    setItems([]);
    setTotal('');
    const res = await protectionApi.fetchAA(persona);
    addLog({
      method: 'GET',
      path: '/api/v1/aa/fetch',
      status: res.status,
      ok: res.ok,
      summary: res.ok ? 'Fetched unified accounts' : 'Fetch failed — fallback used',
      response: res.data,
    });
    const steps = res.ok && res.data?.steps ? res.data.steps : aaFallback;
    for (const step of steps) {
      setItems((prev) => [...prev, step]);
      await new Promise((r) => setTimeout(r, 500));
    }
    setTotal(res.ok && res.data?.total_net_worth ? res.data.total_net_worth : totalFallback);
    setLoading(false);
  };

  useImperativeHandle(ref, () => ({ run }));

  return (
    <Section id="aa" title="Account Aggregator Network" subtitle="One RBI-approved consent unifies every account, investment and policy into a single intelligent view." badge="RBI Compliant">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <GlassCard>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Lock className="w-5 h-5 text-cyan-400" /> Consent Layer</h3>
            <p className="text-sm text-slate-400 mb-4">No data moves without explicit, tokenized, time-bound user consent.</p>
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 w-4 h-4 accent-cyan-500" />
              <span className="text-sm text-slate-300">I consent to SecureWealth Twin accessing my financial data via the AA network.</span>
            </label>
            <button onClick={run} disabled={!consent || loading} className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Link className="w-5 h-5" />}
              {items.length ? 'Fetch Again' : 'Fetch Live Accounts'}
            </button>
          </GlassCard>
          <HowItWorks steps={['User gives RBI-approved consent', 'Twin requests encrypted data from AA providers', 'Providers return tokenized balances', 'Twin builds unified net-worth view']} />
        </div>
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Linked Institutions</h3>
              {items.length > 0 && <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live</span>}
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {items.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <p className="font-bold text-slate-100">{item.bank}</p>
                        <p className="text-xs text-slate-400">{item.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-cyan-400">{item.amount}</p>
                      <p className="text-[10px] text-emerald-500 font-semibold">● CONNECTED</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {items.length === 0 && !loading && (
                <div className="text-center py-20 text-slate-500">
                  <Link className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Give consent and fetch to see live accounts</p>
                </div>
              )}
            </div>
            {total && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30">
                <p className="text-sm text-cyan-300 mb-1">Unified Net Worth</p>
                <p className="text-5xl font-black text-white">{total}</p>
                <p className="text-xs text-slate-400 mt-1">Across {items.length} institutions • Updated now</p>
              </motion.div>
            )}
          </GlassCard>
        </div>
      </div>
    </Section>
  );
});

/* ═══════════════════════════════════════════════════════════════
   PROTECTION DEMO
   ═══════════════════════════════════════════════════════════════ */

interface ProtectionDemoProps {
  addLog: (e: Omit<ApiLogEntry, 'id' | 'timestamp'>) => void;
  onDecision: (res: ProtectionResponse, scenario: DemoScenario) => void;
  guardianMsg: string | null;
  auditDecision: { ref: string; action: string } | null;
}

const ProtectionDemo = forwardRef<{ runHighRisk: () => void }, ProtectionDemoProps>(function ProtectionDemo({ addLog, onDecision, guardianMsg, auditDecision }, ref) {
  const [scenario, setScenario] = useState<DemoScenario>(protectionScenarios[2]);
  const [result, setResult] = useState<ProtectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done'>('idle');
  const controls = useAnimation();

  const updateScenario = (id: string) => {
    const s = protectionScenarios.find((x) => x.id === id);
    if (s) { setScenario(s); setPhase('idle'); setResult(null); }
  };

  const run = async (forcedScenario?: DemoScenario) => {
    const s = forcedScenario || scenario;
    setLoading(true);
    setPhase('scanning');
    setResult(null);
    try {
      const [graphRes, bioRes] = await Promise.all([
        protectionApi.graphRisk({ user_id: 'demo-judge', payee: s.payee.trim() }),
        protectionApi.biometricRisk({ deviation: s.deviation }),
      ]);
      addLog({ method: 'POST', path: '/api/v1/graph-risk', status: graphRes.status, ok: graphRes.ok, summary: graphRes.ok ? 'Graph risk computed' : 'Graph risk fallback', payload: { user_id: 'demo-judge', payee: s.payee }, response: graphRes.data });
      addLog({ method: 'POST', path: '/api/v1/biometric-risk', status: bioRes.status, ok: bioRes.ok, summary: bioRes.ok ? 'Biometric risk computed' : 'Biometric fallback', payload: { deviation: s.deviation }, response: bioRes.data });

      const graphBonus = graphRes.ok ? (graphRes.data as GraphRiskResponse)?.risk_bonus || 0 : 0;
      const bioBonus = bioRes.ok ? (bioRes.data as BiometricRiskResponse)?.risk_bonus || 0 : 0;
      const payload = {
        user_id: 'demo-judge', amount: s.amount, historical_avg_amount: 50000,
        seconds_since_login: s.seconds, is_trusted_device: s.device,
        otp_attempts: s.otp, is_first_time_investment: s.first, retry_count: 0,
        behavioral_deviation: s.deviation, graph_risk_bonus: graphBonus + bioBonus,
      };
      const evalRes = await protectionApi.evaluateTransaction(payload);
      addLog({ method: 'POST', path: '/api/v1/protect-wealth-action', status: evalRes.status, ok: evalRes.ok, summary: evalRes.ok ? `Decision: ${(evalRes.data as ProtectionResponse)?.action}` : 'Evaluation fallback', payload, response: evalRes.data });

      const finalResult = evalRes.ok && evalRes.data ? (evalRes.data as ProtectionResponse) : fallbackResult(s);
      setResult(finalResult);
      onDecision(finalResult, s);
    } catch {
      const fallback = fallbackResult(s);
      setResult(fallback);
      onDecision(fallback, s);
    } finally {
      setLoading(false);
      setPhase('done');
      if (s.id === 'high') controls.start({ x: [0, -8, 8, -8, 8, 0], transition: { duration: 0.4 } });
    }
  };

  const runHighRisk = () => {
    const high = protectionScenarios[2];
    setScenario(high);
    setPhase('idle');
    setResult(null);
    setTimeout(() => run(high), 100);
  };

  useImperativeHandle(ref, () => ({ runHighRisk }));

  const fallbackResult = (s: DemoScenario): ProtectionResponse => ({
    risk_score: s.id === 'high' ? 95 : s.id === 'medium' ? 55 : 10,
    risk_level: s.id === 'high' ? 'HIGH' : s.id === 'medium' ? 'MEDIUM' : 'LOW',
    action: s.id === 'high' ? 'BLOCK' : s.id === 'medium' ? 'WARN_COOL_OFF' : 'ALLOW',
    explainable_factors: ['Fallback scoring used because the protection service is unreachable.'],
    user_message: s.id === 'high' ? 'Transaction blocked for safety.' : s.id === 'medium' ? 'Cooling vault activated.' : 'Transaction allowed.',
    reference_id: 'FALLBACK-' + Date.now(),
  });

  return (
    <Section id="protection" title="Wealth Protection Shield" subtitle="A 7-layer risk engine analyzes every transaction in real-time and tells you exactly why it allowed, delayed, or blocked the action." badge="Live Risk Engine">
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-4">
          <GlassCard>
            <h3 className="text-lg font-bold mb-4">Pick a Scenario</h3>
            <div className="space-y-3">
              {protectionScenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => updateScenario(s.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${scenario.id === s.id ? 'bg-cyan-600/15 border-cyan-500/50' : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-100">{s.label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.id === 'low' ? 'bg-emerald-500/20 text-emerald-400' : s.id === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>{s.id === 'low' ? 'ALLOW' : s.id === 'medium' ? 'WARN' : 'BLOCK'}</span>
                  </div>
                  <p className="text-xs text-slate-400">{s.description}</p>
                </button>
              ))}
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="text-lg font-bold mb-4">Custom Inputs</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-400">Payee</label>
                <input type="text" value={scenario.payee} onChange={(e) => setScenario({ ...scenario, payee: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-500 outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Amount (₹)</label>
                <input type="number" value={scenario.amount} onChange={(e) => setScenario({ ...scenario, amount: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Seconds since login</label>
                  <input type="number" value={scenario.seconds} onChange={(e) => setScenario({ ...scenario, seconds: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">OTP attempts</label>
                  <input type="number" value={scenario.otp} onChange={(e) => setScenario({ ...scenario, otp: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100" />
                </div>
              </div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={scenario.device} onChange={(e) => setScenario({ ...scenario, device: e.target.checked })} /><span className="text-slate-300">Trusted device</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={scenario.first} onChange={(e) => setScenario({ ...scenario, first: e.target.checked })} /><span className="text-slate-300">First-time payee</span></label>
            </div>
          </GlassCard>
          <button onClick={() => run()} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
            Run Live Protection Check
          </button>
          <HowItWorks steps={riskSteps.map((s) => `${s.label} (+${s.weight}) — ${s.desc}`)} />
        </div>
        <motion.div animate={controls} className="xl:col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Decision Engine</h3>
              {result && <span className={`text-xs font-bold px-3 py-1 rounded-full ${result.risk_level === 'LOW' ? 'bg-emerald-500/20 text-emerald-400' : result.risk_level === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>{result.action}</span>}
            </div>
            {phase === 'idle' && <DecisionTimeline />}
            {phase === 'scanning' && <ScanningAnimation />}
            {result && phase === 'done' && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <RiskScoreGauge score={result.risk_score} level={result.risk_level} action={result.action} />
                  <div className="p-5 bg-slate-800/40 border border-slate-700 rounded-2xl">
                    <p className="text-xs text-slate-400 mb-1">Action Taken</p>
                    <p className={`text-2xl font-black ${result.risk_level === 'LOW' ? 'text-emerald-400' : result.risk_level === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'}`}>{result.action === 'WARN_COOL_OFF' ? 'COOLING VAULT' : result.action}</p>
                    <p className="text-xs text-slate-500 mt-1">Ref: {result.reference_id}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Explainable Risk Factors</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {result.explainable_factors.map((f, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-start gap-3 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                        <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${result.risk_level === 'LOW' ? 'text-emerald-500' : result.risk_level === 'MEDIUM' ? 'text-amber-500' : 'text-rose-500'}`} />
                        <p className="text-sm text-slate-300">{f}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className={`p-4 rounded-xl border text-sm ${result.risk_level === 'LOW' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-300' : result.risk_level === 'MEDIUM' ? 'bg-amber-900/20 border-amber-500/30 text-amber-300' : 'bg-rose-900/20 border-rose-500/30 text-rose-300'}`}>
                  <strong>User message:</strong> {result.user_message}
                </div>
                {result.action === 'WARN_COOL_OFF' && <CoolingVaultTimer />}
                {result.action === 'BLOCK' && <BlockAlert />}
                {result.action === 'ALLOW' && <AllowConfetti />}
                {guardianMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-900/20 text-cyan-100 text-sm flex items-start gap-3"
                  >
                    <Bot className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-cyan-300 mb-0.5">Guardian Message</p>
                      {guardianMsg}
                    </div>
                  </motion.div>
                )}
                <BlockchainAudit referenceId={auditDecision?.ref} action={auditDecision?.action} />
              </div>
            )}
            <FraudRingVisualization />
          </GlassCard>
        </motion.div>
      </div>
    </Section>
  );
});

function DecisionTimeline() {
  const steps = ['Login', 'Device Check', 'Behavior Scan', 'Amount Analysis', 'Graph Check', 'Decision'];
  return (
    <div className="h-full flex flex-col items-center justify-center py-10">
      <p className="text-slate-400 mb-8">A transaction travels through this pipeline in under 2.5 seconds</p>
      <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-sm text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
              {s}
            </div>
            {i < steps.length - 1 && <ArrowRight className="w-4 h-4 text-slate-600 mx-1" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function FraudRingVisualization() {
  return (
    <div className="mt-8 p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50">
      <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2"><Network className="w-4 h-4 text-purple-400" /> Fraud Graph Intelligence</h4>
      <div className="flex items-center justify-center gap-6 flex-wrap">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 font-bold">Fraud</div>
          <p className="text-[10px] text-slate-500 mt-1">Device-X</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="w-16 h-0.5 bg-slate-600" />
          <div className="w-16 h-0.5 bg-slate-600" />
        </div>
        <div className="flex gap-3">
          <div className="text-center"><div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-purple-400 text-xs">User A</div></div>
          <div className="text-center"><div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-purple-400 text-xs">User B</div></div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="w-12 h-0.5 bg-slate-600" />
        </div>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 font-bold text-xs">Scam<br/>Shop</div>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-4 text-center">NetworkX detects shared devices and mule rings, adding up to +40 risk bonus.</p>
    </div>
  );
}

function ScanningAnimation() {
  const signals = ['Device Trust', 'Session Speed', 'Amount History', 'OTP Pattern', 'Payee History', 'Biometrics', 'Graph Risk'];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % signals.length), 300);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="h-96 flex flex-col items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-20 h-20 rounded-full border-4 border-slate-700 border-t-cyan-500 mb-6" />
      <p className="text-lg font-bold text-slate-100 mb-4">Running 7-layer protection scan</p>
      <div className="w-full max-w-md space-y-2">
        {signals.map((s, i) => (
          <div key={s} className={`flex items-center justify-between p-2 rounded-lg text-sm transition-all ${i <= active ? 'bg-slate-800/60 text-slate-200' : 'text-slate-600'}`}>
            <span>{s}</span>
            {i < active && <CheckCircle className="w-4 h-4 text-emerald-500" />}
            {i === active && <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskScoreGauge({ score, level, action }: { score: number; level: string; action: string }) {
  const color = level === 'LOW' ? '#10b981' : level === 'MEDIUM' ? '#f59e0b' : '#f43f5e';
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;
  return (
    <div className="p-5 bg-slate-800/40 border border-slate-700 rounded-2xl flex items-center gap-5">
      <div className="relative w-28 h-28 flex-shrink-0">
        <svg className="w-full h-full -rotate-90">
          <circle cx="56" cy="56" r="45" stroke="#1e293b" strokeWidth="10" fill="none" />
          <motion.circle cx="56" cy="56" r="45" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1 }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-black text-white">{score}</span><span className="text-[10px] text-slate-400">/100</span></div>
      </div>
      <div>
        <p className="text-xs text-slate-400">Risk Level</p>
        <p className="text-2xl font-black" style={{ color }}>{level}</p>
        <p className="text-xs text-slate-500">Action: {action}</p>
      </div>
    </div>
  );
}

function CoolingVaultTimer() {
  const [left, setLeft] = useState(15 * 60);
  const fmt = (n: number) => `${Math.floor(n / 60).toString().padStart(2, '0')}:${(n % 60).toString().padStart(2, '0')}`;
  useEffect(() => { const t = setInterval(() => setLeft((x) => Math.max(0, x - 1)), 1000); return () => clearInterval(t); }, []);
  return (
    <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl flex items-center gap-4">
      <Clock className="w-8 h-8 text-amber-500" />
      <div>
        <p className="font-bold text-amber-400">Cooling Vault Active</p>
        <p className="text-sm text-slate-300">Funds locked for {fmt(left)}. OTP + wait required before proceed.</p>
      </div>
    </div>
  );
}

function BlockAlert() {
  return (
    <div className="p-4 bg-rose-900/20 border border-rose-500/30 rounded-xl flex items-center gap-4">
      <Ban className="w-8 h-8 text-rose-500" />
      <div>
        <p className="font-bold text-rose-400">Transaction Blocked</p>
        <p className="text-sm text-slate-300">No money left the account. SMS/email alert sent. Support ticket auto-raised.</p>
      </div>
    </div>
  );
}

function AllowConfetti() {
  return (
    <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-xl flex items-center gap-4">
      <CheckCircle className="w-8 h-8 text-emerald-500" />
      <div>
        <p className="font-bold text-emerald-400">Transaction Allowed</p>
        <p className="text-sm text-slate-300">Low risk. Proceeds with standard MPIN / biometric confirmation.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AI INSIGHTS DEMO
   ═══════════════════════════════════════════════════════════════ */

function InsightsDemo() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % insights.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <Section id="insights" title="AI Twin Insights" subtitle="Not just numbers — contextual, actionable advice generated from your aggregated financial DNA." badge="Generative Intelligence">
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Brain className="w-5 h-5 text-cyan-400" /> Rotating Insight Feed</h3>
          <div className="relative h-80">
            <AnimatePresence mode="wait">
              <InsightCard key={active} insight={insights[active]} />
            </AnimatePresence>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {insights.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${active === i ? 'bg-cyan-400 w-6' : 'bg-slate-700'}`} />
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="text-lg font-bold mb-4">Why These Insights?</h3>
          <div className="space-y-4">
            {[
              { title: 'Holistic View', desc: 'AA links banks + brokers + insurers so the Twin sees the full picture, not just one account.' },
              { title: 'Rule + Pattern Engine', desc: 'Combines static rules (tax deadlines, 6-month emergency rule) with personal spend patterns.' },
              { title: 'Explainable', desc: 'Every insight tells you the reason and suggests a one-tap action.' },
              { title: 'Privacy-first', desc: 'Insights are computed client-side or on your protection service; raw credentials never stored.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-3 bg-slate-800/40 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-sm flex-shrink-0">{i + 1}</div>
                <div>
                  <p className="font-bold text-slate-200 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </Section>
  );
}

function InsightCard({ insight }: { insight: typeof insights[0] }) {
  const styles = {
    danger: { border: 'border-red-500/30', bg: 'bg-red-900/10', heading: 'text-red-300', btn: 'bg-red-500/20 text-red-300', icon: 'text-red-500' },
    success: { border: 'border-green-500/30', bg: 'bg-green-900/10', heading: 'text-green-300', btn: 'bg-green-500/20 text-green-300', icon: 'text-green-500' },
    info: { border: 'border-blue-500/30', bg: 'bg-blue-900/10', heading: 'text-blue-300', btn: 'bg-blue-500/20 text-blue-300', icon: 'text-blue-500' },
    warning: { border: 'border-amber-500/30', bg: 'bg-amber-900/10', heading: 'text-amber-300', btn: 'bg-amber-500/20 text-amber-300', icon: 'text-amber-500' },
  }[insight.type];
  const Icon = insight.icon;
  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className={`absolute inset-0 p-6 rounded-2xl border ${styles.border} ${styles.bg} flex flex-col justify-between`}>
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Icon className={`w-8 h-8 ${styles.icon}`} />
          <h4 className={`text-xl font-bold ${styles.heading}`}>{insight.title}</h4>
        </div>
        <p className="text-slate-200 mb-4">{insight.desc}</p>
        <div className="p-3 bg-slate-950/30 rounded-lg border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-1">How it was derived</p>
          <p className="text-sm text-slate-300">{insight.reason}</p>
        </div>
      </div>
      <button className={`mt-4 self-start px-4 py-2 rounded-lg text-sm font-semibold ${styles.btn}`}>{insight.action}</button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GOALS DEMO
   ═══════════════════════════════════════════════════════════════ */

function GoalsDemo({ goals }: { goals: { name: string; target: number; current: number; year: number; color: GoalColor; sip: number }[] }) {
  const [extraSip, setExtraSip] = useState(0);
  return (
    <Section id="goals" title="Goal-Based Wealth Engine" subtitle="Track goals, simulate extra contributions, and see exactly when you will reach each milestone." badge="Scenario Planning">
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {goals.map((goal, idx) => {
            const progress = (goal.current / goal.target) * 100;
            const monthsToGoal = Math.max(0, Math.ceil((goal.target - goal.current) / (goal.sip + extraSip)));
            const year = new Date().getFullYear() + Math.floor(monthsToGoal / 12);
            return (
              <GlassCard key={idx}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-100">{goal.name}</h3>
                    <p className="text-xs text-slate-400">Target year: {goal.year}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-100">₹{(goal.current / 100000).toFixed(1)}L</p>
                    <p className="text-xs text-slate-400">of ₹{(goal.target / 100000).toFixed(1)}L</p>
                  </div>
                </div>
                <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden mb-2">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: idx * 0.15 }} className={`h-full ${goalBarClass[goal.color]}`} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{progress.toFixed(1)}% complete</span>
                  <span className="text-slate-300">With +₹{extraSip.toLocaleString('en-IN')}/mo → reaches by <strong>{year}</strong></span>
                </div>
              </GlassCard>
            );
          })}
        </div>
        <div className="space-y-4">
          <GlassCard>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-cyan-400" /> What-If Simulator</h3>
            <p className="text-sm text-slate-400 mb-4">Drag to add extra monthly SIP and see all goal timelines shift.</p>
            <input type="range" min={0} max={50000} step={1000} value={extraSip} onChange={(e) => setExtraSip(Number(e.target.value))} className="w-full accent-cyan-500 mb-3" />
            <div className="text-center">
              <p className="text-3xl font-black text-cyan-400">+₹{extraSip.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-400">extra per month</p>
            </div>
          </GlassCard>
          <HowItWorks steps={['Goals are linked to AA balances', 'Monthly SIP is auto-detected from spends', 'Projections use simple future-value math', 'Sliders let users test commitment changes']} />
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BIOMETRICS DEMO
   ═══════════════════════════════════════════════════════════════ */

const BiometricsDemo = forwardRef<{ run: () => void }, { addLog: (e: Omit<ApiLogEntry, 'id' | 'timestamp'>) => void }>(function BiometricsDemo({ addLog }, ref) {
  const [sentence] = useState('SecureWealth protects my money');
  const [typed, setTyped] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BiometricRiskResponse | null>(null);
  const startRef = useRef<number | null>(null);
  const intervalsRef = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setTyped(''); setResult(null); intervalsRef.current = []; startRef.current = null; };
  const handleKeyDown = () => { if (startRef.current === null) startRef.current = Date.now(); };
  const handleKeyUp = () => { if (startRef.current === null) return; intervalsRef.current.push(Date.now() - startRef.current); startRef.current = Date.now(); };
  const analyze = async () => {
    setRunning(true);
    const avg = intervalsRef.current.length ? intervalsRef.current.reduce((a, b) => a + b, 0) / intervalsRef.current.length : 120;
    const deviation = avg > 180 ? 0.8 : avg > 120 ? 0.4 : 0.1;
    const res = await protectionApi.biometricRisk({ deviation });
    addLog({ method: 'POST', path: '/api/v1/biometric-risk', status: res.status, ok: res.ok, summary: 'Biometric anomaly score computed', payload: { deviation }, response: res.data });
    setResult(res.ok ? (res.data as BiometricRiskResponse) : { risk_bonus: 0, anomaly: 'none', reason: 'Service unreachable' });
    setRunning(false);
  };

  const run = async () => {
    reset();
    inputRef.current?.focus();
    const text = sentence;
    for (let i = 0; i < text.length; i++) {
      handleKeyDown();
      await new Promise((r) => setTimeout(r, 60 + Math.random() * 60));
      setTyped(text.slice(0, i + 1));
      handleKeyUp();
    }
    await new Promise((r) => setTimeout(r, 300));
    analyze();
  };

  useImperativeHandle(ref, () => ({ run }));

  const wpm = useMemo(() => {
    if (!typed.length) return 0;
    const minutes = Math.max(intervalsRef.current.reduce((a, b) => a + b, 0), 1000) / 60000;
    return Math.round((typed.length / 5) / minutes);
  }, [typed]);

  return (
    <Section id="biometrics" title="Behavioral Biometrics" subtitle="Detect bots, coercion and account takeover by analyzing keystroke rhythm, mouse curves and session behavior." badge="World-First for PSB">
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Fingerprint className="w-5 h-5 text-cyan-400" /> Typing Challenge</h3>
          <p className="text-sm text-slate-400 mb-4">Type this sentence naturally. We measure inter-key intervals and send a deviation score to the FastAPI biometric engine.</p>
          <div className="mb-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-slate-400 text-sm font-mono">{sentence}</div>
          <input ref={inputRef} type="text" value={typed} onChange={(e) => setTyped(e.target.value)} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} placeholder="Start typing here..." className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:border-cyan-500 outline-none mb-4" />
          <div className="grid grid-cols-3 gap-3 mb-4">
            <MetricBox label="WPM" value={wpm.toString()} />
            <MetricBox label="Avg Gap" value={`${Math.round(intervalsRef.current.reduce((a, b) => a + b, 0) / Math.max(1, intervalsRef.current.length))}ms`} />
            <MetricBox label="Keys" value={typed.length.toString()} />
          </div>
          <div className="flex gap-3">
            <button onClick={analyze} disabled={running || typed.length < 5} className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-sm">{running ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : null} Analyze Behavior</button>
            <button onClick={reset} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold">Reset</button>
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="text-lg font-bold mb-4">Real-Time Risk Signals</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Keystroke', value: result ? (result.anomaly === 'high' ? 'Anomalous' : 'Normal') : '—', ok: result ? result.anomaly !== 'high' : true },
              { label: 'Mouse Curves', value: 'Human-like', ok: true },
              { label: 'Typing Rhythm', value: result ? `${Math.round(result.risk_bonus)} risk bonus` : '—', ok: result ? result.risk_bonus < 15 : true },
              { label: 'Coercion Check', value: 'No duress', ok: true },
            ].map((m, i) => (
              <div key={i} className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-500">{m.label}</p>
                <p className={`text-lg font-bold ${m.ok ? 'text-emerald-400' : 'text-rose-400'}`}>{m.value}</p>
              </div>
            ))}
          </div>
          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-4 rounded-xl border ${result.anomaly === 'high' ? 'bg-rose-900/20 border-rose-500/30 text-rose-300' : result.anomaly === 'low' ? 'bg-amber-900/20 border-amber-500/30 text-amber-300' : 'bg-emerald-900/20 border-emerald-500/30 text-emerald-300'}`}>
              <p className="font-bold mb-1">{result.anomaly === 'high' ? 'Anomaly Detected' : result.anomaly === 'low' ? 'Minor Deviation' : 'Behavior Normal'}</p>
              <p className="text-sm">{result.reason}</p>
              <p className="text-xs mt-2 opacity-80">Risk bonus added to protection score: {result.risk_bonus}</p>
            </motion.div>
          )}
          <div className="mt-4 p-3 bg-slate-800/30 rounded-lg text-xs text-slate-400">
            <strong>How it works:</strong> We capture keydown/keyup deltas, compute variance vs. your stored profile, and send a normalized deviation (0–1) to the biometric risk endpoint.
          </div>
        </GlassCard>
      </div>
    </Section>
  );
});

/* ═══════════════════════════════════════════════════════════════
   COMPARISON
   ═══════════════════════════════════════════════════════════════ */

function ComparisonSection() {
  const rows = [
    { label: 'Net-worth view', traditional: 'Single account only', twin: 'Unified across banks, brokers, insurers', icon: Eye },
    { label: 'Fraud detection', traditional: 'Rule-based, often after loss', twin: '7-layer AI before money moves', icon: Shield },
    { label: 'Decision speed', traditional: 'Hours to days', twin: '< 2.5 seconds', icon: Zap },
    { label: 'Explainability', traditional: 'Call center script', twin: 'Factor-level reasoning + reference ID', icon: FileCode },
    { label: 'Biometrics', traditional: 'Password / OTP only', twin: 'Keystroke, mouse & session behavior', icon: Fingerprint },
    { label: 'High-risk action', traditional: 'May go through', twin: 'Cooling vault + family approval gate', icon: Lock },
  ];
  return (
    <Section id="compare" title="Traditional Banking vs SecureWealth Twin" subtitle="See the leap from reactive banking to predictive, protective wealth intelligence.">
      <GlassCard>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4">
          <div className="text-center p-4 bg-slate-800/30 rounded-xl">
            <p className="font-bold text-slate-300 text-lg">Traditional Bank App</p>
            <p className="text-xs text-slate-500">Reactive • Siloed • Static</p>
          </div>
          <div className="flex items-center justify-center"><ArrowRight className="w-6 h-6 text-cyan-500 rotate-90 md:rotate-0" /></div>
          <div className="text-center p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl border border-cyan-500/20">
            <p className="font-bold text-cyan-300 text-lg">SecureWealth Twin</p>
            <p className="text-xs text-cyan-200/60">Predictive • Unified • Self-Protecting</p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center p-3 rounded-xl bg-slate-800/20">
              <div className="text-slate-400 text-sm flex items-center gap-2"><row.icon className="w-4 h-4 text-slate-500" /> {row.label}</div>
              <div className="hidden md:block text-center text-xs text-slate-600">vs</div>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                <div className="text-sm text-slate-500 line-through">{row.traditional}</div>
                <div className="text-sm font-semibold text-emerald-400">{row.twin}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ARCHITECTURE
   ═══════════════════════════════════════════════════════════════ */

function ArchitectureDemo() {
  const nodes = [
    { label: 'User Device', sub: 'React + Biometrics', color: 'cyan' },
    { label: 'AA Network', sub: 'RBI Consent Bridge', color: 'blue' },
    { label: 'Protection API', sub: 'FastAPI + Risk Engine', color: 'emerald' },
    { label: 'Graph Engine', sub: 'NetworkX Mule Detection', color: 'purple' },
    { label: 'Blockchain Audit', sub: 'SHA-256 Audit Chain', color: 'amber' },
  ];
  const colorClass: Record<string, string> = { cyan: 'hover:border-cyan-500/50', blue: 'hover:border-blue-500/50', emerald: 'hover:border-emerald-500/50', purple: 'hover:border-purple-500/50', amber: 'hover:border-amber-500/50' };
  return (
    <Section id="architecture" title="How It All Connects" subtitle="End-to-end flow from consent to decision — built for transparency, scale, and security.">
      <GlassCard>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
          {nodes.map((n, i) => (
            <div key={i} className="flex items-center gap-3">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className={`p-4 rounded-xl bg-slate-800/60 border border-slate-700 min-w-[150px] text-center transition-colors ${colorClass[n.color]}`}>
                <p className="font-bold text-slate-100 text-sm">{n.label}</p>
                <p className="text-[10px] text-slate-400">{n.sub}</p>
              </motion.div>
              {i < nodes.length - 1 && <ArrowRight className="w-5 h-5 text-slate-600 hidden md:block" />}
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            { title: 'Consent-First', desc: 'No data fetch without explicit, revocable user consent.' },
            { title: '7-Layer Scoring', desc: 'Device, speed, amount, OTP, payee, biometrics, graph.' },
            { title: 'Explainable', desc: 'Every decision lists exact factors and reference ID.' },
            { title: 'Immutable Audit', desc: 'Each action is hashed into a blockchain-style audit chain.' },
          ].map((f, i) => (
            <div key={i} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <p className="font-bold text-slate-200 text-sm mb-1">{f.title}</p>
              <p className="text-xs text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PERSONAS
   ═══════════════════════════════════════════════════════════════ */

function PersonasSection() {
  return (
    <div className="py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-12">Built for Every Indian</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {DEMO_PERSONAS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-colors"
              >
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="font-bold text-xl text-slate-100">{p.name}</p>
                <p className="text-sm text-cyan-400 mb-2">{p.role} • {p.netWorth}</p>
                <p className="text-sm text-slate-400">{p.tagline}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRUST BADGES
   ═══════════════════════════════════════════════════════════════ */

function TrustBadges() {
  const badges = [
    { icon: ShieldCheck, label: 'RBI Licensed', desc: 'Regulated entity' },
    { icon: Lock, label: '256-bit TLS', desc: 'End-to-end encryption' },
    { icon: Users, label: '2.4M+ Customers', desc: 'Trust PSB SecureWealth' },
    { icon: Trophy, label: 'PSB Hackathon 2026', desc: 'Innovation finalist' },
    { icon: Cpu, label: '< 2.5s Decision', desc: 'Real-time protection' },
    { icon: Globe, label: 'India-First', desc: 'Bharat-focused design' },
  ];
  return (
    <div className="py-16 px-4 sm:px-6 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((b, i) => (
            <div key={i} className="text-center p-4">
              <b.icon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="font-bold text-slate-100 text-sm">{b.label}</p>
              <p className="text-[10px] text-slate-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */

function Footer() {
  return (
    <footer className="py-10 px-4 text-center border-t border-slate-800">
      <p className="text-slate-500 text-sm">🛡️ PSB Hackathon 2026 Prototype • SecureWealth Twin Demo</p>
      <p className="text-xs text-slate-600 mt-1">Live protection service: {PROTECTION_API_URL}</p>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRESENTATION MODE
   ═══════════════════════════════════════════════════════════════ */

const presentationSlides = [
  { title: 'Account Aggregation', description: 'One consent unifies every bank, broker and insurer.', section: 'aa' },
  { title: '7-Layer Fraud Shield', description: 'Real-time scoring blocks fraud before money moves.', section: 'protection' },
  { title: 'AI Wealth Twin', description: 'Personalized insights, tax alerts and goal tracking.', section: 'insights' },
  { title: 'SecureWealth Universe', description: '15 patent-grade innovations orbiting one intelligent core.', section: 'universe' },
  { title: 'Behavioral Biometrics', description: 'Typing and mouse behavior detect bots and coercion.', section: 'biometrics' },
  { title: 'Built for Bharat', description: 'Multilingual, accessible, offline-first public-sector banking.', section: 'compare' },
];

function PresentationMode({ show, onClose, slide, setSlide, playing, setPlaying }: { show: boolean; onClose: () => void; slide: number; setSlide: (s: number) => void; playing: boolean; setPlaying: (p: boolean) => void }) {
  const current = presentationSlides[slide];

  useEffect(() => {
    if (!playing || !show) return;
    const t = setInterval(() => {
      setSlide(Math.min(slide + 1, presentationSlides.length - 1));
    }, 5000);
    return () => clearInterval(t);
  }, [playing, show, slide, setSlide]);

  if (!show) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-xl flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2"><Play className="w-5 h-5 text-cyan-400" /> Presentation Mode</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setPlaying(!playing)} className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white" title="Play/Pause">{playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}</button>
          <button onClick={() => { setPlaying(false); onClose(); }} className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-rose-500" title="Stop Presentation"><Square className="w-4 h-4" /> Stop</button>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white" title="Close"><Minimize2 className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, scale: 0.95, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -50 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl w-full text-center"
          >
            <div className="text-9xl font-black text-slate-800 mb-6">{String(slide + 1).padStart(2, '0')}</div>
            <h2 className="text-5xl sm:text-7xl font-black text-slate-100 mb-6">{current.title}</h2>
            <p className="text-2xl text-slate-400">{current.description}</p>
            <button onClick={() => { onClose(); document.getElementById(`section-${current.section}`)?.scrollIntoView({ behavior: 'smooth' }); }} className="mt-10 px-6 py-3 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-500 transition-colors">
              Try it live →
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
        <button onClick={() => setSlide(Math.max(slide - 1, 0))} disabled={slide === 0} className="p-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
        <div className="flex gap-2">
          {presentationSlides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} className={`w-2 h-2 rounded-full transition-all ${slide === i ? 'bg-cyan-400 w-6' : 'bg-slate-700'}`} />
          ))}
        </div>
        <button onClick={() => setSlide(Math.min(slide + 1, presentationSlides.length - 1))} disabled={slide === presentationSlides.length - 1} className="p-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function HowItWorks({ steps }: { steps: string[] }) {
  return (
    <GlassCard>
      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">How it works</h4>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0 border border-cyan-500/20">{i + 1}</div>
            <p className="text-sm text-slate-400 leading-relaxed">{step}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-slate-800/40 rounded-xl text-center border border-slate-700/50">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-100">{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   API CONSOLE
   ═══════════════════════════════════════════════════════════════ */

function ApiConsole({ log, show, onToggle, endRef }: { log: ApiLogEntry[]; show: boolean; onToggle: () => void; endRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 ${show ? 'h-48' : 'h-10'} transition-all duration-300 bg-slate-950 border-t border-slate-800`}>
      <button onClick={onToggle} className="w-full h-10 flex items-center justify-between px-4 bg-slate-900/80 text-xs font-bold text-slate-300 hover:text-white">
        <span className="flex items-center gap-2"><Terminal className="w-4 h-4" /> Live API Console ({log.length} calls)</span>
        <span>{show ? '▼ Hide' : '▲ Show'}</span>
      </button>
      {show && (
        <div className="h-[calc(100%-2.5rem)] overflow-y-auto p-4 font-mono text-xs">
          {log.length === 0 && <p className="text-slate-600">Interact with demos to see live API calls...</p>}
          {log.map((entry) => (
            <div key={entry.id} className="mb-3 border-l-2 border-slate-700 pl-3">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${entry.ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{entry.method}</span>
                <span className="text-cyan-400">{PROTECTION_API_URL}{entry.path}</span>
                <span className={`text-[10px] ${entry.ok ? 'text-emerald-500' : 'text-rose-500'}`}>{entry.status}</span>
                <span className="text-slate-600 ml-auto">{entry.timestamp.toLocaleTimeString()}</span>
              </div>
              <p className="text-slate-400 mb-1">→ {entry.summary}</p>
              {entry.payload && <pre className="text-[10px] text-slate-500 bg-slate-900/50 p-1.5 rounded mb-1 overflow-x-auto">{JSON.stringify(entry.payload, null, 1)}</pre>}
              {entry.response && <pre className="text-[10px] text-emerald-300/80 bg-slate-900/50 p-1.5 rounded overflow-x-auto">{JSON.stringify(entry.response, null, 1)}</pre>}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
}

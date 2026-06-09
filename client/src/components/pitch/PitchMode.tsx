import { useState, useEffect, useCallback, useRef } from 'react';
import { useWealthStore } from '../../store/wealthStore';
import type { RiskSignals, ProtectionDecision } from '../../types';
import { calculateProtectionScore, getProtectionDecision } from '../../hooks/useProtectionEngine';
import { useWakeLock } from '../../hooks/useWakeLock';
import ProtectionModal from '../protection/ProtectionModal';

interface Scene {
  id: string;
  view: string;
  caption: string;
  subCaption: string;
  duration: number;
  demo?: 'fraud' | 'tax' | 'networth' | 'habits' | 'market' | 'aa' | 'goals' | null;
  mandate?: number;
}

const SCENES: Scene[] = [
  { id: 'intro', view: 'dashboard', caption: 'SecureWealth Twin', subCaption: 'PSB Hackathon Series 2026 — 7 Mandates. One Platform.', duration: 6000, demo: null },
  { id: 'mandate-1', view: 'wealth-twin', caption: 'Mandate 1: Learn from Habits', subCaption: 'AI pattern recognition across 12-month transaction history', duration: 9000, demo: 'habits', mandate: 1 },
  { id: 'mandate-2', view: 'goals', caption: 'Mandate 2: Understand Dynamics', subCaption: 'Dynamic goal tracking with risk profile adjustment', duration: 9000, demo: 'goals', mandate: 2 },
  { id: 'mandate-3', view: 'market', caption: 'Mandate 3: Study Market Trends', subCaption: 'Real-time market data with AI-driven Buy/Sell/Hold signals', duration: 9000, demo: 'market', mandate: 3 },
  { id: 'mandate-4', view: 'assets', caption: 'Mandate 4: Multi-Bank Picture', subCaption: 'RBI Account Aggregator integration (2.61B accounts enabled)', duration: 9000, demo: 'aa', mandate: 4 },
  { id: 'mandate-5', view: 'dashboard', caption: 'Mandate 5: Full Net Worth', subCaption: 'Holistic tracking — liquid, investment, physical assets', duration: 9000, demo: 'networth', mandate: 5 },
  { id: 'mandate-6', view: 'tax', caption: 'Mandate 6: Timely Suggestions', subCaption: 'AI-powered insights & tax optimization (80C / 80D / 80CCD)', duration: 9000, demo: 'tax', mandate: 6 },
  { id: 'mandate-7', view: 'protection', caption: 'Mandate 7: Fraud Protection', subCaption: 'Mandatory pre-execution cyber-fraud risk checks', duration: 12000, demo: 'fraud', mandate: 7 },
  { id: 'inclusive', view: 'business-mode', caption: 'Inclusive & Business Modes', subCaption: 'NRI · Senior · Kids · Family · SME Treasury', duration: 7000, demo: null },
  { id: 'architecture', view: 'architecture', caption: 'System Architecture', subCaption: 'React 18 · TypeScript · Python AI · PostgreSQL · Redis · RBI AA', duration: 7000, demo: null },
  { id: 'outro', view: 'dashboard', caption: 'Thank You!', subCaption: 'Team SecureWealth Twin | PSB Hackathon Series 2026', duration: 8000, demo: null },
];

const TOTAL_DURATION = SCENES.reduce((sum, s) => sum + s.duration, 0);

function AnimatedCounter({ target, prefix = '', suffix = '', duration = 2 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration * 30);
    const interval = setInterval(() => {
      start += increment;
      if (start >= target) {
        setValue(target);
        clearInterval(interval);
      } else {
        setValue(Math.floor(start));
      }
    }, 33);
    return () => clearInterval(interval);
  }, [target, duration]);
  return <span>{prefix}{value.toLocaleString()}{suffix}</span>;
}

export default function PitchMode() {
  const [active, setActive] = useState(false);
  useWakeLock(active);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showFraudModal, setShowFraudModal] = useState(false);
  const [fraudDecision, setFraudDecision] = useState<ProtectionDecision | null>(null);
  const [fraudSignals, setFraudSignals] = useState<RiskSignals>({
    newDevice: false, rushedAction: false, unusualAmount: false,
    otpRetries: false, firstTimeInvest: false, abnormalBehavior: false,
  });
  const [showTaxDemo, setShowTaxDemo] = useState(false);
  const [showNetWorthDemo, setShowNetWorthDemo] = useState(false);
  const [showHabitsDemo, setShowHabitsDemo] = useState(false);
  const [showMarketDemo, setShowMarketDemo] = useState(false);
  const [showAADemo, setShowAADemo] = useState(false);
  const [showGoalsDemo, setShowGoalsDemo] = useState(false);
  const [showScam, setShowScam] = useState(false);

  const setView = useWealthStore((s) => s.setView);
  const setPitchMode = useWealthStore((s) => s.setPitchModeActive);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scene = SCENES[sceneIndex];
  const isLastScene = sceneIndex === SCENES.length - 1;

  // Keyboard shortcut Shift+P
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (active) {
          exit();
        } else {
          start();
        }
      }
      if (active && e.key === 'Escape') {
        exit();
      }
      if (active && e.key === ' ') {
        e.preventDefault();
        togglePause();
      }
      if (active && e.key === 'ArrowRight') {
        nextScene();
      }
      if (active && (e.key === 'r' || e.key === 'R')) {
        restart();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, sceneIndex, paused]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
  }, []);

  const resetDemos = useCallback(() => {
    setShowFraudModal(false);
    setFraudDecision(null);
    setFraudSignals({ newDevice: false, rushedAction: false, unusualAmount: false, otpRetries: false, firstTimeInvest: false, abnormalBehavior: false });
    setShowTaxDemo(false);
    setShowNetWorthDemo(false);
    setShowHabitsDemo(false);
    setShowMarketDemo(false);
    setShowAADemo(false);
    setShowGoalsDemo(false);
    setShowScam(false);
  }, []);

  const start = useCallback(() => {
    setActive(true);
    setSceneIndex(0);
    setElapsed(0);
    setPaused(false);
    setPitchMode(true);
    resetDemos();
  }, [setPitchMode, resetDemos]);

  const exit = useCallback(() => {
    clearTimers();
    setActive(false);
    setPitchMode(false);
    resetDemos();
    setView('dashboard');
  }, [clearTimers, setPitchMode, resetDemos, setView]);

  const restart = useCallback(() => {
    clearTimers();
    setSceneIndex(0);
    setElapsed(0);
    setPaused(false);
    resetDemos();
  }, [clearTimers, resetDemos]);

  const togglePause = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  const nextScene = useCallback(() => {
    if (isLastScene) {
      exit();
      return;
    }
    clearTimers();
    setSceneIndex((i) => i + 1);
    setElapsed(SCENES.slice(0, sceneIndex + 1).reduce((s, sc) => s + sc.duration, 0));
    resetDemos();
  }, [isLastScene, exit, clearTimers, sceneIndex, resetDemos]);

  // Handle scene changes
  useEffect(() => {
    if (!active || paused) return;
    setView(scene.view as any);

    // Run demo effects per scene
    if (scene.demo === 'fraud') {
      demoTimerRef.current = setTimeout(() => {
        setFraudSignals((s) => ({ ...s, unusualAmount: true, newDevice: true }));
      }, 1500);
      demoTimerRef.current = setTimeout(() => {
        setFraudSignals((s) => ({ ...s, unusualAmount: true, newDevice: true, otpRetries: true, rushedAction: true }));
      }, 3500);
      demoTimerRef.current = setTimeout(() => {
        const signals = { newDevice: true, rushedAction: true, unusualAmount: true, otpRetries: true, firstTimeInvest: false, abnormalBehavior: false };
        const score = calculateProtectionScore(signals);
        const decision = getProtectionDecision(score);
        setFraudDecision(decision);
        setShowFraudModal(true);
      }, 5500);
      demoTimerRef.current = setTimeout(() => {
        setShowFraudModal(false);
        setShowScam(true);
      }, 9000);
    } else if (scene.demo === 'tax') {
      demoTimerRef.current = setTimeout(() => setShowTaxDemo(true), 1000);
    } else if (scene.demo === 'networth') {
      demoTimerRef.current = setTimeout(() => setShowNetWorthDemo(true), 1000);
    } else if (scene.demo === 'habits') {
      demoTimerRef.current = setTimeout(() => setShowHabitsDemo(true), 1000);
    } else if (scene.demo === 'market') {
      demoTimerRef.current = setTimeout(() => setShowMarketDemo(true), 1000);
    } else if (scene.demo === 'aa') {
      demoTimerRef.current = setTimeout(() => setShowAADemo(true), 1000);
    } else if (scene.demo === 'goals') {
      demoTimerRef.current = setTimeout(() => setShowGoalsDemo(true), 1000);
    }

    // Auto-advance timer
    timerRef.current = setTimeout(() => {
      if (!isLastScene) {
        setSceneIndex((i) => i + 1);
      } else {
        exit();
      }
    }, scene.duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    };
  }, [active, paused, sceneIndex, scene, isLastScene, setView, exit]);

  // Progress bar interval
  useEffect(() => {
    if (!active || paused) {
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }
    progressRef.current = setInterval(() => {
      setElapsed((e) => {
        if (e >= TOTAL_DURATION) return TOTAL_DURATION;
        return e + 100;
      });
    }, 100);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [active, paused]);

  // Update elapsed when scene changes manually
  useEffect(() => {
    if (!active) return;
    const targetElapsed = SCENES.slice(0, sceneIndex).reduce((s, sc) => s + sc.duration, 0);
    setElapsed(targetElapsed);
  }, [sceneIndex, active]);

  if (!active) return null;

  const progressPercent = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
  const sceneProgress = scene.duration > 0
    ? Math.min(((elapsed - SCENES.slice(0, sceneIndex).reduce((s, sc) => s + sc.duration, 0)) / scene.duration) * 100, 100)
    : 0;

  const sceneTimeLeft = Math.max(0, Math.ceil((scene.duration - (elapsed - SCENES.slice(0, sceneIndex).reduce((s, sc) => s + sc.duration, 0))) / 1000));

  return (
    <div className="fixed inset-0 z-[100] flex flex-col pointer-events-none">
      {/* Dark overlay with vignette */}
      <div className="absolute inset-0 bg-black/60" style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.82) 100%)' }} />

      {/* Top header */}
      <div className="relative flex items-center justify-between px-6 py-3 bg-black/50 backdrop-blur-md border-b border-white/10 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-shield-halved text-white text-sm" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">SecureWealth Twin</p>
            <p className="text-[10px] text-white/60">Pitch Mode — {sceneIndex + 1} / {SCENES.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {scene.mandate && (
            <span className="px-2.5 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full border border-primary/30">
              Mandate {scene.mandate}
            </span>
          )}
          <span className="text-xs text-white/60 font-mono w-12 text-right">{sceneTimeLeft}s</span>
          <button onClick={togglePause} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors">
            <i className={`fas ${paused ? 'fa-play' : 'fa-pause'} mr-1`} />
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button onClick={nextScene} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors">
            <i className="fas fa-forward mr-1" /> Skip
          </button>
          <button onClick={restart} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors">
            <i className="fas fa-rotate-right mr-1" /> Restart
          </button>
          <button onClick={exit} className="px-3 py-1.5 bg-rose-500/80 hover:bg-rose-500 text-white text-xs rounded-lg transition-colors">
            <i className="fas fa-times mr-1" /> Exit
          </button>
        </div>
      </div>

      {/* Center content area — rich mandate overlays */}
      <div className="flex-1 relative">
        {/* INTRO SLIDE */}
        {scene.id === 'intro' && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center text-white animate-fade-in max-w-3xl">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 via-primary to-secondary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/20">
                <i className="fas fa-shield-halved text-white text-5xl" />
              </div>
              <h1 className="text-6xl font-extrabold mb-4 tracking-tight">SecureWealth Twin</h1>
              <p className="text-2xl text-slate-300 mb-10 font-light">Your AI Wealth Guardian</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left max-w-2xl mx-auto">
                {[
                  { n: 1, text: 'Learn from Habits', icon: 'fa-brain', color: 'from-violet-500 to-purple-600' },
                  { n: 2, text: 'Understand Dynamics', icon: 'fa-bullseye', color: 'from-blue-500 to-cyan-500' },
                  { n: 3, text: 'Study Market Trends', icon: 'fa-chart-line', color: 'from-emerald-500 to-teal-500' },
                  { n: 4, text: 'Multi-Bank Picture', icon: 'fa-building-columns', color: 'from-amber-500 to-orange-500' },
                  { n: 5, text: 'Full Net Worth', icon: 'fa-gem', color: 'from-rose-500 to-pink-500' },
                  { n: 6, text: 'Timely Suggestions', icon: 'fa-lightbulb', color: 'from-yellow-400 to-amber-500' },
                  { n: 7, text: 'Fraud Protection', icon: 'fa-shield-virus', color: 'from-red-500 to-rose-600' },
                ].map((m) => (
                  <div key={m.n} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center flex-shrink-0`}>
                      <i className={`fas ${m.icon} text-white text-xs`} />
                    </div>
                    <div>
                      <span className="text-white/50 text-xs font-mono mr-2">#{m.n}</span>
                      <span className="text-white text-sm font-medium">{m.text}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-sm text-white/40">Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60 font-mono text-xs">Space</kbd> to pause · <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60 font-mono text-xs">→</kbd> to skip</p>
            </div>
          </div>
        )}

        {/* MANDATE 1: HABITS */}
        {scene.id === 'mandate-1' && showHabitsDemo && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 pointer-events-auto">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-brain text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">AI Pattern Recognition</h3>
                  <p className="text-xs text-slate-500">12-month transaction history analysis</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400"><AnimatedCounter target={347} /></p>
                  <p className="text-[10px] text-slate-500 mt-1">Transactions Analyzed</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">94%</p>
                  <p className="text-[10px] text-slate-500 mt-1">Pattern Accuracy</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">₹12,400</p>
                  <p className="text-[10px] text-slate-500 mt-1">Potential Savings Found</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Dining spends spike 40% on weekends', saving: '₹3,200/mo' },
                  { label: 'Unused subscriptions detected (Hotstar, Cult.fit)', saving: '₹2,899/mo' },
                  { label: 'ATM withdrawal pattern — shift to UPI', saving: '₹800/mo' },
                ].map((insight, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-100 dark:border-violet-800">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-wand-magic-sparkles text-violet-500 text-xs" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{insight.label}</span>
                    </div>
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{insight.saving}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MANDATE 2: GOALS / DYNAMICS */}
        {scene.id === 'mandate-2' && showGoalsDemo && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 pointer-events-auto">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-bullseye text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Dynamic Goal Tracking</h3>
                  <p className="text-xs text-slate-500">Risk-adjusted projections with What-If simulator</p>
                </div>
              </div>
              <div className="space-y-4 mb-5">
                {[
                  { name: 'Emergency Fund', current: 60, target: '₹3.6L / ₹6L', color: 'bg-emerald-500', months: '8 months ahead' },
                  { name: 'Dream Home', current: 34, target: '₹8.5L / ₹25L', color: 'bg-blue-500', months: 'Add ₹5K SIP to reach on time' },
                  { name: "Child's Education", current: 28, target: '₹4.2L / ₹15L', color: 'bg-violet-500', months: 'Risk profile: Moderate → Aggressive' },
                ].map((g) => (
                  <div key={g.name} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300 mb-2">
                      <span className="font-medium">{g.name}</span>
                      <span className="text-slate-500">{g.target}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                      <div className={`h-full ${g.color} rounded-full transition-all duration-[2000ms]`} style={{ width: `${g.current}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400"><i className="fas fa-robot mr-1" />{g.months}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium"><i className="fas fa-lightbulb mr-2" />What-If Simulator: Increasing SIP by ₹10,000 reaches Dream Home goal 18 months earlier.</p>
              </div>
            </div>
          </div>
        )}

        {/* MANDATE 3: MARKET TRENDS */}
        {scene.id === 'mandate-3' && showMarketDemo && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 pointer-events-auto">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-chart-line text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">AI Market Signals</h3>
                  <p className="text-xs text-slate-500">Real-time data with Buy / Sell / Hold recommendations</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { name: 'NIFTY 50', signal: 'HOLD', pe: 23.4, color: 'bg-amber-500' },
                  { name: 'Gold', signal: 'BUY', pe: '-', color: 'bg-emerald-500' },
                  { name: 'Small Cap', signal: 'SELL', pe: 31.2, color: 'bg-rose-500' },
                ].map((m) => (
                  <div key={m.name} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                    <p className="text-xs text-slate-500 mb-1">{m.name}</p>
                    <span className={`inline-block px-3 py-1 ${m.color} text-white text-xs font-bold rounded-full`}>{m.signal}</span>
                    <p className="text-[10px] text-slate-400 mt-2">P/E: {m.pe}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { icon: 'fa-arrow-trend-down', text: 'NIFTY dropped 2.1% this week — trigger: Buy the Dip (+₹10K SIP)', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                  { icon: 'fa-coins', text: 'Gold/Silver ratio at 82 — trigger: Increase gold allocation by 5%', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
                  { icon: 'fa-building-columns', text: 'IDFC First FD @ 8.1% — trigger fired for rate alert', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
                ].map((alert, i) => (
                  <div key={i} className={`flex items-center gap-2 p-3 rounded-lg ${alert.color}`}>
                    <i className={`fas ${alert.icon} text-xs`} />
                    <span className="text-xs font-medium">{alert.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MANDATE 4: ACCOUNT AGGREGATOR */}
        {scene.id === 'mandate-4' && showAADemo && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 pointer-events-auto">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-building-columns text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">RBI Account Aggregator</h3>
                  <p className="text-xs text-slate-500">Consent-based · Secure · Revocable · 2.61B accounts enabled</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                {[
                  { bank: 'SBI Savings', balance: '₹4,50,000', linked: true, via: 'Sahamati AA' },
                  { bank: 'HDFC Savings', balance: '₹3,20,000', linked: true, via: 'Sahamati AA' },
                  { bank: 'ICICI PPF', balance: '₹2,80,000', linked: false, via: 'One-click link' },
                  { bank: 'Axis Mutual Fund', balance: '₹2,80,000', linked: true, via: 'Sahamati AA' },
                ].map((acc) => (
                  <div key={acc.bank} className={`p-4 rounded-xl border ${acc.linked ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{acc.bank}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${acc.linked ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
                        {acc.linked ? 'Linked' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{acc.balance}</p>
                    <p className="text-[10px] text-slate-400 mt-1"><i className="fas fa-link mr-1" />{acc.via}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium"><i className="fas fa-shield-halved mr-2" />Consent expires in 90 days. Auto-renewal notification sent. Data is encrypted at rest and in transit.</p>
              </div>
            </div>
          </div>
        )}

        {/* MANDATE 5: FULL NET WORTH */}
        {scene.id === 'mandate-5' && showNetWorthDemo && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 pointer-events-auto">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-gem text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Holistic Net Worth</h3>
                  <p className="text-xs text-slate-500">Liquid · Investment · Physical Assets · Real-time</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Liquid', value: '₹7.7L', icon: 'fa-building-columns', pct: 8, color: 'text-blue-600' },
                  { label: 'Investments', value: '₹4.3L', icon: 'fa-chart-pie', pct: 5, color: 'text-emerald-600' },
                  { label: 'Physical Gold', value: '₹2.0L', icon: 'fa-coins', pct: 2, color: 'text-amber-600' },
                  { label: 'Real Estate', value: '₹85.0L', icon: 'fa-house', pct: 85, color: 'text-rose-600' },
                ].map((a) => (
                  <div key={a.label} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                    <i className={`fas ${a.icon} ${a.color} text-lg mb-2`} />
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{a.value}</p>
                    <p className="text-[10px] text-slate-500">{a.label}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-xl border border-rose-200 dark:border-rose-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Total Net Worth</p>
                    <p className="text-xs text-slate-500">Includes linked AA accounts + physical assets</p>
                  </div>
                  <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">₹99.0L</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MANDATE 6: TAX / SUGGESTIONS */}
        {scene.id === 'mandate-6' && showTaxDemo && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 pointer-events-auto">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-lightbulb text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">AI Tax Optimization</h3>
                  <p className="text-xs text-slate-500">80C · 80D · 80CCD — Save up to ₹46,800/year</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { section: '80C', limit: '₹1,50,000', invested: '₹1,20,000', remaining: '₹30,000', color: 'bg-emerald-500' },
                  { section: '80D', limit: '₹50,000', invested: '₹25,000', remaining: '₹25,000', color: 'bg-blue-500' },
                  { section: '80CCD(1B)', limit: '₹50,000', invested: '₹0', remaining: '₹50,000', color: 'bg-violet-500' },
                ].map((t) => (
                  <div key={t.section} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500 mb-2">Section {t.section}</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{t.invested}</p>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                      <div className={`h-full ${t.color} rounded-full`} style={{ width: `${(parseInt(t.invested.replace(/[^0-9]/g, '')) / parseInt(t.limit.replace(/[^0-9]/g, ''))) * 100}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Remaining: {t.remaining}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <i className="fas fa-robot text-yellow-600 text-xs" />
                  <span className="text-xs text-slate-700 dark:text-slate-300"><strong>AI Suggestion:</strong> Invest remaining ₹30,000 in ELSS for 80C — shortest lock-in + wealth growth.</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <i className="fas fa-robot text-yellow-600 text-xs" />
                  <span className="text-xs text-slate-700 dark:text-slate-300"><strong>AI Suggestion:</strong> Open NPS Tier-1 for 80CCD(1B) — extra ₹50,000 deduction + retirement corpus.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MANDATE 7: FRAUD PROTECTION */}
        {scene.id === 'mandate-7' && !showFraudModal && !showScam && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 pointer-events-auto">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-shield-virus text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Cyber-Fraud Risk Engine</h3>
                  <p className="text-xs text-slate-500">6 behavioral signals · Weighted scoring · Pre-execution blocking</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-5">
                {[
                  { key: 'newDevice', label: 'New Device', weight: 20, active: fraudSignals.newDevice },
                  { key: 'rushedAction', label: 'Rushed Action', weight: 10, active: fraudSignals.rushedAction },
                  { key: 'unusualAmount', label: 'Unusual Amount', weight: 25, active: fraudSignals.unusualAmount },
                  { key: 'otpRetries', label: 'OTP Retries', weight: 15, active: fraudSignals.otpRetries },
                  { key: 'firstTimeInvest', label: 'First-Time Invest', weight: 15, active: fraudSignals.firstTimeInvest },
                  { key: 'abnormalBehavior', label: 'Abnormal Behavior', weight: 15, active: fraudSignals.abnormalBehavior },
                ].map((s) => (
                  <div key={s.key} className={`p-3 rounded-lg border text-center transition-all duration-500 ${s.active ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                    <i className={`fas fa-circle text-[8px] ${s.active ? 'text-rose-500 animate-pulse' : 'text-slate-300'}`} />
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">{s.label}</p>
                    <p className="text-[10px] text-slate-400">Weight: {s.weight}%</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <p className="text-xs text-slate-500">Protection Score</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-white">{calculateProtectionScore(fraudSignals)}/100</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Decision</p>
                  <span className={`inline-block px-4 py-1.5 text-xs font-bold rounded-full ${calculateProtectionScore(fraudSignals) >= 80 ? 'bg-rose-500 text-white' : calculateProtectionScore(fraudSignals) >= 60 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {calculateProtectionScore(fraudSignals) >= 80 ? 'BLOCK' : calculateProtectionScore(fraudSignals) >= 60 ? 'WARN' : 'ALLOW'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fraud Modal */}
        {showFraudModal && fraudDecision && (
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-auto" onClick={() => setShowFraudModal(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <ProtectionModal decision={fraudDecision} onProceed={() => setShowFraudModal(false)} onCancel={() => setShowFraudModal(false)} />
            </div>
          </div>
        )}

        {/* Scam Call Overlay */}
        {showScam && (
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-auto animate-fade-in" onClick={() => setShowScam(false)}>
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="bg-rose-500 p-6 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <i className="fas fa-phone-volume text-3xl" />
                </div>
                <p className="text-sm font-medium">Incoming Call</p>
                <h3 className="text-2xl font-bold mt-1">+91 98452 110XX</h3>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                  <i className="fas fa-triangle-exclamation" /> SCAM LIKELY
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-800">
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-medium"><i className="fas fa-shield-halved mr-1" />This number has been reported 234 times for fraud.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setShowScam(false)} className="py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors">
                    <i className="fas fa-phone-slash mr-1" />Decline
                  </button>
                  <button onClick={() => setShowScam(false)} className="py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                    <i className="fas fa-flag mr-1" />Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INCLUSIVE & BUSINESS MODES */}
        {scene.id === 'inclusive' && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 pointer-events-auto">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-users text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Inclusive & Business Modes</h3>
                  <p className="text-xs text-slate-500">Designed for every Indian — from farmers to NRIs to SMEs</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { mode: 'NRI Mode', desc: 'Dual currency, FEMA compliance, remittance tracking', icon: 'fa-globe', color: 'from-blue-500 to-indigo-500' },
                  { mode: 'Senior Mode', desc: 'Voice narration, large fonts, simplified UI, scam alerts', icon: 'fa-person-cane', color: 'from-amber-500 to-orange-500' },
                  { mode: 'Kids Mode', desc: 'Smart piggy bank, chore rewards, spend requests', icon: 'fa-child', color: 'from-pink-500 to-rose-500' },
                  { mode: 'Family View', desc: 'Household net worth, data sharing controls', icon: 'fa-people-group', color: 'from-emerald-500 to-teal-500' },
                  { mode: 'Business / SME', desc: 'Cash flow, surplus optimizer, treasury options', icon: 'fa-building', color: 'from-cyan-500 to-blue-500' },
                  { mode: 'Accessibility', desc: 'Screen reader support, high contrast, keyboard nav', icon: 'fa-universal-access', color: 'from-violet-500 to-purple-500' },
                ].map((m) => (
                  <div key={m.mode} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mx-auto mb-2`}>
                      <i className={`fas ${m.icon} text-white text-sm`} />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{m.mode}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ARCHITECTURE */}
        {scene.id === 'architecture' && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 pointer-events-auto">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center">
                  <i className="fas fa-sitemap text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">System Architecture</h3>
                  <p className="text-xs text-slate-500">Cloud-native · Microservices · RBI compliant</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { name: 'React 18', icon: 'fa-react', color: 'from-cyan-400 to-blue-500' },
                  { name: 'TypeScript', icon: 'fa-code', color: 'from-blue-400 to-indigo-500' },
                  { name: 'Python AI', icon: 'fa-python', color: 'from-yellow-400 to-blue-500' },
                  { name: 'PostgreSQL', icon: 'fa-database', color: 'from-emerald-400 to-teal-500' },
                ].map((tech) => (
                  <div key={tech.name} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tech.color} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                      <i className={`fab ${tech.icon} text-white text-lg`} />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{tech.name}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex flex-wrap gap-2 justify-center">
                  {['RBI Account Aggregator', 'KYC Registry', 'UPI Integration', 'AI/ML Pipeline', 'Redis Cache', 'JWT Auth', 'Recharts'].map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-full border border-slate-200 dark:border-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OUTRO */}
        {scene.id === 'outro' && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center text-white animate-fade-in max-w-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20">
                <i className="fas fa-shield-halved text-white text-4xl" />
              </div>
              <h1 className="text-5xl font-extrabold mb-3">Thank You</h1>
              <p className="text-xl text-slate-300 mb-8">SecureWealth Twin — PSB Hackathon Series 2026</p>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-400 mb-6">
                <span className="px-3 py-1.5 bg-white/10 rounded-full"><i className="fas fa-globe mr-2" />securewealth-twin.surge.sh</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-xs">
                <span className="px-3 py-1 bg-white/10 rounded-full text-white/80">React 18</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-white/80">TypeScript</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-white/80">Tailwind CSS</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-white/80">Zustand</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Caption area */}
      <div className="relative bg-black/60 backdrop-blur-md border-t border-white/10 pointer-events-auto">
        <div className="max-w-3xl mx-auto px-6 py-4 text-center">
          {scene.id === 'intro' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-1">{scene.caption}</h2>
              <p className="text-sm text-white/70">{scene.subCaption}</p>
            </div>
          )}
          {scene.id === 'outro' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-1">{scene.caption}</h2>
              <p className="text-sm text-white/70">{scene.subCaption}</p>
            </div>
          )}
          {scene.id !== 'intro' && scene.id !== 'outro' && (
            <div className="animate-fade-in">
              <h3 className="text-base font-bold text-white mb-1">{scene.caption}</h3>
              <p className="text-sm text-white/60">{scene.subCaption}</p>
            </div>
          )}
        </div>

        {/* Progress bars */}
        <div className="px-6 pb-4">
          {/* Overall progress */}
          <div className="w-full bg-white/10 rounded-full h-1.5 mb-2 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-400 to-primary h-full rounded-full transition-all duration-100" style={{ width: `${progressPercent}%` }} />
          </div>
          {/* Scene progress */}
          <div className="w-full bg-white/5 rounded-full h-0.5 overflow-hidden">
            <div className="bg-white/40 h-full rounded-full transition-all duration-100" style={{ width: `${sceneProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-4 text-[10px] text-white/30">
        <span><kbd className="px-1 py-0.5 bg-white/5 rounded text-white/40 font-mono">Space</kbd> Pause</span>
        <span><kbd className="px-1 py-0.5 bg-white/5 rounded text-white/40 font-mono">→</kbd> Skip</span>
        <span><kbd className="px-1 py-0.5 bg-white/5 rounded text-white/40 font-mono">R</kbd> Restart</span>
        <span><kbd className="px-1 py-0.5 bg-white/5 rounded text-white/40 font-mono">Esc</kbd> Exit</span>
      </div>
    </div>
  );
}

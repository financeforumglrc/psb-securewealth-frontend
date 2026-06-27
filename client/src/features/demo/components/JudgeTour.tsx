import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, X, Pause, Route } from 'lucide-react';
import { useWealthStore } from '@/shared/store/wealthStore';

interface TourStep {
  id: string;
  tab: string;
  title: string;
  description: string;
  highlight: string;
  details: string[];
  tip?: string;
  delay?: number;
}

const steps: TourStep[] = [
  {
    id: 'dashboard', tab: 'dashboard', title: 'PSB SecureWealth Admin',
    description: 'Enterprise fraud intelligence platform for Punjab & Sind Bank. Seven integrated modules for complete wealth management security.',
    highlight: 'System Overview',
    details: [
      'Live monitoring across 50,000+ accounts with real-time risk scoring',
      'Zero-trust architecture with post-quantum ML-KEM-768 encryption',
      'AI-powered fraud detection achieving 99.7% accuracy rate',
      'Full RBI compliance with immutable audit trails and 7-year retention',
    ],
    tip: 'All tabs are accessible from the sidebar on the left.',
  },
  {
    id: 'dashboard', tab: 'dashboard', title: 'Intelligence Dashboard',
    description: 'Key metrics showing platform health, user growth, and fraud prevention effectiveness at a glance.',
    highlight: 'Control Center',
    details: [
      'Total Users: Track adoption across Free, Premium, and Enterprise tiers',
      'Face Registered: Biometric authentication rate — key security metric',
      'Active Today: Real-time daily active user engagement',
      'Accounts + Transactions: Total managed wealth and transaction volume',
      'Tier Distribution Chart: See your user base composition',
    ],
    tip: 'Hover over charts for detailed data points.',
  },
  {
    id: 'users', tab: 'users', title: 'Account Holder Intelligence',
    description: 'Every user has a real-time Safety Score (0-100) computed from 8+ risk factors — KYC status, device trust, behavior patterns, and more.',
    highlight: 'Account Holders',
    details: [
      'Safety Score: AI-computed from KYC completeness, device attestation, behavior patterns',
      'Color-coded risk levels: Safe (green), Caution (amber), At-Risk (red)',
      'Sort by name, email, tier, registration date, or risk level',
      'Click any user to see detailed risk assessment with explainable factors',
    ],
    tip: 'Users with incomplete KYC or unusual behavior patterns are flagged automatically.',
  },
  {
    id: 'security', tab: 'security', title: 'Security Operations Center (SOC)',
    description: 'Centralized security hub with 8 layers of protection — from biometric auth to quantum-resistant encryption and decoy traps.',
    highlight: 'Security Ops',
    details: [
      'Trust Score gauge: Real-time platform security health (0-100)',
      'FIDO2 Passkey: Phishing-resistant biometric authentication',
      'Post-Quantum Tunnel: ML-KEM-768 key encapsulation + AES-GCM encryption',
      'Trap Account: Decoy account that auto-freezes and alerts on any access',
      'Honeytoken System: Fake credentials that trigger alerts when used',
      'eBPF Monitor: Real-time browser-level threat detection',
    ],
    tip: 'Toggle security features on/off to see real-time Trust Score changes.',
  },
  {
    id: 'logs', tab: 'logs', title: 'Regulatory Compliance & Audit',
    description: 'Complete audit trail meeting RBI guidelines — every login, transaction, and admin action is logged with forensic data.',
    highlight: 'Audit Logs',
    details: [
      'Every event logged: user, timestamp, action, IP, device fingerprint, outcome',
      'IP geolocation enrichment: city, country, and ISP for every access',
      'Searchable by user, action type, event category, and status',
      'Exportable for regulatory reporting and compliance audits',
    ],
    tip: 'Use the event type filter to quickly isolate security-related events.',
  },
  {
    id: 'heatmap', tab: 'heatmap', title: 'Global Fraud Intelligence',
    description: 'Live world map showing fraud attempts and security events in real-time with IP geolocation and risk scoring.',
    highlight: 'Fraud Map',
    details: [
      'Interactive map with fraud event markers — zoom, pan, and click for details',
      'Color-coded by severity: Critical (red), Suspicious (amber), Monitor (green)',
      'Auto-refreshes every 30 seconds — countdown timer visible on map',
      'Recent events sidebar with one-click detail view',
      'Risk score from 0-100 based on multiple threat factors',
    ],
    tip: 'Click any marker on the map or event in the sidebar for full details.',
  },
  {
    id: 'health', tab: 'health', title: 'System Health & Observability',
    description: 'Real-time platform health monitoring with API status, database health, security posture, and active incident counts.',
    highlight: 'System Health',
    details: [
      'Live API latency and database health checks every 30 seconds',
      'Trust score gauge and active protection layer status',
      'Open incident summary pulled from the live alert feed',
      'Service metrics showing users, accounts, transactions, goals, and loans',
    ],
    tip: 'Press 9 to jump straight to System Health from anywhere in the admin portal.',
  },
  {
    id: 'dashboard', tab: 'dashboard', title: 'Tour Complete',
    description: 'PSB SecureWealth — Intelligent Wealth Growth with Built-in Fraud Protection. Built for the PSB Hackathon Series 2026.',
    highlight: 'Thank You',
    details: [
      'Wealth Intelligence: AI-powered financial insights and personalised recommendations',
      'Wealth Protection: Multi-layer fraud prevention with zero-trust architecture',
      'Regulatory Compliance: Full RBI-aligned audit trail and KYC/AML compliance',
      'Enterprise Architecture: Scalable, secure, and observable platform design',
      'Team Excellent Minds — Redefining Banking Security',
    ],
  },
];

interface DemoTourProps {
  onNavigate: (tab: string) => void;
}

export default function JudgeTour({ onNavigate }: DemoTourProps) {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('sw-judge-tour-dismissed') === 'true');
  const setView = useWealthStore((s) => s.setView);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  const close = useCallback(() => {
    setActive(false);
    setShowToast(false);
    setAutoPlaying(false);
    if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    setCurrentStep(0);
  }, []);

  const markDismissed = useCallback(() => {
    localStorage.setItem('sw-judge-tour-dismissed', 'true');
    setDismissed(true);
  }, []);

  const startTour = useCallback(() => {
    setActive(true);
    setCurrentStep(0);
    setShowToast(true);
    setPaused(false);
    setAutoPlaying(true);
    onNavigate(steps[0].tab);
  }, [onNavigate]);

  const goTo = useCallback((idx: number) => {
    const s = steps[idx];
    setCurrentStep(idx);
    if (s.tab) {
      onNavigate(s.tab);
      setView(s.tab as any);
    }

    const tabTriggers: Record<string, string> = {
      neuro: 'Neuro-Friction',
      monte: 'Monte Carlo',
      immune: 'Collective Immune',
      agent: 'Auto Agent',
      vault: 'Sovereign Vault',
    };
    if (tabTriggers[s.id]) {
      setTimeout(() => {
        const btns = document.querySelectorAll('button');
        const btn = Array.from(btns).find((b) => b.textContent?.includes(tabTriggers[s.id]));
        btn?.click();
      }, 600);
    }
  }, [onNavigate, setView]);

  const next = useCallback(() => {
    if (currentStep < steps.length - 1) goTo(currentStep + 1);
    else close();
  }, [currentStep, goTo, close]);

  const prev = useCallback(() => {
    if (currentStep > 0) goTo(currentStep - 1);
  }, [currentStep, goTo]);

  const togglePause = () => {
    setPaused((p) => !p);
  };

  // Auto-advance with pause/resume and hover pause
  useEffect(() => {
    if (!active || !autoPlaying || paused || hovered) {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
      return;
    }
    const delay = step?.delay || 4000;
    autoPlayRef.current = setTimeout(() => {
      if (currentStep < steps.length - 1) next();
      else { setAutoPlaying(false); close(); }
    }, delay);
    return () => { if (autoPlayRef.current) clearTimeout(autoPlayRef.current); };
  }, [active, autoPlaying, paused, hovered, currentStep, step, next, close]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      if (e.key.toLowerCase() === 'p') { e.preventDefault(); togglePause(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, close, next, prev]);

  // Replay tour listener from Sidebar / Profile
  useEffect(() => {
    const handler = () => {
      localStorage.removeItem('sw-judge-tour-dismissed');
      setDismissed(false);
      startTour();
    };
    window.addEventListener('sw-replay-judge-tour' as any, handler);
    return () => window.removeEventListener('sw-replay-judge-tour' as any, handler);
  }, [startTour]);

  if (!active && !dismissed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fixed bottom-28 right-5 z-[60] flex items-center gap-2"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startTour}
          className="pl-4 pr-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl shadow-lg shadow-primary/25 flex items-center gap-2.5 font-bold text-xs hover:shadow-xl transition-shadow"
        >
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
            <Play className="w-3 h-3 fill-current" />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold leading-tight">Judge Demo Tour</p>
            <p className="text-[10px] text-white/70">60-second walkthrough</p>
          </div>
        </motion.button>
        <button
          onClick={markDismissed}
          aria-label="Dismiss demo tour prompt"
          className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-500 shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    );
  }

  return (
    <>
      {/* Floating Resume Button (when dismissed) */}
      {!active && dismissed && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startTour}
          className="fixed bottom-28 right-5 z-[60] w-12 h-12 bg-white dark:bg-slate-800 text-primary rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center"
          aria-label="Replay judge tour"
        >
          <Route className="w-5 h-5" />
        </motion.button>
      )}

      {/* Tour Toast */}
      <AnimatePresence>
        {showToast && step && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] w-full max-w-lg px-4"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                  <Route className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{step.title}</h4>
                    <span className="text-[10px] text-slate-400">{currentStep + 1}/{steps.length}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.description}</p>

                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  {/* Progress dots */}
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    {steps.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goTo(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentStep ? 'bg-primary w-4' : idx < currentStep ? 'bg-primary/40' : 'bg-slate-200 dark:bg-slate-600'
                        }`}
                        aria-label={`Go to step ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <button
                        onClick={prev}
                        disabled={isFirst}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium disabled:opacity-40 hover:bg-slate-200 transition-colors flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </button>
                      <button
                        onClick={next}
                        className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
                      >
                        {isLast ? 'Finish' : 'Next'} <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={togglePause}
                        className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${paused || hovered ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                        title={paused ? 'Resume auto-play' : 'Pause auto-play'}
                      >
                        {paused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                      </button>
                      <button
                        onClick={close}
                        className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        End Tour
                      </button>
                    </div>
                  </div>
                  {hovered && autoPlaying && !paused && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-300 mt-2 text-center">Auto-advance paused while hovering</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spotlight overlay during tour */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[65] pointer-events-none"
          >
            <div className="absolute inset-0 bg-slate-900/20 dark:bg-slate-900/40" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

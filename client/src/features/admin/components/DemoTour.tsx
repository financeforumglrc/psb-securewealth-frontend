import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, X, Sparkles, Keyboard, Pause } from 'lucide-react';

interface TourStep {
  tab: string;
  title: string;
  description: string;
  highlight: string;
  details: string[];
  tip?: string;
}

const steps: TourStep[] = [
  {
    tab: 'dashboard', title: 'PSB SecureWealth Admin',
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
    tab: 'dashboard', title: 'Intelligence Dashboard',
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
    tab: 'users', title: 'Account Holder Intelligence',
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
    tab: 'security', title: 'Security Operations Center (SOC)',
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
    tab: 'logs', title: 'Regulatory Compliance & Audit',
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
    tab: 'heatmap', title: 'Global Fraud Intelligence',
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
    tab: 'dashboard', title: 'Tour Complete',
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

export default function DemoTour({ onNavigate }: DemoTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasSeenTour, setHasSeenTour] = useState(() => localStorage.getItem('sw-demo-tour-seen') === 'true');

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  const goTo = useCallback((idx: number) => {
    const s = steps[idx];
    setCurrentStep(idx);
    if (s.tab) onNavigate(s.tab);
  }, [onNavigate]);

  const next = useCallback(() => {
    if (currentStep < steps.length - 1) goTo(currentStep + 1);
    else close();
  }, [currentStep, goTo]);

  const prev = useCallback(() => {
    if (currentStep > 0) goTo(currentStep - 1);
  }, [currentStep, goTo]);

  const start = useCallback(() => {
    setIsOpen(true);
    setCurrentStep(0);
    onNavigate(steps[0].tab);
  }, [onNavigate]);

  const close = useCallback(() => {
    setIsOpen(false);
    setAutoPlaying(false);
    if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    setCurrentStep(0);
    localStorage.setItem('sw-demo-tour-seen', 'true');
    setHasSeenTour(true);
  }, []);

  // Auto-play
  useEffect(() => {
    if (!autoPlaying || !isOpen) return;
    autoPlayRef.current = setTimeout(() => {
      if (currentStep < steps.length - 1) next();
      else { setAutoPlaying(false); close(); }
    }, 4000);
    return () => { if (autoPlayRef.current) clearTimeout(autoPlayRef.current); };
  }, [autoPlaying, currentStep, isOpen, next, close]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, close, next, prev]);

  const toggleAutoPlay = () => {
    if (autoPlaying) {
      setAutoPlaying(false);
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    } else {
      setAutoPlaying(true);
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={start}
        className={`fixed bottom-6 right-6 z-[9998] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-lg hover:scale-105 transition-all ${
          hasSeenTour ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
        }`}
        style={{ boxShadow: hasSeenTour ? '0 4px 24px rgba(0,0,0,0.15)' : '0 4px 24px rgba(5, 150, 105, 0.35)' }}>
        <Play className="w-4 h-4" />
        <span className="text-sm font-bold">{hasSeenTour ? 'Replay Tour' : 'Demo Tour'}</span>
        <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
      </motion.button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-[9997] backdrop-blur-sm"
        onClick={close}
      />

      {/* Highlight ring around active element */}
      <motion.div
        key={`ring-${currentStep}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="fixed z-[9998] pointer-events-none"
        style={{
          top: 0, left: 0, right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #10b981, #34d399, #10b981)',
          boxShadow: '0 0 20px rgba(16,185,129,0.5)',
        }}
      />

      {/* Tour panel */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-2xl px-4"
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
          </div>

          <div className="p-5 sm:p-6">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  STEP {currentStep + 1}/{steps.length}
                </span>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                  {step.highlight}
                </span>
                {autoPlaying && (
                  <span className="text-[10px] text-emerald-500 font-bold animate-pulse">AUTO</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={toggleAutoPlay}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center"
                  title={autoPlaying ? 'Pause auto-play' : 'Auto-play tour'}>
                  {autoPlaying ? <Pause className="w-3.5 h-3.5 text-emerald-500" /> : <Play className="w-3.5 h-3.5 text-slate-400" />}
                </button>
                <button onClick={close}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">{step.title}</h3>
            <p className="text-sm text-slate-500 mb-4">{step.description}</p>

            <ul className="space-y-2 mb-4">
              {step.details.map((d, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-2.5 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  {d}
                </motion.li>
              ))}
            </ul>

            {step.tip && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4">
                <p className="text-[11px] text-amber-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 💡 {step.tip}
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button onClick={prev} disabled={isFirst}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentStep ? 'bg-emerald-500 w-5' : 'bg-slate-300 hover:bg-slate-400 w-2'
                    }`} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {isLast ? (
                  <button onClick={close}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-bold hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-200">
                    <Sparkles className="w-4 h-4" /> Finish
                  </button>
                ) : (
                  <button onClick={next}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Keyboard hint */}
            <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><Keyboard className="w-3 h-3" /> ← → Navigate</span>
              <span className="flex items-center gap-1"><span className="text-xs">Space</span> Next</span>
              <span className="flex items-center gap-1"><span className="text-xs">Esc</span> Exit</span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
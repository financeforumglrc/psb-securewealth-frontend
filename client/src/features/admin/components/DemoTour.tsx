import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';

interface TourStep {
  tab: string;
  title: string;
  description: string;
  highlight: string;
  details: string[];
}

const steps: TourStep[] = [
  {
    tab: 'dashboard', title: 'Welcome to PSB SecureWealth',
    description: 'Enterprise Admin Portal — Real-time fraud intelligence and wealth management platform for Punjab & Sind Bank.',
    highlight: 'Control Center',
    details: [
      'Live system statistics across all modules',
      'AI-powered fraud detection with 99.7% accuracy',
      'Zero-trust security architecture with hardware attestation',
    ],
  },
  {
    tab: 'dashboard', title: 'Dashboard Intelligence',
    description: 'Key metrics at a glance — user growth, face registration adoption, daily active users, and managed accounts.',
    highlight: 'Hero Stats',
    details: [
      'Total Users: Track platform adoption across tiers',
      'Face Registered: Biometric authentication adoption rate',
      'Active Today: Real-time daily engagement metrics',
      'Total Accounts: Managed wealth portfolio size',
    ],
  },
  {
    tab: 'users', title: 'Account Holder Management',
    description: 'Complete user lifecycle management with built-in risk assessment for every account holder.',
    highlight: 'Account Holders Tab',
    details: [
      'Sortable table with KYC status, tier, and risk level',
      'Per-user Safety Score (0-100) with explainable factors',
      'Real-time behavior monitoring and fraud flagging',
      'PAN, Aadhaar, and face registration verification',
    ],
  },
  {
    tab: 'security', title: 'Security Operations Center',
    description: 'Centralized security controls with zero-trust verification and quantum-resistant encryption.',
    highlight: 'Security Ops Tab',
    details: [
      'Trust Score gauge — real-time platform security health',
      'FIDO2 passkey registration for phishing-resistant auth',
      'Post-quantum ML-KEM-768 key encapsulation',
      'Trap Account: Decoy account that auto-freezes on access',
      'Honeytoken: Fake credentials that trigger alerts on use',
    ],
  },
  {
    tab: 'logs', title: 'Compliance Audit Trail',
    description: 'Comprehensive audit logging for RBI compliance with 7-year retention policy.',
    highlight: 'Audit Logs Tab',
    details: [
      'Every login, transaction, and admin action is logged',
      'IP geolocation enrichment with city/country/ISP data',
      'Searchable by user, action, event type, and status',
      'Export capability for regulatory reporting',
    ],
  },
  {
    tab: 'heatmap', title: 'Live Fraud Intelligence Map',
    description: 'Global fraud heatmap with real-time event tracking and IP geolocation.',
    highlight: 'Fraud Map Tab',
    details: [
      'Interactive world map with live fraud event markers',
      'Color-coded risk scoring: Critical (red), Suspicious (amber), Monitor (green)',
      'Auto-refresh every 30 seconds with countdown timer',
      'Recent events sidebar with one-click detail view',
    ],
  },
  {
    tab: 'dashboard', title: 'Presentation Complete',
    description: 'PSB SecureWealth — Built for the PSB Hackathon 2026. Thank you for your attention.',
    highlight: 'Summary',
    details: [
      'Intelligent Wealth Growth with Built-in Fraud Protection',
      'Post-quantum cryptography, zero-trust architecture',
      '95%+ problem statement coverage across all 4 categories',
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

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  const goTo = (idx: number) => {
    const s = steps[idx];
    setCurrentStep(idx);
    if (s.tab) onNavigate(s.tab);
  };

  const start = () => {
    setIsOpen(true);
    setCurrentStep(0);
    onNavigate(steps[0].tab);
  };

  const close = () => {
    setIsOpen(false);
    setCurrentStep(0);
  };

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={start}
          className="fixed bottom-6 right-6 z-[9998] flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg hover:shadow-emerald-200 hover:scale-105 transition-all"
          style={{ boxShadow: '0 4px 24px rgba(5, 150, 105, 0.35)' }}>
          <Play className="w-4 h-4" />
          <span className="text-sm font-bold">Demo Tour</span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
        </motion.button>
      )}

      {/* Tour overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-[9997] backdrop-blur-sm"
              onClick={close}
            />
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

                <div className="p-6">
                  {/* Step indicator */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        STEP {currentStep + 1}/{steps.length}
                      </span>
                      {step.highlight && (
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                          {step.highlight}
                        </span>
                      )}
                    </div>
                    <button onClick={close}
                      className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">{step.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">{step.description}</p>

                  <ul className="space-y-2 mb-5">
                    {step.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button onClick={() => goTo(currentStep - 1)} disabled={isFirst}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <div className="flex items-center gap-1.5">
                      {steps.map((_, i) => (
                        <button key={i} onClick={() => goTo(i)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            i === currentStep ? 'bg-emerald-500 w-4' : 'bg-slate-300 hover:bg-slate-400'
                          }`} />
                      ))}
                    </div>
                    {isLast ? (
                      <button onClick={close}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors">
                        <Sparkles className="w-4 h-4" /> Finish Tour
                      </button>
                    ) : (
                      <button onClick={() => goTo(currentStep + 1)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors">
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
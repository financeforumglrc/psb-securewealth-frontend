import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetView: string;
  action?: () => void;
  delay?: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    title: '1. Dashboard — Your Financial Command Center',
    description: 'Live market prices, net worth tracking, account aggregation, and AI insights all in one place.',
    targetView: 'dashboard',
    delay: 3000,
  },
  {
    id: 'bhavishya',
    title: '2. BHAVISHYA AI — Predictive Life-Cycle Intelligence',
    description: 'India’s first predictive engine that anticipates life events, crises, market moves, and emotional spending before they happen.',
    targetView: 'bhavishya',
    delay: 4000,
  },
  {
    id: 'wealth-twin',
    title: '3. Wealth Twin AI — Explainable Finance',
    description: 'Ask anything in natural language. The AI answers with reasoning chains, evidence cards, formulas, and RBI/SEBI citations.',
    targetView: 'wealth-twin',
    delay: 4000,
  },
  {
    id: 'innovation-lab',
    title: '4. Innovation Lab — 10 World-First Features',
    description: 'Features no Indian bank has ever built: Neuro-Friction Banking, Monte Carlo Simulator, Collective Immune System, Autonomous Agent, Sovereign Vault.',
    targetView: 'innovation-lab',
    delay: 5000,
  },
  {
    id: 'neuro',
    title: '5. Neuro-Friction Banking',
    description: 'Wearable biometrics detect stress and fatigue. The bank introduces intelligent friction to block emotional spending before it happens.',
    targetView: 'innovation-lab',
    delay: 4000,
  },
  {
    id: 'monte',
    title: '6. Monte Carlo Life Simulator',
    description: 'Run 500 simulations of your financial future. See probability cones for every major life decision — buy a house, start a business, take a sabbatical.',
    targetView: 'innovation-lab',
    delay: 4000,
  },
  {
    id: 'immune',
    title: '7. Collective Immune System',
    description: '2.8M+ users anonymously share fraud signals. When 5 people in your city report a scam, you are auto-protected before you even see it.',
    targetView: 'innovation-lab',
    delay: 4000,
  },
  {
    id: 'agent',
    title: '8. Autonomous Financial Agent',
    description: 'Your personal CFO works 24/7 — auto-negotiating credit card fees, hunting highest FD rates, boosting SIPs, and filing claims.',
    targetView: 'innovation-lab',
    delay: 4000,
  },
  {
    id: 'vault',
    title: '9. Sovereign Data Vault',
    description: 'Your financial history never leaves your device. The bank only receives zero-knowledge proofs. Mathematically impossible to reverse-engineer.',
    targetView: 'innovation-lab',
    delay: 4000,
  },
  {
    id: 'protection',
    title: '10. Security & Privacy',
    description: '6-dimension behavioral fraud detection, duress mode, ghost accounts, biometric auth, and RBI-compliant consent management.',
    targetView: 'protection',
    delay: 4000,
  },
  {
    id: 'done',
    title: 'Tour Complete!',
    description: 'This is SecureWealth Twin — banking reimagined for Bharat. Built for PSB Hackathon 2026.',
    targetView: 'dashboard',
    delay: 3000,
  },
];

export default function JudgeTour() {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('sw-judge-tour-dismissed') === '1');
  const setView = useWealthStore((s) => s.setView);

  const dismissTourPrompt = useCallback(() => {
    localStorage.setItem('sw-judge-tour-dismissed', '1');
    setDismissed(true);
  }, []);

  const currentStep = TOUR_STEPS[stepIndex];

  const startTour = useCallback(() => {
    setActive(true);
    setStepIndex(0);
    setShowToast(true);
  }, []);

  const nextStep = useCallback(() => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      const nextIdx = stepIndex + 1;
      setStepIndex(nextIdx);
      const next = TOUR_STEPS[nextIdx];
      setView(next.targetView as any);

      // Auto-advance innovation lab sub-tabs
      if (next.id === 'neuro') {
        setTimeout(() => {
          const btns = document.querySelectorAll('button');
          const neuroBtn = Array.from(btns).find((b) => b.textContent?.includes('Neuro-Friction'));
          neuroBtn?.click();
        }, 600);
      }
      if (next.id === 'monte') {
        setTimeout(() => {
          const btns = document.querySelectorAll('button');
          const monteBtn = Array.from(btns).find((b) => b.textContent?.includes('Monte Carlo'));
          monteBtn?.click();
        }, 600);
      }
      if (next.id === 'immune') {
        setTimeout(() => {
          const btns = document.querySelectorAll('button');
          const immuneBtn = Array.from(btns).find((b) => b.textContent?.includes('Collective Immune'));
          immuneBtn?.click();
        }, 600);
      }
      if (next.id === 'agent') {
        setTimeout(() => {
          const btns = document.querySelectorAll('button');
          const agentBtn = Array.from(btns).find((b) => b.textContent?.includes('Auto Agent'));
          agentBtn?.click();
        }, 600);
      }
      if (next.id === 'vault') {
        setTimeout(() => {
          const btns = document.querySelectorAll('button');
          const vaultBtn = Array.from(btns).find((b) => b.textContent?.includes('Sovereign Vault'));
          vaultBtn?.click();
        }, 600);
      }
    } else {
      setActive(false);
      setShowToast(false);
    }
  }, [stepIndex, setView]);

  const prevStep = useCallback(() => {
    if (stepIndex > 0) {
      const prevIdx = stepIndex - 1;
      setStepIndex(prevIdx);
      setView(TOUR_STEPS[prevIdx].targetView as any);
    }
  }, [stepIndex, setView]);

  const skipTour = useCallback(() => {
    setActive(false);
    setShowToast(false);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (!active) return;
    const delay = currentStep?.delay || 4000;
    const timer = setTimeout(() => {
      if (stepIndex < TOUR_STEPS.length - 1) {
        nextStep();
      } else {
        setActive(false);
        setShowToast(false);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [active, stepIndex, currentStep, nextStep]);

  return (
    <>
      {/* Floating Start Button */}
      {!active && !dismissed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed bottom-5 right-5 z-[60] flex items-center gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startTour}
            className="pl-4 pr-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl shadow-lg shadow-primary/25 flex items-center gap-2.5 font-bold text-xs hover:shadow-xl transition-shadow"
          >
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-play text-[10px]" aria-hidden="true" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold leading-tight">Judge Demo Tour</p>
              <p className="text-[10px] text-white/70">60-second walkthrough</p>
            </div>
          </motion.button>
          <button
            onClick={dismissTourPrompt}
            aria-label="Dismiss demo tour prompt"
            className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-500 shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <i className="fas fa-times text-xs" aria-hidden="true" />
          </button>
        </motion.div>
      )}

      {/* Tour Toast */}
      <AnimatePresence>
        {showToast && currentStep && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] w-full max-w-lg px-4"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                  <i className="fas fa-route text-sm" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{currentStep.title}</h4>
                    <span className="text-[10px] text-slate-400">{stepIndex + 1}/{TOUR_STEPS.length}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{currentStep.description}</p>

                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((stepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <button
                        onClick={prevStep}
                        disabled={stepIndex === 0}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium disabled:opacity-40 hover:bg-slate-200 transition-colors"
                      >
                        <i className="fas fa-arrow-left mr-1" aria-hidden="true" />Prev
                      </button>
                      <button
                        onClick={nextStep}
                        className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                      >
                        {stepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}<i className="fas fa-arrow-right ml-1" aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      onClick={skipTour}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      Skip Tour
                    </button>
                  </div>
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

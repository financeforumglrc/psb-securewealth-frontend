import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Shield, Phone, MessageCircle, Heart, Brain, Clock, Zap } from 'lucide-react';

interface PanicStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  action: string;
}

const PANIC_STEPS: PanicStep[] = [
  {
    id: 1,
    title: 'Stay Calm',
    description: 'Take a deep breath. Panic leads to poor financial decisions.',
    icon: Heart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
    action: 'Breathe in for 4 seconds, hold for 4, breathe out for 4. Repeat 3 times.',
  },
  {
    id: 2,
    title: 'Assess the Situation',
    description: 'Understand what triggered the panic. Is it real or perceived?',
    icon: Brain,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    action: 'Ask yourself: Is this a genuine emergency or a temporary setback?',
  },
  {
    id: 3,
    title: 'Review Your Finances',
    description: 'Check your actual financial position. Don\'t assume the worst.',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    action: 'Open the app and check your net worth, emergency fund, and goals.',
  },
  {
    id: 4,
    title: 'Take Proportionate Action',
    description: 'Make a small, reversible decision. Avoid drastic changes.',
    icon: Zap,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    action: 'If needed, make a small adjustment. Don\'t sell everything or make large transfers.',
  },
  {
    id: 5,
    title: 'Seek Support',
    description: 'Talk to someone you trust or contact support for guidance.',
    icon: Phone,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    action: 'Call RBI helpline 14440 or use live chat support for assistance.',
  },
];

export default function PanicSituationProcess() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [showPanic, setShowPanic] = useState(false);

  const handleNext = () => {
    if (currentStep < PANIC_STEPS.length - 1) {
      setCompleted((prev) => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted((prev) => [...prev, currentStep]);
      setShowPanic(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStart = () => {
    setCurrentStep(0);
    setCompleted([]);
    setShowPanic(true);
  };

  const step = PANIC_STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" /> Panic Situation 5-Step Process
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">A structured process to help you avoid and de-escalate panic situations related to your finances.</p>
      </div>

      {/* Start Button */}
      {!showPanic && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-amber-600 mb-3" />
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">Feeling Financially Overwhelmed?</h3>
          <p className="text-xs text-slate-500 mb-4">Follow our 5-step process to regain control and make calm, rational decisions.</p>
          <button
            onClick={handleStart}
            className="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700"
          >
            Start 5-Step Process
          </button>
        </div>
      )}

      {/* Panic Process */}
      <AnimatePresence>
        {showPanic && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {/* Progress */}
            <div className="flex items-center gap-2">
              {PANIC_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${
                    i < currentStep
                      ? 'bg-emerald-500'
                      : i === currentStep
                      ? 'bg-amber-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Current Step */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-6 rounded-2xl border ${step.bgColor}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl ${step.color.replace('text-', 'bg-')} flex items-center justify-center`}>
                  <StepIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Step {step.id} of 5</p>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">{step.title}</h3>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{step.description}</p>

              <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Action:</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{step.action}</p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold disabled:opacity-40"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {completed.includes(currentStep) ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-500" />
                  )}
                  <span className="text-xs text-slate-500">
                    {completed.includes(currentStep) ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-bold hover:bg-amber-700"
                >
                  {currentStep === PANIC_STEPS.length - 1 ? 'Complete' : 'Next'}
                </button>
              </div>
            </motion.div>

            {/* Emergency Contacts */}
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
              <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300 mb-2">Emergency Contacts</h4>
              <div className="grid grid-cols-2 gap-2">
                <a href="tel:14440" className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 text-center">
                  <Phone className="w-4 h-4 text-rose-600 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-800 dark:text-white">RBI Helpline</p>
                  <p className="text-sm font-black text-rose-600">14440</p>
                </a>
                <button className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 text-center">
                  <MessageCircle className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Live Chat</p>
                  <p className="text-sm font-black text-indigo-600">Support</p>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completed State */}
      {!showPanic && completed.length === PANIC_STEPS.length && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-center"
        >
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">Well Done!</h3>
          <p className="text-xs text-slate-500 mb-4">You've completed the 5-step panic de-escalation process. You're now in a better position to make rational financial decisions.</p>
          <button
            onClick={handleStart}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700"
          >
            Start Again
          </button>
        </motion.div>
      )}
    </div>
  );
}

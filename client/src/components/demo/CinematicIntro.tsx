import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, ChevronRight } from 'lucide-react';

const TAGLINES = [
  'Banking that protects you before you know you are under attack.',
  'A self-healing, self-protecting wealth twin for every Indian.',
  'Account Aggregation × AI × Behavioral Biometrics × Blockchain Audit.',
  'The revolution in public-sector banking starts now.',
];

export default function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    if (skipped) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return p + 2;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [onComplete, skipped]);

  useEffect(() => {
    if (skipped) return;
    const t = setInterval(() => {
      setStep((s) => (s + 1) % TAGLINES.length);
    }, 2200);
    return () => clearInterval(t);
  }, [skipped]);

  const finish = () => {
    setSkipped(true);
    onComplete();
  };

  return (
    <AnimatePresence>
      {!skipped && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center px-6 text-center overflow-hidden"
        >
          {/* Animated aurora background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ x: [-100, 100, -100], y: [-50, 50, -50], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[140px]"
            />
            <motion.div
              animate={{ x: [100, -100, 100], y: [50, -50, 50], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[120px]"
            />
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 mb-8"
          >
            <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-2xl shadow-cyan-500/30">
              <Shield className="w-14 h-14 text-white" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-3xl border-2 border-dashed border-white/20"
              />
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 text-5xl sm:text-7xl font-black tracking-tight mb-4"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent">
              SecureWealth Twin
            </span>
          </motion.h1>

          <div className="relative z-10 h-16 max-w-2xl mx-auto flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-lg sm:text-xl text-slate-400"
              >
                <Sparkles className="w-4 h-4 inline-block mr-2 text-cyan-400" />
                {TAGLINES[step]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="relative z-10 mt-12 w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={finish}
            className="relative z-10 mt-10 flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500/50 transition-colors text-sm font-bold"
          >
            Skip Intro <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

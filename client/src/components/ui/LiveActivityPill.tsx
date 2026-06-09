import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Activity {
  id: string;
  icon: string;
  color: string;
  bg: string;
  text: string;
  source: string;
}

const ACTIVITIES: Activity[] = [
  { id: '1', icon: 'fa-shield-halved', color: 'text-emerald-500', bg: 'bg-emerald-500', text: 'Blocked ₹50K fraud attempt from unknown device', source: 'Security Engine' },
  { id: '2', icon: 'fa-robot', color: 'text-violet-500', bg: 'bg-violet-500', text: 'Auto-negotiated HDFC credit card fee — saved ₹3,500', source: 'Auto Agent' },
  { id: '3', icon: 'fa-chart-line', color: 'text-blue-500', bg: 'bg-blue-500', text: 'NIFTY crossed 25,000 — portfolio up 2.4%', source: 'Market Intelligence' },
  { id: '4', icon: 'fa-heart-pulse', color: 'text-rose-500', bg: 'bg-rose-500', text: 'Stress detected at 78% — delayed ₹24,999 Amazon order', source: 'Neuro-Friction' },
  { id: '5', icon: 'fa-users', color: 'text-amber-500', bg: 'bg-amber-500', text: 'Collective Immune protected 847 users from UPI scam', source: 'Community Defense' },
  { id: '6', icon: 'fa-piggy-bank', color: 'text-emerald-500', bg: 'bg-emerald-500', text: 'Found IDFC First FD @ 8.1% — moved ₹45,000', source: 'Auto Agent' },
  { id: '7', icon: 'fa-brain', color: 'text-primary', bg: 'bg-primary', text: 'New insight: Increase SIP by ₹2,000 to reach goal 8 months early', source: 'Wealth Twin AI' },
  { id: '8', icon: 'fa-vault', color: 'text-amber-500', bg: 'bg-amber-500', text: 'Zero-knowledge proof generated for premium card eligibility', source: 'Sovereign Vault' },
];

export default function LiveActivityPill() {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % ACTIVITIES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = ACTIVITIES[index];

  return (
    <>
      {/* Floating Pill */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 left-6 z-[55] hidden md:flex items-center"
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-100 dark:border-slate-700 hover:shadow-2xl transition-shadow group"
        >
          <div className="relative">
            <div className={`w-2.5 h-2.5 rounded-full ${current.bg} animate-pulse`} />
            <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${current.bg} animate-ping opacity-40`} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <i className={`fas ${current.icon} ${current.color} text-xs`} />
              <span className="text-xs text-slate-700 dark:text-slate-200 font-medium max-w-[280px] truncate">
                {current.text}
              </span>
            </motion.div>
          </AnimatePresence>
          <i className={`fas fa-chevron-up text-[10px] text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {/* Expanded Activity Log */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95 }}
              className="absolute bottom-full mb-2 left-0 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-800 dark:text-white">Live Activity Feed</p>
                <p className="text-[10px] text-slate-400">Real-time system intelligence</p>
              </div>
              <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                {ACTIVITIES.map((a, i) => (
                  <div
                    key={a.id}
                    className={`flex items-start gap-2 p-2 rounded-lg transition-colors ${
                      i === index ? 'bg-primary/5 border border-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className={`w-6 h-6 ${a.bg}/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <i className={`fas ${a.icon} ${a.color} text-[9px]`} />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-snug">{a.text}</p>
                      <p className="text-[9px] text-slate-400">{a.source}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

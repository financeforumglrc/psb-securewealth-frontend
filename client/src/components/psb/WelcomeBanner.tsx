import { motion } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';

export default function WelcomeBanner() {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const familyMode = useWealthStore((s) => s.familyMode);
  const user = useWealthStore((s) => s.user);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-xl bg-primary text-white p-6 mb-5"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-dark" />
      
      {/* Floating circles for depth */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/8 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
      
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="psb-pattern-banner" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="1" fill="white"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#psb-pattern-banner)" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="max-w-2xl">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[11px] text-white/50 font-medium mb-2 tracking-widest uppercase"
            >
              {today}
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-2xl font-extrabold tracking-tight"
            >
              {greeting()}{familyMode ? ', Family' : `, ${user.name}`}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-sm text-white/60 mt-2 max-w-lg leading-relaxed"
            >
              Your deposits are secured with DICGC insurance up to ₹5,00,000. 
              RBI Licensed Bank since 1908.
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="hidden sm:flex flex-col gap-2"
          >
            <span className="px-3 py-1.5 bg-white/10 rounded-lg text-[11px] font-bold border border-white/10 backdrop-blur-md flex items-center gap-2">
              <i className="fas fa-shield-check text-secondary" /> DICGC Insured
            </span>
            <span className="px-3 py-1.5 bg-white/10 rounded-lg text-[11px] font-bold border border-white/10 backdrop-blur-md flex items-center gap-2">
              <i className="fas fa-building-columns text-secondary" /> RBI Licensed
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

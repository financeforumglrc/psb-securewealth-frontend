import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';

const LIMIT = 150000;

const SUGGESTIONS = [
  { name: 'ELSS Mutual Fund', risk: 'high', return: '12% avg', lockIn: '3 yrs', icon: 'fa-chart-line' },
  { name: 'PPF', risk: 'low', return: '7.1%', lockIn: '15 yrs', icon: 'fa-landmark' },
  { name: 'Tax Saver FD', risk: 'low', return: '7.5%', lockIn: '5 yrs', icon: 'fa-lock' },
  { name: 'NPS Tier-I', risk: 'medium', return: '9% avg', lockIn: 'Till 60', icon: 'fa-user-clock' },
  { name: 'LIC / Term Plan', risk: 'low', return: 'N/A', lockIn: 'N/A', icon: 'fa-shield-heart' },
  { name: 'Sukanya Samriddhi', risk: 'low', return: '8.2%', lockIn: '21 yrs', icon: 'fa-child' },
];

export default function Section80CTracker() {
  const [invested, setInvested] = useState(125000);
  const riskProfile = useWealthStore((s) => s.user.riskProfile) || 'balanced';
  const remaining = Math.max(0, LIMIT - invested);
  const pct = Math.min(100, (invested / LIMIT) * 100);

  const normalized = riskProfile.toLowerCase();
  const filtered = SUGGESTIONS.filter((s) => {
    if (normalized === 'conservative') return s.risk === 'low';
    if (normalized === 'aggressive') return s.risk !== 'low';
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Section 80C Utilization</h4>
          <span className="text-xs font-black text-primary">₹{invested.toLocaleString('en-IN')} / ₹{LIMIT.toLocaleString('en-IN')}</span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full ${pct >= 100 ? 'bg-emerald-500' : pct >= 75 ? 'bg-primary' : 'bg-amber-500'}`}
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          {remaining > 0
            ? `You can still invest ₹${remaining.toLocaleString('en-IN')} more to fully utilise 80C and save ~₹${Math.round(remaining * 0.3).toLocaleString('en-IN')} in tax (30% bracket).`
            : 'Great job! You have fully utilised your 80C limit.'}
        </p>
        <div className="mt-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Adjust invested amount</label>
          <input
            type="range"
            min={0}
            max={LIMIT}
            step={5000}
            value={invested}
            onChange={(e) => setInvested(Number(e.target.value))}
            className="w-full accent-primary mt-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <i className="fas fa-wand-magic-sparkles text-primary" /> Suggested for your {riskProfile} profile
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <i className={`fas ${s.icon} text-xs`} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-white">{s.name}</p>
                <p className="text-[10px] text-slate-500">Risk: <span className="font-bold capitalize">{s.risk}</span> • Return: {s.return}</p>
                <p className="text-[10px] text-slate-500">Lock-in: {s.lockIn}</p>
              </div>
              <button className="px-2 py-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[9px] font-bold rounded-md hover:opacity-90">
                Invest
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

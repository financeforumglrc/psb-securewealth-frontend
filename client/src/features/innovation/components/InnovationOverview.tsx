import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FeatureCard {
  key: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  desc: string;
  stat: string;
  statLabel: string;
  badge?: string;
}

const FEATURES: FeatureCard[] = [
  { key: 'neuro', label: 'Neuro-Friction', icon: 'fa-heart-pulse', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', desc: 'Wearable biometrics block emotional spending before it happens', stat: '₹2,849', statLabel: 'saved this month', badge: 'WORLD FIRST' },
  { key: 'monte', label: 'Monte Carlo Simulator', icon: 'fa-dice', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', desc: '10,000 simulated futures for every major life decision', stat: '500', statLabel: 'simulations/sec', badge: 'WORLD FIRST' },
  { key: 'immune', label: 'Collective Immune', icon: 'fa-shield-virus', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', desc: '2.8M users anonymously defend each other from fraud in real-time', stat: '2.8M+', statLabel: 'immune users', badge: 'WORLD FIRST' },
  { key: 'agent', label: 'Auto Agent', icon: 'fa-robot', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', desc: 'Personal CFO that auto-negotiates, switches, and optimizes 24/7', stat: '₹6,725', statLabel: 'saved this month', badge: 'WORLD FIRST' },
  { key: 'vault', label: 'Sovereign Vault', icon: 'fa-vault', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', desc: 'Zero-knowledge proofs — your data never leaves your device', stat: '67%', statLabel: 'data stays local', badge: 'WORLD FIRST' },
  { key: 'insurance', label: 'Parametric Insurance', icon: 'fa-bolt', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', desc: 'Auto-payouts when flights are delayed, rain falls, or markets drop', stat: '< 5 min', statLabel: 'claim settlement', badge: 'BETA' },
  { key: 'ghost', label: 'Ghost Mode', icon: 'fa-ghost', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', desc: 'Hidden decoy accounts and silent duress detection', stat: '3 layers', statLabel: 'of deception', badge: 'BETA' },
  { key: 'dms', label: "Dead Man's Switch", icon: 'fa-hourglass-half', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', desc: 'Auto-transfer wealth to heirs if you go offline for 30 days', stat: '30 days', statLabel: 'inactivity trigger', badge: 'BETA' },
  { key: 'gig', label: 'Income Smoother', icon: 'fa-wave-square', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20', desc: 'Turn irregular freelance income into a steady monthly salary', stat: '±3%', statLabel: 'monthly variance', badge: 'BETA' },
  { key: 'loan', label: 'Social Loans', icon: 'fa-people-group', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', desc: 'Borrow from your community using social reputation as collateral', stat: '0% interest', statLabel: 'for trusted circles', badge: 'BETA' },
];

function AnimatedCounter({ target, prefix = '', suffix = '' }: { target: string; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState('0');
  const num = parseFloat(target.replace(/[^0-9.]/g, ''));
  const isNum = !isNaN(num);

  useEffect(() => {
    if (!isNum) { setDisplay(target); return; }
    const duration = 1500;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * num);
      setDisplay(current.toLocaleString());
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, isNum, num]);

  return <span>{prefix}{display}{suffix}</span>;
}

export default function InnovationOverview({ onSelect }: { onSelect: (key: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary-dark p-6 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/20 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-amber-400 text-slate-900 text-[9px] font-extrabold rounded-full uppercase tracking-wider">PSB Hackathon 2026</span>
            <span className="text-[9px] text-white/50">SecureWealth Twin</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">
            10 Features <span className="text-amber-400">No Bank Has Ever Built</span>
          </h2>
          <p className="text-sm text-white/70 max-w-xl">
            From neuro-biometric spending guards to community fraud immune systems — every feature 
            below is a world-first in Indian banking. Click any card to experience it.
          </p>
          <div className="flex flex-wrap gap-4 mt-5">
            {[
              { value: '10', label: 'World-Firsts', icon: 'fa-globe' },
              { value: '5', label: 'Patent-Pending', icon: 'fa-certificate' },
              { value: '2.8M+', label: 'Users Protected', icon: 'fa-users' },
              { value: '₹6,725', label: 'Agent Savings', icon: 'fa-piggy-bank' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <i className={`fas ${s.icon} text-xs text-amber-400`} />
                </div>
                <div>
                  <p className="text-sm font-extrabold"><AnimatedCounter target={s.value} /></p>
                  <p className="text-[9px] text-white/50">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            onMouseEnter={() => setHovered(f.key)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(f.key)}
            className="cursor-pointer group"
          >
            <div className={`relative h-full p-4 rounded-2xl border transition-all duration-300 ${
              hovered === f.key
                ? 'border-primary/30 shadow-lg shadow-primary/10 -translate-y-1 bg-white dark:bg-slate-800'
                : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50'
            }`}>
              {f.badge === 'WORLD FIRST' && (
                <span className="absolute top-3 right-3 text-[8px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-extrabold">
                  {f.badge}
                </span>
              )}
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center ${f.color} mb-3 transition-transform duration-300 group-hover:scale-110`}>
                <i className={`fas ${f.icon} text-lg`} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">{f.label}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{f.desc}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg font-extrabold text-slate-800 dark:text-white">{f.stat}</p>
                  <p className="text-[9px] text-slate-400">{f.statLabel}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                  <i className="fas fa-arrow-right text-xs" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Innovation Pipeline */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <i className="fas fa-rocket text-primary text-sm" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Innovation Pipeline</h3>
        </div>
        <div className="space-y-3">
          {[
            { stage: 'Live', items: ['Neuro-Friction Banking', 'Monte Carlo Simulator', 'Collective Immune System', 'Autonomous Agent', 'Sovereign Data Vault'] },
            { stage: 'Beta', items: ['Parametric Insurance', 'Ghost Mode', "Dead Man's Switch", 'Income Smoother', 'Social Loans'] },
            { stage: 'Research', items: ['Quantum-Resistant Vaults', 'Brain-Computer Payment Interfaces', 'AI-Generated Financial Instruments'] },
          ].map((section) => (
            <div key={section.stage} className="flex items-start gap-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 mt-0.5 ${
                section.stage === 'Live' ? 'bg-emerald-100 text-emerald-700' :
                section.stage === 'Beta' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>{section.stage}</span>
              <div className="flex flex-wrap gap-2">
                {section.items.map((item) => (
                  <span key={item} className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-2.5 py-1 rounded-lg">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Shield, Sparkles, Zap } from 'lucide-react';
import { useWealthStore } from '@/shared/store/wealthStore';

function formatCurrency(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let startTime: number;
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return <span>{formatCurrency(display)}</span>;
}

function Sparkline({ data, color = '#6366f1' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" className="w-full h-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,100 ${points} 100,100`} fill="url(#sparkGrad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ParticleField() {
  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/10"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export default function DashboardHero() {
  const user = useWealthStore((s) => s.user);
  const assets = useWealthStore((s) => s.assets);
  const goals = useWealthStore((s) => s.goals);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const netWorth = assets.reduce((sum, a) => sum + a.value, 0);
  const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount).length;
  const savingsRate = user.monthlyIncome > 0 ? (user.monthlySavings / user.monthlyIncome) * 100 : 0;

  const wealthTrend = useMemo(() => {
    const base = netWorth * 0.7;
    return Array.from({ length: 12 }, (_, i) => base + (netWorth - base) * (i / 11) + Math.sin(i * 0.5) * netWorth * 0.05);
  }, [netWorth]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8"
    >
      {/* Animated Background */}
      <ParticleField />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-indigo-900/20" />

      {/* Glow Orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] text-white/60 uppercase tracking-wider font-bold">SecureWealth Twin</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">Wealth Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Protected
              </span>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Net Worth Card */}
          <motion.div
            style={{ transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)` }}
            className="p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-indigo-400/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/60 uppercase font-bold">Total Net Worth</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-white mb-2">
              <AnimatedCounter value={netWorth} />
            </p>
            <div className="h-16">
              <Sparkline data={wealthTrend} color="#10b981" />
            </div>
            <p className="text-[10px] text-emerald-400 mt-1">+12.4% this year</p>
          </motion.div>

          {/* Savings Rate Card */}
          <motion.div
            style={{ transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)` }}
            className="p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-amber-400/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/60 uppercase font-bold">Savings Rate</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-white mb-2">{savingsRate.toFixed(1)}%</p>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(savingsRate * 2, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[10px] text-white/60 mt-1">{savingsRate >= 20 ? 'Excellent!' : savingsRate >= 10 ? 'Good' : 'Needs improvement'}</p>
          </motion.div>

          {/* Goals Card */}
          <motion.div
            style={{ transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)` }}
            className="p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-violet-400/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/60 uppercase font-bold">Active Goals</span>
              <TrendingDown className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-3xl font-black text-white mb-2">{activeGoals}</p>
            <div className="flex gap-1">
              {goals.slice(0, 4).map((goal) => (
                <div
                  key={goal.id}
                  className="flex-1 h-2 rounded-full bg-gradient-to-r from-violet-400 to-purple-500"
                  style={{ opacity: 0.3 + (goal.currentAmount / goal.targetAmount) * 0.7 }}
                />
              ))}
            </div>
            <p className="text-[10px] text-white/60 mt-1">Track your progress</p>
          </motion.div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Monthly Income', value: formatCurrency(user.monthlyIncome), color: 'text-blue-400' },
            { label: 'Monthly Savings', value: formatCurrency(user.monthlySavings), color: 'text-emerald-400' },
            { label: 'Assets', value: assets.length, color: 'text-violet-400' },
            { label: 'Goals', value: goals.length, color: 'text-amber-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <p className="text-[10px] text-white/50 uppercase font-bold">{stat.label}</p>
              <p className={`text-sm font-black ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

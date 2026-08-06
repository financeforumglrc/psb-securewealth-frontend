import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PulseItem {
  id: string;
  icon: string;
  color: string;
  label: string;
  value: string;
  change: string;
  changeUp: boolean;
}

const INITIAL_ITEMS: PulseItem[] = [
  { id: '1', icon: 'fa-shield-virus', color: 'text-emerald-300', label: 'Frauds Blocked Today', value: '847', change: '+12', changeUp: true },
  { id: '2', icon: 'fa-robot', color: 'text-amber-300', label: 'Agent Savings', value: '₹6,725', change: '+₹1,200', changeUp: true },
  { id: '3', icon: 'fa-users', color: 'text-teal-200', label: 'Users Protected', value: '2.8M', change: '+47K', changeUp: true },
  { id: '4', icon: 'fa-brain', color: 'text-yellow-200', label: 'AI Queries', value: '14,293', change: '+892', changeUp: true },
  { id: '5', icon: 'fa-heart-pulse', color: 'text-rose-300', label: 'Emotional Spends Blocked', value: '₹2,849', change: '-₹450', changeUp: false },
  { id: '6', icon: 'fa-dice', color: 'text-cyan-200', label: 'Simulations Run', value: '48,291', change: '+3,402', changeUp: true },
];

export default function FinancialPulse() {
  const [items, setItems] = useState<PulseItem[]>(INITIAL_ITEMS);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => {
        const idx = Math.floor(Math.random() * prev.length);
        const item = prev[idx];
        const numericValue = parseInt(item.value.replace(/[^0-9]/g, '')) || 0;
        const increment = Math.floor(Math.random() * 5) + 1;
        const newValue = numericValue + increment;
        const formatted = item.value.startsWith('₹')
          ? `₹${newValue.toLocaleString()}`
          : newValue >= 1000000
          ? `${(newValue / 1000000).toFixed(1)}M`
          : newValue >= 1000
          ? `${(newValue / 1000).toFixed(1)}K`
          : newValue.toLocaleString();

        const newItems = [...prev];
        newItems[idx] = { ...item, value: formatted };
        return newItems;
      });
      setHighlighted(INITIAL_ITEMS[Math.floor(Math.random() * INITIAL_ITEMS.length)].id);
      setTimeout(() => setHighlighted(null), 800);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
      {/* Subtle gold accent shimmer */}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

      {/* Animated background dots */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-indigo-300 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 px-4 py-3">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 flex-shrink-0 pr-4 border-r border-white/20">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider whitespace-nowrap">Live Pulse</span>
          </div>

          {items.map((item) => (
            <motion.div
              key={item.id}
              className="flex items-center gap-2.5 flex-shrink-0 px-3 py-1.5 rounded-lg transition-colors"
              animate={{
                backgroundColor: highlighted === item.id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0)',
                scale: highlighted === item.id ? 1.03 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <i className={`fas ${item.icon} ${item.color} text-xs`} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{item.value}</span>
                  <span className={`text-[9px] font-medium ${item.changeUp ? 'text-emerald-300' : 'text-rose-300'}`}>
                    <i className={`fas fa-arrow-${item.changeUp ? 'up' : 'down'} text-[7px] mr-0.5`} />
                    {item.change}
                  </span>
                </div>
                <p className="text-[9px] text-white/60 whitespace-nowrap">{item.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

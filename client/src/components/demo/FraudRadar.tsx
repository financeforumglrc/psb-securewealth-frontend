import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MapPin } from 'lucide-react';

const CITIES = [
  { name: 'Delhi', x: 32, y: 28 },
  { name: 'Mumbai', x: 22, y: 58 },
  { name: 'Bangalore', x: 38, y: 72 },
  { name: 'Chennai', x: 42, y: 78 },
  { name: 'Kolkata', x: 62, y: 45 },
  { name: 'Hyderabad', x: 36, y: 62 },
  { name: 'Ahmedabad', x: 20, y: 45 },
  { name: 'Pune', x: 26, y: 60 },
  { name: 'Chandigarh', x: 30, y: 22 },
  { name: 'Jaipur', x: 26, y: 34 },
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function MissionControlStats({ fraudBlocked }: { fraudBlocked: number }) {
  const [decisions, setDecisions] = useState(1248);
  const [latency, setLatency] = useState(420);
  const [active, setActive] = useState(48203);

  useEffect(() => {
    const i = setInterval(() => {
      setDecisions((d) => d + rand(0, 3));
      setLatency(() => rand(180, 650));
      setActive((a) => a + rand(-20, 35));
    }, 1500);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
      <StatCard label="Fraud blocked today" value={`₹${(fraudBlocked / 100000).toFixed(2)}L`} sub="simulated" pulse />
      <StatCard label="Risk decisions" value={decisions.toLocaleString('en-IN')} sub="per second" />
      <StatCard label="API latency" value={`${(latency / 1000).toFixed(2)}s`} sub="avg p95" />
      <StatCard label="Active twins" value={active.toLocaleString('en-IN')} sub="live users" />
    </div>
  );
}

function StatCard({ label, value, sub, pulse }: { label: string; value: string; sub: string; pulse?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm overflow-hidden"
    >
      {pulse && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl sm:text-3xl font-black text-slate-100">{value}</p>
      <p className="text-[10px] text-slate-600">{sub}</p>
    </motion.div>
  );
}

export function FraudRadar() {
  const [pings, setPings] = useState<{ id: number; city: typeof CITIES[0]; type: 'block' | 'warn' }[]>([]);
  const [blockedCount, setBlockedCount] = useState(12847);

  useEffect(() => {
    let id = 0;
    const i = setInterval(() => {
      const city = CITIES[rand(0, CITIES.length - 1)];
      const type = Math.random() > 0.3 ? 'block' : 'warn';
      setPings((p) => [...p.slice(-8), { id: id++, city, type }]);
      if (type === 'block') setBlockedCount((c) => c + rand(1, 4));
    }, 900);
    return () => clearInterval(i);
  }, []);

  const rings = useMemo(() => [1, 2, 3], []);

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[16/10] rounded-3xl bg-slate-900/40 border border-slate-800 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08),transparent_70%)]" />
      {/* Radar rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {rings.map((r) => (
          <div
            key={r}
            className="absolute rounded-full border border-cyan-500/10"
            style={{ width: `${r * 30}%`, height: `${r * 30}%` }}
          />
        ))}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[70%] h-[70%] rounded-full border-r border-t border-cyan-500/20"
          style={{ borderRadius: '50%' }}
        />
      </div>

      {/* Cities */}
      {CITIES.map((city) => (
        <div
          key={city.name}
          className="absolute flex flex-col items-center group"
          style={{ left: `${city.x}%`, top: `${city.y}%` }}
        >
          <MapPin className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
          <span className="text-[9px] text-slate-600 group-hover:text-slate-300 whitespace-nowrap">{city.name}</span>
        </div>
      ))}

      {/* Pings */}
      <AnimatePresence>
        {pings.map((ping) => (
          <motion.div
            key={ping.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className={`absolute w-4 h-4 rounded-full ${ping.type === 'block' ? 'bg-rose-500' : 'bg-amber-500'}`}
            style={{ left: `${ping.city.x}%`, top: `${ping.city.y}%`, marginLeft: -8, marginTop: -8 }}
          />
        ))}
      </AnimatePresence>

      {/* Overlay stats */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 border border-slate-800 text-xs">
          <Shield className="w-3 h-3 text-emerald-500" />
          <span className="text-slate-300">{blockedCount.toLocaleString('en-IN')} attacks blocked</span>
        </div>
        <div className="flex gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Block</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Warn</span>
        </div>
      </div>
    </div>
  );
}



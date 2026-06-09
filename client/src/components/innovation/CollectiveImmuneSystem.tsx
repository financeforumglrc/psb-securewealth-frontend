import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';

interface ThreatSignal {
  id: string;
  type: string;
  city: string;
  pattern: string;
  count: number;
  firstSeen: string;
  status: 'active' | 'neutralized' | 'contained';
  severity: 'critical' | 'high' | 'medium';
}

interface CityStat {
  city: string;
  lat: number;
  lng: number;
  threats: number;
  protected: number;
  size: number;
}

export default function CollectiveImmuneSystem() {
  const includeCommunity = useWealthStore((s) => s.includeInCommunityData);
  const toggleCommunity = useWealthStore((s) => s.toggleCommunityData);
  const [threats] = useState<ThreatSignal[]>([
    { id: 't1', type: 'UPI Phishing SMS', city: 'Mumbai', pattern: 'Fake HDFC reward link', count: 47, firstSeen: '2 min ago', status: 'active', severity: 'critical' },
    { id: 't2', type: 'OTP Harvesting', city: 'Delhi', pattern: 'Impersonating Amazon refund', count: 32, firstSeen: '5 min ago', status: 'contained', severity: 'high' },
    { id: 't3', type: 'Merchant Fraud', city: 'Bangalore', pattern: 'Duplicate charge on food apps', count: 18, firstSeen: '12 min ago', status: 'neutralized', severity: 'medium' },
    { id: 't4', type: 'Aadhaar Scam', city: 'Hyderabad', pattern: 'Fake Aadhaar update call', count: 56, firstSeen: '1 min ago', status: 'active', severity: 'critical' },
    { id: 't5', type: 'Investment Fraud', city: 'Pune', pattern: 'Guaranteed 50% return scheme', count: 12, firstSeen: '28 min ago', status: 'contained', severity: 'high' },
  ]);

  const [stats, setStats] = useState({ users: 2847391, protected: 847293, neutralized: 12483, active: 47 });

  // Simulate live threat updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((s) => ({
        users: s.users + Math.floor(Math.random() * 5),
        protected: s.protected + Math.floor(Math.random() * 3),
        neutralized: s.neutralized + (Math.random() > 0.7 ? 1 : 0),
        active: s.active + (Math.random() > 0.6 ? 1 : -1),
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const cityStats: CityStat[] = [
    { city: 'Mumbai', lat: 60, lng: 35, threats: 47, protected: 12400, size: 24 },
    { city: 'Delhi', lat: 30, lng: 42, threats: 32, protected: 9800, size: 20 },
    { city: 'Bangalore', lat: 72, lng: 65, threats: 18, protected: 7600, size: 16 },
    { city: 'Hyderabad', lat: 55, lng: 58, threats: 56, protected: 6200, size: 22 },
    { city: 'Pune', lat: 58, lng: 48, threats: 12, protected: 4100, size: 14 },
    { city: 'Chennai', lat: 78, lng: 72, threats: 8, protected: 5300, size: 12 },
    { city: 'Kolkata', lat: 48, lng: 55, threats: 15, protected: 4800, size: 14 },
  ];

  const severityColor = {
    critical: 'bg-rose-500',
    high: 'bg-amber-500',
    medium: 'bg-blue-500',
  };

  const statusIcon = {
    active: 'fa-triangle-exclamation text-rose-500',
    contained: 'fa-shield-halved text-amber-500',
    neutralized: 'fa-check text-emerald-500',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-shield-virus text-emerald-500" /> Collective Immune System
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Community-powered fraud defense. Your city protects you before you know you're under attack.</p>
        </div>
        <button
          onClick={toggleCommunity}
          className={`relative w-14 h-7 rounded-full transition-colors ${includeCommunity ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
        >
          <motion.div
            className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow"
            animate={{ left: includeCommunity ? '26px' : '2px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {!includeCommunity && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-200">
          <i className="fas fa-circle-exclamation mr-1" />
          You are in SOLO mode. Enable community data to receive real-time threat immunization from 2.8M+ users.
        </div>
      )}

      {/* Live Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Immune Users', value: stats.users.toLocaleString(), icon: 'fa-users', color: 'bg-blue-50 text-blue-600', sub: '+ Growing' },
          { label: 'Protected Today', value: stats.protected.toLocaleString(), icon: 'fa-shield-halved', color: 'bg-emerald-50 text-emerald-600', sub: 'Auto-immunized' },
          { label: 'Threats Neutralized', value: stats.neutralized.toLocaleString(), icon: 'fa-ban', color: 'bg-rose-50 text-rose-600', sub: 'All-time' },
          { label: 'Active Threats', value: stats.active, icon: 'fa-triangle-exclamation', color: 'bg-amber-50 text-amber-600', sub: 'Being contained' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="card"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <i className={`fas ${stat.icon}`} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{stat.label}</p>
                <p className="text-xl font-extrabold text-slate-800 dark:text-white">{stat.value}</p>
                <p className="text-[9px] text-slate-400">{stat.sub}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Threat Map Visualization */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <i className="fas fa-map text-primary text-sm" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Live Threat Map — India</h4>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            Live
          </span>
        </div>
        <div className="relative h-64 bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
          {/* Simplified India outline dots */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-20">
            <path d="M30,20 Q40,15 50,18 Q60,12 70,20 Q75,30 72,40 Q78,50 70,60 Q72,75 60,82 Q50,88 40,82 Q30,75 28,60 Q22,50 28,40 Q25,30 30,20Z" fill="currentColor" className="text-slate-400" />
          </svg>
          {cityStats.map((city) => (
            <motion.div
              key={city.city}
              className="absolute"
              style={{ left: `${city.lng}%`, top: `${city.lat}%` }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: Math.random() * 0.5 }}
            >
              <div className="relative">
                <div className={`w-${Math.round(city.size / 6)} h-${Math.round(city.size / 6)} rounded-full bg-rose-500/20 animate-ping absolute`} style={{ width: city.size * 1.5, height: city.size * 1.5, marginLeft: -(city.size * 0.75), marginTop: -(city.size * 0.75) }} />
                <div className="w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800 shadow" />
              </div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 px-1.5 py-0.5 rounded">{city.city}</p>
                <p className="text-[8px] text-center text-rose-500 font-bold">{city.threats} threats</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-2 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded-full" /> Active threat cluster</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> Protected zone</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full" /> Containment in progress</span>
        </div>
      </div>

      {/* Threat Feed */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <i className="fas fa-radar text-rose-500 text-sm" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Real-Time Threat Feed</h4>
          <span className="ml-auto text-[10px] px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold animate-pulse">
            LIVE
          </span>
        </div>
        <div className="space-y-2">
          {threats.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700"
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${severityColor[t.severity]} ${t.status === 'active' ? 'animate-pulse' : ''}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{t.type}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    t.status === 'active' ? 'bg-rose-100 text-rose-700' :
                    t.status === 'contained' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {t.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">{t.pattern} • {t.city}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold text-slate-800 dark:text-white">{t.count}</p>
                <p className="text-[9px] text-slate-400">reports</p>
              </div>
              <div className="text-right flex-shrink-0 min-w-[60px]">
                <p className="text-[10px] text-slate-400">{t.firstSeen}</p>
              </div>
              <i className={`fas ${statusIcon[t.status]} text-xs flex-shrink-0`} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { step: 1, title: 'Detect', desc: 'Any user flags a suspicious pattern anonymously', icon: 'fa-eye' },
          { step: 2, title: 'Cluster', desc: 'AI clusters similar reports across cities in real-time', icon: 'fa-object-group' },
          { step: 3, title: 'Immunize', desc: 'All users get auto-protection before they encounter the threat', icon: 'fa-syringe' },
        ].map((s) => (
          <div key={s.step} className="card flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
              <i className={`fas ${s.icon} text-xs`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">{s.step}. {s.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

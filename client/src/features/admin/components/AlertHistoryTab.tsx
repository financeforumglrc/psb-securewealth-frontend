import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Skull, AlertTriangle, Info, Bell, BellRing, CheckCheck, Trash2,
  Volume2, VolumeX, Monitor, MonitorOff, Search, X, ShieldAlert,
  Activity, Clock, Shield, Siren, Radio,
  TrendingUp, TrendingDown
} from 'lucide-react';
import { alertService, type AlertEvent } from '@/shared/services/alertService';

const severityConfig = {
  critical: {
    icon: Skull,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    glow: 'shadow-red-500/20',
    label: 'CRITICAL',
    bar: 'from-red-500 to-rose-600',
    scoreColor: '#ef4444'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'shadow-amber-500/20',
    label: 'WARNING',
    bar: 'from-amber-400 to-orange-500',
    scoreColor: '#f59e0b'
  },
  info: {
    icon: Info,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    glow: 'shadow-cyan-500/20',
    label: 'INFO',
    bar: 'from-cyan-400 to-blue-500',
    scoreColor: '#22d3ee'
  },
};

function fmtTime(ts: string) {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const start = display;
    const end = value;
    if (start === end) return;
    const duration = 600;
    const startTime = performance.now();
    let raf: number;
    const step = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      setDisplay(Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{display.toLocaleString('en-IN')}</span>;
}

export default function AlertHistoryTab() {
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState(alertService.getSettings());
  const [selected, setSelected] = useState<AlertEvent | null>(null);
  const [livePulse, setLivePulse] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = alertService.subscribe(all => {
      setAlerts(all);
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 800);
    });
    return () => { unsub(); };
  }, []);

  // Auto-scroll feed to top on new alert
  useEffect(() => {
    if (feedRef.current && alerts.length > 0) {
      feedRef.current.scrollTop = 0;
    }
  }, [alerts.length]);

  const filtered = useMemo(() => {
    let result = alerts;
    if (filter !== 'all') result = result.filter(a => a.severity === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a => a.title.toLowerCase().includes(q) || a.message.toLowerCase().includes(q));
    }
    return result;
  }, [alerts, filter, search]);

  const counts = alertService.counts;

  const analytics = useMemo(() => {
    const last24h = alerts.filter(a => Date.now() - new Date(a.timestamp).getTime() < 86400000);
    const prev24h = alerts.filter(a => {
      const t = new Date(a.timestamp).getTime();
      return Date.now() - t >= 86400000 && Date.now() - t < 172800000;
    });
    const trend = last24h.length > prev24h.length ? 'up' : last24h.length < prev24h.length ? 'down' : 'flat';
    return {
      last24h: last24h.length,
      critical24h: last24h.filter(a => a.severity === 'critical').length,
      avgResponseTime: '1.2s',
      trend,
      trendPct: prev24h.length ? Math.round(((last24h.length - prev24h.length) / prev24h.length) * 100) : 0,
    };
  }, [alerts]);

  const severityBreakdown = useMemo(() => {
    const total = Math.max(alerts.length, 1);
    return {
      critical: Math.round((alerts.filter(a => a.severity === 'critical').length / total) * 100),
      warning: Math.round((alerts.filter(a => a.severity === 'warning').length / total) * 100),
      info: Math.round((alerts.filter(a => a.severity === 'info').length / total) * 100),
    };
  }, [alerts]);

  const toggleSound = () => { const s = alertService.toggleSound(); setSettings(prev => ({ ...prev, soundEnabled: s })); };
  const toggleDesktop = () => { const d = alertService.toggleDesktop(); setSettings(prev => ({ ...prev, desktopEnabled: d })); };

  const stats = [
    { label: 'Total Alerts', value: counts.total, icon: Bell, color: 'text-slate-100', bg: 'bg-slate-800/50', border: 'border-slate-700/50', change: `${analytics.trendPct}%`, up: analytics.trend === 'up' },
    { label: 'Unread', value: counts.unread, icon: BellRing, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', change: 'Live', up: true },
    { label: 'Critical', value: counts.critical, icon: Skull, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', change: `${analytics.critical24h} in 24h`, up: analytics.critical24h > 0 },
    { label: 'Security', value: counts.security, icon: ShieldAlert, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', change: 'Active', up: true },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 max-w-[1600px]">
      {/* Global tactical background accent */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(239,68,68,0.4) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(6,182,212,0.3) 0%, transparent 40%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Siren className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Alert Center</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">SOC</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Real-time fraud and security event monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all ${settings.soundEnabled ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'}`}
            title={settings.soundEnabled ? 'Mute alerts' : 'Enable sound'}>
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button onClick={toggleDesktop}
            className={`p-2 rounded-xl border transition-all ${settings.desktopEnabled ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'}`}
            title={settings.desktopEnabled ? 'Disable desktop notifications' : 'Enable desktop notifications'}>
            {settings.desktopEnabled ? <Monitor className="w-4 h-4" /> : <MonitorOff className="w-4 h-4" />}
          </button>
          <button onClick={() => alertService.acknowledgeAll()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs font-bold text-slate-300 hover:bg-slate-700/50 transition-colors">
            <CheckCheck className="w-3.5 h-3.5" /> Acknowledge All
          </button>
          <button onClick={() => alertService.clearAll()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          const TrendIcon = s.up ? TrendingUp : TrendingDown;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`${s.bg} ${s.border} border rounded-2xl p-4 backdrop-blur-sm hover:brightness-110 transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</span>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}><AnimatedNumber value={s.value} /></p>
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon className={`w-3 h-3 ${s.up ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-[10px] text-slate-400">{s.change}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Alert Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search alerts by title or message..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all" />
            </div>
            <div className="flex gap-1.5">
              {(['all', 'critical', 'warning', 'info'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    filter === f
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-900/50 text-slate-400 border-slate-700/50 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}>
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Live feed */}
          <div className="bg-slate-900/40 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 text-red-400 ${livePulse ? 'animate-pulse' : ''}`} />
                <span className="text-xs font-bold text-slate-200">Live Feed</span>
                <span className="text-[10px] text-slate-500">{filtered.length} events</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-medium">STREAMING</span>
              </div>
            </div>
            <div ref={feedRef} className="max-h-[480px] overflow-y-auto p-2 space-y-1">
              <AnimatePresence initial={false}>
                {filtered.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 py-16 text-slate-500">
                    <Bell className="w-10 h-10 opacity-50" />
                    <p className="text-sm font-medium">No alerts</p>
                    <p className="text-xs">All clear — no security events detected.</p>
                  </motion.div>
                ) : (
                  filtered.map((alert, idx) => {
                    const cfg = severityConfig[alert.severity];
                    const Icon = cfg.icon;
                    return (
                      <motion.button
                        key={alert.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.02 }}
                        onClick={() => setSelected(alert)}
                        className={`w-full text-left p-3 rounded-xl hover:bg-slate-800/50 transition-all flex items-start gap-3 border ${
                          !alert.acknowledged ? 'bg-slate-800/30 border-slate-700/30' : 'border-transparent'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0 shadow-lg ${cfg.glow}`}>
                          <Icon className={`w-5 h-5 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.color} border ${cfg.border}`}>{cfg.label}</span>
                            <span className="text-[10px] text-slate-500">{fmtTime(alert.timestamp)}</span>
                            {!alert.acknowledged && (
                              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50" />
                            )}
                          </div>
                          <p className="text-sm font-bold text-slate-100">{alert.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{alert.message}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); alertService.acknowledge(alert.id); }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${alert.acknowledged ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-700/50'}`}>
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      </motion.button>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Analytics sidebar */}
        <div className="space-y-4">
          {/* Severity Breakdown */}
          <div className="bg-slate-900/40 rounded-2xl border border-slate-700/50 p-4 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Severity Breakdown
            </h3>
            <div className="space-y-4">
              {[
                { key: 'critical', label: 'Critical', value: severityBreakdown.critical },
                { key: 'warning', label: 'Warning', value: severityBreakdown.warning },
                { key: 'info', label: 'Info', value: severityBreakdown.info },
              ].map((s) => {
                const cfg = severityConfig[s.key as keyof typeof severityConfig];
                return (
                  <div key={s.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-300">{s.label}</span>
                      <span className="text-xs font-bold" style={{ color: cfg.scoreColor }}>{s.value}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.value}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full rounded-full bg-gradient-to-r ${cfg.bar}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Response Metrics */}
          <div className="bg-slate-900/40 rounded-2xl border border-slate-700/50 p-4 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Response Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
                <p className="text-[10px] text-slate-500 uppercase">Avg Response</p>
                <p className="text-lg font-bold text-cyan-400">{analytics.avgResponseTime}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
                <p className="text-[10px] text-slate-500 uppercase">Last 24h</p>
                <p className="text-lg font-bold text-slate-200">{analytics.last24h}</p>
              </div>
            </div>
          </div>

          {/* Active Threats Mini-Card */}
          <div className="bg-gradient-to-br from-red-500/10 to-red-900/10 rounded-2xl border border-red-500/20 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-red-200">Active Threats</h3>
            </div>
            <p className="text-2xl font-bold text-red-400">{counts.critical}</p>
            <p className="text-[11px] text-red-300/70 mt-1">Critical alerts requiring immediate attention</p>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[10000]" onClick={() => setSelected(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden"
                onClick={e => e.stopPropagation()}>
                <div className="px-6 py-5 border-b border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${severityConfig[selected.severity].bg} border ${severityConfig[selected.severity].border}`}>
                      {React.createElement(severityConfig[selected.severity].icon, { className: `w-5 h-5 ${severityConfig[selected.severity].color}` })}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">Alert Details</h3>
                      <p className="text-[10px] text-slate-500 font-mono">ID: ALT-{String(selected.id).padStart(4, '0')}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Severity', value: selected.severity.toUpperCase(), color: severityConfig[selected.severity].scoreColor },
                      { label: 'Type', value: selected.type },
                      { label: 'Title', value: selected.title },
                      { label: 'Time', value: new Date(selected.timestamp).toLocaleString('en-IN') },
                      { label: 'Acknowledged', value: selected.acknowledged ? 'Yes' : 'No' },
                    ].map(d => (
                      <div key={d.label} className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/30">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{d.label}</p>
                        <p className="text-xs font-semibold text-slate-200 mt-0.5" style={{ color: (d as any).color }}>{d.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Message</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{selected.message}</p>
                  </div>
                  {selected.eventData && (
                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Raw Data</p>
                      <pre className="text-[10px] text-slate-400 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {JSON.stringify(selected.eventData, null, 2)}
                      </pre>
                    </div>
                  )}
                  <button onClick={() => { alertService.acknowledge(selected.id); setSelected(null); }}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                    <CheckCheck className="w-4 h-4" /> Acknowledge Alert
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

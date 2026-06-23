import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Skull, AlertTriangle, Info, Bell, BellRing, CheckCheck, Trash2,
  Volume2, VolumeX, Monitor, MonitorOff, Search, X, ShieldAlert,
  Activity, Clock, Shield, Siren, Radio,
  TrendingUp, TrendingDown, UserX, ShieldCheck, ShieldOff
} from 'lucide-react';
import { alertService, type AlertEvent } from '@/shared/services/alertService';

const severityConfig = {
  critical: {
    icon: Skull,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    label: 'CRITICAL',
    bar: 'from-rose-500 to-red-600',
    soft: 'bg-rose-500'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: 'WARNING',
    bar: 'from-amber-400 to-orange-500',
    soft: 'bg-amber-500'
  },
  info: {
    icon: Info,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    label: 'INFO',
    bar: 'from-sky-400 to-blue-500',
    soft: 'bg-sky-500'
  },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  open: { label: 'OPEN', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', icon: Bell },
  acknowledged: { label: 'ACK', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCheck },
  blocked: { label: 'BLOCKED', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', icon: UserX },
  whitelisted: { label: 'WHITELISTED', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: ShieldCheck },
  false_positive: { label: 'FALSE +VE', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200', icon: ShieldOff },
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
  const [toasts, setToasts] = useState<{ id: number; title: string; message: string; severity: AlertEvent['severity'] }[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);
  const prevAlertIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const unsub = alertService.subscribe(all => {
      setAlerts(all);
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 800);
    });
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    if (feedRef.current && alerts.length > 0) {
      feedRef.current.scrollTop = 0;
    }
  }, [alerts.length]);

  // Push toast for every new critical alert that arrives
  useEffect(() => {
    const currentIds = new Set(alerts.map(a => a.id));
    const newAlerts = alerts.filter(a => !prevAlertIds.current.has(a.id));
    prevAlertIds.current = currentIds;
    newAlerts.forEach(a => {
      if (a.severity === 'critical') {
        setToasts(prev => [...prev, { id: a.id, title: a.title, message: a.message, severity: a.severity }]);
        const t = setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== a.id));
        }, 6000);
        return () => clearTimeout(t);
      }
    });
  }, [alerts]);

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
    { label: 'Total Alerts', value: counts.total, icon: Bell, color: 'text-slate-700', bg: 'bg-white', border: 'border-slate-200', accent: 'bg-slate-100', change: `${analytics.trendPct}%`, up: analytics.trend === 'up' },
    { label: 'Unread', value: counts.unread, icon: BellRing, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100', accent: 'bg-sky-100', change: 'Live', up: true },
    { label: 'Critical', value: counts.critical, icon: Skull, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', accent: 'bg-rose-100', change: `${analytics.critical24h} in 24h`, up: analytics.critical24h > 0 },
    { label: 'Security', value: counts.security, icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', accent: 'bg-amber-100', change: 'Active', up: true },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Siren className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold text-slate-900">Alert Center</h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">SOC</span>
          </div>
          <p className="text-sm text-slate-500">Real-time fraud and security event monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all ${settings.soundEnabled ? 'bg-sky-50 border-sky-200 text-sky-600' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'}`}
            title={settings.soundEnabled ? 'Mute alerts' : 'Enable sound'}>
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button onClick={toggleDesktop}
            className={`p-2 rounded-xl border transition-all ${settings.desktopEnabled ? 'bg-sky-50 border-sky-200 text-sky-600' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'}`}
            title={settings.desktopEnabled ? 'Disable desktop notifications' : 'Enable desktop notifications'}>
            {settings.desktopEnabled ? <Monitor className="w-4 h-4" /> : <MonitorOff className="w-4 h-4" />}
          </button>
          <button onClick={() => alertService.acknowledgeAll()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
            <CheckCheck className="w-3.5 h-3.5" /> Acknowledge All
          </button>
          <button onClick={() => alertService.clearAll()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors shadow-sm">
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          const TrendIcon = s.up ? TrendingUp : TrendingDown;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`${s.bg} ${s.border} border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg ${s.accent} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}><AnimatedNumber value={s.value} /></p>
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon className={`w-3 h-3 ${s.up ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span className="text-[10px] text-slate-400">{s.change}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Alert Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search alerts by title or message..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all" />
            </div>
            <div className="flex gap-1.5">
              {(['all', 'critical', 'warning', 'info'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    filter === f
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                  }`}>
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Live feed */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 text-rose-500 ${livePulse ? 'animate-pulse' : ''}`} />
                <span className="text-xs font-bold text-slate-700">Live Feed</span>
                <span className="text-[10px] text-slate-400">{filtered.length} events</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-600 font-medium">STREAMING</span>
              </div>
            </div>
            <div ref={feedRef} className="max-h-[480px] overflow-y-auto p-2 space-y-1">
              <AnimatePresence initial={false}>
                {filtered.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 py-16 text-slate-400">
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
                        className={`w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-all flex items-start gap-3 border ${
                          !alert.acknowledged ? 'bg-slate-50/70 border-slate-100' : 'border-transparent'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.color} border ${cfg.border}`}>{cfg.label}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${statusConfig[alert.status].bg} ${statusConfig[alert.status].color} border ${statusConfig[alert.status].border}`}>
                              {statusConfig[alert.status].label}
                            </span>
                            <span className="text-[10px] text-slate-400">{fmtTime(alert.timestamp)}</span>
                            {!alert.acknowledged && (
                              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                            )}
                          </div>
                          <p className="text-sm font-bold text-slate-800">{alert.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{alert.message}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); alertService.acknowledge(alert.id); }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${alert.acknowledged ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}>
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
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-500" /> Severity Breakdown
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
                      <span className="text-xs font-medium text-slate-600">{s.label}</span>
                      <span className="text-xs font-bold" style={{ color: cfg.color.replace('text-', '') === 'text-rose-600' ? '#e11d48' : cfg.color.replace('text-', '') === 'text-amber-600' ? '#d97706' : '#0284c7' }}>{s.value}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
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
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-500" /> Response Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase">Avg Response</p>
                <p className="text-lg font-bold text-sky-600">{analytics.avgResponseTime}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase">Last 24h</p>
                <p className="text-lg font-bold text-slate-700">{analytics.last24h}</p>
              </div>
            </div>
          </div>

          {/* Active Threats Mini-Card */}
          <div className="bg-gradient-to-br from-rose-50 to-white rounded-2xl border border-rose-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-rose-800">Active Threats</h3>
            </div>
            <p className="text-2xl font-bold text-rose-600">{counts.critical}</p>
            <p className="text-[11px] text-rose-400 mt-1">Critical alerts requiring immediate attention</p>
          </div>
        </div>
      </div>

      {/* Live Toasts */}
      <div className="fixed top-4 right-4 z-[10002] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              className="pointer-events-auto w-80 bg-white rounded-xl border border-rose-200 shadow-lg p-4 flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <Skull className="w-4 h-4 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{t.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{t.message}</p>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/30 backdrop-blur-sm z-[10000]" onClick={() => setSelected(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden"
                onClick={e => e.stopPropagation()}>
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${severityConfig[selected.severity].bg} border ${severityConfig[selected.severity].border}`}>
                      {React.createElement(severityConfig[selected.severity].icon, { className: `w-5 h-5 ${severityConfig[selected.severity].color}` })}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-800">Alert Details</h3>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusConfig[selected.status].bg} ${statusConfig[selected.status].color} border ${statusConfig[selected.status].border}`}>
                          {statusConfig[selected.status].label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">ID: ALT-{String(selected.id).padStart(4, '0')}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Severity', value: selected.severity.toUpperCase(), color: severityConfig[selected.severity].color },
                      { label: 'Type', value: selected.type.charAt(0).toUpperCase() + selected.type.slice(1) },
                      { label: 'Time', value: new Date(selected.timestamp).toLocaleString('en-IN') },
                      { label: 'Risk Score', value: selected.eventData?.riskScore ?? '—' },
                    ].map(d => (
                      <div key={d.label} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.label}</p>
                        <p className={`text-xs font-semibold mt-0.5 ${(d as any).color || 'text-slate-700'}`}>{d.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Message</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{selected.message}</p>
                  </div>
                  {selected.eventData && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Event Summary</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-slate-400">Action:</span> <span className="font-medium text-slate-700">{selected.eventData.action || selected.eventData.eventData?.action || '—'}</span></div>
                        <div><span className="text-slate-400">Location:</span> <span className="font-medium text-slate-700">{selected.eventData.location ? `${selected.eventData.location.city}, ${selected.eventData.location.country}` : '—'}</span></div>
                        {selected.eventData.amount !== undefined && (
                          <div><span className="text-slate-400">Amount:</span> <span className="font-medium text-slate-700">₹ {selected.eventData.amount.toLocaleString('en-IN')}</span></div>
                        )}
                        {selected.eventData.ip_address && (
                          <div><span className="text-slate-400">IP:</span> <span className="font-mono text-slate-700">{selected.eventData.ip_address}</span></div>
                        )}
                      </div>
                    </div>
                  )}

                  {selected.status === 'open' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { alertService.blockUser(selected.id); }}
                        className="py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                        <UserX className="w-3.5 h-3.5" /> Block User
                      </button>
                      <button onClick={() => { alertService.whitelistIp(selected.id); }}
                        className="py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> Whitelist IP
                      </button>
                      <button onClick={() => { alertService.markFalsePositive(selected.id); }}
                        className="py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                        <ShieldOff className="w-3.5 h-3.5" /> Mark Safe
                      </button>
                      <button onClick={() => { alertService.acknowledge(selected.id); }}
                        className="py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                        <CheckCheck className="w-3.5 h-3.5" /> Acknowledge
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <p className="text-xs font-semibold text-slate-600">
                        Resolved as <span className={`${statusConfig[selected.status].color} font-bold`}>{statusConfig[selected.status].label}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">No further action required.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

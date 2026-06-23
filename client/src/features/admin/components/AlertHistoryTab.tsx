import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Skull, AlertTriangle, Info, Bell, BellRing, CheckCheck, Trash2, Volume2, VolumeX, Monitor, MonitorOff, Search, X, ShieldAlert } from 'lucide-react';
import { alertService, type AlertEvent } from '@/shared/services/alertService';

const severityConfig = {
  critical: { icon: Skull, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'CRITICAL' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'WARNING' },
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'INFO' },
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

export default function AlertHistoryTab() {
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState(alertService.getSettings());
  const [selected, setSelected] = useState<AlertEvent | null>(null);

  useEffect(() => {
    const unsub = alertService.subscribe(all => setAlerts(all));
    return unsub;
  }, []);

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

  const toggleSound = () => { const s = alertService.toggleSound(); setSettings(prev => ({ ...prev, soundEnabled: s })); };
  const toggleDesktop = () => { const d = alertService.toggleDesktop(); setSettings(prev => ({ ...prev, desktopEnabled: d })); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header + Actions */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Alert Center</h2>
          <p className="text-sm text-slate-500 mt-0.5">Real-time fraud and security event monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleSound}
            className={`p-2 rounded-lg border transition-colors ${settings.soundEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
            title={settings.soundEnabled ? 'Mute alerts' : 'Enable sound'}>
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button onClick={toggleDesktop}
            className={`p-2 rounded-lg border transition-colors ${settings.desktopEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
            title={settings.desktopEnabled ? 'Disable desktop notifications' : 'Enable desktop notifications'}>
            {settings.desktopEnabled ? <Monitor className="w-4 h-4" /> : <MonitorOff className="w-4 h-4" />}
          </button>
          <button onClick={() => alertService.acknowledgeAll()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors">
            <CheckCheck className="w-3.5 h-3.5" /> Acknowledge All
          </button>
          <button onClick={() => alertService.clearAll()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Alerts', value: counts.total, icon: Bell, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Unread', value: counts.unread, icon: BellRing, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Critical', value: counts.critical, icon: Skull, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Security', value: counts.security, icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</span>
                <Icon className={`w-4 h-4 ${s.color} opacity-60`} />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search alerts..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400" />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'critical', 'warning', 'info'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                filter === f ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <Bell className="w-10 h-10" />
            <p className="text-sm font-medium">No alerts</p>
            <p className="text-xs">All clear — no security events detected.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(alert => {
              const cfg = severityConfig[alert.severity];
              const Icon = cfg.icon;
              return (
                <button key={alert.id} onClick={() => setSelected(alert)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start gap-3 ${!alert.acknowledged ? 'bg-slate-50/50' : ''}`}>
                  <div className={`w-9 h-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-[10px] text-slate-400">{fmtTime(alert.timestamp)}</span>
                      {!alert.acknowledged && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                    </div>
                    <p className="text-sm font-bold text-slate-800">{alert.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{alert.message}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); alertService.acknowledge(alert.id); }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${alert.acknowledged ? 'text-emerald-400' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}>
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/40 z-50" onClick={() => setSelected(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${severityConfig[selected.severity].bg}`}>
                    {React.createElement(severityConfig[selected.severity].icon, { className: `w-5 h-5 ${severityConfig[selected.severity].color}` })}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Alert Details</h3>
                    <p className="text-[10px] text-slate-400">ID: ALT-{String(selected.id).padStart(4, '0')}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Severity', value: selected.severity.toUpperCase() },
                    { label: 'Type', value: selected.type },
                    { label: 'Title', value: selected.title },
                    { label: 'Time', value: new Date(selected.timestamp).toLocaleString('en-IN') },
                    { label: 'Acknowledged', value: selected.acknowledged ? 'Yes' : 'No' },
                  ].map(d => (
                    <div key={d.label} className="p-2.5 rounded-lg bg-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.label}</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{d.value}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Message</p>
                  <p className="text-xs text-slate-600">{selected.message}</p>
                </div>
                {selected.eventData && (
                  <div className="p-3 rounded-xl bg-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Raw Data</p>
                    <pre className="text-[10px] text-slate-500 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {JSON.stringify(selected.eventData, null, 2)}
                    </pre>
                  </div>
                )}
                <button onClick={() => { alertService.acknowledge(selected.id); setSelected(null); }}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors">
                  Acknowledge
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}


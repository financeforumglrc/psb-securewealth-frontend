import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HeartPulse, Activity, RefreshCw, Server, Database, Wifi, WifiOff,
  Clock, ShieldCheck, AlertTriangle, Zap, Users, Landmark,
  ArrowLeftRight, Target, CheckCircle2, XCircle,
  Fingerprint, ScanLine, Lock, Siren, Radio,
} from 'lucide-react';
import { backendApi } from '@/shared/lib/backendApi';
import { alertService, type AlertEvent } from '@/shared/services/alertService';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { useSecurity } from '@/shared/context/SecurityContext';

interface SystemStats {
  totalUsers: number;
  faceRegistered: number;
  activeToday: number;
  totalAccounts: number;
  totalTransactions: number;
  totalBills: number;
  totalGoals: number;
  totalLoans: number;
}

interface HealthState {
  status: 'online' | 'degraded' | 'offline';
  latency: number | null;
  db: 'healthy' | 'unknown' | 'unhealthy';
  message: string;
}

interface StatusCardProps {
  title: string;
  value: React.ReactNode;
  subtitle: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'success' | 'warning' | 'danger' | 'neutral';
}

function StatusCard({ title, value, subtitle, icon: Icon, variant = 'neutral' }: StatusCardProps) {
  const variantMap: Record<string, string> = {
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    danger: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
    neutral: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
  };
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${variantMap[variant]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider opacity-70">{title}</span>
        <Icon className="w-4 h-4 opacity-70" />
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs font-medium opacity-80">{subtitle}</div>
    </div>
  );
}

function fmtDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
  return `${h % 24}h ${m % 60}m ${s % 60}s`;
}

function fmtTime(ts: string) {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function SystemHealthTab({ stats }: { stats: SystemStats | null }) {
  const { state: security } = useSecurity();
  const network = useNetworkStatus();
  const sessionStart = useRef(Date.now());
  const [uptime, setUptime] = useState(Date.now() - sessionStart.current);
  const [health, setHealth] = useState<HealthState>({ status: 'offline', latency: null, db: 'unknown', message: 'Not checked' });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [incidents, setIncidents] = useState<AlertEvent[]>([]);
  const [counts, setCounts] = useState(alertService.counts);

  useEffect(() => {
    const timer = setInterval(() => setUptime(Date.now() - sessionStart.current), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsub = alertService.subscribe((alerts) => {
      setCounts(alertService.counts);
      setIncidents(alerts.filter(a => !a.acknowledged && (a.severity === 'critical' || a.severity === 'warning')).slice(0, 5));
    });
    return () => { unsub(); };
  }, []);

  const checkHealth = async () => {
    setRefreshing(true);
    const start = performance.now();
    const res = await backendApi.health();
    const latency = Math.round(performance.now() - start);
    if (res.ok) {
      setHealth({
        status: latency > 1500 ? 'degraded' : 'online',
        latency,
        db: 'healthy',
        message: res.data?.message || 'All systems operational',
      });
    } else {
      setHealth({ status: 'offline', latency, db: 'unhealthy', message: res.data?.error || 'API unreachable' });
    }
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  useEffect(() => {
    checkHealth();
    const timer = setInterval(checkHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  const statusConfig = useMemo(() => ({
    online: { color: 'text-emerald-600 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: Activity, label: 'Online' },
    degraded: { color: 'text-amber-600 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: AlertTriangle, label: 'Degraded' },
    offline: { color: 'text-rose-600 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800', icon: XCircle, label: 'Offline' },
  }), []);

  const protections = useMemo(() => [
    { label: 'FIDO2 Passkey', active: security.passkeyRegistered, icon: Fingerprint },
    { label: 'Post-Quantum Tunnel', active: security.pqTunnelActive, icon: ScanLine },
    { label: 'Secure Enclave', active: security.enclaveVerified, icon: Lock },
    { label: 'TPM Attestation', active: security.tpmAttested, icon: ShieldCheck },
  ], [security]);

  const threats = useMemo(() => [
    { label: 'Honeytoken Triggered', active: security.honeytokenTriggered, icon: Siren },
    { label: 'Trap Account Active', active: security.trapTriggered, icon: AlertTriangle },
    { label: 'Account Frozen', active: security.accountFrozen, icon: Lock },
  ], [security]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HeartPulse className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Health</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Real-time platform observability, API status, and security posture</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            onClick={checkHealth}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-900/20 dark:hover:bg-slate-800/50 dark:bg-slate-800/50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Platform Status"
          value={statusConfig[health.status].label}
          subtitle={health.message}
          icon={statusConfig[health.status].icon}
          variant={health.status === 'online' ? 'success' : health.status === 'degraded' ? 'warning' : 'danger'}
        />
        <StatusCard
          title="API Latency"
          value={health.latency !== null ? `${health.latency} ms` : '—'}
          subtitle={health.latency !== null && health.latency < 800 ? 'Responsive' : health.latency !== null ? 'Slow' : 'Unknown'}
          icon={Zap}
          variant={health.latency !== null && health.latency < 800 ? 'success' : health.latency !== null ? 'warning' : 'neutral'}
        />
        <StatusCard
          title="Database"
          value={health.db === 'healthy' ? 'Healthy' : health.db === 'unhealthy' ? 'Unhealthy' : 'Unknown'}
          subtitle="Primary connection"
          icon={Database}
          variant={health.db === 'healthy' ? 'success' : health.db === 'unhealthy' ? 'danger' : 'neutral'}
        />
        <StatusCard
          title="Session Uptime"
          value={fmtDuration(uptime)}
          subtitle="Since page load"
          icon={Clock}
          variant="neutral"
        />
      </div>

      {/* Network + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            {network.online ? <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-300" /> : <WifiOff className="w-4 h-4 text-rose-600 dark:text-rose-300" />}
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Network</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">{network.online ? 'Online' : 'Offline'}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {network.connectionType !== 'unknown' && <span className="capitalize">{network.connectionType}</span>}
            {network.downlink !== null && <span> · {network.downlink} Mbps</span>}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Open Incidents</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">{counts.unread} open</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{counts.critical} critical · {counts.fraud} fraud · {counts.security} security</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Trust Score</span>
          </div>
          <div className="flex items-end gap-2 mb-1">
            <span className="text-lg font-bold text-slate-900 dark:text-white">{security.trustScore}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">/ 100</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${security.trustScore >= 80 ? 'bg-emerald-500' : security.trustScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${security.trustScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Service metrics */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 dark:bg-slate-800/50/50 dark:bg-slate-800/50 flex items-center gap-2">
          <Server className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Service Metrics</span>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users },
            { label: 'Accounts', value: stats?.totalAccounts ?? '—', icon: Landmark },
            { label: 'Transactions', value: stats?.totalTransactions ?? '—', icon: ArrowLeftRight },
            { label: 'Goals + Loans', value: stats ? stats.totalGoals + stats.totalLoans : '—', icon: Target },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 dark:bg-slate-800/50/50 dark:bg-slate-800/50 p-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <m.icon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Security posture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Protections</span>
          </div>
          <div className="space-y-2">
            {protections.map((p) => (
              <div key={p.label} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 dark:bg-slate-800/50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <p.icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">{p.label}</span>
                </div>
                {p.active ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-300" />}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Siren className="w-4 h-4 text-rose-600 dark:text-rose-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Threats</span>
          </div>
          <div className="space-y-2">
            {threats.map((t) => (
              <div key={t.label} className={`flex items-center justify-between p-2.5 rounded-xl border ${t.active ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' : 'bg-slate-50 dark:bg-slate-900/20 dark:bg-slate-800/50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                <div className={`flex items-center gap-2 ${t.active ? 'text-rose-700 dark:text-rose-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  <t.icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">{t.label}</span>
                </div>
                {t.active ? <Radio className="w-4 h-4 text-rose-500 animate-pulse" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent incidents */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 dark:bg-slate-800/50/50 dark:bg-slate-800/50 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Recent Unacknowledged Incidents</span>
        </div>
        <div className="p-2 max-h-[320px] overflow-y-auto space-y-1">
          {incidents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-slate-400 dark:text-slate-500">
              <CheckCircle2 className="w-10 h-10 opacity-50" />
              <p className="text-sm font-medium">No active incidents</p>
            </div>
          ) : (
            incidents.map((inc, idx) => (
              <motion.div
                key={inc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:bg-slate-900/20 dark:hover:bg-slate-800/50 dark:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:border-slate-800"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${inc.severity === 'critical' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800'}`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{inc.title}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{inc.message}</p>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">{fmtTime(inc.timestamp)}</span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

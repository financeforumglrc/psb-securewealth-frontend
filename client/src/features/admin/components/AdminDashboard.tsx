import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Shield, Users, Eye, Zap, Landmark, ArrowLeftRight, Receipt, Target,
  CircleDollarSign, Search, LogOut, LayoutDashboard, ChevronUp, ChevronDown,
  Activity, RefreshCw, CheckCircle2, XCircle, Lock, Fingerprint,
  Crown, Sparkles, AlertTriangle, Download, Filter, Server, Database,
  BarChart3, ChevronRight, Menu, ArrowUpRight, Info,
  X, History, UserCheck, UserX, Settings, Sun, Moon,
  ShieldAlert, Key, ScanLine, Globe, AlertOctagon, Siren, Unlock, BellRing,
  Radio, Skull, Clock, ClipboardList, HeartPulse
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar
} from 'recharts';
import { backendApi } from '@/shared/lib/backendApi';
import { DEMO_ACCOUNTS } from '@/shared/data/userProfiles';
import SystemArchitecture from '@/features/architecture/components/SystemArchitecture';
import AdminLoginArchitecture from '@/features/admin/components/AdminLoginArchitecture';
import FeaturesUniverse from '@/features/architecture/components/FeaturesUniverse';
import FraudIntelligenceCenter from '@/features/admin/components/FraudIntelligenceCenter';
import AlertToast from '@/features/admin/components/AlertToast';
import DemoTour from '@/features/admin/components/DemoTour';
import AlertHistoryTab from '@/features/admin/components/AlertHistoryTab';
import AdminActivityTab from '@/features/admin/components/AdminActivityTab';
import SystemHealthTab from '@/features/admin/components/SystemHealthTab';
import { can, type AdminRole, ROLE_LABELS } from '@/features/admin/lib/permissions';
import { useWealthStore } from '@/shared/store/wealthStore';
import { adminActivityService } from '@/shared/services/adminActivityService';
import { alertService } from '@/shared/services/alertService';
import { useSecurity } from '@/shared/context/SecurityContext';
import { useIsMobile } from '@/shared/hooks/useMediaQuery';

type AdminTab = 'dashboard' | 'users' | 'architecture' | 'security' | 'features' | 'logs' | 'heatmap' | 'alerts' | 'activity' | 'health';
type SortKey = 'name' | 'email' | 'created_at' | 'tier' | 'role';
type SortDir = 'asc' | 'desc';

interface UserRecord {
  id: string; email: string; name: string; phone: string | null;
  role: string; tier: string; pan_number: string | null; aadhar: string | null;
  created_at: string; last_login: string | null; face_registered: number;
  api_usage_total: number; is_active: number;
}

interface SystemStats {
  totalUsers: number; faceRegistered: number; activeToday: number;
  totalAccounts: number; totalTransactions: number; totalBills: number;
  totalGoals: number; totalLoans: number;
}

const fmtNum = (n: number) => n.toLocaleString('en-IN');

const ACTIVITY_DATA = [
  { day: 'Mon', users: 12, txns: 45 },
  { day: 'Tue', users: 18, txns: 62 },
  { day: 'Wed', users: 15, txns: 38 },
  { day: 'Thu', users: 22, txns: 78 },
  { day: 'Fri', users: 28, txns: 95 },
  { day: 'Sat', users: 35, txns: 120 },
  { day: 'Sun', users: 30, txns: 88 },
];

const TIER_DATA = [
  { name: 'Free', value: 65, color: '#64748b' },
  { name: 'Premium', value: 28, color: '#fbbf24' },
  { name: 'Enterprise', value: 7, color: '#a78bfa' },
];

const FRAUD_TREND_DATA = [
  { day: 'Mon', attempts: 12, blocked: 10 },
  { day: 'Tue', attempts: 19, blocked: 16 },
  { day: 'Wed', attempts: 15, blocked: 13 },
  { day: 'Thu', attempts: 28, blocked: 24 },
  { day: 'Fri', attempts: 35, blocked: 30 },
  { day: 'Sat', attempts: 42, blocked: 38 },
  { day: 'Sun', attempts: 31, blocked: 27 },
];

const TOP_ORIGINS_DATA = [
  { country: 'Nigeria', count: 48 },
  { country: 'Bangladesh', count: 34 },
  { country: 'Pakistan', count: 29 },
  { country: 'Russia', count: 22 },
  { country: 'China', count: 18 },
];

const chartTooltip = (dark = false) => ({
  borderRadius: '12px',
  border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
  background: dark ? '#1e293b' : '#ffffff',
  color: dark ? '#f1f5f9' : '#1e293b',
  fontSize: '12px',
  boxShadow: dark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 10px 30px rgba(0,0,0,0.08)',
});

function Badge({ children, variant = 'neutral' }: { children: React.ReactNode; variant?: 'success' | 'danger' | 'warning' | 'premium' | 'enterprise' | 'neutral' }) {
  const map: Record<string, string> = {
    success: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    danger: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    premium: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    enterprise: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${map[variant]}`}>
      {children}
    </span>
  );
}

/* ─── Safety Score Engine ─── */
interface SafetyResult {
  score: number;
  level: 'safe' | 'caution' | 'at-risk';
  reasons: { icon: any; text: string; type: 'good' | 'warn' | 'danger' }[];
}

function computeSafetyScore(user: UserRecord, securityState?: ReturnType<typeof useSecurity>['state']): SafetyResult {
  const reasons: SafetyResult['reasons'] = [];
  let riskPoints = 0;

  if (user.face_registered) {
    reasons.push({ icon: Fingerprint, text: 'Face authentication linked', type: 'good' });
  } else {
    reasons.push({ icon: Fingerprint, text: 'Face authentication not linked', type: 'danger' });
    riskPoints += 30;
  }

  if (user.pan_number) {
    reasons.push({ icon: CheckCircle2, text: 'PAN verified', type: 'good' });
  } else {
    reasons.push({ icon: AlertTriangle, text: 'PAN not provided — KYC incomplete', type: 'danger' });
    riskPoints += 15;
  }

  if (user.aadhar) {
    reasons.push({ icon: CheckCircle2, text: 'Aadhaar verified', type: 'good' });
  } else {
    reasons.push({ icon: AlertTriangle, text: 'Aadhaar not provided — KYC incomplete', type: 'danger' });
    riskPoints += 15;
  }

  if (user.phone) {
    reasons.push({ icon: CheckCircle2, text: 'Phone number on file', type: 'good' });
  } else {
    reasons.push({ icon: AlertTriangle, text: 'Phone number missing', type: 'warn' });
    riskPoints += 10;
  }

  if (user.tier === 'premium' || user.tier === 'enterprise') {
    reasons.push({ icon: Crown, text: `${user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} tier — enhanced security`, type: 'good' });
  } else {
    reasons.push({ icon: Info, text: 'Free tier — limited security features', type: 'warn' });
    riskPoints += 10;
  }

  if (user.is_active) {
    reasons.push({ icon: Activity, text: 'Account active', type: 'good' });
  } else {
    reasons.push({ icon: XCircle, text: 'Account inactive', type: 'danger' });
    riskPoints += 20;
  }

  // Demo-specific: check for blocked transactions
  const demo = DEMO_ACCOUNTS.find(d => d.id === user.id);
  if (demo) {
    const blocked = demo.transactions.filter(t => t.status === 'BLOCKED');
    if (blocked.length > 0) {
      reasons.push({ icon: AlertTriangle, text: `${blocked.length} blocked/fraudulent transaction(s) detected`, type: 'danger' });
      riskPoints += 25;
    } else {
      reasons.push({ icon: CheckCircle2, text: 'No fraudulent transactions', type: 'good' });
    }
  }

  // Real security signals (system-wide for this demo)
  if (securityState) {
    if (securityState.passkeyRegistered) {
      reasons.push({ icon: Key, text: 'FIDO2 passkey registered', type: 'good' });
    } else {
      reasons.push({ icon: Key, text: 'No FIDO2 passkey registered', type: 'warn' });
      riskPoints += 10;
    }
    if (securityState.pqTunnelActive) {
      reasons.push({ icon: ScanLine, text: 'Post-quantum tunnel active', type: 'good' });
    } else {
      reasons.push({ icon: ScanLine, text: 'Post-quantum tunnel inactive', type: 'warn' });
      riskPoints += 5;
    }
    if (securityState.behavioralDeviation > 0.3) {
      reasons.push({ icon: Activity, text: `Behavioral anomaly: ${(securityState.behavioralDeviation * 100).toFixed(0)}% deviation`, type: 'danger' });
      riskPoints += 15;
    } else {
      reasons.push({ icon: Activity, text: 'Behavioral biometrics within baseline', type: 'good' });
    }
    if (securityState.accountFrozen || securityState.trapTriggered || securityState.honeytokenTriggered) {
      reasons.push({ icon: Siren, text: 'Active security lockdown / honeytoken alert', type: 'danger' });
      riskPoints += 30;
    }
  }

  const score = Math.max(0, Math.min(100, 100 - riskPoints));
  const level = score >= 80 ? 'safe' : score >= 50 ? 'caution' : 'at-risk';
  return { score, level, reasons };
}

function SafetyBadge({ score, onClick }: { score: SafetyResult; onClick?: () => void }) {
  const config = {
    safe: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', label: 'SAFE', dotColor: '#10b981' },
    caution: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', label: 'CAUTION', dotColor: '#f59e0b' },
    'at-risk': { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-300', label: 'AT RISK', dotColor: '#ef4444' },
  }[score.level];
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${config.bg} ${config.border} ${config.text} hover:brightness-95 transition-all cursor-pointer`}>
      <Shield className="w-3 h-3" />
      <span>{score.score}</span>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.dotColor }} />
      <span>{config.label}</span>
    </button>
  );
}

/* ─── Audit Logs Tab ─── */
type AuditEventType = 'login' | 'logout' | 'transaction' | 'admin_action' | 'security_alert' | 'system_event';

interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  eventType: AuditEventType;
  action: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'danger';
}

function EventTypeBadge({ type }: { type: AuditEventType }) {
  const map: Record<AuditEventType, { label: string; icon: any; color: string; bg: string; border: string }> = {
    login: { label: 'LOGIN', icon: UserCheck, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
    logout: { label: 'LOGOUT', icon: UserX, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700' },
    transaction: { label: 'TRANSACTION', icon: ArrowLeftRight, color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800' },
    admin_action: { label: 'ADMIN', icon: Shield, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
    security_alert: { label: 'SECURITY', icon: AlertTriangle, color: 'text-red-700 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
    system_event: { label: 'SYSTEM', icon: Settings, color: 'text-cyan-700 dark:text-cyan-300', bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800' },
  };
  const config = map[type];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${config.bg} ${config.border} ${config.color}`}>
      <Icon className="w-3 h-3" /> {config.label}
    </span>
  );
}

function StatusDot({ status }: { status: 'success' | 'warning' | 'danger' }) {
  const colors = { success: '#10b981', warning: '#f59e0b', danger: '#ef4444' };
  return <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[status] }} />;
}

function AuditLogsTab() {
  const [logSearch, setLogSearch] = useState('');
  const [eventFilter, setEventFilter] = useState<AuditEventType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'warning' | 'danger'>('all');
  const [apiLogs, setApiLogs] = useState<any[] | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [logsPage, setLogsPage] = useState(1);
  const [logsLimit] = useState(25);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPages, setLogsPages] = useState(1);
  const isMobile = useIsMobile();

  useEffect(() => {
    let cancelled = false;
    setApiLoading(true);
    backendApi.adminGetAuditLogs({ q: logSearch, page: logsPage, limit: logsLimit }).then(res => {
      if (!cancelled) {
        setApiLogs(res.ok ? (res.data?.logs || []) : null);
        setLogsTotal(res.ok ? (res.data?.total || 0) : 0);
        setLogsPages(res.ok ? (res.data?.pages || 1) : 1);
        setApiLoading(false);
      }
    }).catch(() => {
      if (!cancelled) { setApiLogs(null); setApiLoading(false); }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsPage, logsLimit]);

  // Map backend audit log to frontend AuditLog format
  const mapBackendLog = (log: any): AuditLog => {
    const details = log.parsedNewValue;
    let eventType: AuditEventType = 'system_event';
    if (log.entity_type === 'auth' && log.action === 'CREATE') eventType = 'login';
    else if (log.entity_type === 'auth' && log.action === 'VIEW') eventType = 'login';
    else if (log.entity_type === 'auth' && log.action === 'UPDATE') eventType = 'logout';
    else if (log.entity_type === 'transaction') eventType = 'transaction';
    else if (log.entity_type === 'admin') eventType = 'admin_action';
    else if (log.action === 'DELETE') eventType = 'security_alert';

    let status: 'success' | 'warning' | 'danger' = 'success';
    if (details) {
      if (details.status >= 500) status = 'danger';
      else if (details.status >= 400) status = 'warning';
    }

    const actionLabel = log.action === 'CREATE' ? 'Created' :
      log.action === 'UPDATE' ? 'Updated' :
      log.action === 'DELETE' ? 'Deleted' :
      log.action === 'VIEW' ? 'Viewed' : log.action;

    const locationStr = log.location ? `${log.location.city || ''}, ${log.location.country || ''}`.replace(/^, /, '').replace(/, $/, '') : '';

    return {
      id: `LOG-${log.id}`,
      timestamp: log.created_at,
      userName: log.user_name || log.user_id || 'Unknown',
      userEmail: log.user_email || '',
      eventType,
      action: `${actionLabel} ${log.entity_type}`,
      details: details ? `${details.method} ${details.path} (${details.duration}ms)` : '',
      ipAddress: `${log.ip_address || ''}${locationStr ? ' — ' + locationStr : ''}`,
      status,
    };
  };

  const allLogs = useMemo(() => {
    return apiLogs ? apiLogs.map(mapBackendLog) : [];
  }, [apiLogs]);

  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      if (eventFilter !== 'all' && log.eventType !== eventFilter) return false;
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;
      return true;
    });
  }, [allLogs, eventFilter, statusFilter]);

  // Debounced server-side search for audit logs
  useEffect(() => {
    const t = setTimeout(() => { setLogsPage(1); }, 500);
    return () => clearTimeout(t);
  }, [logSearch]);

  const counts = useMemo(() => {
    return {
      total: allLogs.length,
      alerts: allLogs.filter(l => l.eventType === 'security_alert').length,
      failed: allLogs.filter(l => l.status === 'danger').length,
      success: allLogs.filter(l => l.status === 'success').length,
    };
  }, [allLogs]);

  return (
    <motion.div key="logs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-[1600px]">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Audit Logs</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Comprehensive activity trail for compliance and monitoring</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: counts.total, icon: History, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-800' },
          { label: 'Security Alerts', value: counts.alerts, icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-100 dark:border-red-800' },
          { label: 'Failed / Blocked', value: counts.failed, icon: XCircle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-800' },
          { label: 'Successful', value: counts.success, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} ${s.border} border rounded-xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</span>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{fmtNum(s.value)}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" value={logSearch} onChange={(e) => setLogSearch(e.target.value)}
              placeholder="Search by user, action, details, IP..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition-all" />
          </div>
          <div className="flex items-center gap-2">
            <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-400">
              <option value="all">All Events</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="transaction">Transaction</option>
              <option value="admin_action">Admin</option>
              <option value="security_alert">Security</option>
              <option value="system_event">System</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-400">
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
            </select>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table / Mobile Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {isMobile ? (
          <div className="p-3 space-y-2">
            {apiLoading && filteredLogs.length === 0 && (
              <div className="py-10 text-center">
                <RefreshCw className="w-7 h-7 text-slate-400 dark:text-slate-600 animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading audit logs...</p>
              </div>
            )}
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <EventTypeBadge type={log.eventType} />
                  <StatusDot status={log.status} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{log.userName}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{log.userEmail}</p>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{log.action}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2" title={log.details}>{log.details}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  <span>{new Date(log.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  <span>{log.ipAddress}</span>
                </div>
              </div>
            ))}
            {!apiLoading && filteredLogs.length === 0 && (
              <div className="py-10 text-center">
                <Search className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No audit logs match your filters</p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Event</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Details</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {apiLoading && filteredLogs.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="w-7 h-7 text-slate-400 dark:text-slate-600 animate-spin" />
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading audit logs from server...</p>
                    </div>
                  </td></tr>
                )}
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-50 dark:border-slate-800 hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap font-mono">
                      {new Date(log.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{log.userName}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{log.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><EventTypeBadge type={log.eventType} /></td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 text-xs font-medium">{log.action}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs max-w-xs truncate" title={log.details}>{log.details}</td>
                    <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500 text-[11px] font-mono">{log.ipAddress}</td>
                    <td className="px-5 py-3.5"><StatusDot status={log.status} /></td>
                  </tr>
                ))}
                {!apiLoading && filteredLogs.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-14 text-center dark:text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No audit logs match your filters</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredLogs.length}</strong> of <strong className="text-slate-800 dark:text-slate-200">{logsTotal}</strong> events
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLogsPage(p => Math.max(1, p - 1))}
              disabled={logsPage <= 1}
              className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Page {logsPage} of {logsPages}</span>
            <button
              onClick={() => setLogsPage(p => Math.min(logsPages, p + 1))}
              disabled={logsPage >= logsPages}
              className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECURITY OPS TAB — Clean Light Theme
   ═══════════════════════════════════════════════════════════════ */
function SecurityOpsTab({ role }: { role: AdminRole }) {
  const { state, dispatch } = useSecurity();
  const [simulatedAttacks, setSimulatedAttacks] = useState<{id: number; type: string; blocked: boolean; time: string}[]>([]);

  useEffect(() => {
    const attackTypes = ['Credential Stuffing', 'SQL Injection', 'MITM Attempt', 'Device Spoofing', 'Behavioral Anomaly', 'Phishing Link'];
    const interval = setInterval(() => {
      setSimulatedAttacks(prev => {
        const next = [{
          id: Date.now(),
          type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
          blocked: Math.random() > 0.15,
          time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
        }, ...prev].slice(0, 8);
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { id: 'tpm', label: 'TPM Attestation', sub: 'Hardware root of trust', active: state.tpmAttested, icon: MicrochipIcon, color: 'emerald' },
    { id: 'passkey', label: 'FIDO2 Passkey', sub: 'Phishing-resistant auth', active: state.passkeyRegistered, icon: Fingerprint, color: 'sky' },
    { id: 'enclave', label: 'Secure Enclave', sub: 'TEE-isolated keys', active: state.enclaveVerified, icon: Lock, color: 'violet' },
    { id: 'pq', label: 'PQ Tunnel', sub: 'ML-KEM-768 encryption', active: state.pqTunnelActive, icon: ScanLine, color: 'indigo' },
    { id: 'behavioral', label: 'Behavioral Bio', sub: 'Anomaly detection', active: state.behavioralBaseline !== null && state.behavioralDeviation < 0.3, icon: Activity, color: 'amber' },
    { id: 'did', label: 'Decentralized ID', sub: 'Verifiable credentials', active: state.didIssued, icon: Globe, color: 'teal' },
    { id: 'fraud', label: 'Fraud Engine', sub: 'AI risk scoring', active: true, icon: Search, color: 'orange' },
    { id: 'browser', label: 'Browser Threat', sub: 'eBPF runtime guard', active: !state.lastEbpfAlert, icon: ShieldAlert, color: 'rose' },
  ];

  const events = [
    state.tpmAttested && { icon: CheckCircle2, text: 'TPM attestation verified', time: 'Recent', type: 'good' as const },
    state.passkeyRegistered && { icon: Key, text: 'FIDO2 passkey registered', time: 'Recent', type: 'good' as const },
    state.pqTunnelActive && { icon: ScanLine, text: 'ML-KEM-768 quantum-safe tunnel active', time: 'Recent', type: 'good' as const },
    state.didIssued && { icon: Globe, text: `Verifiable credential issued: ${state.didUri?.slice(0, 24)}...`, time: 'Recent', type: 'good' as const },
    state.lastEbpfAlert && { icon: AlertOctagon, text: `Browser threat: ${state.lastEbpfAlert}`, time: 'Recent', type: 'danger' as const },
    state.honeytokenTriggered && { icon: Siren, text: 'HONEYTOKEN triggered — account frozen', time: 'Recent', type: 'danger' as const },
    state.trapTriggered && { icon: AlertTriangle, text: 'Transaction trap activated — lockdown 24h', time: 'Recent', type: 'danger' as const },
    state.behavioralDeviation > 0.3 && { icon: Activity, text: `Behavioral anomaly: ${(state.behavioralDeviation * 100).toFixed(0)}% deviation`, time: 'Recent', type: 'warning' as const },
  ].filter(Boolean);

  const scoreConfig = state.trustScore >= 80
    ? { label: 'High Trust', text: 'text-emerald-600 dark:text-emerald-300', bar: 'bg-emerald-500 dark:bg-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' }
    : state.trustScore >= 50
    ? { label: 'Moderate Trust', text: 'text-amber-600 dark:text-amber-300', bar: 'bg-amber-500 dark:bg-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' }
    : { label: 'Low Trust', text: 'text-rose-600 dark:text-rose-300', bar: 'bg-rose-500 dark:bg-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800' };

  const activeCount = features.filter(f => f.active).length;
  const activePct = Math.round((activeCount / features.length) * 100);

  const colorMap: Record<string, {bg: string; border: string; text: string}> = {
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-600 dark:text-emerald-300' },
    sky: { bg: 'bg-sky-50 dark:bg-sky-900/20', border: 'border-sky-200 dark:border-sky-800', text: 'text-sky-600 dark:text-sky-300' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800', text: 'text-violet-600 dark:text-violet-300' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-600 dark:text-indigo-300' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-300' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-800', text: 'text-teal-600 dark:text-teal-300' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-600 dark:text-orange-300' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-600 dark:text-rose-300' },
  };

  return (
    <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security Operations Center</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Zero-trust architecture with 8 layers of active defence</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Trust Score</span>
          <span className={`text-2xl font-bold ${scoreConfig.text}`}>{state.trustScore}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">/100</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${scoreConfig.bg} ${scoreConfig.text} border ${scoreConfig.border}`}>{scoreConfig.label}</span>
        </div>
      </div>

      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Trust Score Gauge */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Platform Trust Score
          </h3>
          <div className="relative w-44 h-44 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" className="stroke-slate-100 dark:stroke-slate-700" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${state.trustScore * 2.64} 264`}
                className={`${scoreConfig.text} transition-all duration-1000`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${scoreConfig.text}`}>{state.trustScore}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">{scoreConfig.label}</span>
            </div>
          </div>
          <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full ${scoreConfig.bar} rounded-full transition-all duration-500`} style={{ width: `${state.trustScore}%` }} />
          </div>
        </div>

        {/* Security Layers */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Active Security Layers
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800">{activeCount}/{features.length} ACTIVE</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              const c = colorMap[f.color];
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`p-3 rounded-xl border ${f.active ? c.border : 'border-slate-200 dark:border-slate-700'} ${f.active ? c.bg : 'bg-slate-50 dark:bg-slate-800/50'} transition-all hover:shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${f.active ? c.text : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className={`w-2 h-2 rounded-full ${f.active ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  </div>
                  <p className={`text-xs font-bold ${f.active ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>{f.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{f.sub}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Admin Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-700 dark:text-slate-300" /> Incident Response Controls
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => dispatch({ type: 'UNFREEZE_ACCOUNT' })} disabled={!can(role, 'unfreeze') || !state.accountFrozen}
              className="px-4 py-3 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 disabled:opacity-40 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors flex items-center gap-2">
              <Unlock className="w-4 h-4" /> Unfreeze Account
            </button>
            <button onClick={() => dispatch({ type: 'HONEYTOKEN_RESET' })} disabled={!can(role, 'reset_honeytoken') || !state.honeytokenTriggered}
              className="px-4 py-3 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 disabled:opacity-40 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Reset Honeytoken
            </button>
            <button onClick={() => dispatch({ type: 'TRAP_RESET' })} disabled={!can(role, 'reset_trap') || !state.trapTriggered}
              className="px-4 py-3 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 disabled:opacity-40 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Reset Trap
            </button>
            <button onClick={() => dispatch({ type: 'EBPF_ALERT', alert: '' })} disabled={!can(role, 'clear_threat')}
              className="px-4 py-3 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:bg-slate-700 transition-colors flex items-center gap-2">
              <X className="w-4 h-4" /> Clear Threat
            </button>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Defence Coverage</span>
              <span className="text-emerald-600 dark:text-emerald-300 font-bold">{activePct}%</span>
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${activePct}%` }}
                transition={{ duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Live Attack Simulation */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" /> Live Threat Interception
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              AI SHIELD ACTIVE
            </span>
          </div>
          <div className="p-2 space-y-1 max-h-[280px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {simulatedAttacks.map((attack, idx) => (
                <motion.div
                  key={attack.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${attack.blocked ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800'}`}>
                      {attack.blocked ? <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-300" /> : <Skull className="w-4 h-4 text-rose-600 dark:text-rose-300" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{attack.type}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{attack.time}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${attack.blocked ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'}`}>
                    {attack.blocked ? 'BLOCKED' : 'ALERT'}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Event feed */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Recent Security Events
          </h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">{events.length} events</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {events.length > 0 ? events.map((e, i) => {
            const ev = e as any;
            const Icon = ev.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-800/50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  ev.type === 'good' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300' :
                  ev.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-300' :
                  'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{ev.text}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{ev.time}</p>
                </div>
              </motion.div>
            );
          }) : (
            <div className="px-5 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">No recent security events</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MicrochipIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 12h2" /><path d="M4 12h2" /><path d="M12 18v2" /><path d="M12 4v2" />
      <path d="M8 8h8v8H8z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN SCREEN — Full-screen split layout
   ═══════════════════════════════════════════════════════════════ */
function LoginScreen({ onLogin, loading, error }: { onLogin: (id: string, pw: string) => void; loading: boolean; error: string }) {
  const [id, setId] = useState('TEAM EXCELLENT MINDS');
  const [pw, setPw] = useState('');

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/3 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-slate-50">
        <div className="absolute inset-0 opacity-40">
          <svg className="w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="none">
            <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(16,185,129,0.08)" strokeWidth="0.5" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-emerald-200/30 blur-[80px]" />
        <div className="absolute bottom-40 left-0 w-96 h-96 rounded-full bg-teal-200/20 blur-[100px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl bg-white/80 backdrop-blur border border-emerald-100 shadow-sm flex items-center justify-center">
              <Landmark className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-slate-800 font-bold text-lg tracking-tight">PSB SecureWealth</h2>
              <p className="text-slate-500 text-[11px] font-medium">Internet Banking Portal</p>
            </div>
          </div>
          <div className="space-y-6 max-w-sm">
            <h1 className="text-4xl font-bold text-slate-900 leading-tight">Banking Control Center</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Secure administrative access for authorized personnel only. All login attempts are monitored and logged for compliance.
            </p>
          </div>
        </div>
        <div className="relative z-10 space-y-3">
          {[
            { icon: ShieldCheck, text: 'RBI Licensed & Regulated' },
            { icon: Lock, text: '256-bit SSL Encryption' },
            { icon: Activity, text: 'Real-time System Monitoring' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-slate-600 text-sm">
              <item.icon className="w-4 h-4 text-emerald-600" /> {item.text}
            </div>
          ))}
          <p className="text-[11px] text-slate-400 pt-4">© 2025 Punjab & Sind Bank. Government of India Undertaking.</p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/[0.04] rounded-full blur-[120px]" />
        </div>
        <a href="/"
          className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-emerald-700 hover:bg-white border border-slate-200 hover:border-emerald-200 transition-all z-20 bg-white/80 backdrop-blur shadow-sm">
          <LayoutDashboard className="w-3.5 h-3.5" /> Back to Website
        </a>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-slate-800 font-bold text-sm">PSB SecureWealth</h2>
              <p className="text-slate-400 text-[10px]">Admin Portal</p>
            </div>
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-500 text-sm">Enter your admin credentials to access the control center.</p>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Admin ID</label>
              <input type="text" value={id} onChange={(e) => setId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onLogin(id, pw)}
                placeholder="TEAM EXCELLENT MINDS"
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Password</label>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onLogin(id, pw)}
                placeholder="Enter your password"
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" />
            </div>
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => onLogin(id, pw)} disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15">
              {loading ? <> <RefreshCw className="w-4 h-4 animate-spin" /> Initializing Secure Connection...</> : <> <Lock className="w-4 h-4" /> Secure Login</>}
            </button>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-400">Authorized personnel only. Unauthorized access is a punishable offence under IT Act, 2000.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD — Full-screen sidebar layout
   ═══════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [role, setRole] = useState<AdminRole>(() => (sessionStorage.getItem('sw-admin-role') as AdminRole) || 'superadmin');
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit] = useState(25);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPages, setUsersPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const { state: securityState } = useSecurity();

  const activityData = useMemo(() => {
    if (!metrics?.registrations || !metrics?.transactions) return ACTIVITY_DATA;
    return metrics.registrations.map((r: any, i: number) => ({ day: r.day, users: r.users, txns: metrics.transactions[i]?.txns || 0 }));
  }, [metrics]);
  const tierData = useMemo(() => metrics?.tierDistribution || TIER_DATA, [metrics]);
  const fraudTrendData = useMemo(() => metrics?.fraudTrends || FRAUD_TREND_DATA, [metrics]);
  const topOriginsData = useMemo(() => (metrics?.topOrigins?.length ? metrics.topOrigins : TOP_ORIGINS_DATA), [metrics]);

  // Theme: login screen stays light; after login respect global dark mode
  const darkMode = useWealthStore((s) => s.darkMode);
  const toggleDarkMode = useWealthStore((s) => s.toggleDarkMode);
  useEffect(() => {
    if (!isLoggedIn) {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    } else if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [isLoggedIn, darkMode]);

  // Persist RBAC role across reloads
  useEffect(() => {
    sessionStorage.setItem('sw-admin-role', role);
  }, [role]);

  // Audit admin role changes
  useEffect(() => {
    adminActivityService.log('Role Switched', ROLE_LABELS[role], `Admin switched role to ${ROLE_LABELS[role]}`, role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleLogin = async (adminId: string, password: string) => {
    setLoginError('');
    if (!adminId || !password) { setLoginError('Admin ID and Password are required'); return; }
    setLoading(true);
    const res = await backendApi.adminLogin(adminId, password);
    setLoading(false);
    if (res.ok && res.data?.success) {
      setIsLoggedIn(true);
      sessionStorage.setItem('sw-admin-session', 'true');
      if (res.data?.token) sessionStorage.setItem('sw-admin-token', res.data.token);
      setOfflineMode(!!res.data?.offline);
    } else {
      setLoginError(res.data?.error || 'Invalid credentials. Please try again.');
    }
  };

  // Convert demo accounts to UserRecord format
  const demoUsers: UserRecord[] = useMemo(() => {
    // Keep the first 6 tiers exactly as designed; derive KYC for generated accounts.
    const tierOverrides: Record<string, string> = {
      'deepanshu-sharma': 'premium',
      'mrigesh-mohanty': 'premium',
      'rikshita-barua': 'free',
      'ishita-anand': 'enterprise',
      'tripti-jain': 'premium',
      'kunal-saxena': 'free',
    };

    function hash(str: string): number {
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
      }
      return h >>> 0;
    }

    function rnd(seed: string, idx = 0): number {
      const x = Math.sin(hash(seed) + idx * 0.573) * 10000;
      return x - Math.floor(x);
    }

    function generatePhone(idx: number): string {
      const num = 9876543210 + idx;
      const s = String(num);
      return `+91-${s.slice(0, 5)}-${s.slice(5)}`;
    }

    function generatePan(seed: string): string {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let pan = '';
      for (let i = 0; i < 5; i++) pan += letters[Math.floor(rnd(seed, i) * 26)];
      for (let i = 5; i < 9; i++) pan += Math.floor(rnd(seed, i) * 10);
      pan += letters[Math.floor(rnd(seed, 9) * 26)];
      return pan;
    }

    function generateAadhaar(seed: string): string {
      const d = Array.from({ length: 12 }, (_, i) => Math.floor(rnd(seed, 10 + i) * 10));
      return `${d.slice(0, 4).join('')}-${d.slice(4, 8).join('')}-${d.slice(8, 12).join('')}`;
    }

    function deriveTier(demo: (typeof DEMO_ACCOUNTS)[number]): string {
      if (tierOverrides[demo.id]) return tierOverrides[demo.id];
      if (demo.netWorth >= 3_00_00_000) return 'enterprise';
      if (demo.netWorth >= 1_00_00_000) return 'premium';
      return 'free';
    }

    const fromDemoAccounts = DEMO_ACCOUNTS.map((demo, idx) => ({
      id: demo.id,
      email: demo.email,
      name: demo.profile.name,
      phone: generatePhone(idx),
      role: 'user',
      tier: deriveTier(demo),
      pan_number: generatePan(demo.id),
      aadhar: generateAadhaar(demo.id),
      created_at: new Date(Date.now() - (idx + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_login: new Date(Date.now() - idx * 2 * 24 * 60 * 60 * 1000).toISOString(),
      face_registered: idx < Math.ceil(DEMO_ACCOUNTS.length * 0.65) ? 1 : 0,
      api_usage_total: Math.floor(rnd(demo.id, 1000) * 500),
      is_active: 1,
    }));

    // Generate additional synthetic account holders so the admin list looks populated
    const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Krishna', 'Ayaan', 'Ishaan', 'Rohan', 'Karan', 'Priya', 'Neha', 'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Navya', 'Kavya', 'Pooja', 'Ritu', 'Amit', 'Vikram', 'Rahul', 'Sneha', 'Meera', 'Tanya', 'Divya', 'Yash', 'Ravi'];
    const lastNames = ['Sharma', 'Kumar', 'Singh', 'Patel', 'Gupta', 'Reddy', 'Nair', 'Iyer', 'Verma', 'Yadav', 'Mehta', 'Joshi', 'Desai', 'Shah', 'Bhat', 'Rao', 'Kapoor', 'Malhotra', 'Choudhary', 'Menon', 'Jain', 'Agarwal', 'Banerjee', 'Das', 'Ghosh', 'Mishra', 'Pandey', 'Tiwari', 'Chauhan', 'Kaur'];
    const tiers: ('free' | 'premium' | 'enterprise')[] = ['free', 'free', 'free', 'premium', 'premium', 'enterprise'];
    const synthetic: UserRecord[] = [];
    for (let i = 0; i < 30; i++) {
      const idx = DEMO_ACCOUNTS.length + i;
      const fname = firstNames[i % firstNames.length];
      const lname = lastNames[(i * 3) % lastNames.length];
      const id = `${fname.toLowerCase()}-${lname.toLowerCase()}-${i + 1}`;
      const seed = id;
      const phoneBase = 9876500000 + idx;
      synthetic.push({
        id,
        email: `${fname.toLowerCase()}.${lname.toLowerCase()}${i + 1}@example.com`,
        name: `${fname} ${lname}`,
        phone: `+91-${String(phoneBase).slice(0, 5)}-${String(phoneBase).slice(5)}`,
        role: 'user',
        tier: tiers[idx % tiers.length],
        pan_number: generatePan(seed),
        aadhar: generateAadhaar(seed),
        created_at: new Date(Date.now() - (idx + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_login: new Date(Date.now() - idx * 2 * 24 * 60 * 60 * 1000).toISOString(),
        face_registered: idx % 3 === 0 ? 1 : 0,
        api_usage_total: Math.floor(rnd(seed, 1000) * 500),
        is_active: 1,
      });
    }

    return [...fromDemoAccounts, ...synthetic];
  }, []);

  const loadData = async (page = usersPage, opts: { q?: string; sort?: SortKey; order?: SortDir } = {}) => {
    setLoading(true);

    const [usersRes, statsRes, metricsRes] = await Promise.all([
      backendApi.adminGetUsers({ q: opts.q ?? search, sort: opts.sort ?? sortKey, order: opts.order ?? sortDir, page, limit: usersLimit }),
      backendApi.adminGetStats(),
      backendApi.adminGetDashboardMetrics(7),
    ]);

    if (usersRes.ok && Array.isArray(usersRes.data?.users) && usersRes.data.users.length > 0) {
      setUsers(usersRes.data.users);
      setUsersTotal(usersRes.data.total || 0);
      setUsersPages(usersRes.data.pages || 1);
    } else {
      // Fallback to demo users when backend is unreachable or returns empty data
      setUsers(demoUsers);
      setUsersTotal(demoUsers.length);
      setUsersPages(1);
    }

    const backendStats = statsRes.ok ? (statsRes.data?.stats || null) : null;
    if (backendStats && backendStats.totalUsers > 0) {
      setStats(backendStats);
    } else {
      const syntheticCount = demoUsers.length - DEMO_ACCOUNTS.length;
      const demoAccounts = DEMO_ACCOUNTS.reduce((sum, d) => sum + d.assets.length, 0);
      const demoTxns = DEMO_ACCOUNTS.reduce((sum, d) => sum + d.transactions.length, 0);
      const demoGoals = DEMO_ACCOUNTS.reduce((sum, d) => sum + d.goals.length, 0);
      setStats({
        totalUsers: demoUsers.length,
        faceRegistered: demoUsers.filter(u => u.face_registered).length,
        activeToday: demoUsers.filter(u => u.is_active).length,
        totalAccounts: demoAccounts + syntheticCount,
        totalTransactions: demoTxns + syntheticCount * 4,
        totalBills: syntheticCount,
        totalGoals: demoGoals + syntheticCount,
        totalLoans: demoUsers.filter(u => u.tier === 'premium' || u.tier === 'enterprise').length,
      });
    }

    if (metricsRes.ok && metricsRes.data?.metrics) {
      setMetrics(metricsRes.data.metrics);
    }

    setLoading(false);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('sw-admin-session');
    if (saved === 'true') {
      setIsLoggedIn(true);
      setOfflineMode(sessionStorage.getItem('sw-admin-token') === 'sw-demo-admin-token');
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
      alertService.startPolling(15000);
    }
    return () => alertService.stopPolling();
  }, [isLoggedIn]);

  // Keyboard shortcuts for tabs
  useEffect(() => {
    if (!isLoggedIn) return;
    const keys: Record<string, AdminTab> = {
      '1': 'dashboard', '2': 'users', '3': 'architecture',
      '4': 'security', '5': 'features', '6': 'logs', '7': 'heatmap', '8': 'alerts', '9': 'health',
    };
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key in keys && !e.metaKey && !e.ctrlKey) {
        const target = keys[e.key];
        if (target === 'health' && !can(role, 'view_health')) return;
        e.preventDefault();
        setTab(target);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isLoggedIn, role]);

  const toggleSort = (key: SortKey) => {
    const nextKey = key;
    let nextDir: SortDir = 'desc';
    if (sortKey === key) {
      nextDir = sortDir === 'asc' ? 'desc' : 'asc';
      setSortDir(nextDir);
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setUsersPage(1);
    loadData(1, { sort: nextKey, order: nextDir });
  };

  // Debounced server-side search for account holders
  useEffect(() => {
    const t = setTimeout(() => {
      if (isLoggedIn) {
        setUsersPage(1);
        loadData(1);
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, isLoggedIn]);

  const handleToggleUserStatus = async (u: UserRecord) => {
    const next = !u.is_active;
    const res = await backendApi.adminUpdateUserStatus(u.id, next);
    if (res.ok) {
      adminActivityService.log(next ? 'Activate User' : 'Deactivate User', u.email, `User ${u.name} ${next ? 'activated' : 'deactivated'}`);
      loadData(usersPage);
    }
  };

  const handleUpdateUserRole = async (u: UserRecord, newRole: string) => {
    const res = await backendApi.adminUpdateUser(u.id, { role: newRole });
    if (res.ok) {
      adminActivityService.log('Update User Role', u.email, `Role changed to ${newRole}`);
      loadData(usersPage);
    }
  };

  const handleUpdateUserTier = async (u: UserRecord, newTier: string) => {
    const res = await backendApi.adminUpdateUser(u.id, { tier: newTier });
    if (res.ok) {
      adminActivityService.log('Update User Tier', u.email, `Tier changed to ${newTier}`);
      loadData(usersPage);
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} loading={loading} error={loginError} />;
  }

  const navItems = [
    { key: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'users' as AdminTab, label: 'Account Holders', icon: Users },
    { key: 'architecture' as AdminTab, label: 'Architecture', icon: Server },
    { key: 'security' as AdminTab, label: 'Security Ops', icon: ShieldAlert },
    { key: 'features' as AdminTab, label: 'Features', icon: BarChart3 },
    { key: 'logs' as AdminTab, label: 'Audit Logs', icon: Activity },
    { key: 'activity' as AdminTab, label: 'Admin Activity', icon: ClipboardList },
    { key: 'health' as AdminTab, label: 'System Health', icon: HeartPulse },
    { key: 'heatmap' as AdminTab, label: 'Fraud Intel', icon: Globe },
    { key: 'alerts' as AdminTab, label: 'Alert Center', icon: BellRing },
  ];

  const visibleNav = navItems.filter(i => i.key !== 'health' || can(role, 'view_health'));

  function AnimatedCounter({ value }: { value: number }) {
    const [display, setDisplay] = useState(value);
    useEffect(() => {
      const start = display;
      const end = value;
      if (start === end) return;
      const duration = 800;
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

  const heroStats = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, change: '+12%', up: true, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', gradient: 'from-emerald-500/10 to-emerald-500/5' },
    { label: 'Face Registered', value: stats?.faceRegistered ?? 0, icon: Eye, change: '+8%', up: true, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', gradient: 'from-blue-500/10 to-blue-500/5' },
    { label: 'Active Today', value: stats?.activeToday ?? 0, icon: Zap, change: '+24%', up: true, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', gradient: 'from-amber-500/10 to-amber-500/5' },
    { label: 'Total Accounts', value: stats?.totalAccounts ?? 0, icon: Landmark, change: '+5%', up: true, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', gradient: 'from-violet-500/10 to-violet-500/5' },
  ];

  const secondaryStats = [
    { label: 'Transactions', value: stats?.totalTransactions ?? 0, icon: ArrowLeftRight },
    { label: 'Bills', value: stats?.totalBills ?? 0, icon: Receipt },
    { label: 'Goals', value: stats?.totalGoals ?? 0, icon: Target },
    { label: 'Loans', value: stats?.totalLoans ?? 0, icon: CircleDollarSign },
  ];

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
      {/* Subtle ambient background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 10% 10%, rgba(16,185,129,0.08) 0%, transparent 30%), radial-gradient(circle at 90% 90%, rgba(6,182,212,0.06) 0%, transparent 30%)',
        }}
      />
      {/* ─── Sidebar ─── */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:static md:translate-x-0 z-[100] w-64 h-full flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl transition-transform duration-300`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">Admin Portal</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">PSB SecureWealth</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <button key={item.key} onClick={() => { setTab(item.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative group ${
                  active
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-lg shadow-emerald-500/10'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}>
                {active && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full"
                  />
                )}
                <Icon className={`w-[18px] h-[18px] transition-colors ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                {item.label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              </button>
            );
          })}
        </nav>

        {/* System Status */}
        <div className="p-4 mx-4 mb-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">System Status</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">ONLINE</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><Server className="w-3 h-3" /> API</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">99.9%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><Database className="w-3 h-3" /> DB</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Healthy</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <button onClick={() => { backendApi.logout(); sessionStorage.removeItem('sw-admin-session'); setIsLoggedIn(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut className="w-[18px] h-[18px]" /> Logout
          </button>
          <a href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
            <LayoutDashboard className="w-[18px] h-[18px]" /> Main Dashboard
          </a>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-[90] md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                {tab === 'dashboard' && 'Control Center'}
                {tab === 'users' && 'Account Holders'}
                {tab === 'architecture' && 'System Architecture'}
                {tab === 'security' && 'Security Operations'}
                {tab === 'features' && 'Cosmos Features'}
                {tab === 'logs' && 'Audit Logs'}
                {tab === 'activity' && 'Admin Activity'}
                {tab === 'health' && 'System Health'}
                {tab === 'heatmap' && 'Fraud Intelligence Center'}
                {tab === 'alerts' && 'Alert Center'}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <select
              value={role}
              onChange={e => setRole(e.target.value as AdminRole)}
              className="hidden sm:block px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 focus:outline-none focus:border-emerald-400 cursor-pointer"
              title="Switch admin role (demo)"
            >
              {(['superadmin', 'analyst', 'viewer'] as AdminRole[]).map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
            <AlertToast />
            <button onClick={() => loadData()} disabled={loading}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 shadow-sm shadow-emerald-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">System Online</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {offlineMode && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Backend is offline — showing demo/synthetic data. Refresh or re-login once the backend is deployed to see live data.</span>
            </div>
          )}
          <AnimatePresence mode="wait">
            {/* ═════ DASHBOARD ═════ */}
            {tab === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-[1600px]">
                {/* Hero Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {heroStats.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className={`${s.bg} ${s.border} border rounded-2xl p-5 relative overflow-hidden group hover:shadow-lg transition-all duration-300`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-50`} />
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border ${s.border} dark:border-slate-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                              <Icon className={`w-5 h-5 ${s.color}`} />
                            </div>
                            <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${s.up ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              <ArrowUpRight className="w-3 h-3" /> {s.change}
                            </span>
                          </div>
                          <p className="text-3xl font-bold text-slate-900 dark:text-white"><AnimatedCounter value={s.value} /></p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{s.label}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {secondaryStats.map((s, idx) => {
                    const Icon = s.icon;
                    return (
                      <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.04 }}
                        className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700/50 p-4 flex items-center gap-3 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-slate-900 dark:text-white"><AnimatedCounter value={s.value} /></p>
                          <p className="text-[11px] text-slate-500 font-medium">{s.label}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Safety Overview */}
                {users.length > 0 && (() => {
                  const safetyMap = users.map(u => computeSafetyScore(u, securityState));
                  const safe = safetyMap.filter(s => s.level === 'safe').length;
                  const caution = safetyMap.filter(s => s.level === 'caution').length;
                  const atRisk = safetyMap.filter(s => s.level === 'at-risk').length;
                  return (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Safety Overview</h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">Account security health across all holders</p>
                        </div>
                        <button onClick={() => setTab('users')} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                          View All <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{safe}</p>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Safe Accounts</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{caution}</p>
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Caution</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-red-700 dark:text-red-300">{atRisk}</p>
                            <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">At Risk</p>
                          </div>
                        </div>
                      </div>
                      {/* Mini bar */}
                      <div className="mt-4 flex h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500" style={{ width: `${users.length ? (safe / users.length) * 100 : 0}%` }} />
                        <div className="bg-amber-500" style={{ width: `${users.length ? (caution / users.length) * 100 : 0}%` }} />
                        <div className="bg-red-500" style={{ width: `${users.length ? (atRisk / users.length) * 100 : 0}%` }} />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                        <span>{users.length ? Math.round((safe / users.length) * 100) : 0}% Safe</span>
                        <span>{users.length ? Math.round((atRisk / users.length) * 100) : 0}% At Risk</span>
                      </div>
                    </motion.div>
                  );
                })()}

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Activity Overview</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">User registrations vs transactions</p>
                      </div>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Users</span>
                        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><div className="w-2 h-2 rounded-full bg-blue-500" /> Transactions</span>
                      </div>
                    </div>
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData}>
                          <defs>
                            <linearGradient id="uGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                            <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={chartTooltip(darkMode)} />
                          <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} fill="url(#uGrad)" />
                          <Area type="monotone" dataKey="txns" stroke="#3b82f6" strokeWidth={2} fill="url(#tGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Tier Distribution</h3>
                    <p className="text-[11px] text-slate-500 mb-4">User plan breakdown</p>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={tierData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                            {tierData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip contentStyle={chartTooltip(darkMode)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-2">
                      {tierData.map((t: any) => (
                        <span key={t.name} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <div className="w-2 h-2 rounded-full" style={{ background: t.color }} /> {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fraud Intelligence */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fraud Attempt Trend</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Attempts vs auto-blocked events over the last 7 days</p>
                      </div>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><div className="w-2 h-2 rounded-full bg-rose-500" /> Attempts</span>
                        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Blocked</span>
                      </div>
                    </div>
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={fraudTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={chartTooltip(darkMode)} />
                          <Line type="monotone" dataKey="attempts" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} activeDot={{ r: 5 }} />
                          <Line type="monotone" dataKey="blocked" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Top Attack Origins</h3>
                    <p className="text-[11px] text-slate-500 mb-4">Countries by fraud attempt volume</p>
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topOriginsData} layout="vertical" margin={{ left: 20, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                          <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="country" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={80} />
                          <Tooltip contentStyle={chartTooltip(darkMode)} />
                          <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Recent Users */}
                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Account Holders</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Latest user registrations</p>
                    </div>
                    <button onClick={() => setTab('users')} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                      View All <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                          <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                          <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                          <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tier</th>
                          <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Face Auth</th>
                          <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.slice(0, 5).map((u) => (
                          <tr key={u.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-bold">
                                  {u.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                            <td className="px-5 py-3">
                              {u.tier === 'premium' ? <Badge variant="premium"><Crown className="w-3 h-3" /> PREMIUM</Badge> :
                               u.tier === 'enterprise' ? <Badge variant="enterprise"><Sparkles className="w-3 h-3" /> ENTERPRISE</Badge> :
                               <Badge variant="neutral">FREE</Badge>}
                            </td>
                            <td className="px-5 py-3">
                              {u.face_registered ? (
                                <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium"><Fingerprint className="w-3.5 h-3.5" /> Linked</span>
                              ) : (
                                <span className="flex items-center gap-1 text-slate-400 text-xs font-medium"><Fingerprint className="w-3.5 h-3.5" /> Not linked</span>
                              )}
                            </td>
                            <td className="px-5 py-3">
                              {u.is_active ? <Badge variant="success"><CheckCircle2 className="w-3 h-3" /> ACTIVE</Badge> : <Badge variant="danger"><XCircle className="w-3 h-3" /> INACTIVE</Badge>}
                            </td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400 text-sm">No users registered yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═════ USERS ═════ */}
            {tab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 max-w-[1600px]">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Holders</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage and monitor all registered users</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex-1 relative w-full sm:w-auto">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email, phone, PAN, Aadhar..."
                        className="w-full sm:w-80 pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition-all" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium"><strong className="text-slate-800">{users.length}</strong> accounts</span>
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <Filter className="w-3.5 h-3.5" /> Filter
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Export
                      </button>
                    </div>
                  </div>

                  {isMobile ? (
                    <div className="p-3 space-y-2">
                      {users.map((u) => {
                        const score = computeSafetyScore(u, securityState);
                        return (
                          <div key={u.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                            <div onClick={() => setSelectedUser(u)} className="flex items-center justify-between gap-3 cursor-pointer">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[11px] font-bold shrink-0">
                                  {u.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{u.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
                                </div>
                              </div>
                              {u.is_active ? <Badge variant="success">ACTIVE</Badge> : <Badge variant="danger">INACTIVE</Badge>}
                            </div>
                            <div onClick={() => setSelectedUser(u)} className="flex flex-wrap items-center gap-2 cursor-pointer">
                              {u.tier === 'premium' ? <Badge variant="premium">PREMIUM</Badge> : u.tier === 'enterprise' ? <Badge variant="enterprise">ENTERPRISE</Badge> : <Badge variant="neutral">FREE</Badge>}
                              <Badge variant="neutral">{u.role}</Badge>
                              {u.face_registered ? <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-medium flex items-center gap-1"><Fingerprint className="w-3 h-3" /> Face</span> : null}
                            </div>
                            <div onClick={() => setSelectedUser(u)} className="flex items-center justify-between cursor-pointer">
                              <SafetyBadge score={score} />
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <select
                                value={u.role}
                                onChange={(e) => handleUpdateUserRole(u, e.target.value)}
                                className="px-2 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                              <select
                                value={u.tier}
                                onChange={(e) => handleUpdateUserTier(u, e.target.value)}
                                className="px-2 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300"
                              >
                                <option value="free">Free</option>
                                <option value="premium">Premium</option>
                                <option value="enterprise">Enterprise</option>
                              </select>
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors ${u.is_active ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'}`}
                              >
                                {u.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {users.length === 0 && (
                        <div className="py-10 text-center">
                          <Search className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No account holders found</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">Try a different search term</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50/80 dark:bg-slate-800/80">
                            {[
                              { k: 'name' as SortKey, l: 'Name', sort: true },
                              { k: 'email' as SortKey, l: 'Email', sort: true },
                              { k: 'name' as SortKey, l: 'Phone', sort: false },
                              { k: 'name' as SortKey, l: 'PAN', sort: false },
                              { k: 'name' as SortKey, l: 'Aadhar', sort: false },
                              { k: 'role' as SortKey, l: 'Role', sort: true },
                              { k: 'tier' as SortKey, l: 'Tier', sort: true },
                              { k: 'name' as SortKey, l: 'Face', sort: false },
                              { k: 'created_at' as SortKey, l: 'Created', sort: true },
                              { k: 'name' as SortKey, l: 'Safety', sort: false },
                              { k: 'name' as SortKey, l: 'Status', sort: false },
                              { k: 'name' as SortKey, l: 'Actions', sort: false },
                            ].map((c) => (
                              <th key={c.l} onClick={() => c.sort ? toggleSort(c.k) : undefined}
                                className={`text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider ${c.sort ? 'cursor-pointer hover:text-slate-700 select-none' : ''}`}>
                                <div className="flex items-center gap-1 whitespace-nowrap">
                                  {c.l}
                                  {c.sort && (
                                    sortKey === c.k ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-emerald-600" /> : <ChevronDown className="w-3 h-3 text-emerald-600" />) : <ChevronUp className="w-3 h-3 text-slate-400" />
                                  )}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr key={u.id} className="border-t border-slate-50 dark:border-slate-800 hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-bold">
                                    {u.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </div>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{u.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{u.email}</td>
                              <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{u.phone || '—'}</td>
                              <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap font-mono text-[11px]">{u.pan_number || '—'}</td>
                              <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap font-mono text-[11px]">{u.aadhar || '—'}</td>
                              <td className="px-4 py-3.5"><Badge variant="neutral">{u.role}</Badge></td>
                              <td className="px-4 py-3.5">
                                {u.tier === 'premium' ? <Badge variant="premium">PREMIUM</Badge> : u.tier === 'enterprise' ? <Badge variant="enterprise">ENTERPRISE</Badge> : <Badge variant="neutral">FREE</Badge>}
                              </td>
                              <td className="px-4 py-3.5">
                                {u.face_registered ? <span className="text-emerald-600 text-xs font-medium flex items-center gap-1"><Fingerprint className="w-3.5 h-3.5" /> Linked</span> : <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">—</span>}
                              </td>
                              <td className="px-4 py-3.5 text-slate-400 dark:text-slate-500 text-[11px] whitespace-nowrap">{new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                              <td className="px-4 py-3.5">
                                <SafetyBadge score={computeSafetyScore(u, securityState)} onClick={() => setSelectedUser(u)} />
                              </td>
                              <td className="px-4 py-3.5">
                                {u.is_active ? <Badge variant="success">ACTIVE</Badge> : <Badge variant="danger">INACTIVE</Badge>}
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-2">
                                  <select
                                    value={u.role}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleUpdateUserRole(u, e.target.value)}
                                    className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-emerald-400"
                                  >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                  <select
                                    value={u.tier}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleUpdateUserTier(u, e.target.value)}
                                    className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-emerald-400"
                                  >
                                    <option value="free">Free</option>
                                    <option value="premium">Premium</option>
                                    <option value="enterprise">Enterprise</option>
                                  </select>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleUserStatus(u); }}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors ${u.is_active ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'}`}
                                  >
                                    {u.is_active ? 'Deactivate' : 'Activate'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {users.length === 0 && (
                            <tr><td colSpan={12} className="px-5 py-14 text-center dark:text-slate-500">
                              <div className="flex flex-col items-center gap-2">
                                <Search className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No account holders found</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">Try a different search term</p>
                              </div>
                            </td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Showing <strong className="text-slate-800 dark:text-slate-200">{users.length}</strong> of <strong className="text-slate-800 dark:text-slate-200">{usersTotal}</strong> accounts
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setUsersPage(p => Math.max(1, p - 1)); loadData(Math.max(1, usersPage - 1)); }}
                        disabled={usersPage <= 1}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Page {usersPage} of {usersPages}</span>
                      <button
                        onClick={() => { setUsersPage(p => Math.min(usersPages, p + 1)); loadData(Math.min(usersPages, usersPage + 1)); }}
                        disabled={usersPage >= usersPages}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'architecture' && (
              <motion.div key="arch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                <AdminLoginArchitecture />
                <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">Full Platform Architecture</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">End-to-end system layers, security beast, and deployment blueprint.</p>
                  <SystemArchitecture />
                </div>
              </motion.div>
            )}

            {tab === 'security' && <SecurityOpsTab role={role} />}

            {tab === 'features' && (
              <motion.div key="feat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FeaturesUniverse />
              </motion.div>
            )}

            {tab === 'logs' && (
              <AuditLogsTab />
            )}
            {tab === 'heatmap' && (
              <FraudIntelligenceCenter />
            )}
            {tab === 'alerts' && (
              <AlertHistoryTab role={role} />
            )}
            {tab === 'activity' && (
              <AdminActivityTab />
            )}
            {tab === 'health' && can(role, 'view_health') && (
              <SystemHealthTab stats={stats} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Risk Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[110]" onClick={() => setSelectedUser(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg pointer-events-auto overflow-hidden"
                onClick={(e) => e.stopPropagation()}>
                {(() => {
                  const safety = computeSafetyScore(selectedUser, securityState);
                  const headerConfig = {
                    safe: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-800', sub: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
                    caution: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-800', sub: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
                    'at-risk': { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-800', sub: 'text-red-600', badge: 'bg-red-100 text-red-700' },
                  }[safety.level];
                  return (
                    <>
                      <div className={`${headerConfig.bg} ${headerConfig.border} border-b px-6 py-5`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-200">
                              {selectedUser.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h3 className={`font-bold ${headerConfig.text}`}>{selectedUser.name}</h3>
                              <p className="text-xs text-slate-500">{selectedUser.email}</p>
                            </div>
                          </div>
                          <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center transition-colors">
                            <X className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                          <div className={`text-3xl font-bold ${headerConfig.text}`}>{safety.score}<span className="text-sm font-medium text-slate-400">/100</span></div>
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${headerConfig.badge}`}>
                            {safety.level === 'safe' ? 'SAFE' : safety.level === 'caution' ? 'CAUTION' : 'AT RISK'}
                          </span>
                        </div>
                      </div>
                      <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Risk Assessment Details</p>
                        <div className="space-y-2">
                          {safety.reasons.map((reason, idx) => (
                            <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl ${
                              reason.type === 'good' ? 'bg-emerald-50/50 border border-emerald-100' :
                              reason.type === 'warn' ? 'bg-amber-50/50 border border-amber-100' :
                              'bg-red-50/50 border border-red-100'
                            }`}>
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                reason.type === 'good' ? 'bg-emerald-100' :
                                reason.type === 'warn' ? 'bg-amber-100' :
                                'bg-red-100'
                              }`}>
                                <reason.icon className={`w-3.5 h-3.5 ${
                                  reason.type === 'good' ? 'text-emerald-600' :
                                  reason.type === 'warn' ? 'text-amber-600' :
                                  'text-red-600'
                                }`} />
                              </div>
                              <p className={`text-sm font-medium mt-0.5 ${
                                reason.type === 'good' ? 'text-emerald-800' :
                                reason.type === 'warn' ? 'text-amber-800' :
                                'text-red-800'
                              }`}>{reason.text}</p>
                            </div>
                          ))}
                        </div>
                        {safety.level !== 'safe' && (
                          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Recommended Action</p>
                            <p className="text-xs text-slate-500">
                              {safety.level === 'at-risk'
                                ? 'Immediate review required. Consider restricting high-value transactions until KYC is completed and biometric authentication is enabled.'
                                : 'Monitor account activity closely. Encourage user to complete pending KYC steps and enable additional security features.'}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Demo Tour */}
      <DemoTour onNavigate={(t) => setTab(t as AdminTab)} />
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Shield, Users, Eye, Zap, Landmark, ArrowLeftRight, Receipt, Target,
  CircleDollarSign, Search, LogOut, LayoutDashboard, ChevronUp, ChevronDown,
  Activity, RefreshCw, CheckCircle2, XCircle, Lock, Fingerprint,
  Crown, Sparkles, AlertTriangle, Download, Filter, Server, Database,
  BarChart3, ChevronRight, Menu, ArrowUpRight, Info,
  X, History, UserCheck, UserX, Settings
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { backendApi } from '../../lib/backendApi';
import { DEMO_ACCOUNTS } from '../../data/userProfiles';
import SystemArchitecture from '../architecture/SystemArchitecture';
import FeaturesUniverse from '../architecture/FeaturesUniverse';

type AdminTab = 'dashboard' | 'users' | 'architecture' | 'features' | 'logs';
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

function Badge({ children, variant = 'neutral' }: { children: React.ReactNode; variant?: 'success' | 'danger' | 'warning' | 'premium' | 'enterprise' | 'neutral' }) {
  const map: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    premium: 'bg-amber-50 text-amber-700 border-amber-200',
    enterprise: 'bg-violet-50 text-violet-700 border-violet-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
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

function computeSafetyScore(user: UserRecord): SafetyResult {
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

  const score = Math.max(0, Math.min(100, 100 - riskPoints));
  const level = score >= 80 ? 'safe' : score >= 50 ? 'caution' : 'at-risk';
  return { score, level, reasons };
}

function SafetyBadge({ score, onClick }: { score: SafetyResult; onClick?: () => void }) {
  const config = {
    safe: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', label: 'SAFE', dotColor: '#10b981' },
    caution: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'CAUTION', dotColor: '#f59e0b' },
    'at-risk': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'AT RISK', dotColor: '#ef4444' },
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

function generateAuditLogs(allUsers: UserRecord[]): AuditLog[] {
  const logs: AuditLog[] = [];
  const now = new Date();
  const ips = ['103.21.45.12', '103.21.45.89', '43.204.12.5', '182.74.9.33', '45.127.8.101', '106.51.77.22', '103.91.12.44'];

  // Admin login event
  logs.push({
    id: 'AUD-001', timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
    userName: 'TEAM EXCELLENT MINDS', userEmail: 'admin@psbsecurewealth.com',
    eventType: 'admin_action', action: 'Admin Login', details: 'Secure login from admin portal',
    ipAddress: ips[0], status: 'success',
  });

  // Data refresh
  logs.push({
    id: 'AUD-002', timestamp: new Date(now.getTime() - 12 * 60000).toISOString(),
    userName: 'TEAM EXCELLENT MINDS', userEmail: 'admin@psbsecurewealth.com',
    eventType: 'admin_action', action: 'Data Refresh', details: 'Refreshed account holders data',
    ipAddress: ips[0], status: 'success',
  });

  // Generate user login/logout events
  allUsers.forEach((u, idx) => {
    const baseTime = now.getTime() - (idx + 1) * 45 * 60000;
    logs.push({
      id: `AUD-LG-${idx}`, timestamp: new Date(baseTime).toISOString(),
      userName: u.name, userEmail: u.email,
      eventType: 'login', action: 'User Login', details: 'Successful login via web portal',
      ipAddress: ips[idx % ips.length], status: 'success',
    });
    // Logout 30 min later
    logs.push({
      id: `AUD-LO-${idx}`, timestamp: new Date(baseTime + 30 * 60000).toISOString(),
      userName: u.name, userEmail: u.email,
      eventType: 'logout', action: 'User Logout', details: 'Session ended normally',
      ipAddress: ips[idx % ips.length], status: 'success',
    });
  });

  // Demo account transactions as audit logs
  DEMO_ACCOUNTS.forEach((demo, idx) => {
    demo.transactions.forEach((tx, tidx) => {
      logs.push({
        id: `AUD-TX-${idx}-${tidx}`, timestamp: new Date(tx.date + 'T' + String(10 + tidx).padStart(2, '0') + ':30:00').toISOString(),
        userName: demo.profile.name, userEmail: demo.email,
        eventType: 'transaction', action: tx.category,
        details: `${tx.type === 'credit' ? 'Received' : 'Paid'} ₹${tx.amount.toLocaleString('en-IN')} — ${tx.description}`,
        ipAddress: ips[(idx + tidx) % ips.length],
        status: tx.status === 'BLOCKED' ? 'danger' : tx.riskLevel === 'HIGH' ? 'warning' : 'success',
      });
    });
  });

  // Security alerts
  logs.push({
    id: 'AUD-SEC-001', timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
    userName: 'Deepanshu Sharma', userEmail: 'deepanshu.sharma@psbsecurewealth.com',
    eventType: 'security_alert', action: 'Fraud Block',
    details: 'High-value UPI transfer of ₹5,00,000 to unknown payee blocked. Risk score: 88/100',
    ipAddress: ips[3], status: 'danger',
  });
  logs.push({
    id: 'AUD-SEC-002', timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(),
    userName: 'Unknown', userEmail: 'unknown@tempmail.com',
    eventType: 'security_alert', action: 'Failed Login',
    details: '3 consecutive failed login attempts from new device in Bangalore',
    ipAddress: '103.91.77.102', status: 'warning',
  });
  logs.push({
    id: 'AUD-SEC-003', timestamp: new Date(now.getTime() - 8 * 3600000).toISOString(),
    userName: 'Rikshita Barua', userEmail: 'rikshita.barua@psbsecurewealth.com',
    eventType: 'security_alert', action: 'Unusual Access',
    details: 'Account accessed from new location (Mumbai) while primary location is Kolkata',
    ipAddress: ips[5], status: 'warning',
  });

  // System events
  logs.push({
    id: 'AUD-SYS-001', timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
    userName: 'System', userEmail: 'system@psbsecurewealth.com',
    eventType: 'system_event', action: 'DB Backup',
    details: 'Automated SQLite database backup completed successfully. Size: 14.2 MB',
    ipAddress: '127.0.0.1', status: 'success',
  });
  logs.push({
    id: 'AUD-SYS-002', timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
    userName: 'System', userEmail: 'system@psbsecurewealth.com',
    eventType: 'system_event', action: 'API Health Check',
    details: 'All API endpoints responding. Avg latency: 124ms. Uptime: 99.97%',
    ipAddress: '127.0.0.1', status: 'success',
  });
  logs.push({
    id: 'AUD-SYS-003', timestamp: new Date(now.getTime() - 3 * 3600000).toISOString(),
    userName: 'System', userEmail: 'system@psbsecurewealth.com',
    eventType: 'system_event', action: 'Face Auth Sync',
    details: 'Face descriptor embeddings synchronized. 6 active biometric profiles.',
    ipAddress: '127.0.0.1', status: 'success',
  });

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function EventTypeBadge({ type }: { type: AuditEventType }) {
  const map: Record<AuditEventType, { label: string; icon: any; color: string; bg: string; border: string }> = {
    login: { label: 'LOGIN', icon: UserCheck, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    logout: { label: 'LOGOUT', icon: UserX, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' },
    transaction: { label: 'TRANSACTION', icon: ArrowLeftRight, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
    admin_action: { label: 'ADMIN', icon: Shield, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    security_alert: { label: 'SECURITY', icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    system_event: { label: 'SYSTEM', icon: Settings, color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' },
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

function AuditLogsTab({ users }: { users: UserRecord[] }) {
  const [logSearch, setLogSearch] = useState('');
  const [eventFilter, setEventFilter] = useState<AuditEventType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'warning' | 'danger'>('all');

  const allLogs = useMemo(() => generateAuditLogs(users), [users]);

  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      if (eventFilter !== 'all' && log.eventType !== eventFilter) return false;
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;
      if (logSearch.trim()) {
        const q = logSearch.toLowerCase();
        return log.userName.toLowerCase().includes(q) ||
               log.action.toLowerCase().includes(q) ||
               log.details.toLowerCase().includes(q) ||
               log.ipAddress.includes(q);
      }
      return true;
    });
  }, [allLogs, eventFilter, statusFilter, logSearch]);

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
          <h2 className="text-xl font-bold text-slate-900">Audit Logs</h2>
          <p className="text-sm text-slate-500 mt-0.5">Comprehensive activity trail for compliance and monitoring</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: counts.total, icon: History, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Security Alerts', value: counts.alerts, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
          { label: 'Failed / Blocked', value: counts.failed, icon: XCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'Successful', value: counts.success, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} ${s.border} border rounded-xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</span>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{fmtNum(s.value)}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" value={logSearch} onChange={(e) => setLogSearch(e.target.value)}
              placeholder="Search by user, action, details, IP..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
          </div>
          <div className="flex items-center gap-2">
            <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-emerald-400">
              <option value="all">All Events</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="transaction">Transaction</option>
              <option value="admin_action">Admin</option>
              <option value="security_alert">Security</option>
              <option value="system_event">System</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-emerald-400">
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
            </select>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Event</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Details</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-t border-slate-50 hover:bg-slate-50/40 transition-colors">
                  <td className="px-5 py-3.5 text-slate-500 text-[11px] whitespace-nowrap font-mono">
                    {new Date(log.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 text-xs">{log.userName}</span>
                      <span className="text-[10px] text-slate-400">{log.userEmail}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><EventTypeBadge type={log.eventType} /></td>
                  <td className="px-5 py-3.5 text-slate-700 text-xs font-medium">{log.action}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs max-w-xs truncate" title={log.details}>{log.details}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-[11px] font-mono">{log.ipAddress}</td>
                  <td className="px-5 py-3.5"><StatusDot status={log.status} /></td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-slate-300" />
                    <p className="text-sm text-slate-500 font-medium">No audit logs match your filters</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN SCREEN — Full-screen split layout
   ═══════════════════════════════════════════════════════════════ */
function LoginScreen({ onLogin, loading, error }: { onLogin: (id: string, pw: string) => void; loading: boolean; error: string }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/3 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #064e3b 0%, #065f46 40%, #0f172a 100%)' }}>
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="none">
            <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-emerald-400/10 blur-[80px]" />
        <div className="absolute bottom-40 left-0 w-96 h-96 rounded-full bg-teal-500/10 blur-[100px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg tracking-tight">PSB SecureWealth</h2>
              <p className="text-emerald-200/60 text-[11px] font-medium">Internet Banking Portal</p>
            </div>
          </div>
          <div className="space-y-6 max-w-sm">
            <h1 className="text-4xl font-bold text-white leading-tight">Banking Control Center</h1>
            <p className="text-emerald-100/50 text-sm leading-relaxed">
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
            <div key={item.text} className="flex items-center gap-3 text-emerald-100/60 text-sm">
              <item.icon className="w-4 h-4 text-emerald-400" /> {item.text}
            </div>
          ))}
          <p className="text-[11px] text-emerald-200/30 pt-4">© 2025 Punjab & Sind Bank. Government of India Undertaking.</p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative" style={{ background: '#0b0f19' }}>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-[120px]" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">PSB SecureWealth</h2>
              <p className="text-slate-500 text-[10px]">Admin Portal</p>
            </div>
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-slate-400 text-sm">Enter your admin credentials to access the control center.</p>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Admin ID</label>
              <input type="text" value={id} onChange={(e) => setId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onLogin(id, pw)}
                placeholder="TEAM EXCELLENT MINDS"
                className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Password</label>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onLogin(id, pw)}
                placeholder="Enter your password"
                className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all" />
            </div>
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => onLogin(id, pw)} disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Secure Login
            </button>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-600">Authorized personnel only. Unauthorized access is a punishable offence under IT Act, 2000.</p>
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
  const [token, setToken] = useState('');
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const handleLogin = async (adminId: string, password: string) => {
    setLoginError('');
    if (!adminId || !password) { setLoginError('Admin ID and Password are required'); return; }
    setLoading(true);
    const res = await backendApi.adminLogin(adminId, password);
    setLoading(false);
    if (res.ok && res.data?.token) {
      setToken(res.data.token); setIsLoggedIn(true);
      localStorage.setItem('sw-admin-token', res.data.token);
    } else {
      setLoginError(res.data?.error || 'Invalid credentials. Please try again.');
    }
  };

  // Convert demo accounts to UserRecord format
  const demoUsers: UserRecord[] = useMemo(() => {
    const mockKyc: Record<string, { phone: string; pan: string; aadhar: string; tier: string }> = {
      'deepanshu-sharma': { phone: '+91-98765-43210', pan: 'ABCDE1234F', aadhar: '1234-5678-9012', tier: 'premium' },
      'mrigesh-mohanty': { phone: '+91-98765-43211', pan: 'FGHIJ5678K', aadhar: '2345-6789-0123', tier: 'premium' },
      'rikshita-barua': { phone: '+91-98765-43212', pan: 'KLMNO9012P', aadhar: '3456-7890-1234', tier: 'free' },
      'ishita-anand': { phone: '+91-98765-43213', pan: 'PQRST3456U', aadhar: '4567-8901-2345', tier: 'enterprise' },
      'tripti-jain': { phone: '+91-98765-43214', pan: 'UVWXY7890Z', aadhar: '5678-9012-3456', tier: 'premium' },
      'kunal-saxena': { phone: '+91-98765-43215', pan: 'BCDEA1234G', aadhar: '6789-0123-4567', tier: 'free' },
    };
    return DEMO_ACCOUNTS.map((demo, idx) => {
      const kyc = mockKyc[demo.id];
      return {
        id: demo.id,
        email: demo.email,
        name: demo.profile.name,
        phone: kyc?.phone || null,
        role: 'user',
        tier: kyc?.tier || 'free',
        pan_number: kyc?.pan || null,
        aadhar: kyc?.aadhar || null,
        created_at: new Date(Date.now() - (idx + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_login: new Date(Date.now() - idx * 2 * 24 * 60 * 60 * 1000).toISOString(),
        face_registered: idx < 4 ? 1 : 0,
        api_usage_total: Math.floor(Math.random() * 500),
        is_active: 1,
      };
    });
  }, []);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    const [usersRes, statsRes] = await Promise.all([
      backendApi.adminGetUsers(token),
      backendApi.adminGetStats(token),
    ]);
    const backendUsers = usersRes.ok ? (usersRes.data?.users || []) : [];
    const backendStats = statsRes.ok ? (statsRes.data?.stats || null) : null;

    // Merge backend users + demo users
    const merged = [...demoUsers, ...backendUsers];
    setUsers(merged);

    // Compute combined stats
    if (backendStats) {
      const demoAccounts = DEMO_ACCOUNTS.reduce((sum, d) => sum + d.assets.length, 0);
      const demoTxns = DEMO_ACCOUNTS.reduce((sum, d) => sum + d.transactions.length, 0);
      const demoGoals = DEMO_ACCOUNTS.reduce((sum, d) => sum + d.goals.length, 0);
      setStats({
        totalUsers: backendStats.totalUsers + demoUsers.length,
        faceRegistered: backendStats.faceRegistered + demoUsers.filter(u => u.face_registered).length,
        activeToday: backendStats.activeToday + demoUsers.filter(u => u.is_active).length,
        totalAccounts: backendStats.totalAccounts + demoAccounts,
        totalTransactions: backendStats.totalTransactions + demoTxns,
        totalBills: backendStats.totalBills,
        totalGoals: backendStats.totalGoals + demoGoals,
        totalLoans: backendStats.totalLoans,
      });
    } else {
      const demoAccounts = DEMO_ACCOUNTS.reduce((sum, d) => sum + d.assets.length, 0);
      const demoTxns = DEMO_ACCOUNTS.reduce((sum, d) => sum + d.transactions.length, 0);
      const demoGoals = DEMO_ACCOUNTS.reduce((sum, d) => sum + d.goals.length, 0);
      setStats({
        totalUsers: demoUsers.length,
        faceRegistered: demoUsers.filter(u => u.face_registered).length,
        activeToday: demoUsers.filter(u => u.is_active).length,
        totalAccounts: demoAccounts,
        totalTransactions: demoTxns,
        totalBills: 0,
        totalGoals: demoGoals,
        totalLoans: 0,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem('sw-admin-token');
    if (saved) { setToken(saved); setIsLoggedIn(true); }
  }, []);

  useEffect(() => { if (isLoggedIn && token) loadData(); }, [isLoggedIn, token]);

  const filteredUsers = useMemo(() => {
    let result = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((u) =>
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) || u.pan_number?.toLowerCase().includes(q) || u.aadhar?.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const av = a[sortKey] || ''; const bv = b[sortKey] || '';
      return av > bv ? dir : av < bv ? -dir : 0;
    });
    return result;
  }, [users, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} loading={loading} error={loginError} />;
  }

  const navItems = [
    { key: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'users' as AdminTab, label: 'Account Holders', icon: Users },
    { key: 'architecture' as AdminTab, label: 'Architecture', icon: Server },
    { key: 'features' as AdminTab, label: 'Features', icon: BarChart3 },
    { key: 'logs' as AdminTab, label: 'Audit Logs', icon: Activity },
  ];

  const heroStats = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, change: '+12%', up: true, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Face Registered', value: stats?.faceRegistered ?? 0, icon: Eye, change: '+8%', up: true, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Active Today', value: stats?.activeToday ?? 0, icon: Zap, change: '+24%', up: true, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Total Accounts', value: stats?.totalAccounts ?? 0, icon: Landmark, change: '+5%', up: true, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
  ];

  const secondaryStats = [
    { label: 'Transactions', value: stats?.totalTransactions ?? 0, icon: ArrowLeftRight },
    { label: 'Bills', value: stats?.totalBills ?? 0, icon: Receipt },
    { label: 'Goals', value: stats?.totalGoals ?? 0, icon: Target },
    { label: 'Loans', value: stats?.totalLoans ?? 0, icon: CircleDollarSign },
  ];

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-50">
      {/* ─── Sidebar ─── */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:static md:translate-x-0 z-50 w-64 h-full flex flex-col border-r border-slate-200 bg-white transition-transform duration-300`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 leading-tight">Admin Portal</h2>
              <p className="text-[10px] text-slate-500 font-medium">PSB SecureWealth</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <button key={item.key} onClick={() => { setTab(item.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}>
                <Icon className={`w-[18px] h-[18px] ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                {item.label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </button>
            );
          })}
        </nav>

        {/* System Status */}
        <div className="p-4 mx-4 mb-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Status</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600">ONLINE</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 flex items-center gap-1"><Server className="w-3 h-3" /> API</span>
              <span className="text-emerald-600 font-medium">99.9%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 flex items-center gap-1"><Database className="w-3 h-3" /> DB</span>
              <span className="text-emerald-600 font-medium">Healthy</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => { localStorage.removeItem('sw-admin-token'); setIsLoggedIn(false); setToken(''); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-[18px] h-[18px]" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-slate-50">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900">
                {tab === 'dashboard' && 'Control Center'}
                {tab === 'users' && 'Account Holders'}
                {tab === 'architecture' && 'System Architecture'}
                {tab === 'features' && 'Cosmos Features'}
                {tab === 'logs' && 'Audit Logs'}
              </h1>
              <p className="text-[11px] text-slate-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadData} disabled={loading}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-700">System Online</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
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
                        className={`${s.bg} ${s.border} border rounded-xl p-5`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-10 h-10 rounded-lg bg-white border ${s.border} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${s.color}`} />
                          </div>
                          <span className={`flex items-center gap-0.5 text-[11px] font-bold ${s.up ? 'text-emerald-600' : 'text-red-600'}`}>
                            <ArrowUpRight className="w-3 h-3" /> {s.change}
                          </span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{fmtNum(s.value)}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
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
                        className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-slate-900">{fmtNum(s.value)}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{s.label}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Safety Overview */}
                {users.length > 0 && (() => {
                  const safetyMap = users.map(u => computeSafetyScore(u));
                  const safe = safetyMap.filter(s => s.level === 'safe').length;
                  const caution = safetyMap.filter(s => s.level === 'caution').length;
                  const atRisk = safetyMap.filter(s => s.level === 'at-risk').length;
                  return (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Safety Overview</h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">Account security health across all holders</p>
                        </div>
                        <button onClick={() => setTab('users')} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                          View All <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-emerald-700">{safe}</p>
                            <p className="text-[11px] text-emerald-600 font-medium">Safe Accounts</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-amber-700">{caution}</p>
                            <p className="text-[11px] text-amber-600 font-medium">Caution</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-red-700">{atRisk}</p>
                            <p className="text-[11px] text-red-600 font-medium">At Risk</p>
                          </div>
                        </div>
                      </div>
                      {/* Mini bar */}
                      <div className="mt-4 flex h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500" style={{ width: `${users.length ? (safe / users.length) * 100 : 0}%` }} />
                        <div className="bg-amber-500" style={{ width: `${users.length ? (caution / users.length) * 100 : 0}%` }} />
                        <div className="bg-red-500" style={{ width: `${users.length ? (atRisk / users.length) * 100 : 0}%` }} />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                        <span>{users.length ? Math.round((safe / users.length) * 100) : 0}% Safe</span>
                        <span>{users.length ? Math.round((atRisk / users.length) * 100) : 0}% At Risk</span>
                      </div>
                    </motion.div>
                  );
                })()}

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Activity Overview</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">User registrations vs transactions</p>
                      </div>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5 text-slate-500"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Users</span>
                        <span className="flex items-center gap-1.5 text-slate-500"><div className="w-2 h-2 rounded-full bg-blue-500" /> Transactions</span>
                      </div>
                    </div>
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ACTIVITY_DATA}>
                          <defs>
                            <linearGradient id="uGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                            <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                          <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} fill="url(#uGrad)" />
                          <Area type="monotone" dataKey="txns" stroke="#3b82f6" strokeWidth={2} fill="url(#tGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Tier Distribution</h3>
                    <p className="text-[11px] text-slate-500 mb-4">User plan breakdown</p>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={TIER_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                            {TIER_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-2">
                      {TIER_DATA.map((t) => (
                        <span key={t.name} className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                          <div className="w-2 h-2 rounded-full" style={{ background: t.color }} /> {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Users */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Recent Account Holders</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Latest user registrations</p>
                    </div>
                    <button onClick={() => setTab('users')} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                      View All <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                          <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email</th>
                          <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tier</th>
                          <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Face Auth</th>
                          <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
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
                                <span className="font-semibold text-slate-800">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-slate-500">{u.email}</td>
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
                    <h2 className="text-xl font-bold text-slate-900">Account Holders</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage and monitor all registered users</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex-1 relative w-full sm:w-auto">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email, phone, PAN, Aadhar..."
                        className="w-full sm:w-80 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium"><strong className="text-slate-800">{filteredUsers.length}</strong> accounts</span>
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                        <Filter className="w-3.5 h-3.5" /> Filter
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Export
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50/80">
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
                          ].map((c) => (
                            <th key={c.l} onClick={() => c.sort ? toggleSort(c.k) : undefined}
                              className={`text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider ${c.sort ? 'cursor-pointer hover:text-slate-700 select-none' : ''}`}>
                              <div className="flex items-center gap-1 whitespace-nowrap">
                                {c.l}
                                {c.sort && (
                                  sortKey === c.k ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-emerald-600" /> : <ChevronDown className="w-3 h-3 text-emerald-600" />) : <ChevronUp className="w-3 h-3 text-slate-300" />
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="border-t border-slate-50 hover:bg-slate-50/40 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-bold">
                                  {u.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <span className="font-semibold text-slate-800 whitespace-nowrap">{u.name}</span>
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
                              {u.face_registered ? <span className="text-emerald-600 text-xs font-medium flex items-center gap-1"><Fingerprint className="w-3.5 h-3.5" /> Linked</span> : <span className="text-slate-400 text-xs font-medium">—</span>}
                            </td>
                            <td className="px-4 py-3.5 text-slate-400 text-[11px] whitespace-nowrap">{new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            <td className="px-4 py-3.5">
                              <SafetyBadge score={computeSafetyScore(u)} onClick={() => setSelectedUser(u)} />
                            </td>
                            <td className="px-4 py-3.5">
                              {u.is_active ? <Badge variant="success">ACTIVE</Badge> : <Badge variant="danger">INACTIVE</Badge>}
                            </td>
                          </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                          <tr><td colSpan={11} className="px-5 py-14 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Search className="w-8 h-8 text-slate-300" />
                              <p className="text-sm text-slate-500 font-medium">No account holders found</p>
                              <p className="text-xs text-slate-400">Try a different search term</p>
                            </div>
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'architecture' && (
              <motion.div key="arch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SystemArchitecture />
              </motion.div>
            )}

            {tab === 'features' && (
              <motion.div key="feat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FeaturesUniverse />
              </motion.div>
            )}

            {tab === 'logs' && (
              <AuditLogsTab users={users} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Risk Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50" onClick={() => setSelectedUser(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg pointer-events-auto overflow-hidden"
                onClick={(e) => e.stopPropagation()}>
                {(() => {
                  const safety = computeSafetyScore(selectedUser);
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
                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-700">
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
                          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <p className="text-xs font-bold text-slate-700 mb-1">Recommended Action</p>
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
    </div>
  );
}

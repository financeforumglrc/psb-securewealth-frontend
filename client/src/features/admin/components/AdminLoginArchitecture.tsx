import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  Database,
  Server,
  FileText,
  ArrowRight,
  Globe,
  Key,
  Eye,
  Activity,
  CheckCircle2,
  LayoutDashboard,
  Cookie,
  Clock,
  Layers,
  ScrollText,
  Siren,
  Fingerprint,
  Zap,
  ShieldCheck,
  Network,
  HardDrive,
  LockKeyhole,
  ScanFace,
  BadgeCheck,
  ChevronRight,
  Maximize2,
  Minimize2,
  Expand,
  Shrink,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   ADMIN LOGIN SUBSYSTEM ARCHITECTURE
   Comprehensive SRS activity diagram, relational ER diagram,
   data-flow and security control diagrams for the Banking
   Control Center admin login module.
   ═══════════════════════════════════════════════════════════════ */

type TabKey = 'srs' | 'schema' | 'flow' | 'security' | 'requirements';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'requirements', label: 'Requirements', icon: ScrollText },
  { key: 'srs', label: 'SRS Activity Diagram', icon: FileText },
  { key: 'schema', label: 'Relational ER Schema', icon: Database },
  { key: 'flow', label: 'Data Flow', icon: Layers },
  { key: 'security', label: 'Security Flow', icon: Shield },
];

/* ───────── Functional / Non-functional requirements ───────── */
const FUNCTIONAL_REQS = [
  { id: 'F-001', title: 'Admin ID Pre-fill', desc: 'Admin ID is pre-populated in the login form for convenience; password must be entered manually.', impl: 'AdminDashboard.tsx LoginScreen', schema: '-' },
  { id: 'F-002', title: 'Credential Validation', desc: 'System verifies non-empty Admin ID/Password and rejects malformed requests with actionable error messages.', impl: 'backendApi.adminLogin + backend route', schema: '-' },
  { id: 'F-003', title: 'Backend Authentication', desc: 'Server compares credentials against configured ADMIN_ID and ADMIN_PASSWORD using constant-time comparison.', impl: 'Node.js /admin/login controller', schema: 'admins.admin_id' },
  { id: 'F-004', title: 'JWT Session Issuance', desc: 'On success, a signed JWT (role=admin, 24h expiry) is issued and stored in an httpOnly cookie.', impl: 'jsonwebtoken + cookie-parser', schema: 'admin_sessions.token_jti' },
  { id: 'F-005', title: 'Protected Admin APIs', desc: 'All admin routes (/admin/users, /admin/stats) require a valid admin JWT and reject unauthorized access.', impl: 'authMiddleware + requireRole(admin)', schema: 'admin_sessions.revoked_at' },
  { id: 'F-006', title: 'Audit Logging', desc: 'Every login attempt, success or failure, is recorded with timestamp, IP, and outcome for compliance.', impl: 'Audit middleware / logger', schema: 'admin_audit_logs' },
  { id: 'F-007', title: 'Brute-Force Lockout', desc: 'Repeated failed attempts from the same IP/admin trigger progressive delays and alerts.', impl: 'Rate limiter + admin_failed_attempts', schema: 'admin_failed_attempts' },
];

const NON_FUNCTIONAL_REQS = [
  { id: 'NF-001', title: 'Security', desc: 'Credentials travel over HTTPS; cookies are httpOnly & SameSite; tokens expire in 24 hours.', impl: 'TLS 1.3, cookie flags', schema: '-' },
  { id: 'NF-002', title: 'Performance', desc: 'Login endpoint p95 latency < 150ms excluding network; dashboard APIs < 200ms.', impl: 'Benchmarked Express handlers', schema: 'Indexes on admin_id, token_jti' },
  { id: 'NF-003', title: 'Availability', desc: 'Admin portal is available whenever the backend is up; no single point of failure for auth verification.', impl: 'Statefulless JWT validation', schema: '-' },
  { id: 'NF-004', title: 'Usability', desc: 'One-click login with pre-filled credentials; clear loading, error, and success states.', impl: 'React UI states', schema: '-' },
  { id: 'NF-005', title: 'Compliance', desc: 'RBI-aligned audit trail with immutable log entries and 7-year retention policy.', impl: 'WORM audit storage', schema: 'admin_audit_logs.metadata' },
];

/* ───────── Relational schema tables ───────── */
interface SchemaColumn {
  name: string;
  type: string;
  constraints?: string;
}
interface SchemaTable {
  id: string;
  name: string;
  columns: SchemaColumn[];
  purpose: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

const SCHEMA_TABLES: SchemaTable[] = [
  {
    id: 'roles',
    name: 'roles',
    purpose: 'RBAC roles',
    x: 80,
    y: 140,
    w: 300,
    h: 200,
    color: '#10b981',
    columns: [
      { name: 'id', type: 'INTEGER', constraints: 'PK, AUTO' },
      { name: 'name', type: 'VARCHAR(64)', constraints: 'UNIQUE, NOT NULL' },
      { name: 'permissions', type: 'JSON', constraints: 'NOT NULL' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()' },
    ],
  },
  {
    id: 'admins',
    name: 'admins',
    purpose: 'Control-center operators',
    x: 560,
    y: 60,
    w: 380,
    h: 360,
    color: '#0ea5e9',
    columns: [
      { name: 'id', type: 'INTEGER', constraints: 'PK, AUTO' },
      { name: 'admin_id', type: 'VARCHAR(128)', constraints: 'UNIQUE, NOT NULL, IDX' },
      { name: 'password_hash', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
      { name: 'name', type: 'VARCHAR(128)', constraints: 'NOT NULL' },
      { name: 'email', type: 'VARCHAR(255)', constraints: 'UNIQUE' },
      { name: 'role_id', type: 'INTEGER', constraints: 'FK → roles.id' },
      { name: 'is_active', type: 'BOOLEAN', constraints: 'DEFAULT TRUE' },
      { name: 'last_login', type: 'TIMESTAMP' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()' },
    ],
  },
  {
    id: 'admin_failed_attempts',
    name: 'admin_failed_attempts',
    purpose: 'Lockout tracker',
    x: 1120,
    y: 140,
    w: 320,
    h: 200,
    color: '#ef4444',
    columns: [
      { name: 'id', type: 'INTEGER', constraints: 'PK, AUTO' },
      { name: 'admin_id', type: 'INTEGER', constraints: 'FK → admins.id, IDX' },
      { name: 'ip_address', type: 'VARCHAR(45)', constraints: 'IDX' },
      { name: 'failure_count', type: 'INTEGER', constraints: 'DEFAULT 0' },
      { name: 'last_attempt', type: 'TIMESTAMP' },
      { name: 'locked_until', type: 'TIMESTAMP' },
    ],
  },
  {
    id: 'admin_audit_logs',
    name: 'admin_audit_logs',
    purpose: 'Audit trail',
    x: 80,
    y: 620,
    w: 340,
    h: 260,
    color: '#f59e0b',
    columns: [
      { name: 'id', type: 'INTEGER', constraints: 'PK, AUTO' },
      { name: 'admin_id', type: 'INTEGER', constraints: 'FK → admins.id, IDX' },
      { name: 'action', type: 'VARCHAR(64)', constraints: 'NOT NULL, IDX' },
      { name: 'resource', type: 'VARCHAR(128)' },
      { name: 'outcome', type: 'VARCHAR(32)', constraints: 'NOT NULL, IDX' },
      { name: 'ip_address', type: 'VARCHAR(45)' },
      { name: 'metadata', type: 'JSON' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW(), IDX' },
    ],
  },
  {
    id: 'admin_sessions',
    name: 'admin_sessions',
    purpose: 'JWT sessions',
    x: 580,
    y: 620,
    w: 340,
    h: 260,
    color: '#8b5cf6',
    columns: [
      { name: 'id', type: 'INTEGER', constraints: 'PK, AUTO' },
      { name: 'admin_id', type: 'INTEGER', constraints: 'FK → admins.id, IDX' },
      { name: 'token_jti', type: 'VARCHAR(64)', constraints: 'UNIQUE, NOT NULL, IDX' },
      { name: 'ip_address', type: 'VARCHAR(45)' },
      { name: 'user_agent', type: 'TEXT' },
      { name: 'issued_at', type: 'TIMESTAMP', constraints: 'NOT NULL' },
      { name: 'expires_at', type: 'TIMESTAMP', constraints: 'NOT NULL, IDX' },
      { name: 'revoked_at', type: 'TIMESTAMP' },
    ],
  },
];

const RELATIONSHIPS = [
  { from: 'roles', to: 'admins', label: 'role_id', cardinality: '1:N' },
  { from: 'admins', to: 'admin_failed_attempts', label: 'admin_id', cardinality: '1:N' },
  { from: 'admins', to: 'admin_sessions', label: 'admin_id', cardinality: '1:N' },
  { from: 'admins', to: 'admin_audit_logs', label: 'admin_id', cardinality: '1:N' },
];

/* ───────── SRS swimlane data ───────── */
type StepType = 'action' | 'decision' | 'terminal' | 'failure';
interface SRSStep {
  id: string;
  lane: number;
  row: number;
  type: StepType;
  text: string;
  sub?: string;
  successNext?: string;
  failNext?: string;
}

const LANES = ['Admin', 'React SPA', 'API Gateway', 'Auth Service', 'Database', 'Audit Logger', 'Error Response'];
const LANE_CX = [140, 360, 580, 800, 1020, 1240, 1460];
const ROW_Y = [90, 180, 270, 360, 450, 540, 630, 720, 810, 900, 990, 1080, 1170, 1260];

const SRS_STEPS: SRSStep[] = [
  { id: 's1', lane: 0, row: 0, type: 'action', text: 'Open Admin Panel', sub: 'Sidebar navigation' },
  { id: 's2', lane: 1, row: 1, type: 'action', text: 'Render Login Form', sub: 'Pre-fill credentials' },
  { id: 's3', lane: 0, row: 2, type: 'action', text: 'Enter / Submit', sub: 'ID + password' },
  { id: 's4', lane: 1, row: 3, type: 'action', text: 'POST /admin/login', sub: 'HTTPS JSON' },
  { id: 's5', lane: 2, row: 4, type: 'action', text: 'Rate Limit & CORS', sub: 'Gateway checks' },
  { id: 'd1', lane: 2, row: 5, type: 'decision', text: 'Allowed?' },
  { id: 's6', lane: 3, row: 6, type: 'action', text: 'Validate Body', sub: 'Schema + presence' },
  { id: 'd2', lane: 3, row: 7, type: 'decision', text: 'Valid?' },
  { id: 's7', lane: 4, row: 8, type: 'action', text: 'Fetch Admin Record', sub: 'SELECT admins' },
  { id: 's8', lane: 3, row: 9, type: 'action', text: 'Constant-Time Compare', sub: 'Hash / env compare' },
  { id: 'd3', lane: 3, row: 10, type: 'decision', text: 'Match & Active?' },
  { id: 'f1', lane: 6, row: 5, type: 'failure', text: '429 Too Many Requests', sub: 'Rate limit exceeded' },
  { id: 'f2', lane: 6, row: 7, type: 'failure', text: '400 Bad Request', sub: 'Malformed payload' },
  { id: 'f3', lane: 5, row: 10, type: 'failure', text: 'Log Failure', sub: 'IP + outcome' },
  { id: 'f4', lane: 6, row: 10, type: 'failure', text: '401 / 403 Unauthorized', sub: 'Invalid credentials' },
  { id: 'f5', lane: 1, row: 12, type: 'failure', text: 'Show Error', sub: 'Retry allowed' },
  { id: 's9', lane: 3, row: 11, type: 'action', text: 'Sign JWT + JTI', sub: 'role=admin, 24h' },
  { id: 's10', lane: 4, row: 12, type: 'action', text: 'Store Session', sub: 'INSERT admin_sessions' },
  { id: 's11', lane: 5, row: 12, type: 'action', text: 'Audit Success', sub: 'Compliance log' },
  { id: 's12', lane: 2, row: 12, type: 'action', text: 'Set httpOnly Cookie', sub: 'Set-Cookie header' },
  { id: 's13', lane: 1, row: 13, type: 'action', text: 'Store & Load Dashboard', sub: 'Protected UI' },
  { id: 's14', lane: 0, row: 13, type: 'terminal', text: 'Control Center', sub: 'Admin dashboard visible' },
];

/* ───────── Data-flow layers ───────── */
const FLOW_LAYERS = [
  {
    title: 'Presentation Layer',
    icon: LayoutDashboard,
    color: 'emerald',
    items: ['React 18 SPA', 'Tailwind CSS', 'Framer Motion', 'Pre-filled Login Form'],
  },
  {
    title: 'Transport Layer',
    icon: Globe,
    color: 'sky',
    items: ['HTTPS / TLS 1.3', 'Fetch API', 'CORS whitelist', 'JSON payloads'],
  },
  {
    title: 'API Gateway',
    icon: Server,
    color: 'violet',
    items: ['Express.js router', 'Rate limiting (100/min)', 'JWT middleware', 'authMiddleware + requireRole(admin)'],
  },
  {
    title: 'Auth Service',
    icon: Lock,
    color: 'amber',
    items: ['Credential validation', 'Constant-time compare', 'JWT signing (HS256)', 'Cookie issuance'],
  },
  {
    title: 'Persistence Layer',
    icon: Database,
    color: 'rose',
    items: ['Environment config (demo)', 'SQLite / PostgreSQL', 'admin_sessions table', 'admin_audit_logs table'],
  },
];

/* ───────── Security flow steps ───────── */
const SECURITY_STEPS = [
  { icon: Shield, title: 'TLS Tunnel', desc: 'All traffic encrypted end-to-end via HTTPS / TLS 1.3.' },
  { icon: Eye, title: 'Masked Input', desc: 'Password field hides characters from shoulder-surfing.' },
  { icon: Fingerprint, title: 'Constant-Time Compare', desc: 'Prevents timing side-channel attacks on credentials.' },
  { icon: Key, title: 'JWT Signing', desc: 'HS256 signed with 256-bit JWT_SECRET.' },
  { icon: Cookie, title: 'httpOnly Cookie', desc: 'Token inaccessible to JavaScript XSS payloads.' },
  { icon: Clock, title: '24h Expiry', desc: 'Short-lived token limits blast radius.' },
  { icon: Activity, title: 'Audit Log', desc: 'Every attempt recorded with IP, UA and outcome.' },
  { icon: Siren, title: 'Failure Lockout', desc: 'Progressive delays after repeated failures.' },
];

const METRICS = [
  { label: 'p95 Login Latency', value: '<150ms', icon: Zap, color: 'emerald' },
  { label: 'Token Lifetime', value: '24 hours', icon: Clock, color: 'sky' },
  { label: 'Auth Layers', value: '8 controls', icon: ShieldCheck, color: 'violet' },
  { label: 'Audit Retention', value: '7 years', icon: HardDrive, color: 'amber' },
];

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function FullscreenWrapper({ children, title }: { children: (props: { isFullscreen: boolean; fit: boolean }) => React.ReactNode; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fit, setFit] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggle = async () => {
    if (!ref.current) return;
    try {
      if (!document.fullscreenElement) {
        await ref.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
  };

  return (
    <div ref={ref} className={`relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col ${isFullscreen ? 'p-6 h-screen w-screen overflow-hidden' : 'p-6'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {title === 'SRS' ? <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <Database className="w-5 h-5 text-sky-600 dark:text-sky-400" />}
            {title === 'SRS' ? 'SRS Activity Diagram' : 'Relational Entity-Relationship Schema'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {title === 'SRS'
              ? 'UML-style swimlane diagram showing the complete admin login use-case flow including success and failure paths.'
              : 'Normalized 3NF ER diagram for RBAC, sessions, audit logging, and brute-force protection.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {title === 'SRS' && (
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Success Path
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Failure Path
              </span>
            </div>
          )}
          {title === 'Schema' && (
            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <span className="px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">PK Primary Key</span>
              <span className="px-2 py-1 rounded-md bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300">FK Foreign Key</span>
              <span className="px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">IDX Index</span>
            </div>
          )}
          <button
            onClick={() => setFit((f) => !f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${fit ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
            title={fit ? 'Show diagram at natural size (scrollable)' : 'Scale diagram to fit the entire page'}
          >
            {fit ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
            {fit ? 'Fit On' : 'Fit Page'}
          </button>
          <button
            onClick={toggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>
      <div className={`flex-1 min-h-0 ${fit ? 'overflow-hidden' : 'overflow-auto'}`}>
        {children({ isFullscreen, fit })}
      </div>
    </div>
  );
}

function RequirementsTab() {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Functional Requirements</h3>
          </div>
          <div className="space-y-3">
            {FUNCTIONAL_REQS.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-emerald-500/30 transition-colors"
              >
                <span className="flex-shrink-0 w-12 h-8 rounded-lg bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {r.id}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{r.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{r.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Non-Functional Requirements</h3>
          </div>
          <div className="space-y-3">
            {NON_FUNCTIONAL_REQS.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-rose-500/30 transition-colors"
              >
                <span className="flex-shrink-0 w-12 h-8 rounded-lg bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {r.id}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{r.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{r.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Traceability matrix */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Requirements Traceability Matrix</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Mapping every requirement to its implementation artifact and database entity.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-2 pr-4 font-bold text-slate-500 dark:text-slate-400">ID</th>
                <th className="py-2 pr-4 font-bold text-slate-500 dark:text-slate-400">Requirement</th>
                <th className="py-2 pr-4 font-bold text-slate-500 dark:text-slate-400">Implementation</th>
                <th className="py-2 font-bold text-slate-500 dark:text-slate-400">Schema Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...FUNCTIONAL_REQS, ...NON_FUNCTIONAL_REQS].map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 pr-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{r.id}</td>
                  <td className="py-3 pr-4 font-semibold text-slate-800 dark:text-slate-200">{r.title}</td>
                  <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{r.impl}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{r.schema}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function SRSDiagram() {
  const stepById = (id: string) => SRS_STEPS.find((s) => s.id === id);
  const stepCenter = (s: SRSStep) => ({ x: LANE_CX[s.lane], y: ROW_Y[s.row] });

  const boxHalfHeight = (type: StepType) => (type === 'decision' ? 32 : 26);
  const boxHalfWidth = (type: StepType) => (type === 'decision' ? 32 : 85);

  const renderConnections = () => {
    const paths: React.ReactNode[] = [];
    const successChain = ['s1', 's2', 's3', 's4', 's5', 'd1', 's6', 'd2', 's7', 's8', 'd3', 's9', 's10', 's11', 's12', 's13', 's14'];
    for (let i = 0; i < successChain.length - 1; i++) {
      const a = stepById(successChain[i])!;
      const b = stepById(successChain[i + 1])!;
      const p1 = stepCenter(a);
      const p2 = stepCenter(b);
      paths.push(
        <line
          key={`succ-${i}`}
          x1={p1.x}
          y1={p1.y + boxHalfHeight(a.type)}
          x2={p2.x}
          y2={p2.y - boxHalfHeight(b.type)}
          stroke="#10b981"
          strokeWidth={2}
          markerEnd="url(#arrow-success)"
          className="dark:stroke-emerald-500"
        />
      );
    }

    // Failure branches
    const d1 = stepById('d1')!;
    const d2 = stepById('d2')!;
    const d3 = stepById('d3')!;
    const f1 = stepById('f1')!;
    const f2 = stepById('f2')!;
    const f3 = stepById('f3')!;
    const f4 = stepById('f4')!;
    const f5 = stepById('f5')!;
    const d1c = stepCenter(d1);
    const d2c = stepCenter(d2);
    const d3c = stepCenter(d3);
    const f1c = stepCenter(f1);
    const f2c = stepCenter(f2);
    const f3c = stepCenter(f3);
    const f4c = stepCenter(f4);
    const f5c = stepCenter(f5);

    const failPath = (key: string, x1: number, y1: number, x2: number, y2: number, label?: string, lx?: number, ly?: number) => {
      paths.push(
        <path
          key={key}
          d={`M ${x1} ${y1} L ${x2} ${y2}`}
          fill="none"
          stroke="#ef4444"
          strokeWidth={2}
          strokeDasharray="5,5"
          markerEnd="url(#arrow-fail)"
          className="dark:stroke-red-500"
        />
      );
      if (label && lx !== undefined && ly !== undefined) {
        paths.push(
          <text key={`${key}-label`} x={lx} y={ly} fill="#ef4444" fontSize={10} fontWeight={700} className="dark:fill-red-400">{label}</text>
        );
      }
    };

    // d1 -> 429
    failPath('d1-f1', d1c.x + boxHalfWidth(d1.type), d1c.y, f1c.x - boxHalfWidth(f1.type), f1c.y, 'No', d1c.x + 36, d1c.y - 8);
    // d2 -> 400
    failPath('d2-f2', d2c.x + boxHalfWidth(d2.type), d2c.y, f2c.x - boxHalfWidth(f2.type), f2c.y, 'No', d2c.x + 36, d2c.y - 8);
    // d3 -> Audit Log Failure
    failPath('d3-f3', d3c.x + boxHalfWidth(d3.type), d3c.y, f3c.x - boxHalfWidth(f3.type), f3c.y, 'No', d3c.x + 36, d3c.y - 8);
    // Audit Log Failure -> 401/403
    failPath('f3-f4', f3c.x + boxHalfWidth(f3.type), f3c.y, f4c.x - boxHalfWidth(f4.type), f4c.y);
    // Error responses merge to Show Error in Browser lane
    failPath('f1-f5', f1c.x, f1c.y + boxHalfHeight(f1.type), f5c.x, f5c.y - boxHalfHeight(f5.type));
    failPath('f2-f5', f2c.x, f2c.y + boxHalfHeight(f2.type), f5c.x, f5c.y - boxHalfHeight(f5.type));
    failPath('f4-f5', f4c.x, f4c.y + boxHalfHeight(f4.type), f5c.x, f5c.y - boxHalfHeight(f5.type));

    return paths;
  };

  return (
    <FullscreenWrapper title="SRS">
      {({ isFullscreen, fit }) => (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex flex-col ${isFullscreen ? 'h-full' : ''}`}
        >
          <div className={`${fit ? 'overflow-hidden' : 'overflow-auto'} rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 ${isFullscreen ? 'flex-1 min-h-0' : 'h-[calc(100vh-320px)]'}`}>
        <svg viewBox="0 0 1600 1350" className={fit ? 'w-full h-full' : 'min-w-[1600px] min-h-[1350px]'} style={{ fontFamily: 'inherit' }}>
          <defs>
            <marker id="arrow-success" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
            </marker>
            <marker id="arrow-fail" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
            </marker>
            <linearGradient id="laneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" className="dark:stop-color-slate-900" />
              <stop offset="100%" stopColor="#f1f5f9" className="dark:stop-color-slate-800" />
            </linearGradient>
          </defs>

          {/* Lanes background */}
          {LANES.map((lane, i) => {
            const x = LANE_CX[i] - 100;
            return (
              <g key={lane}>
                <rect x={x} y={0} width={200} height={1350} fill="url(#laneGrad)" opacity={i % 2 === 0 ? 0.45 : 0.3} />
                <rect x={x} y={0} width={200} height={48} fill="#0f172a" className="dark:fill-slate-950" />
                <text x={LANE_CX[i]} y={30} textAnchor="middle" fill="#e2e8f0" fontSize={13} fontWeight={700}>{lane}</text>
                <line x1={x + 200} y1={0} x2={x + 200} y2={1350} stroke="#e2e8f0" strokeWidth={1} className="dark:stroke-slate-700" />
              </g>
            );
          })}

          {/* Connections */}
          {renderConnections()}

          {/* Success decision labels */}
          <text x={LANE_CX[2] + 40} y={ROW_Y[5] + 10} fill="#10b981" fontSize={11} fontWeight={700} className="dark:fill-emerald-400">Yes</text>
          <text x={LANE_CX[3] + 40} y={ROW_Y[7] + 10} fill="#10b981" fontSize={11} fontWeight={700} className="dark:fill-emerald-400">Yes</text>
          <text x={LANE_CX[3] + 40} y={ROW_Y[10] + 10} fill="#10b981" fontSize={11} fontWeight={700} className="dark:fill-emerald-400">Yes</text>

          {/* Steps */}
          {SRS_STEPS.map((step, idx) => {
            const { x, y } = stepCenter(step);
            const isDecision = step.type === 'decision';
            const isFailure = step.type === 'failure';
            const isTerminal = step.type === 'terminal';
            const w = isDecision ? 64 : 170;
            const h = isDecision ? 64 : 52;
            const rx = isTerminal ? 28 : 12;
            return (
              <motion.g
                key={step.id}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
              >
                {isDecision ? (
                  <polygon
                    points={`${x},${y - h / 2} ${x + w / 2},${y} ${x},${y + h / 2} ${x - w / 2},${y}`}
                    fill={isFailure ? '#fee2e2' : '#ecfdf5'}
                    stroke={isFailure ? '#ef4444' : '#10b981'}
                    strokeWidth={2}
                    className="dark:fill-slate-800"
                  />
                ) : (
                  <rect
                    x={x - w / 2}
                    y={y - h / 2}
                    width={w}
                    height={h}
                    rx={rx}
                    fill={isFailure ? '#fee2e2' : isTerminal ? '#0f172a' : '#ffffff'}
                    stroke={isFailure ? '#ef4444' : isTerminal ? '#0f172a' : '#10b981'}
                    strokeWidth={2}
                    className="dark:fill-slate-800 dark:stroke-slate-600"
                  />
                )}
                {isDecision ? (
                  <text x={x} y={y + 5} textAnchor="middle" fill={isFailure ? '#b91c1c' : '#064e3b'} fontSize={16} fontWeight={900} className="dark:fill-slate-100">?</text>
                ) : (
                  <>
                    <text
                      x={x}
                      y={y - 2}
                      textAnchor="middle"
                      fill={isFailure ? '#b91c1c' : isTerminal ? '#ffffff' : '#064e3b'}
                      fontSize={11}
                      fontWeight={800}
                      className="dark:fill-slate-100"
                    >
                      {step.text.length > 24 ? step.text.slice(0, 22) + '…' : step.text}
                    </text>
                    {step.sub && (
                      <text
                        x={x}
                        y={y + 14}
                        textAnchor="middle"
                        fill={isFailure ? '#991b1b' : isTerminal ? '#cbd5e1' : '#475569'}
                        fontSize={10}
                        fontWeight={600}
                        className="dark:fill-slate-400"
                      >
                        {step.sub}
                      </text>
                    )}
                  </>
                )}
              </motion.g>
            );
          })}
        </svg>
      </div>

      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Primary Actor', value: 'Banking Control Center Admin', color: 'emerald' },
          { label: 'Pre-condition', value: 'Admin has valid, non-revoked credentials', color: 'sky' },
          { label: 'Post-condition', value: 'Authenticated JWT session established', color: 'violet' },
        ].map((item) => (
          <div key={item.label} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{item.label}</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{item.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )}
</FullscreenWrapper>
  );
}

function SchemaDiagram() {
  const rowHeight = 30;
  const headerHeight = 58;
  const paddingY = 14;

  const computedTables = SCHEMA_TABLES.map((t) => ({
    ...t,
    h: Math.max(t.h, headerHeight + paddingY * 2 + t.columns.length * rowHeight),
  }));
  const getComputed = (id: string) => computedTables.find((t) => t.id === id)!;

  type Edge = 'top' | 'right' | 'bottom' | 'left';
  const edgePoint = (t: typeof computedTables[0], edge: Edge, offset = 0.5) => {
    switch (edge) {
      case 'top': return { x: t.x + t.w * offset, y: t.y };
      case 'right': return { x: t.x + t.w, y: t.y + t.h * offset };
      case 'bottom': return { x: t.x + t.w * offset, y: t.y + t.h };
      case 'left': return { x: t.x, y: t.y + t.h * offset };
    }
  };

  const manhattanRoute = (rel: typeof RELATIONSHIPS[0]) => {
    const from = getComputed(rel.from);
    const to = getComputed(rel.to);

    const routes: Record<string, () => { path: string; labelPos: { x: number; y: number }; cardinalityPos: { x: number; y: number }; startEdge: Edge; endEdge: Edge }> = {
      'roles-admins': () => {
        const p1 = edgePoint(from, 'right', 0.42);
        const p2 = edgePoint(to, 'left', 0.42);
        const midX = (p1.x + p2.x) / 2;
        return {
          path: `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`,
          labelPos: { x: midX, y: p1.y - 8 },
          cardinalityPos: { x: midX + 6, y: p1.y + 10 },
          startEdge: 'right',
          endEdge: 'left',
        };
      },
      'admins-admin_failed_attempts': () => {
        const p1 = edgePoint(from, 'right', 0.38);
        const p2 = edgePoint(to, 'left', 0.38);
        const midX = (p1.x + p2.x) / 2;
        return {
          path: `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`,
          labelPos: { x: midX, y: p1.y - 8 },
          cardinalityPos: { x: midX + 6, y: p1.y + 10 },
          startEdge: 'right',
          endEdge: 'left',
        };
      },
      'admins-admin_sessions': () => {
        const p1 = edgePoint(from, 'bottom', 0.5);
        const p2 = edgePoint(to, 'top', 0.5);
        const midY = (p1.y + p2.y) / 2;
        return {
          path: `M ${p1.x} ${p1.y} L ${p1.x} ${midY} L ${p2.x} ${midY} L ${p2.x} ${p2.y}`,
          labelPos: { x: p1.x + 8, y: midY - 8 },
          cardinalityPos: { x: p1.x + 8, y: midY + 10 },
          startEdge: 'bottom',
          endEdge: 'top',
        };
      },
      'admins-admin_audit_logs': () => {
        const p1 = edgePoint(from, 'left', 0.65);
        const p2 = edgePoint(to, 'top', 0.75);
        const cornerX = from.x - 70;
        return {
          path: `M ${p1.x} ${p1.y} L ${cornerX} ${p1.y} L ${cornerX} ${p2.y} L ${p2.x} ${p2.y}`,
          labelPos: { x: cornerX + 8, y: (p1.y + p2.y) / 2 },
          cardinalityPos: { x: cornerX + 8, y: (p1.y + p2.y) / 2 + 14 },
          startEdge: 'left',
          endEdge: 'top',
        };
      },
    };
    return routes[`${rel.from}-${rel.to}`]();
  };

  const crowFoot = (edge: Edge) => {
    switch (edge) {
      case 'left': return 'url(#crow-left)';
      case 'right': return 'url(#crow-right)';
      case 'top': return 'url(#crow-top)';
      case 'bottom': return 'url(#crow-bottom)';
    }
  };

  return (
    <FullscreenWrapper title="Schema">
      {({ isFullscreen, fit }) => (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex flex-col ${isFullscreen ? 'h-full' : ''}`}
        >
          <div className={`${fit ? 'overflow-hidden' : 'overflow-auto'} rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 ${isFullscreen ? 'flex-1 min-h-0' : 'h-[calc(100vh-320px)]'}`}>
            <svg viewBox="0 0 1520 960" className={fit ? 'w-full h-full' : 'min-w-[1520px] min-h-[960px]'} style={{ fontFamily: 'inherit' }}>
              <defs>
                <marker id="crow-left" markerWidth="14" markerHeight="10" refX="2" refY="5" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,10 M4,2 L0,5 L4,8" fill="none" stroke="#64748b" strokeWidth={1.5} className="dark:stroke-slate-400" />
                </marker>
                <marker id="crow-right" markerWidth="14" markerHeight="10" refX="12" refY="5" orient="auto" markerUnits="strokeWidth">
                  <path d="M14,0 L14,10 M10,2 L14,5 L10,8" fill="none" stroke="#64748b" strokeWidth={1.5} className="dark:stroke-slate-400" />
                </marker>
                <marker id="crow-top" markerWidth="10" markerHeight="14" refX="5" refY="12" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,14 L10,14 M2,10 L5,14 L8,10" fill="none" stroke="#64748b" strokeWidth={1.5} className="dark:stroke-slate-400" />
                </marker>
                <marker id="crow-bottom" markerWidth="10" markerHeight="14" refX="5" refY="2" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L10,0 M2,4 L5,0 L8,4" fill="none" stroke="#64748b" strokeWidth={1.5} className="dark:stroke-slate-400" />
                </marker>
              </defs>

              {/* Relationship lines */}
              {RELATIONSHIPS.map((rel) => {
                const route = manhattanRoute(rel);
                return (
                  <g key={`${rel.from}-${rel.to}`}>
                    <path
                      d={route.path}
                      fill="none"
                      stroke="#64748b"
                      strokeWidth={1.5}
                      className="dark:stroke-slate-500"
                      markerStart={crowFoot(route.startEdge)}
                      markerEnd={crowFoot(route.endEdge)}
                    />
                    <rect
                      x={route.labelPos.x - 34}
                      y={route.labelPos.y - 10}
                      width={68}
                      height={18}
                      rx={4}
                      fill="#f8fafc"
                      className="dark:fill-slate-900"
                    />
                    <text
                      x={route.labelPos.x}
                      y={route.labelPos.y}
                      textAnchor="middle"
                      fill="#475569"
                      fontSize={10}
                      fontWeight={700}
                      className="dark:fill-slate-300"
                    >
                      {rel.label}
                    </text>
                    <text
                      x={route.cardinalityPos.x}
                      y={route.cardinalityPos.y}
                      fill="#10b981"
                      fontSize={10}
                      fontWeight={800}
                      className="dark:fill-emerald-400"
                    >
                      {rel.cardinality}
                    </text>
                  </g>
                );
              })}

              {/* Tables */}
              {computedTables.map((table, tIdx) => (
                <motion.g
                  key={table.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: tIdx * 0.08 }}
                >
                  <rect
                    x={table.x}
                    y={table.y}
                    width={table.w}
                    height={table.h}
                    rx={14}
                    fill="#ffffff"
                    stroke={table.color}
                    strokeWidth={2}
                    className="dark:fill-slate-800"
                  />
                  <rect x={table.x} y={table.y} width={table.w} height={headerHeight} rx={14} fill={table.color} />
                  <rect x={table.x} y={table.y + headerHeight - 14} width={table.w} height={14} fill={table.color} />
                  <text x={table.x + 18} y={table.y + 26} fill="#ffffff" fontSize={16} fontWeight={800}>
                    {table.name}
                  </text>
                  <text x={table.x + 18} y={table.y + 46} fill="#ffffff" fontSize={11} fontWeight={600} opacity={0.9}>
                    {table.purpose}
                  </text>

                  {/* Columns */}
                  {table.columns.map((col, cIdx) => {
                    const cy = table.y + headerHeight + paddingY + cIdx * rowHeight;
                    const isPk = col.constraints?.includes('PK');
                    const isFk = col.constraints?.includes('FK');
                    const isIdx = col.constraints?.includes('IDX');
                    const badgeCount = (isPk ? 1 : 0) + (isFk ? 1 : 0) + (isIdx ? 1 : 0);
                    const badgeOffset = badgeCount * 22;
                    return (
                      <g key={col.name}>
                        <line x1={table.x + 14} y1={cy - 10} x2={table.x + table.w - 14} y2={cy - 10} stroke="#f1f5f9" className="dark:stroke-slate-700" />
                        <text x={table.x + 20} y={cy + 4} fill="#334155" fontSize={12} fontWeight={600} className="dark:fill-slate-200">
                          {col.name}
                        </text>
                        <text x={table.x + table.w - 24 - badgeOffset} y={cy + 4} textAnchor="end" fill="#64748b" fontSize={11} className="dark:fill-slate-400">
                          {col.type}
                        </text>
                        <g transform={`translate(${table.x + table.w - 20 - badgeOffset}, ${cy - 9})`}>
                          {isPk && (
                            <g>
                              <rect x={0} y={0} width={20} height={16} rx={4} fill="#10b981" />
                              <text x={10} y={11} textAnchor="middle" fill="#fff" fontSize={8} fontWeight={800}>PK</text>
                            </g>
                          )}
                          {isFk && (
                            <g transform={`translate(${isPk ? 22 : 0}, 0)`}>
                              <rect x={0} y={0} width={20} height={16} rx={4} fill="#0ea5e9" />
                              <text x={10} y={11} textAnchor="middle" fill="#fff" fontSize={8} fontWeight={800}>FK</text>
                            </g>
                          )}
                          {isIdx && (
                            <g transform={`translate(${(isPk ? 22 : 0) + (isFk ? 22 : 0)}, 0)`}>
                              <rect x={0} y={0} width={20} height={16} rx={4} fill="#f59e0b" />
                              <text x={10} y={11} textAnchor="middle" fill="#fff" fontSize={8} fontWeight={800}>IDX</text>
                            </g>
                          )}
                        </g>
                      </g>
                    );
                  })}
                </motion.g>
              ))}
            </svg>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Normalization', value: '3NF compliant', icon: BadgeCheck, color: 'emerald' },
              { label: 'Relationships', value: '4 FK constraints', icon: Network, color: 'sky' },
              { label: 'Indexes', value: '10+ performance indexes', icon: Zap, color: 'amber' },
              { label: 'Audit Trail', value: 'Immutable logs', icon: ShieldCheck, color: 'violet' },
            ].map((item) => {
              const Icon = item.icon;
              const colorMap: Record<string, string> = {
                emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
                sky: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300',
                amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
                violet: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300',
              };
              return (
                <div key={item.label} className={`flex items-center gap-3 p-4 rounded-xl border ${colorMap[item.color]}`}>
                  <Icon className="w-5 h-5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-70">{item.label}</p>
                    <p className="text-sm font-bold">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </FullscreenWrapper>
  );
}


function FlowDiagram() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          Layered Data Flow Architecture
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">How an admin login request traverses every layer of the stack.</p>
      </div>

      <div className="space-y-4">
        {FLOW_LAYERS.map((layer, idx) => {
          const Icon = layer.icon;
          const colorMap: Record<string, string> = {
            emerald: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
            sky: 'border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300',
            violet: 'border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300',
            amber: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
            rose: 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300',
          };
          return (
            <motion.div
              key={layer.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <div className={`flex items-center gap-4 p-4 rounded-xl border ${colorMap[layer.color]}`}>
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-current flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{layer.title}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {layer.items.map((item) => (
                      <span key={item} className="px-2 py-1 rounded-md bg-white/60 dark:bg-slate-900/60 border border-current/20 text-[10px] font-semibold">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50 hidden sm:block" />
              </div>
              {idx < FLOW_LAYERS.length - 1 && (
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                    <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function SecurityDiagram() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Security Control Matrix
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Defensive measures applied at every stage of admin authentication.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SECURITY_STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-emerald-500/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{step.title}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border border-emerald-500/10 dark:border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <LockKeyhole className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs font-bold text-slate-900 dark:text-white">Confidentiality</p>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">Credentials are never returned to the client. Token is httpOnly and TLS-encrypted.</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500/5 to-sky-600/10 border border-sky-500/10 dark:border-sky-500/20">
          <div className="flex items-center gap-2 mb-2">
            <ScanFace className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <p className="text-xs font-bold text-slate-900 dark:text-white">Integrity</p>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">JWT is signed with a server-side 256-bit secret; tampering is rejected immediately.</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/5 to-violet-600/10 border border-violet-500/10 dark:border-violet-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <p className="text-xs font-bold text-slate-900 dark:text-white">Availability</p>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">Rate limiting and lockout protect the login endpoint from brute-force overload.</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════ */

export default function AdminLoginArchitecture() {
  const [activeTab, setActiveTab] = useState<TabKey>('requirements');

  return (
    <div className="space-y-6 pb-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6 text-white shadow-lg"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black">Admin Login System Architecture</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              A comprehensive, production-grade view of the Banking Control Center authentication module —
              requirements, UML activity diagram, relational ER schema, data flow, and security controls.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {METRICS.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{m.label}</p>
                  <p className="text-sm font-bold">{m.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                active
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'requirements' && <RequirementsTab />}
          {activeTab === 'srs' && <SRSDiagram />}
          {activeTab === 'schema' && <SchemaDiagram />}
          {activeTab === 'flow' && <FlowDiagram />}
          {activeTab === 'security' && <SecurityDiagram />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

/* ========== TYPES ========== */
type NodeStatus = 'online' | 'warning' | 'offline';

interface ArchNode {
  id: string;
  label: string;
  icon: string;
  status: NodeStatus;
  details: string[];
  metrics: { label: string; value: string }[];
}

interface ArchLayer {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  icon: string;
  nodes: ArchNode[];
}

interface SecurityStepData {
  step: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface LifecycleStepData {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface DeploymentCardData {
  category: string;
  icon: string;
  color: string;
  current: string;
  currentDetails: string[];
  production: string;
  productionDetails: string[];
}

interface TechItemData {
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface ChartPoint {
  time: number;
  value: number;
}

interface MetricItem {
  label: string;
  value: number;
  unit: string;
  color: string;
  icon: string;
}

/* ========== STYLE MAPS ========== */
const LAYER_STYLES: Record<string, { border: string; bg: string; text: string; badge: string; glow: string; light: string }> = {
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500', glow: 'shadow-emerald-500/20', light: 'bg-emerald-500/5' },
  sky:     { border: 'border-sky-500/30',     bg: 'bg-sky-500/10',     text: 'text-sky-400',     badge: 'bg-sky-500',     glow: 'shadow-sky-500/20',     light: 'bg-sky-500/5' },
  violet:  { border: 'border-violet-500/30',  bg: 'bg-violet-500/10',  text: 'text-violet-400',  badge: 'bg-violet-500',  glow: 'shadow-violet-500/20',  light: 'bg-violet-500/5' },
  rose:    { border: 'border-rose-500/30',    bg: 'bg-rose-500/10',    text: 'text-rose-400',    badge: 'bg-rose-500',    glow: 'shadow-rose-500/20',    light: 'bg-rose-500/5' },
  amber:   { border: 'border-amber-500/30',   bg: 'bg-amber-500/10',   text: 'text-amber-400',   badge: 'bg-amber-500',   glow: 'shadow-amber-500/20',   light: 'bg-amber-500/5' },
  cyan:    { border: 'border-cyan-500/30',    bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    badge: 'bg-cyan-500',    glow: 'shadow-cyan-500/20',    light: 'bg-cyan-500/5' },
  teal:    { border: 'border-teal-500/30',    bg: 'bg-teal-500/10',    text: 'text-teal-400',    badge: 'bg-teal-500',    glow: 'shadow-teal-500/20',    light: 'bg-teal-500/5' },
  pink:    { border: 'border-pink-500/30',    bg: 'bg-pink-500/10',    text: 'text-pink-400',    badge: 'bg-pink-500',    glow: 'shadow-pink-500/20',    light: 'bg-pink-500/5' },
  orange:  { border: 'border-orange-500/30',  bg: 'bg-orange-500/10',  text: 'text-orange-400',  badge: 'bg-orange-500',  glow: 'shadow-orange-500/20',  light: 'bg-orange-500/5' },
  red:     { border: 'border-red-500/30',     bg: 'bg-red-500/10',     text: 'text-red-400',     badge: 'bg-red-500',     glow: 'shadow-red-500/20',     light: 'bg-red-500/5' },
  blue:    { border: 'border-blue-500/30',    bg: 'bg-blue-500/10',    text: 'text-blue-400',    badge: 'bg-blue-500',    glow: 'shadow-blue-500/20',    light: 'bg-blue-500/5' },
  slate:   { border: 'border-slate-500/30',   bg: 'bg-slate-500/10',   text: 'text-slate-400',   badge: 'bg-slate-500',   glow: 'shadow-slate-500/20',   light: 'bg-slate-500/5' },
  gray:    { border: 'border-gray-500/30',    bg: 'bg-gray-500/10',    text: 'text-gray-400',    badge: 'bg-gray-500',    glow: 'shadow-gray-500/20',    light: 'bg-gray-500/5' },
  yellow:  { border: 'border-yellow-500/30',  bg: 'bg-yellow-500/10',  text: 'text-yellow-400',  badge: 'bg-yellow-500',  glow: 'shadow-yellow-500/20',  light: 'bg-yellow-500/5' },
  primary: { border: 'border-primary/30',     bg: 'bg-primary/10',     text: 'text-primary',     badge: 'bg-primary',     glow: 'shadow-primary/20',     light: 'bg-primary/5' },
};

const COLOR_HEX: Record<string, string> = {
  emerald: '#10b981', sky: '#0ea5e9', violet: '#8b5cf6', rose: '#f43f5e',
  amber: '#f59e0b', cyan: '#06b6d4', teal: '#14b8a6', pink: '#ec4899',
  orange: '#f97316', red: '#ef4444', blue: '#3b82f6', slate: '#64748b',
  gray: '#6b7280', yellow: '#eab308', primary: '#0f766e',
};

function getStatusDotClass(status: NodeStatus): string {
  switch (status) {
    case 'online': return 'bg-emerald-500';
    case 'warning': return 'bg-amber-500';
    case 'offline': return 'bg-rose-500';
  }
}

function getStatusLabel(status: NodeStatus): string {
  switch (status) {
    case 'online': return 'Online';
    case 'warning': return 'Degraded';
    case 'offline': return 'Offline';
  }
}

/* ========== DATA ========== */
const ARCHITECTURE_LAYERS: ArchLayer[] = [
  {
    id: 'client',
    name: 'Client Layer',
    subtitle: 'React 18 SPA, PWA, Service Worker',
    color: 'emerald',
    icon: 'fa-desktop',
    nodes: [
      { id: 'react18', label: 'React 18 SPA', icon: 'fa-code', status: 'online', details: ['Concurrent rendering', 'Suspense boundaries', 'Error boundaries', 'Strict Mode enabled'], metrics: [{ label: 'Bundle', value: '~420 KB' }, { label: 'FCP', value: '<0.8s' }] },
      { id: 'pwa', label: 'PWA', icon: 'fa-mobile-screen-button', status: 'online', details: ['Web App Manifest', 'Installable to home screen', 'Background sync', 'Push notifications ready'], metrics: [{ label: 'Lighthouse', value: '98+' }, { label: 'PWA', value: '100' }] },
      { id: 'sw', label: 'Service Worker', icon: 'fa-gear', status: 'online', details: ['Request interception', 'Cache-first strategy', 'Offline fallback pages', 'Background sync queue'], metrics: [{ label: 'Cache', value: 'v2' }, { label: 'Scope', value: '/' }] },
    ],
  },
  {
    id: 'gateway',
    name: 'API Gateway',
    subtitle: 'Express.js, Rate Limiting, CORS, JWT',
    color: 'sky',
    icon: 'fa-server',
    nodes: [
      { id: 'express', label: 'Express.js', icon: 'fa-server', status: 'online', details: ['REST API endpoints', 'Middleware pipeline', 'Structured error handling', 'Request logging'], metrics: [{ label: 'Latency', value: '<30ms' }, { label: 'Throughput', value: '10K/s' }] },
      { id: 'ratelimit', label: 'Rate Limiting', icon: 'fa-gauge-high', status: 'online', details: ['Sliding window algorithm', 'IP-based throttling', 'User-tier limits', '429 rate limit responses'], metrics: [{ label: 'Limit', value: '100/min' }, { label: 'Burst', value: '20' }] },
      { id: 'corsjwt', label: 'CORS + JWT', icon: 'fa-shield-halved', status: 'online', details: ['Whitelisted origins only', 'RS256 JWT signing', '15 minute token expiry', 'Refresh token rotation'], metrics: [{ label: 'Algo', value: 'RS256' }, { label: 'Expiry', value: '15m' }] },
    ],
  },
  {
    id: 'ai',
    name: 'AI Engine',
    subtitle: 'Gemini 2.0 Flash, Hugging Face Fallback',
    color: 'violet',
    icon: 'fa-brain',
    nodes: [
      { id: 'gemini', label: 'Gemini 2.0 Flash', icon: 'fa-wand-magic-sparkles', status: 'online', details: ['Google GenAI SDK', 'Streaming text responses', '1M token context window', 'Multi-modal input capable'], metrics: [{ label: 'Latency', value: '~600ms' }, { label: 'Accuracy', value: '96.5%' }] },
      { id: 'hf', label: 'HF Flan-T5 Fallback', icon: 'fa-robot', status: 'online', details: ['Hugging Face Inference API', 'Flan-T5 XL model', 'Zero-shot classification', 'Text generation pipeline'], metrics: [{ label: 'Latency', value: '~1.2s' }, { label: 'Fallback', value: 'Auto' }] },
      { id: 'offline', label: 'Offline Router', icon: 'fa-wifi', status: 'warning', details: ['Rule-based local responses', 'Cached response templates', 'Local inference stub', 'Graceful degradation path'], metrics: [{ label: 'Rules', value: '50+' }, { label: 'Coverage', value: '70%' }] },
    ],
  },
  {
    id: 'security',
    name: 'Security Beast',
    subtitle: 'Browser-Native Zero-Trust Defense',
    color: 'rose',
    icon: 'fa-dragon',
    nodes: [
      { id: 'tpm', label: 'TPM / Attestation', icon: 'fa-microchip', status: 'online', details: ['Non-exportable ECDSA P-256 via Web Crypto', 'Challenge signing + verification', 'Platform attestation quote', 'No hardware dependency for demo'], metrics: [{ label: 'Attest', value: '<200ms' }, { label: 'Trust', value: 'L1' }] },
      { id: 'browser-threat', label: 'Browser Threat Monitor', icon: 'fa-shield-halved', status: 'online', details: ['CSP violation listener', 'DevTools-open detection', 'Suspicious global access heuristics', 'Synthetic injection test'], metrics: [{ label: 'Overhead', value: '<1%' }, { label: 'Trust', value: 'L2' }] },
      { id: 'fraud-engine', label: 'Fraud Detection Engine', icon: 'fa-magnifying-glass-chart', status: 'online', details: ['Real transaction-history rules', 'Velocity, duplicate & round-amount checks', 'First-time payee + category anomalies', 'Live risk badges per transaction'], metrics: [{ label: 'Detect', value: '<50ms' }, { label: 'Trust', value: 'L3' }] },
      { id: 'honeytokens', label: 'Honeytokens', icon: 'fa-bug', status: 'online', details: ['Decoy accounts worth ₹10L', 'Canary credentials planted', 'Interaction tracking', 'Auto-freeze on touch'], metrics: [{ label: 'Decoys', value: '12' }, { label: 'Trust', value: 'L4' }] },
      { id: 'passkeys', label: 'FIDO2 Passkeys', icon: 'fa-fingerprint', status: 'online', details: ['Real WebAuthn create/get', 'Platform authenticator binding', 'Password elimination', 'Cross-device sync ready'], metrics: [{ label: 'Phish', value: '0%' }, { label: 'Trust', value: 'L5' }] },
      { id: 'pq', label: 'Post-Quantum', icon: 'fa-atom', status: 'online', details: ['ML-KEM-768 KEM (mlkem)', 'NIST FIPS 203 candidate', 'AES-GCM payload encryption', 'Shared-secret verification'], metrics: [{ label: 'Key Gen', value: '~5ms' }, { label: 'Trust', value: 'L6' }] },
      { id: 'behavioral', label: 'Behavioral Bio', icon: 'fa-wave-square', status: 'online', details: ['Keystroke dwell & flight times', 'Mouse velocity + scroll events', 'Baseline calibration', 'Anomaly lock on deviation'], metrics: [{ label: 'Threshold', value: '30%' }, { label: 'Trust', value: 'L7' }] },
      { id: 'did', label: 'Decentralized ID', icon: 'fa-id-card', status: 'online', details: ['ECDSA P-256 signed VC', 'JWS + QR code', 'Signature verification', 'IndexedDB key persistence'], metrics: [{ label: 'Verify', value: '<100ms' }, { label: 'Trust', value: 'L8' }] },
      { id: 'traps', label: 'Transaction Traps', icon: 'fa-user-secret', status: 'online', details: ['RFC 6238 TOTP generation', 'Real + trap confirmation codes', 'Instant lockdown trigger', 'Silent security alerts'], metrics: [{ label: 'Detect', value: '<100ms' }, { label: 'Trust', value: 'L9' }] },
      { id: 'url-safety', label: 'URL Safety Checker', icon: 'fa-link', status: 'online', details: ['Static heuristic rules', 'Cloudflare DoH lookup', 'Live HTTPS probe', 'Trusted-domain whitelist'], metrics: [{ label: 'Scan', value: '<300ms' }, { label: 'Trust', value: 'L10' }] },
      { id: 'enclave', label: 'Secure Enclave', icon: 'fa-lock', status: 'online', details: ['Non-exportable Web Crypto keys', 'Signed attestation challenge', 'Hardware-backed keystore when available', 'Jailbreak / root detection stub'], metrics: [{ label: 'Verify', value: '<100ms' }, { label: 'Trust', value: 'L11' }] },
      { id: 'device-trust', label: 'Device Trust', icon: 'fa-laptop-medical', status: 'online', details: ['SHA-256 device fingerprint', 'Canvas + WebGL + fonts entropy', 'Trust score per session', 'Account takeover warning'], metrics: [{ label: 'Hash', value: 'SHA-256' }, { label: 'Trust', value: 'L12' }] },
      { id: 'blockchain', label: 'Blockchain Audit', icon: 'fa-cubes', status: 'online', details: ['SHA-256 Merkle chain', 'Tamper detection algorithm', 'Per-action receipt hash', 'Local explorer view'], metrics: [{ label: 'Blocks', value: 'Live' }, { label: 'Trust', value: 'L13' }] },
    ],
  },
  {
    id: 'data',
    name: 'Data Layer',
    subtitle: 'Zustand, localStorage, PostgreSQL, Redis',
    color: 'amber',
    icon: 'fa-database',
    nodes: [
      { id: 'zustand', label: 'Zustand', icon: 'fa-bolt', status: 'online', details: ['Atomic state slices', 'No provider boilerplate', 'DevTools middleware', 'Shallow equality checks'], metrics: [{ label: 'Stores', value: '8' }, { label: 'Re-renders', value: 'Min' }] },
      { id: 'localstorage', label: 'localStorage', icon: 'fa-hard-drive', status: 'online', details: ['JSON serialization', 'Encrypted at rest', '5MB browser quota', 'Cross-tab synchronization'], metrics: [{ label: 'Used', value: '~120KB' }, { label: 'Quota', value: '5MB' }] },
      { id: 'postgres', label: 'PostgreSQL', icon: 'fa-database', status: 'warning', details: ['User profile storage', 'Transaction history', 'Append-only audit logs', 'Goal tracking tables'], metrics: [{ label: 'Queries', value: '~2ms' }, { label: 'Encryption', value: 'AES-256' }] },
      { id: 'redis', label: 'Redis Cache', icon: 'fa-bolt', status: 'online', details: ['JWT session store', 'API response cache', 'Rate limit counters', 'Pub/Sub event bus'], metrics: [{ label: 'Latency', value: '<1ms' }, { label: 'Hit Rate', value: '85%' }] },
    ],
  },
  {
    id: 'external',
    name: 'External APIs',
    subtitle: 'RBI AA, NSE/BSE, CKYC, Surge.sh CDN',
    color: 'cyan',
    icon: 'fa-cloud',
    nodes: [
      { id: 'rbiaa', label: 'RBI AA', icon: 'fa-building-columns', status: 'online', details: ['Sahamati network', 'Consent management', 'FIP/FIU protocols', 'Account aggregation'], metrics: [{ label: 'Uptime', value: '99.5%' }, { label: 'Latency', value: '~400ms' }] },
      { id: 'market', label: 'NSE / BSE', icon: 'fa-chart-line', status: 'online', details: ['Real-time market quotes', 'Historical OHLCV data', 'Market depth feed', 'Corporate actions API'], metrics: [{ label: 'Delay', value: '<1s' }, { label: 'Coverage', value: '100%' }] },
      { id: 'ckyc', label: 'CKYC', icon: 'fa-passport', status: 'warning', details: ['KYC verification API', 'Identity validation', 'Document OCR pipeline', 'AML screening check'], metrics: [{ label: 'Match', value: '99.2%' }, { label: 'Latency', value: '~2s' }] },
      { id: 'surge', label: 'Surge.sh CDN', icon: 'fa-globe', status: 'online', details: ['Static site hosting', 'Global edge network', 'HTTPS by default', 'Instant deployment'], metrics: [{ label: 'TTFB', value: '<50ms' }, { label: 'Cache', value: 'Edge' }] },
    ],
  },
];

const SECURITY_STEPS: SecurityStepData[] = [
  { step: 1, title: 'TPM / Hardware Attestation', description: 'A non-exportable ECDSA P-256 key pair is generated in the browser. The platform signs a challenge to prove identity before sensitive access.', icon: 'fa-microchip', color: 'emerald' },
  { step: 2, title: 'Browser Threat Monitor', description: 'CSP violations, devtools-open detection, and suspicious global accesses are monitored in real time. Critical threats reload the session.', icon: 'fa-shield-halved', color: 'violet' },
  { step: 3, title: 'FIDO2 Passkeys + Enclave', description: 'Real WebAuthn navigator.credentials.create/get with platform authenticators. Biometric passkeys are bound to hardware when available.', icon: 'fa-fingerprint', color: 'sky' },
  { step: 4, title: 'Behavioral Biometrics', description: 'Live keystroke dwell/flight times, mouse velocity, and scroll events build a profile. Deviation above the calibrated baseline triggers lock.', icon: 'fa-wave-square', color: 'amber' },
  { step: 5, title: 'Decentralized Identity', description: 'An ECDSA-signed verifiable credential is issued as a JWS and shown as a QR code. Signature verification happens locally without central PII.', icon: 'fa-id-card', color: 'teal' },
  { step: 6, title: 'Post-Quantum Tunnel', description: 'ML-KEM-768 key encapsulation derives an AES-GCM key. A demo payload is encrypted, transmitted, and decrypted to verify quantum-safe exchange.', icon: 'fa-atom', color: 'pink' },
  { step: 7, title: 'Fraud Detection Engine', description: 'Every transaction is scored against velocity, duplicate, round-amount, category, and first-time-payee rules. Flagged items surface instantly.', icon: 'fa-magnifying-glass-chart', color: 'orange' },
  { step: 8, title: 'Transaction Trap Codes', description: 'High-value transfers display a real RFC 6238 TOTP and a trap code. Entering the trap freezes the account for 24 hours and logs a critical alert.', icon: 'fa-user-secret', color: 'rose' },
  { step: 9, title: 'Honeytokens', description: 'Decoy accounts worth ₹10L are hidden in the UI. Any interaction triggers an immediate account freeze and a silent security alert.', icon: 'fa-bug', color: 'red' },
  { step: 10, title: 'URL Safety Checker', description: 'URLs are scored with heuristics, Cloudflare DNS-over-HTTPS, and a live HTTPS probe before any sensitive navigation is allowed.', icon: 'fa-link', color: 'cyan' },
  { step: 11, title: 'Secure Enclave Verification', description: 'Non-exportable Web Crypto keys act as a hardware-backed keystore. Attestation signing and jailbreak/root heuristics block compromised devices.', icon: 'fa-lock', color: 'blue' },
  { step: 12, title: 'Device Trust Fingerprint', description: 'A SHA-256 fingerprint from canvas, WebGL, fonts, and browser entropy creates a per-session trust score and warns on account takeover.', icon: 'fa-laptop-medical', color: 'slate' },
  { step: 13, title: 'Blockchain Audit Trail', description: 'Every security-relevant action is hashed into a local Merkle-linked chain. Tampering breaks the chain and raises an immediate alert.', icon: 'fa-cubes', color: 'gray' },
];

const LIFECYCLE_STEPS: LifecycleStepData[] = [
  { id: 'sw', title: 'Service Worker', description: 'Intercepts request, checks cache, serves offline-first', icon: 'fa-gear' },
  { id: 'auth', title: 'Biometric Auth', description: 'Passkey / biometric verification via WebAuthn API', icon: 'fa-fingerprint' },
  { id: 'gateway', title: 'API Gateway', description: 'Rate limit check, JWT validation, CORS handling', icon: 'fa-server' },
  { id: 'ai', title: 'AI Query', description: 'Context assembly, model selection, response generation', icon: 'fa-brain' },
  { id: 'risk', title: 'Risk Engine', description: 'Transaction evaluation, fraud scoring, rule matching', icon: 'fa-shield-halved' },
  { id: 'response', title: 'Response', description: 'Cache write, UI render, state update', icon: 'fa-rotate-right' },
];

const DEPLOYMENT_ITEMS: DeploymentCardData[] = [
  { category: 'CDN / Edge', icon: 'fa-globe', color: 'sky', current: 'Surge.sh', currentDetails: ['Static CDN', 'HTTPS default', 'Instant deploy', 'Global edge'], production: 'Cloudflare', productionDetails: ['Workers at edge', 'DDoS protection', 'Argo smart routing', '99.99% SLA'] },
  { category: 'Compute', icon: 'fa-server', color: 'primary', current: 'Static Hosting', currentDetails: ['Client-side only', 'No server runtime', 'Browser processing', 'Vite build'], production: 'ECS Fargate', productionDetails: ['Container orchestration', 'Auto-scaling 2-50', 'Load balancing', 'Blue-green deploy'] },
  { category: 'Database', icon: 'fa-database', color: 'amber', current: 'localStorage + Zustand', currentDetails: ['Client persistence', '5MB limit', 'JSON store', 'No replication'], production: 'PostgreSQL Multi-AZ', productionDetails: ['RDS Multi-AZ', 'Read replicas', 'Automated backups', 'Point-in-time recovery'] },
  { category: 'AI', icon: 'fa-brain', color: 'violet', current: 'Offline Router', currentDetails: ['Rule-based responses', 'Cached templates', 'Limited coverage', 'No model inference'], production: 'Gemini + HF Fallback', productionDetails: ['Gemini 2.0 Flash', 'Hugging Face backup', 'Streaming responses', 'Context memory'] },
  { category: 'Security', icon: 'fa-dragon', color: 'rose', current: 'Browser-Native Engine', currentDetails: ['Real WebAuthn + mlkem', 'Web Crypto primitives', 'Local rule engine', 'No backend trust required'], production: '13-Layer Beast', productionDetails: ['Full stack defense', 'Hardware attestation', 'Kernel monitoring', 'Immutable audit'] },
];

const TECH_CARDS: TechItemData[] = [
  { name: 'React 18', description: 'Concurrent UI with Suspense boundaries', icon: 'fa-code', color: 'sky' },
  { name: 'TypeScript', description: 'Type-safe development at scale', icon: 'fa-scroll', color: 'blue' },
  { name: 'Vite', description: 'Lightning-fast HMR and builds', icon: 'fa-bolt', color: 'amber' },
  { name: 'Tailwind v4', description: 'Utility-first CSS framework', icon: 'fa-wind', color: 'cyan' },
  { name: 'Zustand', description: 'Minimal atomic state management', icon: 'fa-bolt', color: 'slate' },
  { name: 'Recharts', description: 'Composable charting library', icon: 'fa-chart-line', color: 'emerald' },
  { name: 'Framer Motion', description: 'Production-ready animations', icon: 'fa-film', color: 'violet' },
  { name: 'Express', description: 'Fast, unopinionated web framework', icon: 'fa-server', color: 'gray' },
  { name: 'Gemini', description: 'Google multimodal AI inference', icon: 'fa-wand-magic-sparkles', color: 'teal' },
  { name: 'Hugging Face', description: 'Open-source ML model hub', icon: 'fa-smile', color: 'yellow' },
];

/* ========== HELPERS ========== */
function AnimatedCounter({ value }: { value: number }) {
  const targetRef = useRef(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    targetRef.current = value;
  }, [value]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplay(prev => {
        const diff = targetRef.current - prev;
        if (Math.abs(diff) < 0.5) return targetRef.current;
        return prev + diff * 0.15;
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return <span>{Math.round(display).toLocaleString()}</span>;
}

/* ========== SECTION 1: ARCHITECTURE HERO ========== */
function ArchitectureHero() {
  const [activeUsers, setActiveUsers] = useState(1247);
  const [responseTime, setResponseTime] = useState(42);
  const [requestsMin, setRequestsMin] = useState(1843);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => Math.max(800, prev + Math.floor(Math.random() * 9) - 4));
      setResponseTime(prev => Math.max(20, Math.min(80, prev + Math.floor(Math.random() * 11) - 5)));
      setRequestsMin(prev => Math.max(1200, prev + Math.floor(Math.random() * 31) - 15));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="card"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold gradient-text">System Architecture</h1>
          <motion.p
            className="text-sm text-slate-500 dark:text-slate-400 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Interactive technical diagram — explore every layer of the SecureWealth Twin platform
          </motion.p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-premium text-[10px]">
            <i className="fas fa-circle-check mr-1" /> Production Ready
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <div className="card-stat text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="status-dot status-dot-green" />
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">System Online</span>
          </div>
          <p className="text-[10px] text-slate-400">All systems operational</p>
        </div>
        <div className="card-stat text-center">
          <p className="text-lg font-bold text-slate-800 dark:text-white">
            <AnimatedCounter value={activeUsers} />
          </p>
          <p className="text-[10px] text-slate-400">Active Users</p>
        </div>
        <div className="card-stat text-center">
          <p className="text-lg font-bold text-slate-800 dark:text-white">{responseTime}ms</p>
          <p className="text-[10px] text-slate-400">Avg Response Time</p>
        </div>
        <div className="card-stat text-center">
          <p className="text-lg font-bold text-slate-800 dark:text-white">
            <AnimatedCounter value={requestsMin} />
          </p>
          <p className="text-[10px] text-slate-400">Requests/min</p>
          <p className="text-[9px] text-slate-300 mt-0.5">Last deploy: {now}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ========== SECTION 2: INTERACTIVE LAYERED ARCHITECTURE ========== */
function DataPacketConnector({ color, count = 3 }: { color: string; count?: number }) {
  const styles = LAYER_STYLES[color] || LAYER_STYLES.sky;
  return (
    <div className="relative h-5 flex justify-center overflow-hidden">
      <div className="absolute top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1.5 h-1.5 rounded-full ${styles.badge}`}
          animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: 'linear' }}
          style={{ left: `calc(50% - 3px + ${(i - 1) * 18}px)` }}
        />
      ))}
    </div>
  );
}

function NodeCard({
  node,
  layerColor,
  isSelected,
  isDimmed,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  node: ArchNode;
  layerColor: string;
  isSelected: boolean;
  isDimmed: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const styles = LAYER_STYLES[layerColor] || LAYER_STYLES.slate;
  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        relative cursor-pointer rounded-xl border p-3 transition-all duration-300 select-none
        ${isSelected ? `${styles.border} ${styles.light} shadow-lg ${styles.glow}` : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}
        ${isDimmed ? 'opacity-30 scale-95' : 'opacity-100 scale-100 hover:shadow-md'}
      `}
      whileHover={{ scale: isDimmed ? 0.95 : 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`w-2 h-2 rounded-full ${getStatusDotClass(node.status)}`} />
        <i className={`fas ${node.icon} text-[10px] ${styles.text}`} />
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{node.label}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {node.metrics.map(m => (
          <span key={m.label} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
            {m.label}: {m.value}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function NodeDetailPanel({ node, layer, onClose }: { node: ArchNode; layer: ArchLayer; onClose: () => void }) {
  const styles = LAYER_STYLES[layer.color] || LAYER_STYLES.slate;
  const hex = COLOR_HEX[layer.color] || '#64748b';

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="card h-fit sticky top-4"
      style={{ borderLeft: `4px solid ${hex}` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${styles.badge}`}>
            <i className={`fas ${node.icon}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{node.label}</h3>
            <p className="text-[10px] text-slate-500">{layer.name} — {getStatusLabel(node.status)}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          <i className="fas fa-times text-xs" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tech Stack Details</p>
          <div className="space-y-1.5">
            {node.details.map((d, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <i className="fas fa-check-circle text-emerald-500 text-[10px]" />
                <span className="text-xs text-slate-600 dark:text-slate-300">{d}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Performance Metrics</p>
          <div className="grid grid-cols-2 gap-2">
            {node.metrics.map(m => (
              <div key={m.label} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-center">
                <p className="text-base font-bold text-slate-800 dark:text-white">{m.value}</p>
                <p className="text-[9px] text-slate-400">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status</p>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div className={`w-2.5 h-2.5 rounded-full ${getStatusDotClass(node.status)}`} />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{getStatusLabel(node.status)}</span>
            <span className="text-[9px] text-slate-400 ml-auto">Updated just now</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InteractiveArchitecture() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const selectedData = useMemo(() => {
    if (!selectedNode) return null;
    for (const layer of ARCHITECTURE_LAYERS) {
      const node = layer.nodes.find(n => n.id === selectedNode);
      if (node) return { node, layer };
    }
    return null;
  }, [selectedNode]);

  const isNodeDimmed = (nodeId: string) => {
    if (!hoveredNode && !selectedNode) return false;
    const active = hoveredNode || selectedNode;
    return active !== nodeId;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="section-title flex items-center gap-2">
            <i className="fas fa-layer-group text-primary" /> Interactive Layered Architecture
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Click any node to inspect. Hover to highlight connections.</p>
        </div>
        {selectedNode && (
          <button
            onClick={() => setSelectedNode(null)}
            className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <i className="fas fa-times mr-1" /> Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`transition-all duration-500 ${selectedNode ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="space-y-0">
            {ARCHITECTURE_LAYERS.map((layer, layerIndex) => {
              const styles = LAYER_STYLES[layer.color] || LAYER_STYLES.slate;
              return (
                <div key={layer.id}>
                  <div className="flex gap-3 items-stretch">
                    {/* Layer label strip */}
                    <div className={`hidden sm:flex flex-col justify-center w-28 md:w-32 rounded-xl ${styles.light} border ${styles.border} p-2 flex-shrink-0`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <i className={`fas ${layer.icon} text-[10px] ${styles.text}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${styles.text}`}>{layer.name}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight">{layer.subtitle}</p>
                    </div>

                    {/* Mobile layer label */}
                    <div className="sm:hidden mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${styles.text}`}>
                        <i className={`fas ${layer.icon} mr-1`} />{layer.name}
                      </span>
                    </div>

                    {/* Nodes */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                      {layer.nodes.map(node => (
                        <NodeCard
                          key={node.id}
                          node={node}
                          layerColor={layer.color}
                          isSelected={selectedNode === node.id}
                          isDimmed={isNodeDimmed(node.id)}
                          onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                          onMouseEnter={() => setHoveredNode(node.id)}
                          onMouseLeave={() => setHoveredNode(null)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Connector between layers */}
                  {layerIndex < ARCHITECTURE_LAYERS.length - 1 && (
                    <DataPacketConnector color={layer.color} count={3} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {selectedNode && selectedData && (
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
            >
              <NodeDetailPanel
                node={selectedData.node}
                layer={selectedData.layer}
                onClose={() => setSelectedNode(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}


/* ========== SECTION 3: SECURITY BEAST FLOW ========== */
function SecurityBeastFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const [trustScore, setTrustScore] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => {
        const next = (prev + 1) % SECURITY_STEPS.length;
        setTrustScore(Math.min(100, next * 8 + 8));
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="card"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="section-title flex items-center gap-2">
            <i className="fas fa-dragon text-rose-500" /> Security Beast Flow
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">10-layer zero-trust defense in action</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Trust Score</span>
          <div className="w-28 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              animate={{ width: `${trustScore}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <motion.span
            className="text-xs font-bold text-emerald-500 w-8 text-right"
            key={trustScore}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            {trustScore}
          </motion.span>
        </div>
      </div>

      <div className="relative">
        {/* Vertical connecting line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700 rounded-full" />

        {/* Traveling dot */}
        <motion.div
          className="absolute left-[19px] w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50 z-10"
          animate={{ top: `calc(${(activeStep / (SECURITY_STEPS.length - 1)) * 100}% - 6px)` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{ marginLeft: '-5px' }}
        />

        <div className="space-y-1">
          {SECURITY_STEPS.map((step, index) => {
            const isActive = index === activeStep;
            const isPassed = index < activeStep;
            const styles = LAYER_STYLES[step.color] || LAYER_STYLES.slate;
            return (
              <motion.div
                key={step.step}
                className={`
                  flex items-start gap-4 p-3 rounded-xl transition-colors duration-300
                  ${isActive ? 'bg-rose-500/5 dark:bg-rose-500/10' : ''}
                `}
                animate={isActive ? { scale: [1, 1.01, 1] } : { scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  className={`
                    relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0
                    transition-all duration-300
                    ${isPassed || isActive ? styles.badge : 'bg-slate-300 dark:bg-slate-600'}
                    ${isActive ? 'shadow-lg ' + styles.glow : ''}
                  `}
                >
                  <i className={`fas ${step.icon}`} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400">L{step.step}</span>
                    <h4 className={`text-sm font-semibold ${isActive ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'}`}>
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ========== SECTION 4: DATA FLOW LIFECYCLE ========== */
function DataFlowLifecycle() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % LIFECYCLE_STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="card"
    >
      <h3 className="section-title mb-5 flex items-center gap-2">
        <i className="fas fa-route text-sky-500" /> Data Flow Lifecycle
      </h3>

      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-slate-200 dark:bg-slate-700 rounded-full hidden md:block" />
        <motion.div
          className="absolute top-5 left-[10%] h-1 bg-sky-500 rounded-full hidden md:block"
          animate={{ width: `${(activeStep / (LIFECYCLE_STEPS.length - 1)) * 80}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {LIFECYCLE_STEPS.map((step, index) => {
            const isActive = index === activeStep;
            const isPassed = index <= activeStep;
            return (
              <div key={step.id} className="relative flex flex-col items-center text-center">
                <motion.div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm z-10 mb-3
                    transition-colors duration-300
                    ${isPassed ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}
                  `}
                  animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <i className={`fas ${step.icon}`} />
                </motion.div>
                <h4 className={`text-xs font-semibold mb-0.5 ${isPassed ? 'text-sky-500' : 'text-slate-500 dark:text-slate-400'}`}>
                  {step.title}
                </h4>
                <p className="text-[10px] text-slate-400 leading-tight max-w-[120px]">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ========== SECTION 5: DEPLOYMENT TOPOLOGY ========== */
function DeploymentTopology() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="section-title flex items-center gap-2">
            <i className="fas fa-cloud text-sky-500" /> Deployment Topology
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Current hackathon demo vs production target architecture</p>
        </div>
        <span className="badge badge-premium text-[10px]">
          <i className="fas fa-globe mr-1" /> Multi-Region
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEPLOYMENT_ITEMS.map(item => {
          const styles = LAYER_STYLES[item.color] || LAYER_STYLES.slate;
          return (
            <motion.div
              key={item.category}
              className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800"
              whileHover={{ y: -3, boxShadow: '0 12px 32px -4px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.3 }}
            >
              <div className={`p-3 border-b border-slate-200 dark:border-slate-700 ${styles.light}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${styles.bg}`}>
                    <i className={`fas ${item.icon} text-xs ${styles.text}`} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.category}</span>
                </div>
              </div>
              <div className="p-3 space-y-3">
                <div>
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Current (Demo)</span>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{item.current}</p>
                  <div className="mt-1.5 space-y-1">
                    {item.currentDetails.map((d, i) => (
                      <p key={i} className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <i className="fas fa-circle text-[3px] text-slate-300" /> {d}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-700 pt-2">
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Production Target</span>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{item.production}</p>
                  <div className="mt-1.5 space-y-1">
                    {item.productionDetails.map((d, i) => (
                      <p key={i} className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <i className="fas fa-circle text-[3px] text-slate-300" /> {d}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-100 dark:border-sky-800">
        <p className="text-xs text-sky-700 dark:text-sky-300 font-medium">
          <i className="fas fa-info-circle mr-1.5" />
          Frontend on Surge.sh CDN | Client-side engine | Data: Browser localStorage + Zustand persist.
          Production target: AWS Mumbai region with DR in Singapore.
        </p>
      </div>
    </motion.div>
  );
}

/* ========== SECTION 6: REAL-TIME METRICS DASHBOARD ========== */
function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricItem[]>([
    { label: 'Requests/min', value: 1240, unit: '', color: 'sky', icon: 'fa-bolt' },
    { label: 'Cache Hit Rate', value: 87, unit: '%', color: 'emerald', icon: 'fa-database' },
    { label: 'AI Response', value: 620, unit: 'ms', color: 'violet', icon: 'fa-brain' },
    { label: 'Threats Blocked', value: 0, unit: '', color: 'rose', icon: 'fa-shield-halved' },
    { label: 'Active Sessions', value: 342, unit: '', color: 'amber', icon: 'fa-users' },
    { label: 'Uptime', value: 99.99, unit: '%', color: 'primary', icon: 'fa-server' },
  ]);

  const [chartData, setChartData] = useState<ChartPoint[]>(() =>
    Array.from({ length: 24 }, (_, i) => ({ time: i, value: 800 + Math.random() * 400 }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev =>
        prev.map(m => {
          let variance: number;
          if (m.label === 'Uptime') variance = (Math.random() - 0.5) * 0.02;
          else if (m.label === 'Threats Blocked') variance = Math.random() > 0.85 ? 1 : 0;
          else variance = Math.floor(Math.random() * 21) - 10;
          const next = Math.max(0, m.value + variance);
          return { ...m, value: next };
        })
      );

      setChartData(prev => {
        const last = prev[prev.length - 1];
        return [...prev.slice(1), { time: last.time + 1, value: 700 + Math.random() * 500 }];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="card"
    >
      <h3 className="section-title mb-5 flex items-center gap-2">
        <i className="fas fa-chart-line text-emerald-500" /> Real-Time Metrics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {metrics.map(m => {
          const styles = LAYER_STYLES[m.color] || LAYER_STYLES.slate;
          return (
            <motion.div
              key={m.label}
              className="card-stat text-center"
              whileHover={{ y: -2 }}
            >
              <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-2 ${styles.bg}`}>
                <i className={`fas ${m.icon} text-xs ${styles.text}`} />
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-white">
                {m.label === 'Uptime' ? m.value.toFixed(2) : Math.round(m.value)}
                <span className="text-xs font-normal text-slate-400 ml-0.5">{m.unit}</span>
              </p>
              <p className="text-[10px] text-slate-400">{m.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="h-36 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0ea5e9"
              strokeWidth={2}
              fill="url(#metricGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#0ea5e9', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

/* ========== SECTION 7: TECH STACK SUMMARY ========== */
function TechStackSummary() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="card"
    >
      <h3 className="section-title mb-5 flex items-center gap-2">
        <i className="fas fa-layer-group text-primary" /> Tech Stack
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {TECH_CARDS.map(tech => {
          const styles = LAYER_STYLES[tech.color] || LAYER_STYLES.slate;
          return (
            <motion.div
              key={tech.name}
              className="card-stat text-center"
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 ${styles.bg}`}>
                <i className={`fas ${tech.icon} text-lg ${styles.text}`} />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{tech.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{tech.description}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

import PerformanceMetrics from './PerformanceMetrics';

/* ========== MAIN EXPORT ========== */
export default function SystemArchitecture() {
  return (
    <div className="space-y-6 pb-8">
      <ArchitectureHero />
      <InteractiveArchitecture />
      <SecurityBeastFlow />
      <DataFlowLifecycle />
      <DeploymentTopology />
      <MetricsDashboard />
      <PerformanceMetrics />
      <TechStackSummary />
    </div>
  );
}

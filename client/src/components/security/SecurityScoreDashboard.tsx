import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSecurity } from '../../context/SecurityContext';
import { getSecurityLogs } from '../../utils/securityLogger';
import CosmosCard from '../ui/CosmosCard';
import type { SecurityLogEntry } from '../../utils/securityLogger';

const LAYERS = [
  { key: 'tpmAttested', label: 'TPM 2.0', icon: 'fa-microchip', color: '#0f766e', inverted: false },
  { key: 'lastEbpfAlert', label: 'eBPF Monitor', icon: 'fa-eye', color: '#1565C0', inverted: true },
  { key: 'honeytokenTriggered', label: 'Honeytoken', icon: 'fa-bug', color: '#B71C1C', inverted: true },
  { key: 'passkeyRegistered', label: 'Passkey', icon: 'fa-fingerprint', color: '#6A1B9A', inverted: false },
  { key: 'pqTunnelActive', label: 'PQ Crypto', icon: 'fa-key', color: '#E65100', inverted: false },
  { key: 'behavioralDeviation', label: 'Biometrics', icon: 'fa-user-secret', color: '#00695C', inverted: false },
  { key: 'didIssued', label: 'DID', icon: 'fa-id-card', color: '#C2185B', inverted: false },
  { key: 'trapTriggered', label: 'Trap', icon: 'fa-mask', color: '#607D8B', inverted: true },
  { key: 'enclaveVerified', label: 'Enclave', icon: 'fa-lock', color: '#00695C', inverted: false },
  { key: 'blockchainHeadHash', label: 'Blockchain', icon: 'fa-link', color: '#795548', inverted: false },
] as const;

function RadialRing({ value, max = 100, size = 48, stroke = 3, label, icon, status }: {
  value: number; max?: number; size?: number; stroke?: number; label: string; icon: string; status: 'good' | 'warn' | 'danger';
}) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const dash = pct * circ;
  const statusColor = status === 'good' ? '#10b981' : status === 'warn' ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth={stroke} />
          <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={statusColor} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
            initial={{ strokeDasharray: `0 ${circ}` }} animate={{ strokeDasharray: `${dash} ${circ}` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className={`fas ${icon} text-[10px]`} style={{ color: statusColor }} />
        </div>
      </div>
      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 text-center leading-tight">{label}</span>
    </div>
  );
}

export default function SecurityScoreDashboard() {
  const { state: security } = useSecurity();
  const [logs, setLogs] = useState<SecurityLogEntry[]>([]);

  useEffect(() => {
    setLogs(getSecurityLogs().slice(0, 8));
  }, []);

  const trustScore = security.trustScore;
  const scoreColor = trustScore >= 80 ? '#10b981' : trustScore >= 50 ? '#f59e0b' : '#ef4444';
  const scoreLabel = trustScore >= 80 ? 'SECURE' : trustScore >= 50 ? 'CAUTION' : 'CRITICAL';


  // Compute per-layer status
  const layerStatus = LAYERS.map((layer) => {
    let val = 0;
    let status: 'good' | 'warn' | 'danger' = 'good';
    const raw = security[layer.key as keyof typeof security];

    if (layer.key === 'behavioralDeviation') {
      const dev = raw as number;
      val = Math.max(0, 100 - dev * 200);
      status = dev < 0.2 ? 'good' : dev < 0.4 ? 'warn' : 'danger';
    } else if (layer.key === 'lastEbpfAlert') {
      const hasAlert = raw !== null && raw !== '';
      val = hasAlert ? 0 : 100;
      status = hasAlert ? 'danger' : 'good';
    } else if (layer.key === 'blockchainHeadHash') {
      const hasHash = raw !== null && raw !== '';
      val = hasHash ? 100 : 0;
      status = hasHash ? 'good' : 'warn';
    } else if (typeof raw === 'boolean') {
      if (layer.inverted) {
        val = raw ? 0 : 100;
        status = raw ? 'danger' : 'good';
      } else {
        val = raw ? 100 : 0;
        status = raw ? 'good' : 'warn';
      }
    }
    return { ...layer, val, status };
  });

  const goodCount = layerStatus.filter((l) => l.status === 'good').length;
  const warnCount = layerStatus.filter((l) => l.status === 'warn').length;
  const dangerCount = layerStatus.filter((l) => l.status === 'danger').length;

  return (
    <div className="space-y-4">
      {/* Main Score + Layer Rings */}
      <CosmosCard variant="gradient">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Central Trust Score */}
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90">
                <circle cx="72" cy="72" r="64" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="8" />
                <motion.circle cx="72" cy="72" r="64" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${trustScore * 4.02} 402`}
                  initial={{ strokeDasharray: '0 402' }}
                  animate={{ strokeDasharray: `${trustScore * 4.02} 402` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span className="text-3xl font-extrabold" style={{ color: scoreColor }}
                  initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                  {trustScore}
                </motion.span>
                <span className="text-[10px] text-slate-400 font-bold">TRUST SCORE</span>
              </div>
            </div>
            <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="mt-2 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: scoreColor }}>
              {scoreLabel}
            </motion.span>
          </div>

          {/* 10 Layer Rings */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-5 sm:grid-cols-5 gap-4">
              {layerStatus.map((layer, i) => (
                <motion.div key={layer.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <RadialRing value={layer.val} label={layer.label} icon={layer.icon} status={layer.status} />
                </motion.div>
              ))}
            </div>
            {/* Summary pills */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500" />{goodCount} Active</div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600"><div className="w-2 h-2 rounded-full bg-amber-500" />{warnCount} Warning</div>
              {dangerCount > 0 && <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600"><div className="w-2 h-2 rounded-full bg-rose-500" />{dangerCount} Critical</div>}
            </div>
          </div>
        </div>
      </CosmosCard>

      {/* Breach Timeline */}
      {logs.length > 0 && (
        <CosmosCard variant="default" header={{ icon: 'fa-timeline', iconColor: '#1565C0', title: 'Security Event Timeline' }}>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {logs.map((log, i) => (
              <motion.div key={log.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className={`flex items-start gap-3 p-2.5 rounded-xl border ${
                  log.severity === 'critical' ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800' :
                  log.severity === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800' :
                  'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700'
                }`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  log.severity === 'critical' ? 'bg-rose-100 text-rose-600' :
                  log.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                  'bg-emerald-100 text-emerald-600'
                }`}>
                  <i className={`fas fa-${log.severity === 'critical' ? 'triangle-exclamation' : log.severity === 'warning' ? 'circle-exclamation' : 'check'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{log.action}</p>
                    <span className="text-[9px] text-slate-400 flex-shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{log.details}</p>
                  <span className="text-[9px] font-bold text-slate-400 mt-0.5 inline-block">{log.category}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CosmosCard>
      )}
    </div>
  );
}

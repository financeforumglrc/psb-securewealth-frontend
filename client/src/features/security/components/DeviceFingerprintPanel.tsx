import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  Monitor,
  Globe,
  Cpu,
  Database,
  Type,
  Palette,
  Touchpad,
  Wifi,
  Loader2,
} from 'lucide-react';
import CosmosCard, { CosmosBadge } from '@/shared/components/ui/CosmosCard';
import {
  collectFingerprint,
  getStoredFingerprint,
  storeFingerprint,
  compareFingerprints,
  type DeviceFingerprint,
} from '@/shared/services/fingerprintService';
import { backendApi } from '@/shared/lib/backendApi';

interface ServerDevice {
  id: number;
  visitorId: string;
  fingerprintHash: string;
  firstSeen: string;
  lastSeen: string;
  isTrusted: boolean;
  createdAt: string;
}

interface FingerprintState {
  fingerprint: DeviceFingerprint | null;
  hash: string;
  visitorId: string;
  trustScore: number;
  storedHash: string | null;
  deviceChanged: boolean;
  loading: boolean;
  serverDevices: ServerDevice[];
  currentDeviceTrusted: boolean | null;
  trusting: boolean;
}

export default function DeviceFingerprintPanel() {
  const [state, setState] = useState<FingerprintState>({
    fingerprint: null,
    hash: '',
    visitorId: '',
    trustScore: 0,
    storedHash: null,
    deviceChanged: false,
    loading: true,
    serverDevices: [],
    currentDeviceTrusted: null,
    trusting: false,
  });

  const loadFingerprint = useCallback(async () => {
    const result = await collectFingerprint();
    const stored = getStoredFingerprint();
    const comparison = stored ? compareFingerprints(result.hash, stored) : { changed: false, changedFields: [] };

    setState((s) => ({
      ...s,
      fingerprint: result.fingerprint,
      hash: result.hash,
      visitorId: result.visitorId,
      trustScore: result.trustScore,
      storedHash: stored,
      deviceChanged: comparison.changed,
    }));
  }, []);

  const loadServerDevices = useCallback(async () => {
    try {
      const res = await backendApi.getDevices();
      if (res.ok && Array.isArray(res.data?.data)) {
        const devices = res.data.data as ServerDevice[];
        setState((s) => ({
          ...s,
          serverDevices: devices,
          currentDeviceTrusted: devices.some((d) => d.visitorId === s.visitorId && d.isTrusted) || null,
        }));
      }
    } catch {
      // Non-blocking: local fingerprint still works if backend is unavailable
    }
  }, []);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    await loadFingerprint();
    await loadServerDevices();
    setState((s) => ({ ...s, loading: false }));
  }, [loadFingerprint, loadServerDevices]);

  useEffect(() => {
    load();
  }, [load]);

  // Re-evaluate server trust when visitorId changes
  useEffect(() => {
    if (!state.visitorId) return;
    const trusted = state.serverDevices.some((d) => d.visitorId === state.visitorId && d.isTrusted);
    setState((s) => ({ ...s, currentDeviceTrusted: trusted }));
  }, [state.visitorId, state.serverDevices]);

  const handleTrust = async () => {
    storeFingerprint(state.hash);
    setState((s) => ({ ...s, storedHash: s.hash, deviceChanged: false, trusting: true }));

    try {
      const existing = state.serverDevices.find((d) => d.visitorId === state.visitorId);
      if (existing) {
        await backendApi.trustDevice(existing.id, true);
      }
      await loadServerDevices();
    } catch {
      // Ignore backend errors for local trust action
    } finally {
      setState((s) => ({ ...s, trusting: false }));
    }
  };

  const fp = state.fingerprint;

  const statItems = fp
    ? [
        { icon: Palette, label: 'Canvas', value: fp.canvas.slice(0, 12) + '…', full: fp.canvas },
        { icon: Monitor, label: 'WebGL', value: fp.webgl.split('::')[0] || fp.webgl, full: fp.webgl },
        { icon: Type, label: 'Fonts', value: `${fp.fonts.length} detected`, full: fp.fonts.join(', ') },
        { icon: Globe, label: 'Timezone', value: fp.timezone, full: fp.timezone },
        { icon: Database, label: 'Language', value: fp.language, full: fp.language },
        { icon: Cpu, label: 'Platform', value: fp.platform, full: fp.platform },
        { icon: Touchpad, label: 'Touch', value: fp.touch ? 'Yes' : 'No', full: String(fp.touch) },
        { icon: Cpu, label: 'Cores', value: String(fp.cores), full: String(fp.cores) },
        { icon: Database, label: 'Memory', value: fp.memory ? `${fp.memory} GB` : 'Unknown', full: String(fp.memory) },
        { icon: Wifi, label: 'Connection', value: fp.connection, full: fp.connection },
      ]
    : [];

  const isTrusted = state.currentDeviceTrusted === true || (!state.deviceChanged && !!state.storedHash);
  const showChanged = state.deviceChanged || state.currentDeviceTrusted === false;

  return (
    <CosmosCard
      variant="glass"
      header={{
        icon: 'fa-fingerprint',
        iconColor: '#0ea5e9',
        title: 'Device Fingerprint',
        subtitle: 'FingerprintJS-powered device identity for account takeover detection',
        action: (
          <button
            onClick={load}
            disabled={state.loading}
            className="text-[11px] px-3 py-1.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg font-medium hover:bg-sky-500/20 transition-colors disabled:opacity-40"
          >
            <i className={`fas fa-rotate ${state.loading ? 'animate-spin' : ''} mr-1`} />
            Refresh
          </button>
        ),
      }}
    >
      {/* Trust Score */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-100 dark:text-slate-700"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <motion.path
              className={state.trustScore >= 70 ? 'text-emerald-500' : state.trustScore >= 40 ? 'text-amber-500' : 'text-rose-500'}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${state.trustScore}, 100`}
              initial={{ strokeDasharray: '0, 100' }}
              animate={{ strokeDasharray: `${state.trustScore}, 100` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{state.trustScore}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Trust Score</h4>
            {showChanged ? (
              <CosmosBadge color="danger" pulse>
                <ShieldAlert className="w-3 h-3" /> Device Changed
              </CosmosBadge>
            ) : isTrusted ? (
              <CosmosBadge color="success">
                <ShieldCheck className="w-3 h-3" /> Trusted
              </CosmosBadge>
            ) : (
              <CosmosBadge color="warning">
                <Fingerprint className="w-3 h-3" /> Unregistered
              </CosmosBadge>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {showChanged
              ? 'This device does not match your previously trusted fingerprint. Possible account takeover.'
              : isTrusted
              ? 'Fingerprint matches your trusted device profile.'
              : 'No trusted fingerprint stored. Click "Trust This Device" to register it.'}
          </p>
        </div>
      </div>

      {/* Alert Banner */}
      <AnimatePresence>
        {showChanged && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-xl"
          >
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-700 dark:text-rose-300">Account Takeover Warning</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                  Your current device fingerprint differs from the stored one. If this is not you, contact support immediately.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visitor ID */}
      {state.visitorId && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">FingerprintJS Visitor ID</p>
          <code className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">{state.visitorId}</code>
        </div>
      )}

      {/* Hash */}
      {fp && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Current Hash</p>
          <code className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">{state.hash}</code>
          {state.storedHash && (
            <>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-2 mb-1">Stored Hash</p>
              <code className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">{state.storedHash}</code>
            </>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {statItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group"
            title={item.full}
          >
            <div className="flex items-center gap-2 mb-1">
              <item.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 transition-colors" />
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{item.label}</span>
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Screen details */}
      {fp && (
        <div className="mt-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
          <div className="flex items-center gap-2 mb-1">
            <Monitor className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Screen</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {fp.screen.width} × {fp.screen.height} @ {fp.screen.colorDepth}-bit | DPR: {fp.screen.pixelRatio}
          </p>
        </div>
      )}

      {/* Action */}
      <div className="mt-4 flex gap-2">
        {!isTrusted || state.deviceChanged ? (
          <button
            onClick={handleTrust}
            disabled={state.trusting}
            className="flex-1 py-2.5 bg-sky-500 text-white rounded-xl text-xs font-bold hover:bg-sky-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {state.trusting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {state.deviceChanged ? 'Trust This New Device' : 'Trust This Device'}
          </button>
        ) : (
          <button
            onClick={() => {
              storeFingerprint('');
              setState((s) => ({ ...s, storedHash: null, deviceChanged: false, currentDeviceTrusted: false }));
            }}
            className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <i className="fas fa-trash-can mr-2" />
            Forget Trusted Device
          </button>
        )}
      </div>
    </CosmosCard>
  );
}

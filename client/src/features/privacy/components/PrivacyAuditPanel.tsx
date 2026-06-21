import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Database, HardDrive, Trash2, AlertTriangle, ShieldCheck, Globe } from 'lucide-react';
import CosmosCard, { CosmosBadge } from '@/shared/components/ui/CosmosCard';
import { runPrivacyAudit, clearTrackingData, type PrivacyAudit } from '@/shared/services/privacyAuditService';

export default function PrivacyAuditPanel() {
  const [audit, setAudit] = useState<PrivacyAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleared, setCleared] = useState(false);

  const load = useCallback(async () => {
    const result = await runPrivacyAudit();
    setAudit(result);
    setLoading(false);
    setCleared(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    runPrivacyAudit().then((result) => {
      if (cancelled) return;
      setAudit(result);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const handleClear = () => {
    clearTrackingData();
    setCleared(true);
    // Re-audit after a short delay so storage APIs reflect changes
    setTimeout(() => load(), 100);
  };

  const firstPartyCount = audit ? audit.cookies.length - audit.thirdPartyDomains.length : 0;
  const thirdPartyCount = audit ? audit.thirdPartyDomains.length : 0;

  const riskColor = audit?.trackingRisk === 'high' ? 'danger' : audit?.trackingRisk === 'medium' ? 'warning' : 'success';
  const riskBarColor =
    audit?.trackingRisk === 'high'
      ? 'bg-rose-500'
      : audit?.trackingRisk === 'medium'
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  const recommendations = audit
    ? [
        ...(audit.trackingRisk === 'high' ? ['Multiple third-party trackers detected. Consider clearing cookies.'] : []),
        ...(audit.localStorageItems > 20 ? [`${audit.localStorageItems} localStorage items — some may be tracking data.`] : []),
        ...(audit.indexedDBDatabases.length > 0 ? [`IndexedDB databases found: ${audit.indexedDBDatabases.join(', ')}`] : []),
        ...(audit.cookies.length === 0 ? ['No cookies found — excellent privacy hygiene!'] : []),
      ]
    : [];

  return (
    <CosmosCard
      variant="glass"
      header={{
        icon: 'fa-user-shield',
        iconColor: '#8b5cf6',
        title: 'Privacy Audit',
        subtitle: 'Real-time cookie, storage, and tracker analysis',
        action: (
          <button
            onClick={load}
            disabled={loading}
            className="text-[11px] px-3 py-1.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-lg font-medium hover:bg-violet-500/20 transition-colors disabled:opacity-40"
          >
            <i className={`fas fa-rotate ${loading ? 'animate-spin' : ''} mr-1`} />
            Scan
          </button>
        ),
      }}
    >
      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40 text-center">
          <Cookie className="w-4 h-4 text-violet-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-800 dark:text-white">{audit?.cookies.length ?? 0}</p>
          <p className="text-[10px] text-slate-400 font-medium">Cookies</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40 text-center">
          <HardDrive className="w-4 h-4 text-sky-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-800 dark:text-white">{audit?.localStorageItems ?? 0}</p>
          <p className="text-[10px] text-slate-400 font-medium">localStorage</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40 text-center">
          <Database className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-800 dark:text-white">{audit?.indexedDBDatabases.length ?? 0}</p>
          <p className="text-[10px] text-slate-400 font-medium">IndexedDB</p>
        </div>
      </div>

      {/* Cookie Breakdown */}
      {audit && audit.cookies.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Cookie Breakdown</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                <Globe className="w-3 h-3 inline mr-1 text-sky-500" />
                {firstPartyCount} First-party
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                <Globe className="w-3 h-3 inline mr-1 text-rose-500" />
                {thirdPartyCount} Third-party
              </span>
            </div>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
            {audit.cookies.map((cookie, i) => (
              <motion.div
                key={`${cookie.name}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-white dark:bg-slate-700/30"
              >
                <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[60%]">{cookie.name}</span>
                <span className="text-slate-400">{cookie.domain}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Storage Usage */}
      <div className="mb-4 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Storage Usage</span>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{audit?.localStorageSize ?? '0 B'}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500"
            initial={{ width: 0 }}
            animate={{
              width: audit ? `${Math.min(100, (audit.localStorageItems / 50) * 100)}%` : '0%',
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-400">localStorage: {audit?.localStorageItems ?? 0} items</span>
          <span className="text-[10px] text-slate-400">sessionStorage: {audit?.sessionStorageItems ?? 0} items</span>
        </div>
      </div>

      {/* Risk Score */}
      <div className="mb-4 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Tracking Risk</span>
          <CosmosBadge color={riskColor} pulse={audit?.trackingRisk === 'high'}>
            {audit?.trackingRisk === 'high' ? (
              <AlertTriangle className="w-3 h-3" />
            ) : (
              <ShieldCheck className="w-3 h-3" />
            )}
            {audit?.trackingRisk?.toUpperCase() ?? 'UNKNOWN'}
          </CosmosBadge>
        </div>
        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${riskBarColor}`}
            initial={{ width: 0 }}
            animate={{
              width:
                audit?.trackingRisk === 'high'
                  ? '85%'
                  : audit?.trackingRisk === 'medium'
                  ? '55%'
                  : '20%',
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Recommendations */}
      <AnimatePresence>
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800">
              <p className="text-[10px] text-violet-500 font-semibold uppercase tracking-wider mb-1.5">Recommendations</p>
              <ul className="space-y-1">
                {recommendations.map((rec, i) => (
                  <li key={i} className="text-[11px] text-violet-700 dark:text-violet-300 flex items-start gap-1.5">
                    <i className="fas fa-circle-info mt-0.5 text-[9px]" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Button */}
      <button
        onClick={handleClear}
        disabled={cleared}
        className="w-full py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
      >
        <Trash2 className="w-4 h-4" />
        {cleared ? 'Tracking Data Cleared' : 'Clear All Tracking Data'}
      </button>

      {cleared && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] text-emerald-600 dark:text-emerald-400 text-center mt-2"
        >
          <i className="fas fa-check-circle mr-1" />
          Cookies, localStorage, and sessionStorage have been cleared. Essential app data preserved.
        </motion.p>
      )}
    </CosmosCard>
  );
}

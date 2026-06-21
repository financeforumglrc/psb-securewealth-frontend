import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import PrivacyCenter from '@/features/compliance/components/PrivacyCenter';
import ComplianceBadges from '@/features/compliance/components/ComplianceBadges';
import CosmosCard, { CosmosBadge } from '@/shared/components/ui/CosmosCard';
import PrivacyAuditPanel from '@/features/privacy/components/PrivacyAuditPanel';

export default function PrivacyView() {
  const darkMode = useWealthStore((s) => s.darkMode);
  const toggleDarkMode = useWealthStore((s) => s.toggleDarkMode);
  const [showExport, setShowExport] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  function handleExport() {
    setShowExport(true);
    setExportProgress(0);
    const interval = setInterval(() => {
      setExportProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 10;
      });
    }, 150);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-lock text-primary" /> Privacy & Compliance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Your data, your control. RBI Account Aggregator compliant.</p>
        </div>
        <ComplianceBadges />
      </div>

      {/* Quick Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <CosmosCard variant="default" hover onClick={toggleDarkMode}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-primary">
                  <i className={`fas fa-${darkMode ? 'moon' : 'sun'}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Appearance</p>
                  <p className="text-[10px] text-slate-400">{darkMode ? 'Dark mode active' : 'Light mode active'}</p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-primary' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </div>
          </CosmosCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <CosmosCard variant="default" hover onClick={handleExport}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-emerald-500">
                <i className="fas fa-download" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Export My Data</p>
                <p className="text-[10px] text-slate-400">Download all your data (GDPR style)</p>
              </div>
            </div>
          </CosmosCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <CosmosCard variant="default">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-amber-500">
                <i className="fas fa-clock-rotate-left" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Data Retention</p>
                <p className="text-[10px] text-slate-400">Auto-delete after 7 years</p>
              </div>
            </div>
          </CosmosCard>
        </motion.div>
      </div>

      {/* Export Progress */}
      {showExport && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <CosmosCard variant="gradient">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <i className={`fas fa-${exportProgress < 100 ? 'circle-notch fa-spin' : 'check'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {exportProgress < 100 ? 'Preparing your data export...' : 'Export ready!'}
                </p>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mt-2">
                  <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${exportProgress}%` }} />
                </div>
              </div>
              {exportProgress >= 100 && (
                <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg">Download</button>
              )}
            </div>
          </CosmosCard>
        </motion.div>
      )}

      {/* Privacy Audit */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <PrivacyAuditPanel />
      </motion.div>

      {/* Privacy Center */}
      <PrivacyCenter />

      {/* Compliance Footer */}
      <CosmosCard variant="glass">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-500 dark:text-slate-400">
          <CosmosBadge color="success" size="sm"><i className="fas fa-check-circle mr-1" />RBI AA Compliant</CosmosBadge>
          <CosmosBadge color="info" size="sm"><i className="fas fa-lock mr-1" />256-bit Encryption</CosmosBadge>
          <CosmosBadge color="accent" size="sm"><i className="fas fa-shield-halved mr-1" />DPDP Act 2023 Ready</CosmosBadge>
          <CosmosBadge color="primary" size="sm"><i className="fas fa-certificate mr-1" />ISO 27001</CosmosBadge>
        </div>
      </CosmosCard>
    </div>
  );
}

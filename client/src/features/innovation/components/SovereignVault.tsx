import { useTranslation } from '@/shared/hooks/useTranslation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';

interface DataCategory {
  id: string;
  label: string;
  icon: string;
  local: boolean;
  size: string;
  description: string;
}

export default function SovereignVault() {
  const { t } = useTranslation();
  const assets = useWealthStore((s) => s.assets);
  const transactions = useWealthStore((s) => s.transactions);
  const netWorth = assets.reduce((sum, a) => sum + a.value, 0);

  const [categories] = useState<DataCategory[]>([
    { id: 'transactions', label: t('sovereignCatTransactions'), icon: 'fa-list', local: true, size: `${transactions.length} ${t('sovereignSizeRecords')}`, description: t('sovereignDescTransactions') },
    { id: 'spending', label: t('sovereignCatSpending'), icon: 'fa-chart-pie', local: true, size: t('sovereignSizeCategories'), description: t('sovereignDescSpending') },
    { id: 'goals', label: t('sovereignCatGoals'), icon: 'fa-bullseye', local: true, size: t('sovereignSizeGoals'), description: t('sovereignDescGoals') },
    { id: 'biometrics', label: t('sovereignCatBiometrics'), icon: 'fa-fingerprint', local: true, size: t('sovereignSizeEncrypted'), description: t('sovereignDescBiometrics') },
    { id: 'networth', label: t('sovereignCatNetworth'), icon: 'fa-gem', local: false, size: formatCurrency(netWorth), description: t('sovereignDescNetworth') },
    { id: 'kyc', label: t('sovereignCatKyc'), icon: 'fa-id-card', local: false, size: t('sovereignSizeKyc'), description: t('sovereignDescKyc') },
  ]);

  const localCount = categories.filter((c) => c.local).length;
  const privacyScore = Math.round((localCount / categories.length) * 100);

  const [proofDemo, setProofDemo] = useState(false);

  function formatCurrency(n: number) {
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
    return `₹${n.toLocaleString()}`;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-vault text-primary" aria-hidden="true" /> {t('sovereignTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('sovereignSubtitle')}</p>
        </div>
      </div>

      {/* Privacy Score Hero */}
      <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70 font-medium uppercase tracking-wider">{t('sovereignPrivacyScore')}</p>
            <p className="text-4xl font-extrabold mt-1">{privacyScore}<span className="text-lg text-white/50">/100</span></p>
            <p className="text-xs text-white/70 mt-1">{t('sovereignCategoriesLocal').replace('{local}', String(localCount)).replace('{total}', String(categories.length))}</p>
          </div>
          <div className="hidden sm:flex flex-col items-center">
            <svg viewBox="0 0 100 100" className="w-20 h-20">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none" stroke="#10b981"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${privacyScore * 2.64} 264`}
                transform="rotate(-90 50 50)"
                initial={{ strokeDasharray: '0 264' }}
                animate={{ strokeDasharray: `${privacyScore * 2.64} 264` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <span className="text-[10px] text-white/60 mt-1">{privacyScore >= 80 ? t('sovereignLevelSovereign') : privacyScore >= 50 ? t('sovereignLevelGuarded') : t('sovereignLevelExposed')}</span>
          </div>
        </div>
      </div>

      {/* Data Locality Grid */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <i className="fas fa-database text-primary text-sm" aria-hidden="true" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">{t('sovereignDataLocalityAudit')}</h4>
        </div>
        <div className="space-y-3">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                cat.local ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:bg-amber-900/20'
              }`}>
                <i className={`fas ${cat.icon}`} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{cat.label}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    cat.local
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:bg-amber-900/30'
                  }`}>
                    {cat.local ? t('sovereignDeviceOnly') : t('sovereignBankCopy')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{cat.size} • {cat.description}</p>
              </div>
              <div className="flex-shrink-0">
                <i className={`fas ${cat.local ? 'fa-lock text-emerald-500' : 'fa-lock-open text-amber-500'} text-sm`} aria-hidden="true" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Zero-Knowledge Proof Demo */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <i className="fas fa-key text-violet-500 text-sm" aria-hidden="true" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">{t('sovereignZkDemoTitle')}</h4>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {t('sovereignZkDemoDesc')}
        </p>
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
          {!proofDemo ? (
            <div className="text-center">
              <p className="text-sm text-slate-700 dark:text-slate-200 mb-3">
                {t('sovereignZkScenario')}
              </p>
              <button
                onClick={() => setProofDemo(true)}
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                <i className="fas fa-wand-magic-sparkles mr-2" aria-hidden="true" />
                {t('sovereignGenerateProof')}
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <i className="fas fa-check text-lg" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">{t('sovereignProofValidated')}</p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                    {t('sovereignProofDetail').replace('{actual}', formatCurrency(netWorth)).replace('{proofId}', `ZK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('sovereignBankSees')}</p>
                  <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{t('sovereignBankSeesValue')}</p>
                </div>
                <div className="p-2 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('sovereignBankDoesNotSee')}</p>
                  <p className="font-mono text-rose-500 font-bold line-through">{formatCurrency(netWorth)}</p>
                  <p className="font-mono text-rose-500 font-bold line-through">{t('sovereignBankDoesNotSeeAssets')}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                <i className="fas fa-circle-info mr-1" aria-hidden="true" />
                {t('sovereignZkGuarantee')}
              </p>
              <button
                onClick={() => setProofDemo(false)}
                className="text-xs text-primary font-bold hover:underline"
              >
                {t('sovereignResetDemo')}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card text-center">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-500 mx-auto mb-2">
            <i className="fas fa-mobile-screen text-xl" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-white">{t('sovereignYourDevice')}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{t('sovereignYourDeviceDesc')}</p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center text-violet-500 mx-auto mb-2">
            <i className="fas fa-shield-halved text-xl" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-white">{t('sovereignZkProver')}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{t('sovereignZkProverDesc')}</p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-500 mx-auto mb-2">
            <i className="fas fa-building-columns text-xl" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-white">{t('sovereignBankServer')}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{t('sovereignBankServerDesc')}</p>
        </div>
      </div>

      {/* Regulatory */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('sovereignRegulatoryAlignment')}</p>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'RBI-DPDP', text: 'RBI — Digital Personal Data Protection Act 2023 (Consent & Purpose Limitation)' },
            { id: 'RBI-AA', text: 'RBI — Account Aggregator Framework (Data Minimization Principle)' },
            { id: 'SEBI-Cyber', text: 'SEBI — Cyber Security Framework (Data Localization Mandate)' },
            { id: 'CERT-In', text: 'CERT-In — Guidelines on Data Storage & Incident Reporting' },
          ].map((c) => (
            <div key={c.id} className="flex items-start gap-2 bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-200 dark:border-slate-600 flex-1 min-w-[200px]">
              <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-bold flex-shrink-0">{c.id}</span>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

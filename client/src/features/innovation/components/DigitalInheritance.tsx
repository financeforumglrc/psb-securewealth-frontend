import { useTranslation } from '@/shared/hooks/useTranslation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/shared/components/ui/ToastProvider';

interface DigitalAsset {
  id: string;
  name: string;
  type: 'crypto' | 'nft' | 'domain' | 'social' | 'subscription' | 'data';
  value: string;
  nominee: string;
  status: 'secured' | 'pending' | 'at-risk';
  lastAccessed: string;
  icon: string;
  color: string;
}

const DIGITAL_ASSETS: DigitalAsset[] = [
  { id: 'da-1', name: 'Bitcoin Holdings', type: 'crypto', value: '₹4.2L', nominee: 'Child', status: 'secured', lastAccessed: '2 days ago', icon: 'fa-bitcoin', color: '#F7931A' },
  { id: 'da-2', name: 'Ethereum Stake', type: 'crypto', value: '₹1.8L', nominee: 'Child', status: 'secured', lastAccessed: '1 week ago', icon: 'fa-ethereum', color: '#627EEA' },
  { id: 'da-3', name: 'Premium Domain Portfolio', type: 'domain', value: '₹85K', nominee: 'Spouse', status: 'pending', lastAccessed: '3 months ago', icon: 'fa-globe', color: '#1B5E20' },
  { id: 'da-4', name: 'YouTube Channel Revenue', type: 'social', value: '₹12K/mo', nominee: 'Child', status: 'secured', lastAccessed: 'Today', icon: 'fa-youtube', color: '#FF0000' },
  { id: 'da-5', name: 'Digital Art NFTs', type: 'nft', value: '₹45K', nominee: 'Child', status: 'at-risk', lastAccessed: '6 months ago', icon: 'fa-palette', color: '#9C27B0' },
  { id: 'da-6', name: 'Cloud Storage (Photos/Docs)', type: 'data', value: 'Priceless', nominee: 'Family', status: 'pending', lastAccessed: 'Today', icon: 'fa-cloud', color: '#2196F3' },
];

const WILL_CLAUSES = [
  { clause: 'Primary Beneficiary', detail: 'Spouse — 50% liquid assets + home', status: 'notarized', icon: 'fa-user' },
  { clause: 'Secondary Beneficiary', detail: 'Child — 30% investments + digital assets', status: 'notarized', icon: 'fa-child' },
  { clause: 'Tertiary Beneficiary', detail: 'Parents — 15% + health fund', status: 'pending', icon: 'fa-people-arrows' },
  { clause: 'Charitable Bequest', detail: '5% to PM CARES + Education Fund', status: 'active', icon: 'fa-hand-holding-heart' },
  { clause: 'Digital Executor', detail: 'Trusted friend manages social/crypto accounts', status: 'pending', icon: 'fa-user-shield' },
  { clause: 'Conditions & Milestones', detail: 'Child receives full control at age 25 or marriage', status: 'smart-contract', icon: 'fa-file-contract' },
];

const DEADMANS_TRIGGERS = [
  { trigger: 'No App Login', duration: '45 days', action: 'Notify nominee', status: 'active' },
  { trigger: 'No UPI Transaction', duration: '60 days', action: 'Unlock emergency fund', status: 'active' },
  { trigger: 'Biometric Fail', duration: '90 days', action: 'Distribute per will', status: 'armed' },
  { trigger: 'Manual Panic', duration: 'Immediate', action: 'Full lockdown + legal notify', status: 'armed' },
];

export default function DigitalInheritance() {
  const { t } = useTranslation();
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const { showToast } = useToast();

  const securedCount = DIGITAL_ASSETS.filter(a => a.status === 'secured').length;
  const totalValue = t('digitalInheritanceTotalValueAmount');

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('digitalInheritanceAssets'), value: DIGITAL_ASSETS.length, icon: 'fa-laptop', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300' },
          { label: t('digitalInheritanceSecured'), value: securedCount, icon: 'fa-lock', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300' },
          { label: t('digitalInheritanceTotalValue'), value: totalValue, icon: 'fa-coins', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300' },
          { label: t('digitalInheritanceWillStatus'), value: t('digitalInheritanceWillStatusValue'), icon: 'fa-file-contract', color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="card-psb flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
              <i className={`fas ${stat.icon}`} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Digital Assets Vault */}
      <div className="card-psb">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <i className="fas fa-vault text-violet-600 dark:text-violet-300" aria-hidden="true" /> {t('digitalInheritanceTitle')}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
              {t('digitalInheritanceSubtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DIGITAL_ASSETS.map((asset, idx) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.06 }}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedAsset === asset.id ? 'border-violet-300 shadow-md' : 'border-gray-100 dark:border-slate-700 hover:border-gray-200'
              }`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedAsset(selectedAsset === asset.id ? null : asset.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedAsset(selectedAsset === asset.id ? null : asset.id); } }}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: asset.color + '12' }}>
                  <i className={`fab ${asset.icon} text-sm`} style={{ color: asset.color }} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-gray-800 dark:text-slate-200 truncate">{asset.name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 capitalize">{asset.type}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-gray-900 dark:text-white">{asset.value}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  asset.status === 'secured' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : asset.status === 'pending' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                }`}>
                  {t(`digitalInheritanceStatus${asset.status.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()).replace(/^./, (c: string) => c.toUpperCase())}` as any)}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">{t('digitalInheritanceLastAccessed')} {asset.lastAccessed}</p>

              <AnimatePresence>
                {selectedAsset === asset.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-slate-600"
                  >
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-gray-500 dark:text-slate-400">{t('digitalInheritanceNominee')}</span>
                      <span className="font-semibold text-gray-700 dark:text-slate-300">{asset.nominee}</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); showToast(`Nominee editor opened for ${asset.name}`, 'info'); }}
                        className="flex-1 py-1.5 bg-violet-600 text-white text-[10px] font-bold rounded-lg hover:bg-violet-700 transition-colors"
                      >
                        <i className="fas fa-pen mr-1" aria-hidden="true" /> {t('digitalInheritanceEditNominee')}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); showToast(`Backup initiated for ${asset.name}`, 'success'); }}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 text-[10px] font-bold rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <i className="fas fa-download mr-1" aria-hidden="true" /> {t('digitalInheritanceBackup')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Smart Will Clauses */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <i className="fas fa-file-contract text-primary" aria-hidden="true" /> {t('digitalInheritanceWillClauses')}
        </h4>
        <div className="space-y-2">
          {WILL_CLAUSES.map((clause, idx) => (
            <motion.div
              key={clause.clause}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-sm transition-all"
            >
              <div className="w-9 h-9 bg-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className={`fas ${clause.icon} text-primary text-xs`} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-bold text-gray-800 dark:text-slate-200">{clause.clause}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    clause.status === 'notarized' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : clause.status === 'smart-contract' ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300' : clause.status === 'active' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                  }`}>
                    {t(`digitalInheritanceClause${clause.status.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()).replace(/^./, (c: string) => c.toUpperCase())}` as any)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">{clause.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dead Man's Switch */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <i className="fas fa-hourglass-half text-rose-500" aria-hidden="true" /> {t('digitalInheritanceTriggers')}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DEADMANS_TRIGGERS.map((trig, idx) => (
            <motion.div
              key={trig.trigger}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-rose-200 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-800 dark:text-slate-200">{trig.trigger}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  trig.status === 'active' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                }`}>
                  {t(`digitalInheritanceTrigger${trig.status.charAt(0).toUpperCase() + trig.status.slice(1)}`)}
                </span>
              </div>
              <div className="space-y-1 text-[10px] text-gray-500 dark:text-slate-400">
                <p><i className="fas fa-clock mr-1" aria-hidden="true" />{t('digitalInheritanceDuration')} {trig.duration}</p>
                <p><i className="fas fa-bolt mr-1" aria-hidden="true" />{t('digitalInheritanceAction')} {trig.action}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

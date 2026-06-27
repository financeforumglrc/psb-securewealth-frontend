import { useTranslation } from '@/shared/hooks/useTranslation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useToast } from '@/shared/components/ui/ToastProvider';

interface CrisisSignal {
  id: string;
  name: string;
  probability: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  financialImpact: string;
  autoHedge: string;
  hedgeInstrument: string;
  hedgeAmount: number;
  icon: string;
  color: string;
}

const CRISIS_SIGNALS: CrisisSignal[] = [
  {
    id: 'cr-1',
    name: 'Job Loss / Income Disruption',
    probability: 34,
    severity: 'high',
    timeframe: '8-14 months',
    financialImpact: '₹9L (6-month income)',
    autoHedge: 'Auto-allocate 15% of salary to liquid emergency fund + activate income protection rider',
    hedgeInstrument: 'PSB Liquid Fund + Income Protection Insurance',
    hedgeAmount: 15000,
    icon: 'fa-briefcase',
    color: '#F44336',
  },
  {
    id: 'cr-2',
    name: 'Medical Catastrophe',
    probability: 28,
    severity: 'critical',
    timeframe: '4-12 months',
    financialImpact: '₹5-15L',
    autoHedge: 'Upgrade family health cover to ₹25L super-top-up + create ₹3L medical buffer',
    hedgeInstrument: 'Super Top-Up Health Insurance + Medical Emergency FD',
    hedgeAmount: 8500,
    icon: 'fa-kit-medical',
    color: '#B71C1C',
  },
  {
    id: 'cr-3',
    name: 'Market Crash Impact',
    probability: 52,
    severity: 'medium',
    timeframe: '6-18 months',
    financialImpact: '20-35% portfolio drop',
    autoHedge: 'Auto-rebalance to 40% debt, activate SWP from debt fund, pause equity SIPs temporarily',
    hedgeInstrument: 'Dynamic Asset Allocation Fund + Gold ETF Hedge',
    hedgeAmount: 12000,
    icon: 'fa-chart-line',
    color: '#FF9800',
  },
  {
    id: 'cr-4',
    name: 'Interest Rate Spike',
    probability: 41,
    severity: 'medium',
    timeframe: '12-24 months',
    financialImpact: 'EMI burden +₹8,500/month',
    autoHedge: 'Switch 30% of FDs to floating rate instruments, pre-pay 10% of home loan principal',
    hedgeInstrument: 'Floating Rate Savings Bond + Home Loan Pre-payment',
    hedgeAmount: 22000,
    icon: 'fa-percent',
    color: '#9C27B0',
  },
  {
    id: 'cr-5',
    name: 'Currency Devaluation (NRI)',
    probability: 38,
    severity: 'high',
    timeframe: '10-20 months',
    financialImpact: '₹3-6L forex loss on remittances',
    autoHedge: 'Lock forex rates via forward contracts, diversify 20% to USD-denominated assets',
    hedgeInstrument: 'Forex Forward Contract + USD Index Fund',
    hedgeAmount: 18000,
    icon: 'fa-money-bill-trend-up',
    color: '#2196F3',
  },
  {
    id: 'cr-6',
    name: 'Cyber Fraud / Identity Theft',
    probability: 19,
    severity: 'critical',
    timeframe: 'Anytime',
    financialImpact: '₹50K-5L',
    autoHedge: 'Activate behavioral biometric lock, enable transaction traps, freeze high-value transfers',
    hedgeInstrument: 'Cyber Insurance ₹5L + Behavioral Biometric Lock',
    hedgeAmount: 3200,
    icon: 'fa-user-secret',
    color: '#1B5E20',
  },
];

export default function CrisisPredictor() {
  const { t } = useTranslation();
  const addGoal = useWealthStore((s) => s.addGoal);
  const { showToast } = useToast();

  const SEVERITY_CONFIG = {
    low: { label: t('crisisLowRisk'), bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800', bar: 'bg-green-500' },
    medium: { label: t('crisisModerate'), bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', bar: 'bg-amber-500' },
    high: { label: t('crisisHighRisk'), bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', bar: 'bg-orange-500' },
    critical: { label: t('crisisCritical'), bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', bar: 'bg-rose-500' },
  };
  const [selected, setSelected] = useState<string | null>(null);
  const [showAutoHedge, setShowAutoHedge] = useState(false);

  const totalHedgeCommitment = CRISIS_SIGNALS.reduce((sum, c) => sum + c.hedgeAmount, 0);
  const activeHedges = CRISIS_SIGNALS.filter(c => c.probability > 30).length;

  return (
    <div className="space-y-5">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('crisisSignals'), value: CRISIS_SIGNALS.length, icon: 'fa-tower-broadcast', color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300' },
          { label: t('crisisActiveHedges'), value: activeHedges, icon: 'fa-shield-halved', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300' },
          { label: t('crisisMonthlyCost'), value: `₹${totalHedgeCommitment.toLocaleString()}`, icon: 'fa-wallet', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300' },
          { label: t('crisisProtectedValue'), value: '₹42L', icon: 'fa-vault', color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300' },
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

      {/* Main Card */}
      <div className="card-psb">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <i className="fas fa-tower-broadcast text-rose-600 dark:text-rose-300" aria-hidden="true" /> {t('crisisTitle')}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
              {t('crisisSubtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAutoHedge(!showAutoHedge)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                showAutoHedge ? 'bg-rose-600 text-white' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
              }`}
            >
              <i className={`fas ${showAutoHedge ? 'fa-check' : 'fa-robot'} mr-1`} aria-hidden="true" />
              {showAutoHedge ? t('crisisAutoHedgeOn') : t('crisisAutoHedgeOff')}
            </button>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          <AnimatePresence mode="popLayout">
            {CRISIS_SIGNALS.map((crisis, idx) => {
              const sev = SEVERITY_CONFIG[crisis.severity];
              const isOpen = selected === crisis.id;
              return (
                <motion.div
                  key={crisis.id}
                  layout
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`rounded-xl border cursor-pointer transition-all duration-200 ${
                    isOpen ? 'border-rose-200 dark:border-rose-800 bg-rose-50/30 shadow-md' : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-gray-200'
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(isOpen ? null : crisis.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(isOpen ? null : crisis.id); } }}
                >
                  <div className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: crisis.color + '12' }}
                        >
                          <i className={`fas ${crisis.icon}`} style={{ color: crisis.color, fontSize: '15px' }} aria-hidden="true" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-bold text-gray-800 dark:text-slate-200">{crisis.name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${sev.bg} ${sev.text} border ${sev.border}`}>
                              {sev.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-gray-500 dark:text-slate-400 mt-1">
                            <span><i className="fas fa-clock mr-1" aria-hidden="true" />{crisis.timeframe}</span>
                            <span><i className="fas fa-percent mr-1" aria-hidden="true" />{crisis.probability}% {t('crisisProbability')}</span>
                            <span className="font-semibold text-gray-700 dark:text-slate-300">{crisis.financialImpact}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-2">
                        <div className="relative w-10 h-10">
                          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={crisis.color} strokeWidth="3" strokeDasharray={`${crisis.probability}, 100`} strokeLinecap="round" />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-slate-300">{crisis.probability}</span>
                        </div>
                      </div>
                    </div>

                    {/* Severity bar */}
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-slate-500 mb-1">
                        <span>{t('crisisRiskLevel')}</span>
                        <span>{crisis.severity.toUpperCase()}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${sev.bar}`}
                          style={{ width: `${crisis.probability}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-dashed border-gray-200 dark:border-slate-600"
                      >
                        <div className="p-3 space-y-3">
                          <div className="flex items-start gap-2">
                            <div className="w-8 h-8 bg-rose-50 dark:bg-rose-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <i className="fas fa-wand-magic-sparkles text-rose-500 text-xs" aria-hidden="true" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-700 dark:text-slate-300 mb-0.5">{t('crisisAutoHedgeStrategy')}</p>
                              <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed">{crisis.autoHedge}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                              <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase">{t('crisisInstrument')}</p>
                              <p className="text-[10px] font-semibold text-gray-700 dark:text-slate-300">{crisis.hedgeInstrument}</p>
                            </div>
                            <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                              <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase">{t('crisisMonthlyCostLabel')}</p>
                              <p className="text-[10px] font-semibold text-gray-700 dark:text-slate-300">₹{crisis.hedgeAmount.toLocaleString()}</p>
                            </div>
                          </div>

                          {showAutoHedge && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex gap-2"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addGoal({
                                    id: `goal-crisis-${crisis.id}-${Date.now()}`,
                                    name: `Hedge: ${crisis.name}`,
                                    type: 'other',
                                    targetAmount: crisis.hedgeAmount * 12,
                                    currentAmount: 0,
                                    deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                  });
                                  showToast(`Crisis hedge activated for ${crisis.name}`, 'success');
                                }}
                                className="flex-1 py-2 bg-rose-600 text-white text-[11px] font-bold rounded-lg hover:bg-rose-700 transition-colors"
                              >
                                <i className="fas fa-shield-halved mr-1" aria-hidden="true" /> {t('crisisActivate')}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); showToast(`Customization for ${crisis.name} opened`, 'info'); }}
                                className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 text-[11px] font-bold rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                {t('crisisCustomize')}
                              </button>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Macro Signal Dashboard */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <i className="fas fa-satellite-dish text-primary" aria-hidden="true" /> {t('crisisMacroFeed')}
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { signal: 'NIFTY Volatility', status: 'Elevated', trend: 'up', value: '18.4 VIX' },
            { signal: 'RBI Repo Rate', status: 'Stable', trend: 'flat', value: '6.50%' },
            { signal: 'USD/INR', status: 'Weakening', trend: 'up', value: '₹83.42' },
            { signal: 'Inflation (CPI)', status: 'Rising', trend: 'up', value: '5.8%' },
            { signal: 'Job Market Index', status: 'Cooling', trend: 'down', value: '94.2' },
            { signal: 'Real Estate Heat', status: 'Hot', trend: 'up', value: '127.3' },
            { signal: 'Gold Price', status: 'Surging', trend: 'up', value: '₹78,450' },
            { signal: 'Crypto Fear Index', status: 'Greed', trend: 'up', value: '72/100' },
          ].map((sig, idx) => (
            <motion.div
              key={sig.signal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.04 }}
              className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700"
            >
              <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">{sig.signal}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] font-bold text-gray-800 dark:text-slate-200">{sig.value}</span>
                <span className={`text-[10px] px-1 py-0.5 rounded-full font-bold ${
                  sig.trend === 'up' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300' : sig.trend === 'down' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                }`}>
                  <i className={`fas fa-arrow-${sig.trend === 'up' ? 'up' : sig.trend === 'down' ? 'down' : 'right'} mr-0.5 text-[7px]`} aria-hidden="true" />
                  {sig.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

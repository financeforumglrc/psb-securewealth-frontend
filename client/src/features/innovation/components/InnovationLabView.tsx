import { useTranslation } from '@/shared/hooks/useTranslation';
import { useState, Suspense } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import { lazyWithRetry } from '@/shared/utils/lazyWithRetry';

const InnovationOverview = lazyWithRetry(() => import('@/features/innovation/components/InnovationOverview'));
const NeuroFrictionWidget = lazyWithRetry(() => import('@/features/innovation/components/NeuroFrictionWidget'));
const MonteCarloSimulator = lazyWithRetry(() => import('@/features/innovation/components/MonteCarloSimulator'));
const CollectiveImmuneSystem = lazyWithRetry(() => import('@/features/innovation/components/CollectiveImmuneSystem'));
const AutonomousAgent = lazyWithRetry(() => import('@/features/innovation/components/AutonomousAgent'));
const SovereignVault = lazyWithRetry(() => import('@/features/innovation/components/SovereignVault'));
const ParametricInsurance = lazyWithRetry(() => import('@/features/insurance/components/ParametricInsurance'));
const GhostMode = lazyWithRetry(() => import('@/features/security/components/GhostMode'));
const DeadMansSwitch = lazyWithRetry(() => import('@/features/security/components/DeadMansSwitch'));
const GigIncomeSmoother = lazyWithRetry(() => import('@/features/income/components/GigIncomeSmoother'));
const SocialCollateralLoan = lazyWithRetry(() => import('@/features/loans/components/SocialCollateralLoan'));

type InnovationTab =
  | 'overview'
  | 'insurance'
  | 'ghost'
  | 'dms'
  | 'gig'
  | 'loan'
  | 'neuro'
  | 'monte'
  | 'immune'
  | 'agent'
  | 'vault';

const TABS: {
  key: InnovationTab;
  labelKey: string;
  icon: string;
  color: string;
  badgeKey?: string;
}[] = [
  { key: 'overview', labelKey: 'innovationLabOverview', icon: 'fa-grid-2', color: 'text-primary', badgeKey: 'innovationLabStartHere' },
  { key: 'neuro', labelKey: 'innovationLabNeuro', icon: 'fa-heart-pulse', color: 'text-rose-500', badgeKey: 'innovationLabWorldFirst' },
  { key: 'monte', labelKey: 'innovationLabMonte', icon: 'fa-dice', color: 'text-blue-500', badgeKey: 'innovationLabWorldFirst' },
  { key: 'immune', labelKey: 'innovationLabImmune', icon: 'fa-shield-virus', color: 'text-emerald-500', badgeKey: 'innovationLabWorldFirst' },
  { key: 'agent', labelKey: 'innovationLabAgent', icon: 'fa-robot', color: 'text-violet-500', badgeKey: 'innovationLabWorldFirst' },
  { key: 'vault', labelKey: 'innovationLabVault', icon: 'fa-vault', color: 'text-amber-500', badgeKey: 'innovationLabWorldFirst' },
  { key: 'insurance', labelKey: 'innovationLabInsurance', icon: 'fa-bolt', color: 'text-amber-500' },
  { key: 'ghost', labelKey: 'innovationLabGhost', icon: 'fa-ghost', color: 'text-violet-500' },
  { key: 'dms', labelKey: 'innovationLabDms', icon: 'fa-hourglass-half', color: 'text-rose-500' },
  { key: 'gig', labelKey: 'innovationLabGig', icon: 'fa-wave-square', color: 'text-teal-500' },
  { key: 'loan', labelKey: 'innovationLabLoan', icon: 'fa-people-group', color: 'text-orange-500' },
];

function TabLoader() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
        <p className="text-xs text-slate-400 dark:text-slate-500">{t('innovationLabLoading')}</p>
      </div>
    </div>
  );
}

export default function InnovationLabView() {
  const { t } = useTranslation();

  const [tab, setTab] = useState<InnovationTab>('overview');
  const setView = useWealthStore((s) => s.setView);

  const activeTab = TABS.find((t) => t.key === tab)!;

  return (
    <div className="space-y-5 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-flask text-primary" aria-hidden="true" /> {t('innovationLabTitle')}
            </h2>
            <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-extrabold border border-primary/20">
              {t('innovationLabBeta')}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('innovationLabSubtitle')}
          </p>
        </div>
      </div>

      {/* BHAVISHYA Promo Banner */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setView('bhavishya')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setView('bhavishya'); } }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-gray-900 text-white p-5 cursor-pointer group hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 group-hover:scale-110 transition-transform duration-500" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-amber-400 text-primary-dark text-[10px] font-extrabold rounded-full uppercase tracking-wider">{t('innovationLabFlagship')}</span>
              <span className="text-[10px] text-white/60">{t('innovationLabIndiasFirst')}</span>
            </div>
            <h3 className="text-lg font-extrabold flex items-center gap-2">
              <i className="fas fa-infinity text-amber-400" aria-hidden="true" /> {t('innovationLabBhavishyaTitle')}
            </h3>
            <p className="text-xs text-white/80 mt-1 max-w-lg">
              {t('innovationLabBhavishyaDesc')}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 group-hover:bg-white/20 transition-colors">
            <span className="text-sm font-bold">{t('innovationLabExplore')}</span>
            <i className="fas fa-arrow-right text-amber-400 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Left Sub-Nav Layout */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="lg:sticky lg:top-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-2">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {TABS.map((tabItem) => (
                <button
                  key={tabItem.key}
                  onClick={() => setTab(tabItem.key)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors min-w-[140px] lg:min-w-0 ${
                    tab === tabItem.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2 text-xs font-bold">
                    <i className={`fas ${tabItem.icon} ${tab === tabItem.key ? '' : tabItem.color} w-4 text-center`} aria-hidden="true" />
                    {t(tabItem.labelKey as any)}
                  </span>
                  {tabItem.badgeKey && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold whitespace-nowrap ${
                        tab === tabItem.key ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {t(tabItem.badgeKey as any)}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i className={`fas ${activeTab.icon} ${activeTab.color}`} aria-hidden="true" />
              {t(activeTab.labelKey as any)}
            </h3>
          </div>
          <Suspense fallback={<TabLoader />}>
            {tab === 'overview' && <InnovationOverview onSelect={(key) => setTab(key as InnovationTab)} />}
            {tab === 'neuro' && <NeuroFrictionWidget />}
            {tab === 'monte' && <MonteCarloSimulator />}
            {tab === 'immune' && <CollectiveImmuneSystem />}
            {tab === 'agent' && <AutonomousAgent />}
            {tab === 'vault' && <SovereignVault />}
            {tab === 'insurance' && <ParametricInsurance />}
            {tab === 'ghost' && <GhostMode />}
            {tab === 'dms' && <DeadMansSwitch />}
            {tab === 'gig' && <GigIncomeSmoother />}
            {tab === 'loan' && <SocialCollateralLoan />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

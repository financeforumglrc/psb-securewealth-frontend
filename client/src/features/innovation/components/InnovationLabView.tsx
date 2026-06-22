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
  label: string;
  icon: string;
  color: string;
  badge?: string;
}[] = [
  { key: 'overview', label: 'Overview', icon: 'fa-grid-2', color: 'text-primary', badge: 'START HERE' },
  { key: 'neuro', label: 'Neuro-Friction', icon: 'fa-heart-pulse', color: 'text-rose-500', badge: 'WORLD FIRST' },
  { key: 'monte', label: 'Monte Carlo', icon: 'fa-dice', color: 'text-blue-500', badge: 'WORLD FIRST' },
  { key: 'immune', label: 'Collective Immune', icon: 'fa-shield-virus', color: 'text-emerald-500', badge: 'WORLD FIRST' },
  { key: 'agent', label: 'Auto Agent', icon: 'fa-robot', color: 'text-violet-500', badge: 'WORLD FIRST' },
  { key: 'vault', label: 'Sovereign Vault', icon: 'fa-vault', color: 'text-amber-500', badge: 'WORLD FIRST' },
  { key: 'insurance', label: 'Parametric Insurance', icon: 'fa-bolt', color: 'text-amber-500' },
  { key: 'ghost', label: 'Ghost Mode', icon: 'fa-ghost', color: 'text-violet-500' },
  { key: 'dms', label: "Dead Man's Switch", icon: 'fa-hourglass-half', color: 'text-rose-500' },
  { key: 'gig', label: 'Income Smoother', icon: 'fa-wave-square', color: 'text-teal-500' },
  { key: 'loan', label: 'Social Loans', icon: 'fa-people-group', color: 'text-orange-500' },
];

function TabLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
        <p className="text-xs text-slate-400">Loading experiment…</p>
      </div>
    </div>
  );
}

export default function InnovationLabView() {
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
              <i className="fas fa-flask text-primary" /> Innovation Lab
            </h2>
            <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-extrabold border border-primary/20">
              BETA
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            10 world-first experiments — neuro-friction, life simulation, collective defense, auto-agent, sovereign vault and more.
          </p>
        </div>
      </div>

      {/* BHAVISHYA Promo Banner */}
      <div
        onClick={() => setView('bhavishya')}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-gray-900 text-white p-5 cursor-pointer group hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 group-hover:scale-110 transition-transform duration-500" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-amber-400 text-primary-dark text-[9px] font-extrabold rounded-full uppercase tracking-wider">Flagship</span>
              <span className="text-[9px] text-white/60">India's First</span>
            </div>
            <h3 className="text-lg font-extrabold flex items-center gap-2">
              <i className="fas fa-infinity text-amber-400" /> BHAVISHYA — Predictive Life-Cycle AI
            </h3>
            <p className="text-xs text-white/80 mt-1 max-w-lg">
              Financial DNA mapping. Life event prediction. Future self simulation. Auto-created instruments.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 group-hover:bg-white/20 transition-colors">
            <span className="text-sm font-bold">Explore</span>
            <i className="fas fa-arrow-right text-amber-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Left Sub-Nav Layout */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="lg:sticky lg:top-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-2">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors min-w-[140px] lg:min-w-0 ${
                    tab === t.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2 text-xs font-bold">
                    <i className={`fas ${t.icon} ${tab === t.key ? '' : t.color} w-4 text-center`} />
                    {t.label}
                  </span>
                  {t.badge && (
                    <span
                      className={`text-[8px] px-1.5 py-0.5 rounded-full font-extrabold whitespace-nowrap ${
                        tab === t.key ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {t.badge}
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
              <i className={`fas ${activeTab.icon} ${activeTab.color}`} />
              {activeTab.label}
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

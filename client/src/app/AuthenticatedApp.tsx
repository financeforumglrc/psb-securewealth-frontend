import { useEffect, useState, Suspense, useTransition } from 'react';
import PitchMode from '@/features/pitch/components/PitchMode';
import { useWealthStore } from '@/shared/store/wealthStore';
import { isJudgeMode } from '@/shared/utils/demoMode';
import { usePanicMode } from '@/shared/hooks/usePanicMode';
import { useDemoMode } from '@/shared/hooks/useDemoMode';
import { useSupabaseSync } from '@/shared/hooks/useSupabaseSync';
import { useAuth } from '@/shared/context/AuthContext';
import { SecurityProvider } from '@/shared/context/SecurityContext';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { lazyWithRetry } from '@/shared/utils/lazyWithRetry';
import { getQueuedActions, syncQueuedActions } from '@/shared/services/offlineQueue';

import GoalTracker from '@/features/goals/components/GoalTracker';
import LockdownOverlay from '@/features/protection/components/LockdownOverlay';

import NotificationDemo from '@/features/demo/components/NotificationDemo';
import DigitalGold from '@/features/gold/components/DigitalGold';
import ChallengesView from '@/features/challenges/components/ChallengesView';
import KidsMode from '@/features/kids/components/KidsMode';
import SubscriptionTracker from '@/features/subscriptions/components/SubscriptionTracker';
import FamilyDashboard from '@/features/family/components/FamilyDashboard';
import SystemArchitecture from '@/features/architecture/components/SystemArchitecture';
import FeaturesUniverse from '@/features/architecture/components/FeaturesUniverse';
import ReportGeneratorModal from '@/features/report/components/ReportGeneratorModal';
import FinancialReport from '@/features/report/components/FinancialReport';
import ConsentModal from '@/features/compliance/components/ConsentModal';
import ForecastView from '@/features/forecast/components/ForecastView';
import ManualAssetForm from '@/features/assets/components/ManualAssetForm';
import LinkAccountModal from '@/features/assets/components/LinkAccountModal';
import PhysicalAssetIntelligence from '@/features/assets/components/PhysicalAssetIntelligence';
import AAFetchAnimation from '@/features/aa/components/AAFetchAnimation';
import AACallbackHandler from '@/features/aa/components/AACallbackHandler';
import OnboardingWizard from '@/features/onboarding/components/OnboardingWizard';

const PaymentsPage = lazyWithRetry(() => import('@/features/payments/components/PaymentsPage'));
const ProfileSettings = lazyWithRetry(() => import('@/features/profile/components/ProfileSettings'));
const AdminDashboard = lazyWithRetry(() => import('@/features/admin/components/AdminDashboard'));

// PitchMode is bundled statically to avoid a separate chunk fetch failing on some networks/edges.
const DemoMode = lazyWithRetry(() => import('@/features/demo/components/DemoMode'));

const SecurityBeastView = lazyWithRetry(() => import('@/features/security/components/SecurityBeastView'));
const DecoyAccountView = lazyWithRetry(() => import('@/features/security/components/DecoyAccountView'));

const ProtectionView = lazyWithRetry(() => import('@/features/protection/components/ProtectionView'));
const PrivacyView = lazyWithRetry(() => import('@/features/privacy/components/PrivacyView'));

const BiometricAuth = lazyWithRetry(() => import('@/features/auth/components/BiometricAuth'));

import { isDuressLocked } from '@/shared/services/duressService';

import { ToastProvider } from '@/shared/components/ui/ToastProvider';
import AppShell from '@/shared/components/layout/AppShell';
import JudgeTour from '@/features/demo/components/JudgeTour';
import LiveActivityPill from '@/shared/components/ui/LiveActivityPill';

// Lazy load heavy view components for code splitting
const DashboardView = lazyWithRetry(() => import('@/features/dashboard/components/DashboardView'));
const WealthTwinView = lazyWithRetry(() => import('@/features/ai/components/WealthTwinView'));
const AIRecommendationsView = lazyWithRetry(() => import('@/features/ai/components/AIRecommendationsView'));
const PortfolioView = lazyWithRetry(() => import('@/features/portfolio/components/PortfolioView'));
const MarketView = lazyWithRetry(() => import('@/features/market/components/MarketView'));
const TaxView = lazyWithRetry(() => import('@/features/tax/components/TaxView'));
const CalculatorsView = lazyWithRetry(() => import('@/features/calculators/components/CalculatorsView'));
const TransactionsView = lazyWithRetry(() => import('@/features/transactions/components/TransactionsView'));
const BillCalendar = lazyWithRetry(() => import('@/features/bills/components/BillCalendar'));
const CreditHealth = lazyWithRetry(() => import('@/features/credit/components/CreditHealth'));
const BhavishyaEngine = lazyWithRetry(() => import('@/features/innovation/components/BhavishyaEngine'));
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
const FantasyLeague = lazyWithRetry(() => import('@/features/gamification/components/FantasyLeague'));
const BoostsManager = lazyWithRetry(() => import('@/features/goals/components/BoostsManager'));
const ValuesAlignment = lazyWithRetry(() => import('@/features/values/components/ValuesAlignment'));
const AccessibilitySettings = lazyWithRetry(() => import('@/features/accessibility/components/AccessibilitySettings'));
const NRIMode = lazyWithRetry(() => import('@/features/nri/components/NRIMode'));
const SeniorMode = lazyWithRetry(() => import('@/features/senior/components/SeniorMode'));
const BusinessMode = lazyWithRetry(() => import('@/features/business/components/BusinessMode'));
const LoanCenter = lazyWithRetry(() => import('@/features/banking/components/LoanCenter'));
const RecurringPayments = lazyWithRetry(() => import('@/features/banking/components/RecurringPayments'));
const AccountStatement = lazyWithRetry(() => import('@/features/banking/components/AccountStatement'));
const AuditLog = lazyWithRetry(() => import('@/features/banking/components/AuditLog'));

import { NBAProvider } from '@/shared/context/NBAContext';
import { RewardsProvider } from '@/shared/context/RewardsContext';

// Loading fallback component
function ViewLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-psb-bg dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-black text-primary">PSB</span>
          </div>
        </div>
        <div className="space-y-1 text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Loading your secure workspace</p>
          <p className="text-xs text-slate-400">Please wait…</p>
        </div>
      </div>
    </div>
  );
}

function InnovationLabView() {
  const [tab, setTab] = useState<'overview' | 'insurance' | 'ghost' | 'dms' | 'gig' | 'loan' | 'neuro' | 'monte' | 'immune' | 'agent' | 'vault'>('overview');
  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: 'fa-grid-2', color: 'text-primary', badge: 'START HERE' },
    { key: 'neuro' as const, label: 'Neuro-Friction', icon: 'fa-heart-pulse', color: 'text-rose-500', badge: 'WORLD FIRST' },
    { key: 'monte' as const, label: 'Monte Carlo', icon: 'fa-dice', color: 'text-blue-500', badge: 'WORLD FIRST' },
    { key: 'immune' as const, label: 'Collective Immune', icon: 'fa-shield-virus', color: 'text-emerald-500', badge: 'WORLD FIRST' },
    { key: 'agent' as const, label: 'Auto Agent', icon: 'fa-robot', color: 'text-violet-500', badge: 'WORLD FIRST' },
    { key: 'vault' as const, label: 'Sovereign Vault', icon: 'fa-vault', color: 'text-amber-500', badge: 'WORLD FIRST' },
    { key: 'insurance' as const, label: 'Parametric Insurance', icon: 'fa-bolt', color: 'text-amber-500' },
    { key: 'ghost' as const, label: 'Ghost Mode', icon: 'fa-ghost', color: 'text-violet-500' },
    { key: 'dms' as const, label: "Dead Man's Switch", icon: 'fa-hourglass-half', color: 'text-rose-500' },
    { key: 'gig' as const, label: 'Income Smoother', icon: 'fa-wave-square', color: 'text-teal-500' },
    { key: 'loan' as const, label: 'Social Loans', icon: 'fa-people-group', color: 'text-orange-500' },
  ];
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-flask text-primary" /> Innovation Lab
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">10 world-first features no bank has built — neuro-friction, life simulation, collective defense, auto-agent, sovereign vault + insurance, security, income, lending reimagined</p>
        </div>
        <span className="text-[10px] px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
          <i className="fas fa-star mr-1" />Beta
        </span>
      </div>

      {/* BHAVISHYA Promo Banner */}
      <div 
        onClick={() => useWealthStore.getState().setView('bhavishya')}
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
              Technology no Indian bank has ever built.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 group-hover:bg-white/20 transition-colors">
            <span className="text-sm font-bold">Explore</span>
            <i className="fas fa-arrow-right text-amber-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Feature Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
              tab === t.key ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <i className={`fas ${t.icon} ${tab === t.key ? '' : t.color}`} />
            <span className="flex items-center gap-1.5">
              {t.label}
              {t.badge && (
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-extrabold ${
                  tab === t.key ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                }`}>
                  {t.badge}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      <Suspense fallback={<ViewLoader />}>
        {tab === 'overview' && <InnovationOverview onSelect={(key) => setTab(key as any)} />}
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
    </div>
  );
}

function AssetsView() {
  const assets = useWealthStore((s) => s.assets);
  const [showLinkModal, setShowLinkModal] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">All Assets</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLinkModal(true)}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-link" /> Link Account
          </button>
          <ManualAssetForm />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <div key={asset.id} className="card relative">
            {asset.linkedViaAA && (
              <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-medium rounded-full">
                <i className="fas fa-link mr-1" />Linked via AA
              </span>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <i className={`fas fa-${asset.type === 'bank' ? 'building-columns' : asset.type === 'property' ? 'house' : asset.type === 'gold' ? 'coins' : asset.type === 'vehicle' ? 'car' : 'chart-pie'}`} />
              </div>
              <div>
                <p className="font-medium text-sm text-slate-800 dark:text-white">{asset.name}</p>
                <p className="text-xs text-slate-500 capitalize">{asset.type}</p>
              </div>
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-white">₹{asset.value.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Liquidity: {asset.liquidity}</p>
          </div>
        ))}
      </div>
      <LinkAccountModal show={showLinkModal} onClose={() => setShowLinkModal(false)} />
      <PhysicalAssetIntelligence />
    </div>
  );
}

export default function AuthenticatedApp() {
  useSupabaseSync();
  const { state: authState } = useAuth();
  const currentView = useWealthStore((s) => s.currentView);
  const darkMode = useWealthStore((s) => s.darkMode);
  const initJudgeMode = useWealthStore((s) => s.initJudgeMode);
  const aaFetchComplete = useWealthStore((s) => s.aaFetchComplete);
  const setAAFetchComplete = useWealthStore((s) => s.setAAFetchComplete);
  const onboardingComplete = useWealthStore((s) => s.onboardingComplete);
  const setOnboardingComplete = useWealthStore((s) => s.setOnboardingComplete);

  // Migration: users who already completed AA fetch before the onboarding wizard existed
  // should not see the wizard again.
  useEffect(() => {
    if (aaFetchComplete && !onboardingComplete) {
      setOnboardingComplete(true);
    }
  }, [aaFetchComplete, onboardingComplete, setOnboardingComplete]);
  const setLoginAt = useWealthStore((s) => s.setLoginAt);
  const accessibilityMode = useWealthStore((s) => s.accessibilityMode);
  const seniorMode = useWealthStore((s) => s.seniorMode);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportView, setShowReportView] = useState(false);
  const [reportFormat, setReportFormat] = useState<'pdf' | 'html'>('html');
  const [queuedCount, setQueuedCount] = useState(0);

  const { online } = useNetworkStatus();

  usePanicMode();
  useDemoMode();

  useEffect(() => {
    if (isJudgeMode()) {
      initJudgeMode();
    }
    // Show the Account Aggregator fetch animation once per login session
    setAAFetchComplete(false);
    setLoginAt(Date.now());
  }, []);

  // Duress lock check — check only on mount and when view changes, not every second
  const [duressLocked, setDuressLocked] = useState(isDuressLocked());
  useEffect(() => {
    setDuressLocked(isDuressLocked());
  }, [currentView]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Offline queue monitoring — check less frequently to reduce re-renders
  useEffect(() => {
    const updateQueue = () => setQueuedCount(getQueuedActions().length);
    updateQueue();
    const interval = setInterval(updateQueue, 8000);
    return () => clearInterval(interval);
  }, []);

  // Sync queue when coming back online
  useEffect(() => {
    if (online && queuedCount > 0) {
      void syncQueuedActions().then(() => {
        setQueuedCount(getQueuedActions().length);
      });
    }
  }, [online, queuedCount]);

  useEffect(() => {
    if (accessibilityMode) {
      document.documentElement.classList.add('a11y-mode');
    } else {
      document.documentElement.classList.remove('a11y-mode');
    }
  }, [accessibilityMode]);

  useEffect(() => {
    if (seniorMode) {
      document.documentElement.classList.add('senior-mode');
    } else {
      document.documentElement.classList.remove('senior-mode');
    }
  }, [seniorMode]);

  // Smooth view transitions: keep the current view visible while the next chunk loads
  const [, startViewTransition] = useTransition();
  const navigateToView = (view: string) => {
    startViewTransition(() => {
      useWealthStore.getState().setView(view as any);
    });
  };

  // Prefetch the heaviest view chunks in the background after login so tabs feel instant
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const prefetchViews = () => {
      // Only prefetch the most common views to avoid clogging a slow connection.
      const views = [
        () => import('@/features/dashboard/components/DashboardView'),
        () => import('@/features/ai/components/WealthTwinView'),
        () => import('@/features/portfolio/components/PortfolioView'),
        () => import('@/features/market/components/MarketView'),
        () => import('@/features/transactions/components/TransactionsView'),
        () => import('@/features/goals/components/GoalTracker'),
      ];
      views.forEach((importer) => {
        try {
          importer().catch(() => {});
        } catch {
          // ignore prefetch errors
        }
      });
    };

    const schedule = (window as any).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1500));
    const id = schedule(prefetchViews);
    return () => {
      if (typeof id === 'number') clearTimeout(id);
      else if (typeof (window as any).cancelIdleCallback === 'function') (window as any).cancelIdleCallback(id);
    };
  }, [authState.isAuthenticated]);

  // SETU AA redirect callback handler
  const isAaCallback = typeof window !== 'undefined' && window.location.pathname === '/aa/callback';
  if (isAaCallback) {
    return (
      <AACallbackHandler
        onComplete={() => {
          setAAFetchComplete(true);
          if (window.location.pathname === '/aa/callback') {
            window.history.replaceState({}, '', '/');
          }
        }}
      />
    );
  }

  // First-time onboarding wizard — shown once after login
  if (!onboardingComplete) {
    return <OnboardingWizard onComplete={() => setOnboardingComplete(true)} />;
  }

  // Account Aggregator onboarding animation — shown once after login
  if (!aaFetchComplete) {
    return <AAFetchAnimation onComplete={() => setAAFetchComplete(true)} />;
  }

  // Admin panel renders standalone — no PSB headers/sidebars
  if (currentView === 'admin') {
    return (
      <Suspense fallback={<ViewLoader />}>
        <SecurityProvider>
          <AdminDashboard />
        </SecurityProvider>
      </Suspense>
    );
  }


  return (
    <ToastProvider>
    <SecurityProvider>
    <NBAProvider>
    <RewardsProvider>
      <AppShell
        currentView={currentView}
        onNavigate={navigateToView}
      >
        <Suspense fallback={<ViewLoader />}>
          {duressLocked ? (
            <DecoyAccountView />
          ) : seniorMode ? (
            <SeniorMode />
          ) : (
            <>
              {currentView === 'dashboard' && <DashboardView />}
              {currentView === 'wealth-twin' && <WealthTwinView />}
              {currentView === 'ai-recommendations' && <AIRecommendationsView />}
              {currentView === 'goals' && <GoalTracker />}
              {currentView === 'portfolio' && <PortfolioView />}
              {currentView === 'family' && <FamilyDashboard />}
              {currentView === 'assets' && <AssetsView />}
              {currentView === 'market' && <MarketView />}
              {currentView === 'forecast' && <ForecastView />}
              {currentView === 'protection' && <ProtectionView />}
              {currentView === 'privacy' && <PrivacyView />}
              {currentView === 'tax' && <TaxView />}
              {currentView === 'calculators' && <CalculatorsView />}
              {currentView === 'transactions' && <TransactionsView />}
              {currentView === 'features' && <FeaturesUniverse />}
              {currentView === 'architecture' && <SystemArchitecture />}
              {currentView === 'bills' && <BillCalendar />}
              {currentView === 'credit-health' && <CreditHealth />}
              {currentView === 'notification-demo' && <NotificationDemo />}
              {currentView === 'digital-gold' && <DigitalGold />}
              {currentView === 'challenges' && <ChallengesView />}
              {currentView === 'kids-mode' && <KidsMode />}
              {currentView === 'subscriptions' && <SubscriptionTracker />}
              {currentView === 'accessibility' && <AccessibilitySettings />}
              {currentView === 'nri-mode' && <NRIMode />}
              {currentView === 'business-mode' && <BusinessMode />}
              {currentView === 'values-alignment' && <ValuesAlignment />}
              {currentView === 'fantasy-league' && <FantasyLeague />}
              {currentView === 'boosts' && <BoostsManager />}
              {currentView === 'security-beast' && <SecurityBeastView />}
              {currentView === 'bhavishya' && <BhavishyaEngine />}
              {currentView === 'innovation-lab' && <InnovationLabView />}
              {currentView === 'payments' && <PaymentsPage />}
              {currentView === 'loan-center' && <LoanCenter />}
              {currentView === 'recurring-payments' && <RecurringPayments />}
              {currentView === 'account-statement' && <AccountStatement />}
              {currentView === 'audit-log' && <AuditLog />}
              {currentView === 'profile' && <ProfileSettings />}
            </>
          )}
        </Suspense>
      </AppShell>

      <ConsentModal />

      <Suspense fallback={null}>
        <PitchMode />
      </Suspense>
      <ReportGeneratorModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        onGenerate={(format) => { setReportFormat(format); setShowReportView(true); }}
      />
      {showReportView && <FinancialReport format={reportFormat} onClose={() => setShowReportView(false)} />}
      <LockdownOverlay />
      <Suspense fallback={null}>
        <BiometricAuth />
      </Suspense>
      <Suspense fallback={null}>
        <DemoMode />
      </Suspense>
      <JudgeTour />
      <LiveActivityPill />
    </RewardsProvider>
    </NBAProvider>
    </SecurityProvider>
    </ToastProvider>
  );
}

import { useEffect, useState, Suspense, useTransition } from 'react';
import { motion } from 'framer-motion';
import PitchMode from '@/features/pitch/components/PitchMode';
import PitchDeckView from '@/features/pitch/components/PitchDeckView';
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
import VisionAppraisalModal from '@/features/assets/components/VisionAppraisalModal';
import AAFetchAnimation from '@/features/aa/components/AAFetchAnimation';
import AACallbackHandler from '@/features/aa/components/AACallbackHandler';
import OnboardingWizard from '@/features/onboarding/components/OnboardingWizard';

const PaymentsPage = lazyWithRetry(() => import('@/features/payments/components/PaymentsPage'));
const ProfileSettings = lazyWithRetry(() => import('@/features/profile/components/ProfileSettings'));

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
import EmptyState from '@/shared/components/EmptyState';
import { Link2, Landmark, House, Coins, Car, ChartPie } from 'lucide-react';

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
const CreditBridgeAI = lazyWithRetry(() => import('@/features/credit/components/CreditBridgeAI'));
const BhavishyaEngine = lazyWithRetry(() => import('@/features/innovation/components/BhavishyaEngine'));
const InnovationLabView = lazyWithRetry(() => import('@/features/innovation/components/InnovationLabView'));
const FantasyLeague = lazyWithRetry(() => import('@/features/gamification/components/FantasyLeague'));
const BoostsManager = lazyWithRetry(() => import('@/features/goals/components/BoostsManager'));
const ValuesAlignment = lazyWithRetry(() => import('@/features/values/components/ValuesAlignment'));
const AccessibilitySettings = lazyWithRetry(() => import('@/features/accessibility/components/AccessibilitySettings'));
const NRIMode = lazyWithRetry(() => import('@/features/nri/components/NRIMode'));
const SeniorMode = lazyWithRetry(() => import('@/features/senior/components/SeniorMode'));
const BusinessMode = lazyWithRetry(() => import('@/features/business/components/BusinessMode'));
const LoanCenter = lazyWithRetry(() => import('@/features/banking/components/LoanCenter'));
const MSMEcreditbridgeView = lazyWithRetry(() => import('@/features/msme/components/MSMEcreditbridgeView'));
const LoansHub = lazyWithRetry(() => import('@/features/loans/components/LoansHub'));
const LoanResearchShowcase = lazyWithRetry(() => import('@/features/loans/components/LoanResearchShowcase'));
const LoanImpactSimulator = lazyWithRetry(() => import('@/features/loans/components/LoanImpactSimulator'));
const SocialCollateralLoan = lazyWithRetry(() => import('@/features/loans/components/SocialCollateralLoan'));
const RecurringPayments = lazyWithRetry(() => import('@/features/banking/components/RecurringPayments'));
const AccountStatement = lazyWithRetry(() => import('@/features/banking/components/AccountStatement'));
const AuditLog = lazyWithRetry(() => import('@/features/banking/components/AuditLog'));

import { NBAProvider } from '@/shared/context/NBAContext';
import { RewardsProvider } from '@/shared/context/RewardsContext';

// Loading fallback component
function ViewLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-psb-bg dark:bg-slate-950">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-black text-primary">PSB</span>
          </div>
        </div>
        <div className="space-y-1 text-center">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Loading your secure workspace</p>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xs text-slate-400"
          >
            Please wait…
          </motion.p>
        </div>
      </div>
    </div>
  );
}

const assetTypeIcons: Record<string, React.ElementType> = {
  bank: Landmark,
  property: House,
  gold: Coins,
  vehicle: Car,
  other: ChartPie,
};

function AssetsView() {
  const assets = useWealthStore((s) => s.assets);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showVisionModal, setShowVisionModal] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">All Assets</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLinkModal(true)}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Link2 className="w-4 h-4" /> Link Account
          </button>
          <button
            onClick={() => setShowVisionModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-camera" /> Vision Appraisal
          </button>
          <ManualAssetForm />
        </div>
      </div>
      {assets.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No assets linked yet"
          subtitle="Add a manual asset or link an account via RBI Account Aggregator to build your net worth view."
          action={{ label: 'Link Account', onClick: () => setShowLinkModal(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => {
            const AssetIcon = assetTypeIcons[asset.type] || ChartPie;
            return (
              <div key={asset.id} className="card relative">
                {asset.linkedViaAA && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-medium rounded-full flex items-center gap-1">
                    <Link2 className="w-3 h-3" />Linked via AA
                  </span>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <AssetIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-800 dark:text-white">{asset.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{asset.type}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-800 dark:text-white">₹{asset.value.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">Liquidity: {asset.liquidity}</p>
              </div>
            );
          })}
        </div>
      )}
      <LinkAccountModal show={showLinkModal} onClose={() => setShowLinkModal(false)} />
      <VisionAppraisalModal show={showVisionModal} onClose={() => setShowVisionModal(false)} />
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

  const loadFromBackend = useWealthStore((s) => s.loadFromBackend);

  useEffect(() => {
    if (isJudgeMode()) {
      initJudgeMode();
    }
    // Show the Account Aggregator fetch animation once per login session
    setAAFetchComplete(false);
    setLoginAt(Date.now());
    // Attempt to hydrate latest dashboard data from backend
    void loadFromBackend();
  }, [initJudgeMode, setAAFetchComplete, setLoginAt, loadFromBackend]);

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
    return <OnboardingWizard onComplete={() => {
      setOnboardingComplete(true);
      setAAFetchComplete(true);
    }} />;
  }

  // Account Aggregator onboarding animation — shown once after login
  if (!aaFetchComplete) {
    return <AAFetchAnimation onComplete={() => setAAFetchComplete(true)} />;
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
              {currentView === 'creditbridge-ai' && <CreditBridgeAI />}
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
              {currentView === 'pitch-deck' && <PitchDeckView />}
              {currentView === 'payments' && <PaymentsPage />}
              {currentView === 'loan-center' && <LoanCenter />}
              {currentView === 'msme-creditbridge' && <MSMEcreditbridgeView />}
              {currentView === 'loans-hub' && <LoansHub />}
              {currentView === 'loan-research' && <LoanResearchShowcase />}
              {currentView === 'loan-impact' && <LoanImpactSimulator />}
              {currentView === 'social-collateral-loan' && <SocialCollateralLoan />}
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
      <JudgeTour onNavigate={navigateToView} />
      <LiveActivityPill />
    </RewardsProvider>
    </NBAProvider>
    </SecurityProvider>
    </ToastProvider>
  );
}

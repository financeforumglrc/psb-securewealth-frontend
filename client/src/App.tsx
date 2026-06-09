import { useEffect, useState, lazy, Suspense } from 'react';
import { useWealthStore } from './store/wealthStore';
import { isJudgeMode } from './utils/demoMode';
import { usePanicMode } from './hooks/usePanicMode';
import { useDemoMode } from './hooks/useDemoMode';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import { useAuth } from './context/AuthContext';
import { SecurityProvider } from './context/SecurityContext';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { getQueuedActions, syncQueuedActions } from './services/offlineQueue';

import GoalTracker from './components/goals/GoalTracker';
import LockdownOverlay from './components/protection/LockdownOverlay';
import BiometricAuth from './components/auth/BiometricAuth';
import NotificationDemo from './components/demo/NotificationDemo';
import DigitalGold from './components/gold/DigitalGold';
import ChallengesView from './components/challenges/ChallengesView';
import KidsMode from './components/kids/KidsMode';
import SubscriptionTracker from './components/subscriptions/SubscriptionTracker';
import FamilyDashboard from './components/family/FamilyDashboard';
import SystemArchitecture from './components/architecture/SystemArchitecture';
import FeaturesUniverse from './components/architecture/FeaturesUniverse';
import ReportGeneratorModal from './components/report/ReportGeneratorModal';
import FinancialReport from './components/report/FinancialReport';
import ConsentModal from './components/compliance/ConsentModal';
import ScenarioSimulator from './components/forecast/ScenarioSimulator';
import ManualAssetForm from './components/assets/ManualAssetForm';
import LinkAccountModal from './components/assets/LinkAccountModal';

import LoginPage from './components/auth/LoginPage';
import PaymentsPage from './components/payments/PaymentsPage';
import ProfileSettings from './components/profile/ProfileSettings';

import PitchMode from './components/pitch/PitchMode';
import DemoMode from './components/demo/DemoMode';

import SecurityBeastView from './components/security/SecurityBeastView';
import DecoyAccountView from './components/security/DecoyAccountView';

import ProtectionView from './components/protection/ProtectionView';
import PrivacyView from './components/privacy/PrivacyView';

import { isDuressLocked } from './services/duressService';

import BankHeader from './components/psb/BankHeader';
import TrustBanner from './components/psb/TrustBanner';
import AccessibleFooter from './components/psb/AccessibleFooter';
import MarketTicker from './components/ui/MarketTicker';
import { ToastProvider } from './components/ui/ToastProvider';

import PaymentHub from './components/payments/PaymentHub';
import JudgeTour from './components/demo/JudgeTour';
import CommandPalette from './components/ui/CommandPalette';
import LiveActivityPill from './components/ui/LiveActivityPill';

// Lazy load heavy view components for code splitting
const DashboardView = lazy(() => import('./components/dashboard/DashboardView'));
const WealthTwinView = lazy(() => import('./components/ai/WealthTwinView'));
const AIRecommendationsView = lazy(() => import('./components/ai/AIRecommendationsView'));
const PortfolioView = lazy(() => import('./components/portfolio/PortfolioView'));
const MarketView = lazy(() => import('./components/market/MarketView'));
const TaxView = lazy(() => import('./components/tax/TaxView'));
const CalculatorsView = lazy(() => import('./components/calculators/CalculatorsView'));
const TransactionsView = lazy(() => import('./components/transactions/TransactionsView'));
const BillCalendar = lazy(() => import('./components/bills/BillCalendar'));
const CreditHealth = lazy(() => import('./components/credit/CreditHealth'));
const BhavishyaEngine = lazy(() => import('./components/innovation/BhavishyaEngine'));
const InnovationOverview = lazy(() => import('./components/innovation/InnovationOverview'));
const NeuroFrictionWidget = lazy(() => import('./components/innovation/NeuroFrictionWidget'));
const MonteCarloSimulator = lazy(() => import('./components/innovation/MonteCarloSimulator'));
const CollectiveImmuneSystem = lazy(() => import('./components/innovation/CollectiveImmuneSystem'));
const AutonomousAgent = lazy(() => import('./components/innovation/AutonomousAgent'));
const SovereignVault = lazy(() => import('./components/innovation/SovereignVault'));
const ParametricInsurance = lazy(() => import('./components/insurance/ParametricInsurance'));
const GhostMode = lazy(() => import('./components/security/GhostMode'));
const DeadMansSwitch = lazy(() => import('./components/security/DeadMansSwitch'));
const GigIncomeSmoother = lazy(() => import('./components/income/GigIncomeSmoother'));
const SocialCollateralLoan = lazy(() => import('./components/loans/SocialCollateralLoan'));
const FantasyLeague = lazy(() => import('./components/gamification/FantasyLeague'));
const BoostsManager = lazy(() => import('./components/goals/BoostsManager'));
const ValuesAlignment = lazy(() => import('./components/values/ValuesAlignment'));
const AccessibilitySettings = lazy(() => import('./components/accessibility/AccessibilitySettings'));
const NRIMode = lazy(() => import('./components/nri/NRIMode'));
const SeniorMode = lazy(() => import('./components/senior/SeniorMode'));
const BusinessMode = lazy(() => import('./components/business/BusinessMode'));
const LoanCenter = lazy(() => import('./components/banking/LoanCenter'));
const RecurringPayments = lazy(() => import('./components/banking/RecurringPayments'));
const AccountStatement = lazy(() => import('./components/banking/AccountStatement'));
const AuditLog = lazy(() => import('./components/banking/AuditLog'));

import { NBAProvider } from './context/NBAContext';
import { RewardsProvider } from './context/RewardsContext';

// Loading fallback component
function ViewLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading...</p>
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
    </div>
  );
}

function ForecastView() {
  return (
    <div className="space-y-6">
      <ScenarioSimulator />
    </div>
  );
}

export default function App() {
  useSupabaseSync();
  const { state: authState } = useAuth();
  const currentView = useWealthStore((s) => s.currentView);
  const darkMode = useWealthStore((s) => s.darkMode);
  const initJudgeMode = useWealthStore((s) => s.initJudgeMode);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const pitchModeActive = useWealthStore((s) => s.pitchModeActive);
  /* familyMode unused after removing AnimatePresence key */
  const language = useWealthStore((s) => s.language);
  const setLanguage = useWealthStore((s) => s.setLanguage);
  const accessibilityMode = useWealthStore((s) => s.accessibilityMode);
  const seniorMode = useWealthStore((s) => s.seniorMode);
  const [_showProfileMenu, _setShowProfileMenu] = useState(false);
  const [_showLangMenu, _setShowLangMenu] = useState(false);
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

  // Login gate
  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <ToastProvider>
    <SecurityProvider>
    <NBAProvider>
    <RewardsProvider>
    <div className={`h-screen flex flex-col overflow-hidden ${darkMode ? 'bg-dark text-white' : 'bg-psb-bg text-psb-text'} ${accessibilityMode ? 'a11y-mode' : ''} ${seniorMode ? 'senior-mode' : ''}`}>
      {/* PSB Info Bar */}
      <div className="bg-primary-dark text-white text-center py-1.5 px-4 text-[11px]">
        <div className="flex items-center justify-center gap-2">
          <i className="fas fa-shield-halved text-secondary" />
          <span><strong>DICGC Insured</strong> — Deposits up to ₹5 Lakhs secured · <strong>RBI Licensed</strong> — Regulated by Reserve Bank of India · <strong>256-bit SSL</strong> Encryption</span>
        </div>
      </div>

      {/* Offline Queue Badge */}
      {queuedCount > 0 && (
        <div className="bg-amber-500 text-white text-center py-1.5 px-4 text-xs relative z-50 animate-fade-in">
          <div className="flex items-center justify-center gap-2">
            <i className="fas fa-clock-rotate-left" />
            <span>
              <strong>Offline Queue:</strong> {queuedCount} action{queuedCount > 1 ? 's' : ''} pending
              {online ? ' — syncing now…' : ' — will sync when online'}
            </span>
          </div>
        </div>
      )}

      {/* Language Banner */}
      {language !== 'en' && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-1.5 px-4 text-xs relative z-50 animate-fade-in">
          <div className="flex items-center justify-center gap-2">
            <i className="fas fa-language" />
            <span>More languages coming soon — we are building for Bharat. 🇮🇳</span>
            <button onClick={() => setLanguage('en')} className="underline hover:no-underline ml-2">Switch to English</button>
          </div>
        </div>
      )}

      {/* PSB Header */}
      <BankHeader />
      <TrustBanner />
      <MarketTicker />

      {/* Payment Hub Bar */}
      <PaymentHub />

      {/* Mobile Header with Hamburger */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 safe-area-left safe-area-right">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex items-center gap-2 text-gray-700"
          aria-label="Open menu"
        >
          <i className="fas fa-bars text-lg" />
          <span className="text-sm font-semibold">Menu</span>
        </button>
        <span className="text-xs text-gray-500 font-medium">
          {[
            { view: 'dashboard', label: 'Dashboard' },
            { view: 'bhavishya', label: 'BHAVISHYA AI' },
            { view: 'wealth-twin', label: 'Wealth Twin' },
            { view: 'goals', label: 'Goals' },
            { view: 'portfolio', label: 'Portfolio' },
            { view: 'assets', label: 'Assets' },
            { view: 'market', label: 'Market' },
            { view: 'forecast', label: 'Forecast' },
            { view: 'payments', label: 'Payments' },
            { view: 'transactions', label: 'Transactions' },
            { view: 'protection', label: 'Protection' },
            { view: 'security-beast', label: 'Security Beast' },
            { view: 'privacy', label: 'Privacy' },
            { view: 'tax', label: 'Tax' },
            { view: 'calculators', label: 'Calculators' },
            { view: 'bills', label: 'Bill Calendar' },
            { view: 'credit-health', label: 'Credit Health' },
            { view: 'loan-center', label: 'Loan Center' },
            { view: 'recurring-payments', label: 'Recurring' },
            { view: 'account-statement', label: 'Statement' },
            { view: 'audit-log', label: 'Audit Log' },
            { view: 'family', label: 'Family' },
            { view: 'digital-gold', label: 'Digital Gold' },
            { view: 'subscriptions', label: 'Subscriptions' },
            { view: 'challenges', label: 'Challenges' },
            { view: 'innovation-lab', label: 'Innovation Lab' },
            { view: 'nri-mode', label: 'NRI Center' },
            { view: 'business-mode', label: 'Business' },
            { view: 'kids-mode', label: 'Kids Mode' },
            { view: 'notification-demo', label: 'Notifications' },
          ].find(i => i.view === currentView)?.label || 'Dashboard'}
        </span>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60] md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-[280px] bg-white z-[70] flex flex-col shadow-2xl md:hidden safe-area-top safe-area-bottom animate-slide-in-left">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-landmark text-white text-sm" />
                </div>
                <span className="font-bold text-sm text-gray-800">PSB Banking</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800"
                aria-label="Close menu"
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
              {/* WEALTH INTELLIGENCE */}
              <div className="px-3 py-2">
                <p className="text-[9px] font-extrabold text-primary uppercase tracking-widest">Wealth Intelligence</p>
              </div>
              {[
                { view: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
                { view: 'bhavishya', label: 'BHAVISHYA AI', icon: 'fa-infinity', badge: 'FLAGSHIP', alert: true },
                { view: 'wealth-twin', label: 'Wealth Twin', icon: 'fa-brain' },
                { view: 'goals', label: 'Goals', icon: 'fa-bullseye' },
                { view: 'portfolio', label: 'Portfolio', icon: 'fa-layer-group' },
                { view: 'assets', label: 'Assets', icon: 'fa-gem' },
                { view: 'market', label: 'Market', icon: 'fa-globe' },
                { view: 'forecast', label: 'Forecast', icon: 'fa-chart-line' },
              ].map((item: any) => (
                <button
                  key={item.view}
                  onClick={() => {
                    useWealthStore.getState().setView(item.view as any);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-md text-sm font-semibold transition-all duration-150 text-left relative min-h-[44px] ${
                    currentView === item.view
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  <i className={`fas ${item.icon} w-4 text-center ${currentView === item.view ? 'text-white' : 'text-gray-400'}`} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                      currentView === item.view ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.alert && currentView !== item.view && (
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                  )}
                </button>
              ))}

              {/* FRAUD PROTECTION & SECURITY */}
              <div className="px-3 py-2 mt-2 border-t border-gray-100">
                <p className="text-[9px] font-extrabold text-rose-600 uppercase tracking-widest">Fraud Protection</p>
              </div>
              {[
                { view: 'payments', label: 'Payments', icon: 'fa-bolt' },
                { view: 'transactions', label: 'Transactions', icon: 'fa-list' },
                { view: 'protection', label: 'Protection', icon: 'fa-shield-halved' },
                { view: 'security-beast', label: 'Security Beast', icon: 'fa-dragon' },
                { view: 'privacy', label: 'Privacy', icon: 'fa-lock' },
              ].map((item: any) => (
                <button
                  key={item.view}
                  onClick={() => {
                    useWealthStore.getState().setView(item.view as any);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-md text-sm font-semibold transition-all duration-150 text-left relative min-h-[44px] ${
                    currentView === item.view
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  <i className={`fas ${item.icon} w-4 text-center ${currentView === item.view ? 'text-white' : 'text-gray-400'}`} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                      currentView === item.view ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.alert && currentView !== item.view && (
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                  )}
                </button>
              ))}

              {/* FINANCIAL TOOLS */}
              <div className="px-3 py-2 mt-2 border-t border-gray-100">
                <p className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest">Financial Tools</p>
              </div>
              {[
                { view: 'tax', label: 'Tax', icon: 'fa-file-invoice-dollar' },
                { view: 'calculators', label: 'Calculators', icon: 'fa-calculator' },
                { view: 'bills', label: 'Bill Calendar', icon: 'fa-calendar-check' },
                { view: 'credit-health', label: 'Credit Health', icon: 'fa-file-invoice' },
                { view: 'loan-center', label: 'Loan Center', icon: 'fa-file-contract' },
                { view: 'recurring-payments', label: 'Recurring', icon: 'fa-rotate' },
                { view: 'account-statement', label: 'Statement', icon: 'fa-file-invoice' },
                { view: 'audit-log', label: 'Audit Log', icon: 'fa-shield-halved' },
              ].map((item: any) => (
                <button
                  key={item.view}
                  onClick={() => {
                    useWealthStore.getState().setView(item.view as any);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-md text-sm font-semibold transition-all duration-150 text-left relative min-h-[44px] ${
                    currentView === item.view
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  <i className={`fas ${item.icon} w-4 text-center ${currentView === item.view ? 'text-white' : 'text-gray-400'}`} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                      currentView === item.view ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.alert && currentView !== item.view && (
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                  )}
                </button>
              ))}

              {/* OTHER FEATURES */}
              <div className="px-3 py-2 mt-2 border-t border-gray-100">
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Other Features</p>
              </div>
              {[
                { view: 'family', label: 'Family', icon: 'fa-people-group' },
                { view: 'digital-gold', label: 'Digital Gold', icon: 'fa-coins' },
                { view: 'subscriptions', label: 'Subscriptions', icon: 'fa-calendar-xmark' },
                { view: 'challenges', label: 'Challenges', icon: 'fa-fire' },
                { view: 'innovation-lab', label: 'Innovation Lab', icon: 'fa-flask' },
                { view: 'nri-mode', label: 'NRI Center', icon: 'fa-globe' },
                { view: 'business-mode', label: 'Business', icon: 'fa-building' },
                { view: 'kids-mode', label: 'Kids Mode', icon: 'fa-child' },
                { view: 'notification-demo', label: 'Notifications', icon: 'fa-bell' },
              ].map((item: any) => (
                <button
                  key={item.view}
                  onClick={() => {
                    useWealthStore.getState().setView(item.view as any);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-md text-sm font-semibold transition-all duration-150 text-left relative min-h-[44px] ${
                    currentView === item.view
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  <i className={`fas ${item.icon} w-4 text-center ${currentView === item.view ? 'text-white' : 'text-gray-400'}`} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                      currentView === item.view ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.alert && currentView !== item.view && (
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-gray-100">
              <div className="p-3 bg-primary-light/60 rounded-lg border border-primary/10">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-1">Need Help?</p>
                <p className="text-[11px] text-gray-600">Call 1800-11-2211</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar — Grouped by Problem Statement */}
        <aside className="w-[240px] flex-shrink-0 hidden md:flex flex-col bg-white border-r border-gray-200/80 overflow-y-auto">
          {/* WEALTH INTELLIGENCE */}
          <div className="px-4 py-2 bg-primary/5 border-b border-primary/10">
            <p className="text-[9px] font-extrabold text-primary uppercase tracking-widest">Wealth Intelligence</p>
          </div>
          <nav className="py-1 px-2 space-y-0.5">
            {[
              { view: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
              { view: 'bhavishya', label: 'BHAVISHYA AI', icon: 'fa-infinity', badge: 'FLAGSHIP', alert: true },
              { view: 'wealth-twin', label: 'Wealth Twin', icon: 'fa-brain' },
              { view: 'goals', label: 'Goals', icon: 'fa-bullseye' },
              { view: 'portfolio', label: 'Portfolio', icon: 'fa-layer-group' },
              { view: 'assets', label: 'Assets', icon: 'fa-gem' },
              { view: 'market', label: 'Market', icon: 'fa-globe' },
              { view: 'forecast', label: 'Forecast', icon: 'fa-chart-line' },
            ].map((item: any) => (
              <button
                key={item.view}
                onClick={() => useWealthStore.getState().setView(item.view as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-semibold transition-all duration-150 text-left relative ${
                  currentView === item.view
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                }`}
              >
                <i className={`fas ${item.icon} w-4 text-center ${currentView === item.view ? 'text-white' : 'text-gray-400'}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                    currentView === item.view ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.alert && currentView !== item.view && (
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </nav>

          {/* FRAUD PROTECTION & SECURITY */}
          <div className="px-4 py-2 bg-rose-50 border-y border-rose-100">
            <p className="text-[9px] font-extrabold text-rose-600 uppercase tracking-widest">Fraud Protection</p>
          </div>
          <nav className="py-1 px-2 space-y-0.5">
            {[
              { view: 'payments', label: 'Payments', icon: 'fa-bolt' },
              { view: 'transactions', label: 'Transactions', icon: 'fa-list' },
              { view: 'protection', label: 'Protection', icon: 'fa-shield-halved' },
              { view: 'security-beast', label: 'Security Beast', icon: 'fa-dragon' },
              { view: 'privacy', label: 'Privacy', icon: 'fa-lock' },
            ].map((item: any) => (
              <button
                key={item.view}
                onClick={() => useWealthStore.getState().setView(item.view as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-semibold transition-all duration-150 text-left relative ${
                  currentView === item.view
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                }`}
              >
                <i className={`fas ${item.icon} w-4 text-center ${currentView === item.view ? 'text-white' : 'text-gray-400'}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                    currentView === item.view ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.alert && currentView !== item.view && (
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </nav>

          {/* FINANCIAL TOOLS */}
          <div className="px-4 py-2 bg-blue-50 border-y border-blue-100">
            <p className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest">Financial Tools</p>
          </div>
          <nav className="py-1 px-2 space-y-0.5">
            {[
              { view: 'tax', label: 'Tax', icon: 'fa-file-invoice-dollar' },
              { view: 'calculators', label: 'Calculators', icon: 'fa-calculator' },
              { view: 'bills', label: 'Bill Calendar', icon: 'fa-calendar-check' },
              { view: 'credit-health', label: 'Credit Health', icon: 'fa-file-invoice' },
              { view: 'loan-center', label: 'Loan Center', icon: 'fa-file-contract' },
              { view: 'recurring-payments', label: 'Recurring', icon: 'fa-rotate' },
              { view: 'account-statement', label: 'Statement', icon: 'fa-file-invoice' },
              { view: 'audit-log', label: 'Audit Log', icon: 'fa-shield-halved' },
            ].map((item: any) => (
              <button
                key={item.view}
                onClick={() => useWealthStore.getState().setView(item.view as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-semibold transition-all duration-150 text-left relative ${
                  currentView === item.view
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                }`}
              >
                <i className={`fas ${item.icon} w-4 text-center ${currentView === item.view ? 'text-white' : 'text-gray-400'}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                    currentView === item.view ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.alert && currentView !== item.view && (
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </nav>

          {/* OTHER FEATURES */}
          <div className="px-4 py-2 bg-gray-50 border-y border-gray-100">
            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Other Features</p>
          </div>
          <nav className="py-1 px-2 space-y-0.5">
            {[
              { view: 'family', label: 'Family', icon: 'fa-people-group' },
              { view: 'digital-gold', label: 'Digital Gold', icon: 'fa-coins' },
              { view: 'subscriptions', label: 'Subscriptions', icon: 'fa-calendar-xmark' },
              { view: 'challenges', label: 'Challenges', icon: 'fa-fire' },
              { view: 'innovation-lab', label: 'Innovation Lab', icon: 'fa-flask' },
              { view: 'nri-mode', label: 'NRI Center', icon: 'fa-globe' },
              { view: 'business-mode', label: 'Business', icon: 'fa-building' },
              { view: 'kids-mode', label: 'Kids Mode', icon: 'fa-child' },
              { view: 'notification-demo', label: 'Notifications', icon: 'fa-bell' },
            ].map((item: any) => (
              <button
                key={item.view}
                onClick={() => useWealthStore.getState().setView(item.view as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-semibold transition-all duration-150 text-left relative ${
                  currentView === item.view
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                }`}
              >
                <i className={`fas ${item.icon} w-4 text-center ${currentView === item.view ? 'text-white' : 'text-gray-400'}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                    currentView === item.view ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.alert && currentView !== item.view && (
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto p-3 border-t border-gray-100">
            <div className="p-3 bg-primary-light/60 rounded-lg border border-primary/10">
              <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-1">Need Help?</p>
              <p className="text-[11px] text-gray-600">Call 1800-11-2211</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-psb-bg">
          {/* View Content with Page Transitions */}
          <div className={`p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto ${pitchModeActive ? 'ring-4 ring-primary/40 ring-inset rounded-xl' : ''}`}>
            <div className="animate-fade-in-fast">
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
            </div>
          </div>
          <AccessibleFooter />
        </main>
      </div>

      <ConsentModal />

      <PitchMode />
      <ReportGeneratorModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        onGenerate={(format) => { setReportFormat(format); setShowReportView(true); }}
      />
      {showReportView && <FinancialReport format={reportFormat} onClose={() => setShowReportView(false)} />}
      <LockdownOverlay />
      <BiometricAuth />
      <DemoMode />
      <JudgeTour />
      <CommandPalette />
      <LiveActivityPill />
    </div>
    </RewardsProvider>
    </NBAProvider>
    </SecurityProvider>
    </ToastProvider>
  );
}

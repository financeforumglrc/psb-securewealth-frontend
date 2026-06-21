import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useRewards } from '@/shared/context/RewardsContext';
import { getStreak } from '@/shared/services/streakService';
import { getSalaryHistory } from '@/features/salary/components/AddSalaryModal';
import { useVoiceNarration, numberToWords } from '@/shared/hooks/useVoiceNarration';
import { speak, cancelSpeech, isSpeechSupported } from '@/shared/services/voiceService';
import { formatCurrencyMask, formatCroreMask } from '@/shared/utils/duressMask';
import CosmosCard from '@/shared/components/ui/CosmosCard';

import FinancialPulse from '@/features/dashboard/components/FinancialPulse';
import NetWorthCard from '@/features/dashboard/components/NetWorthCard';
import KYCStatusCard from '@/features/dashboard/components/KYCStatusCard';
import FinancialWeather from '@/features/dashboard/components/FinancialWeather';
import NBAInsights from '@/features/dashboard/components/NBAInsights';
import MonthlyNarrative from '@/features/dashboard/components/MonthlyNarrative';
import AdaptiveInsight from '@/features/dashboard/components/AdaptiveInsight';
import InvestmentQuiz from '@/features/quiz/components/InvestmentQuiz';
import DeviceStatusCard from '@/features/dashboard/components/DeviceStatusCard';

import QuickActions from '@/features/dashboard/components/QuickActions';
import ChartWidget from '@/shared/components/ui/ChartWidget';
import VirtualCard from '@/shared/components/ui/VirtualCard';
import RecentTransactionsTable from '@/features/psb/components/RecentTransactionsTable';
import SecurityHealthWidget from '@/features/psb/components/SecurityHealthWidget';
import PSBSchemesCard from '@/features/psb/components/PSBSchemesCard';
import RewardsDashboardCard from '@/features/payments/components/RewardsDashboardCard';
import AccountAggregatorWidget from '@/features/assets/components/AccountAggregatorWidget';
import AccountAggregatorFull from '@/features/aa/components/AccountAggregatorFull';
import RecommendationCard from '@/features/ai/components/RecommendationCard';
import WealthDNA from '@/features/dashboard/components/WealthDNA';
import WealthBenchmark from '@/features/dashboard/components/WealthBenchmark';
import AIDecisionLog from '@/features/ai/components/AIDecisionLog';
import ComplianceBadges from '@/features/compliance/components/ComplianceBadges';
import ComplianceBar from '@/features/compliance/components/ComplianceBar';
import SmartActionOrchestrator from '@/features/ai/components/SmartActionOrchestrator';
import FinancialLiteracyCards from '@/features/ai/components/FinancialLiteracyCards';
import GoalTracker from '@/features/goals/components/GoalTracker';
import AddSalaryModal from '@/features/salary/components/AddSalaryModal';

import DemoCreditCard from '@/features/credit/components/DemoCreditCard';
import TransactionComparison from '@/features/transactions/components/TransactionComparison';
import ScenarioSimulator from '@/features/forecast/components/ScenarioSimulator';
import WhatIfSimulator from '@/features/forecast/components/WhatIfSimulator';
import StressTestSimulator from '@/features/protection/components/StressTestSimulator';
import QuickPayCard from '@/features/psb/components/QuickPayCard';

import WealthTwinHero from '@/features/dashboard/components/WealthTwinHero';
import MarketIntelligenceHero from '@/features/dashboard/components/MarketIntelligenceHero';
import PredictiveShieldBadge from '@/features/dashboard/components/PredictiveShieldBadge';

export default function DashboardView() {
  const user = useWealthStore((s) => s.user);
  const assets = useWealthStore((s) => s.assets);
  const goals = useWealthStore((s) => s.goals);
  const coercedMode = useWealthStore((s) => s.coercedMode);
  const duressModeActive = useWealthStore((s) => s.duressModeActive);
  const setCoercedMode = useWealthStore((s) => s.setCoercedMode);
  const setView = useWealthStore((s) => s.setView);
  const dashboardDensity = useWealthStore((s) => s.dashboardDensity);
  const setDashboardDensity = useWealthStore((s) => s.setDashboardDensity);
  const { t, language, setLanguage } = useTranslation();

  const rawNetWorth = assets.reduce((sum, a) => sum + a.value, 0);
  const netWorth = coercedMode ? 5000 : rawNetWorth;
  const healthScore = coercedMode ? 15 : Math.min(Math.round((user.monthlySavings / user.monthlyIncome) * 200 + 40), 100);
  const { cashbackBalance } = useRewards();
  const streak = getStreak();
  const salaryHistory = getSalaryHistory();

  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [speakingSummary, setSpeakingSummary] = useState(false);

  const openPaymentHub = () => {
    window.dispatchEvent(new CustomEvent('sw-open-payment-hub'));
  };

  const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount).length;
  const savingsRate = user.monthlyIncome > 0 ? ((user.monthlySavings / user.monthlyIncome) * 100).toFixed(1) : '0';
  const netWorthCrore = (netWorth / 1e7).toFixed(2);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  }, [t]);

  const handleReadSummary = () => {
    if (!isSpeechSupported()) return;
    if (speakingSummary) {
      cancelSpeech();
      setSpeakingSummary(false);
      return;
    }
    const text = `Your net worth is ${netWorthCrore} crore. Savings rate is ${savingsRate} percent. You have ${activeGoals} goals in progress.`;
    speak(text);
    setSpeakingSummary(true);

    const durationMs = Math.max(3000, text.length * 80);
    const timeout = setTimeout(() => setSpeakingSummary(false), durationMs);

    const onCancel = () => {
      clearTimeout(timeout);
      window.removeEventListener('sw-cancel-speech', onCancel);
    };
    window.addEventListener('sw-cancel-speech', onCancel);
  };

  const statCards = [
    { label: t('netWorth'), value: coercedMode ? '₹5,000' : formatCroreMask(rawNetWorth, duressModeActive), icon: 'fa-wallet', color: 'from-primary/20 to-primary/5', text: 'text-primary', speakText: `${t('netWorth')} ${numberToWords(netWorth)} rupees`, inrValue: netWorth, trend: '+2.4%', trendUp: true },
    { label: t('monthlySavings'), value: coercedMode ? '₹500' : formatCurrencyMask(user.monthlySavings, duressModeActive), icon: 'fa-piggy-bank', color: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-600', speakText: `${t('monthlySavings')} ${numberToWords(user.monthlySavings)} rupees`, inrValue: user.monthlySavings, trend: '+' + savingsRate + '%', trendUp: true },
    { label: t('healthScore'), value: `${healthScore}/100`, icon: 'fa-heart-pulse', color: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-600', speakText: `${t('healthScore')} ${healthScore} out of 100`, trend: healthScore > 70 ? 'Good' : 'Needs work', trendUp: healthScore > 70 },
    { label: t('cashback'), value: formatCurrencyMask(cashbackBalance, duressModeActive), icon: 'fa-gift', color: 'from-pink-500/20 to-pink-500/5', text: 'text-pink-500', trend: 'Available', trendUp: true },
    { label: t('streak'), value: `${streak.days} days`, icon: 'fa-fire', color: 'from-orange-500/20 to-orange-500/5', text: 'text-orange-500', trend: streak.days > 5 ? 'On fire!' : 'Keep going', trendUp: streak.days > 5 },
  ];

  const isSimple = dashboardDensity === 'simple';

  return (
    <QuickActions>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Coerced Mode Warning */}
        {coercedMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border-2 border-rose-200 dark:border-rose-800 flex items-center justify-between"
          >
            <p className="text-xs text-rose-700 dark:text-rose-300 font-bold">
              <i className="fas fa-triangle-exclamation mr-1" /> Coerced Mode Active — Sanitized View
            </p>
            <button
              onClick={() => { setCoercedMode(false); localStorage.removeItem('sw_coerced_mode'); }}
              className="text-[10px] px-3 py-1.5 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600 transition-colors"
            >
              Restore Access
            </button>
          </motion.div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-psb-muted dark:text-slate-400 font-medium">{greeting}</p>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {user.name || t('welcome')}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white dark:bg-slate-900 border border-psb-border dark:border-slate-700 rounded-xl p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${language === 'en' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${language === 'hi' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                हिं
              </button>
            </div>
            <div className="flex items-center bg-white dark:bg-slate-900 border border-psb-border dark:border-slate-700 rounded-xl p-1">
              <button
                onClick={() => setDashboardDensity('simple')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${isSimple ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                title={t('simpleMode')}
              >
                {t('simpleMode')}
              </button>
              <button
                onClick={() => setDashboardDensity('comprehensive')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${!isSimple ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                title={t('comprehensiveMode')}
              >
                {t('comprehensiveMode')}
              </button>
            </div>
          </div>
        </div>

        <ComplianceBar />

        {/* Hero + Pulse */}
        <WealthTwinHero />
        <FinancialPulse />

        {/* Key Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <StatCardV2 {...card} />
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <SectionHeader icon="fa-bolt" title={t('quickActions')} subtitle={t('frequentTasks')} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <QuickPayCard onExpand={openPaymentHub} />
          </div>
          <VirtualCard />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left + Center */}
          <div className="lg:col-span-2 space-y-5">
            <SectionHeader icon="fa-chart-line" title={t('financialOverview')} subtitle={t('trackWealthJourney')} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <CosmosCard variant="default" padding="sm">
                  <ChartWidget type="area" />
                </CosmosCard>
              </div>
              <CosmosCard variant="default" padding="sm">
                <ChartWidget type="pie" />
              </CosmosCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <RecentTransactionsTable />
              <GoalTracker asWidget />
            </div>

            <SectionHeader icon="fa-wand-magic-sparkles" title={t('smartActions')} subtitle="AI-converted insights into money moves" />
            <SmartActionOrchestrator />

            <RecommendationCard />

            {!isSimple && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ScenarioSimulator />
                  <WhatIfSimulator />
                </div>
                <KYCStatusCard />
                <NBAInsights />
                <FinancialWeather />
                <StressTestSimulator />
                <TransactionComparison />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <NetWorthCard />
                  <GoalTracker asWidget />
                </div>
                <WealthDNA />
                <WealthBenchmark />
                <AIDecisionLog />
                <ComplianceBadges />
              </>
            )}
          </div>

          {/* Right Rail */}
          <div className="space-y-5">
            <SectionHeader icon="fa-shield-halved" title={t('securityOffers')} subtitle={t('protectionRewards')} />
            <SecurityHealthWidget />
            <MarketIntelligenceHero />
            <PredictiveShieldBadge />

            {!isSimple && (
              <>
                <AccountAggregatorWidget />
                <AccountAggregatorFull />
                <PSBSchemesCard />
                <RewardsDashboardCard />
                <AdaptiveInsight />
                <MonthlyNarrative />
                <InvestmentQuiz />
                <DeviceStatusCard />
              </>
            )}

            <CosmosCard
              variant="default"
              header={{ icon: 'fa-headset', iconColor: '#0f766e', title: 'Customer Support' }}
            >
              <div className="space-y-2">
                <button onClick={() => alert('Calling 1800-123-4567...')} className="w-full py-2.5 bg-primary text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all">
                  <i className="fas fa-phone" /> {t('callTollFree')}
                </button>
                <button onClick={() => setView('wealth-twin')} className="w-full py-2.5 bg-primary-light text-primary rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-all">
                  <i className="fas fa-robot" /> {t('chatWithTwin')}
                </button>
              </div>
            </CosmosCard>
          </div>
        </div>

        {/* Comprehensive-only extras */}
        {!isSimple && (
          <>
            <SectionHeader icon="fa-flask" title={t('worldFirstInnovations')} subtitle="Features no bank has ever built" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: 'fa-heart-pulse', color: 'bg-rose-50 text-rose-500 dark:bg-rose-900/20', label: 'Neuro-Friction', desc: 'Biometric spending protection', view: 'innovation-lab', tab: 'neuro', badge: 'WORLD FIRST' },
                { icon: 'fa-dice', color: 'bg-blue-50 text-blue-500 dark:bg-blue-900/20', label: 'Monte Carlo', desc: '10,000 life scenarios', view: 'innovation-lab', tab: 'monte', badge: 'WORLD FIRST' },
                { icon: 'fa-shield-virus', color: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20', label: 'Collective Immune', desc: 'Community fraud defense', view: 'innovation-lab', tab: 'immune', badge: 'WORLD FIRST' },
                { icon: 'fa-robot', color: 'bg-violet-50 text-violet-500 dark:bg-violet-900/20', label: 'Auto Agent', desc: 'Your personal CFO 24/7', view: 'innovation-lab', tab: 'agent', badge: 'WORLD FIRST' },
                { icon: 'fa-vault', color: 'bg-amber-50 text-amber-500 dark:bg-amber-900/20', label: 'Sovereign Vault', desc: 'Zero-knowledge privacy', view: 'innovation-lab', tab: 'vault', badge: 'WORLD FIRST' },
                { icon: 'fa-arrow-right', color: 'bg-primary/10 text-primary', label: 'Explore All', desc: '10 world-first features', view: 'innovation-lab', tab: 'neuro', badge: '10 FEATURES' },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <CosmosCard variant="elevated" hover onClick={() => setView(card.view as any)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 ${card.color} rounded-xl flex items-center justify-center`}>
                        <i className={`fas ${card.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-gray-800 dark:text-white">{card.label}</h3>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-extrabold ${
                            card.badge === 'WORLD FIRST' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'
                          }`}>{card.badge}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{card.desc}</p>
                      </div>
                      <i className="fas fa-chevron-right text-gray-300 text-xs" />
                    </div>
                  </CosmosCard>
                </motion.div>
              ))}
            </div>

            <SectionHeader icon="fa-star" title={t('moreForYou')} subtitle="Tools & gamification" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CosmosCard variant="elevated" hover onClick={() => setShowSalaryModal(true)}>
                <div className="flex items-center gap-3 group">
                  <div className="w-11 h-11 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 transition-transform group-hover:scale-110">
                    <i className="fas fa-plus" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Add Salary</h3>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{salaryHistory.length > 0 ? `Last: ₹${salaryHistory[0].amount.toLocaleString()}` : 'Update monthly income'}</p>
                  </div>
                </div>
              </CosmosCard>

              <DemoCreditCard />

              <CosmosCard variant="elevated" hover onClick={() => setView('fantasy-league')}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-violet-50 dark:bg-violet-900/30 rounded-xl flex items-center justify-center text-violet-500">
                    <i className="fas fa-trophy" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-gray-800 dark:text-white">Fantasy League</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ranked #12 this week</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 bg-violet-500 text-white rounded-lg font-bold">Play</span>
                </div>
              </CosmosCard>
            </div>

            <FinancialLiteracyCards />
          </>
        )}

        <AddSalaryModal show={showSalaryModal} onClose={() => setShowSalaryModal(false)} />

        {/* Floating Read Summary Button */}
        {isSpeechSupported() && (
          <button
            onClick={handleReadSummary}
            className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-xl transition-all duration-300 ${
              speakingSummary
                ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse'
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
            title={speakingSummary ? 'Stop reading' : 'Read summary aloud'}
          >
            <i className={`fas ${speakingSummary ? 'fa-stop' : 'fa-volume-high'} text-sm`} />
            <span className="text-xs font-bold">{speakingSummary ? 'Stop' : 'Read Summary'}</span>
          </button>
        )}
      </div>
    </QuickActions>
  );
}

function StatCardV2({
  label, value, icon, color, text, speakText, inrValue, trend, trendUp,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  text: string;
  speakText?: string;
  inrValue?: number;
  trend?: string;
  trendUp?: boolean;
}) {
  const { speak, stopSpeaking } = useVoiceNarration();
  const nriMode = useWealthStore((s) => s.nriMode);
  const exchangeRates = useWealthStore((s) => s.exchangeRates);
  const usdEquivalent = inrValue ? Math.round(inrValue * (exchangeRates['USD'] || 0.012)).toLocaleString() : null;

  return (
    <div
      className="card-stat cursor-default group relative overflow-hidden"
      onMouseEnter={() => speakText && speak(speakText)}
      onMouseLeave={stopSpeaking}
      tabIndex={0}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</span>
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
            <i className={`fas ${icon} text-sm ${text}`} />
          </div>
        </div>
        <p className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">{value}</p>

        {trend && (
          <div className="flex items-center gap-1 mt-1.5">
            <i className={`fas fa-arrow-${trendUp ? 'up' : 'down'} text-[9px] ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`} />
            <span className={`text-[10px] font-semibold ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>{trend}</span>
          </div>
        )}

        {nriMode && usdEquivalent && (
          <p className="text-[10px] text-primary mt-1 font-medium">≈ ${usdEquivalent} USD</p>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <i className={`fas ${icon} text-primary text-sm`} />
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

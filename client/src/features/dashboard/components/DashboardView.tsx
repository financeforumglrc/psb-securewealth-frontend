import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useRewards } from '@/shared/context/RewardsContext';
import { getStreak } from '@/shared/services/streakService';

import { formatCurrencyMask, formatCroreMask } from '@/shared/utils/duressMask';
import CosmosCard from '@/shared/components/ui/CosmosCard';
import ChartWidget from '@/shared/components/ui/ChartWidget';
import VirtualCard from '@/shared/components/ui/VirtualCard';
import DashboardWidget from './DashboardWidget';
import { SkeletonDashboard } from '@/shared/components/Skeleton';

import WealthTwinHero from '@/features/dashboard/components/WealthTwinHero';
import DashboardHero from '@/features/dashboard/components/DashboardHero';
import FinancialPulse from '@/features/dashboard/components/FinancialPulse';
import FinancialTwinAvatar from '@/features/ai/components/FinancialTwinAvatar';
import QuickActions from '@/features/dashboard/components/QuickActions';
import QuickPayCard from '@/features/psb/components/QuickPayCard';
import RecentTransactionsTable from '@/features/psb/components/RecentTransactionsTable';
import SecurityHealthWidget from '@/features/psb/components/SecurityHealthWidget';
import MarketIntelligenceHero from '@/features/dashboard/components/MarketIntelligenceHero';
import GoalTracker from '@/features/goals/components/GoalTracker';
import ComplianceBar from '@/features/compliance/components/ComplianceBar';
import SmartActionOrchestrator from '@/features/ai/components/SmartActionOrchestrator';
import RecommendationCard from '@/features/ai/components/RecommendationCard';
import AgenticActionCard from '@/features/ai/components/AgenticActionCard';
import MacroSignalTower from '@/features/market/components/MacroSignalTower';

// Advanced insights (comprehensive mode)
import ScenarioSimulator from '@/features/forecast/components/ScenarioSimulator';
import WhatIfSimulator from '@/features/forecast/components/WhatIfSimulator';
import WealthDNA from '@/features/dashboard/components/WealthDNA';
import AIDecisionLog from '@/features/ai/components/AIDecisionLog';
import FinancialLiteracyCards from '@/features/ai/components/FinancialLiteracyCards';

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
  const { cashbackBalance } = useRewards();
  const streak = getStreak();
  const kycVerified = useWealthStore((s) => s.kycVerified);
  const isLoading = useWealthStore((s) => s.isLoading);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  }, [t]);

  const [showAdvanced, setShowAdvanced] = useState(() => dashboardDensity !== 'simple');
  const [agenticActions, setAgenticActions] = useState([
    {
      actionId: 'agent-001',
      actionType: 'sweep' as const,
      description: 'Move ₹40,000 from Savings Account (4.0%) to Sweep FD (7.2%) and earn ₹1,280 extra interest per year.',
      potentialGain: '₹1,280 / year',
      riskLevel: 'low' as const,
    },
    {
      actionId: 'agent-002',
      actionType: 'sip_start' as const,
      description: 'Top-up your Nifty Index SIP by ₹5,000/month based on your rising monthly savings trend.',
      potentialGain: '₹2.4L in 10 yrs',
      riskLevel: 'medium' as const,
    },
  ]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <SkeletonDashboard />
      </div>
    );
  }

  const rawNetWorth = assets.reduce((sum, a) => sum + a.value, 0);
  const healthScore = coercedMode
    ? 15
    : user.monthlyIncome > 0
      ? Math.min(Math.round((user.monthlySavings / user.monthlyIncome) * 200 + 40), 100)
      : 0;
  const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount).length;
  const savingsRate = user.monthlyIncome > 0 ? ((user.monthlySavings / user.monthlyIncome) * 100).toFixed(1) : '0';
  const netWorthChangePct = rawNetWorth > 0 ? ((user.monthlySavings / rawNetWorth) * 100).toFixed(1) : '0.0';
  const isCashbackPositive = cashbackBalance > 0;
  const isStreakHot = streak.days > 5;
  const isHealthGood = healthScore > 70;

  const statCards = [
    {
      label: t('netWorth'),
      value: coercedMode ? '₹5,000' : formatCroreMask(rawNetWorth, duressModeActive),
      icon: 'fa-wallet',
      color: 'from-primary/20 to-primary/5',
      text: 'text-primary',
      trend: `+${netWorthChangePct}%`,
      trendIcon: 'fa-arrow-up',
      trendColorClass: 'text-emerald-500',
      trendPeriod: t('vsLastMonth'),
    },
    {
      label: t('monthlySavings'),
      value: coercedMode ? '₹500' : formatCurrencyMask(user.monthlySavings, duressModeActive),
      icon: 'fa-piggy-bank',
      color: 'from-emerald-500/20 to-emerald-500/5',
      text: 'text-emerald-600',
      trend: `+${savingsRate}%`,
      trendIcon: 'fa-arrow-up',
      trendColorClass: 'text-emerald-500',
      trendPeriod: t('ofIncome'),
    },
    {
      label: t('healthScore'),
      value: `${healthScore}/100`,
      icon: 'fa-heart-pulse',
      color: 'from-amber-500/20 to-amber-500/5',
      text: 'text-amber-600',
      trend: isHealthGood ? t('healthGood') : t('needsWork'),
      trendIcon: isHealthGood ? 'fa-check' : 'fa-triangle-exclamation',
      trendColorClass: isHealthGood ? 'text-emerald-500' : 'text-amber-500',
    },
    {
      label: t('cashback'),
      value: formatCurrencyMask(cashbackBalance, duressModeActive),
      icon: 'fa-gift',
      color: 'from-pink-500/20 to-pink-500/5',
      text: 'text-pink-500',
      trend: isCashbackPositive ? t('available') : t('noCashbackYet'),
      trendIcon: isCashbackPositive ? 'fa-arrow-up' : 'fa-minus',
      trendColorClass: isCashbackPositive ? 'text-emerald-500' : 'text-slate-400',
    },
    {
      label: t('streak'),
      value: `${streak.days} days`,
      icon: 'fa-fire',
      color: 'from-orange-500/20 to-orange-500/5',
      text: 'text-orange-500',
      trend: isStreakHot ? t('onFire') : t('keepGoing'),
      trendIcon: 'fa-fire',
      trendColorClass: 'text-amber-500',
    },
  ];

  const isSimple = dashboardDensity === 'simple';

  const removeAction = (id: string) => setAgenticActions((prev) => prev.filter((a) => a.actionId !== id));

  const openPaymentHub = () => {
    window.dispatchEvent(new CustomEvent('sw-open-payment-hub'));
  };

  return (
    <QuickActions>
      <div className="space-y-5 max-w-7xl mx-auto">
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

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-psb-muted dark:text-slate-400 font-medium">{greeting}</p>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{user.name || t('welcome')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white dark:bg-slate-900 border border-psb-border dark:border-slate-700 rounded-xl p-1" role="group" aria-label="Language">
              <button
                onClick={() => setLanguage('en')}
                aria-pressed={language === 'en'}
                aria-label="English"
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${language === 'en' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >EN</button>
              <button
                onClick={() => setLanguage('hi')}
                aria-pressed={language === 'hi'}
                aria-label="Hindi"
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${language === 'hi' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >हिं</button>
            </div>
            <div className="flex items-center bg-white dark:bg-slate-900 border border-psb-border dark:border-slate-700 rounded-xl p-1" role="group" aria-label="Dashboard density">
              <button
                onClick={() => setDashboardDensity('simple')}
                aria-pressed={isSimple}
                aria-label={t('simpleMode')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${isSimple ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >{t('simpleMode')}</button>
              <button
                onClick={() => setDashboardDensity('comprehensive')}
                aria-pressed={!isSimple}
                aria-label={t('comprehensiveMode')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${!isSimple ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >{t('comprehensiveMode')}</button>
            </div>
          </div>
        </div>

        <ComplianceBar />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}>
              <StatCardV2 {...card} />
            </motion.div>
          ))}
        </div>

        {/* Contextual Quick Actions */}
        <QuickActionBar
          kycVerified={kycVerified}
          onKyc={() => setView('profile')}
          onPay={() => setView('payments')}
          onGoal={() => setView('goals')}
          onPortfolio={() => setView('portfolio')}
        />

        {/* Hero */}
        <DashboardHero />
        <WealthTwinHero />
        <FinancialPulse />

        {/* Financial Twin Avatar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FinancialTwinAvatar />
        </div>

        {/* Quick actions */}
        <SectionHeader icon="fa-bolt" title={t('quickActions')} subtitle={t('frequentTasks')} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2"><QuickPayCard onExpand={openPaymentHub} /></div>
          <VirtualCard />
        </div>

        {/* Agentic AI Actions */}
        {agenticActions.length > 0 && (
          <div className="space-y-3">
            <SectionHeader icon="fa-robot" title="AI Autonomous Actions Pending Approval" subtitle="1-tap execution drafted by Wealth Twin" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agenticActions.map((action) => (
                <AgenticActionCard
                  key={action.actionId}
                  {...action}
                  onApprove={() => removeAction(action.actionId)}
                  onDismiss={() => removeAction(action.actionId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <DashboardWidget title="Wealth Overview" subtitle="Net worth & allocation" icon="fa-chart-line" action={{ label: 'Details', onClick: () => setView('wealth-twin') }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CosmosCard variant="default" padding="none"><ChartWidget type="area" /></CosmosCard>
                <CosmosCard variant="default" padding="none"><ChartWidget type="pie" /></CosmosCard>
              </div>
            </DashboardWidget>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <DashboardWidget title="Recent Activity" subtitle="Last 5 transactions" icon="fa-list" action={{ label: 'All', onClick: () => setView('transactions') }}>
                <RecentTransactionsTable />
              </DashboardWidget>
              <DashboardWidget title="Goals" subtitle={`${activeGoals} active goal${activeGoals === 1 ? '' : 's'}`} icon="fa-bullseye" action={{ label: 'Manage', onClick: () => setView('goals') }}>
                <GoalTracker asWidget />
              </DashboardWidget>
            </div>

            <DashboardWidget title="Smart Actions" subtitle="AI-converted insights" icon="fa-wand-magic-sparkles">
              <SmartActionOrchestrator />
            </DashboardWidget>

            <RecommendationCard />
          </div>

          <div className="space-y-5">
            <DashboardWidget title="Protection Status" subtitle="Live security health" icon="fa-shield-halved" action={{ label: 'Shield', onClick: () => setView('security-beast') }}>
              <SecurityHealthWidget />
            </DashboardWidget>

            <DashboardWidget title="Market Pulse" subtitle="Indices & movers" icon="fa-globe" action={{ label: 'Market', onClick: () => setView('market') }}>
              <MarketIntelligenceHero />
            </DashboardWidget>

            <DashboardWidget title="Macro Signal Tower" subtitle="Global indicators → auto actions" icon="fa-tower-broadcast" action={{ label: 'Wealth Twin', onClick: () => setView('wealth-twin') }}>
              <MacroSignalTower compact />
            </DashboardWidget>

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

        {/* Advanced insights (expandable) */}
        {!isSimple && (
          <div className="space-y-5">
            <button
              onClick={() => setShowAdvanced((s) => !s)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2"><i className="fas fa-layer-group text-primary" /> Advanced Insights</span>
              <i className={`fas fa-chevron-down transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            {showAdvanced && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ScenarioSimulator />
                  <WhatIfSimulator />
                </div>
                <WealthDNA />
                <AIDecisionLog />
                <FinancialLiteracyCards />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </QuickActions>
  );
}

function StatCardV2({
  label, value, icon, color, text, trend, trendUp, trendIcon, trendColorClass, trendPeriod,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  text: string;
  trend?: string;
  trendUp?: boolean;
  trendIcon?: string;
  trendColorClass?: string;
  trendPeriod?: string;
}) {
  const iconClass = trendIcon ?? `fa-arrow-${trendUp ? 'up' : 'down'}`;
  const colorClass = trendColorClass ?? (trendUp ? 'text-emerald-500' : 'text-rose-500');
  return (
    <div className="card-stat group relative overflow-hidden">
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
            <i className={`fas ${iconClass} text-[9px] ${colorClass}`} />
            <span className={`text-[10px] font-semibold ${colorClass}`}>{trend}</span>
            {trendPeriod && <span className="text-[9px] text-slate-400 dark:text-slate-500">{trendPeriod}</span>}
          </div>
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

function QuickActionBar({
  kycVerified,
  onKyc,
  onPay,
  onGoal,
  onPortfolio,
}: {
  kycVerified: boolean;
  onKyc: () => void;
  onPay: () => void;
  onGoal: () => void;
  onPortfolio: () => void;
}) {
  const { t } = useTranslation();
  const actions = [
    ...(!kycVerified ? [{ label: t('completeKyc'), icon: 'fa-id-card', onClick: onKyc, variant: 'amber' as const }] : []),
    { label: t('sendMoney'), icon: 'fa-paper-plane', onClick: onPay, variant: 'primary' as const },
    { label: t('addGoal'), icon: 'fa-bullseye', onClick: onGoal, variant: 'neutral' as const },
    { label: t('viewPortfolio'), icon: 'fa-layer-group', onClick: onPortfolio, variant: 'neutral' as const },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((a) => {
        const base = 'flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';
        const styles = {
          primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm shadow-primary/20',
          amber: 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300',
          neutral: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700',
        };
        return (
          <button key={a.label} onClick={a.onClick} className={`${base} ${styles[a.variant]}`}>
            <i className={`fas ${a.icon}`} /> {a.label}
          </button>
        );
      })}
    </div>
  );
}

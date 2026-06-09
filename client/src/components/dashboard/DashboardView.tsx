import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';

import { useRewards } from '../../context/RewardsContext';
import { getStreak } from '../../services/streakService';
import { getSalaryHistory } from '../salary/AddSalaryModal';
import { useVoiceNarration, numberToWords } from '../../hooks/useVoiceNarration';
import { speak, cancelSpeech, isSpeechSupported } from '../../services/voiceService';
import { useLivePrices } from '../../hooks/useLivePrices';
import CosmosCard from '../ui/CosmosCard';
import WelcomeBanner from '../psb/WelcomeBanner';
import FinancialPulse from './FinancialPulse';
import NetWorthCard from './NetWorthCard';
import KYCStatusCard from './KYCStatusCard';
import FinancialWeather from './FinancialWeather';
import NBAInsights from './NBAInsights';
import MonthlyNarrative from './MonthlyNarrative';
import AdaptiveInsight from './AdaptiveInsight';
import InvestmentQuiz from '../quiz/InvestmentQuiz';
import DeviceStatusCard from './DeviceStatusCard';

import QuickActions from './QuickActions';
import ChartWidget from '../ui/ChartWidget';
import VirtualCard from '../ui/VirtualCard';
import RecentTransactionsTable from '../psb/RecentTransactionsTable';
import SecurityHealthWidget from '../psb/SecurityHealthWidget';
import PSBSchemesCard from '../psb/PSBSchemesCard';
import RewardsDashboardCard from '../payments/RewardsDashboardCard';
import AccountAggregatorWidget from '../assets/AccountAggregatorWidget';
import AccountAggregatorFull from '../aa/AccountAggregatorFull';
import RecommendationCard from '../ai/RecommendationCard';
import WealthDNA from './WealthDNA';
import WealthBenchmark from './WealthBenchmark';
import AIDecisionLog from '../ai/AIDecisionLog';
import ComplianceBadges from '../compliance/ComplianceBadges';
import FinancialLiteracyCards from '../ai/FinancialLiteracyCards';
import GoalTracker from '../goals/GoalTracker';
import AddSalaryModal from '../salary/AddSalaryModal';

import DemoCreditCard from '../credit/DemoCreditCard';
import TransactionComparison from '../transactions/TransactionComparison';
import ScenarioSimulator from '../forecast/ScenarioSimulator';
import WhatIfSimulator from '../forecast/WhatIfSimulator';
import StressTestSimulator from '../protection/StressTestSimulator';
import QuickPayCard from '../psb/QuickPayCard';

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD v2 — Real-Time Widget Grid
   Hero stats · Organized sections · CosmosCard containers
   ═══════════════════════════════════════════════════════════════ */

export default function DashboardView() {
  const user = useWealthStore((s) => s.user);
  const assets = useWealthStore((s) => s.assets);
  const goals = useWealthStore((s) => s.goals);
  const coercedMode = useWealthStore((s) => s.coercedMode);
  const setCoercedMode = useWealthStore((s) => s.setCoercedMode);
  const setView = useWealthStore((s) => s.setView);


  const netWorth = coercedMode ? 5000 : assets.reduce((sum, a) => sum + a.value, 0);
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

    // Auto-reset after a reasonable duration (speech synthesis doesn't give a reliable end event cross-browser)
    const durationMs = Math.max(3000, text.length * 80);
    const timeout = setTimeout(() => setSpeakingSummary(false), durationMs);

    // Also listen for manual cancel
    const onCancel = () => {
      clearTimeout(timeout);
      window.removeEventListener('sw-cancel-speech', onCancel);
    };
    window.addEventListener('sw-cancel-speech', onCancel);
  };



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

        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Live Financial Pulse */}
        <FinancialPulse />

        {/* Account Aggregator — Top Position */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AccountAggregatorWidget />
          <RecommendationCard />
        </div>
        <AccountAggregatorFull />

        {/* Market Ticker Bar */}
        <LiveMarketBar />

        {/* Hero Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Net Worth', value: coercedMode ? '₹5,000' : `₹${(netWorth / 1e7).toFixed(2)}Cr`, icon: 'fa-wallet', color: 'from-primary/20 to-primary/5', text: 'text-primary', speakText: `Net worth ${numberToWords(netWorth)} rupees`, inrValue: netWorth, trend: '+2.4%', trendUp: true },
            { label: 'Monthly Savings', value: coercedMode ? '₹500' : `₹${user.monthlySavings.toLocaleString()}`, icon: 'fa-piggy-bank', color: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-600', speakText: `Monthly savings ${numberToWords(user.monthlySavings)} rupees`, inrValue: user.monthlySavings, trend: '+12%', trendUp: true },
            { label: 'Health Score', value: `${healthScore}/100`, icon: 'fa-heart-pulse', color: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-600', speakText: `Health score ${healthScore} out of 100`, trend: healthScore > 70 ? 'Good' : 'Needs work', trendUp: healthScore > 70 },
            { label: 'Cashback', value: `₹${cashbackBalance.toFixed(0)}`, icon: 'fa-gift', color: 'from-pink-500/20 to-pink-500/5', text: 'text-pink-500', trend: 'Available', trendUp: true },
            { label: 'Streak', value: `${streak.days} days`, icon: 'fa-fire', color: 'from-orange-500/20 to-orange-500/5', text: 'text-orange-500', trend: streak.days > 5 ? 'On fire!' : 'Keep going', trendUp: streak.days > 5 },
          ].map((card, i) => (
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

        {/* Charts Section */}
        <SectionHeader icon="fa-chart-line" title="Financial Overview" subtitle="Track your wealth journey" />
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

        {/* Quick Actions */}
        <SectionHeader icon="fa-bolt" title="Quick Actions" subtitle="Frequent tasks, one tap away" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <QuickPayCard onExpand={openPaymentHub} />
          </div>
          <VirtualCard />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left + Center Column */}
          <div className="lg:col-span-2 space-y-5">
            <SectionHeader icon="fa-layer-group" title="Insights & Analytics" subtitle="AI-powered intelligence" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <RecentTransactionsTable />
              <ScenarioSimulator />
            </div>

            <KYCStatusCard />
            <NBAInsights />
            <FinancialWeather />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <WhatIfSimulator />
              <StressTestSimulator />
            </div>

            <TransactionComparison />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <NetWorthCard />
              <GoalTracker asWidget />
            </div>

            <WealthDNA />
            <WealthBenchmark />

            <AIDecisionLog />
            <ComplianceBadges />
          </div>

          {/* Right Rail */}
          <div className="space-y-5">
            <SectionHeader icon="fa-shield-halved" title="Security & Offers" subtitle="Protection & rewards" />
            <SecurityHealthWidget />
            <PSBSchemesCard />
            <RewardsDashboardCard />

            <CosmosCard
              variant="default"
              header={{ icon: 'fa-headset', iconColor: '#0f766e', title: 'Customer Support' }}
            >
              <div className="space-y-2">
                <button onClick={() => alert('Calling 1800-123-4567...')} className="w-full py-2.5 bg-primary text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all">
                  <i className="fas fa-phone" /> Call Toll Free
                </button>
                <button onClick={() => setView('wealth-twin')} className="w-full py-2.5 bg-primary-light text-primary rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-all">
                  <i className="fas fa-robot" /> Chat with AI Twin
                </button>
              </div>
            </CosmosCard>

            <AdaptiveInsight />
            <MonthlyNarrative />
            <InvestmentQuiz />
            <DeviceStatusCard />
          </div>
        </div>

        {/* World-First Innovations */}
        <SectionHeader icon="fa-flask" title="World-First Innovations" subtitle="Features no bank has ever built" />
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

        {/* Bottom Section */}
        <SectionHeader icon="fa-star" title="More for You" subtitle="Tools & gamification" />
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

/* ═══════════════════════════════════════════════════════════════
   STAT CARD v2 — Glow, gradient, trend indicator
   ═══════════════════════════════════════════════════════════════ */

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
      {/* Subtle gradient background */}
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

/* ═══════════════════════════════════════════════════════════════
   LIVE MARKET BAR — Real-time NSE / BSE / Gold / FX
   ═══════════════════════════════════════════════════════════════ */

function LiveMarketBar() {
  const { nifty, sensex, gold, usdInr, loading, error } = useLivePrices();
  const markets = [
    { label: 'NIFTY 50', value: nifty.value.toLocaleString('en-IN', { maximumFractionDigits: 2 }), change: nifty.percentChange },
    { label: 'SENSEX', value: sensex.value.toLocaleString('en-IN', { maximumFractionDigits: 2 }), change: sensex.percentChange },
    { label: 'Gold', value: `₹${gold.value.toLocaleString('en-IN')}`, change: gold.percentChange },
    { label: 'USD/INR', value: `₹${usdInr.value.toFixed(2)}`, change: usdInr.percentChange },
  ];

  return (
    <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800/80 border border-slate-700/50 overflow-x-auto">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">Markets</span>
      {markets.map((m) => (
        <div key={m.label} className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] text-slate-500">{m.label}</span>
          <span className="text-[11px] font-bold text-white">{m.value}</span>
          <span className={`text-[10px] font-semibold ${m.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            <i className={`fas fa-caret-${m.change >= 0 ? 'up' : 'down'} mr-0.5`} />
            {Math.abs(m.change).toFixed(2)}%
          </span>
        </div>
      ))}
      <div className="flex-1" />
      {loading ? (
        <span className="text-[9px] text-slate-600 flex-shrink-0 animate-pulse">Fetching…</span>
      ) : error ? (
        <span className="text-[9px] text-amber-500 flex-shrink-0" title={error}>Live <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block ml-1 animate-pulse" /></span>
      ) : (
        <span className="text-[9px] text-slate-600 flex-shrink-0">Live <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block ml-1 animate-pulse" /></span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION HEADER — Organized dashboard grouping
   ═══════════════════════════════════════════════════════════════ */

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
      <div className="h-px flex-1 ml-4 bg-gradient-to-r from-slate-200 dark:from-slate-700 to-transparent" />
    </div>
  );
}

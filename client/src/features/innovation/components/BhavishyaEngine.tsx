import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/shared/hooks/useTranslation';
import FinancialDNAHelix from '@/features/innovation/components/FinancialDNAHelix';
import LifeEventPredictor from '@/features/innovation/components/LifeEventPredictor';
import FutureSelfSimulator from '@/features/innovation/components/FutureSelfSimulator';
import PreparednessScore from '@/features/innovation/components/PreparednessScore';
import AutoInstrumentGenerator from '@/features/innovation/components/AutoInstrumentGenerator';
import CrisisPredictor from '@/features/innovation/components/CrisisPredictor';
import LifeShockSimulator from '@/features/innovation/components/LifeShockSimulator';
import MarketIntelligence from '@/features/innovation/components/MarketIntelligence';
import EmotionalResonance from '@/features/innovation/components/EmotionalResonance';
import GenerationalWealth from '@/features/innovation/components/GenerationalWealth';
import DigitalInheritance from '@/features/innovation/components/DigitalInheritance';
import CommunityDNA from '@/features/innovation/components/CommunityDNA';
import AIFutureTwin from '@/features/innovation/components/AIFutureTwin';
import AIInsightsAggregator from '@/features/innovation/components/AIInsightsAggregator';
import ParticleConstellation from '@/features/innovation/components/ParticleConstellation';
import ChakraBalance from '@/features/innovation/components/ChakraBalance';
import FestivalAwareEngine from '@/features/innovation/components/FestivalAwareEngine';
import WealthWeather from '@/features/innovation/components/WealthWeather';
import NeuralNetworkViz from '@/features/innovation/components/NeuralNetworkViz';
import TimeMachine from '@/features/innovation/components/TimeMachine';
import QuantumLock from '@/features/innovation/components/QuantumLock';
import DreamVisualizer from '@/features/innovation/components/DreamVisualizer';
import EmotionalHeatmap from '@/features/innovation/components/EmotionalHeatmap';
import TemporalWealth from '@/features/innovation/components/TemporalWealth';
import ProsperityScore from '@/features/innovation/components/ProsperityScore';

type TabId = 'overview' | 'dna' | 'predict' | 'future' | 'ready' | 'auto' | 'crisis' | 'lifeShock' | 'market' | 'emotion' | 'generational' | 'inheritance' | 'community' | 'twin' | 'chakra' | 'festival' | 'weather' | 'neural' | 'timemachine' | 'quantum' | 'dreams' | 'heatmap' | 'temporal' | 'prosperity';

const TAB_LABEL_KEYS: Record<TabId, string> = {
  overview: 'tabCommandCenter',
  dna: 'tabFinancialDNA',
  predict: 'tabLifeEvents',
  future: 'tabFutureSelf',
  ready: 'tabPreparedness',
  auto: 'tabAutoBanking',
  crisis: 'tabCrisisShield',
  lifeShock: 'tabLifeShock',
  market: 'tabMarketAI',
  emotion: 'tabEmotions',
  generational: 'tabGenerations',
  inheritance: 'tabInheritance',
  community: 'tabCommunity',
  twin: 'tabFutureTwin',
  chakra: 'tabChakraBalance',
  festival: 'tabFestivalAI',
  weather: 'tabWealthWeather',
  neural: 'tabNeuralCore',
  timemachine: 'tabTimeMachine',
  temporal: 'tabTemporalWealth',
  quantum: 'tabQuantumVault',
  dreams: 'tabDreamVisualizer',
  heatmap: 'tabEmotionHeatmap',
  prosperity: 'tabProsperity',
};

const TABS: { id: TabId; icon: string; desc: string; badge?: string; alert?: boolean }[] = [
  { id: 'overview', icon: 'fa-infinity', desc: 'BHAVISHYA overview', alert: true },
  { id: 'dna', icon: 'fa-dna', desc: 'Your unique genome', badge: '12 Traits' },
  { id: 'predict', icon: 'fa-crystal-ball', desc: 'Predict what comes next' },
  { id: 'future', icon: 'fa-user-clock', desc: 'See your future self' },
  { id: 'ready', icon: 'fa-shield-halved', desc: 'Life readiness score' },
  { id: 'auto', icon: 'fa-robot', desc: 'AI-created instruments' },
  { id: 'crisis', icon: 'fa-tower-broadcast', desc: 'Predict & auto-hedge', badge: '6 Signals' },
  { id: 'lifeShock', icon: 'fa-bolt', desc: 'Real-life crisis simulator', badge: 'NEW' },
  { id: 'market', icon: 'fa-chart-line', desc: 'Predictive timing', badge: '47 Signals' },
  { id: 'emotion', icon: 'fa-brain', desc: 'Money-psyche mapping' },
  { id: 'generational', icon: 'fa-people-roof', desc: '3-gen wealth projection' },
  { id: 'inheritance', icon: 'fa-vault', desc: 'Digital legacy vault' },
  { id: 'community', icon: 'fa-users', desc: '2.4M peer intelligence' },
  { id: 'twin', icon: 'fa-comments', desc: 'Chat with your future' },
  { id: 'chakra', icon: 'fa-om', desc: 'Sapta-chakra finance', badge: 'India First' },
  { id: 'festival', icon: 'fa-om', desc: 'Festival-aware planning', badge: 'Bharat' },
  { id: 'weather', icon: 'fa-cloud-sun', desc: 'Financial climate forecast' },
  { id: 'neural', icon: 'fa-brain', desc: 'Watch AI think in real-time' },
  { id: 'timemachine', icon: 'fa-clock-rotate-left', desc: 'Travel your financial future' },
  { id: 'temporal', icon: 'fa-hourglass-half', desc: 'Time-machine wealth projection', badge: 'NEW' },
  { id: 'quantum', icon: 'fa-atom', desc: 'Post-quantum encryption' },
  { id: 'dreams', icon: 'fa-cloud-moon', desc: 'AI dreams of your future' },
  { id: 'heatmap', icon: 'fa-fire', desc: '365-day mood & spend map' },
  { id: 'prosperity', icon: 'fa-gem', desc: 'Holistic wellness score', badge: 'NEW' },
];

const PRIMARY_TAB_IDS: TabId[] = ['overview', 'dna', 'predict', 'future', 'ready', 'auto', 'crisis', 'lifeShock', 'market', 'emotion', 'generational'];

function OverviewTab({ onTabChange }: { onTabChange: (tab: TabId) => void }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      {/* AI Intelligence Feed - Priority */}
      <AIInsightsAggregator />

      {/* Hero Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { labelKey: 'overviewStatSignalsAnalyzed', value: '174', icon: 'fa-wave-square', color: 'bg-blue-50 text-blue-600', subKey: 'overviewStatSignalsAnalyzedSub' },
          { labelKey: 'overviewStatPredictionAccuracy', value: '94.2%', icon: 'fa-bullseye', color: 'bg-green-50 text-green-600', subKey: 'overviewStatPredictionAccuracySub' },
          { labelKey: 'overviewStatWealthProtected', value: '₹42L', icon: 'fa-shield-halved', color: 'bg-violet-50 text-violet-600', subKey: 'overviewStatWealthProtectedSub' },
          { labelKey: 'overviewStatAiInstruments', value: '5', icon: 'fa-robot', color: 'bg-amber-50 text-amber-600', subKey: 'overviewStatAiInstrumentsSub' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.labelKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="card-psb"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <i className={`fas ${stat.icon}`} aria-hidden="true" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-gray-900">{stat.value}</p>
                <p className="text-[10px] text-gray-500 font-medium">{t(stat.labelKey)}</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">{t(stat.subKey)}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { titleKey: 'overviewCardFinancialDnaTitle', descKey: 'overviewCardFinancialDnaDesc', icon: 'fa-dna', color: 'from-primary/10 to-green-50', tab: 'dna' as TabId },
          { titleKey: 'overviewCardCrisisShieldTitle', descKey: 'overviewCardCrisisShieldDesc', icon: 'fa-tower-broadcast', color: 'from-rose-50 to-orange-50', tab: 'crisis' as TabId, alert: true },
          { titleKey: 'overviewCardLifeShockTitle', descKey: 'overviewCardLifeShockDesc', icon: 'fa-bolt', color: 'from-amber-50 to-yellow-50', tab: 'lifeShock' as TabId, badge: 'NEW' },
          { titleKey: 'overviewCardFutureTwinTitle', descKey: 'overviewCardFutureTwinDesc', icon: 'fa-comments', color: 'from-violet-50 to-purple-50', tab: 'twin' as TabId },
          { titleKey: 'overviewCardMarketAiTitle', descKey: 'overviewCardMarketAiDesc', icon: 'fa-chart-line', color: 'from-blue-50 to-cyan-50', tab: 'market' as TabId, alert: true },
          { titleKey: 'overviewCardEmotionEngineTitle', descKey: 'overviewCardEmotionEngineDesc', icon: 'fa-brain', color: 'from-pink-50 to-rose-50', tab: 'emotion' as TabId },
          { titleKey: 'overviewCardGenerationalWealthTitle', descKey: 'overviewCardGenerationalWealthDesc', icon: 'fa-people-roof', color: 'from-amber-50 to-yellow-50', tab: 'generational' as TabId },
        ].map((card, idx) => (
          <motion.div
            key={card.titleKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            role="button"
            tabIndex={0}
            aria-label={t(card.titleKey)}
            onClick={() => onTabChange(card.tab)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTabChange(card.tab); } }}
            className={`relative p-4 rounded-xl border border-gray-100 bg-gradient-to-br ${card.color} hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
          >
            {card.alert && (
              <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <i className={`fas ${card.icon} text-gray-700`} aria-hidden="true" />
              </div>
              <i className="fas fa-arrow-right text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" aria-hidden="true" />
            </div>
            <h4 className="text-sm font-bold text-gray-800 mb-0.5">{t(card.titleKey)}</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed">{t(card.descKey)}</p>
          </motion.div>
        ))}
      </div>

      {/* Live Status Board */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <i className="fas fa-satellite-dish text-primary" aria-hidden="true" /> {t('overviewStatusBoardTitle')}
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { labelKey: 'overviewStatusLifeEventsLabel', valueKey: 'overviewStatusLifeEventsValue', status: 'active', detailKey: 'overviewStatusLifeEventsDetail' },
            { labelKey: 'overviewStatusCrisisSignalsLabel', valueKey: 'overviewStatusCrisisSignalsValue', status: 'warning', detailKey: 'overviewStatusCrisisSignalsDetail' },
            { labelKey: 'overviewStatusAutoHedgesLabel', valueKey: 'overviewStatusAutoHedgesValue', status: 'good', detailKey: 'overviewStatusAutoHedgesDetail' },
            { labelKey: 'overviewStatusMarketTimingLabel', valueKey: 'overviewStatusMarketTimingValue', status: 'opportunity', detailKey: 'overviewStatusMarketTimingDetail' },
            { labelKey: 'overviewStatusEmotionalStateLabel', valueKey: 'overviewStatusEmotionalStateValue', status: 'good', detailKey: 'overviewStatusEmotionalStateDetail' },
            { labelKey: 'overviewStatusCommunityRankLabel', valueKey: 'overviewStatusCommunityRankValue', status: 'good', detailKey: 'overviewStatusCommunityRankDetail' },
            { labelKey: 'overviewStatusLegacyVaultLabel', valueKey: 'overviewStatusLegacyVaultValue', status: 'good', detailKey: 'overviewStatusLegacyVaultDetail' },
            { labelKey: 'overviewStatusFutureTwinLabel', valueKey: 'overviewStatusFutureTwinValue', status: 'active', detailKey: 'overviewStatusFutureTwinDetail' },
          ].map((item, idx) => (
            <motion.div
              key={item.labelKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.04 }}
              className={`p-2.5 rounded-lg border ${
                item.status === 'warning' ? 'border-amber-200 bg-amber-50/50' :
                item.status === 'opportunity' ? 'border-green-200 bg-green-50/50' :
                'border-gray-100 bg-gray-50/50'
              }`}
            >
              <p className="text-[10px] text-gray-400">{t(item.labelKey)}</p>
              <p className={`text-sm font-extrabold ${
                item.status === 'warning' ? 'text-amber-700' :
                item.status === 'opportunity' ? 'text-green-700' :
                'text-gray-900'
              }`}>{t(item.valueKey)}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{t(item.detailKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cross-Module Intelligence Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-primary/5 to-amber-50 rounded-xl border border-primary/10">
          <div className="flex items-center gap-2 mb-3">
            <i className="fas fa-wand-magic-sparkles text-amber-500" aria-hidden="true" />
            <h4 className="text-sm font-bold text-gray-800">{t('overviewAiActionsTitle')}</h4>
          </div>
          <div className="space-y-2">
            {[
              { actionKey: 'overviewActionMedicalBuffer', moduleKey: 'overviewActionMedicalBufferModule', timeKey: 'overviewActionMedicalBufferTime', status: 'done' },
              { actionKey: 'overviewActionGoldWindow', moduleKey: 'overviewActionGoldWindowModule', timeKey: 'overviewActionGoldWindowTime', status: 'pending' },
              { actionKey: 'overviewActionBlockedAds', moduleKey: 'overviewActionBlockedAdsModule', timeKey: 'overviewActionBlockedAdsTime', status: 'done' },
              { actionKey: 'overviewActionEducationSip', moduleKey: 'overviewActionEducationSipModule', timeKey: 'overviewActionEducationSipTime', status: 'pending' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px]">
                <i className={`fas fa-${item.status === 'done' ? 'check-circle text-green-500' : 'clock text-amber-500'}`} aria-hidden="true" />
                <span className="flex-1 text-gray-700">{t(item.actionKey)}</span>
                <span className="text-gray-400 text-[10px]">{t(item.moduleKey)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
          <div className="flex items-center gap-2 mb-3">
            <i className="fas fa-gem text-violet-500" aria-hidden="true" />
            <h4 className="text-sm font-bold text-gray-800">{t('overviewHindsightTitle')}</h4>
          </div>
          <p className="text-2xl font-extrabold text-violet-700 mb-1">{t('overviewHindsightTotal')}</p>
          <p className="text-[11px] text-gray-600 mb-3">{t('overviewHindsightDescription')}</p>
          <div className="space-y-1.5">
            {[
              { sourceKey: 'overviewHindsightPredictiveSip', amountKey: 'overviewHindsightPredictiveSipAmount' },
              { sourceKey: 'overviewHindsightCrisisHedge', amountKey: 'overviewHindsightCrisisHedgeAmount' },
              { sourceKey: 'overviewHindsightEmotionControl', amountKey: 'overviewHindsightEmotionControlAmount' },
              { sourceKey: 'overviewHindsightMarketEntry', amountKey: 'overviewHindsightMarketEntryAmount' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">{t(item.sourceKey)}</span>
                <span className="font-bold text-violet-600">{t(item.amountKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BhavishyaEngine() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showMore, setShowMore] = useState(false);

  const primaryTabs = TABS.filter((tab) => PRIMARY_TAB_IDS.includes(tab.id));
  const moreTabs = TABS.filter((tab) => !PRIMARY_TAB_IDS.includes(tab.id));
  const isMoreActive = moreTabs.some((tab) => tab.id === activeTab);

  const TabButton = ({ tab, inMore = false }: { tab: typeof TABS[number]; inMore?: boolean }) => {
    const isActive = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        role="tab"
        aria-selected={isActive}
        aria-controls={`bhavishya-panel-${tab.id}`}
        id={`bhavishya-tab-${tab.id}`}
        onClick={() => { setActiveTab(tab.id); if (inMore) setShowMore(true); }}
        className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
          isActive
            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
            : 'bg-white text-gray-600 border border-gray-100 hover:border-gray-200 hover:shadow-sm'
        }`}
      >
        <i className={`fas ${tab.icon} text-[10px]`} aria-hidden="true" />
        <span>{t(TAB_LABEL_KEYS[tab.id])}</span>
        {tab.badge && (
          <span className={`text-[10px] px-1 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
            {tab.badge}
          </span>
        )}
        {tab.alert && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" aria-label="Alert" />
        )}
      </button>
    );
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-gray-900 text-white p-6 lg:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <ParticleConstellation />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 shadow-lg" aria-label="BHAVISHYA">
              <i className="fas fa-infinity text-amber-400 text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight">BHAVISHYA</h1>
                <span className="px-2 py-0.5 bg-amber-400 text-primary-dark text-[10px] font-extrabold rounded-full uppercase tracking-wider">v3.0</span>
              </div>
              <p className="text-[11px] text-white/90 font-medium">
                {t('bhavishyaTagline')}
              </p>
            </div>
          </div>
          <p className="text-sm text-white/95 max-w-2xl leading-relaxed">
            {t('bhavishyaDescriptionPrefix')} <span className="text-amber-400 font-bold">174 {t('behavioralSignals')}</span> {t('bhavishyaDescriptionSuffix')}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {(t('bhavishyaTags').split(',') as string[]).map((tag) => (
              <span key={tag} className="px-2.5 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-[10px] font-semibold border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div
        className="sticky top-14 z-30 bg-psb-bg/90 dark:bg-slate-950/90 backdrop-blur-md py-2 -mx-4 px-4"
        role="tablist"
        aria-label={t('bhavishyaTitle')}
      >
        <div className="flex flex-wrap gap-1.5">
          {primaryTabs.map((tab) => <TabButton key={tab.id} tab={tab} />)}
          <button
            onClick={() => setShowMore((s) => !s)}
            aria-expanded={showMore || isMoreActive}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
              showMore || isMoreActive
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-white text-gray-600 border border-gray-100 hover:border-gray-200'
            }`}
          >
            <i className={`fas fa-chevron-down text-[10px] transition-transform ${showMore || isMoreActive ? 'rotate-180' : ''}`} aria-hidden="true" />
            <span>{t('moreEngines')}</span>
            {isMoreActive && <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" aria-label="Alert" />}
          </button>
        </div>
        {(showMore || isMoreActive) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700"
          >
            {moreTabs.map((tab) => <TabButton key={tab.id} tab={tab} inMore />)}
          </motion.div>
        )}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        id={`bhavishya-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`bhavishya-tab-${activeTab}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && <OverviewTab onTabChange={setActiveTab} />}
        {activeTab === 'dna' && <FinancialDNAHelix />}
        {activeTab === 'predict' && <LifeEventPredictor />}
        {activeTab === 'future' && <FutureSelfSimulator />}
        {activeTab === 'ready' && <PreparednessScore />}
        {activeTab === 'auto' && <AutoInstrumentGenerator />}
        {activeTab === 'crisis' && <CrisisPredictor />}
        {activeTab === 'lifeShock' && <LifeShockSimulator />}
        {activeTab === 'market' && <MarketIntelligence />}
        {activeTab === 'emotion' && <EmotionalResonance />}
        {activeTab === 'generational' && <GenerationalWealth />}
        {activeTab === 'inheritance' && <DigitalInheritance />}
        {activeTab === 'community' && <CommunityDNA />}
        {activeTab === 'twin' && <AIFutureTwin />}
        {activeTab === 'chakra' && <ChakraBalance />}
        {activeTab === 'festival' && <FestivalAwareEngine />}
        {activeTab === 'weather' && <WealthWeather />}
        {activeTab === 'neural' && <NeuralNetworkViz />}
        {activeTab === 'timemachine' && <TimeMachine />}
        {activeTab === 'temporal' && <TemporalWealth />}
        {activeTab === 'quantum' && <QuantumLock />}
        {activeTab === 'dreams' && <DreamVisualizer />}
        {activeTab === 'heatmap' && <EmotionalHeatmap />}
        {activeTab === 'prosperity' && <ProsperityScore />}
      </motion.div>

      {/* Footer Info */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-shield-halved text-primary text-sm" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-800">{t('privacyFirstFederatedAI')}</p>
            <p className="text-[10px] text-gray-600 leading-relaxed mt-0.5">
              {t('bhavishyaPrivacyDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

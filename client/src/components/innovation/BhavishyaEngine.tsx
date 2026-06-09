import { useState } from 'react';
import { motion } from 'framer-motion';
import FinancialDNAHelix from './FinancialDNAHelix';
import LifeEventPredictor from './LifeEventPredictor';
import FutureSelfSimulator from './FutureSelfSimulator';
import PreparednessScore from './PreparednessScore';
import AutoInstrumentGenerator from './AutoInstrumentGenerator';
import CrisisPredictor from './CrisisPredictor';
import MarketIntelligence from './MarketIntelligence';
import EmotionalResonance from './EmotionalResonance';
import GenerationalWealth from './GenerationalWealth';
import DigitalInheritance from './DigitalInheritance';
import CommunityDNA from './CommunityDNA';
import AIFutureTwin from './AIFutureTwin';
import AIInsightsAggregator from './AIInsightsAggregator';
import ParticleConstellation from './ParticleConstellation';
import ChakraBalance from './ChakraBalance';
import FestivalAwareEngine from './FestivalAwareEngine';
import WealthWeather from './WealthWeather';
import NeuralNetworkViz from './NeuralNetworkViz';
import TimeMachine from './TimeMachine';
import QuantumLock from './QuantumLock';
import DreamVisualizer from './DreamVisualizer';
import EmotionalHeatmap from './EmotionalHeatmap';
import TemporalWealth from './TemporalWealth';
import ProsperityScore from './ProsperityScore';

type TabId = 'overview' | 'dna' | 'predict' | 'future' | 'ready' | 'auto' | 'crisis' | 'market' | 'emotion' | 'generational' | 'inheritance' | 'community' | 'twin' | 'chakra' | 'festival' | 'weather' | 'neural' | 'timemachine' | 'quantum' | 'dreams' | 'heatmap' | 'temporal' | 'prosperity';

const TABS: { id: TabId; label: string; icon: string; desc: string; badge?: string; alert?: boolean }[] = [
  { id: 'overview', label: 'Command Center', icon: 'fa-infinity', desc: 'BHAVISHYA overview', alert: true },
  { id: 'dna', label: 'Financial DNA', icon: 'fa-dna', desc: 'Your unique genome', badge: '12 Traits' },
  { id: 'predict', label: 'Life Events', icon: 'fa-crystal-ball', desc: 'Predict what comes next' },
  { id: 'future', label: 'Future Self', icon: 'fa-user-clock', desc: 'See your future self' },
  { id: 'ready', label: 'Preparedness', icon: 'fa-shield-halved', desc: 'Life readiness score' },
  { id: 'auto', label: 'Auto-Banking', icon: 'fa-robot', desc: 'AI-created instruments' },
  { id: 'crisis', label: 'Crisis Shield', icon: 'fa-tower-broadcast', desc: 'Predict & auto-hedge', badge: '6 Signals' },
  { id: 'market', label: 'Market AI', icon: 'fa-chart-line', desc: 'Predictive timing', badge: '47 Signals' },
  { id: 'emotion', label: 'Emotions', icon: 'fa-brain', desc: 'Money-psyche mapping' },
  { id: 'generational', label: 'Generations', icon: 'fa-people-roof', desc: '3-gen wealth projection' },
  { id: 'inheritance', label: 'Inheritance', icon: 'fa-vault', desc: 'Digital legacy vault' },
  { id: 'community', label: 'Community', icon: 'fa-users', desc: '2.4M peer intelligence' },
  { id: 'twin', label: 'Future Twin', icon: 'fa-comments', desc: 'Chat with your future' },
  { id: 'chakra', label: 'Chakra Balance', icon: 'fa-om', desc: 'Sapta-chakra finance', badge: 'India First' },
  { id: 'festival', label: 'Festival AI', icon: 'fa-om', desc: 'Festival-aware planning', badge: 'Bharat' },
  { id: 'weather', label: 'Wealth Weather', icon: 'fa-cloud-sun', desc: 'Financial climate forecast' },
  { id: 'neural', label: 'Neural Core', icon: 'fa-brain', desc: 'Watch AI think in real-time' },
  { id: 'timemachine', label: 'Time Machine', icon: 'fa-clock-rotate-left', desc: 'Travel your financial future' },
  { id: 'temporal', label: 'Temporal Wealth', icon: 'fa-hourglass-half', desc: 'Time-machine wealth projection', badge: 'NEW' },
  { id: 'quantum', label: 'Quantum Vault', icon: 'fa-atom', desc: 'Post-quantum encryption' },
  { id: 'dreams', label: 'Dream Visualizer', icon: 'fa-cloud-moon', desc: 'AI dreams of your future' },
  { id: 'heatmap', label: 'Emotion Heatmap', icon: 'fa-fire', desc: '365-day mood & spend map' },
  { id: 'prosperity', label: 'Prosperity', icon: 'fa-gem', desc: 'Holistic wellness score', badge: 'NEW' },
];

function OverviewTab() {
  return (
    <div className="space-y-5">
      {/* AI Intelligence Feed - Priority */}
      <AIInsightsAggregator />

      {/* Hero Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Signals Analyzed', value: '174', icon: 'fa-wave-square', color: 'bg-blue-50 text-blue-600', sub: '+47 new this week' },
          { label: 'Prediction Accuracy', value: '94.2%', icon: 'fa-bullseye', color: 'bg-green-50 text-green-600', sub: '12-month historical' },
          { label: 'Wealth Protected', value: '₹42L', icon: 'fa-shield-halved', color: 'bg-violet-50 text-violet-600', sub: 'Auto-hedge active' },
          { label: 'AI Instruments', value: '5', icon: 'fa-robot', color: 'bg-amber-50 text-amber-600', sub: '2 auto-running' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="card-psb"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <i className={`fas ${stat.icon}`} />
              </div>
              <div>
                <p className="text-lg font-extrabold text-gray-900">{stat.value}</p>
                <p className="text-[10px] text-gray-500 font-medium">{stat.label}</p>
              </div>
            </div>
            <p className="text-[9px] text-gray-400 mt-2">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Financial DNA', desc: 'Your 12-trait behavioral genome + 6 biometric signatures', icon: 'fa-dna', color: 'from-primary/10 to-green-50', tab: 'dna' as TabId },
          { title: 'Crisis Shield', desc: '6 crisis signals monitored with real-time auto-hedge', icon: 'fa-tower-broadcast', color: 'from-rose-50 to-orange-50', tab: 'crisis' as TabId, alert: true },
          { title: 'Future Twin', desc: 'Chat with your 2035 self. 10 years of hindsight.', icon: 'fa-comments', color: 'from-violet-50 to-purple-50', tab: 'twin' as TabId },
          { title: 'Market AI', desc: '47 macro/micro signals for predictive entry/exit timing', icon: 'fa-chart-line', color: 'from-blue-50 to-cyan-50', tab: 'market' as TabId, alert: true },
          { title: 'Emotion Engine', desc: 'How your feelings drive ₹4.2L/year in hidden spending', icon: 'fa-brain', color: 'from-pink-50 to-rose-50', tab: 'emotion' as TabId },
          { title: 'Generational Wealth', desc: '3-generation wealth projection + smart inheritance', icon: 'fa-people-roof', color: 'from-amber-50 to-yellow-50', tab: 'generational' as TabId },
        ].map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            className={`relative p-4 rounded-xl border border-gray-100 bg-gradient-to-br ${card.color} hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group overflow-hidden`}
          >
            {card.alert && (
              <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <i className={`fas ${card.icon} text-gray-700`} />
              </div>
              <i className="fas fa-arrow-right text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="text-sm font-bold text-gray-800 mb-0.5">{card.title}</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Live Status Board */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <i className="fas fa-satellite-dish text-primary" /> Live BHAVISHYA Status Board
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Life Events Predicted', value: '6', status: 'active', detail: 'Next: Education fund in 14mo' },
            { label: 'Crisis Signals', value: '2 Critical', status: 'warning', detail: 'Job loss + Medical alert' },
            { label: 'Auto-Hedges Active', value: '2/6', status: 'good', detail: 'Emergency + Health buffer' },
            { label: 'Market Timing', value: 'Buy Gold', status: 'opportunity', detail: 'Window: Aug 01-07' },
            { label: 'Emotional State', value: 'Stable', status: 'good', detail: 'Mood-spend correlation: normal' },
            { label: 'Community Rank', value: '87th %ile', status: 'good', detail: 'Top 13% in your cohort' },
            { label: 'Legacy Vault', value: 'Secured', status: 'good', detail: '6 digital assets + smart will' },
            { label: 'Future Twin', value: 'Online', status: 'active', detail: '10 years of hindsight ready' },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.04 }}
              className={`p-2.5 rounded-lg border ${
                item.status === 'warning' ? 'border-amber-200 bg-amber-50/50' :
                item.status === 'opportunity' ? 'border-green-200 bg-green-50/50' :
                'border-gray-100 bg-gray-50/50'
              }`}
            >
              <p className="text-[9px] text-gray-400">{item.label}</p>
              <p className={`text-sm font-extrabold ${
                item.status === 'warning' ? 'text-amber-700' :
                item.status === 'opportunity' ? 'text-green-700' :
                'text-gray-900'
              }`}>{item.value}</p>
              <p className="text-[9px] text-gray-500 mt-0.5">{item.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cross-Module Intelligence Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-primary/5 to-amber-50 rounded-xl border border-primary/10">
          <div className="flex items-center gap-2 mb-3">
            <i className="fas fa-wand-magic-sparkles text-amber-500" />
            <h4 className="text-sm font-bold text-gray-800">This Week's AI Actions</h4>
          </div>
          <div className="space-y-2">
            {[
              { action: 'Auto-created ₹5L medical buffer', module: 'Crisis Shield', time: 'Today', status: 'done' },
              { action: 'Flagged gold buy window Aug 01-07', module: 'Market AI', time: 'Today', status: 'pending' },
              { action: 'Blocked Instagram shopping ads', module: 'Emotion Engine', time: 'Yesterday', status: 'done' },
              { action: 'Suggested ₹45K education SIP', module: 'Life Events', time: '2 days ago', status: 'pending' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px]">
                <i className={`fas fa-${item.status === 'done' ? 'check-circle text-green-500' : 'clock text-amber-500'}`} />
                <span className="flex-1 text-gray-700">{item.action}</span>
                <span className="text-gray-400 text-[9px]">{item.module}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
          <div className="flex items-center gap-2 mb-3">
            <i className="fas fa-gem text-violet-500" />
            <h4 className="text-sm font-bold text-gray-800">Hindsight Value</h4>
          </div>
          <p className="text-2xl font-extrabold text-violet-700 mb-1">₹42,00,000</p>
          <p className="text-[11px] text-gray-600 mb-3">Additional wealth created by following BHAVISHYA vs. doing nothing</p>
          <div className="space-y-1.5">
            {[
              { source: 'Predictive SIP timing', amount: '+₹18.5L' },
              { source: 'Crisis auto-hedge avoided', amount: '+₹12.2L' },
              { source: 'Emotion control savings', amount: '+₹6.8L' },
              { source: 'Market entry optimization', amount: '+₹4.5L' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">{item.source}</span>
                <span className="font-bold text-violet-600">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BhavishyaEngine() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

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
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
              <i className="fas fa-infinity text-amber-400 text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight">BHAVISHYA</h1>
                <span className="px-2 py-0.5 bg-amber-400 text-primary-dark text-[9px] font-extrabold rounded-full uppercase tracking-wider">v3.0</span>
              </div>
              <p className="text-[11px] text-white/70 font-medium">
                भारत का पहला भविष्य-ज्ञान वित्त इंजन — India's First Predictive Life-Cycle Intelligence
              </p>
            </div>
          </div>
          <p className="text-sm text-white/80 max-w-2xl leading-relaxed">
            BHAVISHYA analyzes <span className="text-amber-400 font-bold">174 behavioral signals</span> across your Financial DNA to predict 
            major life events 6–18 months before they happen. It auto-creates financial instruments, simulates your future self, 
            predicts crises, reads market signals, maps your emotions, projects generational wealth, and lets you chat with your 
            future — <span className="text-amber-400 font-bold">technology no bank on Earth has built</span>.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['Predictive AI', 'Behavioral DNA', 'Auto-Hedge', 'Future Simulation', 'Market Timing', 'Emotion Mapping', 'Generational Wealth', 'Zero Human Input'].map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full text-[10px] font-semibold border border-white/10">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-30 bg-psb-bg/90 backdrop-blur-md py-2 -mx-4 px-4">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'bg-white text-gray-600 border border-gray-100 hover:border-gray-200 hover:shadow-sm'
              }`}
            >
              <i className={`fas ${tab.icon} text-[10px]`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[8px] px-1 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                  {tab.badge}
                </span>
              )}
              {tab.alert && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'dna' && <FinancialDNAHelix />}
        {activeTab === 'predict' && <LifeEventPredictor />}
        {activeTab === 'future' && <FutureSelfSimulator />}
        {activeTab === 'ready' && <PreparednessScore />}
        {activeTab === 'auto' && <AutoInstrumentGenerator />}
        {activeTab === 'crisis' && <CrisisPredictor />}
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
            <i className="fas fa-shield-halved text-primary text-sm" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-800">Privacy-First Federated AI</p>
            <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">
              BHAVISHYA runs entirely on-device using federated learning. Your financial DNA, emotional patterns, 
              biometric signatures, and life predictions never leave your phone. Compliant with RBI data localization 
              norms, DPDP Act 2023, and PSB's zero-knowledge architecture.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

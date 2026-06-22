import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import WealthChat from '@/features/ai/components/WealthChat';
import BehavioralEngine from '@/features/ai/components/BehavioralEngine';
import DashboardWidget from '@/features/dashboard/components/DashboardWidget';
import { WealthTwinProvider, type TwinTab } from './wealthTwin/WealthTwinContext';
import TwinTabs from './wealthTwin/TwinTabs';
import ExplainablePanel from './wealthTwin/ExplainablePanel';
import OverviewTab from './wealthTwin/OverviewTab';
import GoalsTab from './wealthTwin/GoalsTab';
import TaxTab from './wealthTwin/TaxTab';
import RebalanceTab from './wealthTwin/RebalanceTab';
import WhatIfTab from './wealthTwin/WhatIfTab';
import RetirementTab from './wealthTwin/RetirementTab';

const TAB_TITLES: Record<TwinTab, string> = {
  overview: 'Overview & DNA',
  goals: 'AI Goal Planner',
  tax: 'Tax Optimizer',
  rebalance: 'Market-Aware Rebalancing',
  whatif: 'What-If Simulator',
  retirement: 'FIRE / Retirement Plan',
};

function TabContent({ activeTab }: { activeTab: TwinTab }) {
  const content =
    activeTab === 'overview' ? (
      <OverviewTab />
    ) : activeTab === 'goals' ? (
      <GoalsTab />
    ) : activeTab === 'tax' ? (
      <TaxTab />
    ) : activeTab === 'rebalance' ? (
      <RebalanceTab />
    ) : activeTab === 'whatif' ? (
      <WhatIfTab />
    ) : (
      <RetirementTab />
    );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}

function WealthTwinInner() {
  const [activeTab, setActiveTab] = useState<TwinTab>('overview');

  return (
    <WealthTwinProvider activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="space-y-5 pb-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-robot text-primary" />
                Wealth Twin AI
              </h2>
              <span className="text-[10px] px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-extrabold border border-violet-200">
                X-AI
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your AI-powered financial twin running 10,000+ local simulations with transparent reasoning.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-medium">
              <i className="fas fa-shield-halved mr-1" />
              Protection-First
            </span>
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <i className="fas fa-lock mr-1" />
              On-Device
            </span>
          </div>
        </div>

        {/* AI Chat */}
        <WealthChat initialCompact />

        {/* Behavioral Intelligence Engine */}
        <BehavioralEngine />

        {/* Tabs */}
        <TwinTabs />

        {/* Main content + Explainable AI panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <DashboardWidget title={TAB_TITLES[activeTab]} icon="fa-wand-magic-sparkles">
              <TabContent activeTab={activeTab} />
            </DashboardWidget>
          </div>
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4">
              <ExplainablePanel activeTab={activeTab} />
            </div>
          </div>
        </div>
      </div>
    </WealthTwinProvider>
  );
}

export default function WealthTwinView() {
  return <WealthTwinInner />;
}

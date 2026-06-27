import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useWealthStore } from '@/shared/store/wealthStore';
import { SkeletonDashboard } from '@/shared/components/Skeleton';
import { ShieldCheck, Lock } from 'lucide-react';
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
import MacroShockSimulator from '@/features/innovation/components/MacroShockSimulator';
import MacroSignalTower from '@/features/market/components/MacroSignalTower';

const TAB_TITLE_KEYS: Record<TwinTab, string> = {
  overview: 'twinTabOverviewAndDna',
  goals: 'twinTabAiGoalPlanner',
  tax: 'twinTabTaxOptimizer',
  rebalance: 'twinTabMarketAwareRebalancing',
  whatif: 'twinTabWhatIfSimulator',
  retirement: 'twinTabFireRetirementPlan',
  macroshock: 'twinTabMacroShock',
  macrosignal: 'twinTabMacroSignal',
};

function TabContent({ activeTab }: { activeTab: TwinTab }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        id={`twin-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`twin-tab-${activeTab}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      >
        {activeTab === 'overview' ? (
          <OverviewTab />
        ) : activeTab === 'goals' ? (
          <GoalsTab />
        ) : activeTab === 'tax' ? (
          <TaxTab />
        ) : activeTab === 'rebalance' ? (
          <RebalanceTab />
        ) : activeTab === 'whatif' ? (
          <WhatIfTab />
        ) : activeTab === 'retirement' ? (
          <RetirementTab />
        ) : activeTab === 'macroshock' ? (
          <MacroShockSimulator />
        ) : (
          <MacroSignalTower />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function WealthTwinInner() {
  const [activeTab, setActiveTab] = useState<TwinTab>('overview');
  const { t } = useTranslation();
  const isLoading = useWealthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <SkeletonDashboard />
      </div>
    );
  }

  return (
    <WealthTwinProvider activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="space-y-5 pb-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('wealthTwinSubtitle')}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-medium inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t('wealthTwinBadgeProtectionFirst')}
            </span>
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg inline-flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              {t('wealthTwinBadgeOnDevice')}
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
            <DashboardWidget title={t(TAB_TITLE_KEYS[activeTab])} icon="fa-wand-magic-sparkles">
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

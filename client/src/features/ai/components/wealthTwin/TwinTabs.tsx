import { useTwinContext, type TwinTab } from './WealthTwinContext';
import { useTranslation } from '@/shared/hooks/useTranslation';

const TABS: { id: TwinTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'twinTabOverview', icon: 'fa-user-astronaut' },
  { id: 'goals', label: 'twinTabGoalPlanner', icon: 'fa-bullseye' },
  { id: 'tax', label: 'twinTabTax', icon: 'fa-receipt' },
  { id: 'rebalance', label: 'twinTabRebalancing', icon: 'fa-scale-balanced' },
  { id: 'whatif', label: 'twinTabWhatIf', icon: 'fa-sliders' },
  { id: 'retirement', label: 'twinTabFirePlan', icon: 'fa-umbrella-beach' },
];

export default function TwinTabs() {
  const { activeTab, setActiveTab } = useTwinContext();
  const { t } = useTranslation();
  return (
    <div role="tablist" aria-label="Wealth Twin sections" className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`twin-panel-${tab.id}`}
          id={`twin-tab-${tab.id}`}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
            activeTab === tab.id
              ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          <i className={`fas ${tab.icon}`} aria-hidden="true" />
          {t(tab.label)}
        </button>
      ))}
    </div>
  );
}

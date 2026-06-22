import { useTwinContext, type TwinTab } from './WealthTwinContext';

const TABS: { id: TwinTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview & DNA', icon: 'fa-user-astronaut' },
  { id: 'goals', label: 'AI Goal Planner', icon: 'fa-bullseye' },
  { id: 'tax', label: 'Tax Optimizer', icon: 'fa-receipt' },
  { id: 'rebalance', label: 'Rebalancing', icon: 'fa-scale-balanced' },
  { id: 'whatif', label: 'What-If', icon: 'fa-sliders' },
  { id: 'retirement', label: 'FIRE Plan', icon: 'fa-umbrella-beach' },
];

export default function TwinTabs() {
  const { activeTab, setActiveTab } = useTwinContext();
  return (
    <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === tab.id
              ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          <i className={`fas ${tab.icon}`} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}

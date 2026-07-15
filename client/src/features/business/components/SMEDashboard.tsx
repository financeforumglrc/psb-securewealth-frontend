import { useState } from 'react';
import { motion } from 'framer-motion';
import CashFlowTimeline from './CashFlowTimeline';
import SurplusFundAdvisor from './SurplusFundAdvisor';
import WorkingCapitalHealth from './WorkingCapitalHealth';

const TABS = [
  { id: 'cashflow', label: 'Cash Flow Timeline', icon: 'fa-chart-column' },
  { id: 'surplus', label: 'Surplus Fund Advisor', icon: 'fa-piggy-bank' },
  { id: 'working-capital', label: 'Working Capital Health', icon: 'fa-heart-pulse' },
];

export default function SMEDashboard() {
  const [activeTab, setActiveTab] = useState('cashflow');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-book-open text-primary" /> Khata
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Working capital, surplus deployment, and cash flow intelligence.</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
          <i className="fas fa-building" /> Business
        </span>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <i className={`fas ${tab.icon}`} />
              {tab.label}
              {active && (
                <motion.div layoutId="smeTab" className="absolute bottom-[-9px] left-2 right-2 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full min-w-0"
      >
        {activeTab === 'cashflow' && <CashFlowTimeline />}
        {activeTab === 'surplus' && <SurplusFundAdvisor />}
        {activeTab === 'working-capital' && <WorkingCapitalHealth />}
      </motion.div>
    </div>
  );
}

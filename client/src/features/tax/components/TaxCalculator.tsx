import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RegulatoryDisclaimer from '@/shared/components/ui/RegulatoryDisclaimer';
import OldVsNewRegime from './OldVsNewRegime';
import Section80CTracker from './Section80CTracker';
import TaxDeadlineCalendar from './TaxDeadlineCalendar';

const TABS = [
  { id: 'old-vs-new', label: 'Old vs New Regime', icon: 'fa-scale-balanced' },
  { id: '80c', label: '80C Tracker', icon: 'fa-piggy-bank' },
  { id: 'deadlines', label: 'Deadline Calendar', icon: 'fa-calendar-check' },
];

export default function TaxCalculator() {
  const [activeTab, setActiveTab] = useState('old-vs-new');

  return (
    <div className="space-y-4">
      <RegulatoryDisclaimer compact />
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

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'old-vs-new' && <OldVsNewRegime />}
          {activeTab === '80c' && <Section80CTracker />}
          {activeTab === 'deadlines' && <TaxDeadlineCalendar />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

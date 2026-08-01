import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, TrendingUp, Briefcase, Heart } from 'lucide-react';
import { useWealthStore } from '@/shared/store/wealthStore';

interface AgeGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
  features: string[];
  focus: string[];
}

const AGE_GROUPS: AgeGroup[] = [
  {
    id: 'young',
    label: 'Young Professional (25-40)',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    description: 'Wealth building phase with high growth potential',
    features: ['SIP investments', 'Goal planning', 'Wealth accumulation', 'Tax optimization'],
    focus: ['Equity', 'Mutual Funds', 'Stocks', 'High-risk high-return'],
  },
  {
    id: 'middle',
    label: 'Middle Age (40-60)',
    icon: Briefcase,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    description: 'Peak earning years with family responsibilities',
    features: ['Child education', 'Home loan', 'Retirement planning', 'Insurance'],
    focus: ['Balanced portfolio', 'Debt funds', 'Real estate', 'Moderate risk'],
  },
  {
    id: 'senior',
    label: 'Senior Citizen (60+)',
    icon: Heart,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    description: 'Retirement phase with focus on stability and regular income',
    features: ['Fixed deposits', 'Pension plans', 'Senior citizen savings', 'Healthcare'],
    focus: ['Fixed income', 'Government schemes', 'Low risk', 'Regular income'],
  },
];

export default function AgeGroupView() {
  const user = useWealthStore((s) => s.user);
  const goals = useWealthStore((s) => s.goals);

  const defaultGroup = useMemo(() => {
    if (user.age === undefined || user.age === null) return 'middle';
    if (user.age < 40) return 'young';
    if (user.age < 60) return 'middle';
    return 'senior';
  }, [user.age]);

  const [selectedGroup, setSelectedGroup] = useState<string>(defaultGroup);

  // Sync if user.age changes
  useEffect(() => {
    setSelectedGroup(defaultGroup);
  }, [defaultGroup]);

  const currentGroup = AGE_GROUPS.find((g) => g.id === selectedGroup) || AGE_GROUPS[1];
  const Icon = currentGroup.icon;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600" /> Age-Based Experience
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Personalized banking experience based on your life stage.</p>
      </div>

      {/* Age Group Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {AGE_GROUPS.map((group) => {
          const GroupIcon = group.icon;
          return (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedGroup === group.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <GroupIcon className={`w-5 h-5 ${group.color}`} />
                <span className="text-sm font-bold text-slate-800 dark:text-white">{group.label}</span>
              </div>
              <p className="text-xs text-slate-500">{group.description}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Group Details */}
      <motion.div
        key={selectedGroup}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 rounded-2xl border ${currentGroup.bgColor}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl ${currentGroup.color.replace('text-', 'bg-')} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white">{currentGroup.label}</h3>
            <p className="text-xs text-slate-500">{currentGroup.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Features */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Key Features</h4>
            <div className="space-y-2">
              {currentGroup.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Focus Areas */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Investment Focus</h4>
            <div className="flex flex-wrap gap-2">
              {currentGroup.focus.map((focus, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-white/50 dark:bg-slate-800/50 text-xs font-bold text-slate-700 dark:text-slate-300">
                  {focus}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="mt-4 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Personalized Recommendations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
            {selectedGroup === 'young' && (
              <>
                <div>• Start SIP of ₹{Math.round((user.monthlyIncome * 0.2) / 1000)}K/month</div>
                <div>• Build emergency fund (6 months expenses)</div>
                <div>• Maximize equity exposure (80-90%)</div>
                <div>• Focus on long-term goals (10+ years)</div>
              </>
            )}
            {selectedGroup === 'middle' && (
              <>
                <div>• Balance equity and debt (60:40 ratio)</div>
                <div>• Child education fund (₹{(goals.find(g => g.name.includes('education'))?.targetAmount || 2500000).toLocaleString()})</div>
                <div>• Home loan prepayment strategy</div>
                <div>• Retirement corpus planning</div>
              </>
            )}
            {selectedGroup === 'senior' && (
              <>
                <div>• Focus on fixed income (70-80% debt)</div>
                <div>• Senior Citizen Savings Scheme (SCSS)</div>
                <div>• Monthly income schemes (MIS)</div>
                <div>• Healthcare and insurance coverage</div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Asset Allocation */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-black text-slate-800 dark:text-white mb-3">Recommended Asset Allocation</h3>
        <div className="space-y-3">
          {selectedGroup === 'young' && (
            <>
              <AllocationBar label="Equity" value={80} color="bg-blue-500" />
              <AllocationBar label="Debt" value={15} color="bg-emerald-500" />
              <AllocationBar label="Gold" value={5} color="bg-amber-500" />
            </>
          )}
          {selectedGroup === 'middle' && (
            <>
              <AllocationBar label="Equity" value={60} color="bg-blue-500" />
              <AllocationBar label="Debt" value={30} color="bg-emerald-500" />
              <AllocationBar label="Gold" value={10} color="bg-amber-500" />
            </>
          )}
          {selectedGroup === 'senior' && (
            <>
              <AllocationBar label="Equity" value={20} color="bg-blue-500" />
              <AllocationBar label="Debt" value={70} color="bg-emerald-500" />
              <AllocationBar label="Gold" value={10} color="bg-amber-500" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AllocationBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-bold text-slate-800 dark:text-white">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import type { Goal } from '../../types';

const GOAL_TYPES: { type: Goal['type']; label: string; icon: string }[] = [
  { type: 'home', label: 'House', icon: 'fa-house' },
  { type: 'education', label: 'Education', icon: 'fa-graduation-cap' },
  { type: 'car', label: 'Car', icon: 'fa-car' },
  { type: 'travel', label: 'Travel', icon: 'fa-plane' },
  { type: 'wedding', label: 'Wedding', icon: 'fa-heart' },
  { type: 'retirement', label: 'Retirement', icon: 'fa-umbrella-beach' },
  { type: 'emergency', label: 'Emergency', icon: 'fa-kit-medical' },
  { type: 'other', label: 'Other', icon: 'fa-bullseye' },
];

interface Props {
  show: boolean;
  onClose: () => void;
  onSave: (goal: Goal) => void;
  existingGoals: Goal[];
  monthlySavings: number;
  onConflict: (newGoal: Goal, totalMonthlyNeed: number) => void;
}

export default function AddGoalModal({ show, onClose, onSave, existingGoals, monthlySavings, onConflict }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<Goal['type']>('home');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [useCustomContribution, setUseCustomContribution] = useState(false);

  const autoContribution = useMemo(() => {
    const amount = parseInt(targetAmount.replace(/,/g, '')) || 0;
    if (!deadline || amount <= 0) return 0;
    const months = Math.max(1, Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
    return Math.ceil(amount / months);
  }, [targetAmount, deadline]);

  function reset() {
    setName('');
    setType('home');
    setTargetAmount('');
    setDeadline('');
    setMonthlyContribution('');
    setUseCustomContribution(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSave() {
    const amount = parseInt(targetAmount.replace(/,/g, '')) || 0;
    const contrib = useCustomContribution
      ? parseInt(monthlyContribution.replace(/,/g, '')) || autoContribution
      : autoContribution;

    if (!name.trim() || amount <= 0 || !deadline) return;

    const newGoal: Goal = {
      id: 'goal-' + Date.now(),
      name: name.trim(),
      type,
      targetAmount: amount,
      currentAmount: 0,
      deadline,
    };

    // Calculate total monthly need including existing goals
    const totalMonthlyNeed = existingGoals.reduce((sum, g) => {
      const months = Math.max(1, Math.ceil((new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
      return sum + Math.ceil((g.targetAmount - g.currentAmount) / months);
    }, contrib);

    if (totalMonthlyNeed > monthlySavings) {
      onConflict(newGoal, totalMonthlyNeed);
      return;
    }

    onSave(newGoal);
    handleClose();
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-primary to-secondary p-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Add New Goal</h3>
            <p className="text-xs text-white/80 mt-0.5">Define your financial target</p>
          </div>
          <button onClick={handleClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Goal Name */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Goal Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Dream Home in Mumbai"
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Goal Type</label>
            <div className="grid grid-cols-4 gap-2">
              {GOAL_TYPES.map((g) => (
                <button
                  key={g.type}
                  onClick={() => setType(g.type)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                    type === g.type
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <i className={`fas ${g.icon} text-sm`} />
                  <span className="text-[10px] font-medium">{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Target Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₹</span>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="25,00,000"
                className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
              />
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Target Date</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
            />
          </div>

          {/* Monthly Contribution */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Contribution</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomContribution}
                  onChange={(e) => setUseCustomContribution(e.target.checked)}
                  className="accent-primary w-3.5 h-3.5"
                />
                <span className="text-[10px] text-slate-400">Custom</span>
              </label>
            </div>
            {useCustomContribution ? (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₹</span>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  placeholder={autoContribution.toLocaleString()}
                  className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                />
              </div>
            ) : (
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-sm font-semibold text-primary">₹{autoContribution.toLocaleString()}/mo</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Auto-calculated to reach target by deadline</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex gap-3">
          <button onClick={handleClose} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !targetAmount || !deadline}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-plus mr-1" /> Add Goal
          </button>
        </div>
      </div>
    </div>
  );
}

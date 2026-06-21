import { useState, useMemo } from 'react';
import type { Goal } from '@/shared/types';

interface Props {
  show: boolean;
  onClose: () => void;
  newGoal: Goal | null;
  existingGoals: Goal[];
  monthlySavings: number;
  totalMonthlyNeed: number;
  onResolve: (goals: Goal[]) => void;
}

export default function GoalConflictModal({ show, onClose, newGoal, existingGoals, monthlySavings, totalMonthlyNeed, onResolve }: Props) {
  const [resolution, setResolution] = useState<'extend' | 'reduce' | 'increase'>('extend');

  const shortfall = totalMonthlyNeed - monthlySavings;

  const proposals = useMemo(() => {
    if (!newGoal) return [];
    const allGoals = [...existingGoals, newGoal];

    if (resolution === 'extend') {
      // Extend deadlines to reduce monthly need
      return allGoals.map((g) => {
        const remaining = g.targetAmount - g.currentAmount;
        const maxMonthly = (monthlySavings * remaining) / allGoals.reduce((s, ag) => s + (ag.targetAmount - ag.currentAmount), 0);
        const newMonths = Math.ceil(remaining / Math.max(maxMonthly, 1));
        const newDeadline = new Date();
        newDeadline.setMonth(newDeadline.getMonth() + newMonths);
        return { ...g, deadline: newDeadline.toISOString().split('T')[0] };
      });
    }

    if (resolution === 'reduce') {
      // Reduce target amounts proportionally
      const ratio = monthlySavings / totalMonthlyNeed;
      return allGoals.map((g) => ({
        ...g,
        targetAmount: Math.round(g.targetAmount * ratio),
      }));
    }

    if (resolution === 'increase') {
      // Just show what monthly savings should be
      return allGoals;
    }

    return allGoals;
  }, [resolution, newGoal, existingGoals, monthlySavings, totalMonthlyNeed]);

  function applyResolution() {
    onResolve(proposals);
    setResolution('extend');
    onClose();
  }

  if (!show || !newGoal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-warning to-danger p-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold"><i className="fas fa-triangle-exclamation mr-2" />Goal Conflict Detected!</h3>
            <p className="text-xs text-white/80 mt-0.5">Your goals need ₹{totalMonthlyNeed.toLocaleString()}/mo but you only save ₹{monthlySavings.toLocaleString()}/mo</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
              <p className="text-xs text-slate-400">Monthly Savings</p>
              <p className="text-sm font-bold text-slate-800 dark:text-white">₹{monthlySavings.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
              <p className="text-xs text-slate-400">Total Needed</p>
              <p className="text-sm font-bold text-danger">₹{totalMonthlyNeed.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
              <p className="text-xs text-slate-400">Shortfall</p>
              <p className="text-sm font-bold text-danger">₹{shortfall.toLocaleString()}</p>
            </div>
          </div>

          {/* Resolution Options */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Resolution Options</p>
            <div className="space-y-2">
              <button
                onClick={() => setResolution('extend')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  resolution === 'extend'
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${resolution === 'extend' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  <i className="fas fa-calendar-plus" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${resolution === 'extend' ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>Extend Timelines</p>
                  <p className="text-[10px] text-slate-400">Push deadlines further to reduce monthly burden</p>
                </div>
                {resolution === 'extend' && <i className="fas fa-check-circle text-primary ml-auto" />}
              </button>

              <button
                onClick={() => setResolution('reduce')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  resolution === 'reduce'
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${resolution === 'reduce' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  <i className="fas fa-arrow-down" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${resolution === 'reduce' ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>Reduce Amounts</p>
                  <p className="text-[10px] text-slate-400">Lower target amounts to fit your savings rate</p>
                </div>
                {resolution === 'reduce' && <i className="fas fa-check-circle text-primary ml-auto" />}
              </button>

              <button
                onClick={() => setResolution('increase')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  resolution === 'increase'
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${resolution === 'increase' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  <i className="fas fa-arrow-up" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${resolution === 'increase' ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>Increase Monthly Savings</p>
                  <p className="text-[10px] text-slate-400">You need to save ₹{totalMonthlyNeed.toLocaleString()}/mo to achieve all goals</p>
                </div>
                {resolution === 'increase' && <i className="fas fa-check-circle text-primary ml-auto" />}
              </button>
            </div>
          </div>

          {/* Preview */}
          {resolution !== 'increase' && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Proposed Changes</p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {proposals.map((g) => {
                  const original = [...existingGoals, newGoal].find((og) => og.id === g.id);
                  const changed = original && (original.deadline !== g.deadline || original.targetAmount !== g.targetAmount);
                  return (
                    <div key={g.id} className={`flex items-center justify-between p-2 rounded-lg text-xs ${changed ? 'bg-primary/5 border border-primary/10' : 'bg-slate-50 dark:bg-slate-800'}`}>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{g.name}</span>
                      <div className="text-right">
                        {resolution === 'extend' && original && original.deadline !== g.deadline && (
                          <span className="text-primary">→ {new Date(g.deadline).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                        )}
                        {resolution === 'reduce' && original && original.targetAmount !== g.targetAmount && (
                          <span className="text-primary">→ ₹{g.targetAmount.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button onClick={applyResolution} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            <i className="fas fa-check mr-1" /> Apply Resolution
          </button>
        </div>
      </div>
    </div>
  );
}

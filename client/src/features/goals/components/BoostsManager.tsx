import { useState, useEffect } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import { getBoosts, applyBoost, suggestBoostStack, getActiveBoosts, type Boost } from '@/shared/services/boostService';
import BoostCard from '@/features/goals/components/BoostCard';

export default function BoostsManager() {
  const goals = useWealthStore((s) => s.goals);
  const [boosts, setBoosts] = useState<Boost[]>(getBoosts);
  const [activeBoosts, setActiveBoosts] = useState<Boost[]>(getActiveBoosts);
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [selectedBoost, setSelectedBoost] = useState<string>('');
  const [marketTrend, setMarketTrend] = useState<'bull' | 'bear' | 'sideways'>('sideways');
  const [stackSuggestion, setStackSuggestion] = useState<ReturnType<typeof suggestBoostStack> | null>(null);

  useEffect(() => {
    setStackSuggestion(suggestBoostStack(marketTrend));
  }, [marketTrend]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBoosts(getActiveBoosts());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApply = () => {
    if (!selectedBoost || !selectedGoal) return;
    const updated = applyBoost(selectedBoost, selectedGoal);
    setBoosts(updated);
    setActiveBoosts(getActiveBoosts());
    setSelectedBoost('');
    setSelectedGoal('');
  };

  return (
    <div className="space-y-6">
      {/* Active Boosts */}
      {activeBoosts.length > 0 && (
        <div className="card border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10">
          <div className="flex items-center gap-2 mb-3">
            <i className="fas fa-bolt text-emerald-500 text-lg" />
            <h3 className="font-bold text-slate-800 dark:text-white">Active Boosts</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeBoosts.map((b) => (
              <div key={b.id} className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                <i className={`fas ${b.icon}`} />
                {b.name} · {b.multiplier}x → {goals.find((g) => g.id === b.appliedTo)?.name || 'Goal'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Boost Inventory */}
      <div className="card">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <i className="fas fa-rocket text-rose-500" /> Boost Inventory
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {boosts.map((boost) => (
            <BoostCard
              key={boost.id}
              boost={boost}
              selected={selectedBoost === boost.id}
              onSelect={() => setSelectedBoost(boost.id)}
            />
          ))}
        </div>

        {selectedBoost && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">Apply to Goal:</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGoal(g.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    selectedGoal === g.id
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
            <button
              onClick={handleApply}
              disabled={!selectedGoal}
              className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-bold rounded-xl hover:from-rose-600 hover:to-orange-600 transition-colors disabled:opacity-50"
            >
              <i className="fas fa-bolt mr-1" /> Apply Boost
            </button>
          </div>
        )}
      </div>

      {/* AI Boost Stack Suggestion */}
      <div className="card">
        <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <i className="fas fa-wand-magic-sparkles text-violet-500" /> AI Boost Stack Advisor
        </h3>
        <div className="flex gap-2 mb-3">
          {(['bull', 'bear', 'sideways'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setMarketTrend(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                marketTrend === t
                  ? 'bg-violet-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t} Market
            </button>
          ))}
        </div>
        {stackSuggestion && (
          <div className="p-3 bg-violet-50 dark:bg-violet-900/10 rounded-xl border border-violet-200 dark:border-violet-800">
            <p className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-1">
              Suggested Stack: {stackSuggestion.boosts.map((b) => boosts.find((bb) => bb.id === b)?.name).filter(Boolean).join(' + ')}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
              Estimated Impact: <span className="font-bold text-emerald-600">{stackSuggestion.estimatedImpact}</span>
            </p>
            <p className="text-[11px] text-slate-500 italic">{stackSuggestion.reasoning}</p>
          </div>
        )}
      </div>
    </div>
  );
}

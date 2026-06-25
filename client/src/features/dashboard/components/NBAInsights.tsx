import { useNBA } from '@/shared/context/NBAContext';
import { SkeletonCard } from '@/shared/components/Skeleton';

export default function NBAInsights() {
  const { state, dispatch } = useNBA();

  if (state.loading) {
    return <SkeletonCard />;
  }

  if (state.insights.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <i className="fas fa-lightbulb text-primary" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">AI Co-Pilot</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">All caught up! No new insights right now.</p>
      </div>
    );
  }

  const colorMap: Record<string, string> = {
    rose: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/10 dark:border-rose-800 dark:text-rose-300',
    amber: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/10 dark:border-amber-800 dark:text-amber-300',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-800 dark:text-emerald-300',
    primary: 'bg-primary/5 border-primary/20 text-primary dark:bg-primary/10 dark:border-primary/30',
    sky: 'bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-900/10 dark:border-sky-800 dark:text-sky-300',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <i className="fas fa-lightbulb text-sm" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">AI Co-Pilot</h3>
            <p className="text-[10px] text-slate-400">{state.insights.length} proactive insight{state.insights.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold">
          {state.insights.filter((i) => i.type === 'fraud').length > 0 && '🔒 Fraud Priority'}
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {state.insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-3 rounded-xl border transition-all ${colorMap[insight.color] || 'bg-slate-50 border-slate-200'}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                  insight.type === 'fraud' ? 'bg-rose-500 text-white' : 'bg-white/60'
                }`}>
                  <i className={`fas ${insight.icon}`} />
                </div>
                <div>
                  <p className="text-xs font-bold">{insight.title}</p>
                  <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">{insight.description}</p>
                </div>
              </div>
              {insight.type === 'fraud' && (
                <span className="text-[10px] px-1.5 py-0.5 bg-rose-500 text-white rounded-full font-bold flex-shrink-0">5x</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 ml-9">
              <button
                onClick={() => dispatch({ type: 'ACCEPT', id: insight.id })}
                className="px-3 py-1 bg-white dark:bg-slate-800 text-xs font-bold rounded-lg border border-current opacity-80 hover:opacity-100 transition-opacity"
              >
                {insight.actionLabel}
              </button>
              <button
                onClick={() => dispatch({ type: 'SNOOZE', id: insight.id })}
                className="px-2 py-1 text-[10px] font-medium opacity-60 hover:opacity-100 transition-opacity"
              >
                Snooze
              </button>
              <button
                onClick={() => dispatch({ type: 'DISMISS', id: insight.id })}
                className="px-2 py-1 text-[10px] font-medium opacity-40 hover:opacity-100 transition-opacity ml-auto"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

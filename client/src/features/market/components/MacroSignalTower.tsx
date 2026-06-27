import { motion } from 'framer-motion';
import { useMacroFeed } from '../hooks/useMacroFeed';
import RegulatoryDisclaimer from '@/shared/components/ui/RegulatoryDisclaimer';

const TREND_ICON: Record<string, string> = {
  up: 'fa-arrow-trend-up',
  down: 'fa-arrow-trend-down',
  flat: 'fa-minus',
};

const TREND_COLOR: Record<string, string> = {
  up: 'text-rose-500',
  down: 'text-emerald-500',
  flat: 'text-slate-400',
};

const IMPACT_COLOR: Record<string, string> = {
  high: 'bg-rose-50 text-rose-700 border-rose-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function MacroSignalTower({ compact }: { compact?: boolean }) {
  const { feed, loading, error } = useMacroFeed();

  if (loading) {
    return (
      <div className="h-40 flex items-center justify-center text-slate-400 text-xs">
        <i className="fas fa-circle-notch fa-spin mr-2" /> Loading macro signals…
      </div>
    );
  }

  if (error || !feed) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
        <i className="fas fa-triangle-exclamation mr-1" /> {error || 'Macro data unavailable'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!compact && <RegulatoryDisclaimer compact />}

      <div className={`grid gap-2 ${compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {feed.signals.map((signal, i) => (
          <motion.div
            key={signal.indicator}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
          >
            <p className="text-[9px] text-slate-400 uppercase font-bold truncate">{signal.indicator}</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-sm font-black text-slate-800 dark:text-white">{signal.value}</span>
              <span className={`text-[10px] font-bold flex items-center gap-0.5 ${TREND_COLOR[signal.trend]}`}>
                <i className={`fas ${TREND_ICON[signal.trend]} text-[9px]`} />
                {signal.change}
              </span>
            </div>
            <p className="text-[9px] text-slate-500 mt-1 truncate">{signal.note}</p>
          </motion.div>
        ))}
      </div>

      {feed.recommendations.length > 0 && (
        <div className="space-y-2">
          {!compact && (
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <i className="fas fa-wand-magic-sparkles text-primary" /> Auto-Triggered Recommendations
            </h4>
          )}
          {feed.recommendations.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`p-3 rounded-xl border text-xs ${IMPACT_COLOR[rec.impact]}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <i className={`fas ${rec.icon}`} />
                    <span className="font-bold">{rec.title}</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/70 border border-current/20 uppercase font-bold">{rec.impact} impact</span>
                  </div>
                  <p className="opacity-90 leading-relaxed">{rec.description}</p>
                  {!compact && <p className="text-[10px] mt-1 opacity-70"><strong>Trigger:</strong> {rec.trigger}</p>}
                </div>
                <button className="shrink-0 px-3 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg font-bold hover:opacity-90 transition-opacity">
                  {rec.action}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {feed.lastUpdated && (
        <p className="text-[9px] text-slate-400 text-right">
          Last updated: {new Date(feed.lastUpdated).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

import type { Boost } from '@/shared/services/boostService';

interface BoostCardProps {
  boost: Boost;
  selected: boolean;
  onSelect: () => void;
}

export default function BoostCard({ boost, selected, onSelect }: BoostCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={boost.used}
      className={`p-3 rounded-xl border-2 text-left transition-all ${
        boost.used
          ? 'opacity-40 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800'
          : selected
          ? 'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/10'
          : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-rose-200 dark:hover:border-rose-800'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg ${boost.color} flex items-center justify-center text-white text-xs`}>
          <i className={`fas ${boost.icon}`} />
        </div>
        <div className="flex-1">
          <p className={`text-xs font-bold ${boost.used ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
            {boost.name}
          </p>
          <p className="text-[10px] text-slate-400">{boost.durationDays} days</p>
        </div>
        <span className="text-lg font-black text-rose-500">{boost.multiplier}x</span>
      </div>
      <p className="text-[10px] text-slate-500 dark:text-slate-400">{boost.description}</p>
      {boost.used && (
        <p className="text-[10px] text-slate-400 mt-1">
          Used on {boost.appliedTo ? `goal ${boost.appliedTo}` : 'a goal'}
        </p>
      )}
    </button>
  );
}

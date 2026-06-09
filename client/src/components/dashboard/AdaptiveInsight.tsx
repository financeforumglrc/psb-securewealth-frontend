import { useWealthStore } from '../../store/wealthStore';
import { usePersonaDetails } from '../../hooks/useSpendingPersona';

export default function AdaptiveInsight() {
  const transactions = useWealthStore((s) => s.transactions);
  const darkMode = useWealthStore((s) => s.darkMode);
  const details = usePersonaDetails(transactions);

  return (
    <div className={`card border-2 transition-colors ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ${details.color}`}>
          <i className={`fas ${details.icon}`} />
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Your Spending Persona</p>
          <h3 className={`font-bold text-sm ${details.color}`}>{details.persona}</h3>
        </div>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 italic">{details.tagline}</p>

      <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 mb-3">
        <p className="text-[10px] text-primary font-bold uppercase tracking-wide mb-1">Adaptive Budget Focus</p>
        <p className="text-sm font-semibold text-slate-800 dark:text-white">{details.budgetFocus}</p>
      </div>

      <div className="flex items-start gap-2">
        <i className="fas fa-lightbulb text-amber-500 text-xs mt-0.5" />
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{details.insight}</p>
      </div>
    </div>
  );
}

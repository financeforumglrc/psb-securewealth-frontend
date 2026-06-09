import { useState, useEffect, useRef } from 'react';
import { useWealthStore } from '../../store/wealthStore';

const ALL_CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Transport',
  'Investment',
  'Cash',
  'Utilities',
  'Housing',
  'Entertainment',
  'Health',
  'Education',
  'Income',
  'Transfer',
  'Other',
];

const CONFIDENCE_COLOR = (conf: number) => {
  if (conf >= 90) return 'bg-emerald-500';
  if (conf >= 80) return 'bg-amber-500';
  return 'bg-rose-500';
};

const CONFIDENCE_BG = (conf: number) => {
  if (conf >= 90) return 'bg-emerald-100';
  if (conf >= 80) return 'bg-amber-100';
  return 'bg-rose-100';
};

const CONFIDENCE_TEXT = (conf: number) => {
  if (conf >= 90) return 'text-emerald-700';
  if (conf >= 80) return 'text-amber-700';
  return 'text-rose-700';
};

export default function AICategorization() {
  const uncategorizedTxs = useWealthStore((s) => s.uncategorizedTxs);
  const categoryRules = useWealthStore((s) => s.categoryRules);
  const acceptAICategory = useWealthStore((s) => s.acceptAICategory);
  const changeAICategory = useWealthStore((s) => s.changeAICategory);
  const createCategoryRule = useWealthStore((s) => s.createCategoryRule);

  const [processing, setProcessing] = useState(true);
  const [processingStep, setProcessingStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [justAccepted, setJustAccepted] = useState<string | null>(null);
  const [justRuleCreated, setJustRuleCreated] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pending = uncategorizedTxs.filter((t) => t.category === null);
  const categorized = uncategorizedTxs.filter((t) => t.category !== null);

  // AI processing animation
  useEffect(() => {
    if (pending.length === 0) {
      setProcessing(false);
      return;
    }
    const steps = [
      'Scanning transaction descriptions...',
      'Matching against merchant database...',
      'Analyzing spending patterns...',
      'Learning your habits...',
      'Ready! AI categorized 5 transactions in 2 seconds.',
    ];
    let i = 0;
    const interval = setInterval(() => {
      setProcessingStep(i);
      i++;
      if (i >= steps.length) {
        clearInterval(interval);
        setProcessing(false);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [pending.length]);

  // Show success when all categorized
  useEffect(() => {
    if (categorized.length === uncategorizedTxs.length && uncategorizedTxs.length > 0 && !processing) {
      setShowSuccess(true);
      const t = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(t);
    }
  }, [categorized.length, uncategorizedTxs.length, processing]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleAccept = (id: string) => {
    acceptAICategory(id);
    setJustAccepted(id);
    setTimeout(() => setJustAccepted(null), 800);
  };

  const handleChange = (id: string, category: string) => {
    changeAICategory(id, category);
    setOpenDropdown(null);
    setJustAccepted(id);
    setTimeout(() => setJustAccepted(null), 800);
  };

  const handleCreateRule = (id: string) => {
    createCategoryRule(id);
    setJustRuleCreated(id);
    setTimeout(() => setJustRuleCreated(null), 1500);
  };

  if (uncategorizedTxs.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* AI Processing Header */}
      <div className="card border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center ${processing ? 'animate-pulse' : ''}`}>
              <i className="fas fa-brain text-white text-lg" />
              {processing && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">AI Smart Categorization</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {processing
                  ? 'Learning your patterns...'
                  : `${categorized.length}/${uncategorizedTxs.length} transactions categorized`}
              </p>
            </div>
          </div>
          {processing && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        {/* Processing steps */}
        {processing && (
          <div className="space-y-2">
            {[
              'Scanning transaction descriptions...',
              'Matching against merchant database...',
              'Analyzing spending patterns...',
              'Learning your habits...',
              'Ready! AI categorized 5 transactions in 2 seconds.',
            ].map((step, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                  idx <= processingStep ? 'text-slate-700 dark:text-slate-200 opacity-100' : 'text-slate-400 opacity-40'
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  idx < processingStep ? 'bg-emerald-500 text-white' :
                  idx === processingStep ? 'bg-primary text-white animate-pulse' :
                  'bg-slate-200 text-slate-400'
                }`}>
                  {idx < processingStep ? '✓' : idx + 1}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Success banner */}
        {showSuccess && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm">
              <i className="fas fa-check" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                AI categorized {uncategorizedTxs.length} transactions in 2 seconds. You saved 5 minutes! 🎉
              </p>
              <p className="text-[10px] text-emerald-500">Based on your past spending patterns and merchant data</p>
            </div>
          </div>
        )}
      </div>

      {/* Uncategorized transactions */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="w-5 h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-[10px]">
              {pending.length}
            </span>
            Uncategorized Transactions
          </h4>
          {pending.map((tx) => (
            <div
              key={tx.id}
              className={`card border-2 transition-all duration-500 ${
                justAccepted === tx.id ? 'border-emerald-300 bg-emerald-50/50 scale-[1.02]' : 'border-slate-100 hover:border-primary/30'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Left: transaction info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <i className="fas fa-receipt" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{tx.description}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · ₹{tx.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* AI Suggestion */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-bold ${CONFIDENCE_BG(tx.confidence)} ${CONFIDENCE_TEXT(tx.confidence)}`}>
                      🤖 AI
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      Suggests: <strong className="text-slate-800 dark:text-white">{tx.aiCategory}</strong>
                    </span>
                  </div>

                  {/* Confidence bar */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400">Confidence</span>
                      <span className={`text-[10px] font-bold ${CONFIDENCE_TEXT(tx.confidence)}`}>{tx.confidence}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${CONFIDENCE_COLOR(tx.confidence)} rounded-full transition-all duration-700`}
                        style={{ width: `${tx.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex flex-wrap items-center gap-2" ref={openDropdown === tx.id ? dropdownRef : undefined}>
                  <button
                    onClick={() => handleAccept(tx.id)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <i className="fas fa-check" /> Accept
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === tx.id ? null : tx.id)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <i className="fas fa-pen" /> Change
                    </button>
                    {openDropdown === tx.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 max-h-60 overflow-y-auto">
                        {ALL_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => handleChange(tx.id, cat)}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleCreateRule(tx.id)}
                    disabled={tx.ruleCreated}
                    className={`px-3 py-2 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 ${
                      tx.ruleCreated
                        ? 'bg-violet-100 text-violet-600 cursor-default'
                        : 'bg-violet-50 hover:bg-violet-100 text-violet-600'
                    }`}
                  >
                    <i className={`fas ${tx.ruleCreated ? 'fa-check' : 'fa-wand-magic-sparkles'}`} />
                    {tx.ruleCreated ? 'Rule Active' : 'Create Rule'}
                  </button>
                </div>
              </div>

              {/* Rule created toast */}
              {justRuleCreated === tx.id && (
                <div className="mt-3 p-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg text-center animate-fade-in">
                  <p className="text-xs text-violet-700 dark:text-violet-400 font-medium">
                    <i className="fas fa-wand-magic-sparkles mr-1" />
                    Rule created: Always categorize "{tx.description.split(' ')[0]}" as {tx.aiCategory}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Categorized summary */}
      {categorized.length > 0 && (
        <div className="card border-2 border-emerald-100 bg-emerald-50/30">
          <h4 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
            <i className="fas fa-check-circle" />
            Categorized ({categorized.length})
          </h4>
          <div className="space-y-2">
            {categorized.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <i className="fas fa-check" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{tx.description}</p>
                    <p className="text-xs text-slate-400">₹{tx.amount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {tx.ruleCreated && (
                    <span className="px-2 py-0.5 bg-violet-100 text-violet-600 text-[10px] font-bold rounded-full">
                      <i className="fas fa-wand-magic-sparkles mr-0.5" /> Rule
                    </span>
                  )}
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    {tx.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Rules */}
      {categoryRules.length > 0 && (
        <div className="card">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <i className="fas fa-wand-magic-sparkles text-violet-500" />
            Active Auto-Categorization Rules
          </h4>
          <div className="flex flex-wrap gap-2">
            {categoryRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center gap-2 px-3 py-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl"
              >
                <span className="text-xs font-bold text-violet-700 dark:text-violet-400">"{rule.pattern}"</span>
                <i className="fas fa-arrow-right text-[10px] text-violet-400" />
                <span className="text-xs text-violet-600 dark:text-violet-300">{rule.category}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-violet-200 text-violet-700 rounded-full">
                  {rule.count}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

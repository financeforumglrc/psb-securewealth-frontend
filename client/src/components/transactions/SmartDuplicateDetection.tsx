import { useState, useEffect } from 'react';
import { useWealthStore } from '../../store/wealthStore';

const CONFIDENCE_BAR = (conf: number) => {
  if (conf >= 95) return 'bg-emerald-500';
  if (conf >= 80) return 'bg-amber-500';
  return 'bg-rose-500';
};

const CONFIDENCE_TEXT = (conf: number) => {
  if (conf >= 95) return 'text-emerald-700';
  if (conf >= 80) return 'text-amber-700';
  return 'text-rose-700';
};

const CONFIDENCE_BG = (conf: number) => {
  if (conf >= 95) return 'bg-emerald-50 border-emerald-200';
  if (conf >= 80) return 'bg-amber-50 border-amber-200';
  return 'bg-rose-50 border-rose-200';
};

export default function SmartDuplicateDetection() {
  const duplicateGroups = useWealthStore((s) => s.duplicateGroups);
  const resolveDuplicate = useWealthStore((s) => s.resolveDuplicate);
  const badges = useWealthStore((s) => s.badges);

  const [animatingCard, setAnimatingCard] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successAmount, setSuccessAmount] = useState(0);
  const [scanning, setScanning] = useState(true);
  const [scanStep, setScanStep] = useState(0);

  const pending = duplicateGroups.filter((g) => g.status === 'pending');
  const resolvedMerged = duplicateGroups.filter((g) => g.status === 'merged');
  const badgeUnlocked = badges.find((b) => b.id === 'duplicate-guardian')?.unlocked;

  // Scanning animation on mount
  useEffect(() => {
    if (pending.length === 0) {
      setScanning(false);
      return;
    }
    const steps = [
      'Scanning transaction history...',
      'Comparing amounts and merchants...',
      'Analyzing time patterns...',
      `${pending.length} potential duplicates found.`,
    ];
    let i = 0;
    const interval = setInterval(() => {
      setScanStep(i);
      i++;
      if (i >= steps.length) {
        clearInterval(interval);
        setScanning(false);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [pending.length]);

  // Show success when all resolved with merges
  useEffect(() => {
    const mergedAmount = resolvedMerged.reduce((sum, g) => sum + g.amount, 0);
    if (resolvedMerged.length > 0 && pending.length === 0 && mergedAmount > 0) {
      setSuccessAmount(mergedAmount);
      setShowSuccess(true);
      const t = setTimeout(() => setShowSuccess(false), 6000);
      return () => clearTimeout(t);
    }
  }, [resolvedMerged.length, pending.length]);

  const handleResolve = (id: string, action: 'merged' | 'kept' | 'not-duplicate') => {
    setAnimatingCard(id);
    setTimeout(() => {
      resolveDuplicate(id, action);
      setAnimatingCard(null);
    }, 400);
  };

  if (duplicateGroups.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header with shield icon */}
      <div className="card border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${
              scanning ? 'bg-primary animate-pulse' : 'bg-gradient-to-br from-primary to-secondary'
            }`}>
              <i className="fas fa-shield-halved text-white text-lg" />
              {scanning && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Smart Duplicate Detection</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {scanning
                  ? 'Analyzing your transactions...'
                  : `${pending.length > 0 ? `${pending.length} potential duplicates need review` : 'All clear — no duplicates found'}`}
              </p>
            </div>
          </div>
          {badgeUnlocked && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-full">
              <i className="fas fa-shield-halved text-emerald-500 text-xs" />
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Duplicate Guardian Active</span>
            </div>
          )}
        </div>

        {/* Scanning steps */}
        {scanning && (
          <div className="mt-4 space-y-2">
            {[
              'Scanning transaction history...',
              'Comparing amounts and merchants...',
              'Analyzing time patterns...',
              `${pending.length} potential duplicates found.`,
            ].map((step, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                  idx <= scanStep ? 'text-slate-700 dark:text-slate-200 opacity-100' : 'text-slate-400 opacity-40'
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  idx < scanStep ? 'bg-emerald-500 text-white' :
                  idx === scanStep ? 'bg-primary text-white animate-pulse' :
                  'bg-slate-200 text-slate-400'
                }`}>
                  {idx < scanStep ? '✓' : idx + 1}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending duplicates */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="w-5 h-5 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-[10px]">
              {pending.length}
            </span>
            Potential Duplicates Found
          </h4>

          {pending.map((group) => (
            <div
              key={group.id}
              className={`card border-2 transition-all duration-400 ${
                animatingCard === group.id ? 'opacity-0 scale-95 translate-x-4' : 'opacity-100 scale-100'
              } ${CONFIDENCE_BG(group.confidence)}`}
            >
              {/* Top row: merchant + amount + confidence */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg shadow-sm">
                    🔔
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      ₹{group.amount.toLocaleString()} — {group.merchant}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(group.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {group.timeGap && <span className="ml-1">· Gap: {group.timeGap}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${CONFIDENCE_TEXT(group.confidence)}`}>
                    {group.confidence}% match
                  </span>
                  <div className="w-20 h-2 bg-white/60 dark:bg-slate-800/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${CONFIDENCE_BAR(group.confidence)} rounded-full transition-all duration-700`}
                      style={{ width: `${group.confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="p-3 bg-white/70 dark:bg-slate-800/50 rounded-xl mb-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fas fa-robot text-white text-[10px]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">AI Analysis</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {group.confidence}% likely duplicate. {group.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Duplicate transaction cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {group.txIds.map((txId, idx) => (
                  <div key={txId} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{group.merchant}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">₹{group.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">{group.date} · Debit</p>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleResolve(group.id, 'merged')}
                  className="flex-1 min-w-[100px] px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white text-xs font-bold rounded-xl transition-all hover:shadow-lg flex items-center justify-center gap-1.5"
                >
                  <i className="fas fa-object-group" /> Merge
                </button>
                <button
                  onClick={() => handleResolve(group.id, 'kept')}
                  className="flex-1 min-w-[100px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <i className="fas fa-copy" /> Keep Both
                </button>
                <button
                  onClick={() => handleResolve(group.id, 'not-duplicate')}
                  className="flex-1 min-w-[100px] px-4 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <i className="fas fa-xmark" /> Not Duplicate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Success message */}
      {showSuccess && successAmount > 0 && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
            <i className="fas fa-check" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              You recovered ₹{successAmount.toLocaleString()} from accidental duplicate charges!
            </p>
            <p className="text-xs text-emerald-500 mt-0.5">
              AI Duplicate Guardian is actively monitoring your transactions 24/7.
            </p>
          </div>
        </div>
      )}

      {/* Resolved summary */}
      {resolvedMerged.length > 0 && (
        <div className="card border-2 border-emerald-100 bg-emerald-50/30 dark:bg-emerald-900/10">
          <h4 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
            <i className="fas fa-check-double" />
            Resolved Duplicates
          </h4>
          <div className="space-y-2">
            {duplicateGroups.filter((g) => g.status !== 'pending').map((group) => (
              <div key={group.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    group.status === 'merged' ? 'bg-emerald-100 text-emerald-600' :
                    group.status === 'kept' ? 'bg-slate-100 text-slate-500' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    <i className={`fas ${
                      group.status === 'merged' ? 'fa-object-group' :
                      group.status === 'kept' ? 'fa-copy' : 'fa-xmark'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{group.merchant}</p>
                    <p className="text-xs text-slate-400">₹{group.amount.toLocaleString()}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  group.status === 'merged' ? 'bg-emerald-100 text-emerald-700' :
                  group.status === 'kept' ? 'bg-slate-100 text-slate-600' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {group.status === 'merged' ? 'Merged' : group.status === 'kept' ? 'Kept Both' : 'Not Duplicate'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Duplicate Guardian badge */}
      {badgeUnlocked && (
        <div className="card bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 border-2 border-violet-200 dark:border-violet-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg">
              <i className="fas fa-shield-halved" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-violet-800 dark:text-violet-300">Duplicate Guardian</h4>
                <span className="px-2 py-0.5 bg-violet-200 text-violet-700 text-[10px] font-bold rounded-full">BADGE UNLOCKED</span>
              </div>
              <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">
                3 duplicates caught this month. AI is actively protecting your money from merchant and technical errors.
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">₹17,400</p>
              <p className="text-[10px] text-violet-500">Total recovered</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

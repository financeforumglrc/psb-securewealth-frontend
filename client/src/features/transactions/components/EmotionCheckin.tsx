import { useState, useEffect } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import { addSentiment, getWeeklySummary, type SentimentType } from '@/shared/services/sentimentService';
import type { Transaction } from '@/shared/types';

const SENTIMENTS: { key: SentimentType; emoji: string; label: string; color: string }[] = [
  { key: 'happy', emoji: '😊', label: 'Happy', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { key: 'excited', emoji: '🤩', label: 'Excited', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { key: 'neutral', emoji: '😐', label: 'Neutral', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { key: 'anxious', emoji: '😰', label: 'Anxious', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { key: 'guilty', emoji: '😔', label: 'Guilty', color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

export default function EmotionCheckin() {
  const transactions = useWealthStore((s) => s.transactions);
  const [pendingTx, setPendingTx] = useState<Transaction | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<ReturnType<typeof getWeeklySummary>>(null);

  // Detect large discretionary spends without sentiment
  useEffect(() => {
    const recordedIds = new Set(
      JSON.parse(localStorage.getItem('sw_sentiment_data') || '[]').map((r: any) => r.txId)
    );
    const largeDiscretionary = transactions.find(
      (t) =>
        t.type === 'debit' &&
        t.status === 'ALLOWED' &&
        t.amount > 5000 &&
        !['Investment', 'Housing', 'Utilities', 'Income'].includes(t.category) &&
        !recordedIds.has(t.id)
    );
    if (largeDiscretionary && !pendingTx) {
      setPendingTx(largeDiscretionary);
    }
  }, [transactions, pendingTx]);

  useEffect(() => {
    const s = getWeeklySummary();
    setSummary(s);
  }, []);

  const handleSentiment = (sentiment: SentimentType) => {
    if (!pendingTx) return;
    addSentiment({
      id: `sent-${Date.now()}`,
      txId: pendingTx.id,
      description: pendingTx.description,
      category: pendingTx.category,
      amount: pendingTx.amount,
      sentiment,
      timestamp: new Date().toISOString(),
    });
    setPendingTx(null);
    setSummary(getWeeklySummary());
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setShowSummary(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-primary to-secondary text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
        title="Emotion Check-in"
      >
        <i className="fas fa-heart text-lg" />
      </button>

      {/* Pending Transaction Prompt */}
      {pendingTx && (
        <div className="fixed bottom-24 right-6 z-40 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">How do you feel?</p>
            <button onClick={() => setPendingTx(null)} className="text-slate-400 hover:text-slate-600 text-xs">
              <i className="fas fa-xmark" />
            </button>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200 mb-1">
            About your <span className="font-bold">₹{pendingTx.amount.toLocaleString()}</span> spend on{' '}
            <span className="font-bold">{pendingTx.description}</span>?
          </p>
          <div className="grid grid-cols-5 gap-2 mt-3">
            {SENTIMENTS.map((s) => (
              <button
                key={s.key}
                onClick={() => handleSentiment(s.key)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all hover:scale-105 ${s.color}`}
              >
                <span className="text-lg">{s.emoji}</span>
                <span className="text-[10px] font-bold">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-heart-pulse text-rose-500" /> Emotional Finance Check-in
              </h3>
              <button onClick={() => setShowSummary(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400">
                <i className="fas fa-xmark" />
              </button>
            </div>

            {summary ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-900/10 dark:to-purple-900/10 rounded-xl border border-rose-100 dark:border-rose-800">
                  <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">
                    {summary.insight}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded-full font-bold">
                      {summary.dominantSentiment} {summary.percentage}%
                    </span>
                    <span>· {summary.count} check-ins this week</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Recent Moods</p>
                  {JSON.parse(localStorage.getItem('sw_sentiment_data') || '[]')
                    .slice(0, 5)
                    .map((r: any) => (
                      <div key={r.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {SENTIMENTS.find((s) => s.key === r.sentiment)?.emoji || '😐'}
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[140px]">{r.description}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          ₹{Number(r.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-heart text-slate-300 text-xl" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">No emotion data yet.</p>
                <p className="text-xs text-slate-400 mt-1">Large purchases will prompt you automatically.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

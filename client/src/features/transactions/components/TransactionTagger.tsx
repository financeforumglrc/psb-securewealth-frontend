import { useState, useEffect } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';

export type TransactionTag = 'regret' | 'align' | 'neutral';

export interface TagRecord {
  txId: string;
  tag: TransactionTag;
  timestamp: string;
}

const TAGS_KEY = 'sw_tx_tags';

export function getTransactionTags(): TagRecord[] {
  try {
    return JSON.parse(localStorage.getItem(TAGS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function tagTransaction(txId: string, tag: TransactionTag) {
  const tags = getTransactionTags();
  const existing = tags.findIndex((t) => t.txId === txId);
  if (existing >= 0) {
    tags[existing] = { txId, tag, timestamp: new Date().toISOString() };
  } else {
    tags.push({ txId, tag, timestamp: new Date().toISOString() });
  }
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
}

export function getTagSummary() {
  const tags = getTransactionTags();
  const counts: Record<TransactionTag, number> = { regret: 0, align: 0, neutral: 0 };
  tags.forEach((t) => {
    counts[t.tag] = (counts[t.tag] || 0) + 1;
  });
  const total = tags.length;
  const regretPercent = total > 0 ? Math.round((counts.regret / total) * 100) : 0;
  return { counts, total, regretPercent, dominant: counts.regret > counts.align ? 'regret' : counts.align > counts.regret ? 'align' : 'neutral' };
}

export default function TransactionTagger() {
  const transactions = useWealthStore((s) => s.transactions);
  const [tags, setTags] = useState<Record<string, TransactionTag>>({});
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const allTags = getTransactionTags();
    const map: Record<string, TransactionTag> = {};
    allTags.forEach((t) => { map[t.txId] = t.tag; });
    setTags(map);
  }, []);

  const handleTag = (txId: string, tag: TransactionTag) => {
    tagTransaction(txId, tag);
    setTags((prev) => ({ ...prev, [txId]: tag }));
  };

  const summary = getTagSummary();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <i className="fas fa-tags text-primary" /> Regret & Align Tagger
        </h3>
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          {showSummary ? 'Hide Summary' : 'View Summary'}
        </button>
      </div>

      {showSummary && (
        <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
          <div className="grid grid-cols-3 gap-4 text-center mb-3">
            <div>
              <p className="text-2xl">😊</p>
              <p className="text-lg font-bold text-emerald-600">{summary.counts.align}</p>
              <p className="text-[10px] text-slate-400">Aligned</p>
            </div>
            <div>
              <p className="text-2xl">😞</p>
              <p className="text-lg font-bold text-rose-600">{summary.counts.regret}</p>
              <p className="text-[10px] text-slate-400">Regret</p>
            </div>
            <div>
              <p className="text-2xl">😐</p>
              <p className="text-lg font-bold text-slate-600 dark:text-slate-400">{summary.counts.neutral}</p>
              <p className="text-[10px] text-slate-400">Neutral</p>
            </div>
          </div>
          {summary.total > 0 && (
            <p className="text-xs text-center text-slate-600 dark:text-slate-300">
              {summary.regretPercent > 30
                ? `⚠️ ${summary.regretPercent}% of tagged transactions are regrets. Consider setting stricter spending limits.`
                : `✅ Only ${summary.regretPercent}% regret rate. Your spending aligns well with your values!`}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        {transactions.filter((t) => t.type === 'debit' && t.status === 'ALLOWED').slice(0, 8).map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs">
                <i className={`fas ${tx.category === 'Food' ? 'fa-utensils' : tx.category === 'Shopping' ? 'fa-bag-shopping' : 'fa-circle'}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">{tx.description}</p>
                <p className="text-[10px] text-slate-400">₹{tx.amount.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-1">
              {(['align', 'neutral', 'regret'] as TransactionTag[]).map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTag(tx.id, tag)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                    tags[tx.id] === tag
                      ? tag === 'align'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 scale-110'
                        : tag === 'regret'
                        ? 'bg-rose-100 dark:bg-rose-900/30 scale-110'
                        : 'bg-slate-100 dark:bg-slate-700 scale-110'
                      : 'bg-slate-50 dark:bg-slate-800 opacity-50 hover:opacity-100'
                  }`}
                  title={tag}
                >
                  {tag === 'align' ? '😊' : tag === 'regret' ? '😞' : '😐'}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

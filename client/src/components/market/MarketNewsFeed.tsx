import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CosmosCard from '../ui/CosmosCard';
import { getMarketNews, type NewsItem, type NewsSentiment } from '../../services/newsService';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / (60 * 1000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function SentimentBadge({ sentiment }: { sentiment: NewsSentiment }) {
  if (sentiment === 'positive') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        <i className="fas fa-arrow-trend-up" /> Bullish
      </span>
    );
  }
  if (sentiment === 'negative') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
        <i className="fas fa-arrow-trend-down" /> Bearish
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400">
      <i className="fas fa-minus" /> Neutral
    </span>
  );
}

export default function MarketNewsFeed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMarketNews(force);
      setItems(result.items);
      setError(result.error);
    } catch (e) {
      setError('Unable to load market news. Please try again later.');
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const handleRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  return (
    <CosmosCard
      variant="default"
      header={{
        icon: 'fa-newspaper',
        iconColor: '#0f766e',
        title: 'Market News & Sentiment',
        subtitle: 'Real-time headlines with AI sentiment analysis',
        action: (
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <i className={`fas fa-rotate-right ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        ),
      }}
    >
      {loading && items.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30">
              <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 mt-1.5" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
            <i className="fas fa-triangle-exclamation text-lg text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-3 text-[10px] font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
          <AnimatePresence initial={false}>
            {items.map((item, index) => (
              <motion.a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.3 }}
                className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50"
              >
                {/* sentiment dot */}
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    item.sentiment === 'positive'
                      ? 'bg-emerald-500'
                      : item.sentiment === 'negative'
                      ? 'bg-rose-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SentimentBadge sentiment={item.sentiment} />
                    <span className="text-[10px] text-slate-400 font-medium">{item.source}</span>
                    <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-[10px] text-slate-400">{timeAgo(item.publishedAt)}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1 leading-snug group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <i className="fas fa-arrow-up-right-from-square text-[10px] text-slate-300 dark:text-slate-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.a>
            ))}
          </AnimatePresence>
        </div>
      )}

      {error && items.length > 0 && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
          <i className="fas fa-circle-info text-[10px] text-amber-600 dark:text-amber-400" />
          <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">{error}</p>
        </div>
      )}
    </CosmosCard>
  );
}

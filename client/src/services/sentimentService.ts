export type SentimentType = 'happy' | 'anxious' | 'guilty' | 'excited' | 'neutral';

export interface SentimentRecord {
  id: string;
  txId: string;
  description: string;
  category: string;
  amount: number;
  sentiment: SentimentType;
  timestamp: string;
}

const KEY = 'sw_sentiment_data';

export function getSentimentData(): SentimentRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function addSentiment(record: SentimentRecord) {
  const data = getSentimentData();
  data.unshift(record);
  localStorage.setItem(KEY, JSON.stringify(data.slice(0, 200)));
}

export function getWeeklySummary(): {
  dominantSentiment: SentimentType | null;
  percentage: number;
  count: number;
  topCategory: string;
  insight: string;
} | null {
  const data = getSentimentData();
  if (data.length === 0) return null;

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = data.filter((d) => new Date(d.timestamp).getTime() > oneWeekAgo);
  if (recent.length === 0) return null;

  const counts: Record<string, number> = {};
  const catCounts: Record<string, number> = {};
  recent.forEach((r) => {
    counts[r.sentiment] = (counts[r.sentiment] || 0) + 1;
    catCounts[r.category] = (catCounts[r.category] || 0) + 1;
  });

  const dominant = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral') as SentimentType;
  const percentage = Math.round((counts[dominant] / recent.length) * 100);
  const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  const insights: Record<SentimentType, string> = {
    happy: `You felt great about your ${topCategory} spends. Keep enjoying mindfully!`,
    anxious: `You felt 'anxious' after ${percentage}% of your large discretionary spends. Let's review your '${topCategory}' budget.`,
    guilty: `You felt 'guilty' after ${percentage}% of spends. Consider setting a stricter '${topCategory}' limit.`,
    excited: `Excitement drives ${percentage}% of your purchases — channel it toward goals!`,
    neutral: `Most spends feel neutral. Try aligning more purchases with your values.`,
  };

  return {
    dominantSentiment: dominant,
    percentage,
    count: recent.length,
    topCategory,
    insight: insights[dominant],
  };
}

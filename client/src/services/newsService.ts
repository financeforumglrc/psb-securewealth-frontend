export type NewsSentiment = 'positive' | 'negative' | 'neutral';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: NewsSentiment;
}

const CACHE_KEY = 'sw_market_news_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  items: NewsItem[];
  fetchedAt: number;
}

function getCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function setCache(items: NewsItem[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ items, fetchedAt: Date.now() }));
  } catch {
    // ignore storage errors
  }
}

function generateId(title: string, source: string): string {
  return `${source}-${title.slice(0, 30).replace(/\s+/g, '-').toLowerCase()}-${Date.now().toString(36).slice(-4)}`;
}

function analyzeSentiment(title: string): NewsSentiment {
  const lower = title.toLowerCase();
  const positiveWords = ['surge', 'gain', 'rise', 'bull', 'rally', 'jump', 'soar', 'climb', 'boost', 'up', 'high', 'record', 'breakout', 'milestone', 'growth', 'profit', 'strong'];
  const negativeWords = ['fall', 'crash', 'drop', 'bear', 'decline', 'plunge', 'slump', 'tumble', 'sink', 'down', 'low', 'loss', 'weak', 'sell-off', 'correction', 'panic'];

  let pos = 0;
  let neg = 0;
  positiveWords.forEach((w) => { if (lower.includes(w)) pos++; });
  negativeWords.forEach((w) => { if (lower.includes(w)) neg++; });

  if (pos > neg) return 'positive';
  if (neg > pos) return 'negative';
  return 'neutral';
}

/* ── Fallback mock data (always works offline) ── */
const FALLBACK_NEWS: NewsItem[] = [
  {
    id: 'fallback-1',
    title: 'NIFTY 50 surges to new record high on strong FII inflows',
    description: 'Indian markets rallied as foreign institutional investors poured in over ₹4,000 crore, driven by positive global cues and robust corporate earnings.',
    source: 'Market Watch',
    url: '#',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sentiment: 'positive',
  },
  {
    id: 'fallback-2',
    title: 'RBI maintains repo rate at 6.5% for eighth consecutive meeting',
    description: 'The Monetary Policy Committee voted unanimously to keep rates unchanged, citing inflationary pressures and global uncertainty.',
    source: 'Economic Times',
    url: '#',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    sentiment: 'neutral',
  },
  {
    id: 'fallback-3',
    title: 'IT stocks drop as US recession fears weigh on export outlook',
    description: 'Major IT firms saw profit booking after weak US manufacturing data raised concerns about discretionary tech spending.',
    source: 'Business Standard',
    url: '#',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    sentiment: 'negative',
  },
  {
    id: 'fallback-4',
    title: 'Gold prices climb amid geopolitical tensions in Middle East',
    description: 'Investors sought safe-haven assets, pushing domestic gold prices above ₹79,000 per 10 grams in early trade.',
    source: 'Commodity Desk',
    url: '#',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    sentiment: 'positive',
  },
  {
    id: 'fallback-5',
    title: 'Auto sector sales decline 4% in May on weak rural demand',
    description: 'Two-wheeler and tractor segments faced headwards as monsoon delays impacted purchasing sentiment in rural markets.',
    source: 'Auto Insight',
    url: '#',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'negative',
  },
  {
    id: 'fallback-6',
    title: 'PSU banks rally after government announces capital infusion plan',
    description: 'Finance Ministry outlined a ₹25,000 crore recapitalisation roadmap, boosting investor confidence in public sector lenders.',
    source: 'Banking Weekly',
    url: '#',
    publishedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    sentiment: 'positive',
  },
];

/* ── Reddit fetch (CORS-friendly, no API key) ── */
async function fetchFromReddit(): Promise<NewsItem[] | null> {
  try {
    const res = await fetch('https://www.reddit.com/r/IndianStockMarket/.json?limit=15', {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const posts = data?.data?.children as Array<{ data: { title: string; selftext: string; url: string; subreddit: string; created_utc: number; author: string } }>;
    if (!Array.isArray(posts)) return null;

    return posts
      .filter((p) => p.data && p.data.title)
      .map((p) => {
        const title = p.data.title;
        return {
          id: generateId(title, 'reddit'),
          title,
          description: p.data.selftext?.slice(0, 200) || '',
          source: `r/${p.data.subreddit} • u/${p.data.author}`,
          url: p.data.url || '#',
          publishedAt: new Date(p.data.created_utc * 1000).toISOString(),
          sentiment: analyzeSentiment(title),
        };
      });
  } catch {
    return null;
  }
}

/* ── NewsData.io demo fetch ── */
async function fetchFromNewsData(): Promise<NewsItem[] | null> {
  try {
    const res = await fetch(
      'https://newsdata.io/api/1/news?apikey=demo&q=indian+stock+market&language=en&category=business&size=10',
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const results = data?.results as Array<{ title: string; description: string; link: string; source_id: string; pubDate: string }>;
    if (!Array.isArray(results)) return null;

    return results
      .filter((r) => r.title)
      .map((r) => {
        const title = r.title;
        return {
          id: generateId(title, 'newsdata'),
          title,
          description: r.description || '',
          source: r.source_id || 'NewsData',
          url: r.link || '#',
          publishedAt: r.pubDate ? new Date(r.pubDate).toISOString() : new Date().toISOString(),
          sentiment: analyzeSentiment(title),
        };
      });
  } catch {
    return null;
  }
}

/* ── MarketAux demo fetch ── */
async function fetchFromMarketAux(): Promise<NewsItem[] | null> {
  try {
    const res = await fetch(
      'https://api.marketaux.com/v1/news/all?countries=in&filter_entities=true&language=en&api_token=demo&limit=10',
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const results = data?.data as Array<{ title: string; description: string; url: string; source: string; published_at: string }>;
    if (!Array.isArray(results)) return null;

    return results
      .filter((r) => r.title)
      .map((r) => {
        const title = r.title;
        return {
          id: generateId(title, 'marketaux'),
          title,
          description: r.description || '',
          source: r.source || 'MarketAux',
          url: r.url || '#',
          publishedAt: r.published_at ? new Date(r.published_at).toISOString() : new Date().toISOString(),
          sentiment: analyzeSentiment(title),
        };
      });
  } catch {
    return null;
  }
}

export async function getMarketNews(forceRefresh = false): Promise<{ items: NewsItem[]; fromCache: boolean; error: string | null }> {
  if (!forceRefresh) {
    const cached = getCache();
    if (cached) {
      return { items: cached.items, fromCache: true, error: null };
    }
  }

  let items: NewsItem[] | null = null;
  let error: string | null = null;

  // Try sources in order of reliability / CORS-friendliness
  items = await fetchFromReddit();
  if (!items || items.length === 0) {
    items = await fetchFromNewsData();
  }
  if (!items || items.length === 0) {
    items = await fetchFromMarketAux();
  }

  if (!items || items.length === 0) {
    items = FALLBACK_NEWS;
    error = 'Live news unavailable — showing fallback stories';
  }

  setCache(items);
  return { items, fromCache: false, error };
}

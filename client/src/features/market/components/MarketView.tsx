import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useEffect, useState } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import DashboardWidget from '@/features/dashboard/components/DashboardWidget';
import CosmosCard from '@/shared/components/ui/CosmosCard';
import SmartTriggers from '@/features/market/components/SmartTriggers';
import MarketStrategist from '@/features/market/components/MarketStrategist';
import MarketNewsFeed from '@/features/market/components/MarketNewsFeed';

const SECTORS = [
  { name: 'IT', change: 2.4, volume: '₹12,400Cr', trending: true },
  { name: 'Banking', change: -0.8, volume: '₹18,200Cr', trending: false },
  { name: 'Pharma', change: 1.2, volume: '₹6,800Cr', trending: true },
  { name: 'Auto', change: -1.5, volume: '₹9,100Cr', trending: false },
  { name: 'Energy', change: 0.6, volume: '₹14,500Cr', trending: true },
  { name: 'FMCG', change: 0.3, volume: '₹4,200Cr', trending: true },
  { name: 'Realty', change: 3.1, volume: '₹3,900Cr', trending: true },
  { name: 'Metal', change: -2.2, volume: '₹7,600Cr', trending: false },
  { name: 'Media', change: 0.9, volume: '₹1,800Cr', trending: true },
  { name: 'Infra', change: -0.4, volume: '₹5,300Cr', trending: false },
  { name: 'Consumer Durables', change: 1.8, volume: '₹2,700Cr', trending: true },
  { name: 'PSU Bank', change: -1.1, volume: '₹8,400Cr', trending: false },
];

const INDICATORS = [
  { label: 'NIFTY P/E', value: '23.4', status: 'Above Average', color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'RBI Repo Rate', value: '6.5%', status: 'Stable', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Inflation (CPI)', value: '6.2%', status: 'Elevated', color: 'text-rose-600', bg: 'bg-rose-50' },
  { label: 'Gold', value: '₹78,500', status: '+2.1%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'USD/INR', value: '83.2', status: 'Stable', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: '10Y G-Sec', value: '7.1%', status: 'Rising', color: 'text-amber-600', bg: 'bg-amber-50' },
];

interface MarketSnapshot {
  indices: { symbol: string; name: string; value: number; change: number; currency: string }[];
  watchlist: { symbol: string; name: string; price: number; change: number; spark: number[] }[];
  niftyHistory: { date: string; price: number }[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

const SENTIMENT_DATA = [
  { name: 'Bullish', value: 62, fill: '#10b981' },
  { name: 'Neutral', value: 24, fill: '#94a3b8' },
  { name: 'Bearish', value: 14, fill: '#ef4444' },
];

export default function MarketView() {
  const market = useWealthStore((s) => s.marketData);
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [calendar, setCalendar] = useState<{ date: string; event: string; impact: string; forecast: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [snapRes, calRes] = await Promise.all([
          fetch(`${API_BASE}/market/snapshot`),
          fetch(`${API_BASE}/market/calendar`),
        ]);
        const snap = await snapRes.json();
        const cal = await calRes.json();
        if (!cancelled) {
          setSnapshot(snap.success ? snap.data : null);
          setCalendar(cal.success ? cal.data : []);
        }
      } catch (e) {
        console.warn('Market snapshot failed', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const niftyData = snapshot?.niftyHistory?.map((d) => ({
    month: d.date.slice(5),
    value: d.price,
  })) || [];

  const WATCHLIST = snapshot?.watchlist || [];
  const globalIndices = snapshot?.indices.filter((i) => !['^NSEI', '^BSESN'].includes(i.symbol)) || [];
  const niftyQuote = snapshot?.indices.find((i) => i.symbol === '^NSEI');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-chart-line text-primary" />
              Market Intelligence
            </h1>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-extrabold border border-emerald-200">
              <i className="fas fa-bolt mr-1" />
              LIVE
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered market analysis, sector heatmap, and economic calendar</p>
        </div>
      </div>

      {/* Macro Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {INDICATORS.map((ind, i) => (
          <motion.div key={ind.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <CosmosCard variant="stat" padding="sm" className="text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{ind.label}</p>
              <p className="text-lg font-extrabold text-slate-800 dark:text-white">{ind.value}</p>
              <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full mt-1 ${ind.bg} ${ind.color}`}>{ind.status}</span>
            </CosmosCard>
          </motion.div>
        ))}
      </div>

      <SmartTriggers />
      <MarketStrategist />

      {/* Main Grid: NIFTY + Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardWidget title={`NIFTY 50 ${niftyQuote ? `— ${niftyQuote.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : ''}`} icon="fa-chart-area" subtitle="Live 12-month performance" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={niftyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={['dataMin - 1000', 'dataMax + 500']} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="value" stroke="#0f766e" fill="#0f766e" fillOpacity={0.08} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardWidget>

        <DashboardWidget title="Market Sentiment" icon="fa-gauge-high">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SENTIMENT_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={50} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: '0.75rem', border: 'none' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                  {SENTIMENT_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs font-bold text-emerald-600"><i className="fas fa-arrow-trend-up mr-1" />62% Bullish</p>
            <p className="text-[10px] text-slate-400">FII inflows +₹3,200Cr this week</p>
          </div>
        </DashboardWidget>
      </div>

      {/* Sector Heatmap */}
      <DashboardWidget title="Sector Performance" icon="fa-border-all" subtitle="Heatmap by intraday change">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {SECTORS.map((sector, i) => {
            const isUp = sector.change >= 0;
            const intensity = Math.min(Math.abs(sector.change) / 3.5, 1);
            return (
              <motion.div
                key={sector.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="p-3 rounded-xl border transition-all hover:shadow-md cursor-pointer"
                style={{
                  background: isUp ? `rgba(16, 185, 129, ${0.05 + intensity * 0.15})` : `rgba(239, 68, 68, ${0.05 + intensity * 0.15})`,
                  borderColor: isUp ? `rgba(16, 185, 129, ${0.2 + intensity * 0.3})` : `rgba(239, 68, 68, ${0.2 + intensity * 0.3})`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{sector.name}</span>
                  {sector.trending && <i className="fas fa-fire text-[9px] text-amber-500" />}
                </div>
                <p className={`text-sm font-extrabold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isUp ? '+' : ''}{sector.change}%
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">{sector.volume}</p>
              </motion.div>
            );
          })}
        </div>
      </DashboardWidget>

      {/* Watchlist + Economic Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="Your Watchlist" icon="fa-star" subtitle={loading ? 'Loading live quotes…' : 'Live quotes'}>
          <div className="space-y-2">
            {WATCHLIST.map((stock: typeof WATCHLIST[number]) => {
              const isUp = stock.change >= 0;
              const min = Math.min(...stock.spark);
              const max = Math.max(...stock.spark);
              const range = max - min || 1;
              return (
                <div key={stock.symbol} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-bold text-slate-500">{stock.symbol.slice(0, 3)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{stock.name}</p>
                    <p className="text-[10px] text-slate-400">{stock.symbol}</p>
                  </div>
                  <div className="hidden sm:flex items-end gap-px h-6 w-16">
                    {stock.spark.map((v, i) => {
                      const h = ((v - min) / range) * 100;
                      return <div key={i} className={`flex-1 rounded-sm ${isUp ? 'bg-emerald-400' : 'bg-rose-400'}`} style={{ height: `${Math.max(h, 10)}%` }} />;
                    })}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">₹{stock.price.toLocaleString()}</p>
                    <p className={`text-[10px] font-bold ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>{isUp ? '+' : ''}{stock.change}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardWidget>

        <DashboardWidget title="Economic Calendar" icon="fa-calendar-days" subtitle={loading ? 'Loading…' : undefined}>
          <div className="space-y-2">
            {calendar.map((event, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex-shrink-0 text-center w-16">
                  <p className="text-[10px] font-bold text-slate-500">{event.date}</p>
                  <span className={`inline-block mt-0.5 text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                    event.impact === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                  }`}>{event.impact.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{event.event}</p>
                  <p className="text-[10px] text-slate-400">{event.forecast}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardWidget>
      </div>

      {/* AI Market Insights + Global Indices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="AI Market Insights" icon="fa-robot">
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <p className="text-sm font-bold text-primary"><i className="fas fa-chart-line mr-2" />NIFTY P/E at {market.niftyPe}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Above historical average of 20. Consider staggered SIPs over lump sum investments.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <p className="text-sm font-bold text-amber-600"><i className="fas fa-triangle-exclamation mr-2" />Inflation Alert</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">CPI at {market.inflation}% is above RBI's 4% target. Allocate 15% to gold/FDs for stability.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <p className="text-sm font-bold text-emerald-600"><i className="fas fa-coins mr-2" />Gold Rally</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Gold prices surged 2.1% this week. Good hedge against inflation. Review allocation.</p>
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget title="Global Indices" icon="fa-globe">
          <div className="space-y-2">
            {globalIndices.map((idx) => (
              <div key={idx.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{idx.name}</p>
                  <p className="text-[10px] text-slate-400">{idx.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{idx.value?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  <p className={`text-[10px] font-bold ${idx.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{idx.change >= 0 ? '+' : ''}{idx.change?.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardWidget>
      </div>

      <MarketNewsFeed />
    </div>
  );
}

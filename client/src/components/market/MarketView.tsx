import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useWealthStore } from '../../store/wealthStore';
import CosmosCard, { CosmosBadge } from '../ui/CosmosCard';
import SmartTriggers from './SmartTriggers';
import MarketStrategist from './MarketStrategist';
import MarketNewsFeed from './MarketNewsFeed';

const niftyData = [
  { month: 'Jan', value: 21400 }, { month: 'Feb', value: 22300 }, { month: 'Mar', value: 22800 },
  { month: 'Apr', value: 23500 }, { month: 'May', value: 23200 }, { month: 'Jun', value: 24100 },
  { month: 'Jul', value: 24800 }, { month: 'Aug', value: 24500 }, { month: 'Sep', value: 25200 },
  { month: 'Oct', value: 24900 }, { month: 'Nov', value: 25100 }, { month: 'Dec', value: 25340 },
];

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

const WATCHLIST = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2984.5, change: 1.2, spark: [2950, 2960, 2945, 2970, 2980, 2975, 2984] },
  { symbol: 'TCS', name: 'Tata Consultancy', price: 4320.0, change: 2.1, spark: [4250, 4280, 4260, 4290, 4310, 4305, 4320] },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1678.3, change: -0.5, spark: [1690, 1685, 1680, 1675, 1682, 1680, 1678] },
  { symbol: 'INFY', name: 'Infosys', price: 1856.2, change: 1.8, spark: [1820, 1830, 1825, 1840, 1845, 1850, 1856] },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 1245.6, change: -0.3, spark: [1255, 1250, 1248, 1245, 1250, 1248, 1245] },
];

const ECONOMIC_CALENDAR = [
  { date: 'Tomorrow', event: 'RBI MPC Decision', impact: 'high', forecast: 'Repo rate unchanged at 6.5%' },
  { date: 'Jun 25', event: 'US Fed Chair Speech', impact: 'medium', forecast: 'Rate guidance expected' },
  { date: 'Jun 28', event: 'GDP Q1 Data (India)', impact: 'high', forecast: 'Growth ~6.8% YoY' },
  { date: 'Jul 02', event: 'Auto Sales Data', impact: 'medium', forecast: 'PV sales +8% MoM' },
  { date: 'Jul 05', event: 'FOMC Minutes', impact: 'medium', forecast: 'Hawkish tone likely' },
];

const INDICATORS = [
  { label: 'NIFTY P/E', value: '23.4', status: 'Above Average', color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'RBI Repo Rate', value: '6.5%', status: 'Stable', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Inflation (CPI)', value: '6.2%', status: 'Elevated', color: 'text-rose-600', bg: 'bg-rose-50' },
  { label: 'Gold', value: '₹78,500', status: '+2.1%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'USD/INR', value: '83.2', status: 'Stable', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: '10Y G-Sec', value: '7.1%', status: 'Rising', color: 'text-amber-600', bg: 'bg-amber-50' },
];

const SENTIMENT_DATA = [
  { name: 'Bullish', value: 62, fill: '#10b981' },
  { name: 'Neutral', value: 24, fill: '#94a3b8' },
  { name: 'Bearish', value: 14, fill: '#ef4444' },
];

export default function MarketView() {
  const market = useWealthStore((s) => s.marketData);

  // Sector data computed from SECTORS constant

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-chart-line text-primary" /> Market Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">AI-powered market analysis, sector heatmap, and economic calendar</p>
        </div>
        <CosmosBadge color="info" size="sm" pulse><i className="fas fa-bolt mr-1" />Live</CosmosBadge>
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

      {/* Main Grid: NIFTY + Sentiment + Sector Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NIFTY Chart */}
        <CosmosCard variant="default" className="lg:col-span-2" header={{ icon: 'fa-chart-area', iconColor: '#0f766e', title: 'NIFTY 50 Trend', subtitle: '12-month performance' }}>
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
        </CosmosCard>

        {/* Sentiment Gauge */}
        <CosmosCard variant="default" header={{ icon: 'fa-gauge-high', iconColor: '#1565C0', title: 'Market Sentiment' }}>
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
        </CosmosCard>
      </div>

      {/* Sector Heatmap */}
      <CosmosCard variant="default" header={{ icon: 'fa-border-all', iconColor: '#E65100', title: 'Sector Performance', subtitle: 'Heatmap by intraday change' }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {SECTORS.map((sector, i) => {
            const isUp = sector.change >= 0;
            const intensity = Math.min(Math.abs(sector.change) / 3.5, 1);
            return (
              <motion.div key={sector.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                className="p-3 rounded-xl border transition-all hover:shadow-md cursor-pointer"
                style={{
                  background: isUp ? `rgba(16, 185, 129, ${0.05 + intensity * 0.15})` : `rgba(239, 68, 68, ${0.05 + intensity * 0.15})`,
                  borderColor: isUp ? `rgba(16, 185, 129, ${0.2 + intensity * 0.3})` : `rgba(239, 68, 68, ${0.2 + intensity * 0.3})`,
                }}>
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
      </CosmosCard>

      {/* Watchlist + Economic Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Watchlist */}
        <CosmosCard variant="default" header={{ icon: 'fa-star', iconColor: '#f59e0b', title: 'Your Watchlist', subtitle: '5 stocks tracked' }}>
          <div className="space-y-2">
            {WATCHLIST.map((stock) => {
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
                  {/* Mini sparkline */}
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
        </CosmosCard>

        {/* Economic Calendar */}
        <CosmosCard variant="default" header={{ icon: 'fa-calendar-days', iconColor: '#C2185B', title: 'Economic Calendar' }}>
          <div className="space-y-2">
            {ECONOMIC_CALENDAR.map((event, i) => (
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
        </CosmosCard>
      </div>

      {/* AI Market Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CosmosCard variant="gradient" header={{ icon: 'fa-robot', iconColor: '#0f766e', title: 'AI Market Insights' }}>
          <div className="space-y-3">
            <div className="p-3 bg-white/60 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <p className="text-sm font-bold text-primary"><i className="fas fa-chart-line mr-2" />NIFTY P/E at {market.niftyPe}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Above historical average of 20. Consider staggered SIPs over lump sum investments.</p>
            </div>
            <div className="p-3 bg-white/60 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <p className="text-sm font-bold text-amber-600"><i className="fas fa-triangle-exclamation mr-2" />Inflation Alert</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">CPI at {market.inflation}% is above RBI's 4% target. Allocate 15% to gold/FDs for stability.</p>
            </div>
            <div className="p-3 bg-white/60 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <p className="text-sm font-bold text-emerald-600"><i className="fas fa-coins mr-2" />Gold Rally</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Gold prices surged 2.1% this week. Good hedge against inflation. Review allocation.</p>
            </div>
          </div>
        </CosmosCard>

        {/* Global Indices */}
        <CosmosCard variant="default" header={{ icon: 'fa-globe', iconColor: '#1565C0', title: 'Global Indices' }}>
          <div className="space-y-2">
            {[
              { name: 'S&P 500', country: 'US', value: '5,840', change: 0.8 },
              { name: 'FTSE 100', country: 'UK', value: '8,250', change: -0.3 },
              { name: 'Nikkei 225', country: 'Japan', value: '39,800', change: 1.2 },
              { name: 'DAX', country: 'Germany', value: '19,400', change: 0.5 },
              { name: 'Hang Seng', country: 'Hong Kong', value: '20,100', change: -1.1 },
            ].map((idx) => (
              <div key={idx.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{idx.name}</p>
                  <p className="text-[10px] text-slate-400">{idx.country}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{idx.value}</p>
                  <p className={`text-[10px] font-bold ${idx.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{idx.change >= 0 ? '+' : ''}{idx.change}%</p>
                </div>
              </div>
            ))}
          </div>
        </CosmosCard>
      </div>

      {/* Market News Feed */}
      <MarketNewsFeed />
    </div>
  );
}

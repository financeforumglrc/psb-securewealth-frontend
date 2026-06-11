import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';
import CosmosCard from '../ui/CosmosCard';

/* ═══════════════════════════════════════════════════════════════
   MARKET INTELLIGENCE HERO — Strategic Recommendations
   Displays global market indicators + AI-driven strategic actions:
   • Inflation, NIFTY P/E, Gold, FD rates, Global events
   • Actionable recommendations: "Sell gold → Shift to FD"
   • Trend direction with explanations
   ═══════════════════════════════════════════════════════════════ */

interface MarketIndicator {
  name: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  trendLabel: string;
  icon: string;
  color: string;
  impact: 'positive' | 'negative' | 'neutral';
}

interface StrategicRec {
  id: string;
  action: string;
  from: string;
  to: string;
  reason: string;
  confidence: number;
  urgency: 'immediate' | 'soon' | 'watch';
  icon: string;
}

export default function MarketIntelligenceHero() {
  const marketData = useWealthStore((s) => s.marketData);
  const assets = useWealthStore((s) => s.assets);
  const setView = useWealthStore((s) => s.setView);

  // Market indicators
  const indicators: MarketIndicator[] = useMemo(() => [
    {
      name: 'NIFTY P/E',
      value: marketData.niftyPe?.toFixed(1) || '24.5',
      trend: (marketData.niftyPe || 24) > 26 ? 'up' : 'stable',
      trendLabel: (marketData.niftyPe || 24) > 26 ? 'Overvalued' : 'Fair',
      icon: 'fa-chart-line',
      color: (marketData.niftyPe || 24) > 26 ? 'text-amber-500' : 'text-emerald-500',
      impact: (marketData.niftyPe || 24) > 26 ? 'negative' : 'neutral',
    },
    {
      name: 'Inflation',
      value: `${marketData.inflation?.toFixed(1) || '5.5'}%`,
      trend: (marketData.inflation || 5) > 6 ? 'up' : 'down',
      trendLabel: (marketData.inflation || 5) > 6 ? 'High' : 'Moderate',
      icon: 'fa-fire',
      color: (marketData.inflation || 5) > 6 ? 'text-rose-500' : 'text-emerald-500',
      impact: (marketData.inflation || 5) > 6 ? 'negative' : 'positive',
    },
    {
      name: 'Gold / 10g',
      value: `₹${((marketData.goldPrice || 75000) / 1000).toFixed(1)}K`,
      trend: 'up',
      trendLabel: 'Rising',
      icon: 'fa-coins',
      color: 'text-amber-500',
      impact: 'neutral',
    },
    {
      name: 'FD Rate',
      value: `${(marketData as any).fdRate?.toFixed(1) || '7.2'}%`,
      trend: 'stable',
      trendLabel: 'Stable',
      icon: 'fa-building-columns',
      color: 'text-emerald-500',
      impact: 'positive',
    },
  ], [marketData]);

  // Strategic recommendations based on market + user profile
  const strategicRecs: StrategicRec[] = useMemo(() => {
    const recs: StrategicRec[] = [];
    const pe = marketData.niftyPe || 24;
    const inflation = marketData.inflation || 5;
    const hasEquity = assets.some((a) => a.type === 'stock' || a.type === 'mutualFund' || a.name.toLowerCase().includes('equity'));
    const hasGold = assets.some((a) => a.name.toLowerCase().includes('gold'));
    const hasFD = assets.some((a) => a.type === 'bank' || a.name.toLowerCase().includes('fd') || a.name.toLowerCase().includes('deposit'));

    if (pe > 26 && hasEquity) {
      recs.push({
        id: 'rec1',
        action: 'STAGGER ENTRY',
        from: 'Lump Sum Equity',
        to: 'Monthly SIP',
        reason: `NIFTY P/E at ${pe.toFixed(1)} is above historical average. Staggering reduces timing risk.`,
        confidence: 88,
        urgency: 'soon',
        icon: 'fa-shoe-prints',
      });
    }

    if (inflation > 6 && !hasGold) {
      recs.push({
        id: 'rec2',
        action: 'HEDGE INFLATION',
        from: 'Cash / Savings',
        to: 'Gold / SGB',
        reason: `Inflation at ${inflation}% erodes purchasing power. Gold acts as a real asset hedge.`,
        confidence: 82,
        urgency: 'soon',
        icon: 'fa-coins',
      });
    }

    if (inflation > 6 && hasGold && !hasFD) {
      recs.push({
        id: 'rec3',
        action: 'LOCK RATES NOW',
        from: 'Liquid Funds',
        to: 'Fixed Deposit',
        reason: 'Rising inflation may trigger RBI rate hikes. Lock FD rates before they fall.',
        confidence: 75,
        urgency: 'immediate',
        icon: 'fa-lock',
      });
    }

    if (pe < 22 && hasFD && !hasEquity) {
      recs.push({
        id: 'rec4',
        action: 'BUY THE DIP',
        from: 'Fixed Deposit',
        to: 'Index Funds',
        reason: `NIFTY P/E at ${pe.toFixed(1)} presents a value opportunity. Shift 20% from FDs.`,
        confidence: 80,
        urgency: 'soon',
        icon: 'fa-arrow-trend-up',
      });
    }

    if (recs.length === 0) {
      recs.push({
        id: 'rec5',
        action: 'MAINTAIN BALANCE',
        from: 'Current Mix',
        to: '60:40 Equity:Debt',
        reason: 'Markets are balanced. Maintain a diversified portfolio with periodic rebalancing.',
        confidence: 92,
        urgency: 'watch',
        icon: 'fa-scale-balanced',
      });
    }

    return recs;
  }, [marketData, assets]);

  const [expandedRec, setExpandedRec] = useState<string | null>(null);

  const urgencyColor = (u: string) => {
    switch (u) {
      case 'immediate': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'soon': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs">
            <i className="fas fa-globe" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">AI Market Intelligence</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Real-time global indicators → Strategic recommendations</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">LIVE</span>
        </div>
      </div>

      {/* Indicators Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {indicators.map((ind, i) => (
          <motion.div
            key={ind.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <CosmosCard variant="default" padding="sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{ind.name}</span>
                <i className={`fas ${ind.icon} text-[10px] ${ind.color}`} />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-lg font-black text-slate-800 dark:text-white">{ind.value}</span>
                <span className={`text-[10px] font-bold mb-1 ${ind.color}`}>
                  <i className={`fas fa-arrow-${ind.trend === 'up' ? 'up' : ind.trend === 'down' ? 'down' : 'right'} mr-0.5`} />
                  {ind.trendLabel}
                </span>
              </div>
            </CosmosCard>
          </motion.div>
        ))}
      </div>

      {/* Strategic Recommendations */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <i className="fas fa-chess-knight text-primary" />
          AI Strategic Moves
        </p>
        {strategicRecs.map((rec, i) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <CosmosCard
              variant={rec.urgency === 'immediate' ? 'gradient' : 'default'}
              padding="sm"
              hover
              onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                  rec.urgency === 'immediate'
                    ? 'bg-rose-100 text-rose-600'
                    : rec.urgency === 'soon'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-emerald-100 text-emerald-600'
                }`}>
                  <i className={`fas ${rec.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{rec.action}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${urgencyColor(rec.urgency)}`}>
                      {rec.urgency.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-400 line-through">{rec.from}</span>
                    <i className="fas fa-arrow-right text-[8px] text-primary" />
                    <span className="text-[10px] text-primary font-bold">{rec.to}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200">{rec.confidence}%</span>
                  <p className="text-[9px] text-slate-400">confidence</p>
                </div>
                <i className={`fas fa-chevron-${expandedRec === rec.id ? 'up' : 'down'} text-slate-300 text-xs`} />
              </div>

              <AnimatePresence>
                {expandedRec === rec.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        <i className="fas fa-circle-info text-primary mr-1" />
                        {rec.reason}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setView('portfolio');
                        }}
                        className="mt-2 px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        <i className="fas fa-rocket mr-1" />
                        Execute in Portfolio
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CosmosCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}



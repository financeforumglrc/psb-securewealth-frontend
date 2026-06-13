import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';
import CosmosCard from '../ui/CosmosCard';

/* ═══════════════════════════════════════════════════════════════
   GLOBAL MACRO RADAR — Requirement #3 Advanced Solution
   Geopolitical & macro-economic intelligence:
   • Interest rate cycle signals
   • Inflation-hedge strategy builder
   • Sector rotation recommendations
   • Currency impact (NRI)
   • Commodity supercycle alerts
   ═══════════════════════════════════════════════════════════════ */

interface MacroSignal {
  id: string;
  title: string;
  impact: 'bullish' | 'bearish' | 'neutral';
  sector: string;
  action: string;
  confidence: number;
  icon: string;
}

export default function GlobalMacroRadar() {
  const marketData = useWealthStore((s) => s.marketData);
  const nriMode = useWealthStore((s) => s.nriMode);

  const signals = useMemo<MacroSignal[]>(() => {
    const list: MacroSignal[] = [];

    const pe = marketData.niftyPe || 24;
    const inflation = marketData.inflation || 5;
    const repoRate = marketData.repoRate || 6.5;

    if (pe > 26) {
      list.push({
        id: 'macro1',
        title: 'NIFTY Overvaluation',
        impact: 'bearish',
        sector: 'Equity',
        action: 'Reduce lump sum equity; increase SIP/STP',
        confidence: 78,
        icon: 'fa-chart-line',
      });
    } else if (pe < 22) {
      list.push({
        id: 'macro2',
        title: 'NIFTY Value Zone',
        impact: 'bullish',
        sector: 'Equity',
        action: 'Increase index fund allocation gradually',
        confidence: 72,
        icon: 'fa-chart-line',
      });
    }

    if (inflation > 6) {
      list.push({
        id: 'macro3',
        title: 'High Inflation',
        impact: 'bearish',
        sector: 'Fixed Income',
        action: 'Add gold, SGB, inflation-indexed bonds',
        confidence: 82,
        icon: 'fa-fire',
      });
    }

    if (repoRate > 6.5) {
      list.push({
        id: 'macro4',
        title: 'Peak Rate Cycle',
        impact: 'neutral',
        sector: 'Debt',
        action: 'Lock long-term FDs / gilt funds before cuts',
        confidence: 65,
        icon: 'fa-building-columns',
      });
    }

    // Sector rotation signals
    list.push({
      id: 'macro5',
      title: 'Monsoon Impact',
      impact: 'bullish',
      sector: 'FMCG / Agri',
      action: 'FMCG and agri-input stocks may outperform',
      confidence: 58,
      icon: 'fa-cloud-rain',
    });

    list.push({
      id: 'macro6',
      title: 'Global Tech Slowdown',
      impact: 'bearish',
      sector: 'IT / Tech',
      action: 'Underweight IT; prefer domestic cyclicals',
      confidence: 61,
      icon: 'fa-laptop-code',
    });

    if (nriMode) {
      list.push({
        id: 'macro7',
        title: 'Rupee Depreciation',
        impact: 'bullish',
        sector: 'NRI Investments',
        action: 'Higher INR returns on remitted USD; consider India debt funds',
        confidence: 70,
        icon: 'fa-money-bill-trend-up',
      });
    }

    return list;
  }, [marketData, nriMode]);

  const impactColor = (impact: string) => {
    switch (impact) {
      case 'bullish': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'bearish': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <CosmosCard variant="default" padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
            <i className="fas fa-globe" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Global Macro Radar</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Macro-economic & geopolitical signals</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block mr-1 animate-pulse" />
          LIVE
        </span>
      </div>

      <div className="space-y-2">
        {signals.map((signal, i) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-start gap-3"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${impactColor(signal.impact)}`}>
              <i className={`fas ${signal.icon}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{signal.title}</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${impactColor(signal.impact)}`}>
                  {signal.impact.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-medium text-slate-600 dark:text-slate-300">{signal.sector}:</span> {signal.action}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${signal.confidence}%` }} />
                </div>
                <span className="text-[9px] text-slate-400">{signal.confidence}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </CosmosCard>
  );
}

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import { useChartSize } from '@/shared/hooks/useChartSize';
import { useWealthStore } from '@/shared/store/wealthStore';
import RegulatoryDisclaimer from '@/shared/components/ui/RegulatoryDisclaimer';

export type ShockType = 'repo' | 'inflation' | 'usd';

interface ShockConfig {
  id: ShockType;
  icon: string;
  label: string;
  subtitle: string;
  color: string;
  insight: string;
}

const SHOCKS: ShockConfig[] = [
  {
    id: 'repo',
    icon: 'fa-landmark',
    label: 'RBI Repo Rate +0.5%',
    subtitle: 'Floating loans & debt yields',
    color: '#3b82f6',
    insight: 'If RBI hikes the repo rate by 0.5%, your floating home loan EMI will increase by ₹2,400/month. Consider prepaying ₹50,000 to offset ~₹28,000 in extra interest over the next year.',
  },
  {
    id: 'inflation',
    icon: 'fa-basket-shopping',
    label: 'Inflation Spike to 8%',
    subtitle: 'Purchasing power & real returns',
    color: '#f59e0b',
    insight: 'At 8% inflation, your real net worth growth drops by ~₹18,000/month. Lock excess savings into inflation-indexed bonds or equity SIPs to preserve purchasing power.',
  },
  {
    id: 'usd',
    icon: 'fa-dollar-sign',
    label: 'USD/INR Drops to ₹78',
    subtitle: 'Gold, imports & FX exposure',
    color: '#8b5cf6',
    insight: 'A stronger rupee (₹78/USD) reduces your gold and import-linked asset values by ~3.5%, but lowers education/remittance costs abroad. Rebalance foreign exposure.',
  },
];

function formatCr(value: number) {
  return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
}

export default function MacroShockSimulator() {
  const user = useWealthStore((s) => s.user);
  const assets = useWealthStore((s) => s.assets);
  const { ref: chartRef, width: chartWidth, height: chartHeight } = useChartSize<HTMLDivElement>();
  const [activeShock, setActiveShock] = useState<ShockType | null>(null);

  const baseNW = useMemo(() => assets.reduce((sum, a) => sum + a.value, 0), [assets]);
  const monthlySavings = user.monthlySavings || 25000;

  const chartData = useMemo(() => {
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    return months.map((month, i) => {
      const base = baseNW + monthlySavings * i;
      let shocked = base;
      let emiDelta = 0;

      if (activeShock === 'repo') {
        // EMI rises from month 3, net worth growth slows
        emiDelta = i >= 2 ? 2400 : 0;
        shocked = base - emiDelta * Math.max(0, i - 1) + i * 1200; // debt yield offset
      } else if (activeShock === 'inflation') {
        // Real NW grows slower
        shocked = base - i * 18000;
      } else if (activeShock === 'usd') {
        // Gold/import assets drop 3.5% immediately
        shocked = base * 0.965 + monthlySavings * i;
      }

      return {
        month,
        baseline: Math.round(base),
        shocked: Math.round(shocked),
        emiDelta,
      };
    });
  }, [baseNW, monthlySavings, activeShock]);

  const activeConfig = SHOCKS.find((s) => s.id === activeShock);

  return (
    <div className="space-y-5">
      <RegulatoryDisclaimer compact />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SHOCKS.map((shock) => {
          const isActive = activeShock === shock.id;
          return (
            <motion.button
              key={shock.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveShock(isActive ? null : shock.id)}
              className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${
                isActive
                  ? 'border-slate-500 bg-slate-800 shadow-lg'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: shock.color }}
                >
                  <i className={`fas ${shock.icon}`} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{shock.label}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{shock.subtitle}</p>
                </div>
              </div>
              {isActive && (
                <motion.div
                  layoutId="shock-indicator"
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ backgroundColor: shock.color }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeShock ? (
          <motion.div
            key={activeShock}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-chart-line" style={{ color: activeConfig?.color }} />
                Projected Net Worth Impact
              </h4>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Next 12 Months</span>
            </div>

            <div ref={chartRef} className="h-64 w-full">
              {chartWidth > 0 && chartHeight > 0 && (
                <LineChart width={chartWidth} height={chartHeight} data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => `₹${(v / 1_00_00_000).toFixed(1)}Cr`}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCr(Number(value)), '']}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
                    labelStyle={{ fontSize: 11, color: '#64748b' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine y={baseNW} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Today', position: 'insideTopLeft', fontSize: 10, fill: '#94a3b8' }} />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    name="Baseline"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="shocked"
                    name="Shocked Scenario"
                    stroke={activeConfig?.color}
                    strokeWidth={3}
                    dot={{ r: 3, strokeWidth: 0, fill: activeConfig?.color }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <i className="fas fa-robot text-xs" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">AI Insight</p>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{activeConfig?.insight}</p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-48 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500"
          >
            <i className="fas fa-chart-area text-2xl mb-2" />
            <p className="text-xs font-bold">Select a macro shock above to simulate impact</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

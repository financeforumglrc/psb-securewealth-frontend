import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { backendApi } from '@/shared/lib/backendApi';
import { useChartSize } from '@/shared/hooks/useChartSize';
import RegulatoryDisclaimer from '@/shared/components/ui/RegulatoryDisclaimer';

interface CashFlowMonth {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
}

const DEMO_CASH_FLOW: CashFlowMonth[] = [
  { month: 'Apr', inflow: 2000000, outflow: 1750000, net: 250000 },
  { month: 'May', inflow: 1850000, outflow: 1900000, net: -50000 },
  { month: 'Jun', inflow: 1950000, outflow: 1800000, net: 150000 },
  { month: 'Jul', inflow: 2250000, outflow: 1850000, net: 400000 },
  { month: 'Aug', inflow: 1900000, outflow: 2000000, net: -100000 },
  { month: 'Sep', inflow: 2050000, outflow: 1780000, net: 270000 },
  { month: 'Oct', inflow: 2150000, outflow: 1820000, net: 330000 },
  { month: 'Nov', inflow: 1980000, outflow: 1950000, net: 30000 },
  { month: 'Dec', inflow: 2400000, outflow: 2100000, net: 300000 },
  { month: 'Jan', inflow: 1900000, outflow: 1880000, net: 20000 },
  { month: 'Feb', inflow: 2050000, outflow: 1800000, net: 250000 },
  { month: 'Mar', inflow: 2200000, outflow: 1950000, net: 250000 },
];

function formatLakh(value: number) {
  return `₹${(value / 1_00_000).toFixed(1)}L`;
}

export default function CashFlowTimeline() {
  const [data, setData] = useState<CashFlowMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, width, height } = useChartSize<HTMLDivElement>();

  useEffect(() => {
    backendApi.getCashFlow().then((res) => {
      if (res.ok && Array.isArray(res.data?.data) && res.data.data.length > 0) {
        setData(res.data.data);
      } else {
        setData(DEMO_CASH_FLOW);
      }
      setLoading(false);
    });
  }, []);

  const totalInflow = data.reduce((s, d) => s + d.inflow, 0);
  const totalOutflow = data.reduce((s, d) => s + d.outflow, 0);
  const netTotal = totalInflow - totalOutflow;
  const negativeMonths = data.filter((d) => d.net < 0).length;

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        <i className="fas fa-circle-notch fa-spin mr-2" /> Loading cash flow…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RegulatoryDisclaimer compact />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Inflow', value: formatLakh(totalInflow), color: 'text-emerald-600' },
          { label: 'Total Outflow', value: formatLakh(totalOutflow), color: 'text-rose-600' },
          { label: 'Net Cashflow', value: formatLakh(netTotal), color: netTotal >= 0 ? 'text-emerald-600' : 'text-rose-600' },
          { label: 'Negative Months', value: negativeMonths, color: negativeMonths > 0 ? 'text-amber-600' : 'text-emerald-600' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
          >
            <p className="text-[10px] text-slate-400 uppercase font-bold">{s.label}</p>
            <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div
        ref={ref}
        className="h-72 w-full min-w-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 flex items-center justify-center"
      >
        <ComposedChart
          width={width || ref.current?.clientWidth || 800}
          height={height || ref.current?.clientHeight || 260}
          data={data}
          margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => `₹${(v / 1_00_000).toFixed(0)}L`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={50} />
          <Tooltip formatter={(value: any) => [formatLakh(Number(value)), '']} contentStyle={{ borderRadius: 12, border: 'none' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="inflow" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="outflow" name="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="net" name="Net (surplus / shortage)" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.net >= 0 ? '#22c55e' : '#f43f5e'} />
            ))}
          </Bar>
          <Line type="monotone" dataKey="net" name="Net trend" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </div>

      {negativeMonths > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
          <i className="fas fa-triangle-exclamation mt-0.5" />
          <span><strong>Liquidity alert:</strong> {negativeMonths} month(s) show cash outflow exceeding inflow. Consider invoice discounting or a short-term CC/OD facility.</span>
        </motion.div>
      )}
    </div>
  );
}

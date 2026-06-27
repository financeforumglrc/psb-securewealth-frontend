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
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { backendApi } from '@/shared/lib/backendApi';
import RegulatoryDisclaimer from '@/shared/components/ui/RegulatoryDisclaimer';

interface CashFlowMonth {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
}

function formatLakh(value: number) {
  return `₹${(value / 1_00_000).toFixed(1)}L`;
}

export default function CashFlowTimeline() {
  const [data, setData] = useState<CashFlowMonth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backendApi.getCashFlow().then((res) => {
      if (res.ok && Array.isArray(res.data?.data)) {
        setData(res.data.data);
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

      <div className="h-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `₹${(v / 1_00_000).toFixed(0)}L`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={50} />
            <Tooltip formatter={(value: any) => [formatLakh(Number(value)), '']} contentStyle={{ borderRadius: 12, border: 'none' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="inflow" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outflow" name="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="net" name="Net" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
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

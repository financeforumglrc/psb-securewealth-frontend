import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { backendApi } from '@/shared/lib/backendApi';
import RegulatoryDisclaimer from '@/shared/components/ui/RegulatoryDisclaimer';

interface WorkingCapital {
  currentRatio: number;
  quickRatio: number;
  receivableDays: number;
  payableDays: number;
  inventoryDays: number;
  cashConversionCycle: number;
  score: number;
  grade: string;
}

const DEMO_WORKING_CAPITAL: WorkingCapital = {
  currentRatio: 1.42,
  quickRatio: 1.18,
  receivableDays: 38,
  payableDays: 32,
  inventoryDays: 24,
  cashConversionCycle: 30,
  score: 78,
  grade: 'B+',
};

function getGradeColor(grade: string) {
  const bucket = grade?.[0]?.toUpperCase();
  switch (bucket) {
    case 'A': return 'text-emerald-600';
    case 'B': return 'text-blue-600';
    case 'C': return 'text-amber-600';
    default: return 'text-rose-600';
  }
}

function getRatioColor(value: number) {
  if (value >= 1.5) return 'text-emerald-600';
  if (value >= 1.0) return 'text-amber-600';
  return 'text-rose-600';
}

export default function WorkingCapitalHealth() {
  const [data, setData] = useState<WorkingCapital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backendApi.getWorkingCapital().then((res) => {
      if (res.ok && res.data?.data) {
        setData(res.data.data);
      } else {
        setData(DEMO_WORKING_CAPITAL);
      }
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        <i className="fas fa-circle-notch fa-spin mr-2" /> Checking working capital…
      </div>
    );
  }

  const alerts = [
    data.currentRatio < 1.2 && { icon: 'fa-droplet', text: 'Current ratio below 1.2 — build a liquidity buffer' },
    data.quickRatio < 1.0 && { icon: 'fa-bolt', text: 'Quick ratio below 1.0 — receivables may be tied up too long' },
    data.receivableDays > 45 && { icon: 'fa-file-invoice-dollar', text: `Receivables at ${data.receivableDays} days — tighten credit policy` },
    data.cashConversionCycle > 60 && { icon: 'fa-rotate', text: `Cash conversion cycle ${data.cashConversionCycle} days — negotiate better supplier terms` },
  ].filter(Boolean) as { icon: string; text: string }[];

  return (
    <div className="space-y-4">
      <RegulatoryDisclaimer compact />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Working Capital Score</p>
            <p className="text-4xl font-black text-slate-800 dark:text-white">{data.score}<span className="text-base text-slate-400">/100</span></p>
            <p className="text-xs mt-1 text-slate-500">Grade <span className={`font-black ${getGradeColor(data.grade)}`}>{data.grade}</span></p>
          </div>
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
              <path className="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              <motion.path
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${data.score}, 100` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className={data.score >= 70 ? 'text-emerald-500' : data.score >= 50 ? 'text-amber-500' : 'text-rose-500'}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Current Ratio', value: data.currentRatio.toFixed(2), suffix: '', info: 'assets/liabilities', colorClass: getRatioColor(data.currentRatio) },
            { label: 'Quick Ratio', value: data.quickRatio.toFixed(2), suffix: '', info: 'acid-test', colorClass: getRatioColor(data.quickRatio) },
            { label: 'Receivable Days', value: data.receivableDays, suffix: 'd', info: 'DSO', colorClass: 'text-slate-800 dark:text-white' },
            { label: 'Payable Days', value: data.payableDays, suffix: 'd', info: 'DPO', colorClass: 'text-slate-800 dark:text-white' },
            { label: 'Inventory Days', value: data.inventoryDays, suffix: 'd', info: 'DIO', colorClass: 'text-slate-800 dark:text-white' },
            { label: 'Cash Cycle', value: data.cashConversionCycle, suffix: 'd', info: 'CCC', colorClass: 'text-slate-800 dark:text-white' },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
            >
              <p className="text-[9px] text-slate-400 uppercase font-bold">{m.label}</p>
              <p className={`text-lg font-black ${m.colorClass}`}>{m.value}{m.suffix}</p>
              <p className="text-[9px] text-slate-500">{m.info}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <i className="fas fa-user-doctor text-primary" /> AI-Detected Action Items
          </h4>
          {alerts.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2"
            >
              <i className={`fas ${a.icon} mt-0.5`} />
              <span>{a.text}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

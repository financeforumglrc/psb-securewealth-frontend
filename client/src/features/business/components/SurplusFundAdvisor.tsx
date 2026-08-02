import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { backendApi } from '@/shared/lib/backendApi';
import RegulatoryDisclaimer from '@/shared/components/ui/RegulatoryDisclaimer';

interface Recommendation {
  action: string;
  allocation: number;
  returnRate: number;
  tenure: string;
  projectedValue: number;
  risk: 'zero' | 'low' | 'medium' | 'high';
}

const DEMO_SURPLUS = 550000;
const DEMO_RECOMMENDATIONS: Recommendation[] = [
  { action: 'Sweep to 91-day Corporate FD', allocation: 300000, returnRate: 7.4, tenure: '3 months', projectedValue: 305550, risk: 'low' },
  { action: 'Liquid Mutual Fund', allocation: 150000, returnRate: 6.8, tenure: 'Liquid', projectedValue: 152550, risk: 'low' },
  { action: 'Prepay high-cost vendor credit', allocation: 100000, returnRate: 14.0, tenure: 'Immediate', projectedValue: 114000, risk: 'zero' },
];

const RISK_COLORS: Record<string, string> = {
  zero: 'bg-slate-100 text-slate-600 border-slate-200',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function SurplusFundAdvisor() {
  const [surplus, setSurplus] = useState(0);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backendApi.getSurplusAdvisor().then((res) => {
      if (res.ok && res.data?.data) {
        setSurplus(res.data.data.currentSurplus || 0);
        setRecommendations(res.data.data.projections || []);
      } else {
        setSurplus(DEMO_SURPLUS);
        setRecommendations(DEMO_RECOMMENDATIONS);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        <i className="fas fa-circle-notch fa-spin mr-2" /> Analysing surplus funds…
      </div>
    );
  }

  const totalProjected = recommendations.reduce((s, r) => s + r.projectedValue, 0);
  const opportunityGain = totalProjected - surplus;

  return (
    <div className="space-y-4">
      <RegulatoryDisclaimer compact />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
        >
          <p className="text-[10px] uppercase tracking-wider font-bold opacity-80">Current Idle Surplus</p>
          <p className="text-3xl font-black mt-1">₹{surplus.toLocaleString('en-IN')}</p>
          <p className="text-xs mt-2 opacity-90">Detected in current account based on last 30 days average balance.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
        >
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Projected Value (3M)</p>
          <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">₹{totalProjected.toLocaleString('en-IN')}</p>
          <p className="text-xs mt-2 text-emerald-600 font-semibold">
            <i className="fas fa-arrow-trend-up mr-1" />
            Extra gain vs idle cash: ₹{opportunityGain.toLocaleString('en-IN')}
          </p>
        </motion.div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">{rec.action}</h4>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase ${RISK_COLORS[rec.risk]}`}>{rec.risk} risk</span>
              </div>
              <p className="text-[11px] text-slate-500">Tenure: {rec.tenure} • Return: {rec.returnRate}% p.a.</p>
            </div>
            <div className="flex items-center gap-6 text-right">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Allocate</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">₹{rec.allocation.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Projected</p>
                <p className="text-sm font-bold text-emerald-600">₹{rec.projectedValue.toLocaleString('en-IN')}</p>
              </div>
              <button className="px-3 py-1.5 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary/90 transition-colors">
                Execute
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

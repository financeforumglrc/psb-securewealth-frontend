import { useState } from 'react';
import { motion } from 'framer-motion';
import RegulatoryDisclaimer from '@/shared/components/ui/RegulatoryDisclaimer';

const GST_SLABS = [
  { label: '0% (Exempt)', rate: 0 },
  { label: '5%', rate: 5 },
  { label: '12%', rate: 12 },
  { label: '18%', rate: 18 },
  { label: '28%', rate: 28 },
];

export default function GSTEstimator() {
  const [turnover, setTurnover] = useState('2468000');
  const [slab, setSlab] = useState(18);
  const [credits, setCredits] = useState('45000');

  const turnoverNum = Number(turnover) || 0;
  const creditsNum = Number(credits) || 0;
  const gstOnSales = turnoverNum * (slab / 100);
  const netLiability = Math.max(0, gstOnSales - creditsNum);

  return (
    <div className="space-y-4">
      <RegulatoryDisclaimer compact />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4"
        >
          <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-calculator text-primary" /> GST Inputs
          </h3>

          <div>
            <label className="text-xs text-slate-500 font-bold block mb-1">Monthly taxable turnover (₹)</label>
            <input
              type="number"
              value={turnover}
              onChange={(e) => setTurnover(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 font-bold block mb-1">GST slab</label>
            <div className="flex flex-wrap gap-2">
              {GST_SLABS.map((s) => (
                <button
                  key={s.rate}
                  onClick={() => setSlab(s.rate)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                    slab === s.rate
                      ? 'bg-primary text-white border-primary'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-bold block mb-1">Input tax credit (₹)</label>
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/10 dark:to-blue-900/10 border border-emerald-100 dark:border-emerald-900/30"
        >
          <h3 className="text-sm font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <i className="fas fa-file-invoice text-emerald-600" /> Estimated Liability
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">GST on sales</span>
              <span className="font-bold text-slate-800 dark:text-white">₹{(gstOnSales).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Input tax credit</span>
              <span className="font-bold text-slate-800 dark:text-white">-₹{creditsNum.toLocaleString('en-IN')}</span>
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-800 dark:text-white">Net GST payable</span>
              <span className="text-xl font-black text-emerald-600">₹{Math.round(netLiability).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-white/60 dark:bg-slate-900/40 text-[11px] text-slate-600 dark:text-slate-300">
            <i className="fas fa-circle-info mr-1 text-blue-500" />
            This is an indicative estimate. Actual filing must be done on the GST portal.
          </div>
        </motion.div>
      </div>
    </div>
  );
}

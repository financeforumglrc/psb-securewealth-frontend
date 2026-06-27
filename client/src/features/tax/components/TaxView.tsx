import { motion } from 'framer-motion';
import TaxCalculator from './TaxCalculator';

const RECOMMENDATIONS = [
  { name: 'ELSS Mutual Fund', category: '80C', limit: '₹1.5L', returns: '12% avg', lockIn: '3 years', icon: 'fa-chart-line' },
  { name: 'PPF', category: '80C', limit: '₹1.5L', returns: '7.1%', lockIn: '15 years', icon: 'fa-landmark' },
  { name: 'NPS Tier 1', category: '80CCD(1B)', limit: '₹50K', returns: '9% avg', lockIn: 'Till 60', icon: 'fa-user-clock' },
  { name: 'Health Insurance', category: '80D', limit: '₹25K', returns: 'N/A', lockIn: 'N/A', icon: 'fa-shield-heart' },
  { name: 'Tax Saver FD', category: '80C', limit: '₹1.5L', returns: '7.5%', lockIn: '5 years', icon: 'fa-lock' },
  { name: 'Sukanya Samriddhi', category: '80C', limit: '₹1.5L', returns: '8.2%', lockIn: '21 years', icon: 'fa-child' },
];

export default function TaxView() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-file-invoice-dollar text-primary" /> Tax Optimizer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Old vs new regime, 80C tracker, and deadline reminders.</p>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
          <i className="fas fa-lock" /> On-device computation
        </span>
      </div>

      <TaxCalculator />

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <i className="fas fa-thumbs-up text-primary" /> Popular Tax-Saving Instruments
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {RECOMMENDATIONS.map((rec, i) => (
            <motion.div
              key={rec.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <i className={`fas ${rec.icon} text-xs`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{rec.name}</p>
                  <p className="text-[9px] text-slate-500">{rec.category} • Limit {rec.limit}</p>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Returns: <span className="font-bold text-emerald-600">{rec.returns}</span></span>
                <span>Lock-in: {rec.lockIn}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import RegulatoryDisclaimer from '@/shared/components/ui/RegulatoryDisclaimer';

const OVERVIEW_CARDS = [
  { label: 'Revenue YTD', value: '₹246.8L', delta: '+12.4%', icon: 'fa-sack-dollar', color: 'emerald' },
  { label: 'Expenses YTD', value: '₹225.8L', delta: '+8.1%', icon: 'fa-money-bill-wave', color: 'rose' },
  { label: 'Net Surplus', value: '₹21.0L', delta: '+4.3%', icon: 'fa-piggy-bank', color: 'blue' },
  { label: 'GST Liability', value: '₹3.4L', delta: 'Due 20th', icon: 'fa-file-invoice', color: 'amber' },
];

const QUICK_ACTIONS = [
  { id: 'cashflow', label: 'Cash Flow', icon: 'fa-chart-column', desc: '12-month timeline' },
  { id: 'working-capital', label: 'Working Capital', icon: 'fa-heart-pulse', desc: 'Health score & ratios' },
  { id: 'surplus', label: 'Surplus Advisor', icon: 'fa-piggy-bank', desc: 'Deploy idle cash' },
  { id: 'gst', label: 'GST Estimator', icon: 'fa-calculator', desc: 'Quick tax preview' },
  { id: 'invoices', label: 'Invoices', icon: 'fa-file-invoice-dollar', desc: 'Track receivables' },
  { id: 'vendors', label: 'Vendor Payments', icon: 'fa-handshake', desc: 'Discount optimizer' },
];

const CREDIT_HEALTH = {
  score: 82,
  grade: 'Good',
  factors: [
    { label: 'Repayment history', status: 'Excellent', color: 'emerald' },
    { label: 'Credit utilisation', status: 'Moderate', color: 'amber' },
    { label: 'Business vintage', status: 'Strong', color: 'emerald' },
  ],
};

const PAYROLL_PREVIEW = {
  month: 'Jul 2026',
  gross: 420000,
  deductions: 84000,
  net: 336000,
  count: 8,
};

interface KhataOverviewProps {
  onNavigate?: (tab: string) => void;
}

function formatLakh(value: number) {
  return `₹${(value / 1_00_000).toFixed(1)}L`;
}

export default function KhataOverview({ onNavigate }: KhataOverviewProps) {
  return (
    <div className="space-y-4">
      <RegulatoryDisclaimer compact />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {OVERVIEW_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-slate-400 uppercase font-bold">{card.label}</p>
              <i className={`fas ${card.icon} text-${card.color}-500 text-xs`} />
            </div>
            <p className="text-lg font-black text-slate-800 dark:text-white">{card.value}</p>
            <p className={`text-[10px] font-bold text-${card.color}-600`}>{card.delta}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-sm font-black text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <i className="fas fa-bolt text-amber-500" /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => onNavigate?.(action.id)}
                className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <i className={`fas ${action.icon} text-primary text-sm mb-2 block`} />
                <p className="text-xs font-bold text-slate-800 dark:text-white">{action.label}</p>
                <p className="text-[10px] text-slate-500">{action.desc}</p>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-sm font-black text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <i className="fas fa-heart-pulse text-rose-500" /> Credit Health
          </h3>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-black text-slate-800 dark:text-white">{CREDIT_HEALTH.score}</span>
            <span className="text-xs font-bold text-emerald-600 mb-1">{CREDIT_HEALTH.grade}</span>
          </div>
          <div className="space-y-2">
            {CREDIT_HEALTH.factors.map((f) => (
              <div key={f.label} className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{f.label}</span>
                <span className={`font-bold text-${f.color}-600`}>{f.status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-sm font-black text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <i className="fas fa-users text-blue-500" /> Payroll Preview — {PAYROLL_PREVIEW.month}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Employees', value: PAYROLL_PREVIEW.count },
            { label: 'Gross Payout', value: formatLakh(PAYROLL_PREVIEW.gross) },
            { label: 'Deductions', value: formatLakh(PAYROLL_PREVIEW.deductions) },
            { label: 'Net Payout', value: formatLakh(PAYROLL_PREVIEW.net) },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-[10px] text-slate-400 uppercase font-bold">{item.label}</p>
              <p className="text-base font-black text-slate-800 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

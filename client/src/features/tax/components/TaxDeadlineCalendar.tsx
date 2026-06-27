import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Deadline {
  id: string;
  title: string;
  date: string; // ISO
  icon: string;
  action: string;
}

function daysLeft(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TaxDeadlineCalendar() {
  const deadlines: Deadline[] = useMemo(() => {
    const year = new Date().getFullYear();
    const nextYear = year + 1;
    return [
      { id: 'q1', title: 'Advance Tax — Q1 (15% instalment)', date: `${year}-06-15`, icon: 'fa-money-bill-wave', action: 'Pay now' },
      { id: 'q2', title: 'Advance Tax — Q2 (45% cumulative)', date: `${year}-09-15`, icon: 'fa-money-bill-wave', action: 'Pay now' },
      { id: 'itr', title: 'ITR Filing (AY ' + (year) + '-' + (year - 1999) + ')', date: `${year}-07-31`, icon: 'fa-file-invoice-dollar', action: 'File ITR' },
      { id: 'q3', title: 'Advance Tax — Q3 (75% cumulative)', date: `${year}-12-15`, icon: 'fa-money-bill-wave', action: 'Pay now' },
      { id: 'q4', title: 'Advance Tax — Q4 (100% cumulative)', date: `${nextYear}-03-15`, icon: 'fa-money-bill-wave', action: 'Pay now' },
      { id: '80c', title: '80C / 80D Investment Proof Deadline', date: `${nextYear}-03-31`, icon: 'fa-piggy-bank', action: 'Invest' },
      { id: 'ppf', title: 'PPF Contribution (FY ' + year + '-' + (year - 1999 + 1) + ')', date: `${nextYear}-04-05`, icon: 'fa-landmark', action: 'Contribute' },
    ].sort((a, b) => daysLeft(a.date) - daysLeft(b.date));
  }, []);

  return (
    <div className="space-y-3">
      {deadlines.map((d, i) => {
        const left = daysLeft(d.date);
        const urgent = left <= 7;
        const soon = left <= 30;
        return (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
              urgent
                ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800'
                : soon
                ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${urgent ? 'bg-rose-500 text-white' : soon ? 'bg-amber-500 text-white' : 'bg-primary/10 text-primary'}`}>
                <i className={`fas ${d.icon} text-xs`} />
              </div>
              <div>
                <p className={`text-xs font-bold ${urgent ? 'text-rose-700 dark:text-rose-300' : soon ? 'text-amber-700 dark:text-amber-300' : 'text-slate-700 dark:text-slate-200'}`}>{d.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Due {formatDate(d.date)}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-black ${left < 0 ? 'text-slate-400' : urgent ? 'text-rose-600' : soon ? 'text-amber-600' : 'text-emerald-600'}`}>
                {left < 0 ? 'Done' : left === 0 ? 'Today' : `${left}d`}
              </p>
              <button className="mt-1 px-2 py-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[9px] font-bold rounded-md hover:opacity-90">
                {d.action}
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

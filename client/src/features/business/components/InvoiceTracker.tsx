import { useState } from 'react';
import { motion } from 'framer-motion';
import RegulatoryDisclaimer from '@/shared/components/ui/RegulatoryDisclaimer';

interface Invoice {
  id: string;
  client: string;
  amount: number;
  issued: string;
  due: string;
  status: 'paid' | 'overdue' | 'pending';
}

const DEMO_INVOICES: Invoice[] = [
  { id: 'INV-001', client: 'Apollo Clinics', amount: 125000, issued: '01 Jul', due: '15 Jul', status: 'paid' },
  { id: 'INV-002', client: 'City Diagnostics', amount: 84000, issued: '05 Jul', due: '20 Jul', status: 'pending' },
  { id: 'INV-003', client: 'MediCare Pharmacy', amount: 56000, issued: '10 Jun', due: '25 Jun', status: 'overdue' },
  { id: 'INV-004', client: 'Wellness Skin Centre', amount: 210000, issued: '12 Jul', due: '26 Jul', status: 'pending' },
  { id: 'INV-005', client: 'Global Health Labs', amount: 95000, issued: '15 Jun', due: '30 Jun', status: 'overdue' },
];

const STATUS_STYLES = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  overdue: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function InvoiceTracker() {
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const filtered = filter === 'all' ? DEMO_INVOICES : DEMO_INVOICES.filter((i) => i.status === filter);
  const totalOutstanding = DEMO_INVOICES.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
  const overdueAmount = DEMO_INVOICES.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-4">
      <RegulatoryDisclaimer compact />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Invoiced', value: '₹5.70L' },
          { label: 'Outstanding', value: `₹${(totalOutstanding / 1_00_000).toFixed(2)}L` },
          { label: 'Overdue', value: `₹${(overdueAmount / 1_00_000).toFixed(2)}L`, color: 'text-rose-600' },
          { label: 'Collection Rate', value: '64%' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
          >
            <p className="text-[10px] text-slate-400 uppercase font-bold">{s.label}</p>
            <p className={`text-lg font-black ${s.color || 'text-slate-800 dark:text-white'}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'paid', 'pending', 'overdue'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
              filter === f
                ? 'bg-primary text-white border-primary'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
            <tr>
              <th className="p-3 font-bold">Invoice</th>
              <th className="p-3 font-bold">Client</th>
              <th className="p-3 font-bold text-right">Amount</th>
              <th className="p-3 font-bold hidden sm:table-cell">Issued</th>
              <th className="p-3 font-bold hidden sm:table-cell">Due</th>
              <th className="p-3 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-3 font-bold text-slate-800 dark:text-white">{inv.id}</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">{inv.client}</td>
                <td className="p-3 text-right font-bold text-slate-800 dark:text-white">₹{inv.amount.toLocaleString('en-IN')}</td>
                <td className="p-3 hidden sm:table-cell text-slate-500">{inv.issued}</td>
                <td className="p-3 hidden sm:table-cell text-slate-500">{inv.due}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-lg border text-[10px] font-bold ${STATUS_STYLES[inv.status]}`}>
                    {inv.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

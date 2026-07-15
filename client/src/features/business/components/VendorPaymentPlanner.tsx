import { useState } from 'react';
import { motion } from 'framer-motion';
import RegulatoryDisclaimer from '@/shared/components/ui/RegulatoryDisclaimer';

interface Vendor {
  name: string;
  billAmount: number;
  dueDate: string;
  discountPercent: number;
  discountWindow: number;
  savings: number;
}

const DEMO_VENDORS: Vendor[] = [
  { name: 'MedSupply India', billAmount: 180000, dueDate: '25 Jul', discountPercent: 2.0, discountWindow: 10, savings: 3600 },
  { name: 'DermaEquip Pvt Ltd', billAmount: 240000, dueDate: '30 Jul', discountPercent: 1.5, discountWindow: 7, savings: 3600 },
  { name: 'Packaging World', billAmount: 85000, dueDate: '22 Jul', discountPercent: 3.0, discountWindow: 5, savings: 2550 },
  { name: 'Logistics Express', billAmount: 62000, dueDate: '28 Jul', discountPercent: 1.0, discountWindow: 15, savings: 620 },
];

export default function VendorPaymentPlanner() {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    'MedSupply India': true,
    'DermaEquip Pvt Ltd': true,
    'Packaging World': false,
    'Logistics Express': false,
  });

  const toggle = (name: string) => setSelected((s) => ({ ...s, [name]: !s[name] }));

  const totalPayable = DEMO_VENDORS.filter((v) => selected[v.name]).reduce((s, v) => s + v.billAmount, 0);
  const totalSavings = DEMO_VENDORS.filter((v) => selected[v.name]).reduce((s, v) => s + v.savings, 0);

  return (
    <div className="space-y-4">
      <RegulatoryDisclaimer compact />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Total Bills', value: `₹${(DEMO_VENDORS.reduce((s, v) => s + v.billAmount, 0) / 1_00_000).toFixed(2)}L` },
          { label: 'Selected to Pay Early', value: `₹${(totalPayable / 1_00_000).toFixed(2)}L` },
          { label: 'Discount Savings', value: `₹${totalSavings.toLocaleString('en-IN')}`, color: 'text-emerald-600' },
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

      <div className="space-y-3">
        {DEMO_VENDORS.map((vendor, i) => (
          <motion.div
            key={vendor.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            onClick={() => toggle(vendor.name)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selected[vendor.name]
                ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                    selected[vendor.name]
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {selected[vendor.name] && <i className="fas fa-check text-[10px]" />}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-white">{vendor.name}</p>
                  <p className="text-[10px] text-slate-500">Due {vendor.dueDate} • {vendor.discountPercent}% discount if paid within {vendor.discountWindow} days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-800 dark:text-white">₹{vendor.billAmount.toLocaleString('en-IN')}</p>
                <p className="text-[10px] font-bold text-emerald-600">Save ₹{vendor.savings.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.99 }}
        className="w-full py-3 rounded-xl bg-primary text-white text-sm font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
      >
        <i className="fas fa-paper-plane mr-2" />
        Schedule Early Payments (Save ₹{totalSavings.toLocaleString('en-IN')})
      </motion.button>
    </div>
  );
}

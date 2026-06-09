import { useState } from 'react';
import { useWealthStore } from '../../store/wealthStore';

export default function TaxView() {
  const user = useWealthStore((s) => s.user);
  const [section80c, setSection80c] = useState(125000);
  const [section80d, setSection80d] = useState(25000);
  const [nps, setNps] = useState(50000);
  const [section80e, setSection80e] = useState(60000);
  const [section24b, setSection24b] = useState(150000);
  const [section80tta, setSection80tta] = useState(8000);
  const [hra, setHra] = useState(180000);
  const [standardDeduction, setStandardDeduction] = useState(50000);
  const [section80gg, setSection80gg] = useState(60000);
  const [section80eea, setSection80eea] = useState(100000);
  const [section80u, setSection80u] = useState(75000);

  const max80c = 150000;
  const max80d = 25000;
  const maxNps = 50000;
  const max80e = 999999; // No upper limit
  const max24b = 200000;
  const max80tta = 10000;
  const maxHra = 300000; // varies by salary
  const maxStandard = 50000;
  const max80gg = 60000;
  const max80eea = 150000;
  const max80u = 125000;

  const totalSavings = section80c + section80d + nps + section80e + section24b + section80tta + hra + standardDeduction + section80gg + section80eea + section80u;
  const taxSaved = totalSavings * (user.taxBracket / 100);

  const sections = [
    { id: '80c', label: 'Section 80C (Investments)', max: max80c, value: section80c, setter: setSection80c, step: 5000, note: 'PPF, ELSS, LIC, PF, Sukanya Samriddhi' },
    { id: '80d', label: 'Section 80D (Health Insurance)', max: max80d, value: section80d, setter: setSection80d, step: 1000, note: 'Self + family health premium' },
    { id: 'nps', label: 'NPS 80CCD(1B)', max: maxNps, value: nps, setter: setNps, step: 1000, note: 'Additional NPS contribution beyond 80C' },
    { id: '24b', label: 'Section 24(b) (Home Loan Interest)', max: max24b, value: section24b, setter: setSection24b, step: 5000, note: 'Interest on housing loan — self-occupied' },
    { id: '80eea', label: 'Section 80EEA (First-Time Home Buyer)', max: max80eea, value: section80eea, setter: setSection80eea, step: 5000, note: 'Additional interest for first-time buyers' },
    { id: '80e', label: 'Section 80E (Education Loan)', max: max80e, value: section80e, setter: setSection80e, step: 5000, note: 'Interest on higher education loan — no limit' },
    { id: 'hra', label: 'HRA Exemption (10(13A))', max: maxHra, value: hra, setter: setHra, step: 5000, note: 'House Rent Allowance — least of HRA, 50% basic, or rent-10% basic' },
    { id: '80gg', label: 'Section 80GG (Rent without HRA)', max: max80gg, value: section80gg, setter: setSection80gg, step: 1000, note: 'For those not receiving HRA — ₹5,000/month max' },
    { id: '80tta', label: 'Section 80TTA (Savings Interest)', max: max80tta, value: section80tta, setter: setSection80tta, step: 500, note: 'Interest from savings accounts — ₹10,000 max' },
    { id: 'std', label: 'Standard Deduction', max: maxStandard, value: standardDeduction, setter: setStandardDeduction, step: 1000, note: 'Flat ₹50,000 for salaried individuals' },
    { id: '80u', label: 'Section 80U (Disability)', max: max80u, value: section80u, setter: setSection80u, step: 5000, note: 'Person with disability — ₹75K (₹1.25L for severe)' },
  ];

  const recommendations = [
    { name: 'ELSS Mutual Fund', category: '80C', limit: '₹1.5L', returns: '12% avg', lockIn: '3 years' },
    { name: 'PPF', category: '80C', limit: '₹1.5L', returns: '7.1%', lockIn: '15 years' },
    { name: 'NPS Tier 1', category: '80CCD(1B)', limit: '₹50K', returns: '9% avg', lockIn: 'Till 60' },
    { name: 'Health Insurance', category: '80D', limit: '₹25K', returns: 'N/A', lockIn: 'N/A' },
    { name: 'Term Insurance', category: '80C', limit: '₹1.5L', returns: 'N/A', lockIn: 'N/A' },
    { name: 'Sukanya Samriddhi', category: '80C', limit: '₹1.5L', returns: '8.2%', lockIn: '21 years' },
    { name: 'Home Loan Principal', category: '80C', limit: '₹1.5L', returns: 'N/A', lockIn: '5 years' },
    { name: 'Education Loan', category: '80E', limit: 'No Limit', returns: 'N/A', lockIn: 'N/A' },
    { name: 'Senior Citizen FD (80TTB)', category: '80TTB', limit: '₹50K', returns: '7-8%', lockIn: '5 years' },
    { name: 'Electric Vehicle Loan (80EEB)', category: '80EEB', limit: '₹1.5L', returns: 'N/A', lockIn: 'N/A' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Tax Savings Calculator</h3>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {sections.map((s) => (
              <div key={s.id}>
                <label className="text-sm text-slate-600 dark:text-slate-300 block mb-1">
                  {s.label} — Max ₹{s.max.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="0"
                  max={s.max}
                  step={s.step}
                  value={s.value}
                  onChange={(e) => s.setter(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>₹{s.value.toLocaleString()}</span>
                  <span className="text-[10px]">{s.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-gradient-to-br from-primary to-secondary text-white">
          <h3 className="font-semibold mb-4">Your Tax Savings</h3>
          <div className="text-center py-4">
            <p className="text-4xl font-bold">₹{Math.round(taxSaved).toLocaleString()}</p>
            <p className="text-sm text-white/80 mt-1">Total savings at {user.taxBracket}% bracket</p>
          </div>
          <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
            <div className="flex justify-between"><span>80C</span><span>₹{Math.round(section80c * user.taxBracket / 100).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>80D</span><span>₹{Math.round(section80d * user.taxBracket / 100).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>NPS</span><span>₹{Math.round(nps * user.taxBracket / 100).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>24(b) Home Loan</span><span>₹{Math.round(section24b * user.taxBracket / 100).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>80EEA First Home</span><span>₹{Math.round(section80eea * user.taxBracket / 100).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>80E Education</span><span>₹{Math.round(section80e * user.taxBracket / 100).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>HRA</span><span>₹{Math.round(hra * user.taxBracket / 100).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Standard Ded.</span><span>₹{Math.round(standardDeduction * user.taxBracket / 100).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>80TTA Interest</span><span>₹{Math.round(section80tta * user.taxBracket / 100).toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      {/* 26AS & AIS Integration Banner */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-300 flex-shrink-0">
            <i className="fas fa-file-invoice-dollar text-xl" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm">Link 26AS & AIS for Complete Tax Filing</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Connect your <strong>Form 26AS</strong> (Tax Credit Statement) and <strong>AIS</strong> (Annual Information Statement)
              to auto-import TDS, advance tax, and high-value transactions. This ensures you never miss claiming a credit
              and flags any mismatch between your returns and ITD records.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">TDS Credit</span>
              <span className="text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Advance Tax</span>
              <span className="text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">SFT Transactions</span>
              <span className="text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Refund Status</span>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0">
            Link 26AS
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Recommended Tax-Saving Instruments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div key={rec.name} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">{rec.category}</span>
                <span className="text-xs text-slate-400">Limit: {rec.limit}</span>
              </div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-1">{rec.name}</h4>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Returns: {rec.returns}</span>
                <span>Lock-in: {rec.lockIn}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

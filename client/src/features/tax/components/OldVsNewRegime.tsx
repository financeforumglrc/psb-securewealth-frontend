import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { backendApi } from '@/shared/lib/backendApi';

interface TaxResult {
  oldRegime: { totalTax: number; taxableIncome: number; effectiveRate: number };
  newRegime: { totalTax: number; taxableIncome: number; effectiveRate: number };
  optimal: { regime: string; totalTax: number; taxableIncome: number };
  comparison: { difference: number; savingsPercentage: string };
}

function currency(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export default function OldVsNewRegime() {
  const [salary, setSalary] = useState(1500000);
  const [age, setAge] = useState(35);
  const [s80c, setS80c] = useState(150000);
  const [s80d, setS80d] = useState(25000);
  const [nps, setNps] = useState(50000);
  const [hra, setHra] = useState(180000);
  const [rent, setRent] = useState(240000);
  const [homeLoanInterest, setHomeLoanInterest] = useState(150000);
  const [result, setResult] = useState<TaxResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    backendApi
      .calculateIncomeTax({
        income: salary,
        age,
        currentInvestments: s80c,
        total80C: s80c,
        healthInsuranceSelf: s80d,
        nps,
        hraReceived: hra,
        rent,
        homeLoanInterest,
      })
      .then((res) => {
        if (cancelled) return;
        if (res.ok && res.data?.data) {
          setResult(res.data.data);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [salary, age, s80c, s80d, nps, hra, rent, homeLoanInterest]);

  const savings = result ? result.comparison.difference : 0;
  const recommended = result?.optimal.regime || '—';

  const inputs = [
    { label: 'Annual Salary', value: salary, setter: setSalary, max: 5000000, step: 50000 },
    { label: 'Age', value: age, setter: setAge, max: 80, step: 1 },
    { label: '80C Investments', value: s80c, setter: setS80c, max: 150000, step: 5000 },
    { label: '80D Health Insurance', value: s80d, setter: setS80d, max: 50000, step: 1000 },
    { label: 'NPS 80CCD(1B)', value: nps, setter: setNps, max: 50000, step: 5000 },
    { label: 'HRA Received', value: hra, setter: setHra, max: 500000, step: 5000 },
    { label: 'Annual Rent Paid', value: rent, setter: setRent, max: 600000, step: 5000 },
    { label: 'Home Loan Interest (24b)', value: homeLoanInterest, setter: setHomeLoanInterest, max: 200000, step: 5000 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-calculator text-primary" /> Income & Deductions
          </h4>
          {inputs.map((inp, i) => (
            <motion.div
              key={inp.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                <span>{inp.label}</span>
                <span>{inp.label === 'Age' ? inp.value : currency(inp.value)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={inp.max}
                step={inp.step}
                value={inp.value}
                onChange={(e) => inp.setter(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="h-40 flex items-center justify-center text-slate-400 text-xs">
              <i className="fas fa-circle-notch fa-spin mr-2" /> Computing regimes…
            </div>
          )}
          {!loading && result && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  <p className="text-[10px] uppercase font-bold opacity-80">Old Regime Tax</p>
                  <p className="text-2xl font-black mt-1">{currency(result.oldRegime.totalTax)}</p>
                  <p className="text-[10px] mt-1 opacity-90">Taxable: {currency(result.oldRegime.taxableIncome)}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <p className="text-[10px] uppercase font-bold opacity-80">New Regime Tax</p>
                  <p className="text-2xl font-black mt-1">{currency(result.newRegime.totalTax)}</p>
                  <p className="text-[10px] mt-1 opacity-90">Taxable: {currency(result.newRegime.taxableIncome)}</p>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <i className="fas fa-lightbulb" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Recommended: {recommended}</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Potential savings: <strong>{currency(savings)}</strong> ({result.comparison.savingsPercentage}% of income)
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import CosmosCard, { CosmosBadge } from '../ui/CosmosCard';
import RentVsBuyCalculator from './RentVsBuyCalculator';

const CALCULATORS = [
  { key: 'sip' as const, label: 'SIP Calculator', icon: 'fa-piggy-bank', color: '#0f766e' },
  { key: 'emi' as const, label: 'EMI Calculator', icon: 'fa-money-bill', color: '#1565C0' },
  { key: 'retirement' as const, label: 'Retirement', icon: 'fa-umbrella-beach', color: '#6A1B9A' },
  { key: 'tax' as const, label: 'Tax Planner', icon: 'fa-file-invoice-dollar', color: '#E65100' },
  { key: 'goalsip' as const, label: 'Goal SIP', icon: 'fa-bullseye', color: '#C2185B' },
  { key: 'rentvsbuy' as const, label: 'Rent vs. Buy', icon: 'fa-house-chimney', color: '#00695C' },
] as const;

export default function CalculatorsView() {
  const [activeCalc, setActiveCalc] = useState<typeof CALCULATORS[number]['key']>('sip');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Financial Calculators</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Plan smarter with interactive financial tools</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {CALCULATORS.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCalc(c.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeCalc === c.key
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <i className={`fas ${c.icon}`} style={{ color: activeCalc === c.key ? '#fff' : c.color }} />
            {c.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeCalc} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          {activeCalc === 'sip' && <SIPCalculator />}
          {activeCalc === 'emi' && <EMICalculator />}
          {activeCalc === 'retirement' && <RetirementCalculator />}
          {activeCalc === 'tax' && <TaxCalculator />}
          {activeCalc === 'goalsip' && <GoalSIPCalculator />}
          {activeCalc === 'rentvsbuy' && <RentVsBuyCalculator />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ───── Slider Input Component ───── */
function SliderInput({ label, value, min, max, step = 1, unit = '', onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">{label}</label>
        <span className="text-xs font-bold text-primary">{unit}{value.toLocaleString()}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-primary" />
      <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
        <span>{unit}{min.toLocaleString()}</span>
        <span>{unit}{max.toLocaleString()}</span>
      </div>
    </div>
  );
}

/* ───── SIP Calculator ───── */
function SIPCalculator() {
  const [monthly, setMonthly] = useState(15000);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(12);

  const months = years * 12;
  const monthlyRate = rate / 100 / 12;
  const futureValue = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const invested = monthly * months;
  const gains = futureValue - invested;

  const pieData = [
    { name: 'Invested', value: Math.round(invested), fill: '#0f766e' },
    { name: 'Returns', value: Math.round(gains), fill: '#10b981' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <CosmosCard variant="default" className="lg:col-span-1">
        <div className="space-y-5">
          <SliderInput label="Monthly SIP" value={monthly} min={1000} max={100000} step={500} unit="₹" onChange={setMonthly} />
          <SliderInput label="Duration" value={years} min={1} max={40} step={1} unit="" onChange={setYears} />
          <SliderInput label="Expected Return" value={rate} min={4} max={20} step={0.5} unit="%" onChange={setRate} />
        </div>
      </CosmosCard>
      <CosmosCard variant="gradient" className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {[
              { label: 'Total Invested', value: `₹${Math.round(invested).toLocaleString()}`, color: 'text-primary' },
              { label: 'Est. Returns', value: `₹${Math.round(gains).toLocaleString()}`, color: 'text-emerald-500' },
              { label: 'Total Value', value: `₹${Math.round(futureValue).toLocaleString()}`, color: 'text-slate-800 dark:text-white text-lg' },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
                <p className={`font-extrabold ${s.color}`}>{s.value}</p>
              </div>
            ))}
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${Math.min((invested / futureValue) * 100, 100)}%` }} transition={{ duration: 0.5 }} />
            </div>
            <p className="text-[10px] text-slate-400 text-center">Invested {((invested / futureValue) * 100).toFixed(1)}% · Returns {((gains / futureValue) * 100).toFixed(1)}%</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-[10px]">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: pieData[0].fill }} /> Invested</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: pieData[1].fill }} /> Returns</div>
            </div>
          </div>
        </div>
      </CosmosCard>
    </div>
  );
}

/* ───── EMI Calculator ───── */
function EMICalculator() {
  const [principal, setPrincipal] = useState(5000000);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(8.5);

  const months = years * 12;
  const monthlyRate = rate / 100 / 12;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayable = emi * months;
  const interest = totalPayable - principal;

  const pieData = [
    { name: 'Principal', value: Math.round(principal), fill: '#1565C0' },
    { name: 'Interest', value: Math.round(interest), fill: '#ef4444' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <CosmosCard variant="default" className="lg:col-span-1">
        <div className="space-y-5">
          <SliderInput label="Loan Amount" value={principal} min={100000} max={10000000} step={100000} unit="₹" onChange={setPrincipal} />
          <SliderInput label="Tenure" value={years} min={1} max={30} step={1} unit="" onChange={setYears} />
          <SliderInput label="Interest Rate" value={rate} min={4} max={16} step={0.1} unit="%" onChange={setRate} />
        </div>
      </CosmosCard>
      <CosmosCard variant="gradient" className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {[
              { label: 'Monthly EMI', value: `₹${Math.round(emi).toLocaleString()}`, color: 'text-primary' },
              { label: 'Total Interest', value: `₹${Math.round(interest).toLocaleString()}`, color: 'text-rose-500' },
              { label: 'Total Payable', value: `₹${Math.round(totalPayable).toLocaleString()}`, color: 'text-slate-800 dark:text-white text-lg' },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
                <p className={`font-extrabold ${s.color}`}>{s.value}</p>
              </div>
            ))}
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <motion.div className="h-full rounded-full bg-rose-400" initial={{ width: 0 }} animate={{ width: `${Math.min((interest / totalPayable) * 100, 100)}%` }} transition={{ duration: 0.5 }} />
            </div>
            <p className="text-[10px] text-slate-400 text-center">Interest is {((interest / totalPayable) * 100).toFixed(1)}% of total</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-[10px]">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: pieData[0].fill }} /> Principal</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: pieData[1].fill }} /> Interest</div>
            </div>
          </div>
        </div>
      </CosmosCard>
    </div>
  );
}

/* ───── Retirement Calculator ───── */
function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [monthlyExpense, setMonthlyExpense] = useState(50000);
  const [inflation, setInflation] = useState(6);

  const years = retireAge - currentAge;
  const futureMonthly = monthlyExpense * Math.pow(1 + inflation / 100, years);
  const corpusNeeded = futureMonthly * 12 * 25;
  const monthlyNeed = corpusNeeded / (years * 12);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <CosmosCard variant="default" className="lg:col-span-1">
        <div className="space-y-5">
          <SliderInput label="Current Age" value={currentAge} min={20} max={60} step={1} unit="" onChange={setCurrentAge} />
          <SliderInput label="Retirement Age" value={retireAge} min={45} max={80} step={1} unit="" onChange={setRetireAge} />
          <SliderInput label="Monthly Expense" value={monthlyExpense} min={10000} max={500000} step={5000} unit="₹" onChange={setMonthlyExpense} />
          <SliderInput label="Inflation" value={inflation} min={2} max={12} step={0.5} unit="%" onChange={setInflation} />
        </div>
      </CosmosCard>
      <CosmosCard variant="gradient" className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Years to Retire', value: years, color: 'text-primary', unit: ' years' },
            { label: 'Future Monthly', value: `₹${Math.round(futureMonthly).toLocaleString()}`, color: 'text-amber-500' },
            { label: 'Corpus Needed', value: `₹${Math.round(corpusNeeded).toLocaleString()}`, color: 'text-slate-800 dark:text-white text-lg' },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
              <p className={`font-extrabold ${s.color} mt-1`}>{s.value}{s.unit || ''}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><i className="fas fa-lightbulb" /></div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">Monthly SIP needed</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Assuming 12% annual returns</p>
            </div>
            <p className="ml-auto text-lg font-extrabold text-primary">₹{Math.round(monthlyNeed).toLocaleString()}/mo</p>
          </div>
        </div>
      </CosmosCard>
    </div>
  );
}

/* ───── Tax Calculator ───── */
function TaxCalculator() {
  const [salary, setSalary] = useState(1500000);
  const [deductions, setDeductions] = useState(200000);
  const [regime, setRegime] = useState<'new' | 'old'>('new');

  const taxable = Math.max(0, salary - (regime === 'old' ? deductions : 0));

  function calculateTax(income: number, isOld: boolean): number {
    if (!isOld) {
      // New regime FY 2024-25 (simplified slabs)
      if (income <= 300000) return 0;
      let tax = 0;
      if (income > 300000) tax += Math.min(income - 300000, 300000) * 0.05;
      if (income > 600000) tax += Math.min(income - 600000, 300000) * 0.10;
      if (income > 900000) tax += Math.min(income - 900000, 300000) * 0.15;
      if (income > 1200000) tax += Math.min(income - 1200000, 300000) * 0.20;
      if (income > 1500000) tax += (income - 1500000) * 0.30;
      return tax;
    } else {
      // Old regime (simplified)
      const taxableOld = income;
      if (taxableOld <= 250000) return 0;
      let tax = 0;
      if (taxableOld > 250000) tax += Math.min(taxableOld - 250000, 250000) * 0.05;
      if (taxableOld > 500000) tax += Math.min(taxableOld - 500000, 500000) * 0.20;
      if (taxableOld > 1000000) tax += (taxableOld - 1000000) * 0.30;
      // Rebate 87A for < 5L
      if (taxableOld <= 500000) tax = Math.max(0, tax - 12500);
      return tax;
    }
  }

  const newTax = calculateTax(salary, false);
  const oldTax = calculateTax(salary - deductions, true);
  const currentTax = regime === 'new' ? newTax : oldTax;
  const inHand = salary - currentTax;

  const barData = [
    { name: regime === 'new' ? 'New Regime' : 'Old Regime', tax: Math.round(currentTax), fill: regime === 'new' ? '#0f766e' : '#1565C0' },
    { name: regime === 'new' ? 'Old Regime' : 'New Regime', tax: Math.round(regime === 'new' ? oldTax : newTax), fill: '#94a3b8' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <CosmosCard variant="default" className="lg:col-span-1">
        <div className="space-y-5">
          <SliderInput label="Annual Salary" value={salary} min={300000} max={5000000} step={50000} unit="₹" onChange={setSalary} />
          {regime === 'old' && <SliderInput label="Deductions (80C, 80D, etc.)" value={deductions} min={0} max={500000} step={10000} unit="₹" onChange={setDeductions} />}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">Tax Regime</label>
            <div className="flex gap-2">
              <button onClick={() => setRegime('new')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${regime === 'new' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>New</button>
              <button onClick={() => setRegime('old')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${regime === 'old' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>Old</button>
            </div>
          </div>
        </div>
      </CosmosCard>
      <CosmosCard variant="gradient" className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {[
              { label: 'Taxable Income', value: `₹${taxable.toLocaleString()}`, color: 'text-slate-800 dark:text-white' },
              { label: 'Tax Payable', value: `₹${Math.round(currentTax).toLocaleString()}`, color: 'text-rose-500' },
              { label: 'In-Hand Annual', value: `₹${Math.round(inHand).toLocaleString()}`, color: 'text-emerald-500 text-lg' },
              { label: 'In-Hand Monthly', value: `₹${Math.round(inHand / 12).toLocaleString()}`, color: 'text-primary' },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
                <p className={`font-extrabold ${s.color}`}>{s.value}</p>
              </div>
            ))}
            {newTax !== oldTax && (
              <CosmosBadge color={newTax < oldTax ? 'success' : 'warning'} size="sm">
                {newTax < oldTax ? `Save ₹${(oldTax - newTax).toLocaleString()} with New Regime` : `Save ₹${(newTax - oldTax).toLocaleString()} with Old Regime`}
              </CosmosBadge>
            )}
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="tax" radius={[6, 6, 0, 0]} animationDuration={800}>
                  {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-slate-400 text-center mt-1">Regime comparison</p>
          </div>
        </div>
      </CosmosCard>
    </div>
  );
}

/* ───── Goal SIP Calculator ───── */
function GoalSIPCalculator() {
  const [target, setTarget] = useState(2000000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(12);

  const months = years * 12;
  const monthlyRate = rate / 100 / 12;
  // Rearranged SIP formula to find monthly investment needed
  const monthlySIP = target / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <CosmosCard variant="default" className="lg:col-span-1">
        <div className="space-y-5">
          <SliderInput label="Goal Amount" value={target} min={100000} max={10000000} step={100000} unit="₹" onChange={setTarget} />
          <SliderInput label="Years to Goal" value={years} min={1} max={30} step={1} unit="" onChange={setYears} />
          <SliderInput label="Expected Return" value={rate} min={4} max={20} step={0.5} unit="%" onChange={setRate} />
        </div>
      </CosmosCard>
      <CosmosCard variant="gradient" className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Target Amount', value: `₹${target.toLocaleString()}`, color: 'text-slate-800 dark:text-white text-lg' },
            { label: 'Monthly SIP Needed', value: `₹${Math.round(monthlySIP).toLocaleString()}`, color: 'text-primary text-lg' },
            { label: 'Total Investment', value: `₹${Math.round(monthlySIP * months).toLocaleString()}`, color: 'text-emerald-500' },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
              <p className={`font-extrabold ${s.color} mt-1`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600"><i className="fas fa-lightbulb" /></div>
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Pro Tip</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">Step-up SIP by 10% yearly and you only need ₹{Math.round(monthlySIP * 0.65).toLocaleString()}/mo to start</p>
            </div>
          </div>
        </div>
      </CosmosCard>
    </div>
  );
}

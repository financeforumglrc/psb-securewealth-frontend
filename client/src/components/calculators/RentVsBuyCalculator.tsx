import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface YearData {
  year: number;
  rent: number;
  emi: number;
  maintenance: number;
  homeValue: number;
  loanBalance: number;
  equity: number;
  cumulativeRent: number;
  cumulativeEmi: number;
  cumulativeMaintenance: number;
  netBuyCost: number;
}

export default function RentVsBuyCalculator() {
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [homePrice, setHomePrice] = useState(7500000);
  const [downPayment, setDownPayment] = useState(1500000);
  const [loanAmount, setLoanAmount] = useState(6000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);
  const [appreciation, setAppreciation] = useState(6);
  const [rentIncrease, setRentIncrease] = useState(8);

  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTenure * 12;

  // EMI
  const emi = useMemo(() => {
    if (monthlyRate === 0) return loanAmount / numPayments;
    return loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  }, [loanAmount, monthlyRate, numPayments]);

  // Year-by-year data
  const yearData: YearData[] = useMemo(() => {
    const data: YearData[] = [];
    let cumulativeRent = 0;
    let cumulativeEmi = 0;
    let cumulativeMaintenance = 0;
    let currentRent = monthlyRent;
    let loanBalance = loanAmount;
    let currentHomeValue = homePrice;

    for (let year = 1; year <= loanTenure; year++) {
      const yearlyRent = currentRent * 12;
      const yearlyEmi = emi * 12;
      const yearlyMaintenance = currentHomeValue * 0.005; // 0.5% maintenance

      // Pay down loan for this year
      for (let m = 0; m < 12; m++) {
        const interest = loanBalance * monthlyRate;
        const principal = emi - interest;
        loanBalance = Math.max(0, loanBalance - principal);
      }

      cumulativeRent += yearlyRent;
      cumulativeEmi += yearlyEmi;
      cumulativeMaintenance += yearlyMaintenance;

      const equity = currentHomeValue - loanBalance;
      const netBuyCost = downPayment + cumulativeEmi + cumulativeMaintenance - equity;

      data.push({
        year,
        rent: yearlyRent,
        emi: yearlyEmi,
        maintenance: yearlyMaintenance,
        homeValue: currentHomeValue,
        loanBalance,
        equity,
        cumulativeRent,
        cumulativeEmi,
        cumulativeMaintenance,
        netBuyCost,
      });

      currentRent *= (1 + rentIncrease / 100);
      currentHomeValue *= (1 + appreciation / 100);
    }

    return data;
  }, [monthlyRent, homePrice, downPayment, loanAmount, emi, monthlyRate, loanTenure, appreciation, rentIncrease]);

  const data10 = yearData[9] || yearData[yearData.length - 1];
  const breakEvenYear = yearData.find((d) => d.cumulativeRent >= d.netBuyCost)?.year || null;

  const recommendation = breakEvenYear
    ? `Buy if you plan to stay >${breakEvenYear} years. Rent if mobile.`
    : 'Buying is always better in this scenario.';

  // Chart data
  const chartData = yearData.map((d) => ({
    year: `Y${d.year}`,
    'Rent Paid': Math.round(d.cumulativeRent / 100000) / 10,
    'Home Equity': Math.round(d.equity / 100000) / 10,
    'Net Buy Cost': Math.round(d.netBuyCost / 100000) / 10,
  }));

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
          <i className="fas fa-house-chimney text-primary mr-2" />
          Rent vs. Buy Calculator
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Monthly Rent', value: monthlyRent, setter: setMonthlyRent, step: 1000, prefix: '₹' },
            { label: 'Home Price', value: homePrice, setter: setHomePrice, step: 100000, prefix: '₹' },
            { label: 'Down Payment', value: downPayment, setter: setDownPayment, step: 100000, prefix: '₹' },
            { label: 'Loan Amount', value: loanAmount, setter: setLoanAmount, step: 100000, prefix: '₹' },
            { label: 'Interest Rate', value: interestRate, setter: setInterestRate, step: 0.1, prefix: '', suffix: '%' },
            { label: 'Loan Tenure', value: loanTenure, setter: setLoanTenure, step: 1, prefix: '', suffix: 'y' },
            { label: 'Home Appreciation', value: appreciation, setter: setAppreciation, step: 0.5, prefix: '', suffix: '%' },
            { label: 'Rent Increase', value: rentIncrease, setter: setRentIncrease, step: 0.5, prefix: '', suffix: '%' },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-xs text-slate-500 block mb-1">{field.label}</label>
              <div className="relative">
                {field.prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{field.prefix}</span>}
                <input
                  type="number"
                  step={field.step}
                  value={field.value}
                  onChange={(e) => field.setter(Number(e.target.value))}
                  className={`w-full ${field.prefix ? 'pl-6' : 'pl-3'} pr-6 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white`}
                />
                {field.suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{field.suffix}</span>}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400">
          Monthly EMI: <span className="font-bold text-primary">₹{Math.round(emi).toLocaleString()}</span> 
          <span className="mx-2">·</span>
          Total Interest: <span className="font-bold text-rose-500">₹{Math.round(emi * numPayments - loanAmount).toLocaleString()}</span>
        </p>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Rent Card */}
        <div className="card border-l-4 border-l-rose-400">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-rose-500">
              <i className="fas fa-key" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white">Renting</h4>
              <p className="text-xs text-slate-400">No asset, full flexibility</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Monthly Outflow</span>
              <span className="font-bold text-slate-800 dark:text-white">₹{monthlyRent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">10-Year Total</span>
              <span className="font-bold text-rose-600">₹{Math.round(data10.cumulativeRent).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Asset Created</span>
              <span className="font-bold text-slate-400">₹0</span>
            </div>
          </div>
        </div>

        {/* Buy Card */}
        <div className="card border-l-4 border-l-emerald-400">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-500">
              <i className="fas fa-house-chimney" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white">Buying</h4>
              <p className="text-xs text-slate-400">Build equity, long-term wealth</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Monthly Outflow</span>
              <span className="font-bold text-slate-800 dark:text-white">₹{Math.round(emi).toLocaleString()} EMI</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">10-Year Total</span>
              <span className="font-bold text-slate-800 dark:text-white">₹{Math.round(data10.cumulativeEmi + data10.cumulativeMaintenance + downPayment).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Home Value (Y10)</span>
              <span className="font-bold text-emerald-600">₹{Math.round(data10.homeValue).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Equity Built</span>
              <span className="font-bold text-emerald-600">₹{Math.round(data10.equity).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Break-even & Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-primary/5 border border-primary/20 text-center">
          <p className="text-xs text-primary uppercase tracking-wider font-semibold mb-1">Break-even Point</p>
          <p className="text-3xl font-black text-primary">{breakEvenYear ? `${breakEvenYear} years` : 'N/A'}</p>
          <p className="text-xs text-slate-500 mt-1">Buying becomes cheaper after this</p>
        </div>
        <div className="card bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 text-center">
          <p className="text-xs text-emerald-600 uppercase tracking-wider font-semibold mb-1">Home Value (Y10)</p>
          <p className="text-3xl font-black text-emerald-600">₹{(data10.homeValue / 10000000).toFixed(2)}Cr</p>
          <p className="text-xs text-slate-500 mt-1">From ₹{(homePrice / 10000000).toFixed(2)}Cr purchase</p>
        </div>
        <div className="card bg-amber-50 dark:bg-amber-900/20 border border-amber-200 text-center">
          <p className="text-xs text-amber-600 uppercase tracking-wider font-semibold mb-1">Recommendation</p>
          <p className="text-lg font-bold text-amber-700 leading-tight">{recommendation}</p>
        </div>
      </div>

      {/* Bar Race Chart */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
          <i className="fas fa-chart-bar text-secondary mr-2" />
          20-Year Race: Rent Paid vs. Home Equity
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: '₹ (Lakhs)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
              <Tooltip
                formatter={(val) => `₹${Number(val)}L`}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Rent Paid" fill="#f43f5e" radius={[4, 4, 0, 0]} animationDuration={1500} />
              <Bar dataKey="Home Equity" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-400 text-center mt-2">
          Green = your equity in the home. Red = money spent on rent with no return.
        </p>
      </div>

      {/* Year-by-Year Table */}
      <div className="card overflow-hidden">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Year-by-Year Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-slate-700">
                <th className="pb-2 font-medium">Year</th>
                <th className="pb-2 font-medium text-right">Annual Rent</th>
                <th className="pb-2 font-medium text-right">EMI+Maint</th>
                <th className="pb-2 font-medium text-right">Home Value</th>
                <th className="pb-2 font-medium text-right">Equity</th>
                <th className="pb-2 font-medium text-right">Loan Left</th>
                <th className="pb-2 font-medium text-center">Winner</th>
              </tr>
            </thead>
            <tbody>
              {yearData.filter((_, i) => i % 2 === 0 || i === yearData.length - 1).map((d) => {
                const rentWins = d.cumulativeRent < d.netBuyCost;
                return (
                  <tr key={d.year} className="border-b border-slate-50 dark:border-slate-800">
                    <td className="py-2 font-medium text-slate-700 dark:text-slate-200">Year {d.year}</td>
                    <td className="py-2 text-right text-rose-600">₹{(d.rent / 100000).toFixed(1)}L</td>
                    <td className="py-2 text-right text-slate-600">₹{((d.emi + d.maintenance) / 100000).toFixed(1)}L</td>
                    <td className="py-2 text-right text-emerald-600">₹{(d.homeValue / 10000000).toFixed(2)}Cr</td>
                    <td className="py-2 text-right text-emerald-700 font-medium">₹{(d.equity / 100000).toFixed(1)}L</td>
                    <td className="py-2 text-right text-slate-400">₹{(d.loanBalance / 100000).toFixed(1)}L</td>
                    <td className="py-2 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        rentWins ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {rentWins ? 'Rent' : 'Buy'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

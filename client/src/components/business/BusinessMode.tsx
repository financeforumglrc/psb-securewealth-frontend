import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CASH_FLOW = [
  { month: 'Jan', inflow: 450000, outflow: 320000 },
  { month: 'Feb', inflow: 480000, outflow: 340000 },
  { month: 'Mar', inflow: 520000, outflow: 310000 },
  { month: 'Apr', inflow: 490000, outflow: 380000 },
  { month: 'May', inflow: 550000, outflow: 360000 },
  { month: 'Jun', inflow: 510000, outflow: 390000 },
];

const TREASURY_OPTIONS = [
  { name: '7-Day FD', rate: '6.5%', tenor: '7 days', risk: 'Negligible', liquidity: 'High' },
  { name: 'T-Bills', rate: '6.8%', tenor: '91 days', risk: 'Negligible', liquidity: 'High' },
  { name: 'Corporate CP', rate: '7.5%', tenor: '90 days', risk: 'Low', liquidity: 'Medium' },
  { name: 'Liquid MF', rate: '7.2%', tenor: 'Open', risk: 'Low', liquidity: 'High' },
  { name: 'Arbitrage Fund', rate: '8.0%', tenor: 'Open', risk: 'Low', liquidity: 'Medium' },
];

const RISK_INDICATORS = [
  { label: 'Current Ratio', value: '2.4x', status: 'good', target: '>1.5x', desc: 'Adequate liquidity buffer' },
  { label: 'Debt/Equity', value: '0.3x', status: 'good', target: '<1.0x', desc: 'Low leverage, safe position' },
  { label: 'Cash Conversion', value: '45 days', status: 'warning', target: '<30 days', desc: 'Working capital cycle is slow' },
  { label: 'EBITDA Margin', value: '18%', status: 'good', target: '>15%', desc: 'Healthy profitability' },
];

const COLORS = ['#0f766e', '#14b8a6', '#f59e0b', '#8b5cf6'];

export default function BusinessMode() {
  const [selectedSurplus, setSelectedSurplus] = useState(250000);
  const totalInflow = CASH_FLOW.reduce((s, c) => s + c.inflow, 0);
  const totalOutflow = CASH_FLOW.reduce((s, c) => s + c.outflow, 0);
  const surplus = totalInflow - totalOutflow;

  const expenseBreakdown = [
    { name: 'Salaries', value: 45 },
    { name: 'Rent', value: 20 },
    { name: 'Inventory', value: 18 },
    { name: 'Marketing', value: 12 },
    { name: 'Other', value: 5 },
  ];

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-r from-slate-800 to-slate-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <i className="fas fa-building" /> Business Wealth Center
            </h2>
            <p className="text-sm text-slate-300 mt-1">Corporate treasury, cash flow, and surplus management</p>
          </div>
          <span className="text-xs px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-full font-medium border border-emerald-500/30">
            <i className="fas fa-circle-check mr-1" />SME Plan Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Monthly Revenue" value="Rs 5,00,000" icon="fa-sack-dollar" color="bg-emerald-500" />
        <StatCard label="Monthly Expense" value="Rs 3,50,000" icon="fa-file-invoice-dollar" color="bg-rose-500" />
        <StatCard label="6M Surplus" value={'Rs ' + surplus.toLocaleString()} icon="fa-piggy-bank" color="bg-primary" />
        <StatCard label="Liquidity Ratio" value="2.4x" icon="fa-droplet" color="bg-amber-500" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-white">Cash Flow Analysis (6 Months)</h3>
          <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full">+Rs {(surplus).toLocaleString()} net surplus</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CASH_FLOW}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="inflow" fill="#0f766e" radius={[4, 4, 0, 0]} name="Inflow" />
              <Bar dataKey="outflow" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Outflow" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Expense Breakdown</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                  {expenseBreakdown.map((_, i) => (
                    <Cell key={'cell-' + i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => val + '%'} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {expenseBreakdown.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1 text-xs text-slate-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name} {d.value}%
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Financial Risk Indicators</h3>
          <div className="space-y-3">
            {RISK_INDICATORS.map((risk) => (
              <div key={risk.label} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{risk.label}</span>
                  <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (risk.status === 'good' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600')}>
                    {risk.value}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Target: {risk.target} &middot; {risk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-coins text-amber-500" /> Surplus Fund Manager
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Optimize idle cash with treasury options</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4">
          <label className="text-xs text-slate-500 block mb-2">Surplus Amount to Park: Rs {selectedSurplus.toLocaleString()}</label>
          <input
            type="range"
            min={100000}
            max={1000000}
            step={50000}
            value={selectedSurplus}
            onChange={(e) => setSelectedSurplus(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Rs 1L</span>
            <span>Rs 10L</span>
          </div>
        </div>

        <div className="space-y-2">
          {TREASURY_OPTIONS.map((opt) => {
            const annualReturn = Math.round(selectedSurplus * (parseFloat(opt.rate) / 100));
            return (
              <div key={opt.name} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                  <i className="fas fa-landmark" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{opt.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full">{opt.rate}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{opt.tenor} &middot; {opt.risk} risk &middot; {opt.liquidity} liquidity</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-emerald-600">Rs {annualReturn.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">annual return</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <i className="fas fa-triangle-exclamation text-amber-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Business Compliance Note</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              All surplus fund suggestions are for simulation purposes. Actual treasury decisions require board approval and compliance with RBI guidelines on NBFC/corporate investments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-2">
        <div className={'w-10 h-10 ' + color + ' rounded-lg flex items-center justify-center text-white'}>
          <i className={'fas ' + icon} />
        </div>
        <span className="text-[10px] text-slate-500 uppercase">{label}</span>
      </div>
      <p className="text-lg font-bold text-slate-800 dark:text-white">{value}</p>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { backendApi } from '@/shared/lib/backendApi';
import { formatCurrency } from '@/shared/utils/demoMode';

const TREASURY_OPTIONS = [
  { name: '7-Day FD', rate: '6.5%', tenor: '7 days', risk: 'Negligible', liquidity: 'High' },
  { name: 'T-Bills', rate: '6.8%', tenor: '91 days', risk: 'Negligible', liquidity: 'High' },
  { name: 'Corporate CP', rate: '7.5%', tenor: '90 days', risk: 'Low', liquidity: 'Medium' },
  { name: 'Liquid MF', rate: '7.2%', tenor: 'Open', risk: 'Low', liquidity: 'High' },
  { name: 'Arbitrage Fund', rate: '8.0%', tenor: 'Open', risk: 'Low', liquidity: 'Medium' },
];

const COLORS = ['#0f766e', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444'];

interface CashflowMonth {
  month: string;
  inflow: number;
  outflow: number;
}

interface CashflowData {
  cashflow: CashflowMonth[];
  totalInflow: number;
  totalOutflow: number;
  surplus: number;
  avgMonthlyInflow: number;
  avgMonthlyOutflow: number;
  liquidityRatio: number;
  negativeMonths: number;
  riskFlags: { level: 'good' | 'warning' | 'danger'; message: string }[];
  recommendations: { product: string; amount: number; reason: string }[];
}

export default function BusinessMode() {
  const [data, setData] = useState<CashflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    backendApi.getBusinessCashflow()
      .then((res) => {
        if (res.data?.success) setData(res.data.data);
        else setError('Could not load business analytics');
      })
      .catch((err: any) => setError(err?.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(
    () =>
      data?.cashflow.map((c) => ({
        ...c,
        label: new Date(c.month + '-01').toLocaleString('default', { month: 'short' }),
      })) || [],
    [data]
  );

  const expenseBreakdown = useMemo(
    () => [
      { name: 'Salaries', value: 45 },
      { name: 'Rent', value: 20 },
      { name: 'Inventory', value: 18 },
      { name: 'Marketing', value: 12 },
      { name: 'Other', value: 5 },
    ],
    []
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-rose-500 font-medium">{error}</p>
        <p className="text-sm text-slate-500 mt-2">Try refreshing or ensure you have transactions in your account.</p>
      </div>
    );
  }

  const surplus = data?.surplus ?? 0;

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
        <StatCard label="6M Inflow" value={formatCurrency(data?.totalInflow ?? 0)} icon="fa-sack-dollar" color="bg-emerald-500" />
        <StatCard label="6M Outflow" value={formatCurrency(data?.totalOutflow ?? 0)} icon="fa-file-invoice-dollar" color="bg-rose-500" />
        <StatCard label="6M Surplus" value={formatCurrency(surplus)} icon="fa-piggy-bank" color={surplus >= 0 ? 'bg-primary' : 'bg-rose-500'} />
        <StatCard label="Liquidity Ratio" value={`${data?.liquidityRatio ?? 0}x`} icon="fa-droplet" color="bg-amber-500" />
      </div>

      {data && data.riskFlags.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.riskFlags.map((flag, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 ${
                flag.level === 'good'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-700 dark:text-emerald-300'
                  : flag.level === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 text-amber-700 dark:text-amber-300'
                  : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 text-rose-700 dark:text-rose-300'
              }`}
            >
              <i
                className={`fas ${
                  flag.level === 'good' ? 'fa-check-circle' : flag.level === 'warning' ? 'fa-exclamation-circle' : 'fa-times-circle'
                }`}
              />
              {flag.message}
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-white">Cash Flow Analysis (6 Months)</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${surplus >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
            {surplus >= 0 ? '+' : ''}
            {formatCurrency(surplus)} net surplus
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
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
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
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
              <div key={d.name} className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name} {d.value}%
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Surplus Fund Recommendations</h3>
          <div className="space-y-3">
            {data?.recommendations && data.recommendations.length > 0 ? (
              data.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{rec.product}</span>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                      {formatCurrency(rec.amount)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{rec.reason}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No surplus available for treasury recommendations.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Treasury Product Options</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">Rate</th>
                <th className="pb-2 font-medium">Tenor</th>
                <th className="pb-2 font-medium">Risk</th>
                <th className="pb-2 font-medium">Liquidity</th>
              </tr>
            </thead>
            <tbody>
              {TREASURY_OPTIONS.map((opt) => (
                <tr key={opt.name} className="border-b border-slate-50 dark:border-slate-800">
                  <td className="py-2 font-medium text-slate-700 dark:text-slate-200">{opt.name}</td>
                  <td className="py-2 text-emerald-600 font-medium">{opt.rate}</td>
                  <td className="py-2 text-slate-600 dark:text-slate-400">{opt.tenor}</td>
                  <td className="py-2 text-slate-600 dark:text-slate-400">{opt.risk}</td>
                  <td className="py-2 text-slate-600 dark:text-slate-400">{opt.liquidity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white shrink-0`}>
        <i className={`fas ${icon}`} />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-base font-bold text-slate-800 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

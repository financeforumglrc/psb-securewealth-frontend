import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTwinContext } from './WealthTwinContext';

export default function RebalanceTab() {
  const { rebalance, marketData, setView } = useTwinContext();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Current Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rebalance.current} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                  {rebalance.current.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Target Allocation (AI Suggested)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rebalance.target} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                  {rebalance.target.map((entry, index) => <Cell key={`cell-t-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Market-Aware Rebalancing Action</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-[10px] text-slate-500">NIFTY P/E</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{marketData.niftyPe}</p>
            <p className="text-xs text-slate-500">{marketData.niftyPe > 26 ? 'Overvalued → Reduce equity' : marketData.niftyPe < 22 ? 'Undervalued → Increase equity' : 'Fair value'}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-[10px] text-slate-500">Inflation</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{marketData.inflation}%</p>
            <p className="text-xs text-slate-500">{marketData.inflation > 6 ? 'High → Add gold/FD' : 'Moderate'}</p>
          </div>
          <div className="p-4 bg-violet-50 dark:bg-violet-900/10 rounded-lg border border-violet-100 dark:border-violet-800/20">
            <p className="text-sm font-bold text-violet-700 dark:text-violet-300">AI Action</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{rebalance.action}</p>
            <button onClick={() => setView('portfolio')} className="mt-2 px-3 py-1 bg-violet-500 text-white text-[10px] font-bold rounded-lg hover:bg-violet-600">
              Rebalance Portfolio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

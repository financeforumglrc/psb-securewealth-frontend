import { useTwinContext } from './WealthTwinContext';

export default function TaxTab() {
  const { taxOptimizer, user } = useTwinContext();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4"><i className="fas fa-calculator text-primary mr-2" />AI Tax Optimization Plan</h3>
          <div className="space-y-4">
            {taxOptimizer.suggestions.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{item.name}</p>
                  <p className="text-xs text-slate-500">Recommended: ₹{item.recommended.toLocaleString()} / Limit: ₹{item.limit.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">Save ₹{item.saving.toLocaleString()}</p>
                  <button className="mt-1 px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90">{item.action}</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-primary/5 dark:from-emerald-900/10 dark:to-primary/10 rounded-lg border border-emerald-100 dark:border-emerald-800/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800 dark:text-white">Total Potential Tax Saving</span>
              <span className="text-xl font-black text-emerald-600">₹{taxOptimizer.totalSaving.toLocaleString()}/year</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
            <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Tax Bracket</h4>
            <p className="text-3xl font-black text-primary">{user.taxBracket || 30}%</p>
            <p className="text-xs text-slate-500 mt-1">Annual Income: ₹{taxOptimizer.annualIncome.toLocaleString()}</p>
          </div>
          <div className="card">
            <h4 className="font-semibold text-slate-800 dark:text-white mb-2">AI Priority</h4>
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside">
              <li>Max out 80C via ELSS + PPF</li>
              <li>Add NPS 80CCD(1B) ₹50,000</li>
              <li>Submit HRA proofs</li>
              <li>Health insurance 80D</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

import { getMyFantasyPortfolio } from '../../services/leagueService';

export default function FantasyPortfolio() {
  const portfolio = getMyFantasyPortfolio();

  return (
    <div className="space-y-4">
      <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
            <i className="fas fa-briefcase" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">{portfolio.name}</h3>
            <p className="text-xs text-slate-400">Fantasy Portfolio</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-lg font-bold text-slate-800 dark:text-white">₹{(portfolio.portfolioValue / 1e5).toFixed(1)}L</p>
            <p className="text-[10px] text-emerald-500 font-bold">+{portfolio.weeklyReturn}% this week</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-center border border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400">Savings Rate</p>
            <p className="text-sm font-bold text-primary">{portfolio.savingsRate}%</p>
          </div>
          <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-center border border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400">Goal Progress</p>
            <p className="text-sm font-bold text-secondary">{portfolio.goalProgress}%</p>
          </div>
          <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-center border border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400">Rank</p>
            <p className="text-sm font-bold text-violet-500">#12</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Holdings</p>
          {portfolio.holdings.map((h) => (
            <div key={h.name} className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${h.allocation}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 w-20 text-right truncate">{h.name}</span>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 w-10 text-right">{h.allocation}%</span>
              <span className="text-[10px] text-emerald-500 w-10 text-right">+{h.return}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

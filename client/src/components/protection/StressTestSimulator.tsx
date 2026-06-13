import { useState } from 'react';

interface Scenario {
  id: string;
  name: string;
  icon: string;
  color: string;
  desc: string;
}

const SCENARIOS: Scenario[] = [
  { id: 'job-loss', name: 'Job Loss', icon: 'fa-briefcase', color: '#ef4444', desc: 'Income drops to zero. How long can you survive?' },
  { id: 'medical', name: 'Medical Emergency', icon: 'fa-heart-pulse', color: '#f59e0b', desc: 'Sudden ₹5,00,000 hospital bill.' },
  { id: 'market-crash', name: 'Market Crash', icon: 'fa-chart-line', color: '#8b5cf6', desc: 'Equity portfolio drops 40% overnight.' },
];

export default function StressTestSimulator() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<{ scenario: Scenario; msg: string; runway?: number; shortfall?: number; netWorthAfter?: number } | null>(null);

  const liquid = 850000;
  const investments = 2100000;
  const monthlyExpenses = 72000;
  const netWorth = 4520000;

  function run(scenarioId: string) {
    const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
    let runway = 0, shortfall = 0, netWorthAfter = netWorth, msg = '';

    if (scenarioId === 'job-loss') {
      runway = liquid / monthlyExpenses;
      msg = runway >= 6
        ? `Your emergency fund covers ${runway.toFixed(1)} months. Well done!`
        : `Warning: You only have ${runway.toFixed(1)} months of coverage. Build a 6-month buffer.`;
    } else if (scenarioId === 'medical') {
      shortfall = Math.max(0, 500000 - liquid);
      runway = (liquid - 500000) / monthlyExpenses;
      msg = shortfall > 0 ? `You need ₹${shortfall.toLocaleString('en-IN')} more liquid funds.` : 'Your liquid funds can absorb this shock.';
    } else if (scenarioId === 'market-crash') {
      const drop = investments * 0.40;
      netWorthAfter = netWorth - drop;
      msg = `Your net worth would drop to ₹${(netWorthAfter / 1e5).toFixed(2)}L. Stay invested — markets recover.`;
    }

    setResult({ scenario, msg, runway: runway > 0 ? runway : undefined, shortfall: shortfall > 0 ? shortfall : undefined, netWorthAfter: netWorthAfter !== netWorth ? netWorthAfter : undefined });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="card text-left hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">
            <i className="fas fa-bolt" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Stress Test</h3>
            <p className="text-[10px] text-slate-400">Model life events and measure resilience</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Test your portfolio against job loss, medical emergencies, and market crashes.</p>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-rose-500 to-amber-500 p-5 text-white">
              <h3 className="text-lg font-bold"><i className="fas fa-bolt mr-2" />Financial Stress Test</h3>
              <p className="text-xs text-white/80 mt-1">Model life events and measure your financial resilience.</p>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {SCENARIOS.map((s) => (
                  <button key={s.id} onClick={() => run(s.id)} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center">
                    <div className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1" style={{ background: `${s.color}15`, color: s.color }}>
                      <i className={`fas ${s.icon} text-xs`} />
                    </div>
                    <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">{s.name}</p>
                  </button>
                ))}
              </div>
              {result && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${result.scenario.color}15`, color: result.scenario.color }}>
                      <i className={`fas ${result.scenario.icon}`} />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{result.scenario.name}</p>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{result.msg}</p>
                  {result.runway !== undefined && (
                    <div className="flex items-center justify-between text-xs py-1.5 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-slate-500">Cash Runway</span>
                      <span className={`font-bold ${result.runway >= 6 ? 'text-emerald-500' : 'text-amber-500'}`}>{result.runway.toFixed(1)} months</span>
                    </div>
                  )}
                  {result.shortfall !== undefined && (
                    <div className="flex items-center justify-between text-xs py-1.5 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-slate-500">Shortfall</span>
                      <span className="font-bold text-danger">₹{result.shortfall.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {result.netWorthAfter !== undefined && (
                    <div className="flex items-center justify-between text-xs py-1.5 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-slate-500">Net Worth After</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">₹{(result.netWorthAfter / 1e5).toFixed(2)}L</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => setOpen(false)} className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

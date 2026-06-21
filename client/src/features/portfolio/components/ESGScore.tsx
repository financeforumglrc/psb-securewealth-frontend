import { useState } from 'react';

const HOLDINGS = [
  { name: 'Axis ESG Equity', score: 'A', pct: 25, reason: 'Strong environmental & governance practices' },
  { name: 'SBI Magnum Equity', score: 'B+', pct: 20, reason: 'Above-average social responsibility metrics' },
  { name: 'Mirae Emerging Bluechip', score: 'B', pct: 30, reason: 'Mid-tier ESG compliance, improving' },
  { name: 'HDFC Index Fund', score: 'A-', pct: 15, reason: 'Tracks NIFTY 100 with ESG overlay' },
  { name: 'ICICI Pru Technology', score: 'C+', pct: 10, reason: 'Tech sector has lower environmental scores' },
];

const SCORES: Record<string, number> = { A: 90, 'A-': 85, 'B+': 78, B: 70, 'B-': 65, 'C+': 58, C: 50 };

function getOverall() {
  let total = 0, weight = 0;
  HOLDINGS.forEach((h) => { total += (SCORES[h.score] || 70) * h.pct; weight += h.pct; });
  const avg = total / weight;
  if (avg >= 85) return { grade: 'A', label: 'Excellent', color: 'emerald', pct: Math.round(avg) };
  if (avg >= 75) return { grade: 'B+', label: 'Good', color: 'primary', pct: Math.round(avg) };
  if (avg >= 65) return { grade: 'B', label: 'Average', color: 'amber', pct: Math.round(avg) };
  return { grade: 'C', label: 'Needs Improvement', color: 'rose', pct: Math.round(avg) };
}

export default function ESGScore() {
  const [showDetails, setShowDetails] = useState(false);
  const overall = getOverall();
  const colorClass = overall.color === 'emerald' ? 'text-emerald-600 border-emerald-500' : overall.color === 'primary' ? 'text-primary border-primary' : overall.color === 'amber' ? 'text-amber-600 border-amber-500' : 'text-rose-600 border-rose-500';

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm"><i className="fas fa-leaf text-emerald-500 mr-2" />ESG Portfolio Score</h3>
          <span className={`text-xs font-bold ${colorClass.split(' ')[0]}`}>{overall.grade}</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center ${colorClass}`}>
            <span className={`text-sm font-bold ${colorClass.split(' ')[0]}`}>{overall.pct}</span>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{overall.label}</p>
            <p className="text-[10px] text-slate-400">Based on 5 holdings</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {HOLDINGS.map((h) => (
            <div key={h.name} className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500 truncate flex-1">{h.name}</span>
              <span className="font-medium text-slate-700 dark:text-slate-200 ml-2">{h.score}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setShowDetails(true)} className="mt-2 text-[10px] text-primary hover:underline">Learn more about ESG criteria</button>
      </div>

      {showDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setShowDetails(false)}>
          <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-md w-full p-5 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><i className="fas fa-leaf text-xs" /></div>
              <h3 className="font-semibold text-slate-800 dark:text-white">ESG Score Breakdown</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">Environmental, Social, and Governance scores for your portfolio holdings.</p>
            <div className="space-y-2">
              {HOLDINGS.map((h) => (
                <div key={h.name} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{h.name}</span>
                    <span className="text-xs font-bold text-emerald-600">{h.score}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{h.reason}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setShowDetails(false)} className="mt-4 w-full py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90">Close</button>
          </div>
        </div>
      )}
    </>
  );
}

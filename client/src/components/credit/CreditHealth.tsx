import { useState } from 'react';
import { useWealthStore } from '../../store/wealthStore';

const SCORE_MIN = 300;
const SCORE_MAX = 900;

function getScoreLabel(score: number) {
  if (score >= 800) return { label: 'Exceptional', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  if (score >= 750) return { label: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  if (score >= 700) return { label: 'Good', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
  if (score >= 650) return { label: 'Fair', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
  if (score >= 600) return { label: 'Poor', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' };
  return { label: 'Very Poor', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' };
}

function Gauge({ score, target }: { score: number; target: number }) {
  const radius = 80;
  const stroke = 14;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const arc = circumference * 0.75;
  const strokeDashoffset = arc - (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN) * arc;
  const targetOffset = arc - (target - SCORE_MIN) / (SCORE_MAX - SCORE_MIN) * arc;
  const label = getScoreLabel(score);

  return (
    <div className="relative flex items-center justify-center w-full overflow-hidden">
      <svg height={radius * 2.4} width={radius * 2.4} viewBox="0 0 200 160" className="transform -rotate-[135deg] max-w-full h-auto">
        {/* Background arc */}
        <circle
          stroke="#e2e8f0"
          strokeWidth={stroke}
          strokeDasharray={`${arc} ${circumference}`}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx="100"
          cy="100"
        />
        {/* Red zone */}
        <circle
          stroke="#fecaca"
          strokeWidth={stroke}
          strokeDasharray={`${arc * 0.33} ${circumference}`}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx="100"
          cy="100"
        />
        {/* Amber zone */}
        <circle
          stroke="#fde68a"
          strokeWidth={stroke}
          strokeDasharray={`${arc * 0.27} ${circumference}`}
          strokeDashoffset={-arc * 0.33}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx="100"
          cy="100"
        />
        {/* Green zone */}
        <circle
          stroke="#bbf7d0"
          strokeWidth={stroke}
          strokeDasharray={`${arc * 0.40} ${circumference}`}
          strokeDashoffset={-arc * 0.60}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx="100"
          cy="100"
        />
        {/* Target marker */}
        <circle
          stroke="#0f766e"
          strokeWidth={stroke + 2}
          strokeDasharray={`2 ${circumference}`}
          strokeDashoffset={-targetOffset}
          strokeLinecap="butt"
          fill="transparent"
          r={normalizedRadius}
          cx="100"
          cy="100"
          opacity={0.5}
        />
        {/* Score arc */}
        <circle
          stroke="#0f766e"
          strokeWidth={stroke}
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={-strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx="100"
          cy="100"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-6">
        <p className="text-4xl font-black text-slate-800 dark:text-white">{score}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${label.bg} ${label.color} ${label.border} border`}>
          {label.label}
        </span>
        <p className="text-[10px] text-slate-400 mt-1">Target: {target}+</p>
      </div>
    </div>
  );
}

export default function CreditHealth() {
  const cibilScore = useWealthStore((s) => s.cibilScore);
  const cibilFactors = useWealthStore((s) => s.cibilFactors);
  const [simulatedScore, setSimulatedScore] = useState<number | null>(null);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const scenarios = [
    {
      id: 'util',
      label: 'Reduce credit utilization to 30%',
      description: 'Pay down ₹70,000 on credit cards',
      from: 748,
      to: 772,
      impact: 'positive',
    },
    {
      id: 'loan',
      label: 'Pay off personal loan',
      description: 'Close ₹3,50,000 personal loan',
      from: 748,
      to: 761,
      impact: 'positive',
    },
    {
      id: 'newcard',
      label: 'Apply for new credit card',
      description: 'Adds 1 hard inquiry + new account',
      from: 748,
      to: 735,
      impact: 'negative',
    },
  ];

  const worstFactor = cibilFactors.filter((f) => f.status === 'warning').sort((a, b) => a.score - b.score)[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-xs text-slate-400 uppercase">CIBIL Score</p>
          <p className={`text-2xl font-bold ${getScoreLabel(simulatedScore ?? cibilScore).color}`}>
            {simulatedScore ?? cibilScore}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-400 uppercase">Target</p>
          <p className="text-2xl font-bold text-emerald-600">750+</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-400 uppercase">Gap</p>
          <p className="text-2xl font-bold text-primary">
            {simulatedScore ? Math.max(0, 750 - simulatedScore) : Math.max(0, 750 - cibilScore)}
          </p>
        </div>
      </div>

      {/* Gauge + Factors Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gauge Card */}
        <div className="card flex flex-col items-center justify-center">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-2 self-start">
            <i className="fas fa-gauge-high text-primary mr-2" />
            CIBIL Score Gauge
          </h3>
          <Gauge score={simulatedScore ?? cibilScore} target={750} />
          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-300" /> 300-600</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-300" /> 600-750</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-300" /> 750-900</div>
          </div>
          {simulatedScore && (
            <button
              onClick={() => { setSimulatedScore(null); setActiveScenario(null); }}
              className="mt-3 text-xs text-slate-400 hover:text-primary flex items-center gap-1"
            >
              <i className="fas fa-rotate-left" /> Reset to actual score
            </button>
          )}
        </div>

        {/* Factors Breakdown */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-4">
            <i className="fas fa-chart-pie text-secondary mr-2" />
            Score Breakdown
          </h3>
          <div className="space-y-3">
            {cibilFactors.map((factor) => {
              const pct = (factor.score / factor.maxScore) * 100;
              const barColor = factor.status === 'good' ? 'bg-emerald-500' : factor.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500';
              return (
                <div key={factor.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <i className={`fas ${factor.icon} text-xs text-slate-400 w-4 text-center`} />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{factor.name}</span>
                      <span className="text-[10px] text-slate-400">({factor.weight}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">{factor.score}</span>
                      {factor.status === 'good' ? (
                        <i className="fas fa-check-circle text-emerald-500 text-[10px]" />
                      ) : (
                        <i className="fas fa-triangle-exclamation text-amber-500 text-[10px]" />
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-1">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400">{factor.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Recommendation */}
      {worstFactor && (
        <div className="card bg-gradient-to-r from-primary/5 to-transparent border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
              <i className="fas fa-wand-magic-sparkles" />
            </div>
            <div>
              <h4 className="font-semibold text-primary text-sm">AI Credit Recommendation</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Your <strong>{worstFactor.name}</strong> is dragging your score down. 
                {worstFactor.name === 'Credit Utilization' 
                  ? ` Reduce credit card usage by ₹15,000 to bring utilization below 30% and reach 750+ CIBIL.`
                  : ` Avoid new credit applications for 3 months to let inquiries age.`}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                  Potential gain: +{worstFactor.name === 'Credit Utilization' ? '24' : '15'} points
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                  Time to impact: {worstFactor.name === 'Credit Utilization' ? '1-2 weeks' : '1-2 months'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credit Simulator */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">
          <i className="fas fa-flask text-accent mr-2" />
          Credit Simulator
        </h3>
        <p className="text-xs text-slate-400 mb-4">See how different actions affect your CIBIL score</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((s) => {
            const isActive = activeScenario === s.id;
            const delta = s.to - s.from;
            return (
              <button
                key={s.id}
                onClick={() => { setSimulatedScore(isActive ? null : s.to); setActiveScenario(isActive ? null : s.id); }}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isActive
                    ? s.impact === 'positive' ? 'border-emerald-300 bg-emerald-50/50' : 'border-rose-300 bg-rose-50/50'
                    : 'border-slate-200 hover:border-primary/30 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    s.impact === 'positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {s.impact === 'positive' ? 'Positive' : 'Negative'}
                  </span>
                  {isActive && <i className={`fas fa-check-circle ${s.impact === 'positive' ? 'text-emerald-500' : 'text-rose-500'}`} />}
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-white mb-1">{s.label}</p>
                <p className="text-[10px] text-slate-400 mb-3">{s.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-400">{s.from}</span>
                  <i className={`fas fa-arrow-right ${s.impact === 'positive' ? 'text-emerald-500' : 'text-rose-500'}`} />
                  <span className={`text-lg font-bold ${s.impact === 'positive' ? 'text-emerald-600' : 'text-rose-600'}`}>{s.to}</span>
                  <span className={`text-xs font-medium ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {delta >= 0 ? '+' : ''}{delta}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {activeScenario && (
          <div className={`mt-4 p-3 rounded-lg text-xs flex items-start gap-2 ${
            scenarios.find((s) => s.id === activeScenario)?.impact === 'positive'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            <i className="fas fa-lightbulb mt-0.5" />
            <p>
              {activeScenario === 'util' && 'Bringing utilization below 30% is the fastest way to boost your score. Pay before statement date for best impact.'}
              {activeScenario === 'loan' && 'Closing the personal loan improves your credit mix and reduces monthly obligation. Consider keeping the oldest card open.'}
              {activeScenario === 'newcard' && 'Warning: A new inquiry will drop your score by ~13 points and stay on report for 24 months. Only apply if necessary.'}
            </p>
          </div>
        )}
      </div>

      {/* Credit Report Teaser */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400">
              <i className="fas fa-file-invoice" />
            </div>
            <div>
              <h4 className="font-medium text-slate-800 dark:text-white text-sm">Full Credit Report</h4>
              <p className="text-xs text-slate-400">Detailed account history, inquiries, and disputes</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors">
            <i className="fas fa-download mr-1" /> Download (Mock)
          </button>
        </div>
      </div>
    </div>
  );
}

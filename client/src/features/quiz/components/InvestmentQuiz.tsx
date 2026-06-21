import { useState } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';

interface Question {
  id: number;
  text: string;
  options: { label: string; icon: string; score: number }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Market drops 20%. You...',
    options: [
      { label: 'Buy more — opportunity!', icon: 'fa-arrow-trend-up', score: 3 },
      { label: 'Hold and wait', icon: 'fa-hand', score: 2 },
      { label: 'Sell to cut losses', icon: 'fa-arrow-trend-down', score: 1 },
      { label: 'Panic and exit all', icon: 'fa-triangle-exclamation', score: 0 },
    ],
  },
  {
    id: 2,
    text: 'Emergency fund status?',
    options: [
      { label: '6+ months covered', icon: 'fa-shield-halved', score: 3 },
      { label: '3 months saved', icon: 'fa-piggy-bank', score: 2 },
      { label: 'Working on it', icon: 'fa-hammer', score: 1 },
      { label: 'None yet', icon: 'fa-circle-xmark', score: 0 },
    ],
  },
  {
    id: 3,
    text: 'Investment horizon?',
    options: [
      { label: '10+ years', icon: 'fa-calendar-check', score: 3 },
      { label: '5–10 years', icon: 'fa-calendar-days', score: 2 },
      { label: '1–5 years', icon: 'fa-calendar-week', score: 1 },
      { label: 'Less than 1 year', icon: 'fa-calendar-day', score: 0 },
    ],
  },
  {
    id: 4,
    text: 'Preferred investment?',
    options: [
      { label: 'Stocks / Mutual Funds', icon: 'fa-chart-line', score: 3 },
      { label: 'Real Estate', icon: 'fa-house', score: 2 },
      { label: 'Gold / Commodities', icon: 'fa-coins', score: 1 },
      { label: 'Fixed Deposits', icon: 'fa-vault', score: 0 },
    ],
  },
  {
    id: 5,
    text: 'Risk tolerance?',
    options: [
      { label: 'High — I can handle volatility', icon: 'fa-bolt', score: 3 },
      { label: 'Medium — Some risk is okay', icon: 'fa-scale-balanced', score: 2 },
      { label: 'Low — Safety first', icon: 'fa-lock', score: 1 },
      { label: 'Zero — Cannot lose money', icon: 'fa-ban', score: 0 },
    ],
  },
];

interface Result {
  name: string;
  animal: string;
  icon: string;
  color: string;
  bg: string;
  description: string;
  traits: string[];
  allocation: { label: string; pct: string; color: string }[];
}

function getResult(totalScore: number): Result {
  if (totalScore >= 12) {
    return {
      name: 'The Aggressive Owl',
      animal: 'Owl',
      icon: 'fa-owl',
      color: 'text-violet-700',
      bg: 'bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800',
      description: 'You have a sharp eye for opportunity and thrive on market volatility. Long-term wealth creation through equity is your playbook.',
      traits: ['Equity-focused', 'Long horizon', 'High conviction', 'Volatility-tolerant'],
      allocation: [
        { label: 'Equity', pct: '70%', color: '#8b5cf6' },
        { label: 'Debt', pct: '15%', color: '#0f766e' },
        { label: 'Gold', pct: '10%', color: '#f59e0b' },
        { label: 'Cash', pct: '5%', color: '#94a3b8' },
      ],
    };
  }
  if (totalScore >= 8) {
    return {
      name: 'The Balanced Elephant',
      animal: 'Elephant',
      icon: 'fa-elephant',
      color: 'text-primary',
      bg: 'bg-primary/5 border-primary/10',
      description: 'Steady, wise, and diversified. You understand that slow and consistent wins the race. A true wealth builder.',
      traits: ['Diversified', 'Steady SIPs', 'Balanced risk', 'Goal-oriented'],
      allocation: [
        { label: 'Equity', pct: '50%', color: '#8b5cf6' },
        { label: 'Debt', pct: '25%', color: '#0f766e' },
        { label: 'Gold', pct: '15%', color: '#f59e0b' },
        { label: 'Cash', pct: '10%', color: '#94a3b8' },
      ],
    };
  }
  if (totalScore >= 4) {
    return {
      name: 'The Conservative Tortoise',
      animal: 'Tortoise',
      icon: 'fa-shield-cat',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800',
      description: 'Safety and stability drive your decisions. You prefer guaranteed returns over speculation. Capital preservation is key.',
      traits: ['Safety-first', 'FD-heavy', 'Low risk', 'Predictable returns'],
      allocation: [
        { label: 'Equity', pct: '25%', color: '#8b5cf6' },
        { label: 'Debt', pct: '40%', color: '#0f766e' },
        { label: 'Gold', pct: '20%', color: '#f59e0b' },
        { label: 'Cash', pct: '15%', color: '#94a3b8' },
      ],
    };
  }
  return {
    name: 'The Fearful Rabbit',
    animal: 'Rabbit',
    icon: 'fa-carrot',
    color: 'text-rose-700',
    bg: 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800',
    description: 'You are cautious and risk-averse. Before investing, you need financial education and an emergency fund. Start small, learn first.',
    traits: ['Needs education', 'Risk-averse', 'Beginner-friendly', 'Start small'],
    allocation: [
      { label: 'Equity', pct: '10%', color: '#8b5cf6' },
      { label: 'Debt', pct: '50%', color: '#0f766e' },
      { label: 'Gold', pct: '20%', color: '#f59e0b' },
      { label: 'Cash', pct: '20%', color: '#94a3b8' },
    ],
  };
}

export default function InvestmentQuiz() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [result, setResult] = useState<Result | null>(null);

  const quizResult = useWealthStore((s) => s.quizResult);
  const setQuizResult = useWealthStore((s) => s.setQuizResult);
  const unlockBadge = useWealthStore((s) => s.unlockBadge);
  const setView = useWealthStore((s) => s.setView);

  function start() {
    setStep(0);
    setScores([]);
    setResult(null);
    setOpen(true);
  }

  function answer(score: number) {
    const newScores = [...scores, score];
    setScores(newScores);
    if (newScores.length >= QUESTIONS.length) {
      const total = newScores.reduce((a, b) => a + b, 0);
      const r = getResult(total);
      setResult(r);
      setQuizResult({ name: r.name, score: total, date: new Date().toISOString() });
      unlockBadge('personality');
    } else {
      setStep(newScores.length);
    }
  }

  function goToRecommendations() {
    setOpen(false);
    setView('wealth-twin');
  }

  function reset() {
    setStep(0);
    setScores([]);
    setResult(null);
  }

  const progress = ((step + (result ? 1 : 0)) / QUESTIONS.length) * 100;

  return (
    <>
      {/* Trigger Card on Dashboard */}
      <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={start}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-clipboard-question text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Discover Your Investment Personality</h3>
            <p className="text-xs text-slate-500">
              {quizResult ? `You are: ${quizResult.name}` : '5 questions to unlock your financial DNA'}
            </p>
          </div>
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <i className="fas fa-chevron-right text-sm" />
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Investment Personality Quiz</h3>
                <p className="text-xs text-white/80 mt-0.5">{result ? 'Your Result' : `Question ${step + 1} of ${QUESTIONS.length}`}</p>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">
                <i className="fas fa-times text-sm" />
              </button>
            </div>

            {/* Progress */}
            {!result && (
              <div className="px-6 pt-4">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="p-6">
              {!result ? (
                <div className="space-y-4">
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{QUESTIONS[step].text}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {QUESTIONS[step].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => answer(opt.score)}
                        className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all text-left"
                      >
                        <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-primary shadow-sm">
                          <i className={`fas ${opt.icon}`} />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  {/* Animal Emoji fallback since FontAwesome may not have owl/elephant */}
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl ${result.bg} border-2`}>
                    {result.animal === 'Owl' && '🦉'}
                    {result.animal === 'Elephant' && '🐘'}
                    {result.animal === 'Tortoise' && '🐢'}
                    {result.animal === 'Rabbit' && '🐇'}
                  </div>

                  <div>
                    <p className={`text-2xl font-bold ${result.color}`}>{result.name}</p>
                    <p className="text-xs text-slate-500 mt-1">Score: {scores.reduce((a, b) => a + b, 0)}/15</p>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300">{result.description}</p>

                  {/* Traits */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {result.traits.map((t) => (
                      <span key={t} className={`px-3 py-1 rounded-full text-xs font-medium ${result.bg} ${result.color}`}>
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Allocation */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Suggested Allocation</p>
                    <div className="flex h-6 rounded-full overflow-hidden">
                      {result.allocation.map((a) => (
                        <div key={a.label} style={{ width: a.pct, backgroundColor: a.color }} title={`${a.label}: ${a.pct}`} />
                      ))}
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                      {result.allocation.map((a) => (
                        <div key={a.label} className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                          <span className="text-[10px] text-slate-600">{a.label} {a.pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button onClick={reset} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                      Retake
                    </button>
                    <button onClick={goToRecommendations} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                      <i className="fas fa-wand-magic-sparkles" /> Get My Plan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

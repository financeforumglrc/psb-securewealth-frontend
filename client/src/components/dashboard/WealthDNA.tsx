import { useState, useEffect, useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { useWealthStore } from '../../store/wealthStore';

type ScoreKey = 'savings' | 'diversity' | 'risk' | 'tax' | 'protection' | 'goals';

const AXES: { key: ScoreKey; label: string }[] = [
  { key: 'savings', label: 'Savings Discipline' },
  { key: 'diversity', label: 'Investment Diversity' },
  { key: 'risk', label: 'Risk Appetite' },
  { key: 'tax', label: 'Tax Efficiency' },
  { key: 'protection', label: 'Protection Awareness' },
  { key: 'goals', label: 'Goal Focus' },
];

const IDEAL: Record<ScoreKey, number> = {
  savings: 85,
  diversity: 90,
  risk: 70,
  tax: 95,
  protection: 90,
  goals: 85,
};

function getPersona(scores: Record<string, number>): { name: string; sentence: string } {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = sorted[0][0];
  const bottom = sorted[sorted.length - 1][0];

  const topNames: Record<string, string> = {
    savings: 'Disciplined Saver',
    diversity: 'Diversified Investor',
    risk: 'Bold Investor',
    tax: 'Tax Optimizer',
    protection: 'Security First',
    goals: 'Goal Crusher',
  };

  const bottomWeakness: Record<string, string> = {
    savings: 'low savings rate',
    diversity: 'concentrated portfolio',
    risk: 'missing equity exposure',
    tax: 'untapped tax savings',
    protection: 'security gaps',
    goals: 'unstructured goals',
  };

  return {
    name: topNames[top] || 'Balanced Investor',
    sentence: `You are a ${topNames[top]} — strong on ${AXES.find((a) => a.key === top)?.label.toLowerCase()}, but could improve ${bottomWeakness[bottom]}.`,
  };
}

export default function WealthDNA() {
  const [revealed, setRevealed] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const user = useWealthStore((s) => s.user);
  const assets = useWealthStore((s) => s.assets);
  const goals = useWealthStore((s) => s.goals);
  const transactions = useWealthStore((s) => s.transactions);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const scores = useMemo(() => {
    const assetTypes = new Set(assets.map((a) => a.type)).size;
    const savingsDiscipline = Math.min(Math.round((user.monthlySavings / user.monthlyIncome) * 250), 100);
    const diversity = Math.min(assetTypes * 18, 100);
    const risk = user.riskProfile === 'Aggressive' ? 90 : user.riskProfile === 'Moderate' ? 65 : 35;
    const tax = Math.min(Math.round((assets.filter((a) => a.type === 'mutualFund').reduce((s, a) => s + a.value, 0) / 150000) * 100), 100);
    const protection = Math.min(60 + transactions.filter((t) => t.status === 'BLOCKED').length * 15, 100);
    const goalFocus = goals.length > 0 ? Math.min(Math.round(goals.reduce((s, g) => s + (g.currentAmount / g.targetAmount), 0) / goals.length * 100), 100) : 50;

    return { savings: savingsDiscipline, diversity, risk, tax, protection, goals: goalFocus } as Record<ScoreKey, number>;
  }, [user, assets, goals, transactions]);

  const data = AXES.map((axis) => ({
    axis: axis.label,
    user: scores[axis.key],
    ideal: IDEAL[axis.key as keyof typeof IDEAL],
  }));

  const persona = useMemo(() => getPersona(scores), [scores]);

  const avgScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6);

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">
              <i className="fas fa-fingerprint text-primary mr-2" /> Wealth DNA
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your financial fingerprint</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400">DNA Score</p>
              <p className="text-lg font-bold text-primary">{avgScore}</p>
            </div>
            <button
              onClick={() => setShowShare(true)}
              className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1.5"
            >
              <i className="fas fa-share-nodes" /> Share
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-1000 ${revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          {/* Radar Chart */}
          <div className="lg:col-span-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: '#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickCount={6} />
                <Radar
                  name="Ideal"
                  dataKey="ideal"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  fill="#f59e0b"
                  fillOpacity={0.05}
                  isAnimationActive={true}
                  animationDuration={1500}
                />
                <Radar
                  name="Your DNA"
                  dataKey="user"
                  stroke="#0f766e"
                  strokeWidth={3}
                  fill="#0f766e"
                  fillOpacity={0.25}
                  isAnimationActive={true}
                  animationDuration={2000}
                  animationEasing="ease-out"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Scores List */}
          <div className="space-y-3">
            {AXES.map((axis) => {
              const score = scores[axis.key];
              const ideal = IDEAL[axis.key as keyof typeof IDEAL];
              const diff = score - ideal;
              return (
                <div key={axis.key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-300">{axis.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 dark:text-white">{score}</span>
                      <span className="text-[10px] text-slate-400">/ {ideal}</span>
                      {diff >= 0 ? (
                        <i className="fas fa-arrow-up text-emerald-500 text-[10px]" />
                      ) : (
                        <i className="fas fa-arrow-down text-amber-500 text-[10px]" />
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                      style={{ width: revealed ? `${score}%` : '0%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insight */}
        <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
          <p className="text-sm text-primary font-medium text-center">
            <i className="fas fa-wand-magic-sparkles mr-1" />
            {persona.sentence}
          </p>
        </div>
      </div>

      {/* Share Card Modal */}
      {showShare && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={() => setShowShare(false)}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {/* The Share Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full overflow-hidden relative">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <i className="fas fa-shield-halved text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">My Wealth DNA</h3>
                <p className="text-xs text-slate-400">{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>

                {/* DNA Score */}
                <div className="my-4">
                  <p className="text-4xl font-black text-primary">{avgScore}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Financial DNA Score</p>
                </div>

                {/* Persona */}
                <div className="p-3 bg-primary/5 rounded-xl mb-4">
                  <p className="text-sm font-bold text-primary">{persona.name}</p>
                </div>

                {/* Top 3 Scores */}
                <div className="space-y-2 text-left">
                  {Object.entries(scores)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([key, score], i) => {
                      const axis = AXES.find((a) => a.key === key as ScoreKey)!;
                      return (
                        <div key={key} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                            <span className="text-xs text-slate-700 dark:text-slate-200">{axis.label}</span>
                          </div>
                          <span className="text-xs font-bold text-primary">{score}</span>
                        </div>
                      );
                    })}
                </div>

                {/* Insight */}
                <p className="text-xs text-slate-500 mt-4 italic">"{persona.sentence}"</p>

                {/* Branding */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400">securewealth-twin.surge.sh</p>
                  <p className="text-[10px] text-primary font-medium">SecureWealth Twin • PSB Hackathon 2026</p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-white/70 mb-2">Screenshot this card to share</p>
              <button onClick={() => setShowShare(false)} className="px-6 py-2 bg-white text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

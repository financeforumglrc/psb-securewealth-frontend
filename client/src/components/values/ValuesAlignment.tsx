import { useState, useEffect } from 'react';
import { getUserValues, setUserValues, analyzePortfolioConflicts, MOCK_HOLDINGS, type UserValues } from '../../services/esgService';
import { useWealthStore } from '../../store/wealthStore';
import ELI5Tooltip from '../ai/ELI5Tooltip';

const VALUE_OPTIONS: { key: keyof UserValues; label: string; icon: string; description: string }[] = [
  { key: 'lowCarbon', label: 'Low Carbon', icon: 'fa-leaf', description: 'Avoid high carbon footprint investments' },
  { key: 'animalWelfare', label: 'Animal Welfare', icon: 'fa-paw', description: 'Exclude companies with poor animal welfare' },
  { key: 'tobaccoFree', label: 'Tobacco-Free', icon: 'fa-ban-smoking', description: 'No tobacco or vaping industry exposure' },
  { key: 'fairLabor', label: 'Fair Labor', icon: 'fa-helmet-safety', description: 'Support ethical labor practices' },
  { key: 'genderEquality', label: 'Gender Equality', icon: 'fa-venus-mars', description: 'Prioritize gender-diverse leadership' },
];

export default function ValuesAlignment() {
  const assets = useWealthStore((s) => s.assets);
  const portfolioValue = assets.reduce((s, a) => s + a.value, 0);
  const [values, setValues] = useState<UserValues>(getUserValues());
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzePortfolioConflicts> | null>(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmSuggestion, setLlmSuggestion] = useState('');

  useEffect(() => {
    const a = analyzePortfolioConflicts(portfolioValue, values);
    setAnalysis(a);
  }, [values, portfolioValue]);

  useEffect(() => {
    if (analysis && analysis.conflictPercent > 0) {
      setLlmLoading(true);
      const timer = setTimeout(() => {
        setLlmSuggestion(analysis.suggestion);
        setLlmLoading(false);
      }, 1200);
      return () => clearTimeout(timer);
    } else if (analysis) {
      setLlmSuggestion(analysis.suggestion);
    }
  }, [analysis]);

  const toggle = (key: keyof UserValues) => {
    const next = { ...values, [key]: !values[key] };
    setValues(next);
    setUserValues(next);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <i className="fas fa-hand-holding-heart" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white">Your Values</h2>
            <p className="text-xs text-slate-400">Align your portfolio with what matters to you</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {VALUE_OPTIONS.map((v) => (
            <button
              key={v.key}
              onClick={() => toggle(v.key)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                values[v.key]
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-700'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-70'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  values[v.key] ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                }`}
              >
                <i className={`fas ${v.icon} text-xs`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${values[v.key] ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}>
                  {v.label}
                </p>
                <p className="text-[10px] text-slate-400">{v.description}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  values[v.key] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                }`}
              >
                {values[v.key] && <i className="fas fa-check text-[10px] text-white" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Analysis */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-chart-pie text-primary" /> Portfolio Alignment
          </h3>
          <ELI5Tooltip term="ESG Score" />
        </div>

        {analysis && analysis.conflictHoldings.length > 0 ? (
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-200 dark:border-rose-800">
              <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">
                ⚠️ {analysis.conflictPercent}% of your portfolio conflicts with your values
              </p>
            </div>

            <div className="space-y-2">
              {analysis.conflictHoldings.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                      <i className="fas fa-triangle-exclamation text-xs" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{h.name}</p>
                      <p className="text-[10px] text-slate-400">ESG Grade: {h.esgGrade} · Value: ₹{h.value.toLocaleString()}</p>
                    </div>
                  </div>
                  {h.alternatives[0] && (
                    <span className="text-[10px] px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold">
                      → {h.alternatives[0]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
            <i className="fas fa-check-circle text-emerald-500 text-2xl mb-2" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Your portfolio aligns with your values!</p>
          </div>
        )}

        {/* LLM Suggestion */}
        <div className="mt-4 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/10 dark:to-indigo-900/10 rounded-xl border border-violet-200 dark:border-violet-800">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-robot text-violet-500" />
            <p className="text-xs font-bold text-violet-700 dark:text-violet-300">AI Portfolio Advisor</p>
          </div>
          {llmLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-violet-200 dark:bg-violet-800 rounded w-full" />
              <div className="h-3 bg-violet-200 dark:bg-violet-800 rounded w-4/5" />
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{llmSuggestion}</p>
          )}
        </div>

        {/* ESG Holdings Table */}
        <div className="mt-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">All Holdings ESG Scores</p>
          <div className="space-y-2">
            {MOCK_HOLDINGS.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      h.esgScore >= 80 ? 'bg-emerald-400' : h.esgScore >= 65 ? 'bg-amber-400' : 'bg-rose-400'
                    }`}
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-200">{h.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-500">{h.esgGrade}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

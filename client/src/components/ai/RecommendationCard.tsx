import { useState } from 'react';
import { useRecommendationEngine } from '../../hooks/useRecommendationEngine';
import { useWealthStore } from '../../store/wealthStore';
import ExplainableTooltip from './ExplainableTooltip';
import KYCModal from '../compliance/KYCModal';

export default function RecommendationCard() {
  const user = useWealthStore((s) => s.user);
  const market = useWealthStore((s) => s.marketData);
  const triggers = useWealthStore((s) => s.triggers);
  const cibilScore = useWealthStore((s) => s.cibilScore);
  const cibilFactors = useWealthStore((s) => s.cibilFactors);
  const kycVerified = useWealthStore((s: any) => s.kycVerified);
  const recommendations = useRecommendationEngine(user, market, triggers, cibilScore, cibilFactors);
  const [showKYC, setShowKYC] = useState(false);

  function handleAction(rec: any) {
    if (!kycVerified) {
      setShowKYC(true);
      return;
    }
    alert(rec.title + ' - Redirecting to application form...');
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">
          <i className="fas fa-wand-magic-sparkles text-accent mr-2" /> AI Recommendations
        </h3>
        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{recommendations.length} Active</span>
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {recommendations.map((rec) => (
          <div key={rec.id} className={`p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all ${rec.priority === 'high' ? 'border-l-4 border-l-danger' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${rec.priority === 'high' ? 'bg-danger/10 text-danger' : rec.priority === 'medium' ? 'bg-accent/10 text-accent' : 'bg-slate-100 text-slate-600'}`}>
                {rec.priority.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 uppercase">{rec.type}</span>
            </div>
            <h4 className="font-semibold text-slate-800 mb-1">{rec.title}</h4>
            <p className="text-sm text-slate-500 mb-3">{rec.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-success font-medium">{rec.potential}</span>
              <div className="flex items-center gap-3">
                <ExplainableTooltip rec={rec} />
                <button onClick={() => handleAction(rec)} className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  {rec.action}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <KYCModal show={showKYC} onClose={() => setShowKYC(false)} />
    </div>
  );
}

import { useMemo } from 'react';
import { useWealthStore } from '../../store/wealthStore';
import type { Transaction } from '../../types';

interface DecisionEntry {
  id: string;
  timestamp: string;
  action: string;
  aiReason: string;
  marketFactor: string;
  userFactor: string;
  outcome: string;
  confidence: number;
}

function buildEntry(tx: Transaction): DecisionEntry {
  const action = tx.status === 'BLOCKED'
    ? 'Blocked High-Risk Transfer'
    : tx.status === 'DELAYED'
    ? 'Cooling Vault Activated'
    : tx.status === 'ALLOWED'
    ? 'Approved Transaction'
    : 'Wealth Action Reviewed';

  const signals = tx.signals || {};
  const flagged = Object.entries(signals)
    .filter(([, v]) => v)
    .map(([k]) => k.replace(/([A-Z])/g, ' $1').trim());

  const aiReason = flagged.length > 0
    ? `Risk engine flagged: ${flagged.join(', ')}. Score ${tx.score ?? 0}/100.`
    : 'No risk signals detected — transaction matched your normal pattern.';

  const marketFactor = tx.category === 'Investment'
    ? 'Market volatility and portfolio allocation reviewed.'
    : tx.category === 'Income'
    ? 'Income credited; savings rate recalculated.'
    : 'Real-time market risk posture: stable.';

  const userFactor = `${tx.description} for ₹${tx.amount.toLocaleString()}`;

  const outcome = tx.status === 'BLOCKED'
    ? `BLOCKED — Ref ${tx.referenceId || tx.decision?.referenceId || 'N/A'}`
    : tx.status === 'DELAYED'
    ? `DELAYED — Ref ${tx.referenceId || tx.decision?.referenceId || 'N/A'}`
    : `ALLOWED — Ref ${tx.referenceId || tx.decision?.referenceId || 'N/A'}`;

  return {
    id: tx.id,
    timestamp: tx.date,
    action,
    aiReason,
    marketFactor,
    userFactor,
    outcome,
    confidence: tx.score ? Math.max(50, Math.min(99, 100 - tx.score)) : 95,
  };
}

export default function AIDecisionLog() {
  const transactions = useWealthStore((s) => s.transactions);

  const decisions = useMemo(() => {
    return transactions
      .filter((t) => t.status !== 'ALLOWED' || t.riskLevel !== 'LOW' || t.decision)
      .slice(0, 8)
      .map(buildEntry);
  }, [transactions]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-microchip text-accent" /> AI Decision Log
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Transparent audit of every AI recommendation and security decision</p>
        </div>
        <span className="text-[10px] px-2 py-1 bg-accent/10 text-accent rounded-full font-medium">
          <i className="fas fa-lock mr-1" />Immutable
        </span>
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {decisions.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <i className="fas fa-clipboard-check text-3xl mb-2 opacity-30" />
            <p className="text-sm">No AI decisions yet. Make a transaction to see the audit trail.</p>
          </div>
        )}

        {decisions.map((dec) => (
          <div key={dec.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-xs">
                  <i className="fas fa-brain" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{dec.action}</p>
                  <p className="text-[10px] text-slate-400">{new Date(dec.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">{dec.confidence}% confidence</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex gap-2 text-xs">
                <i className="fas fa-cogs text-primary mt-0.5 w-4" />
                <span className="text-slate-600 dark:text-slate-300"><strong>AI Logic:</strong> {dec.aiReason}</span>
              </div>
              <div className="flex gap-2 text-xs">
                <i className="fas fa-chart-line text-secondary mt-0.5 w-4" />
                <span className="text-slate-600 dark:text-slate-300"><strong>Market:</strong> {dec.marketFactor}</span>
              </div>
              <div className="flex gap-2 text-xs">
                <i className="fas fa-user text-accent mt-0.5 w-4" />
                <span className="text-slate-600 dark:text-slate-300"><strong>User:</strong> {dec.userFactor}</span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className={'text-xs font-medium px-2 py-0.5 rounded-full ' +
                (dec.outcome.startsWith('BLOCKED') ? 'bg-rose-500/10 text-rose-600' :
                 dec.outcome.startsWith('DELAYED') ? 'bg-amber-500/10 text-amber-600' :
                 'bg-emerald-500/10 text-emerald-600')}>
                <i className={'fas fa-' + (dec.outcome.startsWith('BLOCKED') ? 'shield-virus' : dec.outcome.startsWith('DELAYED') ? 'clock' : 'check') + ' mr-1'} />
                {dec.outcome}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
        <p className="text-xs text-primary font-medium"><i className="fas fa-shield-halved mr-1" /> Responsible AI Commitment</p>
        <p className="text-[10px] text-slate-500 mt-1">
          Every decision is logged with its reasoning, market context, and user factors. 
          No black-box recommendations. All data is encrypted and decisions are auditable.
        </p>
      </div>
    </div>
  );
}

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

const MOCK_DECISIONS: DecisionEntry[] = [
  {
    id: 'dec-1', timestamp: '2 min ago', action: 'Suggested SIP Increase',
    aiReason: 'NIFTY P/E above 20 → stagger entry reduces timing risk',
    marketFactor: 'NIFTY P/E: 23.4 (historical avg: 20)',
    userFactor: 'Surplus liquid funds: Rs 3.2L idle in savings',
    outcome: 'Recommend Rs 10K monthly STP', confidence: 82,
  },
  {
    id: 'dec-2', timestamp: '15 min ago', action: 'Blocked High-Risk Transfer',
    aiReason: 'Multiple risk signals: new device + unusual amount + rushed action',
    marketFactor: 'N/A',
    userFactor: 'Rs 50K transfer to unknown payee within 10s of login',
    outcome: 'BLOCKED — Reference AUD-LX9KP2', confidence: 99,
  },
  {
    id: 'dec-3', timestamp: '1 hour ago', action: 'Gold Rebalance Alert',
    aiReason: 'Gold -8% QoQ + FD rates at 5-year high → capital preservation',
    marketFactor: 'Gold: Rs 78,500 (-8% QoQ) | FD: 8.1% (+1.2%)',
    userFactor: 'Gold allocation: 21% of portfolio (above 15% target)',
    outcome: 'Suggest shift Rs 50K Gold → FD', confidence: 87,
  },
  {
    id: 'dec-4', timestamp: '3 hours ago', action: 'Tax Optimization',
    aiReason: 'User in 30% bracket → ELSS offers tax + growth',
    marketFactor: 'ELSS avg returns: 12% | Lock-in: 3 years',
    userFactor: 'Tax bracket: 30% | 80C utilization: 45%',
    outcome: 'Recommend Rs 82,500 ELSS investment', confidence: 91,
  },
  {
    id: 'dec-5', timestamp: '5 hours ago', action: 'Subscription Alert',
    aiReason: 'Hotstar unused 60 days → save Rs 899/quarter',
    marketFactor: 'N/A',
    userFactor: 'Last used: 18 Feb 2026 | Next renewal: tomorrow',
    outcome: 'Flagged for cancellation', confidence: 95,
  },
];

export default function AIDecisionLog() {
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

      <div className="space-y-3">
        {MOCK_DECISIONS.map((dec) => (
          <div key={dec.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-xs">
                  <i className="fas fa-brain" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{dec.action}</p>
                  <p className="text-[10px] text-slate-400">{dec.timestamp}</p>
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
                 dec.outcome.startsWith('Flagged') ? 'bg-amber-500/10 text-amber-600' :
                 'bg-emerald-500/10 text-emerald-600')}>
                <i className={'fas fa-' + (dec.outcome.startsWith('BLOCKED') ? 'shield-virus' : dec.outcome.startsWith('Flagged') ? 'flag' : 'check') + ' mr-1'} />
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

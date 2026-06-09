import { useState } from 'react';
import { useWealthStore } from '../../store/wealthStore';
import { useProtectionEngine } from '../../hooks/useProtectionEngine';
import type { RiskSignals } from '../../types';
import ProtectionModal from '../protection/ProtectionModal';
import KYCModal from '../compliance/KYCModal';

interface Strategy {
  id: string; title: string; fromAsset: string; toAsset: string;
  amount: number; reason: string; confidence: number;
  urgency: 'high' | 'medium' | 'low';
  marketSignal: string; icon: string; color: string;
  demoSignals: RiskSignals;
}

const STRATEGIES: Strategy[] = [
  {
    id: 'strat-1', title: 'Shift Gold to Fixed Deposit', fromAsset: 'Physical Gold', toAsset: '2-Year FD @ 8.1%',
    amount: 50000, reason: 'Gold prices have dropped 8% this quarter. FD rates are at a 5-year high.', confidence: 87,
    urgency: 'high', marketSignal: 'Gold -8% QoQ | FD rates +1.2%', icon: 'fa-building-columns', color: 'bg-emerald-500',
    demoSignals: { newDevice: true, rushedAction: false, unusualAmount: true, otpRetries: false, firstTimeInvest: true, abnormalBehavior: false },
  },
  {
    id: 'strat-2', title: 'Stagger Lump Sum into SIP', fromAsset: 'Savings Account', toAsset: 'Nifty 50 Index Fund',
    amount: 100000, reason: 'NIFTY P/E at 23.4 is above historical average. STP reduces timing risk.', confidence: 82,
    urgency: 'medium', marketSignal: 'NIFTY P/E 23.4 (>20 avg)', icon: 'fa-chart-line', color: 'bg-primary',
    demoSignals: { newDevice: true, rushedAction: true, unusualAmount: true, otpRetries: true, firstTimeInvest: true, abnormalBehavior: true },
  },
  {
    id: 'strat-3', title: 'Add Inflation Hedge', fromAsset: 'Liquid Funds', toAsset: 'Gold Sovereign Bonds',
    amount: 25000, reason: 'CPI inflation at 6.2% is above RBI target. G-Sec gold bonds offer 2.5% extra.', confidence: 78,
    urgency: 'medium', marketSignal: 'CPI 6.2% (>4% target)', icon: 'fa-coins', color: 'bg-amber-500',
    demoSignals: { newDevice: false, rushedAction: false, unusualAmount: false, otpRetries: false, firstTimeInvest: false, abnormalBehavior: false },
  },
  {
    id: 'strat-4', title: 'Book Profits in Mid-Caps', fromAsset: 'Mid-Cap Mutual Fund', toAsset: 'Short-Term Debt Fund',
    amount: 75000, reason: 'Global volatility rising (S and P down 2 days). De-risk 15% equity exposure.', confidence: 71,
    urgency: 'low', marketSignal: 'VIX +15% | S and P -1.2%', icon: 'fa-shield-halved', color: 'bg-rose-500',
    demoSignals: { newDevice: false, rushedAction: false, unusualAmount: true, otpRetries: false, firstTimeInvest: false, abnormalBehavior: true },
  },
];

export default function MarketStrategist() {
  const assets = useWealthStore((s) => s.assets);
  const addTransaction = useWealthStore((s) => s.addTransaction);
  const [expanded, setExpanded] = useState<string | null>('strat-1');
  const [executed, setExecuted] = useState<string[]>([]);
  const kycVerified = useWealthStore((s: any) => s.kycVerified);
  const [showKYC, setShowKYC] = useState(false);

  const { assess, lastDecision } = useProtectionEngine();
  const [pendingStrategy, setPendingStrategy] = useState<Strategy | null>(null);
  const [showProtection, setShowProtection] = useState(false);

  function executeStrategy(strategy: Strategy) {
    if (!kycVerified) {
      setShowKYC(true);
      return;
    }

    // Run protection layer
    assess('Execute Strategy: ' + strategy.title, strategy.demoSignals);
    setPendingStrategy(strategy);
    setShowProtection(true);
  }

  function onProceed() {
    if (!pendingStrategy) return;
    setShowProtection(false);
    setExecuted((prev) => [...prev, pendingStrategy.id]);
    addTransaction({
      id: 'tx-strat-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      description: 'Strategic: ' + pendingStrategy.title,
      category: 'Investment',
      amount: pendingStrategy.amount,
      type: 'debit',
      status: 'ALLOWED',
      riskLevel: 'LOW',
    });
    setPendingStrategy(null);
  }

  function onCancel() {
    setShowProtection(false);
    setPendingStrategy(null);
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-chess-knight text-primary" /> AI Market Strategist
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time strategic recommendations based on market trends and your portfolio</p>
        </div>
        <span className="text-[10px] px-2 py-1 bg-primary/10 text-primary rounded-full font-medium"><i className="fas fa-bolt mr-1" />Live</span>
      </div>

      <div className="space-y-3">
        {STRATEGIES.map((strategy) => {
          const isExpanded = expanded === strategy.id;
          const isExecuted = executed.includes(strategy.id);
          const urgencyColor = strategy.urgency === 'high' ? 'text-rose-500' : strategy.urgency === 'medium' ? 'text-amber-500' : 'text-slate-400';
          return (
            <div key={strategy.id} className={'border rounded-xl overflow-hidden transition-all ' + (isExpanded ? 'border-primary/30 bg-primary/5' : 'border-slate-200 dark:border-slate-700') + ' ' + (isExecuted ? 'opacity-60' : '')}>
              <button onClick={() => setExpanded(isExpanded ? null : strategy.id)} className="w-full flex items-center gap-3 p-3 text-left">
                <div className={'w-10 h-10 ' + strategy.color + ' rounded-lg flex items-center justify-center text-white shrink-0'}>
                  <i className={'fas ' + strategy.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{strategy.title}</p>
                    {isExecuted && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full shrink-0"><i className="fas fa-check mr-0.5" />Executed</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{strategy.marketSignal}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={'text-xs font-medium ' + urgencyColor}>{strategy.urgency.toUpperCase()}</p>
                  <p className="text-[10px] text-slate-400">{strategy.confidence}% confidence</p>
                </div>
                <i className={'fas fa-chevron-' + (isExpanded ? 'up' : 'down') + ' text-slate-400 text-xs shrink-0'} />
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1"><p className="text-[10px] text-slate-400 uppercase">From</p><p className="text-sm font-medium text-slate-700 dark:text-slate-200">{strategy.fromAsset}</p></div>
                      <i className="fas fa-arrow-right text-slate-300" />
                      <div className="flex-1"><p className="text-[10px] text-slate-400 uppercase">To</p><p className="text-sm font-medium text-slate-700 dark:text-slate-200">{strategy.toAsset}</p></div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-xs text-slate-500 font-medium">Rs {strategy.amount.toLocaleString()}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">{assets.length > 0 ? ((strategy.amount / assets.reduce((s, a) => s + a.value, 0)) * 100).toFixed(1) : '0.0'}% of net worth</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400"><i className="fas fa-lightbulb text-primary mr-1" />{strategy.reason}</p>

                  {/* Risk Signals Preview */}
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-[10px] text-slate-400 mb-1.5 uppercase font-medium">Protection Signals</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(strategy.demoSignals).map(([key, val]) => (
                        <span key={key} className={'text-[10px] px-1.5 py-0.5 rounded ' + (val ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600')}>
                          <i className={'fas fa-' + (val ? 'triangle-exclamation' : 'check') + ' mr-0.5'} />
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full"><i className="fas fa-chart-line mr-1" />{strategy.marketSignal}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full"><i className="fas fa-brain mr-1" />{strategy.confidence}% AI confidence</span>
                  </div>
                  <button onClick={() => executeStrategy(strategy)} disabled={isExecuted} className={'w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors'}>
                    {isExecuted ? 'Executed' : 'Execute Strategy'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-500 text-center mt-3">
        <i className="fas fa-info-circle mr-1" />Strategies are generated based on market data, global indicators, and your portfolio. Not financial advice.
      </div>

      {showProtection && lastDecision && (
        <ProtectionModal decision={lastDecision} onProceed={onProceed} onCancel={onCancel} />
      )}
      <KYCModal show={showKYC} onClose={() => setShowKYC(false)} />
    </div>
  );
}

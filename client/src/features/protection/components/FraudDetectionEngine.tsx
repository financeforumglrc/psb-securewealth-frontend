import { useState, useEffect, useCallback } from 'react';
import { useProtectionEngine } from '@/shared/hooks/useProtectionEngine';
import { useWealthStore } from '@/shared/store/wealthStore';
import { analyzeTransactions } from '@/shared/services/fraudDetectionService';
import ProtectionModal from '@/features/protection/components/ProtectionModal';
import type { RiskSignals } from '@/shared/types';

interface Props {
  onSignalsChange?: (signals: RiskSignals) => void;
  onAudit?: () => void;
}

export default function FraudDetectionEngine({ onSignalsChange, onAudit }: Props) {
  const [showModal, setShowModal] = useState(false);
  const { assess, lastDecision } = useProtectionEngine();
  const addTransaction = useWealthStore((s) => s.addTransaction);
  const transactions = useWealthStore((s) => s.transactions);

  const analysis = analyzeTransactions(transactions);
  const signals = analysis.signals;

  useEffect(() => {
    onSignalsChange?.(signals);
  }, [signals, onSignalsChange]);

  const runAnalysis = useCallback(() => {
    const decision = assess('Real-time Fraud Analysis', signals);
    onAudit?.();
    setShowModal(true);

    const amount = signals.unusualAmount ? 50000 : signals.rushedAction ? 25000 : 15000;
    addTransaction({
      id: 'tx-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      description:
        decision.level === 'HIGH'
          ? `Blocked: ₹${amount.toLocaleString()} transfer - fraud detected`
          : decision.level === 'MEDIUM'
          ? `Delayed: ₹${amount.toLocaleString()} to new payee`
          : `Transfer: ₹${amount.toLocaleString()}`,
      category: 'Transfer',
      amount,
      type: 'debit',
      status: decision.level === 'HIGH' ? 'BLOCKED' : decision.level === 'MEDIUM' ? 'DELAYED' : 'ALLOWED',
      riskLevel: decision.level,
      score: decision.level === 'HIGH' ? 85 : decision.level === 'MEDIUM' ? 70 : 35,
      signals: { ...signals },
      decision: { ...decision },
      referenceId: decision.referenceId,
    });
  }, [assess, addTransaction, signals]);

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
        <i className="fas fa-bug text-danger mr-2" /> Fraud Detection Engine
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Live rule-based analysis of your real transaction history.
      </p>

      <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Computed Risk Score</span>
          <span className={`text-sm font-bold ${analysis.riskScore >= 60 ? 'text-rose-500' : analysis.riskScore >= 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {analysis.riskScore}/100
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              analysis.riskScore >= 60 ? 'bg-rose-500' : analysis.riskScore >= 30 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${analysis.riskScore}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {analysis.reasons.length === 0 && (
          <p className="text-xs text-slate-500">No risk signals detected in recent transactions.</p>
        )}
        {analysis.reasons.map((reason, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
            <i className="fas fa-triangle-exclamation text-amber-500 mt-0.5" />
            <span>{reason}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {Object.entries(signals).map(([key, val]) => (
          <div
            key={key}
            className={`flex items-center justify-between p-3 rounded-lg text-xs ${
              val ? 'bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800' : 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700'
            }`}
          >
            <span className={`capitalize ${val ? 'text-rose-700 dark:text-rose-300 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
              {key.replace(/([A-Z])/g, ' $1')}
            </span>
            <i className={`fas ${val ? 'fa-circle-exclamation text-rose-500' : 'fa-check-circle text-emerald-500'}`} />
          </div>
        ))}
      </div>

      <button onClick={runAnalysis} className="w-full py-3 bg-danger text-white rounded-xl font-medium hover:bg-danger/90 transition-colors">
        <i className="fas fa-play mr-2" /> Run Protection Layer
      </button>

      {showModal && lastDecision && (
        <ProtectionModal
          decision={lastDecision}
          onProceed={() => setShowModal(false)}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

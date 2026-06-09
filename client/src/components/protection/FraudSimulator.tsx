import { useProtectionEngine } from '../../hooks/useProtectionEngine';
import type { RiskSignals } from '../../types';
import ProtectionModal from './ProtectionModal';
import { useState } from 'react';
import { useWealthStore } from '../../store/wealthStore';

interface Props {
  signals: RiskSignals;
  onSignalsChange: (signals: RiskSignals) => void;
  onAudit?: () => void;
}

export default function FraudSimulator({ signals, onSignalsChange, onAudit }: Props) {
  const [showModal, setShowModal] = useState(false);
  const { assess, lastDecision } = useProtectionEngine();
  const addTransaction = useWealthStore((s) => s.addTransaction);

  function runSimulation() {
    const decision = assess('Fraud Simulation', signals);
    onAudit?.();
    setShowModal(true);

    // Add transaction record
    const amount = signals.unusualAmount ? 50000 : signals.newDevice ? 25000 : 15000;
    addTransaction({
      id: 'tx-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      description: decision.level === 'HIGH' ? `Blocked: ₹${amount.toLocaleString()} transfer - fraud detected` : decision.level === 'MEDIUM' ? `Delayed: ₹${amount.toLocaleString()} to new payee` : `Transfer: ₹${amount.toLocaleString()}`,
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
  }

  function toggle(key: keyof RiskSignals) {
    onSignalsChange({ ...signals, [key]: !signals[key] });
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
        <i className="fas fa-bug text-danger mr-2" /> Fraud Simulator
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Toggle signals to simulate risk scenarios for demo purposes.</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {Object.entries(signals).map(([key, val]) => (
          <label key={key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer">
            <span className="text-xs text-slate-700 dark:text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            <input type="checkbox" checked={val} onChange={() => toggle(key as keyof RiskSignals)} className="accent-primary w-4 h-4" />
          </label>
        ))}
      </div>
      <button onClick={runSimulation} className="w-full py-3 bg-danger text-white rounded-xl font-medium hover:bg-danger/90 transition-colors">
        <i className="fas fa-play mr-2" /> Test Protection Layer
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

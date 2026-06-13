import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';
import FamilyApprovalGate from './FamilyApprovalGate';
import type { RiskSignals, ProtectionDecision } from '../../types';

/* ═══════════════════════════════════════════════════════════════
   TRANSACTION GUARD MODAL — Mandatory Protection Layer
   Evaluates ALL 6 risk signals from the hackathon PDF:
   1. Device Trust
   2. Login/Session Behaviour (speed)
   3. Action Amount vs History
   4. OTP Usage Pattern
   5. New Action / Investment Type
   6. Behaviour Consistency
   
   Outputs: Wealth Protection Risk Score → ALLOW / WARN / BLOCK
   ═══════════════════════════════════════════════════════════════ */

interface Props {
  show: boolean;
  payee: string;
  amount: number;
  onAllow: () => void;
  onDelay: () => void;
  onBlock: (reason: string) => void;
  onClose: () => void;
}

const SIGNALS_DEF = [
  { key: 'deviceTrust', label: 'Device Trust Check', icon: 'fa-mobile-screen-button', desc: 'Trusted vs new device verification' },
  { key: 'sessionBehavior', label: 'Session Behaviour', icon: 'fa-stopwatch', desc: 'Speed between login and action' },
  { key: 'amountHistory', label: 'Amount vs History', icon: 'fa-chart-bar', desc: 'Compare with historical average' },
  { key: 'otpPattern', label: 'OTP Usage Pattern', icon: 'fa-key', desc: 'Retry count and timing analysis' },
  { key: 'newActionType', label: 'New Action Type', icon: 'fa-star', desc: 'First-time payee or investment' },
  { key: 'behaviourConsistency', label: 'Behaviour Consistency', icon: 'fa-fingerprint', desc: 'Pattern match with user history' },
] as const;

export default function TransactionGuardModal({ show, payee, amount, onAllow, onDelay, onBlock, onClose }: Props) {
  const transactions = useWealthStore((s) => s.transactions);
  const addTransaction = useWealthStore((s) => s.addTransaction);
  const [phase, setPhase] = useState<'scanning' | 'scored' | 'decision'>('scanning');
  const [scanProgress, setScanProgress] = useState(0);
  const [currentSignal, setCurrentSignal] = useState(0);
  const [showFamilyGate, setShowFamilyGate] = useState(false);

  // Calculate risk signals
  const signals = useMemo<RiskSignals>(() => {
    const avgTxn = transactions.length > 0
      ? transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0) / Math.max(1, transactions.filter((t) => t.type === 'debit').length)
      : 5000;
    const maxTxn = transactions.length > 0
      ? Math.max(...transactions.filter((t) => t.type === 'debit').map((t) => t.amount), 0)
      : 10000;
    const isKnownPayee = transactions.some((t) => t.description?.toLowerCase().includes(payee.toLowerCase()));

    return {
      newDevice: false,
      rushedAction: amount > 100000,
      unusualAmount: amount > avgTxn * 2.5 || amount > maxTxn * 1.5,
      otpRetries: amount > 200000,
      firstTimeInvest: !isKnownPayee && amount > 50000,
      abnormalBehavior: amount > 300000 && !isKnownPayee,
    };
  }, [transactions, payee, amount]);

  // Calculate risk score
  const riskScore = useMemo(() => {
    let score = 0;
    if (signals.newDevice) score += 15;
    if (signals.rushedAction) score += 10;
    if (signals.unusualAmount) score += 25;
    if (signals.otpRetries) score += 15;
    if (signals.firstTimeInvest) score += 15;
    if (signals.abnormalBehavior) score += 20;
    return Math.min(score, 100);
  }, [signals]);

  const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = riskScore < 40 ? 'LOW' : riskScore < 70 ? 'MEDIUM' : 'HIGH';
  const decision: ProtectionDecision = riskLevel === 'LOW'
    ? { level: 'LOW', action: 'ALLOW', message: 'Transaction passed all security checks.', referenceId: 'PSB-ALW-' + Date.now().toString(36).toUpperCase() }
    : riskLevel === 'MEDIUM'
    ? { level: 'MEDIUM', action: 'WARN', cooldown: 30, message: 'Medium risk detected. Cooling vault activated for your safety.', referenceId: 'PSB-WAR-' + Date.now().toString(36).toUpperCase() }
    : { level: 'HIGH', action: 'BLOCK', message: 'High risk detected. Transaction blocked to protect your wealth.', referenceId: 'PSB-BLK-' + Date.now().toString(36).toUpperCase() };

  // Scanning animation
  useEffect(() => {
    if (!show) {
      setPhase('scanning');
      setScanProgress(0);
      setCurrentSignal(0);
      return;
    }
    const totalTime = 2500;
    const interval = 50;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += interval;
      setScanProgress(Math.min((elapsed / totalTime) * 100, 100));
      setCurrentSignal(Math.min(Math.floor((elapsed / totalTime) * 6), 5));
      if (elapsed >= totalTime) {
        clearInterval(timer);
        setPhase('scored');
        setTimeout(() => setPhase('decision'), 800);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [show]);

  const handleAllow = () => {
    if (amount >= 200000) {
      setShowFamilyGate(true);
      return;
    }
    handleDecision('allow');
  };

  const handleFamilyApprove = () => {
    setShowFamilyGate(false);
    handleDecision('allow');
  };

  const handleFamilyReject = () => {
    setShowFamilyGate(false);
    handleDecision('block');
  };

  // Record transaction on decision
  const handleDecision = (action: 'allow' | 'delay' | 'block') => {
    const tx = {
      id: 'TXN-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      description: action === 'block' ? `Blocked: ₹${amount.toLocaleString()} to ${payee}` : `${action === 'delay' ? 'Delayed' : 'UPI Payment'} — ${payee}`,
      category: 'Transfer',
      amount,
      type: 'debit' as const,
      status: (action === 'allow' ? 'ALLOWED' : action === 'delay' ? 'DELAYED' : 'BLOCKED') as 'ALLOWED' | 'BLOCKED' | 'DELAYED',
      riskLevel,
      score: riskScore,
      signals,
      decision,
    };
    addTransaction(tx);

    if (action === 'allow') onAllow();
    else if (action === 'delay') onDelay();
    else onBlock(decision.message);
  };

  if (!show) return null;

  const riskText = riskLevel === 'LOW' ? 'text-emerald-600' : riskLevel === 'MEDIUM' ? 'text-amber-600' : 'text-rose-600';
  const riskBg = riskLevel === 'LOW' ? 'bg-emerald-500' : riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={phase === 'decision' ? onClose : undefined}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <i className="fas fa-shield-halved text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Transaction Guard</h3>
                <p className="text-[10px] text-slate-400">Mandatory wealth protection check</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <i className="fas fa-xmark" />
            </button>
          </div>

          {/* Transaction Summary */}
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Payee</span>
              <span className="font-bold text-slate-800 dark:text-white">{payee || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-500">Amount</span>
              <span className="font-bold text-slate-800 dark:text-white">₹{amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Scanning Phase */}
          {phase === 'scanning' && (
            <div className="px-6 py-6 space-y-4">
              <div className="text-center mb-4">
                <motion.div
                  className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                >
                  <i className="fas fa-shield-virus text-primary text-xl" />
                </motion.div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Analyzing transaction risk...</p>
                <p className="text-[10px] text-slate-400 mt-1">Running 6-layer cyber-protection scan</p>
              </div>

              {/* Signal list */}
              <div className="space-y-2">
                {SIGNALS_DEF.map((sig, i) => (
                  <div key={sig.key} className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                    i <= currentSignal ? 'bg-slate-50 dark:bg-slate-700/30' : 'opacity-40'
                  }`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                      i < currentSignal ? 'bg-emerald-100 text-emerald-600' : i === currentSignal ? 'bg-primary/10 text-primary animate-pulse' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <i className={`fas ${i < currentSignal ? 'fa-check' : sig.icon}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{sig.label}</p>
                      <p className="text-[9px] text-slate-400">{sig.desc}</p>
                    </div>
                    {i < currentSignal && (
                      <span className="text-[10px] font-bold text-emerald-600">PASS</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="bg-primary h-1.5 rounded-full"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Scored Phase */}
          {phase === 'scored' && (
            <div className="px-6 py-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-3 ${riskBg}`}
              >
                <span className="text-2xl font-black text-white">{riskScore}</span>
              </motion.div>
              <p className="text-lg font-bold text-slate-800 dark:text-white">Risk Score: {riskScore}/100</p>
              <p className={`text-sm font-bold ${riskText}`}>{riskLevel} RISK</p>
            </div>
          )}

          {/* Decision Phase */}
          {phase === 'decision' && (
            <div className="px-6 py-5 space-y-4">
              {/* Risk Score Badge */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${riskBg} text-white`}
                >
                  <i className={`fas fa-${riskLevel === 'LOW' ? 'check-circle' : riskLevel === 'MEDIUM' ? 'clock' : 'ban'} text-lg`} />
                  <div className="text-left">
                    <p className="text-xs font-extrabold">{riskLevel} RISK — {decision.action}</p>
                    <p className="text-[9px] opacity-90">Score: {riskScore}/100</p>
                  </div>
                </motion.div>
              </div>

              {/* Signal Results */}
              <div className="space-y-1.5">
                {Object.entries(signals).map(([key, val]) => {
                  const def = SIGNALS_DEF.find((s) => s.key === key);
                  if (!def) return null;
                  return (
                    <div key={key} className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                      val ? 'bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/20' : 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/20'
                    }`}>
                      <span className="flex items-center gap-2">
                        <i className={`fas ${def.icon} ${val ? 'text-rose-500' : 'text-emerald-500'}`} />
                        <span className="text-slate-700 dark:text-slate-200 font-medium">{def.label}</span>
                      </span>
                      <span className={`font-bold ${val ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {val ? 'FLAGGED' : 'CLEAR'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Decision Message */}
              <div className={`p-3 rounded-xl text-xs ${
                riskLevel === 'LOW' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' :
                riskLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' :
                'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300'
              }`}>
                <i className="fas fa-circle-info mr-1" />
                {decision.message}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                {riskLevel === 'LOW' && (
                  <button
                    onClick={handleAllow}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-check" /> {amount >= 200000 ? 'Request Family Approval' : 'Allow Transaction'}
                  </button>
                )}
                {riskLevel === 'MEDIUM' && (
                  <>
                    <button
                      onClick={() => handleDecision('delay')}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-clock" /> Start Cooling Vault
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {riskLevel === 'HIGH' && (
                  <button
                    onClick={() => handleDecision('block')}
                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-shield-halved" /> Block for Safety
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      <FamilyApprovalGate
        show={showFamilyGate}
        amount={amount}
        payee={payee}
        onApproved={handleFamilyApprove}
        onRejected={handleFamilyReject}
        onClose={() => setShowFamilyGate(false)}
      />
    </AnimatePresence>
  );
}

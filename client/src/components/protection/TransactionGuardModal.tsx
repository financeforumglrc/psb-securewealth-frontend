import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useWealthStore } from '../../store/wealthStore';
import { protectionApi, type ProtectionResponse } from '../../lib/protectionApi';
import { getGuardianMessage } from '../../services/guardianService';
import FamilyApprovalGate from './FamilyApprovalGate';
import type { RiskSignals, ProtectionDecision } from '../../types';

/* ═══════════════════════════════════════════════════════════════
   TRANSACTION GUARD MODAL — Mandatory Protection Layer
   Calls the FastAPI Protection microservice for 7-point risk scoring
   plus graph-risk and behavioral-biometrics signals.
   Falls back to local scoring when the service is unreachable.
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

function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server';
  let fp = localStorage.getItem('sw_device_fp');
  if (!fp) {
    fp = 'fp-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('sw_device_fp', fp);
  }
  return fp;
}

export default function TransactionGuardModal({ show, payee, amount, onAllow, onDelay, onBlock, onClose }: Props) {
  const transactions = useWealthStore((s) => s.transactions);
  const addTransaction = useWealthStore((s) => s.addTransaction);
  const loginAt = useWealthStore((s) => s.loginAt);
  const behavioralDeviation = useWealthStore((s) => s.behavioralDeviation);
  const { state: authState } = useAuth();

  const [phase, setPhase] = useState<'scanning' | 'scored' | 'decision'>('scanning');
  const [scanProgress, setScanProgress] = useState(0);
  const [currentSignal, setCurrentSignal] = useState(0);
  const [showFamilyGate, setShowFamilyGate] = useState(false);
  const [apiResult, setApiResult] = useState<ProtectionResponse | null>(null);
  const [guardianMessage, setGuardianMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Local fallback scoring (kept for resilience and instant UI)
  const signals = useMemo<RiskSignals>(() => {
    const debitTxs = transactions.filter((t) => t.type === 'debit');
    const avgTxn = debitTxs.length > 0
      ? debitTxs.reduce((s, t) => s + t.amount, 0) / Math.max(1, debitTxs.length)
      : 5000;
    const maxTxn = debitTxs.length > 0
      ? Math.max(...debitTxs.map((t) => t.amount), 0)
      : 10000;
    const isKnownPayee = transactions.some((t) => t.description?.toLowerCase().includes(payee.toLowerCase()));

    return {
      newDevice: amount > 100000 && !isKnownPayee,
      rushedAction: amount > 100000,
      unusualAmount: amount > avgTxn * 2.5 || amount > maxTxn * 1.5,
      otpRetries: amount > 200000,
      firstTimeInvest: !isKnownPayee && amount > 50000,
      abnormalBehavior: amount > 300000 && !isKnownPayee,
    };
  }, [transactions, payee, amount]);

  const fallbackScore = useMemo(() => {
    let score = 0;
    if (signals.newDevice) score += 15;
    if (signals.rushedAction) score += 10;
    if (signals.unusualAmount) score += 25;
    if (signals.otpRetries) score += 15;
    if (signals.firstTimeInvest) score += 15;
    if (signals.abnormalBehavior) score += 20;
    return Math.min(score, 100);
  }, [signals]);

  const fallbackLevel: 'LOW' | 'MEDIUM' | 'HIGH' = fallbackScore < 40 ? 'LOW' : fallbackScore < 70 ? 'MEDIUM' : 'HIGH';
  const fallbackDecision: ProtectionDecision = useMemo(() => {
    const refId = 'PSB-' + Date.now().toString(36).toUpperCase();
    if (fallbackLevel === 'LOW') return { level: 'LOW', action: 'ALLOW', message: 'Transaction passed all security checks.', referenceId: refId };
    if (fallbackLevel === 'MEDIUM') return { level: 'MEDIUM', action: 'WARN', cooldown: 30, message: 'Medium risk detected. Cooling vault activated for your safety.', referenceId: refId };
    return { level: 'HIGH', action: 'BLOCK', message: 'High risk detected. Transaction blocked to protect your wealth.', referenceId: refId };
  }, [fallbackLevel]);

  const decision = apiResult || {
    risk_score: fallbackScore,
    risk_level: fallbackLevel,
    action: fallbackDecision.action as 'ALLOW' | 'WARN_COOL_OFF' | 'BLOCK',
    explainable_factors: fallbackDecision.message ? [fallbackDecision.message] : [],
    user_message: fallbackDecision.message,
    reference_id: fallbackDecision.referenceId,
  };

  const riskScore = decision.risk_score;
  const riskLevel = decision.risk_level;
  const action = decision.action;

  // FastAPI evaluation during scanning
  useEffect(() => {
    if (!show) {
      setPhase('scanning');
      setScanProgress(0);
      setCurrentSignal(0);
      setApiResult(null);
      setGuardianMessage(null);
      setApiError(null);
      return;
    }

    let cancelled = false;
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

    async function runFastApiEvaluation() {
      try {
        const debitTxs = transactions.filter((t) => t.type === 'debit');
        const avgTxn = debitTxs.length > 0
          ? debitTxs.reduce((s, t) => s + t.amount, 0) / Math.max(1, debitTxs.length)
          : 5000;
        const secondsSinceLogin = loginAt ? Math.max(0, Math.round((Date.now() - loginAt) / 1000)) : 300;
        const isKnownPayee = transactions.some((t) => t.description?.toLowerCase().includes(payee.toLowerCase()));
        const deviceFp = getDeviceFingerprint();

        // Parallel graph + biometric calls
        const [graphRes, biometricRes] = await Promise.all([
          protectionApi.graphRisk({
            user_id: authState.userId || 'demo-user',
            payee,
            device_fingerprint: deviceFp,
          }),
          protectionApi.biometricRisk({ deviation: behavioralDeviation || 0 }),
        ]);

        const graphBonus = graphRes.ok ? graphRes.data?.risk_bonus || 0 : 0;
        const bioBonus = biometricRes.ok ? biometricRes.data?.risk_bonus || 0 : 0;

        const evalRes = await protectionApi.evaluateTransaction({
          user_id: authState.userId || 'demo-user',
          amount,
          historical_avg_amount: Math.round(avgTxn),
          seconds_since_login: secondsSinceLogin,
          is_trusted_device: !(amount > 100000 && !isKnownPayee),
          otp_attempts: 0,
          is_first_time_investment: !isKnownPayee && amount > 50000,
          retry_count: 0,
          behavioral_deviation: behavioralDeviation || 0,
          graph_risk_bonus: graphBonus + bioBonus,
        });

        if (cancelled) return;

        if (evalRes.ok && evalRes.data) {
          setApiResult(evalRes.data);
        } else {
          setApiError('Protection service returned an error — using local scoring.');
        }
      } catch {
        if (!cancelled) setApiError('Protection service unreachable — using local scoring.');
      }
    }

    runFastApiEvaluation();

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [show, amount, payee, transactions, loginAt, behavioralDeviation, authState.userId]);

  // Generate LLM Guardian message once we have a decision
  useEffect(() => {
    if (!show || phase !== 'decision') return;
    let cancelled = false;

    async function loadGuardian() {
      const msg = await getGuardianMessage({
        risk_level: riskLevel,
        action: action,
        factors: decision.explainable_factors,
        amount,
        payee,
      });
      if (!cancelled) setGuardianMessage(msg);
    }

    loadGuardian();
    return () => { cancelled = true; };
  }, [show, phase, riskLevel, action, amount, payee, decision.explainable_factors]);

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

  const handleDecision = useCallback((actionTaken: 'allow' | 'delay' | 'block') => {
    const tx = {
      id: 'TXN-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      description: actionTaken === 'block' ? `Blocked: ₹${amount.toLocaleString()} to ${payee}` : `${actionTaken === 'delay' ? 'Delayed' : 'UPI Payment'} — ${payee}`,
      category: 'Transfer',
      amount,
      type: 'debit' as const,
      status: (actionTaken === 'allow' ? 'ALLOWED' : actionTaken === 'delay' ? 'DELAYED' : 'BLOCKED') as 'ALLOWED' | 'BLOCKED' | 'DELAYED',
      riskLevel,
      score: riskScore,
      signals,
      decision: {
        level: riskLevel,
        action: action === 'WARN_COOL_OFF' ? 'WARN' : action,
        cooldown: action === 'WARN_COOL_OFF' ? 15 : undefined,
        message: guardianMessage || decision.user_message,
        referenceId: decision.reference_id,
      } as ProtectionDecision,
    };
    addTransaction(tx);

    if (actionTaken === 'allow') onAllow();
    else if (actionTaken === 'delay') onDelay();
    else onBlock(guardianMessage || decision.user_message);
  }, [action, amount, payee, riskLevel, riskScore, signals, decision, guardianMessage, addTransaction, onAllow, onDelay, onBlock]);

  if (!show) return null;

  const riskText = riskLevel === 'LOW' ? 'text-emerald-600' : riskLevel === 'MEDIUM' ? 'text-amber-600' : 'text-rose-600';
  const riskBg = riskLevel === 'LOW' ? 'bg-emerald-500' : riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-rose-500';
  const riskBorder = riskLevel === 'LOW' ? 'border-emerald-200 dark:border-emerald-800' : riskLevel === 'MEDIUM' ? 'border-amber-200 dark:border-amber-800' : 'border-rose-200 dark:border-rose-800';
  const riskSubtleBg = riskLevel === 'LOW' ? 'bg-emerald-50 dark:bg-emerald-900/10' : riskLevel === 'MEDIUM' ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-rose-50 dark:bg-rose-900/10';

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

          {/* API error hint */}
          {apiError && (
            <div className="px-6 pt-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg text-[10px] text-amber-700 dark:text-amber-300">
                <i className="fas fa-triangle-exclamation mr-1" /> {apiError}
              </div>
            </div>
          )}

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
                <p className="text-[10px] text-slate-400 mt-1">Running 6-layer cyber-protection scan + graph intelligence</p>
              </div>

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

              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <motion.div className="bg-primary h-1.5 rounded-full" style={{ width: `${scanProgress}%` }} />
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
                    <p className="text-xs font-extrabold">{riskLevel} RISK — {action}</p>
                    <p className="text-[9px] opacity-90">Ref: {decision.reference_id}</p>
                  </div>
                </motion.div>
              </div>

              {/* Explainable Factors */}
              <div className={`max-h-40 overflow-y-auto space-y-1.5 rounded-xl border ${riskBorder} ${riskSubtleBg} p-3`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Why this decision?</p>
                {decision.explainable_factors.map((factor, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <i className={`fas fa-${riskLevel === 'LOW' ? 'check-circle text-emerald-500' : 'triangle-exclamation text-rose-500'} mt-0.5`} />
                    <span className="text-slate-700 dark:text-slate-200">{factor}</span>
                  </div>
                ))}
              </div>

              {/* Guardian Message */}
              <div className={`p-3 rounded-xl text-xs ${riskSubtleBg} ${riskBorder} border`}>
                <i className="fas fa-robot mr-1" />
                {guardianMessage || decision.user_message}
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

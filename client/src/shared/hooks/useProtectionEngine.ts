import { useState, useCallback } from 'react';
import type { RiskSignals, ProtectionDecision } from '@/shared/types';
import { logAudit } from '@/shared/utils/auditLogger';

const RISK_WEIGHTS = {
  newDevice: 20,
  rushedAction: 10,
  unusualAmount: 25,
  otpRetries: 15,
  firstTimeInvest: 15,
  abnormalBehavior: 15,
};

export function calculateProtectionScore(signals: RiskSignals): number {
  let score = 0;
  (Object.keys(signals) as (keyof RiskSignals)[]).forEach((key) => {
    if (signals[key]) score += RISK_WEIGHTS[key];
  });
  return Math.min(score, 100);
}

export function getProtectionDecision(score: number): ProtectionDecision {
  const refId = 'AUD-' + Date.now().toString(36).toUpperCase();
  if (score < 60) {
    return { level: 'LOW', action: 'ALLOW', message: 'Action approved. Safe to proceed.', referenceId: refId };
  }
  if (score < 80) {
    return { level: 'MEDIUM', action: 'WARN', cooldown: 30, message: 'Unusual pattern detected. Please review before proceeding.', referenceId: refId };
  }
  return { level: 'HIGH', action: 'BLOCK', delay: 300, message: 'High cyber-risk detected. Action paused for security review.', referenceId: refId };
}

export function useProtectionEngine() {
  const [lastDecision, setLastDecision] = useState<ProtectionDecision | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const assess = useCallback((action: string, signals: RiskSignals) => {
    setIsChecking(true);
    const score = calculateProtectionScore(signals);
    const decision = getProtectionDecision(score);
    logAudit(action, signals, score, decision);
    setLastDecision(decision);
    setIsChecking(false);
    return decision;
  }, []);

  return { assess, lastDecision, isChecking };
}

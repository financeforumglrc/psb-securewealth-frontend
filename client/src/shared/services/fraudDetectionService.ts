/* ═══════════════════════════════════════════════════════════════
   FRAUD DETECTION ENGINE — Real rule-based analysis of transactions
   Computes risk signals from actual transaction history instead of
   manual toggles.
   ═══════════════════════════════════════════════════════════════ */

import type { RiskSignals } from '@/shared/types';

export interface TransactionLike {
  id: string;
  date: string;
  amount: number;
  type?: string;
  status?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  description?: string;
}

export interface FraudAnalysis {
  signals: RiskSignals;
  riskScore: number;
  reasons: string[];
}

const HIGH_AMOUNT_THRESHOLD = 50000;
const VERY_HIGH_AMOUNT_THRESHOLD = 200000;

export function analyzeTransactions(transactions: TransactionLike[]): FraudAnalysis {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const recent = sorted.slice(0, 30);

  const signals: RiskSignals = {
    newDevice: false,
    rushedAction: false,
    unusualAmount: false,
    otpRetries: false,
    firstTimeInvest: false,
    abnormalBehavior: false,
  };

  const reasons: string[] = [];
  let riskScore = 0;

  // Unusual amount: any recent high-value or blocked/delayed tx
  const highValueTx = recent.find((t) => t.amount >= HIGH_AMOUNT_THRESHOLD);
  if (highValueTx) {
    signals.unusualAmount = true;
    reasons.push(`High-value transaction ₹${highValueTx.amount.toLocaleString()} detected`);
    riskScore += highValueTx.amount >= VERY_HIGH_AMOUNT_THRESHOLD ? 35 : 20;
  }

  // New payee / first-time investment pattern
  const uniqueDescriptions = new Set(recent.map((t) => t.description));
  if (recent.length > 0 && uniqueDescriptions.size >= recent.length * 0.8) {
    signals.firstTimeInvest = true;
    reasons.push('Many first-time payees / investments in recent activity');
    riskScore += 15;
  }

  // Rushed action: multiple debits within short window
  const debitCount = recent.filter((t) => t.type === 'debit').length;
  if (debitCount >= 5) {
    signals.rushedAction = true;
    reasons.push(`${debitCount} recent debits indicate rushed activity`);
    riskScore += 15;
  }

  // OTP retries / blocked / delayed statuses
  const blockedOrDelayed = recent.filter(
    (t) => t.status === 'BLOCKED' || t.status === 'DELAYED' || t.riskLevel === 'HIGH'
  );
  if (blockedOrDelayed.length > 0) {
    signals.otpRetries = true;
    reasons.push(`${blockedOrDelayed.length} recent blocked/delayed/high-risk transactions`);
    riskScore += 20;
  }

  // Abnormal behavior: mix of high risk levels
  const highRiskCount = recent.filter((t) => t.riskLevel === 'HIGH').length;
  if (highRiskCount >= 2) {
    signals.abnormalBehavior = true;
    reasons.push('Repeated high-risk transaction patterns');
    riskScore += 20;
  }

  // New device cannot be inferred from transactions; set to false by default
  signals.newDevice = false;

  riskScore = Math.min(100, riskScore);

  return { signals, riskScore, reasons };
}

export interface RiskAssessmentInput {
  newDevice?: boolean;
  rushedAction?: boolean;
  unusualAmount?: boolean;
  otpRetries?: boolean;
  firstTimeInvest?: boolean;
  abnormalBehavior?: boolean;
}

/**
 * Quick signal-based risk scoring used by the Rakshak intervention layer.
 */
export function assessRisk(signals: RiskAssessmentInput): { riskScore: number; reasons: string[] } {
  let riskScore = 0;
  const reasons: string[] = [];

  if (signals.newDevice) {
    riskScore += 15;
    reasons.push('New or untrusted device');
  }
  if (signals.rushedAction) {
    riskScore += 10;
    reasons.push('Rushed action detected');
  }
  if (signals.unusualAmount) {
    riskScore += 25;
    reasons.push('Unusual amount compared to your history');
  }
  if (signals.otpRetries) {
    riskScore += 15;
    reasons.push('Repeated OTP retries');
  }
  if (signals.firstTimeInvest) {
    riskScore += 15;
    reasons.push('First-time payee or investment');
  }
  if (signals.abnormalBehavior) {
    riskScore += 20;
    reasons.push('Abnormal behaviour pattern');
  }

  return { riskScore: Math.min(100, riskScore), reasons };
}

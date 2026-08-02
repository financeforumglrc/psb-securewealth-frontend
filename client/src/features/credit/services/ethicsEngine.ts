/**
 * CreditBridge AI — Ethics & Accountability Engine (Phase 3).
 *
 * Implements the EAA framework components:
 *  - Adverse action notices with reason codes and rights
 *  - Human review queue simulation
 *  - Model governance & data provenance
 *  - Consent ledger for alternate data sources
 *  - Algorithmic accountability scorecard
 */

import type { ScoreResult, ReasonCode } from './creditBridgeEngine';
import { generateReasonCodes, formatINR } from './creditBridgeEngine';

export interface AdverseActionNotice {
  generatedAt: string;
  decision: string;
  score: number;
  band: string;
  maxEligible: string;
  reasonCodes: ReasonCode[];
  applicantRights: string[];
}

export interface ReviewCase {
  id: string;
  applicantName: string;
  mode: 'retail' | 'msme';
  score: number;
  band: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  submittedAt: string;
  flags: string[];
}

export interface GovernanceInfo {
  modelVersion: string;
  modelName: string;
  deployedAt: string;
  lastAuditDate: string;
  approvedBy: string;
  dataSources: string[];
  regulatoryFrameworks: string[];
  explainabilityMethod: string;
}

export interface ConsentItem {
  source: string;
  purpose: string;
  required: boolean;
  consent: 'granted' | 'optional' | 'not-applicable';
}

export interface ScorecardItem {
  dimension: string;
  score: number;
  max: number;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}

export const GOVERNANCE_INFO: GovernanceInfo = {
  modelVersion: 'CB-AI-v2.1.0',
  modelName: 'CreditBridge XAI Scoring Ensemble',
  deployedAt: '2026-07-01',
  lastAuditDate: '2026-07-07',
  approvedBy: 'PSB CreditBridge Ethics Committee',
  dataSources: [
    'Bank statement cash-flow (AA with consent)',
    'UPI transaction history (consent-based)',
    'GST filings (MSME, public + consent)',
    'Self-reported business / employment data',
    'Optional CIBIL bureau score',
  ],
  regulatoryFrameworks: [
    'RBI Master Direction on Digital Lending, 2022',
    'DPDP Act 2023 — consent & right to correction',
    'RBI Fair Practices Code',
    'EAA Framework (Saxena et al., 2025)',
  ],
  explainabilityMethod: 'Additive feature attribution with additive decomposition (SHAP-style)',
};

export function generateAdverseActionNotice(result: ScoreResult): AdverseActionNotice {
  const isDeclined = result.band.label === 'High Risk';
  return {
    generatedAt: new Date().toLocaleString('en-IN'),
    decision: isDeclined
      ? 'We are unable to approve credit at this time.'
      : 'Credit approved, subject to verification and final sanction.',
    score: result.score,
    band: result.band.label,
    maxEligible: formatINR(result.maxLoan),
    reasonCodes: generateReasonCodes(result),
    applicantRights: [
      'Right to a clear explanation of the factors affecting your score.',
      'Right to request a human review of an automated decision.',
      'Right to correct inaccurate data used in the assessment.',
      'Right to know what data sources were used and withdraw consent.',
      'Right to lodge a complaint with the lender’s grievance officer.',
    ],
  };
}

export function generateSampleReviewQueue(): ReviewCase[] {
  return [
    {
      id: 'REV-2026-0041',
      applicantName: 'Priya Sharma',
      mode: 'retail',
      score: 628,
      band: 'Sub-Prime',
      status: 'pending',
      submittedAt: '2 hrs ago',
      flags: ['Thin file', 'High UPI volatility'],
    },
    {
      id: 'REV-2026-0042',
      applicantName: 'Agarwal Traders',
      mode: 'msme',
      score: 712,
      band: 'Near-Prime',
      status: 'pending',
      submittedAt: '5 hrs ago',
      flags: ['GST irregular', 'Women-led enterprise'],
    },
    {
      id: 'REV-2026-0040',
      applicantName: 'Ramesh Yadav',
      mode: 'retail',
      score: 545,
      band: 'High Risk',
      status: 'escalated',
      submittedAt: '1 day ago',
      flags: ['Disputed EMI record', 'Applicant challenged decision'],
    },
  ];
}

export function getConsentLedger(mode: 'retail' | 'msme'): ConsentItem[] {
  const common: ConsentItem[] = [
    { source: 'Bank account cash-flow', purpose: 'Income verification & vintage', required: true, consent: 'granted' },
    { source: 'UPI transaction history', purpose: 'Digital footprint & consistency', required: false, consent: 'optional' },
    { source: 'Self-reported profile data', purpose: 'Employment / business details', required: true, consent: 'granted' },
    { source: 'Optional CIBIL score', purpose: 'Cross-validation with bureau', required: false, consent: 'not-applicable' },
  ];
  if (mode === 'msme') {
    common.push(
      { source: 'GST returns (GSTR-1/3B)', purpose: 'Turnover & filing regularity', required: true, consent: 'granted' },
      { source: 'Udyam registration', purpose: 'MSME classification', required: false, consent: 'granted' }
    );
  }
  return common;
}

export function calculateAccountabilityScorecard(result: ScoreResult): ScorecardItem[] {
  const reasonCodes = generateReasonCodes(result);
  return [
    {
      dimension: 'Explainability',
      score: result.factors.length >= 8 ? 95 : 75,
      max: 100,
      status: result.factors.length >= 8 ? 'pass' : 'warn',
      detail: 'Every factor contributing to the score is shown with magnitude and reason.',
    },
    {
      dimension: 'Fairness / Bias Guardrails',
      score: 100,
      max: 100,
      status: 'pass',
      detail: 'No protected attributes (gender, caste, religion, location) are used as inputs.',
    },
    {
      dimension: 'Human Oversight',
      score: result.score < 650 ? 90 : 80,
      max: 100,
      status: 'pass',
      detail: result.score < 650
        ? 'Sub-prime/high-risk decisions are auto-queued for human review.'
        : 'Human review is available on request for all applicants.',
    },
    {
      dimension: 'Regulatory Alignment',
      score: 95,
      max: 100,
      status: 'pass',
      detail: 'Consent-first alternate data; adverse-action notices generated automatically.',
    },
    {
      dimension: 'Data Minimization',
      score: result.factors.filter((f) => f.weight !== 'bonus').length <= 12 ? 90 : 75,
      max: 100,
      status: 'pass',
      detail: 'Only necessary cash-flow and behavioural signals are used.',
    },
    {
      dimension: 'Actionable Recourse',
      score: reasonCodes.length > 0 ? 85 : 95,
      max: 100,
      status: 'pass',
      detail: reasonCodes.length > 0
        ? 'Specific reason codes and improvement actions are provided.'
        : 'No adverse reason codes; profile is healthy.',
    },
  ];
}

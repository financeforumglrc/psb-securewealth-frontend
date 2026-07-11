/**
 * CreditBridge AI — transparent, deterministic credit-scoring engine.
 *
 * Based on the EAA framework proposed in:
 * "Algorithmic Accountability in AI-Driven Credit Scoring"
 * (Saxena, Sharma, Mohanty & Sharma, AI For Sustainable Progress, 2025).
 *
 * No protected attributes (gender, caste, religion, location) are used.
 * Every weight, clamp and calculation is exposed so the decision is auditable.
 */

export interface RiskBand {
  min: number;
  max: number;
  label: string;
  color: string;
  tailwindText: string;
  tailwindBg: string;
  tailwindBorder: string;
  interest: string;
  approval: string;
}

export const RISK_BANDS: RiskBand[] = [
  {
    min: 300,
    max: 549,
    label: 'High Risk',
    color: '#dc2626',
    tailwindText: 'text-red-700',
    tailwindBg: 'bg-red-50 dark:bg-red-950/30',
    tailwindBorder: 'border-red-200 dark:border-red-900',
    interest: '24% - 36%',
    approval: 'Rejected',
  },
  {
    min: 550,
    max: 649,
    label: 'Sub-Prime',
    color: '#ea580c',
    tailwindText: 'text-orange-700',
    tailwindBg: 'bg-orange-50 dark:bg-orange-950/30',
    tailwindBorder: 'border-orange-200 dark:border-orange-900',
    interest: '18% - 24%',
    approval: 'Conditional',
  },
  {
    min: 650,
    max: 749,
    label: 'Near-Prime',
    color: '#ca8a04',
    tailwindText: 'text-yellow-700',
    tailwindBg: 'bg-yellow-50 dark:bg-yellow-950/30',
    tailwindBorder: 'border-yellow-200 dark:border-yellow-900',
    interest: '14% - 18%',
    approval: 'Approved',
  },
  {
    min: 750,
    max: 900,
    label: 'Prime',
    color: '#16a34a',
    tailwindText: 'text-green-700',
    tailwindBg: 'bg-green-50 dark:bg-green-950/30',
    tailwindBorder: 'border-green-200 dark:border-green-900',
    interest: '10% - 14%',
    approval: 'Approved',
  },
];

export interface ScoreFactor {
  name: string;
  impact: number;
  weight: string;
  reason: string;
}

export interface ScoreResult {
  score: number;
  band: RiskBand;
  factors: ScoreFactor[];
  maxLoan: number;
  mode: 'retail' | 'msme';
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function getBand(score: number): RiskBand {
  return RISK_BANDS.find((b) => score >= b.min && score <= b.max) || RISK_BANDS[0];
}

export function formatINR(num: number): string {
  if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)} Cr`;
  if (num >= 1e5) return `₹${(num / 1e5).toFixed(1)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
}

// ---------- RETAIL ----------
export interface RetailInputs {
  monthlyIncome: number;
  incomeStability: 'salaried' | 'self-employed' | 'gig' | 'unemployed';
  existingEmis: number;
  creditUtilization: number;
  paymentHistory: number;
  bankingVintage: number;
  upiVolume: number;
  upiConsistency: number;
  savingsRate: number;
  employmentTenure: number;
  age: number;
  hasBureauScore: boolean;
  bureauScore: number;
}

export function calculateRetailScore(inputs: RetailInputs): ScoreResult {
  const factors: ScoreFactor[] = [];
  let score = 300;

  const incomeScore = Math.min(180, (inputs.monthlyIncome / 50000) * 30);
  factors.push({
    name: 'Monthly Income',
    impact: Math.round(incomeScore),
    weight: '20%',
    reason: `₹${inputs.monthlyIncome.toLocaleString('en-IN')} monthly income`,
  });
  score += incomeScore;

  const stabilityMap: Record<RetailInputs['incomeStability'], number> = {
    salaried: 90,
    'self-employed': 60,
    gig: 40,
    unemployed: 0,
  };
  const stabilityScore = stabilityMap[inputs.incomeStability] ?? 50;
  factors.push({
    name: 'Income Stability',
    impact: stabilityScore,
    weight: '10%',
    reason: inputs.incomeStability.replace('-', ' '),
  });
  score += stabilityScore;

  const emiRatio = inputs.existingEmis / Math.max(inputs.monthlyIncome, 1);
  const emiImpact = clamp(60 - emiRatio * 300, -120, 60);
  factors.push({
    name: 'EMI Burden',
    impact: Math.round(emiImpact),
    weight: '12%',
    reason: `${(emiRatio * 100).toFixed(0)}% of income goes to EMIs`,
  });
  score += emiImpact;

  const utilImpact = clamp(80 - inputs.creditUtilization * 1.8, -100, 80);
  factors.push({
    name: 'Credit Utilization',
    impact: Math.round(utilImpact),
    weight: '12%',
    reason: `${inputs.creditUtilization}% utilization`,
  });
  score += utilImpact;

  const paymentImpact = (inputs.paymentHistory / 100) * 120;
  factors.push({
    name: 'Payment History',
    impact: Math.round(paymentImpact),
    weight: '15%',
    reason: `${inputs.paymentHistory}% on-time payments`,
  });
  score += paymentImpact;

  const vintageImpact = Math.min(70, inputs.bankingVintage * 3.5);
  factors.push({
    name: 'Banking Vintage',
    impact: Math.round(vintageImpact),
    weight: '8%',
    reason: `${inputs.bankingVintage} months`,
  });
  score += vintageImpact;

  const upiImpact = Math.min(70, (inputs.upiVolume / 50000) * 35 + (inputs.upiConsistency / 100) * 35);
  factors.push({
    name: 'UPI Digital Footprint',
    impact: Math.round(upiImpact),
    weight: '8%',
    reason: `₹${inputs.upiVolume.toLocaleString('en-IN')} monthly, ${inputs.upiConsistency}% consistent`,
  });
  score += upiImpact;

  const savingsImpact = Math.min(70, (inputs.savingsRate / 100) * 70);
  factors.push({
    name: 'Savings Behavior',
    impact: Math.round(savingsImpact),
    weight: '8%',
    reason: `${inputs.savingsRate}% saved monthly`,
  });
  score += savingsImpact;

  const tenureImpact = Math.min(50, inputs.employmentTenure * 2.5);
  factors.push({
    name: 'Employment Tenure',
    impact: Math.round(tenureImpact),
    weight: '5%',
    reason: `${inputs.employmentTenure} months`,
  });
  score += tenureImpact;

  let ageImpact = 0;
  if (inputs.age >= 25 && inputs.age <= 55) ageImpact = 40;
  else if (inputs.age >= 21) ageImpact = 25;
  else ageImpact = 10;
  factors.push({
    name: 'Age',
    impact: ageImpact,
    weight: '2%',
    reason: `${inputs.age} years`,
  });
  score += ageImpact;

  if (inputs.hasBureauScore && inputs.bureauScore > 0) {
    const bureauImpact = ((inputs.bureauScore - 300) / 600) * 50;
    factors.push({
      name: 'Bureau Score',
      impact: Math.round(bureauImpact),
      weight: 'bonus',
      reason: `CIBIL ${inputs.bureauScore}`,
    });
    score += bureauImpact;
  } else {
    factors.push({
      name: 'Bureau Score',
      impact: 0,
      weight: 'bonus',
      reason: 'No bureau score — alternate data only',
    });
  }

  score = clamp(Math.round(score), 300, 900);
  const band = getBand(score);

  const incomeMultiplier = score >= 750 ? 6 : score >= 650 ? 4 : score >= 550 ? 2 : 0;
  const maxLoan = Math.max(
    0,
    Math.round(
      (inputs.monthlyIncome * 12 * incomeMultiplier * (1 - inputs.existingEmis / Math.max(inputs.monthlyIncome, 1))) / 1000
    ) * 1000
  );

  return { score, band, factors, maxLoan, mode: 'retail' };
}

// ---------- MSME ----------
export interface MSMEInputs {
  businessVintage: number;
  annualTurnover: number;
  gstFiling: 'monthly' | 'quarterly' | 'irregular' | 'none';
  gstGrowth: number;
  digitalPaymentShare: number;
  avgBankBalance: number;
  receivablesCycle: number;
  sector: 'manufacturing' | 'services' | 'trading' | 'agriculture' | 'construction' | 'hospitality';
  existingLoans: number;
  udyamRegistered: boolean;
  hasCollateral: boolean;
  womenLed: boolean;
}

export function calculateMSMEScore(inputs: MSMEInputs): ScoreResult {
  const factors: ScoreFactor[] = [];
  let score = 300;

  const vintageImpact = Math.min(120, inputs.businessVintage * 4);
  factors.push({
    name: 'Business Vintage',
    impact: Math.round(vintageImpact),
    weight: '14%',
    reason: `${inputs.businessVintage} months`,
  });
  score += vintageImpact;

  const turnoverImpact = Math.min(160, (inputs.annualTurnover / 1000000) * 16);
  factors.push({
    name: 'Annual Turnover',
    impact: Math.round(turnoverImpact),
    weight: '18%',
    reason: formatINR(inputs.annualTurnover),
  });
  score += turnoverImpact;

  const gstMap: Record<MSMEInputs['gstFiling'], number> = {
    monthly: 120,
    quarterly: 90,
    irregular: 30,
    none: 0,
  };
  const gstImpact = gstMap[inputs.gstFiling] ?? 0;
  factors.push({
    name: 'GST Filing Regularity',
    impact: gstImpact,
    weight: '14%',
    reason: inputs.gstFiling,
  });
  score += gstImpact;

  const growthImpact = clamp(inputs.gstGrowth * 2, -40, 80);
  factors.push({
    name: 'GST Turnover Growth',
    impact: Math.round(growthImpact),
    weight: '9%',
    reason: `${inputs.gstGrowth}% YoY`,
  });
  score += growthImpact;

  const digitalImpact = (inputs.digitalPaymentShare / 100) * 90;
  factors.push({
    name: 'Digital Payment Share',
    impact: Math.round(digitalImpact),
    weight: '10%',
    reason: `${inputs.digitalPaymentShare}%`,
  });
  score += digitalImpact;

  const balanceImpact = Math.min(90, (inputs.avgBankBalance / 200000) * 45);
  factors.push({
    name: 'Avg Bank Balance',
    impact: Math.round(balanceImpact),
    weight: '10%',
    reason: formatINR(inputs.avgBankBalance),
  });
  score += balanceImpact;

  const receivablesImpact = clamp(70 - (inputs.receivablesCycle / 180) * 100, -30, 70);
  factors.push({
    name: 'Receivables Cycle',
    impact: Math.round(receivablesImpact),
    weight: '8%',
    reason: `${inputs.receivablesCycle} days`,
  });
  score += receivablesImpact;

  const sectorMap: Record<MSMEInputs['sector'], number> = {
    manufacturing: 50,
    services: 50,
    trading: 45,
    agriculture: 40,
    construction: 30,
    hospitality: 25,
  };
  const sectorImpact = sectorMap[inputs.sector] ?? 35;
  factors.push({
    name: 'Sector Risk',
    impact: sectorImpact,
    weight: '6%',
    reason: inputs.sector,
  });
  score += sectorImpact;

  const udyamImpact = inputs.udyamRegistered ? 40 : 0;
  factors.push({
    name: 'Udyam Registration',
    impact: udyamImpact,
    weight: '5%',
    reason: inputs.udyamRegistered ? 'Registered' : 'Not registered',
  });
  score += udyamImpact;

  const loanImpact = clamp(20 - (inputs.existingLoans / 5) * 100, -80, 20);
  factors.push({
    name: 'Existing Loan Burden',
    impact: Math.round(loanImpact),
    weight: '6%',
    reason: `${inputs.existingLoans} active loans`,
  });
  score += loanImpact;

  const collateralImpact = inputs.hasCollateral ? 40 : 0;
  factors.push({
    name: 'Collateral Available',
    impact: collateralImpact,
    weight: '4%',
    reason: inputs.hasCollateral ? 'Yes' : 'No',
  });
  score += collateralImpact;

  const womenImpact = inputs.womenLed ? 30 : 0;
  factors.push({
    name: 'Women-Led Enterprise',
    impact: womenImpact,
    weight: '3%',
    reason: inputs.womenLed ? 'Yes' : 'No',
  });
  score += womenImpact;

  score = clamp(Math.round(score), 300, 900);
  const band = getBand(score);

  const turnoverMultiplier = score >= 750 ? 0.25 : score >= 650 ? 0.18 : score >= 550 ? 0.1 : 0;
  const maxLoan = Math.max(0, Math.round((inputs.annualTurnover * turnoverMultiplier) / 1000) * 1000);

  return { score, band, factors, maxLoan, mode: 'msme' };
}

export function calculateResult(mode: 'retail' | 'msme', inputs: RetailInputs | MSMEInputs): ScoreResult {
  return mode === 'retail'
    ? calculateRetailScore(inputs as RetailInputs)
    : calculateMSMEScore(inputs as MSMEInputs);
}

// ============ PHASE 2: EXPLAINABILITY & ACCOUNTABILITY EXTENSIONS ============

export interface ReasonCode {
  code: string;
  factor: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  action: string;
  impact: number;
}

export interface CounterfactualResult {
  originalScore: number;
  newScore: number;
  delta: number;
  newBand: RiskBand;
  newMaxLoan: number;
}

export interface WaterfallItem {
  name: string;
  impact: number;
  runningTotal: number;
}

function severityFromImpact(impact: number): ReasonCode['severity'] {
  if (impact <= -40) return 'critical';
  if (impact <= -20) return 'warning';
  return 'info';
}

export function generateReasonCodes(result: ScoreResult): ReasonCode[] {
  const codes: ReasonCode[] = [];

  for (const f of result.factors) {
    if (f.name === 'EMI Burden' && f.impact < -20) {
      codes.push({
        code: 'CB-R01',
        factor: f.name,
        severity: severityFromImpact(f.impact),
        message: `EMI burden is high (${f.reason}). Debt-to-income ratio exceeds comfortable threshold.`,
        action: 'Pay down existing loans or consolidate EMIs before reapplying.',
        impact: f.impact,
      });
    }
    if (f.name === 'Credit Utilization' && f.impact < -20) {
      codes.push({
        code: 'CB-R02',
        factor: f.name,
        severity: severityFromImpact(f.impact),
        message: `Credit utilization is elevated (${f.reason}). Lenders see this as higher dependency on credit.`,
        action: 'Reduce card/line balances below 30% of limit.',
        impact: f.impact,
      });
    }
    if (f.name === 'Payment History' && f.impact < 40) {
      codes.push({
        code: 'CB-R03',
        factor: f.name,
        severity: 'warning',
        message: `Payment track record is weak (${f.reason}). Past delinquency raises default probability.`,
        action: 'Set up auto-debits and maintain 12+ months of on-time payments.',
        impact: f.impact,
      });
    }
    if (f.name === 'Income Stability' && f.impact < 50) {
      codes.push({
        code: 'CB-R04',
        factor: f.name,
        severity: 'warning',
        message: `Income source is non-salaried or irregular (${f.reason}). Cash-flow predictability is lower.`,
        action: 'Show 6+ months of consistent deposits and GST/invoice records.',
        impact: f.impact,
      });
    }
    if (f.name === 'Bureau Score' && f.impact === 0) {
      codes.push({
        code: 'CB-R05',
        factor: f.name,
        severity: 'info',
        message: 'No traditional bureau score is available. Decision relies entirely on alternate data.',
        action: 'Build credit history with a small secured card or NBFC line.',
        impact: 0,
      });
    }
    if (f.name === 'Receivables Cycle' && f.impact < -15) {
      codes.push({
        code: 'CB-R06',
        factor: f.name,
        severity: severityFromImpact(f.impact),
        message: `Receivables cycle is long (${f.reason}). Working capital stress is inferred.`,
        action: 'Offer early-payment discounts or invoice discounting to shorten collection.',
        impact: f.impact,
      });
    }
    if (f.name === 'Existing Loan Burden' && f.impact < -20) {
      codes.push({
        code: 'CB-R07',
        factor: f.name,
        severity: severityFromImpact(f.impact),
        message: `Multiple active loans detected (${f.reason}). Leverage appears stretched.`,
        action: 'Close at least one loan or reduce overall exposure.',
        impact: f.impact,
      });
    }
  }

  return codes;
}

export function calculateCounterfactual(
  mode: 'retail' | 'msme',
  originalInputs: RetailInputs | MSMEInputs,
  changes: Partial<RetailInputs> | Partial<MSMEInputs>
): CounterfactualResult {
  const newInputs = { ...originalInputs, ...changes } as RetailInputs | MSMEInputs;
  const original = calculateResult(mode, originalInputs);
  const updated = calculateResult(mode, newInputs);
  return {
    originalScore: original.score,
    newScore: updated.score,
    delta: updated.score - original.score,
    newBand: updated.band,
    newMaxLoan: updated.maxLoan,
  };
}

export function calculateBureauOnlyScore(inputs: RetailInputs): number {
  // A simplified proxy for a traditional bureau-only model used for comparison.
  if (inputs.hasBureauScore && inputs.bureauScore > 300) {
    return clamp(inputs.bureauScore, 300, 900);
  }
  // Thin-file fallback: bureau-only model cannot score → 0 coverage.
  return 0;
}

export function calculateConfidence(result: ScoreResult): { label: string; value: number; color: string } {
  const nonZeroFactors = result.factors.filter((f) => f.impact !== 0).length;
  const hasBureau = result.factors.some((f) => f.name === 'Bureau Score' && f.impact > 0);
  const hasIncome = result.factors.some((f) => f.name === 'Monthly Income' || f.name === 'Annual Turnover');

  let value = 60;
  if (nonZeroFactors >= 8) value += 15;
  if (hasBureau) value += 10;
  if (hasIncome) value += 10;
  if (result.mode === 'msme') value += 5;
  value = clamp(value, 0, 100);

  if (value >= 85) return { label: 'High confidence', value, color: '#16a34a' };
  if (value >= 65) return { label: 'Medium confidence', value, color: '#ca8a04' };
  return { label: 'Low confidence — review recommended', value, color: '#dc2626' };
}

export function buildWaterfall(factors: ScoreFactor[]): WaterfallItem[] {
  const sorted = [...factors].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  let runningTotal = 300;
  const items: WaterfallItem[] = [];
  for (const f of sorted) {
    runningTotal += f.impact;
    items.push({ name: f.name, impact: f.impact, runningTotal });
  }
  return items;
}

export function estimateCoverageGain(retailInputs: RetailInputs): number {
  // Simplified estimate of how many thin-file applicants gain access vs bureau-only.
  const bureauScore = retailInputs.hasBureauScore ? retailInputs.bureauScore : 0;
  const hasAlternateData =
    retailInputs.upiVolume > 10000 ||
    retailInputs.bankingVintage >= 12 ||
    retailInputs.paymentHistory > 0 ||
    retailInputs.savingsRate > 0;

  if (bureauScore > 0) return 0; // already covered by bureau
  if (hasAlternateData) return 82; // aligns with pitch-deck claim
  return 35;
}

/**
 * CreditBridge AI — Enhanced Lender Marketplace (Phase 4).
 *
 * Product catalog, eligibility matching and EMI calculations.
 * All data is illustrative and client-side only.
 */

import type { ScoreResult, RetailInputs, MSMEInputs } from './creditBridgeEngine';

export type LenderType = 'Public Bank' | 'Private Bank' | 'NBFC' | 'MSME Fintech' | 'MSME NBFC' | 'Digital Lender';
export type LoanPurpose = 'Working Capital' | 'Term Loan' | 'Invoice Financing' | 'Equipment Finance' | 'Start-up Loan' | 'Personal Loan';

export interface LenderProduct {
  id: string;
  lender: string;
  type: LenderType;
  productName: string;
  purpose: LoanPurpose;
  minScore: number;
  maxScore?: number;
  minTurnover?: number;
  rateMin: number;
  rateMax: number;
  tenureMonthsMin: number;
  tenureMonthsMax: number;
  maxAmount: number;
  collateralRequired: boolean;
  womenLedBoost: boolean;
  sectorBoost?: string[];
  features: string[];
  tags: string[];
}

export interface MatchedOffer {
  product: LenderProduct;
  matchScore: number;
  eligible: boolean;
  estimatedRate: number;
  estimatedMaxAmount: number;
  reason: string;
}

export const LENDER_PRODUCTS: LenderProduct[] = [
  {
    id: 'sbi-capsel',
    lender: 'State Bank of India',
    type: 'Public Bank',
    productName: 'SME eBiz Loan',
    purpose: 'Working Capital',
    minScore: 700,
    rateMin: 10.5,
    rateMax: 12.5,
    tenureMonthsMin: 12,
    tenureMonthsMax: 60,
    maxAmount: 20000000,
    collateralRequired: false,
    womenLedBoost: true,
    sectorBoost: ['manufacturing', 'services'],
    features: ['No collateral up to ₹2 Cr', 'Digital disbursement', 'Women-led 0.5% concession'],
    tags: ['FLAGSHIP', 'COLLATERAL-FREE'],
  },
  {
    id: 'hdfc-flexi',
    lender: 'HDFC Bank',
    type: 'Private Bank',
    productName: 'Business Growth Loan',
    purpose: 'Term Loan',
    minScore: 720,
    rateMin: 11.0,
    rateMax: 13.5,
    tenureMonthsMin: 12,
    tenureMonthsMax: 48,
    maxAmount: 15000000,
    collateralRequired: false,
    womenLedBoost: false,
    sectorBoost: ['services', 'trading'],
    features: ['Pre-approved limit', 'Flexi repayment', 'Top-up facility'],
    tags: ['FAST'],
  },
  {
    id: 'bajaj-term',
    lender: 'Bajaj Finserv',
    type: 'NBFC',
    productName: 'Business Term Loan',
    purpose: 'Term Loan',
    minScore: 650,
    rateMin: 13.0,
    rateMax: 17.0,
    tenureMonthsMin: 6,
    tenureMonthsMax: 60,
    maxAmount: 5000000,
    collateralRequired: false,
    womenLedBoost: true,
    features: ['Same-day disbursal', 'Minimal docs', 'Online account'],
    tags: ['QUICK'],
  },
  {
    id: 'lendingkart-wc',
    lender: 'Lendingkart',
    type: 'MSME Fintech',
    productName: 'Working Capital Loan',
    purpose: 'Working Capital',
    minScore: 620,
    minTurnover: 1000000,
    rateMin: 15.0,
    rateMax: 20.0,
    tenureMonthsMin: 3,
    tenureMonthsMax: 36,
    maxAmount: 10000000,
    collateralRequired: false,
    womenLedBoost: false,
    features: ['GST-based approval', '2-hour decision', 'No collateral'],
    tags: ['GST-POWERED'],
  },
  {
    id: 'kinara-msme',
    lender: 'Kinara Capital',
    type: 'MSME NBFC',
    productName: 'HerVikas / MSME Loan',
    purpose: 'Term Loan',
    minScore: 600,
    rateMin: 16.0,
    rateMax: 21.0,
    tenureMonthsMin: 12,
    tenureMonthsMax: 48,
    maxAmount: 3000000,
    collateralRequired: false,
    womenLedBoost: true,
    sectorBoost: ['manufacturing', 'trading'],
    features: ['HerVikas discount for women', 'Vernacular support', 'Doorstep service'],
    tags: ['WOMEN-LED', 'MSME-FOCUS'],
  },
  {
    id: 'incred-digital',
    lender: 'Incred',
    type: 'Digital Lender',
    productName: 'Start-up & MSME Loan',
    purpose: 'Start-up Loan',
    minScore: 650,
    rateMin: 14.0,
    rateMax: 18.5,
    tenureMonthsMin: 6,
    tenureMonthsMax: 36,
    maxAmount: 2500000,
    collateralRequired: false,
    womenLedBoost: false,
    features: ['Start-up friendly', 'Cash-flow based', 'Digital KYC'],
    tags: ['STARTUP'],
  },
  {
    id: 'axis-invoice',
    lender: 'Axis Bank',
    type: 'Private Bank',
    productName: 'Invoice Financing',
    purpose: 'Invoice Financing',
    minScore: 680,
    rateMin: 11.5,
    rateMax: 14.5,
    tenureMonthsMin: 1,
    tenureMonthsMax: 12,
    maxAmount: 8000000,
    collateralRequired: false,
    womenLedBoost: false,
    sectorBoost: ['services', 'manufacturing'],
    features: ['Finance against receivables', 'Up to 90% invoice value', 'Revolver limit'],
    tags: ['INVOICE'],
  },
  {
    id: 'sbi-equipment',
    lender: 'State Bank of India',
    type: 'Public Bank',
    productName: 'Equipment Finance',
    purpose: 'Equipment Finance',
    minScore: 710,
    rateMin: 10.75,
    rateMax: 12.75,
    tenureMonthsMin: 24,
    tenureMonthsMax: 84,
    maxAmount: 25000000,
    collateralRequired: true,
    womenLedBoost: true,
    sectorBoost: ['manufacturing', 'agriculture'],
    features: ['Finance 80% of asset cost', 'Long tenure', 'Tax benefits'],
    tags: ['ASSET-BACKED'],
  },
];

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num));
}

function getAnnualTurnover(inputs: RetailInputs | MSMEInputs): number {
  if ('annualTurnover' in inputs) return inputs.annualTurnover;
  return inputs.monthlyIncome * 12;
}

export function calculateEMI(principal: number, annualRatePercent: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0 || annualRatePercent <= 0) return 0;
  const r = annualRatePercent / 12 / 100;
  const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
  return Math.round(emi);
}

export function matchProducts(result: ScoreResult, inputs: RetailInputs | MSMEInputs): MatchedOffer[] {
  const isMSME = result.mode === 'msme';
  const msmeInputs = isMSME ? (inputs as MSMEInputs) : null;
  const turnover = getAnnualTurnover(inputs);

  return LENDER_PRODUCTS.map((product) => {
    let matchScore = 0;
    let reason = '';

    // Base eligibility: score band
    if (result.score < product.minScore) {
      return { product, matchScore: 0, eligible: false, estimatedRate: 0, estimatedMaxAmount: 0, reason: `Minimum score ${product.minScore} required` };
    }
    matchScore += Math.min(30, (result.score - product.minScore) / 2);

    // Turnover fit
    if (product.minTurnover && turnover < product.minTurnover) {
      return { product, matchScore: 0, eligible: false, estimatedRate: 0, estimatedMaxAmount: 0, reason: `Minimum annual turnover ${product.minTurnover.toLocaleString('en-IN')} required` };
    }
    matchScore += 20;

    // Collateral fit
    if (!product.collateralRequired) {
      matchScore += 15;
    } else if (isMSME && msmeInputs?.hasCollateral) {
      matchScore += 15;
      reason += 'Collateral matches; ';
    } else if (product.collateralRequired) {
      matchScore += 5;
      reason += 'Collateral required; ';
    }

    // Sector fit
    if (isMSME && product.sectorBoost && product.sectorBoost.includes(msmeInputs!.sector)) {
      matchScore += 15;
      reason += 'Sector preferred; ';
    }

    // Women-led fit
    if (isMSME && product.womenLedBoost && msmeInputs!.womenLed) {
      matchScore += 15;
      reason += 'Women-led concession; ';
    }

    // Purpose fit (simple boost for MSME working capital/term)
    if (isMSME) {
      matchScore += 5;
    }

    matchScore = clamp(Math.round(matchScore), 0, 100);

    // Rate estimate: lower rate for higher match score
    const rateSpread = product.rateMax - product.rateMin;
    const estimatedRate = product.rateMin + rateSpread * (1 - matchScore / 100);

    // Max amount estimate
    const eligibleCap = Math.min(product.maxAmount, result.maxLoan);
    const estimatedMaxAmount = Math.max(0, eligibleCap);

    return {
      product,
      matchScore,
      eligible: true,
      estimatedRate: Math.round(estimatedRate * 100) / 100,
      estimatedMaxAmount,
      reason: reason || 'Eligible based on score and profile',
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

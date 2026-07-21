export interface UserProfile {
  name: string;
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
  taxBracket: 0 | 10 | 20 | 30;
  monthlyIncome: number;
  monthlySavings: number;
  monthlyExpenses: number;
}

export interface Asset {
  id: string;
  name: string;
  type: 'bank' | 'mutualFund' | 'stock' | 'gold' | 'property' | 'vehicle' | 'other';
  value: number;
  liquidity: 'high' | 'medium' | 'low';
  returns?: number;
  linkedViaAA?: boolean;
}

export interface Goal {
  id: string;
  name: string;
  type: 'home' | 'education' | 'retirement' | 'emergency' | 'car' | 'travel' | 'wedding' | 'other';
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface RiskSignals {
  newDevice: boolean;
  rushedAction: boolean;
  unusualAmount: boolean;
  otpRetries: boolean;
  firstTimeInvest: boolean;
  abnormalBehavior: boolean;
}

export interface ProtectionDecision {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  action: 'ALLOW' | 'WARN' | 'BLOCK';
  cooldown?: number;
  delay?: number;
  message: string;
  referenceId: string;
}

export interface AuditLog {
  timestamp: string;
  action: string;
  signals: RiskSignals;
  score: number;
  decision: ProtectionDecision;
  userId: string;
}

export interface ConsentRecord {
  consentId: string;
  dataScope: string[];
  purpose: string;
  validityDays: number;
  status: 'ACTIVE' | 'REVOKED';
  grantedAt: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'savings' | 'investment' | 'tax' | 'protection' | 'spending';
  priority: 'high' | 'medium' | 'low';
  potential: string;
  action: string;
  why: {
    userPattern: string;
    marketCondition: string;
    ruleLogic: string;
  };
}

export interface MarketData {
  niftyPe: number;
  repoRate: number;
  inflation: number;
  goldPrice: number;
  usdInr: number;
  lastUpdated: string;
}

export interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

export interface Notification {
  id: string;
  icon: string;
  text: string;
  time: string;
  unread: boolean;
  color: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'credit' | 'debit';
  status: 'ALLOWED' | 'BLOCKED' | 'DELAYED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  signals?: RiskSignals;
  score?: number;
  decision?: ProtectionDecision;
  referenceId?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  avatar: string;
  netWorth: number;
  assets: { name: string; value: number; type: string }[];
  monthlyContribution: number;
}

export interface RecurringBill {
  id: string;
  name: string;
  category: string;
  amount: number;
  predictedAmount?: number;
  dueDay: number;
  icon: string;
  color: string;
  status: 'upcoming' | 'due' | 'overdue' | 'paid';
  isRecurring: boolean;
  frequency: 'monthly' | 'weekly' | 'yearly';
  autoDetected: boolean;
  lastPaid?: string;
  history: number[];
}

export interface InvestmentTrigger {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  enabled: boolean;
  fired: boolean;
  dismissed: boolean;
  progress: number;
  currentValue: string;
  targetValue: string;
  icon: string;
  color: string;
}

export interface CibilFactor {
  name: string;
  weight: number;
  score: number;
  maxScore: number;
  status: 'good' | 'warning' | 'bad';
  icon: string;
  detail: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  progress: number;
  maxProgress: number;
  progressLabel: string;
  participants: number;
  userRank: number;
  daysLeft: number;
  status: 'active' | 'completed' | 'failed';
  reward: string;
}

export interface KidProfile {
  name: string;
  avatar: string;
  age: number;
  savingsGoal: number;
  currentSavings: number;
}

export interface KidTask {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  approved: boolean;
}

export interface SpendRequest {
  id: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface UncategorizedTx {
  id: string;
  description: string;
  amount: number;
  date: string;
  aiCategory: string;
  confidence: number;
  category: string | null;
  ruleCreated: boolean;
}

export interface CategoryRule {
  id: string;
  pattern: string;
  category: string;
  count: number;
}

export interface DuplicateGroup {
  id: string;
  txIds: string[];
  merchant: string;
  amount: number;
  confidence: number;
  reason: string;
  status: 'pending' | 'merged' | 'kept' | 'not-duplicate';
  date: string;
  timeGap?: string;
}

export interface Subscription {
  id: string;
  name: string;
  icon: string;
  color: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'unused' | 'cancelled';
  nextRenewal: string;
  daysUntilRenewal: number;
  lastUsed?: string;
  daysSinceUsed?: number;
  category: string;
  autoDetected: boolean;
}

export interface NRIAccount {
  id: string;
  name: string;
  type: 'NRE' | 'NRO' | 'FCNR';
  balance: number;
  currency: string;
  repatriable: boolean;
  repatriationLimit?: string;
  interestRate?: number;
  maturityDate?: string;
}

export interface Remittance {
  id: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  fee: number;
  date: string;
  status: 'completed' | 'pending';
}

export interface NRIInvestmentRule {
  id: string;
  name: string;
  allowed: boolean;
  category: string;
  note: string;
}

export interface MSMEScoreFactor {
  factor: string;
  weight: string;
  score: number;
  maxScore: number;
  impact: string;
  icon: string;
}

export interface MSMERecommendation {
  action: string;
  impact: string;
  timeline: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface MSMEApplication {
  id: number;
  applicationRef: string;
  businessName: string;
  udyamNumber?: string;
  gstin?: string;
  panNumber?: string;
  aadhaarMasked?: string;
  enterpriseType: 'micro' | 'small' | 'medium';
  annualTurnover: number;
  employees: number;
  requestedAmount: number;
  requestedTenure: number;
  purpose?: string;
  status: string;
  decision?: string;
  decisionReason?: string;
  consentGst: boolean;
  consentAa: boolean;
  consentUpi: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MSMECreditScore {
  id: number;
  applicationId: number;
  score: number;
  category: string;
  factors: MSMEScoreFactor[];
  eli5: string;
  recommendations: MSMERecommendation[];
  fraudSignals: { type: string; message: string; severity: string }[];
}

export interface MSMEOffer {
  id: number;
  offerType: string;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  totalInterest: number;
  totalRepayment: number;
  processingFee: number;
  gstOnFees: number;
  cgtmseApplicable: boolean;
  cgtmseGuaranteePercent: number;
  cgtmseGuaranteedAmount: number;
  collateralRequired: boolean;
  conditions: string[];
  status: string;
}

export interface MSMEAdminStats {
  totalLoansDisbursed: number;
  activeMSMEs: number;
  totalApplications: number;
  approved: number;
  rejected: number;
  averageTicketSize: number;
  portfolioPAR: number;
  recoveryRate: number;
  womenLedMSMEs: number;
  ruralReach: number;
  cgstmseClaims: number;
}

export type ViewType = 
  | 'dashboard' | 'wealth-twin' | 'goals' | 'portfolio'
  | 'assets' | 'market' | 'forecast' | 'protection'
  | 'tax' | 'privacy' | 'calculators' | 'transactions' | 'architecture' | 'bills' | 'credit-health' | 'notification-demo' | 'digital-gold' | 'challenges' | 'kids-mode' | 'subscriptions' | 'accessibility' | 'nri-mode' | 'business-mode' | 'values-alignment' | 'fantasy-league' | 'boosts' | 'security-beast' | 'innovation-lab' | 'payments' | 'bhavishya' | 'features'
  | 'ai-recommendations'
  | 'family'
  | 'profile'
  | 'loan-center' | 'recurring-payments' | 'account-statement' | 'audit-log' | 'admin'
  | 'msme-creditbridge'
  | 'creditbridge-ai'
  | 'loans-hub' | 'loan-research' | 'loan-impact' | 'social-collateral-loan'
  | 'pitch-deck'
  | 'cross-device-approval'
  | 'quantum-key'
  | 'quantum-vault'
  | 'live-fraud-simulator'
  | 'scam-call'
  | 'voice-panic'
  | 'wealth-3d'
  | 'wealth-ar'
  | 'coercion-detection'
  | 'emotion-gate'
  | 'risk-score'
  | 'generational-wealth'
  | 'voice-commands';

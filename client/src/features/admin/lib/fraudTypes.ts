export type FraudStatus = 'open' | 'investigating' | 'escalated' | 'closed' | 'false_positive';
export type FraudPriority = 'low' | 'medium' | 'high' | 'critical';
export type FraudCategory =
  | 'account_takeover'
  | 'mule_transfer'
  | 'card_fraud'
  | 'phishing'
  | 'insider'
  | 'identity_theft'
  | 'velocity';

export interface FraudEvidence {
  txId?: string;
  ip?: string;
  deviceId?: string;
  userAgent?: string;
  swiftRef?: string;
  clearingTime?: string;
  companyReg?: string;
  beneficialOwner?: string;
  chain?: string;
  confirmations?: number;
  finalClearing?: string;
  localReference?: string;
  [key: string]: unknown;
}

export interface FraudHop {
  id: number;
  fraudCaseId: number;
  hopNumber: number;
  hopType: string;
  nodeName: string;
  country: string;
  city?: string;
  lat?: number;
  lon?: number;
  entityType: string;
  entityValue: string;
  institution?: string;
  ifsc?: string;
  swiftBic?: string;
  amount: number;
  currency: string;
  timestamp: string;
  evidenceJson?: FraudEvidence | null;
  confidence: number;
  isSanctioned: boolean;
}

export interface FraudAccount {
  id: number;
  fraudCaseId: number;
  accountType: 'source' | 'mule' | 'beneficiary';
  holderName: string;
  bankName: string;
  branch?: string;
  maskedAccount: string;
  ifsc?: string;
  swiftBic?: string;
  country: string;
  riskFlags: string[];
}

export interface FraudNote {
  id: number;
  fraudCaseId: number;
  adminId?: string;
  note: string;
  createdAt: string;
}

export interface FraudCaseUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface FraudCase {
  id: number;
  caseRef: string;
  auditLogId?: number | null;
  userId?: string | null;
  status: FraudStatus;
  priority: FraudPriority;
  riskScore: number;
  riskFactors: string[];
  category: FraudCategory;
  summary: string;
  sourceEntityType: string;
  sourceEntityId?: number;
  assignedAdminId?: string | null;
  countryRiskTags: string[];
  createdAt: string;
  updatedAt: string;
  user?: FraudCaseUser | null;
  userName?: string;
  userEmail?: string;
  hops?: FraudHop[];
  accounts?: FraudAccount[];
  notes?: FraudNote[];
}

export interface FraudCasesResponse {
  success: boolean;
  cases: FraudCase[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export type FraudTimeRange = 'live' | '7d' | '1m' | '1y' | '10y' | 'all';

export interface FraudCaseFilters {
  status?: FraudStatus;
  priority?: FraudPriority;
  category?: FraudCategory;
  assignedAdminId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  minRisk?: number;
  maxRisk?: number;
  q?: string;
  sort?: 'created_at' | 'updated_at' | 'risk_score' | 'priority' | 'status';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  timeRange?: FraudTimeRange;
}

export interface FraudStats {
  totalCases: number;
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  byCategory: { category: string; count: number }[];
  highRiskCases: number;
  sanctionedCases: number;
  totalInrAmount: number;
}

export interface FraudRule {
  id: number;
  name: string;
  enabled: boolean;
  conditionJson: Record<string, unknown>;
  action: 'flag' | 'block' | 'notify';
  severity: FraudPriority;
  createdBy?: string;
  createdAt: string;
}

export type FraudExportFormat = 'xlsx' | 'csv';

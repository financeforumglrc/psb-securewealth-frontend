/**
 * Client-side synthetic fraud case generator (India-only).
 * Used as a fallback when the backend Fraud API is unavailable.
 * WARNING: All data is fictional.
 */

import type { FraudCase, FraudHop } from '@/features/admin/lib/fraudTypes';

const INDIAN_BANKS = [
  { name: 'State Bank of India', code: 'SBIN' },
  { name: 'HDFC Bank', code: 'HDFC' },
  { name: 'ICICI Bank', code: 'ICIC' },
  { name: 'Axis Bank', code: 'UTIB' },
  { name: 'Punjab National Bank', code: 'PUNB' },
  { name: 'Bank of Baroda', code: 'BARB' },
  { name: 'Canara Bank', code: 'CNRB' },
  { name: 'Union Bank of India', code: 'UBIN' },
  { name: 'Kotak Mahindra Bank', code: 'KKBK' },
  { name: 'IndusInd Bank', code: 'INDB' },
];

const INDIAN_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
  { city: 'Delhi', state: 'Delhi', lat: 28.7041, lon: 77.1025 },
  { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
  { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
  { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
  { city: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311 },
  { city: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376 },
  { city: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lon: 76.7794 },
  { city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
  { city: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lon: 85.8245 },
  { city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
  { city: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319 },
  { city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882 },
  { city: 'Vadodara', state: 'Gujarat', lat: 22.3072, lon: 73.1812 },
  { city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 },
];

const CATEGORIES = ['account_takeover', 'mule_transfer', 'card_fraud', 'phishing', 'insider', 'identity_theft', 'velocity'];

const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan', 'Dhruv', 'Reyansh', 'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Navya', 'Myra', 'Pari', 'Kavya', 'Rohit', 'Karan', 'Priya', 'Neha', 'Rahul', 'Suresh', 'Vikram', 'Pooja', 'Ritu', 'Amit'];
const LAST_NAMES = ['Sharma', 'Kumar', 'Singh', 'Patel', 'Gupta', 'Reddy', 'Nair', 'Iyer', 'Verma', 'Yadav', 'Mehta', 'Joshi', 'Desai', 'Shah', 'Bhat', 'Rao', 'Kapoor', 'Malhotra', 'Choudhary', 'Menon'];

const RISK_FACTORS_POOL = [
  'velocity_spike', 'new_beneficiary', 'high_value_transaction', 'mule_account_pattern',
  'device_fingerprint_mismatch', 'impossible_travel', 'login_from_tor', 'weekend_activity_spike',
  'rapid_multiple_hops', 'unusual_login_time', 'geolocation_anomaly', 'account_age_low',
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function maskAccount(num: number): string {
  const last4 = String(num).slice(-4).padStart(4, '0');
  return `XXXX${last4}`;
}

function generateIfsc(bankCode: string): string {
  return `${bankCode}0${String(randInt(100000, 999999))}`;
}

function generateName(): string {
  return `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`;
}

function pickRiskFactors(category: string): string[] {
  const factors = new Set<string>();
  factors.add(rand(RISK_FACTORS_POOL));
  if (category === 'mule_transfer') { factors.add('mule_account_pattern'); factors.add('rapid_multiple_hops'); }
  if (category === 'account_takeover') { factors.add('device_fingerprint_mismatch'); factors.add('impossible_travel'); }
  if (category === 'card_fraud') { factors.add('high_value_transaction'); factors.add('velocity_spike'); }
  if (category === 'phishing') { factors.add('new_beneficiary'); factors.add('login_from_tor'); }
  if (category === 'velocity') { factors.add('velocity_spike'); factors.add('weekend_activity_spike'); }
  if (category === 'insider') { factors.add('unusual_login_time'); factors.add('account_age_low'); }
  if (category === 'identity_theft') { factors.add('geolocation_anomaly'); factors.add('device_fingerprint_mismatch'); }
  return Array.from(factors);
}

function computeRiskScore(category: string, factors: string[]): number {
  const base: Record<string, number> = { account_takeover: 78, mule_transfer: 85, card_fraud: 72, phishing: 68, insider: 60, identity_theft: 75, velocity: 70 };
  const score = (base[category] || 65) + factors.length * 3;
  return Math.min(99, Math.max(30, score + randInt(-8, 8)));
}

export function generateMockCase(index = 0): FraudCase {
  const now = new Date();
  const secondsAgo = randInt(0, 3600 * 24 * 365 * 10);
  const createdAt = new Date(now.getTime() - secondsAgo * 1000);
  const month = String(createdAt.getMonth() + 1).padStart(2, '0');
  const caseRef = `FC-${createdAt.getFullYear()}-${month}-${String(index + 1).padStart(5, '0')}`;

  const category = rand(CATEGORIES);
  const originCity = rand(INDIAN_CITIES);
  const intermediateCity = rand(INDIAN_CITIES);
  const finalCity = rand(INDIAN_CITIES);
  const sourceBank = rand(INDIAN_BANKS);
  const intermediateBank = rand(INDIAN_BANKS);
  const finalBank = rand(INDIAN_BANKS);
  const holderName = generateName();
  const amountBase = randInt(50000, 2500000);
  const isMule = category === 'mule_transfer';

  const riskFactors = pickRiskFactors(category);
  const riskScore = computeRiskScore(category, riskFactors);

  const hops: FraudHop[] = [
    {
      id: 1, fraudCaseId: index, hopNumber: 1, hopType: 'origin', nodeName: `${originCity.city}, ${originCity.state}`, country: 'India', city: originCity.city,
      lat: originCity.lat + (Math.random() - 0.5) * 0.05, lon: originCity.lon + (Math.random() - 0.5) * 0.05,
      entityType: 'bank_account', entityValue: maskAccount(randInt(100000000000, 999999999999)),
      institution: sourceBank.name, ifsc: generateIfsc(sourceBank.code),
      amount: amountBase, currency: 'INR', timestamp: createdAt.toISOString(),
      confidence: randInt(85, 99), isSanctioned: false,
      evidenceJson: {
        txId: `TXN${randInt(100000000, 999999999)}`,
        ip: `203.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(0, 255)}`,
        deviceId: `DEV-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    },
    {
      id: 2, fraudCaseId: index, hopNumber: 2, hopType: 'intermediate', nodeName: `${intermediateCity.city}, ${intermediateCity.state}`, country: 'India', city: intermediateCity.city,
      lat: intermediateCity.lat + (Math.random() - 0.5) * 0.05, lon: intermediateCity.lon + (Math.random() - 0.5) * 0.05,
      entityType: isMule ? 'mule_account' : 'bank_account', entityValue: maskAccount(randInt(1000000000, 9999999999)),
      institution: intermediateBank.name, ifsc: generateIfsc(intermediateBank.code),
      amount: Math.round(amountBase * 0.98), currency: 'INR',
      timestamp: new Date(createdAt.getTime() + randInt(60000, 3600000)).toISOString(),
      confidence: randInt(70, 95), isSanctioned: false,
      evidenceJson: { clearingTime: 'T+0', impsRef: `IMPS${randInt(100000, 999999)}` }
    },
    {
      id: 3, fraudCaseId: index, hopNumber: 3, hopType: 'destination', nodeName: `${finalCity.city}, ${finalCity.state}`, country: 'India', city: finalCity.city,
      lat: finalCity.lat + (Math.random() - 0.5) * 0.05, lon: finalCity.lon + (Math.random() - 0.5) * 0.05,
      entityType: 'bank_account', entityValue: maskAccount(randInt(1000000000, 9999999999)),
      institution: finalBank.name, ifsc: generateIfsc(finalBank.code),
      amount: Math.round(amountBase * 0.95), currency: 'INR',
      timestamp: new Date(createdAt.getTime() + randInt(7200000, 86400000)).toISOString(),
      confidence: randInt(60, 90), isSanctioned: false,
      evidenceJson: { finalClearing: 'Completed', localReference: `REF-${randInt(100000, 999999)}` }
    }
  ];

  const summary = `${category.replace(/_/g, ' ')} case: INR ${amountBase.toLocaleString('en-IN')} moved from ${originCity.city} through ${intermediateCity.city} to ${finalCity.city} within India.`;

  return {
    id: index + 1,
    caseRef,
    status: rand(['open', 'open', 'investigating', 'investigating', 'escalated', 'closed', 'false_positive']),
    priority: riskScore >= 80 ? 'critical' : riskScore >= 60 ? 'high' : riskScore >= 40 ? 'medium' : 'low',
    riskScore,
    riskFactors,
    category: category as any,
    summary,
    sourceEntityType: 'transaction',
    sourceEntityId: randInt(10000, 99999),
    assignedAdminId: Math.random() < 0.7 ? `admin_${randInt(1, 5)}` : null,
    countryRiskTags: [],
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
    hops,
    accounts: [
      {
        id: 1, fraudCaseId: index + 1, accountType: 'source', holderName, bankName: sourceBank.name,
        branch: `${originCity.city} Main Branch`, maskedAccount: maskAccount(randInt(100000000000, 999999999999)),
        ifsc: generateIfsc(sourceBank.code), country: 'India',
        riskFlags: ['source_account_compromised', 'high_value_origin']
      },
      {
        id: 2, fraudCaseId: index + 1, accountType: 'mule', holderName: generateName(),
        bankName: intermediateBank.name, branch: `${intermediateCity.city} Branch`,
        maskedAccount: maskAccount(randInt(1000000000, 9999999999)),
        ifsc: generateIfsc(intermediateBank.code), country: 'India',
        riskFlags: ['recently_opened', 'rapid_turnover']
      },
      {
        id: 3, fraudCaseId: index + 1, accountType: 'beneficiary', holderName: generateName(),
        bankName: finalBank.name, branch: `${finalCity.city} Branch`,
        maskedAccount: maskAccount(randInt(1000000000, 9999999999)),
        ifsc: generateIfsc(finalBank.code), country: 'India',
        riskFlags: ['beneficial_owner_hidden']
      }
    ],
    notes: []
  };
}

export function generateMockCases(count = 500): FraudCase[] {
  return Array.from({ length: count }, (_, i) => generateMockCase(i)).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function generateLiveMockCase(id: number): FraudCase {
  const c = generateMockCase(id);
  const now = new Date();
  const ts = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  c.caseRef = `FC-LIVE-${ts}-${suffix}`;
  c.createdAt = now.toISOString();
  c.updatedAt = now.toISOString();
  c.status = 'open';
  c.priority = c.riskScore >= 80 ? 'critical' : c.riskScore >= 60 ? 'high' : 'medium';
  c.hops?.forEach((h, i) => {
    h.timestamp = new Date(now.getTime() + i * 120000 + randInt(0, 30000)).toISOString();
  });
  return c;
}

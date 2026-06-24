/**
 * Client-side synthetic fraud case generator.
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

const FOREIGN_BANKS = [
  { name: 'JPMorgan Chase', country: 'USA', swift: 'CHASUS33' },
  { name: 'HSBC', country: 'UK', swift: 'HBUKGB4B' },
  { name: 'Deutsche Bank', country: 'Germany', swift: 'DEUTDEFF' },
  { name: 'Credit Suisse', country: 'Switzerland', swift: 'CRESCHZZ' },
  { name: 'DBS Bank', country: 'Singapore', swift: 'DBSSSGSG' },
  { name: 'Emirates NBD', country: 'UAE', swift: 'EBILAEAD' },
  { name: 'Standard Chartered', country: 'Hong Kong', swift: 'SCBLHKHH' },
  { name: 'Bank of China', country: 'China', swift: 'BKCHCNBJ' },
  { name: 'Cayman National Bank', country: 'Cayman Islands', swift: 'CAYNKYKY' },
  { name: 'Sberbank', country: 'Russia', swift: 'SABRRUMM' },
  { name: 'ING Bank', country: 'Netherlands', swift: 'INGBNL2A' },
  { name: 'RBC Royal Bank', country: 'Canada', swift: 'ROYCCAT2' },
];

const CRYPTO_EXCHANGES = [
  { name: 'Binance', country: 'Malta' },
  { name: 'KuCoin', country: 'Seychelles' },
  { name: 'Bybit', country: 'UAE' },
];

const INDIAN_CITIES = [
  { city: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { city: 'Delhi', lat: 28.7041, lon: 77.1025 },
  { city: 'Bangalore', lat: 12.9716, lon: 77.5946 },
  { city: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { city: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { city: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { city: 'Pune', lat: 18.5204, lon: 73.8567 },
  { city: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
  { city: 'Jaipur', lat: 26.9124, lon: 75.7873 },
  { city: 'Lucknow', lat: 26.8467, lon: 80.9462 },
  { city: 'Surat', lat: 21.1702, lon: 72.8311 },
  { city: 'Patna', lat: 25.5941, lon: 85.1376 },
];

const FIRST_HOP_DESTINATIONS = [
  { country: 'UAE', city: 'Dubai', lat: 25.2048, lon: 55.2708, sanctioned: false },
  { country: 'Singapore', city: 'Singapore', lat: 1.3521, lon: 103.8198, sanctioned: false },
  { country: 'Hong Kong', city: 'Hong Kong', lat: 22.3193, lon: 114.1694, sanctioned: false },
  { country: 'UK', city: 'London', lat: 51.5074, lon: -0.1278, sanctioned: false },
];

const INTERMEDIATE_NODES = [
  { country: 'Switzerland', city: 'Zurich', lat: 47.3769, lon: 8.5417, type: 'shell', sanctioned: false },
  { country: 'Cayman Islands', city: 'George Town', lat: 19.3138, lon: -81.2546, type: 'shell', sanctioned: false },
  { country: 'Belize', city: 'Belize City', lat: 17.5046, lon: -88.1962, type: 'shell', sanctioned: true },
  { country: 'Panama', city: 'Panama City', lat: 8.9833, lon: -79.5167, type: 'shell', sanctioned: true },
];

const FINAL_DESTINATIONS = [
  { country: 'USA', city: 'New York', lat: 40.7128, lon: -74.0060 },
  { country: 'China', city: 'Shanghai', lat: 31.2304, lon: 121.4737 },
  { country: 'Russia', city: 'Moscow', lat: 55.7558, lon: 37.6173 },
  { country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lon: 4.9041 },
  { country: 'Canada', city: 'Toronto', lat: 43.6510, lon: -79.3470 },
];

const CATEGORIES = ['account_takeover', 'mule_transfer', 'card_fraud', 'phishing', 'insider', 'identity_theft', 'velocity'];
const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan', 'Dhruv', 'Reyansh', 'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Navya', 'Myra', 'Pari', 'Kavya', 'Rohit', 'Karan', 'Priya', 'Neha', 'Rahul', 'Suresh', 'Vikram', 'Pooja', 'Ritu', 'Amit'];
const LAST_NAMES = ['Sharma', 'Kumar', 'Singh', 'Patel', 'Gupta', 'Reddy', 'Nair', 'Iyer', 'Verma', 'Yadav', 'Mehta', 'Joshi', 'Desai', 'Shah', 'Bhat', 'Rao', 'Kapoor', 'Malhotra', 'Choudhary', 'Menon'];
const RISK_FACTORS_POOL = [
  'velocity_spike', 'new_beneficiary', 'high_value_transaction', 'cross_border_transfer',
  'sanctioned_country', 'mule_account_pattern', 'device_fingerprint_mismatch', 'impossible_travel',
  'login_from_tor', 'weekend_activity_spike', 'rapid_multiple_hops', 'shell_company_involved', 'crypto_exchange_link'
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

function bankForCountry(country: string) {
  const matches = FOREIGN_BANKS.filter(b => b.country === country);
  return matches.length ? rand(matches) : rand(FOREIGN_BANKS);
}

function pickRiskFactors(category: string, pathHasSanctioned: boolean, hasCrypto: boolean): string[] {
  const factors = new Set<string>();
  factors.add(rand(RISK_FACTORS_POOL));
  if (category === 'mule_transfer') { factors.add('mule_account_pattern'); factors.add('rapid_multiple_hops'); }
  if (category === 'account_takeover') { factors.add('device_fingerprint_mismatch'); factors.add('impossible_travel'); }
  if (category === 'card_fraud') { factors.add('high_value_transaction'); factors.add('velocity_spike'); }
  if (category === 'phishing') { factors.add('new_beneficiary'); factors.add('login_from_tor'); }
  if (category === 'velocity') { factors.add('velocity_spike'); factors.add('weekend_activity_spike'); }
  if (pathHasSanctioned) factors.add('sanctioned_country');
  if (hasCrypto) factors.add('crypto_exchange_link');
  factors.add('cross_border_transfer');
  return Array.from(factors);
}

function computeRiskScore(category: string, factors: string[], pathHasSanctioned: boolean): number {
  const base: Record<string, number> = { account_takeover: 78, mule_transfer: 85, card_fraud: 72, phishing: 68, insider: 60, identity_theft: 75, velocity: 70 };
  let score = (base[category] || 65) + factors.length * 3;
  if (pathHasSanctioned) score += 10;
  return Math.min(99, Math.max(30, score + randInt(-8, 8)));
}

export function generateMockCase(index = 0): FraudCase {
  const now = new Date();
  const secondsAgo = randInt(0, 3600 * 24 * 30);
  const createdAt = new Date(now.getTime() - secondsAgo * 1000);
  const month = String(createdAt.getMonth() + 1).padStart(2, '0');
  const caseRef = `FC-${createdAt.getFullYear()}-${month}-${String(index + 1).padStart(5, '0')}`;

  const category = rand(CATEGORIES);
  const originCity = rand(INDIAN_CITIES);
  const sourceBank = rand(INDIAN_BANKS);
  const holderName = generateName();
  const amountBase = randInt(50000, 2500000);

  const firstHop = rand(FIRST_HOP_DESTINATIONS);
  const intermediate = rand(INTERMEDIATE_NODES);
  const final = rand(FINAL_DESTINATIONS);
  const hasCrypto = Math.random() < 0.15;
  const pathHasSanctioned = intermediate.sanctioned || firstHop.sanctioned || final.country === 'Russia';

  const riskFactors = pickRiskFactors(category, pathHasSanctioned, hasCrypto);
  const riskScore = computeRiskScore(category, riskFactors, pathHasSanctioned);

  const hops: FraudHop[] = [
    {
      id: 1, fraudCaseId: index, hopNumber: 1, hopType: 'origin', nodeName: `${originCity.city}, India`, country: 'India', city: originCity.city,
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
      id: 2, fraudCaseId: index, hopNumber: 2, hopType: 'intermediate', nodeName: `${firstHop.city}, ${firstHop.country}`,
      country: firstHop.country, city: firstHop.city,
      lat: firstHop.lat + (Math.random() - 0.5) * 0.05, lon: firstHop.lon + (Math.random() - 0.5) * 0.05,
      entityType: 'bank_account', entityValue: maskAccount(randInt(1000000000, 9999999999)),
      institution: bankForCountry(firstHop.country).name, swiftBic: bankForCountry(firstHop.country).swift,
      amount: Math.round(amountBase * 0.98),
      currency: firstHop.country === 'UAE' ? 'AED' : firstHop.country === 'UK' ? 'GBP' : firstHop.country === 'Singapore' ? 'SGD' : 'USD',
      timestamp: new Date(createdAt.getTime() + randInt(60000, 3600000)).toISOString(),
      confidence: randInt(70, 95), isSanctioned: firstHop.sanctioned,
      evidenceJson: { swiftRef: `SWIFT${randInt(100000, 999999)}`, clearingTime: 'T+0' }
    },
    {
      id: 3, fraudCaseId: index, hopNumber: 3, hopType: 'intermediate', nodeName: `${intermediate.city}, ${intermediate.country}`,
      country: intermediate.country, city: intermediate.city,
      lat: intermediate.lat + (Math.random() - 0.5) * 0.05, lon: intermediate.lon + (Math.random() - 0.5) * 0.05,
      entityType: intermediate.type === 'shell' ? 'shell_company' : 'bank_account',
      entityValue: intermediate.type === 'shell' ? `SHELL-${randInt(1000, 9999)}` : maskAccount(randInt(1000000000, 9999999999)),
      institution: intermediate.type === 'shell' ? 'Offshore Holdings Ltd' : bankForCountry(intermediate.country).name,
      swiftBic: intermediate.type === 'shell' ? undefined : bankForCountry(intermediate.country).swift,
      amount: Math.round(amountBase * 0.95), currency: 'USD',
      timestamp: new Date(createdAt.getTime() + randInt(7200000, 86400000)).toISOString(),
      confidence: randInt(55, 88), isSanctioned: intermediate.sanctioned,
      evidenceJson: { companyReg: `REG-${randInt(100000, 999999)}`, beneficialOwner: 'Undisclosed' }
    }
  ];

  if (hasCrypto) {
    const exchange = rand(CRYPTO_EXCHANGES);
    hops.push({
      id: 4, fraudCaseId: index, hopNumber: 4, hopType: 'exchange', nodeName: `${exchange.name}, ${exchange.country}`,
      country: exchange.country, city: exchange.country, lat: 0, lon: 0,
      entityType: 'crypto_exchange', entityValue: `WALLET-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      institution: exchange.name, amount: Math.round(amountBase * 0.92), currency: 'USDT',
      timestamp: new Date(createdAt.getTime() + randInt(90000000, 172800000)).toISOString(),
      confidence: randInt(50, 80), isSanctioned: false,
      evidenceJson: { chain: 'TRC-20', confirmations: randInt(6, 30) }
    });
  }

  hops.push({
    id: hops.length + 1, fraudCaseId: index, hopNumber: hops.length + 1, hopType: 'destination', nodeName: `${final.city}, ${final.country}`,
    country: final.country, city: final.city,
    lat: final.lat + (Math.random() - 0.5) * 0.05, lon: final.lon + (Math.random() - 0.5) * 0.05,
    entityType: 'bank_account', entityValue: maskAccount(randInt(1000000000, 9999999999)),
    institution: bankForCountry(final.country).name, swiftBic: bankForCountry(final.country).swift,
    amount: Math.round(amountBase * (hasCrypto ? 0.88 : 0.92)),
    currency: final.country === 'UK' ? 'GBP' : final.country === 'China' ? 'CNY' : 'USD',
    timestamp: new Date(createdAt.getTime() + randInt(100000000, 259200000)).toISOString(),
    confidence: randInt(60, 90), isSanctioned: final.country === 'Russia',
    evidenceJson: { finalClearing: 'Completed', localReference: `REF-${randInt(100000, 999999)}` }
  });

  const summary = `${category.replace(/_/g, ' ')} case: INR ${amountBase.toLocaleString('en-IN')} moved from ${originCity.city} through ${firstHop.country}${intermediate.type === 'shell' ? ' via a shell entity in ' + intermediate.country : ''} to ${final.country}.`;

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
    countryRiskTags: [firstHop.country, intermediate.country, final.country].filter((v, i, a) => a.indexOf(v) === i),
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
        bankName: bankForCountry(firstHop.country).name, branch: `${firstHop.city} Branch`,
        maskedAccount: maskAccount(randInt(1000000000, 9999999999)),
        swiftBic: bankForCountry(firstHop.country).swift, country: firstHop.country,
        riskFlags: ['recently_opened', 'rapid_turnover']
      },
      {
        id: 3, fraudCaseId: index + 1, accountType: 'beneficiary', holderName: generateName(),
        bankName: bankForCountry(final.country).name, branch: `${final.city} Branch`,
        maskedAccount: maskAccount(randInt(1000000000, 9999999999)),
        swiftBic: bankForCountry(final.country).swift, country: final.country,
        riskFlags: pathHasSanctioned ? ['sanctioned_jurisdiction', 'beneficial_owner_hidden'] : ['beneficial_owner_hidden']
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

export interface FlaggedPayee {
  id: string;
  name: string;
  upiId?: string;
  accountNumber?: string;
  phone?: string;
  reason: string;
  source: string;
  severity: 'high' | 'medium';
}

const MOCK_DB: FlaggedPayee[] = [
  {
    id: 'fp-1',
    name: 'M/s. Quick Rich Scheme',
    upiId: 'quickrich@upi',
    reason: 'Reported 1,200+ times for Ponzi-style investment fraud. Promises guaranteed 50% monthly returns.',
    source: 'National Cyber Crime Reporting Portal',
    severity: 'high',
  },
  {
    id: 'fp-2',
    name: 'Lucky Lottery Ltd',
    phone: '9876543210',
    reason: 'Fake lottery scam. Victims asked to pay "processing fees" to claim non-existent prizes.',
    source: 'RBI Fraud Monitoring Cell',
    severity: 'high',
  },
  {
    id: 'fp-3',
    name: 'CryptoMax Exchange',
    upiId: 'cryptomax@upi',
    reason: 'Unregulated crypto platform. Multiple complaints of withdrawal blocking.',
    source: 'SEBI Watchlist',
    severity: 'medium',
  },
  {
    id: 'fp-4',
    name: 'Instant Loan App Pro',
    phone: '9123456789',
    reason: 'Predatory lending app with harassment tactics. Blacklisted by MeitY.',
    source: 'Ministry of Electronics and IT',
    severity: 'high',
  },
  {
    id: 'fp-5',
    name: 'TRAI KYC Update Center',
    upiId: 'traikyc@upi',
    reason: 'Impersonates TRAI officials. Threatens SIM disconnection to extort money.',
    source: 'TRAI Consumer Portal',
    severity: 'high',
  },
];

export function checkPayee(name: string, upiId?: string, phone?: string): FlaggedPayee | null {
  const query = name.trim().toLowerCase();
  return (
    MOCK_DB.find((p) => {
      if (p.name.toLowerCase().includes(query) || query.includes(p.name.toLowerCase())) return true;
      if (upiId && p.upiId && p.upiId.toLowerCase() === upiId.toLowerCase()) return true;
      if (phone && p.phone && p.phone === phone.replace(/\D/g, '')) return true;
      return false;
    }) || null
  );
}

export function getAllFlaggedPayees(): FlaggedPayee[] {
  return MOCK_DB;
}

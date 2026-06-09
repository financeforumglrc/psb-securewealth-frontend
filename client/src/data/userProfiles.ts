import type { Asset, Goal, Transaction, UserProfile } from '../types';
import { useWealthStore } from '../store/wealthStore';

export interface DemoAccount {
  id: string;
  email: string;
  password: string;
  profile: UserProfile;
  assets: Asset[];
  goals: Goal[];
  transactions: Transaction[];
  tagline: string;
  netWorth: number;
  avatar: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'deepanshu-sharma',
    email: 'deepanshu.sharma@psbsecurewealth.com',
    password: 'Deepanshu@123',
    tagline: 'Ultra HNI · Portfolio: ₹5.24 Cr',
    netWorth: 52400000,
    avatar: 'DS',
    profile: {
      name: 'Deepanshu Sharma',
      riskProfile: 'Aggressive',
      taxBracket: 30,
      monthlyIncome: 850000,
      monthlyExpenses: 320000,
      monthlySavings: 530000,
    },
    assets: [
      { id: 'ds-1', name: 'SBI Privilege Savings', type: 'bank', value: 4500000, liquidity: 'high' },
      { id: 'ds-2', name: 'HDFC Premier Banking', type: 'bank', value: 3200000, liquidity: 'high' },
      { id: 'ds-3', name: 'Axis Bluechip Direct', type: 'mutualFund', value: 8200000, liquidity: 'medium', returns: 16.2 },
      { id: 'ds-4', name: 'Nifty 50 Index Fund', type: 'stock', value: 6500000, liquidity: 'high', returns: 13.8 },
      { id: 'ds-5', name: 'Physical Gold & SGBs', type: 'gold', value: 4200000, liquidity: 'medium' },
      { id: 'ds-6', name: 'Gurgaon Penthouse', type: 'property', value: 18500000, liquidity: 'low' },
      { id: 'ds-7', name: 'BMW X7 xDrive40i', type: 'vehicle', value: 12000000, liquidity: 'low' },
      { id: 'ds-8', name: 'Crypto Portfolio', type: 'other', value: 1800000, liquidity: 'high' },
    ],
    goals: [
      { id: 'ds-g1', name: 'Second Home in Goa', type: 'home', targetAmount: 8000000, currentAmount: 3200000, deadline: '2028-12-31' },
      { id: 'ds-g2', name: 'Child Ivy League Fund', type: 'education', targetAmount: 2500000, currentAmount: 1800000, deadline: '2030-06-30' },
      { id: 'ds-g3', name: 'Retirement Corpus', type: 'retirement', targetAmount: 15000000, currentAmount: 6200000, deadline: '2035-03-15' },
      { id: 'ds-g4', name: 'Europe World Tour', type: 'travel', targetAmount: 1500000, currentAmount: 800000, deadline: '2027-01-31' },
    ],
    transactions: [
      { id: 'ds-tx1', date: '2026-06-01', description: 'Salary Credit — Deloitte Consulting', category: 'Income', amount: 850000, type: 'credit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'ds-tx2', date: '2026-06-02', description: 'Equity SIP — Axis Bluechip', category: 'Investment', amount: 150000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'ds-tx3', date: '2026-06-03', description: 'Apple India — MacBook Pro M3', category: 'Shopping', amount: 280000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'ds-tx4', date: '2026-06-04', description: 'Zomato Dining — Indian Accent', category: 'Food', amount: 18500, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'ds-tx5', date: '2026-06-05', description: 'CRED Rent Payment', category: 'Housing', amount: 125000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'ds-tx6', date: '2026-06-05', description: 'Blocked: ₹5,00,000 to unknown UPI', category: 'Transfer', amount: 500000, type: 'debit', status: 'BLOCKED', riskLevel: 'HIGH', score: 88, signals: { newDevice: true, rushedAction: true, unusualAmount: true, otpRetries: false, firstTimeInvest: false, abnormalBehavior: true }, decision: { level: 'HIGH', action: 'BLOCK', delay: 300, message: 'High-value UPI to unverified payee blocked for your safety.', referenceId: 'AUD-DS8821' } },
    ],
  },

  {
    id: 'mrigesh-mohanty',
    email: 'mrigesh.mohanty@psbsecurewealth.com',
    password: 'Mrigesh@123',
    tagline: 'Tech Lead · Portfolio: ₹1.84 Cr',
    netWorth: 18400000,
    avatar: 'MM',
    profile: {
      name: 'Mrigesh Mohanty',
      riskProfile: 'Moderate',
      taxBracket: 30,
      monthlyIncome: 280000,
      monthlyExpenses: 145000,
      monthlySavings: 135000,
    },
    assets: [
      { id: 'mm-1', name: 'ICICI Salary Account', type: 'bank', value: 1850000, liquidity: 'high' },
      { id: 'mm-2', name: 'Kotak Savings', type: 'bank', value: 950000, liquidity: 'high' },
      { id: 'mm-3', name: 'PPF + NPS Combo', type: 'mutualFund', value: 4200000, liquidity: 'low', returns: 8.1 },
      { id: 'mm-4', name: 'TCS + Infosys Shares', type: 'stock', value: 2800000, liquidity: 'high', returns: 11.5 },
      { id: 'mm-5', name: 'Digital Gold (SafeGold)', type: 'gold', value: 650000, liquidity: 'high' },
      { id: 'mm-6', name: 'Bhubaneswar 3BHK', type: 'property', value: 6800000, liquidity: 'low' },
      { id: 'mm-7', name: 'Tata Nexon EV', type: 'vehicle', value: 1400000, liquidity: 'low' },
    ],
    goals: [
      { id: 'mm-g1', name: 'Wedding Fund', type: 'wedding', targetAmount: 2500000, currentAmount: 1200000, deadline: '2027-02-28' },
      { id: 'mm-g2', name: 'Startup Seed Fund', type: 'other', targetAmount: 5000000, currentAmount: 800000, deadline: '2029-12-31' },
      { id: 'mm-g3', name: 'Emergency Fund', type: 'emergency', targetAmount: 900000, currentAmount: 600000, deadline: '2026-12-31' },
    ],
    transactions: [
      { id: 'mm-tx1', date: '2026-06-01', description: 'Salary Credit — Google India', category: 'Income', amount: 280000, type: 'credit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'mm-tx2', date: '2026-06-02', description: 'Zerodha — Nifty Bees SIP', category: 'Investment', amount: 50000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'mm-tx3', date: '2026-06-03', description: 'Swiggy — Weekend Treat', category: 'Food', amount: 3200, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'mm-tx4', date: '2026-06-04', description: 'Amazon — Kindle + Books', category: 'Shopping', amount: 18500, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'mm-tx5', date: '2026-06-05', description: 'HDFC Home Loan EMI', category: 'Housing', amount: 42000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
    ],
  },

  {
    id: 'rikshita-barua',
    email: 'rikshita.barua@psbsecurewealth.com',
    password: 'Rikshita@123',
    tagline: 'Marketing Strategist · Portfolio: ₹96.5L',
    netWorth: 9650000,
    avatar: 'RB',
    profile: {
      name: 'Rikshita Barua',
      riskProfile: 'Moderate',
      taxBracket: 20,
      monthlyIncome: 125000,
      monthlyExpenses: 82000,
      monthlySavings: 43000,
    },
    assets: [
      { id: 'rb-1', name: 'Axis Savings Pro', type: 'bank', value: 850000, liquidity: 'high' },
      { id: 'rb-2', name: 'Sukanya Samriddhi Yojana', type: 'bank', value: 450000, liquidity: 'low' },
      { id: 'rb-3', name: 'SBI Small Cap Fund', type: 'mutualFund', value: 1800000, liquidity: 'medium', returns: 18.5 },
      { id: 'rb-4', name: 'Adani Ports + DMart', type: 'stock', value: 1200000, liquidity: 'high', returns: 14.2 },
      { id: 'rb-5', name: 'Family Gold Jewellery', type: 'gold', value: 1800000, liquidity: 'medium' },
      { id: 'rb-6', name: 'Guwahati Apartment', type: 'property', value: 2800000, liquidity: 'low' },
      { id: 'rb-7', name: 'Hyundai Verna', type: 'vehicle', value: 850000, liquidity: 'low' },
    ],
    goals: [
      { id: 'rb-g1', name: 'MBA — IIM Ahmedabad', type: 'education', targetAmount: 3500000, currentAmount: 950000, deadline: '2028-06-30' },
      { id: 'rb-g2', name: 'Europe Solo Trip', type: 'travel', targetAmount: 800000, currentAmount: 250000, deadline: '2027-12-31' },
      { id: 'rb-g3', name: 'Parents Medical Corpus', type: 'emergency', targetAmount: 500000, currentAmount: 200000, deadline: '2026-12-31' },
    ],
    transactions: [
      { id: 'rb-tx1', date: '2026-06-01', description: 'Salary Credit — Unilever', category: 'Income', amount: 125000, type: 'credit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'rb-tx2', date: '2026-06-02', description: 'Nykaa — Skincare Haul', category: 'Shopping', amount: 18500, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'rb-tx3', date: '2026-06-03', description: 'Cred — Phone Bill + WiFi', category: 'Utilities', amount: 4200, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'rb-tx4', date: '2026-06-04', description: 'Zomato — Office Lunch', category: 'Food', amount: 650, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'rb-tx5', date: '2026-06-05', description: 'Mutual Fund SIP', category: 'Investment', amount: 25000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
    ],
  },

  {
    id: 'ishita-anand',
    email: 'ishita.anand@psbsecurewealth.com',
    password: 'Ishita@123',
    tagline: 'Business Owner · Portfolio: ₹2.45 Cr',
    netWorth: 24500000,
    avatar: 'IA',
    profile: {
      name: 'Ishita Anand',
      riskProfile: 'Aggressive',
      taxBracket: 30,
      monthlyIncome: 420000,
      monthlyExpenses: 195000,
      monthlySavings: 225000,
    },
    assets: [
      { id: 'ia-1', name: 'Current Account — Anand Textiles', type: 'bank', value: 3200000, liquidity: 'high' },
      { id: 'ia-2', name: 'Fixed Deposit Ladder', type: 'bank', value: 2800000, liquidity: 'medium' },
      { id: 'ia-3', name: 'Equity Portfolio (Direct)', type: 'stock', value: 5200000, liquidity: 'high', returns: 19.2 },
      { id: 'ia-4', name: 'International Mutual Funds', type: 'mutualFund', value: 3800000, liquidity: 'medium', returns: 12.4 },
      { id: 'ia-5', name: 'Sovereign Gold Bonds', type: 'gold', value: 2200000, liquidity: 'medium' },
      { id: 'ia-6', name: 'Commercial Shop — Lajpat Nagar', type: 'property', value: 5500000, liquidity: 'low' },
      { id: 'ia-7', name: 'Mercedes C-Class', type: 'vehicle', value: 1800000, liquidity: 'low' },
    ],
    goals: [
      { id: 'ia-g1', name: 'Factory Expansion', type: 'other', targetAmount: 10000000, currentAmount: 2800000, deadline: '2029-03-31' },
      { id: 'ia-g2', name: 'Daughter Education (US)', type: 'education', targetAmount: 5000000, currentAmount: 1500000, deadline: '2031-06-30' },
      { id: 'ia-g3', name: 'Retirement Villa', type: 'home', targetAmount: 8000000, currentAmount: 2200000, deadline: '2035-12-31' },
    ],
    transactions: [
      { id: 'ia-tx1', date: '2026-06-01', description: 'Business Revenue — Anand Textiles', category: 'Income', amount: 420000, type: 'credit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'ia-tx2', date: '2026-06-02', description: 'Raw Material Purchase', category: 'Business', amount: 185000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'ia-tx3', date: '2026-06-03', description: 'Staff Salaries', category: 'Business', amount: 125000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'ia-tx4', date: '2026-06-04', description: 'GST Payment', category: 'Tax', amount: 85000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'ia-tx5', date: '2026-06-05', description: 'NSE Stock Purchase — HDFC Bank', category: 'Investment', amount: 250000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
    ],
  },

  {
    id: 'tripti-jain',
    email: 'tripti.jain@psbsecurewealth.com',
    password: 'Tripti@123',
    tagline: 'Cardiologist · Portfolio: ₹1.22 Cr',
    netWorth: 12200000,
    avatar: 'TJ',
    profile: {
      name: 'Dr. Tripti Jain',
      riskProfile: 'Conservative',
      taxBracket: 30,
      monthlyIncome: 320000,
      monthlyExpenses: 155000,
      monthlySavings: 165000,
    },
    assets: [
      { id: 'tj-1', name: 'Salary Account — AIIMS', type: 'bank', value: 1200000, liquidity: 'high' },
      { id: 'tj-2', name: 'Emergency Liquid Fund', type: 'bank', value: 800000, liquidity: 'high' },
      { id: 'tj-3', name: 'PPF (15-year)', type: 'bank', value: 2200000, liquidity: 'low' },
      { id: 'tj-4', name: 'Debt Mutual Funds', type: 'mutualFund', value: 2800000, liquidity: 'medium', returns: 7.8 },
      { id: 'tj-5', name: 'Bluechip Stocks (Small qty)', type: 'stock', value: 950000, liquidity: 'high', returns: 10.2 },
      { id: 'tj-6', name: 'Gold ETF', type: 'gold', value: 650000, liquidity: 'high' },
      { id: 'tj-7', name: 'Jaipur Family Home', type: 'property', value: 2800000, liquidity: 'low' },
      { id: 'tj-8', name: 'Honda City', type: 'vehicle', value: 850000, liquidity: 'low' },
    ],
    goals: [
      { id: 'tj-g1', name: 'Own Clinic Setup', type: 'other', targetAmount: 3500000, currentAmount: 1100000, deadline: '2028-12-31' },
      { id: 'tj-g2', name: 'Child Education Fund', type: 'education', targetAmount: 2500000, currentAmount: 800000, deadline: '2030-06-30' },
      { id: 'tj-g3', name: 'Medical Equipment', type: 'other', targetAmount: 1500000, currentAmount: 400000, deadline: '2027-06-30' },
    ],
    transactions: [
      { id: 'tj-tx1', date: '2026-06-01', description: 'AIIMS Salary + Private Practice', category: 'Income', amount: 320000, type: 'credit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'tj-tx2', date: '2026-06-02', description: 'Medical Journal Subscriptions', category: 'Education', amount: 18500, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'tj-tx3', date: '2026-06-03', description: 'Pharmacy — Med Equipment', category: 'Business', amount: 45000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'tj-tx4', date: '2026-06-04', description: 'Apollo Pharmacy', category: 'Health', amount: 8200, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'tj-tx5', date: '2026-06-05', description: 'PPF Contribution', category: 'Investment', amount: 125000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
    ],
  },

  {
    id: 'kunal-saxena',
    email: 'kunal.saxena@psbsecurewealth.com',
    password: 'Kunal@123',
    tagline: 'Early Investor · Portfolio: ₹78.5L',
    netWorth: 7850000,
    avatar: 'KS',
    profile: {
      name: 'Kunal Saxena',
      riskProfile: 'Aggressive',
      taxBracket: 20,
      monthlyIncome: 95000,
      monthlyExpenses: 62000,
      monthlySavings: 33000,
    },
    assets: [
      { id: 'ks-1', name: 'HDFC Savings', type: 'bank', value: 350000, liquidity: 'high' },
      { id: 'ks-2', name: 'Emergency Fund', type: 'bank', value: 150000, liquidity: 'high' },
      { id: 'ks-3', name: 'Small Cap + Mid Cap SIPs', type: 'mutualFund', value: 2200000, liquidity: 'medium', returns: 21.4 },
      { id: 'ks-4', name: 'Growth Stocks (Zomato, Paytm)', type: 'stock', value: 1800000, liquidity: 'high', returns: 15.8 },
      { id: 'ks-5', name: 'Digital Gold', type: 'gold', value: 250000, liquidity: 'high' },
      { id: 'ks-6', name: 'Noida Studio Apartment', type: 'property', value: 2500000, liquidity: 'low' },
      { id: 'ks-7', name: 'Maruti Swift', type: 'vehicle', value: 600000, liquidity: 'low' },
    ],
    goals: [
      { id: 'ks-g1', name: 'FIRE by 40', type: 'retirement', targetAmount: 5000000, currentAmount: 1200000, deadline: '2035-01-01' },
      { id: 'ks-g2', name: 'MBA Finance', type: 'education', targetAmount: 2500000, currentAmount: 450000, deadline: '2028-06-30' },
      { id: 'ks-g3', name: 'Crypto Diversification', type: 'other', targetAmount: 500000, currentAmount: 80000, deadline: '2027-12-31' },
    ],
    transactions: [
      { id: 'ks-tx1', date: '2026-06-01', description: 'Salary Credit — Zerodha', category: 'Income', amount: 95000, type: 'credit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'ks-tx2', date: '2026-06-02', description: 'Groww — Small Cap SIP', category: 'Investment', amount: 15000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'ks-tx3', date: '2026-06-03', description: 'Blinkit — Grocery', category: 'Food', amount: 4200, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'ks-tx4', date: '2026-06-04', description: 'BookMyShow — Movies', category: 'Entertainment', amount: 1800, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
      { id: 'ks-tx5', date: '2026-06-05', description: 'IPO Allotment — Ola Electric', category: 'Income', amount: 8500, type: 'credit', status: 'ALLOWED', riskLevel: 'LOW' },
    ],
  },
];

export function loadDemoAccount(accountId: string) {
  const account = DEMO_ACCOUNTS.find((a) => a.id === accountId);
  if (!account) return;

  const monthlyExp = account.profile.monthlyExpenses;

  useWealthStore.setState({
    user: account.profile,
    assets: account.assets,
    goals: account.goals,
    transactions: account.transactions,
    bills: [
      { id: 'bill-1', name: 'House Rent / EMI', category: 'Housing', amount: Math.round(monthlyExp * 0.35), dueDay: 1, icon: 'fa-house', color: 'bg-rose-500', status: 'upcoming', isRecurring: true, frequency: 'monthly', autoDetected: false, history: [Math.round(monthlyExp * 0.35), Math.round(monthlyExp * 0.35)] },
      { id: 'bill-2', name: 'Electricity & Utilities', category: 'Utilities', amount: Math.round(monthlyExp * 0.08), dueDay: 15, icon: 'fa-bolt', color: 'bg-amber-500', status: 'upcoming', isRecurring: true, frequency: 'monthly', autoDetected: true, history: [Math.round(monthlyExp * 0.07), Math.round(monthlyExp * 0.08), Math.round(monthlyExp * 0.075)] },
      { id: 'bill-3', name: 'Monthly SIPs', category: 'Investment', amount: Math.round(account.profile.monthlySavings * 0.4), dueDay: 5, icon: 'fa-chart-line', color: 'bg-emerald-500', status: 'upcoming', isRecurring: true, frequency: 'monthly', autoDetected: false, history: [Math.round(account.profile.monthlySavings * 0.4), Math.round(account.profile.monthlySavings * 0.4)] },
      { id: 'bill-4', name: 'Phone & Internet', category: 'Utilities', amount: 1200, dueDay: 20, icon: 'fa-wifi', color: 'bg-blue-500', status: 'upcoming', isRecurring: true, frequency: 'monthly', autoDetected: false, history: [1200, 1200] },
    ],
  });
}

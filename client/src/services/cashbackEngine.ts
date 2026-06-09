export interface CashbackRule {
  merchant: string;
  category: 'grocery' | 'food' | 'entertainment' | 'utility' | 'shopping' | 'p2p';
  baseRate: number; // %
  fundedBy: string;
  fixedAmount?: number;
}

export const CASHBACK_RULES: CashbackRule[] = [
  { merchant: 'Swiggy', category: 'food', baseRate: 2, fundedBy: 'Swiggy (merchant commission)' },
  { merchant: 'Zomato', category: 'food', baseRate: 1.5, fundedBy: 'Zomato (merchant commission)' },
  { merchant: 'Amazon', category: 'shopping', baseRate: 3, fundedBy: 'Amazon (UPI promotion budget)' },
  { merchant: 'Flipkart', category: 'shopping', baseRate: 2.5, fundedBy: 'Flipkart (merchant commission)' },
  { merchant: 'BigBasket', category: 'grocery', baseRate: 2, fundedBy: 'BigBasket (merchant commission)' },
  { merchant: 'Electricity Bill', category: 'utility', baseRate: 0, fixedAmount: 5, fundedBy: 'Bank MDR savings vs card' },
  { merchant: 'Water Bill', category: 'utility', baseRate: 0, fixedAmount: 3, fundedBy: 'Bank MDR savings vs card' },
  { merchant: 'Mobile Recharge', category: 'utility', baseRate: 1, fundedBy: 'Operator commission' },
  { merchant: 'Netflix', category: 'entertainment', baseRate: 1, fundedBy: 'Netflix (partner promotion)' },
  { merchant: 'BookMyShow', category: 'entertainment', baseRate: 1.5, fundedBy: 'BookMyShow (merchant commission)' },
];

export interface PaymentTx {
  id: string;
  amount: number;
  payee: string;
  merchant: string;
  category: CashbackRule['category'];
  date: string;
  status: 'success' | 'failed';
  cashbackEarned: number;
  streakBonus: number;
  fundedBy: string;
}

export interface CashbackResult {
  total: number;
  base: number;
  streakBonus: number;
  utilityBonus: number;
  fundedBy: string;
}

export function computeCashback(opts: {
  amount: number;
  merchant: string;
  streakDays?: number;
  isUtility?: boolean;
  isP2P?: boolean;
}): CashbackResult {
  const { amount, merchant, streakDays = 0, isUtility = false, isP2P = false } = opts;

  // P2P gets no cashback
  if (isP2P) {
    return { total: 0, base: 0, streakBonus: 0, utilityBonus: 0, fundedBy: 'No cashback for P2P transfers' };
  }

  const merchantInfo = getMerchantByUpi(merchant);
  const rule = CASHBACK_RULES.find((r) => r.merchant === merchantInfo.name) ||
    CASHBACK_RULES.find((r) => r.category === merchantInfo.category);

  let base = 0;
  let fundedBy = 'No offer available';

  if (rule) {
    if (rule.fixedAmount) {
      base = rule.fixedAmount;
    } else {
      base = Math.round((amount * rule.baseRate) / 100);
    }
    fundedBy = rule.fundedBy;
  }

  // Green action bonus for utility bills
  let utilityBonus = 0;
  if (isUtility && !rule) {
    utilityBonus = Math.round(amount * 0.005); // 0.5% for utility
    fundedBy = 'Bank ESG budget (operational savings)';
  }

  // Streak multiplier: max 5% extra
  const streakMultiplier = Math.min(streakDays * 0.001, 0.05);
  const streakBonus = Math.round(base * streakMultiplier);

  return {
    total: base + streakBonus + utilityBonus,
    base,
    streakBonus,
    utilityBonus,
    fundedBy,
  };
}

export function getMerchantByUpi(upiId: string): { name: string; category: CashbackRule['category'] } {
  const lower = upiId.toLowerCase();
  if (lower.includes('swiggy')) return { name: 'Swiggy', category: 'food' };
  if (lower.includes('zomato')) return { name: 'Zomato', category: 'food' };
  if (lower.includes('amazon')) return { name: 'Amazon', category: 'shopping' };
  if (lower.includes('flipkart')) return { name: 'Flipkart', category: 'shopping' };
  if (lower.includes('bigbasket')) return { name: 'BigBasket', category: 'grocery' };
  if (lower.includes('netflix')) return { name: 'Netflix', category: 'entertainment' };
  if (lower.includes('bookmyshow')) return { name: 'BookMyShow', category: 'entertainment' };
  if (lower.includes('electricity') || lower.includes('bill') || lower.includes('utility')) return { name: 'Electricity Bill', category: 'utility' };
  if (lower.includes('recharge') || lower.includes('jio') || lower.includes('airtel')) return { name: 'Mobile Recharge', category: 'utility' };
  return { name: upiId.split('@')[0] || 'Unknown', category: 'p2p' };
}

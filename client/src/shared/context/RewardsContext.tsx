import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import { loadStreak, recordLogin } from '@/shared/services/streakService';
import type { PaymentTx } from '@/shared/services/cashbackEngine';

const TX_KEY = 'sw_upi_transactions';
const CASHBACK_KEY = 'sw_cashback_balance';
const CASHBACK_HISTORY_KEY = 'sw_cashback_history';
const REFERRAL_KEY = 'sw_referral_data';

export interface CashbackEntry {
  amount: number;
  source: string;
  merchant?: string;
  date: string;
}

export interface RewardsState {
  cashbackBalance: number;
  cashbackHistory: CashbackEntry[];
  streak: ReturnType<typeof loadStreak>;
  transactions: PaymentTx[];
  referralCode: string;
  referralsCount: number;
  adCooldownUntil: number;
  roundUpEnabled: boolean;
  roundUpSavings: number;
}

type RewardsAction =
  | { type: 'ADD_CASHBACK'; amount: number; source: string; merchant?: string }
  | { type: 'REDEEM_CASHBACK' }
  | { type: 'RECORD_LOGIN' }
  | { type: 'ADD_TX'; tx: PaymentTx }
  | { type: 'ADD_REFERRAL' }
  | { type: 'SET_AD_COOLDOWN'; until: number }
  | { type: 'TOGGLE_ROUNDUP' }
  | { type: 'ADD_ROUNDUP'; amount: number }
  | { type: 'INIT'; state: RewardsState };

function loadTxs(): PaymentTx[] {
  try { return JSON.parse(localStorage.getItem(TX_KEY) || '[]'); } catch { return []; }
}
function saveTxs(txs: PaymentTx[]) { localStorage.setItem(TX_KEY, JSON.stringify(txs.slice(0, 100))); }

function loadCashback(): number {
  try { return Number(localStorage.getItem(CASHBACK_KEY) || '0'); } catch { return 0; }
}
function saveCashback(b: number) { localStorage.setItem(CASHBACK_KEY, String(b)); }

function loadHistory(): CashbackEntry[] {
  try { return JSON.parse(localStorage.getItem(CASHBACK_HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveHistory(h: CashbackEntry[]) { localStorage.setItem(CASHBACK_HISTORY_KEY, JSON.stringify(h.slice(0, 200))); }

function loadReferral() {
  try { return JSON.parse(localStorage.getItem(REFERRAL_KEY) || '{}'); } catch { return {}; }
}
function saveReferral(r: any) { localStorage.setItem(REFERRAL_KEY, JSON.stringify(r)); }

function generateReferralCode(): string {
  return 'SW' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

function rewardsReducer(state: RewardsState, action: RewardsAction): RewardsState {
  let next: RewardsState;
  switch (action.type) {
    case 'ADD_CASHBACK': {
      const newBalance = state.cashbackBalance + action.amount;
      const entry: CashbackEntry = {
        amount: action.amount,
        source: action.source,
        merchant: action.merchant,
        date: new Date().toISOString(),
      };
      next = {
        ...state,
        cashbackBalance: newBalance,
        cashbackHistory: [entry, ...state.cashbackHistory],
      };
      saveCashback(newBalance);
      saveHistory(next.cashbackHistory);
      // Log to AI Decision Log
      try {
        const logs = JSON.parse(localStorage.getItem('sw_decision_logs') || '[]');
        logs.unshift({
          timestamp: new Date().toISOString(),
          decision: `Cashback +₹${action.amount.toFixed(2)} from ${action.merchant || action.source}`,
          rationale: `Merchant/partner-funded reward. Source: ${action.source}. Zero cost to bank.`,
          confidence: 100,
        });
        localStorage.setItem('sw_decision_logs', JSON.stringify(logs.slice(0, 100)));
      } catch { /* ignore */ }
      break;
    }
    case 'REDEEM_CASHBACK': {
      if (state.cashbackBalance < 10) { next = state; break; }
      next = { ...state, cashbackBalance: 0 };
      saveCashback(0);
      break;
    }
    case 'RECORD_LOGIN':
      next = { ...state, streak: recordLogin() };
      break;
    case 'ADD_TX':
      next = { ...state, transactions: [action.tx, ...state.transactions] };
      saveTxs(next.transactions);
      break;
    case 'ADD_REFERRAL':
      next = { ...state, referralsCount: state.referralsCount + 1 };
      saveReferral({ code: state.referralCode, count: next.referralsCount });
      break;
    case 'SET_AD_COOLDOWN':
      next = { ...state, adCooldownUntil: action.until };
      break;
    case 'TOGGLE_ROUNDUP':
      next = { ...state, roundUpEnabled: !state.roundUpEnabled };
      break;
    case 'ADD_ROUNDUP':
      next = { ...state, roundUpSavings: state.roundUpSavings + action.amount };
      break;
    case 'INIT':
      next = action.state;
      break;
    default:
      next = state;
  }
  return next;
}

const RewardsContext = createContext<{
  state: RewardsState;
  dispatch: React.Dispatch<RewardsAction>;
} | null>(null);

export function RewardsProvider({ children }: { children: ReactNode }) {
  const refData = loadReferral();
  const [state, dispatch] = useReducer(rewardsReducer, {
    cashbackBalance: loadCashback(),
    cashbackHistory: loadHistory(),
    streak: loadStreak(),
    transactions: loadTxs(),
    referralCode: refData.code || generateReferralCode(),
    referralsCount: refData.count || 0,
    adCooldownUntil: 0,
    roundUpEnabled: false,
    roundUpSavings: 0,
  });

  useEffect(() => {
    // Auto-record login on mount
    const today = new Date().toISOString().split('T')[0];
    if (state.streak.lastLoginDate !== today) {
      dispatch({ type: 'RECORD_LOGIN' });
    }
  }, []);

  return (
    <RewardsContext.Provider value={{ state, dispatch }}>
      {children}
    </RewardsContext.Provider>
  );
}

export function useRewards() {
  const ctx = useContext(RewardsContext);
  if (!ctx) throw new Error('useRewards must be used within RewardsProvider');
  const { state, dispatch } = ctx;

  const addCashback = useCallback((amount: number, source: string, merchant?: string) => {
    dispatch({ type: 'ADD_CASHBACK', amount, source, merchant });
  }, [dispatch]);

  const redeemCashback = useCallback(() => {
    dispatch({ type: 'REDEEM_CASHBACK' });
  }, [dispatch]);

  return {
    cashbackBalance: state.cashbackBalance,
    cashbackHistory: state.cashbackHistory,
    streakDays: state.streak.days,
    referralCode: state.referralCode,
    pendingReferrals: state.referralsCount,
    addCashback,
    redeemCashback,
  };
}

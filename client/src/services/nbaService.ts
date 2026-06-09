export interface NBAInsight {
  id: string;
  type: 'bill' | 'savings' | 'fraud' | 'investment' | 'goal' | 'market';
  priority: number; // 1-100, fraud gets +50 boost
  title: string;
  description: string;
  actionLabel: string;
  actionType: 'accept' | 'dismiss' | 'snooze';
  icon: string;
  color: string;
  data?: Record<string, any>;
}

const INSIGHTS_KEY = 'sw_nba_insights';
const DISMISSED_KEY = 'sw_nba_dismissed';

const MOCK_INSIGHTS: NBAInsight[] = [
  {
    id: 'nba-1',
    type: 'fraud',
    priority: 95,
    title: 'Suspicious Login Blocked',
    description: 'We blocked a login attempt from an unknown device in Mumbai at 3:14 AM. Consider changing your password.',
    actionLabel: 'Review Security',
    actionType: 'accept',
    icon: 'fa-shield-halved',
    color: 'rose',
  },
  {
    id: 'nba-2',
    type: 'bill',
    priority: 60,
    title: 'Credit Card Bill Due in 2 Days',
    description: '₹12,000 due on 20th May. Pay now to avoid late fees and CIBIL impact.',
    actionLabel: 'Pay Now',
    actionType: 'accept',
    icon: 'fa-credit-card',
    color: 'amber',
  },
  {
    id: 'nba-3',
    type: 'savings',
    priority: 55,
    title: 'Uninvested Surplus Detected',
    description: 'You have ₹45,000 idle in your savings account. A ₹5,000 SIP could grow to ₹1.1Cr in 20 years.',
    actionLabel: 'Start SIP',
    actionType: 'accept',
    icon: 'fa-piggy-bank',
    color: 'emerald',
  },
  {
    id: 'nba-4',
    type: 'investment',
    priority: 50,
    title: 'NIFTY Dipped 2.3% This Week',
    description: 'Market volatility detected. Historical data shows this is a good time for a "Buy the Dip" additional SIP.',
    actionLabel: 'Buy the Dip',
    actionType: 'accept',
    icon: 'fa-chart-line',
    color: 'primary',
  },
  {
    id: 'nba-5',
    type: 'goal',
    priority: 45,
    title: 'Emergency Fund 40% Complete',
    description: 'You are 2 months ahead of schedule. Boost this goal to reach 100% by July.',
    actionLabel: 'Boost Goal',
    actionType: 'accept',
    icon: 'fa-bullseye',
    color: 'sky',
  },
  {
    id: 'nba-6',
    type: 'fraud',
    priority: 92,
    title: 'Duplicate Charge Detected',
    description: 'BigBasket charged you ₹2,400 twice on 21st April. We flagged the duplicate for reversal.',
    actionLabel: 'Dispute Charge',
    actionType: 'accept',
    icon: 'fa-triangle-exclamation',
    color: 'rose',
  },
  {
    id: 'nba-7',
    type: 'market',
    priority: 40,
    title: 'Gold/Silver Ratio Above 85',
    description: 'Your gold hedge trigger condition is met. Consider increasing gold allocation by 5%.',
    actionLabel: 'View Trigger',
    actionType: 'snooze',
    icon: 'fa-coins',
    color: 'amber',
  },
];

export function getInsights(): NBAInsight[] {
  const dismissed: string[] = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
  const stored: NBAInsight[] = JSON.parse(localStorage.getItem(INSIGHTS_KEY) || '[]');
  const base = stored.length ? stored : MOCK_INSIGHTS;
  // Apply fraud priority boost (5x visual weight in sorting)
  const withBoost = base.map((i) => ({
    ...i,
    priority: i.type === 'fraud' ? Math.min(100, i.priority + 25) : i.priority,
  }));
  return withBoost.filter((i) => !dismissed.includes(i.id)).sort((a, b) => b.priority - a.priority);
}

export function dismissInsight(id: string) {
  const dismissed: string[] = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
  if (!dismissed.includes(id)) dismissed.push(id);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
}

export function snoozeInsight(id: string) {
  const snoozed: Record<string, string> = JSON.parse(localStorage.getItem('sw_nba_snoozed') || '{}');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  snoozed[id] = tomorrow.toISOString();
  localStorage.setItem('sw_nba_snoozed', JSON.stringify(snoozed));
}

export function acceptInsight(id: string) {
  dismissInsight(id);
}

export interface NavItem {
  view: string;
  label: string;
  icon: string;
  badge?: string;
  alert?: boolean;
}

export interface NavGroup {
  id: string;
  title: string;
  colorClass: string; // text-* class for title
  items: NavItem[];
}

export const VIEW_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  'wealth-twin': 'Wealth Twin',
  'ai-recommendations': 'AI Recommendations',
  goals: 'Goal Tracker',
  portfolio: 'Portfolio',
  assets: 'Assets',
  market: 'Market Intelligence',
  forecast: 'Forecast',
  payments: 'Payments',
  transactions: 'Transactions',
  protection: 'Protection',
  'security-beast': 'Security Beast',
  privacy: 'Privacy',
  tax: 'Tax Planner',
  calculators: 'Calculators',
  bills: 'Bill Calendar',
  'credit-health': 'Credit Health',
  'loan-center': 'Loan Center',
  'recurring-payments': 'Recurring Payments',
  'account-statement': 'Account Statement',
  'audit-log': 'Audit Log',
  'innovation-lab': 'Innovation Lab',
  bhavishya: 'BHAVISHYA AI',
  family: 'Family Dashboard',
  'digital-gold': 'Digital Gold',
  subscriptions: 'Subscriptions',
  challenges: 'Challenges',
  'nri-mode': 'NRI Center',
  'business-mode': 'Business Mode',
  'kids-mode': 'Kids Mode',
  'notification-demo': 'Notifications',
  profile: 'Profile',
  accessibility: 'Accessibility',
  admin: 'Admin Panel',
};

export const TOP_NAV_LINKS: { view: string; label: string }[] = [
  { view: 'dashboard', label: 'Dashboard' },
  { view: 'payments', label: 'Payments' },
  { view: 'goals', label: 'Goals' },
  { view: 'portfolio', label: 'Portfolio' },
  { view: 'subscriptions', label: 'Subscriptions' },
  { view: 'security-beast', label: 'Security' },
  { view: 'innovation-lab', label: 'Innovation Lab' },
];

export const SIDEBAR_GROUPS: NavGroup[] = [
  {
    id: 'wealth-intelligence',
    title: 'Wealth Intelligence',
    colorClass: 'text-primary',
    items: [
      { view: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
      { view: 'bhavishya', label: 'BHAVISHYA AI', icon: 'fa-infinity', badge: 'FLAGSHIP', alert: true },
      { view: 'wealth-twin', label: 'Wealth Twin', icon: 'fa-brain' },
      { view: 'goals', label: 'Goals', icon: 'fa-bullseye' },
      { view: 'portfolio', label: 'Portfolio', icon: 'fa-layer-group' },
      { view: 'assets', label: 'Assets', icon: 'fa-gem' },
      { view: 'market', label: 'Market', icon: 'fa-globe' },
      { view: 'forecast', label: 'Forecast', icon: 'fa-chart-line' },
    ],
  },
  {
    id: 'fraud-protection',
    title: 'Fraud Protection',
    colorClass: 'text-rose-600',
    items: [
      { view: 'payments', label: 'Payments', icon: 'fa-bolt' },
      { view: 'transactions', label: 'Transactions', icon: 'fa-list' },
      { view: 'protection', label: 'Protection', icon: 'fa-shield-halved' },
      { view: 'security-beast', label: 'Security Beast', icon: 'fa-dragon' },
      { view: 'privacy', label: 'Privacy', icon: 'fa-lock' },
    ],
  },
  {
    id: 'financial-tools',
    title: 'Financial Tools',
    colorClass: 'text-blue-600',
    items: [
      { view: 'tax', label: 'Tax', icon: 'fa-file-invoice-dollar' },
      { view: 'calculators', label: 'Calculators', icon: 'fa-calculator' },
      { view: 'bills', label: 'Bill Calendar', icon: 'fa-calendar-check' },
      { view: 'credit-health', label: 'Credit Health', icon: 'fa-file-invoice' },
      { view: 'loan-center', label: 'Loan Center', icon: 'fa-file-contract' },
      { view: 'recurring-payments', label: 'Recurring', icon: 'fa-rotate' },
      { view: 'account-statement', label: 'Statement', icon: 'fa-file-invoice' },
      { view: 'audit-log', label: 'Audit Log', icon: 'fa-shield-halved' },
    ],
  },
  {
    id: 'other',
    title: 'Other Features',
    colorClass: 'text-gray-400',
    items: [
      { view: 'family', label: 'Family', icon: 'fa-people-group' },
      { view: 'digital-gold', label: 'Digital Gold', icon: 'fa-coins' },
      { view: 'subscriptions', label: 'Subscriptions', icon: 'fa-calendar-xmark' },
      { view: 'challenges', label: 'Challenges', icon: 'fa-fire' },
      { view: 'innovation-lab', label: 'Innovation Lab', icon: 'fa-flask' },
      { view: 'nri-mode', label: 'NRI Center', icon: 'fa-globe' },
      { view: 'business-mode', label: 'Business', icon: 'fa-building' },
      { view: 'kids-mode', label: 'Kids Mode', icon: 'fa-child' },
      { view: 'notification-demo', label: 'Notifications', icon: 'fa-bell' },
      { view: 'admin', label: 'Admin Panel', icon: 'fa-user-shield' },
    ],
  },
];

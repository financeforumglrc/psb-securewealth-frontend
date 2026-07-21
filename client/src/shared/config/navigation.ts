export interface NavItem {
  view: string;
  label: string;
  icon: string;
  description?: string;
  badge?: string;
  alert?: boolean;
}

export interface NavGroup {
  id: string;
  title: string;
  subtitle?: string;
  colorClass: string; // text-* class for title
  bgClass?: string; // background tint class
  items: NavItem[];
}

export interface TopNavCategory {
  id: string;
  label: string;
  icon: string;
  colorClass: string;
  description: string;
  groups: NavGroup[];
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
  'creditbridge-ai': 'CreditBridge AI',
  'loan-center': 'Loan Center',
  'loans-hub': 'Loans & Credit Hub',
  'loan-research': 'Research & Accountability',
  'loan-impact': 'MSME Impact Simulator',
  'social-collateral-loan': 'Social Collateral Loan',
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
  'business-mode': 'Khata',
  'cross-device-approval': 'Cross-Device Approval',
  'quantum-key': 'Quantum Key Exchange',
  'msme-creditbridge': 'MSME CreditBridge AI',
  'kids-mode': 'Kids Mode',
  'notification-demo': 'Notifications',
  profile: 'Profile',
  accessibility: 'Accessibility',
  admin: 'Admin Panel',
  'pitch-deck': 'Pitch Deck',
};

export const VIEW_DESCRIPTIONS: Record<string, string> = {
  dashboard: 'Your entire financial picture in one place.',
  bhavishya: 'Predictive life-cycle AI that plans your future.',
  'wealth-twin': 'Digital twin of your wealth, goals and cashflow.',
  goals: 'Set, track and achieve every financial goal.',
  portfolio: 'Stocks, mutual funds and asset allocation.',
  assets: 'Bank, property, gold and physical assets.',
  market: 'Live indices, news and global market pulse.',
  forecast: 'Scenario planning and Monte Carlo simulation.',
  payments: 'Send, request, scan and schedule payments.',
  transactions: 'Categorized history with AI insights.',
  protection: 'Fraud shields, cooling vault and insurance.',
  'security-beast': 'Threat radar, biometric guard and audit.',
  privacy: 'Consent, data controls and GDPR-style settings.',
  tax: 'Tax planner, deductions and report downloads.',
  calculators: 'EMI, SIP, FD and goal calculators.',
  bills: 'Never miss a due date with smart reminders.',
  'credit-health': 'CIBIL-style score and improvement tips.',
  'creditbridge-ai': 'Explainable, bias-audited retail & MSME credit scoring.',
  'loan-center': 'Apply, track and manage loans.',
  'loans-hub': 'One place for all loan and credit products.',
  'loan-research': 'Published research on algorithmic accountability in AI credit scoring.',
  'loan-impact': 'Estimate real-economy impact of MSME credit disbursement.',
  'social-collateral-loan': 'Community-backed lending with trust circles.',
  'recurring-payments': 'Autopay, subscriptions and standing instructions.',
  'account-statement': 'Download statements and reconcile accounts.',
  'audit-log': 'Immutable log of every security event.',
  family: 'Family wallets, allowances and shared goals.',
  'digital-gold': 'Buy, sell and gift 24K gold digitally.',
  subscriptions: 'Track and cancel recurring subscriptions.',
  challenges: 'Gamified savings and wealth challenges.',
  'nri-mode': 'NRE/NRO, remittance and FEMA tools.',
  'business-mode': 'Cash flow, surplus fund advisor and working capital health.',
  'msme-creditbridge': 'AI-powered MSME credit scoring and collateral-free loans.',
  'kids-mode': 'Safe money lessons for children.',
  'notification-demo': 'Simulate alerts and push notifications.',
  'innovation-lab': 'World-first prototypes and experiments.',
  'pitch-deck': 'Judge-facing pitch strategies and closing script.',
};

// Quick flat links for compact top-bar scenarios
export const TOP_NAV_LINKS: { view: string; label: string }[] = [
  { view: 'dashboard', label: 'Dashboard' },
  { view: 'payments', label: 'Payments' },
  { view: 'goals', label: 'Goals' },
  { view: 'portfolio', label: 'Portfolio' },
  { view: 'subscriptions', label: 'Subscriptions' },
  { view: 'security-beast', label: 'Security' },
  { view: 'innovation-lab', label: 'Innovation Lab' },
];

const wealthIntelligenceGroup: NavGroup = {
  id: 'wealth-intelligence',
  title: 'Wealth Intelligence',
  subtitle: 'Digital Wealth Intelligence Twin',
  colorClass: 'text-primary',
  bgClass: 'bg-primary/5',
  items: [
    { view: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie', description: 'Net worth, cashflow and quick actions.' },
    { view: 'bhavishya', label: 'BHAVISHYA AI', icon: 'fa-infinity', description: 'Predictive life-cycle AI engine.', badge: 'FLAGSHIP', alert: true },
    { view: 'wealth-twin', label: 'Wealth Twin', icon: 'fa-brain', description: 'Your financial DNA and simulations.' },
    { view: 'goals', label: 'Goals', icon: 'fa-bullseye', description: 'Track goals with AI coaching.' },
    { view: 'portfolio', label: 'Portfolio', icon: 'fa-layer-group', description: 'Holdings, allocation and rebalancing.' },
    { view: 'assets', label: 'Assets', icon: 'fa-gem', description: 'All physical and digital assets.' },
    { view: 'market', label: 'Market', icon: 'fa-globe', description: 'Live markets, news and movers.' },
    { view: 'forecast', label: 'Forecast', icon: 'fa-chart-line', description: 'Scenario and Monte Carlo forecasts.' },
    { view: 'wealth-3d', label: '3D Wealth City', icon: 'fa-city', description: 'Net worth as an interactive metropolis.', badge: 'NEW' },
    { view: 'wealth-ar', label: 'AR Wealth Preview', icon: 'fa-camera', description: 'Augmented reality wealth overlay.', badge: 'NEW' },
    { view: 'generational-wealth', label: 'Generational Wealth', icon: 'fa-people-roof', description: '3-generation wealth projection.', badge: 'PATENT' },
  ],
};

const fraudProtectionGroup: NavGroup = {
  id: 'fraud-protection',
  title: 'Fraud Protection',
  subtitle: 'Mandatory Wealth Protection Layer',
  colorClass: 'text-rose-600',
  bgClass: 'bg-rose-50',
  items: [
    { view: 'payments', label: 'Payments', icon: 'fa-bolt', description: 'UPI, NEFT, cards and QR payments.' },
    { view: 'transactions', label: 'Transactions', icon: 'fa-list', description: 'AI-categorized history.' },
    { view: 'protection', label: 'Protection', icon: 'fa-shield-halved', description: 'Fraud shields and insurance.' },
    { view: 'security-beast', label: 'Security Beast', icon: 'fa-dragon', description: 'Threat radar and biometrics.' },
    { view: 'coercion-detection', label: 'Coercion Detection', icon: 'fa-fingerprint', description: 'Multi-modal forced transaction detection.', badge: 'PATENT' },
    { view: 'emotion-gate', label: 'Emotion-Adaptive Gate', icon: 'fa-heart', description: 'Transaction limits adapt to emotional state.', badge: 'PATENT' },
    { view: 'risk-score', label: 'Risk Score Explainer', icon: 'fa-gauge-high', description: 'Transparent AI risk factor breakdown.', badge: 'PATENT' },
    { view: 'quantum-vault', label: 'Quantum Vault', icon: 'fa-vault', description: 'Post-quantum encrypted document storage.', badge: 'LIVE DEMO' },
    { view: 'live-fraud-simulator', label: 'Live Fraud Simulator', icon: 'fa-bug', description: 'Watch AI block real-time attacks.', badge: 'LIVE DEMO' },
    { view: 'scam-call', label: 'Scam Call Detection', icon: 'fa-phone-slash', description: 'AI detects scam calls in real-time.', badge: 'LIVE DEMO' },
    { view: 'voice-panic', label: 'Voice Panic Trigger', icon: 'fa-microphone', description: 'Say a secret word to activate duress mode.', badge: 'LIVE DEMO' },
    { view: 'privacy', label: 'Privacy', icon: 'fa-lock', description: 'Consent and data controls.' },
    { view: 'audit-log', label: 'Audit Log', icon: 'fa-clipboard-check', description: 'Immutable security ledger.' },
  ],
};

const financialToolsGroup: NavGroup = {
  id: 'financial-tools',
  title: 'Financial Tools',
  subtitle: 'Plan, calculate and optimise',
  colorClass: 'text-blue-600',
  bgClass: 'bg-blue-50',
  items: [
    { view: 'tax', label: 'Tax Planner', icon: 'fa-file-invoice-dollar', description: 'Deductions, IT returns and reports.' },
    { view: 'calculators', label: 'Calculators', icon: 'fa-calculator', description: 'EMI, SIP, FD and retirement.' },
    { view: 'bills', label: 'Bill Calendar', icon: 'fa-calendar-check', description: 'Due dates and autopay.' },
    { view: 'recurring-payments', label: 'Recurring', icon: 'fa-rotate', description: 'Standing instructions and e-mandates.' },
    { view: 'account-statement', label: 'Statement', icon: 'fa-file-invoice', description: 'Download and reconcile.' },
  ],
};

const loanHubGroup: NavGroup = {
  id: 'loans-hub',
  title: 'Loans & Credit',
  subtitle: 'Borrow, score and monitor credit',
  colorClass: 'text-emerald-600',
  bgClass: 'bg-emerald-50',
  items: [
    { view: 'loans-hub', label: 'Loans Hub', icon: 'fa-hand-holding-dollar', description: 'All loan and credit products in one place.', badge: 'NEW' },
    { view: 'creditbridge-ai', label: 'CreditBridge AI', icon: 'fa-bridge', description: 'Explainable retail & MSME credit scoring with XAI.', badge: 'FLAGSHIP' },
    { view: 'msme-creditbridge', label: 'MSME CreditBridge AI', icon: 'fa-building-columns', description: 'Collateral-free MSME loans via alternative data & XAI.', badge: 'FLAGSHIP' },
    { view: 'loan-research', label: 'Research & Accountability', icon: 'fa-book-open', description: 'Our INFINITY 2025 published research.', badge: 'PUBLISHED' },
    { view: 'loan-impact', label: 'Impact Simulator', icon: 'fa-chart-pie', description: 'Estimate MSME credit impact on jobs & GDP.' },
    { view: 'loan-center', label: 'Loan Center', icon: 'fa-file-contract', description: 'Apply and track loans.' },
    { view: 'credit-health', label: 'Credit Health', icon: 'fa-file-invoice', description: 'Score, factors and tips.' },
    { view: 'social-collateral-loan', label: 'Social Collateral', icon: 'fa-people-group', description: 'Community-backed trust-circle lending.' },
  ],
};

const lifestyleGroup: NavGroup = {
  id: 'lifestyle',
  title: 'Family & Lifestyle',
  subtitle: 'Household wealth and habits',
  colorClass: 'text-violet-600',
  bgClass: 'bg-violet-50',
  items: [
    { view: 'family', label: 'Family', icon: 'fa-people-group', description: 'Shared wallets and goals.' },
    { view: 'digital-gold', label: 'Digital Gold', icon: 'fa-coins', description: '24K gold savings and gifting.' },
    { view: 'subscriptions', label: 'Subscriptions', icon: 'fa-calendar-xmark', description: 'Track and cancel recurring bills.' },
    { view: 'challenges', label: 'Challenges', icon: 'fa-fire', description: 'Gamified savings missions.' },
    { view: 'nri-mode', label: 'NRI Center', icon: 'fa-globe', description: 'NRE/NRO and remittances.' },
    { view: 'business-mode', label: 'Khata', icon: 'fa-book-open', description: 'Cash flow, surplus advisor and working capital.', badge: 'NEW' },
    { view: 'kids-mode', label: 'Kids Mode', icon: 'fa-child', description: 'Safe money lessons.' },
    { view: 'notification-demo', label: 'Notifications', icon: 'fa-bell', description: 'Simulate smart alerts.' },
  ],
};

const innovationGroup: NavGroup = {
  id: 'innovation',
  title: 'Innovation Lab',
  subtitle: 'World-first prototypes',
  colorClass: 'text-amber-600',
  bgClass: 'bg-amber-50',
  items: [
    { view: 'innovation-lab', label: 'Innovation Lab', icon: 'fa-flask', description: 'Experimental features hub.' },
    { view: 'ai-recommendations', label: 'AI Recommendations', icon: 'fa-wand-magic-sparkles', description: 'Explainable AI suggestions.' },
    { view: 'fantasy-league', label: 'Fantasy League', icon: 'fa-trophy', description: 'Portfolio fantasy league.' },
    { view: 'boosts', label: 'Boosts', icon: 'fa-rocket', description: 'Rewards and goal accelerators.' },
    { view: 'values-alignment', label: 'Values Alignment', icon: 'fa-heart', description: 'Invest with your values.' },
    { view: 'cross-device-approval', label: 'Cross-Device Approval', icon: 'fa-mobile-screen-button', description: 'Initiate on one device, approve on another.', badge: 'LIVE DEMO' },
    { view: 'quantum-key', label: 'Quantum Key Exchange', icon: 'fa-atom', description: 'Real ML-KEM-768 post-quantum key exchange demo.', badge: 'LIVE DEMO' },
    { view: 'pitch-deck', label: 'Pitch Deck', icon: 'fa-trophy', description: 'Winning strategies & closing script.', badge: 'JUDGES' },
  ],
};

export const SIDEBAR_GROUPS: NavGroup[] = [
  wealthIntelligenceGroup,
  fraudProtectionGroup,
  financialToolsGroup,
  loanHubGroup,
  lifestyleGroup,
  innovationGroup,
];

export const MEGA_MENU: TopNavCategory[] = [
  {
    id: 'wealth',
    label: 'Wealth Intelligence',
    icon: 'fa-chart-line',
    colorClass: 'text-primary',
    description: 'Dashboards, AI, goals, portfolio and forecasts.',
    groups: [wealthIntelligenceGroup],
  },
  {
    id: 'pay-protect',
    label: 'Pay & Protect',
    icon: 'fa-shield-halved',
    colorClass: 'text-rose-600',
    description: 'Payments, transactions, fraud shields and security.',
    groups: [fraudProtectionGroup],
  },
  {
    id: 'plan',
    label: 'Plan & Tools',
    icon: 'fa-calculator',
    colorClass: 'text-blue-600',
    description: 'Tax, loans, calculators, bills and statements.',
    groups: [financialToolsGroup, loanHubGroup],
  },
  {
    id: 'life',
    label: 'Family & Lifestyle',
    icon: 'fa-people-group',
    colorClass: 'text-violet-600',
    description: 'Family, gold, subscriptions, NRI and business.',
    groups: [lifestyleGroup],
  },
  {
    id: 'innovation',
    label: 'Innovation',
    icon: 'fa-flask',
    colorClass: 'text-amber-600',
    description: 'Experiments, gamification and explainable AI.',
    groups: [innovationGroup],
  },
];

export function findGroupForView(view: string): NavGroup | undefined {
  return SIDEBAR_GROUPS.find((g) => g.items.some((i) => i.view === view));
}

export function findItemForView(view: string): NavItem | undefined {
  for (const group of SIDEBAR_GROUPS) {
    const item = group.items.find((i) => i.view === view);
    if (item) return item;
  }
  return undefined;
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, Asset, Goal, ConsentRecord, Badge, Notification, MarketData, ViewType, Transaction, FamilyMember, RecurringBill, InvestmentTrigger, CibilFactor, Challenge, KidProfile, KidTask, SpendRequest, UncategorizedTx, CategoryRule, DuplicateGroup, Subscription, NRIAccount, Remittance, NRIInvestmentRule } from '@/shared/types';
import { backendApi } from '@/shared/lib/backendApi';

interface WealthState {
  user: UserProfile;
  assets: Asset[];
  goals: Goal[];
  consents: ConsentRecord[];
  badges: Badge[];
  notifications: Notification[];
  marketData: MarketData;
  transactions: Transaction[];
  currentView: ViewType;
  isJudgeMode: boolean;
  darkMode: boolean;
  hasConsent: boolean;
  pitchModeActive: boolean;
  familyMode: boolean;
  familyMembers: FamilyMember[];
  familyDataSharing: Record<string, boolean>;
  quizResult: { name: string; score: number; date: string } | null;
  lockdownActive: boolean;
  coercedMode: boolean;
  duressModeActive: boolean;
  includeInCommunityData: boolean;
  bills: RecurringBill[];
  triggers: InvestmentTrigger[];
  cibilScore: number;
  cibilFactors: CibilFactor[];
  isAuthenticated: boolean;
  authAttempts: number;
  authLockoutUntil: number | null;
  challenges: Challenge[];
  kidProfile: KidProfile | null;
  kidTasks: KidTask[];
  spendRequests: SpendRequest[];
  uncategorizedTxs: UncategorizedTx[];
  categoryRules: CategoryRule[];
  duplicateGroups: DuplicateGroup[];
  subscriptions: Subscription[];
  language: string;
  accessibilityMode: boolean;
  nriMode: boolean;
  nriAccounts: NRIAccount[];
  remittances: Remittance[];
  nriInvestmentRules: NRIInvestmentRule[];
  preferredCurrency: string;
  exchangeRates: Record<string, number>;
  exchangeRatesLastUpdated: string;
  seniorMode: boolean;
  kycVerified: boolean;
  demoModeActive: boolean;
  demoPhase: number;
  demoPaused: boolean;
  aaFetchComplete: boolean;
  onboardingComplete: boolean;
  dashboardDensity: 'simple' | 'comprehensive';
  behavioralDeviation: number;
  isLoading: boolean;
  loginAt: number;

  setView: (view: ViewType) => void;
  setLockdownActive: (val: boolean) => void;
  setCoercedMode: (val: boolean) => void;
  setDuressModeActive: (val: boolean) => void;
  toggleDuressMode: () => void;
  toggleCommunityData: () => void;
  setPitchModeActive: (val: boolean) => void;
  toggleFamilyMode: () => void;
  toggleFamilyDataSharing: (memberId: string) => void;
  setQuizResult: (result: { name: string; score: number; date: string }) => void;
  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  addGoal: (goal: Goal) => void;
  editGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  updateGoal: (id: string, amount: number) => void;
  addConsent: (consent: ConsentRecord) => void;
  revokeConsent: (id: string) => void;
  addTransaction: (tx: Transaction) => void;
  toggleDarkMode: () => void;
  setHasConsent: (val: boolean) => void;
  markNotificationRead: (id: string) => void;
  unlockBadge: (id: string) => void;
  initJudgeMode: () => void;
  seedRealData: () => void;
  loadFromBackend: () => Promise<void>;
  toggleBillPaid: (id: string) => void;
  payBill: (id: string) => void;
  toggleTrigger: (id: string) => void;
  dismissTrigger: (id: string) => void;
  fireTrigger: (id: string) => void;
  setCibilScore: (score: number) => void;
  setIsLoading: (val: boolean) => void;
  authenticate: () => void;
  logout: () => void;
  incrementAuthAttempt: () => void;
  resetAuthLockout: () => void;
  setKidProfile: (profile: KidProfile) => void;
  toggleKidTask: (taskId: string) => void;
  addKidTask: (task: KidTask) => void;
  addSpendRequest: (req: SpendRequest) => void;
  updateSpendRequest: (id: string, status: 'approved' | 'rejected') => void;
  acceptAICategory: (id: string) => void;
  changeAICategory: (id: string, category: string) => void;
  createCategoryRule: (id: string) => void;
  resolveDuplicate: (id: string, action: 'merged' | 'kept' | 'not-duplicate') => void;
  cancelSubscription: (id: string) => void;
  pauseSubscription: (id: string) => void;
  setLanguage: (lang: string) => void;
  toggleAccessibilityMode: () => void;
  toggleNRIMode: () => void;
  setPreferredCurrency: (curr: string) => void;
  cycleCurrency: () => void;
  toggleSeniorMode: () => void;
  setKycVerified: (val: boolean) => void;
  setDemoModeActive: (val: boolean) => void;
  setDemoPhase: (phase: number) => void;
  toggleDemoPaused: () => void;
  setAAFetchComplete: (val: boolean) => void;
  setOnboardingComplete: (val: boolean) => void;
  setDashboardDensity: (density: 'simple' | 'comprehensive') => void;
  setBehavioralDeviation: (val: number) => void;
  setLoginAt: (val: number) => void;
}

const SEED_ASSETS: Asset[] = [
  { id: 'ds-1', name: 'SBI Privilege Savings', type: 'bank', value: 525000, liquidity: 'high' },
  { id: 'ds-2', name: 'Axis Bluechip Direct', type: 'mutualFund', value: 820000, liquidity: 'medium', returns: 16.2 },
  { id: 'ds-3', name: 'Nifty 50 Index Fund', type: 'stock', value: 650000, liquidity: 'high', returns: 13.8 },
  { id: 'ds-4', name: 'Physical Gold & SGBs', type: 'gold', value: 420000, liquidity: 'medium' },
  { id: 'ds-5', name: 'Gurgaon Penthouse', type: 'property', value: 18500000, liquidity: 'low' },
  { id: 'ds-6', name: 'Crypto Portfolio', type: "other", value: 180000, liquidity: 'high' },
];

const SEED_GOALS: Goal[] = [
  { id: 'ds-g1', name: 'Emergency Fund', type: 'emergency', targetAmount: 300000, currentAmount: 125000, deadline: '2026-12-31' },
  { id: 'ds-g2', name: 'New Car — Tesla Model 3', type: 'car', targetAmount: 4500000, currentAmount: 850000, deadline: '2028-06-30' },
  { id: 'ds-g3', name: 'Europe Vacation', type: 'travel', targetAmount: 800000, currentAmount: 220000, deadline: '2027-03-31' },
];

const SEED_BADGES: Badge[] = [
  { id: '1', name: 'First SIP', desc: 'Started your first SIP', icon: 'fa-piggy-bank', unlocked: true, date: '2025-01-15' },
  { id: '2', name: 'Goal Setter', desc: 'Set 3 financial goals', icon: 'fa-bullseye', unlocked: true, date: '2025-02-01' },
  { id: '3', name: 'Diversified', desc: 'Hold 5+ asset types', icon: 'fa-layer-group', unlocked: true, date: '2025-03-10' },
  { id: '4', name: 'Tax Saver', desc: 'Invest ₹1.5L in 80C', icon: 'fa-receipt', unlocked: false },
  { id: '5', name: 'Wealth Builder', desc: 'Net worth crosses ₹50L', icon: 'fa-gem', unlocked: false },
  { id: '6', name: 'Security Pro', desc: '50 days without high-risk actions', icon: 'fa-shield-halved', unlocked: false },
];

const SEED_NOTIFICATIONS: Notification[] = [
  { id: '1', icon: 'fa-shield-halved', text: 'New device login detected from Chrome on Windows', time: '2 min ago', unread: true, color: 'rose' },
  { id: '2', icon: 'fa-piggy-bank', text: 'Your SIP of ₹15,000 is due tomorrow', time: '1 hour ago', unread: true, color: 'primary' },
  { id: '3', icon: 'fa-chart-line', text: 'NIFTY crossed 25,000 — portfolio up 2.4%', time: '3 hours ago', unread: false, color: 'emerald' },
  { id: '4', icon: 'fa-triangle-exclamation', text: 'Credit card bill due in 2 days', time: '5 hours ago', unread: false, color: 'amber' },
];

const DEFAULT_MARKET: MarketData = {
  niftyPe: 23.4,
  repoRate: 6.5,
  inflation: 6.2,
  goldPrice: 78500,
  usdInr: 83.2,
  lastUpdated: new Date().toISOString(),
};

const SEED_TRANSACTIONS: Transaction[] = [
  { id: 'ds-tx1', date: '2026-06-01', description: 'Salary Credit — Deloitte Consulting', category: 'Income', amount: 85000, type: 'credit', status: 'ALLOWED', riskLevel: 'LOW' },
  { id: 'ds-tx2', date: '2026-06-02', description: 'Equity SIP — Axis Bluechip', category: 'Investment', amount: 15000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
  { id: 'ds-tx3', date: '2026-06-03', description: 'Apple India — MacBook Pro M3', category: 'Shopping', amount: 280000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
  { id: 'ds-tx4', date: '2026-06-04', description: 'Zomato Dining — Indian Accent', category: 'Food', amount: 18500, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
  { id: 'ds-tx5', date: '2026-06-05', description: 'CRED Rent Payment', category: 'Housing', amount: 125000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
  { id: 'ds-tx6', date: '2026-06-05', description: 'Blocked: ₹50,000 to unknown UPI', category: 'Transfer', amount: 50000, type: 'debit', status: 'BLOCKED', riskLevel: 'HIGH', score: 88, signals: { newDevice: true, rushedAction: true, unusualAmount: true, otpRetries: false, firstTimeInvest: false, abnormalBehavior: true }, decision: { level: 'HIGH', action: 'BLOCK', delay: 300, message: 'High-value UPI to unverified payee blocked for your safety.', referenceId: 'AUD-DS8821' } },
  { id: 'ds-tx7', date: '2026-06-04', description: 'NSE Stock Purchase — TCS', category: 'Investment', amount: 32000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
  { id: 'ds-tx8', date: '2026-06-03', description: 'Fuel — Indian Oil', category: 'Transport', amount: 8500, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
  { id: 'ds-tx9', date: '2026-06-02', description: 'Dividend — Axis MF', category: 'Income', amount: 4500, type: 'credit', status: 'ALLOWED', riskLevel: 'LOW' },
  { id: 'ds-tx10', date: '2026-06-01', description: 'BigBasket — Monthly Groceries', category: 'Food', amount: 18500, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
  { id: 'ds-tx11', date: '2026-05-30', description: 'Cashback — Credit Card', category: 'Income', amount: 5000, type: 'credit', status: 'ALLOWED', riskLevel: 'LOW' },
  { id: 'ds-tx12', date: '2026-05-28', description: 'Crypto Purchase — BTC', category: 'Investment', amount: 18000, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
  { id: 'ds-tx13', date: '2026-05-25', description: 'Uber — Airport Drop', category: 'Transport', amount: 2500, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
  { id: 'ds-tx14', date: '2026-05-24', description: 'UPI Transfer — Mrigesh Mohanty', category: 'Transfer', amount: 500, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
  { id: 'ds-tx15', date: '2026-05-22', description: 'BookMyShow — Movie Tickets', category: 'Entertainment', amount: 1800, type: 'debit', status: 'ALLOWED', riskLevel: 'LOW' },
];

export const useWealthStore = create<WealthState>()(
  persist(
    (set, get) => ({
      user: {
        name: 'Account Holder',
        riskProfile: 'Moderate',
        taxBracket: 20,
        monthlyIncome: 50000,
        monthlySavings: 15000,
        monthlyExpenses: 35000,
      },
      assets: [],
      goals: [],
      consents: [],
      badges: [],
      notifications: [],
      marketData: DEFAULT_MARKET,
      transactions: [],
      currentView: 'dashboard',
      isJudgeMode: false,
      darkMode: false,
      isLoading: false,
      hasConsent: false,
      pitchModeActive: false,
      familyMode: false,
      familyMembers: [],
      familyDataSharing: {},
      quizResult: null,
      lockdownActive: false,
      coercedMode: false,
      duressModeActive: typeof window !== 'undefined' && localStorage.getItem('sw_duress') === 'active',
      includeInCommunityData: true,
      bills: [],
      triggers: [],
      cibilScore: 0,
      isAuthenticated: false,
      authAttempts: 0,
      authLockoutUntil: null,
      cibilFactors: [],
      challenges: [],
      kidProfile: null,
      kidTasks: [],
      spendRequests: [],
      uncategorizedTxs: [],
      categoryRules: [],
      duplicateGroups: [],
      subscriptions: [],
      language: 'en',
      accessibilityMode: false,
      nriMode: false,
      nriAccounts: [],
      remittances: [],
      nriInvestmentRules: [],
      preferredCurrency: 'INR',
      exchangeRates: { INR: 1, USD: 0.0119, EUR: 0.0110, GBP: 0.0095, AED: 0.0438 },
      exchangeRatesLastUpdated: new Date().toISOString(),
      seniorMode: false,
      kycVerified: false,
      demoModeActive: false,
      demoPhase: 0,
      demoPaused: false,
      aaFetchComplete: false,
      onboardingComplete: false,
      dashboardDensity: 'simple',
      behavioralDeviation: 0,
      loginAt: Date.now(),

      setView: (view) => set({ currentView: view }),
      setLockdownActive: (val) => set({ lockdownActive: val }),
      setCoercedMode: (val) => set({ coercedMode: val }),
      setDuressModeActive: (val) => {
        if (val) localStorage.setItem('sw_duress', 'active');
        else localStorage.removeItem('sw_duress');
        set({ duressModeActive: val });
      },
      toggleDuressMode: () => set((s) => {
        const next = !s.duressModeActive;
        if (next) localStorage.setItem('sw_duress', 'active');
        else localStorage.removeItem('sw_duress');
        return { duressModeActive: next };
      }),
      toggleCommunityData: () => set((s) => ({ includeInCommunityData: !s.includeInCommunityData })),
      setPitchModeActive: (val) => set({ pitchModeActive: val }),
      toggleFamilyMode: () => set((s) => ({ familyMode: !s.familyMode })),
      toggleFamilyDataSharing: (memberId) => set((s) => ({
        familyDataSharing: { ...s.familyDataSharing, [memberId]: !s.familyDataSharing[memberId] }
      })),
      setQuizResult: (result) => set({ quizResult: result }),
      addAsset: (asset) => set((s) => ({ assets: [...s.assets, asset] })),
      removeAsset: (id) => set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),
      updateAsset: (id, updates) => set((s) => ({
        assets: s.assets.map((a) => a.id === id ? { ...a, ...updates } : a),
      })),
      updateUser: (updates) => set((s) => ({
        user: { ...s.user, ...updates },
      })),
      addGoal: (goal) => set((s) => ({ goals: [...s.goals, goal] })),
      editGoal: (id, updates) => set((s) => ({
        goals: s.goals.map((g) => g.id === id ? { ...g, ...updates } : g)
      })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      updateGoal: (id, amount) => set((s) => ({
        goals: s.goals.map((g) => g.id === id ? { ...g, currentAmount: amount } : g)
      })),
      addConsent: (consent) => set((s) => ({ consents: [...s.consents, consent] })),
      revokeConsent: (id) => set((s) => ({
        consents: s.consents.map((c) => c.consentId === id ? { ...c, status: 'REVOKED' as const } : c),
      })),
      addTransaction: (tx) => set((s) => ({ transactions: [tx, ...s.transactions] })),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setHasConsent: (val) => set({ hasConsent: val }),
      markNotificationRead: (id) => set((s) => ({
        notifications: s.notifications.map((n) => n.id === id ? { ...n, unread: false } : n),
      })),
      unlockBadge: (id) => set((s) => ({
        badges: s.badges.map((b) => b.id === id ? { ...b, unlocked: true, date: new Date().toISOString().split('T')[0] } : b),
      })),
      initJudgeMode: () => set({ isJudgeMode: true, pitchModeActive: true }),
      toggleBillPaid: (id) => set((s) => ({
        bills: s.bills.map((b) => b.id === id ? { ...b, status: b.status === 'paid' ? 'upcoming' : 'paid' as const } : b)
      })),
      payBill: (id) => set((s) => ({ bills: s.bills.map((b) => b.id === id ? { ...b, status: 'paid' as const } : b) })),
      toggleTrigger: (id) => set((s) => ({
        triggers: s.triggers.map((t) => t.id === id ? { ...t, enabled: !t.enabled } : t)
      })),
      dismissTrigger: (id) => set((s) => ({
        triggers: s.triggers.map((t) => t.id === id ? { ...t, dismissed: true } : t)
      })),
      fireTrigger: (id) => set((s) => ({
        triggers: s.triggers.map((t) => t.id === id ? { ...t, fired: true } : t)
      })),
      setCibilScore: (score) => set({ cibilScore: score }),
      setIsLoading: (val) => set({ isLoading: val }),
      authenticate: () => set({ isAuthenticated: true, authAttempts: 0, authLockoutUntil: null }),
      logout: () => set({ isAuthenticated: false, currentView: 'dashboard' }),
      incrementAuthAttempt: () => set((s) => ({ authAttempts: s.authAttempts + 1 })),
      resetAuthLockout: () => set({ authLockoutUntil: null, authAttempts: 0 }),
      setKidProfile: (profile) => set({ kidProfile: profile }),
      toggleKidTask: (taskId) => set((s) => ({
        kidTasks: s.kidTasks.map((t) => t.id === taskId ? { ...t, completed: !t.completed } : t)
      })),
      addKidTask: (task) => set((s) => ({ kidTasks: [...s.kidTasks, task] })),
      addSpendRequest: (req) => set((s) => ({ spendRequests: [...s.spendRequests, req] })),
      updateSpendRequest: (id, status) => set((s) => ({
        spendRequests: s.spendRequests.map((r) => r.id === id ? { ...r, status } : r)
      })),
      acceptAICategory: (id) => set((s) => ({
        uncategorizedTxs: s.uncategorizedTxs.map((tx) => tx.id === id ? { ...tx, category: tx.aiCategory, ruleCreated: false } : tx)
      })),
      changeAICategory: (id, category) => set((s) => ({
        uncategorizedTxs: s.uncategorizedTxs.map((tx) => tx.id === id ? { ...tx, category, ruleCreated: false } : tx)
      })),
      createCategoryRule: (id) => set((s) => ({
        uncategorizedTxs: s.uncategorizedTxs.map((tx) => tx.id === id ? { ...tx, ruleCreated: true } : tx)
      })),
      resolveDuplicate: (id, action) => set((s) => ({
        duplicateGroups: s.duplicateGroups.map((g) => g.id === id ? { ...g, status: action } : g)
      })),
      cancelSubscription: (id) => set((s) => ({
        subscriptions: s.subscriptions.map((sub) => sub.id === id ? { ...sub, status: 'cancelled' as const } : sub)
      })),
      pauseSubscription: (id) => set((s) => ({
        subscriptions: s.subscriptions.map((sub) => sub.id === id ? { ...sub, status: 'unused' as const } : sub)
      })),
      setLanguage: (lang) => set({ language: lang }),
      toggleAccessibilityMode: () => set((s) => ({ accessibilityMode: !s.accessibilityMode })),
      toggleNRIMode: () => set((s) => ({ nriMode: !s.nriMode })),
      setPreferredCurrency: (curr) => set({ preferredCurrency: curr }),
      cycleCurrency: () => set((s) => {
        const currencies = ['INR', 'USD', 'EUR', 'GBP'];
        const idx = currencies.indexOf(s.preferredCurrency);
        return { preferredCurrency: currencies[(idx + 1) % currencies.length] };
      }),
      toggleSeniorMode: () => set((s) => ({ seniorMode: !s.seniorMode })),
      setKycVerified: (val) => set({ kycVerified: val }),
      setDemoModeActive: (val) => set({ demoModeActive: val }),
      setDemoPhase: (phase) => set({ demoPhase: phase }),
      toggleDemoPaused: () => set((s) => ({ demoPaused: !s.demoPaused })),
      setAAFetchComplete: (val) => set({ aaFetchComplete: val }),
      setOnboardingComplete: (val) => set({ onboardingComplete: val }),
      setDashboardDensity: (density) => set({ dashboardDensity: density }),
      setBehavioralDeviation: (val) => set({ behavioralDeviation: val }),
      setLoginAt: (val) => set({ loginAt: val }),
      // Seed realistic data for judges
      seedRealData: () => set({
        user: { name: 'Deepanshu Sharma', riskProfile: 'Aggressive', taxBracket: 30, monthlyIncome: 85000, monthlySavings: 35000, monthlyExpenses: 50000 },
        assets: SEED_ASSETS,
        goals: SEED_GOALS,
        badges: SEED_BADGES,
        notifications: SEED_NOTIFICATIONS,
        transactions: SEED_TRANSACTIONS,
        bills: [
          { id: 'bill-1', name: 'House Rent', category: 'Housing', amount: 18500, dueDay: 5, icon: 'fa-house', color: 'bg-rose-500', status: 'upcoming', isRecurring: true, frequency: 'monthly', autoDetected: false, history: [18500, 18500] },
          { id: 'bill-2', name: 'Electricity & Utilities', category: 'Utilities', amount: 3200, dueDay: 15, icon: 'fa-bolt', color: 'bg-amber-500', status: 'upcoming', isRecurring: true, frequency: 'monthly', autoDetected: true, history: [2800, 3200, 2900] },
          { id: 'bill-3', name: 'Monthly SIPs', category: 'Investment', amount: 15000, dueDay: 5, icon: 'fa-chart-line', color: 'bg-emerald-500', status: 'upcoming', isRecurring: true, frequency: 'monthly', autoDetected: false, history: [15000, 15000] },
          { id: 'bill-4', name: 'WiFi & Phone', category: 'Utilities', amount: 1200, dueDay: 20, icon: 'fa-wifi', color: 'bg-blue-500', status: 'upcoming', isRecurring: true, frequency: 'monthly', autoDetected: false, history: [1200, 1200] },
        ],
        subscriptions: [
          { id: 'sub-1', name: 'Netflix', icon: 'fa-play', color: 'bg-rose-500', amount: 649, frequency: 'monthly', status: 'active', nextRenewal: '2026-07-01', daysUntilRenewal: 27, category: 'Entertainment', autoDetected: true },
          { id: 'sub-2', name: 'Amazon Prime', icon: 'fa-box', color: 'bg-amber-500', amount: 1499, frequency: 'yearly', status: 'active', nextRenewal: '2027-05-01', daysUntilRenewal: 45, category: 'Shopping', autoDetected: true },
          { id: 'sub-3', name: 'Spotify Premium', icon: 'fa-music', color: 'bg-green-500', amount: 119, frequency: 'monthly', status: 'active', nextRenewal: '2026-07-05', daysUntilRenewal: 10, category: 'Entertainment', autoDetected: true },
          { id: 'sub-4', name: 'Google One', icon: 'fa-cloud', color: 'bg-sky-500', amount: 195, frequency: 'monthly', status: 'active', nextRenewal: '2026-07-10', daysUntilRenewal: 15, category: 'Utilities', autoDetected: true },
        ],
        cibilScore: 748,
      }),
      // Load from backend API
      loadFromBackend: async () => {
        set({ isLoading: true });
        try {
          const { ok, data } = await backendApi.getDashboard();
          if (!ok || !data?.data) return;
          const d = data.data;
          const current = get();
          set({
            assets: d.assets?.map((a: any) => ({ id: String(a.id), name: a.name, type: a.asset_type, value: a.value, liquidity: a.liquidity, returns: a.returns })) || current.assets,
            goals: d.goals?.map((g: any) => ({ id: String(g.id), name: g.name, type: g.goal_type, targetAmount: g.target_amount, currentAmount: g.current_amount, deadline: g.deadline })) || current.goals,
            transactions: d.recentTransactions?.map((t: any) => ({ id: String(t.id), date: t.created_at?.split(' ')[0] || new Date().toISOString().split('T')[0], description: t.description, category: t.type, amount: t.amount, type: t.type, status: t.status?.toUpperCase() || 'ALLOWED', riskLevel: 'LOW' })) || current.transactions,
            bills: d.bills?.map((b: any) => ({ id: String(b.id), name: b.name, category: b.category, amount: b.amount, dueDay: b.due_date ? parseInt(b.due_date.split('-')[2]) : 1, icon: 'fa-file-invoice', color: 'bg-primary', status: b.status, isRecurring: !!b.is_recurring, frequency: b.frequency || 'monthly' })) || current.bills,
          });
        } catch { /* backend optional */ }
        finally { set({ isLoading: false }); }
      },
    }),
    {
      name: 'sw-wealth-store',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version !== 1) {
          // Reset state on version mismatch (prevents corrupted old state)
          return undefined as any;
        }
        return persistedState;
      },
      partialize: (state) => ({
        user: state.user,
        assets: state.assets,
        goals: state.goals,
        consents: state.consents,
        badges: state.badges,
        notifications: state.notifications,
        marketData: state.marketData,
        transactions: state.transactions,
        darkMode: state.darkMode,
        hasConsent: state.hasConsent,
        familyDataSharing: state.familyDataSharing,
        quizResult: state.quizResult,
        bills: state.bills,
        triggers: state.triggers,
        cibilScore: state.cibilScore,
        isAuthenticated: state.isAuthenticated,
        authAttempts: state.authAttempts,
        authLockoutUntil: state.authLockoutUntil,
        challenges: state.challenges,
        kidProfile: state.kidProfile,
        kidTasks: state.kidTasks,
        spendRequests: state.spendRequests,
        uncategorizedTxs: state.uncategorizedTxs,
        categoryRules: state.categoryRules,
        duplicateGroups: state.duplicateGroups,
        subscriptions: state.subscriptions,
        language: state.language,
        accessibilityMode: state.accessibilityMode,
        nriMode: state.nriMode,
        nriAccounts: state.nriAccounts,
        remittances: state.remittances,
        nriInvestmentRules: state.nriInvestmentRules,
        preferredCurrency: state.preferredCurrency,
        exchangeRates: state.exchangeRates,
        exchangeRatesLastUpdated: state.exchangeRatesLastUpdated,
        seniorMode: state.seniorMode,
        kycVerified: state.kycVerified,
      }),
    }
  )
);

export function loadDemoAccount(_accountId: string) {
  void _accountId;
  // Deprecated: use seedRealData or backend APIs
  console.warn('loadDemoAccount is deprecated');
}

export function getUserByEmail(_email: string) {
  void _email;
  return null;
}

export function getDefaultUser() {
  return null;
}

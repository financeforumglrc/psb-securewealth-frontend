import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  animate,
} from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   FEATURE COSMOS — SecureWealth Twin Ultimate Feature Universe
   React 19 + TypeScript + Tailwind v4 + Framer Motion
   ═══════════════════════════════════════════════════════════════ */

/* ─── TYPES ─── */

interface FeatureNode {
  id: string;
  name: string;
  icon: string;
  desc: string;
  count: number;
  modules: string[];
  color: string;
  glow: string;
}

interface FeatureItem {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  description: string;
  isWorldFirst: boolean;
  files: string[];
  libraries: string[];
}

interface WorldFirstInnovation {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  whyUnique: string;
  howItWorks: string;
  techStack: string[];
  color: string;
  glow: string;
}

interface JourneyStage {
  id: string;
  title: string;
  subtitle: string;
  features: string[];
  color: string;
  depth: number;
}

interface EvolutionPhase {
  phase: string;
  features: string[];
  count: number;
  color: string;
}

/* ─── 10 GALAXIES ─── */

const GALAXIES: FeatureNode[] = [
  {
    id: 'dashboard',
    name: 'Dashboard & Intelligence',
    icon: 'fa-chart-pie',
    desc: 'AI-powered financial command center with real-time insights',
    count: 15,
    modules: ['Net Worth Card', 'Financial Weather', 'Wealth DNA', 'Wealth Benchmark', 'AI Recommendations', 'Account Aggregator', 'Stock Ticker', 'Badge Streak', 'Quick Actions', 'KYC Status', 'Investment Quiz', 'Financial Literacy', 'Smart Notifications', 'Data Export', 'Customizable Widgets'],
    color: '#1B5E20',
    glow: '#4CAF50',
  },
  {
    id: 'wealth',
    name: 'Wealth Management',
    icon: 'fa-gem',
    desc: 'Portfolio, assets, goals, and digital gold tracking',
    count: 18,
    modules: ['Portfolio Allocation', 'ESG Scoring', 'Rebalancing', 'Asset Inventory', 'Manual Entry', 'AA Linking', 'Goal Tracker', 'Goal Conflicts', 'Celebrations', 'Digital Gold', 'SIP Calculator', 'EMI Calculator', 'Retirement Corpus', 'Rent-vs-Buy', 'Tax Harvesting', 'Wealth Projection', 'Liability Dashboard', 'Insurance Tracker'],
    color: '#1565C0',
    glow: '#42A5F5',
  },
  {
    id: 'market',
    name: 'Market & Forecast',
    icon: 'fa-globe',
    desc: 'Live market data, scenario simulation, and smart triggers',
    count: 12,
    modules: ['NIFTY P/E Tracker', 'RBI Rate Monitor', 'Inflation Feed', 'Gold/USD-INR', 'Market Strategist', 'Smart Triggers', 'Scenario Simulator', 'Stress Testing', 'Sector Rotation', 'Earnings Calendar', 'Macro Dashboard', 'Commodity Tracker'],
    color: '#E65100',
    glow: '#FF9800',
  },
  {
    id: 'security',
    name: 'Security Beast',
    icon: 'fa-dragon',
    desc: 'Browser-native zero-trust defense with real crypto, biometrics, and threat monitoring',
    count: 20,
    modules: ['Risk Meter', 'Fraud Detection Engine', 'Panic Button', 'Duress Mode', 'Scam Caller ID', 'Behavioral Biometrics', 'Family Approval', 'OTP Simulation', 'Cooling Vault', 'Threat Intel', 'Stress Test', 'Security Log', 'TPM Attestation', 'Browser Threat Monitor', 'Post-Quantum Crypto', 'Blockchain Audit', 'Device Fingerprint', 'Decentralized ID', 'URL Safety Checker', 'Transaction Trap'],
    color: '#B71C1C',
    glow: '#EF5350',
  },
  {
    id: 'transactions',
    name: 'Transactions & Bills',
    icon: 'fa-list',
    desc: 'AI-categorized history, smart duplicates, subscriptions',
    count: 14,
    modules: ['Transaction History', 'AI Categorization', 'Duplicate Detection', 'Receipt Scanning', 'Bill Calendar', 'Auto-Detection', 'Due Alerts', 'Subscription Tracker', 'Ghost Detection', 'Recurring Charges', 'Split Expenses', 'Merchant Insights', 'Cash Flow Analysis', 'Spending Forecast'],
    color: '#6A1B9A',
    glow: '#AB47BC',
  },
  {
    id: 'family',
    name: 'Family & Modes',
    icon: 'fa-child',
    desc: 'Multi-persona support: Kids, Seniors, NRI, Business',
    count: 14,
    modules: ['Kids Mode', 'Smart Piggy Bank', 'Chore Rewards', 'Senior Mode', 'NRI Center', 'Dual Currency', 'Business Mode', 'Working Capital', 'Cash Flow', 'Family Dashboard', 'FamilyFort Permissions', 'Guardian Controls', 'Teen Account', 'Legacy Planning'],
    color: '#00695C',
    glow: '#26A69A',
  },
  {
    id: 'ai',
    name: 'AI & Intelligence',
    icon: 'fa-brain',
    desc: 'Generative AI, explainable recommendations, voice chatbot',
    count: 16,
    modules: ['WealthChat Bot', 'Voice Input', 'Explainable AI', 'Decision Log', 'Behavioral Nudges', 'Wealth Twin', 'AutoPilot Rules', 'Green Wealth Index', 'Financial Wellness Score', 'Sentiment Analysis', 'Document AI', 'Natural Language Search', 'Predictive Alerts', 'Pattern Recognition', 'Smart Summaries', 'AI Concierge'],
    color: '#4527A0',
    glow: '#7E57C2',
  },
  {
    id: 'bhavishya',
    name: 'BHAVISHYA Engine',
    icon: 'fa-infinity',
    desc: '24 predictive modules: DNA, events, future self, crisis, market',
    count: 24,
    modules: ['Financial DNA Helix', 'Life Event Predictor', 'Future Self Simulator', 'Preparedness Score', 'Auto-Instrument', 'Crisis Predictor', 'Market Intelligence', 'Emotional Resonance', 'Generational Wealth', 'Digital Inheritance', 'Community DNA', 'AI Future Twin', 'AI Insights Aggregator', 'Chakra Balance', 'Festival Planner', 'Neural Network Viz', 'Temporal Wealth', 'Quantum Lock', 'Time Machine', 'Emotional Heatmap', 'Prosperity Score', 'Destiny Mapper', 'Karmic Wealth', 'Cosmic Alignment'],
    color: '#FFD700',
    glow: '#FFEB3B',
  },
  {
    id: 'payments',
    name: 'Payments & Transfers',
    icon: 'fa-money-bill-wave',
    desc: 'Unified payment hub: UPI, wires, bulk, scheduled, real-time',
    count: 12,
    modules: ['UPI Integration', 'IMPS/NEFT/RTGS', 'International Wire', 'Bulk Payments', 'Scheduled Transfers', 'Standing Instructions', 'QR Code Payments', 'Contactless NFC', 'Payment Links', 'Auto-Sweep', 'Multi-Bank Sync', 'Real-Time Settlement'],
    color: '#00838F',
    glow: '#00BCD4',
  },
  {
    id: 'innovation',
    name: 'Innovation Lab',
    icon: 'fa-flask',
    desc: 'Experimental features: gamification, AR, social, world-firsts',
    count: 13,
    modules: ['Neuro-Friction Banking', 'Monte Carlo Life Simulator', 'Collective Immune System', 'Autonomous Financial Agent', 'Sovereign Data Vault', 'Fantasy League', 'Values Alignment', 'Boosts & Streaks', 'Social Investing', 'Gamified Challenges', 'AR Portfolio View', 'Voice Biometrics', 'Haptic Feedback'],
    color: '#C62828',
    glow: '#FF5252',
  },
];

const TOTAL_FEATURES = GALAXIES.reduce((s, g) => s + g.count, 0);
const TOTAL_GALAXIES = GALAXIES.length;

/* ─── COMPLETE 159 FEATURE CATALOG ─── */

const FEATURES: FeatureItem[] = [
  /* Dashboard & Intelligence (15) */
  { id: 'f001', name: 'Net Worth Card', category: 'Dashboard & Intelligence', categoryId: 'dashboard', description: 'Real-time aggregated net worth visualization across all accounts', isWorldFirst: false, files: ['NetWorthCard.tsx', 'useNetWorth.ts'], libraries: ['Recharts', 'Framer Motion'] },
  { id: 'f002', name: 'Financial Weather', category: 'Dashboard & Intelligence', categoryId: 'dashboard', description: 'Visual metaphor for market conditions and personal finance climate', isWorldFirst: false, files: ['FinancialWeather.tsx'], libraries: ['Canvas API', 'Tailwind'] },
  { id: 'f003', name: 'Wealth DNA', category: 'Dashboard & Intelligence', categoryId: 'dashboard', description: 'Genetic-style visualization of your financial profile and habits', isWorldFirst: false, files: ['WealthDNA.tsx', 'DNAViz.tsx'], libraries: ['D3.js', 'Framer Motion'] },
  { id: 'f004', name: 'Wealth Benchmark', category: 'Dashboard & Intelligence', categoryId: 'dashboard', description: 'Compare your wealth growth against peer demographics', isWorldFirst: false, files: ['BenchmarkChart.tsx'], libraries: ['Recharts'] },
  { id: 'f005', name: 'AI Recommendations', category: 'Dashboard & Intelligence', categoryId: 'dashboard', description: 'Personalized next-best-action suggestions from WealthChat', isWorldFirst: false, files: ['AIRecommendations.tsx'], libraries: ['OpenAI API', 'Zustand'] },
  { id: 'f006', name: 'Account Aggregator', category: 'Dashboard & Intelligence', categoryId: 'dashboard', description: 'Link and sync all bank accounts via AA framework', isWorldFirst: false, files: ['AccountAggregator.tsx'], libraries: ['React Query', 'AA SDK'] },
  { id: 'f007', name: 'Stock Ticker', category: 'Dashboard & Intelligence', categoryId: 'dashboard', description: 'Live scrolling ticker of watchlisted securities', isWorldFirst: false, files: ['StockTicker.tsx'], libraries: ['WebSockets'] },
  { id: 'f008', name: 'Badge Streak', category: 'Dashboard & Intelligence', categoryId: 'dashboard', description: 'Gamified achievement badges for financial milestones', isWorldFirst: false, files: ['BadgeStreak.tsx'], libraries: ['Framer Motion'] },
  { id: 'f009', name: 'Quick Actions', category: 'Dashboard & Intelligence', categoryId: 'dashboard', description: 'One-tap shortcuts for frequent banking operations', isWorldFirst: false, files: ['QuickActions.tsx'], libraries: ['Tailwind'] },
  { id: 'f010', name: 'KYC Status', category: 'Dashboard & Intelligence', categoryId: 'dashboard', description: 'Real-time KYC compliance tracker with document checklist', isWorldFirst: false, files: ['KYCStatus.tsx'], libraries: ['React Hook Form'] },
  { id: 'f011', name: 'Investment Quiz', category: 'Dashboard & Intelligence', categoryId: 'dashboard', description: 'Interactive risk profiling and knowledge assessment', isWorldFirst: false, files: ['InvestmentQuiz.tsx'], libraries: ['Framer Motion'] },
  { id: 'f012', name: 'Financial Literacy', category: 'Dashboard & Intelligence', categoryId: 'dashboard', description: 'Curated learning modules with progress tracking', isWorldFirst: false, files: ['LiteracyHub.tsx'], libraries: ['MDX'] },
  { id: 'f013', name: 'Smart Notifications', category: 'Dashboard & Intelligence', categoryId: 'dashboard', description: 'AI-prioritized alerts ranked by urgency and relevance', isWorldFirst: false, files: ['SmartNotifications.tsx'], libraries: ['Zustand'] },
  { id: 'f014', name: 'Data Export', category: 'Dashboard & Intelligence', categoryId: 'dashboard', description: 'Export financial data in PDF, CSV, or JSON formats', isWorldFirst: false, files: ['DataExport.tsx'], libraries: ['jsPDF', 'PapaParse'] },
  { id: 'f015', name: 'Customizable Widgets', category: 'Dashboard & Intelligence', categoryId: 'dashboard', description: 'Drag-and-drop dashboard layout personalization', isWorldFirst: false, files: ['WidgetGrid.tsx'], libraries: ['Gridstack', 'Zustand'] },

  /* Wealth Management (18) */
  { id: 'f016', name: 'Portfolio Allocation', category: 'Wealth Management', categoryId: 'wealth', description: 'Interactive pie and sunburst charts for asset breakdown', isWorldFirst: false, files: ['PortfolioAllocation.tsx'], libraries: ['Recharts', 'D3.js'] },
  { id: 'f017', name: 'ESG Scoring', category: 'Wealth Management', categoryId: 'wealth', description: 'Environmental, Social, Governance ratings per holding', isWorldFirst: false, files: ['ESGScore.tsx'], libraries: ['Recharts'] },
  { id: 'f018', name: 'Rebalancing', category: 'Wealth Management', categoryId: 'wealth', description: 'Automated drift detection and rebalance suggestions', isWorldFirst: false, files: ['RebalanceEngine.tsx'], libraries: ['React Query'] },
  { id: 'f019', name: 'Asset Inventory', category: 'Wealth Management', categoryId: 'wealth', description: 'Comprehensive register of all physical and digital assets', isWorldFirst: false, files: ['AssetInventory.tsx'], libraries: ['TanStack Table'] },
  { id: 'f020', name: 'Manual Entry', category: 'Wealth Management', categoryId: 'wealth', description: 'Add offline assets like real estate and jewelry', isWorldFirst: false, files: ['ManualAssetForm.tsx'], libraries: ['React Hook Form'] },
  { id: 'f021', name: 'AA Linking', category: 'Wealth Management', categoryId: 'wealth', description: 'Account Aggregator consent and data fetch management', isWorldFirst: false, files: ['AALinking.tsx'], libraries: ['AA SDK'] },
  { id: 'f022', name: 'Goal Tracker', category: 'Wealth Management', categoryId: 'wealth', description: 'Visual progress bars for each financial goal', isWorldFirst: false, files: ['GoalTracker.tsx'], libraries: ['Framer Motion'] },
  { id: 'f023', name: 'Goal Conflicts', category: 'Wealth Management', categoryId: 'wealth', description: 'AI detection of competing goals and trade-off analysis', isWorldFirst: false, files: ['GoalConflicts.tsx'], libraries: ['Recharts'] },
  { id: 'f024', name: 'Celebrations', category: 'Wealth Management', categoryId: 'wealth', description: 'Animated confetti and rewards on goal completion', isWorldFirst: false, files: ['Celebration.tsx'], libraries: ['Canvas Confetti'] },
  { id: 'f025', name: 'Digital Gold', category: 'Wealth Management', categoryId: 'wealth', description: 'Buy, sell, and track digital gold investments', isWorldFirst: false, files: ['DigitalGold.tsx'], libraries: ['React Query'] },
  { id: 'f026', name: 'SIP Calculator', category: 'Wealth Management', categoryId: 'wealth', description: 'Advanced SIP planner with step-up and target modes', isWorldFirst: false, files: ['SIPCalculator.tsx'], libraries: ['Recharts'] },
  { id: 'f027', name: 'EMI Calculator', category: 'Wealth Management', categoryId: 'wealth', description: 'Loan EMI planner with amortization schedule', isWorldFirst: false, files: ['EMICalculator.tsx'], libraries: ['Recharts'] },
  { id: 'f028', name: 'Retirement Corpus', category: 'Wealth Management', categoryId: 'wealth', description: 'Monte Carlo-based retirement adequacy simulator', isWorldFirst: false, files: ['RetirementCorpus.tsx'], libraries: ['Recharts'] },
  { id: 'f029', name: 'Rent-vs-Buy', category: 'Wealth Management', categoryId: 'wealth', description: 'Decision engine comparing renting vs buying property', isWorldFirst: false, files: ['RentVsBuy.tsx'], libraries: ['Recharts'] },
  { id: 'f030', name: 'Tax Harvesting', category: 'Wealth Management', categoryId: 'wealth', description: 'Automated tax-loss harvesting recommendations', isWorldFirst: false, files: ['TaxHarvest.tsx'], libraries: ['React Query'] },
  { id: 'f031', name: 'Wealth Projection', category: 'Wealth Management', categoryId: 'wealth', description: 'Long-term wealth trajectory with scenario modeling', isWorldFirst: false, files: ['WealthProjection.tsx'], libraries: ['Recharts'] },
  { id: 'f032', name: 'Liability Dashboard', category: 'Wealth Management', categoryId: 'wealth', description: 'Unified view of all loans and liabilities', isWorldFirst: false, files: ['LiabilityDashboard.tsx'], libraries: ['Recharts'] },
  { id: 'f033', name: 'Insurance Tracker', category: 'Wealth Management', categoryId: 'wealth', description: 'Policy management with renewal alerts and gap analysis', isWorldFirst: false, files: ['InsuranceTracker.tsx'], libraries: ['TanStack Table'] },

  /* Market & Forecast (12) */
  { id: 'f034', name: 'NIFTY P/E Tracker', category: 'Market & Forecast', categoryId: 'market', description: 'Historical P/E ratio analysis with percentile rankings', isWorldFirst: false, files: ['NiftyPE.tsx'], libraries: ['Recharts'] },
  { id: 'f035', name: 'RBI Rate Monitor', category: 'Market & Forecast', categoryId: 'market', description: 'Repo rate history and impact on your portfolio', isWorldFirst: false, files: ['RBIMonitor.tsx'], libraries: ['Recharts'] },
  { id: 'f036', name: 'Inflation Feed', category: 'Market & Forecast', categoryId: 'market', description: 'Real-time inflation data with personal impact score', isWorldFirst: false, files: ['InflationFeed.tsx'], libraries: ['React Query'] },
  { id: 'f037', name: 'Gold/USD-INR', category: 'Market & Forecast', categoryId: 'market', description: 'Correlation tracker for gold and currency movements', isWorldFirst: false, files: ['GoldForex.tsx'], libraries: ['Recharts'] },
  { id: 'f038', name: 'Market Strategist', category: 'Market & Forecast', categoryId: 'market', description: 'AI-generated market commentary and strategy shifts', isWorldFirst: false, files: ['MarketStrategist.tsx'], libraries: ['OpenAI API'] },
  { id: 'f039', name: 'Smart Triggers', category: 'Market & Forecast', categoryId: 'market', description: 'User-defined alerts on price, ratio, and event triggers', isWorldFirst: false, files: ['SmartTriggers.tsx'], libraries: ['Zustand'] },
  { id: 'f040', name: 'Scenario Simulator', category: 'Market & Forecast', categoryId: 'market', description: 'What-if analysis for market downturns and booms', isWorldFirst: false, files: ['ScenarioSim.tsx'], libraries: ['Recharts'] },
  { id: 'f041', name: 'Stress Testing', category: 'Market & Forecast', categoryId: 'market', description: 'Portfolio resilience under 2008-style crash scenarios', isWorldFirst: false, files: ['StressTest.tsx'], libraries: ['Recharts'] },
  { id: 'f042', name: 'Sector Rotation', category: 'Market & Forecast', categoryId: 'market', description: 'Momentum-based sector flow analysis', isWorldFirst: false, files: ['SectorRotation.tsx'], libraries: ['Recharts'] },
  { id: 'f043', name: 'Earnings Calendar', category: 'Market & Forecast', categoryId: 'market', description: 'Track upcoming earnings for your holdings', isWorldFirst: false, files: ['EarningsCalendar.tsx'], libraries: ['React Query'] },
  { id: 'f044', name: 'Macro Dashboard', category: 'Market & Forecast', categoryId: 'market', description: 'GDP, unemployment, and macro indicator summary', isWorldFirst: false, files: ['MacroDashboard.tsx'], libraries: ['Recharts'] },
  { id: 'f045', name: 'Commodity Tracker', category: 'Market & Forecast', categoryId: 'market', description: 'Real-time prices for oil, metals, and agri commodities', isWorldFirst: false, files: ['CommodityTracker.tsx'], libraries: ['React Query'] },

  /* Security Beast (20) */
  { id: 'f046', name: 'Risk Meter', category: 'Security Beast', categoryId: 'security', description: 'Dynamic security health score with visual gauge', isWorldFirst: false, files: ['RiskMeter.tsx'], libraries: ['Canvas API'] },
  { id: 'f047', name: 'Fraud Detection Engine', category: 'Security Beast', categoryId: 'security', description: 'Real rule-based fraud analysis on live transaction history', isWorldFirst: false, files: ['FraudDetectionEngine.tsx'], libraries: ['Zustand'] },
  { id: 'f048', name: 'Panic Button', category: 'Security Beast', categoryId: 'security', description: 'One-tap account freeze and emergency contact alert', isWorldFirst: false, files: ['PanicButton.tsx'], libraries: ['Zustand'] },
  { id: 'f049', name: 'Duress Mode', category: 'Security Beast', categoryId: 'security', description: 'Silent alarm that alerts authorities under coercion', isWorldFirst: false, files: ['DuressMode.tsx'], libraries: ['Zustand'] },
  { id: 'f050', name: 'Scam Caller ID', category: 'Security Beast', categoryId: 'security', description: 'Known-scam number database lookup with real-time warnings', isWorldFirst: false, files: ['ScamCallerID.tsx'], libraries: ['Local DB'] },
  { id: 'f051', name: 'Behavioral Biometrics', category: 'Security Beast', categoryId: 'security', description: 'Live keystroke, mouse, and scroll biometrics with anomaly lock', isWorldFirst: false, files: ['BehavioralBiometrics.tsx'], libraries: ['Web Crypto'] },
  { id: 'f052', name: 'Family Approval', category: 'Security Beast', categoryId: 'security', description: 'Require trusted-family consensus for high-value transfers', isWorldFirst: false, files: ['FamilyApproval.tsx'], libraries: ['Zustand'] },
  { id: 'f053', name: 'OTP Simulation', category: 'Security Beast', categoryId: 'security', description: 'RFC 6238 TOTP generation and trap-code lockdown demo', isWorldFirst: false, files: ['OTPSimulation.tsx'], libraries: ['Web Crypto'] },
  { id: 'f054', name: 'Cooling Vault', category: 'Security Beast', categoryId: 'security', description: 'Time-locked withdrawals for large transactions', isWorldFirst: false, files: ['CoolingVault.tsx'], libraries: ['Zustand'] },
  { id: 'f055', name: 'Threat Intel', category: 'Security Beast', categoryId: 'security', description: 'Real-time global threat feed affecting your region', isWorldFirst: false, files: ['ThreatIntel.tsx'], libraries: ['React Query'] },
  { id: 'f056', name: 'Security Log', category: 'Security Beast', categoryId: 'security', description: 'Immutable audit trail of all security events', isWorldFirst: false, files: ['SecurityLog.tsx'], libraries: ['TanStack Table'] },
  { id: 'f057', name: 'TPM Attestation', category: 'Security Beast', categoryId: 'security', description: 'Non-exportable ECDSA P-256 key attestation via Web Crypto', isWorldFirst: false, files: ['TpmAttestation.tsx'], libraries: ['Web Crypto'] },
  { id: 'f058', name: 'Browser Threat Monitor', category: 'Security Beast', categoryId: 'security', description: 'Browser-native CSP, devtools, and injection threat detection', isWorldFirst: false, files: ['BrowserThreatMonitor.tsx'], libraries: ['DOM APIs'] },
  { id: 'f059', name: 'Post-Quantum Crypto', category: 'Security Beast', categoryId: 'security', description: 'ML-KEM-768 key exchange with AES-GCM payload encryption', isWorldFirst: false, files: ['PostQuantumCrypto.tsx'], libraries: ['mlkem', 'Web Crypto'] },
  { id: 'f060', name: 'Blockchain Audit', category: 'Security Beast', categoryId: 'security', description: 'Merkle-tree-based tamper-proof transaction logs', isWorldFirst: false, files: ['BlockchainAudit.tsx'], libraries: ['Web Crypto'] },
  { id: 'f061', name: 'Device Fingerprint', category: 'Security Beast', categoryId: 'security', description: 'SHA-256 device fingerprint and per-session trust score', isWorldFirst: false, files: ['DeviceFingerprintPanel.tsx'], libraries: ['Canvas API'] },
  { id: 'f062', name: 'Decentralized ID', category: 'Security Beast', categoryId: 'security', description: 'ECDSA-signed verifiable credential with QR code and JWS verification', isWorldFirst: false, files: ['DecentralizedId.tsx'], libraries: ['Web Crypto', 'qrcode'] },
  { id: 'f062a', name: 'URL Safety Checker', category: 'Security Beast', categoryId: 'security', description: 'Heuristic + Cloudflare DoH + live HTTPS probe for unsafe links', isWorldFirst: false, files: ['URLSafetyChecker.tsx'], libraries: ['fetch', 'DoH'] },
  { id: 'f062b', name: 'Transaction Trap', category: 'Security Beast', categoryId: 'security', description: 'Honey confirmation code that triggers lockdown on phishing UIs', isWorldFirst: false, files: ['TransactionTrap.tsx'], libraries: ['Zustand'] },
  { id: 'f062c', name: 'Secure Enclave Check', category: 'Security Beast', categoryId: 'security', description: 'Hardware-backed key store verification and root/jailbreak stub', isWorldFirst: false, files: ['SecureEnclaveCheck.tsx'], libraries: ['Web Crypto'] },

  /* Transactions & Bills (14) */
  { id: 'f063', name: 'Transaction History', category: 'Transactions & Bills', categoryId: 'transactions', description: 'Infinite-scroll categorized transaction list', isWorldFirst: false, files: ['TxnHistory.tsx'], libraries: ['TanStack Table', 'React Query'] },
  { id: 'f064', name: 'AI Categorization', category: 'Transactions & Bills', categoryId: 'transactions', description: 'Auto-categorize transactions with ML confidence scores', isWorldFirst: false, files: ['AICategory.tsx'], libraries: ['TensorFlow.js'] },
  { id: 'f065', name: 'Duplicate Detection', category: 'Transactions & Bills', categoryId: 'transactions', description: 'Identify accidental duplicate charges', isWorldFirst: false, files: ['DuplicateDetect.tsx'], libraries: ['Fuse.js'] },
  { id: 'f066', name: 'Receipt Scanning', category: 'Transactions & Bills', categoryId: 'transactions', description: 'OCR-based receipt capture and auto-match', isWorldFirst: false, files: ['ReceiptScan.tsx'], libraries: ['Tesseract.js'] },
  { id: 'f067', name: 'Bill Calendar', category: 'Transactions & Bills', categoryId: 'transactions', description: 'Monthly calendar view of all upcoming bills', isWorldFirst: false, files: ['BillCalendar.tsx'], libraries: ['date-fns'] },
  { id: 'f068', name: 'Auto-Detection', category: 'Transactions & Bills', categoryId: 'transactions', description: 'Automatically detect bills from transaction patterns', isWorldFirst: false, files: ['BillAutoDetect.tsx'], libraries: ['ML Kit'] },
  { id: 'f069', name: 'Due Alerts', category: 'Transactions & Bills', categoryId: 'transactions', description: 'Smart reminders before bill due dates', isWorldFirst: false, files: ['DueAlerts.tsx'], libraries: ['Zustand'] },
  { id: 'f070', name: 'Subscription Tracker', category: 'Transactions & Bills', categoryId: 'transactions', description: 'Identify and manage recurring subscriptions', isWorldFirst: false, files: ['SubTracker.tsx'], libraries: ['TanStack Table'] },
  { id: 'f071', name: 'Ghost Detection', category: 'Transactions & Bills', categoryId: 'transactions', description: 'Find forgotten free trials now charging you', isWorldFirst: false, files: ['GhostDetect.tsx'], libraries: ['Fuse.js'] },
  { id: 'f072', name: 'Recurring Charges', category: 'Transactions & Bills', categoryId: 'transactions', description: 'Full register of all standing charges with trend analysis', isWorldFirst: false, files: ['RecurringCharges.tsx'], libraries: ['Recharts'] },
  { id: 'f073', name: 'Split Expenses', category: 'Transactions & Bills', categoryId: 'transactions', description: 'Split bills with friends and track settlements', isWorldFirst: false, files: ['SplitExpenses.tsx'], libraries: ['Zustand'] },
  { id: 'f074', name: 'Merchant Insights', category: 'Transactions & Bills', categoryId: 'transactions', description: 'Spending breakdown by merchant and category', isWorldFirst: false, files: ['MerchantInsights.tsx'], libraries: ['Recharts'] },
  { id: 'f075', name: 'Cash Flow Analysis', category: 'Transactions & Bills', categoryId: 'transactions', description: 'Monthly inflow vs outflow with anomaly flags', isWorldFirst: false, files: ['CashFlow.tsx'], libraries: ['Recharts'] },
  { id: 'f076', name: 'Spending Forecast', category: 'Transactions & Bills', categoryId: 'transactions', description: 'Predict next month spending based on historical patterns', isWorldFirst: false, files: ['SpendingForecast.tsx'], libraries: ['Recharts'] },

  /* Family & Modes (14) */
  { id: 'f077', name: 'Kids Mode', category: 'Family & Modes', categoryId: 'family', description: 'Simplified UI with parental controls for children', isWorldFirst: false, files: ['KidsMode.tsx'], libraries: ['Framer Motion'] },
  { id: 'f078', name: 'Smart Piggy Bank', category: 'Family & Modes', categoryId: 'family', description: 'Digital savings jar with visual progress and rewards', isWorldFirst: false, files: ['PiggyBank.tsx'], libraries: ['Framer Motion'] },
  { id: 'f079', name: 'Chore Rewards', category: 'Family & Modes', categoryId: 'family', description: 'Link household chores to pocket money credits', isWorldFirst: false, files: ['ChoreRewards.tsx'], libraries: ['Zustand'] },
  { id: 'f080', name: 'Senior Mode', category: 'Family & Modes', categoryId: 'family', description: 'Accessibility-first UI with large fonts and voice support', isWorldFirst: false, files: ['SeniorMode.tsx'], libraries: ['Tailwind'] },
  { id: 'f081', name: 'NRI Center', category: 'Family & Modes', categoryId: 'family', description: 'NRE/NRO account management with FEMA compliance', isWorldFirst: false, files: ['NRICenter.tsx'], libraries: ['React Query'] },
  { id: 'f082', name: 'Dual Currency', category: 'Family & Modes', categoryId: 'family', description: 'View balances in INR and preferred foreign currency', isWorldFirst: false, files: ['DualCurrency.tsx'], libraries: ['React Query'] },
  { id: 'f083', name: 'Business Mode', category: 'Family & Modes', categoryId: 'family', description: 'Separate business account view with GST tracking', isWorldFirst: false, files: ['BusinessMode.tsx'], libraries: ['TanStack Table'] },
  { id: 'f084', name: 'Working Capital', category: 'Family & Modes', categoryId: 'family', description: 'Business liquidity dashboard with cash conversion cycle', isWorldFirst: false, files: ['WorkingCapital.tsx'], libraries: ['Recharts'] },
  { id: 'f085', name: 'Cash Flow', category: 'Family & Modes', categoryId: 'family', description: 'Business cash flow statement generator', isWorldFirst: false, files: ['BusinessCashFlow.tsx'], libraries: ['Recharts'] },
  { id: 'f086', name: 'Family Dashboard', category: 'Family & Modes', categoryId: 'family', description: 'Combined view of all family member finances', isWorldFirst: false, files: ['FamilyDashboard.tsx'], libraries: ['Recharts'] },
  { id: 'f087', name: 'FamilyFort Permissions', category: 'Family & Modes', categoryId: 'family', description: 'Granular role-based access within family accounts', isWorldFirst: false, files: ['FamilyFort.tsx'], libraries: ['Zustand'] },
  { id: 'f088', name: 'Guardian Controls', category: 'Family & Modes', categoryId: 'family', description: 'Approve or deny kids transactions in real-time', isWorldFirst: false, files: ['GuardianControls.tsx'], libraries: ['WebSockets'] },
  { id: 'f089', name: 'Teen Account', category: 'Family & Modes', categoryId: 'family', description: 'Semi-independent account for teenagers with limits', isWorldFirst: false, files: ['TeenAccount.tsx'], libraries: ['Zustand'] },
  { id: 'f090', name: 'Legacy Planning', category: 'Family & Modes', categoryId: 'family', description: 'Nominee management and inheritance document vault', isWorldFirst: false, files: ['LegacyPlanning.tsx'], libraries: ['React Hook Form'] },

  /* AI & Intelligence (16) */
  { id: 'f091', name: 'WealthChat Bot', category: 'AI & Intelligence', categoryId: 'ai', description: 'Conversational AI for all banking and wealth queries', isWorldFirst: false, files: ['WealthChat.tsx'], libraries: ['OpenAI API'] },
  { id: 'f092', name: 'Voice Input', category: 'AI & Intelligence', categoryId: 'ai', description: 'Speech-to-text commands for hands-free banking', isWorldFirst: false, files: ['VoiceInput.tsx'], libraries: ['Web Speech API'] },
  { id: 'f093', name: 'Explainable AI', category: 'AI & Intelligence', categoryId: 'ai', description: 'Understand why the AI made each recommendation', isWorldFirst: false, files: ['ExplainableAI.tsx'], libraries: ['Framer Motion'] },
  { id: 'f094', name: 'Decision Log', category: 'AI & Intelligence', categoryId: 'ai', description: 'Audit trail of every AI-driven decision', isWorldFirst: false, files: ['DecisionLog.tsx'], libraries: ['TanStack Table'] },
  { id: 'f095', name: 'Behavioral Nudges', category: 'AI & Intelligence', categoryId: 'ai', description: 'Psychology-backed prompts to improve financial habits', isWorldFirst: false, files: ['BehavioralNudges.tsx'], libraries: ['Framer Motion'] },
  { id: 'f096', name: 'Wealth Twin', category: 'AI & Intelligence', categoryId: 'ai', description: 'Digital twin modeling your financial future', isWorldFirst: false, files: ['WealthTwin.tsx'], libraries: ['Recharts', 'Framer Motion'] },
  { id: 'f097', name: 'AutoPilot Rules', category: 'AI & Intelligence', categoryId: 'ai', description: 'Set-and-forget automation for savings and investments', isWorldFirst: false, files: ['AutoPilot.tsx'], libraries: ['Zustand'] },
  { id: 'f098', name: 'Green Wealth Index', category: 'AI & Intelligence', categoryId: 'ai', description: 'Score your portfolio carbon footprint', isWorldFirst: false, files: ['GreenIndex.tsx'], libraries: ['Recharts'] },
  { id: 'f099', name: 'Financial Wellness Score', category: 'AI & Intelligence', categoryId: 'ai', description: 'Holistic health score across savings, debt, and protection', isWorldFirst: false, files: ['WellnessScore.tsx'], libraries: ['Recharts'] },
  { id: 'f100', name: 'Sentiment Analysis', category: 'AI & Intelligence', categoryId: 'ai', description: 'News and social sentiment for your holdings', isWorldFirst: false, files: ['SentimentAnalysis.tsx'], libraries: ['TensorFlow.js'] },
  { id: 'f101', name: 'Document AI', category: 'AI & Intelligence', categoryId: 'ai', description: 'Auto-extract data from statements and invoices', isWorldFirst: false, files: ['DocumentAI.tsx'], libraries: ['Tesseract.js'] },
  { id: 'f102', name: 'Natural Language Search', category: 'AI & Intelligence', categoryId: 'ai', description: 'Search transactions with plain English queries', isWorldFirst: false, files: ['NLSearch.tsx'], libraries: ['OpenAI API'] },
  { id: 'f103', name: 'Predictive Alerts', category: 'AI & Intelligence', categoryId: 'ai', description: 'Warn about upcoming low balances or missed payments', isWorldFirst: false, files: ['PredictiveAlerts.tsx'], libraries: ['TensorFlow.js'] },
  { id: 'f104', name: 'Pattern Recognition', category: 'AI & Intelligence', categoryId: 'ai', description: 'Discover hidden spending and earning patterns', isWorldFirst: false, files: ['PatternRecog.tsx'], libraries: ['TensorFlow.js'] },
  { id: 'f105', name: 'Smart Summaries', category: 'AI & Intelligence', categoryId: 'ai', description: 'Weekly and monthly narrative financial summaries', isWorldFirst: false, files: ['SmartSummaries.tsx'], libraries: ['OpenAI API'] },
  { id: 'f106', name: 'AI Concierge', category: 'AI & Intelligence', categoryId: 'ai', description: 'Proactive assistant that reaches out with suggestions', isWorldFirst: false, files: ['AIConcierge.tsx'], libraries: ['OpenAI API', 'Framer Motion'] },

  /* BHAVISHYA Engine (24) */
  { id: 'f107', name: 'Financial DNA Helix', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: '3D double-helix visualization of your financial genome', isWorldFirst: false, files: ['DNAHelix.tsx'], libraries: ['Three.js', 'Framer Motion'] },
  { id: 'f108', name: 'Life Event Predictor', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'AI forecast of major life events and financial impact', isWorldFirst: false, files: ['LifeEventPredictor.tsx'], libraries: ['TensorFlow.js'] },
  { id: 'f109', name: 'Future Self Simulator', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Visualize your future financial self at any age', isWorldFirst: false, files: ['FutureSelf.tsx'], libraries: ['Recharts', 'Framer Motion'] },
  { id: 'f110', name: 'Preparedness Score', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'How ready you are for emergencies and opportunities', isWorldFirst: false, files: ['PreparednessScore.tsx'], libraries: ['Recharts'] },
  { id: 'f111', name: 'Auto-Instrument', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Auto-adjust portfolio based on predicted life changes', isWorldFirst: false, files: ['AutoInstrument.tsx'], libraries: ['Zustand'] },
  { id: 'f112', name: 'Crisis Predictor', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Early warning system for personal financial crises', isWorldFirst: false, files: ['CrisisPredictor.tsx'], libraries: ['TensorFlow.js'] },
  { id: 'f113', name: 'Market Intelligence', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Predictive market signals with confidence intervals', isWorldFirst: false, files: ['MarketIntelligence.tsx'], libraries: ['TensorFlow.js', 'Recharts'] },
  { id: 'f114', name: 'Emotional Resonance', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Map emotional states to financial decision quality', isWorldFirst: false, files: ['EmotionalResonance.tsx'], libraries: ['Recharts'] },
  { id: 'f115', name: 'Generational Wealth', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Multi-generation wealth transfer planning and simulation', isWorldFirst: false, files: ['GenWealth.tsx'], libraries: ['Recharts'] },
  { id: 'f116', name: 'Digital Inheritance', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Secure digital asset handover with smart triggers', isWorldFirst: false, files: ['DigitalInheritance.tsx'], libraries: ['ethers.js'] },
  { id: 'f117', name: 'Community DNA', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Anonymized community financial health comparison', isWorldFirst: false, files: ['CommunityDNA.tsx'], libraries: ['Recharts'] },
  { id: 'f118', name: 'AI Future Twin', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Advanced digital twin with Monte Carlo simulation', isWorldFirst: false, files: ['AIFutureTwin.tsx'], libraries: ['Recharts'] },
  { id: 'f119', name: 'AI Insights Aggregator', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Unified feed of all AI-generated insights', isWorldFirst: false, files: ['InsightsAggregator.tsx'], libraries: ['Zustand'] },
  { id: 'f120', name: 'Chakra Balance', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Eastern philosophy-inspired financial wellness mapping', isWorldFirst: false, files: ['ChakraBalance.tsx'], libraries: ['Framer Motion'] },
  { id: 'f121', name: 'Festival Planner', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Predict and budget for festival spending spikes', isWorldFirst: false, files: ['FestivalPlanner.tsx'], libraries: ['date-fns'] },
  { id: 'f122', name: 'Neural Network Viz', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Visualize the AI neural network thinking about your wealth', isWorldFirst: false, files: ['NeuralViz.tsx'], libraries: ['Canvas API'] },
  { id: 'f123', name: 'Temporal Wealth', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Time-based wealth trajectory with alternate timelines', isWorldFirst: false, files: ['TemporalWealth.tsx'], libraries: ['Recharts', 'Framer Motion'] },
  { id: 'f124', name: 'Quantum Lock', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Quantum-inspired encryption for sensitive future plans', isWorldFirst: false, files: ['QuantumLock.tsx'], libraries: ['noble-ciphers'] },
  { id: 'f125', name: 'Time Machine', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Rewind and replay historical financial decisions', isWorldFirst: false, files: ['TimeMachine.tsx'], libraries: ['Framer Motion'] },
  { id: 'f126', name: 'Emotional Heatmap', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Calendar heatmap of financial stress and joy moments', isWorldFirst: false, files: ['EmotionalHeatmap.tsx'], libraries: ['Recharts'] },
  { id: 'f127', name: 'Prosperity Score', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Holistic life prosperity index beyond just money', isWorldFirst: false, files: ['ProsperityScore.tsx'], libraries: ['Recharts'] },
  { id: 'f128', name: 'Destiny Mapper', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Goal-path optimization with branching scenario trees', isWorldFirst: false, files: ['DestinyMapper.tsx'], libraries: ['D3.js'] },
  { id: 'f129', name: 'Karmic Wealth', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Track charitable giving and social impact returns', isWorldFirst: false, files: ['KarmicWealth.tsx'], libraries: ['Recharts'] },
  { id: 'f130', name: 'Cosmic Alignment', category: 'BHAVISHYA Engine', categoryId: 'bhavishya', description: 'Astronomical event correlation with market sentiment', isWorldFirst: false, files: ['CosmicAlignment.tsx'], libraries: ['React Query'] },

  /* Payments & Transfers (12) */
  { id: 'f131', name: 'UPI Integration', category: 'Payments & Transfers', categoryId: 'payments', description: 'Seamless UPI payments with intent flow and QR', isWorldFirst: false, files: ['UPIPayments.tsx'], libraries: ['NPCI SDK'] },
  { id: 'f132', name: 'IMPS/NEFT/RTGS', category: 'Payments & Transfers', categoryId: 'payments', description: 'Traditional banking rails with smart routing', isWorldFirst: false, files: ['BankTransfers.tsx'], libraries: ['React Query'] },
  { id: 'f133', name: 'International Wire', category: 'Payments & Transfers', categoryId: 'payments', description: 'Cross-border remittances with FX optimization', isWorldFirst: false, files: ['IntlWire.tsx'], libraries: ['React Query'] },
  { id: 'f134', name: 'Bulk Payments', category: 'Payments & Transfers', categoryId: 'payments', description: 'Upload and execute bulk payment files for business', isWorldFirst: false, files: ['BulkPayments.tsx'], libraries: ['PapaParse'] },
  { id: 'f135', name: 'Scheduled Transfers', category: 'Payments & Transfers', categoryId: 'payments', description: 'Recurring future-dated transfers with calendar view', isWorldFirst: false, files: ['ScheduledXfer.tsx'], libraries: ['date-fns'] },
  { id: 'f136', name: 'Standing Instructions', category: 'Payments & Transfers', categoryId: 'payments', description: 'Auto-debit setup and management for SIPs and bills', isWorldFirst: false, files: ['StandingInstr.tsx'], libraries: ['Zustand'] },
  { id: 'f137', name: 'QR Code Payments', category: 'Payments & Transfers', categoryId: 'payments', description: 'Generate and scan QR for instant payments', isWorldFirst: false, files: ['QRPayments.tsx'], libraries: ['qrcode'] },
  { id: 'f138', name: 'Contactless NFC', category: 'Payments & Transfers', categoryId: 'payments', description: 'Tap-to-pay using device NFC on supported terminals', isWorldFirst: false, files: ['NFCPay.tsx'], libraries: ['Web NFC'] },
  { id: 'f139', name: 'Payment Links', category: 'Payments & Transfers', categoryId: 'payments', description: 'Create shareable payment request links', isWorldFirst: false, files: ['PaymentLinks.tsx'], libraries: ['Zustand'] },
  { id: 'f140', name: 'Auto-Sweep', category: 'Payments & Transfers', categoryId: 'payments', description: 'Auto-move excess balance to high-yield deposits', isWorldFirst: false, files: ['AutoSweep.tsx'], libraries: ['Zustand'] },
  { id: 'f141', name: 'Multi-Bank Sync', category: 'Payments & Transfers', categoryId: 'payments', description: 'View balances and initiate transfers across all banks', isWorldFirst: false, files: ['MultiBank.tsx'], libraries: ['React Query'] },
  { id: 'f142', name: 'Real-Time Settlement', category: 'Payments & Transfers', categoryId: 'payments', description: 'Instant confirmation and ledger update for all payments', isWorldFirst: false, files: ['RTSettlement.tsx'], libraries: ['WebSockets'] },

  /* Innovation Lab (13) */
  { id: 'f143', name: 'Neuro-Friction Banking', category: 'Innovation Lab', categoryId: 'innovation', description: 'Brain-computer interface for hands-free authentication and commands', isWorldFirst: true, files: ['NeuroFriction.tsx'], libraries: ['WebNN', 'TensorFlow.js'] },
  { id: 'f144', name: 'Monte Carlo Life Simulator', category: 'Innovation Lab', categoryId: 'innovation', description: '10,000-run probabilistic life outcome simulator', isWorldFirst: true, files: ['MonteCarloLife.tsx'], libraries: ['Web Workers', 'Recharts'] },
  { id: 'f145', name: 'Collective Immune System', category: 'Innovation Lab', categoryId: 'innovation', description: 'Community-powered fraud detection via federated learning', isWorldFirst: true, files: ['CollectiveImmune.tsx'], libraries: ['TensorFlow.js', 'Web Workers'] },
  { id: 'f146', name: 'Autonomous Financial Agent', category: 'Innovation Lab', categoryId: 'innovation', description: 'AI agent that negotiates bills and optimizes investments autonomously', isWorldFirst: true, files: ['AutonomousAgent.tsx'], libraries: ['OpenAI API', 'Zustand'] },
  { id: 'f147', name: 'Sovereign Data Vault', category: 'Innovation Lab', categoryId: 'innovation', description: 'User-owned encrypted data store with zero-knowledge proofs', isWorldFirst: true, files: ['SovereignVault.tsx'], libraries: ['snarkjs', 'IPFS'] },
  { id: 'f148', name: 'Fantasy League', category: 'Innovation Lab', categoryId: 'innovation', description: 'Compete with friends on virtual portfolio performance', isWorldFirst: false, files: ['FantasyLeague.tsx'], libraries: ['Zustand'] },
  { id: 'f149', name: 'Values Alignment', category: 'Innovation Lab', categoryId: 'innovation', description: 'Match investments to personal ethical values and UN SDGs', isWorldFirst: false, files: ['ValuesAlign.tsx'], libraries: ['Recharts'] },
  { id: 'f150', name: 'Boosts & Streaks', category: 'Innovation Lab', categoryId: 'innovation', description: 'Gamified power-ups for consistent saving behavior', isWorldFirst: false, files: ['BoostsStreaks.tsx'], libraries: ['Framer Motion'] },
  { id: 'f151', name: 'Social Investing', category: 'Innovation Lab', categoryId: 'innovation', description: 'Follow and copy-trade top community investors', isWorldFirst: false, files: ['SocialInvest.tsx'], libraries: ['React Query'] },
  { id: 'f152', name: 'Gamified Challenges', category: 'Innovation Lab', categoryId: 'innovation', description: 'Monthly savings challenges with leaderboard rewards', isWorldFirst: false, files: ['GamifiedChallenges.tsx'], libraries: ['Framer Motion', 'Zustand'] },
  { id: 'f153', name: 'AR Portfolio View', category: 'Innovation Lab', categoryId: 'innovation', description: 'View 3D portfolio visualization in augmented reality', isWorldFirst: false, files: ['ARPortfolio.tsx'], libraries: ['Three.js', 'WebXR'] },
  { id: 'f154', name: 'Voice Biometrics', category: 'Innovation Lab', categoryId: 'innovation', description: 'Speaker recognition for seamless authentication', isWorldFirst: false, files: ['VoiceBio.tsx'], libraries: ['TensorFlow.js'] },
  { id: 'f155', name: 'Haptic Feedback', category: 'Innovation Lab', categoryId: 'innovation', description: 'Tactile response patterns for transaction confirmations', isWorldFirst: false, files: ['HapticFeedback.tsx'], libraries: ['Vibration API'] },
  { id: 'f156', name: 'Quantum Randomness', category: 'Innovation Lab', categoryId: 'innovation', description: 'Quantum-inspired true random number generation for security', isWorldFirst: false, files: ['QuantumRandom.tsx'], libraries: ['Web Crypto'] },
];

const WORLD_FIRSTS: WorldFirstInnovation[] = [
  {
    id: 'wf1',
    name: 'Neuro-Friction Banking',
    icon: 'fa-brain',
    tagline: 'Bank with your mind',
    description: 'The first banking interface powered by brain-computer interaction. Users authenticate and execute commands via neural signals, eliminating passwords, PINs, and even touch.',
    whyUnique: 'No bank in the world offers BCI-powered authentication or transaction authorization. We integrate consumer-grade EEG headsets with custom signal processing to detect intent patterns.',
    howItWorks: '1. User wears EEG headset\n2. System learns unique neural signature\n3. Concentration pattern confirms intent\n4. Command executed without physical input',
    techStack: ['WebNN API', 'TensorFlow.js', 'EEG Signal Processing', 'Web Crypto'],
    color: '#7C3AED',
    glow: '#A78BFA',
  },
  {
    id: 'wf2',
    name: 'Monte Carlo Life Simulator',
    icon: 'fa-dice-d20',
    tagline: 'See 10,000 possible futures',
    description: 'Run 10,000 probabilistic simulations of your entire financial life — career changes, market crashes, health events, inheritance — all in under 3 seconds.',
    whyUnique: 'While Monte Carlo exists in portfolio tools, no bank runs full life simulations including career, health, and relationship variables with real-time web-based computation.',
    howItWorks: '1. Input life variables and goals\n2. Web Workers spawn 10,000 parallel threads\n3. Each thread simulates a unique life path\n4. Aggregate results show confidence intervals',
    techStack: ['Web Workers', 'Recharts', 'Probabilistic Graph Models', 'Framer Motion'],
    color: '#0EA5E9',
    glow: '#38BDF8',
  },
  {
    id: 'wf3',
    name: 'Collective Immune System',
    icon: 'fa-shield-virus',
    tagline: 'The bank that learns from everyone',
    description: 'A federated learning network where the bank fraud detection model improves from every user without ever seeing their private data. Privacy-preserving collective intelligence.',
    whyUnique: 'Traditional banks use centralized fraud models. We use federated learning so the model learns from the community while data stays on-device, a world-first in consumer banking.',
    howItWorks: '1. Local model trains on-device\n2. Only gradient updates sent to server\n3. Global model aggregates updates\n4. Improved model distributed to all users',
    techStack: ['TensorFlow.js Federated', 'Differential Privacy', 'Secure Aggregation', 'Web Workers'],
    color: '#10B981',
    glow: '#34D399',
  },
  {
    id: 'wf4',
    name: 'Autonomous Financial Agent',
    icon: 'fa-robot',
    tagline: 'Your AI that acts, not just advises',
    description: 'An AI agent with limited autonomy to negotiate bills, switch to better rates, rebalance portfolios, and optimize tax harvesting — all within user-defined guardrails.',
    whyUnique: 'Robo-advisors recommend. Our agent acts. With explicit user consent boundaries, it proactively improves your finances while you sleep. No bank offers true financial autonomy.',
    howItWorks: '1. User sets guardrails and budgets\n2. Agent monitors market and bills 24/7\n3. Identifies optimization opportunities\n4. Executes within bounds, reports actions',
    techStack: ['OpenAI GPT-4', 'LangChain', 'Zustand', 'REST APIs', 'WebSockets'],
    color: '#F59E0B',
    glow: '#FBBF24',
  },
  {
    id: 'wf5',
    name: 'Sovereign Data Vault',
    icon: 'fa-vault',
    tagline: 'You own your data. Period.',
    description: 'A zero-knowledge encrypted vault where your financial data is stored with keys only you possess. The bank cannot access it, governments cannot subpoena it, hackers cannot breach it.',
    whyUnique: 'All banks hold your data. We give you cryptographic proof that we cannot read it. Using zk-SNARKs and IPFS, your data is mathematically private.',
    howItWorks: '1. Data encrypted client-side with your key\n2. Encrypted blob stored on IPFS\n3. zk-SNARK proves validity without revealing content\n4. Only you can decrypt and access',
    techStack: ['snarkjs', 'IPFS', 'noble-ciphers', 'Web Crypto API'],
    color: '#EC4899',
    glow: '#F472B6',
  },
];

/* ─── PERSONA COVERAGE MATRIX ─── */

const PERSONAS = [
  { id: 'retail', name: 'Retail', icon: 'fa-user' },
  { id: 'nri', name: 'NRI', icon: 'fa-globe' },
  { id: 'business', name: 'Business', icon: 'fa-building' },
  { id: 'senior', name: 'Senior', icon: 'fa-person-cane' },
  { id: 'kids', name: 'Kids', icon: 'fa-child' },
];

const CAPABILITY_MATRIX: { category: string; coverage: number[] }[] = [
  { category: 'Dashboard', coverage: [100, 85, 70, 95, 40] },
  { category: 'Wealth', coverage: [100, 90, 80, 75, 20] },
  { category: 'Market', coverage: [100, 95, 85, 60, 10] },
  { category: 'Security', coverage: [100, 100, 100, 100, 80] },
  { category: 'Transactions', coverage: [100, 90, 95, 90, 50] },
  { category: 'Family', coverage: [80, 60, 90, 85, 100] },
  { category: 'AI', coverage: [100, 85, 75, 70, 30] },
  { category: 'BHAVISHYA', coverage: [100, 80, 65, 55, 25] },
  { category: 'Payments', coverage: [100, 95, 90, 85, 30] },
  { category: 'Innovation', coverage: [100, 70, 60, 40, 20] },
];

/* ─── USER JOURNEY FLOWCHART DATA ─── */

const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'discover',
    title: 'Discover',
    subtitle: 'Onboarding & Assessment',
    features: ['KYC Verification', 'Wealth DNA Quiz', 'Risk Profiling', 'Account Aggregation'],
    color: '#1B5E20',
    depth: 0,
  },
  {
    id: 'plan',
    title: 'Plan',
    subtitle: 'Goals & Strategy',
    features: ['Goal Setting', 'SIP Planning', 'Tax Optimization', 'Emergency Fund'],
    color: '#1565C0',
    depth: 1,
  },
  {
    id: 'protect',
    title: 'Protect',
    subtitle: 'Security & Insurance',
    features: ['Risk Assessment', 'Insurance Gaps', 'Fraud Shield', 'Duress Mode'],
    color: '#B71C1C',
    depth: 2,
  },
  {
    id: 'grow',
    title: 'Grow',
    subtitle: 'Invest & Optimize',
    features: ['Portfolio Rebalance', 'Market Signals', 'ESG Scoring', 'AutoPilot Rules'],
    color: '#E65100',
    depth: 1,
  },
  {
    id: 'predict',
    title: 'Predict',
    subtitle: 'BHAVISHYA AI Engine',
    features: ['Life Events', 'Crisis Forecast', 'Future Self', 'Generational Wealth'],
    color: '#FFD700',
    depth: 0,
  },
];

/* ─── FEATURE EVOLUTION TIMELINE ─── */

const EVOLUTION_TIMELINE: EvolutionPhase[] = [
  { phase: 'Foundation', features: ['Dashboard', 'Transactions', 'Goals', 'Portfolio'], count: 4, color: '#1B5E20' },
  { phase: 'Intelligence', features: ['AI Recommendations', 'Wealth Twin', 'Market Data', 'Risk Meter'], count: 8, color: '#1565C0' },
  { phase: 'Security', features: ['Fraud Detection Engine', 'Panic Button', 'Duress Mode', 'Biometrics', 'Threat Intel'], count: 14, color: '#B71C1C' },
  { phase: 'Specialized', features: ['NRI Mode', 'Kids Mode', 'Business', 'Senior Mode', 'Digital Gold'], count: 22, color: '#6A1B9A' },
  { phase: 'BHAVISHYA v1', features: ['DNA Helix', 'Event Predictor', 'Future Self', 'Preparedness'], count: 31, color: '#E65100' },
  { phase: 'BHAVISHYA v3', features: ['Crisis Predictor', 'Market Intel', 'Emotional AI', 'Generational Wealth'], count: 47, color: '#4527A0' },
  { phase: 'BHAVISHYA v4', features: ['Neural Viz', 'Temporal Wealth', 'Quantum Lock', 'Time Machine', 'Heatmap', 'Prosperity'], count: 64, color: '#FFD700' },
  { phase: 'Present', features: ['159 Features', '10 Galaxies', '5 World-Firsts', '5 Personas', 'Payments Hub', 'Innovation Lab'], count: 159, color: '#00838F' },
];

/* ─── CATEGORY CHIP CONFIG ─── */

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  dashboard: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  wealth: { color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  market: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  security: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  transactions: { color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  family: { color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  ai: { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  bhavishya: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  payments: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  innovation: { color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 1: HERO STATS BAR
   ═══════════════════════════════════════════════════════════════ */

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || hasAnimated.current) return;
    hasAnimated.current = true;
    const controls = animate(0, target, {
      duration: 2.2,
      ease: 'easeOut',
      onUpdate: (value: number) => {
        if (node) node.textContent = Math.round(value).toString() + suffix;
      },
    });
    return () => controls.stop();
  }, [target, suffix]);

  return <span ref={nodeRef}>0{suffix}</span>;
}

const HERO_STATS = [
  { label: 'Features', value: TOTAL_FEATURES, suffix: '', icon: 'fa-cubes', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { label: 'World-First Innovations', value: 5, suffix: '', icon: 'fa-globe', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { label: 'Feature Galaxies', value: TOTAL_GALAXIES, suffix: '', icon: 'fa-atom', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  { label: 'Persona Modes', value: 5, suffix: '', icon: 'fa-users', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { label: 'Security Layers', value: 10, suffix: '', icon: 'fa-shield-halved', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  { label: 'React Components', value: 150, suffix: '+', icon: 'fa-code', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
];

function HeroStatsBar() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {HERO_STATS.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className={`relative rounded-xl border ${stat.border} ${stat.bg} backdrop-blur-sm p-4 text-center`}
        >
          <div className={`text-2xl font-extrabold ${stat.color}`}>
            <AnimatedCounter target={stat.value} suffix={stat.suffix} />
          </div>
          <div className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
            <i className={`fas ${stat.icon} mr-1 opacity-60`} />
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 2: SEARCHABLE FEATURE EXPLORER GRID
   ═══════════════════════════════════════════════════════════════ */

const ALL_CATEGORIES = Array.from(new Set(FEATURES.map((f) => f.category)));

function FeatureExplorerGrid() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [worldFirstOnly, setWorldFirstOnly] = useState(false);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return FEATURES.filter((f) => {
      const matchesSearch =
        !term ||
        f.name.toLowerCase().includes(term) ||
        f.description.toLowerCase().includes(term) ||
        f.category.toLowerCase().includes(term) ||
        f.files.some((file) => file.toLowerCase().includes(term)) ||
        f.libraries.some((lib) => lib.toLowerCase().includes(term));
      const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
      const matchesWorldFirst = !worldFirstOnly || f.isWorldFirst;
      return matchesSearch && matchesCategory && matchesWorldFirst;
    });
  }, [search, selectedCategory, worldFirstOnly]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 159 features by name, description, files, libraries..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
            >
              <i className="fas fa-times" />
            </button>
          )}
        </div>
        <button
          onClick={() => setWorldFirstOnly((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
            worldFirstOnly
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
              : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <i className="fas fa-globe" />
          World-First Only
        </button>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
            selectedCategory === 'All'
              ? 'bg-white/10 border-white/20 text-white'
              : 'bg-slate-900/30 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
          }`}
        >
          All ({FEATURES.length})
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const count = FEATURES.filter((f) => f.category === cat).length;
          const cfg = CATEGORY_CONFIG[FEATURES.find((f) => f.category === cat)?.categoryId || 'dashboard'];
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(isActive ? 'All' : cat)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                isActive
                  ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                  : 'bg-slate-900/30 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <div className="text-[11px] text-slate-500 font-medium">
        Showing <span className="text-white font-bold">{filtered.length}</span> of {FEATURES.length} features
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((feature) => {
            const cfg = CATEGORY_CONFIG[feature.categoryId] || CATEGORY_CONFIG.dashboard;
            return (
              <motion.div
                key={feature.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                className={`group relative rounded-xl border p-4 transition-all ${
                  feature.isWorldFirst
                    ? 'bg-gradient-to-br from-amber-500/5 to-rose-500/5 border-amber-500/20 hover:border-amber-400/40'
                    : 'bg-slate-900/40 border-slate-700/50 hover:border-slate-500'
                }`}
              >
                {feature.isWorldFirst && (
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-extrabold uppercase tracking-wider shadow-lg shadow-amber-500/20">
                    <i className="fas fa-globe mr-0.5" />
                    World First
                  </div>
                )}
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                    {feature.category}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1 group-hover:text-sky-300 transition-colors">
                  {feature.name}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{feature.description}</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider mb-1">Key Files</p>
                    <div className="flex flex-wrap gap-1">
                      {feature.files.map((file) => (
                        <span key={file} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {file}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider mb-1">Libraries</p>
                    <div className="flex flex-wrap gap-1">
                      {feature.libraries.map((lib) => (
                        <span key={lib} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-500 border border-slate-700/50">
                          {lib}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-search text-slate-600 text-3xl mb-3" />
          <p className="text-sm text-slate-400">No features match your filters</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('All'); setWorldFirstOnly(false); }}
            className="mt-2 text-xs text-sky-400 hover:text-sky-300 font-semibold"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 3: INNOVATION SPOTLIGHT
   ═══════════════════════════════════════════════════════════════ */

function InnovationSpotlight() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = WORLD_FIRSTS[activeIdx];

  return (
    <div className="space-y-4">
      {/* Selector tabs */}
      <div className="flex flex-wrap gap-2">
        {WORLD_FIRSTS.map((wf, i) => (
          <button
            key={wf.id}
            onClick={() => setActiveIdx(i)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold border transition-all ${
              i === activeIdx
                ? 'text-white shadow-lg'
                : 'bg-slate-900/30 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
            }`}
            style={
              i === activeIdx
                ? { background: `linear-gradient(135deg, ${wf.color}30, ${wf.color}10)`, borderColor: `${wf.glow}50`, boxShadow: `0 0 20px ${wf.color}20` }
                : {}
            }
          >
            <i className={`fas ${wf.icon}`} style={{ color: i === activeIdx ? wf.glow : 'inherit' }} />
            {wf.name}
          </button>
        ))}
      </div>

      {/* Active card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="relative rounded-2xl border overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${active.color}08, ${active.color}02)`,
            borderColor: `${active.glow}25`,
          }}
        >
          {/* Glow orb */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: active.glow }}
          />

          <div className="relative p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Icon & badge */}
              <div className="flex-shrink-0">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl"
                  style={{
                    background: `linear-gradient(135deg, ${active.color}30, ${active.color}10)`,
                    border: `1px solid ${active.glow}40`,
                    color: active.glow,
                    boxShadow: `0 0 30px ${active.color}30`,
                  }}
                >
                  <i className={`fas ${active.icon}`} />
                </div>
                <div className="mt-3 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
                  <i className="fas fa-globe" />
                  World First
                </div>
              </div>

              {/* Right: Content */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl lg:text-2xl font-extrabold text-white">{active.name}</h3>
                  <p className="text-sm font-medium mt-1" style={{ color: active.glow }}>{active.tagline}</p>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">{active.description}</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl p-4 bg-slate-900/50 border border-slate-700/50">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <i className="fas fa-question-circle text-sky-400" />
                      Why No Bank Has It
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">{active.whyUnique}</p>
                  </div>
                  <div className="rounded-xl p-4 bg-slate-900/50 border border-slate-700/50">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <i className="fas fa-cogs text-emerald-400" />
                      How It Works
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{active.howItWorks}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {active.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] px-3 py-1.5 rounded-lg font-semibold border"
                        style={{
                          background: `${active.color}15`,
                          borderColor: `${active.glow}25`,
                          color: active.glow,
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   SECTION 4: INTERACTIVE 3D GALAXY (ENHANCED)
   ═══════════════════════════════════════════════════════════════ */

interface ProjectedPlanet {
  galaxy: FeatureNode;
  screenX: number;
  screenY: number;
  depthScale: number;
  z: number;
  angle: number;
}

interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number; }
interface Nebula { x: number; y: number; r: number; color: string; drift: number; pulse: number; }
interface ShootingStar { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; }

function GalaxyOrbital() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotY, setRotY] = useState(25);
  const [rotX, setRotX] = useState(-12);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dims, setDims] = useState({ w: 800, h: 520 });
  const [entered, setEntered] = useState(false);

  const dragStart = useRef({ x: 0, y: 0, rotY: 0, rotX: 0, time: 0 });
  const autoRot = useRef(25);
  const momentum = useRef({ vy: 0, vx: 0 });
  const particles = useRef<Particle[]>([]);
  const nebulas = useRef<Nebula[]>([]);
  const shootingStars = useRef<ShootingStar[]>([]);
  const stars = useRef<{ x: number; y: number; z: number; size: number; brightness: number; layer: number }[]>([]);
  const raf = useRef<number>(0);
  const lastTime = useRef(0);

  useEffect(() => {
    const measure = () => {
      const r = containerRef.current?.getBoundingClientRect();
      if (r) setDims({ w: r.width, h: r.height });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (stars.current.length > 0) return;
    for (let layer = 0; layer < 3; layer++) {
      const count = layer === 0 ? 80 : layer === 1 ? 150 : 250;
      const spread = layer === 0 ? 1500 : layer === 1 ? 2500 : 4000;
      for (let i = 0; i < count; i++) {
        stars.current.push({
          x: (Math.random() - 0.5) * spread,
          y: (Math.random() - 0.5) * spread * 0.7,
          z: Math.random() * spread * 0.5 - spread * 0.25,
          size: (Math.random() * 1.5 + 0.2) * (layer === 0 ? 1.5 : layer === 1 ? 1 : 0.6),
          brightness: Math.random() * 0.6 + 0.2,
          layer,
        });
      }
    }
    GALAXIES.forEach((g) => {
      nebulas.current.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 500,
        r: 150 + Math.random() * 200,
        color: g.glow,
        drift: Math.random() * Math.PI * 2,
        pulse: Math.random() * Math.PI * 2,
      });
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { autoRot.current -= 3; setRotY(autoRot.current); }
      else if (e.key === 'ArrowRight') { autoRot.current += 3; setRotY(autoRot.current); }
      else if (e.key === 'ArrowUp') { setRotX((p) => Math.max(-40, p - 2)); }
      else if (e.key === 'ArrowDown') { setRotX((p) => Math.min(20, p + 2)); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const planets = useMemo((): ProjectedPlanet[] => {
    const PERSPECTIVE = 1600;
    const RADIUS = Math.min(dims.w, dims.h) * 0.32;
    const TILT = 0.12;
    const CX = dims.w / 2;
    const CY = dims.h / 2;
    const radY = (rotY * Math.PI) / 180;
    const radX = (rotX * Math.PI) / 180;
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const result = GALAXIES.map((galaxy, i) => {
      const angle = (i / GALAXIES.length) * Math.PI * 2;
      const x = Math.sin(angle) * RADIUS;
      const y = -Math.cos(angle) * RADIUS * Math.sin(TILT);
      const z = Math.cos(angle) * RADIUS * Math.cos(TILT);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const depthScale = PERSPECTIVE / (PERSPECTIVE - z2);
      return { galaxy, screenX: CX + x1 * depthScale, screenY: CY + y2 * depthScale, depthScale, z: z2, angle: (i / GALAXIES.length) * 360 };
    });
    return result.sort((a, b) => a.z - b.z);
  }, [rotX, rotY, dims.w, dims.h]);

  const spawnParticles = useCallback((sx: number, sy: number, color: string) => {
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30 + Math.random() * 0.3;
      const speed = 1.5 + Math.random() * 3.5;
      particles.current.push({ x: sx, y: sy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, maxLife: 0.6 + Math.random() * 0.8, color, size: 1.5 + Math.random() * 2.5 });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const PERSPECTIVE = 1600;
    const RADIUS = Math.min(dims.w, dims.h) * 0.32;
    const TILT = 0.12;
    const CX = dims.w / 2;
    const CY = dims.h / 2;

    const renderLoop = (time: number) => {
      const dt = Math.min((time - lastTime.current) / 1000, 0.05) || 0.016;
      lastTime.current = time;

      if (!isDragging && (Math.abs(momentum.current.vy) > 0.1 || Math.abs(momentum.current.vx) > 0.1)) {
        const decay = Math.pow(0.92, dt * 60);
        momentum.current.vy *= decay;
        momentum.current.vx *= decay;
        autoRot.current += momentum.current.vy * dt * 60;
        setRotY(autoRot.current);
        setRotX((p) => Math.max(-40, Math.min(20, p + momentum.current.vx * dt * 60)));
      }

      if (!isDragging && !hovered && Math.abs(momentum.current.vy) < 0.1) {
        autoRot.current += 0.08;
        setRotY(autoRot.current);
      }

      if (Math.random() < 0.008) {
        shootingStars.current.push({ x: Math.random() * dims.w, y: Math.random() * dims.h * 0.5, vx: -3 - Math.random() * 4, vy: 1 + Math.random() * 2, life: 1, maxLife: 0.5 + Math.random() * 0.5 });
      }

      particles.current = particles.current.filter((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.02; p.life -= dt / p.maxLife; return p.life > 0; });
      shootingStars.current = shootingStars.current.filter((s) => { s.x += s.vx; s.y += s.vy; s.life -= dt / s.maxLife; return s.life > 0; });

      canvas.width = dims.w;
      canvas.height = dims.h;
      ctx.clearRect(0, 0, dims.w, dims.h);

      const radY = (rotY * Math.PI) / 180;
      const radX = (rotX * Math.PI) / 180;
      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);
      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);

      nebulas.current.forEach((neb) => {
        neb.drift += dt * 0.1;
        neb.pulse += dt * 0.5;
        const px = CX + Math.sin(neb.drift) * 200;
        const py = CY + Math.cos(neb.drift * 0.7) * 120;
        const pr = neb.r * (0.9 + Math.sin(neb.pulse) * 0.1);
        const grad = ctx.createRadialGradient(px, py, 0, px, py, pr);
        grad.addColorStop(0, neb.color + '10');
        grad.addColorStop(0.5, neb.color + '04');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, dims.w, dims.h);
      });

      stars.current.forEach((star) => {
        const parallax = star.layer === 0 ? 0.3 : star.layer === 1 ? 0.15 : 0.05;
        const x = star.x + rotY * parallax * 10;
        const y = star.y - rotX * parallax * 5;
        const z = star.z;
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        if (z2 > PERSPECTIVE - 10) return;
        const scale = PERSPECTIVE / (PERSPECTIVE - z2);
        const sx = CX + x1 * scale;
        const sy = CY + y2 * scale;
        if (sx < -10 || sx > dims.w + 10 || sy < -10 || sy > dims.h + 10) return;
        const twinkle = 0.6 + Math.sin(time * 0.003 + star.x * 0.1) * 0.4;
        const alpha = star.brightness * twinkle * Math.min(scale, 1) * (star.layer === 0 ? 1 : star.layer === 1 ? 0.7 : 0.4);
        const s = star.size * scale * 0.4;
        ctx.beginPath();
        ctx.arc(sx, sy, s, 0, Math.PI * 2);
        ctx.fillStyle = star.layer === 0 ? `rgba(255, 240, 200, ${alpha})` : `rgba(200, 220, 255, ${alpha})`;
        ctx.fill();
        if (star.layer === 0 && alpha > 0.5) {
          ctx.beginPath();
          ctx.arc(sx, sy, s * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 240, 200, ${alpha * 0.15})`;
          ctx.fill();
        }
      });

      const drawOrbitRing = (r: number, color: string, dash: boolean, glow: boolean) => {
        const points: { x: number; y: number }[] = [];
        for (let a = 0; a <= 360; a += 2) {
          const rad = (a * Math.PI) / 180;
          const x = Math.sin(rad) * r;
          const y = -Math.cos(rad) * r * Math.sin(TILT);
          const z = Math.cos(rad) * r * Math.cos(TILT);
          const x1 = x * cosY + z * sinY;
          const z1 = -x * sinY + z * cosY;
          const y2 = y * cosX - z1 * sinX;
          const z2 = y * sinX + z1 * cosX;
          const scale = PERSPECTIVE / (PERSPECTIVE - z2);
          points.push({ x: CX + x1 * scale, y: CY + y2 * scale });
        }
        if (glow) {
          ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
          ctx.closePath();
          ctx.strokeStyle = color.replace(/[\d.]+%?\)$/, '0.12)');
          ctx.lineWidth = 5;
          ctx.stroke();
        }
        ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        if (dash) ctx.setLineDash([8, 8]);
        else ctx.setLineDash([]);
        ctx.stroke();
        ctx.setLineDash([]);
      };
      drawOrbitRing(RADIUS * 0.6, 'rgba(255,255,255,0.04)', false, false);
      drawOrbitRing(RADIUS, 'rgba(255,255,255,0.08)', true, true);
      drawOrbitRing(RADIUS * 1.35, 'rgba(255,215,0,0.06)', true, true);

      const connections = [[0,2],[0,6],[1,2],[1,7],[3,4],[3,6],[4,7],[5,0],[8,4],[9,6]];
      ctx.save();
      connections.forEach(([a,b]) => {
        const pa = projectPlanet(a, RADIUS, TILT, CX, CY, PERSPECTIVE, cosY, sinY, cosX, sinX);
        const pb = projectPlanet(b, RADIUS, TILT, CX, CY, PERSPECTIVE, cosY, sinY, cosX, sinX);
        const dashOffset = (time * 0.02) % 20;
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.04)';
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 12]);
        ctx.lineDashOffset = -dashOffset;
        ctx.stroke();
        ctx.setLineDash([]);
      });
      ctx.restore();

      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + time * 0.0003;
        const rayLen = 50 + Math.sin(time * 0.001 + i) * 15;
        const alpha = 0.03 + Math.sin(time * 0.002 + i * 0.5) * 0.02;
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.lineTo(CX + Math.cos(angle) * (35 + rayLen), CY + Math.sin(angle) * (35 + rayLen));
        ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      shootingStars.current.forEach((s) => {
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 4, s.y - s.vy * 4);
        grad.addColorStop(0, `rgba(255, 255, 255, ${s.life})`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 3, s.y - s.vy * 3);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      particles.current.forEach((p) => {
        const alpha = p.life * p.life;
        const hex = Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color + hex;
        ctx.fill();
      });

      raf.current = requestAnimationFrame(renderLoop);
    };
    raf.current = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(raf.current);
  }, [dims.w, dims.h, isDragging, hovered, rotX, rotY]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    momentum.current = { vy: 0, vx: 0 };
    dragStart.current = { x: e.clientX, y: e.clientY, rotY: autoRot.current, rotX, time: Date.now() };
  }, [rotX]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    autoRot.current = dragStart.current.rotY + dx * 0.35;
    setRotY(autoRot.current);
    setRotX(Math.max(-40, Math.min(20, dragStart.current.rotX - dy * 0.25)));
  }, [isDragging]);

  const onPointerUp = useCallback(() => {
    const dt = (Date.now() - dragStart.current.time) / 1000;
    const dx = autoRot.current - dragStart.current.rotY;
    const dy = rotX - dragStart.current.rotX;
    if (dt > 0 && dt < 0.5) {
      momentum.current = { vy: dx / dt * 0.016, vx: dy / dt * 0.016 };
    }
    setIsDragging(false);
  }, [rotX]);

  const handlePlanetClick = useCallback((id: string, screenX: number, screenY: number, color: string) => {
    setSelected((prev) => {
      const next = prev === id ? null : id;
      if (next) spawnParticles(screenX, screenY, color);
      return next;
    });
  }, [spawnParticles]);

  const selectedPlanet = selected ? planets.find((p) => p.galaxy.id === selected) : null;

  useEffect(() => {
    if (!selectedPlanet) return;
    const targetAngle = selectedPlanet.angle;
    const currentAngle = ((rotY % 360) + 360) % 360;
    let diff = targetAngle - currentAngle;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    if (Math.abs(diff) > 30) {
      const newRotY = rotY + diff * 0.3;
      autoRot.current = newRotY;
      // Schedule rotation update via raf to avoid synchronous setState in effect
      requestAnimationFrame(() => setRotY(newRotY));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, planets, rotY]);

  return (
    <div className="relative">
      <div className="text-center mb-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center justify-center gap-2">
          <i className="fas fa-atom text-amber-500" />
          Feature Galaxy — {TOTAL_GALAXIES} Constellations, {TOTAL_FEATURES} Capabilities
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          <i className="fas fa-hand-pointer mr-1" />
          Drag to orbit · Hover to pause · Click planet to explore · Arrow keys to navigate
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative h-[520px] overflow-hidden rounded-2xl select-none"
        style={{
          background: 'radial-gradient(ellipse at center, #0f172a 0%, #070d1a 50%, #000000 100%)',
          cursor: isDragging ? 'grabbing' : 'grab',
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.5), 0 0 40px rgba(255,215,0,0.05)',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        <div className="absolute pointer-events-none" style={{ left: dims.w / 2, top: dims.h / 2, transform: 'translate(-50%, -50%)', zIndex: 10 }}>
          <div className="absolute rounded-full" style={{ width: 180, height: 180, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(255,200,0,0.12) 0%, transparent 70%)', animation: 'sunPulse 4s ease-in-out infinite' }} />
          <div className="absolute rounded-full" style={{ width: 120, height: 120, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(255,190,0,0.2) 0%, transparent 60%)' }} />
          <div className="relative w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center" style={{ background: 'radial-gradient(circle at 35% 35%, #FFF59D, #FFD700, #F9A825)', boxShadow: '0 0 60px 25px rgba(255,200,0,0.3), inset 0 0 30px rgba(255,255,255,0.4), 0 0 100px 40px rgba(255,180,0,0.1)' }}>
            <i className="fas fa-infinity text-amber-900 text-xl" />
            <span className="text-[10px] font-extrabold text-amber-900 leading-none mt-0.5">{TOTAL_FEATURES}</span>
          </div>
        </div>

        {planets.map((p, i) => {
          const g = p.galaxy;
          const isHov = hovered === g.id;
          const isSel = selected === g.id;
          const size = 44 + g.count * 1.1;
          const baseZ = Math.round(p.z);
          const entranceDelay = i * 0.1;
          const entranceScale = entered ? 1 : 0;
          return (
            <div
              key={g.id}
              className="absolute"
              style={{
                left: p.screenX, top: p.screenY,
                transform: `translate(-50%, -50%) scale(${p.depthScale * (isHov || isSel ? 1.2 : 1) * entranceScale})`,
                zIndex: 100 + baseZ,
                opacity: entered ? (p.depthScale < 0.4 ? 0.35 : p.depthScale < 0.7 ? 0.65 : 1) : 0,
                transition: isDragging ? 'none' : `transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${entranceDelay}s, opacity 0.5s ease ${entranceDelay}s`,
                filter: p.depthScale < 0.5 ? 'blur(0.5px)' : 'none',
              }}
              onMouseEnter={() => setHovered(g.id)}
              onMouseLeave={() => setHovered(null)}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => handlePlanetClick(g.id, p.screenX, p.screenY, g.glow)}
            >
              <div className="absolute rounded-full border border-dashed pointer-events-none" style={{ width: size + 32, height: size + 32, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', borderColor: isHov ? g.glow + '50' : isSel ? g.glow + '70' : 'rgba(255,255,255,0.05)', transition: 'border-color 0.3s ease', animation: `planetRingSpin ${10 + i * 2}s linear infinite` }} />
              <div className="relative rounded-full flex items-center justify-center cursor-pointer" style={{ width: size, height: size, background: `radial-gradient(circle at 32% 32%, ${g.glow}, ${g.color})`, boxShadow: isHov || isSel ? `0 0 40px 12px ${g.glow}90, 0 0 80px 24px ${g.color}35, inset 0 0 20px rgba(255,255,255,0.25)` : `0 0 20px 6px ${g.color}50, inset 0 0 12px rgba(255,255,255,0.12)`, transition: 'box-shadow 0.3s ease' }}>
                <i className={`fas ${g.icon} text-white`} style={{ fontSize: size * 0.32 }} />
                {g.modules.slice(0, 3).map((_, mi) => (
                  <div key={mi} className="absolute rounded-full pointer-events-none" style={{ width: 5, height: 5, background: g.glow, left: '50%', top: '50%', marginLeft: -2.5, marginTop: -2.5, transform: `rotate(${(mi / 3) * 360 + Date.now() * 0.05}deg) translateX(${size * 0.6 + 6}px)`, opacity: 0.8 }} />
                ))}
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl text-center pointer-events-none" style={{ top: size / 2 + 6, background: isHov || isSel ? `linear-gradient(135deg, ${g.color}40, ${g.color}20)` : 'rgba(2,6,23,0.8)', border: `1px solid ${isHov || isSel ? g.glow + '80' : 'rgba(255,255,255,0.06)'}`, backdropFilter: 'blur(8px)', transition: 'all 0.25s ease', minWidth: 95, whiteSpace: 'nowrap', boxShadow: isHov ? `0 4px 20px ${g.color}30` : 'none' }}>
                <p className="text-[10px] font-bold text-white leading-tight">{g.name}</p>
                <p className="text-[9px] font-semibold mt-0.5" style={{ color: g.glow }}>{g.count} modules</p>
              </div>
              {isSel && (
                <>
                  <div className="absolute rounded-full pointer-events-none" style={{ width: size + 20, height: size + 20, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', border: `2px solid ${g.glow}`, boxShadow: `0 0 25px 6px ${g.glow}60, inset 0 0 15px ${g.glow}20`, animation: 'selectionPulse 1.2s ease-in-out infinite' }} />
                  <div className="absolute pointer-events-none" style={{ width: 2, height: 200, left: '50%', top: '50%', background: `linear-gradient(180deg, ${g.glow}80, transparent)`, transform: 'translateX(-50%) rotate(-25deg)', transformOrigin: 'top center', opacity: 0.4 }} />
                </>
              )}
            </div>
          );
        })}

        <AnimatePresence>
          {selectedPlanet && (
            <motion.div
              key={selectedPlanet.galaxy.id}
              initial={{ x: 320, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 320, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="absolute top-3 right-3 bottom-3 w-[280px] overflow-y-auto"
              style={{ zIndex: 500, scrollbarWidth: 'thin', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(20px) saturate(1.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}
            >
              {(() => {
                const g = selectedPlanet.galaxy;
                return (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${g.color}30, ${g.color}15)`, border: `1px solid ${g.glow}40`, color: g.glow, boxShadow: `0 0 20px ${g.color}25` }}>
                          <i className={`fas ${g.icon} text-lg`} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{g.name}</h4>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${g.color}25`, color: g.glow }}>{g.count} modules</span>
                        </div>
                      </div>
                      <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <i className="fas fa-times text-xs" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{g.desc}</p>
                    <div className="mb-4">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Modules</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {g.modules.map((m) => (
                          <div key={m} className="text-[9px] px-2 py-1.5 rounded-lg text-slate-300 border flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' }}>
                            <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: g.glow }} />
                            <span className="truncate">{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Universe Share</p>
                        <span className="text-[10px] font-bold" style={{ color: g.glow }}>{((g.count / TOTAL_FEATURES) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(g.count / TOTAL_FEATURES) * 100}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }} className="h-full rounded-full relative" style={{ background: `linear-gradient(90deg, ${g.color}, ${g.glow})`, boxShadow: `0 0 10px ${g.glow}60` }}>
                          <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'shimmer 2s infinite' }} />
                        </motion.div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <div className="flex-1 p-2 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <p className="text-lg font-bold text-white">{g.count}</p>
                        <p className="text-[8px] text-slate-500 uppercase">Modules</p>
                      </div>
                      <div className="flex-1 p-2 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <p className="text-lg font-bold" style={{ color: g.glow }}>{g.modules.length}</p>
                        <p className="text-[8px] text-slate-500 uppercase">Features</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-0 left-0 right-0 h-10 flex items-center justify-center gap-5 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
          {[
            { icon: 'fa-arrows-left-right', text: 'Drag to orbit' },
            { icon: 'fa-arrows-up-down', text: 'Drag to tilt' },
            { icon: 'fa-hand-pointer', text: 'Click to explore' },
            { icon: 'fa-keyboard', text: 'Arrow keys' },
          ].map((hint) => (
            <span key={hint.text} className="text-[10px] text-slate-500 flex items-center gap-1"><i className={`fas ${hint.icon}`} />{hint.text}</span>
          ))}
        </div>

        <style>{`
          @keyframes sunPulse { 0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.4; } 50% { transform: translate(-50%,-50%) scale(1.25); opacity: 0.7; } }
          @keyframes planetRingSpin { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
          @keyframes selectionPulse { 0%, 100% { opacity: 0.5; transform: translate(-50%,-50%) scale(1); } 50% { opacity: 1; transform: translate(-50%,-50%) scale(1.08); } }
          @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        `}</style>
      </div>
    </div>
  );
}

function projectPlanet(idx: number, RADIUS: number, TILT: number, CX: number, CY: number, PERSPECTIVE: number, cosY: number, sinY: number, cosX: number, sinX: number) {
  const angle = (idx / GALAXIES.length) * Math.PI * 2;
  const x = Math.sin(angle) * RADIUS;
  const y = -Math.cos(angle) * RADIUS * Math.sin(TILT);
  const z = Math.cos(angle) * RADIUS * Math.cos(TILT);
  const x1 = x * cosY + z * sinY;
  const z1 = -x * sinY + z * cosY;
  const y2 = y * cosX - z1 * sinX;
  const z2 = y * sinX + z1 * cosX;
  const scale = PERSPECTIVE / (PERSPECTIVE - z2);
  return { x: CX + x1 * scale, y: CY + y2 * scale };
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 5: FEATURE STATISTICS TOWER
   ═══════════════════════════════════════════════════════════════ */

function FeatureStatsTower() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);
  const maxCount = Math.max(...GALAXIES.map((g) => g.count));

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative">
      <div className="text-center mb-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center justify-center gap-2">
          <i className="fas fa-cubes text-sky-500" />
          Feature Statistics Tower
        </h3>
        <p className="text-xs text-slate-400 mt-1">3D volumetric breakdown by category · Hover bars to explore</p>
      </div>

      <div
        className="relative h-[420px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
          perspective: '1200px',
        }}
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div
          className="flex items-end justify-center gap-4 h-full pb-16 pt-8 px-6"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(50deg) rotateZ(-6deg) translateY(-10px)',
          }}
        >
          {GALAXIES.map((galaxy, i) => {
            const height = (galaxy.count / maxCount) * 200;
            const isHovered = hoveredBar === i;
            const barDepth = isHovered ? 55 : 35;
            const pct = Math.round((galaxy.count / TOTAL_FEATURES) * 100);

            return (
              <div
                key={galaxy.id}
                className="relative flex flex-col items-center"
                style={{
                  transformStyle: 'preserve-3d',
                  opacity: entered ? 1 : 0,
                  transform: entered ? 'translateY(0)' : 'translateY(80px)',
                  transition: `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.08}s`,
                }}
              >
                <div
                  className="absolute text-xs font-bold whitespace-nowrap"
                  style={{
                    top: -28,
                    color: isHovered ? galaxy.glow : 'rgba(255,255,255,0.6)',
                    transform: `translateZ(${isHovered ? 60 : 30}px)`,
                    transition: 'all 0.3s ease',
                    textShadow: isHovered ? `0 0 10px ${galaxy.glow}80` : 'none',
                  }}
                >
                  {galaxy.count}
                </div>

                <div
                  className="relative cursor-pointer"
                  style={{
                    width: 44,
                    height: height,
                    transformStyle: 'preserve-3d',
                    transform: isHovered ? 'translateZ(25px) scale(1.08)' : 'translateZ(0)',
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div
                    className="absolute inset-0 rounded-t-lg"
                    style={{
                      background: `linear-gradient(180deg, ${galaxy.glow} 0%, ${galaxy.color} 60%, ${galaxy.color}dd 100%)`,
                      boxShadow: isHovered ? `0 0 30px ${galaxy.glow}60, inset 0 0 20px rgba(255,255,255,0.15)` : 'none',
                      transition: 'box-shadow 0.3s ease',
                    }}
                  />
                  <div
                    className="absolute rounded-sm"
                    style={{
                      width: 44,
                      height: barDepth,
                      background: `linear-gradient(135deg, ${galaxy.glow}, ${galaxy.color})`,
                      transform: `rotateX(-90deg) translateZ(${barDepth / 2}px) translateY(-${barDepth / 2}px)`,
                      top: 0,
                      boxShadow: isHovered ? `0 0 15px ${galaxy.glow}50` : 'none',
                    }}
                  />
                  <div
                    className="absolute rounded-sm"
                    style={{
                      width: barDepth,
                      height: height,
                      background: `linear-gradient(180deg, ${galaxy.color}cc, ${galaxy.color}88)`,
                      transform: `rotateY(90deg) translateZ(-${barDepth / 2}px) translateX(-${barDepth / 2}px)`,
                      left: 0,
                    }}
                  />
                  <div
                    className="absolute rounded-sm"
                    style={{
                      width: barDepth,
                      height: height,
                      background: `linear-gradient(180deg, ${galaxy.color}99, ${galaxy.color}55)`,
                      transform: `rotateY(90deg) translateZ(${44 - barDepth / 2}px) translateX(-${barDepth / 2}px)`,
                      left: 0,
                    }}
                  />
                  <div
                    className="absolute rounded-t-lg"
                    style={{
                      width: 44,
                      height: height,
                      background: galaxy.color,
                      opacity: 0.25,
                      transform: `translateZ(-${barDepth}px)`,
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 rounded-b-lg overflow-hidden" style={{ height: 3 }}>
                    <div className="h-full" style={{ width: `${pct}%`, background: galaxy.glow, opacity: 0.8 }} />
                  </div>
                </div>

                <div
                  className="mt-3 text-[9px] font-bold text-center max-w-[60px] leading-tight"
                  style={{
                    color: isHovered ? galaxy.glow : 'rgba(255,255,255,0.5)',
                    transform: 'rotateX(-50deg) rotateZ(6deg)',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {galaxy.name.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-20"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 60%)',
            transform: 'rotateX(50deg) translateY(30px)',
            transformOrigin: 'bottom center',
          }}
        />
        <div className="absolute bottom-4 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-slate-500/30 to-transparent" />

        {hoveredBar !== null && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 6 }).map((_, pi) => (
              <div
                key={pi}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: GALAXIES[hoveredBar].glow,
                  left: `${20 + (hoveredBar * 8) + ((pi * 13) % 5)}%`,
                  bottom: `${30 + ((pi * 17) % 40)}%`,
                  animation: `towerFloat ${2 + ((pi * 0.3) % 1)}s ease-in-out infinite`,
                  animationDelay: `${pi * 0.2}s`,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
        )}

        <style>{`
          @keyframes towerFloat {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
            50% { transform: translateY(-30px) scale(0.5); opacity: 0; }
          }
        `}</style>
      </div>

      <AnimatePresence>
        {hoveredBar !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="mt-3 p-4 rounded-xl border shadow-lg"
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(16px)',
              borderColor: `${GALAXIES[hoveredBar].glow}30`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${GALAXIES[hoveredBar].color}30, ${GALAXIES[hoveredBar].color}15)`,
                  border: `1px solid ${GALAXIES[hoveredBar].glow}40`,
                  color: GALAXIES[hoveredBar].glow,
                  boxShadow: `0 0 15px ${GALAXIES[hoveredBar].color}25`,
                }}
              >
                <i className={`fas ${GALAXIES[hoveredBar].icon} text-sm`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{GALAXIES[hoveredBar].name}</p>
                <p className="text-[10px] text-slate-400">{GALAXIES[hoveredBar].desc}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold" style={{ color: GALAXIES[hoveredBar].glow }}>
                  {GALAXIES[hoveredBar].count}
                </p>
                <p className="text-[9px] text-slate-500">modules</p>
              </div>
            </div>
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(GALAXIES[hoveredBar].count / maxCount) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${GALAXIES[hoveredBar].color}, ${GALAXIES[hoveredBar].glow})`,
                  boxShadow: `0 0 8px ${GALAXIES[hoveredBar].glow}50`,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 6: PERSONA COVERAGE MATRIX
   ═══════════════════════════════════════════════════════════════ */

function PersonaCoverageMatrix() {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const getIntensityColor = (value: number) => {
    if (value >= 90) return { bg: '#1B5E20', text: '#fff', glow: '#4CAF50', shadow: '0 0 16px #4CAF5060' };
    if (value >= 70) return { bg: '#2E7D32', text: '#fff', glow: '#66BB6A', shadow: '0 0 12px #66BB6A50' };
    if (value >= 50) return { bg: '#F9A825', text: '#000', glow: '#FFEE58', shadow: '0 0 10px #FFEE5850' };
    if (value >= 30) return { bg: '#EF6C00', text: '#fff', glow: '#FFA726', shadow: '0 0 10px #FFA72650' };
    return { bg: '#B71C1C', text: '#fff', glow: '#EF5350', shadow: '0 0 10px #EF535050' };
  };

  return (
    <div className="relative">
      <div className="text-center mb-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center justify-center gap-2">
          <i className="fas fa-th text-violet-500" />
          Persona Coverage Matrix
        </h3>
        <p className="text-xs text-slate-400 mt-1">Feature category accessibility across 5 user personas · Hover for details</p>
      </div>

      <div
        className="rounded-2xl border border-slate-700 p-6 overflow-x-auto"
        style={{ background: 'linear-gradient(135deg, #0a0f1a 0%, #111827 50%, #0a0f1a 100%)' }}
      >
        <div className="min-w-[650px]">
          <div className="flex items-center mb-4">
            <div className="w-28" />
            {PERSONAS.map((p, pi) => (
              <div key={p.id} className="flex-1 text-center">
                <motion.div
                  className="w-11 h-11 mx-auto rounded-xl flex items-center justify-center"
                  style={{
                    background: hoveredCell?.col === pi ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${hoveredCell?.col === pi ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
                    color: hoveredCell?.col === pi ? '#fff' : '#94a3b8',
                    transition: 'all 0.3s ease',
                  }}
                  animate={{ scale: hoveredCell?.col === pi ? 1.1 : 1 }}
                >
                  <i className={`fas ${p.icon}`} />
                </motion.div>
                <p className="text-[10px] font-bold mt-1.5" style={{ color: hoveredCell?.col === pi ? '#fff' : '#94a3b8', transition: 'color 0.3s ease' }}>
                  {p.name}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2.5">
            {CAPABILITY_MATRIX.map((row, ri) => (
              <div key={row.category} className="flex items-center">
                <div className="w-28 pr-3">
                  <p className="text-[10px] font-bold text-right" style={{ color: hoveredCell?.row === ri ? '#fff' : '#94a3b8', transition: 'color 0.3s ease' }}>
                    {row.category}
                  </p>
                </div>
                <div className="flex-1 flex gap-2.5">
                  {row.coverage.map((val, ci) => {
                    const colors = getIntensityColor(val);
                    const isHovered = hoveredCell?.row === ri && hoveredCell?.col === ci;
                    const isRowHover = hoveredCell?.row === ri;
                    const isColHover = hoveredCell?.col === ci;

                    return (
                      <motion.div
                        key={ci}
                        className="flex-1 relative cursor-pointer"
                        onMouseEnter={() => setHoveredCell({ row: ri, col: ci })}
                        onMouseLeave={() => setHoveredCell(null)}
                        animate={{
                          scale: isHovered ? 1.2 : isRowHover || isColHover ? 1.05 : 1,
                          y: isHovered ? -4 : 0,
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div
                          className="aspect-square rounded-xl flex items-center justify-center relative overflow-hidden"
                          style={{
                            background: colors.bg,
                            color: colors.text,
                            boxShadow: isHovered ? colors.shadow : 'none',
                            transition: 'box-shadow 0.3s ease',
                          }}
                        >
                          {val >= 70 && (
                            <div
                              className="absolute inset-0"
                              style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                                animation: 'matrixShimmer 2.5s infinite',
                              }}
                            />
                          )}
                          <span className="text-xs font-bold relative z-10">{val}%</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <style>{`
            @keyframes matrixShimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
          `}</style>

          <div className="flex items-center justify-center gap-5 mt-5 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {[
              { label: 'Full', color: '#1B5E20', val: '90-100%' },
              { label: 'High', color: '#2E7D32', val: '70-89%' },
              { label: 'Medium', color: '#F9A825', val: '50-69%' },
              { label: 'Low', color: '#EF6C00', val: '30-49%' },
              { label: 'Minimal', color: '#B71C1C', val: '<30%' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}60` }} />
                <span className="text-[9px] text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {hoveredCell && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="mt-4 p-4 rounded-xl border"
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(16px)',
                  borderColor: `${getIntensityColor(CAPABILITY_MATRIX[hoveredCell.row].coverage[hoveredCell.col]).glow}30`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className={`fas ${PERSONAS[hoveredCell.col].icon} text-slate-400 text-xs`} />
                    <p className="text-xs font-bold text-white">
                      {PERSONAS[hoveredCell.col].name} × {CAPABILITY_MATRIX[hoveredCell.row].category}
                    </p>
                  </div>
                  <p className="text-lg font-bold" style={{ color: getIntensityColor(CAPABILITY_MATRIX[hoveredCell.row].coverage[hoveredCell.col]).glow }}>
                    {CAPABILITY_MATRIX[hoveredCell.row].coverage[hoveredCell.col]}%
                  </p>
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${CAPABILITY_MATRIX[hoveredCell.row].coverage[hoveredCell.col]}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{
                      background: getIntensityColor(CAPABILITY_MATRIX[hoveredCell.row].coverage[hoveredCell.col]).bg,
                      boxShadow: `0 0 8px ${getIntensityColor(CAPABILITY_MATRIX[hoveredCell.row].coverage[hoveredCell.col]).glow}50`,
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 7: USER JOURNEY FLOW
   ═══════════════════════════════════════════════════════════════ */

function JourneyFlowchart() {
  const [activeStage, setActiveStage] = useState(0);
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const pathProgress = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);
  const pathSpring = useSpring(pathProgress, { stiffness: 50, damping: 20 });

  const pathD = useMemo(() => {
    const points = JOURNEY_STAGES.map((_, i) => ({
      x: 80 + i * 200,
      y: i % 2 === 0 ? 80 : 200,
    }));
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cp1x = points[i - 1].x + 80;
      const cp1y = points[i - 1].y;
      const cp2x = points[i].x - 80;
      const cp2y = points[i].y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`;
    }
    return d;
  }, []);

  const particleDistance = useTransform(pathSpring, [0, 1], ['0%', '100%']);

  return (
    <div ref={containerRef} className="relative">
      <div className="text-center mb-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center justify-center gap-2">
          <i className="fas fa-project-diagram text-emerald-500" />
          User Journey Flowchart
        </h3>
        <p className="text-xs text-slate-400 mt-1">Neural pathway through the SecureWealth experience · Click stages to explore</p>
      </div>

      <div
        className="relative rounded-2xl border border-slate-700 p-6 overflow-x-auto"
        style={{
          background: 'linear-gradient(135deg, #0a0f1a 0%, #111827 50%, #0a0f1a 100%)',
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.3)',
        }}
      >
        <svg viewBox="0 0 1000 300" className="w-full min-w-[800px]" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1B5E20" />
              <stop offset="25%" stopColor="#1565C0" />
              <stop offset="50%" stopColor="#B71C1C" />
              <stop offset="75%" stopColor="#E65100" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
            <filter id="glowPath">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="nodeGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path d={pathD} fill="none" stroke="#1e293b" strokeWidth="3" strokeDasharray="8 6" />

          <motion.path
            d={pathD}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#glowPath)"
            style={{ pathLength: pathSpring }}
          />

          <motion.circle
            r="5"
            fill="#FFD700"
            filter="url(#nodeGlow)"
            style={{
              offsetPath: `path("${pathD}")`,
              offsetDistance: particleDistance,
            }}
          />

          {JOURNEY_STAGES.map((stage, i) => {
            const x = 80 + i * 200;
            const y = i % 2 === 0 ? 80 : 200;
            const isActive = activeStage === i;
            const isPast = activeStage > i;
            const isHov = hoveredStage === i;

            return (
              <g
                key={stage.id}
                onClick={() => setActiveStage(i)}
                onMouseEnter={() => setHoveredStage(i)}
                onMouseLeave={() => setHoveredStage(null)}
                style={{ cursor: 'pointer' }}
              >
                {(isActive || isHov) && (
                  <circle
                    cx={x} cy={y} r={42}
                    fill="none"
                    stroke={stage.color}
                    strokeWidth="1"
                    opacity="0.3"
                    style={{ animation: 'journeyPulse 2s ease-in-out infinite' }}
                  />
                )}
                <circle
                  cx={x} cy={y}
                  r={isActive ? 32 : isHov ? 30 : 26}
                  fill="none"
                  stroke={stage.color}
                  strokeWidth={isActive ? 3 : 2}
                  opacity={isPast || isActive ? 1 : 0.5}
                  filter={isActive ? 'url(#nodeGlow)' : 'none'}
                  style={{ transition: 'all 0.3s ease' }}
                />
                <circle
                  cx={x} cy={y}
                  r={20}
                  fill={isPast || isActive ? stage.color : '#1e293b'}
                  opacity={isPast || isActive ? 0.9 : 0.4}
                  style={{ transition: 'all 0.3s ease' }}
                />
                {(isActive || isHov) && (
                  <circle
                    cx={x} cy={y}
                    r={14}
                    fill={stage.color}
                    opacity="0.3"
                    filter="url(#nodeGlow)"
                  />
                )}
                <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">
                  {i + 1}
                </text>
                <text
                  x={x}
                  y={y + (i % 2 === 0 ? -48 : 58)}
                  textAnchor="middle"
                  fill={isActive ? stage.color : isHov ? '#cbd5e1' : '#64748b'}
                  fontSize="12"
                  fontWeight="700"
                  style={{ transition: 'fill 0.3s ease' }}
                >
                  {stage.title}
                </text>
                <text
                  x={x}
                  y={y + (i % 2 === 0 ? -34 : 72)}
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="9"
                >
                  {stage.subtitle}
                </text>
                <rect
                  x={x - 14}
                  y={y + (i % 2 === 0 ? 38 : -50)}
                  width="28"
                  height="14"
                  rx="7"
                  fill={stage.color}
                  opacity={isActive ? 0.9 : 0.5}
                />
                <text
                  x={x}
                  y={y + (i % 2 === 0 ? 48 : -40)}
                  textAnchor="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {stage.features.length}
                </text>
              </g>
            );
          })}
        </svg>

        <style>{`
          @keyframes journeyPulse {
            0%, 100% { r: 36; opacity: 0.3; }
            50% { r: 44; opacity: 0.1; }
          }
        `}</style>

        <motion.div
          key={activeStage}
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="mt-4 p-4 rounded-xl border"
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(16px)',
            borderColor: `${JOURNEY_STAGES[activeStage].color}30`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold"
              style={{
                background: `linear-gradient(135deg, ${JOURNEY_STAGES[activeStage].color}, ${JOURNEY_STAGES[activeStage].color}aa)`,
                boxShadow: `0 0 20px ${JOURNEY_STAGES[activeStage].color}40`,
              }}
            >
              {activeStage + 1}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{JOURNEY_STAGES[activeStage].title}</h4>
              <p className="text-xs text-slate-400">{JOURNEY_STAGES[activeStage].subtitle}</p>
            </div>
            <div className="ml-auto flex gap-1">
              {JOURNEY_STAGES.map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: i === activeStage ? JOURNEY_STAGES[activeStage].color : i < activeStage ? JOURNEY_STAGES[i].color : '#334155',
                    opacity: i <= activeStage ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {JOURNEY_STAGES[activeStage].features.map((f) => (
              <span
                key={f}
                className="text-[10px] px-3 py-1.5 rounded-full border"
                style={{
                  background: `${JOURNEY_STAGES[activeStage].color}15`,
                  borderColor: `${JOURNEY_STAGES[activeStage].color}25`,
                  color: '#e2e8f0',
                }}
              >
                <i className="fas fa-check-circle text-emerald-400 mr-1 text-[8px]" />
                {f}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 8: EVOLUTION TIMELINE
   ═══════════════════════════════════════════════════════════════ */

function EvolutionTimeline() {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative">
      <div className="text-center mb-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center justify-center gap-2">
          <i className="fas fa-stream text-sky-500" />
          Feature Evolution Timeline
        </h3>
        <p className="text-xs text-slate-400 mt-1">From 4 foundational modules to {TOTAL_FEATURES}+ capabilities</p>
      </div>

      <div
        className="relative rounded-2xl border border-slate-700 p-6 overflow-x-auto"
        style={{
          background: 'linear-gradient(135deg, #0a0f1a 0%, #111827 50%, #0a0f1a 100%)',
        }}
      >
        <div className="min-w-[950px] relative">
          <div
            className="absolute top-[60px] left-0 right-0 h-1 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #1B5E20, #1565C0, #B71C1C, #6A1B9A, #E65100, #4527A0, #FFD700, #00838F)',
              opacity: 0.5,
            }}
          />
          <div
            className="absolute top-[60px] left-0 right-0 h-1 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.3) 50%)',
              backgroundSize: '20px 100%',
              animation: 'timelineDash 1s linear infinite',
              opacity: 0.3,
            }}
          />

          <div className="flex justify-between items-start relative">
            {EVOLUTION_TIMELINE.map((phase, i) => {
              const isExpanded = expandedPhase === i;
              const cumulative = EVOLUTION_TIMELINE.slice(0, i + 1).reduce((s, p) => s + p.count, 0);
              const prevCumulative = i > 0 ? EVOLUTION_TIMELINE.slice(0, i).reduce((s, p) => s + p.count, 0) : 0;
              const growth = cumulative - prevCumulative;

              return (
                <motion.div
                  key={phase.phase}
                  className="relative flex flex-col items-center cursor-pointer"
                  style={{
                    width: 110,
                    opacity: entered ? 1 : 0,
                    transform: entered ? 'translateY(0)' : 'translateY(30px)',
                    transition: `all 0.5s ease ${i * 0.08}s`,
                  }}
                  onClick={() => setExpandedPhase(isExpanded ? null : i)}
                  whileHover={{ y: -6 }}
                >
                  <div className="absolute bottom-[68px] w-1 rounded-full" style={{
                    height: Math.max(4, growth * 1.2),
                    background: `linear-gradient(180deg, ${phase.color}, transparent)`,
                    opacity: 0.5,
                  }} />

                  <motion.div
                    className="relative w-12 h-12 rounded-full flex items-center justify-center border-2 z-10"
                    style={{
                      background: `${phase.color}20`,
                      borderColor: phase.color,
                      color: phase.color,
                      boxShadow: isExpanded ? `0 0 25px ${phase.color}60, inset 0 0 10px ${phase.color}30` : `0 0 10px ${phase.color}20`,
                      transition: 'box-shadow 0.3s ease',
                    }}
                    animate={{ scale: isExpanded ? 1.15 : 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <div
                      className="absolute inset-1 rounded-full border"
                      style={{ borderColor: `${phase.color}40` }}
                    />
                    <span className="text-xs font-bold">{cumulative}</span>
                  </motion.div>

                  <div className="mt-3 text-center">
                    <p className="text-[10px] font-bold" style={{ color: isExpanded ? phase.color : '#e2e8f0' }}>
                      {phase.phase}
                    </p>
                    <p className="text-[9px] text-slate-500">+{phase.count}</p>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.9 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="absolute top-[100px] left-1/2 -translate-x-1/2 w-52 rounded-xl p-3 border z-20 overflow-hidden"
                        style={{
                          background: 'rgba(15, 23, 42, 0.9)',
                          backdropFilter: 'blur(16px)',
                          borderColor: `${phase.color}40`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: phase.color, boxShadow: `0 0 8px ${phase.color}` }} />
                          <p className="text-[10px] font-bold text-white">{phase.phase}</p>
                          <span className="text-[9px] ml-auto" style={{ color: phase.color }}>{phase.count} features</span>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {phase.features.map((f) => (
                            <span
                              key={f}
                              className="text-[9px] px-2 py-0.5 rounded-full border"
                              style={{
                                background: `${phase.color}15`,
                                borderColor: `${phase.color}20`,
                                color: '#cbd5e1',
                              }}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          <style>{`
            @keyframes timelineDash {
              0% { background-position: 0 0; }
              100% { background-position: 20px 0; }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT: FeaturesUniverse
   ═══════════════════════════════════════════════════════════════ */

export default function FeaturesUniverse() {
  const [activeSection, setActiveSection] = useState('galaxy');

  const sections = [
    { id: 'galaxy', label: 'Galaxy', icon: 'fa-atom', desc: '3D orbital constellation' },
    { id: 'explorer', label: 'Explorer', icon: 'fa-search', desc: 'All 159 features' },
    { id: 'innovation', label: 'Innovation', icon: 'fa-globe', desc: '5 World-Firsts' },
    { id: 'tower', label: 'Tower', icon: 'fa-cubes', desc: 'Volumetric 3D bars' },
    { id: 'matrix', label: 'Matrix', icon: 'fa-th', desc: 'Persona coverage map' },
    { id: 'flow', label: 'Journey', icon: 'fa-project-diagram', desc: 'Interactive flowchart' },
    { id: 'timeline', label: 'Timeline', icon: 'fa-stream', desc: 'Evolution phases' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-6 lg:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-sky-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
              <i className="fas fa-cubes-stacked text-amber-400 text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight">Feature Cosmos</h1>
              <p className="text-[11px] text-white/70 font-medium">
                The Complete SecureWealth Twin Capability Universe — Every Feature, Every Module, Visualized
              </p>
            </div>
          </div>
          <HeroStatsBar />
        </div>
      </motion.div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
              activeSection === s.id
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20 scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <i className={`fas ${s.icon}`} />
            <span>{s.label}</span>
            <span className="text-[9px] opacity-70 hidden sm:inline">{s.desc}</span>
          </button>
        ))}
      </div>

      {/* Active Section Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeSection === 'galaxy' && <GalaxyOrbital />}
          {activeSection === 'explorer' && <FeatureExplorerGrid />}
          {activeSection === 'innovation' && <InnovationSpotlight />}
          {activeSection === 'tower' && <FeatureStatsTower />}
          {activeSection === 'matrix' && <PersonaCoverageMatrix />}
          {activeSection === 'flow' && <JourneyFlowchart />}
          {activeSection === 'timeline' && <EvolutionTimeline />}
        </motion.div>
      </AnimatePresence>

      {/* Footer Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-sky-500/5 to-amber-400/5 p-5"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              <i className="fas fa-lightbulb text-amber-500 mr-2" />
              Engineering Achievement
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              SecureWealth Twin represents {TOTAL_FEATURES}+ individually engineered capabilities across {TOTAL_GALAXIES} feature
              galaxies, serving 5 distinct user personas. From foundational banking to predictive BHAVISHYA AI, every
              module is production-ready and designed for scale.
            </p>
          </div>
          <div className="flex gap-4">
            {[
              { icon: 'fa-code', label: 'React 19 + TS', color: 'text-sky-500' },
              { icon: 'fa-palette', label: 'Tailwind v4', color: 'text-cyan-500' },
              { icon: 'fa-bolt', label: 'Framer Motion', color: 'text-amber-500' },
              { icon: 'fa-chart-bar', label: 'Recharts', color: 'text-emerald-500' },
            ].map((tech) => (
              <div key={tech.label} className="text-center">
                <i className={`fas ${tech.icon} ${tech.color} text-lg`} />
                <p className="text-[9px] text-slate-500 mt-0.5">{tech.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

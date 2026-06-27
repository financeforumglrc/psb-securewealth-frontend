import { motion } from 'framer-motion';
import CosmosCard from '@/shared/components/ui/CosmosCard';

const STRATEGIES = [
  {
    id: 'psb-dna',
    icon: 'fa-globe',
    color: '#0f766e',
    title: 'PSB DNA: NRI Guardian Mode',
    hook: "Most teams build a generic banking app and slap a logo on it. We built specifically for Punjab & Sind Bank's customer base.",
    bullets: [
      'PSB serves a massive NRI customer base across Punjab, UK and Canada.',
      "Scammers often target NRIs' parents in India with fake 'digital arrest' calls.",
      'NRI Guardian Mode: when an NRI sends ₹5L from Canada to a PSB account in Jalandhar, Rakshak AI intervenes instantly in Punjabi/Hindi if the parent is on a call or using a new device.',
      'We did not just build for India; we built for PSB\'s demographic.',
    ],
  },
  {
    id: 'dpdp',
    icon: 'fa-scale-balanced',
    color: '#1565C0',
    title: 'DPDP Act 2023 Compliance',
    hook: "India's new Digital Personal Data Protection Act is live. Banks are paranoid about consent. We are compliant by design.",
    bullets: [
      'Most apps use a single "I Agree" checkbox. That is no longer enough.',
      'PrivacyView maps every data point to specific Purpose Codes — e.g., data used ONLY for Wealth Twin, NOT for marketing.',
      'Users can revoke consent with one click; backend purges the data instantly.',
      'Built for bank legal and compliance officers, not just end users.',
    ],
  },
  {
    id: 'roi',
    icon: 'fa-sack-dollar',
    color: '#7c3aed',
    title: 'CFO / ROI Perspective',
    hook: 'Banks care about AUM growth and fraud-loss reduction. SecureWealth Twin is a revenue protector, not a cost center.',
    bullets: [
      "Smart Sweep (AA Arbitrage) and Life-Shock auto-remediation protect users' liquidity during crises.",
      'SME Centre covers the ignored corporate segment: cash flow, surplus fund advisor and working capital health.',
      'Macro Signal Tower turns RBI repo, CPI, USD/INR and gold trends into auto-actions like "sell gold, shift to FD".',
      'Advanced Tax Calculator compares Old vs New regimes and tracks 80C/deadlines — driving stickiness.',
      'Rakshak AI + Predictive Fraud Radar reduce social-engineering fraud by an estimated 40%.',
    ],
  },
  {
    id: 'bharat',
    icon: 'fa-tower-broadcast',
    color: '#E65100',
    title: 'Bharat vs India Accessibility',
    hook: 'Half of India does not own a flagship phone or run on fiber. Security cannot depend on internet speed.',
    bullets: [
      'Low-Bandwidth Mode strips heavy animations so fraud alerts load in under 2 seconds on 3G.',
      'Voice-First UI and regional-language Rakshak interventions work for users who are not text-first.',
      'Senior Mode, Kids Mode and NRI Mode make the app inclusive across age, income and geography.',
      'We built for Bharat, not just metropolitan India.',
    ],
  },
];

const CLOSING_SCRIPT = `Respected Judges, today every bank has an app that shows you your balance. But Punjab & Sind Bank serves the backbone of India — the middle class, the MSMEs, and the families of NRIs. For them, losing money to a digital arrest scam isn't just a financial loss; it's a life tragedy.

Team Excellent Minds didn't just build a wealth management tool. We built a Digital Guardian. We built an AI that speaks Hinglish to guide your wealth, but speaks in strict, protective interventions when your family is under attack. We built a system that is DPDP compliant, post-quantum secure, and designed specifically for PSB's demographic.

We didn't just protect the wealth. We protected the trust that PSB has built over 100 years. Thank you.`;

function StrategyCard({ strategy, index }: { strategy: typeof STRATEGIES[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <CosmosCard variant="default" header={{ icon: strategy.icon, iconColor: strategy.color, title: strategy.title }}>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{strategy.hook}</p>
        <ul className="space-y-2">
          {strategy.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400">
              <i className="fas fa-check text-[10px] mt-0.5" style={{ color: strategy.color }} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </CosmosCard>
    </motion.div>
  );
}

export default function PitchDeckView() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold mb-3">
          <i className="fas fa-trophy" /> Hackathon Checkmate Deck
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-2">
          Why SecureWealth Twin Wins
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Four judge-facing strategies and a 60-second closing script. Code builds the product; context wins the trophy.
        </p>
      </motion.div>

      {/* Strategy grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STRATEGIES.map((s, i) => (
          <StrategyCard key={s.id} strategy={s} index={i} />
        ))}
      </div>

      {/* Closing script */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <CosmosCard variant="gradient" header={{ icon: 'fa-microphone-lines', iconColor: '#b45309', title: '60-Second Closing Script' }}>
          <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-amber-200/60 dark:border-slate-700">
            {CLOSING_SCRIPT.split('\n\n').map((para, i) => (
              <p key={i} className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed mb-3 last:mb-0">
                {para}
              </p>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  void navigator.clipboard.writeText(CLOSING_SCRIPT);
                }
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1.5"
            >
              <i className="fas fa-copy" /> Copy Script
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('sw-start-pitch-mode'))}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1.5"
            >
              <i className="fas fa-play" /> Launch Auto Pitch Mode
            </button>
          </div>
        </CosmosCard>
      </motion.div>

      {/* Final note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="text-center"
      >
        <p className="text-[10px] text-slate-400">
          Code freeze active. Trophy mode engaged. 🏆
        </p>
      </motion.div>
    </div>
  );
}

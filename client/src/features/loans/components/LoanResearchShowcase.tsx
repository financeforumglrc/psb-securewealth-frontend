import { motion } from 'framer-motion';
import CosmosCard from '@/shared/components/ui/CosmosCard';
import { useWealthStore } from '@/shared/store/wealthStore';

const PILLARS = [
  {
    title: 'Transparency & Explainability',
    icon: 'fa-lightbulb',
    points: [
      'Use interpretable models or layered XAI explanations.',
      'Give borrowers specific rejection reasons, e.g. "BNPL usage reduced your score by 40 points".',
      'Mandatory quarterly bias audits by gender, income & region.',
    ],
  },
  {
    title: 'Oversight & Governance',
    icon: 'fa-user-shield',
    points: [
      'AI Ethics Officer in every NBFC / fintech.',
      'RBI regulatory sandbox testing for 6 months.',
      'Public algorithm registry with data sources & update logs.',
    ],
  },
  {
    title: 'User Rights & Redress',
    icon: 'fa-gavel',
    points: [
      'Right to human review within 72 hours of rejection.',
      'Personalized credit improvement plans.',
      'Dedicated RBI AI complaints unit for algorithmic bias.',
    ],
  },
];

const KEY_STATS = [
  { label: 'Fintechs using device data', value: '73%' },
  { label: 'Generic rejection messages', value: '85%' },
  { label: 'Applicants with human review', value: '<15%' },
  { label: 'ML repayment prediction accuracy', value: '~85%' },
];

export default function LoanResearchShowcase() {
  const setView = useWealthStore((s) => s.setView);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 bg-psb-bg min-h-screen dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 md:p-8"
      >
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 rounded-full bg-white/10 text-xs font-bold">INFINITY 2025</span>
          <span className="px-2 py-1 rounded-full bg-white/10 text-xs font-bold">pp. 159-167</span>
          <span className="px-2 py-1 rounded-full bg-white/10 text-xs font-bold">NMIMS Abhirva 3.0 Finalist</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold mb-3">
          Algorithmic Accountability in AI-Driven Credit Scoring
        </h1>
        <p className="text-white/80 max-w-3xl text-sm md:text-base mb-4">
          A published research contribution by Kunal Saxena, Anu Sharma, Mrigesh Mohanty & Deepanshu Sharma
          (Amity Business School, Amity University), presented at INFINITY 2025 and recognized as a finalist at NMIMS Mumbai’s Abhirva 3.0.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setView('msme-creditbridge')}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold"
          >
            See the MSME Tool <i className="fas fa-arrow-right ml-1" />
          </button>
          <button
            onClick={() => setView('loan-impact')}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-bold hover:bg-white/20"
          >
            Impact Simulator
          </button>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <CosmosCard variant="elevated" header={{ title: 'Research Abstract', icon: 'fa-quote-left' }}>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            AI is reshaping credit assessment in India by using alternative data such as phone usage and utility bills
            to serve the unbanked. But this creates serious ethics risks: algorithmic bias, opaque “black box” decisions,
            and limited recourse for borrowers. This study proposes an Ethical Algorithmic Accountability (EAA) framework
            that combines Explainable AI, institutional oversight and user redress mechanisms with RBI digital lending
            guidelines and the DPDP Act 2023. The result: credit systems that are innovative, fair and dignified.
          </p>
        </CosmosCard>

        <CosmosCard variant="elevated" header={{ title: 'Why It Matters for MSMEs', icon: 'fa-building' }}>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            Micro and small enterprises drive employment but are often rejected by traditional credit models because they
            lack collateral or formal credit history. Alternative-data AI scoring can unlock credit, yet without
            accountability it can also “digital redline” rural and women-led businesses. Our framework ensures MSMEs get
            a transparent score, a clear explanation, and a right to improve — turning credit from a black-box gatekeeper
            into a growth partner.
          </p>
        </CosmosCard>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KEY_STATS.map((s) => (
          <CosmosCard key={s.label} variant="stat" className="text-center">
            <p className="text-2xl font-black text-primary">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
          </CosmosCard>
        ))}
      </div>

      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Ethical Algorithmic Accountability Framework</h2>
      <div className="grid md:grid-cols-3 gap-5">
        {PILLARS.map((p, idx) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <CosmosCard variant="glass" header={{ title: p.title, icon: p.icon }}>
              <ul className="space-y-2">
                {p.points.map((pt, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <i className="fas fa-check text-emerald-500 mt-0.5" /> {pt}
                  </li>
                ))}
              </ul>
            </CosmosCard>
          </motion.div>
        ))}
      </div>

      <CosmosCard variant="default" header={{ title: 'How PSB SecureWealth Implements This', icon: 'fa-shield-halved' }}>
        <ul className="grid md:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-200">
          <li><i className="fas fa-check-circle text-emerald-500 mr-2" />Deterministic 0-1000 MSME score with factor breakdown.</li>
          <li><i className="fas fa-check-circle text-emerald-500 mr-2" />ELI5 explanation for every approval / rejection.</li>
          <li><i className="fas fa-check-circle text-emerald-500 mr-2" />Fraud & fairness signal checks built in.</li>
          <li><i className="fas fa-check-circle text-emerald-500 mr-2" />CGTMSE-backed collateral-free offers.</li>
          <li><i className="fas fa-check-circle text-emerald-500 mr-2" />Personalized improvement roadmap for rejected applicants.</li>
          <li><i className="fas fa-check-circle text-emerald-500 mr-2" />Admin bias-audit dashboard with portfolio metrics.</li>
        </ul>
      </CosmosCard>
    </div>
  );
}

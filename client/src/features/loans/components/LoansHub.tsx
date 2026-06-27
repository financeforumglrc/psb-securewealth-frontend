import { motion } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import CosmosCard from '@/shared/components/ui/CosmosCard';
import type { ViewType } from '@/shared/types';

interface LoanCard {
  view: ViewType;
  title: string;
  description: string;
  icon: string;
  badge?: string;
  highlight?: boolean;
}

const CARDS: LoanCard[] = [
  {
    view: 'msme-creditbridge',
    title: 'MSME CreditBridge AI',
    description: 'Collateral-free MSME loans scored from GST, cash-flow and UPI footprints with explainable AI.',
    icon: 'fa-building-columns',
    badge: 'FLAGSHIP',
    highlight: true,
  },
  {
    view: 'loan-research',
    title: 'Research & Accountability',
    description: 'Our INFINITY 2025 published research on Algorithmic Accountability in AI Credit Scoring.',
    icon: 'fa-book-open',
    badge: 'PUBLISHED',
    highlight: true,
  },
  {
    view: 'loan-center',
    title: 'Loan Center',
    description: 'Apply, track and manage personal and retail loans in one place.',
    icon: 'fa-file-contract',
  },
  {
    view: 'loan-impact',
    title: 'MSME Impact Simulator',
    description: 'Estimate jobs, GDP and inclusion impact of disbursing MSME credit at scale.',
    icon: 'fa-chart-pie',
    badge: 'NEW',
  },
  {
    view: 'credit-health',
    title: 'Credit Health',
    description: 'CIBIL-style score, factors and AI-powered improvement tips.',
    icon: 'fa-file-invoice',
  },
  {
    view: 'social-collateral-loan',
    title: 'Social Collateral Loan',
    description: 'Community-backed lending with trust circles and guarantor rings.',
    icon: 'fa-people-group',
  },
  {
    view: 'calculators',
    title: 'Loan Calculators',
    description: 'EMI, SIP, FD and business loan calculators.',
    icon: 'fa-calculator',
  },
];

export default function LoansHub() {
  const setView = useWealthStore((s) => s.setView);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 bg-psb-bg min-h-screen dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-emerald-700 text-white p-6 md:p-8"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="px-2 py-1 rounded-full bg-white/20 text-xs font-bold uppercase">Published Research</span>
            <span className="px-2 py-1 rounded-full bg-white/20 text-xs font-bold uppercase">INFINITY 2025</span>
            <span className="px-2 py-1 rounded-full bg-white/20 text-xs font-bold uppercase">NMIMS Abhirva 3.0 Finalist</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-2">Loans & Credit Hub</h1>
          <p className="max-w-3xl text-white/90 text-sm md:text-base">
            AI-driven, explainable and accountable lending for every Indian — from MSMEs to retail borrowers.
            Built on our research on Algorithmic Accountability in AI-Driven Credit Scoring.
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10 pointer-events-none">
          <i className="fas fa-hand-holding-dollar text-[220px]" />
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Digital Lending Market" value="₹15.7L Cr" icon="fa-sack-dollar" />
        <StatTile label="Women Credit Gap" value="62%" icon="fa-venus" />
        <StatTile label="Rural Credit Gap" value="71%" icon="fa-map-location-dot" />
        <StatTile label="Unmet Demand" value="$300B" icon="fa-chart-line" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CARDS.map((card, idx) => (
          <motion.div
            key={card.view}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <CosmosCard
              variant={card.highlight ? 'gradient' : 'elevated'}
              hover
              className="h-full"
              header={{ title: card.title, icon: card.icon, action: card.badge ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-900">{card.badge}</span> : undefined }}
            >
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{card.description}</p>
              <button
                onClick={() => setView(card.view)}
                className={`w-full py-2 rounded-lg text-sm font-bold transition ${card.highlight ? 'bg-primary text-white hover:shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                Open <i className="fas fa-arrow-right ml-1" />
              </button>
            </CosmosCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatTile({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <CosmosCard variant="stat" className="flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-lg font-black text-slate-800 dark:text-slate-100">{value}</p>
      </div>
      <i className={`fas ${icon} text-xl text-primary`} />
    </CosmosCard>
  );
}

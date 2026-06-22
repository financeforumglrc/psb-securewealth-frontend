import DashboardWidget from '@/features/dashboard/components/DashboardWidget';
import type { TwinTab } from './useWealthTwinData';

interface ExplainablePanelProps {
  activeTab: TwinTab;
}

const REASONING: Record<TwinTab, { title: string; points: string[]; model: string }> = {
  overview: {
    title: 'Why this projection?',
    points: [
      'Compound-growth model uses 10% base, 15% optimistic, 5% pessimistic annual returns.',
      'Monthly SIP is added at the end of each month.',
      'Wealth DNA combines savings rate, asset mix, and blocked fraud signals.',
      'Top spend category is derived from debit transactions only.',
    ],
    model: 'Monte Carlo simulation (10,000+ paths)',
  },
  goals: {
    title: 'Goal math explained',
    points: [
      'Gap = target amount − current savings.',
      'Months left = deadline − today.',
      'Monthly SIP needed = gap ÷ months left.',
      'On-track flag compares SIP need with your current monthly savings.',
    ],
    model: 'Time-value-of-money reverse SIP',
  },
  tax: {
    title: 'Tax saving logic',
    points: [
      '80C limit is capped at ₹1,50,000 under Section 80C.',
      'NPS 80CCD(1B) gives an additional ₹50,000 deduction.',
      'HRA optimization is suggested only if monthly income exceeds ₹80,000.',
      'Tax saved = deduction × your slab rate.',
    ],
    model: 'Rule-based Indian tax code optimizer',
  },
  rebalance: {
    title: 'Allocation reasoning',
    points: [
      'Current allocation is computed from your linked assets.',
      'Target equity depends on NIFTY P/E: lower P/E → more equity.',
      'Debt fills the remaining allocation after equity and property.',
      'Action direction compares current equity % with the AI target.',
    ],
    model: 'Market-aware strategic asset allocation',
  },
  whatif: {
    title: 'What-If simulation',
    points: [
      'Starting corpus is reduced by the one-time expense you select.',
      'Monthly contributions and chosen return rate compound each month.',
      'Projection horizon is fully adjustable from 5 to 30 years.',
      'Use this to stress-test life decisions before acting.',
    ],
    model: 'Deterministic forward-projection engine',
  },
  retirement: {
    title: 'FIRE calculation',
    points: [
      'FIRE number = 25 × annual expenses (4% withdrawal rule).',
      'Projected corpus compounds current net worth at 10% annually.',
      'Shortfall = FIRE number − projected corpus.',
      'Extra SIP needed = shortfall ÷ months until retirement.',
    ],
    model: '4% safe-withdrawal retirement model',
  },
};

export default function ExplainablePanel({ activeTab }: ExplainablePanelProps) {
  const { title, points, model } = REASONING[activeTab];
  return (
    <DashboardWidget title="Explainable AI" icon="fa-microchip" className="h-full">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{title}</p>
          <ul className="space-y-2">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                <i className="fas fa-check text-primary mt-0.5 text-[10px]" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-3 bg-violet-50 dark:bg-violet-900/10 rounded-lg border border-violet-100 dark:border-violet-800/20">
          <p className="text-[10px] font-bold text-violet-600 dark:text-violet-300 uppercase tracking-wide mb-1">Model Used</p>
          <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">{model}</p>
        </div>
        <p className="text-[10px] text-slate-400">
          <i className="fas fa-lock mr-1" />
          No personal data leaves your device. Projections are local estimates, not financial advice.
        </p>
      </div>
    </DashboardWidget>
  );
}

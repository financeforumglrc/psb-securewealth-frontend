import { useState } from 'react';

const CARDS = [
  { icon: 'fa-piggy-bank', title: 'Rule of 72', content: 'Divide 72 by your expected return rate to find how many years it takes to double your money. At 12% returns, your money doubles in 6 years.', color: 'primary' },
  { icon: 'fa-shield-halved', title: 'Emergency Fund', content: 'Keep 6 months of expenses in liquid assets. For monthly expenses of ₹72,000, aim for ₹4,32,000 in savings or liquid funds.', color: 'success' },
  { icon: 'fa-chart-pie', title: '50-30-20 Rule', content: 'Allocate 50% to needs, 30% to wants, and 20% to savings. If you earn ₹1,25,000, save at least ₹25,000 every month.', color: 'accent' },
  { icon: 'fa-receipt', title: '80C Tax Benefit', content: 'Invest up to ₹1,50,000 in ELSS, PPF, or NPS to reduce taxable income. At 30% bracket, you save ₹46,800 in taxes.', color: 'secondary' },
  { icon: 'fa-coins', title: 'Gold as Hedge', content: 'Allocate 5-10% of portfolio to gold. It acts as a hedge during market volatility and currency depreciation.', color: 'amber' },
  { icon: 'fa-hand-holding-dollar', title: 'SIP vs Lump Sum', content: 'SIPs reduce timing risk. Investing ₹10,000/month via SIP for 12 months is safer than ₹1,20,000 lump sum in volatile markets.', color: 'primary' },
];

export default function FinancialLiteracyCards() {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    accent: 'bg-accent/10 text-accent',
    secondary: 'bg-secondary/10 text-secondary',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4"><i className="fas fa-graduation-cap text-accent mr-2" />Financial Literacy</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CARDS.map((card, i) => (
          <div
            key={i}
            onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
            className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer hover:shadow-md transition-all min-h-[120px] flex flex-col"
          >
            {!flipped[i] ? (
              <>
                <div className={`w-8 h-8 rounded-lg ${colorMap[card.color]} flex items-center justify-center mb-2`}>
                  <i className={`fas ${card.icon} text-xs`} />
                </div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">{card.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1">Click to learn</p>
              </>
            ) : (
              <>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">{card.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{card.content}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

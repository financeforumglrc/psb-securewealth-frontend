import { useMemo } from 'react';
import { useWealthStore } from '../../store/wealthStore';

interface MerchantStats {
  name: string;
  icon: string;
  color: string;
  total: number;
  count: number;
  avg: number;
}

export default function TransactionComparison() {
  const transactions = useWealthStore((s) => s.transactions);

  const stats = useMemo(() => {
    const merchants: Record<string, MerchantStats> = {
      Swiggy: { name: 'Swiggy', icon: 'fa-burger', color: 'bg-orange-500', total: 0, count: 0, avg: 0 },
      Zomato: { name: 'Zomato', icon: 'fa-pizza-slice', color: 'bg-rose-500', total: 0, count: 0, avg: 0 },
      Zepto: { name: 'Zepto', icon: 'fa-basket-shopping', color: 'bg-purple-500', total: 0, count: 0, avg: 0 },
    };

    transactions.forEach((t) => {
      const desc = t.description.toLowerCase();
      if (desc.includes('swiggy')) {
        merchants.Swiggy.total += t.amount;
        merchants.Swiggy.count += 1;
      } else if (desc.includes('zomato')) {
        merchants.Zomato.total += t.amount;
        merchants.Zomato.count += 1;
      } else if (desc.includes('zepto')) {
        merchants.Zepto.total += t.amount;
        merchants.Zepto.count += 1;
      }
    });

    Object.values(merchants).forEach((m) => {
      m.avg = m.count > 0 ? Math.round(m.total / m.count) : 0;
    });

    return Object.values(merchants).sort((a, b) => b.total - a.total);
  }, [transactions]);

  const maxTotal = Math.max(...stats.map((s) => s.total), 1);
  const top = stats[0];
  const second = stats[1];
  const insight = top && second
    ? `You spent ₹${(top.total - second.total).toLocaleString()} more on ${top.name} than ${second.name}. Switching could save ₹${Math.round((top.total - second.total) * 0.15).toLocaleString()}/month.`
    : 'Add more transactions to see AI-powered merchant comparisons.';

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <i className="fas fa-scale-balanced text-primary" /> Transaction AI Comparison
        </h3>
        <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold">AI</span>
      </div>

      <div className="space-y-3 mb-4">
        {stats.map((m) => (
          <div key={m.name} className="flex items-center gap-3">
            <div className={`w-10 h-10 ${m.color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
              <i className={`fas ${m.icon}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{m.name}</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">₹{m.total.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${m.color} rounded-full transition-all`}
                  style={{ width: `${(m.total / maxTotal) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-slate-400">{m.count} orders</span>
                <span className="text-[10px] text-slate-400">Avg ₹{m.avg}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
        <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
          <i className="fas fa-lightbulb text-amber-500 mt-0.5" />
          {insight}
        </p>
      </div>

      <button className="w-full mt-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">
        <i className="fas fa-bullseye mr-1" /> Set Monthly Budget
      </button>
    </div>
  );
}

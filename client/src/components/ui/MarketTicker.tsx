import { useLivePrices } from '../../hooks/useLivePrices';

export default function MarketTicker() {
  const { nifty, sensex, gold, usdInr, loading } = useLivePrices();

  const data = [
    { symbol: 'NIFTY 50', value: nifty.value.toLocaleString('en-IN', { maximumFractionDigits: 2 }), change: `${nifty.percentChange >= 0 ? '+' : ''}${nifty.percentChange.toFixed(2)}%`, up: nifty.percentChange >= 0 },
    { symbol: 'SENSEX', value: sensex.value.toLocaleString('en-IN', { maximumFractionDigits: 2 }), change: `${sensex.percentChange >= 0 ? '+' : ''}${sensex.percentChange.toFixed(2)}%`, up: sensex.percentChange >= 0 },
    { symbol: 'GOLD', value: `₹${gold.value.toLocaleString('en-IN')}`, change: `${gold.percentChange >= 0 ? '+' : ''}${gold.percentChange.toFixed(2)}%`, up: gold.percentChange >= 0 },
    { symbol: 'USD/INR', value: `₹${usdInr.value.toFixed(2)}`, change: `${usdInr.percentChange >= 0 ? '+' : ''}${usdInr.percentChange.toFixed(2)}%`, up: usdInr.percentChange >= 0 },
  ];

  const display = [...data, ...data];

  return (
    <div className="bg-white border-b border-gray-200 overflow-x-auto h-8 flex items-center relative scrollbar-hide">
      <div className="flex items-center gap-1 px-2.5 bg-primary text-white text-[10px] font-bold h-full z-10 shrink-0">
        <i className="fas fa-chart-line mr-1" /> {loading ? '…' : 'LIVE'}
      </div>
      <div className="flex animate-ticker whitespace-nowrap min-w-max">
        {display.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 border-r border-gray-100 shrink-0">
            <span className="text-[10px] font-bold text-gray-700">{item.symbol}</span>
            <span className="text-[10px] text-gray-600">{item.value}</span>
            <span className={`text-[9px] font-bold ${item.up ? 'text-green-600' : 'text-red-500'}`}>
              <i className={`fas fa-caret-${item.up ? 'up' : 'down'} mr-0.5`} />
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

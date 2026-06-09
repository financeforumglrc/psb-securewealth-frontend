import { useState, useEffect } from 'react';
import { useLivePrices } from '../../hooks/useLivePrices';

export default function StockTicker() {
  const { nifty, sensex, gold, usdInr, loading } = useLivePrices();

  const data = [
    { name: 'NIFTY 50', value: nifty.value, change: nifty.percentChange, icon: 'fa-arrow-trend-up' },
    { name: 'SENSEX', value: sensex.value, change: sensex.percentChange, icon: 'fa-arrow-trend-up' },
    { name: 'GOLD', value: gold.value, change: gold.percentChange, icon: 'fa-arrow-trend-up' },
    { name: 'USD/INR', value: usdInr.value, change: usdInr.percentChange, icon: 'fa-arrow-trend-down' },
  ];

  // Slight jitter for visual "live" feel
  const [jittered, setJittered] = useState(data);
  useEffect(() => {
    setJittered(data);
  }, [nifty.value, sensex.value, gold.value, usdInr.value]);

  useEffect(() => {
    const interval = setInterval(() => {
      setJittered((prev) =>
        prev.map((item) => ({
          ...item,
          value: item.value * (1 + (Math.random() - 0.5) * 0.0002),
          change: item.change + (Math.random() - 0.5) * 0.01,
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-dark text-white py-2 overflow-hidden">
      <div className="flex gap-8 animate-marquee whitespace-nowrap">
        {[...jittered, ...jittered].map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="font-semibold">{item.name}</span>
            <span>{item.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            <span className={item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              <i className={`fas ${item.change >= 0 ? 'fa-caret-up' : 'fa-caret-down'} mr-1`} />
              {Math.abs(item.change).toFixed(2)}%
            </span>
            {loading && i === 0 && <span className="text-[10px] text-slate-400 animate-pulse">(fetching live)</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

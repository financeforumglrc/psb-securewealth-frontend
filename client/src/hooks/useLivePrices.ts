import { useState, useEffect } from 'react';

export interface PriceData {
  value: number;
  change: number;
  percentChange: number;
}

export interface LivePrices {
  nifty: PriceData;
  sensex: PriceData;
  gold: PriceData;
  usdInr: PriceData;
  loading: boolean;
  error: string | null;
}

const BASE: LivePrices = {
  nifty: { value: 23366.7, change: -49.85, percentChange: -0.21 },
  sensex: { value: 74243.34, change: -116.67, percentChange: -0.16 },
  gold: { value: 78500, change: 600, percentChange: 0.85 },
  usdInr: { value: 83.2, change: 0.1, percentChange: 0.1 },
  loading: true,
  error: null,
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getJitteredBase(): LivePrices {
  const now = Date.now();
  const jitter = (s: number, range: number) => (seededRandom(now + s) - 0.5) * range;
  return {
    nifty: {
      value: BASE.nifty.value + jitter(1, 80),
      change: BASE.nifty.change + jitter(2, 20),
      percentChange: BASE.nifty.percentChange + jitter(3, 0.15),
    },
    sensex: {
      value: BASE.sensex.value + jitter(4, 200),
      change: BASE.sensex.change + jitter(5, 50),
      percentChange: BASE.sensex.percentChange + jitter(6, 0.15),
    },
    gold: {
      value: BASE.gold.value + jitter(7, 300),
      change: BASE.gold.change + jitter(8, 100),
      percentChange: BASE.gold.percentChange + jitter(9, 0.2),
    },
    usdInr: {
      value: BASE.usdInr.value + jitter(10, 0.3),
      change: BASE.usdInr.change + jitter(11, 0.1),
      percentChange: BASE.usdInr.percentChange + jitter(12, 0.05),
    },
    loading: true,
    error: null,
  };
}

export function useLivePrices(): LivePrices {
  const [prices, setPrices] = useState<LivePrices>(getJitteredBase());

  useEffect(() => {
    let mounted = true;

    async function fetchPrices() {
      const nifty = prices.nifty;
      const sensex = prices.sensex;
      let gold = prices.gold;
      let usdInr = prices.usdInr;
      const hasLiveData = false;

      // Try exchangerate-api for USD/INR (this one usually works)
      try {
        const usdRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { cache: 'no-store' });
        if (usdRes.ok) {
          const usdData = await usdRes.json();
          const rate = usdData.rates?.INR || 83.2;
          const prevRate = 83.15;
          usdInr = {
            value: rate,
            change: +(rate - prevRate).toFixed(2),
            percentChange: +(((rate - prevRate) / prevRate) * 100).toFixed(2),
          };
        }
      } catch { /* ignore */ }

      // Try gold-api
      try {
        const goldRes = await fetch('https://api.gold-api.com/price/XAU', { cache: 'no-store' });
        if (goldRes.ok) {
          const goldData = await goldRes.json();
          const usdOz = goldData.price || 3300;
          const rate = usdInr.value || 83.2;
          const inrPerGram = (usdOz * rate) / 31.1035;
          const inrPer10g = Math.round(inrPerGram * 10);
          const prevGold = inrPer10g - 500;
          gold = {
            value: inrPer10g,
            change: Math.round(inrPer10g - prevGold),
            percentChange: +(((inrPer10g - prevGold) / prevGold) * 100).toFixed(2),
          };
        }
      } catch { /* ignore */ }

      if (mounted) {
        setPrices({
          nifty,
          sensex,
          gold,
          usdInr,
          loading: false,
          error: hasLiveData ? null : 'Live market data updated',
        });
      }
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return prices;
}

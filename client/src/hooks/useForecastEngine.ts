import { useMemo } from 'react';

interface ForecastParams {
  monthlySavings: number;
  years: number;
  expectedReturn: number;
  inflation: number;
}

interface ForecastPoint {
  year: number;
  optimistic: number;
  base: number;
  conservative: number;
}

export function projectWealth(params: ForecastParams): ForecastPoint[] {
  const { monthlySavings, years, expectedReturn, inflation } = params;
  const realReturn = expectedReturn - inflation;
  const monthlyRate = realReturn / 100 / 12;
  const data: ForecastPoint[] = [];

  for (let y = 0; y <= years; y++) {
    const months = y * 12;
    const base = monthlySavings * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    data.push({
      year: y,
      optimistic: base * 1.3,
      base: base,
      conservative: base * 0.6,
    });
  }
  return data;
}

export function useForecastEngine(params: ForecastParams) {
  return useMemo(() => projectWealth(params), [params.monthlySavings, params.years, params.expectedReturn, params.inflation]);
}

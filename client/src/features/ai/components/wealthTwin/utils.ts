import type { Transaction } from '@/shared/types';

export interface SpendingCategory {
  name: string;
  amount: number;
}

export function aggregateSpending(transactions: Transaction[]): SpendingCategory[] {
  const cats = new Map<string, number>();
  transactions
    .filter((t) => t.type === 'debit')
    .forEach((t) => {
      cats.set(t.category, (cats.get(t.category) || 0) + t.amount);
    });
  return Array.from(cats.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export interface MonteCarloPoint {
  year: number;
  base: number;
  optimistic: number;
  pessimistic: number;
}

export function generateMonteCarlo(currentNW: number, monthlySavings: number, years = 10): MonteCarloPoint[] {
  const data: MonteCarloPoint[] = [];
  const year = new Date().getFullYear();
  let base = currentNW;
  let optimistic = currentNW;
  let pessimistic = currentNW;
  const monthlyBase = 0.008; // ~10% annual
  const monthlyOptimistic = 0.012; // ~15% annual
  const monthlyPessimistic = 0.004; // ~5% annual

  for (let y = 0; y <= years; y++) {
    data.push({
      year: year + y,
      base: Math.round(base),
      optimistic: Math.round(optimistic),
      pessimistic: Math.round(pessimistic),
    });
    for (let m = 0; m < 12; m++) {
      base = base * (1 + monthlyBase) + monthlySavings;
      optimistic = optimistic * (1 + monthlyOptimistic) + monthlySavings;
      pessimistic = pessimistic * (1 + monthlyPessimistic) + monthlySavings;
    }
  }
  return data;
}

export interface LifeEventImpact {
  immediate: number;
  savingsChange: number;
  returnsChange: number;
  label: string;
}

export function generateLifeEventImpact(
  currentNW: number,
  monthlySavings: number,
  event: string
): LifeEventImpact {
  const multipliers: Record<string, LifeEventImpact> = {
    none: { immediate: 0, savingsChange: 0, returnsChange: 0, label: 'Baseline' },
    jobLoss: { immediate: -300000, savingsChange: -monthlySavings * 0.7, returnsChange: -0.02, label: 'Job Loss (6 months)' },
    marketCrash: { immediate: currentNW * -0.25, savingsChange: 0, returnsChange: -0.03, label: 'Market Crash (-25%)' },
    inheritance: { immediate: 2000000, savingsChange: 0, returnsChange: 0, label: 'Inheritance (+₹20L)' },
    wedding: { immediate: -1500000, savingsChange: -monthlySavings * 0.3, returnsChange: 0, label: 'Wedding Expense' },
    promotion: { immediate: 500000, savingsChange: monthlySavings * 0.5, returnsChange: 0, label: 'Promotion (+50% savings)' },
    medical: { immediate: -800000, savingsChange: 0, returnsChange: 0, label: 'Medical Emergency' },
  };
  return multipliers[event] || multipliers.none;
}

export function formatCr(v: number): string {
  return `₹${(v / 1e7).toFixed(2)}Cr`;
}

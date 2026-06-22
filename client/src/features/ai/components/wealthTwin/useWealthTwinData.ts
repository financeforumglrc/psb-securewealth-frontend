import { useMemo, useState } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useRecommendationEngine } from '@/shared/hooks/useRecommendationEngine';
import { aggregateSpending, generateMonteCarlo, generateLifeEventImpact, formatCr } from './utils';
import type { Asset } from '@/shared/types';

export type TwinTab = 'overview' | 'goals' | 'tax' | 'rebalance' | 'whatif' | 'retirement';

export interface TaxSuggestion {
  name: string;
  limit: number;
  recommended: number;
  saving: number;
  action: string;
}

export interface TaxPlan {
  annualIncome: number;
  suggestions: TaxSuggestion[];
  totalSaving: number;
}

export interface AllocationSlice {
  name: string;
  value: number;
  color: string;
}

export interface GoalPlan {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  gap: number;
  monthsLeft: number;
  monthlyNeed: number;
  onTrack: boolean;
}

export interface WhatIfPoint {
  year: number;
  netWorth: number;
}

export interface RetirementPoint {
  age: number;
  year: number;
  netWorth: number;
}

export interface RetirementProjection {
  data: RetirementPoint[];
  finalNW: number;
  shortfall: number;
  yearsToRetire: number;
}

export function useWealthTwinData() {
  const user = useWealthStore((s) => s.user);
  const goals = useWealthStore((s) => s.goals);
  const assets = useWealthStore((s) => s.assets);
  const marketData = useWealthStore((s) => s.marketData);
  const transactions = useWealthStore((s) => s.transactions);
  const setView = useWealthStore((s) => s.setView);

  const recommendations = useRecommendationEngine(user, marketData);

  const currentNW = useMemo(() => assets.reduce((sum, a) => sum + a.value, 0), [assets]);
  const savingsRate = user.monthlyIncome > 0 ? (user.monthlySavings / user.monthlyIncome) * 100 : 0;

  const categorySpending = useMemo(() => aggregateSpending(transactions), [transactions]);
  const totalExpenses = categorySpending.reduce((sum, c) => sum + c.amount, 0) || user.monthlyExpenses;
  const topCategory = categorySpending[0] || { name: 'No data', amount: 0 };
  const expenseRatio = (totalExpenses / user.monthlyIncome * 100).toFixed(1);

  const monteCarloData = useMemo(() => generateMonteCarlo(currentNW, user.monthlySavings, 15), [currentNW, user.monthlySavings]);
  const croreYear = monteCarloData.find((d) => d.base >= 1e7)?.year || 2035;

  const [lifeEvent, setLifeEvent] = useState('none');
  const eventImpact = useMemo(() => generateLifeEventImpact(currentNW, user.monthlySavings, lifeEvent), [currentNW, user.monthlySavings, lifeEvent]);
  const simulatedNW = Math.max(0, currentNW + eventImpact.immediate);
  const simulatedMonthlySavings = Math.max(0, user.monthlySavings + eventImpact.savingsChange);
  const simulatedData = useMemo(() => generateMonteCarlo(simulatedNW, simulatedMonthlySavings, 15), [simulatedNW, simulatedMonthlySavings]);

  const wealthDNA = useMemo(() => {
    const dna = [];
    if (savingsRate >= 30) dna.push({ label: 'Wealth Builder', icon: 'fa-crown', color: 'text-amber-500', desc: 'You save aggressively above 30%.' });
    else if (savingsRate >= 20) dna.push({ label: 'Balanced Saver', icon: 'fa-scale-balanced', color: 'text-emerald-500', desc: 'Healthy savings rate, room to optimize.' });
    else dna.push({ label: 'Spending Optimizer', icon: 'fa-wallet', color: 'text-rose-500', desc: 'Focus on reducing expenses first.' });

    if (assets.some((a: Asset) => a.type === 'stock' || a.type === 'mutualFund'))
      dna.push({ label: 'Equity Investor', icon: 'fa-chart-line', color: 'text-primary', desc: 'Comfortable with market-linked returns.' });
    else dna.push({ label: 'Capital Preserver', icon: 'fa-piggy-bank', color: 'text-blue-500', desc: 'Prefer safety over growth.' });

    const highRiskTxns = transactions.filter((t) => t.riskLevel === 'HIGH').length;
    if (highRiskTxns === 0)
      dna.push({ label: 'Safety First', icon: 'fa-shield-halved', color: 'text-emerald-500', desc: 'No blocked transactions. Clean history.' });
    else dna.push({ label: 'Risk Aware', icon: 'fa-triangle-exclamation', color: 'text-amber-500', desc: `${highRiskTxns} high-risk events detected & blocked.` });

    return dna;
  }, [savingsRate, assets, transactions]);

  const goalPlans = useMemo<GoalPlan[]>(() => {
    return goals.map((goal) => {
      const gap = goal.targetAmount - goal.currentAmount;
      const monthsLeft = Math.max(1, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
      const monthlyNeed = Math.max(0, gap / monthsLeft);
      const onTrack = user.monthlySavings >= monthlyNeed;
      return { ...goal, gap, monthsLeft, monthlyNeed, onTrack };
    });
  }, [goals, user.monthlySavings]);

  const taxOptimizer = useMemo<TaxPlan>(() => {
    const bracket = user.taxBracket || 30;
    const monthlyIncome = user.monthlyIncome;
    const annualIncome = monthlyIncome * 12;
    const suggestions: TaxSuggestion[] = [];

    const max80C = 150000;
    suggestions.push({
      name: '80C (ELSS + PPF)',
      limit: max80C,
      recommended: max80C,
      saving: Math.round(max80C * (bracket / 100)),
      action: 'Start ELSS SIP',
    });

    const maxNps = 50000;
    suggestions.push({
      name: 'NPS 80CCD(1B)',
      limit: maxNps,
      recommended: maxNps,
      saving: Math.round(maxNps * (bracket / 100)),
      action: 'Open NPS Tier-1',
    });

    if (monthlyIncome > 80000) {
      suggestions.push({
        name: 'HRA Optimization',
        limit: 120000,
        recommended: 120000,
        saving: Math.round(120000 * (bracket / 100)),
        action: 'Submit rent receipts',
      });
    }

    const totalSaving = suggestions.reduce((s, i) => s + i.saving, 0);
    return { annualIncome, suggestions, totalSaving };
  }, [user.taxBracket, user.monthlyIncome]);

  const rebalance = useMemo(() => {
    const equity = assets.filter((a: Asset) => a.type === 'stock' || a.type === 'mutualFund').reduce((s, a) => s + a.value, 0);
    const debt = assets.filter((a: Asset) => a.type === 'bank' || a.type === 'gold').reduce((s, a) => s + a.value, 0);
    const property = assets.filter((a: Asset) => a.type === 'property' || a.type === 'vehicle').reduce((s, a) => s + a.value, 0);
    const total = equity + debt + property || 1;

    const pe = marketData.niftyPe || 24;
    const equityTarget = pe > 26 ? 50 : pe < 22 ? 65 : 60;
    const debtTarget = 100 - equityTarget - 15;
    const propertyTarget = 15;

    return {
      current: [
        { name: 'Equity', value: Math.round((equity / total) * 100), color: '#0f766e' },
        { name: 'Debt/Liquid', value: Math.round((debt / total) * 100), color: '#f59e0b' },
        { name: 'Property', value: Math.round((property / total) * 100), color: '#8b5cf6' },
      ] as AllocationSlice[],
      target: [
        { name: 'Equity', value: equityTarget, color: '#0f766e' },
        { name: 'Debt/Liquid', value: debtTarget, color: '#f59e0b' },
        { name: 'Property', value: propertyTarget, color: '#8b5cf6' },
      ] as AllocationSlice[],
      action: equity / total < equityTarget / 100 ? 'Increase equity allocation' : 'Reduce equity allocation',
    };
  }, [assets, marketData]);

  // What-If simulator state
  const [whatIfSavings, setWhatIfSavings] = useState(user.monthlySavings);
  const [whatIfReturns, setWhatIfReturns] = useState(10);
  const [whatIfYears, setWhatIfYears] = useState(15);
  const [whatIfExpense, setWhatIfExpense] = useState(0);

  const whatIfData = useMemo<WhatIfPoint[]>(() => {
    const data: WhatIfPoint[] = [];
    const startYear = new Date().getFullYear();
    const adjustedNW = Math.max(0, currentNW - whatIfExpense);
    const monthlyRate = whatIfReturns / 100 / 12;
    let nw = adjustedNW;
    for (let y = 0; y <= whatIfYears; y++) {
      data.push({ year: startYear + y, netWorth: Math.round(nw) });
      for (let m = 0; m < 12; m++) {
        nw = nw * (1 + monthlyRate) + whatIfSavings;
      }
    }
    return data;
  }, [currentNW, whatIfSavings, whatIfReturns, whatIfYears, whatIfExpense]);

  // Retirement / FIRE state
  const [retirementAge, setRetirementAge] = useState(60);
  const [monthlyPensionNeed, setMonthlyPensionNeed] = useState(user.monthlyExpenses);
  const currentAge = 30; // simulated

  const fireNumber = useMemo(() => monthlyPensionNeed * 12 * 25, [monthlyPensionNeed]);

  const retirementProjection = useMemo<RetirementProjection>(() => {
    const data: RetirementPoint[] = [];
    const startYear = new Date().getFullYear();
    const yearsToRetire = retirementAge - currentAge;
    const monthlyRate = 10 / 100 / 12;
    let nw = currentNW;
    for (let y = 0; y <= yearsToRetire; y++) {
      data.push({ age: currentAge + y, year: startYear + y, netWorth: Math.round(nw) });
      for (let m = 0; m < 12; m++) {
        nw = nw * (1 + monthlyRate) + user.monthlySavings;
      }
    }
    const finalNW = data[data.length - 1]?.netWorth || 0;
    const shortfall = Math.max(0, fireNumber - finalNW);
    return { data, finalNW, shortfall, yearsToRetire };
  }, [currentNW, user.monthlySavings, retirementAge, fireNumber]);

  return {
    user,
    goals,
    assets,
    marketData,
    transactions,
    setView,
    recommendations,
    currentNW,
    savingsRate,
    categorySpending,
    totalExpenses,
    topCategory,
    expenseRatio,
    monteCarloData,
    croreYear,
    lifeEvent,
    setLifeEvent,
    eventImpact,
    simulatedData,
    wealthDNA,
    goalPlans,
    taxOptimizer,
    rebalance,
    whatIfSavings,
    setWhatIfSavings,
    whatIfReturns,
    setWhatIfReturns,
    whatIfYears,
    setWhatIfYears,
    whatIfExpense,
    setWhatIfExpense,
    whatIfData,
    retirementAge,
    setRetirementAge,
    monthlyPensionNeed,
    setMonthlyPensionNeed,
    currentAge,
    fireNumber,
    retirementProjection,
    formatCr,
  };
}

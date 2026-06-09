export interface Boost {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  durationDays: number;
  icon: string;
  color: string;
  used: boolean;
  appliedTo?: string;
  appliedAt?: string;
  expiresAt?: string;
}

export interface BoostStack {
  boosts: string[];
  estimatedImpact: string;
  reasoning: string;
}

const BOOSTS_KEY = 'sw_boosts';

const DEFAULT_BOOSTS: Boost[] = [
  { id: 'boost-1', name: '5x Sprint', description: '5x progress acceleration for 7 days', multiplier: 5, durationDays: 7, icon: 'fa-rocket', color: 'bg-rose-500', used: false },
  { id: 'boost-2', name: '3x Steady', description: '3x progress acceleration for 14 days', multiplier: 3, durationDays: 14, icon: 'fa-gauge-high', color: 'bg-primary', used: false },
  { id: 'boost-3', name: '2x Marathon', description: '2x progress acceleration for 30 days', multiplier: 2, durationDays: 30, icon: 'fa-person-running', color: 'bg-amber-500', used: false },
  { id: 'boost-4', name: 'Weekend Warrior', description: '5x boost active only on weekends', multiplier: 5, durationDays: 7, icon: 'fa-calendar-star', color: 'bg-violet-500', used: false },
  { id: 'boost-5', name: 'Market Dip Boost', description: '5x boost triggered during market dips', multiplier: 5, durationDays: 7, icon: 'fa-arrow-trend-down', color: 'bg-emerald-500', used: false },
];

export function getBoosts(): Boost[] {
  try {
    const stored = JSON.parse(localStorage.getItem(BOOSTS_KEY) || '[]');
    return stored.length ? stored : DEFAULT_BOOSTS;
  } catch {
    return DEFAULT_BOOSTS;
  }
}

export function saveBoosts(boosts: Boost[]) {
  localStorage.setItem(BOOSTS_KEY, JSON.stringify(boosts));
}

export function applyBoost(boostId: string, goalId: string): Boost[] {
  const boosts = getBoosts();
  const now = new Date();
  const idx = boosts.findIndex((b) => b.id === boostId);
  if (idx === -1 || boosts[idx].used) return boosts;

  const b = boosts[idx];
  const expires = new Date();
  expires.setDate(expires.getDate() + b.durationDays);

  boosts[idx] = {
    ...b,
    used: true,
    appliedTo: goalId,
    appliedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };
  saveBoosts(boosts);
  return boosts;
}

export function getActiveBoosts(): Boost[] {
  const now = new Date().toISOString();
  return getBoosts().filter((b) => b.used && b.expiresAt && b.expiresAt > now);
}

export function suggestBoostStack(marketTrend: 'bull' | 'bear' | 'sideways'): BoostStack {
  if (marketTrend === 'bear') {
    return {
      boosts: ['boost-1', 'boost-5'],
      estimatedImpact: '+47% faster goal reach during recovery',
      reasoning: 'Market dips + 5x Sprint + Dip Boost = maximum value accumulation when prices are low. Historical data shows 2.3x better outcomes.',
    };
  }
  if (marketTrend === 'bull') {
    return {
      boosts: ['boost-3', 'boost-2'],
      estimatedImpact: '+31% faster goal reach',
      reasoning: 'In bull markets, steady long-term boosts outperform short sprints. The 3x Steady + 2x Marathon stack compounds beautifully.',
    };
  }
  return {
    boosts: ['boost-1', 'boost-4'],
    estimatedImpact: '+38% faster goal reach',
    reasoning: 'Sideways markets favor concentrated effort. Weekend Warrior + 5x Sprint targets high-intensity saving windows.',
  };
}

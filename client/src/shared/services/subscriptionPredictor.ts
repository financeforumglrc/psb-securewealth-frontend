import type { Subscription } from '@/shared/types';

export interface ZombiePrediction {
  subscription: Subscription;
  daysUnused: number;
  predictedWasteAnnual: number;
  confidence: number;
  recommendation: 'pause' | 'cancel' | 'keep';
  reason: string;
}

export function predictZombieSubscriptions(subs: Subscription[]): ZombiePrediction[] {
  const ZOMBIE_THRESHOLD_DAYS = 45;

  return subs
    .filter((s) => s.status !== 'cancelled')
    .map((s) => {
      const daysUnused = s.daysSinceUsed ?? 0;
      const monthlyCost = monthlyEquivalent(s.amount, s.frequency);
      const annualWaste = monthlyCost * 12;

      let confidence = 0;
      let recommendation: 'pause' | 'cancel' | 'keep' = 'keep';
      let reason = '';

      if (daysUnused >= 90) {
        confidence = 95;
        recommendation = 'cancel';
        reason = `No activity in ${daysUnused} days. Strong candidate for cancellation.`;
      } else if (daysUnused >= ZOMBIE_THRESHOLD_DAYS) {
        confidence = 78;
        recommendation = 'pause';
        reason = `Unused for ${daysUnused} days. Pause for 3 months to test if you miss it.`;
      } else if (daysUnused >= 30 && s.category === 'Health') {
        confidence = 65;
        recommendation = 'pause';
        reason = 'Gym/fitness unused for a month. Seasonal pause recommended.';
      }

      return {
        subscription: s,
        daysUnused,
        predictedWasteAnnual: annualWaste,
        confidence,
        recommendation,
        reason,
      };
    })
    .filter((p) => p.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence);
}

function monthlyEquivalent(amount: number, frequency: string): number {
  if (frequency === 'monthly') return amount;
  if (frequency === 'quarterly') return amount / 3;
  if (frequency === 'yearly') return amount / 12;
  return amount;
}

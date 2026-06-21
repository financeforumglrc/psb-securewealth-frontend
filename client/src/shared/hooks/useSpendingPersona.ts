import { useMemo } from 'react';
import type { Transaction } from '@/shared/types';

export type SpendingPersona = 'Foodie' | 'Traveler' | 'Homebody' | 'Shopaholic' | 'Investor' | 'Balanced';

export interface PersonaDetails {
  persona: SpendingPersona;
  icon: string;
  color: string;
  tagline: string;
  budgetFocus: string;
  insight: string;
}

const PERSONA_KEY = 'sw_spending_persona';

export function computePersona(transactions: Transaction[]): SpendingPersona {
  const debits = transactions.filter((t) => t.type === 'debit' && t.status === 'ALLOWED');
  const total = debits.reduce((s, t) => s + t.amount, 0);
  if (total === 0) return 'Balanced';

  const byCategory: Record<string, number> = {};
  debits.forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  const pct = (cat: string) => (byCategory[cat] || 0) / total;

  if (pct('Food') + pct('Dining') > 0.25) return 'Foodie';
  if (pct('Travel') + pct('Transport') > 0.2) return 'Traveler';
  if (pct('Housing') + pct('Utilities') > 0.3) return 'Homebody';
  if (pct('Shopping') + pct('Entertainment') > 0.25) return 'Shopaholic';
  if (pct('Investment') > 0.2) return 'Investor';
  return 'Balanced';
}

export function getStoredPersona(): SpendingPersona | null {
  const p = localStorage.getItem(PERSONA_KEY);
  if (p && ['Foodie', 'Traveler', 'Homebody', 'Shopaholic', 'Investor', 'Balanced'].includes(p)) {
    return p as SpendingPersona;
  }
  return null;
}

export function storePersona(persona: SpendingPersona) {
  localStorage.setItem(PERSONA_KEY, persona);
}

export function usePersonaDetails(transactions: Transaction[]): PersonaDetails {
  const persona = useMemo(() => {
    const computed = computePersona(transactions);
    storePersona(computed);
    return computed;
  }, [transactions]);

  return useMemo(() => {
    switch (persona) {
      case 'Foodie':
        return {
          persona,
          icon: 'fa-utensils',
          color: 'text-rose-500',
          tagline: 'You live to eat — let us make it sustainable.',
          budgetFocus: 'Dining Out',
          insight: 'Your food spends are 28% above average. Try the "Cook at Home Challenge" to save ₹4,000/month.',
        };
      case 'Traveler':
        return {
          persona,
          icon: 'fa-plane',
          color: 'text-sky-500',
          tagline: 'Wanderlust is your fuel — plan it wisely.',
          budgetFocus: 'Travel & Transport',
          insight: 'Travel hacks: booking 45 days ahead saves 18% on average. Set a travel SIP for your next trip.',
        };
      case 'Homebody':
        return {
          persona,
          icon: 'fa-house-chimney',
          color: 'text-emerald-500',
          tagline: 'Home is where your heart (and wealth) is.',
          budgetFocus: 'Housing & Utilities',
          insight: 'Your housing costs are stable. Consider prepaying 1 EMI/year to save ₹2.3L in interest.',
        };
      case 'Shopaholic':
        return {
          persona,
          icon: 'fa-bag-shopping',
          color: 'text-amber-500',
          tagline: 'Retail therapy is real — but so is buyer\'s remorse.',
          budgetFocus: 'Shopping & Entertainment',
          insight: 'You shop most on weekends. Enable a 24-hour cooling-off rule for purchases above ₹2,000.',
        };
      case 'Investor':
        return {
          persona,
          icon: 'fa-chart-line',
          color: 'text-primary',
          tagline: 'Your money is already working overtime.',
          budgetFocus: 'Investments',
          insight: 'Great investing discipline! Diversify into international equities for geographic balance.',
        };
      default:
        return {
          persona,
          icon: 'fa-scale-balanced',
          color: 'text-slate-500',
          tagline: 'A balanced spender is a happy spender.',
          budgetFocus: 'General Budget',
          insight: 'Your spends are well-balanced across categories. Keep maintaining your 50-30-20 rule.',
        };
    }
  }, [persona]);
}

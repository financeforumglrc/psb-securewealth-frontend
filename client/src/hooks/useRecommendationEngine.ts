import { useMemo } from 'react';
import type { Recommendation, MarketData, UserProfile, InvestmentTrigger, CibilFactor } from '../types';

export function generateRecommendations(user: UserProfile, market: MarketData, triggers?: InvestmentTrigger[], cibilScore?: number, cibilFactors?: CibilFactor[]): Recommendation[] {
  const recs: Recommendation[] = [];
  const savingsRate = (user.monthlySavings / user.monthlyIncome) * 100;

  if (savingsRate < 20) {
    recs.push({
      id: 'r1', title: 'Increase Savings Rate', type: 'savings', priority: 'high',
      description: 'Your savings rate is below 20%. Aim for at least 20% to build wealth.',
      potential: '₹8.4L more in 10 years',
      action: 'Set Auto-SIP',
      why: {
        userPattern: `Current savings rate: ${savingsRate.toFixed(1)}%`,
        marketCondition: `Inflation at ${market.inflation}% erodes purchasing power`,
        ruleLogic: '50-30-20 rule: 20% minimum to savings'
      }
    });
  }

  if (market.niftyPe > 25) {
    recs.push({
      id: 'r2', title: 'Stagger Large Investments', type: 'investment', priority: 'medium',
      description: 'NIFTY P/E is above 25. Consider SIP over lump sum.',
      potential: 'Reduce volatility by 15%',
      action: 'Start STP',
      why: {
        userPattern: 'You have surplus liquid funds',
        marketCondition: `NIFTY P/E: ${market.niftyPe} (above historical avg)`,
        ruleLogic: 'High P/E → staggered entry reduces timing risk'
      }
    });
  }

  if (market.inflation > 6) {
    recs.push({
      id: 'r3', title: 'Inflation Hedge Allocation', type: 'investment', priority: 'medium',
      description: 'Inflation is above 6%. Add gold/FD exposure for stability.',
      potential: 'Preserve 4% real returns',
      action: 'View Options',
      why: {
        userPattern: 'Portfolio is 80% equity',
        marketCondition: `Inflation: ${market.inflation}% (above RBI target)`,
        ruleLogic: 'High inflation → diversify into real assets'
      }
    });
  }

  if (user.taxBracket === 30) {
    recs.push({
      id: 'r4', title: 'Maximize 80C Benefits', type: 'tax', priority: 'high',
      description: 'You are in the 30% bracket. ELSS + PPF can save ₹46,800/year.',
      potential: 'Save ₹46,800 in taxes',
      action: 'Invest Now',
      why: {
        userPattern: 'Tax bracket: 30%',
        marketCondition: 'ELSS offers 12% avg returns + 3-year lock-in',
        ruleLogic: '80C limit: ₹1.5L/year → max tax savings at 30%'
      }
    });
  }

  recs.push({
    id: 'r5', title: 'Build Emergency Corpus', type: 'protection', priority: 'medium',
    description: 'Keep 6 months of expenses in liquid funds.',
    potential: 'Financial resilience',
    action: 'Calculate',
    why: {
      userPattern: `Monthly expenses: ₹${user.monthlyExpenses.toLocaleString()}`,
      marketCondition: 'Recession probability: elevated',
      ruleLogic: 'Emergency fund = 6× monthly expenses'
    }
  });

  // Trigger-based recommendations
  if (triggers) {
    const buyDip = triggers.find((t) => t.id === 'trigger-1');
    if (buyDip && buyDip.enabled && buyDip.progress >= 70 && buyDip.progress < 100) {
      recs.unshift({
        id: 'r-trigger', title: 'Market Opportunity Detected', type: 'investment', priority: 'high',
        description: `Your '${buyDip.name}' trigger is ${buyDip.progress}% close to firing. ${buyDip.currentValue}. Be ready to act.`,
        potential: 'Buy ₹10,000 SIP at lower NAV',
        action: 'View Trigger',
        why: {
          userPattern: 'You have set auto-investment triggers',
          marketCondition: buyDip.currentValue,
          ruleLogic: buyDip.condition
        }
      });
    }

    const fdAlert = triggers.find((t) => t.id === 'trigger-3');
    if (fdAlert && fdAlert.fired && !fdAlert.dismissed) {
      recs.unshift({
        id: 'r-fd', title: 'High FD Rates Available', type: 'savings', priority: 'high',
        description: 'IDFC First Bank is offering 8.1% on 2-year FDs. Lock in before rates fall.',
        potential: 'Earn ₹16,200/year on ₹2L FD',
        action: 'Compare FDs',
        why: {
          userPattern: 'You requested FD rate alerts',
          marketCondition: 'IDFC First @ 8.1%, RBL @ 8.05%',
          ruleLogic: 'Rates > 8% are rare in current cycle'
        }
      });
    }
  }

  // Credit health recommendation
  if (cibilScore && cibilFactors && cibilScore < 750) {
    const worst = cibilFactors.filter((f) => f.status !== 'good').sort((a, b) => a.score - b.score)[0];
    if (worst) {
      recs.push({
        id: 'r-cibil', title: 'Boost Your CIBIL Score', type: 'protection', priority: 'high',
        description: `Score: ${cibilScore}. ${worst.name} is your weakest factor. ${worst.detail}. Target 750+ for best loan rates.`,
        potential: `Save 0.5-1% on future loans`,
        action: 'View Credit Health',
        why: {
          userPattern: `Current CIBIL: ${cibilScore}`,
          marketCondition: `Banks offer best rates at 750+`,
          ruleLogic: `${worst.name} contributes ${worst.weight}% to score`
        }
      });
    }
  }

  return recs;
}

export function useRecommendationEngine(user: UserProfile, market: MarketData, triggers?: InvestmentTrigger[], cibilScore?: number, cibilFactors?: CibilFactor[]) {
  return useMemo(() => generateRecommendations(user, market, triggers, cibilScore, cibilFactors), [user, market, triggers, cibilScore, cibilFactors]);
}

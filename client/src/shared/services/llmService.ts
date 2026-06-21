import { callAI } from '@/shared/services/aiOrchestrator';
import { buildELI5Prompt, buildMonthlyNarrativePrompt } from '@/shared/services/aiPrompts';

export interface ELI5Response {
  term: string;
  explanation: string;
  analogy: string;
}

export interface MonthlyNarrative {
  headline: string;
  paragraphs: string[];
  emojiMood: string;
  highlight: string;
}

function localExplainLikeImFive(term: string): ELI5Response {
  const explanations: Record<string, ELI5Response> = {
    SIP: {
      term: 'SIP',
      explanation: 'SIP means putting a little money into investments every month, like dropping coins into a piggy bank.',
      analogy: 'It is like a piggy bank you add to every month for something big, like a bicycle!',
    },
    'P/E Ratio': {
      term: 'P/E Ratio',
      explanation: 'It tells you how many years it would take for a company to earn back its price.',
      analogy: 'If a lemonade stand costs ₹100 and makes ₹10 a year, its P/E is 10 — like buying 10 years of lemonade profits upfront.',
    },
    'Emergency Fund': {
      term: 'Emergency Fund',
      explanation: 'Money saved only for unexpected problems, like a doctor visit or a broken phone.',
      analogy: 'It is like a spare umbrella you keep even when the weather looks sunny.',
    },
    'Compound Interest': {
      term: 'Compound Interest',
      explanation: 'Earning interest on your interest, so money grows faster and faster over time.',
      analogy: 'Like a snowball rolling down a hill — it gets bigger and bigger the longer it rolls!',
    },
    'Asset Allocation': {
      term: 'Asset Allocation',
      explanation: 'Splitting your money between different types of investments so you do not put all eggs in one basket.',
      analogy: 'Like packing different snacks for a trip — if you do not like one, you still have others!',
    },
    'Net Worth': {
      term: 'Net Worth',
      explanation: 'Everything you own minus everything you owe. It shows how rich you really are.',
      analogy: 'If you have 10 toys but borrowed 3, your net worth is 7 toys.',
    },
    'Inflation': {
      term: 'Inflation',
      explanation: 'When prices go up over time, so the same money buys less than before.',
      analogy: 'Like a balloon getting bigger — your candy bar stays the same size but costs more air to fill!',
    },
    'Mutual Fund': {
      term: 'Mutual Fund',
      explanation: 'A big pot of money collected from many people, managed by experts who invest it in stocks and bonds.',
      analogy: 'Like a group picnic where everyone brings one dish — together you get a full feast!',
    },
  };

  const normalized = Object.keys(explanations).find((k) => k.toLowerCase() === term.toLowerCase());
  return (
    normalized?.length ? explanations[normalized] : {
      term,
      explanation: `${term} is a money concept that helps people make smarter financial decisions.`,
      analogy: `Think of ${term} like a helpful friend who makes sure your money works hard for you!`,
    }
  );
}

function localMonthlyNarrative(metrics: {
  savingsRate: number;
  topExpenseCategory: string;
  topExpenseAmount: number;
  goalProgress: number;
  totalSavings: number;
  totalExpenses: number;
  fraudBlocked: number;
}): MonthlyNarrative {
  const { savingsRate, topExpenseCategory, goalProgress, fraudBlocked } = metrics;

  let headline = '';
  let paragraphs: string[] = [];
  let emojiMood = '';
  let highlight = '';

  if (savingsRate >= 25) {
    headline = 'A Month of Financial Mastery';
    emojiMood = '🌟';
    highlight = `You saved ${savingsRate.toFixed(0)}% of your income — that is superstar discipline!`;
    paragraphs = [
      `Your savings rate of ${savingsRate.toFixed(1)}% puts you in the top 10% of savers. Keep this up and financial freedom is closer than you think.`,
      `You spent the most on ${topExpenseCategory} this month. As long as it brings you joy and aligns with your goals, that is perfectly fine.`,
      `Your goals are ${goalProgress.toFixed(0)}% funded. The compound effect is starting to work in your favor.`,
    ];
  } else if (savingsRate >= 15) {
    headline = 'Steady Progress, Strong Foundation';
    emojiMood = '⛅';
    highlight = `You saved ${savingsRate.toFixed(0)}% this month — solid, with room to grow.`;
    paragraphs = [
      `At a ${savingsRate.toFixed(1)}% savings rate, you are building wealth steadily. A small nudge to 20% could shave years off your retirement timeline.`,
      `${topExpenseCategory} was your biggest spend. Consider reviewing if every rupee there was intentional.`,
      `Your goal progress sits at ${goalProgress.toFixed(0)}%. Automating an extra SIP of ₹2,000 could accelerate this meaningfully.`,
    ];
  } else {
    headline = 'A Gentle Nudge for Next Month';
    emojiMood = '🌧️';
    highlight = `Savings rate at ${savingsRate.toFixed(0)}% — let us find a small win for next month.`;
    paragraphs = [
      `This month your savings rate was ${savingsRate.toFixed(1)}%. Life happens, but even automating ₹1,000 more into a SIP can create a powerful habit.`,
      `${topExpenseCategory} dominated your outflows. Is there one subscription or impulse category you could trim?`,
      `Your goals are ${goalProgress.toFixed(0)}% funded. Every rupee counts — the best time to start was yesterday, the second best is today.`,
    ];
  }

  if (fraudBlocked > 0) {
    paragraphs.push(`Your SecureWealth shield blocked ${fraudBlocked} fraudulent transaction${fraudBlocked > 1 ? 's' : ''} this month. Sleep easy — we are watching.`);
  }

  return { headline, paragraphs, emojiMood, highlight };
}

export async function explainLikeImFive(term: string): Promise<ELI5Response> {
  try {
    const result = await callAI(buildELI5Prompt(term), { mode: 'cost-aware' });
    const parsed = JSON.parse(result.text);
    if (parsed?.term && parsed?.explanation && parsed?.analogy) {
      return parsed as ELI5Response;
    }
  } catch {
    // fallback to local
  }
  return new Promise((resolve) => {
    setTimeout(() => resolve(localExplainLikeImFive(term)), 400);
  });
}

export async function generateMonthlyNarrative(metrics: {
  savingsRate: number;
  topExpenseCategory: string;
  topExpenseAmount: number;
  goalProgress: number;
  totalSavings: number;
  totalExpenses: number;
  fraudBlocked: number;
}): Promise<MonthlyNarrative> {
  try {
    const result = await callAI(buildMonthlyNarrativePrompt(metrics), { mode: 'cost-aware' });
    const parsed = JSON.parse(result.text);
    if (parsed?.headline && Array.isArray(parsed?.paragraphs) && parsed?.emojiMood && parsed?.highlight) {
      return parsed as MonthlyNarrative;
    }
  } catch {
    // fallback to local
  }
  return new Promise((resolve) => {
    setTimeout(() => resolve(localMonthlyNarrative(metrics)), 600);
  });
}

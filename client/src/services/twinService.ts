import { callAI } from './aiOrchestrator';
import { buildTwinPrompt } from './aiPrompts';

export interface TwinMessage {
  id: string;
  role: 'user' | 'twin';
  text: string;
  timestamp: string;
  type?: 'text' | 'chart' | 'alert';
}

export interface TwinContext {
  monthlyIncome: number;
  monthlySavings: number;
  goals: { name: string; progress: number }[];
  recentTransactions: { desc: string; amount: number; type: string }[];
  fraudEvents: number;
}

const CHAT_KEY = 'sw_twin_chat';

export function getChatHistory(): TwinMessage[] {
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addMessage(msg: TwinMessage) {
  const history = getChatHistory();
  history.push(msg);
  localStorage.setItem(CHAT_KEY, JSON.stringify(history.slice(-50)));
}

function localAskTwin(question: string, context: TwinContext): TwinMessage {
  const q = question.toLowerCase();
  let response = '';
  let type: TwinMessage['type'] = 'text';

  if (q.includes('save') && q.includes('more')) {
    const extra = parseInt(q.match(/\d+/)?.[0] || '2000');
    const futureValue = Math.round(extra * ((Math.pow(1.01, 240) - 1) / 0.01));
    response = `If you save an extra ₹${extra.toLocaleString()}/month, you could accumulate approximately ₹${(futureValue / 1e5).toFixed(1)} Lakhs in 20 years at 12% returns. That is like buying a premium sedan with just your spare change!`;
  } else if (q.includes('fraud') || q.includes('blocked') || q.includes('scam')) {
    response = `I see ${context.fraudEvents} fraud attempts were blocked recently. Here is what happened: our AI detected unusual patterns — new devices, rushed actions, and flagged payees. We paused these transactions and alerted you. Your money is safe. Would you like me to walk you through each blocked attempt?`;
    type = 'alert';
  } else if (q.includes('goal') || q.includes('emergency')) {
    const goal = context.goals[0];
    response = `Your ${goal?.name || 'main goal'} is ${goal?.progress || 0}% complete. At your current pace, you will hit 100% in about ${Math.ceil((100 - (goal?.progress || 0)) / 5)} months. Want me to show you how a 5x Boost could cut that timeline?`;
  } else if (q.includes('sip') || q.includes('invest')) {
    response = `SIP is like a gym membership for your money — small, regular deposits that build massive strength over time. Your current monthly investment of ₹${context.monthlySavings.toLocaleString()} is solid. Increasing it by just 10% could accelerate your retirement by 3 years!`;
  } else if (q.includes('budget') || q.includes('spend')) {
    response = `Based on your cash flow, I recommend the 50-30-20 rule: 50% needs, 30% wants, 20% investments. You are currently investing ${Math.round((context.monthlySavings / context.monthlyIncome) * 100)}% — ${context.monthlySavings / context.monthlyIncome >= 0.2 ? 'great discipline!' : 'there is room to grow.'}`;
  } else {
    response = `That is an interesting question! Based on your financial profile — monthly income of ₹${context.monthlyIncome.toLocaleString()} and savings rate of ${Math.round((context.monthlySavings / context.monthlyIncome) * 100)}% — here is what I think: stay consistent with your SIPs, maintain your emergency fund, and review your portfolio quarterly. Would you like a deeper dive into any specific area?`;
  }

  return {
    id: `twin-${Date.now()}`,
    role: 'twin',
    text: response,
    timestamp: new Date().toISOString(),
    type,
  };
}

export async function askTwin(question: string, context: TwinContext): Promise<TwinMessage> {
  try {
    const result = await callAI(question, {
      mode: 'cost-aware',
      userContext: {
        income: context.monthlyIncome,
        savings: context.monthlySavings,
        riskAppetite: 'moderate',
      },
    });
    return {
      id: `twin-${Date.now()}`,
      role: 'twin',
      text: result.text,
      timestamp: new Date().toISOString(),
      type: 'text',
    };
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => resolve(localAskTwin(question, context)), 900);
    });
  }
}

export async function generateMonthSummary(context: TwinContext): Promise<string> {
  try {
    const prompt = buildTwinPrompt(
      `Write a 2-sentence month-end summary for me based on my savings rate and any fraud events.`,
      {
        income: context.monthlyIncome,
        savings: context.monthlySavings,
        riskAppetite: 'moderate',
      }
    );
    const result = await callAI(prompt, { mode: 'cost-aware' });
    return result.text;
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => {
        const savingsRate = Math.round((context.monthlySavings / context.monthlyIncome) * 100);
        let summary = '';
        if (savingsRate >= 30) {
          summary = `You saved ${savingsRate}% this month — that is phenomenal! You are in the top 5% of savers. Your goals are tracking beautifully, and your fraud shield kept everything safe. Keep this momentum! 🚀`;
        } else if (savingsRate >= 20) {
          summary = `You saved ${savingsRate}% this month — solid work! You are building real wealth. One small tip: trimming discretionary spends by ₹2,000 could push you into the elite 30% club. 💪`;
        } else {
          summary = `You saved ${savingsRate}% this month. Every journey starts somewhere! I noticed some unbudgeted dining spends. Would you like me to set up a gentle nudge for next month? 🌱`;
        }
        if (context.fraudEvents > 0) {
          summary += ` Also, I blocked ${context.fraudEvents} suspicious transaction${context.fraudEvents > 1 ? 's' : ''} this month. Sleep easy — I am watching.`;
        }
        resolve(summary);
      }, 600);
    });
  }
}

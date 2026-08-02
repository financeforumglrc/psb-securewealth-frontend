import type { UserContext } from '@/shared/services/aiPrompts';

interface LocalAIResponse {
  text: string;
  provider: string;
  model: string;
  latencyMs: number;
}

function formatCurrency(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function getSavingsRate(income: number, savings: number): number {
  return income > 0 ? (savings / income) * 100 : 0;
}

function getGoalProgress(goals: { currentAmount: number; targetAmount: number }[]): number {
  if (goals.length === 0) return 0;
  const totalProgress = goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount), 0);
  return (totalProgress / goals.length) * 100;
}

function analyzeQuery(query: string, context: UserContext): string {
  const q = query.toLowerCase();
  const income = context.income || 0;
  const savings = context.savings || 0;
  const expenses = context.expenses || 0;
  const netWorth = context.netWorth || 0;
  const goals = context.goals || [];
  const savingsRate = getSavingsRate(income, savings);
  const goalProgress = getGoalProgress(goals);

  // Date/time questions
  if (q.includes('date') || q.includes('today') || q.includes('what day') || q.includes('current date')) {
    const now = new Date();
    return `Today's date is ${now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

Current time: ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}

For financial planning, note that:
• Market closes at 3:30 PM IST
• SIP dates are usually 1st-10th of each month
• Tax filing deadline is July 31st`;
  }

  // Wealth forecast
  if (q.includes('wealth') && (q.includes('5 year') || q.includes('forecast') || q.includes('future'))) {
    const projected = netWorth * Math.pow(1.08 + savingsRate / 1000, 5);
    return `Based on your current savings rate of ${savingsRate.toFixed(1)}% and net worth of ${formatCurrency(netWorth)}, your projected wealth in 5 years would be approximately ${formatCurrency(projected)}.

To accelerate this:
• Increase monthly savings by ₹10,000 → +₹7L in 5 years
• Invest in index funds (12% avg return) instead of FD (6%)
• Review and rebalance portfolio quarterly

Your current trajectory is ${savingsRate >= 20 ? 'excellent' : savingsRate >= 10 ? 'good' : 'needs improvement'}.`;
  }

  // Goal analysis
  if (q.includes('goal') || q.includes('track')) {
    const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount);
    if (activeGoals.length === 0) {
      return `Great news! You have no pending goals. Consider setting new financial goals like:
• Emergency fund (6 months expenses)
• Home down payment
• Child education fund
• Retirement corpus

I can help you create a savings plan for any of these.`;
    }
    const goalNames = activeGoals.map((g) => g.name).join(', ');
    const totalNeeded = activeGoals.reduce((sum, g) => sum + (g.targetAmount - g.currentAmount), 0);
    const monthsNeeded = savings > 0 ? Math.ceil(totalNeeded / savings) : 0;
    return `You are ${goalProgress.toFixed(0)}% towards your goals: ${goalNames}.

Remaining amount needed: ${formatCurrency(totalNeeded)}
At current savings rate: ~${monthsNeeded} months to completion

To speed up:
• Increase SIP by ₹5,000/month
• Cut discretionary spending by 10%
• Consider a side income source

Your progress is ${goalProgress >= 50 ? 'on track' : goalProgress >= 25 ? 'moderate' : 'behind schedule'}.`;
  }

  // Risk check
  if (q.includes('risk') || q.includes('portfolio') || q.includes('safe')) {
    const riskLevel = savingsRate >= 20 ? 'low' : savingsRate >= 10 ? 'moderate' : 'high';
    return `Your portfolio risk level: ${riskLevel.toUpperCase()}

Analysis:
• Savings rate: ${savingsRate.toFixed(1)}% (${savingsRate >= 20 ? 'healthy' : savingsRate >= 10 ? 'adequate' : 'low'})
• Emergency coverage: ${netWorth > expenses * 6 ? 'Good' : 'Needs improvement'}
• Diversification: ${netWorth > 0 ? 'Review needed' : 'Start building'}

Recommendations:
${savingsRate < 20 ? '• Increase savings to 20% of income\n' : ''}${netWorth < expenses * 6 ? '• Build 6-month emergency fund first\n' : ''}• Diversify across equity, debt, and gold
• Review insurance coverage annually`;
  }

  // Buy house
  if (q.includes('house') || q.includes('home') || q.includes('property')) {
    const housePrice = income * 60; // 5 years income
    const downPayment = housePrice * 0.2;
    const monthsToSave = savings > 0 ? Math.ceil(downPayment / savings) : 0;
    return `Based on your income of ${formatCurrency(income)}, a reasonable house budget would be around ${formatCurrency(housePrice)}.

Down payment needed (20%): ${formatCurrency(downPayment)}
Time to save: ~${monthsToSave} months at current savings

My recommendation: ${monthsToSave <= 24 ? 'Buy now' : monthsToSave <= 48 ? 'Save for 2 more years' : 'Focus on increasing income first'}

Alternative: Invest the down payment in index funds for potentially better returns, then buy later.`;
  }

  // Child education
  if (q.includes('child') || q.includes('education') || q.includes('kid')) {
    const educationCost = 2500000; // ₹25L for good education
    const monthlyNeeded = educationCost / (12 * 15); // 15 years
    return `For a child's higher education (est. ₹25L in 15 years):

Monthly SIP needed: ₹${Math.round(monthlyNeeded).toLocaleString('en-IN')}

Breakdown:
• 15-year horizon
• 12% expected return (equity)
• Total corpus: ₹25L

Start early to reduce monthly burden. Consider:
• Sukanya Samriddhi (if girl child)
• Child-specific mutual funds
• PPF for debt portion`;
  }

  // Retirement
  if (q.includes('retire') || q.includes('retirement')) {
    const retirementCorpus = expenses * 12 * 25; // 25 years expenses
    const monthlyNeeded = retirementCorpus / (12 * 25); // 25 years
    return `For comfortable retirement, you need approximately ${formatCurrency(retirementCorpus)} (25x annual expenses).

Monthly SIP needed: ₹${Math.round(monthlyNeeded).toLocaleString('en-IN')}

Current status: ${netWorth >= retirementCorpus * 0.2 ? 'On track' : 'Needs acceleration'}

Strategy:
• Maximize EPF/PPF contributions
• Start NPS for additional tax benefit
• Equity exposure: 100 minus your age
• Review every 5 years`;
  }

  // General/default
  return `Based on your financial profile:
• Net Worth: ${formatCurrency(netWorth)}
• Monthly Savings: ${formatCurrency(savings)}
• Savings Rate: ${savingsRate.toFixed(1)}%
• Active Goals: ${goals.length}

Your financial health is ${savingsRate >= 20 ? 'excellent' : savingsRate >= 10 ? 'good' : 'needs attention'}.

Top recommendations:
${savingsRate < 20 ? '• Increase savings to 20% of income\n' : ''}• Build emergency fund (6 months expenses)
• Diversify investments across asset classes
• Review and optimize tax savings

What specific area would you like me to analyze?`;
}

export async function callLocalAI(message: string, userContext: UserContext): Promise<LocalAIResponse> {
  const start = Date.now();
  // Simulate thinking time
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
  const text = analyzeQuery(message, userContext);
  return {
    text,
    provider: 'local',
    model: 'wealth-twin-gpt-v1',
    latencyMs: Date.now() - start,
  };
}

export default callLocalAI;

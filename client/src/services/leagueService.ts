export interface FantasyPlayer {
  id: string;
  name: string;
  avatar: string;
  portfolioValue: number;
  savingsRate: number;
  goalProgress: number;
  weeklyReturn: number;
  strategy: string;
}

export interface FantasyLeague {
  id: string;
  name: string;
  icon: string;
  members: number;
  myRank: number;
  topPerformer: string;
  weeklyTheme: string;
}

export interface ScoutingReport {
  playerId: string;
  headline: string;
  strengths: string[];
  weaknesses: string[];
  aiVerdict: string;
}

const LEAGUES: FantasyLeague[] = [
  { id: 'l1', name: 'Bharat Wealth League', icon: 'fa-trophy', members: 1284, myRank: 42, topPerformer: 'Priya M.', weeklyTheme: 'Highest Savings Rate' },
  { id: 'l2', name: 'SIP Champions', icon: 'fa-medal', members: 856, myRank: 12, topPerformer: 'Deepanshu S.', weeklyTheme: 'Goal Completion Speed' },
  { id: 'l3', name: 'FIRE Movement India', icon: 'fa-fire', members: 2341, myRank: 89, topPerformer: 'Ankit K.', weeklyTheme: 'Lowest Expense Ratio' },
];

const LEADERBOARD: FantasyPlayer[] = [
  { id: 'p1', name: 'Priya M.', avatar: 'PM', portfolioValue: 2450000, savingsRate: 42, goalProgress: 78, weeklyReturn: 3.2, strategy: 'Aggressive SIP ladder with monthly step-ups' },
  { id: 'p2', name: 'Deepanshu S.', avatar: 'DS', portfolioValue: 1980000, savingsRate: 35, goalProgress: 65, weeklyReturn: 2.8, strategy: 'Balanced mix of equity and debt with gold hedge' },
  { id: 'p3', name: 'Ankit K.', avatar: 'AK', portfolioValue: 1750000, savingsRate: 38, goalProgress: 82, weeklyReturn: 2.1, strategy: 'Minimalist spending with high investment ratio' },
  { id: 'p4', name: 'Sneha R.', avatar: 'SR', portfolioValue: 1620000, savingsRate: 28, goalProgress: 55, weeklyReturn: 1.9, strategy: 'Dividend-focused passive income strategy' },
  { id: 'p5', name: 'Vikram P.', avatar: 'VP', portfolioValue: 1480000, savingsRate: 31, goalProgress: 48, weeklyReturn: 1.5, strategy: 'Value investing with contrarian bets' },
];

export function getLeagues(): FantasyLeague[] {
  return LEAGUES;
}

export function getLeaderboard(): FantasyPlayer[] {
  return [...LEADERBOARD].sort((a, b) => b.weeklyReturn - a.weeklyReturn);
}

export async function generateScoutingReport(playerId: string): Promise<ScoutingReport> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const player = LEADERBOARD.find((p) => p.id === playerId);
      if (!player) {
        resolve({ playerId, headline: 'Unknown player', strengths: [], weaknesses: [], aiVerdict: '' });
        return;
      }
      resolve({
        playerId,
        headline: `${player.name} is dominating with a ${player.savingsRate}% savings rate — here is why it works.`,
        strengths: [
          `Consistent ${player.savingsRate}% savings rate builds massive compounding advantage`,
          `${player.goalProgress}% goal progress shows disciplined execution`,
          `Portfolio diversification reduces single-asset risk`,
        ],
        weaknesses: [
          'Emergency fund coverage could be stronger (4.2 months vs recommended 6)',
          'Over-concentration in domestic equity (82%) exposes to India-specific volatility',
        ],
        aiVerdict: `Verdict: ${player.name} is a top-tier wealth builder. Replicating their SIP discipline while adding international diversification could make them unstoppable.`,
      });
    }, 800);
  });
}

export function getMyFantasyPortfolio() {
  return {
    name: 'Deepanshu Sharma',
    avatar: 'RS',
    portfolioValue: 1980000,
    savingsRate: 35,
    goalProgress: 65,
    weeklyReturn: 2.8,
    holdings: [
      { name: 'Axis Bluechip Fund', allocation: 35, return: 14.2 },
      { name: 'Nifty 50 ETF', allocation: 25, return: 12.8 },
      { name: 'Digital Gold', allocation: 15, return: 8.5 },
      { name: 'SBI Liquid Fund', allocation: 15, return: 6.2 },
      { name: 'International Equity', allocation: 10, return: 11.4 },
    ],
  };
}

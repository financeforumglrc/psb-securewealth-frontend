import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';

interface Nudge {
  id: string;
  icon: string;
  title: string;
  text: string;
  color: 'rose' | 'amber' | 'emerald' | 'primary' | 'sky';
  action: string;
  actionLink?: string;
}

const COLOR_MAP: Record<string, { bg: string; text: string; btn: string }> = {
  rose: { bg: 'bg-rose-100 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', btn: 'bg-rose-500 hover:bg-rose-600' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', btn: 'bg-amber-500 hover:bg-amber-600' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', btn: 'bg-emerald-500 hover:bg-emerald-600' },
  primary: { bg: 'bg-primary/10 dark:bg-primary/20', text: 'text-primary dark:text-primary', btn: 'bg-primary hover:bg-primary/90' },
  sky: { bg: 'bg-sky-100 dark:bg-sky-900/20', text: 'text-sky-600 dark:text-sky-400', btn: 'bg-sky-500 hover:bg-sky-600' },
};

function useDynamicNudges(): Nudge[] {
  const user = useWealthStore((s) => s.user);
  const goals = useWealthStore((s) => s.goals);
  const transactions = useWealthStore((s) => s.transactions);
  const market = useWealthStore((s) => s.marketData);

  return useMemo(() => {
    const nudges: Nudge[] = [];
    const savingsRate = (user.monthlySavings / user.monthlyIncome) * 100;

    // 1. Savings rate nudge
    if (savingsRate < 20) {
      const gap = Math.round(user.monthlyIncome * 0.2 - user.monthlySavings);
      nudges.push({
        id: 'savings-rate',
        icon: 'fa-piggy-bank',
        title: 'Boost Your Savings',
        text: `You're saving ${savingsRate.toFixed(1)}% of income. Increase by ₹${gap.toLocaleString()}/mo to hit the 20% goal.`,
        color: 'amber',
        action: 'Set SIP',
        actionLink: 'goals',
      });
    }

    // 2. Uninvested surplus
    const bankAssets = useWealthStore.getState().assets.filter((a) => a.type === 'bank');
    const liquidCash = bankAssets.reduce((s, a) => s + a.value, 0);
    if (liquidCash > 100000) {
      const dailyLoss = Math.round(liquidCash * (market.inflation / 100) / 365);
      nudges.push({
        id: 'uninvested-cash',
        icon: 'fa-fire',
        title: 'Loss Aversion Alert',
        text: `₹${liquidCash.toLocaleString()} sitting idle loses ~₹${dailyLoss}/day to ${market.inflation}% inflation.`,
        color: 'rose',
        action: 'Invest Now',
        actionLink: 'portfolio',
      });
    }

    // 3. Goal deadline proximity
    const urgentGoal = goals
      .map((g) => ({ ...g, monthsLeft: Math.max(0, Math.ceil((new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))) }))
      .filter((g) => g.monthsLeft <= 6 && g.currentAmount < g.targetAmount * 0.8)
      .sort((a, b) => a.monthsLeft - b.monthsLeft)[0];
    if (urgentGoal) {
      nudges.push({
        id: 'goal-urgent',
        icon: 'fa-bullseye',
        title: 'Goal Deadline Approaching',
        text: `"${urgentGoal.name}" is due in ${urgentGoal.monthsLeft} months. You're ${Math.round((urgentGoal.currentAmount / urgentGoal.targetAmount) * 100)}% there.`,
        color: 'primary',
        action: 'Review Goal',
        actionLink: 'goals',
      });
    }

    // 4. Spending spike detection
    const last7Days = transactions.filter((t) => {
      const d = new Date(t.date);
      const daysAgo = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7 && t.type === 'debit';
    });
    const weeklySpend = last7Days.reduce((s, t) => s + t.amount, 0);
    const prev7Days = transactions.filter((t) => {
      const d = new Date(t.date);
      const daysAgo = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo > 7 && daysAgo <= 14 && t.type === 'debit';
    });
    const prevWeeklySpend = prev7Days.reduce((s, t) => s + t.amount, 0);
    if (prevWeeklySpend > 0 && weeklySpend > prevWeeklySpend * 1.3) {
      nudges.push({
        id: 'spending-spike',
        icon: 'fa-chart-column',
        title: 'Spending Spike Detected',
        text: `This week's spending is ${Math.round((weeklySpend / prevWeeklySpend - 1) * 100)}% higher than last week.`,
        color: 'rose',
        action: 'View Transactions',
        actionLink: 'transactions',
      });
    }

    // 5. Market opportunity
    if (market.niftyPe < 22) {
      nudges.push({
        id: 'market-opportunity',
        icon: 'fa-chart-line',
        title: 'Market Opportunity',
        text: `NIFTY P/E is ${market.niftyPe} — below historical average. Good time to increase SIP.`,
        color: 'emerald',
        action: 'Increase SIP',
        actionLink: 'portfolio',
      });
    }

    // 6. Goal streak (positive nudge)
    if (goals.length > 0 && goals.every((g) => g.currentAmount > 0)) {
      nudges.push({
        id: 'goal-streak',
        icon: 'fa-trophy',
        title: 'Goal Momentum',
        text: `All ${goals.length} goals have progress. Keep the momentum going!`,
        color: 'emerald',
        action: 'View Goals',
        actionLink: 'goals',
      });
    }

    // 7. Tax planning reminder
    const month = new Date().getMonth();
    if (month >= 0 && month <= 2) { // Jan-Mar
      nudges.push({
        id: 'tax-planning',
        icon: 'fa-file-invoice-dollar',
        title: 'Tax Season Alert',
        text: 'March 31st is approaching. Have you maxed out your 80C deductions?',
        color: 'sky',
        action: 'Plan Tax',
        actionLink: 'tax',
      });
    }

    return nudges.slice(0, 5); // max 5 nudges
  }, [user, goals, transactions, market]);
}

export default function BehavioralNudges() {
  const nudges = useDynamicNudges();
  const setView = useWealthStore((s) => s.setView);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const activeNudges = nudges.filter((n) => !dismissed.has(n.id));

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible || activeNudges.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % activeNudges.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [visible, activeNudges.length]);

  if (!visible || activeNudges.length === 0) return null;

  const nudge = activeNudges[current];
  const colors = COLOR_MAP[nudge.color];

  return (
    <div className="fixed top-20 right-4 z-50 max-w-xs">
      <AnimatePresence mode="wait">
        <motion.div
          key={nudge.id}
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 p-4 relative"
        >
          {/* Dismiss */}
          <button
            onClick={() => setDismissed((prev) => new Set(prev).add(nudge.id))}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs w-5 h-5 flex items-center justify-center"
          >
            <i className="fas fa-times" />
          </button>

          {/* Counter */}
          <div className="absolute top-2 left-2 flex gap-0.5">
            {activeNudges.map((_, i) => (
              <div key={i} className={`w-1 h-1 rounded-full ${i === current ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
            ))}
          </div>

          <div className="flex items-start gap-3 mt-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
              <i className={`fas ${nudge.icon} text-xs ${colors.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{nudge.title}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{nudge.text}</p>
              {nudge.actionLink && (
                <button
                  onClick={() => setView(nudge.actionLink as any)}
                  className={`mt-2 text-[10px] px-2.5 py-1 text-white rounded-lg font-bold transition-colors ${colors.btn}`}
                >
                  {nudge.action}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

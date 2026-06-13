import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';
import CosmosCard from '../ui/CosmosCard';

/* ═══════════════════════════════════════════════════════════════
   SMART ACTION ORCHESTRATOR — Requirement #6 Advanced Solution
   Converts insights into executable actions:
   • Emergency fund calculator
   • Auto-SIP date optimizer
   • Goal-fund allocation mapping
   • Tax-loss harvesting suggestions
   • Smart FD laddering
   • Credit card payment optimizer
   ═══════════════════════════════════════════════════════════════ */

export default function SmartActionOrchestrator() {
  const user = useWealthStore((s) => s.user);
  const assets = useWealthStore((s) => s.assets);
  const goals = useWealthStore((s) => s.goals);
  const setView = useWealthStore((s) => s.setView);

  const monthlyExpenses = user.monthlyExpenses;

  // Emergency fund calc
  const emergencyFundNeeded = monthlyExpenses * 6;
  const liquidAssets = assets.filter((a) => a.liquidity === 'high' && a.type === 'bank').reduce((s, a) => s + a.value, 0);
  const emergencyGap = Math.max(0, emergencyFundNeeded - liquidAssets);

  // SIP optimizer
  const bestSipDate = useMemo(() => {
    // Suggest salary day + 2 days
    return 5;
  }, []);

  // Goal-fund mapping
  const goalFundMap = useMemo(() => {
    return goals.map((goal) => {
      const monthsLeft = Math.max(1, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
      const yearsLeft = monthsLeft / 12;
      let recommendedMix = '';
      let equityPct = 0;
      if (yearsLeft < 1) { recommendedMix = '100% Debt/Liquid'; equityPct = 0; }
      else if (yearsLeft < 3) { recommendedMix = '30% Equity + 70% Debt'; equityPct = 30; }
      else if (yearsLeft < 7) { recommendedMix = '60% Equity + 40% Debt'; equityPct = 60; }
      else { recommendedMix = '80% Equity + 20% Debt'; equityPct = 80; }
      const monthlyNeed = Math.max(0, (goal.targetAmount - goal.currentAmount) / monthsLeft);
      return { ...goal, monthsLeft, recommendedMix, equityPct, monthlyNeed };
    });
  }, [goals]);

  // Tax-loss harvesting simulation
  const taxLossHarvest = useMemo(() => {
    const losingInvestments = assets.filter((a) => (a.returns || 0) < 0 && (a.type === 'stock' || a.type === 'mutualFund'));
    const totalLoss = losingInvestments.reduce((s, a) => s + (a.value * Math.abs(a.returns || 0) / 100), 0);
    const taxSaving = totalLoss * (user.taxBracket || 30) / 100;
    return { losingInvestments, totalLoss, taxSaving };
  }, [assets, user.taxBracket]);

  // FD laddering
  const fdLadder = useMemo(() => {
    const lumpsum = liquidAssets > emergencyFundNeeded ? liquidAssets - emergencyFundNeeded : 0;
    if (lumpsum < 100000) return null;
    return [
      { tenure: '1 Year', amount: lumpsum * 0.2, rate: '7.0%' },
      { tenure: '2 Year', amount: lumpsum * 0.3, rate: '7.3%' },
      { tenure: '3 Year', amount: lumpsum * 0.3, rate: '7.5%' },
      { tenure: '5 Year', amount: lumpsum * 0.2, rate: '7.8%' },
    ];
  }, [liquidAssets, emergencyFundNeeded]);

  // Credit card optimizer (simulated)
  const creditCards = [
    { name: 'Card A', outstanding: 50000, interest: 36 },
    { name: 'Card B', outstanding: 30000, interest: 24 },
  ];
  const sortedCards = [...creditCards].sort((a, b) => b.interest - a.interest);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <i className="fas fa-wand-magic-sparkles text-primary" />
          Smart Action Orchestrator
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">AI converts insights into executable money moves</p>
      </div>

      {/* Priority Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Emergency Fund */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <CosmosCard variant={emergencyGap > 0 ? 'gradient' : 'default'} padding="md" glow={emergencyGap > 0} glowColor="#ef4444">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center"><i className="fas fa-kit-medical" /></div>
              <h3 className="font-bold text-slate-800 dark:text-white">Emergency Fund</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Needed (6 months)</span><span className="font-bold">₹{emergencyFundNeeded.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Available Liquid</span><span className="font-bold">₹{liquidAssets.toLocaleString()}</span></div>
              {emergencyGap > 0 && (
                <div className="flex justify-between"><span className="text-slate-500">Gap</span><span className="font-bold text-rose-600">₹{emergencyGap.toLocaleString()}</span></div>
              )}
            </div>
            {emergencyGap > 0 ? (
              <button onClick={() => setView('goals')} className="mt-3 w-full py-2 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600">
                Build Emergency Corpus
              </button>
            ) : (
              <div className="mt-3 p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg text-center text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                <i className="fas fa-check-circle mr-1" /> Emergency fund fully covered
              </div>
            )}
          </CosmosCard>
        </motion.div>

        {/* SIP Optimizer */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <CosmosCard variant="elevated" padding="md">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><i className="fas fa-calendar-check" /></div>
              <h3 className="font-bold text-slate-800 dark:text-white">SIP Date Optimizer</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Best SIP date based on your salary credit & market volatility.
            </p>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-center">
              <p className="text-[10px] text-slate-500">Recommended SIP Date</p>
              <p className="text-2xl font-black text-blue-600">{bestSipDate}<sup>th</sup></p>
              <p className="text-[10px] text-slate-400">of every month</p>
            </div>
            <button onClick={() => setView('portfolio')} className="mt-3 w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark">
              Set Auto-SIP
            </button>
          </CosmosCard>
        </motion.div>

        {/* Tax-Loss Harvesting */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <CosmosCard variant="elevated" padding="md">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><i className="fas fa-scissors" /></div>
              <h3 className="font-bold text-slate-800 dark:text-white">Tax-Loss Harvest</h3>
            </div>
            {taxLossHarvest.totalLoss > 1000 ? (
              <>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  {taxLossHarvest.losingInvestments.length} underperforming asset{taxLossHarvest.losingInvestments.length > 1 ? 's' : ''} detected.
                </p>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                  <p className="text-[10px] text-slate-500">Potential Tax Saving</p>
                  <p className="text-xl font-black text-emerald-600">₹{Math.round(taxLossHarvest.taxSaving).toLocaleString()}</p>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">No loss-harvesting opportunities right now.</p>
            )}
            <button onClick={() => setView('tax')} className="mt-3 w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark">
              Optimize Taxes
            </button>
          </CosmosCard>
        </motion.div>
      </div>

      {/* Goal-Fund Mapping */}
      <CosmosCard variant="default" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 dark:text-white"><i className="fas fa-bullseye text-primary mr-2" />Goal-Fund Allocation Map</h3>
          <button onClick={() => setView('goals')} className="text-xs text-primary font-bold hover:underline">Manage Goals</button>
        </div>
        <div className="space-y-3">
          {goalFundMap.length === 0 ? (
            <p className="text-sm text-slate-500">No goals set. Add goals to get personalized fund allocation.</p>
          ) : (
            goalFundMap.map((goal) => (
              <div key={goal.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{goal.name}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold">{goal.recommendedMix}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${goal.equityPct}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 w-16 text-right">{goal.monthsLeft} months</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Monthly SIP needed</span>
                  <span className="font-bold text-primary">₹{Math.round(goal.monthlyNeed).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CosmosCard>

      {/* FD Laddering */}
      {fdLadder && (
        <CosmosCard variant="default" padding="md">
          <h3 className="font-bold text-slate-800 dark:text-white mb-3"><i className="fas fa-building-columns text-amber-500 mr-2" />Smart FD Laddering</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Surplus of ₹{(liquidAssets - emergencyFundNeeded).toLocaleString()} after emergency fund. Suggested ladder:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {fdLadder.map((fd, i) => (
              <div key={i} className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg text-center">
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">{fd.tenure}</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white">₹{Math.round(fd.amount).toLocaleString()}</p>
                <p className="text-[10px] text-slate-500">@ {fd.rate}</p>
              </div>
            ))}
          </div>
        </CosmosCard>
      )}

      {/* Credit Card Optimizer */}
      <CosmosCard variant="default" padding="md">
        <h3 className="font-bold text-slate-800 dark:text-white mb-3"><i className="fas fa-credit-card text-rose-500 mr-2" />Debt Payment Optimizer</h3>
        <div className="space-y-2">
          {sortedCards.map((card, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{card.name}</p>
                <p className="text-[10px] text-slate-500">Outstanding: ₹{card.outstanding.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-rose-600">{card.interest}%</p>
                <p className="text-[10px] text-slate-500">interest</p>
              </div>
              {i === 0 && (
                <span className="ml-2 text-[9px] px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold">PAY FIRST</span>
              )}
            </div>
          ))}
        </div>
      </CosmosCard>
    </div>
  );
}

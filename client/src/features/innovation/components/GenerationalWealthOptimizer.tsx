import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, AlertTriangle, CheckCircle2, Baby, GraduationCap, Home, Heart } from 'lucide-react';

interface Generation {
  name: string;
  period: string;
  startNetWorth: number;
  endNetWorth: number;
  keyEvents: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function calculateGenerationalWealth(currentNetWorth: number, monthlySavings: number, monthlyIncome: number): Generation[] {
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) : 0.1;
  const growthRate = 1 + (0.08 + savingsRate * 0.04); // Base 8% + savings rate bonus

  // Generation 1: You (30 years)
  const gen1End = currentNetWorth * Math.pow(growthRate, 30);

  // Generation 2: Children (30 years, starts with inheritance)
  const gen2Start = gen1End * 0.7; // 30% to taxes/expenses
  const gen2End = gen2Start * Math.pow(growthRate * 0.9, 30);

  // Generation 3: Grandchildren (30 years)
  const gen3Start = gen2End * 0.7;
  const gen3End = gen3Start * Math.pow(growthRate * 0.85, 30);

  return [
    {
      name: 'You',
      period: '2026 - 2056',
      startNetWorth: currentNetWorth,
      endNetWorth: gen1End,
      keyEvents: ['Career peak', 'Home purchase', 'Children education', 'Retirement'],
      icon: TrendingUp,
      color: 'bg-blue-500',
    },
    {
      name: 'Your Children',
      period: '2056 - 2086',
      startNetWorth: gen2Start,
      endNetWorth: gen2End,
      keyEvents: ['Inheritance received', 'Own family', 'Property investments', 'Business ventures'],
      icon: Users,
      color: 'bg-violet-500',
    },
    {
      name: 'Your Grandchildren',
      period: '2086 - 2116',
      startNetWorth: gen3Start,
      endNetWorth: gen3End,
      keyEvents: ['Generational trust', 'Education fund', 'Family legacy', 'Philanthropy'],
      icon: Baby,
      color: 'bg-emerald-500',
    },
  ];
}

function formatCurrency(n: number) {
  if (n >= 1e9) return `₹${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function GenerationalWealthOptimizer() {
  const [currentNetWorth, setCurrentNetWorth] = useState(4500000);
  const [monthlySavings, setMonthlySavings] = useState(35000);
  const [monthlyIncome, setMonthlyIncome] = useState(150000);
  const [actions, setActions] = useState<string[]>([]);

  const generations = useMemo(
    () => calculateGenerationalWealth(currentNetWorth, monthlySavings, monthlyIncome),
    [currentNetWorth, monthlySavings, monthlyIncome]
  );

  const totalWealth = generations[2].endNetWorth;

  const addAction = (action: string) => {
    if (!actions.includes(action)) {
      setActions([...actions, action]);
    }
  };

  const removeAction = (action: string) => {
    setActions(actions.filter((a) => a !== action));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-600" /> Generational Wealth Optimizer
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Plan wealth across 3 generations with life-event aware AI.</p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Current Net Worth</label>
          <input
            type="number"
            value={currentNetWorth}
            onChange={(e) => setCurrentNetWorth(Number(e.target.value))}
            className="w-full text-lg font-black text-slate-800 dark:text-white bg-transparent outline-none"
          />
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Monthly Savings</label>
          <input
            type="number"
            value={monthlySavings}
            onChange={(e) => setMonthlySavings(Number(e.target.value))}
            className="w-full text-lg font-black text-slate-800 dark:text-white bg-transparent outline-none"
          />
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Monthly Income</label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
            className="w-full text-lg font-black text-slate-800 dark:text-white bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Total Wealth */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-900 to-indigo-900 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70 uppercase tracking-wider">3-Generation Wealth</p>
            <p className="text-3xl font-black mt-1">{formatCurrency(totalWealth)}</p>
            <p className="text-xs text-white/70 mt-1">By year 2116</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/60">Growth multiple</p>
            <p className="text-2xl font-black text-emerald-300">{(totalWealth / currentNetWorth).toFixed(1)}x</p>
          </div>
        </div>
      </div>

      {/* Generations */}
      <div className="space-y-3">
        {generations.map((gen, i) => {
          const Icon = gen.icon;
          return (
            <motion.div
              key={gen.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${gen.color} flex items-center justify-center text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-800 dark:text-white">{gen.name}</p>
                  <p className="text-[10px] text-slate-400">{gen.period}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">End Wealth</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white">{formatCurrency(gen.endNetWorth)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {gen.keyEvents.map((event) => (
                  <span key={event} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400">
                    {event}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Optimization Actions */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-3">Optimize Your Legacy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { name: 'Start SIP for children education', impact: '+₹2.1Cr by 2056', icon: GraduationCap },
            { name: 'Create family trust fund', impact: 'Tax efficient transfer', icon: Heart },
            { name: 'Buy property for rental income', impact: '+₹1.8Cr by 2056', icon: Home },
            { name: 'Increase monthly savings by ₹10K', impact: '+₹3.2Cr by 2056', icon: TrendingUp },
            { name: 'Invest in index funds', impact: 'Beat inflation by 4%', icon: Target },
            { name: 'Plan for healthcare costs', impact: 'Protect wealth from shocks', icon: AlertTriangle },
          ].map((action) => {
            const Icon = action.icon;
            const active = actions.includes(action.name);
            return (
              <button
                key={action.name}
                onClick={() => (active ? removeAction(action.name) : addAction(action.name))}
                className={`p-3 rounded-xl border text-left transition-all ${
                  active
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold text-slate-800 dark:text-white">{action.name}</span>
                  {active && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
                </div>
                <p className="text-[10px] text-slate-500">{action.impact}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

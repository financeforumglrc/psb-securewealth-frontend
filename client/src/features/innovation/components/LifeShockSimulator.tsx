import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';

interface ShockScenario {
  id: string;
  icon: string;
  label: string;
  defaultAmount: number;
  maxAmount: number;
  step: number;
  description: string;
}

const SCENARIOS: ShockScenario[] = [
  {
    id: 'job-loss',
    icon: 'fa-briefcase',
    label: 'Job Loss',
    defaultAmount: 150000,
    maxAmount: 600000,
    step: 10000,
    description: 'No salary for 3 months. Monthly expenses continue.',
  },
  {
    id: 'medical',
    icon: 'fa-heart-pulse',
    label: 'Medical Emergency',
    defaultAmount: 500000,
    maxAmount: 1500000,
    step: 25000,
    description: 'Unexpected hospital bill not fully covered by insurance.',
  },
  {
    id: 'car-breakdown',
    icon: 'fa-car-burst',
    label: 'Car Breakdown',
    defaultAmount: 100000,
    maxAmount: 500000,
    step: 5000,
    description: 'Major repair or accident deductible.',
  },
  {
    id: 'home-repair',
    icon: 'fa-house-crack',
    label: 'Home Repair',
    defaultAmount: 300000,
    maxAmount: 1000000,
    step: 10000,
    description: 'Roof repair, plumbing failure, or appliance replacement.',
  },
];

export default function LifeShockSimulator() {
  const user = useWealthStore((s) => s.user);
  const assets = useWealthStore((s) => s.assets);
  const goals = useWealthStore((s) => s.goals);

  const [selectedId, setSelectedId] = useState<string>('job-loss');
  const [amount, setAmount] = useState<number>(SCENARIOS[0].defaultAmount);
  const [simulated, setSimulated] = useState(false);

  const selected = SCENARIOS.find((s) => s.id === selectedId) || SCENARIOS[0];

  const monthlyExpenses = user.monthlyExpenses || 35000;
  const emergencyGoal = goals.find((g) => g.name.toLowerCase().includes('emergency'));
  const emergencyFundValue = emergencyGoal?.currentAmount || 125000;

  const buckets = useMemo(() => {
    const liquid = assets.filter((a) => a.liquidity === 'high' || a.type === 'bank' || a.name.toLowerCase().includes('digital gold'));
    const digitalGold = assets.filter((a) => a.name.toLowerCase().includes('digital gold') || a.name.toLowerCase().includes('crypto'));
    const fd = assets.filter((a) => a.name.toLowerCase().includes('fd') || a.name.toLowerCase().includes('fixed deposit'));
    const physicalGold = assets.filter((a) => a.type === 'gold' && !a.name.toLowerCase().includes('digital'));

    const liquidTotal = liquid.reduce((s, a) => s + (a.value || 0), 0);
    const digitalGoldTotal = digitalGold.reduce((s, a) => s + (a.value || 0), 0);
    const fdTotal = fd.reduce((s, a) => s + (a.value || 0), 0);
    const physicalGoldTotal = physicalGold.reduce((s, a) => s + (a.value || 0), 0);

    return {
      liquidTotal,
      digitalGoldTotal,
      fdTotal,
      physicalGoldTotal,
      emergencyFundValue,
    };
  }, [assets, emergencyFundValue]);

  const recommendation = useMemo(() => {
    const { liquidTotal, digitalGoldTotal, fdTotal, emergencyFundValue } = buckets;
    const monthsCovered = Math.floor((emergencyFundValue + liquidTotal) / Math.max(monthlyExpenses, 1));
    let remaining = amount;
    const steps: { source: string; amount: number; note?: string }[] = [];

    if (emergencyFundValue > 0) {
      const useEmergency = Math.min(remaining, emergencyFundValue);
      if (useEmergency > 0) {
        steps.push({ source: 'Emergency Fund', amount: useEmergency, note: `${monthsCovered} months expenses covered` });
        remaining -= useEmergency;
      }
    }

    if (remaining > 0 && liquidTotal > 0) {
      const useLiquid = Math.min(remaining, liquidTotal);
      steps.push({ source: 'Liquid Savings', amount: useLiquid, note: 'Instant access, no penalty' });
      remaining -= useLiquid;
    }

    if (remaining > 0 && digitalGoldTotal > 0) {
      const useDigitalGold = Math.min(remaining, digitalGoldTotal);
      const savedVsFdPenalty = Math.round(useDigitalGold * 0.015); // ~1.5% vs FD premature penalty
      steps.push({ source: 'Digital Gold', amount: useDigitalGold, note: `Saves ~₹${savedVsFdPenalty.toLocaleString()} vs breaking FD` });
      remaining -= useDigitalGold;
    }

    if (remaining > 0 && fdTotal > 0) {
      const useFd = Math.min(remaining, fdTotal);
      const penalty = Math.round(useFd * 0.01); // approx 1% penalty + lower interest
      steps.push({ source: 'Fixed Deposit', amount: useFd, note: `Penalty ~₹${penalty.toLocaleString()}` });
      remaining -= useFd;
    }

    const shortfall = remaining;
    const isCovered = shortfall <= 0;

    return { steps, shortfall, isCovered, monthsCovered };
  }, [amount, buckets, monthlyExpenses]);

  const handleScenarioChange = (id: string) => {
    const scenario = SCENARIOS.find((s) => s.id === id) || SCENARIOS[0];
    setSelectedId(id);
    setAmount(scenario.defaultAmount);
    setSimulated(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <i className="fas fa-bolt text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Life Shock Simulator</h3>
            <p className="text-xs text-slate-300 dark:text-slate-600">Test real-life crises before they happen. See exactly how your money protects you.</p>
          </div>
        </div>
      </div>

      {/* Scenario selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => handleScenarioChange(scenario.id)}
            className={`p-3 rounded-xl border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
              selectedId === scenario.id
                ? 'bg-primary/10 border-primary/30 shadow-md'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/30'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${selectedId === scenario.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
              <i className={`fas ${scenario.icon}`} />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{scenario.label}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2">{scenario.description}</p>
          </button>
        ))}
      </div>

      {/* Shock amount slider */}
      <div className="card-psb p-5">
        <div className="flex items-center justify-between mb-3">
          <label htmlFor="shock-amount" className="text-sm font-bold text-slate-800 dark:text-white">
            Shock Amount
          </label>
          <span className="text-lg font-black text-primary">₹{amount.toLocaleString('en-IN')}</span>
        </div>
        <input
          id="shock-amount"
          type="range"
          min={selected.step}
          max={selected.maxAmount}
          step={selected.step}
          value={amount}
          onChange={(e) => { setAmount(Number(e.target.value)); setSimulated(false); }}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-2">
          <span>₹{selected.step.toLocaleString('en-IN')}</span>
          <span>₹{selected.maxAmount.toLocaleString('en-IN')}</span>
        </div>

        <button
          onClick={() => setSimulated(true)}
          className="mt-5 w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
        >
          <i className="fas fa-wand-magic-sparkles" />
          Simulate Impact
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {simulated && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            {/* AI Twin recommendation */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 border border-amber-200 dark:border-slate-700">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white shrink-0">
                  <i className="fas fa-robot" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Wealth Twin Analysis</p>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                    {recommendation.isCovered ? 'You can absorb this shock' : 'Action needed to cover this shock'}
                  </h4>
                </div>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-4">
                {recommendation.isCovered ? (
                  <>
                    Don&apos;t panic. Your emergency fund + liquid savings cover this ₹{amount.toLocaleString('en-IN')} {selected.label.toLowerCase()}.
                    {' '}
                    {recommendation.monthsCovered > 0 && (
                      <span className="font-semibold text-primary">Your emergency buffer supports {recommendation.monthsCovered} month{recommendation.monthsCovered > 1 ? 's' : ''} of expenses.</span>
                    )}
                  </>
                ) : (
                  <>
                    This ₹{amount.toLocaleString('en-IN')} shock exceeds your liquid buffers by{' '}
                    <span className="font-semibold text-rose-600 dark:text-rose-300">₹{recommendation.shortfall.toLocaleString('en-IN')}</span>.
                    {' '}Consider a top-up loan against FD or insurance claim rather than high-interest personal loans.
                  </>
                )}
              </p>

              <div className="space-y-2">
                {recommendation.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/70 dark:bg-slate-900/40 rounded-xl border border-amber-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{idx + 1}</div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{step.source}</p>
                        {step.note && <p className="text-[10px] text-slate-500 dark:text-slate-400">{step.note}</p>}
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">₹{step.amount.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Side stats */}
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">Total Liquid Buffer</p>
                <p className="text-xl font-black text-slate-800 dark:text-white">₹{(buckets.liquidTotal + buckets.emergencyFundValue).toLocaleString('en-IN')}</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">Digital Gold</p>
                <p className="text-xl font-black text-amber-600 dark:text-amber-300">₹{buckets.digitalGoldTotal.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">No penalty liquidation</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">Fixed Deposits</p>
                <p className="text-xl font-black text-emerald-600">₹{buckets.fdTotal.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Break only if needed</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

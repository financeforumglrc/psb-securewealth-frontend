import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, TrendingUp, Target, Landmark, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { useWealthStore } from '../../store/wealthStore';
import AAFetchAnimation from '../aa/AAFetchAnimation';

interface Props {
  onComplete: () => void;
}

type Step = 'welcome' | 'risk' | 'goals' | 'aa' | 'twin';

const RISK_OPTIONS: Array<{
  key: 'Conservative' | 'Moderate' | 'Aggressive';
  title: string;
  desc: string;
  allocation: { equity: number; debt: number; gold: number };
}> = [
  {
    key: 'Conservative',
    title: 'Conservative',
    desc: 'Capital preservation first. Prefer FDs, debt funds, and gold.',
    allocation: { equity: 20, debt: 60, gold: 20 },
  },
  {
    key: 'Moderate',
    title: 'Moderate',
    desc: 'Balanced growth with safety. Mix of equity, debt, and gold.',
    allocation: { equity: 50, debt: 35, gold: 15 },
  },
  {
    key: 'Aggressive',
    title: 'Aggressive',
    desc: 'Maximize long-term growth. Higher equity and alternatives.',
    allocation: { equity: 75, debt: 15, gold: 10 },
  },
];

export default function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('welcome');
  const [riskProfile, setRiskProfile] = useState<'Conservative' | 'Moderate' | 'Aggressive' | ''>('');
  const [goal, setGoal] = useState({ name: '', target: '', deadline: '' });
  const [linkedBanks, setLinkedBanks] = useState<string[]>(['SBI', 'HDFC Bank']);
  const updateUser = useWealthStore((s) => s.updateUser);
  const addGoal = useWealthStore((s) => s.addGoal);

  const handleRiskSelect = (key: 'Conservative' | 'Moderate' | 'Aggressive') => {
    setRiskProfile(key);
    updateUser({ riskProfile: key });
    setStep('goals');
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.name && goal.target) {
      addGoal({
        id: 'og-' + Date.now(),
        name: goal.name,
        type: 'other',
        targetAmount: Number(goal.target),
        currentAmount: 0,
        deadline: goal.deadline || new Date().toISOString().split('T')[0],
      });
    }
    setStep('aa');
  };

  const toggleBank = (bank: string) => {
    setLinkedBanks((prev) =>
      prev.includes(bank) ? prev.filter((b) => b !== bank) : [...prev, bank]
    );
  };

  const banks = ['State Bank of India (SBI)', 'HDFC Bank', 'Zerodha', 'LIC of India'];

  if (step === 'twin') {
    return <AAFetchAnimation onComplete={onComplete} />;
  }

  return (
    <div className="min-h-screen bg-psb-bg dark:bg-[#0b1120] flex flex-col items-center justify-center p-6 text-psb-text dark:text-slate-100">
      {/* Progress */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: step === 'welcome' ? '25%' : step === 'risk' ? '50%' : step === 'goals' ? '75%' : '100%' }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-primary to-primary-dark shadow-2xl shadow-primary/30 flex items-center justify-center mx-auto mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-secondary/30 border-t-secondary"
                />
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Welcome to <span className="text-primary">SecureWealth Twin</span>
              </h1>
              <p className="text-base text-psb-muted dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                Your AI-powered financial twin that grows your wealth and protects every critical action with built-in cyber-security.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {[
                  { icon: TrendingUp, label: 'Smart Investing', color: 'text-emerald-500' },
                  { icon: Shield, label: 'Fraud Protection', color: 'text-rose-500' },
                  { icon: Target, label: 'Goal Planning', color: 'text-violet-500' },
                ].map((item) => (
                  <div key={item.label} className="bg-white dark:bg-slate-900/80 border border-psb-border dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center gap-2">
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep('risk')}
                className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                Build My Twin <ChevronRight className="w-5 h-5" />
              </button>
              <p className="text-[10px] text-slate-400 mt-4">
                Demo only. Not financial advice. Read disclaimers before investing.
              </p>
            </motion.div>
          )}

          {step === 'risk' && (
            <motion.div
              key="risk"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >
              <h2 className="text-2xl font-bold text-center mb-2">What is your risk appetite?</h2>
              <p className="text-sm text-psb-muted dark:text-slate-400 text-center mb-8">
                This helps us personalize your portfolio mix and recommendations.
              </p>
              <div className="space-y-4">
                {RISK_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleRiskSelect(option.key)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                      riskProfile === option.key
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-psb-border dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">{option.title}</span>
                      {riskProfile === option.key && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                    <p className="text-xs text-psb-muted dark:text-slate-400 mb-3">{option.desc}</p>
                    <div className="flex items-center gap-2 text-[10px] font-semibold">
                      <span className="px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">Equity {option.allocation.equity}%</span>
                      <span className="px-2 py-1 rounded-md bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300">Debt {option.allocation.debt}%</span>
                      <span className="px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">Gold {option.allocation.gold}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >
              <h2 className="text-2xl font-bold text-center mb-2">Set your first goal</h2>
              <p className="text-sm text-psb-muted dark:text-slate-400 text-center mb-8">
                SecureWealth Twin will track progress and suggest SIPs to reach it faster.
              </p>
              <form onSubmit={handleGoalSubmit} className="bg-white dark:bg-slate-900/80 border border-psb-border dark:border-slate-700 rounded-2xl p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Goal name</label>
                  <input
                    type="text"
                    value={goal.name}
                    onChange={(e) => setGoal((g) => ({ ...g, name: e.target.value }))}
                    placeholder="e.g. Europe Vacation"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Target amount (₹)</label>
                  <input
                    type="number"
                    value={goal.target}
                    onChange={(e) => setGoal((g) => ({ ...g, target: e.target.value }))}
                    placeholder="500000"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Target date</label>
                  <input
                    type="date"
                    value={goal.deadline}
                    onChange={(e) => setGoal((g) => ({ ...g, deadline: e.target.value }))}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('aa')}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-psb-border dark:border-slate-600 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90"
                  >
                    Save Goal
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'aa' && (
            <motion.div
              key="aa"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >
              <h2 className="text-2xl font-bold text-center mb-2">Link your accounts</h2>
              <p className="text-sm text-psb-muted dark:text-slate-400 text-center mb-8">
                Account Aggregator lets us build a unified net-worth view across banks and investments.
              </p>
              <div className="space-y-3 mb-8">
                {banks.map((bank) => (
                  <button
                    key={bank}
                    onClick={() => toggleBank(bank)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      linkedBanks.includes(bank)
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-psb-border dark:border-slate-700 bg-white dark:bg-slate-900/60'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${linkedBanks.includes(bank) ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{bank}</p>
                      <p className="text-[10px] text-psb-muted dark:text-slate-400">
                        {linkedBanks.includes(bank) ? 'Will be linked' : 'Tap to link'}
                      </p>
                    </div>
                    {linkedBanks.includes(bank) && <CheckCircle2 className="w-5 h-5 text-primary" />}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep('twin')}
                className="w-full px-6 py-3 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary/90 transition-colors"
              >
                Build My Financial Twin
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, TrendingUp, Target, Landmark, CheckCircle2, ChevronRight,
  Sparkles, ArrowLeft, Wallet, Building2, ShieldCheck, BadgeCheck
} from 'lucide-react';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useTranslation } from '@/shared/hooks/useTranslation';
import AAFetchAnimation from '@/features/aa/components/AAFetchAnimation';

interface Props {
  onComplete: () => void;
}

type Step = 'welcome' | 'risk' | 'goals' | 'aa' | 'twin';
type RiskKey = 'Conservative' | 'Moderate' | 'Aggressive';

interface BankOption {
  id: string;
  name: string;
  short: string;
  icon: React.ElementType;
}

const RISK_OPTIONS: Array<{
  key: RiskKey;
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

const BANKS: BankOption[] = [
  { id: 'sbi', name: 'State Bank of India', short: 'SBI', icon: Landmark },
  { id: 'hdfc', name: 'HDFC Bank', short: 'HDFC', icon: Building2 },
  { id: 'zerodha', name: 'Zerodha', short: 'Zerodha', icon: TrendingUp },
  { id: 'lic', name: 'LIC of India', short: 'LIC', icon: Shield },
];

const STEP_ORDER: Step[] = ['welcome', 'risk', 'goals', 'aa', 'twin'];
const STEP_LABELS: Record<Step, string> = {
  welcome: 'Welcome',
  risk: 'Risk',
  goals: 'Goals',
  aa: 'Accounts',
  twin: 'Twin',
};

export default function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('welcome');
  const [direction, setDirection] = useState(1);
  const [riskProfile, setRiskProfile] = useState<RiskKey | ''>('');
  const [goal, setGoal] = useState({ name: '', target: '', deadline: '' });
  const [goalError, setGoalError] = useState<string | null>(null);
  const [linkedBanks, setLinkedBanks] = useState<string[]>(['sbi', 'hdfc']);
  const [linkingAll, setLinkingAll] = useState(false);
  const updateUser = useWealthStore((s) => s.updateUser);
  const addGoal = useWealthStore((s) => s.addGoal);
  const { t, language, setLanguage } = useTranslation();
  const isHindi = language === 'hi';

  const stepIndex = STEP_ORDER.indexOf(step);
  const progress = ((stepIndex + 1) / STEP_ORDER.length) * 100;

  const goTo = (next: Step, dir: number) => {
    setDirection(dir);
    setStep(next);
  };

  const nextStep = () => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx < STEP_ORDER.length - 1) goTo(STEP_ORDER[idx + 1], 1);
  };

  const prevStep = () => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) goTo(STEP_ORDER[idx - 1], -1);
  };

  const handleRiskSelect = (key: RiskKey) => {
    setRiskProfile(key);
    updateUser({ riskProfile: key });
    nextStep();
  };

  const validateGoal = (): boolean => {
    if (!goal.name.trim()) {
      setGoalError(isHindi ? 'कृपया एक लक्ष्य नाम दर्ज करें' : 'Please enter a goal name');
      return false;
    }
    const target = Number(goal.target);
    if (!goal.target || isNaN(target) || target <= 0) {
      setGoalError(isHindi ? 'कृपया एक मान्य लक्ष्य राशि दर्ज करें' : 'Please enter a valid target amount');
      return false;
    }
    if (goal.deadline && new Date(goal.deadline) <= new Date()) {
      setGoalError(isHindi ? 'लक्ष्य तिथि आज के बाद की होनी चाहिए' : 'Goal date must be in the future');
      return false;
    }
    setGoalError(null);
    return true;
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateGoal()) return;
    addGoal({
      id: 'og-' + Date.now(),
      name: goal.name,
      type: 'other',
      targetAmount: Number(goal.target),
      currentAmount: 0,
      deadline: goal.deadline || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    nextStep();
  };

  const toggleBank = (bankId: string) => {
    setLinkedBanks((prev) =>
      prev.includes(bankId) ? prev.filter((b) => b !== bankId) : [...prev, bankId]
    );
  };

  const buildTwin = () => {
    setLinkingAll(true);
    setTimeout(() => {
      setLinkingAll(false);
      goTo('twin', 1);
    }, 600);
  };

  if (step === 'twin') {
    return <AAFetchAnimation onComplete={onComplete} />;
  }

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
  };

  return (
    <div className="min-h-screen bg-psb-bg dark:bg-[#0b1120] flex flex-col items-center justify-center p-6 text-psb-text dark:text-slate-100">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Stepper */}
      <div className="fixed top-6 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-1 sm:gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-psb-border dark:border-slate-700 rounded-2xl px-4 py-2 shadow-sm">
          {STEP_ORDER.map((s, idx) => {
            const active = s === step;
            const completed = idx < stepIndex;
            return (
              <div key={s} className="flex items-center gap-1 sm:gap-2">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${
                  active ? 'bg-primary text-white' : completed ? 'text-primary' : 'text-slate-400'
                }`}>
                  {completed ? <BadgeCheck className="w-3.5 h-3.5" /> : <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px]">{idx + 1}</span>}
                  <span className="hidden sm:inline">{STEP_LABELS[s]}</span>
                </div>
                {idx < STEP_ORDER.length - 1 && (
                  <div className={`w-4 sm:w-6 h-0.5 rounded-full ${completed ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-xl mt-16">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
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
              <div className="flex justify-center mb-6">
                <div className="flex items-center bg-white/50 dark:bg-slate-900/50 border border-psb-border dark:border-slate-700 rounded-xl p-1">
                  <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-xs font-bold rounded-lg ${language === 'en' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300'}`}>EN</button>
                  <button onClick={() => setLanguage('hi')} className={`px-3 py-1 text-xs font-bold rounded-lg ${language === 'hi' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300'}`}>हिं</button>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
                {isHindi ? <>स्वागत है <span className="text-primary">सिक्योरवेल्थ ट्विन</span> में</> : <>Welcome to <span className="text-primary">SecureWealth Twin</span></>}
              </h1>
              <p className="text-base text-psb-muted dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                {isHindi
                  ? 'आपका AI-संचालित वित्तीय जुड़वां जो आपकी संपत्ति बढ़ाता है और हर महत्वपूर्ण कार्रवाई को इनबिल्ट साइबर-सुरक्षा से सुरक्षित रखता है।'
                  : 'Your AI-powered financial twin that grows your wealth and protects every critical action with built-in cyber-security.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {[
                  { icon: TrendingUp, label: isHindi ? 'स्मार्ट निवेश' : 'Smart Investing', color: 'text-emerald-500' },
                  { icon: Shield, label: isHindi ? 'धोखाधड़ी सुरक्षा' : 'Fraud Protection', color: 'text-rose-500' },
                  { icon: Target, label: isHindi ? 'लक्ष्य योजना' : 'Goal Planning', color: 'text-violet-500' },
                ].map((item) => (
                  <div key={item.label} className="bg-white dark:bg-slate-900/80 border border-psb-border dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center gap-2">
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                {t('buildMyTwin')} <ChevronRight className="w-5 h-5" />
              </button>
              <p className="text-[10px] text-slate-400 mt-4">
                {t('demoDisclaimer')}
              </p>
            </motion.div>
          )}

          {step === 'risk' && (
            <motion.div
              key="risk"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-center mb-6">
                <button onClick={prevStep} className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="flex-1 text-2xl font-bold text-center">{t('riskAppetite')}</h2>
                <div className="w-9" />
              </div>
              <p className="text-sm text-psb-muted dark:text-slate-400 text-center mb-8">
                {isHindi ? 'यह हमें आपके पोर्टफोलियो मिक्स और सिफारिशों को व्यक्तिगत बनाने में मदद करता है।' : 'This helps us personalize your portfolio mix and recommendations.'}
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
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-center mb-6">
                <button onClick={prevStep} className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="flex-1 text-2xl font-bold text-center">Set your first goal</h2>
                <div className="w-9" />
              </div>
              <p className="text-sm text-psb-muted dark:text-slate-400 text-center mb-8">
                SecureWealth Twin will track progress and suggest SIPs to reach it faster.
              </p>
              <form onSubmit={handleGoalSubmit} className="bg-white dark:bg-slate-900/80 border border-psb-border dark:border-slate-700 rounded-2xl p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Goal name</label>
                  <input
                    type="text"
                    value={goal.name}
                    onChange={(e) => { setGoal((g) => ({ ...g, name: e.target.value })); setGoalError(null); }}
                    placeholder="e.g. Europe Vacation"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Target amount (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={goal.target}
                    onChange={(e) => { setGoal((g) => ({ ...g, target: e.target.value })); setGoalError(null); }}
                    placeholder="500000"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Target date</label>
                  <input
                    type="date"
                    value={goal.deadline}
                    onChange={(e) => { setGoal((g) => ({ ...g, deadline: e.target.value })); setGoalError(null); }}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {goalError && (
                  <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 dark:bg-rose-900/20 rounded-xl px-3 py-2">
                    <Shield className="w-4 h-4" />
                    {goalError}
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={nextStep}
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
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-center mb-6">
                <button onClick={prevStep} className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="flex-1 text-2xl font-bold text-center">Link your accounts</h2>
                <div className="w-9" />
              </div>
              <p className="text-sm text-psb-muted dark:text-slate-400 text-center mb-6">
                Account Aggregator gives us a unified, consent-based view of your net worth across banks & investments.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {BANKS.map((bank) => {
                  const linked = linkedBanks.includes(bank.id);
                  const Icon = bank.icon;
                  return (
                    <button
                      key={bank.id}
                      onClick={() => toggleBank(bank.id)}
                      className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                        linked
                          ? 'border-primary bg-primary/5 dark:bg-primary/10'
                          : 'border-psb-border dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${linked ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{bank.name}</p>
                        <p className="text-[10px] text-psb-muted dark:text-slate-400">
                          {linked ? 'Will be linked via AA' : 'Tap to link'}
                        </p>
                      </div>
                      {linked && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <ShieldCheck className="w-5 h-5 text-primary" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">{linkedBanks.length} account{linkedBanks.length === 1 ? '' : 's'} selected</p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300/80">You can add more accounts anytime from Profile → Account Aggregator.</p>
                </div>
              </div>

              <button
                onClick={buildTwin}
                disabled={linkingAll}
                className="w-full px-6 py-3 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {linkingAll ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                Build My Financial Twin
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

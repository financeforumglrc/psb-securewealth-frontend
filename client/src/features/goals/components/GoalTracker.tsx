import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import { formatCurrency } from '@/shared/utils/demoMode';
import AddGoalModal from '@/features/goals/components/AddGoalModal';
import GoalConflictModal from '@/features/goals/components/GoalConflictModal';
import GoalConflictIntelligence from '@/features/goals/components/GoalConflictIntelligence';
import CosmosCard, { CosmosBadge, CosmosEmptyState } from '@/shared/components/ui/CosmosCard';
import RegulatoryDisclaimer from '@/shared/components/ui/RegulatoryDisclaimer';
import type { Goal } from '@/shared/types';

const GOAL_ICONS: Record<Goal['type'], string> = {
  home: 'fa-house',
  education: 'fa-graduation-cap',
  retirement: 'fa-umbrella-beach',
  emergency: 'fa-kit-medical',
  car: 'fa-car',
  travel: 'fa-plane',
  wedding: 'fa-heart',
  other: 'fa-bullseye',
};

const GOAL_COLORS: Record<Goal['type'], string> = {
  home: '#0f766e',
  education: '#1565C0',
  retirement: '#6A1B9A',
  emergency: '#B71C1C',
  car: '#E65100',
  travel: '#00695C',
  wedding: '#C2185B',
  other: '#607D8B',
};

const DEPENDENCY_ORDER: Goal['type'][] = ['emergency', 'home', 'education', 'car', 'wedding', 'travel', 'retirement', 'other'];

interface Props {
  asWidget?: boolean;
}

export default function GoalTracker({ asWidget = false }: Props) {
  const goals = useWealthStore((s) => s.goals);
  const assets = useWealthStore((s) => s.assets);
  const user = useWealthStore((s) => s.user);
  const addGoal = useWealthStore((s) => s.addGoal);
  const editGoal = useWealthStore((s) => s.editGoal);
  const deleteGoal = useWealthStore((s) => s.deleteGoal);
  const monthlySavings = user.monthlySavings;
  const currentNW = useMemo(() => assets.reduce((sum, a) => sum + a.value, 0), [assets]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictGoal, setConflictGoal] = useState<Goal | null>(null);
  const [conflictTotal, setConflictTotal] = useState(0);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editName, setEditName] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editCurrent, setEditCurrent] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  function handleSaveGoal(goal: Goal) { addGoal(goal); }

  function handleConflict(newGoal: Goal, totalMonthlyNeed: number) {
    setConflictGoal(newGoal);
    setConflictTotal(totalMonthlyNeed);
    setShowConflictModal(true);
  }

  function handleResolve(resolvedGoals: Goal[]) {
    resolvedGoals.forEach((g) => {
      const exists = goals.find((existing) => existing.id === g.id);
      if (exists) { editGoal(g.id, { deadline: g.deadline, targetAmount: g.targetAmount }); }
      else { addGoal(g); }
    });
    setShowConflictModal(false);
    setShowAddModal(false);
  }

  function applyStrategy(strategy: 'extend' | 'reduce' | 'increase') {
    if (strategy === 'extend') {
      goals.forEach((g) => { const d = new Date(g.deadline); d.setMonth(d.getMonth() + 12); editGoal(g.id, { deadline: d.toISOString().split('T')[0] }); });
    } else if (strategy === 'reduce') {
      goals.forEach((g) => { editGoal(g.id, { targetAmount: Math.round(g.targetAmount * 0.7) }); });
    }
  }

  function startEdit(goal: Goal) {
    setEditingGoal(goal);
    setEditName(goal.name);
    setEditTarget(goal.targetAmount.toString());
    setEditCurrent(goal.currentAmount.toString());
    setEditDeadline(goal.deadline);
  }

  function saveEdit() {
    if (!editingGoal) return;
    editGoal(editingGoal.id, { name: editName, targetAmount: parseInt(editTarget) || 0, currentAmount: parseInt(editCurrent) || 0, deadline: editDeadline });
    setEditingGoal(null);
  }

  async function handleShareGoal(goal: Goal) {
    const remaining = goal.targetAmount - goal.currentAmount;
    const text = `I am saving ₹${goal.targetAmount.toLocaleString()} for ${goal.name} using SecureWealth Twin! ₹${remaining.toLocaleString()} to go.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Financial Goal',
          text,
          url: 'https://psb-securewealth-2026.surge.sh'
        });
      } catch {
        // User cancelled or share failed silently
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setShareFeedback('Copied to clipboard!');
        setTimeout(() => setShareFeedback(null), 2500);
      } catch {
        setShareFeedback('Unable to share');
        setTimeout(() => setShareFeedback(null), 2500);
      }
    } else {
      setShareFeedback('Sharing not supported');
      setTimeout(() => setShareFeedback(null), 2500);
    }
  }

  const totalMonthlyNeed = goals.reduce((sum, g) => {
    const months = Math.max(1, Math.ceil((new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
    return sum + Math.ceil((g.targetAmount - g.currentAmount) / months);
  }, 0);

  const isOverBudget = totalMonthlyNeed > monthlySavings;

  const healthScore = useMemo(() => {
    if (goals.length === 0) return 0;
    const ratio = totalMonthlyNeed / monthlySavings;
    const feasibility = ratio <= 1 ? 100 : Math.max(10, Math.round(100 - (ratio - 1) * 40));
    const coverage = Math.min(goals.filter((g) => g.currentAmount > 0).length / goals.length, 1);
    return Math.round(feasibility * 0.7 + coverage * 30);
  }, [goals, totalMonthlyNeed, monthlySavings]);

  const healthColor = healthScore >= 80 ? 'text-emerald-600' : healthScore >= 50 ? 'text-amber-600' : 'text-rose-600';
  const healthRing = healthScore >= 80 ? '#10b981' : healthScore >= 50 ? '#f59e0b' : '#ef4444';

  const dependencyWarnings = useMemo(() => {
    const warnings: string[] = [];
    const sorted = [...goals].sort((a, b) => DEPENDENCY_ORDER.indexOf(a.type) - DEPENDENCY_ORDER.indexOf(b.type));
    for (let i = 0; i < sorted.length; i++) {
      const goal = sorted[i];
      const pct = goal.currentAmount / goal.targetAmount;
      for (let j = 0; j < i; j++) {
        const higher = sorted[j];
        const higherPct = higher.currentAmount / higher.targetAmount;
        if (higherPct < 0.8 && pct > 0.3) { warnings.push(`Complete ${higher.name} before ${goal.name}`); }
      }
    }
    return [...new Set(warnings)].slice(0, 3);
  }, [goals]);

  if (asWidget) {
    return (
      <CosmosCard variant="default" header={{ icon: 'fa-bullseye', iconColor: '#0f766e', title: 'Financial Goals', action: <button onClick={() => setShowAddModal(true)} className="text-xs px-2 py-1 bg-primary text-white rounded-lg font-bold"><i className="fas fa-plus" /></button> }}>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {goals.map((goal) => {
            const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const color = GOAL_COLORS[goal.type];
            return (
              <div key={goal.id} className="flex items-center gap-3">
                <svg className="w-10 h-10 -rotate-90 flex-shrink-0">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="3" />
                  <circle cx="20" cy="20" r="16" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${pct * 1.005} 100`} strokeLinecap="round" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{goal.name}</p>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 mt-1 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500">{pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </CosmosCard>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <RegulatoryDisclaimer compact />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Financial Goals</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{goals.length} active • Need ₹{totalMonthlyNeed.toLocaleString()}/mo</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2">
          <i className="fas fa-plus" /> Add New Goal
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Goals', value: goals.length, icon: 'fa-bullseye', color: 'text-primary' },
          { label: 'Health Score', value: healthScore, icon: 'fa-heart-pulse', color: healthColor },
          { label: 'Monthly Need', value: `₹${totalMonthlyNeed.toLocaleString()}`, icon: 'fa-wallet', color: 'text-amber-600' },
          { label: 'Savings', value: `₹${monthlySavings.toLocaleString()}`, icon: 'fa-piggy-bank', color: isOverBudget ? 'text-rose-500' : 'text-emerald-500' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <CosmosCard variant="stat" padding="md">
              <div className="flex items-center gap-2 mb-2">
                <i className={`fas ${s.icon} ${s.color} text-xs`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</span>
              </div>
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            </CosmosCard>
          </motion.div>
        ))}
      </div>

      {/* Generational Wealth Time-Travel */}
      <GenerationalWealthSlider currentNW={currentNW} monthlySavings={monthlySavings} />

      {/* Health Ring */}
      {goals.length > 0 && (
        <CosmosCard variant="gradient">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-20 h-20 -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="6" />
                <motion.circle cx="40" cy="40" r="34" fill="none" stroke={healthRing} strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${healthScore * 2.14} 214`} initial={{ strokeDasharray: '0 214' }} animate={{ strokeDasharray: `${healthScore * 2.14} 214` }} transition={{ duration: 1.2, ease: 'easeOut' }} />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${healthColor}`}>{healthScore}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-white">Goal Health Score</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {healthScore >= 80 ? 'Your goals are well within reach' : healthScore >= 50 ? 'Some adjustments recommended' : 'Immediate action required'}
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: healthRing }} initial={{ width: 0 }} animate={{ width: `${healthScore}%` }} transition={{ duration: 1 }} />
              </div>
            </div>
          </div>
        </CosmosCard>
      )}

      {/* Conflict & Warnings */}
      {isOverBudget && goals.length > 0 && (
        <GoalConflictIntelligence totalMonthlyNeed={totalMonthlyNeed} monthlySavings={monthlySavings} onApplyStrategy={applyStrategy} />
      )}
      {dependencyWarnings.length > 0 && (
        <CosmosCard variant="default" header={{ icon: 'fa-lightbulb', iconColor: '#f59e0b', title: 'Goal Sequence Recommendations' }}>
          <div className="space-y-1.5">
            {dependencyWarnings.map((w, i) => (
              <p key={i} className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <i className="fas fa-arrow-right text-[10px]" /> {w}
              </p>
            ))}
          </div>
        </CosmosCard>
      )}

      {/* Goals Grid with Circular Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {goals.map((goal) => {
            const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const months = Math.max(1, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
            const monthlyNeed = Math.ceil((goal.targetAmount - goal.currentAmount) / months);
            const isEditing = editingGoal?.id === goal.id;
            const color = GOAL_COLORS[goal.type];
            const isComplete = pct >= 100;

            return (
              <motion.div key={goal.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <CosmosCard variant={isComplete ? 'gradient' : 'default'} glow={isComplete} glowColor={color}>
                  {/* Celebration overlay for complete goals */}
                  {isComplete && (
                    <div className="absolute top-2 right-2">
                      <motion.div animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <i className="fas fa-trophy text-amber-500 text-lg" />
                      </motion.div>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleShareGoal(goal)} className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors" title="Share Goal">
                        <i className="fas fa-share-nodes text-[10px]" />
                      </button>
                      <button onClick={() => startEdit(goal)} className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors" title="Edit">
                        <i className="fas fa-pen text-[10px]" />
                      </button>
                      <button onClick={() => { if (confirm(`Delete "${goal.name}"?`)) deleteGoal(goal.id); }} className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-colors" title="Delete">
                        <i className="fas fa-trash text-[10px]" />
                      </button>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="space-y-3">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium dark:text-white" />
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-[10px] text-slate-400">Target (₹)</label><input type="number" value={editTarget} onChange={(e) => setEditTarget(e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white" /></div>
                        <div><label className="text-[10px] text-slate-400">Current (₹)</label><input type="number" value={editCurrent} onChange={(e) => setEditCurrent(e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white" /></div>
                      </div>
                      <div><label className="text-[10px] text-slate-400">Deadline</label><input type="date" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white" /></div>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="flex-1 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90"><i className="fas fa-check mr-1" /> Save</button>
                        <button onClick={() => setEditingGoal(null)} className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative w-14 h-14 flex-shrink-0">
                          <svg className="w-14 h-14 -rotate-90">
                            <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="4" />
                            <motion.circle cx="28" cy="28" r="24" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
                              strokeDasharray={`${pct * 1.51} 151`} initial={{ strokeDasharray: '0 151' }} animate={{ strokeDasharray: `${pct * 1.51} 151` }} transition={{ duration: 1, delay: 0.2 }} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <i className={`fas ${GOAL_ICONS[goal.type]} text-sm`} style={{ color }} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-800 dark:text-white pr-8">{goal.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 capitalize">{goal.type}</span>
                            {isComplete && <CosmosBadge color="success" size="xs"><i className="fas fa-check mr-1" />Done</CosmosBadge>}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400">Progress</span>
                          <span className="font-bold" style={{ color }}>{pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                          <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400">{formatCurrency(goal.currentAmount)}</span>
                          <span className="text-slate-400">of {formatCurrency(goal.targetAmount)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-700">
                          <span className="text-slate-500 dark:text-slate-400"><i className="far fa-clock mr-1" />{months} mo</span>
                          <span className="font-medium" style={{ color }}>₹{monthlyNeed.toLocaleString()}/mo</span>
                        </div>
                      </div>
                    </>
                  )}
                </CosmosCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {goals.length === 0 && (
        <CosmosEmptyState
          icon="fa-bullseye"
          title="No goals yet"
          subtitle="Add your first financial goal to start tracking progress."
          action={<button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"><i className="fas fa-plus mr-1" /> Add Goal</button>}
        />
      )}

      {/* Share Feedback Toast */}
      {shareFeedback && (
        <div className="fixed bottom-6 right-6 z-[60] px-5 py-3 rounded-xl shadow-2xl text-white font-medium animate-in slide-in-from-bottom-4 bg-primary">
          <i className="fas fa-share-nodes mr-2" />
          {shareFeedback}
        </div>
      )}

      <AddGoalModal show={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleSaveGoal} existingGoals={goals} monthlySavings={monthlySavings} onConflict={handleConflict} />
      <GoalConflictModal show={showConflictModal} onClose={() => setShowConflictModal(false)} newGoal={conflictGoal} existingGoals={goals} monthlySavings={monthlySavings} totalMonthlyNeed={conflictTotal} onResolve={handleResolve} />
    </div>
  );
}

function GenerationalWealthSlider({ currentNW, monthlySavings }: { currentNW: number; monthlySavings: number }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear + 30);
  const [savedPlan, setSavedPlan] = useState(false);
  const years = year - currentYear;
  const rate = 0.12;

  const futureValue = useMemo(() => {
    const lumpsum = currentNW * Math.pow(1 + rate, years);
    const sip = monthlySavings * 12 * ((Math.pow(1 + rate, years) - 1) / rate);
    return Math.round(lumpsum + sip);
  }, [currentNW, monthlySavings, years]);

  const grandchildEducation = Math.round(futureValue * 0.08);
  const legacyCorpus = Math.round(futureValue * 0.22);

  const tree = useMemo(() => {
    const funded = futureValue > 0;
    const educationFullyFunded = grandchildEducation > 25_00_000;
    const legacyStrong = legacyCorpus > 1_00_00_000;
    return [
      { id: 'you', label: 'You', icon: 'fa-user', funded, amount: currentNW },
      { id: 'child', label: 'Child', icon: 'fa-child', funded: funded && years >= 18, amount: Math.round(futureValue * 0.15) },
      { id: 'grandchild', label: 'Grandchild', icon: 'fa-baby', funded: educationFullyFunded, amount: grandchildEducation },
      { id: 'legacy', label: 'Family Legacy', icon: 'fa-landmark', funded: legacyStrong, amount: legacyCorpus },
    ];
  }, [futureValue, grandchildEducation, legacyCorpus, currentNW, years]);

  return (
    <CosmosCard variant="default" header={{ icon: 'fa-people-roof', iconColor: '#7c3aed', title: 'Generational Time-Travel' }}>
      <div className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Drag the slider to see how today&apos;s SIP becomes tomorrow&apos;s family legacy.
        </p>

        <div>
          <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            <span>{currentYear}</span>
            <span className="text-primary">{year}</span>
            <span>2080</span>
          </div>
          <input
            type="range"
            min={currentYear}
            max={2080}
            step={1}
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="w-full accent-primary h-1.5"
          />
        </div>

        <motion.div
          key={futureValue}
          initial={{ scale: 0.98, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 border border-violet-200 dark:border-slate-700"
        >
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Projected Family Corpus in {year}</p>
          <p className="text-3xl font-black text-violet-700 dark:text-violet-300">₹{(futureValue / 1e7).toFixed(2)} Cr</p>
          <p className="text-xs text-slate-500 mt-1">{years} years from now • 12% assumed CAGR</p>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-violet-100 dark:border-slate-700">
              <p className="text-[10px] text-slate-400">Grandchild Education</p>
              <p className="text-sm font-bold text-violet-700 dark:text-violet-300">₹{(grandchildEducation / 1e7).toFixed(2)} Cr</p>
            </div>
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-violet-100 dark:border-slate-700">
              <p className="text-[10px] text-slate-400">Legacy Inheritance</p>
              <p className="text-sm font-bold text-violet-700 dark:text-violet-300">₹{(legacyCorpus / 1e7).toFixed(2)} Cr</p>
            </div>
          </div>
        </motion.div>

        {/* Family-tree visualization */}
        <div className="rounded-xl border border-violet-100 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Dynasty Funding Map</p>
          <div className="relative h-28">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <path d="M 60 24 C 60 60, 25 60, 25 96" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-200 dark:text-slate-700" />
              <path d="M 60 24 C 60 60, 95 60, 95 96" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-200 dark:text-slate-700" />
              <path d="M 95 96 C 95 120, 130 120, 130 140" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" className="text-violet-200 dark:text-slate-700" />
            </svg>
            <div className="relative flex justify-between items-start">
              {tree.map((node) => (
                <div key={node.id} className="flex flex-col items-center gap-1.5 w-16">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm ${node.funded ? 'bg-violet-100 border-violet-500 dark:bg-violet-900/30 dark:border-violet-400' : 'bg-slate-50 border-slate-300 dark:bg-slate-800 dark:border-slate-600'}`}
                    title={node.funded ? 'Funding goal met' : 'Not yet funded'}
                  >
                    <i className={`fas ${node.icon} ${node.funded ? 'text-violet-600 dark:text-violet-300' : 'text-slate-400'}`} />
                  </motion.div>
                  <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight">{node.label}</span>
                  <span className="text-[9px] text-slate-400 text-center">₹{(node.amount / 1e7).toFixed(2)} Cr</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setSavedPlan(true)}
            disabled={savedPlan}
            className="mt-3 w-full py-1.5 bg-violet-600 hover:bg-violet-700 disabled:bg-emerald-600 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
          >
            <i className={`fas ${savedPlan ? 'fa-check' : 'fa-floppy-disk'}`} />
            {savedPlan ? 'Dynasty plan saved' : 'Save this dynasty plan'}
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
          <i className="fas fa-quote-left text-violet-400" />
          <em>
            If you continue this SIP, by {year} your corpus will be ₹{(futureValue / 1e7).toFixed(2)} Crores. That fully funds your grandchild&apos;s higher education and leaves a ₹{(legacyCorpus / 1e7).toFixed(2)} Crore legacy. You aren&apos;t just saving; you are building a dynasty.
          </em>
        </div>
      </div>
    </CosmosCard>
  );
}

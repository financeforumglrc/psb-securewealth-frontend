import { useState, useMemo } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import type { Subscription } from '@/shared/types';
import { predictZombieSubscriptions } from '@/shared/services/subscriptionPredictor';
import AdminAgent from '@/features/subscriptions/components/AdminAgent';
import CultFitTracker from '@/features/subscriptions/components/CultFitTracker';

const FREQ_LABEL: Record<string, string> = {
  monthly: '/month',
  quarterly: '/3 months',
  yearly: '/year',
};

function monthlyEquivalent(amount: number, frequency: string) {
  if (frequency === 'monthly') return amount;
  if (frequency === 'quarterly') return amount / 3;
  if (frequency === 'yearly') return amount / 12;
  return amount;
}

export default function SubscriptionTracker() {
  const subscriptions = useWealthStore((s) => s.subscriptions);
  const cancelSubscription = useWealthStore((s) => s.cancelSubscription);
  const pauseSubscription = useWealthStore((s) => s.pauseSubscription);

  const [cancelModal, setCancelModal] = useState<Subscription | null>(null);
  const [cancelStep, setCancelStep] = useState(0);
  const [filter, setFilter] = useState<'all' | 'active' | 'unused'>('all');
  const [justCancelled, setJustCancelled] = useState<string | null>(null);
  const [agentSub, setAgentSub] = useState<Subscription | null>(null);

  const activeSubs = subscriptions.filter((s) => s.status !== 'cancelled');
  const unusedSubs = subscriptions.filter((s) => s.status === 'unused');
  const cancelledSubs = subscriptions.filter((s) => s.status === 'cancelled');

  const totalMonthly = activeSubs.reduce((sum, s) => sum + monthlyEquivalent(s.amount, s.frequency), 0);
  const totalYearly = totalMonthly * 12;

  const filtered = subscriptions.filter((s) => {
    if (filter === 'all') return s.status !== 'cancelled';
    if (filter === 'active') return s.status === 'active';
    if (filter === 'unused') return s.status === 'unused';
    return true;
  });

  // Calendar data: group subscriptions by renewal day
  const calendarData = useMemo(() => {
    const days: Record<number, { amount: number; subs: string[] }> = {};
    activeSubs.forEach((sub) => {
      const day = parseInt(sub.nextRenewal.split('-')[2]);
      if (!days[day]) days[day] = { amount: 0, subs: [] };
      days[day].amount += monthlyEquivalent(sub.amount, sub.frequency);
      days[day].subs.push(sub.name);
    });
    // Fill gaps
    const result = [];
    for (let i = 1; i <= 31; i++) {
      result.push({ day: i, amount: days[i]?.amount || 0, subs: days[i]?.subs || [] });
    }
    return result;
  }, [activeSubs]);

  const maxDayAmount = Math.max(...calendarData.map((d) => d.amount), 1);

  const handleCancel = (sub: Subscription) => {
    setCancelModal(sub);
    setCancelStep(0);
  };

  const zombies = useMemo(() => predictZombieSubscriptions(subscriptions), [subscriptions]);

  const proceedCancel = () => {
    if (cancelModal) {
      cancelSubscription(cancelModal.id);
      setJustCancelled(cancelModal.id);
      setTimeout(() => setJustCancelled(null), 3000);
    }
    setCancelModal(null);
  };

  const cancelSteps = [
    { title: 'Open app/website', desc: 'Go to your account settings in the app or website.' },
    { title: 'Find subscription', desc: `Navigate to "Manage Subscription" or "Billing" section.` },
    { title: 'Click Cancel', desc: 'Look for "Cancel Subscription" or "End Membership" button.' },
    { title: 'Confirm', desc: 'Confirm cancellation. You can still use it until the end of billing period.' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 border-2 border-rose-200 dark:border-rose-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white">
              <i className="fas fa-calendar-xmark" />
            </div>
            <div>
              <p className="text-xs text-rose-600 font-medium">Monthly Subscriptions</p>
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">₹{Math.round(totalMonthly).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-rose-500">That's ₹{Math.round(totalYearly).toLocaleString()}/year!</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <i className="fas fa-triangle-exclamation" />
            </div>
            <div>
              <p className="text-xs text-amber-600 font-medium">Unused Subscriptions</p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{unusedSubs.length}</p>
            </div>
          </div>
          <p className="text-xs text-amber-500">
            Wasting ₹{Math.round(unusedSubs.reduce((s, u) => s + monthlyEquivalent(u.amount, u.frequency), 0)).toLocaleString()}/month
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <i className="fas fa-check-circle" />
            </div>
            <div>
              <p className="text-xs text-emerald-600 font-medium">Active Subscriptions</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{activeSubs.filter((s) => s.status === 'active').length}</p>
            </div>
          </div>
          <p className="text-xs text-emerald-500">{activeSubs.filter((s) => s.daysUntilRenewal <= 7).length} renewing this week</p>
        </div>
      </div>

      {/* Cult Fit Tracker */}
      <CultFitTracker />

      {/* Zombie Subscription Predictions */}
      {zombies.length > 0 && (
        <div className="card border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/10 dark:to-fuchsia-900/10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🧟</span>
            <h3 className="font-bold text-violet-800 dark:text-violet-300">Predicted Zombie Subscriptions</h3>
            <span className="text-[10px] px-2 py-0.5 bg-violet-100 text-violet-600 rounded-full font-bold">AI</span>
          </div>
          <div className="space-y-3">
            {zombies.map((z) => (
              <div key={z.subscription.id} className="flex items-start justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-violet-200 dark:border-violet-800">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${z.subscription.color} flex items-center justify-center text-white flex-shrink-0 opacity-80`}>
                    <i className={`fas ${z.subscription.icon}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{z.subscription.name}</p>
                    <p className="text-xs text-violet-600 dark:text-violet-300 font-medium">{z.reason}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Predicted waste: ₹{Math.round(z.predictedWasteAnnual).toLocaleString()}/year · Confidence: {z.confidence}%
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {z.recommendation === 'pause' ? (
                    <button
                      onClick={() => pauseSubscription(z.subscription.id)}
                      className="px-3 py-1.5 bg-violet-500 hover:bg-violet-600 text-white text-[10px] font-bold rounded-lg transition-colors"
                    >
                      Pause 3 Months
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCancel(z.subscription)}
                      className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold rounded-lg transition-colors"
                    >
                      Cancel Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unused Subscriptions Alert */}
      {unusedSubs.length > 0 && (
        <div className="card border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⚠️</span>
            <h3 className="font-bold text-amber-800 dark:text-amber-300">Unused Subscriptions Alert</h3>
          </div>
          <div className="space-y-3">
            {unusedSubs.map((sub) => (
              <div key={sub.id} className="flex items-start justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${sub.color} flex items-center justify-center text-white flex-shrink-0`}>
                    <i className={`fas ${sub.icon}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{sub.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {sub.daysSinceUsed && sub.daysSinceUsed >= 60
                        ? `You haven't used this in ${sub.daysSinceUsed} days. Still paying ₹${sub.amount}${FREQ_LABEL[sub.frequency]}?`
                        : `Last used ${sub.daysSinceUsed} days ago. Consider pausing.`}
                    </p>
                    {sub.daysUntilRenewal <= 3 && (
                      <p className="text-xs text-rose-500 font-bold mt-1">
                        <i className="fas fa-clock mr-1" /> Renews in {sub.daysUntilRenewal} day{sub.daysUntilRenewal !== 1 ? 's' : ''}!
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-white">₹{sub.amount.toLocaleString()}</span>
                  <button
                    onClick={() => handleCancel(sub)}
                    className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <i className="fas fa-ban" /> Cancel Assist
                  </button>
                  <button
                    onClick={() => setAgentSub(sub)}
                    className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <i className="fas fa-robot" /> Agent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        {([
          { key: 'all', label: 'All Active' },
          { key: 'active', label: 'Active' },
          { key: 'unused', label: 'Unused' },
        ] as { key: 'all' | 'active' | 'unused'; label: string }[]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f.key ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
        {cancelledSubs.length > 0 && (
          <span className="text-xs text-slate-400 ml-auto">{cancelledSubs.length} cancelled</span>
        )}
      </div>

      {/* Subscription Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sub) => (
          <div
            key={sub.id}
            className={`card border-2 transition-all duration-300 ${
              justCancelled === sub.id ? 'opacity-50 scale-95 border-rose-300' :
              sub.status === 'unused' ? 'border-amber-200' :
              sub.daysUntilRenewal <= 3 ? 'border-rose-200' :
              'border-slate-100'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${sub.color} flex items-center justify-center text-white text-lg shadow-md`}>
                  <i className={`fas ${sub.icon}`} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{sub.name}</h4>
                  <p className="text-[10px] text-slate-400">{sub.category}</p>
                </div>
              </div>
              {sub.autoDetected && (
                <span className="px-1.5 py-0.5 bg-violet-100 text-violet-600 text-[9px] font-bold rounded-full">
                  🤖 AI
                </span>
              )}
            </div>

            <div className="mb-3">
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                ₹{sub.amount.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-1">{FREQ_LABEL[sub.frequency]}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                ≈ ₹{Math.round(monthlyEquivalent(sub.amount, sub.frequency)).toLocaleString()}/month
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Next renewal</span>
                <span className={`font-medium ${sub.daysUntilRenewal <= 3 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                  {new Date(sub.nextRenewal).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  {sub.daysUntilRenewal <= 3 && ' ⚠️'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                  sub.status === 'unused' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {sub.status === 'active' ? 'Active' : sub.status === 'unused' ? 'Unused' : 'Cancelled'}
                </span>
              </div>
              {sub.daysSinceUsed !== undefined && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Last used</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {sub.daysSinceUsed === 0 ? 'Today' : `${sub.daysSinceUsed} days ago`}
                    {sub.daysSinceUsed > 60 && ' 🤔'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {sub.status !== 'cancelled' && (
                <>
                  <button
                    onClick={() => handleCancel(sub)}
                    className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <i className="fas fa-ban" /> Cancel
                  </button>
                  <button
                    onClick={() => pauseSubscription(sub.id)}
                    className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <i className={`fas ${sub.status === 'active' ? 'fa-pause' : 'fa-play'}`} />
                    {sub.status === 'active' ? 'Pause' : 'Resume'}
                  </button>
                </>
              )}
            </div>

            {sub.daysUntilRenewal <= 3 && sub.status !== 'cancelled' && (
              <div className="mt-3 p-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg text-center">
                <p className="text-[10px] text-rose-600 font-bold">
                  <i className="fas fa-clock mr-1" /> Renews in {sub.daysUntilRenewal} day{sub.daysUntilRenewal !== 1 ? 's' : ''}!
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cancelled subscriptions */}
      {cancelledSubs.length > 0 && (
        <div className="card border-2 border-slate-100 opacity-75">
          <h4 className="text-sm font-bold text-slate-500 mb-3">Cancelled</h4>
          <div className="space-y-2">
            {cancelledSubs.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${sub.color} flex items-center justify-center text-white text-xs opacity-50`}>
                    <i className={`fas ${sub.icon}`} />
                  </div>
                  <p className="text-sm text-slate-500 line-through">{sub.name}</p>
                </div>
                <span className="text-xs text-slate-400">₹{sub.amount.toLocaleString()}{FREQ_LABEL[sub.frequency]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription Calendar */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-calendar-days text-primary" /> Subscription Calendar
          </h3>
          <p className="text-xs text-slate-400">Cash flow impact across the month</p>
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="flex items-end gap-[2px] h-40 min-w-[600px]">
            {calendarData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className={`w-full rounded-t-sm transition-all duration-500 ${
                    d.amount > 0 ? 'bg-gradient-to-t from-primary to-secondary' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                  style={{ height: `${Math.max(4, (d.amount / maxDayAmount) * 100)}%` }}
                />
                <span className={`text-[9px] ${d.amount > 0 ? 'text-primary font-bold' : 'text-slate-400'}`}>{d.day}</span>
                {/* Tooltip */}
                {d.amount > 0 && (
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 bg-slate-800 text-white text-[10px] rounded-lg px-2 py-1.5 whitespace-nowrap shadow-xl">
                    <p className="font-bold">Day {d.day}: ₹{Math.round(d.amount).toLocaleString()}</p>
                    {d.subs.map((s) => (
                      <p key={s} className="text-slate-300">{s}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
          <span>Day 1</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-primary to-secondary inline-block" /> Subscription charge
          </span>
          <span>Day 31</span>
        </div>
      </div>

      {/* Admin Agent Inline */}
      {agentSub && (
        <div className="card border-2 border-primary/20">
          <AdminAgent subscription={agentSub} onComplete={() => setAgentSub(null)} />
        </div>
      )}

      {/* Cancel Assist Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full animate-fade-in overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${cancelModal.color} flex items-center justify-center text-white`}>
                    <i className={`fas ${cancelModal.icon}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Cancel {cancelModal.name}</h3>
                    <p className="text-xs text-slate-400">We'll guide you through it</p>
                  </div>
                </div>
                <button
                  onClick={() => setCancelModal(null)}
                  className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200"
                >
                  <i className="fas fa-xmark text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium text-center">
                  You'll save ₹{Math.round(monthlyEquivalent(cancelModal.amount, cancelModal.frequency) * 12).toLocaleString()}/year
                </p>
              </div>
              <div className="space-y-3">
                {cancelSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                      idx === cancelStep ? 'bg-primary/5 border-2 border-primary/20' :
                      idx < cancelStep ? 'opacity-50' : 'opacity-30'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      idx < cancelStep ? 'bg-emerald-500 text-white' :
                      idx === cancelStep ? 'bg-primary text-white' :
                      'bg-slate-200 text-slate-500'
                    }`}>
                      {idx < cancelStep ? '✓' : idx + 1}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${idx === cancelStep ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                {cancelStep > 0 && (
                  <button
                    onClick={() => setCancelStep((s) => s - 1)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-xl transition-colors"
                  >
                    Back
                  </button>
                )}
                {cancelStep < cancelSteps.length - 1 ? (
                  <button
                    onClick={() => setCancelStep((s) => s + 1)}
                    className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    onClick={proceedCancel}
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-check" /> Done — Cancelled!
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                <i className="fas fa-clock mr-1" /> Takes about 2 minutes
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

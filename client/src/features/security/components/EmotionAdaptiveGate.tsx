import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap, AlertTriangle, CheckCircle2, Shield, TrendingUp } from 'lucide-react';
import { useCoercionDetection } from './CoercionDetectionEngine';

type EmotionalState = 'calm' | 'stressed' | 'excited' | 'impulsive' | 'coerced';

interface EmotionProfile {
  state: EmotionalState;
  confidence: number;
  transactionLimit: number;
  color: string;
  bgColor: string;
  message: string;
}

function getEmotionProfile(signals: { typingAnomaly: number; mouseAnomaly: number; urgencyAnomaly: number; timeAnomaly: number }): EmotionProfile {
  const avgAnomaly = (signals.typingAnomaly + signals.mouseAnomaly + signals.urgencyAnomaly) / 3;
  const timeRisk = signals.timeAnomaly;

  if (avgAnomaly > 0.7 && timeRisk > 0.5) {
    return {
      state: 'coerced',
      confidence: Math.round(avgAnomaly * 100),
      transactionLimit: 0,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
      message: 'Possible coercion detected. All transactions blocked.',
    };
  }
  if (avgAnomaly > 0.5) {
    return {
      state: 'impulsive',
      confidence: Math.round(avgAnomaly * 100),
      transactionLimit: 10000,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
      message: 'Impulsive behavior detected. Transaction limit reduced to ₹10,000.',
    };
  }
  if (avgAnomaly > 0.3) {
    return {
      state: 'stressed',
      confidence: Math.round(avgAnomaly * 100),
      transactionLimit: 50000,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
      message: 'Stressed state detected. Transaction limit reduced to ₹50,000.',
    };
  }
  if (signals.urgencyAnomaly > 0.5) {
    return {
      state: 'excited',
      confidence: Math.round(signals.urgencyAnomaly * 100),
      transactionLimit: 200000,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      message: 'Elevated activity detected. Standard limits apply with monitoring.',
    };
  }
  return {
    state: 'calm',
    confidence: Math.round((1 - avgAnomaly) * 100),
    transactionLimit: 500000,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    message: 'Calm and composed. Full transaction limits available.',
  };
}

export default function EmotionAdaptiveGate() {
  const { signals } = useCoercionDetection();
  const [profile, setProfile] = useState<EmotionProfile | null>(null);
  const [transactions, setTransactions] = useState<{ amount: number; status: 'allowed' | 'blocked' | 'delayed'; time: string }[]>([]);

  useEffect(() => {
    setProfile(getEmotionProfile(signals));
  }, [signals]);

  const simulateTransaction = (amount: number) => {
    if (!profile) return;
    let status: 'allowed' | 'blocked' | 'delayed';
    if (amount <= profile.transactionLimit) status = 'allowed';
    else if (amount <= profile.transactionLimit * 2) status = 'delayed';
    else status = 'blocked';

    setTransactions((prev) => [
      { amount, status, time: new Date().toLocaleTimeString('en-IN') },
      ...prev.slice(0, 4),
    ]);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-600" /> Emotion-Adaptive Transaction Gate
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Transaction limits adapt to your emotional state in real-time.</p>
      </div>

      {/* Emotional State */}
      {profile && (
        <motion.div
          key={profile.state}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-5 rounded-2xl border ${profile.bgColor}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart className={`w-6 h-6 ${profile.color}`} />
              <div>
                <p className="text-sm font-black uppercase tracking-wider">{profile.state}</p>
                <p className="text-[10px] opacity-70">Confidence: {profile.confidence}%</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] opacity-70 uppercase font-bold">Transaction Limit</p>
              <p className="text-xl font-black">
                {profile.transactionLimit === 0 ? 'BLOCKED' : `₹${profile.transactionLimit.toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>
          <p className="text-xs">{profile.message}</p>
        </motion.div>
      )}

      {/* Transaction Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-3">Test Transactions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[10000, 50000, 100000, 500000].map((amount) => (
              <button
                key={amount}
                onClick={() => simulateTransaction(amount)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                ₹{(amount / 1000).toFixed(0)}K
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-3">Recent Outcomes</h3>
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No transactions yet. Test a transaction above.</p>
            ) : (
              transactions.map((tx, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-2 rounded-lg text-xs flex items-center justify-between ${
                    tx.status === 'allowed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' :
                    tx.status === 'delayed' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' :
                    'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  <span>₹{tx.amount.toLocaleString('en-IN')}</span>
                  <span className="font-bold uppercase">{tx.status}</span>
                  <span className="opacity-60">{tx.time}</span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-2">Adaptive Security Model</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px] text-slate-500">
          <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Calm: ₹5L limit</div>
          <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-blue-500" /> Excited: ₹2L limit</div>
          <div className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-500" /> Stressed: ₹50K limit</div>
          <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> Impulsive: ₹10K limit</div>
          <div className="flex items-center gap-1"><Shield className="w-3 h-3 text-rose-500" /> Coerced: Blocked</div>
        </div>
      </div>
    </div>
  );
}

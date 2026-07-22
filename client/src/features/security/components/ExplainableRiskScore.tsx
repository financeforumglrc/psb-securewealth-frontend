import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, HelpCircle, Smartphone, Clock, Zap, CreditCard } from 'lucide-react';

interface RiskFactor {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  maxValue: number;
  weight: number;
  description: string;
  status: 'safe' | 'warning' | 'danger';
}

function getStatus(value: number): 'safe' | 'warning' | 'danger' {
  if (value >= 0.7) return 'danger';
  if (value >= 0.4) return 'warning';
  return 'safe';
}

function statusColor(status: string) {
  if (status === 'danger') return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800';
  if (status === 'warning') return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
  return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
}

export default function ExplainableRiskScore() {
  const [factors, setFactors] = useState<RiskFactor[]>([
    {
      id: 'device',
      name: 'Trusted Device',
      icon: Smartphone,
      value: 0.2,
      maxValue: 1,
      weight: 0.2,
      description: 'This device is registered and has been used for 45 days. No anomalies detected.',
      status: 'safe',
    },
    {
      id: 'amount',
      name: 'Amount vs History',
      icon: CreditCard,
      value: 0.6,
      maxValue: 1,
      weight: 0.25,
      description: 'Transaction amount ₹2,50,000 is 5x your average monthly spend (₹50,000). High deviation.',
      status: 'warning',
    },
    {
      id: 'time',
      name: 'Time of Day',
      icon: Clock,
      value: 0.8,
      maxValue: 1,
      weight: 0.15,
      description: 'Transaction initiated at 2:30 AM. Your usual active hours are 8 AM - 10 PM.',
      status: 'danger',
    },
    {
      id: 'urgency',
      name: 'Action Urgency',
      icon: Zap,
      value: 0.7,
      maxValue: 1,
      weight: 0.2,
      description: 'You completed this transaction in 8 seconds. Your average decision time is 45 seconds.',
      status: 'danger',
    },
    {
      id: 'otp',
      name: 'OTP Pattern',
      icon: Shield,
      value: 0.1,
      maxValue: 1,
      weight: 0.1,
      description: 'OTP entered correctly on first attempt. No retries or delays.',
      status: 'safe',
    },
    {
      id: 'location',
      name: 'Location',
      icon: TrendingUp,
      value: 0.3,
      maxValue: 1,
      weight: 0.1,
      description: 'Transaction from Mumbai, your usual location. No geo-anomaly.',
      status: 'safe',
    },
  ]);

  const totalScore = Math.round(factors.reduce((sum, f) => sum + f.value * f.weight, 0) * 100);
  const riskLevel = totalScore >= 70 ? 'HIGH' : totalScore >= 40 ? 'MEDIUM' : 'LOW';
  const action = totalScore >= 70 ? 'BLOCK' : totalScore >= 40 ? 'DELAY' : 'ALLOW';

  const updateFactor = (id: string, value: number) => {
    setFactors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value, status: getStatus(value) } : f))
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" /> Explainable Wealth Protection Score
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Transparent AI that shows exactly why each transaction is risky.</p>
      </div>

      {/* Score Hero */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70 uppercase tracking-wider">Wealth Protection Risk Score</p>
            <p className="text-4xl font-black mt-1">{totalScore}<span className="text-lg text-white/50">/100</span></p>
            <p className="text-xs text-white/70 mt-1">
              {riskLevel === 'LOW' && 'Low risk. Transaction can proceed safely.'}
              {riskLevel === 'MEDIUM' && 'Medium risk. Review carefully before proceeding.'}
              {riskLevel === 'HIGH' && 'High risk. Transaction blocked for your protection.'}
            </p>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
              action === 'ALLOW' ? 'bg-emerald-500/20 text-emerald-300' :
              action === 'DELAY' ? 'bg-amber-500/20 text-amber-300' :
              'bg-rose-500/20 text-rose-300'
            }`}>
              {action}
            </span>
          </div>
        </div>
      </div>

      {/* Factors Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Risk Factor Breakdown</h3>
        {factors.map((factor) => {
          const Icon = factor.icon;
          return (
            <motion.div
              key={factor.id}
              layout
              className={`p-4 rounded-xl border ${statusColor(factor.status)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-bold">{factor.name}</span>
                  <span className="text-[10px] opacity-60">Weight: {Math.round(factor.weight * 100)}%</span>
                </div>
                <span className="text-xs font-black">{Math.round(factor.value * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={factor.value}
                onChange={(e) => updateFactor(factor.id, Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] mt-2 opacity-80">{factor.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Explainability */}
      <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-600 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300">How is this score calculated?</p>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">
              Each factor is weighted based on its importance in detecting fraud. The final score is the weighted sum of all factors.
              Adjust the sliders above to see how different scenarios affect the risk score in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

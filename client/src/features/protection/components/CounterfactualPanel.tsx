import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

interface RiskSignals {
  newDevice?: boolean;
  rushedAction?: boolean;
  unusualAmount?: boolean;
  otpRetries?: boolean;
  firstTimeInvest?: boolean;
  abnormalBehavior?: boolean;
}

interface Suggestion {
  icon: string;
  text: string;
  reduction: number;
}

interface Props {
  riskScore: number;
  signals: RiskSignals;
}

export default function CounterfactualPanel({ riskScore, signals }: Props) {
  const suggestions = useMemo<Suggestion[]>(() => {
    const list: Suggestion[] = [];
    if (signals.rushedAction) {
      list.push({ icon: 'fa-hourglass-half', text: 'Wait for 15 minutes. Your session risk will drop by 20 points.', reduction: 20 });
    }
    if (signals.newDevice) {
      list.push({ icon: 'fa-mobile-screen', text: 'Verify this device via OTP to reduce risk by 25 points.', reduction: 25 });
    }
    if (signals.unusualAmount) {
      list.push({ icon: 'fa-indian-rupee-sign', text: 'Split the amount into 2 smaller transactions to reduce risk by 15 points.', reduction: 15 });
    }
    if (signals.otpRetries) {
      list.push({ icon: 'fa-key', text: 'Wait 10 minutes before retrying OTP to reduce risk by 10 points.', reduction: 10 });
    }
    if (signals.firstTimeInvest) {
      list.push({ icon: 'fa-user-shield', text: 'Complete a video KYC step to reduce first-time risk by 18 points.', reduction: 18 });
    }
    if (signals.abnormalBehavior) {
      list.push({ icon: 'fa-fingerprint', text: 'Confirm behavioral biometric match to reduce risk by 22 points.', reduction: 22 });
    }
    if (list.length === 0) {
      list.push({ icon: 'fa-check-circle', text: 'No high-risk signals detected. Transaction can proceed safely.', reduction: 0 });
    }
    return list;
  }, [signals]);

  const totalReduction = useMemo(() => suggestions.reduce((sum, s) => sum + s.reduction, 0), [suggestions]);
  const projectedScore = Math.max(0, riskScore - totalReduction);

  const [displayScore, setDisplayScore] = useState(riskScore);

  useEffect(() => {
    if (riskScore === projectedScore) {
      setDisplayScore(riskScore);
      return;
    }
    let current = riskScore;
    const step = Math.max(1, Math.ceil((riskScore - projectedScore) / 30));
    const timer = setInterval(() => {
      current -= step;
      if (current <= projectedScore) {
        setDisplayScore(projectedScore);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, 60);
    return () => clearInterval(timer);
  }, [riskScore, projectedScore]);

  const scoreColor = displayScore >= 80 ? 'text-rose-400' : displayScore >= 50 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-4 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
          <i className="fas fa-lightbulb text-xs" />
        </div>
        <h4 className="text-xs font-bold text-slate-200">How to proceed safely</h4>
      </div>

      <div className="space-y-2.5 mb-4">
        {suggestions.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50"
          >
            <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center text-slate-300 shrink-0">
              <i className={`fas ${s.icon} text-[10px]`} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-slate-300 leading-relaxed">{s.text}</p>
              {s.reduction > 0 && (
                <span className="text-[9px] font-bold text-emerald-400">-{s.reduction} risk points</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-700 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Projected Risk Score</p>
          <p className={`text-2xl font-black ${scoreColor}`}>{displayScore}<span className="text-sm text-slate-500">/100</span></p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400">Current</p>
          <p className="text-sm font-bold text-slate-300">{riskScore}/100</p>
        </div>
      </div>
    </motion.div>
  );
}

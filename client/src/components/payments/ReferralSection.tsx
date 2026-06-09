import { useState } from 'react';
import { useRewards } from '../../context/RewardsContext';

export default function ReferralSection() {
  const { referralCode, pendingReferrals, addCashback } = useRewards();
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const copyCode = () => {
    navigator.clipboard?.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateFriendJoin = () => {
    setSimulating(true);
    setTimeout(() => {
      addCashback(50, 'referral-bonus', 'Friend Signup');
      setSimulating(false);
    }, 2000);
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <i className="fas fa-user-plus text-primary" />
          Refer & Earn
        </h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg">
          ₹50 each
        </span>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Invite friends. When they make their first UPI payment, both of you get ₹50 cashback — funded from customer acquisition savings.
      </p>

      {/* Code */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 font-mono text-sm text-slate-800 dark:text-white tracking-wider">
          {referralCode}
        </div>
        <button
          onClick={copyCode}
          className="px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`} />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Simulate */}
      <button
        onClick={simulateFriendJoin}
        disabled={simulating}
        className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {simulating ? <i className="fas fa-circle-notch fa-spin" /> : <i className="fas fa-user-astronaut" />}
        {simulating ? 'Friend joining...' : 'Simulate Friend Joining'}
      </button>

      {/* Stats */}
      {pendingReferrals > 0 && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-between">
          <span className="text-sm text-green-700 dark:text-green-400">
            <i className="fas fa-users mr-2" />
            {pendingReferrals} friend(s) joined
          </span>
          <span className="text-sm font-bold text-green-600">+₹{pendingReferrals * 50}</span>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-700 dark:text-blue-400 flex items-start gap-2">
        <i className="fas fa-circle-info mt-0.5" />
        <p>Cost-neutral: Bank saves on CAC (customer acquisition cost) via organic referrals, passing a fraction as reward.</p>
      </div>
    </div>
  );
}

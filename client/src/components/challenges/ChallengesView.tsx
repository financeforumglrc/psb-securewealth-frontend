import { useState } from 'react';
import { useWealthStore } from '../../store/wealthStore';

const LEADERBOARD = [
  { rank: 1, name: 'WealthWarrior***', saved: 52000, avatar: 'WW', color: 'bg-amber-500' },
  { rank: 2, name: 'SIPKing***', saved: 48000, avatar: 'SK', color: 'bg-slate-400' },
  { rank: 3, name: 'BudgetQueen***', saved: 46500, avatar: 'BQ', color: 'bg-orange-400' },
  { rank: 4, name: 'FrugalFox***', saved: 43100, avatar: 'FF', color: 'bg-emerald-500' },
  { rank: 5, name: 'MoneyMaven***', saved: 41200, avatar: 'MM', color: 'bg-blue-500' },
  { rank: 89, name: 'Deepanshu S.', saved: 12000, avatar: 'DS', color: 'bg-primary', isUser: true },
  { rank: 90, name: 'SaverSingh***', saved: 11800, avatar: 'SS', color: 'bg-purple-500' },
  { rank: 91, name: 'CoinCollector***', saved: 11500, avatar: 'CC', color: 'bg-rose-400' },
];

const PAST_CHALLENGES = [
  { title: 'No-Spend Weekend', result: 'Completed', saved: 3400, date: 'Mar 2026', icon: 'fa-check-circle', color: 'text-emerald-500' },
  { title: 'Save ₹10K in 30 Days', result: 'Completed', saved: 10200, date: 'Feb 2026', icon: 'fa-check-circle', color: 'text-emerald-500' },
  { title: 'Cut Subscription Costs', result: 'Failed', saved: 800, date: 'Jan 2026', icon: 'fa-xmark-circle', color: 'text-rose-400' },
];

export default function ChallengesView() {
  const challenges = useWealthStore((s) => s.challenges);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = 'https://securewealth-twin.surge.sh/?ref=rahulsharma&challenge=join';

  function copyLink() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function getProgressPercent(challenge: typeof challenges[0]) {
    return Math.min((challenge.progress / challenge.maxProgress) * 100, 100);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            <i className="fas fa-fire text-accent mr-2" />
            Savings Challenges
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Compete with friends. Build habits. Win badges.</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-user-plus" />
          Invite Friend
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary">{challenges.length}</p>
          <p className="text-xs text-slate-500">Active Challenges</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-emerald-600">2</p>
          <p className="text-xs text-slate-500">Badges Won</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-600">₹22,600</p>
          <p className="text-xs text-slate-500">Total Saved</p>
        </div>
      </div>

      {/* Active Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {challenges.map((c) => {
          const pct = getProgressPercent(c);
          return (
            <div key={c.id} className="card border-2 border-transparent hover:border-primary/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl ${c.color} text-white flex items-center justify-center text-lg`}>
                  <i className={`fas ${c.icon}`} />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  c.daysLeft <= 7 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {c.daysLeft} days left
                </span>
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">{c.title}</h3>
              <p className="text-xs text-slate-400 mb-3">{c.description}</p>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">{c.progressLabel}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{pct.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${c.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  <i className="fas fa-users mr-1" />{c.participants.toLocaleString()} participants
                </span>
                <span className="text-primary font-medium">
                  Your rank: #{c.userRank}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <i className="fas fa-medal text-amber-400 text-xs" />
                <span className="text-[10px] text-slate-400">Reward: <span className="text-amber-600 font-medium">{c.reward}</span></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard + Past Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-4">
            <i className="fas fa-trophy text-amber-500 mr-2" />
            Leaderboard
          </h3>
          <div className="space-y-2">
            {LEADERBOARD.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                  entry.isUser ? 'bg-primary/5 border border-primary/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  entry.rank === 1 ? 'bg-amber-100 text-amber-700' :
                  entry.rank === 2 ? 'bg-slate-200 text-slate-700' :
                  entry.rank === 3 ? 'bg-orange-100 text-orange-700' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {entry.rank}
                </div>
                <div className={`w-8 h-8 rounded-full ${entry.color} text-white flex items-center justify-center text-[10px] font-bold`}>
                  {entry.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${entry.isUser ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>
                    {entry.name}
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-white">₹{entry.saved.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 py-2 text-xs text-primary hover:bg-primary/5 rounded-lg transition-colors">
            View Full Leaderboard
          </button>
        </div>

        {/* Past Challenges + Badges */}
        <div className="space-y-4">
          {/* Past Challenges */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-4">
              <i className="fas fa-clock-rotate-left text-slate-400 mr-2" />
              Challenge History
            </h3>
            <div className="space-y-2">
              {PAST_CHALLENGES.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <i className={`fas ${c.icon} ${c.color} text-lg`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{c.title}</p>
                    <p className="text-[10px] text-slate-400">{c.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">₹{c.saved.toLocaleString()}</p>
                    <p className={`text-[10px] ${c.color}`}>{c.result}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-4">
              <i className="fas fa-certificate text-accent mr-2" />
              My Badges
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { name: 'Frugal Fox', icon: 'fa-paw', color: 'text-orange-500', bg: 'bg-orange-50', unlocked: true },
                { name: 'Safety Net', icon: 'fa-shield-halved', color: 'text-emerald-500', bg: 'bg-emerald-50', unlocked: true },
                { name: 'SIP Champion', icon: 'fa-trophy', color: 'text-primary', bg: 'bg-primary/5', unlocked: false },
                { name: 'Century Saver', icon: 'fa-gem', color: 'text-purple-500', bg: 'bg-purple-50', unlocked: false },
              ].map((badge) => (
                <div key={badge.name} className={`text-center p-3 rounded-xl ${badge.unlocked ? badge.bg : 'bg-slate-50 dark:bg-slate-800 opacity-50'}`}>
                  <i className={`fas ${badge.icon} ${badge.color} text-xl mb-1`} />
                  <p className="text-[10px] font-medium text-slate-700 dark:text-slate-200">{badge.name}</p>
                  {badge.unlocked && <span className="text-[8px] text-emerald-600">✓ Unlocked</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <i className="fas fa-user-group text-2xl text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Invite a Friend</h3>
              <p className="text-xs text-slate-400 mt-1">Compete together and stay accountable</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-4 flex items-center gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 bg-transparent text-xs text-slate-600 dark:text-slate-300 outline-none"
              />
              <button
                onClick={copyLink}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  copied ? 'bg-emerald-500 text-white' : 'bg-primary text-white'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="space-y-2">
              <button className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors">
                <i className="fab fa-whatsapp mr-2" /> Share on WhatsApp
              </button>
              <button className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">
                <i className="fab fa-telegram mr-2" /> Share on Telegram
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center mt-3">
              You'll both get a <span className="text-accent font-medium">₹500 bonus</span> when they complete their first challenge.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

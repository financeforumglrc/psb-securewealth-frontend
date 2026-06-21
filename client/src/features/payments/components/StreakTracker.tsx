import { useState, useEffect } from 'react';
import { checkIn, getStreak, getNextReward, type StreakData } from '@/shared/services/streakService';

export default function StreakTracker() {
  const [streak, setStreak] = useState<StreakData>(getStreak);
  const [nextReward, setNextReward] = useState(getNextReward());
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    const s = getStreak();
    setStreak(s);
    setNextReward(getNextReward());
    // Auto-check if last login was today
    const last = new Date(s.lastLoginDate).toDateString();
    if (last === new Date().toDateString()) setCheckedIn(true);
  }, []);

  const handleCheckIn = () => {
    const updated = checkIn();
    setStreak(updated);
    setNextReward(getNextReward());
    setCheckedIn(true);
  };

  const milestones = [
    { days: 7, label: '7 Days', reward: '0.5% booster', icon: 'fa-fire' },
    { days: 30, label: '30 Days', reward: '1% week booster', icon: 'fa-trophy' },
    { days: 100, label: '100 Days', reward: '₹100 + Badge', icon: 'fa-crown' },
  ];

  const progressToNext = nextReward ? Math.min((streak.days / nextReward.days) * 100, 100) : 100;

  return (
    <div className="card rounded-3xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <i className="fas fa-fire text-amber-500" />
          Login Streak
        </h3>
        <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg">
          Daily Rewards
        </span>
      </div>

      {/* Flame + Counter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
          <i className="fas fa-fire text-2xl" />
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{streak.days}</p>
          <p className="text-sm text-slate-500">consecutive days</p>
        </div>
        <div className="ml-auto">
          <button
            onClick={handleCheckIn}
            disabled={checkedIn}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              checkedIn
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
            }`}
          >
            {checkedIn ? (
              <span className="flex items-center gap-2">
                <i className="fas fa-check" /> Checked In
              </span>
            ) : (
              'Check In Today'
            )}
          </button>
        </div>
      </div>

      {/* Next Reward */}
      {nextReward && (
        <div className="mb-5 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600 dark:text-slate-300">Next reward at {nextReward.days} days</span>
            <span className="font-bold text-primary">{nextReward.reward}</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="grid grid-cols-3 gap-3">
        {milestones.map((m) => {
          const achieved = streak.days >= m.days;
          return (
            <div
              key={m.days}
              className={`text-center p-3 rounded-xl border transition-all ${
                achieved
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                  : 'bg-slate-50 dark:bg-slate-800 border-transparent'
              }`}
            >
              <i className={`fas ${m.icon} ${achieved ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'} text-lg mb-1`} />
              <p className={`text-xs font-bold ${achieved ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                {m.label}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{m.reward}</p>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-400 text-center mt-4">
        <i className="fas fa-circle-info mr-1" />
        Streak boosters are funded by reduced fraud costs from secure twin usage
      </p>
    </div>
  );
}

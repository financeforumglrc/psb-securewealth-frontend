import { useState, useEffect } from 'react';
import { useRewards } from '../../context/RewardsContext';

export default function AdReward() {
  const { addCashback } = useRewards();
  const [watching, setWatching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!watching) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setWatching(false);
          addCashback(2, 'ad-reward', 'Ad Revenue');
          setCooldown(60); // 60s cooldown
          return 100;
        }
        return p + 2;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [watching, addCashback]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <i className="fas fa-play-circle text-purple-500" />
          Watch & Earn
        </h3>
        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-lg">
          +₹2 per ad
        </span>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Watch a 15-second ad (simulated). Earn ₹2 cashback funded by ad revenue — zero cost to the bank.
      </p>

      {/* Ad Player */}
      <div className="aspect-video bg-slate-900 rounded-xl relative overflow-hidden mb-4 flex items-center justify-center">
        {watching ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-slate-900" />
            <div className="relative z-10 text-center text-white">
              <i className="fas fa-film text-4xl mb-2 animate-pulse" />
              <p className="text-sm font-medium">Ad playing...</p>
              <p className="text-xs opacity-60 mt-1">{Math.ceil((100 - progress) / 100 * 15)}s remaining</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div className="h-full bg-purple-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </>
        ) : cooldown > 0 ? (
          <div className="text-center text-white/60">
            <i className="fas fa-hourglass-half text-3xl mb-2" />
            <p className="text-sm">Cooldown: {cooldown}s</p>
          </div>
        ) : (
          <div className="text-center text-white/60">
            <i className="fas fa-play text-4xl mb-2" />
            <p className="text-sm">Tap Watch to start</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setWatching(true)}
        disabled={watching || cooldown > 0}
        className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {watching ? (
          <><i className="fas fa-circle-notch fa-spin" /> Watching...</>
        ) : cooldown > 0 ? (
          <><i className="fas fa-clock" /> Wait {cooldown}s</>
        ) : (
          <><i className="fas fa-play" /> Watch Ad & Earn ₹2</>
        )}
      </button>

      <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-xs text-purple-700 dark:text-purple-400 flex items-start gap-2">
        <i className="fas fa-circle-info mt-0.5" />
        <p>Ad revenue is shared with users as cashback — a sustainable model used by many fintech apps globally.</p>
      </div>
    </div>
  );
}

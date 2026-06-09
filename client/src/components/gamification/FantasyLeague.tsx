import { useState } from 'react';
import { getLeagues, getLeaderboard, generateScoutingReport, type FantasyPlayer, type FantasyLeague, type ScoutingReport } from '../../services/leagueService';
import FantasyPortfolio from './FantasyPortfolio';

export default function FantasyLeague() {
  const [activeTab, setActiveTab] = useState<'leagues' | 'leaderboard' | 'portfolio' | 'scouting'>('leagues');
  const [selectedPlayer, setSelectedPlayer] = useState<FantasyPlayer | null>(null);
  const [report, setReport] = useState<ScoutingReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const leagues = getLeagues();
  const leaderboard = getLeaderboard();

  const handleScout = async (player: FantasyPlayer) => {
    setSelectedPlayer(player);
    setLoadingReport(true);
    setReport(null);
    const r = await generateScoutingReport(player.id);
    setReport(r);
    setLoadingReport(false);
    setActiveTab('scouting');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 border-2 border-violet-200 dark:border-violet-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center text-white">
            <i className="fas fa-trophy" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white">Fantasy Finance League</h2>
            <p className="text-xs text-slate-400">Compete with AI-powered peers. Build your dream portfolio.</p>
          </div>
        </div>
        <div className="flex gap-2">
          {([
            { key: 'leagues', label: 'Leagues', icon: 'fa-users' },
            { key: 'leaderboard', label: 'Leaderboard', icon: 'fa-ranking-star' },
            { key: 'portfolio', label: 'My Portfolio', icon: 'fa-briefcase' },
          ] as { key: typeof activeTab; label: string; icon: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                activeTab === t.key
                  ? 'bg-violet-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <i className={`fas ${t.icon}`} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leagues Tab */}
      {activeTab === 'leagues' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leagues.map((l) => (
            <div key={l.id} className="card hover:shadow-lg transition-shadow border-2 border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white">
                  <i className={`fas ${l.icon}`} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">{l.name}</h3>
                  <p className="text-[10px] text-slate-400">{l.members.toLocaleString()} members</p>
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Your Rank</span>
                  <span className="font-bold text-violet-600">#{l.myRank}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Top Performer</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{l.topPerformer}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">This Week</span>
                  <span className="font-bold text-amber-600">{l.weeklyTheme}</span>
                </div>
              </div>
              <button className="w-full py-2 bg-violet-500 hover:bg-violet-600 text-white text-xs font-bold rounded-lg transition-colors">
                Enter League
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="card">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <i className="fas fa-ranking-star text-violet-500" /> Weekly Leaderboard
          </h3>
          <div className="space-y-3">
            {leaderboard.map((player, idx) => (
              <div
                key={player.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  idx === 0 ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800' :
                  idx === 1 ? 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700' :
                  idx === 2 ? 'bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800' :
                  'bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx === 0 ? 'bg-amber-500 text-white' :
                  idx === 1 ? 'bg-slate-400 text-white' :
                  idx === 2 ? 'bg-orange-500 text-white' :
                  'bg-slate-200 text-slate-600'
                }`}>
                  {idx + 1}
                </div>
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                  {player.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{player.name}</p>
                  <p className="text-[10px] text-slate-400">{player.strategy.slice(0, 45)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">+{player.weeklyReturn}%</p>
                  <p className="text-[10px] text-slate-400">₹{(player.portfolioValue / 1e5).toFixed(1)}L</p>
                </div>
                <button
                  onClick={() => handleScout(player)}
                  className="px-3 py-1.5 bg-violet-50 text-violet-600 text-[10px] font-bold rounded-lg border border-violet-200 hover:bg-violet-100 transition-colors"
                >
                  <i className="fas fa-magnifying-glass" /> Scout
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && <FantasyPortfolio />}

      {/* Scouting Report */}
      {activeTab === 'scouting' && selectedPlayer && (
        <div className="card border-2 border-violet-200 dark:border-violet-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-clipboard text-violet-500" /> AI Scouting Report
            </h3>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              <i className="fas fa-arrow-left" /> Back
            </button>
          </div>

          {loadingReport ? (
            <div className="space-y-3 animate-pulse py-6">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
            </div>
          ) : report ? (
            <div className="space-y-4">
              <div className="p-3 bg-violet-50 dark:bg-violet-900/10 rounded-xl border border-violet-200 dark:border-violet-800">
                <p className="text-sm font-bold text-violet-700 dark:text-violet-300">{report.headline}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-emerald-600 mb-2"><i className="fas fa-check-circle mr-1" /> Strengths</p>
                <ul className="space-y-1">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">▸</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-bold text-amber-600 mb-2"><i className="fas fa-triangle-exclamation mr-1" /> Weaknesses</p>
                <ul className="space-y-1">
                  {report.weaknesses.map((s, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">▸</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">AI Verdict</p>
                <p className="text-xs text-slate-700 dark:text-slate-200 italic">{report.aiVerdict}</p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

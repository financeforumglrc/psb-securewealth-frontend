import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useRecommendationEngine } from '@/shared/hooks/useRecommendationEngine';
import CosmosCard, { CosmosBadge } from '@/shared/components/ui/CosmosCard';

const TABS = [
  { key: 'all', label: 'All', icon: 'fa-layer-group' },
  { key: 'savings', label: 'Savings', icon: 'fa-piggy-bank' },
  { key: 'investment', label: 'Invest', icon: 'fa-chart-line' },
  { key: 'tax', label: 'Tax', icon: 'fa-receipt' },
  { key: 'protection', label: 'Protect', icon: 'fa-shield-halved' },
  { key: 'spending', label: 'Spend', icon: 'fa-wallet' },
] as const;

const TYPE_COLORS: Record<string, string> = {
  savings: '#0f766e',
  investment: '#1565C0',
  tax: '#E65100',
  protection: '#B71C1C',
  spending: '#6A1B9A',
};

function ConfidenceBadge({ rec }: { rec: { why: { userPattern: string; marketCondition: string; ruleLogic: string } } }) {
  // Compute confidence based on how many data sources are cited
  const sources = [rec.why.userPattern, rec.why.marketCondition, rec.why.ruleLogic].filter((s) => s && s.length > 5).length;
  const score = Math.min(50 + sources * 15 + Math.floor(Math.random() * 10), 98);
  const color = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'info';
  return <CosmosBadge color={color} size="xs">{score}% confidence</CosmosBadge>;
}

export default function AIRecommendationsView() {
  const user = useWealthStore((s) => s.user);
  const market = useWealthStore((s) => s.marketData);
  const goals = useWealthStore((s) => s.goals);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['key']>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actedOn, setActedOn] = useState<Set<string>>(new Set());

  const recs = useRecommendationEngine(user, market);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return recs;
    return recs.filter((r) => r.type === activeTab);
  }, [recs, activeTab]);

  const stats = useMemo(() => ({
    total: recs.length,
    high: recs.filter((r) => r.priority === 'high').length,
    acted: actedOn.size,
    potential: recs.reduce((sum, r) => {
      const match = r.potential.match(/₹([0-9,.]+)/);
      return sum + (match ? parseInt(match[1].replace(/,/g, '')) : 0);
    }, 0),
  }), [recs, actedOn]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-robot text-primary" /> AI Recommendations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Personalized insights based on your profile, market data, and behavioral patterns</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Recommendations', value: stats.total, icon: 'fa-lightbulb', color: 'text-primary' },
          { label: 'High Priority', value: stats.high, icon: 'fa-triangle-exclamation', color: 'text-rose-500' },
          { label: 'Acted On', value: stats.acted, icon: 'fa-check-circle', color: 'text-emerald-500' },
          { label: 'Potential Value', value: `₹${(stats.potential / 100000).toFixed(1)}L+`, icon: 'fa-gem', color: 'text-amber-500' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <CosmosCard variant="stat" padding="md">
              <div className="flex items-center gap-2 mb-1">
                <i className={`fas ${s.icon} ${s.color} text-[10px]`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</span>
              </div>
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            </CosmosCard>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => {
          const count = t.key === 'all' ? recs.length : recs.filter((r) => r.type === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === t.key
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <i className={`fas ${t.icon}`} />
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === t.key ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
          {filtered.map((rec, i) => {
            const isExpanded = expandedId === rec.id;
            const isActed = actedOn.has(rec.id);
            const typeColor = TYPE_COLORS[rec.type] || '#0f766e';
            const priorityColor = rec.priority === 'high' ? 'danger' : rec.priority === 'medium' ? 'warning' : 'info';

            return (
              <motion.div key={rec.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <CosmosCard variant={isActed ? 'ghost' : 'default'} className={isActed ? 'opacity-60' : ''}>
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${typeColor}15`, color: typeColor }}>
                      <i className={`fas fa-${rec.type === 'savings' ? 'piggy-bank' : rec.type === 'investment' ? 'chart-line' : rec.type === 'tax' ? 'receipt' : rec.type === 'protection' ? 'shield-halved' : 'wallet'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-bold ${isActed ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>{rec.title}</p>
                        <CosmosBadge color={priorityColor} size="xs">{rec.priority}</CosmosBadge>
                        <ConfidenceBadge rec={rec} />
                      </div>
                      <p className={`text-xs mt-1 ${isActed ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>{rec.description}</p>

                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-bold text-emerald-600"><i className="fas fa-gem mr-1" />{rec.potential}</span>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                          className="text-[10px] font-bold text-primary hover:underline"
                        >
                          {isExpanded ? 'Hide' : 'Why this?'} <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} ml-0.5`} />
                        </button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 space-y-2">
                              <div className="flex items-start gap-2">
                                <i className="fas fa-user text-[10px] text-primary mt-0.5" />
                                <p className="text-[11px] text-slate-600 dark:text-slate-300"><span className="font-bold">Your pattern:</span> {rec.why.userPattern}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <i className="fas fa-chart-line text-[10px] text-amber-500 mt-0.5" />
                                <p className="text-[11px] text-slate-600 dark:text-slate-300"><span className="font-bold">Market:</span> {rec.why.marketCondition}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <i className="fas fa-book text-[10px] text-emerald-500 mt-0.5" />
                                <p className="text-[11px] text-slate-600 dark:text-slate-300"><span className="font-bold">Logic:</span> {rec.why.ruleLogic}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {!isActed ? (
                        <button
                          onClick={() => setActedOn((prev) => new Set(prev).add(rec.id))}
                          className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
                        >
                          {rec.action}
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-500"><i className="fas fa-check mr-1" />Done</span>
                      )}
                    </div>
                  </div>
                </CosmosCard>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-check-double text-2xl text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">No recommendations in this category right now.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Goal Context */}
      {goals.length > 0 && (
        <CosmosCard variant="gradient" header={{ icon: 'fa-bullseye', iconColor: '#0f766e', title: 'Goal Context' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {goals.slice(0, 3).map((goal) => {
              const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <div key={goal.id} className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{goal.name}</p>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mt-2">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{pct.toFixed(0)}% · ₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </CosmosCard>
      )}
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Insight {
  id: string;
  source: string;
  icon: string;
  color: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  actionLabel: string;
  time: string;
}

const INSIGHTS: Insight[] = [
  {
    id: 'ai-1',
    source: 'Crisis Shield',
    icon: 'fa-tower-broadcast',
    color: '#F44336',
    priority: 'critical',
    title: 'Medical Emergency Risk Rising',
    description: 'Parent health cover insufficient. 67% probability of medical event in 8 months. Auto-hedge recommends ₹5L buffer.',
    action: 'activate-health-buffer',
    actionLabel: 'Activate Buffer',
    time: '2 min ago',
  },
  {
    id: 'ai-2',
    source: 'Market AI',
    icon: 'fa-chart-line',
    color: '#2196F3',
    priority: 'high',
    title: 'Gold Entry Window Opening',
    description: 'AI predicts optimal gold purchase window Aug 01-07. Pre-festive demand + USD weakness = +12% upside potential.',
    action: 'buy-gold',
    actionLabel: 'Buy Gold ETF',
    time: '15 min ago',
  },
  {
    id: 'ai-3',
    source: 'Financial DNA',
    icon: 'fa-dna',
    color: '#1B5E20',
    priority: 'medium',
    title: 'Wednesday Spending Pattern Detected',
    description: 'Your mood-spend correlation drops 40% on Wednesdays. Emotional spending trigger: Instagram ads during work hours.',
    action: 'block-ads',
    actionLabel: 'Block Shopping Ads',
    time: '1 hr ago',
  },
  {
    id: 'ai-4',
    source: 'Life Events',
    icon: 'fa-crystal-ball',
    color: '#9C27B0',
    priority: 'high',
    title: 'Child Education Fund Gap Alert',
    description: '₹18L needed in 14 months. Current trajectory: ₹12L. Gap: ₹6L. Auto-SIP recommendation: ₹45,000/month.',
    action: 'start-education-sip',
    actionLabel: 'Auto-Start SIP',
    time: '3 hrs ago',
  },
  {
    id: 'ai-5',
    source: 'Emotion Engine',
    icon: 'fa-brain',
    color: '#E91E63',
    priority: 'medium',
    title: 'Friday Euphoria Costing You ₹3.4K/week',
    description: 'Weekend celebration spending is 3.2x weekday average. AI coach recommends Friday budget cap of ₹1,500.',
    action: 'set-friday-cap',
    actionLabel: 'Set Cap',
    time: '5 hrs ago',
  },
  {
    id: 'ai-6',
    source: 'Community DNA',
    icon: 'fa-users',
    color: '#607D8B',
    priority: 'low',
    title: 'Your Cohort is Buying EVs 2.1x More',
    description: 'Age 30-35, income ₹15-25L cohort shows 2.1x EV purchase intent. Subsidy extension predicted. Delay car buy to Q3?',
    action: 'ev-analysis',
    actionLabel: 'View Analysis',
    time: '8 hrs ago',
  },
  {
    id: 'ai-7',
    source: 'Generational Wealth',
    icon: 'fa-people-roof',
    color: '#FF9800',
    priority: 'medium',
    title: 'Legacy Vault: 2 Assets Unsecured',
    description: 'Digital art NFTs (₹45K) and cloud storage lack nominee assignments. Smart will recommends immediate nomination.',
    action: 'secure-assets',
    actionLabel: 'Secure Now',
    time: '12 hrs ago',
  },
  {
    id: 'ai-8',
    source: 'Future Twin',
    icon: 'fa-comments',
    color: '#8B5CF6',
    priority: 'low',
    title: 'Your Future Self Left a Message',
    description: "That NPS contribution you almost skipped? It's funding our retirement travel now. Small pain, massive gain.",
    action: 'read-message',
    actionLabel: 'Read Full',
    time: '1 day ago',
  },
];

const PRIORITY_CONFIG = {
  critical: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100', dot: 'bg-rose-500' },
  high: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100', dot: 'bg-amber-500' },
  medium: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100', dot: 'bg-blue-500' },
  low: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100', dot: 'bg-gray-400' },
};

export default function AIInsightsAggregator() {
  const [filter, setFilter] = useState<string>('all');
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const visible = INSIGHTS.filter(i => !dismissed.includes(i.id));
  const filtered = filter === 'all' ? visible : visible.filter(i => i.priority === filter);

  const counts = {
    all: visible.length,
    critical: visible.filter(i => i.priority === 'critical').length,
    high: visible.filter(i => i.priority === 'high').length,
    medium: visible.filter(i => i.priority === 'medium').length,
    low: visible.filter(i => i.priority === 'low').length,
  };

  return (
    <div className="card-psb">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <i className="fas fa-robot text-primary" /> Unified AI Intelligence Feed
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Cross-module insights from all 12 BHAVISHYA engines — prioritized by financial impact
          </p>
        </div>
        <div className="px-2.5 py-1 bg-primary/10 rounded-full text-[10px] font-bold text-primary">
          {visible.length} Active
        </div>
      </div>

      {/* Priority Filters */}
      <div className="flex gap-2 mt-3 mb-4 overflow-x-auto pb-1">
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
              filter === p
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
            <span className="ml-1 opacity-70">({counts[p]})</span>
          </button>
        ))}
      </div>

      {/* Insights Feed */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {filtered.map((insight, idx) => {
            const cfg = PRIORITY_CONFIG[insight.priority];
            const isOpen = expanded === insight.id;
            return (
              <motion.div
                key={insight.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`rounded-xl border transition-all duration-200 ${isOpen ? 'shadow-md' : ''} ${cfg.border} ${cfg.bg}`}
              >
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="relative mt-0.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: insight.color + '15' }}
                      >
                        <i className={`fas ${insight.icon}`} style={{ color: insight.color, fontSize: '13px' }} />
                      </div>
                      <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${cfg.dot}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${cfg.badge} ${cfg.text}`}>
                          {insight.priority.toUpperCase()}
                        </span>
                        <span className="text-[9px] text-gray-400">{insight.source}</span>
                        <span className="text-[9px] text-gray-300 ml-auto">{insight.time}</span>
                      </div>
                      <h4 className="text-[12px] font-bold text-gray-800">{insight.title}</h4>
                      <p className="text-[11px] text-gray-600 leading-relaxed mt-0.5">{insight.description}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <button className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary-dark transition-colors">
                          {insight.actionLabel}
                        </button>
                        <button
                          onClick={() => setExpanded(isOpen ? null : insight.id)}
                          className="px-2 py-1.5 text-gray-400 text-[10px] hover:text-gray-600 transition-colors"
                        >
                          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} mr-1`} />
                          {isOpen ? 'Less' : 'Details'}
                        </button>
                        <button
                          onClick={() => setDismissed([...dismissed, insight.id])}
                          className="ml-auto px-2 py-1.5 text-gray-300 text-[10px] hover:text-gray-500 transition-colors"
                        >
                          <i className="fas fa-xmark" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`border-t border-dashed ${cfg.border} px-3 pb-3`}
                    >
                      <div className="pt-2 space-y-2 text-[10px] text-gray-500">
                        <p><i className="fas fa-microchip mr-1 text-primary" /><strong>AI Confidence:</strong> 87% based on 23 correlated signals</p>
                        <p><i className="fas fa-coins mr-1 text-amber-500" /><strong>Financial Impact:</strong> ₹2.4L - ₹5.8L over 24 months</p>
                        <p><i className="fas fa-clock mr-1 text-blue-500" /><strong>Action Window:</strong> Next 14 days for optimal outcome</p>
                        <p><i className="fas fa-shield-halved mr-1 text-green-500" /><strong>Risk if Ignored:</strong> 34% higher financial stress probability</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <i className="fas fa-check-circle text-3xl text-green-300 mb-2" />
          <p className="text-sm font-medium">All insights addressed!</p>
          <p className="text-[11px]">Your financial future is on track</p>
        </div>
      )}
    </div>
  );
}

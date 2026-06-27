import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/shared/hooks/useTranslation';

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
    source: 'insightMedicalEmergencySource',
    icon: 'fa-tower-broadcast',
    color: '#F44336',
    priority: 'critical',
    title: 'insightMedicalEmergencyTitle',
    description: 'insightMedicalEmergencyDesc',
    action: 'activate-health-buffer',
    actionLabel: 'insightMedicalEmergencyAction',
    time: 'insightMedicalEmergencyTime',
  },
  {
    id: 'ai-2',
    source: 'insightGoldWindowSource',
    icon: 'fa-chart-line',
    color: '#2196F3',
    priority: 'high',
    title: 'insightGoldWindowTitle',
    description: 'insightGoldWindowDesc',
    action: 'buy-gold',
    actionLabel: 'insightGoldWindowAction',
    time: 'insightGoldWindowTime',
  },
  {
    id: 'ai-3',
    source: 'insightWednesdaySpendingSource',
    icon: 'fa-dna',
    color: '#1B5E20',
    priority: 'medium',
    title: 'insightWednesdaySpendingTitle',
    description: 'insightWednesdaySpendingDesc',
    action: 'block-ads',
    actionLabel: 'insightWednesdaySpendingAction',
    time: 'insightWednesdaySpendingTime',
  },
  {
    id: 'ai-4',
    source: 'insightEducationGapSource',
    icon: 'fa-crystal-ball',
    color: '#9C27B0',
    priority: 'high',
    title: 'insightEducationGapTitle',
    description: 'insightEducationGapDesc',
    action: 'start-education-sip',
    actionLabel: 'insightEducationGapAction',
    time: 'insightEducationGapTime',
  },
  {
    id: 'ai-5',
    source: 'insightFridayEuphoriaSource',
    icon: 'fa-brain',
    color: '#E91E63',
    priority: 'medium',
    title: 'insightFridayEuphoriaTitle',
    description: 'insightFridayEuphoriaDesc',
    action: 'set-friday-cap',
    actionLabel: 'insightFridayEuphoriaAction',
    time: 'insightFridayEuphoriaTime',
  },
  {
    id: 'ai-6',
    source: 'insightEvCohortSource',
    icon: 'fa-users',
    color: '#607D8B',
    priority: 'low',
    title: 'insightEvCohortTitle',
    description: 'insightEvCohortDesc',
    action: 'ev-analysis',
    actionLabel: 'insightEvCohortAction',
    time: 'insightEvCohortTime',
  },
  {
    id: 'ai-7',
    source: 'insightLegacyAssetsSource',
    icon: 'fa-people-roof',
    color: '#FF9800',
    priority: 'medium',
    title: 'insightLegacyAssetsTitle',
    description: 'insightLegacyAssetsDesc',
    action: 'secure-assets',
    actionLabel: 'insightLegacyAssetsAction',
    time: 'insightLegacyAssetsTime',
  },
  {
    id: 'ai-8',
    source: 'insightFutureMessageSource',
    icon: 'fa-comments',
    color: '#8B5CF6',
    priority: 'low',
    title: 'insightFutureMessageTitle',
    description: 'insightFutureMessageDesc',
    action: 'read-message',
    actionLabel: 'insightFutureMessageAction',
    time: 'insightFutureMessageTime',
  },
];

const PRIORITY_CONFIG = {
  critical: { bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-300', badge: 'bg-rose-100 dark:bg-rose-900/30', dot: 'bg-rose-500' },
  high: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-100 dark:bg-amber-900/30', dot: 'bg-amber-500' },
  medium: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-100 dark:bg-blue-900/30', dot: 'bg-blue-500' },
  low: { bg: 'bg-gray-50 dark:bg-slate-800', border: 'border-gray-200 dark:border-slate-600', text: 'text-gray-700 dark:text-slate-300', badge: 'bg-gray-100 dark:bg-slate-700', dot: 'bg-gray-400' },
};

const FILTER_KEYS = {
  all: 'filterAll',
  critical: 'filterCritical',
  high: 'filterHigh',
  medium: 'filterMedium',
  low: 'filterLow',
} as const;

export default function AIInsightsAggregator() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>('all');
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const visible = INSIGHTS.filter(i => !dismissed.includes(i.id));
  const filtered = filter === 'all' ? visible : visible.filter(i => i.priority === filter);

  const counts = {
    all: visible.length,
    critical: visible.filter(i => i.priority === 'critical').length,
    high: visible.filter(i => i.priority === 'high').length,
    medium: visible.filter(i => i.priority === 'medium').length,
    low: visible.filter(i => i.priority === 'low').length,
  };

  const handleAction = (id: string) => {
    setActingOn(id);
    setTimeout(() => setActingOn(null), 1000);
  };

  return (
    <div className="card-psb">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <i className="fas fa-robot text-primary" /> {t('aiInsightsTitle')}
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
            {t('aiInsightsSubtitle')}
          </p>
        </div>
        <div className="px-2.5 py-1 bg-primary/10 rounded-full text-[10px] font-bold text-primary">
          {visible.length} {t('aiInsightsActive')}
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
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-200'
            }`}
          >
            {t(FILTER_KEYS[p])}
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
            const titleId = `insight-title-${insight.id}`;
            const isActing = actingOn === insight.id;
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
                      <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-800 ${cfg.dot}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${cfg.badge} ${cfg.text}`}>
                          {t(FILTER_KEYS[insight.priority]).toUpperCase()}
                        </span>
                        <span className="text-[9px] text-gray-400 dark:text-slate-500">{t(insight.source)}</span>
                        <span className="text-[9px] text-gray-300 dark:text-slate-600 ml-auto">{t(insight.time)}</span>
                      </div>
                      <h4 id={titleId} className="text-[12px] font-bold text-gray-800 dark:text-slate-200">{t(insight.title)}</h4>
                      <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed mt-0.5">{t(insight.description)}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleAction(insight.id)}
                          aria-describedby={titleId}
                          disabled={isActing}
                          className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-wait"
                        >
                          {isActing && <i className="fas fa-circle-notch fa-spin mr-1" />}
                          {t(insight.actionLabel)}
                        </button>
                        <button
                          onClick={() => setExpanded(isOpen ? null : insight.id)}
                          className="px-2 py-1.5 text-gray-400 dark:text-slate-500 text-[10px] hover:text-gray-600 transition-colors"
                        >
                          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} mr-1`} />
                          {isOpen ? t('less') : t('details')}
                        </button>
                        <button
                          onClick={() => setDismissed([...dismissed, insight.id])}
                          className="ml-auto px-2 py-1.5 text-gray-300 dark:text-slate-600 text-[10px] hover:text-gray-500 transition-colors"
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
                      <div className="pt-2 space-y-2 text-[10px] text-gray-500 dark:text-slate-400">
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
        <div className="text-center py-8 text-gray-400 dark:text-slate-500">
          <i className="fas fa-check-circle text-3xl text-green-300 dark:text-green-600 mb-2" />
          <p className="text-sm font-medium">{t('aiInsightsEmptyTitle')}</p>
          <p className="text-[11px]">{t('aiInsightsEmptySubtitle')}</p>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Share2, Link2, Server, Globe, CreditCard, Tag,
  RefreshCw, AlertTriangle, Eye, ArrowRight
} from 'lucide-react';
import { fraudService } from '@/features/admin/services/fraudService';
import { useTranslation } from '@/shared/hooks/useTranslation';
import EmptyState from '@/shared/components/EmptyState';
import type { FraudCorrelation, FraudTimeRange, FraudPriority } from '@/features/admin/lib/fraudTypes';

interface Props {
  timeRange?: FraudTimeRange;
  onViewCases: (caseIds: number[]) => void;
}

const typeIcons: Record<FraudCorrelation['type'], typeof Share2> = {
  ip: Server,
  destination: Globe,
  beneficiary: CreditCard,
  origin: Globe,
  category: Tag,
};

const typeLabels = (t: (key: string) => string): Record<FraudCorrelation['type'], string> => ({
  ip: t('fraudIntelCorrelateTypeIp'),
  destination: t('fraudIntelCorrelateTypeDestination'),
  beneficiary: t('fraudIntelCorrelateTypeBeneficiary'),
  origin: t('fraudIntelCorrelateTypeOrigin'),
  category: t('fraudIntelCorrelateTypeCategory'),
});

function severityClass(severity: FraudPriority): string {
  switch (severity) {
    case 'critical':
      return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300';
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300';
    default:
      return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300';
  }
}

export default function FraudCorrelationPanel({ timeRange = '7d', onViewCases }: Props) {
  const { t } = useTranslation();
  const [clusters, setClusters] = useState<FraudCorrelation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fraudService.getCorrelations(timeRange, 500);
      setClusters(res.clusters || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load correlations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [timeRange]);

  const stats = useMemo(() => {
    if (!clusters.length) return null;
    const covered = new Set(clusters.flatMap(c => c.caseIds));
    const avgRisk = Math.round(clusters.reduce((a, c) => a + c.avgRisk, 0) / clusters.length);
    return { clusterCount: clusters.length, coveredCount: covered.size, avgRisk };
  }, [clusters]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-500" />
            {t('fraudIntelCorrelateTitle')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('fraudIntelCorrelateSubtitle')}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('fraudIntelRefresh')}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('fraudIntelCorrelateClusters')}</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{stats.clusterCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('fraudIntelCorrelateCases')}</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{stats.coveredCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('fraudIntelCorrelateAvgRisk')}</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{stats.avgRisk}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {loading && clusters.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 h-40 animate-pulse">
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : clusters.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <EmptyState
            icon={Link2}
            title={t('fraudIntelNoCorrelations')}
            subtitle="Try widening the time window or simulating more cases."
            action={{ label: t('fraudIntelRefresh'), onClick: load }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clusters.map((cluster, idx) => {
            const TypeIcon = typeIcons[cluster.type];
            return (
              <motion.div
                key={cluster.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300">
                      <TypeIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {typeLabels(t)[cluster.type]}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${severityClass(cluster.severity)}`}>
                    {cluster.severity}
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100 truncate" title={cluster.key}>
                  {cluster.key}
                </h3>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('fraudIntelCorrelateCases')}</p>
                    <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{cluster.caseCount}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('fraudIntelCorrelateAvgRisk')}</p>
                    <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{cluster.avgRisk}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('fraudIntelCorrelateMaxRisk')}</p>
                    <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{cluster.maxRisk}</p>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-600 dark:text-slate-300">{t('fraudIntelCaseRef')}:</span>{' '}
                  {cluster.sampleRefs.join(', ')}
                </div>

                <button
                  onClick={() => onViewCases(cluster.caseIds)}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-sm font-semibold hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {t('fraudIntelCorrelateViewCases')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

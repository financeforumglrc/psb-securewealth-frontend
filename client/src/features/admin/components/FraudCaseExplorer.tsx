import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown
} from 'lucide-react';
import { statusColor, priorityColor, categoryLabel } from '@/features/admin/services/fraudService';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { FraudCase, FraudCaseFilters, FraudStatus, FraudPriority, FraudCategory } from '@/features/admin/lib/fraudTypes';

interface Props {
  cases: FraudCase[];
  loading: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number; pages: number };
  onPageChange: (page: number) => void;
  onSelectCase: (c: FraudCase) => void;
  selectedCase: FraudCase | null;
  filters: FraudCaseFilters;
  setFilters: React.Dispatch<React.SetStateAction<FraudCaseFilters>>;
}

const statuses: FraudStatus[] = ['open', 'investigating', 'escalated', 'closed', 'false_positive'];
const priorities: FraudPriority[] = ['low', 'medium', 'high', 'critical'];
const categories: FraudCategory[] = ['account_takeover', 'mule_transfer', 'card_fraud', 'phishing', 'insider', 'identity_theft', 'velocity'];

function formatAmount(c: FraudCase): string {
  const hop = c.hops?.[0];
  if (!hop) return '—';
  return `₹${hop.amount.toLocaleString('en-IN')}`;
}

export default function FraudCaseExplorer({
  cases, loading, error, pagination, onPageChange, onSelectCase, selectedCase, filters, setFilters
}: Props) {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = <K extends keyof FraudCaseFilters>(key: K, value: FraudCaseFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ limit: 25, page: 1 });
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => {
    if (['page', 'limit', 'sort', 'order'].includes(k)) return false;
    return v !== undefined && v !== '' && v !== null;
  }).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.q || ''}
            onChange={(e) => updateFilter('q', e.target.value)}
            placeholder={t('fraudIntelSearchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${
              showFilters || activeFilterCount > 0
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            {t('fraudIntelFilters')} {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('fraudIntelClear')}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800"
        >
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('fraudIntelStatus')}</label>
            <select
              value={filters.status || ''}
              onChange={(e) => updateFilter('status', (e.target.value || undefined) as FraudStatus)}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm py-2 px-2"
            >
              <option value="">{t('fraudIntelAll')}</option>
              {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('fraudIntelPriority')}</label>
            <select
              value={filters.priority || ''}
              onChange={(e) => updateFilter('priority', (e.target.value || undefined) as FraudPriority)}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm py-2 px-2"
            >
              <option value="">{t('fraudIntelAll')}</option>
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('fraudIntelCategory')}</label>
            <select
              value={filters.category || ''}
              onChange={(e) => updateFilter('category', (e.target.value || undefined) as FraudCategory)}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm py-2 px-2"
            >
              <option value="">{t('fraudIntelAll')}</option>
              {categories.map(c => <option key={c} value={c}>{categoryLabel(c)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('fraudIntelMinRisk')}</label>
            <input
              type="number"
              min={0}
              max={100}
              value={filters.minRisk ?? ''}
              onChange={(e) => updateFilter('minRisk', e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm py-2 px-2"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('fraudIntelDateFrom')}</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm py-2 px-2"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('fraudIntelDateTo')}</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm py-2 px-2"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('fraudIntelSortBy')}</label>
            <select
              value={filters.sort || 'created_at'}
              onChange={(e) => updateFilter('sort', e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm py-2 px-2"
            >
              <option value="created_at">Created</option>
              <option value="updated_at">Updated</option>
              <option value="risk_score">Risk Score</option>
              <option value="priority">Priority</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('fraudIntelOrder')}</label>
            <select
              value={filters.order || 'desc'}
              onChange={(e) => updateFilter('order', e.target.value as 'asc' | 'desc')}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm py-2 px-2"
            >
              <option value="desc">{t('fraudIntelDescending')}</option>
              <option value="asc">{t('fraudIntelAscending')}</option>
            </select>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('fraudIntelCaseRef')}</th>
                <th className="px-4 py-3 font-semibold">{t('fraudIntelStatus')}</th>
                <th className="px-4 py-3 font-semibold">{t('fraudIntelPriority')}</th>
                <th className="px-4 py-3 font-semibold">{t('fraudIntelCategory')}</th>
                <th className="px-4 py-3 font-semibold">{t('fraudIntelRisk')}</th>
                <th className="px-4 py-3 font-semibold">{t('amount')}</th>
                <th className="px-4 py-3 font-semibold">{t('fraudIntelRoute')}</th>
                <th className="px-4 py-3 font-semibold">{t('fraudIntelCreated')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && cases.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-4 py-4">
                      <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                    {t('fraudIntelNoCases')}
                  </td>
                </tr>
              ) : (
                cases.map((c) => {
                  const origin = c.hops?.find(h => h.hopType === 'origin');
                  const dest = c.hops?.slice().reverse().find(h => h.hopType === 'destination');
                  const isSelected = selectedCase?.id === c.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCase(c)}
                      className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`}
                    >
                      <td className="px-4 py-3 font-medium text-indigo-600 dark:text-indigo-400">{c.caseRef}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${statusColor(c.status)}`}>
                          {c.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${priorityColor(c.priority)}`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">{categoryLabel(c.category)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${c.riskScore >= 80 ? 'bg-red-500' : c.riskScore >= 60 ? 'bg-orange-500' : 'bg-blue-500'}`}
                              style={{ width: `${c.riskScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold">{c.riskScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatAmount(c)}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                        {origin?.country || '—'} <ArrowUpDown className="inline w-3 h-3 mx-1" /> {dest?.country || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-sm">
          <p className="text-slate-500 dark:text-slate-400">
            {t('fraudIntelShowing')} {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} {t('fraudIntelOf')} {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {t('fraudIntelPage')} {pagination.page} {t('fraudIntelOf')} {pagination.pages}
            </span>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

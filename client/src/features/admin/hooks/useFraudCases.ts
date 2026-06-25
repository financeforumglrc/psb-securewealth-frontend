import { useState, useEffect, useCallback, useMemo } from 'react';
import { fraudService } from '@/features/admin/services/fraudService';
import { generateMockCases } from '@/features/admin/lib/fraudDataGenerator';
import type { FraudCase, FraudCaseFilters, FraudStats } from '@/features/admin/lib/fraudTypes';

interface UseFraudCasesReturn {
  cases: FraudCase[];
  loading: boolean;
  error: string | null;
  filters: FraudCaseFilters;
  setFilters: React.Dispatch<React.SetStateAction<FraudCaseFilters>>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  stats: FraudStats | null;
  statsLoading: boolean;
  isLocalMock: boolean;
  mutateLocalCase: (id: number, patch: Partial<FraudCase>) => void;
}

const priorityRank: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
const statusRank: Record<string, number> = { open: 1, investigating: 2, escalated: 3, closed: 4, false_positive: 5 };

function isBackendMissingError(err: any): boolean {
  const message = String(err?.message || '').toLowerCase();
  return (
    message.includes('endpoint not found') ||
    message.includes('not found') ||
    message.includes('404') ||
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('network error')
  );
}

function getTimeRangeMs(range?: string): number | null {
  if (!range || range === 'all') return null;
  const msPerDay = 24 * 60 * 60 * 1000;
  switch (range) {
    case 'live': return 60 * 1000; // last 60 seconds
    case '7d': return 7 * msPerDay;
    case '1m': return 30 * msPerDay;
    case '1y': return 365 * msPerDay;
    case '10y': return 10 * 365 * msPerDay;
    default: return null;
  }
}

function applyLocalFilters(cases: FraudCase[], filters: FraudCaseFilters): FraudCase[] {
  let result = [...cases];

  if (filters.status) result = result.filter(c => c.status === filters.status);
  if (filters.priority) result = result.filter(c => c.priority === filters.priority);
  if (filters.category) result = result.filter(c => c.category === filters.category);
  if (filters.assignedAdminId) result = result.filter(c => c.assignedAdminId === filters.assignedAdminId);
  if (filters.userId) result = result.filter(c => c.userId === filters.userId || c.user?.id === filters.userId);
  if (filters.minRisk !== undefined) result = result.filter(c => c.riskScore >= filters.minRisk!);
  if (filters.maxRisk !== undefined) result = result.filter(c => c.riskScore <= filters.maxRisk!);
  if (filters.timeRange && filters.timeRange !== 'all') {
    const windowMs = getTimeRangeMs(filters.timeRange);
    if (windowMs !== null) {
      const cutoff = Date.now() - windowMs;
      result = result.filter(c => new Date(c.createdAt).getTime() >= cutoff);
    }
  }
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    result = result.filter(c => new Date(c.createdAt).getTime() >= from);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime();
    result = result.filter(c => new Date(c.createdAt).getTime() <= to);
  }
  if (filters.ids && filters.ids.length) {
    const idSet = new Set(filters.ids);
    result = result.filter(c => idSet.has(c.id));
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    result = result.filter(c =>
      c.caseRef.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.countryRiskTags.some(t => t.toLowerCase().includes(q)) ||
      (c.hops || []).some(h =>
        (h.country?.toLowerCase() || '').includes(q) ||
        (h.city?.toLowerCase() || '').includes(q) ||
        (h.institution?.toLowerCase() || '').includes(q) ||
        (h.entityValue?.toLowerCase() || '').includes(q)
      )
    );
  }

  const sort = filters.sort || 'created_at';
  const order = filters.order || 'desc';
  const dir = order === 'asc' ? 1 : -1;
  result.sort((a, b) => {
    if (sort === 'risk_score') return dir * (a.riskScore - b.riskScore);
    if (sort === 'priority') return dir * ((priorityRank[a.priority] || 0) - (priorityRank[b.priority] || 0));
    if (sort === 'status') return dir * ((statusRank[a.status] || 0) - (statusRank[b.status] || 0));
    if (sort === 'updated_at') return dir * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  return result;
}

function paginate(cases: FraudCase[], page: number, limit: number) {
  const total = cases.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * limit;
  return { cases: cases.slice(start, start + limit), total, pages, page: safePage, limit };
}

function computeStats(cases: FraudCase[]): FraudStats {
  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let highRiskCases = 0;
  let sanctionedCases = 0;
  let totalInrAmount = 0;

  for (const c of cases) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    byPriority[c.priority] = (byPriority[c.priority] || 0) + 1;
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    if (c.priority === 'critical' || c.riskScore >= 80) highRiskCases += 1;
    if (c.countryRiskTags.some(t => ['Russia', 'Iran', 'North Korea', 'Belize', 'Panama', 'Myanmar'].includes(t))) {
      sanctionedCases += 1;
    } else if ((c.hops || []).some(h => h.isSanctioned)) {
      sanctionedCases += 1;
    }
    const origin = (c.hops || []).find(h => h.hopType === 'origin');
    if (origin) totalInrAmount += origin.amount || 0;
  }

  return {
    totalCases: cases.length,
    byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    byPriority: Object.entries(byPriority).map(([priority, count]) => ({ priority, count })),
    byCategory: Object.entries(byCategory).map(([category, count]) => ({ category, count })),
    highRiskCases,
    sanctionedCases,
    totalInrAmount,
  };
}

export function useFraudCases(initial: FraudCaseFilters = {}): UseFraudCasesReturn {
  const [mode, setMode] = useState<'backend' | 'mock'>('backend');
  const [backendCases, setBackendCases] = useState<FraudCase[]>([]);
  const [mockCases, setMockCases] = useState<FraudCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FraudCaseFilters>({ limit: 25, page: 1, ...initial });
  const [backendPagination, setBackendPagination] = useState({ page: 1, limit: 25, total: 0, pages: 0 });
  const [backendStats, setBackendStats] = useState<FraudStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const filteredMockCases = useMemo(() => applyLocalFilters(mockCases, filters), [mockCases, filters]);
  const pagination = useMemo(() => {
    if (mode === 'mock') return paginate(filteredMockCases, filters.page || 1, filters.limit || 25);
    return backendPagination;
  }, [mode, filteredMockCases, filters.page, filters.limit, backendPagination]);

  const cases = useMemo(() => {
    if (mode === 'mock') {
      const start = (pagination.page - 1) * pagination.limit;
      return filteredMockCases.slice(start, start + pagination.limit);
    }
    return backendCases;
  }, [mode, filteredMockCases, backendCases, pagination.page, pagination.limit]);

  const stats = useMemo(() => {
    if (mode === 'mock') return computeStats(mockCases);
    if (backendStats) return backendStats;
    if (backendCases.length) return computeStats(backendCases);
    return null;
  }, [mode, mockCases, backendStats, backendCases]);

  const tryBackend = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fraudService.getCases(filters);
      setBackendCases(res.cases);
      setBackendPagination({ page: res.page, limit: res.limit, total: res.total, pages: res.pages });
      setMode('backend');
    } catch (err: any) {
      if (mode === 'mock') {
        // Keep existing mock data; do not overwrite user mutations.
        return;
      }
      if (isBackendMissingError(err)) {
        setMockCases(generateMockCases(500));
        setMode('mock');
        setError(null);
      } else {
        setError(err.message || 'Failed to load cases');
        setBackendCases([]);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, mode]);

  const loadBackend = useCallback(async () => {
    if (mode === 'mock') {
      setLoading(false);
      return;
    }
    await tryBackend();
  }, [mode, tryBackend]);

  const loadStats = useCallback(async () => {
    if (mode === 'mock') return;
    setStatsLoading(true);
    try {
      const s = await fraudService.getStats();
      setBackendStats(s);
    } catch (err: any) {
      console.error('Fraud stats error', err);
      setBackendStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    loadBackend();
  }, [loadBackend]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const setPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(async () => {
    await tryBackend();
    if (mode !== 'mock') await loadStats();
  }, [tryBackend, loadStats, mode]);

  const mutateLocalCase = useCallback((id: number, patch: Partial<FraudCase>) => {
    setMockCases(prev => prev.map(c => (c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c)));
  }, []);

  return useMemo(
    () => ({
      cases,
      loading,
      error,
      filters,
      setFilters,
      pagination,
      setPage,
      refresh,
      stats,
      statsLoading,
      isLocalMock: mode === 'mock',
      mutateLocalCase,
    }),
    [cases, loading, error, filters, pagination, setPage, refresh, stats, statsLoading, mode, mutateLocalCase]
  );
}

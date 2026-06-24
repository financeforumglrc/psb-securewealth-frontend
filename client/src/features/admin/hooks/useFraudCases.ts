import { useState, useEffect, useCallback, useMemo } from 'react';
import { fraudService } from '@/features/admin/services/fraudService';
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
}

export function useFraudCases(initial: FraudCaseFilters = {}): UseFraudCasesReturn {
  const [cases, setCases] = useState<FraudCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FraudCaseFilters>({ limit: 25, page: 1, ...initial });
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 0 });
  const [stats, setStats] = useState<FraudStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fraudService.getCases(filters);
      setCases(res.cases);
      setPagination({ page: res.page, limit: res.limit, total: res.total, pages: res.pages });
    } catch (err: any) {
      setError(err.message || 'Failed to load cases');
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const s = await fraudService.getStats();
      setStats(s);
    } catch (err: any) {
      console.error('Fraud stats error', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const setPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
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
      refresh: load,
      stats,
      statsLoading,
    }),
    [cases, loading, error, filters, pagination, setPage, load, stats, statsLoading]
  );
}

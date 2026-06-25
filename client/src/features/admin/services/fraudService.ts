import { backendApi } from '@/shared/lib/backendApi';
import type {
  FraudCase,
  FraudCaseFilters,
  FraudCasesResponse,
  FraudExportFormat,
  FraudHop,
  FraudAccount,
  FraudNote,
  FraudStats,
  FraudRule,
  FraudStatus,
  FraudPriority,
  FraudCategory,
  FraudTimeRange,
  FraudCorrelationResponse,
} from '@/features/admin/lib/fraudTypes';

function buildQueryString(filters: FraudCaseFilters & { format?: FraudExportFormat }) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const fraudService = {
  async getCases(filters: FraudCaseFilters = {}): Promise<FraudCasesResponse> {
    const res = await backendApi.fetchJson(`/fraud/cases${buildQueryString(filters)}`, { timeoutMs: 15000 });
    if (!res.ok) throw new Error(res.data?.error || 'Failed to load fraud cases');
    const data = res.data as FraudCasesResponse;
    data.cases = data.cases.map(c => ({ ...c, userName: (c as any).user_name, userEmail: (c as any).user_email }));
    return data;
  },

  async getCase(id: number): Promise<FraudCase> {
    const res = await backendApi.fetchJson(`/fraud/cases/${id}`, { timeoutMs: 10000 });
    if (!res.ok) throw new Error(res.data?.error || 'Failed to load fraud case');
    const c = (res.data as { case: FraudCase & Record<string, unknown> }).case;
    return { ...c, userName: c.user_name as string, userEmail: c.user_email as string };
  },

  async updateCase(id: number, data: Partial<FraudCase>): Promise<void> {
    const res = await backendApi.fetchJson(`/fraud/cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      timeoutMs: 10000,
    });
    if (!res.ok) throw new Error(res.data?.error || 'Failed to update case');
  },

  async deleteCase(id: number): Promise<void> {
    const res = await backendApi.fetchJson(`/fraud/cases/${id}`, {
      method: 'DELETE',
      timeoutMs: 10000,
    });
    if (!res.ok) throw new Error(res.data?.error || 'Failed to delete case');
  },

  async applyAction(id: number, action: string, note?: string): Promise<void> {
    const res = await backendApi.fetchJson(`/fraud/cases/${id}/actions`, {
      method: 'POST',
      body: JSON.stringify({ action, note }),
      timeoutMs: 10000,
    });
    if (!res.ok) throw new Error(res.data?.error || 'Failed to apply action');
  },

  async getHops(caseId: number): Promise<FraudHop[]> {
    const res = await backendApi.fetchJson(`/fraud/cases/${caseId}/hops`, { timeoutMs: 10000 });
    if (!res.ok) throw new Error(res.data?.error || 'Failed to load hops');
    return (res.data as { hops: FraudHop[] }).hops;
  },

  async getAccounts(caseId: number): Promise<FraudAccount[]> {
    const res = await backendApi.fetchJson(`/fraud/cases/${caseId}/accounts`, { timeoutMs: 10000 });
    if (!res.ok) throw new Error(res.data?.error || 'Failed to load accounts');
    return (res.data as { accounts: FraudAccount[] }).accounts;
  },

  async getNotes(caseId: number): Promise<FraudNote[]> {
    const res = await backendApi.fetchJson(`/fraud/cases/${caseId}/notes`, { timeoutMs: 10000 });
    if (!res.ok) throw new Error(res.data?.error || 'Failed to load notes');
    return (res.data as { notes: FraudNote[] }).notes;
  },

  async addNote(caseId: number, note: string): Promise<void> {
    const res = await backendApi.fetchJson(`/fraud/cases/${caseId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
      timeoutMs: 10000,
    });
    if (!res.ok) throw new Error(res.data?.error || 'Failed to add note');
  },

  async getStats(): Promise<FraudStats> {
    const res = await backendApi.fetchJson('/fraud/stats/summary', { timeoutMs: 10000 });
    if (!res.ok) throw new Error(res.data?.error || 'Failed to load stats');
    return (res.data as { stats: FraudStats }).stats;
  },

  async exportCases(format: FraudExportFormat, filters: FraudCaseFilters = {}): Promise<Blob> {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL || 'https://psb-securewealth-backend.onrender.com/api/v1'}/fraud/export/cases${buildQueryString({ ...filters, format })}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('sw-admin-token') || ''}`,
        },
      }
    );
    if (!res.ok) throw new Error('Failed to export fraud cases');
    return res.blob();
  },

  async getRules(): Promise<FraudRule[]> {
    const res = await backendApi.fetchJson('/fraud/rules', { timeoutMs: 10000 });
    if (!res.ok) throw new Error(res.data?.error || 'Failed to load rules');
    return (res.data as { rules: FraudRule[] }).rules;
  },

  async createRule(rule: Partial<FraudRule>): Promise<void> {
    const res = await backendApi.fetchJson('/fraud/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
      timeoutMs: 10000,
    });
    if (!res.ok) throw new Error(res.data?.error || 'Failed to create rule');
  },

  async updateRule(id: number, rule: Partial<FraudRule>): Promise<void> {
    const res = await backendApi.fetchJson(`/fraud/rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(rule),
      timeoutMs: 10000,
    });
    if (!res.ok) throw new Error(res.data?.error || 'Failed to update rule');
  },

  async deleteRule(id: number): Promise<void> {
    const res = await backendApi.fetchJson(`/fraud/rules/${id}`, {
      method: 'DELETE',
      timeoutMs: 10000,
    });
    if (!res.ok) throw new Error(res.data?.error || 'Failed to delete rule');
  },

  async simulateCases(count = 1): Promise<FraudCase[]> {
    const res = await backendApi.fetchJson('/fraud/simulate', {
      method: 'POST',
      body: JSON.stringify({ count }),
      timeoutMs: 30000,
    });
    if (!res.ok) throw new Error(res.data?.error || 'Failed to simulate cases');
    return (res.data as { created: FraudCase[] }).created.map(c => ({ ...c, userName: (c as any).user_name, userEmail: (c as any).user_email }));
  },

  async getLiveCases(seconds = 5): Promise<FraudCase[]> {
    const res = await backendApi.fetchJson(`/fraud/live?seconds=${seconds}`, { timeoutMs: 10000 });
    if (!res.ok) throw new Error(res.data?.error || 'Failed to load live feed');
    return (res.data as { cases: FraudCase[] }).cases.map(c => ({ ...c, userName: (c as any).user_name, userEmail: (c as any).user_email }));
  },

  async getCorrelations(timeRange?: FraudTimeRange, limit = 500): Promise<FraudCorrelationResponse> {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (timeRange) params.set('timeRange', timeRange);
    const res = await backendApi.fetchJson(`/fraud/correlations?${params.toString()}`, { timeoutMs: 15000 });
    if (!res.ok) throw new Error(res.data?.error || 'Failed to load correlations');
    return res.data as FraudCorrelationResponse;
  },
};

export function statusColor(status: FraudStatus | string): string {
  const map: Record<string, string> = {
    open: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
    investigating: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300',
    escalated: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300',
    closed: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300',
    false_positive: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  };
  return map[status] || map.open;
}

export function priorityColor(priority: FraudPriority | string): string {
  const map: Record<string, string> = {
    low: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
    medium: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300',
    critical: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300',
  };
  return map[priority] || map.medium;
}

export function categoryLabel(category: FraudCategory | string): string {
  return String(category)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

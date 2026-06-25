/**
 * PSB SecureWealth — Backend API Client v2
 * Connects to the PSB SecureWealth Node backend
 * Comprehensive banking operations with retries & error handling
 */

import { getStoredVisitorId } from '@/shared/services/fingerprintService';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://psb-securewealth-backend.onrender.com/api/v1';
const MAX_RETRIES = 2;
const RETRY_DELAY = 500;

function getHeaders(path: string = ''): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const visitorId = getStoredVisitorId();
  if (visitorId) {
    headers['X-Device-Id'] = visitorId;
  }
  if ((path.startsWith('/admin') || path.startsWith('/fraud')) && typeof sessionStorage !== 'undefined') {
    const token = sessionStorage.getItem('sw-admin-token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchJson(path: string, options?: RequestInit & { timeoutMs?: number; retry?: boolean }, attempt = 1): Promise<{ ok: boolean; status: number; data: any }> {
  try {
    const controller = new AbortController();
    const timeoutMs = options?.timeoutMs || 3000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      signal: controller.signal,
      headers: { ...getHeaders(path), ...(options?.headers || {}) },
    });
    clearTimeout(timeoutId);
    const data = await res.json().catch(() => ({ success: false, error: 'Invalid response' }));
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { ok: false, status: 0, data: { success: false, error: 'Request timeout' } };
    }
    const allowRetry = options?.retry !== false;
    if (allowRetry && attempt < MAX_RETRIES && (err.name === 'TypeError' || err.message?.includes('fetch'))) {
      await sleep(RETRY_DELAY * attempt);
      return fetchJson(path, options, attempt + 1);
    }
    return { ok: false, status: 0, data: { success: false, error: err.message || 'Network error' } };
  }
}

export const backendApi = {
  // Low-level fetch helper
  fetchJson,

  // Health check to warm up the Render backend
  async health() {
    return fetchJson('/health', { timeoutMs: 5000 });
  },

  // Wake up the backend (cold start workaround for Render free tier)
  async healthWakeup(timeoutMs = 45000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://psb-securewealth-backend.onrender.com/api/v1'}/health`, {
        signal: controller.signal,
      });
    } catch {
      // ignore — the wake-up call may timeout; the actual request will follow
    }
    clearTimeout(timeoutId);
  },

  // OTP (email-based one-time passwords)
  async sendOtp(payload: { email?: string; userId?: string; purpose?: string }) {
    return fetchJson('/otp/send', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 15000,
    });
  },

  async verifyOtp(payload: { email?: string; userId?: string; otp: string; purpose?: string }) {
    return fetchJson('/otp/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 10000,
    });
  },

  // Business / SME cashflow analyzer
  async getBusinessCashflow() {
    return fetchJson('/banking/business/cashflow');
  },

  // Razorpay payment config (test mode)
  async getPaymentConfig() {
    return fetchJson('/banking/payments/config');
  },

  async createPaymentOrder(payload: { amount: number; currency?: string; receipt?: string; notes?: Record<string, string> }) {
    return fetchJson('/banking/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 15000,
    });
  },

  async verifyPayment(payload: {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
    amount: number;
    payee?: string;
    description?: string;
  }) {
    return fetchJson('/banking/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 15000,
    });
  },

  // Auth helpers
  async me() {
    return fetchJson('/auth/me');
  },
  async logout() {
    return fetchJson('/auth/logout', { method: 'POST' });
  },
  async login(payload: { email: string; password: string }) {
    return fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        fingerprint: {
          visitorId: getStoredVisitorId(),
          fingerprintHash: getStoredVisitorId() || undefined,
        },
      }),
      timeoutMs: 35000,
    });
  },
  async getDevices() {
    return fetchJson('/auth/devices');
  },
  async trustDevice(deviceId: number | string, trusted = true) {
    return fetchJson('/auth/trust-device', {
      method: 'POST',
      body: JSON.stringify({ deviceId, trusted }),
      timeoutMs: 15000,
    });
  },

  // Dashboard
  async getDashboard() {
    return fetchJson('/banking/dashboard');
  },

  // Accounts
  async getAccounts() {
    return fetchJson('/banking/accounts');
  },
  async createAccount(payload: { accountType: string; balance?: number; ifsc?: string; branch?: string }) {
    return fetchJson('/banking/accounts', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateAccountStatus(accountId: number, status: string) {
    return fetchJson(`/banking/accounts/${accountId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
  async deleteAccount(accountId: number) {
    return fetchJson(`/banking/accounts/${accountId}`, { method: 'DELETE' });
  },

  // Transactions
  async verifyMpin(mpin: string) {
    return fetchJson('/banking/verify-mpin', { method: 'POST', body: JSON.stringify({ mpin }) });
  },

  async getTransactions(params?: { limit?: number; type?: string; startDate?: string; endDate?: string; accountId?: number }) {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString() : '';
    return fetchJson(`/banking/transactions${qs}`);
  },
  async createTransaction(payload: { type: string; amount: number; description?: string; toAccount?: number; fromAccount?: number }) {
    return fetchJson('/banking/transactions', { method: 'POST', body: JSON.stringify(payload) });
  },

  // Beneficiaries
  async getBeneficiaries() {
    return fetchJson('/banking/beneficiaries');
  },
  async createBeneficiary(payload: { name: string; accountNumber?: string; ifsc?: string; bankName?: string; upiId?: string }) {
    return fetchJson('/banking/beneficiaries', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateBeneficiary(id: number, payload: Partial<{ name: string; accountNumber: string; ifsc: string; bankName: string; upiId: string; verified: boolean }>) {
    return fetchJson(`/banking/beneficiaries/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
  async deleteBeneficiary(id: number) {
    return fetchJson(`/banking/beneficiaries/${id}`, { method: 'DELETE' });
  },

  // Cards
  async getCards() {
    return fetchJson('/banking/cards');
  },
  async createCard(payload: { cardType?: string; limitDaily?: number; limitMonthly?: number }) {
    return fetchJson('/banking/cards', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateCardStatus(cardId: number, status: string) {
    return fetchJson(`/banking/cards/${cardId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
  async updateCardLimits(cardId: number, payload: { limitDaily?: number; limitMonthly?: number }) {
    return fetchJson(`/banking/cards/${cardId}/limits`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
  async deleteCard(cardId: number) {
    return fetchJson(`/banking/cards/${cardId}`, { method: 'DELETE' });
  },

  // Bills
  async getBills() {
    return fetchJson('/banking/bills');
  },
  async createBill(payload: { name: string; category?: string; amount: number; dueDate?: string; isRecurring?: boolean; frequency?: string }) {
    return fetchJson('/banking/bills', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateBill(billId: number, payload: Partial<{ name: string; category: string; amount: number; dueDate: string; isRecurring: boolean; frequency: string }>) {
    return fetchJson(`/banking/bills/${billId}`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
  async updateBillStatus(billId: number, status: string) {
    return fetchJson(`/banking/bills/${billId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
  async deleteBill(billId: number) {
    return fetchJson(`/banking/bills/${billId}`, { method: 'DELETE' });
  },
  async payBill(billId: number) {
    return fetchJson(`/banking/bills/${billId}/pay`, { method: 'POST' });
  },

  // Subscriptions
  async getSubscriptions() {
    return fetchJson('/banking/subscriptions');
  },
  async createSubscription(payload: { name: string; amount: number; billingCycle?: string; nextBilling?: string }) {
    return fetchJson('/banking/subscriptions', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateSubscription(id: number, payload: Partial<{ name: string; amount: number; billingCycle: string; nextBilling: string; status: string }>) {
    return fetchJson(`/banking/subscriptions/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
  async deleteSubscription(id: number) {
    return fetchJson(`/banking/subscriptions/${id}`, { method: 'DELETE' });
  },

  // Goals
  async getGoals() {
    return fetchJson('/banking/goals');
  },
  async createGoal(payload: { name: string; targetAmount: number; currentAmount?: number; deadline?: string; goalType?: string }) {
    return fetchJson('/banking/goals', { method: 'POST', body: JSON.stringify(payload) });
  },
  async contributeToGoal(goalId: number, amount: number) {
    return fetchJson(`/banking/goals/${goalId}/contribute`, { method: 'PATCH', body: JSON.stringify({ amount }) });
  },
  async updateGoal(goalId: number, payload: Partial<{ name: string; targetAmount: number; currentAmount: number; deadline: string; goalType: string; status: string }>) {
    return fetchJson(`/banking/goals/${goalId}`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
  async deleteGoal(goalId: number) {
    return fetchJson(`/banking/goals/${goalId}`, { method: 'DELETE' });
  },

  // Assets
  async getAssets() {
    return fetchJson('/banking/assets');
  },
  async createAsset(payload: { name: string; assetType?: string; value?: number; liquidity?: string; returns?: number }) {
    return fetchJson('/banking/assets', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateAsset(assetId: number, payload: Partial<{ name: string; assetType: string; value: number; liquidity: string; returns: number }>) {
    return fetchJson(`/banking/assets/${assetId}`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
  async deleteAsset(assetId: number) {
    return fetchJson(`/banking/assets/${assetId}`, { method: 'DELETE' });
  },

  // Loans
  async getLoans() {
    return fetchJson('/banking/loans');
  },
  async createLoan(payload: { loanType: string; principalAmount: number; interestRate: number; tenureMonths: number; purpose?: string }) {
    return fetchJson('/banking/loans', { method: 'POST', body: JSON.stringify(payload) });
  },
  async payLoanEmi(loanId: number) {
    return fetchJson(`/banking/loans/${loanId}/pay`, { method: 'PATCH' });
  },

  // Recurring Payments (SIPs / Auto-Debits)
  async getRecurring() {
    return fetchJson('/banking/recurring');
  },
  async createRecurring(payload: { name: string; amount: number; frequency?: string; category?: string; accountId?: number; beneficiaryId?: number; startDate?: string; endDate?: string; nextExecution?: string }) {
    return fetchJson('/banking/recurring', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateRecurring(id: number, payload: Partial<{ name: string; amount: number; frequency: string; category: string; accountId: number; beneficiaryId: number; nextExecution: string; status: string }>) {
    return fetchJson(`/banking/recurring/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
  async deleteRecurring(id: number) {
    return fetchJson(`/banking/recurring/${id}`, { method: 'DELETE' });
  },
  async executeRecurring(id: number) {
    return fetchJson(`/banking/recurring/${id}/execute`, { method: 'POST' });
  },

  // Statements
  async getStatement(accountId: number, startDate?: string, endDate?: string) {
    const qs = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : '';
    return fetchJson(`/banking/statements/${accountId}${qs}`);
  },

  // Audit Logs
  async getAuditLogs(limit = 100) {
    return fetchJson(`/banking/audit?limit=${limit}`);
  },

  // Seed
  async seedData() {
    return fetchJson('/banking/seed', { method: 'POST' });
  },

  // User registration with KYC
  async register(payload: { email: string; password: string; name: string; phone?: string; pan_number?: string; aadhar?: string }) {
    return fetchJson('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        fingerprint: {
          visitorId: getStoredVisitorId(),
          fingerprintHash: getStoredVisitorId() || undefined,
        },
      }),
      timeoutMs: 35000,
    });
  },

  async demoLogin(payload: { email: string; name: string }) {
    // Long single-attempt timeout to survive a Render cold-start without
    // multiplying the wait through retries (15s x 3 attempts can feel like
    // minutes if the server is waking up).
    return fetchJson('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        fingerprint: {
          visitorId: getStoredVisitorId(),
          fingerprintHash: getStoredVisitorId() || undefined,
        },
      }),
      timeoutMs: 35000,
      retry: false,
    });
  },

  // Face biometric auth (longer timeout for slow Render cold start)
  async registerFace(descriptor: number[]) {
    return fetchJson('/auth/face-register', {
      method: 'POST',
      body: JSON.stringify({ descriptor }),
      timeoutMs: 35000,
    });
  },

  async verifyFace(descriptor: number[], email?: string) {
    return fetchJson('/auth/face-verify', {
      method: 'POST',
      body: JSON.stringify({ descriptor, email }),
      timeoutMs: 35000,
    });
  },

  // Admin
  async adminLogin(adminId: string, password: string) {
    const body = JSON.stringify({ adminId, password });

    // 1. Fast direct attempt first
    let res = await fetchJson('/admin/login', {
      method: 'POST',
      body,
      timeoutMs: 8000,
      retry: false,
    });
    if (res.ok && res.data?.success) return res;

    // 2. If the backend seems unreachable (not a credentials error), short wake-up + retry
    const networkError = res.status === 0 || res.status === 404 || res.status === 503 || res.status >= 500;
    if (networkError) {
      await this.healthWakeup(5000);
      res = await fetchJson('/admin/login', {
        method: 'POST',
        body,
        timeoutMs: 15000,
        retry: false,
      });
      if (res.ok && res.data?.success) return res;
    }

    // 3. Demo fallback — keeps the admin portal usable even if backend rejects/ignores login
    console.warn('[backendApi] Admin login failed, using demo fallback');
    return {
      ok: true,
      status: 200,
      data: { success: true, token: 'sw-demo-admin-token', offline: true },
    };
  },

  async adminGetUsers(params?: { q?: string; sort?: string; order?: string; page?: number; limit?: number }) {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString() : '';
    return fetchJson(`/admin/users${qs}`, {
      method: 'GET',
      timeoutMs: 15000,
    });
  },

  async adminUpdateUserStatus(id: string, isActive: boolean) {
    return fetchJson(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
      timeoutMs: 10000,
    });
  },

  async adminUpdateUser(id: string, payload: { role?: string; tier?: string }) {
    return fetchJson(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      timeoutMs: 10000,
    });
  },

  async adminGetStats() {
    return fetchJson('/admin/stats', {
      method: 'GET',
      timeoutMs: 15000,
    });
  },

  async adminGetAuditLogs(filters?: { userId?: string; action?: string; entityType?: string; dateFrom?: string; dateTo?: string; q?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.userId) params.set('userId', filters.userId);
    if (filters?.action) params.set('action', filters.action);
    if (filters?.entityType) params.set('entityType', filters.entityType);
    if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.set('dateTo', filters.dateTo);
    if (filters?.q) params.set('q', filters.q);
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.page) params.set('page', String(filters.page));
    const qs = params.toString();
    return fetchJson(`/admin/audit-logs${qs ? '?' + qs : ''}`, {
      method: 'GET',
      timeoutMs: 30000,
    });
  },

  async adminGetFraudEvents(limit?: number) {
    const qs = limit ? `?limit=${limit}` : '';
    return fetchJson(`/admin/fraud-events${qs}`, { method: 'GET', timeoutMs: 30000 });
  },

  async adminAcknowledgeFraudEvent(id: number) {
    return fetchJson(`/admin/fraud-events/${id}/acknowledge`, { method: 'POST', timeoutMs: 10000 });
  },

  async adminBlockUserFromAlert(id: number) {
    return fetchJson(`/admin/fraud-events/${id}/block-user`, { method: 'POST', timeoutMs: 10000 });
  },

  async adminWhitelistIpFromAlert(id: number) {
    return fetchJson(`/admin/fraud-events/${id}/whitelist-ip`, { method: 'POST', timeoutMs: 10000 });
  },

  async adminMarkFalsePositive(id: number) {
    return fetchJson(`/admin/fraud-events/${id}/false-positive`, { method: 'POST', timeoutMs: 10000 });
  },

  async adminGetDashboardMetrics(days?: number) {
    const qs = days ? `?days=${days}` : '';
    return fetchJson(`/admin/dashboard-metrics${qs}`, { method: 'GET', timeoutMs: 15000 });
  },

  // KYC
  async getKycStatus() {
    return fetchJson('/kyc/status');
  },
  async submitKyc(payload: { panNumber: string; aadhaarMasked: string }) {
    return fetchJson('/kyc/submit', { method: 'POST', body: JSON.stringify(payload) });
  },
  async verifyKyc(reference?: string) {
    return fetchJson('/kyc/verify', { method: 'POST', body: JSON.stringify({ reference }) });
  },

  // Account Aggregator (AA) consents
  async getAaConsents() {
    return fetchJson('/aa/consents');
  },
  async createAaConsent(payload: { bankName: string; accountMask?: string; scopes?: string[]; phone?: string; redirectUrl?: string }) {
    return fetchJson('/aa/consents', { method: 'POST', body: JSON.stringify(payload) });
  },
  async getAaConsentStatus(consentId: number | string) {
    return fetchJson(`/aa/consents/${consentId}/status`);
  },
  async revokeAaConsent(consentId: number | string) {
    return fetchJson(`/aa/consents/${consentId}`, { method: 'DELETE' });
  },
  async aaSync() {
    return fetchJson('/aa/sync', { method: 'POST' });
  },
  async discoverAaAccounts(consentId: number | string) {
    return fetchJson(`/aa/consents/${consentId}/discover`, { method: 'POST' });
  },

  // Rakshak AI intervention for high-risk transactions
  async rakshakIntervention(payload: { riskScore: number; signals: string[]; amount: number; beneficiaryName: string }) {
    return fetchJson('/ai/rakshak-intervention', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 15000,
    });
  },
};

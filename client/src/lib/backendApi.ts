/**
 * PSB SecureWealth — Backend API Client v2
 * Connects to the DS Financial backend (localhost:5000)
 * Comprehensive banking operations with retries & error handling
 */

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://psb-banking-backend.onrender.com/api/v1';
const MAX_RETRIES = 2;
const RETRY_DELAY = 500;

function getHeaders(): Record<string, string> {
  const user = JSON.parse(localStorage.getItem('sw-user') || '{}');
  const email = user?.email || localStorage.getItem('sw-dev-email') || 'guest@psbwealth.in';
  return {
    'Content-Type': 'application/json',
    'X-Dev-User-Email': email,
  };
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchJson(path: string, options?: RequestInit, attempt = 1): Promise<{ ok: boolean; status: number; data: any }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { ...getHeaders(), ...(options?.headers || {}) },
    });
    clearTimeout(timeoutId);
    const data = await res.json().catch(() => ({ success: false, error: 'Invalid response' }));
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { ok: false, status: 0, data: { success: false, error: 'Request timeout' } };
    }
    if (attempt < MAX_RETRIES && (err.name === 'TypeError' || err.message?.includes('fetch'))) {
      await sleep(RETRY_DELAY * attempt);
      return fetchJson(path, options, attempt + 1);
    }
    return { ok: false, status: 0, data: { success: false, error: err.message || 'Network error' } };
  }
}

export const backendApi = {
  // Auth helpers
  setDevEmail(email: string) {
    localStorage.setItem('sw-dev-email', email);
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

  // Face biometric auth
  async registerFace(descriptor: number[]) {
    return fetchJson('/auth/face-register', {
      method: 'POST',
      body: JSON.stringify({ descriptor }),
    });
  },

  async verifyFace(descriptor: number[], email?: string) {
    return fetchJson('/auth/face-verify', {
      method: 'POST',
      body: JSON.stringify({ descriptor, email }),
    });
  },
};

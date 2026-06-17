/**
 * PSB SecureWealth — Protection API Client
 * Talks to the FastAPI microservice (local dev proxy or deployed service).
 */

const API_BASE = import.meta.env.VITE_PROTECTION_API_URL || '/protection';

async function fetchJson(path: string, options?: RequestInit & { timeoutMs?: number }): Promise<{ ok: boolean; status: number; data: any }> {
  try {
    const controller = new AbortController();
    const timeoutMs = options?.timeoutMs || 4000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({ success: false, error: 'Invalid response' }));
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { ok: false, status: 0, data: { success: false, error: 'Request timeout' } };
    }
    return { ok: false, status: 0, data: { success: false, error: err.message || 'Network error' } };
  }
}

export interface ProtectionRequest {
  user_id: string;
  amount: number;
  historical_avg_amount?: number;
  seconds_since_login?: number;
  is_trusted_device?: boolean;
  otp_attempts?: number;
  is_first_time_investment?: boolean;
  retry_count?: number;
  behavioral_deviation?: number;
  graph_risk_bonus?: number;
}

export interface ProtectionResponse {
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  action: 'ALLOW' | 'WARN_COOL_OFF' | 'BLOCK';
  explainable_factors: string[];
  user_message: string;
  reference_id: string;
}

export interface GraphRiskRequest {
  user_id: string;
  payee: string;
  device_fingerprint?: string;
}

export interface GraphRiskResponse {
  linked_to_fraud_device: boolean;
  ring_size: number;
  risk_bonus: number;
  reason: string;
}

export interface BiometricRiskRequest {
  deviation: number;
}

export interface BiometricRiskResponse {
  risk_bonus: number;
  anomaly: 'none' | 'low' | 'high';
  reason: string;
}

export interface AAFetchItem {
  bank: string;
  type: string;
  amount: string;
  icon: string;
}

export interface AAFetchResponse {
  steps: AAFetchItem[];
  total_net_worth: string;
  message: string;
}

export interface GuardianMessageRequest {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  action: 'ALLOW' | 'WARN_COOL_OFF' | 'BLOCK';
  factors: string[];
  amount: number;
  payee?: string;
}

export interface GuardianMessageResponse {
  message: string;
  source: 'llm' | 'template';
}

export const protectionApi = {
  async health() {
    return fetchJson('/health', { timeoutMs: 3000 });
  },

  async evaluateTransaction(payload: ProtectionRequest) {
    return fetchJson('/api/v1/protect-wealth-action', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 5000,
    });
  },

  async graphRisk(payload: GraphRiskRequest) {
    return fetchJson('/api/v1/graph-risk', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 4000,
    });
  },

  async biometricRisk(payload: BiometricRiskRequest) {
    return fetchJson('/api/v1/biometric-risk', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 3000,
    });
  },

  async fetchAA(persona?: string) {
    const query = persona ? `?persona=${encodeURIComponent(persona)}` : '';
    return fetchJson(`/api/v1/aa/fetch${query}`, { timeoutMs: 5000 });
  },

  async guardianMessage(payload: GuardianMessageRequest) {
    return fetchJson('/api/v1/guardian-message', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 4000,
    });
  },
};

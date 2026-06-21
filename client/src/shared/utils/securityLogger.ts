export interface SecurityLogEntry {
  id: string;
  timestamp: string;
  category: 'Security Beast' | 'eBPF' | 'Honeytoken' | 'Passkey' | 'PQ-Crypto' | 'Biometrics' | 'DID' | 'Trap' | 'Enclave' | 'Blockchain' | 'TPM' | 'Duress' | 'Anti-Scam' | 'Voice';
  action: string;
  severity: 'info' | 'warning' | 'critical';
  details: string;
  metadata?: Record<string, unknown>;
}

const SECURITY_LOG_KEY = 'sw_security_logs';

export function logSecurityEvent(
  category: SecurityLogEntry['category'],
  action: string,
  severity: SecurityLogEntry['severity'],
  details: string,
  metadata?: Record<string, unknown>
): SecurityLogEntry {
  const entry: SecurityLogEntry = {
    id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    category,
    action,
    severity,
    details,
    metadata,
  };
  try {
    const existing = JSON.parse(localStorage.getItem(SECURITY_LOG_KEY) || '[]');
    existing.unshift(entry);
    localStorage.setItem(SECURITY_LOG_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch { /* noop */ }
  return entry;
}

export function getSecurityLogs(): SecurityLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(SECURITY_LOG_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearSecurityLogs() {
  localStorage.removeItem(SECURITY_LOG_KEY);
}

export function exportSecurityLogs(): string {
  return JSON.stringify(getSecurityLogs(), null, 2);
}

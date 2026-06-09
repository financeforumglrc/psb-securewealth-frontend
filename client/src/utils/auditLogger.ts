import type { RiskSignals, ProtectionDecision, AuditLog } from '../types';

const AUDIT_KEY = 'sw_audit_logs';

export function logAudit(
  action: string,
  signals: RiskSignals,
  score: number,
  decision: ProtectionDecision,
  userId = 'user-001'
): AuditLog {
  const entry: AuditLog = {
    timestamp: new Date().toISOString(),
    action,
    signals,
    score,
    decision,
    userId,
  };
  try {
    const existing = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
    existing.unshift(entry);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(existing.slice(0, 100)));
  } catch { /* noop */ }
  return entry;
}

export function getAuditLogs(): AuditLog[] {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
  } catch {
    return [];
  }
}

export function exportAuditLogs(): string {
  const logs = getAuditLogs();
  return JSON.stringify(logs, null, 2);
}

export function logEmergencyLockdown(userId = 'user-001') {
  const entry: AuditLog = {
    timestamp: new Date().toISOString(),
    action: 'Emergency lockdown activated by user',
    signals: { newDevice: true, rushedAction: true, unusualAmount: false, otpRetries: false, firstTimeInvest: false, abnormalBehavior: true },
    score: 100,
    decision: {
      level: 'HIGH',
      action: 'BLOCK',
      message: 'Emergency lockdown triggered. All transactions blocked. Emergency contact notified.',
      referenceId: `EMRG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    },
    userId,
  };
  try {
    const existing = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
    existing.unshift(entry);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(existing.slice(0, 100)));
  } catch { /* noop */ }
  return entry;
}

export function clearAuditLogs() {
  localStorage.removeItem(AUDIT_KEY);
}

import { backendApi } from '@/shared/lib/backendApi';
import { adminActivityService } from './adminActivityService';

export type AlertStatus = 'open' | 'acknowledged' | 'blocked' | 'whitelisted' | 'false_positive';

export interface AlertEvent {
  id: number;
  type: 'fraud' | 'security' | 'system' | 'compliance';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  status: AlertStatus;
  eventData?: any;
}

const MOCK_ALERTS: AlertEvent[] = [
  {
    id: -1,
    type: 'fraud',
    severity: 'critical',
    title: 'High-Risk Login Blocked',
    message: 'Credential stuffing attack from Lagos, Nigeria was automatically blocked for user Rikshita Barua.',
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    acknowledged: false,
    status: 'open',
    eventData: { riskScore: 96, location: { city: 'Lagos', country: 'Nigeria' }, action: 'LOGIN_BLOCKED' },
  },
  {
    id: -2,
    type: 'security',
    severity: 'critical',
    title: 'Device Spoofing Detected',
    message: 'A login attempt using a jailbroken emulator was rejected for Deepanshu Sharma.',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    acknowledged: false,
    status: 'open',
    eventData: { riskScore: 91, location: { city: 'Delhi', country: 'India' }, action: 'DEVICE_SPOOF' },
  },
  {
    id: -3,
    type: 'fraud',
    severity: 'critical',
    title: 'Suspicious Withdrawal Blocked',
    message: '₹ 2,50,000 withdrawal to a new beneficiary was blocked pending MFA for Mrigesh Mohanty.',
    timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    acknowledged: false,
    status: 'open',
    eventData: { riskScore: 88, location: { city: 'Mumbai', country: 'India' }, action: 'WITHDRAWAL_BLOCKED', amount: 250000 },
  },
  {
    id: -4,
    type: 'security',
    severity: 'warning',
    title: 'Geo-Location Anomaly',
    message: 'Login from an unusual location (Singapore) detected for Ishita Anand.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    acknowledged: false,
    status: 'open',
    eventData: { riskScore: 72, location: { city: 'Singapore', country: 'Singapore' }, action: 'GEO_ANOMALY' },
  },
  {
    id: -5,
    type: 'fraud',
    severity: 'warning',
    title: 'Large Transfer Flagged',
    message: 'A high-value UPI transfer of ₹ 85,000 was flagged for manual review for Tripti Jain.',
    timestamp: new Date(Date.now() - 1000 * 60 * 62).toISOString(),
    acknowledged: false,
    status: 'open',
    eventData: { riskScore: 68, location: { city: 'Bangalore', country: 'India' }, action: 'TRANSFER_FLAGGED', amount: 85000 },
  },
  {
    id: -6,
    type: 'security',
    severity: 'warning',
    title: 'New Device Login',
    message: 'Kunal Saxena logged in from a new Android device for the first time.',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    acknowledged: false,
    status: 'open',
    eventData: { riskScore: 55, location: { city: 'Hyderabad', country: 'India' }, action: 'NEW_DEVICE' },
  },
  {
    id: -7,
    type: 'compliance',
    severity: 'warning',
    title: 'KYC Document Expiring',
    message: 'PAN card on file for Rikshita Barua expires in 7 days.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    acknowledged: false,
    status: 'open',
    eventData: { riskScore: 42, location: { city: 'Chennai', country: 'India' }, action: 'KYC_EXPIRY' },
  },
  {
    id: -8,
    type: 'system',
    severity: 'info',
    title: 'System Backup Completed',
    message: 'Daily encrypted backup completed successfully with zero failures.',
    timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    acknowledged: false,
    status: 'open',
    eventData: { riskScore: 12, location: { city: 'Mumbai', country: 'India' }, action: 'BACKUP_OK' },
  },
  {
    id: -9,
    type: 'security',
    severity: 'info',
    title: 'Two-Factor Authentication Enabled',
    message: 'Deepanshu Sharma enabled biometric + FIDO2 passkey authentication.',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    acknowledged: false,
    status: 'open',
    eventData: { riskScore: 8, location: { city: 'Delhi', country: 'India' }, action: 'MFA_ENABLED' },
  },
  {
    id: -10,
    type: 'compliance',
    severity: 'info',
    title: 'Audit Log Exported',
    message: 'Admin exported the last 30 days of audit logs for RBI compliance review.',
    timestamp: new Date(Date.now() - 1000 * 60 * 220).toISOString(),
    acknowledged: false,
    status: 'open',
    eventData: { riskScore: 5, location: { city: 'Kolkata', country: 'India' }, action: 'AUDIT_EXPORT' },
  },
  {
    id: -11,
    type: 'fraud',
    severity: 'critical',
    title: 'Phishing Link Intercepted',
    message: 'A fraudulent payment link shared via SMS was intercepted before user action.',
    timestamp: new Date(Date.now() - 1000 * 60 * 260).toISOString(),
    acknowledged: false,
    status: 'open',
    eventData: { riskScore: 94, location: { city: 'Pune', country: 'India' }, action: 'PHISHING_BLOCKED' },
  },
  {
    id: -12,
    type: 'security',
    severity: 'warning',
    title: 'Behavioral Biometric Deviation',
    message: 'Typing cadence and swipe pattern deviated from baseline for Mrigesh Mohanty.',
    timestamp: new Date(Date.now() - 1000 * 60 * 310).toISOString(),
    acknowledged: false,
    status: 'open',
    eventData: { riskScore: 61, location: { city: 'Mumbai', country: 'India' }, action: 'BEHAVIORAL_ANOMALY' },
  },
];

type AlertListener = (alerts: AlertEvent[]) => void;

function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

function sendDesktopNotification(title: string, message: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body: message, icon: '/favicon.svg' });
  } else if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

class AlertService {
  private alerts: AlertEvent[] = [];
  private listeners: Set<AlertListener> = new Set();
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private lastId = 0;
  private soundEnabled = true;
  private desktopEnabled = true;
  private mockSeeded = false;

  constructor() {
    this.seedMockAlerts();
  }

  private seedMockAlerts() {
    if (this.mockSeeded) return;
    this.mockSeeded = true;
    // Always keep realistic demo alerts so the SOC never looks empty.
    // Real backend events (positive IDs) are merged on top as they arrive.
    this.alerts = [...MOCK_ALERTS].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    this.notify();
  }

  subscribe(listener: AlertListener) {
    this.listeners.add(listener);
    listener(this.alerts);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l([...this.alerts]));
  }

  startPolling(intervalMs = 15000) {
    if (this.pollingInterval) return;
    this.poll();
    this.pollingInterval = setInterval(() => this.poll(), intervalMs);
  }

  stopPolling() {
    if (this.pollingInterval) { clearInterval(this.pollingInterval); this.pollingInterval = null; }
  }

  toggleSound() { this.soundEnabled = !this.soundEnabled; return this.soundEnabled; }
  toggleDesktop() { this.desktopEnabled = !this.desktopEnabled; return this.desktopEnabled; }
  getSettings() { return { soundEnabled: this.soundEnabled, desktopEnabled: this.desktopEnabled }; }

  getAlerts() { return [...this.alerts]; }

  private async poll() {
    try {
      const res = await backendApi.adminGetFraudEvents(20);
      if (!res.ok || !res.data?.events) return;
      const maxRisk = Math.max(...res.data.events.map((e: any) => e.riskScore || 0), 0);
      const events: AlertEvent[] = res.data.events.map((e: any) => ({
        id: e.id,
        type: e.riskScore >= 80 ? 'fraud' : e.riskScore >= 50 ? 'security' : 'system',
        severity: e.riskScore >= 80 ? 'critical' : e.riskScore >= 50 ? 'warning' : 'info',
        title: e.riskScore >= 80 ? 'Fraud Attempt Blocked' : e.riskScore >= 50 ? 'Suspicious Activity' : 'System Event',
        message: `${e.entity_type} ${e.action} from ${e.location?.city || 'unknown location'} — ${e.user_name || 'Unknown user'}`,
        timestamp: e.created_at,
        acknowledged: false,
        status: 'open',
        eventData: e,
      }));
      const newEvents = events.filter(e => e.id > this.lastId);
      if (newEvents.length > 0) {
        this.alerts = [...newEvents, ...this.alerts].slice(0, 200);
        this.lastId = Math.max(...events.map(e => e.id));
        this.notify();
        const hasCritical = newEvents.some(e => e.severity === 'critical');
        if (hasCritical) {
          if (this.soundEnabled) playAlertSound();
          if (this.desktopEnabled && maxRisk >= 80) {
            sendDesktopNotification('🚨 Fraud Alert', `${newEvents.filter(e => e.severity === 'critical').length} critical events detected`);
          }
        }
      }
    } catch {}
  }

  updateStatus(id: number, status: AlertStatus) {
    const alert = this.alerts.find(a => a.id === id);
    if (!alert) return;
    alert.status = status;
    if (status !== 'open') alert.acknowledged = true;
    this.notify();
  }

  acknowledge(id: number) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      this.updateStatus(id, 'acknowledged');
      adminActivityService.log('Acknowledge Alert', `ALT-${String(id).padStart(4, '0')}`, alert.title);
      if (id > 0) {
        backendApi.adminAcknowledgeFraudEvent(id).catch(() => {});
      }
    }
  }

  acknowledgeAll() {
    const count = this.alerts.filter(a => !a.acknowledged).length;
    this.alerts.forEach(a => { a.acknowledged = true; if (a.status === 'open') a.status = 'acknowledged'; });
    this.notify();
    if (count > 0) adminActivityService.log('Acknowledge All', `${count} alerts`, 'Bulk acknowledge');
  }

  blockUser(id: number) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.status = 'blocked';
      alert.acknowledged = true;
      if (alert.eventData) alert.eventData.blockedAt = new Date().toISOString();
      this.notify();
      adminActivityService.log('Block User', `ALT-${String(id).padStart(4, '0')}`, alert.title);
      if (id > 0) {
        backendApi.adminBlockUserFromAlert(id).catch(() => {});
      }
    }
  }

  whitelistIp(id: number) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.status = 'whitelisted';
      alert.acknowledged = true;
      if (alert.eventData) alert.eventData.whitelistedAt = new Date().toISOString();
      this.notify();
      adminActivityService.log('Whitelist IP', `ALT-${String(id).padStart(4, '0')}`, alert.title);
      if (id > 0) {
        backendApi.adminWhitelistIpFromAlert(id).catch(() => {});
      }
    }
  }

  markFalsePositive(id: number) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.status = 'false_positive';
      alert.acknowledged = true;
      if (alert.eventData) alert.eventData.falsePositive = true;
      this.notify();
      adminActivityService.log('Mark False Positive', `ALT-${String(id).padStart(4, '0')}`, alert.title);
      if (id > 0) {
        backendApi.adminMarkFalsePositive(id).catch(() => {});
      }
    }
  }

  clearAll() {
    const count = this.alerts.length;
    this.alerts = [];
    this.lastId = 0;
    this.notify();
    if (count > 0) adminActivityService.log('Clear All Alerts', `${count} alerts`, 'Cleared alert feed');
  }

  get unreadCount() {
    return this.alerts.filter(a => !a.acknowledged).length;
  }

  get counts() {
    return {
      total: this.alerts.length,
      critical: this.alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
      unread: this.alerts.filter(a => !a.acknowledged).length,
      fraud: this.alerts.filter(a => a.type === 'fraud').length,
      security: this.alerts.filter(a => a.type === 'security').length,
    };
  }
}

export const alertService = new AlertService();
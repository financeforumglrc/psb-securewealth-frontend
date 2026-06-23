import { backendApi } from '@/shared/lib/backendApi';

export interface AlertEvent {
  id: number;
  type: 'fraud' | 'security' | 'system' | 'compliance';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  eventData?: any;
}

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

  acknowledge(id: number) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) { alert.acknowledged = true; this.notify(); }
  }

  acknowledgeAll() {
    this.alerts.forEach(a => a.acknowledged = true);
    this.notify();
  }

  clearAll() {
    this.alerts = [];
    this.lastId = 0;
    this.notify();
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
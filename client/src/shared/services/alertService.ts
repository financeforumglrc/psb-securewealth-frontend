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

class AlertService {
  private alerts: AlertEvent[] = [];
  private listeners: Set<AlertListener> = new Set();
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private lastId = 0;

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

  private async poll() {
    try {
      const res = await backendApi.adminGetFraudEvents(20);
      if (!res.ok || !res.data?.events) return;
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
        this.alerts = [...newEvents, ...this.alerts].slice(0, 100);
        this.lastId = Math.max(...events.map(e => e.id));
        this.notify();
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

  get unreadCount() {
    return this.alerts.filter(a => !a.acknowledged).length;
  }
}

export const alertService = new AlertService();
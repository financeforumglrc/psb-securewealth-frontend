/* ═══════════════════════════════════════════════════════════════
   BROWSER THREAT SURFACE MONITOR — Real browser security events
   Replaces fictional eBPF monitor with observable browser threats:
   CSP violations, devtools open detection, suspicious global access,
   and extension fingerprinting.
   ═══════════════════════════════════════════════════════════════ */

export interface BrowserThreatEvent {
  id: string;
  timestamp: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export type ThreatListener = (event: BrowserThreatEvent) => void;

class BrowserThreatMonitor {
  private listeners: ThreatListener[] = [];
  private events: BrowserThreatEvent[] = [];
  private cleanupFns: Array<() => void> = [];
  private devtoolsOpen = false;
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  addListener(listener: ThreatListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(event: BrowserThreatEvent) {
    this.events.unshift(event);
    this.listeners.forEach((l) => l(event));
  }

  start() {
    if (typeof window === 'undefined') return;

    // CSP / security policy violations
    const onCsp = (e: SecurityPolicyViolationEvent) => {
      this.emit({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        message: `CSP violation: blocked ${e.blockedURI} via ${e.violatedDirective}`,
        severity: 'warning',
      });
    };
    document.addEventListener('securitypolicyviolation', onCsp);
    this.cleanupFns.push(() => document.removeEventListener('securitypolicyviolation', onCsp));

    // Errors that may indicate injection / MITM
    const onError = (e: ErrorEvent) => {
      if (!e.message) return;
      const msg = e.message.toLowerCase();
      if (
        msg.includes('integrity') ||
        msg.includes('script error') ||
        msg.includes('content security policy')
      ) {
        this.emit({
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          message: `Script integrity / CSP error: ${e.message.slice(0, 80)}`,
          severity: 'warning',
        });
      }
    };
    window.addEventListener('error', onError);
    this.cleanupFns.push(() => window.removeEventListener('error', onError));

    // DevTools detection via console debug trigger
    const checkDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      const open = widthThreshold || heightThreshold;
      if (open && !this.devtoolsOpen) {
        this.devtoolsOpen = true;
        this.emit({
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          message: 'Developer tools opened — potential inspection',
          severity: 'info',
        });
      } else if (!open && this.devtoolsOpen) {
        this.devtoolsOpen = false;
      }
    };
    this.checkInterval = setInterval(checkDevTools, 2000);
    this.cleanupFns.push(() => {
      if (this.checkInterval) clearInterval(this.checkInterval);
    });

    // Extension fingerprinting (looks for common extension globals)
    const suspiciousGlobals = [
      'ethereum', '__VUE__', '__REACT__', 'ng', 'Mousetrap',
    ];
    const found = suspiciousGlobals.filter((g) => g in window);
    if (found.length > 0) {
      this.emit({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        message: `Browser extensions detected: ${found.join(', ')}`,
        severity: 'info',
      });
    }
  }

  stop() {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
  }

  getEvents(): BrowserThreatEvent[] {
    return [...this.events];
  }
}

export const browserThreatMonitor = new BrowserThreatMonitor();

import { useState, useCallback, useEffect } from 'react';
import { useSecurityActions } from '../../context/SecurityContext';

interface EbpfEvent {
  id: string;
  timestamp: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

const INITIAL_EVENTS: EbpfEvent[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toLocaleTimeString(),
    message: "Blocked process 'suspicious.exe' from reading /proc/mem",
    severity: 'warning',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString(),
    message: 'Prevented ptrace attach on banking process',
    severity: 'info',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString(),
    message: 'Dropped packet to known C2 server 185.220.101.x',
    severity: 'critical',
  },
];

export default function EbpfMonitor() {
  const { ebpfAlert } = useSecurityActions();
  const [events, setEvents] = useState<EbpfEvent[]>(INITIAL_EVENTS);
  const [showOverlay, setShowOverlay] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const addEvent = useCallback((message: string, severity: EbpfEvent['severity']) => {
    const event: EbpfEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      severity,
    };
    setEvents((prev) => [event, ...prev]);
  }, []);

  const handleSimulateAttack = useCallback(() => {
    const alertMessage = 'eBPF: REVERSE SHELL DETECTED — process /tmp/.x11-helper';
    addEvent(alertMessage, 'critical');
    ebpfAlert(alertMessage);
    setShowOverlay(true);
    setCountdown(3);
  }, [addEvent, ebpfAlert]);

  useEffect(() => {
    if (!showOverlay) return;
    if (countdown <= 0) {
      window.location.reload();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [showOverlay, countdown]);

  const severityIcon = (severity: EbpfEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return <i className="fas fa-skull-crossbones text-rose-500" />;
      case 'warning':
        return <i className="fas fa-exclamation-triangle text-amber-500" />;
      case 'info':
      default:
        return <i className="fas fa-info-circle text-blue-500" />;
    }
  };

  const severityBorder = (severity: EbpfEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-l-rose-500';
      case 'warning':
        return 'border-l-amber-500';
      case 'info':
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <i className="fas fa-shield-halved text-lg text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              eBPF Runtime Monitor
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kernel-level security event stream
            </p>
          </div>
        </div>
        <button
          onClick={handleSimulateAttack}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
        >
          <i className="fas fa-bug" />
          Simulate Kernel Attack
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {events.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
            No eBPF events recorded yet.
          </p>
        )}
        {events.map((event) => (
          <div
            key={event.id}
            className={`flex items-start gap-3 rounded-lg border-l-4 bg-slate-50 p-3 dark:bg-slate-900/50 ${severityBorder(event.severity)}`}
          >
            <div className="mt-0.5">{severityIcon(event.severity)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800 dark:text-slate-200">{event.message}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                {event.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showOverlay && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl bg-slate-900/95 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mb-4 animate-pulse">
            <i className="fas fa-radiation text-3xl text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-rose-400 mb-2">Critical Threat Detected</h2>
          <p className="text-sm text-slate-300 mb-1 text-center px-6">
            A reverse shell was detected by the eBPF monitor.
          </p>
          <p className="text-sm text-slate-400 mb-6 text-center px-6">
            Your session is being terminated for security reasons.
          </p>
          <div className="text-3xl font-mono text-white">{countdown}</div>
          <p className="text-xs text-slate-500 mt-2">Reloading...</p>
        </div>
      )}
    </div>
  );
}

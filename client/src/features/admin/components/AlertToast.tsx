import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, AlertTriangle, Info, X, Bell, BellRing } from 'lucide-react';
import { alertService, type AlertEvent } from '@/shared/services/alertService';

const severityConfig = {
  critical: { icon: Skull, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', glow: 'shadow-red-200', label: 'CRITICAL' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', glow: 'shadow-amber-200', label: 'WARNING' },
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', glow: 'shadow-blue-200', label: 'INFO' },
};

export default function AlertToast() {
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [visible, setVisible] = useState<AlertEvent | null>(null);

  useEffect(() => {
    const unsub = alertService.subscribe(all => setAlerts(all));
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    if (alerts.length === 0 || visible) return;
    const unacknowledged = alerts.filter(a => !a.acknowledged);
    if (unacknowledged.length === 0) return;
    const next = unacknowledged[0];
    setVisible(next);
    const timer = setTimeout(() => {
      alertService.acknowledge(next.id);
      setVisible(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [alerts, visible]);

  const dismiss = useCallback((id: number) => {
    alertService.acknowledge(id);
    setVisible(null);
  }, []);

  const unreadCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <>
      {/* Bell icon in header */}
      <button onClick={() => { if (unreadCount > 0) alertService.acknowledgeAll(); }}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
        {unreadCount > 0 ? (
          <>
            <BellRing className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        ) : (
          <Bell className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
        )}
      </button>

      {/* Toast notification */}
      <AnimatePresence>
        {visible && (() => {
          const cfg = severityConfig[visible.severity];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={visible.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-2 left-2 right-2 sm:top-4 sm:right-4 sm:left-auto z-[9999] sm:max-w-sm w-full ${cfg.bg} ${cfg.border} border rounded-xl shadow-lg ${cfg.glow} pointer-events-auto`}>
              <div className="flex items-start gap-3 p-4">
                <div className={`w-8 h-8 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-[10px] text-slate-400">{new Date(visible.timestamp).toLocaleTimeString('en-IN')}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 mt-1">{visible.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{visible.message}</p>
                </div>
                <button onClick={() => dismiss(visible.id)}
                  className="w-6 h-6 rounded-lg hover:bg-black/5 flex items-center justify-center shrink-0">
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </>
  );
}
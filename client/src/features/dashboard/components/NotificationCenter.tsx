import { useState, useRef, useEffect, useCallback } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import {
  isNotificationSupported,
  isNotificationGranted,
  requestNotificationPermission,
  sendLocalNotification,
  scheduleBillReminder,
} from '@/shared/services/notificationService';
import { setAppBadge, clearAppBadge } from '@/shared/services/badgeService';

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const notifications = useWealthStore((s) => s.notifications);
  const markNotificationRead = useWealthStore((s) => s.markNotificationRead);
  const bills = useWealthStore((s) => s.bills);
  const dnd = useWealthStore((s) => s.notificationsDnd);
  const popupEnabled = useWealthStore((s) => s.notificationsPopup);
  const setNotificationsDnd = useWealthStore((s) => s.setNotificationsDnd);
  const setNotificationsPopup = useWealthStore((s) => s.setNotificationsPopup);
  const panelRef = useRef<HTMLDivElement>(null);
  const effectiveUnread = dnd ? 0 : notifications.filter((n) => n.unread).length;
  const unreadCount = effectiveUnread;

  useEffect(() => {
    if (effectiveUnread > 0) {
      setAppBadge(effectiveUnread);
    } else {
      clearAppBadge();
    }
  }, [effectiveUnread]);

  useEffect(() => {
    setPushEnabled(isNotificationGranted());
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [open]);

  const handleEnablePush = useCallback(async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      setPushEnabled(true);
      setNotificationsPopup(true);
      if (!dnd) {
        sendLocalNotification(
          'SecureWealth Twin',
          'Push notifications are now enabled!',
          '/favicon.ico'
        );
      }

      // Schedule reminders for upcoming bills (next 7 days)
      const now = new Date();
      bills.forEach((bill) => {
        if (bill.status === 'paid') return;
        const dueDate = new Date(now.getFullYear(), now.getMonth(), bill.dueDay);
        if (dueDate < now) {
          dueDate.setMonth(dueDate.getMonth() + 1);
        }
        const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 7) {
          scheduleBillReminder(bill.name, dueDate, bill.amount);
        }
      });
    }
  }, [bills, dnd]);

  const toggleDnd = useCallback(() => setNotificationsDnd(!dnd), [dnd, setNotificationsDnd]);
  const togglePopup = useCallback(() => setNotificationsPopup(!popupEnabled), [popupEnabled, setNotificationsPopup]);

  const colorMap: Record<string, string> = {
    rose: 'bg-rose-100 text-rose-600',
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors relative"
      >
        <i className="fas fa-bell" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-12 right-0 w-80 bg-white dark:bg-dark-light rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
          <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-white">Notifications</h3>
            <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">{unreadCount} new</span>
          </div>

          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-800/50">
            <button
              onClick={toggleDnd}
              className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border transition-colors ${
                dnd
                  ? 'bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <i className={`fas ${dnd ? 'fa-bell-slash' : 'fa-bell'} mr-1`} /> {dnd ? 'DND On' : 'DND Off'}
            </button>
            <button
              onClick={togglePopup}
              className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border transition-colors ${
                popupEnabled
                  ? 'bg-primary/10 border-primary/20 text-primary'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <i className={`fas ${popupEnabled ? 'fa-toggle-on' : 'fa-toggle-off'} mr-1`} /> Pop-ups {popupEnabled ? 'On' : 'Off'}
            </button>
          </div>

          {isNotificationSupported() && !pushEnabled && (
            <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-primary/5">
              <button
                onClick={handleEnablePush}
                className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-bell" /> Enable Push Notifications
              </button>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center mt-1">
                Get real-time alerts for bills and payments
              </p>
            </div>
          )}

          {pushEnabled && (
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 bg-emerald-50/50 dark:bg-emerald-900/10">
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 text-center font-medium">
                <i className="fas fa-check-circle mr-1" /> Push notifications enabled
              </p>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 cursor-pointer ${n.unread ? 'bg-primary/5' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${colorMap[n.color] || 'bg-slate-100 text-slate-600'}`}>
                  <i className={`fas ${n.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs text-slate-700 dark:text-slate-200 ${n.unread ? 'font-medium' : ''}`}>{n.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                </div>
                {n.unread && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />}
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-slate-100 dark:border-slate-700 text-center">
            <button
              onClick={() => { notifications.forEach((n) => markNotificationRead(n.id)); }}
              className="text-xs text-primary hover:underline"
            >
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';

interface PushNotification {
  id: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  actions: { label: string; color: string }[];
  borderColor: string;
}

const NOTIFICATION_TEMPLATES: Omit<PushNotification, 'id' | 'time'>[] = [
  {
    icon: 'fa-shield-virus',
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50',
    title: 'SecureWealth',
    body: '⚠️ Suspicious transaction of ₹45,000 blocked. Tap to review.',
    actions: [
      { label: 'Review', color: 'bg-rose-500 text-white' },
      { label: 'Dismiss', color: 'bg-slate-200 text-slate-600' },
    ],
    borderColor: 'border-rose-200',
  },
  {
    icon: 'fa-trophy',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    title: 'SecureWealth',
    body: '🎉 Emergency Fund goal 100% complete! You saved ₹6,00,000.',
    actions: [
      { label: 'Celebrate', color: 'bg-emerald-500 text-white' },
      { label: 'Share', color: 'bg-slate-200 text-slate-600' },
    ],
    borderColor: 'border-emerald-200',
  },
  {
    icon: 'fa-chart-line',
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    title: 'SecureWealth',
    body: '📉 NIFTY down 3%. Your "Buy the Dip" trigger is ready.',
    actions: [
      { label: 'Invest Now', color: 'bg-amber-500 text-white' },
      { label: 'Later', color: 'bg-slate-200 text-slate-600' },
    ],
    borderColor: 'border-amber-200',
  },
  {
    icon: 'fa-credit-card',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
    title: 'SecureWealth',
    body: '💡 Credit card bill of ₹12,500 due tomorrow. Pay now?',
    actions: [
      { label: 'Pay Now', color: 'bg-blue-500 text-white' },
      { label: 'Remind Me', color: 'bg-slate-200 text-slate-600' },
    ],
    borderColor: 'border-blue-200',
  },
  {
    icon: 'fa-piggy-bank',
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-50',
    title: 'SecureWealth',
    body: '⏰ Axis Bluechip SIP of ₹15,000 is due today.',
    actions: [
      { label: 'Pay SIP', color: 'bg-purple-500 text-white' },
      { label: 'Snooze', color: 'bg-slate-200 text-slate-600' },
    ],
    borderColor: 'border-purple-200',
  },
];

const TRIGGER_BUTTONS = [
  { id: 0, label: 'Fraud Alert', color: 'bg-rose-500 hover:bg-rose-600', icon: 'fa-shield-virus' },
  { id: 1, label: 'Goal Achieved', color: 'bg-emerald-500 hover:bg-emerald-600', icon: 'fa-trophy' },
  { id: 2, label: 'Market Dip', color: 'bg-amber-500 hover:bg-amber-600', icon: 'fa-chart-line' },
  { id: 3, label: 'Bill Reminder', color: 'bg-blue-500 hover:bg-blue-600', icon: 'fa-credit-card' },
  { id: 4, label: 'SIP Due', color: 'bg-purple-500 hover:bg-purple-600', icon: 'fa-piggy-bank' },
];

export default function NotificationDemo() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const triggerNotification = useCallback((index: number) => {
    const template = NOTIFICATION_TEMPLATES[index];
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const notification: PushNotification = {
      ...template,
      id,
      time: 'now',
    };

    setNotifications((prev) => [notification, ...prev.slice(0, 2)]);
    setExpandedId(null);

    // Auto dismiss after 4 seconds
    if (timersRef.current[id]) clearTimeout(timersRef.current[id]);
    timersRef.current[id] = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setExpandedId((prev) => (prev === id ? null : prev));
    }, 4000);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    if (timersRef.current[id]) clearTimeout(timersRef.current[id]);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setExpandedId((prev) => (prev === id ? null : prev));
  }, []);

  const expandNotification = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // Clear all timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          <i className="fas fa-mobile-screen-button text-primary mr-2" />
          Push Notification Simulator
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Experience how SecureWealth Twin alerts users in real-time. Click any button to send a notification to the phone.
        </p>
      </div>

      {/* Trigger Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {TRIGGER_BUTTONS.map((btn) => (
          <button
            key={btn.id}
            onClick={() => triggerNotification(btn.id)}
            className={`px-5 py-3 ${btn.color} text-white rounded-xl font-medium transition-all active:scale-95 shadow-lg flex items-center gap-2`}
          >
            <i className={`fas ${btn.icon}`} />
            {btn.label}
          </button>
        ))}
      </div>

      {/* Phone Frame */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Phone body */}
          <div className="w-[320px] h-[640px] rounded-[40px] bg-slate-900 p-3 shadow-2xl shadow-slate-900/40 relative">
            {/* Power button */}
            <div className="absolute -right-1 top-28 w-1 h-14 bg-slate-700 rounded-r-md" />
            {/* Volume buttons */}
            <div className="absolute -left-1 top-24 w-1 h-8 bg-slate-700 rounded-l-md" />
            <div className="absolute -left-1 top-36 w-1 h-8 bg-slate-700 rounded-l-md" />

            {/* Screen */}
            <div className="w-full h-full rounded-[32px] bg-white dark:bg-slate-950 overflow-hidden relative flex flex-col">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-slate-900 rounded-full z-30 flex items-center justify-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                <div className="w-2 h-2 rounded-full bg-slate-800" />
              </div>

              {/* Status bar */}
              <div className="h-12 px-6 flex items-center justify-between text-[10px] text-slate-800 dark:text-white z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
                <span className="font-semibold">9:41</span>
                <div className="flex items-center gap-1">
                  <i className="fas fa-signal" />
                  <i className="fas fa-wifi" />
                  <i className="fas fa-battery-full" />
                </div>
              </div>

              {/* Phone Content */}
              <div className="flex-1 relative overflow-hidden">
                {/* App Icon Grid */}
                <div className="p-4 grid grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl shadow-sm ${
                        i === 0 ? 'bg-gradient-to-br from-secondary to-primary' :
                        i === 1 ? 'bg-gradient-to-br from-rose-400 to-rose-600' :
                        i === 2 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                        i === 3 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                        i === 4 ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                        i === 5 ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                        i === 6 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                        'bg-gradient-to-br from-pink-400 to-pink-600'
                      }`}>
                        {i === 0 ? <i className="fas fa-shield-halved" /> : <i className="fas fa-app" />}
                      </div>
                      <span className="text-[9px] text-slate-600 dark:text-slate-300">
                        {i === 0 ? 'SecureWealth' : `App ${i + 1}`}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Notifications Overlay */}
                <div className="absolute top-0 left-0 right-0 px-3 pt-2 space-y-2 z-40 pointer-events-none">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`pointer-events-auto rounded-2xl border ${notif.borderColor} bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg overflow-hidden transition-all duration-300 ${
                        expandedId === notif.id ? 'scale-100' : 'scale-95 hover:scale-100'
                      }`}
                      style={{
                        animation: 'slideDown 0.4s ease-out',
                      }}
                      onClick={() => expandNotification(notif.id)}
                    >
                      <div className="p-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl ${notif.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <i className={`fas ${notif.icon} ${notif.iconColor} text-sm`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-[11px] font-bold text-slate-800 dark:text-white">{notif.title}</p>
                              <span className="text-[9px] text-slate-400">{notif.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{notif.body}</p>
                          </div>
                        </div>

                        {/* Expanded Actions */}
                        {expandedId === notif.id && (
                          <div className="flex gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                            {notif.actions.map((action, i) => (
                              <button
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotification(notif.id);
                                }}
                                className={`flex-1 py-2 rounded-xl text-[11px] font-semibold transition-colors ${action.color}`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Progress bar for auto-dismiss */}
                      {expandedId !== notif.id && (
                        <div className="h-0.5 bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full bg-primary/30 rounded-full"
                            style={{ animation: 'progress 4s linear forwards' }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Home Indicator */}
              <div className="h-8 flex items-center justify-center">
                <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
              </div>
            </div>
          </div>

          {/* Shadow under phone */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-64 h-4 bg-slate-900/20 rounded-[50%] blur-xl" />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <div className="card text-center">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mx-auto mb-2">
            <i className="fas fa-bolt" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">Real-time Alerts</p>
          <p className="text-xs text-slate-400 mt-1">Push notifications delivered instantly via Firebase Cloud Messaging</p>
        </div>
        <div className="card text-center">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 mx-auto mb-2">
            <i className="fas fa-fingerprint" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">Rich Actions</p>
          <p className="text-xs text-slate-400 mt-1">Tap to expand and act without opening the full app</p>
        </div>
        <div className="card text-center">
          <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500 mx-auto mb-2">
            <i className="fas fa-sliders" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">Smart Priority</p>
          <p className="text-xs text-slate-400 mt-1">AI ranks notifications by urgency — fraud first, reminders last</p>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

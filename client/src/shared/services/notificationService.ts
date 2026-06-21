export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function isNotificationGranted(): boolean {
  return isNotificationSupported() && Notification.permission === 'granted';
}

export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  if (!isNotificationSupported()) return null;
  const result = await Notification.requestPermission();
  return result;
}

export function sendLocalNotification(title: string, body: string, icon?: string): Notification | null {
  if (!isNotificationGranted()) return null;
  try {
    return new Notification(title, { body, icon });
  } catch {
    return null;
  }
}

export function scheduleBillReminder(billName: string, dueDate: Date, amount: number): number | null {
  if (!isNotificationGranted()) return null;
  const now = new Date();
  const delay = dueDate.getTime() - now.getTime();
  if (delay <= 0) {
    sendLocalNotification('Bill Due', `${billName} of ₹${amount.toLocaleString()} is due now.`);
    return null;
  }
  const timeoutId = window.setTimeout(() => {
    sendLocalNotification('Bill Reminder', `${billName} of ₹${amount.toLocaleString()} is due today.`);
  }, delay);
  return timeoutId;
}

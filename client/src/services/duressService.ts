const PIN_KEY = 'sw_duress_pin';
const LOCK_KEY = 'sw_duress_locked_until';

export function setDuressPin(pin: string) {
  localStorage.setItem(PIN_KEY, pin);
}

export function getDuressPin(): string | null {
  return localStorage.getItem(PIN_KEY);
}

export function clearDuressPin() {
  localStorage.removeItem(PIN_KEY);
}

export function isDuressPin(pin: string): boolean {
  return !!getDuressPin() && getDuressPin() === pin;
}

export function triggerDuressLockdown() {
  const until = Date.now() + 24 * 60 * 60 * 1000;
  localStorage.setItem(LOCK_KEY, String(until));
  console.log(`🚨 SILENT ALERT: Coerced transaction detected. Account locked until ${new Date(until).toISOString()}`);
}

export function isDuressLocked(): boolean {
  const until = Number(localStorage.getItem(LOCK_KEY) || '0');
  return until > Date.now();
}

export function getDuressLockExpiry(): number | null {
  const until = Number(localStorage.getItem(LOCK_KEY) || '0');
  return until > Date.now() ? until : null;
}

export function clearDuressLockdown() {
  localStorage.removeItem(LOCK_KEY);
}

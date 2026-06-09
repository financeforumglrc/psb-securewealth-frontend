export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  token: string | null;
  deviceFingerprint: string | null;
  rememberDevice: boolean;
  lockoutUntil: number | null;
  failedAttempts: number;
}

const AUTH_KEY = 'sw_auth_state';
const DEVICE_KEY = 'sw_device_trusted';

export function getAuthState(): AuthState {
  try {
    const stored = JSON.parse(localStorage.getItem(AUTH_KEY) || '{}');
    return {
      isAuthenticated: false,
      userId: null,
      token: null,
      deviceFingerprint: null,
      rememberDevice: false,
      lockoutUntil: null,
      failedAttempts: 0,
      ...stored,
    };
  } catch {
    return {
      isAuthenticated: false,
      userId: null,
      token: null,
      deviceFingerprint: null,
      rememberDevice: false,
      lockoutUntil: null,
      failedAttempts: 0,
    };
  }
}

export function setAuthState(state: Partial<AuthState>) {
  const current = getAuthState();
  localStorage.setItem(AUTH_KEY, JSON.stringify({ ...current, ...state }));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(DEVICE_KEY);
}

export function isDeviceTrusted(): boolean {
  return localStorage.getItem(DEVICE_KEY) === 'true';
}

export function trustDevice() {
  localStorage.setItem(DEVICE_KEY, 'true');
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateVoiceCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function speakCode(code: string) {
  const utterance = new SpeechSynthesisUtterance(`Your voice verification code is ${code.split('').join(' ')}`);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export function generateFingerprint(): string {
  return btoa(`${navigator.userAgent}-${screen.width}x${screen.height}-${new Date().getTimezoneOffset()}`).slice(0, 32);
}

export function isLockedOut(): boolean {
  const state = getAuthState();
  return !!state.lockoutUntil && state.lockoutUntil > Date.now();
}

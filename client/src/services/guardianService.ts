import { protectionApi, type GuardianMessageRequest } from '../lib/protectionApi';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'https://psb-banking-backend.onrender.com/api/v1';

async function fetchBackendGuardian(payload: GuardianMessageRequest): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${BACKEND_BASE}/ai/guardian-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
      credentials: 'include',
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.message || null;
  } catch {
    return null;
  }
}

export async function getGuardianMessage(payload: GuardianMessageRequest): Promise<string> {
  // 1. Try the Node backend LLM Guardian
  const backendMessage = await fetchBackendGuardian(payload);
  if (backendMessage) return backendMessage;

  // 2. Fallback to FastAPI deterministic template
  const res = await protectionApi.guardianMessage(payload);
  if (res.ok && res.data?.message) {
    return res.data.message;
  }

  // 3. Last-resort local template
  const amountStr = `₹${payload.amount.toLocaleString('en-IN')}`;
  const payeeStr = payload.payee || 'this contact';

  if (payload.action === 'ALLOW') {
    return `Your ${amountStr} request to ${payeeStr} looks safe. It matches your usual patterns and trusted device.`;
  }
  if (payload.action === 'WARN_COOL_OFF') {
    return `🛡️ Security Pause: I noticed you're moving ${amountStr} to ${payeeStr} in a way that doesn't match your normal habits. To protect your wealth, I've placed this on a short cooling-off period. Please verify the OTP I just sent to your registered mobile.`;
  }
  return `🛑 I can't let this ${amountStr} transfer to ${payeeStr} proceed right now. Multiple risk signals are active. Please review your recent notifications or contact support — your money stays safe.`;
}

/* ═══════════════════════════════════════════════════════════════
   TOTP SERVICE — Real RFC 6238 time-based one-time passwords
   Uses Web Crypto HMAC-SHA-1. Secret is stored in localStorage.
   ═══════════════════════════════════════════════════════════════ */

const TOTP_SECRET_KEY = 'sw_totp_secret';
const TOTP_ISSUER = 'SecureWealth';
const TOTP_ACCOUNT = 'user@securewealth.in';

function base32Decode(base32: string): ArrayBuffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (const char of cleaned) {
    bits += alphabet.indexOf(char).toString(2).padStart(5, '0');
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  return bytes.buffer;
}

function base32Encode(buffer: ArrayBuffer | Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = new Uint8Array(buffer);
  let bits = '';
  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, '0');
  }
  let result = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    result += alphabet[parseInt(chunk, 2)];
  }
  return result;
}

function generateRandomBase32Secret(length = 32): string {
  const random = crypto.getRandomValues(new Uint8Array(length));
  return base32Encode(random);
}

function numberToBuffer(num: number): ArrayBuffer {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setBigUint64(0, BigInt(num), false);
  return buf;
}

export async function hmacSha1(key: ArrayBuffer, data: ArrayBuffer): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: { name: 'SHA-1' } },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, data);
}

export async function generateTotp(secret: string, timeStep = 30, timestamp = Date.now()): Promise<string> {
  const counter = Math.floor(timestamp / 1000 / timeStep);
  const key = base32Decode(secret);
  const data = numberToBuffer(counter);
  const hmac = new Uint8Array(await hmacSha1(key, data));
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 1_000_000).toString().padStart(6, '0');
}

export function getOrCreateTotpSecret(): string {
  const existing = localStorage.getItem(TOTP_SECRET_KEY);
  if (existing) return existing;
  const secret = generateRandomBase32Secret();
  localStorage.setItem(TOTP_SECRET_KEY, secret);
  return secret;
}

export function getTotpSecret(): string | null {
  return localStorage.getItem(TOTP_SECRET_KEY);
}

export function getTotpUri(secret: string): string {
  return `otpauth://totp/${TOTP_ISSUER}:${TOTP_ACCOUNT}?secret=${secret}&issuer=${TOTP_ISSUER}`;
}

export async function verifyTotp(code: string, secret: string, windowSteps = 1): Promise<boolean> {
  const now = Date.now();
  for (let i = -windowSteps; i <= windowSteps; i++) {
    const expected = await generateTotp(secret, 30, now + i * 30 * 1000);
    if (expected === code) return true;
  }
  return false;
}

export function getTotpTimeRemaining(timeStep = 30): number {
  return timeStep - (Math.floor(Date.now() / 1000) % timeStep);
}

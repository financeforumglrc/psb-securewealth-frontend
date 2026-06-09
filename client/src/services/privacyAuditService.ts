/* ═══════════════════════════════════════════════════════════════
   PRIVACY AUDIT SERVICE — Real Cookie / Storage Audit
   ═══════════════════════════════════════════════════════════════ */

export interface CookieInfo {
  name: string;
  domain: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string;
}

export interface PrivacyAudit {
  cookies: CookieInfo[];
  localStorageItems: number;
  localStorageSize: string;
  sessionStorageItems: number;
  indexedDBDatabases: string[];
  thirdPartyDomains: string[];
  trackingRisk: 'low' | 'medium' | 'high';
}

/* ── Helpers ─────────────────────────────────────────────────── */

function parseCookieStr(cookieStr: string): CookieInfo[] {
  if (!cookieStr.trim()) return [];
  return cookieStr.split(';').map((raw) => {
    const [namePart] = raw.trim().split('=');
    const name = namePart?.trim() ?? '';
    // document.cookie does not expose domain/secure/httpOnly/sameSite,
    // so we use best-effort detection
    return {
      name,
      domain: window.location.hostname,
      secure: false,
      httpOnly: false,
      sameSite: 'Unknown',
    };
  });
}

function estimateSize(value: string): number {
  try {
    return new Blob([value]).size;
  } catch {
    return value.length * 2; // rough UTF-16 estimate
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getCurrentDomain(): string {
  try {
    return window.location.hostname;
  } catch {
    return '';
  }
}

function isThirdParty(domain: string): boolean {
  const current = getCurrentDomain();
  if (!current || !domain) return false;
  if (domain === current) return false;
  // Check if cookie domain is a parent domain of current
  if (current.endsWith(`.${domain}`)) return false;
  return true;
}

function detectThirdPartyDomains(cookies: CookieInfo[]): string[] {
  const domains = new Set<string>();
  for (const c of cookies) {
    if (isThirdParty(c.domain)) {
      domains.add(c.domain);
    }
  }
  return Array.from(domains);
}

function calculateTrackingRisk(
  cookies: CookieInfo[],
  thirdPartyDomains: string[],
  localStorageItems: number,
  indexedDBDatabases: string[]
): 'low' | 'medium' | 'high' {
  let risk = 0;
  risk += cookies.length * 2;
  risk += thirdPartyDomains.length * 10;
  risk += localStorageItems * 1;
  risk += indexedDBDatabases.length * 5;

  if (risk >= 40) return 'high';
  if (risk >= 20) return 'medium';
  return 'low';
}

/* ── Public API ──────────────────────────────────────────────── */

export async function runPrivacyAudit(): Promise<PrivacyAudit> {
  const cookies: CookieInfo[] = [];
  let localStorageItems = 0;
  let localStorageSize = '0 B';
  let sessionStorageItems = 0;
  let indexedDBDatabases: string[] = [];

  // Cookies
  if (typeof document !== 'undefined') {
    const parsed = parseCookieStr(document.cookie);
    cookies.push(...parsed);
  }

  // localStorage
  if (typeof localStorage !== 'undefined') {
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const value = localStorage.getItem(key) ?? '';
      totalBytes += estimateSize(key) + estimateSize(value);
      localStorageItems++;
    }
    localStorageSize = formatBytes(totalBytes);
  }

  // sessionStorage
  if (typeof sessionStorage !== 'undefined') {
    sessionStorageItems = sessionStorage.length;
  }

  // IndexedDB
  if (typeof window !== 'undefined' && 'indexedDB' in window) {
    try {
      if ('databases' in indexedDB) {
        const dbs = await (indexedDB as IDBFactory & { databases(): Promise<{ name?: string }[]> }).databases();
        indexedDBDatabases = dbs.map((db) => db.name ?? 'unnamed').filter(Boolean);
      }
    } catch {
      // Fallback: some browsers don't support indexedDB.databases()
      indexedDBDatabases = [];
    }
  }

  const thirdPartyDomains = detectThirdPartyDomains(cookies);
  const trackingRisk = calculateTrackingRisk(
    cookies,
    thirdPartyDomains,
    localStorageItems,
    indexedDBDatabases
  );

  return {
    cookies,
    localStorageItems,
    localStorageSize,
    sessionStorageItems,
    indexedDBDatabases,
    thirdPartyDomains,
    trackingRisk,
  };
}

export function clearTrackingData(): void {
  if (typeof localStorage !== 'undefined') {
    // Preserve essential auth / app keys
    const preserveKeys = ['sw_auth', 'sw_trusted_locations', 'sw_passkey_user', 'sw_theme'];
    const preserved: Record<string, string> = {};
    for (const key of preserveKeys) {
      const val = localStorage.getItem(key);
      if (val !== null) preserved[key] = val;
    }
    localStorage.clear();
    for (const [key, val] of Object.entries(preserved)) {
      localStorage.setItem(key, val);
    }
  }

  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }

  if (typeof document !== 'undefined') {
    // Clear cookies by setting expiry in past
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name] = cookie.split('=');
      const trimmed = name?.trim() ?? '';
      if (!trimmed) continue;
      document.cookie = `${trimmed}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
    }
  }
}

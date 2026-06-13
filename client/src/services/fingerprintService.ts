/* ═══════════════════════════════════════════════════════════════
   DEVICE FINGERPRINT SERVICE — Real Browser API Collection
   ═══════════════════════════════════════════════════════════════ */

export interface DeviceFingerprint {
  canvas: string;
  webgl: string;
  fonts: string[];
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
  };
  timezone: string;
  language: string;
  platform: string;
  userAgent: string;
  touch: boolean;
  cores: number;
  memory: number;
  connection: string;
}

export interface FingerprintResult {
  fingerprint: DeviceFingerprint;
  hash: string;
  trustScore: number;
}

/* ── Helpers ─────────────────────────────────────────────────── */

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashCanvas(canvas: HTMLCanvasElement): Promise<string> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return 'unsupported';
  const data = canvas.toDataURL('image/png');
  return sha256Hex(data);
}

async function getCanvasFingerprint(): Promise<string> {
  if (typeof document === 'undefined') return 'unsupported';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'unsupported';

    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text with varied fonts, sizes, and transforms
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('SecureWealth 🛡️', 10, 30);

    ctx.fillStyle = '#b71c1c';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.fillText('PSB-FP-v2', 160, 25);

    ctx.fillStyle = '#1b5e20';
    ctx.font = 'italic 12px Georgia, serif';
    ctx.fillText('Punjab & Sind Bank', 10, 50);

    // Emoji + geometric shape
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(250, 40, 8, 0, Math.PI * 2);
    ctx.fill();

    return await hashCanvas(canvas);
  } catch {
    return 'unsupported';
  }
}

function getWebGLFingerprint(): string {
  if (typeof document === 'undefined') return 'unsupported';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl || !(gl instanceof WebGLRenderingContext)) return 'unsupported';

    const vendor = gl.getParameter(gl.VENDOR) as string;
    const renderer = gl.getParameter(gl.RENDERER) as string;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let unmaskedVendor = vendor;
    let unmaskedRenderer = renderer;

    if (debugInfo) {
      unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) as string || vendor;
      unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string || renderer;
    }

    return `${unmaskedVendor}::${unmaskedRenderer}`;
  } catch {
    return 'unsupported';
  }
}

const COMMON_FONTS = [
  'Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana',
  'Helvetica', 'Trebuchet MS', 'Tahoma', 'Impact', 'Comic Sans MS',
  'Palatino Linotype', 'Garamond', 'Bookman Old Style', 'Avant Garde',
  'Calibri', 'Cambria', 'Candara', 'Consolas', 'Constantia', 'Corbel',
  'Franklin Gothic Medium', 'Segoe UI', 'Roboto', 'Open Sans', 'Lato',
  'Montserrat', 'Oswald', 'Raleway', 'Merriweather', 'Noto Sans',
  'Helvetica Neue', 'Arial Black', 'Geneva', 'Lucida Grande',
];

function getFontFingerprint(): string[] {
  if (typeof document === 'undefined') return [];
  try {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const h = document.createElement('span');
    h.style.position = 'absolute';
    h.style.left = '-9999px';
    h.style.fontSize = testSize;
    h.innerText = testString;
    document.body.appendChild(h);

    const baseWidths: Record<string, number> = {};
    for (const base of baseFonts) {
      h.style.fontFamily = base;
      baseWidths[base] = h.offsetWidth;
    }

    const detected: string[] = [];
    for (const font of COMMON_FONTS) {
      let found = false;
      for (const base of baseFonts) {
        h.style.fontFamily = `"${font}", ${base}`;
        if (h.offsetWidth !== baseWidths[base]) {
          found = true;
          break;
        }
      }
      if (found) detected.push(font);
    }

    document.body.removeChild(h);
    return detected;
  } catch {
    return [];
  }
}

function getScreenFingerprint() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0, colorDepth: 0, pixelRatio: 1 };
  }
  return {
    width: window.screen?.width ?? 0,
    height: window.screen?.height ?? 0,
    colorDepth: window.screen?.colorDepth ?? 0,
    pixelRatio: window.devicePixelRatio ?? 1,
  };
}

function getNavigatorFingerprint() {
  if (typeof navigator === 'undefined') {
    return {
      timezone: 'UTC',
      language: 'en',
      platform: 'unknown',
      userAgent: '',
      touch: false,
      cores: 0,
      memory: 0,
      connection: 'unknown',
    };
  }

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { effectiveType?: string };
  };

  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
    language: nav.language ?? 'en',
    platform: nav.platform ?? 'unknown',
    userAgent: nav.userAgent ?? '',
    touch: 'maxTouchPoints' in nav && nav.maxTouchPoints > 0,
    cores: nav.hardwareConcurrency ?? 0,
    memory: nav.deviceMemory ?? 0,
    connection: nav.connection?.effectiveType ?? 'unknown',
  };
}

/* ── Public API ──────────────────────────────────────────────── */

export async function collectFingerprint(): Promise<FingerprintResult> {
  const nav = getNavigatorFingerprint();
  const screen = getScreenFingerprint();

  const fingerprint: DeviceFingerprint = {
    canvas: await getCanvasFingerprint(),
    webgl: getWebGLFingerprint(),
    fonts: getFontFingerprint(),
    screen,
    timezone: nav.timezone,
    language: nav.language,
    platform: nav.platform,
    userAgent: nav.userAgent,
    touch: nav.touch,
    cores: nav.cores,
    memory: nav.memory,
    connection: nav.connection,
  };

  const hashInput = [
    fingerprint.canvas,
    fingerprint.webgl,
    fingerprint.fonts.join(','),
    `${screen.width}x${screen.height}@${screen.colorDepth}`,
    fingerprint.timezone,
    fingerprint.language,
    fingerprint.platform,
    String(fingerprint.touch),
    String(fingerprint.cores),
  ].join('|');

  const hash = await sha256Hex(hashInput);

  // Trust score: higher = more unique/stable fingerprint
  let trustScore = 50;
  if (fingerprint.canvas !== 'unsupported') trustScore += 15;
  if (fingerprint.webgl !== 'unsupported') trustScore += 15;
  if (fingerprint.fonts.length > 10) trustScore += 10;
  if (fingerprint.cores >= 4) trustScore += 5;
  if (fingerprint.memory >= 8) trustScore += 5;
  trustScore = Math.min(100, trustScore);

  return { fingerprint, hash, trustScore };
}

export function getStoredFingerprint(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('sw_device_fingerprint');
}

export function storeFingerprint(hash: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('sw_device_fingerprint', hash);
}

export function compareFingerprints(current: string, stored: string): {
  changed: boolean;
  changedFields: string[];
} {
  return {
    changed: current !== stored,
    changedFields: current !== stored ? ['fingerprint_hash'] : [],
  };
}

export function clearStoredFingerprint(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem('sw_device_fingerprint');
}

/**
 * URL Safety Service — Real-time phishing and fraud URL detection
 * Uses multiple heuristics + pattern matching to detect unsafe URLs.
 */

export interface URLSafetyResult {
  url: string;
  safe: boolean;
  riskScore: number; // 0-100
  reasons: string[];
  checkedAt: string;
}

// Known suspicious patterns
const SUSPICIOUS_PATTERNS = [
  { pattern: /bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly/i, reason: 'URL shortener — hides final destination', score: 30 },
  { pattern: /(update|verify|secure|login|signin|banking|account).*(?:\.com|\.net|\.org)\.(?!com|net|org)\w{2,}/i, reason: 'Typosquatting / subdomain trick', score: 50 },
  { pattern: /(?:[0-9]{1,3}\.){3}[0-9]{1,3}/, reason: 'IP address instead of domain', score: 40 },
  { pattern: /(free|win|prize|lottery|lucky|gift).*(click|here|now)/i, reason: 'Too-good-to-be-true language', score: 35 },
  { pattern: /urgent|immediate|suspend|block|verify.*account/i, reason: 'Urgency / fear tactics', score: 25 },
  { pattern: /(?:password|creditcard|cvv|otp|pan|aadhaar)/i, reason: 'Requests sensitive info', score: 45 },
  { pattern: /\.tk|\.ml|\.ga|\.cf|\.gq$/i, reason: 'Free domain often used for scams', score: 20 },
  { pattern: /paypal.*\.(?!com\b)|amazon.*\.(?!in\b|com\b)|flipkart.*\.(?!com\b)/i, reason: 'Brand impersonation', score: 55 },
];

// Known safe domains (whitelist)
const TRUSTED_DOMAINS = [
  'google.com', 'youtube.com', 'facebook.com', 'instagram.com',
  'twitter.com', 'x.com', 'linkedin.com', 'github.com',
  'amazon.in', 'amazon.com', 'flipkart.com', 'myntra.com',
  'paytm.com', 'phonepe.com', 'googlepay.com', 'sbi.co.in',
  'hdfcbank.com', 'icicibank.com', 'axisbank.com', 'kotak.com',
  'rbi.org.in', 'sebi.gov.in', 'npci.org.in', 'uidai.gov.in',
  'incometax.gov.in', 'gst.gov.in', 'surge.sh',
];

export function checkURLSafety(rawUrl: string): URLSafetyResult {
  const checkedAt = new Date().toISOString();
  const reasons: string[] = [];
  let riskScore = 0;

  let url: URL;
  try {
    url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
  } catch {
    return { url: rawUrl, safe: false, riskScore: 100, reasons: ['Invalid URL format'], checkedAt };
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, '');

  // Whitelist check
  if (TRUSTED_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
    return { url: rawUrl, safe: true, riskScore: 0, reasons: ['Domain is in trusted whitelist'], checkedAt };
  }

  // Pattern checks
  const fullUrl = url.toString().toLowerCase();
  for (const rule of SUSPICIOUS_PATTERNS) {
    if (rule.pattern.test(fullUrl)) {
      reasons.push(rule.reason);
      riskScore += rule.score;
    }
  }

  // HTTPS check
  if (url.protocol !== 'https:') {
    reasons.push('No HTTPS encryption');
    riskScore += 15;
  }

  // Long subdomain chains
  const subdomainCount = hostname.split('.').length - 2;
  if (subdomainCount > 2) {
    reasons.push(`Suspicious subdomain depth (${subdomainCount} levels)`);
    riskScore += 10;
  }

  // Excessive URL length
  if (rawUrl.length > 200) {
    reasons.push('Unusually long URL');
    riskScore += 10;
  }

  riskScore = Math.min(100, riskScore);

  return {
    url: rawUrl,
    safe: riskScore < 30,
    riskScore,
    reasons: reasons.length > 0 ? reasons : ['No obvious risk signals detected'],
    checkedAt,
  };
}

export function checkMultipleURLs(urls: string[]): URLSafetyResult[] {
  return urls.map((u) => checkURLSafety(u));
}

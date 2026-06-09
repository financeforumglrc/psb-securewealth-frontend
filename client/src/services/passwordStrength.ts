/* ═══════════════════════════════════════════════════════════════
   PASSWORD STRENGTH SERVICE — Real Custom Strength Checker
   ═══════════════════════════════════════════════════════════════ */

export type StrengthLabel = 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';

export interface PasswordStrength {
  score: number;
  label: StrengthLabel;
  lengthPoints: number;
  varietyPoints: number;
  penaltyPoints: number;
  feedback: string[];
}

/* ── Helpers ─────────────────────────────────────────────────── */

const COMMON_WORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 'letmein',
  'dragon', '111111', 'baseball', 'iloveyou', 'trustno1', 'sunshine',
  'princess', 'admin', 'welcome', 'shadow', 'ashley', 'football', 'jesus',
  'michael', 'ninja', 'mustang', 'password1', '123456789', 'adobe123',
  'admin123', 'login', 'master', 'photoshop', '1q2w3e4r', 'zaq12wsx',
  'qwertyuiop', 'lovely', 'whatever', 'starwars', 'bank', 'money',
  'secure', 'india', 'punjab', 'sind', 'psb', 'securewealth',
]);

function scoreLength(password: string): number {
  const len = password.length;
  if (len >= 16) return 40;
  if (len >= 12) return 30;
  if (len >= 8) return 20;
  if (len >= 6) return 10;
  return 0;
}

function scoreVariety(password: string): number {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  let score = 0;
  if (hasLower) score += 10;
  if (hasUpper) score += 10;
  if (hasDigit) score += 10;
  if (hasSymbol) score += 10;

  // Bonus for using all 4 categories with good length
  if (hasLower && hasUpper && hasDigit && hasSymbol && password.length >= 10) {
    score += 10;
  }

  return Math.min(40, score);
}

function scorePatterns(password: string): number {
  let penalty = 0;
  const lower = password.toLowerCase();

  // Repeated characters
  const repeats = password.match(/(.)\1{2,}/g);
  if (repeats) {
    penalty += repeats.length * 4;
  }

  // Sequential characters (abc, 123, qwe)
  const seqPatterns = [
    'abcdefghijklmnopqrstuvwxyz',
    'zyxwvutsrqponmlkjihgfedcba',
    '0123456789',
    '9876543210',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm',
  ];
  for (const seq of seqPatterns) {
    for (let i = 0; i < seq.length - 2; i++) {
      const fragment = seq.slice(i, i + 3);
      if (lower.includes(fragment)) {
        penalty += 5;
      }
    }
  }

  // Common dictionary words
  for (const word of COMMON_WORDS) {
    if (lower.includes(word)) {
      penalty += 8;
    }
  }

  // Keyboard patterns
  const keyboardPatterns = ['123', 'qwe', 'asd', 'zxc', 'qaz', 'wsx', 'edc'];
  for (const pat of keyboardPatterns) {
    if (lower.includes(pat)) {
      penalty += 3;
    }
  }

  return Math.min(30, penalty);
}

function getLabel(score: number): StrengthLabel {
  if (score >= 80) return 'Very Strong';
  if (score >= 60) return 'Strong';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Weak';
  return 'Very Weak';
}

function getFeedback(score: number, lengthPoints: number, varietyPoints: number, penaltyPoints: number): string[] {
  const feedback: string[] = [];

  if (score >= 80) {
    feedback.push('Excellent password!');
    return feedback;
  }

  if (lengthPoints < 20) {
    feedback.push('Use at least 8 characters (12+ recommended).');
  } else if (lengthPoints < 30) {
    feedback.push('Consider using 12+ characters for better security.');
  }

  if (varietyPoints < 30) {
    feedback.push('Mix uppercase, lowercase, numbers, and symbols.');
  }

  if (penaltyPoints > 0) {
    feedback.push('Avoid repeated characters, sequences, and common words.');
  }

  return feedback;
}

/* ── Public API ──────────────────────────────────────────────── */

export function checkPasswordStrength(password: string): PasswordStrength {
  const lengthPoints = scoreLength(password);
  const varietyPoints = scoreVariety(password);
  const penaltyPoints = scorePatterns(password);

  let score = lengthPoints + varietyPoints - penaltyPoints;
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    label: getLabel(score),
    lengthPoints,
    varietyPoints,
    penaltyPoints,
    feedback: getFeedback(score, lengthPoints, varietyPoints, penaltyPoints),
  };
}

export function getStrengthColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-lime-500';
  if (score >= 40) return 'bg-amber-500';
  if (score >= 20) return 'bg-orange-500';
  return 'bg-rose-500';
}

export function getStrengthTextColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-lime-600 dark:text-lime-400';
  if (score >= 40) return 'text-amber-600 dark:text-amber-400';
  if (score >= 20) return 'text-orange-600 dark:text-orange-400';
  return 'text-rose-600 dark:text-rose-400';
}

const STREAK_KEY = 'sw_login_streak';

export interface StreakData {
  days: number;
  streakCount: number;
  lastLoginDate: string;
  longestStreak: number;
  totalCheckins: number;
}

function _load(): StreakData {
  try {
    const raw = JSON.parse(localStorage.getItem(STREAK_KEY) || '{}');
    return {
      days: raw.streakCount || 0,
      streakCount: raw.streakCount || 0,
      lastLoginDate: raw.lastLoginDate || '',
      longestStreak: raw.longestStreak || 0,
      totalCheckins: raw.totalCheckins || 0,
      ...raw,
    };
  } catch {
    return { days: 0, streakCount: 0, lastLoginDate: '', longestStreak: 0, totalCheckins: 0 };
  }
}

function _save(data: StreakData) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

export function loadStreak(): StreakData {
  return _load();
}

export function getStreak(): StreakData {
  return _load();
}

export function checkIn(): StreakData {
  const data = _load();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (data.lastLoginDate === today) {
    return data; // Already checked in today
  }

  if (data.lastLoginDate === yesterday) {
    data.streakCount += 1;
  } else {
    data.streakCount = 1; // Reset
  }

  data.days = data.streakCount;
  data.lastLoginDate = today;
  data.totalCheckins += 1;
  if (data.streakCount > data.longestStreak) {
    data.longestStreak = data.streakCount;
  }

  _save(data);
  return data;
}

export function recordLogin(): StreakData {
  return checkIn();
}

export function getStreakReward(streakCount: number): { milestone: number; reward: string; type: 'booster' | 'cashback' | 'badge' } | null {
  if (streakCount >= 100) return { milestone: 100, reward: '₹100 cashback + Loyalty Badge', type: 'cashback' };
  if (streakCount >= 30) return { milestone: 30, reward: '1% cashback booster (7 days)', type: 'booster' };
  if (streakCount >= 7) return { milestone: 7, reward: '0.5% cashback booster (next txn)', type: 'booster' };
  return null;
}

export function getDaysUntilNextReward(streakCount: number): number {
  if (streakCount < 7) return 7 - streakCount;
  if (streakCount < 30) return 30 - streakCount;
  if (streakCount < 100) return 100 - streakCount;
  return 0;
}

export function getNextReward(): { days: number; reward: string } | null {
  const data = _load();
  const s = data.streakCount;
  if (s < 7) return { days: 7, reward: '0.5% cashback booster (next txn)' };
  if (s < 30) return { days: 30, reward: '1% cashback booster (7 days)' };
  if (s < 100) return { days: 100, reward: '₹100 cashback + Loyalty Badge' };
  return null;
}

export function resetIfMissed(): StreakData {
  const data = _load();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (data.lastLoginDate !== today && data.lastLoginDate !== yesterday) {
    data.streakCount = 0;
    data.days = 0;
    _save(data);
  }
  return data;
}

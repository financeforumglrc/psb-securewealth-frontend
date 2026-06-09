export interface SweepLog {
  id: string;
  date: string;
  amount: number;
  from: string;
  to: string;
  reason: string;
}

const LOG_KEY = 'sw_autosweep_logs';

export function getSweepLogs(): SweepLog[] {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addSweepLog(log: SweepLog) {
  const logs = getSweepLogs();
  logs.unshift(log);
  localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, 50)));
}

export function analyzeShortfall(
  upcomingBillsTotal: number,
  liquidBalance: number,
  monthlySavings: number
): { shortfall: number; suggestedSweep: number; message: string } | null {
  const projectedBalance = liquidBalance - upcomingBillsTotal;
  if (projectedBalance > monthlySavings * 0.5) return null;

  const shortfall = Math.max(0, upcomingBillsTotal - liquidBalance);
  const suggestedSweep = shortfall > 0 ? Math.ceil(shortfall / 100) * 100 : 500;

  return {
    shortfall,
    suggestedSweep,
    message:
      shortfall > 0
        ? `Rain forecast for next week. Projected shortfall of ₹${shortfall.toLocaleString()}. Auto-sweep ₹${suggestedSweep.toLocaleString()} to your Rainy Day fund?`
        : `Rain forecast for next week. Auto-sweep ₹${suggestedSweep.toLocaleString()} to your Rainy Day fund to stay safe?`,
  };
}

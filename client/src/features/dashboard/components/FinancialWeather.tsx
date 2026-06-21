import { useMemo, useState } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import { analyzeShortfall, addSweepLog, type SweepLog } from '@/shared/services/autoSweepService';

interface WeatherState {
  icon: string;
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  temp: string;
}

interface ForecastDay {
  day: string;
  icon: string;
  label: string;
  detail: string;
  color: string;
}

export default function FinancialWeather() {
  const user = useWealthStore((s) => s.user);
  const goals = useWealthStore((s) => s.goals);
  const transactions = useWealthStore((s) => s.transactions);
  const assets = useWealthStore((s) => s.assets);
  const market = useWealthStore((s) => s.marketData);
  const bills = useWealthStore((s) => s.bills);
  const updateGoal = useWealthStore((s) => s.updateGoal);
  const [sweepLogs, setSweepLogs] = useState<SweepLog[]>(() => {
    try { return JSON.parse(localStorage.getItem('sw_autosweep_logs') || '[]'); } catch { return []; }
  });
  const [sweepDone, setSweepDone] = useState(false);

  const liquid = assets.filter((a) => a.liquidity === 'high').reduce((s, a) => s + a.value, 0);
  const savingsRate = (user.monthlySavings / user.monthlyIncome) * 100;
  const blockedFrauds = transactions.filter((t) => t.status === 'BLOCKED').length;
  const goalsOnTrack = goals.filter((g) => g.currentAmount / g.targetAmount >= 0.5).length;
  const upcomingBillsTotal = bills.filter((b) => b.status !== 'paid').reduce((s, b) => s + b.amount, 0);

  // Compute financial weather
  const weather = useMemo<WeatherState>(() => {
    let issues = 0;
    let positives = 0;

    if (savingsRate < 15) issues += 2;
    else if (savingsRate < 20) issues += 1;
    else positives += 1;

    if (goalsOnTrack < goals.length / 2) issues += 2;
    else if (goalsOnTrack < goals.length) issues += 1;
    else positives += 1;

    if (blockedFrauds >= 2) positives += 1;
    if (upcomingBillsTotal > liquid * 0.5) issues += 2;
    else if (upcomingBillsTotal > liquid * 0.3) issues += 1;
    else positives += 1;

    if (market.niftyPe > 25) issues += 1;
    if (market.inflation > 6) issues += 1;
    else positives += 1;

    if (issues >= 4) {
      return {
        icon: '⛈️', label: 'Stormy', description: 'High risk detected. Multiple issues need immediate attention.',
        color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', temp: '32°C',
      };
    }
    if (issues >= 2) {
      return {
        icon: '🌧️', label: 'Rainy', description: 'Several concerns detected. Review your finances this week.',
        color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', temp: '24°C',
      };
    }
    if (issues >= 1 || positives < 3) {
      return {
        icon: '⛅', label: 'Partly Cloudy', description: 'Minor concerns. Keep an eye on expenses and upcoming bills.',
        color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', temp: '28°C',
      };
    }
    return {
      icon: '☀️', label: 'Sunny', description: 'Finances are healthy, goals on track. Great job!',
      color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', temp: '34°C',
    };
  }, [savingsRate, goalsOnTrack, goals.length, blockedFrauds, upcomingBillsTotal, liquid, market.niftyPe, market.inflation]);

  // Factors list
  const factors = useMemo(() => [
    {
      label: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      status: savingsRate >= 20 ? 'good' : savingsRate >= 15 ? 'warn' : 'bad',
      detail: savingsRate >= 20 ? 'On target' : 'Below 20% target',
    },
    {
      label: 'Goals',
      value: `${goalsOnTrack}/${goals.length} on track`,
      status: goalsOnTrack === goals.length ? 'good' : goalsOnTrack >= goals.length / 2 ? 'warn' : 'bad',
      detail: goalsOnTrack === goals.length ? 'All progressing well' : 'Some need attention',
    },
    {
      label: 'Fraud Shield',
      value: `${blockedFrauds} blocked`,
      status: blockedFrauds > 0 ? 'good' : 'neutral',
      detail: blockedFrauds > 0 ? 'Protection active' : 'No threats detected',
    },
    {
      label: 'Liquidity',
      value: `₹${(liquid / 100000).toFixed(1)}L`,
      status: liquid > upcomingBillsTotal * 2 ? 'good' : liquid > upcomingBillsTotal ? 'warn' : 'bad',
      detail: liquid > upcomingBillsTotal * 2 ? 'Healthy buffer' : `Bills: ₹${(upcomingBillsTotal / 1000).toFixed(0)}K`,
    },
    {
      label: 'Market',
      value: `P/E ${market.niftyPe}`,
      status: market.niftyPe < 22 ? 'good' : market.niftyPe < 25 ? 'warn' : 'bad',
      detail: market.niftyPe < 22 ? 'Favorable' : market.niftyPe < 25 ? 'Cautious' : 'Expensive',
    },
  ], [savingsRate, goalsOnTrack, goals.length, blockedFrauds, liquid, upcomingBillsTotal, market.niftyPe]);

  // 7-day forecast
  const forecast = useMemo<ForecastDay[]>(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const result: ForecastDay[] = [];

    for (let i = 0; i < 7; i++) {
      const dayIndex = (today + i) % 7;
      const dayName = i === 0 ? 'Today' : days[dayIndex];
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateNum = date.getDate();

      // Find bills due on this date
      const dayBills = bills.filter((b) => b.dueDay === dateNum && b.status !== 'paid');
      const totalDue = dayBills.reduce((s, b) => s + b.amount, 0);

      // Check for salary day (22nd)
      if (dateNum === 22) {
        result.push({ day: dayName, icon: '☀️', label: 'Sunny', detail: 'Salary credit day', color: 'text-emerald-500' });
      } else if (dayBills.length > 1 && totalDue > 30000) {
        result.push({ day: dayName, icon: '⛈️', label: 'Stormy', detail: `${dayBills.length} bills: ₹${(totalDue / 1000).toFixed(0)}K`, color: 'text-rose-500' });
      } else if (dayBills.length > 0 && totalDue > 15000) {
        result.push({ day: dayName, icon: '🌧️', label: 'Rainy', detail: `${dayBills[0].name}: ₹${dayBills[0].amount.toLocaleString()}`, color: 'text-blue-500' });
      } else if (dayBills.length > 0) {
        result.push({ day: dayName, icon: '⛅', label: 'Cloudy', detail: `${dayBills[0].name} due`, color: 'text-amber-500' });
      } else if (dateNum === 5) {
        result.push({ day: dayName, icon: '⛅', label: 'Partly Cloudy', detail: 'SIP auto-debit', color: 'text-amber-500' });
      } else {
        result.push({ day: dayName, icon: '☀️', label: 'Clear', detail: 'No major outflows', color: 'text-emerald-500' });
      }
    }
    return result;
  }, [bills]);

  const shortfallAnalysis = useMemo(() => {
    const liquid = assets.filter((a) => a.liquidity === 'high').reduce((s, a) => s + a.value, 0);
    const upcoming = bills.filter((b) => b.status !== 'paid').reduce((s, b) => s + b.amount, 0);
    return analyzeShortfall(upcoming, liquid, user.monthlySavings);
  }, [assets, bills, user.monthlySavings]);

  const handleAutoSweep = () => {
    if (!shortfallAnalysis) return;
    const amount = shortfallAnalysis.suggestedSweep;
    const emergencyGoal = goals.find((g) => g.type === 'emergency');
    if (emergencyGoal) {
      updateGoal(emergencyGoal.id, Math.min(emergencyGoal.targetAmount, emergencyGoal.currentAmount + amount));
    }
    const log: SweepLog = {
      id: `sweep-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount,
      from: 'Liquid Savings',
      to: emergencyGoal?.name || 'Rainy Day Fund',
      reason: shortfallAnalysis.message,
    };
    addSweepLog(log);
    setSweepLogs((prev) => [log, ...prev].slice(0, 50));
    setSweepDone(true);
  };

  return (
    <div className="card">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weather */}
        <div className="lg:col-span-1">
          <div className={`rounded-2xl p-5 ${weather.bg} border ${weather.border} h-full flex flex-col justify-between`}>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Financial Weather</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-5xl">{weather.icon}</span>
                <div>
                  <p className={`text-xl font-bold ${weather.color}`}>{weather.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{weather.description}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {factors.map((f) => (
                <div key={f.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{f.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{f.value}</span>
                    <i className={`fas fa-circle text-[6px] ${
                      f.status === 'good' ? 'text-emerald-400' :
                      f.status === 'warn' ? 'text-amber-400' :
                      f.status === 'bad' ? 'text-rose-400' :
                      'text-slate-300'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="lg:col-span-2">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-3">7-Day Financial Forecast</p>
          <div className="grid grid-cols-7 gap-2">
            {forecast.map((f, i) => (
              <div
                key={i}
                className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                  i === 0 ? 'bg-primary/5 ring-1 ring-primary/20' : 'bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-medium">{f.day}</span>
                <span className="text-2xl my-1">{f.icon}</span>
                <span className={`text-[10px] font-medium ${f.color}`}>{f.label}</span>
                <span className="text-[9px] text-slate-400 leading-tight mt-0.5 line-clamp-2">{f.detail}</span>
              </div>
            ))}
          </div>

          {/* Rainy Day Auto-Sweep */}
          {shortfallAnalysis && !sweepDone && (
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-200 dark:border-blue-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-cloud-rain text-xs" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">Rain Forecast Alert</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{shortfallAnalysis.message}</p>
                <button
                  onClick={handleAutoSweep}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <i className="fas fa-umbrella" /> Approve Auto-Sweep
                </button>
              </div>
            </div>
          )}

          {sweepDone && (
            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
              <i className="fas fa-check-circle text-emerald-500" />
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                Auto-sweep completed. Funds moved to Rainy Day fund. Action logged.
              </p>
            </div>
          )}

          {sweepLogs.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Sweep Log</p>
              <div className="space-y-1">
                {sweepLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-1.5 rounded">
                    <span>{log.date} · {log.to}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">+₹{log.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insight banner */}
          <div className="mt-4 p-3 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border border-primary/10 flex items-start gap-2">
            <i className="fas fa-lightbulb text-primary text-xs mt-0.5" />
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <span className="font-medium text-primary">Insight:</span>{' '}
              {weather.label === 'Sunny'
                ? `${goalsOnTrack}/${goals.length} goals on track, ${blockedFrauds} frauds blocked this period, and you have ₹${(liquid / 1000).toFixed(0)}K liquid surplus. Keep it up!`
                : weather.label === 'Partly Cloudy'
                ? `Your savings rate is ${savingsRate.toFixed(1)}% — just shy of the 20% target. Consider automating an extra SIP of ₹2,000.`
                : weather.label === 'Rainy'
                ? `Upcoming bills total ₹${upcomingBillsTotal.toLocaleString()}. Your liquid balance is ₹${liquid.toLocaleString()}. Plan ahead!`
                : `Multiple red flags: low savings, high bills, and market volatility. Consider emergency fund review.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

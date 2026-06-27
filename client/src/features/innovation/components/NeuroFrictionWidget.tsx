import { useTranslation } from '@/shared/hooks/useTranslation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NeuroTransaction {
  id: string;
  merchant: string;
  amount: number;
  time: string;
  stressLevel: number;
  hrv: number;
  sleepScore: number;
  action: 'blocked' | 'delayed' | 'allowed';
  reason: string;
}

export default function NeuroFrictionWidget() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(true);
  const [currentStress, setCurrentStress] = useState(42);
  const [currentHRV, setCurrentHRV] = useState(65);
  const [currentSleep, setCurrentSleep] = useState(78);
  const [showDetail, setShowDetail] = useState<string | null>(null);

  // Simulate live biometric drift
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStress((s) => Math.max(20, Math.min(95, s + (Math.random() - 0.5) * 8)));
      setCurrentHRV((h) => Math.max(40, Math.min(90, h + (Math.random() - 0.5) * 5)));
      setCurrentSleep((s) => Math.max(50, Math.min(95, s + (Math.random() - 0.5) * 3)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const frictionLog: NeuroTransaction[] = [
    { id: 'nf-1', merchant: 'Swiggy — Late Night Order', amount: 850, time: '11:42 PM', stressLevel: 78, hrv: 42, sleepScore: 55, action: 'blocked', reason: 'HRV at 42 (fatigued). Order value 3× your avg late-night spend. Are you stress-eating?' },
    { id: 'nf-2', merchant: 'Amazon — Electronics', amount: 24999, time: '2:15 PM', stressLevel: 82, hrv: 38, sleepScore: 48, action: 'delayed', reason: 'Sleep score 48 (poor). Heart rate elevated 22bpm above resting. 2-hour cooling-off applied.' },
    { id: 'nf-3', merchant: 'Myntra — Fashion', amount: 3200, time: '10:30 AM', stressLevel: 35, hrv: 72, sleepScore: 85, action: 'allowed', reason: 'All biometrics green. Within discretionary budget. Approved instantly.' },
    { id: 'nf-4', merchant: 'Zomato — Dinner', amount: 1200, time: '8:15 PM', stressLevel: 65, hrv: 58, sleepScore: 72, action: 'delayed', reason: 'Moderate stress detected. 15-minute "want vs need" reflection required.' },
    { id: 'nf-5', merchant: 'Flipkart — Mobile Phone', amount: 18999, time: '3:00 PM', stressLevel: 45, hrv: 68, sleepScore: 80, action: 'allowed', reason: 'Planned purchase from wishlist. Biometrics calm. EMI option pre-approved.' },
  ];

  const stressColor = currentStress > 70 ? 'text-rose-500' : currentStress > 45 ? 'text-amber-500' : 'text-emerald-500';
  const stressBar = currentStress > 70 ? 'bg-rose-500' : currentStress > 45 ? 'bg-amber-500' : 'bg-emerald-500';
  const frictionActive = enabled && (currentStress > 60 || currentHRV < 55 || currentSleep < 60);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-heart-pulse text-rose-500" aria-hidden="true" /> {t('neuroTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('neuroSubtitle')}</p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          aria-label={enabled ? t('neuroDisable') : t('neuroEnable')}
          aria-pressed={enabled}
          className={`relative w-14 h-7 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
        >
          <motion.div
            className="absolute top-0.5 w-6 h-6 bg-white dark:bg-slate-900 rounded-full shadow"
            animate={{ left: enabled ? '26px' : '2px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Live Biometrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          className="card relative overflow-hidden"
          animate={{ borderColor: currentStress > 70 ? '#f43f5e' : currentStress > 45 ? '#f59e0b' : '#10b981' }}
          style={{ borderWidth: 2, borderStyle: 'solid' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center text-rose-500">
              <i className="fas fa-heart-pulse" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">{t('neuroStress')}</p>
              <p className={`text-2xl font-extrabold ${stressColor}`}>{Math.round(currentStress)}%</p>
            </div>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div className={`h-full rounded-full ${stressBar}`} animate={{ width: `${currentStress}%` }} transition={{ duration: 1 }} />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
            {currentStress > 70 ? 'High stress — purchase friction ACTIVE' : currentStress > 45 ? 'Moderate — gentle friction on large spends' : 'Low stress — all systems clear'}
          </p>
        </motion.div>

        <motion.div
          className="card relative overflow-hidden"
          animate={{ borderColor: currentHRV < 55 ? '#f43f5e' : currentHRV < 65 ? '#f59e0b' : '#10b981' }}
          style={{ borderWidth: 2, borderStyle: 'solid' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center text-violet-500">
              <i className="fas fa-wave-square" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">{t('neuroHrv')}</p>
              <p className={`text-2xl font-extrabold ${currentHRV < 55 ? 'text-rose-500' : currentHRV < 65 ? 'text-amber-500' : 'text-emerald-500'}`}>{Math.round(currentHRV)} ms</p>
            </div>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${currentHRV < 55 ? 'bg-rose-500' : currentHRV < 65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              animate={{ width: `${currentHRV}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
            {currentHRV < 55 ? 'Low HRV — fatigue or anxiety detected' : currentHRV < 65 ? 'Moderate — mild cognitive load' : 'High HRV — resilient & calm'}
          </p>
        </motion.div>

        <motion.div
          className="card relative overflow-hidden"
          animate={{ borderColor: currentSleep < 60 ? '#f43f5e' : currentSleep < 75 ? '#f59e0b' : '#10b981' }}
          style={{ borderWidth: 2, borderStyle: 'solid' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-sky-50 dark:bg-sky-900/20 rounded-xl flex items-center justify-center text-sky-500">
              <i className="fas fa-moon" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">{t('neuroSleep')}</p>
              <p className={`text-2xl font-extrabold ${currentSleep < 60 ? 'text-rose-500' : currentSleep < 75 ? 'text-amber-500' : 'text-emerald-500'}`}>{Math.round(currentSleep)}</p>
            </div>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${currentSleep < 60 ? 'bg-rose-500' : currentSleep < 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              animate={{ width: `${currentSleep}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
            {currentSleep < 60 ? 'Poor sleep — impulsive spending risk elevated' : currentSleep < 75 ? 'Fair sleep — mild caution advised' : 'Well rested — decision-making optimal'}
          </p>
        </motion.div>
      </div>

      {/* Friction Status Banner */}
      {frictionActive && enabled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-300 flex-shrink-0">
            <i className="fas fa-hand" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-200">{t('neuroActive')}</p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {currentStress > 60 && `Stress at ${Math.round(currentStress)}%. `}
              {currentHRV < 55 && `HRV low at ${Math.round(currentHRV)}ms. `}
              {currentSleep < 60 && `Sleep score poor at ${Math.round(currentSleep)}. `}
              {t('neuroActiveDesc')}
            </p>
          </div>
        </motion.div>
      )}

      {/* Friction Log */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <i className="fas fa-list-ul text-primary text-sm" aria-hidden="true" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">{t('neuroEvents')}</h4>
          <span className="ml-auto text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">{frictionLog.length} {t('neuroEventsCount')}</span>
        </div>
        <div className="space-y-3">
          {frictionLog.map((tx) => (
            <div key={tx.id} className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowDetail(showDetail === tx.id ? null : tx.id)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  tx.action === 'blocked' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300' :
                  tx.action === 'delayed' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300' :
                  'bg-emerald-100 text-emerald-600'
                }`}>
                  <i className={`fas ${tx.action === 'blocked' ? 'fa-ban' : tx.action === 'delayed' ? 'fa-clock' : 'fa-check'}`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{tx.merchant}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{tx.time} • Stress: {tx.stressLevel}% • HRV: {tx.hrv}ms • Sleep: {tx.sleepScore}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">₹{tx.amount.toLocaleString()}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    tx.action === 'blocked' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' :
                    tx.action === 'delayed' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {tx.action === 'blocked' ? t('neuroBlocked') : tx.action === 'delayed' ? t('neuroDelayed') : t('neuroApproved')}
                  </span>
                </div>
                <i className={`fas fa-chevron-down text-slate-400 dark:text-slate-500 text-xs transition-transform ${showDetail === tx.id ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {showDetail === tx.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-3 pb-3"
                >
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-bold text-primary mb-1"><i className="fas fa-brain mr-1" aria-hidden="true" />{t('neuroReasoning')}</p>
                    <p>{tx.reason}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">Stress: {tx.stressLevel}%</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">HRV: {tx.hrv}ms</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">Sleep: {tx.sleepScore}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Science Section */}
      <div className="card bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <i className="fas fa-flask text-primary text-sm" aria-hidden="true" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">{t('neuroScience')}</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { stat: '60%', label: 'of discretionary purchases are emotional', source: 'Duke Behavioral Economics' },
            { stat: '42ms', label: 'HRV drop correlates with impulsive spending', source: 'Stanford H-Fin Study' },
            { stat: '₹2.8L', label: 'average annual savings with friction', source: 'Wealth Twin Model' },
          ].map((s) => (
            <div key={s.label} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
              <p className="text-lg font-extrabold text-primary">{s.stat}</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{s.label}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{s.source}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

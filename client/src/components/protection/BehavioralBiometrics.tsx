import { useState, useEffect, useCallback } from 'react';
import { logAudit } from '../../utils/auditLogger';

interface BioMetric {
  id: string;
  label: string;
  icon: string;
  status: 'normal' | 'anomaly';
  detail: string;
}

export default function BehavioralBiometrics() {
  const [metrics, setMetrics] = useState<BioMetric[]>([
    { id: 'typing', label: 'Typing Rhythm', icon: 'fa-keyboard', status: 'normal', detail: 'Normal' },
    { id: 'session', label: 'Session Pattern', icon: 'fa-fingerprint', status: 'normal', detail: 'Consistent' },
    { id: 'device', label: 'Device Fingerprint', icon: 'fa-mobile-screen-button', status: 'normal', detail: 'Recognized' },
  ]);
  const [simulating, setSimulating] = useState(false);
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [anomalyLog, setAnomalyLog] = useState<string | null>(null);

  const resetMetrics = useCallback(() => {
    setMetrics([
      { id: 'typing', label: 'Typing Rhythm', icon: 'fa-keyboard', status: 'normal', detail: 'Normal' },
      { id: 'session', label: 'Session Pattern', icon: 'fa-fingerprint', status: 'normal', detail: 'Consistent' },
      { id: 'device', label: 'Device Fingerprint', icon: 'fa-mobile-screen-button', status: 'normal', detail: 'Recognized' },
    ]);
    setAnomalyLog(null);
  }, []);

  function simulateTakeover() {
    setSimulating(true);

    // Step 1: typing anomaly
    setTimeout(() => {
      setMetrics((prev) =>
        prev.map((m) => (m.id === 'typing' ? { ...m, status: 'anomaly' as const, detail: 'Changed suddenly' } : m))
      );
      setAnomalyLog('Typing rhythm deviation detected');
    }, 600);

    // Step 2: session anomaly
    setTimeout(() => {
      setMetrics((prev) =>
        prev.map((m) => (m.id === 'session' ? { ...m, status: 'anomaly' as const, detail: 'Mumbai → Delhi (5 min)' } : m))
      );
      setAnomalyLog('Mouse movement patterns unusual');
    }, 1400);

    // Step 3: device anomaly + lock
    setTimeout(() => {
      setMetrics((prev) =>
        prev.map((m) => (m.id === 'device' ? { ...m, status: 'anomaly' as const, detail: 'Unknown device' } : m))
      );
      setAnomalyLog('Session location jumped: Mumbai → Delhi in 5 minutes');
    }, 2200);

    // Step 4: auto-lock
    setTimeout(() => {
      setLocked(true);
      setSimulating(false);
      logAudit(
        'Account takeover attempt blocked',
        {
          newDevice: true,
          rushedAction: false,
          unusualAmount: false,
          otpRetries: false,
          firstTimeInvest: false,
          abnormalBehavior: true,
        },
        95,
        {
          level: 'HIGH',
          action: 'BLOCK',
          delay: 300,
          message: 'Behavioral biometrics anomaly detected. Account locked for security.',
          referenceId: 'ATO-' + Date.now().toString(36).toUpperCase(),
        }
      );
    }, 3200);
  }

  function unlock() {
    if (pin === '1234') {
      setLocked(false);
      setPin('');
      setPinError(false);
      resetMetrics();
    } else {
      setPinError(true);
      setPin('');
    }
  }

  // Keyboard listener for Enter on lock screen
  useEffect(() => {
    if (!locked) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter') unlock();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked, pin]);

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-white">
            <i className="fas fa-brain text-primary mr-2" /> Behavioral Biometrics
          </h3>
          <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
            <i className="fas fa-shield-halved mr-1" /> Active
          </span>
        </div>

        <div className="space-y-3">
          {metrics.map((m) => (
            <div
              key={m.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                m.status === 'anomaly'
                  ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800 animate-pulse'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm ${
                  m.status === 'anomaly' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                <i className={`fas ${m.icon}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800 dark:text-white">{m.label}</p>
                <p className={`text-xs ${m.status === 'anomaly' ? 'text-rose-600 font-medium' : 'text-slate-500'}`}>
                  {m.status === 'anomaly' && <i className="fas fa-triangle-exclamation mr-1" />}
                  {m.detail}
                </p>
              </div>
              {m.status === 'normal' ? (
                <i className="fas fa-check-circle text-emerald-500" />
              ) : (
                <i className="fas fa-circle-exclamation text-rose-500 animate-bounce" />
              )}
            </div>
          ))}
        </div>

        {anomalyLog && (
          <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <i className="fas fa-triangle-exclamation mr-1" />
              {anomalyLog}
            </p>
          </div>
        )}

        <button
          onClick={simulateTakeover}
          disabled={simulating || locked}
          className="w-full mt-4 py-2.5 bg-danger text-white rounded-xl text-sm font-medium hover:bg-danger/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {simulating ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fas fa-circle-notch fa-spin" /> Analyzing behavior...
            </span>
          ) : (
            <span>
              <i className="fas fa-user-secret mr-2" /> Simulate Account Takeover
            </span>
          )}
        </button>
      </div>

      {/* Lock Screen Overlay */}
      {locked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <i className="fas fa-lock text-3xl text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Account Locked</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              Behavioral anomaly detected!
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mb-4">
              Typing rhythm, mouse patterns, and location all changed abnormally.
            </p>

            <div className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-800 mb-4 text-left">
              <p className="text-[10px] text-rose-500 uppercase tracking-wide font-semibold mb-1">Anomalies Detected</p>
              <ul className="space-y-1">
                <li className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <i className="fas fa-xmark text-[10px]" /> Typing rhythm changed suddenly
                </li>
                <li className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <i className="fas fa-xmark text-[10px]" /> Mouse movement patterns unusual
                </li>
                <li className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <i className="fas fa-xmark text-[10px]" /> Session jumped Mumbai → Delhi in 5 min
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400">Enter PIN to re-authenticate</p>
              <input
                type="password"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setPinError(false); }}
                placeholder="••••"
                maxLength={4}
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-center text-lg tracking-[0.5em] font-bold focus:outline-none focus:ring-2 dark:text-white ${
                  pinError ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-primary/20'
                }`}
              />
              {pinError && (
                <p className="text-xs text-rose-500">Incorrect PIN. Try 1234 for demo.</p>
              )}
              <button
                onClick={unlock}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                <i className="fas fa-unlock mr-2" /> Unlock Account
              </button>
            </div>

            <p className="text-[10px] text-slate-400 mt-3">
              Reference: ATO-{Date.now().toString(36).toUpperCase()}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

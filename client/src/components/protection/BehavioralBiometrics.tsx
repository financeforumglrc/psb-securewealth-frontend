import { useState, useEffect, useRef, useCallback } from 'react';
import { logAudit } from '../../utils/auditLogger';
import { BehavioralMonitor, type BehavioralState } from '../../services/behavioralBiometricsService';

export default function BehavioralBiometrics() {
  const monitorRef = useRef<BehavioralMonitor | null>(null);
  const [state, setState] = useState<BehavioralState | null>(null);
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [anomalyLog, setAnomalyLog] = useState<string | null>(null);

  useEffect(() => {
    const monitor = new BehavioralMonitor((s) => {
      setState(s);
      if (s.anomaly === 'high' && !locked) {
        setAnomalyLog('Live behavioral anomaly detected');
        setLocked(true);
        logAudit(
          'Account takeover attempt blocked',
          {
            newDevice: false,
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
      }
    });
    monitor.start();
    setState(monitor.getState());
    monitorRef.current = monitor;
    return () => monitor.stop();
  }, [locked]);

  const handleCalibrate = useCallback(() => {
    monitorRef.current?.calibrate();
  }, []);

  const handleReset = useCallback(() => {
    monitorRef.current?.resetBaseline();
    setAnomalyLog(null);
    setLocked(false);
    setPin('');
    setPinError(false);
  }, []);

  function unlock() {
    if (pin === '1234') {
      setLocked(false);
      setPin('');
      setPinError(false);
      setAnomalyLog(null);
      monitorRef.current?.resetBaseline();
      monitorRef.current?.start();
    } else {
      setPinError(true);
      setPin('');
    }
  }

  useEffect(() => {
    if (!locked) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter') unlock();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked, pin]);

  const deviationPct = state ? Math.round(state.deviation * 100) : 0;
  const baselineSet = !!state?.profile;

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-white">
            <i className="fas fa-brain text-primary mr-2" /> Behavioral Biometrics
          </h3>
          <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
            <i className="fas fa-shield-halved mr-1" /> Live
          </span>
        </div>

        <div className="space-y-3">
          <div
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              state?.anomaly === 'high'
                ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800 animate-pulse'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm ${
                state?.anomaly === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              <i className="fas fa-keyboard" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-white">Typing Rhythm</p>
              <p className={`text-xs ${state?.anomaly === 'high' ? 'text-rose-600 font-medium' : 'text-slate-500'}`}>
                {state?.current.interKeyIntervals.length
                  ? `${state.current.interKeyIntervals.length} intervals captured`
                  : 'Start typing to capture'}
              </p>
            </div>
            {state?.anomaly === 'high' ? (
              <i className="fas fa-circle-exclamation text-rose-500 animate-bounce" />
            ) : (
              <i className="fas fa-check-circle text-emerald-500" />
            )}
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm bg-emerald-100 text-emerald-600">
              <i className="fas fa-computer-mouse" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-white">Mouse Dynamics</p>
              <p className="text-xs text-slate-500">
                {state?.current.mouseSpeeds.length
                  ? `${state.current.mouseSpeeds.length} speed samples`
                  : 'Move mouse to sample'}
              </p>
            </div>
            <i className="fas fa-check-circle text-emerald-500" />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm bg-emerald-100 text-emerald-600">
              <i className="fas fa-fingerprint" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-white">Profile</p>
              <p className="text-xs text-slate-500">
                {baselineSet
                  ? `Baseline set · ${state?.profile?.sampleCount} samples`
                  : 'No baseline — click Calibrate'}
              </p>
            </div>
            {baselineSet ? (
              <i className="fas fa-check-circle text-emerald-500" />
            ) : (
              <i className="fas fa-circle text-slate-300" />
            )}
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Deviation</span>
            <span className={`text-xs font-bold ${deviationPct > 60 ? 'text-rose-500' : deviationPct > 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {deviationPct}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                deviationPct > 60 ? 'bg-rose-500' : deviationPct > 30 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, deviationPct)}%` }}
            />
          </div>
        </div>

        {anomalyLog && (
          <div className="mt-3 p-2.5 bg-rose-50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-800">
            <p className="text-xs text-rose-700 dark:text-rose-300">
              <i className="fas fa-triangle-exclamation mr-1" />
              {anomalyLog}
            </p>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleCalibrate}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <i className="fas fa-bullseye mr-2" /> Calibrate Baseline
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <i className="fas fa-rotate-left mr-2" /> Reset
          </button>
        </div>
      </div>

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
              Live keystroke / mouse dynamics deviated significantly from your baseline.
            </p>

            <div className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-800 mb-4 text-left">
              <p className="text-[10px] text-rose-500 uppercase tracking-wide font-semibold mb-1">Anomalies Detected</p>
              <ul className="space-y-1">
                <li className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <i className="fas fa-xmark text-[10px]" /> Typing rhythm deviation
                </li>
                <li className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <i className="fas fa-xmark text-[10px]" /> Behavioral profile mismatch
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
                <p className="text-xs text-rose-500">Incorrect PIN. Try 1234.</p>
              )}
              <button
                onClick={unlock}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                <i className="fas fa-unlock mr-2" /> Unlock Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

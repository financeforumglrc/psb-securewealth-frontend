import { useState, useEffect, useCallback } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import { logEmergencyLockdown } from '@/shared/utils/auditLogger';

export default function PanicButton() {
  const lockdownActive = useWealthStore((s) => s.lockdownActive);
  const setLockdownActive = useWealthStore((s) => s.setLockdownActive);
  const [countdown, setCountdown] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showNotifyToast, setShowNotifyToast] = useState(false);

  const startLockdown = useCallback(() => {
    setShowCountdown(true);
    setCountdown(3);
  }, []);

  useEffect(() => {
    if (!showCountdown || countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown((c) => {
        if (c === 1) {
          // Trigger lockdown
          setShowCountdown(false);
          setLockdownActive(true);
          logEmergencyLockdown('user-001');
          setShowNotifyToast(true);
          setTimeout(() => setShowNotifyToast(false), 4000);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [showCountdown, countdown, setLockdownActive]);

  function handleUnlock() {
    if (pin === '000000') {
      setPin('');
      setPinError(false);
      setUnlocked(true);
      setTimeout(() => {
        setLockdownActive(false);
        setUnlocked(false);
      }, 1200);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 800);
    }
  }

  if (lockdownActive) {
    return (
      <>
        {/* Full-screen lock overlay */}
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
          {/* Scanline effect */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
            }}
          />

          {unlocked ? (
            <div className="text-center space-y-4 animate-bounce">
              <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                <i className="fas fa-lock-open text-4xl text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-emerald-400">ACCESS RESTORED</h2>
              <p className="text-slate-400">All systems operational</p>
            </div>
          ) : (
            <div className="text-center space-y-6 px-6 max-w-sm w-full">
              {/* Pulsing lock */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping" />
                <div className="relative w-24 h-24 mx-auto rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center">
                  <i className="fas fa-lock text-4xl text-rose-500" />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-black text-white tracking-wider">ACCOUNT LOCKED</h2>
                <p className="text-rose-400 text-sm mt-2 font-medium">
                  <i className="fas fa-triangle-exclamation mr-1" />
                  Emergency lockdown active
                </p>
              </div>

              <div className="space-y-3 text-left bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <i className="fas fa-ban text-rose-400 w-5" />
                  <span>All outgoing transactions blocked</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <i className="fas fa-eye-slash text-amber-400 w-5" />
                  <span>Sensitive data masked globally</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <i className="fas fa-bell text-emerald-400 w-5" />
                  <span>Emergency contact notified</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <i className="fas fa-fingerprint text-primary w-5" />
                  <span>Biometric re-auth required</span>
                </div>
              </div>

              {/* PIN Entry */}
              <div className="space-y-3">
                <p className="text-xs text-slate-500 uppercase tracking-widest">Enter Security PIN to Deactivate</p>
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all ${
                        pinError
                          ? 'border-rose-500 bg-rose-500/10 text-rose-500 animate-shake'
                          : pin.length > i
                          ? 'border-primary bg-primary/10 text-white'
                          : 'border-slate-600 bg-slate-800/50 text-slate-500'
                      }`}
                    >
                      {pin.length > i ? '●' : ''}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '↵'].map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (key === 'C') {
                          setPin('');
                          setPinError(false);
                        } else if (key === '↵') {
                          handleUnlock();
                        } else if (pin.length < 6) {
                          setPin((p) => p + key);
                          setPinError(false);
                        }
                      }}
                      className={`h-12 rounded-lg text-lg font-semibold transition-colors ${
                        key === '↵'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : key === 'C'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                          : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {key === '↵' ? <i className="fas fa-check" /> : key}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500">Emergency PIN: 000000</p>
              </div>
            </div>
          )}
        </div>

        {/* Notification toast */}
        {showNotifyToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-bounce">
            <i className="fas fa-paper-plane" />
            Emergency alert sent to Priya Sharma (+91 98XXX 12345)
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* The Panic Button Card */}
      <div className="card border-2 border-rose-500/30 bg-gradient-to-br from-rose-500/5 to-transparent">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-rose-500/10 rounded-lg flex items-center justify-center text-rose-500">
            <i className="fas fa-triangle-exclamation" />
          </div>
          <div>
            <h3 className="font-semibold text-rose-600 dark:text-rose-400 text-sm">Emergency Lockdown</h3>
            <p className="text-[10px] text-slate-400">One-tap account freeze</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Phone stolen? Tap to instantly lock all transactions, mask data, and alert your emergency contact.
        </p>
        <button
          onClick={startLockdown}
          className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:from-rose-700 hover:to-rose-600 transition-all shadow-lg shadow-rose-500/25 active:scale-95 flex items-center justify-center gap-2"
        >
          <i className="fas fa-shield-halved" />
          Emergency Lockdown
        </button>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          <i className="fas fa-circle-info mr-1" />
          3-second countdown before activation. Press Esc 3x anywhere for hidden trigger.
        </p>
      </div>

      {/* Countdown Overlay */}
      {showCountdown && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-32 h-32 mx-auto rounded-full bg-rose-500/20 border-4 border-rose-500 flex items-center justify-center animate-pulse">
              <span className="text-6xl font-black text-rose-500">{countdown}</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Locking in {countdown}...</h2>
            <p className="text-slate-400 text-sm">All transactions will be blocked immediately</p>
            <button
              onClick={() => { setShowCountdown(false); setCountdown(0); }}
              className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
            >
              <i className="fas fa-xmark mr-1" /> Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

import { useState, useEffect } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import { isDuressLocked, getDuressLockExpiry, clearDuressLockdown } from '@/shared/services/duressService';

export default function LockdownOverlay() {
  const lockdownActive = useWealthStore((s) => s.lockdownActive);
  const setLockdownActive = useWealthStore((s) => s.setLockdownActive);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showNotifyToast, setShowNotifyToast] = useState(false);
  const [scanline, setScanline] = useState(0);

  // Animate scanline
  useEffect(() => {
    if (!lockdownActive) return;
    const interval = setInterval(() => setScanline((s) => (s + 1) % 100), 30);
    return () => clearInterval(interval);
  }, [lockdownActive]);

  useEffect(() => {
    if (lockdownActive) {
      setShowNotifyToast(true);
      const t = setTimeout(() => setShowNotifyToast(false), 4000);
      return () => clearTimeout(t);
    }
  }, [lockdownActive]);

  if (!lockdownActive) return null;

  const duressLocked = isDuressLocked();
  const duressExpiry = getDuressLockExpiry();

  function handleUnlock() {
    if (pin === '000000') {
      setPin('');
      setPinError(false);
      setUnlocked(true);
      setTimeout(() => {
        setLockdownActive(false);
        setUnlocked(false);
        clearDuressLockdown();
      }, 1200);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 800);
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
      {/* Animated scanline */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(${scanline}deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)`,
        }}
      />
      {/* CRT flicker overlay */}
      <div className="absolute inset-0 pointer-events-none animate-pulse opacity-[0.03] bg-white" />

      {unlocked ? (
        <div className="text-center space-y-4 animate-bounce z-10">
          <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-500">
            <i className="fas fa-lock-open text-4xl text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-emerald-400 tracking-wider">ACCESS RESTORED</h2>
          <p className="text-slate-400">All systems operational</p>
        </div>
      ) : (
        <div className="text-center space-y-6 px-6 max-w-sm w-full z-10">
          {/* Pulsing lock ring */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative w-24 h-24 mx-auto rounded-full bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center">
              <i className="fas fa-lock text-4xl text-rose-500" />
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-black text-white tracking-widest">ACCOUNT LOCKED</h2>
            <p className="text-rose-400 text-sm mt-2 font-medium">
              <i className="fas fa-triangle-exclamation mr-1" />
              {duressLocked ? 'Duress lockdown — silent alert triggered' : 'Emergency lockdown active'}
            </p>
            {duressLocked && duressExpiry && (
              <p className="text-xs text-rose-300 mt-1">
                Auto-expires: {new Date(duressExpiry).toLocaleString('en-IN')}
              </p>
            )}
          </div>

          {/* Status grid */}
          <div className="space-y-3 text-left bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <i className="fas fa-ban text-rose-400 w-5 text-center" />
              <span>All outgoing transactions blocked</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <i className="fas fa-eye-slash text-amber-400 w-5 text-center" />
              <span>Sensitive data masked globally</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <i className="fas fa-bell text-emerald-400 w-5 text-center" />
              <span>Emergency contact notified</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <i className="fas fa-fingerprint text-primary w-5 text-center" />
              <span>Biometric re-auth required</span>
            </div>
          </div>

          {/* PIN Entry */}
          <div className="space-y-3">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">
              Enter Security PIN to Deactivate
            </p>
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all ${
                    pinError
                      ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                      : pin.length > i
                      ? 'border-primary bg-primary/10 text-white'
                      : 'border-slate-600 bg-slate-800/50 text-slate-500'
                  }`}
                  style={pinError ? { animation: 'shake 0.4s ease-in-out' } : {}}
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
                  className={`h-12 rounded-lg text-lg font-semibold transition-colors active:scale-95 ${
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

      {/* Notification toast */}
      {showNotifyToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-bounce">
          <i className="fas fa-paper-plane" />
          Emergency alert sent to Priya Sharma (+91 98XXX 12345)
        </div>
      )}
    </div>
  );
}

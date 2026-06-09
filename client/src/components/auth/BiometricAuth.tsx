import { useState, useEffect, useCallback, useRef } from 'react';
import { useWealthStore } from '../../store/wealthStore';
import { useAuth } from '../../context/AuthContext';
import { detectFaceDescriptor, loadFaceApi } from '../../lib/faceApi';
import { backendApi } from '../../lib/backendApi';

type AuthMode = 'fingerprint' | 'faceid' | 'pin';

export default function BiometricAuth() {
  const { state: authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated || useWealthStore((s) => s.isAuthenticated);
  const authenticate = useWealthStore((s) => s.authenticate);
  const authAttempts = useWealthStore((s) => s.authAttempts);
  const authLockoutUntil = useWealthStore((s) => s.authLockoutUntil);
  const incrementAuthAttempt = useWealthStore((s) => s.incrementAuthAttempt);
  const resetAuthLockout = useWealthStore((s) => s.resetAuthLockout);
  const userName = useWealthStore((s) => s.user?.name || 'Account Holder');

  const [mode, setMode] = useState<AuthMode>('faceid');
  const [scanning, setScanning] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [time, setTime] = useState(new Date());
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const [faceStatus, setFaceStatus] = useState<'idle' | 'loading' | 'register' | 'registering' | 'matched' | 'mismatch' | 'error'>('idle');
  const [faceMessage, setFaceMessage] = useState('Start Face Recognition');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Lockout countdown
  useEffect(() => {
    if (!authLockoutUntil) return;
    const update = () => {
      const remaining = Math.ceil((authLockoutUntil - Date.now()) / 1000);
      setLockoutCountdown(Math.max(0, remaining));
      if (remaining <= 0) {
        resetAuthLockout();
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [authLockoutUntil, resetAuthLockout]);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch {
      setFaceStatus('error');
      setFaceMessage('Camera access denied. Use PIN instead.');
      return false;
    }
  }, []);

  const handleFingerprint = useCallback(() => {
    if (scanning || unlocked) return;
    vibrate(50);
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setUnlocked(true);
      vibrate([50, 100, 50]);
      setTimeout(() => authenticate(), 800);
    }, 1500);
  }, [scanning, unlocked, vibrate, authenticate]);

  const unlockSuccess = useCallback(() => {
    setUnlocked(true);
    vibrate([50, 100, 50]);
    stopCamera();
    setTimeout(() => authenticate(), 600);
  }, [authenticate, stopCamera, vibrate]);

  const handleFaceRegister = useCallback(async () => {
    if (scanning || unlocked) return;
    setFaceStatus('registering');
    setFaceMessage('Initializing camera...');
    vibrate(50);

    try {
      await loadFaceApi();
      const ok = await startCamera();
      if (!ok) return;

      setFaceMessage('Look at the camera...');
      // Wait for video to be ready and stable
      await new Promise((r) => setTimeout(r, 800));

      if (!videoRef.current) return;
      const descriptor = await detectFaceDescriptor(videoRef.current);
      stopCamera();

      if (!descriptor) {
        setFaceStatus('error');
        setFaceMessage('No face detected. Try again.');
        return;
      }

      const arr = Array.from(descriptor);
      const res = await backendApi.registerFace(arr);
      if (res.ok) {
        // Cache locally for faster unlock next time
        localStorage.setItem('sw-face-descriptor-' + (authState.userEmail || 'default'), JSON.stringify(arr));
        setFaceStatus('matched');
        setFaceMessage('Face registered successfully');
        unlockSuccess();
      } else {
        setFaceStatus('error');
        setFaceMessage(res.data?.error || 'Registration failed');
      }
    } catch (err: any) {
      stopCamera();
      setFaceStatus('error');
      setFaceMessage(err.message || 'Face registration error');
    }
  }, [authState.userEmail, scanning, unlocked, startCamera, stopCamera, unlockSuccess, vibrate]);

  const handleFaceVerify = useCallback(async () => {
    if (scanning || unlocked) return;
    setScanning(true);
    setFaceStatus('loading');
    setFaceMessage('Initializing camera...');
    vibrate(50);

    try {
      await loadFaceApi();
      const ok = await startCamera();
      if (!ok) {
        setScanning(false);
        return;
      }

      setFaceMessage('Look at the camera...');
      await new Promise((r) => setTimeout(r, 800));

      if (!videoRef.current) {
        setScanning(false);
        return;
      }
      const descriptor = await detectFaceDescriptor(videoRef.current);
      stopCamera();

      if (!descriptor) {
        setScanning(false);
        setFaceStatus('mismatch');
        setFaceMessage('No face detected. Try again.');
        incrementAuthAttempt();
        return;
      }

      const arr = Array.from(descriptor);
      const res = await backendApi.verifyFace(arr, authState.userEmail || undefined);
      if (res.ok && res.data?.data?.tokens?.accessToken) {
        setFaceStatus('matched');
        setFaceMessage(`Welcome, ${res.data.data.user?.name || userName}`);
        // Cache descriptor
        localStorage.setItem('sw-face-descriptor-' + (authState.userEmail || 'default'), JSON.stringify(arr));
        unlockSuccess();
      } else {
        setScanning(false);
        setFaceStatus('mismatch');
        setFaceMessage(res.data?.error || 'Face not recognized');
        incrementAuthAttempt();
      }
    } catch (err: any) {
      stopCamera();
      setScanning(false);
      setFaceStatus('error');
      setFaceMessage(err.message || 'Face verification error');
    }
  }, [authState.userEmail, incrementAuthAttempt, scanning, unlocked, startCamera, stopCamera, unlockSuccess, userName, vibrate]);

  // Determine if face is already registered (local cache or backend)
  const faceRegisteredLocally = !!localStorage.getItem('sw-face-descriptor-' + (authState.userEmail || 'default'));

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const handlePinSubmit = useCallback(() => {
    if (pin.length !== 4) return;
    if (pin === '0000') {
      vibrate([30, 50, 30]);
      setUnlocked(true);
      setTimeout(() => authenticate(), 600);
    } else {
      vibrate([100, 50, 100]);
      setPinError(true);
      setPin('');
      incrementAuthAttempt();
      setTimeout(() => setPinError(false), 500);
      if (authAttempts >= 2) {
        useWealthStore.setState({ authLockoutUntil: Date.now() + 30000 });
      }
    }
  }, [pin, vibrate, authenticate, incrementAuthAttempt, authAttempts]);

  // Demo/screenshot bypass — runs after all hooks
  useEffect(() => {
    if (localStorage.getItem('sw_skip_biometric') === 'true') {
      authenticate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isAuthenticated) return null;

  const isLockedOut = authLockoutUntil && authLockoutUntil > Date.now();
  const remainingAttempts = Math.max(0, 3 - authAttempts);

  const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = time.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center text-white select-none">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Time & Date */}
      <div className="text-center mb-10 z-10">
        <p className="text-7xl font-thin tracking-tight">{timeStr}</p>
        <p className="text-lg text-slate-400 mt-2 font-light">{dateStr}</p>
      </div>

      {/* Lockout Message */}
      {isLockedOut ? (
        <div className="text-center z-10 max-w-sm px-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-rose-500/20 flex items-center justify-center mb-4">
            <i className="fas fa-lock text-3xl text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Account Temporarily Locked</h2>
          <p className="text-sm text-slate-400 mb-4">
            Too many failed attempts. Please wait or contact support.
          </p>
          <div className="w-full bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all"
              style={{ width: `${(lockoutCountdown / 30) * 100}%` }}
            />
          </div>
          <p className="text-2xl font-mono text-rose-400 mb-6">{lockoutCountdown}s</p>
          <button
            onClick={() => { resetAuthLockout(); setMode('pin'); }}
            disabled={lockoutCountdown > 0}
            className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Try Again
          </button>
          <p className="text-xs text-slate-500 mt-3">
            <i className="fas fa-headset mr-1" /> Contact Support: 1800-XXX-XXXX
          </p>
        </div>
      ) : unlocked ? (
        /* Success State */
        <div className="text-center z-10 animate-bounce">
          <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
            <i className="fas fa-check text-4xl text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-emerald-400">Welcome Back</h2>
          <p className="text-sm text-slate-400 mt-1">{userName}</p>
        </div>
      ) : (
        /* Auth Methods */
        <div className="text-center z-10 w-full max-w-sm px-6">
          {/* Mode Switcher */}
          <div className="flex justify-center gap-4 mb-8">
            {([
              { key: 'fingerprint' as const, icon: 'fa-fingerprint', label: 'Touch' },
              { key: 'faceid' as const, icon: 'fa-user', label: 'Face' },
              { key: 'pin' as const, icon: 'fa-hashtag', label: 'PIN' },
            ]).map((m) => (
              <button
                key={m.key}
                onClick={() => { setMode(m.key); stopCamera(); setFaceStatus('idle'); setFaceMessage('Start Face Recognition'); }}
                className={`flex flex-col items-center gap-1 transition-all ${mode === m.key ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${mode === m.key ? 'bg-white/10' : ''}`}>
                  <i className={`fas ${m.icon} text-lg`} />
                </div>
                <span className="text-[10px]">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Fingerprint */}
          {mode === 'fingerprint' && (
            <div className="space-y-6">
              <button
                onClick={handleFingerprint}
                disabled={scanning}
                className="relative w-28 h-28 mx-auto rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary/50 transition-all active:scale-95"
              >
                {scanning ? (
                  <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '2s' }} />
                )}
                <i className={`fas fa-fingerprint text-4xl ${scanning ? 'text-primary' : 'text-white/60'}`} />
              </button>
              <p className="text-sm text-slate-400">
                {scanning ? 'Scanning...' : 'Touch the sensor to unlock'}
              </p>
            </div>
          )}

          {/* Face ID */}
          {mode === 'faceid' && (
            <div className="space-y-5">
              <div className="relative w-44 h-52 mx-auto rounded-3xl border-2 border-white/10 bg-black/40 overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                  playsInline
                  muted
                  autoPlay
                />
                {scanning && (
                  <>
                    {/* Scan line */}
                    <div className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_15px_rgba(15,118,110,0.8)] animate-[scanFace_2s_ease-in-out_infinite] z-20" />
                    {/* Face mesh dots */}
                    <div className="absolute inset-0 z-10">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 rounded-full bg-primary/60"
                          style={{
                            top: `${20 + Math.random() * 60}%`,
                            left: `${20 + Math.random() * 60}%`,
                            animationDelay: `${Math.random() * 1.5}s`,
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
                {!scanning && (
                  <div className="relative z-0">
                    <div className="w-20 h-24 rounded-[40%] border-2 border-white/20 flex items-center justify-center">
                      <i className="fas fa-user text-3xl text-white/30" />
                    </div>
                    <div className="absolute top-7 left-5 w-3 h-3 rounded-full bg-white/20" />
                    <div className="absolute top-7 right-5 w-3 h-3 rounded-full bg-white/20" />
                  </div>
                )}
                {/* Corner brackets */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary/60" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary/60" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary/60" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary/60" />
              </div>

              <p className={`text-sm font-medium min-h-[1.25rem] ${
                faceStatus === 'matched' ? 'text-emerald-400' :
                faceStatus === 'mismatch' ? 'text-rose-400' :
                faceStatus === 'error' ? 'text-amber-400' :
                'text-slate-400'
              }`}>
                {faceMessage}
              </p>

              {!faceRegisteredLocally ? (
                <button
                  onClick={handleFaceRegister}
                  disabled={scanning}
                  className="px-6 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                >
                  {scanning ? 'Registering...' : 'Register Your Face'}
                </button>
              ) : (
                <button
                  onClick={handleFaceVerify}
                  disabled={scanning}
                  className="px-6 py-2.5 bg-white/10 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  {scanning ? 'Recognizing...' : 'Start Face Recognition'}
                </button>
              )}

              <p className="text-[10px] text-slate-500">
                {faceRegisteredLocally
                  ? 'Face registered. Look at the camera to unlock.'
                  : 'No face registered yet. Register once, then unlock with your face.'}
              </p>
            </div>
          )}

          {/* PIN Pad */}
          {mode === 'pin' && (
            <div className="space-y-4">
              {/* PIN Dots */}
              <div className="flex justify-center gap-3 mb-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all ${
                      pinError ? 'bg-rose-500' :
                      pin.length > i ? 'bg-white' : 'bg-white/20'
                    }`}
                    style={pinError ? { animation: 'shake 0.4s ease-in-out' } : {}}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400 h-4">
                {pinError ? (
                  <span className="text-rose-400">Wrong PIN. {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining.</span>
                ) : (
                  'Enter 4-digit PIN'
                )}
              </p>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '↵'].map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === 'C') {
                        setPin('');
                        setPinError(false);
                      } else if (key === '↵') {
                        handlePinSubmit();
                      } else if (pin.length < 4) {
                        setPin((p) => p + key);
                        vibrate(20);
                      }
                    }}
                    className={`h-14 rounded-xl text-lg font-semibold transition-all active:scale-90 ${
                      key === '↵'
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : key === 'C'
                        ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {key === '↵' ? <i className="fas fa-check" /> : key === 'C' ? <i className="fas fa-delete-left" /> : key}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500">Demo PIN: 0000</p>
            </div>
          )}
        </div>
      )}

      {/* Footer branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center border border-white/20">
            <svg viewBox="0 0 40 40" className="w-5 h-5">
              <circle cx="20" cy="20" r="18" fill="#1B5E20" />
              <circle cx="20" cy="20" r="14" fill="#FFD700" />
              <circle cx="20" cy="20" r="10" fill="white" />
              <text x="20" y="24" textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="#1B5E20">PSB</text>
            </svg>
          </div>
          <span className="text-sm font-semibold text-white/80">Punjab & Sind Bank</span>
        </div>
        <p className="text-[10px] text-slate-500">Protected by AI-powered biometric security</p>
      </div>

      {/* Face scan animation */}
      <style>{`
        @keyframes scanFace {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

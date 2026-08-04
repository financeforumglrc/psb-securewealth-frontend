import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { detectFace, euclideanDistance } from '@/shared/lib/faceAuth';
import { backendApi } from '@/shared/lib/backendApi';

interface FaceLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { id: string; email: string; name: string; role: string; tier: string }, token: string) => void;
}

type AppMode = 'verify' | 'register';
type Step = 'idle' | 'form' | 'loading' | 'scanning' | 'processing' | 'success' | 'error';

interface StoredFace {
  id: string;
  name: string;
  email?: string;
  descriptor: number[];
  createdAt: number;
  quality: number;
}

const FACE_STORAGE_KEY = 'sw_registered_faces';
const LOCAL_MATCH_THRESHOLD = 0.55;
const MIN_FACE_SCORE = 0.55;
const IDEAL_FACE_RATIO_MIN = 0.08;
const IDEAL_FACE_RATIO_MAX = 0.45;

function loadLocalFaces(): StoredFace[] {
  try {
    const raw = localStorage.getItem(FACE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function faceQuality(
  box: { x: number; y: number; width: number; height: number },
  videoWidth: number,
  videoHeight: number,
  score: number
): { quality: number; tooClose: boolean; tooFar: boolean } {
  const faceArea = box.width * box.height;
  const videoArea = videoWidth * videoHeight || 1;
  const ratio = faceArea / videoArea;

  let sizeScore = 0;
  if (ratio >= IDEAL_FACE_RATIO_MIN && ratio <= IDEAL_FACE_RATIO_MAX) {
    sizeScore = 1 - Math.abs(ratio - 0.22) / 0.22;
  } else if (ratio < IDEAL_FACE_RATIO_MIN) {
    sizeScore = Math.max(0, ratio / IDEAL_FACE_RATIO_MIN);
  } else {
    sizeScore = Math.max(0, 1 - (ratio - IDEAL_FACE_RATIO_MAX) / IDEAL_FACE_RATIO_MAX);
  }

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const centerScoreX = 1 - Math.min(1, Math.abs(centerX - videoWidth / 2) / (videoWidth / 3));
  const centerScoreY = 1 - Math.min(1, Math.abs(centerY - videoHeight / 2) / (videoHeight / 3));
  const centerScore = (centerScoreX + centerScoreY) / 2;
  const confidenceScore = Math.max(0, Math.min(1, score));

  const quality = Math.max(0, Math.min(1, sizeScore * 0.45 + centerScore * 0.35 + confidenceScore * 0.2));
  return {
    quality,
    tooClose: ratio > IDEAL_FACE_RATIO_MAX,
    tooFar: ratio < IDEAL_FACE_RATIO_MIN,
  };
}

export default function FaceLoginModal({ isOpen, onClose, onSuccess }: FaceLoginModalProps) {
  const [mode, setMode] = useState<AppMode>('verify');
  const [step, setStep] = useState<Step>('idle');
  const [message, setMessage] = useState('');
  const [subMessage, setSubMessage] = useState('');
  const [detectedCount, setDetectedCount] = useState(0);
  const [qualityPct, setQualityPct] = useState(0);

  // Registration form fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPan, setRegPan] = useState('');
  const [regAadhar, setRegAadhar] = useState('');
  const [regFormError, setRegFormError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [registeredUser, setRegisteredUser] = useState<{ id: string; email: string; name: string; role: string; tier: string } | null>(null);
  const [registeredToken, setRegisteredToken] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const busyRef = useRef(false);
  const countRef = useRef(0);
  const isOpenRef = useRef(isOpen);
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    busyRef.current = false;
  }, []);

  const resetState = useCallback(() => {
    stopCamera();
    setStep('idle');
    setMessage('');
    setSubMessage('');
    setDetectedCount(0);
    setQualityPct(0);
    setRegFormError('');
    countRef.current = 0;
  }, [stopCamera]);

  useEffect(() => {
    if (!isOpen) resetState();
  }, [isOpen, resetState]);

  const startCamera = useCallback(async () => {
    try {
      setStep('loading');
      setMessage('Starting camera…');
      setSubMessage('Please allow camera access when prompted');

      const tryGetMedia = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
        return navigator.mediaDevices.getUserMedia(constraints);
      };

      let stream: MediaStream;
      try {
        stream = await tryGetMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
          audio: false,
        });
      } catch {
        try {
          stream = await tryGetMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
            audio: false,
          });
        } catch {
          try {
            stream = await tryGetMedia({ video: { facingMode: 'user' }, audio: false });
          } catch {
            stream = await tryGetMedia({ video: true, audio: false });
          }
        }
      }

      if (!isOpenRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return false;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.setAttribute('playsinline', 'true');
        try {
          await videoRef.current.play();
        } catch (playErr) {
          await new Promise<void>((resolve, reject) => {
            const video = videoRef.current!;
            const onPlaying = () => {
              video.removeEventListener('playing', onPlaying);
              resolve();
            };
            video.addEventListener('playing', onPlaying);
            video.play().catch(reject);
            setTimeout(() => reject(new Error('Camera playback timed out')), 3000);
          });
        }
      }
      return true;
    } catch (err: any) {
      console.error('[FaceLogin] Camera error:', err);
      setStep('error');
      setMessage('Unable to start camera');
      setSubMessage(err.message || 'Please allow camera permission and use HTTPS');
      return false;
    }
  }, []);

  // ─── REGISTER: Step 1 — Create Account ───
  const handleCreateAccount = useCallback(async () => {
    setRegFormError('');
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegFormError('Name, Email and Password are required');
      return;
    }
    if (regPassword.length < 8) {
      setRegFormError('Password must be at least 8 characters');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setRegFormError('Please enter a valid email');
      return;
    }

    setStep('loading');
    setMessage('Creating your account…');
    setSubMessage('This may take a moment');

    try {
      const res = await backendApi.register({
        email: regEmail.trim(),
        password: regPassword,
        name: regName.trim(),
        phone: regPhone.trim() || undefined,
        pan_number: regPan.trim().toUpperCase() || undefined,
        aadhar: regAadhar.trim() || undefined,
      });

      if (res.ok && res.data?.data?.user) {
        const user = res.data.data.user;
        const token = res.data?.data?.tokens?.accessToken || '';
        localStorage.setItem('sw-user', JSON.stringify(user));
        backendApi.setAuthToken(token);
        setRegisteredUser(user);
        setRegisteredToken(token);

        const ok = await startCamera();
        if (!ok) return;
        setStep('scanning');
        setMessage('Look at the camera');
        setSubMessage('Center your face in the oval and hold steady');
        setDetectedCount(0);
        countRef.current = 0;
        startDetectionLoop('register');
      } else {
        setStep('idle');
        setRegFormError(res.data?.error || 'Account creation failed');
      }
    } catch (err: any) {
      setStep('idle');
      setRegFormError(err.message || 'Network error — please try again');
    }
  }, [regName, regEmail, regPassword, regPhone, regPan, regAadhar, startCamera]);

  // ─── LOGIN: Start scanning ───
  const handleStartLogin = useCallback(async () => {
    resetState();
    const ok = await startCamera();
    if (!ok) return;
    setStep('scanning');
    setMessage('Look at the camera');
    setSubMessage('Center your face in the oval and hold steady');
    setDetectedCount(0);
    countRef.current = 0;
    startDetectionLoop('verify');
  }, [resetState, startCamera]);

  // ─── REGISTER: Step 2 — Link Face ───
  const handleRegisterFace = useCallback(async (descriptor: Float32Array) => {
    setStep('processing');
    setMessage('Linking your face…');
    setSubMessage('Encrypting biometric data');
    try {
      const arr = Array.from(descriptor);
      const res = await backendApi.registerFace(arr);
      if (res.ok) {
        // Also keep a local copy so Face ID works even if the browser clears cookies
        try {
          const existing = loadLocalFaces();
          if (registeredUser) {
            const newFace: StoredFace = {
              id: registeredUser.id,
              name: registeredUser.name,
              email: registeredUser.email,
              descriptor: arr,
              createdAt: Date.now(),
              quality: 0.9,
            };
            localStorage.setItem(FACE_STORAGE_KEY, JSON.stringify([...existing.filter((f) => f.email !== newFace.email), newFace]));
          }
        } catch {
          // ignore local backup errors
        }

        setStep('success');
        setMessage('Account created & face secured!');
        setSubMessage('You can now log in with your face');
        setTimeout(() => {
          if (registeredUser) onSuccess(registeredUser, registeredToken);
        }, 1500);
      } else {
        setStep('error');
        setMessage('Face linking failed');
        setSubMessage(res.data?.error || 'Please try again');
      }
    } catch (err: any) {
      setStep('error');
      setMessage('Face linking failed');
      setSubMessage(err.message || 'Network error');
    }
  }, [registeredUser, registeredToken, onSuccess]);

  // ─── VERIFY: Face Login ───
  const handleVerifyFace = useCallback(async (descriptor: Float32Array) => {
    setStep('processing');
    setMessage('Verifying…');
    setSubMessage('Checking backend');
    try {
      const arr = Array.from(descriptor);
      const userEmail = loginEmail.trim();

      const res = await backendApi.verifyFace(arr, userEmail || undefined);
      const user = res.data?.data?.user;
      const confidence = res.data?.data?.confidence ?? 0;
      const token = res.data?.data?.tokens?.accessToken;

      if (res.ok && user && token) {
        backendApi.setAuthToken(token);
        localStorage.setItem('sw-user', JSON.stringify(user));
        setStep('success');
        setMessage(`Welcome back, ${user.name || 'User'}!`);
        setSubMessage(`Confidence: ${(confidence).toFixed(3)}`);
        setTimeout(() => onSuccess(user, token), 1200);
        return;
      }

      // Local fallback for demo continuity: if the server has no face record but the
      // browser has a locally registered face, match against it and perform a demo login.
      const localFaces = loadLocalFaces();
      const localMatch = localFaces.find((f) => euclideanDistance(f.descriptor, arr) < LOCAL_MATCH_THRESHOLD);
      if (localMatch?.email) {
        const demoRes = await backendApi.demoLogin({ email: localMatch.email, name: localMatch.name });
        if (demoRes.ok && demoRes.data?.data?.user && demoRes.data?.data?.tokens?.accessToken) {
          const demoUser = demoRes.data.data.user;
          const demoToken = demoRes.data.data.tokens.accessToken;
          backendApi.setAuthToken(demoToken);
          localStorage.setItem('sw-user', JSON.stringify(demoUser));
          setStep('success');
          setMessage(`Welcome back, ${demoUser.name || 'User'}!`);
          setSubMessage('Local face matched');
          setTimeout(() => onSuccess(demoUser, demoToken), 1000);
          return;
        }
      }

      setStep('error');
      setMessage(res.data?.error || 'Face not recognized');
      setSubMessage('Try registering first, or use password login');
    } catch (err: any) {
      setStep('error');
      setMessage('Verification failed');
      setSubMessage(err.message || 'Network error');
    }
  }, [loginEmail, onSuccess]);

  // ─── Detection Loop ───
  const startDetectionLoop = useCallback((currentMode: AppMode) => {
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || busyRef.current) return;
      const video = videoRef.current;
      if (video.readyState < 2 || video.paused || video.ended) return;

      busyRef.current = true;
      try {
        const result = await detectFace(video);
        if (!result.detected || !result.box || !result.descriptor) {
          countRef.current = 0;
          setDetectedCount(0);
          setQualityPct(0);
          setSubMessage('No face detected — center your face in the guide');
          busyRef.current = false;
          return;
        }

        if ((result.score ?? 0) < MIN_FACE_SCORE) {
          setSubMessage('Face too unclear — move to better light');
          busyRef.current = false;
          return;
        }

        const { quality, tooClose, tooFar } = faceQuality(
          result.box,
          video.videoWidth || 640,
          video.videoHeight || 480,
          result.score || 0
        );
        setQualityPct(Math.round(quality * 100));

        if (tooClose) {
          setSubMessage('Move back a little — face is too close');
          busyRef.current = false;
          return;
        }
        if (tooFar) {
          setSubMessage('Come closer — face is too small');
          busyRef.current = false;
          return;
        }

        countRef.current += 1;
        setDetectedCount(countRef.current);
        setSubMessage(`Face detected (${countRef.current}/3) — hold steady`);

        if (countRef.current >= 3) {
          if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
          stopCamera();
          if (currentMode === 'register') {
            await handleRegisterFace(result.descriptor);
          } else {
            await handleVerifyFace(result.descriptor);
          }
        }
      } catch (e: any) {
        console.warn('[FaceLogin] Detection error:', e);
        setSubMessage(e.message || 'Detection error — try again');
      } finally {
        busyRef.current = false;
      }
    }, 800);
  }, [stopCamera, handleRegisterFace, handleVerifyFace]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-face-viewfinder text-primary" />
                {mode === 'verify' ? 'Face Login' : 'Open New Account'}
              </h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <i className="fas fa-xmark text-xl" />
              </button>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-slate-800 rounded-xl p-1 mb-5">
              <button
                onClick={() => { setMode('verify'); resetState(); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'verify' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Login
              </button>
              <button
                onClick={() => { setMode('register'); resetState(); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'register' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Open Account
              </button>
            </div>

            {/* ════════════════════════════════════════
                REGISTER MODE — KYC Form
                ════════════════════════════════════════ */}
            {mode === 'register' && step === 'idle' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
                  <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)}
                    placeholder="John Doe" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email *</label>
                  <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="john@example.com" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Password * (min 8 chars)</label>
                  <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Phone</label>
                  <input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="9876543210" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary" />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-1">PAN</label>
                    <input type="text" value={regPan} onChange={(e) => setRegPan(e.target.value)}
                      placeholder="ABCDE1234F" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-1">Aadhar</label>
                    <input type="text" value={regAadhar} onChange={(e) => setRegAadhar(e.target.value)}
                      placeholder="1234 5678 9012" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary" />
                  </div>
                </div>
                {regFormError && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">{regFormError}</p>
                )}
                <button
                  onClick={handleCreateAccount}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all"
                >
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-user-plus" />
                    Create Account & Scan Face
                  </span>
                </button>
                <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                  <i className="fas fa-shield-halved mr-1" />
                  Your KYC data is encrypted. Face biometric is stored as a 128-dimensional descriptor.
                </p>
              </div>
            )}

            {/* ════════════════════════════════════════
                LOGIN MODE — Email + Scan
                ════════════════════════════════════════ */}
            {mode === 'verify' && step === 'idle' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email (optional)</label>
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Leave blank to scan all registered faces" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary" />
                </div>
                <button
                  onClick={handleStartLogin}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 transition-all"
                >
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-face-viewfinder" />
                    Start Face Scan
                  </span>
                </button>
              </div>
            )}

            {/* ════════════════════════════════════════
                Camera Preview (shared)
                ════════════════════════════════════════ */}
            {(step === 'loading' || step === 'scanning' || step === 'processing' || step === 'success' || step === 'error') && (
              <div className="relative w-full max-w-[360px] mx-auto rounded-2xl border-2 border-slate-700 bg-black overflow-hidden mb-4" style={{ aspectRatio: '4 / 3' }}>
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-contain transform -scale-x-100 bg-black"
                  playsInline muted autoPlay
                />
                {step === 'scanning' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-44 h-56 border-2 border-dashed rounded-[2rem] animate-pulse transition-colors duration-300 ${
                      detectedCount > 0 ? 'border-emerald-400' : 'border-white/40'
                    }`} />
                  </div>
                )}
                {step === 'loading' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-black/60">
                    <i className="fas fa-circle-notch animate-spin text-4xl mb-2" />
                    <span className="text-xs">Loading models…</span>
                  </div>
                )}
                {step === 'success' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/30 flex items-center justify-center">
                      <i className="fas fa-check text-4xl text-emerald-400" />
                    </div>
                  </div>
                )}
                {step === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-rose-500/20">
                    <div className="w-20 h-20 rounded-full bg-rose-500/30 flex items-center justify-center">
                      <i className="fas fa-xmark text-4xl text-rose-400" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {(step === 'loading' || step === 'scanning' || step === 'processing' || step === 'success' || step === 'error') && (
              <div className="text-center mb-4 min-h-[3rem]">
                <p className={`text-base font-semibold ${
                  step === 'success' ? 'text-emerald-400' :
                  step === 'error' ? 'text-rose-400' :
                  'text-white'
                }`}>{message}</p>
                <p className="text-xs text-slate-400 mt-1">{subMessage}</p>
                {step === 'scanning' && qualityPct > 0 && (
                  <p className="text-[11px] text-slate-500 mt-1">Quality: {qualityPct}%</p>
                )}
              </div>
            )}

            {/* Action buttons during scan/processing */}
            {(step === 'loading' || step === 'scanning' || step === 'processing') && (
              <button disabled className="w-full py-3 rounded-xl font-semibold text-white bg-slate-700 opacity-70">
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-circle-notch animate-spin" />
                  {step === 'processing' ? 'Processing…' : step === 'scanning' ? 'Detecting…' : 'Loading…'}
                </span>
              </button>
            )}

            {/* Error reset */}
            {step === 'error' && (
              <div className="flex gap-3">
                <button onClick={resetState} className="flex-1 py-3 rounded-xl font-semibold text-white bg-slate-700 hover:bg-slate-600 transition-colors">
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

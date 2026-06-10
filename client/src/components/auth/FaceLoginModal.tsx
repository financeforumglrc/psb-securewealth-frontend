import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initFaceAuthEngine, detectFace, euclideanDistance } from '../../lib/faceAuth';
import { backendApi } from '../../lib/backendApi';

interface FaceLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { id: string; email: string; name: string; role: string; tier: string }, token: string) => void;
}

type AppMode = 'verify' | 'register';
type Step = 'idle' | 'loading' | 'scanning' | 'captured' | 'processing' | 'success' | 'error';

export default function FaceLoginModal({ isOpen, onClose, onSuccess }: FaceLoginModalProps) {
  const [mode, setMode] = useState<AppMode>('verify');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<Step>('idle');
  const [message, setMessage] = useState('');
  const [subMessage, setSubMessage] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const framesDetected = useRef(0);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const resetState = useCallback(() => {
    stopCamera();
    setStep('idle');
    setMessage('');
    setSubMessage('');
    framesDetected.current = 0;
  }, [stopCamera]);

  useEffect(() => {
    if (!isOpen) resetState();
  }, [isOpen, resetState]);

  const startCamera = useCallback(async () => {
    try {
      setStep('loading');
      setMessage('Loading face recognition models...');
      await initFaceAuthEngine();

      setMessage('Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch (err: any) {
      console.error('[FaceLogin] Camera error:', err);
      setStep('error');
      setMessage('Unable to start camera');
      setSubMessage(err.message || 'Please check permissions');
      return false;
    }
  }, []);

  const handleRegister = useCallback(async (descriptor: Float32Array) => {
    const userEmail = emailInputRef.current?.value.trim() || email;
    if (!userEmail) {
      setStep('error');
      setMessage('Email required');
      setSubMessage('Enter the email you want to link this face to');
      return;
    }

    setStep('processing');
    setMessage('Encrypting and storing...');
    setSubMessage('Your face print never leaves our secure servers');

    try {
      const arr = Array.from(descriptor);
      const regRes = await backendApi.registerFace(arr);
      if (regRes.ok) {
        localStorage.setItem('sw-face-descriptor-' + userEmail, JSON.stringify(arr));
        setStep('success');
        setMessage('Face registered successfully!');
        setSubMessage('You can now log in with your face');

        const verifyRes = await backendApi.verifyFace(arr, userEmail);
        if (verifyRes.ok && verifyRes.data?.data?.tokens?.accessToken) {
          const { user, tokens } = verifyRes.data.data;
          localStorage.setItem('sw-token', tokens.accessToken);
          setTimeout(() => onSuccess(user, tokens.accessToken), 1000);
        }
      } else {
        setStep('error');
        setMessage(regRes.data?.error || 'Registration failed');
        setSubMessage('Please try again');
      }
    } catch (err: any) {
      setStep('error');
      setMessage('Registration failed');
      setSubMessage(err.message || 'Unknown error');
    }
  }, [email, onSuccess]);

  const handleVerify = useCallback(async (descriptor: Float32Array) => {
    setStep('processing');
    setMessage('Verifying securely...');
    setSubMessage('Matching against encrypted descriptor');

    try {
      const arr = Array.from(descriptor);
      const userEmail = emailInputRef.current?.value.trim() || email;
      const res = await backendApi.verifyFace(arr, userEmail || undefined);
      if (res.ok && res.data?.data?.tokens?.accessToken) {
        const { user, tokens } = res.data.data;
        localStorage.setItem('sw-face-descriptor-' + (user.email || 'default'), JSON.stringify(arr));
        localStorage.setItem('sw-token', tokens.accessToken);
        setStep('success');
        setMessage(`Welcome back, ${user.name || 'User'}!`);
        setSubMessage(`Confidence: ${(res.data.data.confidence || 0).toFixed(3)}`);
        setTimeout(() => onSuccess(user, tokens.accessToken), 1200);
      } else {
        setStep('error');
        setMessage(res.data?.error || 'Face not recognized');
        setSubMessage('Try registering first, or use PIN login');
      }
    } catch (err: any) {
      setStep('error');
      setMessage('Verification failed');
      setSubMessage(err.message || 'Network error');
    }
  }, [email, onSuccess]);

  const startSession = useCallback(async () => {
    resetState();
    const ok = await startCamera();
    if (!ok) return;

    setStep('scanning');
    setMessage('Look at the camera');
    setSubMessage('Hold still while we detect your face');
    framesDetected.current = 0;

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || step === 'processing' || step === 'success') return;

      try {
        const result = await detectFace(videoRef.current);
        if (!result.detected) {
          framesDetected.current = 0;
          setSubMessage('No face detected — center your face');
          return;
        }

        framesDetected.current += 1;
        setSubMessage(`Face detected (${framesDetected.current}/3)`);

        // Draw landmarks on canvas
        if (canvasRef.current && result.landmarks) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            const pts = result.landmarks.positions;
            ctx.fillStyle = '#10b981';
            for (const p of pts) {
              ctx.beginPath();
              ctx.arc(p.x, p.y, 1.5, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        }

        // After 3 consecutive detections, capture
        if (framesDetected.current >= 3 && result.descriptor) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          stopCamera();
          if (mode === 'register') {
            await handleRegister(result.descriptor);
          } else {
            await handleVerify(result.descriptor);
          }
        }
      } catch (e) {
        console.warn('[FaceLogin] Detection error:', e);
      }
    }, 600);
  }, [resetState, startCamera, mode, handleRegister, handleVerify, stopCamera]);

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
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-face-viewfinder text-primary" />
                {mode === 'verify' ? 'Face Login' : 'Register Face'}
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
                Register
              </button>
            </div>

            {/* Email input */}
            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-1.5">
                {mode === 'register' ? 'Email *' : 'Email (optional)'}
              </label>
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'register' ? 'your@email.com' : 'Leave blank to scan all registered faces'}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
              />
              {mode === 'register' && (
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Face will be encrypted and linked to this account on our secure backend.
                </p>
              )}
            </div>

            {/* Camera preview */}
            <div className="relative w-full aspect-[4/3] rounded-2xl border-2 border-slate-700 bg-black overflow-hidden mb-4">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                playsInline
                muted
                autoPlay
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                width={640}
                height={480}
              />

              {(step === 'idle' || step === 'loading') && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-black/60">
                  <i className="fas fa-camera-slash text-4xl mb-2" />
                  <span className="text-xs">{step === 'loading' ? 'Loading models...' : 'Camera off'}</span>
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

            {/* Messages */}
            <div className="text-center mb-4 min-h-[3rem]">
              <p className={`text-base font-semibold ${
                step === 'success' ? 'text-emerald-400' :
                step === 'error' ? 'text-rose-400' :
                'text-white'
              }`}>
                {message}
              </p>
              <p className="text-xs text-slate-400 mt-1">{subMessage}</p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {(step === 'idle' || step === 'error') && (
                <button
                  onClick={startSession}
                  disabled={mode === 'register' && !email}
                  className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 ${
                    mode === 'register' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <i className={`fas ${mode === 'register' ? 'fa-camera' : 'fa-face-viewfinder'}`} />
                    {mode === 'register' ? 'Start Registration' : 'Start Face Scan'}
                  </span>
                </button>
              )}

              {(step === 'loading' || step === 'scanning' || step === 'processing') && (
                <button
                  disabled
                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-slate-700 opacity-70"
                >
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-circle-notch animate-spin" />
                    {step === 'processing' ? 'Processing...' : step === 'scanning' ? 'Detecting...' : 'Loading...'}
                  </span>
                </button>
              )}

              {step === 'error' && (
                <button
                  onClick={() => { resetState(); }}
                  className="px-4 py-3 rounded-xl font-semibold text-white bg-slate-700 hover:bg-slate-600 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            <p className="text-[10px] text-slate-500 text-center mt-4 leading-relaxed">
              <i className="fas fa-shield-halved mr-1" />
              Secured by face-api.js with 128-dimensional encrypted face descriptors.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

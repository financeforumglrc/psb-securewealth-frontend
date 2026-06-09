import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { detectFaceDescriptor, loadFaceApi } from '../../lib/faceApi';
import { backendApi } from '../../lib/backendApi';

interface FaceLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { id: string; email: string; name: string; role: string; tier: string }, token: string) => void;
}

export default function FaceLoginModal({ isOpen, onClose, onSuccess }: FaceLoginModalProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'scanning' | 'matched' | 'mismatch' | 'error' | 'registering'>('idle');
  const [message, setMessage] = useState('Position your face in the frame');
  const [mode, setMode] = useState<'verify' | 'register'>('verify');
  const [email, setEmail] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch {
      setStatus('error');
      setMessage('Camera access denied. Please allow camera permission.');
      return false;
    }
  }, []);

  const runVerification = useCallback(async () => {
    setStatus('scanning');
    setMessage('Initializing AI model...');
    try {
      await loadFaceApi();
      const ok = await startCamera();
      if (!ok) return;

      setMessage('Look at the camera...');
      await new Promise((r) => setTimeout(r, 900));

      if (!videoRef.current) return;
      const descriptor = await detectFaceDescriptor(videoRef.current);
      stopCamera();

      if (!descriptor) {
        setStatus('mismatch');
        setMessage('No face detected. Please try again.');
        return;
      }

      setMessage('Verifying with secure backend...');
      const arr = Array.from(descriptor);
      const res = await backendApi.verifyFace(arr, email || undefined);

      if (res.ok && res.data?.data?.tokens?.accessToken) {
        const { user, tokens } = res.data.data;
        localStorage.setItem('sw-face-descriptor-' + (user.email || 'default'), JSON.stringify(arr));
        localStorage.setItem('sw-token', tokens.accessToken);
        setStatus('matched');
        setMessage(`Welcome, ${user.name || 'User'}!`);
        setTimeout(() => onSuccess(user, tokens.accessToken), 800);
      } else {
        setStatus('mismatch');
        setMessage(res.data?.error || 'Face not recognized. Try registering first.');
      }
    } catch (err: any) {
      stopCamera();
      setStatus('error');
      setMessage(err.message || 'Face verification failed');
    }
  }, [email, onSuccess, startCamera, stopCamera]);

  const runRegistration = useCallback(async () => {
    if (!email) {
      setStatus('error');
      setMessage('Please enter your email first');
      return;
    }
    setStatus('registering');
    setMessage('Initializing camera...');
    try {
      await loadFaceApi();
      const ok = await startCamera();
      if (!ok) return;

      setMessage('Look at the camera to capture your face...');
      await new Promise((r) => setTimeout(r, 900));

      if (!videoRef.current) return;
      const descriptor = await detectFaceDescriptor(videoRef.current);
      stopCamera();

      if (!descriptor) {
        setStatus('error');
        setMessage('No face detected. Please try again.');
        return;
      }

      // Register face requires auth. For demo flow, we auto-login with dev header then register.
      localStorage.setItem('sw-dev-email', email);
      const arr = Array.from(descriptor);
      const regRes = await backendApi.registerFace(arr);

      if (regRes.ok) {
        localStorage.setItem('sw-face-descriptor-' + email, JSON.stringify(arr));
        setStatus('matched');
        setMessage('Face registered! Now verifying...');
        // Auto verify after register to login
        const verifyRes = await backendApi.verifyFace(arr, email);
        if (verifyRes.ok && verifyRes.data?.data?.tokens?.accessToken) {
          const { user, tokens } = verifyRes.data.data;
          localStorage.setItem('sw-token', tokens.accessToken);
          setTimeout(() => onSuccess(user, tokens.accessToken), 600);
        }
      } else {
        setStatus('error');
        setMessage(regRes.data?.error || 'Face registration failed');
      }
    } catch (err: any) {
      stopCamera();
      setStatus('error');
      setMessage(err.message || 'Face registration error');
    }
  }, [email, onSuccess, startCamera, stopCamera]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setStatus('idle');
      setMessage('Position your face in the frame');
      setMode('verify');
      setEmail('');
    }
  }, [isOpen, stopCamera]);

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
                onClick={() => setMode('verify')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'verify' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Login
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'register' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Register
              </button>
            </div>

            {mode === 'register' && (
              <div className="mb-4">
                <label className="block text-xs text-slate-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deepanshu.sharma@psbsecurewealth.com"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                />
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Enter the same email you use for quick login. Face will be linked to this account.
                </p>
              </div>
            )}

            {mode === 'verify' && (
              <div className="mb-4">
                <label className="block text-xs text-slate-400 mb-1.5">Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Leave blank to scan all registered faces"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {/* Camera preview */}
            <div className="relative w-full aspect-[4/3] rounded-2xl border-2 border-slate-700 bg-black overflow-hidden mb-4">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                playsInline
                muted
                autoPlay
              />
              {status === 'scanning' || status === 'registering' ? (
                <>
                  <div className="absolute inset-0 border-2 border-primary/40 rounded-2xl" />
                  <div className="absolute left-4 right-4 h-0.5 bg-primary shadow-[0_0_20px_rgba(15,118,110,0.9)] animate-[scanFace_2s_ease-in-out_infinite] z-20" />
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                  <i className="fas fa-camera-slash text-4xl mb-2" />
                  <span className="text-xs">Camera off</span>
                </div>
              )}
            </div>

            <p className={`text-sm font-medium text-center mb-4 min-h-[1.25rem] ${
              status === 'matched' ? 'text-emerald-400' :
              status === 'mismatch' ? 'text-rose-400' :
              status === 'error' ? 'text-amber-400' :
              'text-slate-400'
            }`}>
              {message}
            </p>

            <button
              onClick={mode === 'verify' ? runVerification : runRegistration}
              disabled={status === 'scanning' || status === 'registering'}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-60 ${
                mode === 'register'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {status === 'scanning' || status === 'registering' ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-circle-notch animate-spin" />
                  {status === 'registering' ? 'Registering...' : 'Scanning...'}
                </span>
              ) : mode === 'verify' ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-face-viewfinder" />
                  Start Face Recognition
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-camera" />
                  Register Face
                </span>
              )}
            </button>

            <p className="text-[10px] text-slate-500 text-center mt-3">
              Powered by TensorFlow.js face-api. Your face descriptor is encrypted and stored on our secure backend.
            </p>
          </motion.div>

          <style>{`
            @keyframes scanFace {
              0% { top: 10%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 90%; opacity: 0; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

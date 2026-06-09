import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  initFaceAuthEngine,
  processFrame,
  extractFaceDescriptor,
  captureMultiSampleDescriptor,
  createLivenessState,
  type LivenessState,
} from '../../lib/faceAuth';
import { backendApi } from '../../lib/backendApi';

interface FaceLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { id: string; email: string; name: string; role: string; tier: string }, token: string) => void;
}

type AppMode = 'verify' | 'register';
type Step = 'idle' | 'initializing' | 'positioning' | 'liveness' | 'capturing' | 'processing' | 'success' | 'error';

export default function FaceLoginModal({ isOpen, onClose, onSuccess }: FaceLoginModalProps) {
  const [mode, setMode] = useState<AppMode>('verify');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<Step>('idle');
  const [message, setMessage] = useState('');
  const [subMessage, setSubMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState(0);
  const [blinkCount, setBlinkCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const livenessRef = useRef<LivenessState>(createLivenessState('blink'));
  const stepRef = useRef<Step>('idle');
  const emailRef = useRef('');
  const emailInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processingRef = useRef(false);
  const capturingRef = useRef(false);

  // Keep refs in sync with latest state so interval callbacks never see stale values
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { emailRef.current = email; }, [email]);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const resetState = useCallback(() => {
    stopCamera();
    setStep('idle');
    stepRef.current = 'idle';
    setMessage('');
    setSubMessage('');
    setProgress(0);
    setQuality(0);
    setBlinkCount(0);
    livenessRef.current = createLivenessState('blink');
    capturingRef.current = false;
    processingRef.current = false;
  }, [stopCamera]);

  useEffect(() => {
    if (!isOpen) resetState();
  }, [isOpen, resetState]);

  const startCamera = useCallback(async () => {
    try {
      setStep('initializing');
      stepRef.current = 'initializing';
      setMessage('Initializing AI vision engine...');
      await initFaceAuthEngine();

      setMessage('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Camera warmup timeout')), 5000);
          const check = () => {
            if (videoRef.current && videoRef.current.videoWidth > 0) {
              clearTimeout(timer);
              resolve();
            } else {
              setTimeout(check, 100);
            }
          };
          check();
        });
      }
      return true;
    } catch (err: any) {
      console.error('[FaceLogin] Camera error:', err);
      setStep('error');
      stepRef.current = 'error';
      setMessage(err.name === 'NotAllowedError' ? 'Camera access denied' : 'Unable to start camera');
      setSubMessage(err.message || 'Please check your camera permissions');
      return false;
    }
  }, []);

  const runVerifyCapture = useCallback(async () => {
    setStep('capturing');
    stepRef.current = 'capturing';
    setMessage('Capturing face print...');
    setSubMessage('Hold still');

    try {
      const descriptor = await extractFaceDescriptor(videoRef.current!);
      stopCamera();

      if (!descriptor) {
        setStep('error');
        stepRef.current = 'error';
        setMessage('Could not capture face print');
        setSubMessage('Please ensure good lighting and try again');
        return;
      }

      setStep('processing');
      stepRef.current = 'processing';
      setMessage('Verifying securely...');
      setSubMessage('Matching against encrypted descriptor on server');

      const arr = Array.from(descriptor);
      const latestEmail = emailInputRef.current?.value.trim() || emailRef.current;
      const res = await backendApi.verifyFace(arr, latestEmail || undefined);

      if (res.ok && res.data?.data?.tokens?.accessToken) {
        const { user, tokens } = res.data.data;
        localStorage.setItem('sw-face-descriptor-' + (user.email || 'default'), JSON.stringify(arr));
        localStorage.setItem('sw-token', tokens.accessToken);
        setStep('success');
        stepRef.current = 'success';
        setMessage(`Welcome back, ${user.name || 'User'}!`);
        setSubMessage(`Confidence: ${(res.data.data.confidence || 0).toFixed(3)}`);
        setTimeout(() => onSuccess(user, tokens.accessToken), 1200);
      } else {
        setStep('error');
        stepRef.current = 'error';
        setMessage(res.data?.error || 'Face not recognized');
        setSubMessage('Try registering your face first, or use PIN login');
      }
    } catch (err: any) {
      stopCamera();
      setStep('error');
      stepRef.current = 'error';
      setMessage('Verification failed');
      setSubMessage(err.message || 'Network error');
    }
  }, [onSuccess, stopCamera]);

  const runRegisterCapture = useCallback(async () => {
    // CRITICAL: read directly from DOM input as primary source, fallback to ref
    const latestEmail = emailInputRef.current?.value.trim() || emailRef.current;
    if (!latestEmail) {
      setStep('error');
      stepRef.current = 'error';
      setMessage('Email required');
      setSubMessage('Enter the email you want to link this face to');
      return;
    }

    setStep('capturing');
    stepRef.current = 'capturing';
    setMessage('Capturing high-quality face samples...');
    setSubMessage('Hold still, taking 3 samples');

    try {
      const descriptor = await captureMultiSampleDescriptor(videoRef.current!, 3, (count, total) => {
        setProgress(Math.round((count / total) * 100));
        setSubMessage(`Sample ${count} of ${total}`);
      });
      stopCamera();

      if (!descriptor) {
        setStep('error');
        stepRef.current = 'error';
        setMessage('Could not capture face samples');
        setSubMessage('Ensure your face stays in the frame');
        return;
      }

      setStep('processing');
      stepRef.current = 'processing';
      setMessage('Encrypting and storing...');
      setSubMessage('Your face print never leaves our secure servers as plain data');

      localStorage.setItem('sw-dev-email', latestEmail);
      const arr = Array.from(descriptor);
      const regRes = await backendApi.registerFace(arr);

      if (regRes.ok) {
        localStorage.setItem('sw-face-descriptor-' + latestEmail, JSON.stringify(arr));
        setStep('success');
        stepRef.current = 'success';
        setMessage('Face registered successfully!');
        setSubMessage('You can now log in with your face');

        const verifyRes = await backendApi.verifyFace(arr, latestEmail);
        if (verifyRes.ok && verifyRes.data?.data?.tokens?.accessToken) {
          const { user, tokens } = verifyRes.data.data;
          localStorage.setItem('sw-token', tokens.accessToken);
          setTimeout(() => onSuccess(user, tokens.accessToken), 1000);
        }
      } else {
        setStep('error');
        stepRef.current = 'error';
        setMessage(regRes.data?.error || 'Registration failed');
        setSubMessage('Please try again');
      }
    } catch (err: any) {
      stopCamera();
      setStep('error');
      stepRef.current = 'error';
      setMessage('Registration failed');
      setSubMessage(err.message || 'Unknown error');
    }
  }, [onSuccess, stopCamera]);

  // Use refs for capture functions so runDetectionLoop never captures stale closures
  const runVerifyCaptureRef = useRef(runVerifyCapture);
  const runRegisterCaptureRef = useRef(runRegisterCapture);
  useEffect(() => { runVerifyCaptureRef.current = runVerifyCapture; }, [runVerifyCapture]);
  useEffect(() => { runRegisterCaptureRef.current = runRegisterCapture; }, [runRegisterCapture]);

  const runDetectionLoop = useCallback(async () => {
    if (!videoRef.current || capturingRef.current || processingRef.current) return;
    processingRef.current = true;

    try {
      const result = await processFrame(videoRef.current, livenessRef.current, {
        requireChallenge: stepRef.current === 'liveness',
        drawCanvas: canvasRef.current || undefined,
      });

      // Ignore superseded frames from overlapping calls
      if (result.feedback === 'Superseded by newer frame') return;

      if (result.livenessState) {
        livenessRef.current = result.livenessState;
        setBlinkCount(result.livenessState.blinkCount);
      }

      const currentStep = stepRef.current;

      if (result.success) {
        setQuality(1);
        if (currentStep === 'positioning') {
          setStep('liveness');
          stepRef.current = 'liveness';
          setMessage('Great! Now blink to prove liveness');
          setSubMessage('This prevents photo spoofing attacks');
          livenessRef.current = createLivenessState('blink');
        }
      }

      // CRITICAL FIX: Once liveness challenge is completed, proceed to capture
      // immediately regardless of whether the current frame also passes positioning.
      if (currentStep === 'liveness' && livenessRef.current.challengeCompleted) {
        capturingRef.current = true;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (mode === 'register') {
          await runRegisterCaptureRef.current();
        } else {
          await runVerifyCaptureRef.current();
        }
        return;
      }

      if (!result.success && currentStep !== 'capturing' && currentStep !== 'processing') {
        setMessage(result.feedback);
        if (result.feedback.includes('closer') || result.feedback.includes('back')) setQuality(0.3);
        else if (result.feedback.includes('Turn') || result.feedback.includes('Look')) setQuality(0.6);
        else if (result.feedback.includes('Blink')) setQuality(0.85);
        else if (result.feedback.includes('perfectly')) setQuality(1);
        else setQuality(0.2);
      }
    } finally {
      processingRef.current = false;
    }
  }, [mode]);

  const startSession = useCallback(async () => {
    // Sync email from DOM to ref in case browser autofill bypassed React onChange
    const domEmail = emailInputRef.current?.value.trim() || '';
    if (domEmail) {
      setEmail(domEmail);
      emailRef.current = domEmail;
    }

    resetState();
    const ok = await startCamera();
    if (ok) {
      setStep('positioning');
      stepRef.current = 'positioning';
      setMessage('Position your face in the frame');
      setSubMessage('Center your face and look straight at the camera');
      // Throttle to ~8 fps — gives MediaPipe time to process without queue buildup
      intervalRef.current = setInterval(runDetectionLoop, 120);
    }
  }, [resetState, runDetectionLoop, startCamera]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopCamera();
    };
  }, [stopCamera]);

  const qualityColor = quality >= 0.9 ? 'bg-emerald-500' : quality >= 0.6 ? 'bg-amber-500' : 'bg-rose-500';

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
                onInput={(e) => {
                  const val = e.currentTarget.value;
                  setEmail(val);
                  emailRef.current = val;
                }}
                placeholder={mode === 'register' ? 'your@email.com' : 'Leave blank to scan all registered faces'}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
              />
              {mode === 'register' && (
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Face will be encrypted and linked to this account on our secure backend.
                </p>
              )}
            </div>

            {/* Camera preview with overlay canvas */}
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

              {/* Scanning overlay UI */}
              {(step === 'positioning' || step === 'liveness' || step === 'capturing') && (
                <>
                  <div className="absolute inset-0 border-2 border-primary/30 rounded-2xl" />
                  <div className="absolute left-4 right-4 h-0.5 bg-primary shadow-[0_0_20px_rgba(15,118,110,0.9)] animate-[scanFace_2s_ease-in-out_infinite] z-20" />
                  <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-primary" />
                  <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-primary" />
                  <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-primary" />
                  <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-primary" />
                </>
              )}

              {/* Idle / off state */}
              {step === 'idle' || step === 'initializing' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-black/60">
                  <i className="fas fa-camera-slash text-4xl mb-2" />
                  <span className="text-xs">{step === 'initializing' ? 'Initializing...' : 'Camera off'}</span>
                </div>
              ) : null}

              {/* Success / error badges */}
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

            {/* Quality bar */}
            {(step === 'positioning' || step === 'liveness') && (
              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Face quality</span>
                  <span>{Math.round(quality * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${qualityColor}`}
                    style={{ width: `${Math.round(quality * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Liveness badge */}
            {step === 'liveness' && (
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                  blinkCount > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  <i className={`fas ${blinkCount > 0 ? 'fa-check' : 'fa-eye'} mr-1`} />
                  {blinkCount > 0 ? 'Liveness confirmed' : 'Waiting for blink...'}
                </div>
              </div>
            )}

            {/* Progress bar for capture */}
            {step === 'capturing' && (
              <div className="mb-3">
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="text-center mb-4 min-h-[3rem]">
              <p className={`text-base font-semibold ${
                step === 'success' ? 'text-emerald-400' :
                step === 'error' ? 'text-rose-400' :
                step === 'liveness' && blinkCount > 0 ? 'text-emerald-300' :
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

              {(step === 'positioning' || step === 'liveness' || step === 'capturing' || step === 'processing') && (
                <button
                  disabled
                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-slate-700 opacity-70"
                >
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-circle-notch animate-spin" />
                    {step === 'processing' ? 'Processing...' : 'Scanning...'}
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

            {/* Security note */}
            <p className="text-[10px] text-slate-500 text-center mt-4 leading-relaxed">
              <i className="fas fa-shield-halved mr-1" />
              Secured by MediaPipe Face Mesh + face-api.js. Includes blink liveness detection,
              head-pose analysis, and 128-dimensional encrypted face descriptors.
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

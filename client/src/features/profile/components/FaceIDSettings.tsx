import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, XCircle, Trash2, Plus, User, Shield, ScanFace, RotateCcw } from 'lucide-react';
import { detectFace, euclideanDistance } from '@/shared/lib/faceAuth';

interface RegisteredFace {
  id: string;
  name: string;
  descriptor: number[];
  createdAt: number;
  quality: number;
}

const FACE_STORAGE_KEY = 'sw_registered_faces';
const MIN_QUALITY = 0.72;
const AUTO_CAPTURE_MS = 1200;
const GUIDE_RX = 25;
const GUIDE_RY = 35;
const RING_R = 38;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

function loadFaces(): RegisteredFace[] {
  try {
    const raw = localStorage.getItem(FACE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFaces(faces: RegisteredFace[]) {
  try {
    localStorage.setItem(FACE_STORAGE_KEY, JSON.stringify(faces));
  } catch {
    // ignore
  }
}

function calculateQuality(
  box: { x: number; y: number; width: number; height: number },
  videoWidth: number,
  videoHeight: number,
  score = 0
): number {
  const faceArea = box.width * box.height;
  const videoArea = videoWidth * videoHeight;
  const sizeRatio = faceArea / videoArea;

  // Ideal face occupies 15–30% of the frame
  let sizeScore = 0;
  if (sizeRatio >= 0.10 && sizeRatio <= 0.40) {
    sizeScore = 1 - Math.abs(sizeRatio - 0.20) / 0.20;
  } else if (sizeRatio < 0.10) {
    sizeScore = Math.max(0, sizeRatio / 0.10);
  } else {
    sizeScore = Math.max(0, 1 - (sizeRatio - 0.40) / 0.40);
  }

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const centerScoreX = 1 - Math.min(1, Math.abs(centerX - videoWidth / 2) / (videoWidth / 3));
  const centerScoreY = 1 - Math.min(1, Math.abs(centerY - videoHeight / 2) / (videoHeight / 3));
  const centerScore = (centerScoreX + centerScoreY) / 2;
  const confidenceScore = Math.max(0, Math.min(1, score));

  return Math.max(0, Math.min(1, sizeScore * 0.45 + centerScore * 0.35 + confidenceScore * 0.2));
}

export default function FaceIDSettings() {
  const [faces, setFaces] = useState<RegisteredFace[]>(loadFaces());
  const [registering, setRegistering] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'scanning' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [quality, setQuality] = useState(0);
  const [tooClose, setTooClose] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captureStartRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCamera = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setQuality(0);
    setTooClose(false);
    setFaceDetected(false);
    setCaptureProgress(0);
    setCameraReady(false);
    captureStartRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();

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
          try {
            stream = await tryGetMedia({ video: true, audio: false });
          } catch (err) {
            throw err;
          }
        }
      }
    }

    streamRef.current = stream;
    const video = videoRef.current;
    if (!video) return false;

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.autoplay = true;

    try {
      await video.play();
    } catch (playErr) {
      // Some browsers block play until the user gesture is fully resolved.
      try {
        await new Promise<void>((resolve, reject) => {
          const onPlaying = () => {
            video.removeEventListener('playing', onPlaying);
            resolve();
          };
          video.addEventListener('playing', onPlaying);
          video.play().catch(reject);
          setTimeout(() => reject(new Error('play timeout')), 2500);
        });
      } catch {
        throw playErr;
      }
    }

    setCameraReady(true);
    return true;
  }, [stopCamera]);

  const handleRegister = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !faceDetected || quality < MIN_QUALITY || tooClose) {
      setStatus('error');
      setMessage('Face not clear. Move back, adjust lighting and center your face.');
      return;
    }

    setStatus('loading');
    setMessage('Capturing HD face descriptor…');
    setCaptureProgress(0);
    captureStartRef.current = null;

    try {
      const result = await detectFace(video);
      if (!result.detected || !result.descriptor) {
        setStatus('error');
        setMessage('Face capture failed. Try again.');
        return;
      }

      const descriptor = Array.from(result.descriptor);
      const existingFace = faces.find((f) => euclideanDistance(f.descriptor, descriptor) < 0.55);
      if (existingFace) {
        setStatus('error');
        setMessage(`This face is already registered as "${existingFace.name}".`);
        return;
      }

      const newFace: RegisteredFace = {
        id: Math.random().toString(36).slice(2, 10),
        name: registerName.trim(),
        descriptor,
        createdAt: Date.now(),
        quality: Math.round(quality * 100) / 100,
      };

      const updatedFaces = [...faces, newFace];
      setFaces(updatedFaces);
      saveFaces(updatedFaces);

      setStatus('success');
      setMessage(`Face registered successfully as "${registerName}" with ${Math.round(quality * 100)}% quality.`);
      setRegisterName('');
      stopCamera();
      setRegistering(false);
      setCaptureProgress(0);

      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch {
      setStatus('error');
      setMessage('Registration failed. Please try again.');
    }
  }, [faceDetected, quality, tooClose, faces, registerName, stopCamera]);

  const detectLoop = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.paused) return;

    try {
      const result = await detectFace(video);
      if (result.detected && result.box && result.descriptor) {
        const q = calculateQuality(result.box, video.videoWidth || 640, video.videoHeight || 480, result.score || 0);
        const faceArea = result.box.width * result.box.height;
        const videoArea = (video.videoWidth || 640) * (video.videoHeight || 480);
        setTooClose(faceArea / videoArea > 0.45);
        setQuality(q);
        setFaceDetected(true);
      } else {
        setFaceDetected(false);
        setQuality(0);
        setTooClose(false);
      }
    } catch {
      setFaceDetected(false);
      setQuality(0);
      setTooClose(false);
    }
  }, []);

  const handleStartRegistration = async () => {
    if (!registerName.trim()) {
      setMessage('Please enter a name for this face.');
      return;
    }

    setRegistering(true);
    setStatus('loading');
    setMessage('Loading face recognition models…');
    setCaptureProgress(0);

    try {
      const cameraStarted = await startCamera();
      if (!cameraStarted) {
        setStatus('error');
        setMessage('Camera could not start. Make sure you have granted camera permission and are on HTTPS.');
        return;
      }
      setStatus('scanning');
      setMessage('Position your face inside the oval. Hold steady when the ring completes.');
      detectionIntervalRef.current = setInterval(detectLoop, 200);
    } catch (err) {
      setStatus('error');
      setMessage('Camera access denied or unavailable. Close any other app using the camera and allow permission.');
      setRegistering(false);
      stopCamera();
    }
  };

  const handleRetryCamera = async () => {
    if (!registerName.trim()) {
      setMessage('Please enter a name first.');
      return;
    }
    setStatus('loading');
    setMessage('Retrying camera…');
    try {
      const started = await startCamera();
      if (!started) {
        setStatus('error');
        setMessage('Camera still unavailable.');
        return;
      }
      setStatus('scanning');
      setMessage('Camera ready. Position your face inside the oval.');
      detectionIntervalRef.current = setInterval(detectLoop, 200);
    } catch {
      setStatus('error');
      setMessage('Camera retry failed.');
    }
  };

  const handleCancel = () => {
    stopCamera();
    setRegistering(false);
    setStatus('idle');
    setMessage('');
    setRegisterName('');
    setCaptureProgress(0);
  };

  const handleDelete = (id: string) => {
    const updatedFaces = faces.filter((f) => f.id !== id);
    setFaces(updatedFaces);
    saveFaces(updatedFaces);
  };

  // Auto-capture when face is stable and good quality
  useEffect(() => {
    if (!registering || !cameraReady || !faceDetected || quality < MIN_QUALITY || tooClose) {
      captureStartRef.current = null;
      setCaptureProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      return;
    }

    if (captureStartRef.current === null) {
      captureStartRef.current = Date.now();
    }

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - (captureStartRef.current || Date.now());
      const progress = Math.min(1, elapsed / AUTO_CAPTURE_MS);
      setCaptureProgress(progress);
      if (progress >= 1) {
        handleRegister();
      }
    }, 50);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [registering, cameraReady, faceDetected, quality, tooClose, handleRegister]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const instruction = !cameraReady
    ? 'Starting camera…'
    : status === 'success'
    ? 'Registered'
    : status === 'error'
    ? message || 'Failed'
    : tooClose
    ? 'Move back — face is too close'
    : faceDetected && quality < MIN_QUALITY
    ? 'Center your face in the oval'
    : faceDetected
    ? 'Hold steady…'
    : 'Position your face inside the oval';

  const statusColor =
    status === 'success' ? 'text-emerald-500' : status === 'error' ? 'text-rose-500' : tooClose ? 'text-rose-500' : faceDetected && quality >= MIN_QUALITY ? 'text-emerald-500' : 'text-amber-500';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ScanFace className="w-5 h-5 text-indigo-600" /> Face ID Management
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Register your face to enable Face ID login and fallback on failed transactions.
          </p>
        </div>
      </div>

      {/* Registered Faces */}
      <div className="space-y-2">
        {faces.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
            <User className="w-12 h-12 mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">No faces registered yet.</p>
            <p className="text-xs text-slate-400 mt-1">Register once to unlock Face ID login.</p>
          </div>
        ) : (
          faces.map((face) => (
            <motion.div
              key={face.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{face.name}</p>
                  <p className="text-[10px] text-slate-400">
                    Registered {new Date(face.createdAt).toLocaleDateString('en-IN')} • {Math.round(face.quality * 100)}% quality
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(face.id)}
                className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Register New Face */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Register New Face (HD)
        </h4>

        {!registering ? (
          <div className="space-y-3">
            <input
              type="text"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              placeholder="Enter name (e.g., Deepanshu)"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400/30"
            />
            <button
              onClick={handleStartRegistration}
              disabled={!registerName.trim()}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Start Face Registration
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] max-w-md mx-auto max-h-[420px]">
              {/* Live camera feed — object-contain so the whole frame is visible */}
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-contain transform -scale-x-100 bg-black"
                playsInline
                muted
                autoPlay
                onLoadedMetadata={() => setCameraReady(true)}
              />

              {/* SVG overlay: dark mask with clear oval + guide + progress ring */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <mask id="faceOvalMask">
                    <rect width="100" height="100" fill="white" />
                    <ellipse cx="50" cy="50" rx={GUIDE_RX} ry={GUIDE_RY} fill="black" />
                  </mask>
                </defs>

                {/* Dark overlay with oval cutout */}
                <rect width="100" height="100" fill="rgba(0,0,0,0.45)" mask="url(#faceOvalMask)" />

                {/* Oval guide border */}
                <ellipse
                  cx="50"
                  cy="50"
                  rx={GUIDE_RX}
                  ry={GUIDE_RY}
                  fill="none"
                  stroke={tooClose ? '#EF4444' : faceDetected && quality >= MIN_QUALITY ? '#10B981' : 'rgba(255,255,255,0.7)'}
                  strokeWidth="1.2"
                />

                {/* Auto-capture progress ring */}
                {captureProgress > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r={RING_R}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${RING_CIRCUMFERENCE * captureProgress} ${RING_CIRCUMFERENCE}`}
                    transform="rotate(-90 50 50)"
                  />
                )}
              </svg>

              {/* Instruction pill */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold whitespace-nowrap">
                <span className={statusColor}>{instruction}</span>
                {cameraReady && faceDetected && (
                  <span className="ml-2 opacity-90">{Math.round(quality * 100)}%</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {status === 'success' ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                  </span>
                ) : status === 'error' ? (
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Failed
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${cameraReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {cameraReady ? 'Camera live' : 'Camera starting…'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {status === 'error' && (
                  <button
                    onClick={handleRetryCamera}
                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retry
                  </button>
                )}
                <button
                  onClick={handleCancel}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={!faceDetected || quality < MIN_QUALITY || tooClose}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Capture & Register ({Math.round(quality * 100)}%)
            </button>
          </div>
        )}

        {message && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs mt-2 ${
              status === 'success' ? 'text-emerald-600' : status === 'error' ? 'text-rose-600' : 'text-slate-500'
            }`}
          >
            {message}
          </motion.p>
        )}
      </div>

      {/* Tips */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">Tips for Best Results:</p>
        <ul className="text-[10px] text-slate-500 space-y-0.5">
          <li>• Ensure good front lighting on your face</li>
          <li>• Position your face inside the oval guide</li>
          <li>• Keep a neutral expression and look at the camera</li>
          <li>• Remove sunglasses / masks / hats</li>
          <li>• Hold steady for 1–2 seconds after the ring turns green</li>
        </ul>
      </div>
    </div>
  );
}

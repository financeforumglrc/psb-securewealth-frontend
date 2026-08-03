import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, XCircle, Trash2, Plus, User, Shield, ScanFace } from 'lucide-react';
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

  // Ideal face occupies 18–35% of the frame
  let sizeScore = 0;
  if (sizeRatio >= 0.10 && sizeRatio <= 0.40) {
    sizeScore = 1 - Math.abs(sizeRatio - 0.25) / 0.25;
  } else if (sizeRatio < 0.10) {
    sizeScore = Math.max(0, sizeRatio / 0.10);
  } else {
    sizeScore = Math.max(0, 1 - (sizeRatio - 0.40) / 0.40);
  }

  // Center position
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const centerScoreX = 1 - Math.min(1, Math.abs(centerX - videoWidth / 2) / (videoWidth / 3));
  const centerScoreY = 1 - Math.min(1, Math.abs(centerY - videoHeight / 2) / (videoHeight / 3));
  const centerScore = (centerScoreX + centerScoreY) / 2;

  // Detection confidence
  const confidenceScore = Math.max(0, Math.min(1, score));

  return Math.max(0, Math.min(1, sizeScore * 0.45 + centerScore * 0.35 + confidenceScore * 0.2));
}

/** Map an intrinsic video coordinate box to a CSS-mirrored display overlay. */
function mapFaceBoxToOverlay(
  box: { x: number; y: number; width: number; height: number },
  videoWidth: number,
  videoHeight: number,
  overlayWidth: number,
  overlayHeight: number
) {
  const scale = Math.max(overlayWidth / videoWidth, overlayHeight / videoHeight);
  const drawW = videoWidth * scale;
  const drawH = videoHeight * scale;
  const offsetX = (overlayWidth - drawW) / 2;
  const offsetY = (overlayHeight - drawH) / 2;

  const x = box.x * scale + offsetX;
  const y = box.y * scale + offsetY;
  const w = box.width * scale;
  const h = box.height * scale;

  // Mirror because the video is flipped via CSS
  const mirroredX = overlayWidth - (x + w);
  return { x: mirroredX, y, w, h };
}

export default function FaceIDSettings() {
  const [faces, setFaces] = useState<RegisteredFace[]>(loadFaces());
  const [registering, setRegistering] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'scanning' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [faceBox, setFaceBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [quality, setQuality] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [tooClose, setTooClose] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const captureStartRef = useRef<number | null>(null);

  const drawOverlay = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      rafRef.current = requestAnimationFrame(drawOverlay);
      return;
    }

    const rect = container.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    const minDim = Math.min(width, height);
    const ovalW = minDim * 0.55;
    const ovalH = minDim * 0.70;
    const cx = width / 2;
    const cy = height / 2;

    // Draw a darkened mask with a clear oval cut-out for the guide
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.ellipse(cx, cy, ovalW / 2, ovalH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Guide oval border
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, ovalW / 2, ovalH / 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Face box + status
    if (faceBox && video && video.videoWidth && video.videoHeight) {
      const { x, y, w, h } = mapFaceBoxToOverlay(faceBox, video.videoWidth, video.videoHeight, width, height);
      const isGood = quality >= MIN_QUALITY && !tooClose;
      ctx.strokeStyle = isGood ? '#10B981' : tooClose ? '#EF4444' : '#F59E0B';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, w, h);

      // Label
      const label = isGood ? 'HOLD STEADY' : tooClose ? 'MOVE BACK' : 'CENTER FACE';
      ctx.font = 'bold 13px Inter, sans-serif';
      const textWidth = ctx.measureText(label).width;
      const pad = 8;
      ctx.fillStyle = isGood ? '#10B981' : tooClose ? '#EF4444' : '#F59E0B';
      ctx.fillRect(x, y - 28, textWidth + pad * 2, 26);
      ctx.fillStyle = '#000';
      ctx.fillText(label, x + pad, y - 9);
    }

    // Auto-capture progress ring around the oval
    if (captureProgress > 0 && quality >= MIN_QUALITY) {
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, ovalW / 2 + 8, ovalH / 2 + 8, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * captureProgress);
      ctx.stroke();
    }

    rafRef.current = requestAnimationFrame(drawOverlay);
  }, [faceBox, quality, tooClose, captureProgress]);

  const stopCamera = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setFaceBox(null);
    setQuality(0);
    setCameraReady(false);
    setTooClose(false);
    setCaptureProgress(0);
    captureStartRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: 'user',
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 },
      },
      audio: false,
    };

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
          audio: false,
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false,
          });
        } catch {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          } catch (err) {
            setStatus('error');
            setMessage('Camera access denied. Allow camera permission and use HTTPS. Close any other app using the camera.');
            setRegistering(false);
            return false;
          }
        }
      }
    }

    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('webkit-playsinline', 'true');

      try {
        await videoRef.current.play();
      } catch {
        setStatus('error');
        setMessage('Camera started but video playback failed. Please try again.');
        return false;
      }
    }

    setCameraReady(true);
    return true;
  }, [stopCamera]);

  const detectLoop = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    try {
      const result = await detectFace(video);
      if (result.detected && result.box && result.descriptor) {
        const q = calculateQuality(
          result.box,
          video.videoWidth || 640,
          video.videoHeight || 480,
          result.score || 0
        );
        const faceArea = result.box.width * result.box.height;
        const videoArea = (video.videoWidth || 640) * (video.videoHeight || 480);
        setTooClose(faceArea / videoArea > 0.45);
        setFaceBox(result.box);
        setQuality(q);
      } else {
        setFaceBox(null);
        setQuality(0);
        setTooClose(false);
      }
    } catch {
      setFaceBox(null);
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

    const cameraStarted = await startCamera();
    if (!cameraStarted) return;

    setStatus('scanning');
    setMessage('Position your face inside the oval. Hold steady when the box turns green.');

    detectionIntervalRef.current = setInterval(detectLoop, 250);
    rafRef.current = requestAnimationFrame(drawOverlay);
  };

  const handleRegister = async () => {
    const video = videoRef.current;
    if (!video || !faceBox || quality < MIN_QUALITY || tooClose) {
      setStatus('error');
      setMessage('No clear face detected. Move back, adjust lighting and position.');
      return;
    }

    setStatus('loading');
    setMessage('Capturing HD face descriptor…');

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
  };

  // Auto-capture when face is stable and good quality
  useEffect(() => {
    if (!registering || !cameraReady || !faceBox || quality < MIN_QUALITY || tooClose) {
      captureStartRef.current = null;
      setCaptureProgress(0);
      return;
    }
    if (captureStartRef.current === null) captureStartRef.current = Date.now();

    const id = setInterval(() => {
      const elapsed = Date.now() - (captureStartRef.current || Date.now());
      const progress = Math.min(1, elapsed / AUTO_CAPTURE_MS);
      setCaptureProgress(progress);
      if (progress >= 1) {
        handleRegister();
      }
    }, 50);

    return () => clearInterval(id);
  }, [registering, cameraReady, faceBox, quality, tooClose]);

  const handleDelete = (id: string) => {
    const updatedFaces = faces.filter((f) => f.id !== id);
    setFaces(updatedFaces);
    saveFaces(updatedFaces);
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

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
            <div
              ref={containerRef}
              className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]"
            >
              {/* Live camera feed — visible, not hidden */}
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                playsInline
                muted
                autoPlay
                onLoadedMetadata={() => setCameraReady(true)}
              />
              {/* Overlay canvas for guide + face box */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
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
                ) : faceBox ? (
                  <span>
                    Quality:{' '}
                    <strong className={quality >= MIN_QUALITY && !tooClose ? 'text-emerald-600' : 'text-amber-500'}>
                      {Math.round(quality * 100)}%
                    </strong>
                    {tooClose && <span className="text-rose-500 ml-2">Move back</span>}
                  </span>
                ) : (
                  <span>Searching for face…</span>
                )}
              </div>
              <button
                onClick={() => {
                  stopCamera();
                  setRegistering(false);
                  setStatus('idle');
                  setMessage('');
                  setCaptureProgress(0);
                }}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>

            <button
              onClick={handleRegister}
              disabled={!faceBox || quality < MIN_QUALITY || tooClose}
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
          <li>• Hold steady for 1–2 seconds after the box turns green</li>
        </ul>
      </div>
    </div>
  );
}

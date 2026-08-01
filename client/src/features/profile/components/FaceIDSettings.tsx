import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, XCircle, Trash2, Plus, User, Zap, Shield } from 'lucide-react';
import { detectFace, euclideanDistance } from '@/shared/lib/faceAuth';

interface RegisteredFace {
  id: string;
  name: string;
  descriptor: number[];
  createdAt: number;
  quality: number;
}

const FACE_STORAGE_KEY = 'sw_registered_faces';
const MAX_ATTEMPTS = 5;
const MIN_QUALITY = 0.7;

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

function calculateQuality(box: { x: number; y: number; width: number; height: number }, videoWidth: number, videoHeight: number): number {
  // Face size relative to video
  const faceArea = box.width * box.height;
  const videoArea = videoWidth * videoHeight;
  const sizeRatio = faceArea / videoArea;
  
  // Ideal size is 10-30% of video (smaller is better)
  const minSize = 0.1;
  const maxSize = 0.3;
  const idealSize = 0.2;
  
  let sizeScore = 0;
  if (sizeRatio >= minSize && sizeRatio <= maxSize) {
    sizeScore = 1 - Math.abs(sizeRatio - idealSize) / idealSize;
  } else if (sizeRatio > maxSize) {
    // Face too large - penalize heavily
    sizeScore = Math.max(0, 1 - (sizeRatio - maxSize) / maxSize);
  }
  
  // Center position
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const centerScoreX = 1 - Math.abs(centerX - videoWidth / 2) / (videoWidth / 2);
  const centerScoreY = 1 - Math.abs(centerY - videoHeight / 2) / (videoHeight / 2);
  const centerScore = (centerScoreX + centerScoreY) / 2;
  
  return Math.max(0, Math.min(1, (sizeScore * 0.7 + centerScore * 0.3)));
}

export default function FaceIDSettings() {
  const [faces, setFaces] = useState<RegisteredFace[]>(loadFaces());
  const [registering, setRegistering] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [faceBox, setFaceBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [quality, setQuality] = useState(0);
  const [hdMode, setHdMode] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCamera = useCallback(async () => {
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const constraints = {
        video: {
          facingMode: 'user',
          width: hdMode ? { ideal: 1280, min: 640 } : { ideal: 640 },
          height: hdMode ? { ideal: 720, min: 480 } : { ideal: 480 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        
        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not found'));
            return;
          }
          
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
              .then(() => resolve())
              .catch((e) => reject(e));
          };
          
          videoRef.current.onerror = () => {
            reject(new Error('Video failed to load'));
          };
          
          // Timeout after 5 seconds
          setTimeout(() => reject(new Error('Video load timeout')), 5000);
        });
      }
      return true;
    } catch (_err) {
      setStatus('error');
      setMessage('Unable to start camera. Please check permissions and ensure no other app is using the camera.');
      return false;
    }
  }, [hdMode]);

  const stopCamera = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setFaceBox(null);
  }, []);

  const detectFaceInFrame = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      const result = await detectFace(videoRef.current);
      if (result.detected && result.descriptor && result.box) {
        // Limit face box size to reasonable bounds
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;
        const maxWidth = videoWidth * 0.6;
        const maxHeight = videoHeight * 0.6;
        
        const box = {
          x: Math.max(0, result.box.x),
          y: Math.max(0, result.box.y),
          width: Math.min(result.box.width, maxWidth),
          height: Math.min(result.box.height, maxHeight),
        };
        
        setFaceBox(box);
        const q = calculateQuality(box, videoWidth, videoHeight);
        setQuality(q);
      } else {
        setFaceBox(null);
        setQuality(0);
      }
    } catch {
      setFaceBox(null);
      setQuality(0);
    }
  }, []);

  const startDetection = useCallback(() => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    detectionIntervalRef.current = setInterval(detectFaceInFrame, 200);
  }, [detectFaceInFrame]);

  const handleStartRegistration = async () => {
    setRegistering(true);
    setStatus('scanning');
    setMessage('Loading HD face recognition...');
    setAttempts(0);

    const cameraStarted = await startCamera();
    if (!cameraStarted) {
      setRegistering(false);
      return;
    }

    setMessage('Position your face in the center of the camera...');
    startDetection();
  };

  const handleRegister = async () => {
    if (!registerName.trim()) {
      setMessage('Please enter a name for this face.');
      return;
    }

    // Wait for face detection with quality check
    let attempts = 0;
    const maxAttempts = MAX_ATTEMPTS;
    
    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 800));
      
      if (faceBox && quality >= MIN_QUALITY) {
        break;
      }
      
      attempts++;
      setAttempts(attempts);
      setMessage(`Detecting face... Attempt ${attempts}/${maxAttempts}. ${faceBox ? `Quality: ${Math.round(quality * 100)}%` : 'No face detected'}`);
    }

    try {
      const result = await detectFace(videoRef.current!);
      if (!result.detected || !result.descriptor) {
        setStatus('error');
        setMessage('No face detected after multiple attempts. Please ensure good lighting and try again.');
        stopCamera();
        setRegistering(false);
        return;
      }

      if (quality < MIN_QUALITY) {
        setStatus('error');
        setMessage(`Face quality too low (${Math.round(quality * 100)}%). Please ensure your face is clearly visible and well-lit.`);
        stopCamera();
        setRegistering(false);
        return;
      }

      const descriptor = Array.from(result.descriptor);
      const newFace: RegisteredFace = {
        id: Math.random().toString(36).slice(2, 10),
        name: registerName.trim(),
        descriptor,
        createdAt: Date.now(),
        quality: Math.round(quality * 100) / 100,
      };

      // Check if face already exists
      const existingFace = faces.find((f) => euclideanDistance(f.descriptor, descriptor) < 0.6);
      if (existingFace) {
        setStatus('error');
        setMessage(`This face is already registered as "${existingFace.name}".`);
        stopCamera();
        setRegistering(false);
        return;
      }

      const updatedFaces = [...faces, newFace];
      setFaces(updatedFaces);
      saveFaces(updatedFaces);

      setStatus('success');
      setMessage(`Face registered successfully as "${registerName}" with ${Math.round(quality * 100)}% accuracy!`);
      setRegisterName('');
      stopCamera();
      setRegistering(false);

      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch (_err) {
      setStatus('error');
      setMessage('Face registration failed. Please try again.');
      stopCamera();
      setRegistering(false);
    }
  };

  const handleDelete = (id: string) => {
    const updatedFaces = faces.filter((f) => f.id !== id);
    setFaces(updatedFaces);
    saveFaces(updatedFaces);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" /> Face ID Management
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Register and manage your face for biometric authentication with HD accuracy.</p>
        </div>
        <button
          onClick={() => setHdMode(!hdMode)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${hdMode ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
        >
          {hdMode ? 'HD Mode' : 'SD Mode'}
        </button>
      </div>

      {/* Registered Faces */}
      <div className="space-y-2">
        {faces.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
            <User className="w-12 h-12 mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">No faces registered yet.</p>
            <p className="text-xs text-slate-400 mt-1">Register your face to enable Face ID login with HD accuracy.</p>
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
                    Registered {new Date(face.createdAt).toLocaleDateString('en-IN')} • {Math.round(face.quality * 100)}% accuracy
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
              placeholder="Enter name for this face (e.g., Deepanshu)"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400/30"
            />
            <button
              onClick={handleStartRegistration}
              disabled={!registerName.trim()}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Start HD Face Registration
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Face Box Overlay */}
              {faceBox && (
                <div
                  className="absolute border-2 border-emerald-500 rounded-lg pointer-events-none"
                  style={{
                    left: `${(faceBox.x / (videoRef.current?.videoWidth || 1)) * 100}%`,
                    top: `${(faceBox.y / (videoRef.current?.videoHeight || 1)) * 100}%`,
                    width: `${(faceBox.width / (videoRef.current?.videoWidth || 1)) * 100}%`,
                    height: `${(faceBox.height / (videoRef.current?.videoHeight || 1)) * 100}%`,
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded">
                    {Math.round(quality * 100)}%
                  </div>
                </div>
              )}

              {/* Center Guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-white/30 rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {status === 'scanning' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-xs text-slate-500">
                      {faceBox ? `Face detected: ${Math.round(quality * 100)}%` : 'Scanning...'}
                    </span>
                  </>
                )}
                {status === 'success' && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-emerald-600">Success!</span>
                  </>
                )}
                {status === 'error' && (
                  <>
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span className="text-xs text-rose-600">Error</span>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  stopCamera();
                  setRegistering(false);
                  setStatus('idle');
                  setMessage('');
                  setAttempts(0);
                }}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>

            <button
              onClick={handleRegister}
              disabled={status === 'scanning' || !faceBox || quality < MIN_QUALITY}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {status === 'scanning' ? (
                <>
                  <Zap className="w-4 h-4 animate-pulse" />
                  Detecting... {attempts}/{MAX_ATTEMPTS}
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Capture & Register ({Math.round(quality * 100)}%)
                </>
              )}
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
          <li>• Ensure good lighting on your face</li>
          <li>• Position your face in the center circle</li>
          <li>• Keep a neutral expression</li>
          <li>• Avoid wearing glasses or hats</li>
          <li>• Hold steady for 2-3 seconds</li>
        </ul>
      </div>
    </div>
  );
}

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, XCircle, Trash2, Plus, User } from 'lucide-react';
import { detectFace, euclideanDistance } from '@/shared/lib/faceAuth';

interface RegisteredFace {
  id: string;
  name: string;
  descriptor: number[];
  createdAt: number;
}

const FACE_STORAGE_KEY = 'sw_registered_faces';

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

export default function FaceIDSettings() {
  const [faces, setFaces] = useState<RegisteredFace[]>(loadFaces());
  const [registering, setRegistering] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch (_err) {
      setStatus('error');
      setMessage('Unable to start camera. Please check permissions.');
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const handleRegister = async () => {
    if (!registerName.trim()) {
      setMessage('Please enter a name for this face.');
      return;
    }
    setRegistering(true);
    setStatus('scanning');
    setMessage('Loading face recognition...');

    const cameraStarted = await startCamera();
    if (!cameraStarted) {
      setRegistering(false);
      return;
    }

    setMessage('Position your face in the camera...');

    // Wait a moment for camera to initialize
    await new Promise((r) => setTimeout(r, 1000));

    try {
      const result = await detectFace(videoRef.current!);
      if (!result.detected || !result.descriptor) {
        setStatus('error');
        setMessage('No face detected. Please try again.');
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
      setMessage(`Face registered successfully as "${registerName}"!`);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" /> Face ID Management
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Register and manage your face for biometric authentication.</p>
        </div>
      </div>

      {/* Registered Faces */}
      <div className="space-y-2">
        {faces.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
            <User className="w-12 h-12 mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">No faces registered yet.</p>
            <p className="text-xs text-slate-400 mt-1">Register your face to enable Face ID login.</p>
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
                    Registered {new Date(face.createdAt).toLocaleDateString('en-IN')}
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
          <Plus className="w-4 h-4" /> Register New Face
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
              onClick={() => setRegistering(true)}
              disabled={!registerName.trim()}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Start Face Registration
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
              <div className="absolute inset-0 border-2 border-indigo-500 rounded-xl pointer-events-none" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {status === 'scanning' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-xs text-slate-500">Scanning...</span>
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
                }}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>

            <button
              onClick={handleRegister}
              disabled={status === 'scanning'}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-40"
            >
              {status === 'scanning' ? 'Scanning...' : 'Capture & Register'}
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

      {/* Info */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <p className="text-[10px] text-slate-500">
          <strong>Note:</strong> Your face data is stored locally on your device and never uploaded to any server.
          Face ID works entirely offline using on-device machine learning.
        </p>
      </div>
    </div>
  );
}

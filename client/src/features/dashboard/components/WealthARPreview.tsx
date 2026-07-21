import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Gem, TrendingUp, Shield, X } from 'lucide-react';
import { useWealthStore } from '@/shared/store/wealthStore';

function formatCurrency(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function WealthARPreview() {
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const assets = useWealthStore((s) => s.assets);
  const goals = useWealthStore((s) => s.goals);
  const netWorth = assets.reduce((sum, a) => sum + a.value, 0);

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch (_err) {
      setError('Camera access denied. AR preview unavailable.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Camera className="w-5 h-5 text-indigo-600" /> AR Wealth Preview
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Point your camera at the real world and see your wealth overlaid.</p>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700">
        {/* Camera Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full aspect-video object-cover ${cameraOn ? '' : 'hidden'}`}
        />

        {!cameraOn && (
          <div className="aspect-video flex flex-col items-center justify-center text-slate-400">
            <CameraOff className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">Camera off</p>
            <button
              onClick={startCamera}
              className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
            >
              Enable AR Camera
            </button>
            {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
          </div>
        )}

        {/* AR Overlay */}
        {cameraOn && (
          <>
            {/* Net Worth Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-4 p-3 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-indigo-500/30"
            >
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Net Worth</p>
                  <p className="text-lg font-black text-white">{formatCurrency(netWorth)}</p>
                </div>
              </div>
            </motion.div>

            {/* Goals Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 right-4 p-3 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-emerald-500/30"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Active Goals</p>
                  <p className="text-lg font-black text-white">{goals.length}</p>
                </div>
              </div>
            </motion.div>

            {/* Protection Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute bottom-4 left-4 p-3 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-rose-500/30"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-400" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Protection</p>
                  <p className="text-sm font-bold text-white">Quantum-Safe</p>
                </div>
              </div>
            </motion.div>

            {/* Asset Markers */}
            {assets.slice(0, 4).map((asset, i) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.2 }}
                className="absolute p-2 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-white/20"
                style={{
                  top: `${30 + i * 20}%`,
                  left: `${20 + i * 15}%`,
                }}
              >
                <p className="text-[9px] text-white/70">{asset.name}</p>
                <p className="text-xs font-bold text-white">{formatCurrency(asset.value)}</p>
              </motion.div>
            ))}

            {/* Close Button */}
            <button
              onClick={stopCamera}
              className="absolute top-4 right-20 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <p className="text-[10px] text-slate-500 flex items-start gap-2">
          <Camera className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>
            Point your camera at your surroundings to see your wealth markers overlaid on the real world.
            This uses WebRTC camera access — no video is recorded or uploaded.
          </span>
        </p>
      </div>
    </div>
  );
}

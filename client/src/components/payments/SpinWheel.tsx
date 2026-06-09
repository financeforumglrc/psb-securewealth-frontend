import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRewards } from '../../context/RewardsContext';

const SEGMENTS = [
  { label: '1%', color: '#ef4444', value: 1 },
  { label: '2%', color: '#f97316', value: 2 },
  { label: '3%', color: '#eab308', value: 3 },
  { label: '5%', color: '#22c55e', value: 5 },
  { label: '1%', color: '#06b6d4', value: 1 },
  { label: '2%', color: '#3b82f6', value: 2 },
  { label: '3%', color: '#a855f7', value: 3 },
  { label: '5%', color: '#ec4899', value: 5 },
];

export default function SpinWheel() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ label: string; value: number } | null>(null);
  const { addCashback } = useRewards();
  const wheelRef = useRef<HTMLDivElement>(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const extraSpins = 5 + Math.random() * 3;
    const segmentAngle = 360 / SEGMENTS.length;
    const randomOffset = Math.random() * segmentAngle;
    const newRotation = rotation + extraSpins * 360 + randomOffset;
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      const finalAngle = newRotation % 360;
      const index = Math.floor((360 - finalAngle + segmentAngle / 2) / segmentAngle) % SEGMENTS.length;
      const won = SEGMENTS[index];
      setResult(won);
      addCashback(won.value, 'spin-wheel', 'Spin the Wheel');
    }, 3000);
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 text-center">
      <h3 className="font-bold text-slate-800 dark:text-white flex items-center justify-center gap-2 mb-2">
        <i className="fas fa-dharmachakra text-rose-500" />
        Spin & Win Cashback
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Spin after every payment for extra rewards!</p>

      <div className="relative w-48 h-48 mx-auto mb-4">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-rose-500" />
        </div>
        {/* Wheel */}
        <motion.div
          ref={wheelRef}
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: 'easeOut' }}
          className="w-full h-full rounded-full relative overflow-hidden border-4 border-slate-200 dark:border-slate-700"
          style={{ transformOrigin: 'center center' }}
        >
          {SEGMENTS.map((seg, i) => {
            const angle = (360 / SEGMENTS.length) * i;
            return (
              <div
                key={i}
                className="absolute w-full h-full flex items-start justify-center pt-3"
                style={{
                  transform: `rotate(${angle}deg)`,
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.sin((2 * Math.PI) / SEGMENTS.length)}% ${50 - 50 * Math.cos((2 * Math.PI) / SEGMENTS.length)}%, 50% 0%)`,
                }}
              >
                <span
                  className="text-[10px] font-bold text-white mt-1"
                  style={{ transform: `rotate(${180 / SEGMENTS.length}deg)` }}
                >
                  {seg.label}
                </span>
              </div>
            );
          })}
          {/* Colored segments overlay */}
          {SEGMENTS.map((seg, i) => {
            const startAngle = (360 / SEGMENTS.length) * i;
            return (
              <div
                key={`c${i}`}
                className="absolute inset-0"
                style={{
                  background: `conic-gradient(from ${startAngle}deg, ${seg.color} 0deg, ${seg.color} ${360 / SEGMENTS.length}deg, transparent ${360 / SEGMENTS.length}deg)`,
                  opacity: 0.85,
                }}
              />
            );
          })}
        </motion.div>
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center">
            <i className="fas fa-star text-amber-400 text-xs" />
          </div>
        </div>
      </div>

      <button
        onClick={spin}
        disabled={spinning}
        className="px-8 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors disabled:opacity-50"
      >
        {spinning ? 'Spinning...' : 'SPIN'}
      </button>

      {result && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl"
        >
          <p className="text-sm font-bold text-green-600">🎉 You won {result.label} extra cashback!</p>
          <p className="text-xs text-green-500">+₹{result.value} added to wallet</p>
        </motion.div>
      )}
    </div>
  );
}

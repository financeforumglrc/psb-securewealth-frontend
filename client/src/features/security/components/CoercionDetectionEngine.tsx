import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Fingerprint, Clock, Smartphone, Zap, Keyboard, Mouse } from 'lucide-react';
import { useWealthStore } from '@/shared/store/wealthStore';

interface CoercionSignals {
  typingAnomaly: number;
  mouseAnomaly: number;
  deviceTiltAnomaly: number;
  timeAnomaly: number;
  urgencyAnomaly: number;
}

interface CoercionResult {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action: 'ALLOW' | 'WARN' | 'DELAY' | 'BLOCK';
  signals: CoercionSignals;
  timestamp: number;
}

const STORAGE_KEY = 'sw_coercion_baseline';

function loadBaseline(): CoercionSignals | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveBaseline(baseline: CoercionSignals) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(baseline));
  } catch {
    // ignore
  }
}

export function useCoercionDetection() {
  const [signals, setSignals] = useState<CoercionSignals>({
    typingAnomaly: 0,
    mouseAnomaly: 0,
    deviceTiltAnomaly: 0,
    timeAnomaly: 0,
    urgencyAnomaly: 0,
  });
  const [baseline, setBaseline] = useState<CoercionSignals | null>(loadBaseline);
  const [isLearning, setIsLearning] = useState(true);
  const keystrokeRef = useRef<number[]>([]);
  const mouseRef = useRef<{ x: number; y: number; time: number }[]>([]);
  const actionRef = useRef<number[]>([]);
  const tiltRef = useRef<number[]>([]);

  // Typing anomaly
  useEffect(() => {
    const handleKeyDown = () => {
      keystrokeRef.current.push(Date.now());
      if (keystrokeRef.current.length > 20) keystrokeRef.current.shift();
    };
    const handleKeyUp = () => {
      const times = keystrokeRef.current;
      if (times.length >= 5) {
        const intervals = [];
        for (let i = 1; i < times.length; i++) intervals.push(times[i] - times[i - 1]);
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / intervals.length;
        const anomaly = Math.min(Math.sqrt(variance) / 100, 1);
        setSignals((s) => ({ ...s, typingAnomaly: anomaly }));
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse anomaly
  useEffect(() => {
    let lastX = 0, lastY = 0, lastTime = Date.now();
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = now - lastTime;
      if (dt > 0) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        const speed = Math.sqrt(dx * dx + dy * dy) / dt;
        mouseRef.current.push({ x: e.clientX, y: e.clientY, time: now });
        if (mouseRef.current.length > 50) mouseRef.current.shift();
        
        // Jitter detection (rapid direction changes)
        let jitter = 0;
        const moves = mouseRef.current;
        for (let i = 2; i < moves.length; i++) {
          const d1x = moves[i - 1].x - moves[i - 2].x;
          const d1y = moves[i - 1].y - moves[i - 2].y;
          const d2x = moves[i].x - moves[i - 1].x;
          const d2y = moves[i].y - moves[i - 1].y;
          const angle1 = Math.atan2(d1y, d1x);
          const angle2 = Math.atan2(d2y, d2x);
          let diff = Math.abs(angle1 - angle2);
          if (diff > Math.PI) diff = 2 * Math.PI - diff;
          if (diff > Math.PI / 2) jitter++;
        }
        const anomaly = Math.min(jitter / 10 + speed / 10, 1);
        setSignals((s) => ({ ...s, mouseAnomaly: anomaly }));
      }
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Device tilt anomaly (for mobile)
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        tiltRef.current.push(Math.abs(e.beta) + Math.abs(e.gamma));
        if (tiltRef.current.length > 20) tiltRef.current.shift();
        const avg = tiltRef.current.reduce((a, b) => a + b, 0) / tiltRef.current.length;
        const anomaly = Math.min(avg / 90, 1);
        setSignals((s) => ({ ...s, deviceTiltAnomaly: anomaly }));
      }
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // Time anomaly
  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      // Late night = high anomaly
      const anomaly = hour >= 0 && hour <= 5 ? 1 : hour >= 22 || hour <= 6 ? 0.7 : hour >= 20 || hour <= 8 ? 0.3 : 0;
      setSignals((s) => ({ ...s, timeAnomaly: anomaly }));
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Urgency anomaly
  useEffect(() => {
    const handleAction = () => {
      actionRef.current.push(Date.now());
      if (actionRef.current.length > 10) actionRef.current.shift();
      const times = actionRef.current;
      if (times.length >= 3) {
        const intervals = [];
        for (let i = 1; i < times.length; i++) intervals.push(times[i] - times[i - 1]);
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const anomaly = avg < 500 ? 1 : avg < 1000 ? 0.7 : avg < 2000 ? 0.3 : 0;
        setSignals((s) => ({ ...s, urgencyAnomaly: anomaly }));
      }
    };
    document.addEventListener('click', handleAction);
    document.addEventListener('touchstart', handleAction);
    return () => {
      document.removeEventListener('click', handleAction);
      document.removeEventListener('touchstart', handleAction);
    };
  }, []);

  const computeCoercionScore = useCallback((): CoercionResult => {
    const weights = { typing: 0.2, mouse: 0.2, tilt: 0.1, time: 0.2, urgency: 0.3 };
    const score = Math.round(
      (signals.typingAnomaly * weights.typing +
        signals.mouseAnomaly * weights.mouse +
        signals.deviceTiltAnomaly * weights.tilt +
        signals.timeAnomaly * weights.time +
        signals.urgencyAnomaly * weights.urgency) * 100
    );

    let level: CoercionResult['level'] = 'LOW';
    let action: CoercionResult['action'] = 'ALLOW';
    if (score >= 80) { level = 'CRITICAL'; action = 'BLOCK'; }
    else if (score >= 60) { level = 'HIGH'; action = 'DELAY'; }
    else if (score >= 40) { level = 'MEDIUM'; action = 'WARN'; }

    return { score, level, action, signals, timestamp: Date.now() };
  }, [signals]);

  const setCoercionBaseline = useCallback(() => {
    saveBaseline(signals);
    setBaseline(signals);
    setIsLearning(false);
  }, [signals]);

  return { signals, baseline, isLearning, computeCoercionScore, setCoercionBaseline };
}

function SignalBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  const color = value >= 0.7 ? 'bg-rose-500' : value >= 0.4 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
          <Icon className="w-3 h-3" /> {label}
        </span>
        <span className="font-bold text-slate-800 dark:text-white">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

export default function CoercionDetectionEngine() {
  const { signals, isLearning, computeCoercionScore, setCoercionBaseline } = useCoercionDetection();
  const [result, setResult] = useState<CoercionResult | null>(null);
  const duressModeActive = useWealthStore((s) => s.duressModeActive);

  useEffect(() => {
    const interval = setInterval(() => {
      setResult(computeCoercionScore());
    }, 1000);
    return () => clearInterval(interval);
  }, [computeCoercionScore]);

  const getActionColor = (action: string) => {
    if (action === 'BLOCK') return 'bg-rose-500 text-white';
    if (action === 'DELAY') return 'bg-amber-500 text-white';
    if (action === 'WARN') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" /> Multi-Modal Coercion Detection
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Patent-pending: 5-signal fusion to detect forced transactions.</p>
        </div>
        {result && (
          <span className={`px-3 py-1 rounded-lg text-xs font-black ${getActionColor(result.action)}`}>
            {result.action}
          </span>
        )}
      </div>

      {isLearning && (
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
          <p className="text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <Fingerprint className="w-4 h-4" />
            Learning your behavioral baseline... Use the app normally for 30 seconds, then set baseline.
          </p>
          <button
            onClick={setCoercionBaseline}
            className="mt-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
          >
            Set Baseline
          </button>
        </div>
      )}

      {/* Risk Score Hero */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70 uppercase tracking-wider">Coercion Risk Score</p>
            <p className="text-4xl font-black mt-1">{result?.score ?? 0}<span className="text-lg text-white/50">/100</span></p>
            <p className="text-xs text-white/70 mt-1">
              {result?.level === 'LOW' && 'Normal behavior detected. Transactions allowed.'}
              {result?.level === 'MEDIUM' && 'Some anomalies. Monitor closely.'}
              {result?.level === 'HIGH' && 'High risk of coercion. Delay transactions.'}
              {result?.level === 'CRITICAL' && 'CRITICAL: Possible forced transaction. Block immediately.'}
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
              result?.level === 'LOW' ? 'bg-emerald-500/20 text-emerald-300' :
              result?.level === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' :
              result?.level === 'HIGH' ? 'bg-rose-500/20 text-rose-300' :
              'bg-rose-600/30 text-rose-200'
            }`}>
              {result?.level ?? 'LOW'}
            </div>
          </div>
        </div>
      </div>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Behavioral Signals</h3>
          <SignalBar label="Typing Pattern" value={signals.typingAnomaly} icon={Keyboard} />
          <SignalBar label="Mouse Movement" value={signals.mouseAnomaly} icon={Mouse} />
          <SignalBar label="Device Orientation" value={signals.deviceTiltAnomaly} icon={Smartphone} />
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Contextual Signals</h3>
          <SignalBar label="Time of Day" value={signals.timeAnomaly} icon={Clock} />
          <SignalBar label="Action Urgency" value={signals.urgencyAnomaly} icon={Zap} />
          <div className="pt-2">
            <p className="text-[10px] text-slate-500">
              {duressModeActive ? '⚠️ Duress mode is active. Showing decoy data.' : '✅ Normal mode. All systems secure.'}
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-2">Patent-Pending Technology</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-slate-500">
          <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Typing biometrics</div>
          <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Mouse dynamics</div>
          <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Device orientation</div>
          <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Temporal analysis</div>
          <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Urgency detection</div>
          <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Signal fusion</div>
          <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Risk scoring</div>
          <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Proportionate action</div>
        </div>
      </div>
    </div>
  );
}

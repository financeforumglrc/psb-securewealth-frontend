import { useState, useEffect, useRef, useCallback } from 'react';
import { useSecurityActions } from '@/shared/context/SecurityContext';

export interface BiometricProfile {
  avgKeystrokeDuration: number;
  avgMouseSpeed: number;
  avgMouseCurvature: number;
  recordedAt: number;
}

interface BiometricMetrics {
  keystrokeDurations: number[];
  mouseSpeeds: number[];
  mouseCurvatures: number[];
}

export interface BehavioralBiometricsReturn {
  deviation: number;
  isAnomaly: boolean;
  baselineSet: boolean;
  trustImpact: number;
}

const BASELINE_KEY = 'sw_behavioral_baseline';

function loadBaseline(): BiometricProfile | null {
  try {
    const raw = localStorage.getItem(BASELINE_KEY);
    if (raw) return JSON.parse(raw) as BiometricProfile;
  } catch {
    /* noop */
  }
  return null;
}

function saveBaseline(profile: BiometricProfile) {
  try {
    localStorage.setItem(BASELINE_KEY, JSON.stringify(profile));
  } catch {
    /* noop */
  }
}

function computeDeviation(
  current: BiometricProfile,
  baseline: BiometricProfile
): number {
  const diffKs =
    Math.abs(current.avgKeystrokeDuration - baseline.avgKeystrokeDuration) /
    (baseline.avgKeystrokeDuration || 1);
  const diffMs =
    Math.abs(current.avgMouseSpeed - baseline.avgMouseSpeed) /
    (baseline.avgMouseSpeed || 1);
  const diffMc =
    Math.abs(current.avgMouseCurvature - baseline.avgMouseCurvature) /
    (baseline.avgMouseCurvature || 1);
  return (diffKs + diffMs + diffMc) / 3;
}

export function useBehavioralBiometrics(): BehavioralBiometricsReturn {
  const { updateBehavioral } = useSecurityActions();
  const [baselineSet, setBaselineSet] = useState(() => loadBaseline() !== null);
  const [deviation, setDeviation] = useState(0);
  const [isAnomaly, setIsAnomaly] = useState(false);
  const [trustImpact, setTrustImpact] = useState(0);

  const metricsRef = useRef<BiometricMetrics>({
    keystrokeDurations: [],
    mouseSpeeds: [],
    mouseCurvatures: [],
  });

  const MAX_SAMPLES = 200;
  const lastFinalizeRef = useRef<number>(0);

  const baselineRef = useRef<BiometricProfile | null>(loadBaseline());
  const mouseStateRef = useRef<{
    lastX: number;
    lastY: number;
    lastTime: number;
    lastAngle: number | null;
  } | null>(null);
  const mouseStartTimeRef = useRef<number>(0);
  const keystrokeMapRef = useRef<Record<string, number>>({});
  const reportedRef = useRef(false);

  const finalizeProfile = useCallback(() => {
    const now = Date.now();
    if (now - lastFinalizeRef.current < 1000) return;
    lastFinalizeRef.current = now;

    const m = metricsRef.current;
    if (m.keystrokeDurations.length < 10) return;
    if (
      mouseStartTimeRef.current === 0 ||
      now - mouseStartTimeRef.current < 5000
    )
      return;

    const profile: BiometricProfile = {
      avgKeystrokeDuration:
        m.keystrokeDurations.reduce((a, b) => a + b, 0) /
        m.keystrokeDurations.length,
      avgMouseSpeed:
        m.mouseSpeeds.length > 0
          ? m.mouseSpeeds.reduce((a, b) => a + b, 0) / m.mouseSpeeds.length
          : 0,
      avgMouseCurvature:
        m.mouseCurvatures.length > 0
          ? m.mouseCurvatures.reduce((a, b) => a + b, 0) /
            m.mouseCurvatures.length
          : 0,
      recordedAt: now,
    };

    const existing = baselineRef.current;
    if (!existing) {
      saveBaseline(profile);
      baselineRef.current = profile;
      setBaselineSet(true);
      return;
    }

    const dev = computeDeviation(profile, existing);
    setDeviation(dev);
    const anomaly = dev > 0.3;
    setIsAnomaly(anomaly);
    setTrustImpact(anomaly ? -20 : 5);

    if (anomaly && !reportedRef.current) {
      reportedRef.current = true;
      updateBehavioral(dev);
    }
  }, [updateBehavioral]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keystrokeMapRef.current[e.code] = Date.now();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const start = keystrokeMapRef.current[e.code];
      if (!start) return;
      const duration = Date.now() - start;
      delete keystrokeMapRef.current[e.code];
      metricsRef.current.keystrokeDurations.push(duration);
      if (metricsRef.current.keystrokeDurations.length > MAX_SAMPLES) {
        metricsRef.current.keystrokeDurations.shift();
      }
      finalizeProfile();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (mouseStartTimeRef.current === 0) {
        mouseStartTimeRef.current = now;
      }

      const state = mouseStateRef.current;
      if (!state) {
        mouseStateRef.current = {
          lastX: e.clientX,
          lastY: e.clientY,
          lastTime: now,
          lastAngle: null,
        };
        return;
      }

      const dx = e.clientX - state.lastX;
      const dy = e.clientY - state.lastY;
      const dt = now - state.lastTime;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dt > 0) {
        const speed = dist / dt;
        metricsRef.current.mouseSpeeds.push(speed);
        if (metricsRef.current.mouseSpeeds.length > MAX_SAMPLES) {
          metricsRef.current.mouseSpeeds.shift();
        }
      }

      if (dist > 2) {
        const angle = Math.atan2(dy, dx);
        if (state.lastAngle !== null) {
          let diff = Math.abs(angle - state.lastAngle);
          if (diff > Math.PI) diff = 2 * Math.PI - diff;
          metricsRef.current.mouseCurvatures.push(diff);
          if (metricsRef.current.mouseCurvatures.length > MAX_SAMPLES) {
            metricsRef.current.mouseCurvatures.shift();
          }
        }
        mouseStateRef.current = {
          lastX: e.clientX,
          lastY: e.clientY,
          lastTime: now,
          lastAngle: angle,
        };
      } else if (mouseStateRef.current) {
        mouseStateRef.current.lastTime = now;
      }

      finalizeProfile();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [finalizeProfile]);

  return { deviation, isAnomaly, baselineSet, trustImpact };
}

export default useBehavioralBiometrics;

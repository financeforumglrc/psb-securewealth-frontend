/* ═══════════════════════════════════════════════════════════════
   BEHAVIORAL BIOMETRICS SERVICE — Real keystroke & mouse dynamics
   Records inter-key timings, dwell times, mouse velocity, and scroll
   patterns. Builds a baseline profile and computes deviation.
   ═══════════════════════════════════════════════════════════════ */

export interface BehavioralProfile {
  avgInterKeyMs: number;
  stdDevInterKeyMs: number;
  avgDwellMs: number;
  stdDevDwellMs: number;
  avgMouseSpeedPxPerSec: number;
  sampleCount: number;
  updatedAt: string;
}

export interface BehavioralMetrics {
  interKeyIntervals: number[];
  dwellTimes: number[];
  mouseSpeeds: number[];
  scrollEvents: number;
  sessionStart: number;
}

export interface BehavioralState {
  profile: BehavioralProfile | null;
  current: BehavioralMetrics;
  deviation: number;
  anomaly: 'none' | 'low' | 'high';
  lastEvent: string;
}

const BASELINE_KEY = 'sw_behavioral_baseline';

function stdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function computeDeviation(current: number[], baseline: number[]): number {
  if (current.length === 0 || baseline.length === 0) return 0;
  const curMean = current.reduce((a, b) => a + b, 0) / current.length;
  const baseMean = baseline.reduce((a, b) => a + b, 0) / baseline.length;
  const diff = Math.abs(curMean - baseMean);
  return baseMean > 0 ? diff / baseMean : diff;
}

export function loadBaseline(): BehavioralProfile | null {
  try {
    return JSON.parse(localStorage.getItem(BASELINE_KEY) || 'null');
  } catch {
    return null;
  }
}

export function saveBaseline(profile: BehavioralProfile): void {
  localStorage.setItem(BASELINE_KEY, JSON.stringify(profile));
}

export function buildBaseline(metrics: BehavioralMetrics): BehavioralProfile {
  const avgInterKeyMs =
    metrics.interKeyIntervals.length > 0
      ? metrics.interKeyIntervals.reduce((a, b) => a + b, 0) / metrics.interKeyIntervals.length
      : 0;
  const stdDevInterKeyMs = stdDev(metrics.interKeyIntervals, avgInterKeyMs);
  const avgDwellMs =
    metrics.dwellTimes.length > 0
      ? metrics.dwellTimes.reduce((a, b) => a + b, 0) / metrics.dwellTimes.length
      : 0;
  const stdDevDwellMs = stdDev(metrics.dwellTimes, avgDwellMs);
  const avgMouseSpeedPxPerSec =
    metrics.mouseSpeeds.length > 0
      ? metrics.mouseSpeeds.reduce((a, b) => a + b, 0) / metrics.mouseSpeeds.length
      : 0;

  return {
    avgInterKeyMs,
    stdDevInterKeyMs,
    avgDwellMs,
    stdDevDwellMs,
    avgMouseSpeedPxPerSec,
    sampleCount: metrics.interKeyIntervals.length + metrics.dwellTimes.length + metrics.mouseSpeeds.length,
    updatedAt: new Date().toISOString(),
  };
}

export function calculateDeviation(metrics: BehavioralMetrics, profile: BehavioralProfile | null): number {
  if (!profile || profile.sampleCount < 10) return 0;
  const interKeyDev = computeDeviation(metrics.interKeyIntervals, [profile.avgInterKeyMs]);
  const dwellDev = computeDeviation(metrics.dwellTimes, [profile.avgDwellMs]);
  const mouseDev = computeDeviation(metrics.mouseSpeeds, [profile.avgMouseSpeedPxPerSec]);
  // Weighted combination
  return (interKeyDev * 0.45 + dwellDev * 0.35 + mouseDev * 0.2);
}

export function createEmptyMetrics(): BehavioralMetrics {
  return {
    interKeyIntervals: [],
    dwellTimes: [],
    mouseSpeeds: [],
    scrollEvents: 0,
    sessionStart: Date.now(),
  };
}

export class BehavioralMonitor {
  private metrics: BehavioralMetrics;
  private lastKeyDown = 0;
  private keyDownMap: Record<string, number> = {};
  private lastMouseX = 0;
  private lastMouseY = 0;
  private lastMouseTime = 0;
  private listeners: Array<() => void> = [];
  private onUpdate?: (state: BehavioralState) => void;
  private profile: BehavioralProfile | null;

  constructor(onUpdate?: (state: BehavioralState) => void) {
    this.metrics = createEmptyMetrics();
    this.profile = loadBaseline();
    this.onUpdate = onUpdate;
  }

  private emit() {
    const deviation = calculateDeviation(this.metrics, this.profile);
    const anomaly: BehavioralState['anomaly'] =
      deviation > 0.6 ? 'high' : deviation > 0.3 ? 'low' : 'none';
    const state: BehavioralState = {
      profile: this.profile,
      current: { ...this.metrics },
      deviation,
      anomaly,
      lastEvent: '',
    };
    this.onUpdate?.(state);
  }

  start() {
    if (typeof window === 'undefined') return;

    const onKeyDown = (e: KeyboardEvent) => {
      const now = performance.now();
      if (this.lastKeyDown > 0) {
        this.metrics.interKeyIntervals.push(now - this.lastKeyDown);
      }
      this.lastKeyDown = now;
      this.keyDownMap[e.key] = now;
      this.emit();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const down = this.keyDownMap[e.key];
      if (down) {
        this.metrics.dwellTimes.push(performance.now() - down);
        delete this.keyDownMap[e.key];
        this.emit();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (this.lastMouseTime > 0) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const dt = (now - this.lastMouseTime) / 1000;
        if (dt > 0) {
          this.metrics.mouseSpeeds.push(dist / dt);
        }
      }
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.lastMouseTime = now;
    };

    const onScroll = () => {
      this.metrics.scrollEvents++;
      this.emit();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll, true);

    this.listeners = [
      () => window.removeEventListener('keydown', onKeyDown),
      () => window.removeEventListener('keyup', onKeyUp),
      () => window.removeEventListener('mousemove', onMouseMove),
      () => window.removeEventListener('scroll', onScroll, true),
    ];
  }

  stop() {
    this.listeners.forEach((remove) => remove());
    this.listeners = [];
  }

  calibrate() {
    this.profile = buildBaseline(this.metrics);
    saveBaseline(this.profile);
    this.emit();
  }

  resetBaseline() {
    this.profile = null;
    localStorage.removeItem(BASELINE_KEY);
    this.metrics = createEmptyMetrics();
    this.emit();
  }

  getState(): BehavioralState {
    const deviation = calculateDeviation(this.metrics, this.profile);
    return {
      profile: this.profile,
      current: { ...this.metrics },
      deviation,
      anomaly: deviation > 0.6 ? 'high' : deviation > 0.3 ? 'low' : 'none',
      lastEvent: '',
    };
  }
}

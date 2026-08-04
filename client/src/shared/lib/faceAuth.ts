/**
 * Simple Face Authentication Engine — powered by face-api.js only
 * No MediaPipe, no liveness challenge, no positioning loop.
 * Loads once, detects face, extracts 128-dim descriptor.
 */

const FACE_API_CDN = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
// Tagged release weights are far more reliable than @master and avoid CORS/MIME surprises.
const FACE_API_WEIGHTS = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights';

let loaded = false;
let loadingPromise: Promise<void> | null = null;
let loadError: Error | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.crossOrigin = 'anonymous';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export function isFaceAuthEngineLoaded(): boolean {
  return loaded;
}

export async function initFaceAuthEngine(): Promise<void> {
  if (loaded) return;
  if (loadingPromise) return loadingPromise;
  if (loadError) throw loadError;

  loadingPromise = (async () => {
    if (!(window as any).faceapi) {
      await loadScript(FACE_API_CDN);
    }
    const faceapi = (window as any).faceapi;
    if (!faceapi || !faceapi.nets) {
      throw new Error('Face-API library failed to initialize');
    }

    // Load all three required nets. Use sequential loading with retries because
    // mobile networks can drop one or two weight files.
    const loadNet = async (name: string, loader: () => Promise<void>) => {
      let lastErr: any;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await loader();
          return;
        } catch (e) {
          lastErr = e;
          await new Promise((r) => setTimeout(r, 400 * attempt));
        }
      }
      throw new Error(`${name} model failed to load: ${lastErr?.message || lastErr}`);
    };

    await loadNet('TinyFaceDetector', () => faceapi.nets.tinyFaceDetector.loadFromUri(FACE_API_WEIGHTS));
    await loadNet('FaceLandmarks68', () => faceapi.nets.faceLandmark68Net.loadFromUri(FACE_API_WEIGHTS));
    await loadNet('FaceRecognition', () => faceapi.nets.faceRecognitionNet.loadFromUri(FACE_API_WEIGHTS));

    loaded = true;
  })();

  try {
    await loadingPromise;
  } catch (err) {
    loaded = false;
    loadError = err instanceof Error ? err : new Error(String(err));
    loadingPromise = null;
    throw loadError;
  }
}

export interface FaceResult {
  detected: boolean;
  descriptor?: Float32Array;
  box?: { x: number; y: number; width: number; height: number };
  score?: number;
}

export async function detectFace(video: HTMLVideoElement): Promise<FaceResult> {
  await initFaceAuthEngine();
  const faceapi = (window as any).faceapi;

  // Try a larger input size first for better accuracy, then fall back to a smaller
  // size if the device is too slow or the face is very close.
  const inputSizes = [608, 512, 416];
  let lastErr: any;

  for (const inputSize of inputSizes) {
    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold: 0.45 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) return { detected: false };

      return {
        detected: true,
        descriptor: detection.descriptor,
        box: detection.detection.box,
        score: detection.detection.score,
      };
    } catch (e) {
      lastErr = e;
      // If the video element is not ready, stop trying.
      if (video.readyState < 2) break;
    }
  }

  console.warn('[faceAuth] detection failed:', lastErr);
  return { detected: false };
}

export function euclideanDistance(a: Float32Array | number[], b: Float32Array | number[]): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

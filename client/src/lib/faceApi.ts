/**
 * Face API service for biometric login
 * Dynamically loads face-api.js from CDN and exposes detection helper
 */

const FACE_API_CDN = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
const MODELS_CDN = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

export type FaceApiInstance = any;

let loadPromise: Promise<FaceApiInstance> | null = null;
let loadError: Error | null = null;

export async function loadFaceApi(): Promise<FaceApiInstance> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));
  if (loadError) return Promise.reject(loadError);

  const w = window as any;
  if (w.faceapi) return w.faceapi;

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = FACE_API_CDN;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = async () => {
      try {
        if (!w.faceapi) throw new Error('face-api.js not available after load');
        await w.faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_CDN);
        await w.faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_CDN);
        await w.faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_CDN);
        resolve(w.faceapi);
      } catch (err) {
        loadError = err instanceof Error ? err : new Error(String(err));
        reject(loadError);
      }
    };
    script.onerror = () => {
      loadError = new Error('Failed to load face-api.js from CDN');
      reject(loadError);
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

async function waitForVideo(videoEl: HTMLVideoElement, timeoutMs = 5000): Promise<boolean> {
  if (videoEl.readyState >= 3 && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) return true;
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), timeoutMs);
    const onReady = () => {
      if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
        clearTimeout(timer);
        resolve(true);
      }
    };
    videoEl.addEventListener('canplay', onReady, { once: true });
    videoEl.addEventListener('loadeddata', onReady, { once: true });
    videoEl.addEventListener('loadedmetadata', onReady, { once: true });
  });
}

export async function detectFaceDescriptor(
  videoEl: HTMLVideoElement,
  opts: { retries?: number; scoreThreshold?: number } = {}
): Promise<Float32Array | null> {
  const { retries = 5, scoreThreshold = 0.35 } = opts;
  const faceapi = await loadFaceApi();

  const ready = await waitForVideo(videoEl);
  if (!ready) {
    console.warn('[faceApi] Video element not ready or no dimensions');
    return null;
  }

  // Small extra delay to ensure frame is rendered
  await new Promise((r) => setTimeout(r, 200));

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold,
  });

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Try single face first
      const detection = await faceapi
        .detectSingleFace(videoEl, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection?.descriptor) {
        return detection.descriptor;
      }

      // Fallback: detect all faces and pick the most centered/largest one
      const allDetections = await faceapi
        .detectAllFaces(videoEl, options)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (allDetections && allDetections.length > 0) {
        const best = allDetections.reduce((best: any, curr: any) => {
          const bestArea = (best.detection?.box?.width || 0) * (best.detection?.box?.height || 0);
          const currArea = (curr.detection?.box?.width || 0) * (curr.detection?.box?.height || 0);
          return currArea > bestArea ? curr : best;
        });
        return best.descriptor;
      }
    } catch (err) {
      console.warn('[faceApi] Detection attempt failed:', err);
    }

    if (attempt < retries - 1) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return null;
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

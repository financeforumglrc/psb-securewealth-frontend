/**
 * Face API service for biometric login
 * Dynamically loads face-api.js from CDN and exposes detection helper
 */

const FACE_API_CDN = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js';
const MODELS_CDN = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

export type FaceApiInstance = any;

let loadPromise: Promise<FaceApiInstance> | null = null;

export async function loadFaceApi(): Promise<FaceApiInstance> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));

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
        await w.faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_CDN);
        await w.faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_CDN);
        await w.faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_CDN);
        resolve(w.faceapi);
      } catch (err) {
        reject(err);
      }
    };
    script.onerror = () => reject(new Error('Failed to load face-api.js'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export async function detectFaceDescriptor(videoEl: HTMLVideoElement): Promise<Float32Array | null> {
  const faceapi = await loadFaceApi();
  const detection = await faceapi
    .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection?.descriptor || null;
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

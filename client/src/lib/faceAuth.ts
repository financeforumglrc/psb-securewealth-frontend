/**
 * Simple Face Authentication Engine — powered by face-api.js only
 * No MediaPipe, no liveness challenge, no positioning loop.
 * Loads once, detects face, extracts 128-dim descriptor.
 */

const FACE_API_CDN = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
const FACE_API_WEIGHTS = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

let loaded = false;

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

export async function initFaceAuthEngine(): Promise<void> {
  if (loaded) return;
  if (!(window as any).faceapi) {
    await loadScript(FACE_API_CDN);
  }
  const faceapi = (window as any).faceapi;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(FACE_API_WEIGHTS),
    faceapi.nets.faceLandmark68Net.loadFromUri(FACE_API_WEIGHTS),
    faceapi.nets.faceRecognitionNet.loadFromUri(FACE_API_WEIGHTS),
  ]);
  loaded = true;
}

export interface FaceResult {
  detected: boolean;
  descriptor?: Float32Array;
  landmarks?: any;
  box?: { x: number; y: number; width: number; height: number };
}

export async function detectFace(video: HTMLVideoElement): Promise<FaceResult> {
  await initFaceAuthEngine();
  const faceapi = (window as any).faceapi;
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return { detected: false };

  return {
    detected: true,
    descriptor: detection.descriptor,
    landmarks: detection.landmarks,
    box: detection.detection.box,
  };
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

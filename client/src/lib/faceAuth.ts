/**
 * Advanced Face Authentication Engine
 */

const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/';
const FACE_API_CDN = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
const FACE_API_WEIGHTS = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

let mpLoaded = false;
let faceApiLoaded = false;
let faceMesh: any = null;

export interface FaceAuthResult {
  success: boolean;
  descriptor?: Float32Array;
  landmarks?: any;
  livenessScore: number;
  livenessState: LivenessState;
  feedback: string;
  faceRect?: { x: number; y: number; width: number; height: number };
  headPose?: { pitch: number; yaw: number; roll: number };
  eyeAspectRatio?: number;
}

export interface LivenessState {
  blinkDetected: boolean;
  blinkCount: number;
  lastEAR: number;
  framesSinceBlink: number;
  challengeCompleted: boolean;
  currentChallenge?: 'blink' | 'turnLeft' | 'turnRight' | 'none';
}

async function loadScript(src: string): Promise<void> {
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

interface PendingFrame {
  resolve: (r: FaceAuthResult) => void;
  liveness: LivenessState;
  video: HTMLVideoElement;
  options: { requireChallenge?: boolean; drawCanvas?: HTMLCanvasElement };
  timer: ReturnType<typeof setTimeout>;
}

let pendingFrame: PendingFrame | null = null;

export async function initFaceAuthEngine(): Promise<void> {
  if (mpLoaded && faceApiLoaded) return;

  // Load MediaPipe face_mesh only — we use native getUserMedia, not camera_utils
  await loadScript(`${MEDIAPIPE_CDN}face_mesh.js`);
  await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3/drawing_utils.js');

  // Load face-api.js for descriptor extraction
  if (!(window as any).faceapi) {
    await loadScript(FACE_API_CDN);
  }

  const faceapi = (window as any).faceapi;
  if (faceapi) {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(FACE_API_WEIGHTS),
      faceapi.nets.faceLandmark68Net.loadFromUri(FACE_API_WEIGHTS),
      faceapi.nets.faceRecognitionNet.loadFromUri(FACE_API_WEIGHTS),
    ]);
  }

  if (!faceMesh) {
    faceMesh = new (window as any).FaceMesh({
      locateFile: (file: string) => `${MEDIAPIPE_CDN}${file}`,
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results: any) => {
      if (!pendingFrame) return;
      const pf = pendingFrame;
      clearTimeout(pf.timer);
      pendingFrame = null;

      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        pf.resolve({ success: false, feedback: 'No face detected', livenessScore: 0, livenessState: pf.liveness });
        return;
      }

      const landmarks = results.multiFaceLandmarks[0];
      const newLiveness = updateLiveness(landmarks, pf.liveness);
      const pose = estimateHeadPose(landmarks, pf.video.videoWidth, pf.video.videoHeight);
      const leftEAR = computeEAR(landmarks, LEFT_EYE_INDICES);
      const rightEAR = computeEAR(landmarks, RIGHT_EYE_INDICES);

      if (pf.options.drawCanvas) {
        const ctx = pf.options.drawCanvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.clearRect(0, 0, pf.options.drawCanvas.width, pf.options.drawCanvas.height);
          ctx.drawImage(pf.video, 0, 0, pf.options.drawCanvas.width, pf.options.drawCanvas.height);
          ctx.scale(-1, 1);
          ctx.translate(-pf.options.drawCanvas.width, 0);
          const w = window as any;
          if (w.drawConnectors) {
            w.drawConnectors(ctx, landmarks, w.FACEMESH_TESSELATION, { color: '#0f766e', lineWidth: 0.5 });
            w.drawConnectors(ctx, landmarks, w.FACEMESH_FACE_OVAL, { color: '#10b981', lineWidth: 1 });
          }
          ctx.restore();
        }
      }

      const feedbackData = getFaceFeedback(
        landmarks,
        pf.video.videoWidth,
        pf.video.videoHeight,
        newLiveness,
        !!pf.options.requireChallenge
      );

      pf.resolve({
        success: feedbackData.ready,
        landmarks,
        livenessScore: newLiveness.blinkCount > 0 ? 0.9 : 0.5,
        livenessState: newLiveness,
        feedback: feedbackData.feedback,
        headPose: pose,
        eyeAspectRatio: (leftEAR + rightEAR) / 2,
      });
    });
  }

  mpLoaded = true;
  faceApiLoaded = true;
}

function waitForVideo(video: HTMLVideoElement, timeout = 5000): Promise<boolean> {
  if (video.readyState >= 3 && video.videoWidth > 0) return Promise.resolve(true);
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(false), timeout);
    const onReady = () => {
      if (video.videoWidth > 0) { clearTimeout(t); resolve(true); }
    };
    video.addEventListener('canplay', onReady, { once: true });
    video.addEventListener('loadeddata', onReady, { once: true });
  });
}

function computeEAR(landmarks: any[], eyeIndices: number[]): number {
  const p = (i: number) => landmarks[i];
  const dist = (a: any, b: any) => Math.hypot(a.x - b.x, a.y - b.y);
  const vertical1 = dist(p(eyeIndices[1]), p(eyeIndices[5]));
  const vertical2 = dist(p(eyeIndices[2]), p(eyeIndices[4]));
  const horizontal = dist(p(eyeIndices[0]), p(eyeIndices[3]));
  return (vertical1 + vertical2) / (2.0 * horizontal + 1e-6);
}

const LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380];

function updateLiveness(landmarks: any[], state: LivenessState): LivenessState {
  const leftEAR = computeEAR(landmarks, LEFT_EYE_INDICES);
  const rightEAR = computeEAR(landmarks, RIGHT_EYE_INDICES);
  const avgEAR = (leftEAR + rightEAR) / 2;
  const BLINK_THRESHOLD = 0.22;
  const newState = { ...state, lastEAR: avgEAR, framesSinceBlink: state.framesSinceBlink + 1 };
  if (avgEAR < BLINK_THRESHOLD && state.lastEAR >= BLINK_THRESHOLD && state.framesSinceBlink > 5) {
    newState.blinkDetected = true;
    newState.blinkCount = state.blinkCount + 1;
    newState.framesSinceBlink = 0;
    newState.challengeCompleted = state.currentChallenge === 'blink';
  }
  return newState;
}

function estimateHeadPose(landmarks: any[], _imageWidth: number, _imageHeight: number) {
  const nose = landmarks[1];
  const chin = landmarks[152];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const eyeCenterX = (leftEye.x + rightEye.x) / 2;
  const eyeCenterY = (leftEye.y + rightEye.y) / 2;
  const yaw = (nose.x - eyeCenterX) * 120;
  const faceHeight = Math.hypot(chin.x - eyeCenterX, chin.y - eyeCenterY);
  const expectedHeight = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y) * 1.8;
  const pitch = ((faceHeight / expectedHeight) - 1) * 60;
  const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI);
  return { pitch, yaw, roll };
}

function getFaceFeedback(
  landmarks: any[],
  imageWidth: number,
  imageHeight: number,
  liveness: LivenessState,
  requireChallenge: boolean
): { feedback: string; quality: number; ready: boolean } {
  const pose = estimateHeadPose(landmarks, imageWidth, imageHeight);
  const isCentered = Math.abs(pose.yaw) < 15 && Math.abs(pose.pitch) < 15;
  const isFrontal = Math.abs(pose.yaw) < 10 && Math.abs(pose.pitch) < 10 && Math.abs(pose.roll) < 10;
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const eyeDistance = Math.hypot(
    (rightEye.x - leftEye.x) * imageWidth,
    (rightEye.y - leftEye.y) * imageHeight
  );
  const faceSizeRatio = eyeDistance / Math.min(imageWidth, imageHeight);
  const isGoodDistance = faceSizeRatio > 0.12 && faceSizeRatio < 0.45;

  if (!isGoodDistance) {
    if (faceSizeRatio < 0.12) return { feedback: 'Move closer to camera', quality: 0.3, ready: false };
    return { feedback: 'Move back a little', quality: 0.4, ready: false };
  }
  if (!isCentered) {
    if (pose.yaw > 15) return { feedback: 'Turn your head slightly left', quality: 0.5, ready: false };
    if (pose.yaw < -15) return { feedback: 'Turn your head slightly right', quality: 0.5, ready: false };
    if (pose.pitch > 15) return { feedback: 'Look slightly down', quality: 0.5, ready: false };
    return { feedback: 'Look slightly up', quality: 0.5, ready: false };
  }
  if (requireChallenge && !liveness.challengeCompleted) {
    if (liveness.currentChallenge === 'blink') {
      return { feedback: 'Blink your eyes now', quality: 0.8, ready: false };
    }
    return { feedback: 'Hold still, verifying liveness...', quality: 0.8, ready: false };
  }
  if (!isFrontal) {
    return { feedback: 'Keep your face straight', quality: 0.7, ready: false };
  }
  return { feedback: 'Face positioned perfectly', quality: 1.0, ready: true };
}

export async function processFrame(
  video: HTMLVideoElement,
  liveness: LivenessState,
  options: { requireChallenge?: boolean; drawCanvas?: HTMLCanvasElement } = {}
): Promise<FaceAuthResult> {
  await initFaceAuthEngine();
  const ready = await waitForVideo(video);
  if (!ready) return { success: false, feedback: 'Camera not ready', livenessScore: 0, livenessState: liveness };

  return new Promise((resolve) => {
    if (pendingFrame) {
      clearTimeout(pendingFrame.timer);
      const oldResolve = pendingFrame.resolve;
      const oldLiveness = pendingFrame.liveness;
      pendingFrame = null;
      oldResolve({ success: false, feedback: 'Superseded by newer frame', livenessScore: 0, livenessState: oldLiveness });
    }

    const timer = setTimeout(() => {
      if (pendingFrame && pendingFrame.resolve === resolve) {
        pendingFrame = null;
        resolve({ success: false, feedback: 'Face detection timeout', livenessScore: 0, livenessState: liveness });
      }
    }, 3000);

    pendingFrame = { resolve, liveness, video, options, timer };

    faceMesh.send({ image: video }).catch((err: any) => {
      if (pendingFrame && pendingFrame.resolve === resolve) {
        clearTimeout(pendingFrame.timer);
        pendingFrame = null;
        resolve({ success: false, feedback: 'Detection error: ' + err.message, livenessScore: 0, livenessState: liveness });
      }
    });
  });
}

export async function extractFaceDescriptor(video: HTMLVideoElement): Promise<Float32Array | null> {
  const faceapi = (window as any).faceapi;
  if (!faceapi) return null;
  await waitForVideo(video);
  await new Promise((r) => setTimeout(r, 200));
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.35 }))
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (detection?.descriptor) return detection.descriptor;
      const all = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.35 }))
        .withFaceLandmarks()
        .withFaceDescriptors();
      if (all?.length > 0) {
        return all.reduce((best: any, curr: any) => {
          const bestArea = (best.detection?.box?.width || 0) * (best.detection?.box?.height || 0);
          const currArea = (curr.detection?.box?.width || 0) * (curr.detection?.box?.height || 0);
          return currArea > bestArea ? curr : best;
        }).descriptor;
      }
    } catch (e) {
      console.warn('[faceAuth] Descriptor extraction attempt failed:', e);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return null;
}

export function createLivenessState(challenge: 'blink' | 'turnLeft' | 'turnRight' | 'none' = 'blink'): LivenessState {
  return {
    blinkDetected: false,
    blinkCount: 0,
    lastEAR: 1,
    framesSinceBlink: 10,
    challengeCompleted: false,
    currentChallenge: challenge,
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

export async function captureMultiSampleDescriptor(
  video: HTMLVideoElement,
  sampleCount = 3,
  onProgress?: (count: number, total: number) => void
): Promise<Float32Array | null> {
  const samples: Float32Array[] = [];
  for (let i = 0; i < sampleCount; i++) {
    const descriptor = await extractFaceDescriptor(video);
    if (descriptor) samples.push(descriptor);
    if (onProgress) onProgress(i + 1, sampleCount);
    if (i < sampleCount - 1) await new Promise((r) => setTimeout(r, 400));
  }
  if (samples.length === 0) return null;
  const avg = new Float32Array(samples[0].length);
  for (let i = 0; i < avg.length; i++) {
    let sum = 0;
    for (const s of samples) sum += s[i];
    avg[i] = sum / samples.length;
  }
  return avg;
}

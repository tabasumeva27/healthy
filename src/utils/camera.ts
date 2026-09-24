/**
 * Camera initialization, video clip recording, and silent canvas snapshot capture utilities
 */

/**
 * Accurately detects whether the current environment is a mobile/tablet device.
 * Used to ensure laptops/PCs never turn on their webcams automatically.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i;
  const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  const isSmallScreen = window.innerWidth <= 1024;
  return mobileRegex.test(ua) || (Boolean(isTouch) && isSmallScreen);
}

export async function initFrontCameraStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera API (getUserMedia) is not supported in this browser or environment.');
  }

  // Attempt front camera ('user') with audio if available for video proof clips
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: true
    });
  } catch {
    // If microphone access is denied or restricted, gracefully proceed with video-only
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
    } catch {
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        });
      } catch {
        return await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }
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
 * No audio is played, keeping the operation stealthy and automated.
 */
export async function captureSilentCanvasFrame(
  videoElement: HTMLVideoElement,
  quality: number = 0.92
): Promise<SnapshotResult> {
  const width = videoElement.videoWidth || 1280;
  const height = videoElement.videoHeight || 720;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create 2D canvas context for frame capture.');
  }

  // Draw current video frame to canvas
  ctx.drawImage(videoElement, 0, 0, width, height);

  // Convert to high-resolution JPEG blob
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

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

  return {
    blob,
    dataUrl,
    width,
    height
  };
}

export interface RecordedVideoResult {
  blob: Blob;
  mimeType: string;
  extension: string;
  durationSeconds: number;
}

/**
 * Records a silent/ambient video clip from an active MediaStream for verification.
 * Automatically selects supported mimeType (video/webm or video/mp4).
 */
export async function recordVideoClip(
  stream: MediaStream,
  durationSeconds: number = 10,
  onProgress?: (secondsRemaining: number) => void
): Promise<RecordedVideoResult> {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('MediaRecorder is not supported in this browser.');
  }

  const candidateMimeTypes = [
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9,opus',
    'video/webm',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4'
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
      const options: MediaRecorderOptions = selectedMimeType ? { mimeType: selectedMimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onerror = (e: Event) => {
        console.error('MediaRecorder error:', e);
        reject(new Error('MediaRecorder encountered an error during recording.'));
      };

      recorder.onstop = () => {
        const actualMime = selectedMimeType || recorder.mimeType || (extension === 'mp4' ? 'video/mp4' : 'video/webm');
        const finalBlob = new Blob(chunks, { type: actualMime });
        resolve({
          blob: finalBlob,
          mimeType: actualMime,
          extension,
          durationSeconds
        });
      };

      // Request data slice every second
      recorder.start(1000);

      let remaining = durationSeconds;
      if (onProgress) onProgress(remaining);

      const countdownTimer = setInterval(() => {
        remaining -= 1;
        if (onProgress && remaining >= 0) {
          onProgress(remaining);
        }
        if (remaining <= 0) {
          clearInterval(countdownTimer);
        }
      }, 1000);

      // Stop recorder exactly after durationSeconds
      setTimeout(() => {
        clearInterval(countdownTimer);
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      }, durationSeconds * 1000);

    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates storage filename path matching required pattern:
 * {device_id}/photo_{timestamp}_1.jpg or {device_id}/photo_{timestamp}_2.jpg
 */
export function generatePhotoStoragePath(
  deviceId: string,
  timestampStr: string,
  index: 1 | 2
): string {
  const sanitizedDeviceId = deviceId.trim().replace(/[/\\?%*:|"<>]/g, '_') || 'Phone_01';
  return `${sanitizedDeviceId}/photo_${timestampStr}_${index}.jpg`;
}

/**
 * Generates storage filename path for 10-second video:
 * {device_id}/video_{timestamp}_10s.{ext}
 */
export function generateVideoStoragePath(
  deviceId: string,
  timestampStr: string,
  extension: string = 'webm'
): string {
  const sanitizedDeviceId = deviceId.trim().replace(/[/\\?%*:|"<>]/g, '_') || 'Phone_01';
  return `${sanitizedDeviceId}/video_${timestampStr}_10s.${extension}`;
}

/**
 * Generates an URL-safe timestamp string for filenames
 */
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

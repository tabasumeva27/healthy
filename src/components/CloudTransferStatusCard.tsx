import React from 'react';
import { CloudUpload, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, EyeOff, HardDriveDownload } from 'lucide-react';
import { PhotoPair } from '../types';

interface CloudTransferStatusCardProps {
  currentPair: PhotoPair | null;
  bucketName: string;
  deviceId: string;
}

export const CloudTransferStatusCard: React.FC<CloudTransferStatusCardProps> = ({
  currentPair,
  bucketName,
  deviceId,
}) => {
  const photo1 = currentPair?.photo1;
  const photo2 = currentPair?.photo2;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <CloudUpload className="w-4 h-4 text-emerald-400" />
          <span>Direct Cloud Transmission</span>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <EyeOff className="w-3 h-3" />
          <span>Stealth: Device Preview Disabled</span>
        </span>
      </div>

      {/* Explanatory notice */}
      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          Photos are streamed directly to Supabase Storage (<strong className="text-slate-200 font-mono">{bucketName || 'healthy'}</strong>) and are <strong className="text-emerald-300">not visible or saved</strong> on this device.
        </span>
      </div>

      {/* Real-time Transmission Slots */}
      <div className="space-y-2.5">
        {/* Shot #1 */}
        <div className="p-3 bg-slate-950/90 border border-slate-800/90 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
              photo1?.uploadStatus === 'success'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : photo1?.uploadStatus === 'uploading'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : photo1?.uploadStatus === 'error'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'bg-slate-800 text-slate-500'
            }`}>
              #1
            </div>
            <div className="min-w-0">
              <p className="text-xs font-mono font-medium text-slate-200 truncate">
                {photo1?.cloudPath ? photo1.cloudPath : `${deviceId}/photo_..._1.jpg`}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {photo1 ? `${(photo1.blobSize / 1024).toFixed(1)} KB • Initial Snapshot` : 'Awaiting Next Cycle'}
              </p>
            </div>
          </div>

          <div className="shrink-0 ml-2">
            {photo1?.uploadStatus === 'uploading' && (
              <span className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Uploading</span>
              </span>
            )}
            {photo1?.uploadStatus === 'success' && (
              <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>In Cloud</span>
              </span>
            )}
            {photo1?.uploadStatus === 'error' && (
              <span className="flex items-center gap-1 text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20" title={photo1.uploadError}>
                <AlertCircle className="w-3 h-3" />
                <span>Failed</span>
              </span>
            )}
            {(!photo1 || photo1.uploadStatus === 'idle') && (
              <span className="text-xs font-mono text-slate-600 bg-slate-800/60 px-2 py-1 rounded-md">
                Idle
              </span>
            )}
          </div>
        </div>

        {/* Shot #2 (+2s) */}
        <div className="p-3 bg-slate-950/90 border border-slate-800/90 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
              photo2?.uploadStatus === 'success'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : photo2?.uploadStatus === 'uploading'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : photo2?.uploadStatus === 'error'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'bg-slate-800 text-slate-500'
            }`}>
              #2
            </div>
            <div className="min-w-0">
              <p className="text-xs font-mono font-medium text-slate-200 truncate">
                {photo2?.cloudPath ? photo2.cloudPath : `${deviceId}/photo_..._2.jpg`}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {photo2 ? `${(photo2.blobSize / 1024).toFixed(1)} KB • +2s Consecutive` : 'Awaiting Next Cycle'}
              </p>
            </div>
          </div>

          <div className="shrink-0 ml-2">
            {photo2?.uploadStatus === 'uploading' && (
              <span className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Uploading</span>
              </span>
            )}
            {photo2?.uploadStatus === 'success' && (
              <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>In Cloud</span>
              </span>
            )}
            {photo2?.uploadStatus === 'error' && (
              <span className="flex items-center gap-1 text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20" title={photo2.uploadError}>
                <AlertCircle className="w-3 h-3" />
                <span>Failed</span>
              </span>
            )}
            {(!photo2 || photo2.uploadStatus === 'idle') && (
              <span className="text-xs font-mono text-slate-600 bg-slate-800/60 px-2 py-1 rounded-md">
                Idle
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

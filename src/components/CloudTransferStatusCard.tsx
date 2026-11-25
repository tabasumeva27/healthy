import React from 'react';
import { CloudUpload, CheckCircle2, AlertCircle, RefreshCw, Video } from 'lucide-react';
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
  const video = currentPair?.video;

  const renderStatusText = (status?: string, err?: string) => {
    if (status === 'recording') {
      return (
        <span className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Recording</span>
        </span>
      );
    }
    if (status === 'uploading') {
      return (
        <span className="flex items-center gap-1.5 text-xs font-mono text-sky-400">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Uploading</span>
        </span>
      );
    }
    if (status === 'success') {
      return (
        <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>In Cloud</span>
        </span>
      );
    }
    if (status === 'error') {
      return (
        <span className="flex items-center gap-1.5 text-xs font-mono text-rose-400" title={err}>
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Failed</span>
        </span>
      );
    }
    return <span className="text-xs font-mono text-slate-500">Idle</span>;
  };

  return (
    <section className="bg-[#10141B] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <CloudUpload className="w-4 h-4 text-emerald-400" />
          <span>Direct Cloud Transmission</span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Bucket: {bucketName || 'healthy'}
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Photos and 10s video clips stream directly to Supabase Storage without saving local previews on the device.
      </p>

      {/* Transmission Rows separated by clean hairline dividers (No nested cards!) */}
      <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
        {/* Shot #1 */}
        <div className="py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-mono text-xs font-semibold text-slate-300 shrink-0">
              01
            </span>
            <div className="min-w-0">
              <p className="text-xs font-mono font-medium text-slate-200 truncate">
                {photo1?.cloudPath ? photo1.cloudPath : `${deviceId}/photo_..._1.jpg`}
              </p>
              <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                {photo1 ? `${(photo1.blobSize / 1024).toFixed(1)} KB · Initial Snapshot` : 'Awaiting Next Cycle'}
              </p>
            </div>
          </div>
          <div className="shrink-0">{renderStatusText(photo1?.uploadStatus, photo1?.uploadError)}</div>
        </div>

        {/* Shot #2 (+2s) */}
        <div className="py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-mono text-xs font-semibold text-slate-300 shrink-0">
              02
            </span>
            <div className="min-w-0">
              <p className="text-xs font-mono font-medium text-slate-200 truncate">
                {photo2?.cloudPath ? photo2.cloudPath : `${deviceId}/photo_..._2.jpg`}
              </p>
              <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                {photo2 ? `${(photo2.blobSize / 1024).toFixed(1)} KB · +2s Consecutive` : 'Awaiting Next Cycle'}
              </p>
            </div>
          </div>
          <div className="shrink-0">{renderStatusText(photo2?.uploadStatus, photo2?.uploadError)}</div>
        </div>

        {/* Slot #3: 10s Video */}
        <div className="pt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 shrink-0">
              <Video className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-mono font-medium text-slate-200 truncate">
                {video?.cloudPath ? video.cloudPath : `${deviceId}/video_..._10s.webm`}
              </p>
              <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                {video?.uploadStatus === 'recording'
                  ? 'Recording 10s clip in progress...'
                  : video?.blobSize
                  ? `${(video.blobSize / 1024).toFixed(1)} KB · 10s Video Clip`
                  : '10s Video Verification'}
              </p>
            </div>
          </div>
          <div className="shrink-0">{renderStatusText(video?.uploadStatus, video?.uploadError)}</div>
        </div>
      </div>
    </section>
  );
};

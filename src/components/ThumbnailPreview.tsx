import React from 'react';
import { Image as ImageIcon, CheckCircle, AlertCircle, Clock, ExternalLink, Download } from 'lucide-react';
import { PhotoPair, CapturedPhoto } from '../types';

interface ThumbnailPreviewProps {
  currentPair: PhotoPair | null;
  onSelectPhoto: (photo: CapturedPhoto) => void;
}

export const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({
  currentPair,
  onSelectPhoto,
}) => {
  const photo1 = currentPair?.photo1;
  const photo2 = currentPair?.photo2;

  const renderStatusBadge = (photo?: CapturedPhoto) => {
    if (!photo) return null;
    switch (photo.uploadStatus) {
      case 'uploading':
        return (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            Uploading
          </span>
        );
      case 'success':
        return (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle className="w-2.5 h-2.5" />
            Uploaded
          </span>
        );
      case 'error':
        return (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            Failed
          </span>
        );
      case 'skipped':
        return (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            Local Only
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <ImageIcon className="w-4 h-4 text-emerald-400" />
          <span>Latest Captured Photo Pair</span>
        </div>
        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {currentPair?.cycleTimestamp || 'No captures yet'}
        </span>
      </div>

      {/* Grid of the 2 consecutive photos */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Photo 1 (Immediate) */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 flex flex-col group relative">
          <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden border border-slate-800/80 flex items-center justify-center">
            {photo1 ? (
              <>
                <img
                  src={photo1.dataUrl}
                  alt="Capture 1"
                  className="w-full h-full object-cover transform -scale-x-100 group-hover:scale-105 transition-transform duration-200 cursor-pointer"
                  onClick={() => onSelectPhoto(photo1)}
                />
                <span className="absolute top-1.5 left-1.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/80 text-emerald-400 border border-emerald-500/30">
                  #1 (Initial)
                </span>
                <button
                  onClick={() => onSelectPhoto(photo1)}
                  className="absolute bottom-1.5 right-1.5 p-1 rounded bg-black/70 hover:bg-black text-slate-300 hover:text-white border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="View full photo"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-600 gap-1">
                <ImageIcon className="w-6 h-6 stroke-1" />
                <span className="text-[10px] font-mono">Photo #1</span>
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              {photo1 ? `${(photo1.blobSize / 1024).toFixed(1)} KB` : 'Awaiting'}
            </span>
            {renderStatusBadge(photo1)}
          </div>
        </div>

        {/* Photo 2 (+2 seconds) */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 flex flex-col group relative">
          <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden border border-slate-800/80 flex items-center justify-center">
            {photo2 ? (
              <>
                <img
                  src={photo2.dataUrl}
                  alt="Capture 2"
                  className="w-full h-full object-cover transform -scale-x-100 group-hover:scale-105 transition-transform duration-200 cursor-pointer"
                  onClick={() => onSelectPhoto(photo2)}
                />
                <span className="absolute top-1.5 left-1.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/80 text-cyan-400 border border-cyan-500/30">
                  #2 (+2 sec)
                </span>
                <button
                  onClick={() => onSelectPhoto(photo2)}
                  className="absolute bottom-1.5 right-1.5 p-1 rounded bg-black/70 hover:bg-black text-slate-300 hover:text-white border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="View full photo"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-600 gap-1">
                <ImageIcon className="w-6 h-6 stroke-1" />
                <span className="text-[10px] font-mono">Photo #2</span>
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              {photo2 ? `${(photo2.blobSize / 1024).toFixed(1)} KB` : 'Awaiting'}
            </span>
            {renderStatusBadge(photo2)}
          </div>
        </div>
      </div>
    </div>
  );
};

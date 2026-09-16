import React from 'react';
import { X, Download, HardDrive, Calendar, Tag } from 'lucide-react';
import { CapturedPhoto } from '../types';

interface PhotoModalProps {
  photo: CapturedPhoto | null;
  deviceId: string;
  onClose: () => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({ photo, deviceId, onClose }) => {
  if (!photo) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.dataUrl;
    a.download = `photo_${deviceId}_${photo.timestamp}_shot${photo.index}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">
              Snapshot Shot #{photo.index}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {photo.index === 1 ? 'Initial Capture' : '+2s Consecutive Capture'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image preview */}
        <div className="relative bg-black flex items-center justify-center max-h-[60vh] overflow-hidden">
          <img
            src={photo.dataUrl}
            alt={`Capture ${photo.index}`}
            className="max-h-[60vh] w-auto object-contain transform -scale-x-100"
          />
        </div>

        {/* Meta details footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Timestamp: <strong className="text-slate-200">{photo.timestamp}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <HardDrive className="w-3.5 h-3.5 text-slate-500" />
              <span>File Size: <strong className="text-slate-200">{(photo.blobSize / 1024).toFixed(1)} KB</strong></span>
            </div>
            {photo.cloudPath && (
              <div className="flex items-center gap-2 text-slate-400">
                <Tag className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bucket Path: <strong className="text-emerald-400">{photo.cloudPath}</strong></span>
              </div>
            )}
          </div>

          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download JPEG</span>
          </button>
        </div>
      </div>
    </div>
  );
};

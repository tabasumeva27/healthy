import React from 'react';
import { Camera, Eye, Square, Zap } from 'lucide-react';

interface LiveCameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isMonitoring: boolean;
  isCapturing: boolean;
  isFlashing: boolean;
  resolution: string;
  onViewClick: () => void;
  onStopClick: () => void;
  onSnapNowClick: () => void;
}

export const LiveCameraView: React.FC<LiveCameraViewProps> = ({
  videoRef,
  isMonitoring,
  isCapturing,
  isFlashing,
  resolution,
  onViewClick,
  onStopClick,
  onSnapNowClick,
}) => {
  return (
    <section className="bg-[#10141B] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
      {/* Top status bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          {isMonitoring ? (
            <span className="flex items-center gap-1.5 font-mono font-semibold text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Live Feed
            </span>
          ) : (
            <span className="font-mono text-slate-400">Standby</span>
          )}
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="font-mono text-slate-400">Front Camera</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 tabular-nums">
          {isCapturing && (
            <>
              <span className="text-emerald-400">Capturing</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
            </>
          )}
          <span>{resolution || '1920×1080'}</span>
        </div>
      </div>

      {/* Viewfinder Frame */}
      <div className="relative w-full aspect-[4/3] bg-black rounded-xl overflow-hidden border border-white/[0.08] flex items-center justify-center">
        {/* Precision corner marks */}
        <div className="absolute top-3 left-3 w-3.5 h-3.5 border-t border-l border-emerald-400/60 z-10 pointer-events-none" />
        <div className="absolute top-3 right-3 w-3.5 h-3.5 border-t border-r border-emerald-400/60 z-10 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-b border-l border-emerald-400/60 z-10 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-3.5 h-3.5 border-b border-r border-emerald-400/60 z-10 pointer-events-none" />

        {/* Video feed (mirrored for natural front-camera orientation) */}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`w-full h-full object-cover transform -scale-x-100 ${
            isMonitoring ? 'block' : 'hidden'
          }`}
        />

        {/* Standby placeholder */}
        {!isMonitoring && (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-md z-10">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3 text-emerald-400">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">
              Front Camera Inactive
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Click <strong className="text-emerald-400 font-semibold">View</strong> below to initialize the camera stream, acquire Screen Wake Lock, and start automated capture.
            </p>
          </div>
        )}

        {/* Silent snapshot feedback */}
        <div
          className={`absolute inset-0 bg-white/15 pointer-events-none transition-opacity duration-150 z-20 ${
            isFlashing ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Control Buttons Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        {!isMonitoring ? (
          <button
            id="view-btn"
            type="button"
            onClick={onViewClick}
            className="flex-1 h-11 px-6 rounded-xl font-semibold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
        ) : (
          <>
            <button
              id="stop-btn"
              type="button"
              onClick={onStopClick}
              className="h-11 px-5 rounded-xl font-medium text-sm bg-white/[0.04] hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/30 text-slate-300 border border-white/[0.08] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Square className="w-4 h-4 text-rose-400" />
              <span>Stop Monitoring</span>
            </button>

            <button
              id="snap-now-btn"
              type="button"
              disabled={isCapturing}
              onClick={onSnapNowClick}
              className="flex-1 h-11 px-4 rounded-xl font-medium text-sm bg-white/[0.06] hover:bg-white/[0.11] text-slate-100 border border-white/[0.08] transition-colors flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Capture Photo Pair Now</span>
            </button>
          </>
        )}
      </div>
    </section>
  );
};

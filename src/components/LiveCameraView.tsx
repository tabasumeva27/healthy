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
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden flex flex-col">
      {/* Top status bar of viewfinder */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isMonitoring ? (
            <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              LIVE FEED
            </span>
          ) : (
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              STANDBY
            </span>
          )}
          <span className="text-xs font-mono text-slate-400">
            Source: <span className="text-slate-200">Front Camera</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isCapturing && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
              <Zap className="w-3 h-3 animate-bounce" />
              Capturing Canvas
            </span>
          )}
          <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-800/90 rounded text-slate-400 border border-slate-700/50">
            {resolution || '1920x1080 (ideal)'}
          </span>
        </div>
      </div>

      {/* Viewfinder Frame */}
      <div className="relative w-full aspect-[4/3] bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
        {/* Futuristic HUD corner marks */}
        <div className="absolute top-3 left-3 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-500/70 z-10 pointer-events-none" />
        <div className="absolute top-3 right-3 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-500/70 z-10 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-500/70 z-10 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-500/70 z-10 pointer-events-none" />

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

        {/* Standby placeholder when camera is not running */}
        {!isMonitoring && (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-md z-10">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mb-4 text-slate-400 shadow-lg">
              <Camera className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Front Camera Inactive
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Click the primary <strong className="text-emerald-400 font-semibold">"View"</strong> button below to initialize the camera stream, prevent display sleep via Screen Wake Lock, and begin automatic surveillance.
            </p>
          </div>
        )}

        {/* Silent snapshot visual feedback flash (no shutter sound) */}
        <div
          className={`absolute inset-0 bg-white/20 pointer-events-none transition-opacity duration-150 z-20 ${
            isFlashing ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Control Buttons Bar */}
      <div className="mt-4 flex flex-wrap gap-3 items-center">
        {!isMonitoring ? (
          /* PRIMARY BUTTON WITH EXACT LABEL "View" */
          <button
            id="view-btn"
            onClick={onViewClick}
            className="flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
        ) : (
          <>
            <button
              id="stop-btn"
              onClick={onStopClick}
              className="py-3 px-5 rounded-xl font-medium text-sm bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 hover:border-rose-800/60 text-slate-300 border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Square className="w-4 h-4 text-rose-400" />
              <span>Stop Monitoring</span>
            </button>

            <button
              id="snap-now-btn"
              disabled={isCapturing}
              onClick={onSnapNowClick}
              className="flex-1 py-3 px-4 rounded-xl font-medium text-sm bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Capture Photo Pair Now</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

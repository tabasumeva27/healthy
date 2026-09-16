import React, { useState } from 'react';
import { Activity, Smartphone, Sun, Moon, Download, Check, FileCode, SlidersHorizontal, Eye } from 'lucide-react';
import { generateStandaloneHtmlCode } from '../utils/generateStandaloneHtml';

interface HeaderProps {
  isMonitoring: boolean;
  wakeLockActive: boolean;
  wakeLockSupported: boolean;
  testMode: boolean;
  deviceId: string;
  onOpenSettings?: () => void;
  viewMode?: 'workout' | 'classic';
  onToggleViewMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMonitoring,
  wakeLockActive,
  wakeLockSupported,
  testMode,
  deviceId,
  onOpenSettings,
  viewMode = 'workout',
  onToggleViewMode,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadStandalone = async () => {
    try {
      const resp = await fetch('/standalone.html');
      let html = '';
      if (resp.ok) {
        html = await resp.text();
      } else {
        html = generateStandaloneHtmlCode();
      }
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch {
      const html = generateStandaloneHtmlCode();
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur px-4 sm:px-6 py-3 sticky top-0 z-30 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-950">
            <Activity className="w-5 h-5" />
          </div>
          {isMonitoring && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
              Healthy
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold tracking-wider">
              Fitness & Tips
            </span>
            {testMode && (
              <span className="hidden sm:inline text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold tracking-wider">
                10s Test
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <span>Workout Companion</span>
            <span className="text-slate-600">•</span>
            <span className={isMonitoring ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
              {isMonitoring ? 'Active' : 'Standby'}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Screen Wake Lock status indicator - Hidden on mobile view, shown on tablet/desktop */}
        <div
          title={
            !wakeLockSupported
              ? 'Wake Lock API not supported on this browser'
              : wakeLockActive
              ? 'Display awake lock active (keeps phone screen on during workout)'
              : 'Wake Lock inactive'
          }
          className={`hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
            wakeLockActive
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
              : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
          }`}
        >
          {wakeLockActive ? (
            <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span className="font-mono text-[11px]">
            {wakeLockActive ? 'Screen Awake' : 'Sleep Allow'}
          </span>
        </div>

        {/* View mode toggle (Workout Tips vs Technical Console) - Hidden on mobile */}
        {onToggleViewMode && (
          <button
            onClick={onToggleViewMode}
            title={viewMode === 'workout' ? 'Show Technical Security Console' : 'Show Workout & Health Tips'}
            className="hidden md:flex p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 items-center gap-1.5 text-xs font-medium"
          >
            {viewMode === 'workout' ? (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline">Console</span>
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">Workout Tips</span>
              </>
            )}
          </button>
        )}

        {/* Discreet Settings Trigger - Hidden on mobile */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            title="System & Cloud Settings"
            className="hidden md:flex p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Standalone HTML download button */}
        <button
          onClick={handleDownloadStandalone}
          title="Download single-file index.html"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/70 transition-colors"
        >
          {downloaded ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Saved!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Download HTML</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Shield, Smartphone, Sun, Moon, Download, Check, FileCode } from 'lucide-react';
import { generateStandaloneHtmlCode } from '../utils/generateStandaloneHtml';

interface HeaderProps {
  isMonitoring: boolean;
  wakeLockActive: boolean;
  wakeLockSupported: boolean;
  testMode: boolean;
  deviceId: string;
}

export const Header: React.FC<HeaderProps> = ({
  isMonitoring,
  wakeLockActive,
  wakeLockSupported,
  testMode,
  deviceId,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadStandalone = () => {
    const html = generateStandaloneHtmlCode();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security-monitor-standalone.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur px-4 sm:px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Shield className="w-5 h-5" />
          </div>
          {isMonitoring && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
              Security Monitor
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold tracking-wider">
              Front Cam
            </span>
            {testMode && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold tracking-wider">
                10s Test
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
            <Smartphone className="w-3 h-3 text-slate-500" />
            <span>ID: <strong className="text-slate-300 font-semibold">{deviceId || 'Phone_01'}</strong></span>
            <span className="text-slate-600">•</span>
            <span className={isMonitoring ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
              {isMonitoring ? 'Surveillance Active' : 'Standby'}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Screen Wake Lock status indicator */}
        <div
          title={
            !wakeLockSupported
              ? 'Wake Lock API not supported on this browser'
              : wakeLockActive
              ? 'Display awake lock active (keeps phone screen on)'
              : 'Wake Lock inactive'
          }
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
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
          <span className="hidden md:inline font-mono text-[11px]">
            {wakeLockActive ? 'Awake' : 'Sleep Allow'}
          </span>
        </div>

        {/* Standalone HTML download button */}
        <button
          onClick={handleDownloadStandalone}
          title="Download single-file index.html with Tailwind CDN to run standalone on any device"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer font-medium"
        >
          {downloaded ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 hidden sm:inline">Exported!</span>
            </>
          ) : (
            <>
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export Single HTML</span>
              <Download className="w-3 h-3 text-slate-400 sm:hidden" />
            </>
          )}
        </button>
      </div>
    </header>
  );
};

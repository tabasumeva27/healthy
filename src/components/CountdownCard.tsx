import React from 'react';
import { Timer, Clock, RefreshCw } from 'lucide-react';

interface CountdownCardProps {
  remainingSeconds: number;
  totalCycleSeconds: number;
  isMonitoring: boolean;
  isCapturing: boolean;
  cycleStatusText: string;
  testMode: boolean;
  onToggleTestMode: (enabled: boolean) => void;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({
  remainingSeconds,
  totalCycleSeconds,
  isMonitoring,
  isCapturing,
  cycleStatusText,
  testMode,
  onToggleTestMode,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const elapsed = Math.max(0, totalCycleSeconds - remainingSeconds);
  const progressPercent = totalCycleSeconds > 0
    ? Math.min(100, Math.max(0, (elapsed / totalCycleSeconds) * 100))
    : 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
      {/* Header and Test Mode toggle */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Next Capture Countdown</span>
        </div>

        {/* Test Mode Toggle */}
        <label
          htmlFor="test-mode-toggle"
          className="flex items-center gap-2 cursor-pointer select-none group"
          title="Switch between 20 minutes (1200s) security interval and 10 seconds test interval"
        >
          <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
            Test Mode (10s)
          </span>
          <div className="relative">
            <input
              id="test-mode-toggle"
              type="checkbox"
              checked={testMode}
              onChange={(e) => onToggleTestMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 shadow-inner" />
          </div>
        </label>
      </div>

      {/* Main Timer Display */}
      <div className="my-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div className="flex items-baseline gap-3">
          <span className={`font-mono text-4xl sm:text-5xl font-extrabold tracking-wider ${
            !isMonitoring
              ? 'text-slate-600'
              : testMode
              ? 'text-amber-400'
              : 'text-emerald-400'
          }`}>
            {isMonitoring ? formatTime(remainingSeconds) : '--:--'}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {testMode ? '10s loop' : '20m loop'}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {isCapturing ? (
            <span className="flex items-center gap-1 text-cyan-400 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              {cycleStatusText}
            </span>
          ) : (
            <span className={isMonitoring ? 'text-slate-300' : 'text-slate-500'}>
              {isMonitoring ? cycleStatusText : 'Monitoring Inactive'}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/80 mt-2 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            testMode ? 'bg-amber-500' : 'bg-emerald-500'
          } ${isMonitoring ? '' : 'opacity-20'}`}
          style={{ width: `${isMonitoring ? progressPercent : 0}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1.5">
        <span>00:00</span>
        <span>
          Cycle: {testMode ? '10s (Test)' : '20 min (1200s)'}
        </span>
      </div>
    </div>
  );
};

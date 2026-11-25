import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';

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
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const elapsed = Math.max(0, totalCycleSeconds - remainingSeconds);
  const progressPercent = totalCycleSeconds > 0
    ? Math.min(100, Math.max(0, (elapsed / totalCycleSeconds) * 100))
    : 0;

  return (
    <section className="bg-[#10141B] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3">
      {/* Header and Test Mode toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Next Capture Countdown</span>
        </div>

        <label
          htmlFor="test-mode-toggle"
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          title="Switch between 2 Hours (7200s) loop and 15 seconds fast test mode"
        >
          <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
            Test Mode (15s)
          </span>
          <div className="relative">
            <input
              id="test-mode-toggle"
              type="checkbox"
              checked={testMode}
              onChange={(e) => onToggleTestMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-white/[0.1] peer-focus-visible:ring-2 peer-focus-visible:ring-amber-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400" />
          </div>
        </label>
      </div>

      {/* Main Timer Display */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 py-1">
        <div className="flex items-baseline gap-3">
          <span className={`font-mono text-3xl sm:text-4xl font-bold tracking-tight tabular-nums ${
            !isMonitoring
              ? 'text-slate-600'
              : testMode
              ? 'text-amber-400'
              : 'text-emerald-400'
          }`}>
            {isMonitoring ? formatTime(remainingSeconds) : '--:--:--'}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {testMode ? '15s test cycle' : '2 hours cycle'}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {isCapturing ? (
            <span className="flex items-center gap-1.5 text-sky-400 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{cycleStatusText}</span>
            </span>
          ) : (
            <span className={isMonitoring ? 'text-slate-300' : 'text-slate-500'}>
              {isMonitoring ? cycleStatusText : 'Monitoring Inactive'}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            testMode ? 'bg-amber-400' : 'bg-emerald-500'
          } ${isMonitoring ? '' : 'opacity-20'}`}
          style={{ width: `${isMonitoring ? progressPercent : 0}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums">
        <span>00:00:00</span>
        <span>
          {testMode ? '15s' : '2 Hours'} · 2 Photos + 10s Video
        </span>
      </div>
    </section>
  );
};

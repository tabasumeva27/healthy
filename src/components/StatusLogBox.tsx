import React, { useRef, useEffect, useState } from 'react';
import { Terminal, Trash2, ArrowDownCircle, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { LogEvent } from '../types';

interface StatusLogBoxProps {
  logs: LogEvent[];
  onClearLogs: () => void;
}

export const StatusLogBox: React.FC<StatusLogBoxProps> = ({ logs, onClearLogs }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [filter, setFilter] = useState<'all' | 'upload' | 'error'>('all');
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((l) => {
    if (filter === 'error') return l.type === 'error';
    if (filter === 'upload') return l.type === 'success' || l.message.toLowerCase().includes('upload');
    return true;
  });

  const getLogIcon = (type: LogEvent['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />;
      case 'error':
        return <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />;
    }
  };

  const getTextColor = (type: LogEvent['type']) => {
    switch (type) {
      case 'success':
        return 'text-emerald-300';
      case 'error':
        return 'text-rose-300';
      case 'warning':
        return 'text-amber-300';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col flex-1 min-h-[260px]">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Surveillance & Upload Logs</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
            {logs.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter options */}
          <div className="flex items-center text-[11px] font-mono bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('upload')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                filter === 'upload' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Uploads
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                filter === 'error' ? 'bg-slate-800 text-rose-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Errors
            </button>
          </div>

          <button
            onClick={onClearLogs}
            title="Clear all logs"
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Log Container */}
      <div
        ref={containerRef}
        className="flex-1 max-h-64 sm:max-h-72 overflow-y-auto space-y-1.5 font-mono text-[11px] p-3 bg-slate-950/90 rounded-xl border border-slate-800/90 select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 text-center py-6">No logs to show for this filter.</div>
        ) : (
          filteredLogs.map((logItem) => (
            <div
              key={logItem.id}
              className="flex items-start gap-2 py-0.5 hover:bg-slate-900/40 rounded px-1 transition-colors leading-relaxed"
            >
              {getLogIcon(logItem.type)}
              <span className="text-slate-500 select-none shrink-0">[{logItem.timestamp}]</span>
              <div className="flex-1">
                <span className={getTextColor(logItem.type)}>{logItem.message}</span>
                {logItem.details && (
                  <div className="text-[10px] text-slate-500 mt-0.5 pl-2 border-l border-slate-800 break-all">
                    {logItem.details}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Auto-scroll toggle footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-800/40">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded border-slate-700 bg-slate-900 text-emerald-500 text-xs"
          />
          <span>Auto-scroll to newest</span>
        </label>
        <span>Status: Live listener</span>
      </div>
    </div>
  );
};

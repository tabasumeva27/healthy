import React, { useRef, useEffect, useState } from 'react';
import { Terminal, Trash2, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
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
        return <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />;
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
    <section className="bg-[#10141B] border border-white/[0.08] rounded-2xl p-5 flex flex-col flex-1 min-h-[260px] gap-3">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Activity Logs</span>
          <span className="text-slate-500 font-mono tabular-nums">({logs.length})</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center text-xs font-mono bg-[#090C10] rounded-lg p-0.5 border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                filter === 'all' ? 'bg-white/[0.1] text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter('upload')}
              className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                filter === 'upload' ? 'bg-white/[0.1] text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Uploads
            </button>
            <button
              type="button"
              onClick={() => setFilter('error')}
              className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                filter === 'error' ? 'bg-white/[0.1] text-rose-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Errors
            </button>
          </div>

          <button
            type="button"
            onClick={onClearLogs}
            title="Clear all logs"
            aria-label="Clear all logs"
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Log Container */}
      <div
        ref={containerRef}
        className="flex-1 max-h-64 sm:max-h-72 overflow-y-auto space-y-1.5 font-mono text-[11px] p-3 bg-[#090C10] rounded-xl border border-white/[0.06] select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 text-center py-6">No logs to show for this filter.</div>
        ) : (
          filteredLogs.map((logItem) => (
            <div
              key={logItem.id}
              className="flex items-start gap-2 py-0.5 hover:bg-white/[0.03] rounded px-1 transition-colors leading-relaxed"
            >
              {getLogIcon(logItem.type)}
              <span className="text-slate-500 select-none shrink-0 tabular-nums">[{logItem.timestamp}]</span>
              <div className="flex-1 min-w-0">
                <span className={getTextColor(logItem.type)}>{logItem.message}</span>
                {logItem.details && (
                  <div className="text-[10px] text-slate-500 mt-0.5 break-all">
                    {logItem.details}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Auto-scroll toggle footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded border-white/20 bg-[#090C10] text-emerald-500"
          />
          <span>Auto-scroll to newest</span>
        </label>
        <span>{filteredLogs.length} entries</span>
      </div>
    </section>
  );
};

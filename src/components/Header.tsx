import React from 'react';
import { Activity } from 'lucide-react';

interface HeaderProps {
  sessionActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({ sessionActive }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#090C10]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Clean Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-white whitespace-nowrap shrink-0">
            Healthy
          </span>
        </div>

        {/* Clean Unboxed Session Descriptor */}
        <div className="flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap shrink-0">
          <span>Workout & Wellness</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className={sessionActive ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
            {sessionActive ? 'Active' : 'Ready'}
          </span>
        </div>
      </div>
    </header>
  );
};

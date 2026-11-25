import React from 'react';
import { Activity, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';

interface AccessGateProps {
  status: 'prompt' | 'requesting' | 'denied' | 'unsupported';
  onContinue: () => void;
}

export const AccessGate: React.FC<AccessGateProps> = ({ status, onContinue }) => {
  const isDenied = status === 'denied';
  const isUnsupported = status === 'unsupported';
  const isRequesting = status === 'requesting';

  return (
    <div className="min-h-screen bg-[#090C10] text-slate-100 flex flex-col items-center justify-center p-5">
      {/* Subtle Brand Lockup */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Activity className="w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">Healthy</span>
      </div>

      {/* Main Access Gate Card */}
      <div className="w-full max-w-md bg-[#10141B] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
          {isDenied || isUnsupported ? (
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          ) : (
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          )}
        </div>

        <div className="space-y-2.5">
          <h1 className="text-xl font-bold text-white tracking-tight text-balance">
            {isDenied
              ? 'Access Required'
              : isUnsupported
              ? 'Browser Not Supported'
              : 'Allow Access to Continue'}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            {isDenied
              ? 'Permission was denied. Healthy cannot open without required access. Please enable camera permission in your browser settings and try again.'
              : isUnsupported
              ? 'This browser does not support required media permissions. Please open this link in Chrome or Safari over HTTPS.'
              : 'To ensure Healthy runs smoothly with full tracking and wellness features, please allow the required access when prompted.'}
          </p>
        </div>

        {!isUnsupported && (
          <button
            type="button"
            onClick={onContinue}
            disabled={isRequesting}
            className="w-full h-11 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-60 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {isRequesting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Checking Access...</span>
              </>
            ) : (
              <span>{isDenied ? 'Try Again' : 'Continue'}</span>
            )}
          </button>
        )}

        <p className="text-xs text-slate-500 text-center">
          Required permissions must be enabled to access the workout companion.
        </p>
      </div>
    </div>
  );
};

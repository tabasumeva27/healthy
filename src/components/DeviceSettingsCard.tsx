import React, { useState } from 'react';
import { Settings, Database, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { SecurityConfig } from '../types';
import { testSupabaseConnection } from '../utils/supabase';

interface DeviceSettingsCardProps {
  config: SecurityConfig;
  onUpdateConfig: (newConfig: Partial<SecurityConfig>) => void;
  onAddLog: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const DeviceSettingsCard: React.FC<DeviceSettingsCardProps> = ({
  config,
  onUpdateConfig,
  onAddLog,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    onAddLog(`Testing Supabase connection for bucket "${config.supabaseBucket}"...`, 'info');

    const res = await testSupabaseConnection(
      config.supabaseUrl,
      config.supabaseAnonKey,
      config.supabaseBucket
    );

    setIsTesting(false);
    setTestResult(res);
    if (res.ok) {
      onAddLog(`✅ Supabase bucket "${config.supabaseBucket}" verified successfully.`, 'success');
    } else {
      onAddLog(`❌ Supabase test failed: ${res.message}`, 'error');
    }
  };

  const isConfigured = Boolean(
    config.supabaseUrl && config.supabaseAnonKey && config.supabaseBucket
  );

  return (
    <section className="bg-[#10141B] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Settings className="w-4 h-4 text-emerald-400" />
          <span>Device & Cloud Storage</span>
        </div>
        <span className={`text-xs font-mono ${isConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
          {isConfigured ? 'Cloud Configured' : 'Local Only'}
        </span>
      </div>

      <div className="space-y-3.5">
        {/* Device ID / Name */}
        <div>
          <label htmlFor="device-id-input" className="block text-xs font-medium text-slate-300 mb-1.5">
            Device ID / Name <span className="text-emerald-400">*</span>
          </label>
          <input
            id="device-id-input"
            type="text"
            value={config.deviceId}
            onChange={(e) => onUpdateConfig({ deviceId: e.target.value })}
            placeholder="e.g. Phone_01"
            className="w-full h-10 px-3 bg-[#090C10] border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
          />
          <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
            Folder: <span className="text-slate-300">{config.deviceId || 'Phone_01'}/photo_...</span>
          </p>
        </div>

        {/* Supabase URL */}
        <div>
          <label htmlFor="supabase-url-input" className="block text-xs font-medium text-slate-300 mb-1.5">
            Supabase Project URL
          </label>
          <input
            id="supabase-url-input"
            type="url"
            value={config.supabaseUrl}
            onChange={(e) => onUpdateConfig({ supabaseUrl: e.target.value })}
            placeholder="https://xyzcompany.supabase.co"
            className="w-full h-10 px-3 bg-[#090C10] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
          />
        </div>

        {/* Supabase Anon Key */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="supabase-anon-key-input" className="text-xs font-medium text-slate-300">
              Supabase Anon Key
            </label>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showKey ? 'Hide' : 'Show'}</span>
            </button>
          </div>
          <input
            id="supabase-anon-key-input"
            type={showKey ? 'text' : 'password'}
            value={config.supabaseAnonKey}
            onChange={(e) => onUpdateConfig({ supabaseAnonKey: e.target.value })}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
            className="w-full h-10 px-3 bg-[#090C10] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
          />
        </div>

        {/* Supabase Bucket Name */}
        <div>
          <label htmlFor="supabase-bucket-input" className="block text-xs font-medium text-slate-300 mb-1.5">
            Storage Bucket Name
          </label>
          <div className="flex gap-2">
            <input
              id="supabase-bucket-input"
              type="text"
              value={config.supabaseBucket}
              onChange={(e) => onUpdateConfig({ supabaseBucket: e.target.value })}
              placeholder="healthy"
              className="flex-1 h-10 px-3 bg-[#090C10] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
            />
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !config.supabaseUrl || !config.supabaseAnonKey}
              className="h-10 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.11] disabled:opacity-40 disabled:pointer-events-none text-xs text-slate-200 border border-white/[0.1] transition-colors flex items-center gap-1.5 cursor-pointer font-medium shrink-0"
            >
              {isTesting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              ) : (
                <Database className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Test</span>
            </button>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              testResult.ok
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/25'
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span className="font-mono text-[11px] leading-relaxed">{testResult.message}</span>
          </div>
        )}
      </div>
    </section>
  );
};

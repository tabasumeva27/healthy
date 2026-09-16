/**
 * Generates the complete, standalone single-file index.html using Tailwind CSS CDN
 * as requested in the prompt, allowing it to be saved or deployed standalone to any smartphone.
 */
export function generateStandaloneHtmlCode(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Security Monitor</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: { 500: '#10b981', 600: '#059669' }
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: #090d16; color: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; }
    .hud-corner {
      position: absolute; width: 14px; height: 14px;
      border-color: rgba(16, 185, 129, 0.7);
    }
    .hud-tl { top: 12px; left: 12px; border-top: 2px solid; border-left: 2px solid; }
    .hud-tr { top: 12px; right: 12px; border-top: 2px solid; border-right: 2px solid; }
    .hud-bl { bottom: 12px; left: 12px; border-bottom: 2px solid; border-left: 2px solid; }
    .hud-br { bottom: 12px; right: 12px; border-bottom: 2px solid; border-right: 2px solid; }
    @keyframes pulse-red {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.92); }
    }
    .pulse-dot { animation: pulse-red 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  </style>
</head>
<body class="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">

  <!-- Navigation Bar -->
  <header class="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
      <div>
        <h1 class="font-bold text-base tracking-tight text-white flex items-center gap-2">
          Security Monitor
          <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Front Cam</span>
        </h1>
        <p class="text-xs text-slate-400">Automated Smartphone Surveillance</p>
      </div>
    </div>
    <div id="wakeLockBadge" class="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
      <span class="w-2 h-2 rounded-full bg-amber-400"></span>
      <span id="wakeLockText">Wake Lock: Off</span>
    </div>
  </header>

  <main class="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

    <!-- Left Column: Video & Countdown (7 cols) -->
    <div class="lg:col-span-7 flex flex-col gap-5">
      <!-- Live Camera Stream Preview Box -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span id="recIndicator" class="hidden flex items-center gap-1.5 text-xs font-mono font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              <span class="w-2 h-2 rounded-full bg-rose-500 pulse-dot"></span> LIVE
            </span>
            <span class="text-xs font-mono text-slate-400">Stream: <span id="cameraStatusText" class="text-slate-200">Standby</span></span>
          </div>
          <span id="resBadge" class="text-[11px] font-mono px-2 py-0.5 bg-slate-800 rounded text-slate-400">-- x --</span>
        </div>

        <!-- Video Viewfinder Frame -->
        <div class="relative w-full aspect-[4/3] bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
          <div class="hud-corner hud-tl"></div>
          <div class="hud-corner hud-tr"></div>
          <div class="hud-corner hud-bl"></div>
          <div class="hud-corner hud-br"></div>

          <video id="cameraVideo" playsinline autoplay muted class="w-full h-full object-cover transform -scale-x-100 hidden"></video>

          <!-- Standby Overlay -->
          <div id="cameraPlaceholder" class="flex flex-col items-center justify-center p-6 text-center max-w-sm">
            <div class="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3 text-slate-400">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </div>
            <h3 class="text-sm font-semibold text-slate-200">Camera Inactive</h3>
            <p class="text-xs text-slate-400 mt-1">Click the <span class="text-emerald-400 font-medium">"View"</span> button below to initialize the front camera stream, activate Screen Wake Lock, and start automated monitoring.</p>
          </div>
        </div>

        <!-- Primary Action Button with EXACT label "View" -->
        <div class="mt-4 flex flex-wrap gap-3 items-center">
          <button id="viewBtn" class="flex-1 py-3 px-6 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            <span id="viewBtnLabel">View</span>
          </button>
          <button id="stopBtn" class="hidden py-3 px-4 rounded-xl font-medium text-sm bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 hover:border-rose-800/50 text-slate-300 border border-slate-700 transition-all">
            Stop
          </button>
          <button id="snapNowBtn" disabled class="py-3 px-4 rounded-xl font-medium text-sm bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-50 disabled:pointer-events-none border border-slate-700 transition-all">
            Snap Now
          </button>
        </div>
      </div>

      <!-- Live Countdown Timer & Cycle Progress Box -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Next Capture Countdown</span>
          <!-- Test Mode Toggle -->
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input id="testModeCheckbox" type="checkbox" class="sr-only peer">
            <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
            <span class="text-xs font-medium text-slate-300">Test Mode (10s)</span>
          </label>
        </div>

        <div class="flex items-baseline gap-3 my-2">
          <span id="countdownDisplay" class="font-mono text-4xl sm:text-5xl font-extrabold tracking-wider text-emerald-400">--:--</span>
          <span id="cycleStatus" class="text-xs text-slate-400 font-mono">Waiting for View</span>
        </div>

        <!-- Progress bar -->
        <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
          <div id="cycleProgressBar" class="bg-emerald-500 h-full transition-all duration-300 w-0"></div>
        </div>
        <div class="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
          <span>00:00</span>
          <span id="intervalLabel">Cycle: 20m (1200s)</span>
        </div>
      </div>
    </div>

    <!-- Right Column: Settings, Thumbnail Preview, Status Logs (5 cols) -->
    <div class="lg:col-span-5 flex flex-col gap-5">

      <!-- Device ID & Supabase Settings -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Configuration</span>
          <span class="text-[10px] text-slate-500 font-mono">localStorage</span>
        </h2>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">Device ID / Name</label>
            <input id="deviceIdInput" type="text" value="Phone_01" placeholder="e.g. Phone_01" class="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono">
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">Supabase Project URL</label>
            <input id="supabaseUrlInput" type="url" placeholder="https://xyz.supabase.co" class="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono text-xs">
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">Supabase Anon Key</label>
            <input id="supabaseAnonKeyInput" type="password" placeholder="eyJhbGciOi..." class="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono text-xs">
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">Bucket Name</label>
            <input id="supabaseBucketInput" type="text" value="security-photos" placeholder="security-photos" class="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono text-xs">
          </div>
        </div>
      </div>

      <!-- Thumbnail Preview Section (Most recently captured photo pair) -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Recent Photo Pair</h2>
          <span id="pairTimestamp" class="text-[10px] font-mono text-slate-500">No captures yet</span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <!-- Photo 1 -->
          <div class="bg-slate-950 border border-slate-800 rounded-xl p-2 flex flex-col">
            <div class="relative aspect-[4/3] bg-black rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
              <img id="thumbPhoto1" class="w-full h-full object-cover hidden" alt="Photo 1">
              <span id="thumbPlaceholder1" class="text-[11px] text-slate-600 font-mono">Photo #1</span>
              <span id="badgePhoto1" class="hidden absolute top-1 left-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-emerald-400">#1</span>
            </div>
            <div class="mt-2 flex items-center justify-between text-[11px] font-mono">
              <span class="text-slate-400">Shot 1</span>
              <span id="statusPhoto1" class="text-slate-500">-</span>
            </div>
          </div>

          <!-- Photo 2 (+2s) -->
          <div class="bg-slate-950 border border-slate-800 rounded-xl p-2 flex flex-col">
            <div class="relative aspect-[4/3] bg-black rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
              <img id="thumbPhoto2" class="w-full h-full object-cover hidden" alt="Photo 2">
              <span id="thumbPlaceholder2" class="text-[11px] text-slate-600 font-mono">Photo #2</span>
              <span id="badgePhoto2" class="hidden absolute top-1 left-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-emerald-400">#2 (+2s)</span>
            </div>
            <div class="mt-2 flex items-center justify-between text-[11px] font-mono">
              <span class="text-slate-400">Shot 2</span>
              <span id="statusPhoto2" class="text-slate-500">-</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Scrollable Status Log Box -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex-1 flex flex-col min-h-[220px]">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Status Logs</h2>
          <button id="clearLogsBtn" class="text-[11px] text-slate-500 hover:text-slate-300 font-mono">Clear</button>
        </div>
        <div id="logsContainer" class="flex-1 max-h-52 overflow-y-auto space-y-1.5 font-mono text-[11px] p-2 bg-slate-950 rounded-lg border border-slate-800">
          <div class="text-slate-500">[System] Ready. Click "View" to begin security monitoring.</div>
        </div>
      </div>

    </div>
  </main>

  <script>
    // State
    let stream = null;
    let wakeLock = null;
    let isMonitoring = false;
    let isCapturing = false;
    let timerInterval = null;
    let remainingSeconds = 1200;
    let totalCycleSeconds = 1200;

    // Elements
    const viewBtn = document.getElementById('viewBtn');
    const stopBtn = document.getElementById('stopBtn');
    const snapNowBtn = document.getElementById('snapNowBtn');
    const cameraVideo = document.getElementById('cameraVideo');
    const cameraPlaceholder = document.getElementById('cameraPlaceholder');
    const recIndicator = document.getElementById('recIndicator');
    const cameraStatusText = document.getElementById('cameraStatusText');
    const resBadge = document.getElementById('resBadge');
    const testModeCheckbox = document.getElementById('testModeCheckbox');
    const countdownDisplay = document.getElementById('countdownDisplay');
    const cycleStatus = document.getElementById('cycleStatus');
    const cycleProgressBar = document.getElementById('cycleProgressBar');
    const intervalLabel = document.getElementById('intervalLabel');
    const wakeLockBadge = document.getElementById('wakeLockBadge');
    const wakeLockText = document.getElementById('wakeLockText');
    const logsContainer = document.getElementById('logsContainer');
    const clearLogsBtn = document.getElementById('clearLogsBtn');

    // Config Inputs
    const deviceIdInput = document.getElementById('deviceIdInput');
    const supabaseUrlInput = document.getElementById('supabaseUrlInput');
    const supabaseAnonKeyInput = document.getElementById('supabaseAnonKeyInput');
    const supabaseBucketInput = document.getElementById('supabaseBucketInput');

    // Load LocalStorage or use exact pre-configured defaults
    const HARDCODED_CONFIG = {
      SUPABASE_URL: "https://nchosqdrzsphqnmrosfr.supabase.co",
      SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jaG9zcWRyenNwaHFubXJvc2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MzU1NTEsImV4cCI6MjEwNTExMTU1MX0.BnLxYZyLXxYLzF9PN7KBoLvoDvp-WLI5Qh2--XH9oeE",
      BUCKET_NAME: "healthy",
      DEFAULT_DEVICE_ID: "Phone_01"
    };

    deviceIdInput.value = localStorage.getItem('sec_device_id') || HARDCODED_CONFIG.DEFAULT_DEVICE_ID;
    supabaseUrlInput.value = localStorage.getItem('sec_supabase_url') || HARDCODED_CONFIG.SUPABASE_URL;
    supabaseAnonKeyInput.value = localStorage.getItem('sec_supabase_anon_key') || HARDCODED_CONFIG.SUPABASE_ANON_KEY;
    supabaseBucketInput.value = localStorage.getItem('sec_supabase_bucket') || HARDCODED_CONFIG.BUCKET_NAME;
    testModeCheckbox.checked = localStorage.getItem('sec_test_mode') === 'true';

    // Save on change
    deviceIdInput.addEventListener('input', () => localStorage.setItem('sec_device_id', deviceIdInput.value));
    supabaseUrlInput.addEventListener('input', () => localStorage.setItem('sec_supabase_url', supabaseUrlInput.value));
    supabaseAnonKeyInput.addEventListener('input', () => localStorage.setItem('sec_supabase_anon_key', supabaseAnonKeyInput.value));
    supabaseBucketInput.addEventListener('input', () => localStorage.setItem('sec_supabase_bucket', supabaseBucketInput.value));
    testModeCheckbox.addEventListener('change', () => {
      localStorage.setItem('sec_test_mode', testModeCheckbox.checked);
      updateIntervalConfig();
    });

    function log(message, type = 'info') {
      const time = new Date().toTimeString().split(' ')[0];
      const entry = document.createElement('div');
      let colorClass = 'text-slate-400';
      if (type === 'success') colorClass = 'text-emerald-400';
      if (type === 'error') colorClass = 'text-rose-400';
      if (type === 'warn') colorClass = 'text-amber-400';
      entry.className = colorClass;
      entry.textContent = \`[\${time}] \${message}\`;
      logsContainer.appendChild(entry);
      logsContainer.scrollTop = logsContainer.scrollHeight;
    }

    clearLogsBtn.addEventListener('click', () => {
      logsContainer.innerHTML = '';
      log('Logs cleared.');
    });

    // Screen Wake Lock API
    async function requestWakeLock() {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          wakeLockBadge.classList.remove('hidden');
          wakeLockText.textContent = 'Wake Lock: Active';
          wakeLockBadge.querySelector('span').className = 'w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]';
          log('Screen Wake Lock acquired. Display sleep prevented.', 'success');
          wakeLock.addEventListener('release', () => {
            if (isMonitoring) {
              wakeLockText.textContent = 'Wake Lock: Released';
              wakeLockBadge.querySelector('span').className = 'w-2 h-2 rounded-full bg-amber-400';
            }
          });
        } catch (err) {
          log('Wake Lock request rejected: ' + err.message, 'warn');
        }
      } else {
        log('Screen Wake Lock API not supported on this browser.', 'warn');
      }
    }

    async function releaseWakeLock() {
      if (wakeLock) {
        try { await wakeLock.release(); } catch(e) {}
        wakeLock = null;
        wakeLockText.textContent = 'Wake Lock: Off';
        wakeLockBadge.querySelector('span').className = 'w-2 h-2 rounded-full bg-slate-600';
      }
    }

    document.addEventListener('visibilitychange', async () => {
      if (wakeLock !== null && document.visibilityState === 'visible' && isMonitoring) {
        await requestWakeLock();
      }
    });

    function updateIntervalConfig() {
      const isTest = testModeCheckbox.checked;
      totalCycleSeconds = isTest ? 10 : 1200;
      intervalLabel.textContent = isTest ? 'Cycle: 10s (Test)' : 'Cycle: 20m (1200s)';
      if (isMonitoring && !isCapturing) {
        remainingSeconds = Math.min(remainingSeconds, totalCycleSeconds);
        updateTimerDisplay();
      }
    }

    function updateTimerDisplay() {
      const mins = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
      const secs = (remainingSeconds % 60).toString().padStart(2, '0');
      countdownDisplay.textContent = \`\${mins}:\${secs}\`;
      const elapsed = totalCycleSeconds - remainingSeconds;
      const pct = Math.min(100, Math.max(0, (elapsed / totalCycleSeconds) * 100));
      cycleProgressBar.style.width = \`\${pct}%\`;
    }

    // Silent Snapshot Capture via Canvas
    async function captureFrame() {
      const width = cameraVideo.videoWidth || 1280;
      const height = cameraVideo.videoHeight || 720;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(cameraVideo, 0, 0, width, height);

      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.90));
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      return { blob, dataUrl, width, height };
    }

    // Upload to Supabase Storage REST API
    async function uploadPhotoToSupabase(blob, storagePath) {
      const url = supabaseUrlInput.value.trim().replace(/\\/+$/, '');
      const anonKey = supabaseAnonKeyInput.value.trim();
      const bucket = supabaseBucketInput.value.trim();

      if (!url || !anonKey || !bucket) {
        log(\`Supabase credentials not configured. Photo saved locally in preview (\${(blob.size/1024).toFixed(1)} KB)\`, 'warn');
        return { success: false, reason: 'unconfigured' };
      }

      const endpoint = \`\${url}/storage/v1/object/\${encodeURIComponent(bucket)}/\${storagePath}\`;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'apikey': anonKey,
            'Authorization': \`Bearer \${anonKey}\`,
            'Content-Type': 'image/jpeg',
            'x-upsert': 'true'
          },
          body: blob
        });

        if (res.ok) {
          log(\`Uploaded \${storagePath} (\${(blob.size/1024).toFixed(1)} KB)\`, 'success');
          return { success: true };
        } else {
          const errText = await res.text();
          log(\`Upload failed [HTTP \${res.status}]: \${errText.slice(0, 80)}\`, 'error');
          return { success: false, error: errText };
        }
      } catch (err) {
        log(\`Network error uploading \${storagePath}: \${err.message}\`, 'error');
        return { success: false, error: err.message };
      }
    }

    // Capture 2 consecutive photos 2 seconds apart
    async function executeTwoConsecutiveCaptures() {
      if (isCapturing || !stream) return;
      isCapturing = true;
      cycleStatus.textContent = 'Capturing Shot 1/2...';

      const d = new Date();
      const pad = n => n.toString().padStart(2, '0');
      const timestamp = \`\${d.getFullYear()}\${pad(d.getMonth()+1)}\${pad(d.getDate())}_\${pad(d.getHours())}\${pad(d.getMinutes())}\${pad(d.getSeconds())}\`;
      const deviceId = (deviceIdInput.value.trim() || 'Phone_01').replace(/[/\\\\?%*:|"<>]/g, '_');
      document.getElementById('pairTimestamp').textContent = d.toLocaleTimeString();

      try {
        // 1. First Photo immediately
        log(\`Capturing photo 1 of 2...\`, 'info');
        const snap1 = await captureFrame();
        const path1 = \`\${deviceId}/photo_\${timestamp}_1.jpg\`;
        
        // Update Thumb 1
        const t1 = document.getElementById('thumbPhoto1');
        t1.src = snap1.dataUrl;
        t1.classList.remove('hidden');
        document.getElementById('thumbPlaceholder1').classList.add('hidden');
        document.getElementById('badgePhoto1').classList.remove('hidden');
        document.getElementById('statusPhoto1').textContent = 'Uploading...';

        const up1 = await uploadPhotoToSupabase(snap1.blob, path1);
        document.getElementById('statusPhoto1').textContent = up1.success ? 'Uploaded' : (up1.reason === 'unconfigured' ? 'Local' : 'Failed');
        document.getElementById('statusPhoto1').className = up1.success ? 'text-emerald-400' : (up1.reason === 'unconfigured' ? 'text-amber-400' : 'text-rose-400');

        // 2. Wait 2 seconds
        cycleStatus.textContent = 'Waiting 2s interval...';
        await new Promise(r => setTimeout(r, 2000));

        // 3. Second Photo
        log(\`Capturing photo 2 of 2 (+2s)...\`, 'info');
        cycleStatus.textContent = 'Capturing Shot 2/2...';
        const snap2 = await captureFrame();
        const path2 = \`\${deviceId}/photo_\${timestamp}_2.jpg\`;

        // Update Thumb 2
        const t2 = document.getElementById('thumbPhoto2');
        t2.src = snap2.dataUrl;
        t2.classList.remove('hidden');
        document.getElementById('thumbPlaceholder2').classList.add('hidden');
        document.getElementById('badgePhoto2').classList.remove('hidden');
        document.getElementById('statusPhoto2').textContent = 'Uploading...';

        const up2 = await uploadPhotoToSupabase(snap2.blob, path2);
        document.getElementById('statusPhoto2').textContent = up2.success ? 'Uploaded' : (up2.reason === 'unconfigured' ? 'Local' : 'Failed');
        document.getElementById('statusPhoto2').className = up2.success ? 'text-emerald-400' : (up2.reason === 'unconfigured' ? 'text-amber-400' : 'text-rose-400');

        log(\`Photo cycle completed. Next capture scheduled in \${testModeCheckbox.checked ? '10 seconds' : '20 minutes'}.\`, 'success');
      } catch (err) {
        log('Error during photo capture: ' + err.message, 'error');
      } finally {
        isCapturing = false;
        remainingSeconds = totalCycleSeconds;
        cycleStatus.textContent = 'Monitoring Active';
        updateTimerDisplay();
      }
    }

    function startTimer() {
      clearInterval(timerInterval);
      updateIntervalConfig();
      remainingSeconds = totalCycleSeconds;
      updateTimerDisplay();

      timerInterval = setInterval(() => {
        if (!isMonitoring || isCapturing) return;
        remainingSeconds--;
        if (remainingSeconds <= 0) {
          executeTwoConsecutiveCaptures();
        } else {
          updateTimerDisplay();
        }
      }, 1000);
    }

    // Primary Button "View" Action
    async function startMonitoring() {
      try {
        log('Requesting front camera permission (facingMode: user)...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false
        }).catch(async () => {
          return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        });

        cameraVideo.srcObject = stream;
        cameraVideo.classList.remove('hidden');
        cameraPlaceholder.classList.add('hidden');
        recIndicator.classList.remove('hidden');
        cameraStatusText.textContent = 'Active (Front)';
        cameraStatusText.className = 'text-emerald-400 font-semibold';

        cameraVideo.onloadedmetadata = () => {
          resBadge.textContent = \`\${cameraVideo.videoWidth}x\${cameraVideo.videoHeight}\`;
        };

        isMonitoring = true;
        viewBtn.classList.add('hidden');
        stopBtn.classList.remove('hidden');
        snapNowBtn.disabled = false;

        log('Camera stream initialized.', 'success');

        // Request Screen Wake Lock API
        await requestWakeLock();

        // Immediate snapshot of 2 consecutive photos (2s apart)
        await executeTwoConsecutiveCaptures();

        // Start 20-minute (or 10s test) countdown timer
        startTimer();

      } catch (err) {
        log('Camera permission failed or unavailable: ' + err.message, 'error');
      }
    }

    function stopMonitoring() {
      isMonitoring = false;
      clearInterval(timerInterval);
      releaseWakeLock();

      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
      }
      cameraVideo.classList.add('hidden');
      cameraPlaceholder.classList.remove('hidden');
      recIndicator.classList.add('hidden');
      cameraStatusText.textContent = 'Standby';
      cameraStatusText.className = 'text-slate-200';
      viewBtn.classList.remove('hidden');
      stopBtn.classList.add('hidden');
      snapNowBtn.disabled = true;
      cycleStatus.textContent = 'Monitoring Stopped';
      log('Monitoring stopped by user.');
    }

    viewBtn.addEventListener('click', startMonitoring);
    stopBtn.addEventListener('click', stopMonitoring);
    snapNowBtn.addEventListener('click', () => {
      if (isMonitoring && !isCapturing) {
        executeTwoConsecutiveCaptures();
      }
    });

    updateIntervalConfig();
  </script>
</body>
</html>`;
}

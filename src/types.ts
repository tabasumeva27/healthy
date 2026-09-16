export interface SecurityConfig {
  deviceId: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseBucket: string;
  testMode: boolean;
}

export interface CapturedPhoto {
  id: string;
  index: 1 | 2;
  timestamp: string;
  dataUrl: string;
  blobSize: number;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error' | 'skipped';
  uploadError?: string;
  cloudPath?: string;
}

export interface PhotoPair {
  id: string;
  cycleTimestamp: string;
  photo1?: CapturedPhoto;
  photo2?: CapturedPhoto;
  status: 'capturing' | 'completed' | 'partial';
}

export interface LogEvent {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

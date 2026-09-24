export interface SecurityConfig {
  deviceId: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseBucket: string;
  testMode: boolean;
  intervalSeconds: number; // default 7200 (2 hours)
  videoDurationSeconds: number; // default 10 seconds
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

export interface CapturedVideo {
  id: string;
  durationSeconds: number;
  timestamp: string;
  blobSize: number;
  mimeType: string;
  extension: string;
  uploadStatus: 'idle' | 'recording' | 'uploading' | 'success' | 'error';
  uploadError?: string;
  cloudPath?: string;
}

export interface PhotoPair {
  id: string;
  cycleTimestamp: string;
  photo1?: CapturedPhoto;
  photo2?: CapturedPhoto;
  video?: CapturedVideo;
  status: 'capturing' | 'recording_video' | 'completed' | 'partial';
}

export interface LogEvent {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

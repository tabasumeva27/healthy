export interface UploadResult {
  success: boolean;
  cloudPath?: string;
  error?: string;
  statusCode?: number;
}

export function normalizeSupabaseUrl(url: string): string {
  let clean = url.trim().replace(/\/+$/, '');
  clean = clean.replace(/\/rest\/v1\/?$/i, '');
  return clean;
}

/**
 * Uploads a Blob directly to Supabase Storage using standard REST API
 * Path format: {device_id}/photo_{timestamp}_{index}.jpg
 */
export async function uploadToSupabaseStorage(
  supabaseUrl: string,
  anonKey: string,
  bucketName: string,
  path: string,
  blob: Blob
): Promise<UploadResult> {
  if (!supabaseUrl || !anonKey || !bucketName) {
    return {
      success: false,
      error: 'Supabase URL, Anon Key, or Bucket Name is missing.'
    };
  }

  const cleanUrl = normalizeSupabaseUrl(supabaseUrl);
  const cleanBucket = bucketName.trim();
  const cleanPath = path.trim().replace(/^\/+/, '');

  // Supabase Storage REST endpoint: {origin}/storage/v1/object/{bucket}/{path}
  const endpoint = `${cleanUrl}/storage/v1/object/${encodeURIComponent(cleanBucket)}/${cleanPath}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': anonKey.trim(),
        'Authorization': `Bearer ${anonKey.trim()}`,
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true'
      },
      body: blob
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
        }
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }

      return {
        success: false,
        statusCode: response.status,
        error: errorMessage
      };
    }

    return {
      success: true,
      cloudPath: `${cleanBucket}/${cleanPath}`,
      statusCode: response.status
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: errorMsg
    };
  }
}

/**
 * Uploads device status, telemetry, or activity log JSON directly to Supabase Storage.
 * This allows checking all device activity, battery, capture count, and status from Supabase.
 */
export async function uploadDeviceStatusToSupabase(
  supabaseUrl: string,
  anonKey: string,
  bucketName: string,
  deviceId: string,
  statusData: Record<string, unknown>
): Promise<{ success: boolean; cloudPath?: string; error?: string }> {
  const cleanUrl = normalizeSupabaseUrl(supabaseUrl);
  const cleanBucket = bucketName.trim();
  const filePath = `${deviceId}/device_status.json`;
  const endpoint = `${cleanUrl}/storage/v1/object/${encodeURIComponent(cleanBucket)}/${filePath}`;

  try {
    const blob = new Blob([JSON.stringify(statusData, null, 2)], { type: 'application/json' });
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': anonKey.trim(),
        'Authorization': `Bearer ${anonKey.trim()}`,
        'Content-Type': 'application/json',
        'x-upsert': 'true'
      },
      body: blob
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    return { success: true, cloudPath: `${cleanBucket}/${filePath}` };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Tests connection to Supabase Storage by verifying bucket existence
 */
export async function testSupabaseConnection(
  supabaseUrl: string,
  anonKey: string,
  bucketName: string
): Promise<{ ok: boolean; message: string }> {
  if (!supabaseUrl || !anonKey || !bucketName) {
    return { ok: false, message: 'Please provide Supabase URL, Anon Key, and Bucket Name.' };
  }

  const cleanUrl = normalizeSupabaseUrl(supabaseUrl);
  const cleanBucket = bucketName.trim();

  try {
    const endpoint = `${cleanUrl}/storage/v1/bucket/${encodeURIComponent(cleanBucket)}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': anonKey.trim(),
        'Authorization': `Bearer ${anonKey.trim()}`
      }
    });

    if (response.ok) {
      return { ok: true, message: `Bucket "${cleanBucket}" verified successfully!` };
    } else {
      let errText = `HTTP ${response.status}`;
      try {
        const data = await response.json();
        if (data.message) errText = data.message;
      } catch {
        // use default
      }
      return { ok: false, message: `Bucket verification failed: ${errText}` };
    }
  } catch (e: unknown) {
    return { ok: false, message: `Connection test error: ${e instanceof Error ? e.message : String(e)}` };
  }
}

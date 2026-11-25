/**
 * Generates and persists a unique device identifier per smartphone
 * so every user's captures are stored in their own dedicated Supabase folder.
 */
export function getOrGenerateDeviceId(): string {
  // Optional URL override if ever provided (?device=Name)
  try {
    const params = new URLSearchParams(window.location.search);
    const queryDevice = params.get('device');
    if (queryDevice && queryDevice.trim().length > 0) {
      const sanitized = queryDevice.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      localStorage.setItem('sec_device_id', sanitized);
      return sanitized;
    }
  } catch {
    // Ignore URL parsing errors
  }

  // Return existing persistent unique ID if present
  try {
    const saved = localStorage.getItem('sec_device_id');
    if (saved && saved.trim().length > 0 && saved !== 'Phone_01') {
      return saved.trim();
    }
  } catch {
    // Ignore localStorage read errors
  }

  // Detect smartphone brand for human-friendly folder naming
  let brand = 'Mobile';
  const ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '').toLowerCase();
  if (ua.includes('samsung') || ua.includes('sm-')) {
    brand = 'Samsung';
  } else if (ua.includes('xiaomi') || ua.includes('redmi') || ua.includes('poco')) {
    brand = 'Xiaomi';
  } else if (ua.includes('vivo')) {
    brand = 'Vivo';
  } else if (ua.includes('oppo')) {
    brand = 'Oppo';
  } else if (ua.includes('realme')) {
    brand = 'Realme';
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    brand = 'iPhone';
  } else if (ua.includes('oneplus')) {
    brand = 'OnePlus';
  } else if (ua.includes('pixel')) {
    brand = 'Pixel';
  }

  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const generatedId = `Device_${brand}_${randomSuffix}`;

  try {
    localStorage.setItem('sec_device_id', generatedId);
  } catch {
    // Ignore localStorage write errors
  }

  return generatedId;
}

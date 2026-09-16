/**
 * Screen Wake Lock Manager to keep smartphone display on during monitoring.
 */

// Define WakeLockSentinel interface if not present in ambient types
type WakeLockType = 'screen';
interface WakeLockSentinelLike extends EventTarget {
  readonly released: boolean;
  readonly type: WakeLockType;
  release(): Promise<void>;
  addEventListener(type: 'release', listener: (this: WakeLockSentinelLike, ev: Event) => void): void;
  removeEventListener(type: 'release', listener: (this: WakeLockSentinelLike, ev: Event) => void): void;
}

export class WakeLockController {
  private sentinel: WakeLockSentinelLike | null = null;
  private onStatusChange?: (active: boolean) => void;
  private shouldBeActive = false;

  constructor(onStatusChange?: (active: boolean) => void) {
    this.onStatusChange = onStatusChange;
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }

  public async acquire(): Promise<boolean> {
    this.shouldBeActive = true;
    if (!this.isSupported()) {
      return false;
    }

    try {
      const nav = navigator as unknown as { wakeLock: { request: (type: string) => Promise<WakeLockSentinelLike> } };
      this.sentinel = await nav.wakeLock.request('screen');
      this.onStatusChange?.(true);

      this.sentinel?.addEventListener('release', () => {
        if (this.shouldBeActive) {
          this.onStatusChange?.(false);
        }
      });

      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      return true;
    } catch {
      this.onStatusChange?.(false);
      return false;
    }
  }

  public async release(): Promise<void> {
    this.shouldBeActive = false;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch {
        // ignore
      }
      this.sentinel = null;
    }
    this.onStatusChange?.(false);
  }

  private async handleVisibilityChange(): Promise<void> {
    if (this.shouldBeActive && document.visibilityState === 'visible') {
      await this.acquire();
    }
  }
}

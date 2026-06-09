import { useEffect } from 'react';

export function useWakeLock(active: boolean) {
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    async function request() {
      if ('wakeLock' in navigator && active) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch {
          // Wake Lock API may fail (e.g., battery saver, inactive tab)
        }
      }
    }
    request();
    return () => {
      wakeLock?.release().catch(() => {});
    };
  }, [active]);
}

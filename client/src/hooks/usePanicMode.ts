import { useEffect } from 'react';
import { useWealthStore } from '../store/wealthStore';
import { logEmergencyLockdown } from '../utils/auditLogger';

let escCount = 0;
let timer: ReturnType<typeof setTimeout> | null = null;

export function usePanicMode() {
  const setLockdownActive = useWealthStore.getState().setLockdownActive;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        escCount++;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => { escCount = 0; }, 800);
        if (escCount >= 3) {
          escCount = 0;
          setLockdownActive(true);
          logEmergencyLockdown('user-001');
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setLockdownActive]);
}

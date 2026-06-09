import { useEffect, useRef } from 'react';
import { useWealthStore } from '../store/wealthStore';

export function useDemoMode() {
  const setDemoModeActive = useWealthStore((s) => s.setDemoModeActive);
  const demoModeActive = useWealthStore((s) => s.demoModeActive);
  const shiftDRef = useRef<number[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (demoModeActive) return;
      if (e.shiftKey && e.key === 'D') {
        const now = Date.now();
        shiftDRef.current = [...shiftDRef.current, now].filter((t) => now - t < 2000);
        if (shiftDRef.current.length >= 3) {
          setDemoModeActive(true);
          shiftDRef.current = [];
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setDemoModeActive, demoModeActive]);
}

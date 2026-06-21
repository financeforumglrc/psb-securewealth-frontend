import { useEffect, useState } from 'react';
import { isDuressLocked, getDuressLockExpiry } from '@/shared/services/duressService';

export default function CoercedModeBanner() {
  const [locked, setLocked] = useState(false);
  const [expiry, setExpiry] = useState<number | null>(null);

  useEffect(() => {
    const check = () => {
      setLocked(isDuressLocked());
      setExpiry(getDuressLockExpiry());
    };
    check();
    const interval = setInterval(check, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!locked) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[90] bg-rose-600 text-white">
      <div className="flex items-center justify-center gap-3 py-2 px-4">
        <i className="fas fa-triangle-exclamation animate-pulse" />
        <p className="text-xs font-bold">
          COERCED MODE ACTIVE — All balances sanitized. Critical actions blocked. Silent alert sent.
        </p>
        {expiry && (
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
            Expires: {new Date(expiry).toLocaleTimeString('en-IN')}
          </span>
        )}
      </div>
    </div>
  );
}

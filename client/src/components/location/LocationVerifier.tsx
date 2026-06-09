import { useState } from 'react';

interface LocationVerifierProps {
  subscriptionName: string;
  onVerify: (success: boolean) => void;
}

// Mock Cult Fit gym locations in major Indian cities
const MOCK_GYMS = [
  { name: 'Cult Fit Andheri', lat: 19.1197, lng: 72.8464 },
  { name: 'Cult Fit Koramangala', lat: 12.9352, lng: 77.6245 },
  { name: 'Cult Fit Indiranagar', lat: 12.9719, lng: 77.6412 },
  { name: 'Cult Fit Bandra', lat: 19.0596, lng: 72.8295 },
  { name: 'Cult Fit Cyber Hub', lat: 28.4962, lng: 77.0898 },
];

export default function LocationVerifier({ subscriptionName, onVerify }: LocationVerifierProps) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'verifying' | 'success' | 'fail' | 'denied'>('idle');
  const [distance, setDistance] = useState<number | null>(null);

  if (!subscriptionName.toLowerCase().includes('cult')) {
    return (
      <p className="text-[10px] text-slate-400">
        <i className="fas fa-location-dot mr-1" /> Location verification available for Cult Fit
      </p>
    );
  }

  const handleVerify = () => {
    setStatus('requesting');
    if (!navigator.geolocation) {
      setStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus('verifying');
        // Find nearest gym
        let nearest = Infinity;
        MOCK_GYMS.forEach((gym) => {
          const d = Math.sqrt(
            Math.pow(pos.coords.latitude - gym.lat, 2) +
            Math.pow(pos.coords.longitude - gym.lng, 2)
          ) * 111000; // rough meters
          if (d < nearest) nearest = d;
        });
        setDistance(Math.round(nearest));
        setTimeout(() => {
          if (nearest < 500) {
            setStatus('success');
            onVerify(true);
          } else {
            setStatus('fail');
            onVerify(false);
          }
        }, 1500);
      },
      () => {
        setStatus('denied');
      }
    );
  };

  return (
    <div className="mt-2">
      {status === 'idle' && (
        <button
          onClick={handleVerify}
          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <i className="fas fa-location-dot" /> Verify Gym Attendance
        </button>
      )}
      {status === 'requesting' && (
        <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-500">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Requesting location...
        </div>
      )}
      {status === 'verifying' && (
        <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-500">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Checking nearest Cult Fit...
        </div>
      )}
      {status === 'success' && (
        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center">
          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">
            <i className="fas fa-check-circle mr-1" /> Verified! You are near a Cult Fit center.
          </p>
          <p className="text-[10px] text-emerald-500">Subscription usage validated.</p>
        </div>
      )}
      {status === 'fail' && (
        <div className="p-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800 text-center">
          <p className="text-xs text-amber-700 dark:text-amber-300 font-bold">
            <i className="fas fa-triangle-exclamation mr-1" /> Nearest gym is {distance}m away.
          </p>
          <p className="text-[10px] text-amber-500">Must be within 500m to verify.</p>
        </div>
      )}
      {status === 'denied' && (
        <div className="p-2 bg-rose-50 dark:bg-rose-900/10 rounded-lg border border-rose-200 dark:border-rose-800 text-center">
          <p className="text-xs text-rose-700 dark:text-rose-300 font-bold">
            <i className="fas fa-circle-xmark mr-1" /> Location access denied.
          </p>
          <p className="text-[10px] text-rose-500">Enable location permissions to verify.</p>
        </div>
      )}
    </div>
  );
}

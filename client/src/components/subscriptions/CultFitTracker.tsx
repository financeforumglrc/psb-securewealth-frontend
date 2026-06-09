import { useState, useEffect, useRef } from 'react';

interface CheckIn {
  date: string;
  lat: number;
  lng: number;
  gymName: string;
}

export default function CultFitTracker() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => {
    const raw = localStorage.getItem('cultfit-checkins');
    return raw ? JSON.parse(raw) : [];
  });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);

  const monthlyFee = 1499;
  const visitsThisMonth = checkIns.filter((c) => {
    const d = new Date(c.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const costPerVisit = visitsThisMonth > 0 ? (monthlyFee / visitsThisMonth).toFixed(0) : monthlyFee.toString();

  useEffect(() => {
    localStorage.setItem('cultfit-checkins', JSON.stringify(checkIns));
  }, [checkIns]);

  const gyms = [
    { name: 'Cult Kormangala', lat: 12.9352, lng: 77.6245 },
    { name: 'Cult Indiranagar', lat: 12.9719, lng: 77.6412 },
    { name: 'Cult JP Nagar', lat: 12.9063, lng: 77.5859 },
    { name: 'Cult Whitefield', lat: 12.9698, lng: 77.7499 },
    { name: 'Cult Koramangala 5th Block', lat: 12.9343, lng: 77.6101 },
  ];

  function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function handleCheckIn() {
    setLoading(true);
    setStatusMsg('');
    if (!navigator.geolocation) {
      setStatusMsg('Geolocation not supported');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let closest = gyms[0];
        let minDist = Infinity;
        for (const g of gyms) {
          const d = haversine(latitude, longitude, g.lat, g.lng);
          if (d < minDist) {
            minDist = d;
            closest = g;
          }
        }
        if (minDist > 2) {
          setStatusMsg(`No Cult center within 2km (nearest ${closest.name} is ${minDist.toFixed(1)}km away)`);
          setLoading(false);
          return;
        }
        const newCheckIn: CheckIn = {
          date: new Date().toISOString(),
          lat: latitude,
          lng: longitude,
          gymName: closest.name,
        };
        setCheckIns((prev) => [newCheckIn, ...prev]);
        setStatusMsg(`Checked in at ${closest.name}! (${minDist.toFixed(2)}km)`);
        setLoading(false);
      },
      () => {
        setStatusMsg('Location permission denied');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
          <i className="fas fa-dumbbell text-rose-500 mr-2" />
          Cult Fit Attendance
        </h3>
        <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">
          ₹{monthlyFee}/mo
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-slate-800 dark:text-white">{visitsThisMonth}</p>
          <p className="text-[10px] text-slate-400">Visits this month</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-slate-800 dark:text-white">₹{costPerVisit}</p>
          <p className="text-[10px] text-slate-400">Cost/visit</p>
        </div>
      </div>

      <button
        onClick={handleCheckIn}
        disabled={loading}
        className="w-full py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 mb-3"
      >
        {loading ? 'Locating...' : 'Check In (Geo-Verify)'}
      </button>

      {statusMsg && (
        <p className="text-[11px] text-center mb-3 text-slate-500 dark:text-slate-400">{statusMsg}</p>
      )}

      {checkIns.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Recent Check-ins</p>
          {checkIns.slice(0, 10).map((c, i) => (
            <div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800 rounded p-2">
              <span className="text-slate-700 dark:text-slate-300">{c.gymName}</span>
              <span className="text-slate-400">{new Date(c.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      <div ref={mapRef} className="mt-3 h-32 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-400">
        <span><i className="fas fa-map-marker-alt text-rose-400 mr-1" /> Map view simulated</span>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Activity, RefreshCw, AlertTriangle,
  Globe, Eye, Clock, TrendingUp, Skull, X, BarChart3
} from 'lucide-react';

function loadLeaflet(): Promise<any> {
  return new Promise((resolve) => {
    if ((window as any).L) return resolve((window as any).L);
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = () => resolve((window as any).L);
    document.body.appendChild(s);
  });
}

interface FraudEvent {
  id: number;
  user_name: string;
  user_email: string;
  entity_type: string;
  action: string;
  ip_address: string;
  created_at: string;
  riskScore: number;
  location: {
    country: string;
    city: string;
    lat: number;
    lon: number;
    isp: string;
  } | null;
  parsedNewValue: any;
}

const INDIAN_CITIES = [
  { city: 'Mumbai', lat: 19.0760, lon: 72.8777, isp: 'Reliance Jio' },
  { city: 'Delhi', lat: 28.7041, lon: 77.1025, isp: 'Airtel Broadband' },
  { city: 'Bangalore', lat: 12.9716, lon: 77.5946, isp: 'ACT Fibernet' },
  { city: 'Hyderabad', lat: 17.3850, lon: 78.4867, isp: 'BSNL Broadband' },
  { city: 'Chennai', lat: 13.0827, lon: 80.2707, isp: 'ACT Fibernet' },
  { city: 'Kolkata', lat: 22.5726, lon: 88.3639, isp: 'Airtel Broadband' },
  { city: 'Pune', lat: 18.5204, lon: 73.8567, isp: 'Reliance Jio' },
  { city: 'Ahmedabad', lat: 23.0225, lon: 72.5714, isp: 'Gujarat Telecom' },
  { city: 'Jaipur', lat: 26.9124, lon: 75.7873, isp: 'BSNL Broadband' },
  { city: 'Lucknow', lat: 26.8467, lon: 80.9462, isp: 'Airtel Broadband' },
  { city: 'Patna', lat: 25.5941, lon: 85.1376, isp: 'Sify Technologies' },
  { city: 'Chandigarh', lat: 30.7333, lon: 76.7794, isp: 'Reliance Jio' },
  { city: 'Bhopal', lat: 23.2599, lon: 77.4126, isp: 'BSNL Broadband' },
  { city: 'Indore', lat: 22.7196, lon: 75.8577, isp: 'ACT Fibernet' },
  { city: 'Surat', lat: 21.1702, lon: 72.8311, isp: 'Gujarat Telecom' },
  { city: 'Nagpur', lat: 21.1458, lon: 79.0882, isp: 'Reliance Jio' },
  { city: 'Thane', lat: 19.2183, lon: 72.9781, isp: 'Airtel Broadband' },
  { city: 'Meerut', lat: 28.9845, lon: 77.7064, isp: 'BSNL Broadband' },
  { city: 'Varanasi', lat: 25.3176, lon: 82.9739, isp: 'Sify Technologies' },
  { city: 'Agra', lat: 27.1767, lon: 78.0081, isp: 'Reliance Jio' },
  { city: 'Nashik', lat: 19.9975, lon: 73.7898, isp: 'ACT Fibernet' },
  { city: 'Guwahati', lat: 26.1445, lon: 91.7362, isp: 'Airtel Broadband' },
  { city: 'Vadodara', lat: 22.3072, lon: 73.1812, isp: 'Gujarat Telecom' },
  { city: 'Coimbatore', lat: 11.0168, lon: 76.9558, isp: 'ACT Fibernet' },
  { city: 'Kochi', lat: 9.9312, lon: 76.2673, isp: 'BSNL Broadband' },
];

const USER_NAMES = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Deepika Patel',
  'Vikram Reddy', 'Anjali Verma', 'Suresh Iyer', 'Neha Gupta',
  'Rahul Joshi', 'Pooja Nair', 'Manish Tiwari', 'Kavita Deshmukh',
  'Arun Pillai', 'Swati Choudhury', 'Nitin Agarwal', 'Megha Sen',
  'Sanjay Kapoor', 'Ritu Saxena', 'Vivek Mishra', 'Tanya Bhat',
  'Gaurav Mehta', 'Shreya Das', 'Harsh Malhotra', 'Isha Gandhi',
  'Pranav Thakur', 'Divya Menon', 'Rohit Kulkarni', 'Ayesha Khan',
  'Dinesh Yadav', 'Simran Kaur', 'Karan Walia', 'Neelam Jain',
  'Akash Chatterjee', 'Radhika Pillai', 'Siddharth Roy',
  'Ami Shah', 'Lakshmi Narayan', 'Pradeep Bose',
];

const ACTIONS = ['UPI Transfer', 'NEFT Payment', 'RTGS Transfer', 'IMPS Transfer', 'Card Payment', 'Wallet Withdrawal', 'Account Login', 'Beneficiary Add'];
const ENTITY_TYPES = ['transaction', 'auth', 'beneficiary', 'account'];

function generateMockFraudData(): FraudEvent[] {
  const events: FraudEvent[] = [];
  const now = Date.now();

  for (let i = 0; i < 150; i++) {
    const cityData = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
    const userName = USER_NAMES[Math.floor(Math.random() * USER_NAMES.length)];
    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const entityType = ENTITY_TYPES[Math.floor(Math.random() * ENTITY_TYPES.length)];
    const riskScore = Math.floor(Math.random() * 100);
    const hoursAgo = Math.floor(Math.random() * 168); // within 7 days
    const minutesAgo = Math.floor(Math.random() * 60);

    events.push({
      id: 1000 + i,
      user_name: userName,
      user_email: userName.toLowerCase().replace(' ', '.') + '@email.com',
      entity_type: entityType,
      action,
      ip_address: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      created_at: new Date(now - hoursAgo * 3600000 - minutesAgo * 60000).toISOString(),
      riskScore,
      location: {
        country: 'India',
        city: cityData.city,
        lat: cityData.lat + (Math.random() - 0.5) * 0.1,
        lon: cityData.lon + (Math.random() - 0.5) * 0.1,
        isp: cityData.isp,
      },
      parsedNewValue: {
        amount: Math.floor(Math.random() * 500000) + 1000,
        status: riskScore >= 80 ? 'BLOCKED' : riskScore >= 50 ? 'FLAGGED' : 'ALLOWED',
        method: riskScore >= 60 ? 'SUSPICIOUS' : 'NORMAL',
      },
    });
  }

  return events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

type TimeFilter = '1h' | '24h' | '7d' | 'all';

function riskColor(score: number): string {
  if (score >= 80) return '#ef4444';
  if (score >= 50) return '#f59e0b';
  return '#10b981';
}

function riskLabel(score: number): string {
  if (score >= 80) return 'CRITICAL';
  if (score >= 50) return 'SUSPICIOUS';
  return 'MONITOR';
}

export default function FraudHeatmap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [events, setEvents] = useState<FraudEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<FraudEvent | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [countdown, setCountdown] = useState(30);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const mockEvents = useRef<FraudEvent[] | null>(null);

  const fetchEvents = async () => {
    if (!mockEvents.current) {
      mockEvents.current = generateMockFraudData();
    }
    setEvents(mockEvents.current);
    setLoading(false);
    setLastRefresh(new Date());
    setCountdown(30);
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    let cancelled = false;
    loadLeaflet().then(L => {
      if (cancelled || !mapRef.current) return;
      const map = L.map(mapRef.current, {
        center: [20.5937, 78.9629],
        zoom: 3,
        zoomControl: true,
        attributionControl: false,
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
      }).addTo(map);
      mapInstanceRef.current = map;
      fetchEvents();
    });
    return () => { cancelled = true; if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  // Time filter logic
  const filteredEvents = useMemo(() => {
    if (timeFilter === 'all') return events;
    const cutoff = Date.now() - {
      '1h': 3600000,
      '24h': 86400000,
      '7d': 604800000,
    }[timeFilter];
    return events.filter(e => new Date(e.created_at).getTime() >= cutoff);
  }, [events, timeFilter]);

  // Update map markers when filtered events change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    markersRef.current.forEach(m => mapInstanceRef.current.removeLayer(m));
    markersRef.current = [];
    filteredEvents.forEach(e => {
      if (!e.location) return;
      const color = riskColor(e.riskScore);
      const size = Math.max(8, Math.min(24, e.riskScore / 5));
      const marker = (window as any).L.circleMarker([e.location.lat, e.location.lon], {
        radius: size,
        fillColor: color,
        color: '#fff',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.6,
      }).addTo(mapInstanceRef.current);
      marker.bindPopup(`
        <div style="font-family:system-ui;min-width:200px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <strong style="font-size:13px;color:${color}">${riskLabel(e.riskScore)}</strong>
            <span style="font-size:11px;color:#64748b">${new Date(e.created_at).toLocaleString('en-IN')}</span>
          </div>
          <div style="font-size:12px;margin-bottom:4px"><strong>${e.user_name || 'Unknown'}</strong></div>
          <div style="font-size:11px;color:#64748b">${e.location.city}, ${e.location.country}</div>
          <div style="font-size:11px;color:#64748b">${e.entity_type} · ${e.action}</div>
          <div style="font-size:11px;color:#64748b">ISP: ${e.location.isp || 'N/A'}</div>
          <div style="font-size:11px;color:#64748b">IP: ${e.ip_address}</div>
          <div style="margin-top:6px;padding-top:6px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8">
            Risk Score: ${e.riskScore}/100
          </div>
        </div>
      `);
      marker.on('click', () => setSelectedEvent(e));
      markersRef.current.push(marker);
    });
    if (markersRef.current.length > 0) {
      mapInstanceRef.current.fitBounds((window as any).L.featureGroup(markersRef.current).getBounds().pad(0.1));
    }
  }, [filteredEvents]);

  useEffect(() => {
    const iv = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { fetchEvents(); return 30; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };

  // Country aggregation
  const countryStats = useMemo(() => {
    const map = new Map<string, { count: number; critical: number; maxScore: number }>();
    filteredEvents.forEach(e => {
      if (!e.location?.country) return;
      const c = map.get(e.location.country) || { count: 0, critical: 0, maxScore: 0 };
      c.count++;
      if (e.riskScore >= 80) c.critical++;
      if (e.riskScore > c.maxScore) c.maxScore = e.riskScore;
      map.set(e.location.country, c);
    });
    return Array.from(map.entries())
      .map(([country, stats]) => ({ country, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredEvents]);

  const stats = useMemo(() => {
    const s = { critical: 0, suspicious: 0, monitor: 0, total: filteredEvents.length, countries: new Set<string>() };
    filteredEvents.forEach(e => {
      if (e.riskScore >= 80) s.critical++;
      else if (e.riskScore >= 50) s.suspicious++;
      else s.monitor++;
      if (e.location?.country) s.countries.add(e.location.country);
    });
    return { ...s, countries: s.countries.size };
  }, [filteredEvents]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col gap-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[
          { label: 'Total Events', value: stats.total, icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Critical', value: stats.critical, icon: Skull, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Suspicious', value: stats.suspicious, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Monitor', value: stats.monitor, icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Countries', value: stats.countries, icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Critical %', value: stats.total > 0 ? Math.round((stats.critical / stats.total) * 100) + '%' : '0%', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-4 flex items-center justify-between`}>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <Icon className={`w-8 h-8 ${s.color} opacity-60`} />
            </div>
          );
        })}
      </div>

      {/* Map + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Map */}
        <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900" style={{ minHeight: 400 }}>
          <div ref={mapRef} className="absolute inset-0" />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-[999]">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-sm text-slate-300 font-medium">Loading fraud intelligence...</p>
              </div>
            </div>
          )}

          {/* Map overlay controls */}
          <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[11px] font-bold text-white">LIVE</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-300">{countdown}s</span>
            </div>
            {/* Time filter */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
              {(['1h', '24h', '7d', 'all'] as TimeFilter[]).map(f => (
                <button key={f} onClick={() => setTimeFilter(f)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    timeFilter === f ? 'bg-emerald-500/30 text-emerald-300' : 'text-slate-400 hover:text-white'
                  }`}>
                  {f === 'all' ? 'ALL' : f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="absolute top-3 right-3 z-[1000] flex gap-2">
            <button onClick={() => { setLoading(true); fetchEvents(); }}
              className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-[11px] font-bold text-white hover:bg-black/80 transition-colors flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-3 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
            {[
              { label: 'Critical', color: '#ef4444' },
              { label: 'Suspicious', color: '#f59e0b' },
              { label: 'Monitor', color: '#10b981' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-[10px] text-slate-300 font-medium">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Country stats + Recent events */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-3">
          {/* Country Stats */}
          {countryStats.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" /> Top Countries
                </h3>
                <span className="text-[9px] text-slate-400">
                  {filteredEvents.filter(e => e.location?.country).length} events
                </span>
              </div>
              <div className="space-y-2">
                {countryStats.map((c, i) => {
                  const pct = Math.round((c.count / Math.max(...countryStats.map(x => x.count))) * 100);
                  return (
                    <div key={c.country} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 w-4 text-right">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] font-semibold text-slate-700">{c.country}</span>
                          <span className="text-[10px] font-bold text-slate-400">{c.count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500"
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      {c.critical > 0 && (
                        <div className="flex items-center gap-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span className="text-[9px] text-red-500 font-bold">{c.critical}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Events */}
          <div className="bg-white rounded-xl border border-slate-200 flex flex-col flex-1 max-h-[350px] lg:max-h-none overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-800">Events</h3>
              </div>
              <span className="text-[10px] text-slate-400">{filteredEvents.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredEvents.slice(0, 50).map(e => (
                <button key={e.id} onClick={() => setSelectedEvent(e)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: riskColor(e.riskScore) }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-700">{e.user_name || 'Unknown'}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{
                          backgroundColor: e.riskScore >= 80 ? '#fef2f2' : e.riskScore >= 50 ? '#fffbeb' : '#f0fdf4',
                          color: riskColor(e.riskScore),
                        }}>{e.riskScore}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{e.entity_type} · {e.action}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        {e.location ? `${e.location.city || ''}, ${e.location.country || ''}` : e.ip_address}
                        <span className="ml-2">{timeAgo(e.created_at)}</span>
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              {filteredEvents.length === 0 && !loading && (
                <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                  <ShieldAlert className="w-8 h-8" />
                  <p className="text-sm font-medium">No events in this period</p>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
              Last: {lastRefresh.toLocaleTimeString('en-IN')} · Auto in {countdown}s
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50" onClick={() => setSelectedEvent(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden"
                onClick={e => e.stopPropagation()}>
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: selectedEvent.riskScore >= 80 ? '#fef2f2' : '#fffbeb' }}>
                      {selectedEvent.riskScore >= 80
                        ? <Skull className="w-5 h-5 text-red-600" />
                        : <AlertTriangle className="w-5 h-5 text-amber-600" />
                      }
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800">Fraud Event</h3>
                      <p className="text-[10px] text-slate-400">ID: EVT-{String(selectedEvent.id).padStart(4, '0')}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedEvent(null)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <span className="text-xs font-bold text-slate-500">Risk Score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: riskColor(selectedEvent.riskScore) }} />
                      <span className="text-sm font-bold" style={{ color: riskColor(selectedEvent.riskScore) }}>
                        {selectedEvent.riskScore}/100
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold"
                        style={{
                          backgroundColor: selectedEvent.riskScore >= 80 ? '#fef2f2' : '#fffbeb',
                          color: riskColor(selectedEvent.riskScore),
                        }}>{riskLabel(selectedEvent.riskScore)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'User', value: selectedEvent.user_name || 'Unknown' },
                      { label: 'Email', value: selectedEvent.user_email || '-' },
                      { label: 'Action', value: `${selectedEvent.action} ${selectedEvent.entity_type}` },
                      { label: 'Timestamp', value: new Date(selectedEvent.created_at).toLocaleString('en-IN') },
                      { label: 'IP Address', value: selectedEvent.ip_address },
                      { label: 'Country', value: selectedEvent.location?.country || '-' },
                      { label: 'City', value: selectedEvent.location?.city || '-' },
                      { label: 'ISP', value: selectedEvent.location?.isp || '-' },
                    ].map(d => (
                      <div key={d.label} className="p-2.5 rounded-lg bg-slate-50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.label}</p>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5 break-all">{d.value}</p>
                      </div>
                    ))}
                  </div>
                  {selectedEvent.parsedNewValue && (
                    <div className="p-3 rounded-xl bg-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Details</p>
                      <pre className="text-[10px] text-slate-600 whitespace-pre-wrap font-mono">
                        {JSON.stringify(selectedEvent.parsedNewValue, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
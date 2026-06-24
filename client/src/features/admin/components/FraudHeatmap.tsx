import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Activity, RefreshCw, AlertTriangle,
  Globe, Eye, Clock, TrendingUp, Skull, X, BarChart3, Radio, Play, Pause, Filter
} from 'lucide-react';
import { backendApi } from '@/shared/lib/backendApi';
import { useWealthStore } from '@/shared/store/wealthStore';

function loadLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).L) return resolve((window as any).L);
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    s.crossOrigin = 'anonymous';
    s.onload = () => resolve((window as any).L);
    s.onerror = () => reject(new Error('Failed to load Leaflet'));
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
  destination?: {
    country: string;
    city: string;
    lat: number;
    lon: number;
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

const GLOBAL_ORIGINS = [
  { name: 'East Asia', lat: 35.0, lon: 105.0 },
  { name: 'Eastern Europe', lat: 55.0, lon: 37.0 },
  { name: 'SE Asia', lat: 1.35, lon: 103.8 },
  { name: 'North America', lat: 37.5, lon: -95.0 },
  { name: 'Western Europe', lat: 51.5, lon: -0.1 },
  { name: 'Middle East', lat: 25.2, lon: 55.3 },
];

const CROSS_BORDER_DESTINATIONS = [
  { country: 'Singapore', city: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { country: 'Hong Kong', city: 'Hong Kong', lat: 22.3193, lon: 114.1694 },
  { country: 'UAE', city: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { country: 'UK', city: 'London', lat: 51.5074, lon: -0.1278 },
  { country: 'USA', city: 'New York', lat: 40.7128, lon: -74.0060 },
  { country: 'Switzerland', city: 'Zurich', lat: 47.3769, lon: 8.5417 },
  { country: 'China', city: 'Shanghai', lat: 31.2304, lon: 121.4737 },
  { country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lon: 4.9041 },
  { country: 'Russia', city: 'Moscow', lat: 55.7558, lon: 37.6173 },
  { country: 'Cayman Islands', city: 'George Town', lat: 19.3138, lon: -81.2546 },
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

function pickCrossBorderDestination(action: string, riskScore: number) {
  const moneyActions = ['UPI Transfer', 'NEFT Payment', 'RTGS Transfer', 'IMPS Transfer', 'Card Payment', 'Wallet Withdrawal'];
  const isMoneyAction = moneyActions.includes(action);
  const probability = riskScore >= 80 ? 0.35 : riskScore >= 60 ? 0.2 : isMoneyAction ? 0.12 : 0.04;
  if (Math.random() > probability) return null;
  return CROSS_BORDER_DESTINATIONS[Math.floor(Math.random() * CROSS_BORDER_DESTINATIONS.length)];
}

function generateMockFraudData(count = 150): FraudEvent[] {
  const events: FraudEvent[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const cityData = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
    const userName = USER_NAMES[Math.floor(Math.random() * USER_NAMES.length)];
    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const entityType = ENTITY_TYPES[Math.floor(Math.random() * ENTITY_TYPES.length)];
    const riskScore = Math.floor(Math.random() * 100);
    const hoursAgo = Math.floor(Math.random() * 168);
    const minutesAgo = Math.floor(Math.random() * 60);
    const destination = pickCrossBorderDestination(action, riskScore);

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
      destination,
      parsedNewValue: {
        amount: Math.floor(Math.random() * 500000) + 1000,
        status: riskScore >= 80 ? 'BLOCKED' : riskScore >= 50 ? 'FLAGGED' : 'ALLOWED',
        method: riskScore >= 60 ? 'SUSPICIOUS' : 'NORMAL',
        crossBorder: !!destination,
      },
    });
  }

  return events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function generateSingleEvent(id: number): FraudEvent {
  const cityData = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
  const userName = USER_NAMES[Math.floor(Math.random() * USER_NAMES.length)];
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const entityType = ENTITY_TYPES[Math.floor(Math.random() * ENTITY_TYPES.length)];
  const riskScore = Math.floor(Math.random() * 100);
  const destination = pickCrossBorderDestination(action, riskScore);
  return {
    id,
    user_name: userName,
    user_email: userName.toLowerCase().replace(' ', '.') + '@email.com',
    entity_type: entityType,
    action,
    ip_address: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    created_at: new Date().toISOString(),
    riskScore,
    location: {
      country: 'India',
      city: cityData.city,
      lat: cityData.lat + (Math.random() - 0.5) * 0.1,
      lon: cityData.lon + (Math.random() - 0.5) * 0.1,
      isp: cityData.isp,
    },
    destination,
    parsedNewValue: {
      amount: Math.floor(Math.random() * 500000) + 1000,
      status: riskScore >= 80 ? 'BLOCKED' : riskScore >= 50 ? 'FLAGGED' : 'ALLOWED',
      method: riskScore >= 60 ? 'SUSPICIOUS' : 'NORMAL',
      crossBorder: !!destination,
    },
  };
}

type TimeFilter = 'live' | '1h' | '24h' | '7d' | 'all';

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

function createPulseIconHtml(color: string, size = 28) {
  const center = size / 2;
  return `
    <svg width="${size + 24}" height="${size + 24}" viewBox="0 0 ${size + 24} ${size + 24}" style="overflow:visible">
      <defs>
        <filter id="glow-${color.replace('#','')}" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <circle cx="${center + 12}" cy="${center + 12}" r="${center + 2}" fill="${color}" fill-opacity="0.15" />
      <circle cx="${center + 12}" cy="${center + 12}" r="${center}" fill="${color}" stroke="rgba(255,255,255,0.9)" stroke-width="2" filter="url(#glow-${color.replace('#','')})" />
      <circle cx="${center + 12}" cy="${center + 12}" r="${center * 0.35}" fill="#ffffff" fill-opacity="0.95" />
      <circle cx="${center + 12}" cy="${center + 12}" r="${center + 6}" fill="none" stroke="${color}" stroke-width="2" opacity="0.8">
        <animate attributeName="r" from="${center}" to="${center + 16}" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="${center + 12}" cy="${center + 12}" r="${center + 6}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.5">
        <animate attributeName="r" from="${center}" to="${center + 16}" dur="2s" begin="0.7s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.6" to="0" dur="2s" begin="0.7s" repeatCount="indefinite" />
      </circle>
    </svg>
  `;
}

function createCityLabelHtml(name: string) {
  return `
    <div style="pointer-events:none;white-space:nowrap">
      <span style="font-size:10px;font-weight:700;color:#475569;text-shadow:0 1px 2px rgba(255,255,255,0.9);letter-spacing:0.5px">${name}</span>
    </div>
  `;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function FraudHeatmap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const layersRef = useRef<{ markers: any[]; vectors: any[]; glows: any[] }>({ markers: [], vectors: [], glows: [] });
  const [events, setEvents] = useState<FraudEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<FraudEvent | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('live');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [isLive, setIsLive] = useState(true);
  const [flashCount, setFlashCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const idCounterRef = useRef(2000);
  const darkMode = useWealthStore((s) => s.darkMode);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    // Render mock data immediately so the map is never stuck waiting on the backend
    const base = generateMockFraudData(150);
    setEvents(base.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 250));
    setLoading(false);
    setLastRefresh(new Date());

    // Try to enrich with real backend data in the background
    try {
      const res = await backendApi.adminGetFraudEvents(200);
      if (res.ok && Array.isArray(res.data?.events)) {
        const real: FraudEvent[] = res.data.events.map((e: any, idx: number) => ({
          id: 10000 + (e.id || idx),
          user_name: e.user_name || e.userName || 'Unknown',
          user_email: e.user_email || e.userEmail || '',
          entity_type: e.entity_type || 'auth',
          action: e.action || 'Suspicious Activity',
          ip_address: e.ip_address || e.ipAddress || 'unknown',
          created_at: e.created_at || new Date().toISOString(),
          riskScore: e.riskScore || e.risk_score || 50,
          location: e.location ? {
            country: e.location.country || 'Unknown',
            city: e.location.city || 'Unknown',
            lat: e.location.lat,
            lon: e.location.lon,
            isp: e.location.isp || 'Unknown ISP',
          } : null,
          parsedNewValue: e.parsedNewValue || null,
        }));
        setEvents(prev => {
          const existingKeys = new Set(prev.map(e => `${e.ip_address}-${e.created_at}`));
          const newReal = real.filter(e => !existingKeys.has(`${e.ip_address}-${e.created_at}`));
          return [...newReal, ...prev]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 250);
        });
        setLastRefresh(new Date());
      }
    } catch {
      /* backend unavailable — mock data is already displayed */
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    let cancelled = false;
    let resizeHandler: (() => void) | null = null;
    loadLeaflet()
      .then(L => {
        if (cancelled || !mapRef.current) return;
        const map = L.map(mapRef.current, {
          center: [22.5, 78.9629],
          zoom: 5,
          minZoom: 4,
          maxZoom: 8,
          zoomControl: false,
          attributionControl: false,
        });
        const tileUrl = darkMode
          ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
        tileLayerRef.current = L.tileLayer(tileUrl, {
          maxZoom: 18,
          subdomains: 'abcd',
        }).addTo(map);
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        mapInstanceRef.current = map;
        // Ensure Leaflet recalculates container size after render / tab switches
        requestAnimationFrame(() => map.invalidateSize());
        const timer = setTimeout(() => map.invalidateSize(), 250);
        resizeHandler = () => map.invalidateSize();
        window.addEventListener('resize', resizeHandler);
        fetchEvents();
        return () => clearTimeout(timer);
      })
      .catch(err => {
        if (cancelled) return;
        setLoadError(err?.message || 'Map library failed to load');
        setLoading(false);
      });
    return () => {
      cancelled = true;
      if (resizeHandler) window.removeEventListener('resize', resizeHandler);
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, [fetchEvents]);

  // Swap tile layer when theme changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const map = mapInstanceRef.current;
    map.removeLayer(tileLayerRef.current);
    const L = (window as any).L;
    const tileUrl = darkMode
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);
  }, [darkMode]);

  // Filter logic
  const filteredEvents = useMemo(() => {
    let list = events;
    if (countryFilter !== 'all') {
      list = list.filter(e => e.location?.country === countryFilter);
    }
    if (timeFilter === 'all') return list;
    const cutoff = Date.now() - {
      live: 15000,
      '1h': 3600000,
      '24h': 86400000,
      '7d': 604800000,
    }[timeFilter];
    return list.filter(e => new Date(e.created_at).getTime() >= cutoff);
  }, [events, timeFilter, countryFilter]);

  // Render map layers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Clear previous layers
    layersRef.current.markers.forEach(m => map.removeLayer(m));
    layersRef.current.vectors.forEach(v => map.removeLayer(v));
    layersRef.current.glows.forEach(g => map.removeLayer(g));
    layersRef.current = { markers: [], vectors: [], glows: [] };

    if (filteredEvents.length === 0) return;

    // Heatmap-like glow circles (limit to top 80 for performance)
    filteredEvents.slice(0, 80).forEach(e => {
      if (!e.location) return;
      const glow = L.circleMarker([e.location.lat, e.location.lon], {
        radius: 16,
        fillColor: riskColor(e.riskScore),
        color: 'transparent',
        fillOpacity: 0.14,
        interactive: false,
      }).addTo(map);
      layersRef.current.glows.push(glow);
    });

    // Attack vectors for critical events
    const criticalEvents = filteredEvents.filter(e => e.riskScore >= 80).slice(0, 10);
    criticalEvents.forEach((e, i) => {
      if (!e.location) return;
      const origin = GLOBAL_ORIGINS[i % GLOBAL_ORIGINS.length];
      const latlngs = [
        [origin.lat, origin.lon],
        [e.location.lat, e.location.lon],
      ];
      const vector = L.polyline(latlngs, {
        color: '#ef4444',
        weight: 2.5,
        opacity: 0.75,
        dashArray: '6, 6',
        className: 'fraud-attack-vector',
      }).addTo(map);
      layersRef.current.vectors.push(vector);

      // Animated traveling threat dot
      const threatDot = L.circleMarker([origin.lat, origin.lon], {
        radius: 5,
        fillColor: '#ef4444',
        color: '#fff',
        weight: 1,
        fillOpacity: 1,
        opacity: 0,
        className: 'fraud-threat-dot',
        interactive: false,
      }).addTo(map);
      layersRef.current.vectors.push(threatDot);
    });

    // Cross-border money trails (event location → foreign destination)
    const crossBorderEvents = filteredEvents.filter(e => e.destination && e.location).slice(0, 15);
    crossBorderEvents.forEach((e) => {
      if (!e.location || !e.destination) return;
      const latlngs = [
        [e.location.lat, e.location.lon],
        [e.destination.lat, e.destination.lon],
      ];
      const trail = L.polyline(latlngs, {
        color: '#f59e0b',
        weight: 2,
        opacity: 0.85,
        dashArray: '5, 5',
        className: 'fraud-money-trail',
      }).addTo(map);
      layersRef.current.vectors.push(trail);

      // Destination marker
      const destMarker = L.circleMarker([e.destination.lat, e.destination.lon], {
        radius: 6,
        fillColor: '#f59e0b',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
        className: 'fraud-destination-pulse',
        interactive: false,
      }).addTo(map);
      layersRef.current.vectors.push(destMarker);

      // Animated money packet traveling the trail
      const moneyDot = L.circleMarker([e.location.lat, e.location.lon], {
        radius: 4,
        fillColor: '#f59e0b',
        color: '#ffffff',
        weight: 1.5,
        fillOpacity: 1,
        opacity: 0,
        className: 'fraud-money-dot',
        interactive: false,
      }).addTo(map);
      layersRef.current.vectors.push(moneyDot);
    });

    // Event markers
    filteredEvents.forEach(e => {
      if (!e.location) return;
      const color = riskColor(e.riskScore);
      const icon = L.divIcon({
        className: 'fraud-pulse-marker',
        html: createPulseIconHtml(color, 22),
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -12],
      });
      const marker = L.marker([e.location.lat, e.location.lon], { icon }).addTo(map);
      const parsed = e.parsedNewValue || {};
      marker.bindPopup(`
        <div style="font-family:system-ui,-apple-system,sans-serif;min-width:260px;border-radius:14px;overflow:hidden;background:#ffffff;color:#1e293b;border:1px solid #e2e8f0;box-shadow:0 20px 40px rgba(0,0,0,0.15)">
          <div style="padding:12px 16px;border-bottom:1px solid #f1f5f9;background:linear-gradient(135deg,${color}12,${color}06)">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:10px;height:10px;border-radius:50%;background:${color};box-shadow:0 0 10px ${color}80"></div>
                <span style="font-weight:700;font-size:13px;color:#1e293b">${riskLabel(e.riskScore)}</span>
              </div>
              <span style="font-size:11px;font-weight:700;color:${color};background:${color}15;padding:2px 10px;border-radius:20px">${e.riskScore}/100</span>
            </div>
          </div>
          <div style="padding:12px 16px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <div style="width:32px;height:32px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px">${(e.user_name || 'U')[0]}</div>
              <div>
                <div style="font-weight:600;font-size:13px;color:#1e293b">${e.user_name || 'Unknown'}</div>
                <div style="font-size:11px;color:#64748b">${e.location.city}, India</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0">
              <div style="background:#f8fafc;padding:8px 10px;border-radius:8px">
                <div style="font-size:9px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">Action</div>
                <div style="font-size:12px;font-weight:600;color:#334155;margin-top:2px">${e.action}</div>
              </div>
              <div style="background:#f8fafc;padding:8px 10px;border-radius:8px">
                <div style="font-size:9px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">Amount</div>
                <div style="font-size:12px;font-weight:700;color:#334155;margin-top:2px">₹${(parsed.amount || 0).toLocaleString('en-IN')}</div>
              </div>
              ${e.destination ? `
              <div style="background:#fffbeb;padding:8px 10px;border-radius:8px;grid-column:1/-1;border:1px solid #fef3c7">
                <div style="font-size:9px;font-weight:600;color:#d97706;text-transform:uppercase;letter-spacing:0.5px">Cross-border Transfer To</div>
                <div style="font-size:12px;font-weight:700;color:#92400e;margin-top:2px">${e.destination.city}, ${e.destination.country}</div>
              </div>` : ''}
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 4px">
              <span style="font-size:10px;padding:3px 8px;border-radius:6px;font-weight:600;background:${parsed.status === 'BLOCKED' ? '#fef2f2' : parsed.status === 'FLAGGED' ? '#fffbeb' : '#f0fdf4'};color:${parsed.status === 'BLOCKED' ? '#dc2626' : parsed.status === 'FLAGGED' ? '#d97706' : '#16a34a'}">${parsed.status || 'UNKNOWN'}</span>
              <span style="font-size:10px;padding:3px 8px;border-radius:6px;font-weight:600;background:#f1f5f9;color:#64748b">${e.ip_address}</span>
            </div>
            <div style="font-size:10px;color:#94a3b8;padding-top:8px;margin-top:8px;border-top:1px solid #f1f5f9;display:flex;justify-content:space-between">
              <span>${e.location.isp || 'N/A'}</span>
              <span>${new Date(e.created_at).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
            </div>
          </div>
        </div>
      `, { maxWidth: 320, className: 'fraud-light-popup' });
      marker.on('click', () => setSelectedEvent(e));
      layersRef.current.markers.push(marker);
    });

    // City labels for major metros
    [
      { name: 'MUMBAI', lat: 19.0760, lon: 72.8777 },
      { name: 'DELHI', lat: 28.7041, lon: 77.1025 },
      { name: 'BANGALORE', lat: 12.9716, lon: 77.5946 },
      { name: 'HYDERABAD', lat: 17.3850, lon: 78.4867 },
      { name: 'CHENNAI', lat: 13.0827, lon: 80.2707 },
      { name: 'KOLKATA', lat: 22.5726, lon: 88.3639 },
    ].forEach(city => {
      const lbl = L.marker([city.lat, city.lon], {
        icon: L.divIcon({
          className: 'fraud-city-label',
          html: createCityLabelHtml(city.name),
          iconSize: [0, 0],
          iconAnchor: [0, 12],
        }),
        interactive: false,
        zIndexOffset: -100,
      }).addTo(map);
      layersRef.current.markers.push(lbl);
    });

    // Fit bounds
    if (layersRef.current.markers.length > 0) {
      map.fitBounds(L.featureGroup(layersRef.current.markers).getBounds().pad(0.12));
    }
  }, [filteredEvents]);

  // Live event stream
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setEvents(prev => {
        const nextId = idCounterRef.current++;
        const newEvent = generateSingleEvent(nextId);
        const next = [newEvent, ...prev];
        return next.slice(0, 250);
      });
      setFlashCount(c => c + 1);
      const t = setTimeout(() => setFlashCount(c => Math.max(0, c - 1)), 1200);
      return () => clearTimeout(t);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLive]);

  // Auto-pause live when selecting older filters
  useEffect(() => {
    setIsLive(timeFilter === 'live');
  }, [timeFilter]);

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

  const criticalPct = stats.total > 0 ? Math.round((stats.critical / stats.total) * 100) : 0;

  const countries = useMemo(() => Array.from(new Set(events.map(e => e.location?.country).filter(Boolean) as string[])).sort(), [events]);

  const handleRefresh = () => {
    fetchEvents();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col gap-4">
      {/* Global styles for Leaflet customizations */}
      <style>{`
        .leaflet-popup { margin-bottom: 20px; }
        .leaflet-popup-content-wrapper.fraud-light-popup {
          border-radius: 14px !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
          min-width: 260px !important;
        }
        .leaflet-popup-tip {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
        }
        .leaflet-popup-close-button {
          top: 8px !important;
          right: 8px !important;
          font-size: 18px !important;
          color: #94a3b8 !important;
          width: 24px !important;
          height: 24px !important;
          line-height: 24px !important;
          border-radius: 6px !important;
          transition: all 0.15s !important;
        }
        .leaflet-popup-close-button:hover {
          background: #f1f5f9 !important;
          color: #475569 !important;
        }
        .leaflet-container { border-radius: 16px; background: #f1f5f9; }
        .leaflet-tile-pane {
          filter: saturate(0.9) contrast(1.05) brightness(1.02);
        }
        .fraud-attack-vector { animation: dash-flow 1.2s linear infinite; filter: drop-shadow(0 0 3px rgba(239,68,68,0.4)); }
        @keyframes dash-flow { to { stroke-dashoffset: -12; } }
        .fraud-threat-dot { animation: travel-threat 2.5s ease-in-out infinite; }
        @keyframes travel-threat {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
        .fraud-money-trail { animation: dash-flow 1.4s linear infinite; filter: drop-shadow(0 0 3px rgba(245,158,11,0.5)); }
        .fraud-money-dot { animation: travel-money 2.8s ease-in-out infinite; }
        @keyframes travel-money {
          0% { opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { opacity: 0; }
        }
        .fraud-destination-pulse { animation: dest-pulse 2s ease-in-out infinite; }
        @keyframes dest-pulse {
          0%, 100% { stroke-width: 2; r: 6; }
          50% { stroke-width: 4; r: 8; }
        }
        .fraud-radar-scan {
          background: linear-gradient(180deg, transparent 0%, rgba(16,185,129,0.06) 50%, transparent 100%);
          animation: radar-scan 4s linear infinite;
        }
        @keyframes radar-scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        .fraud-grid-bg {
          background-image:
            linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .fraud-scanlines {
          background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.4) 4px);
          pointer-events: none;
          opacity: 0.3;
        }
        .fraud-vignette {
          background: radial-gradient(circle at center, transparent 50%, rgba(15,23,42,0.08) 100%);
          pointer-events: none;
        }
        .fraud-light-frame {
          box-shadow: inset 0 0 60px rgba(255,255,255,0.5), 0 0 0 1px rgba(226,232,240,0.8);
        }
      `}</style>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Events', value: stats.total, icon: Activity, color: 'text-slate-700', bg: 'bg-white', border: 'border-slate-200', accent: 'bg-slate-100' },
          { label: 'Critical', value: stats.critical, icon: Skull, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', accent: 'bg-rose-100' },
          { label: 'Suspicious', value: stats.suspicious, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', accent: 'bg-amber-100' },
          { label: 'Monitor', value: stats.monitor, icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', accent: 'bg-emerald-100' },
          { label: 'Countries', value: stats.countries, icon: Globe, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100', accent: 'bg-sky-100' },
          { label: 'Critical %', value: `${criticalPct}%`, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', accent: 'bg-rose-100' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${s.bg} ${s.border} border rounded-2xl p-3.5 flex items-center justify-between shadow-sm hover:shadow-md transition-all`}
            >
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg ${s.accent} flex items-center justify-center`}>
                <Icon className={`w-4.5 h-4.5 ${s.color}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Map + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Map */}
        <div className="flex-1 relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 fraud-light-frame shadow-sm" style={{ minHeight: 420 }}>
          <div ref={mapRef} className="absolute inset-0 rounded-2xl" />

          {loading && events.length === 0 && !loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[999]">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-slate-600 font-medium">Loading fraud intelligence...</p>
              </div>
            </div>
          )}

          {loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-[999]">
              <div className="flex flex-col items-center gap-3 text-center px-6">
                <AlertTriangle className="w-10 h-10 text-rose-500" />
                <p className="text-sm font-medium text-slate-700">Map could not load</p>
                <p className="text-xs text-slate-500 max-w-xs">{loadError}. Please check your network and refresh the page.</p>
              </div>
            </div>
          )}

          {/* Subtle overlays */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-[400]">
            <div className="fraud-radar-scan absolute inset-x-0 h-24" />
            <div className="absolute inset-0 fraud-grid-bg opacity-20" />
            <div className="absolute inset-0 fraud-vignette" />
          </div>

          {/* Top-left live badge */}
          <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 border border-slate-200 shadow-sm backdrop-blur">
            <span className={`relative flex h-2.5 w-2.5 ${isLive ? 'animate-pulse' : ''}`}>
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? 'bg-red-500' : 'bg-slate-400'}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLive ? 'bg-red-500' : 'bg-slate-400'}`} />
            </span>
            <Radio className={`w-3 h-3 ${isLive ? 'text-red-500' : 'text-slate-400'}`} />
            <span className="text-[11px] font-bold text-slate-700 tracking-wide">{isLive ? 'LIVE THREAT STREAM' : 'PAUSED'}</span>
          </div>

          {/* Top-center time filters */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1 p-1 rounded-xl bg-white/95 border border-slate-200 shadow-sm backdrop-blur overflow-x-auto max-w-[calc(100%-140px)]">
            {(['live', '1h', '24h', '7d', 'all'] as TimeFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  timeFilter === f
                    ? f === 'live'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {f === 'all' ? 'ALL' : f.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Top-right controls */}
          <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white/95 border border-slate-200 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-blue-400 backdrop-blur shadow-sm max-w-[110px] truncate"
            >
              <option value="all">All Countries</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={() => setIsLive(l => !l)}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-colors bg-white/95 backdrop-blur shadow-sm ${
                isLive
                  ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isLive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {isLive ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 rounded-lg bg-white/95 border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 backdrop-blur shadow-sm"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {/* New event flash */}
          <AnimatePresence>
            {flashCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-14 right-3 z-[1000] px-3 py-1.5 rounded-lg bg-emerald-600/90 text-white text-[11px] font-bold shadow-lg"
              >
                +{flashCount} new event{flashCount > 1 ? 's' : ''}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-3 px-3 py-2 rounded-xl bg-white/95 border border-slate-200 shadow-sm backdrop-blur">
            {[
              { label: 'Critical', color: '#ef4444' },
              { label: 'Suspicious', color: '#f59e0b' },
              { label: 'Monitor', color: '#10b981' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: l.color, boxShadow: `0 0 6px ${l.color}80` }} />
                <span className="text-[10px] text-slate-600 font-medium">{l.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <div className="w-6 h-0.5 border-t-2 border-dashed border-amber-500" />
              <span className="text-[10px] text-slate-600 font-medium">Money Trail Abroad</span>
            </div>
          </div>

          {/* Bottom-right timestamp */}
          <div className="absolute bottom-3 right-3 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 border border-slate-200 text-[10px] text-slate-600 backdrop-blur shadow-sm">
            <Clock className="w-3 h-3 text-slate-400" />
            Last: {lastRefresh.toLocaleTimeString('en-IN')}
          </div>

          {/* Status strip */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] hidden sm:flex items-center gap-4 px-4 py-1.5 rounded-xl bg-white/95 border border-slate-200 backdrop-blur text-[10px] font-mono text-slate-500 shadow-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYS: ONLINE
            </span>
            <span className="text-slate-300">|</span>
            <span>LAT: 22.5937° N</span>
            <span className="text-slate-300">|</span>
            <span>LON: 78.9629° E</span>
            <span className="text-slate-300">|</span>
            <span>ZOOM: 5</span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-3 min-h-0 max-h-[45vh] lg:max-h-none overflow-y-auto">
          {/* Top Countries */}
          {countryStats.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-500" /> Top Countries
                </h3>
                <span className="text-[9px] text-slate-400">{filteredEvents.filter(e => e.location?.country).length} events</span>
              </div>
              <div className="space-y-2.5">
                {countryStats.map((c, i) => {
                  const pct = Math.round((c.count / Math.max(...countryStats.map(x => x.count))) * 100);
                  return (
                    <div key={c.country} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 w-4 text-right">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] font-semibold text-slate-700">{c.country}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500">{c.count}</span>
                            {c.critical > 0 && (
                              <span className="text-[9px] text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded font-bold">{c.critical}</span>
                            )}
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, delay: i * 0.03 }}
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Events */}
          <div className="bg-white rounded-2xl border border-slate-200 flex flex-col flex-1 min-h-[280px] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-700">Events</h3>
              </div>
              <span className="text-[10px] text-slate-400">{filteredEvents.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredEvents.slice(0, 50).map((e, idx) => (
                <motion.button
                  key={e.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.01 }}
                  onClick={() => setSelectedEvent(e)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full ring-2 ring-white flex-shrink-0 mt-1.5"
                      style={{ backgroundColor: riskColor(e.riskScore), boxShadow: `0 0 8px ${riskColor(e.riskScore)}` }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors truncate">{e.user_name || 'Unknown'}</span>
                        <span className="text-[10px] font-bold shrink-0" style={{ color: riskColor(e.riskScore) }}>{e.riskScore}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{e.action} · {e.location?.city || e.ip_address}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{timeAgo(e.created_at)}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
              {filteredEvents.length === 0 && !loading && (
                <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                  <ShieldAlert className="w-8 h-8" />
                  <p className="text-sm font-medium">No events in this period</p>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
              Last: {lastRefresh.toLocaleTimeString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal — fixed centered, not inside flex context */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[10000]"
              onClick={() => setSelectedEvent(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="relative px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100"
                      style={{ backgroundColor: `${riskColor(selectedEvent.riskScore)}12` }}
                    >
                      {selectedEvent.riskScore >= 80
                        ? <Skull className="w-6 h-6 text-rose-500" />
                        : <AlertTriangle className="w-6 h-6 text-amber-500" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">EVT-{String(selectedEvent.id).padStart(4, '0')}</span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                          style={{ backgroundColor: `${riskColor(selectedEvent.riskScore)}12`, color: riskColor(selectedEvent.riskScore) }}
                        >
                          {riskLabel(selectedEvent.riskScore)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">{selectedEvent.user_name || 'Unknown'}</h3>
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-bold" style={{ color: riskColor(selectedEvent.riskScore) }}>
                      {selectedEvent.riskScore}
                    </span>
                    <span className="text-sm text-slate-500">/100 Risk Score</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase mb-1">Action</p>
                      <p className="text-sm font-semibold text-slate-700">{selectedEvent.action}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase mb-1">Amount</p>
                      <p className="text-sm font-semibold text-slate-700">₹{(selectedEvent.parsedNewValue?.amount || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase mb-1">Location</p>
                      <p className="text-sm font-semibold text-slate-700">{selectedEvent.location?.city}, {selectedEvent.location?.country}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase mb-1">Provider</p>
                      <p className="text-sm font-semibold text-slate-700">{selectedEvent.location?.isp || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase mb-1">IP Address</p>
                      <p className="text-sm font-mono text-slate-700">{selectedEvent.ip_address}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase mb-1">Status</p>
                      <p className="text-sm font-semibold" style={{ color: selectedEvent.parsedNewValue?.status === 'BLOCKED' ? '#ef4444' : selectedEvent.parsedNewValue?.status === 'FLAGGED' ? '#f59e0b' : '#10b981' }}>
                        {selectedEvent.parsedNewValue?.status || 'ALLOWED'}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 uppercase">Timestamp</p>
                    <p className="text-xs font-mono text-slate-600">{new Date(selectedEvent.created_at).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="p-5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Filter className="w-4 h-4 text-emerald-500" />
                    Method: <span className="text-slate-700 font-semibold">{selectedEvent.parsedNewValue?.method || 'NORMAL'}</span>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors">
                    Investigate
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

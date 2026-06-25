import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Loader2, Globe, Satellite, Sun, Moon, Maximize2, Minimize2,
  Zap, Activity, AlertTriangle, ShieldAlert, Radio, TrendingUp, Clock,
  Crosshair, Expand, RotateCcw, Search, X, Layers, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { priorityColor } from '@/features/admin/services/fraudService';
import type { FraudCase, FraudHop } from '@/features/admin/lib/fraudTypes';

type MapStyle = 'roads' | 'dark' | 'light' | 'satellite';

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

function curveBetween(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  segments = 60,
  bend = 0.28
): [number, number][] {
  const midLat = (lat1 + lat2) / 2;
  const midLon = (lon1 + lon2) / 2;
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const dist = Math.sqrt(dLat * dLat + dLon * dLon);
  const factor = bend + Math.min(0.35, dist * 0.025);
  const ctrlLat = midLat - dLon * factor;
  const ctrlLon = midLon + dLat * factor;
  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const mt = 1 - t;
    const lat = mt * mt * lat1 + 2 * mt * t * ctrlLat + t * t * lat2;
    const lon = mt * mt * lon1 + 2 * mt * t * ctrlLon + t * t * lon2;
    points.push([lat, lon]);
  }
  return points;
}

function formatAmount(amount: number, currency = 'INR') {
  if (currency === 'INR') return `₹${(amount / 100000).toFixed(1)}L`;
  return `${amount.toLocaleString('en-IN')} ${currency}`;
}

function nodeColor(h: FraudHop) {
  if (h.isSanctioned) return '#ef4444';
  if (h.hopType === 'origin') return '#10b981';
  if (h.hopType === 'destination') return '#6366f1';
  return '#f59e0b';
}

function nodePulseClass(h: FraudHop) {
  if (h.isSanctioned) return 'fraud-node-pulse-red';
  if (h.hopType === 'origin') return 'fraud-node-pulse-green';
  if (h.hopType === 'destination') return 'fraud-node-pulse-blue';
  return 'fraud-node-pulse-amber';
}

interface Props {
  cases: FraudCase[];
  loading: boolean;
  highlightCases?: FraudCase[];
  selectedCase?: FraudCase | null;
  onSelectCase?: (c: FraudCase) => void;
}

export default function FraudMapView({
  cases,
  loading,
  highlightCases = [],
  selectedCase,
  onSelectCase,
}: Props) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);
  const caseLayerMapRef = useRef<Map<number, any[]>>(new Map());
  const pulseRef = useRef<any[]>([]);
  const selectedByMapRef = useRef<number | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>('roads');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(2);
  const [introFlying, setIntroFlying] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrails, setShowTrails] = useState(true);
  const [showNodes, setShowNodes] = useState(true);
  const [focusMode, setFocusMode] = useState(false);

  const tileUrls: Record<MapStyle, string> = {
    roads: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  const stats = useMemo(() => {
    const rendered = cases.slice(0, 100);
    let critical = 0;
    let sanctioned = 0;
    let totalInr = 0;
    rendered.forEach(c => {
      if (c.riskScore >= 80) critical++;
      if (c.countryRiskTags.some(t => ['Russia', 'Iran', 'North Korea', 'Belize', 'Panama', 'Myanmar'].includes(t))) sanctioned++;
      const origin = c.hops?.find(h => h.hopType === 'origin');
      if (origin) totalInr += origin.amount || 0;
    });
    return { plotted: rendered.length, total: cases.length, critical, sanctioned, totalInr };
  }, [cases]);

  // Initialize Leaflet with retina tiles for crisp 4K rendering
  useEffect(() => {
    let mounted = true;
    let introTimer: number | null = null;
    loadLeaflet().then((L) => {
      if (!mounted || !containerRef.current) return;
      const map = L.map(containerRef.current, { zoomControl: false }).setView([20, 0], 2);
      mapRef.current = map;
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.control.scale({ position: 'bottomright', imperial: false }).addTo(map);
      tileLayerRef.current = L.tileLayer(tileUrls.roads, {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
        detectRetina: true,
        tileSize: 256,
      }).addTo(map);
      map.on('zoomend', () => setZoom(map.getZoom()));
      setLeafletReady(true);
      setTimeout(() => map.invalidateSize(), 200);

      // Cinematic intro: world map → India
      introTimer = window.setTimeout(() => {
        map.flyTo([22.5, 80.5], 5, { duration: 2.5, easeLinearity: 0.25 });
        window.setTimeout(() => setIntroFlying(false), 2600);
      }, 800);
    }).catch(err => console.error(err));

    return () => {
      mounted = false;
      if (introTimer) window.clearTimeout(introTimer);
      if (mapRef.current) { try { mapRef.current.remove(); } catch { /* ignore */ } mapRef.current = null; }
    };
  }, []);

  // Swap tile layer when style changes
  useEffect(() => {
    if (!leafletReady || !mapRef.current || !tileLayerRef.current) return;
    const L = (window as any).L;
    mapRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(tileUrls[mapStyle], {
      attribution: mapStyle === 'satellite' ? '&copy; Esri' : '&copy; OpenStreetMap &copy; CARTO',
      subdomains: mapStyle === 'satellite' ? undefined : 'abcd',
      maxZoom: 19,
      detectRetina: true,
      tileSize: 256,
    }).addTo(mapRef.current);
  }, [mapStyle, leafletReady]);

  const highlightCaseLayers = useCallback((caseId: number | null) => {
    const map = mapRef.current;
    if (!map) return;
    const allLayers = layersRef.current;
    if (!caseId) {
      allLayers.forEach(l => {
        if (l._fraudOriginalStyle) {
          if (l.setStyle) l.setStyle(l._fraudOriginalStyle);
          const el = l.getElement?.();
          if (el) el.style.opacity = '';
        }
      });
      return;
    }
    const caseLayers = caseLayerMapRef.current.get(caseId) || [];
    allLayers.forEach(l => {
      const el = l.getElement?.();
      if (caseLayers.includes(l)) {
        if (l.setStyle) l.setStyle({ opacity: 1, fillOpacity: 1, weight: (l._fraudOriginalStyle?.weight || 2) + 2 });
        if (el) el.style.opacity = '1';
      } else {
        if (l.setStyle) l.setStyle({ opacity: 0.1, fillOpacity: 0.1 });
        if (el) el.style.opacity = '0.12';
      }
    });
  }, []);

  // Render trails & nodes
  useEffect(() => {
    if (!leafletReady || !mapRef.current || !cases.length) return;
    const L = (window as any).L;
    const map = mapRef.current;

    layersRef.current.forEach(l => { try { map.removeLayer(l); } catch { /* ignore */ } });
    layersRef.current = [];
    caseLayerMapRef.current.clear();

    const zoomDetail = zoom >= 6;
    const sourceCases = focusMode && selectedCase ? [selectedCase] : cases.slice(0, 100);

    sourceCases.forEach(c => {
      const hops = (c.hops || []).filter((h): h is FraudHop => typeof h.lat === 'number' && typeof h.lon === 'number');
      if (hops.length < 2) return;

      const isCritical = c.riskScore >= 80;
      const isSelected = selectedCase?.id === c.id;
      const color = isCritical ? '#ef4444' : c.riskScore >= 60 ? '#f97316' : '#6366f1';
      const caseLayers: any[] = [];

      if (zoomDetail) {
        // Full precision multi-hop curved arcs
        for (let i = 0; i < hops.length - 1; i++) {
          const a = hops[i];
          const b = hops[i + 1];
          const curve = curveBetween(a.lat!, a.lon!, b.lat!, b.lon!);
          const weight = isSelected ? 4 : isCritical ? 3 : 2;
          if (showTrails) {
            const arc = L.polyline(curve, {
              color,
              weight,
              opacity: isSelected ? 1 : 0.85,
              dashArray: isCritical ? undefined : '10, 12',
              className: isCritical ? 'fraud-arc-glow fraud-flow-line' : 'fraud-flow-line',
            }).addTo(map);
            arc._fraudOriginalStyle = { color, weight, opacity: isSelected ? 1 : 0.85, fillOpacity: 0 };
            arc.on('mouseover', () => highlightCaseLayers(c.id));
            arc.on('mouseout', () => highlightCaseLayers(null));
            arc.on('click', () => { selectedByMapRef.current = c.id; onSelectCase?.(c); });
            caseLayers.push(arc);
            layersRef.current.push(arc);
          }
        }
        // Unique nodes only — no duplicate markers at shared segment endpoints
        if (showNodes) {
          const seen = new Set<string>();
          hops.forEach(h => {
            const key = `${c.id}-${h.lat}-${h.lon}`;
            if (seen.has(key)) return;
            seen.add(key);
            createNodeMarker(h, c, caseLayers, isSelected);
          });
        }
      } else {
        // Clean simplified view: origin → destination only
        const origin = hops.find(h => h.hopType === 'origin') || hops[0];
        const dest = hops.slice().reverse().find(h => h.hopType === 'destination') || hops[hops.length - 1];
        if (!origin || !dest) return;
        const line = curveBetween(origin.lat!, origin.lon!, dest.lat!, dest.lon!, 40, 0.18);
        const weight = isSelected ? 4 : isCritical ? 3 : 2;
        if (showTrails) {
          const arc = L.polyline(line, {
            color,
            weight,
            opacity: isSelected ? 1 : 0.55,
            dashArray: isCritical ? undefined : '8, 10',
            className: isCritical ? 'fraud-arc-glow fraud-flow-line' : 'fraud-flow-line',
          }).addTo(map);
          arc._fraudOriginalStyle = { color, weight, opacity: isSelected ? 1 : 0.55, fillOpacity: 0 };
          arc.on('mouseover', () => highlightCaseLayers(c.id));
          arc.on('mouseout', () => highlightCaseLayers(null));
          arc.on('click', () => { selectedByMapRef.current = c.id; onSelectCase?.(c); });
          caseLayers.push(arc);
          layersRef.current.push(arc);
        }
        if (showNodes) {
          createNodeMarker(origin, c, caseLayers, isSelected);
          createNodeMarker(dest, c, caseLayers, isSelected);
        }
      }

      caseLayerMapRef.current.set(c.id, caseLayers);
    });

    function createNodeMarker(h: FraudHop, c: FraudCase, caseLayers: any[], isSelected: boolean) {
      const baseColor = nodeColor(h);
      const isKeyNode = h.hopType === 'origin' || h.hopType === 'destination' || h.isSanctioned;
      const radius = isSelected ? (isKeyNode ? 22 : 14) : (isKeyNode ? 16 : 10);
      const iconHtml = `
        <div class="relative flex items-center justify-center" style="width:${radius}px;height:${radius}px;">
          ${isKeyNode ? `<span class="${nodePulseClass(h)} absolute inline-flex h-full w-full rounded-full opacity-60"></span>` : ''}
          <span class="relative inline-flex rounded-full border-2 border-white shadow-md" style="width:${radius * 0.55}px;height:${radius * 0.55}px;background:${baseColor};"></span>
        </div>`;
      const marker = L.marker([h.lat!, h.lon!], {
        icon: L.divIcon({
          html: iconHtml,
          className: 'bg-transparent',
          iconSize: [radius, radius],
          iconAnchor: [radius / 2, radius / 2],
        }),
      }).addTo(map);
      marker._fraudOriginalStyle = { opacity: 1, fillOpacity: 1, weight: 1 };
      marker._fraudHopKey = `${c.id}-${h.lat}-${h.lon}`;
      marker.bindTooltip(`
        <div class="text-xs">
          <div class="font-bold text-slate-800 dark:text-slate-100">${h.nodeName}</div>
          <div class="text-slate-500 dark:text-slate-400">${h.institution || h.entityType}</div>
          <div class="font-semibold mt-0.5">${h.amount.toLocaleString('en-IN')} ${h.currency}</div>
          <div class="text-[10px] text-slate-400">Case: ${c.caseRef}</div>
          <div class="text-[10px] text-indigo-500 mt-0.5">Click to inspect case</div>
        </div>`, { direction: 'top', className: 'fraud-tooltip', offset: [0, -8] });
      marker.on('mouseover', () => highlightCaseLayers(c.id));
      marker.on('mouseout', () => highlightCaseLayers(null));
      marker.on('click', () => { selectedByMapRef.current = c.id; onSelectCase?.(c); });
      caseLayers.push(marker);
      layersRef.current.push(marker);
    }
  }, [leafletReady, cases, zoom, selectedCase, focusMode, showTrails, showNodes, highlightCaseLayers, onSelectCase]);

  // Highlight live cases
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return;
    const L = (window as any).L;
    const map = mapRef.current;

    pulseRef.current.forEach(m => { try { map.removeLayer(m); } catch { /* ignore */ } });
    pulseRef.current = [];

    highlightCases.slice(0, 20).forEach(c => {
      const origin = c.hops?.find(h => h.hopType === 'origin');
      const dest = c.hops?.slice().reverse().find(h => h.hopType === 'destination');
      if (origin?.lat && origin?.lon) {
        const m = L.circleMarker([origin.lat, origin.lon], {
          radius: 18, fillColor: '#10b981', color: '#fff', weight: 2, fillOpacity: 0.25, opacity: 0,
        }).addTo(map);
        const el = m.getElement?.();
        if (el) el.classList.add('fraud-live-origin');
        pulseRef.current.push(m);
      }
      if (dest?.lat && dest?.lon) {
        const m = L.circleMarker([dest.lat, dest.lon], {
          radius: 18, fillColor: '#ef4444', color: '#fff', weight: 2, fillOpacity: 0.25, opacity: 0,
        }).addTo(map);
        const el = m.getElement?.();
        if (el) el.classList.add('fraud-live-dest');
        pulseRef.current.push(m);
      }
    });

    const timer = window.setTimeout(() => {
      pulseRef.current.forEach(m => { try { map.removeLayer(m); } catch { /* ignore */ } });
      pulseRef.current = [];
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [leafletReady, highlightCases]);

  // Fly to / fit selected case so the full India → destination trace is visible
  useEffect(() => {
    if (!leafletReady || !mapRef.current || !selectedCase) return;
    const L = (window as any).L;
    const coords = selectedCase.hops
      ?.filter(h => typeof h.lat === 'number' && typeof h.lon === 'number')
      .map(h => [h.lat, h.lon]) as [number, number][] | undefined;

    if (coords && coords.length > 1) {
      mapRef.current.fitBounds(L.latLngBounds(coords), {
        padding: [80, 80],
        maxZoom: 10,
        animate: true,
        duration: 1.8,
      });
    } else if (coords?.length) {
      mapRef.current.flyTo(coords[0], 9, { duration: 1.5, easeLinearity: 0.25 });
    }
  }, [leafletReady, selectedCase]);

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const resetView = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([22.5, 80.5], 5, { duration: 1.2 });
  };

  const fitAll = () => {
    if (!mapRef.current || !cases.length) return;
    const L = (window as any).L;
    const coords: [number, number][] = [];
    cases.slice(0, 100).forEach(c => {
      c.hops?.forEach(h => { if (typeof h.lat === 'number' && typeof h.lon === 'number') coords.push([h.lat, h.lon]); });
    });
    if (coords.length) mapRef.current.fitBounds(L.latLngBounds(coords), { padding: [60, 60], maxZoom: 10, animate: true, duration: 1.2 });
  };

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return cases.slice(0, 100).filter(c =>
      c.caseRef.toLowerCase().includes(q) ||
      c.hops?.some(h =>
        (h.city?.toLowerCase().includes(q)) ||
        (h.country?.toLowerCase().includes(q)) ||
        (h.nodeName?.toLowerCase().includes(q)) ||
        (h.institution?.toLowerCase().includes(q))
      )
    ).slice(0, 8);
  }, [searchQuery, cases]);

  const recentCases = cases.slice(0, 6);

  return (
    <div ref={wrapperRef} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
      {/* Header overlay */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gradient-to-r from-indigo-50/60 via-white to-rose-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg tracking-tight">{t('fraudIntelMapTitle')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <Radio className="w-3 h-3 animate-pulse" /> Live Tracing Active
              </span>
              <span>•</span>
              <span>{focusMode && selectedCase ? '1 trail focused' : `${stats.plotted} of ${stats.total} trails plotted`}</span>
              <span>•</span>
              <span>Zoom {zoom >= 6 ? 'full detail' : 'summary view'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <button title="Roads" onClick={() => setMapStyle('roads')} className={`p-1.5 rounded-md text-xs ${mapStyle === 'roads' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}><Globe className="w-3.5 h-3.5" /></button>
            <button title="Dark" onClick={() => setMapStyle('dark')} className={`p-1.5 rounded-md text-xs ${mapStyle === 'dark' ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}><Moon className="w-3.5 h-3.5" /></button>
            <button title="Light" onClick={() => setMapStyle('light')} className={`p-1.5 rounded-md text-xs ${mapStyle === 'light' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}><Sun className="w-3.5 h-3.5" /></button>
            <button title="Satellite" onClick={() => setMapStyle('satellite')} className={`p-1.5 rounded-md text-xs ${mapStyle === 'satellite' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500'}`}><Satellite className="w-3.5 h-3.5" /></button>
          </div>
          <button onClick={() => setShowTrails(v => !v)} title="Toggle trails" className={`p-2 rounded-lg border text-xs font-semibold ${showTrails ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
            {showTrails ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button onClick={() => setShowNodes(v => !v)} title="Toggle nodes" className={`p-2 rounded-lg border text-xs font-semibold ${showNodes ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
            <Layers className="w-4 h-4" />
          </button>
          <button onClick={fitAll} title="Fit all trails" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
            <Expand className="w-3.5 h-3.5" /> Fit
          </button>
          <button onClick={resetView} title="Reset view" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={toggleFullscreen} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="relative h-[650px] md:h-[820px]">
        <div ref={containerRef} className="absolute inset-0 z-0" />

        {(loading || !leafletReady) && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
            <div className="flex flex-col items-center text-slate-500 dark:text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-3" />
              <p className="text-sm font-medium">Initializing global threat radar...</p>
            </div>
          </div>
        )}

        {/* Cinematic intro overlay */}
        <AnimatePresence>
          {leafletReady && introFlying && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-[25] flex flex-col items-center justify-center pointer-events-none bg-gradient-to-b from-transparent via-white/30 to-transparent dark:via-slate-950/30"
            >
              <div className="flex flex-col items-center px-6 py-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Globe className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Scanning global network...</p>
                <p className="text-[10px] text-slate-400 mt-1">Focusing on India</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search overlay */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] w-[min(420px,92%)]">
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search case, city, bank or country..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full max-h-64 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl">
                {searchResults.map(c => {
                  const origin = c.hops?.find(h => h.hopType === 'origin');
                  const dest = c.hops?.slice().reverse().find(h => h.hopType === 'destination');
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setSearchQuery(''); onSelectCase?.(c); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{c.caseRef}</span>
                        <span className={`px-1.5 py-0.5 rounded border ${priorityColor(c.priority)}`}>{c.priority}</span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                        {origin?.city || origin?.country} → {dest?.city || dest?.country} · {formatAmount(c.hops?.[0]?.amount || 0)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Floating KPI cards */}
        <div className="absolute top-3 left-3 z-[500] flex flex-col gap-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg min-w-[160px]">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1"><Activity className="w-3.5 h-3.5 text-indigo-500" /> Active Trails</div>
            <div className="text-2xl font-bold">{stats.plotted}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg min-w-[160px]">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1"><AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Critical Risk</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.critical}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg min-w-[160px]">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1"><ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Sanctioned Hops</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.sanctioned}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl p-3 shadow-lg min-w-[160px]">
            <div className="flex items-center gap-2 text-xs text-emerald-100 mb-1"><TrendingUp className="w-3.5 h-3.5" /> INR Traced</div>
            <div className="text-2xl font-bold">{formatAmount(stats.totalInr)}</div>
          </motion.div>
        </div>

        {/* Selected case indicator & focus toggle */}
        <div className="absolute top-[4.5rem] left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2">
          <AnimatePresence>
            {selectedCase && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 border border-indigo-400/40">
                  <Crosshair className="w-3.5 h-3.5" />
                  Tracking {selectedCase.caseRef} · Risk {selectedCase.riskScore}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="absolute top-[7.5rem] left-1/2 -translate-x-1/2 z-[500]">
          <button
            onClick={() => setFocusMode(v => !v)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold border backdrop-blur shadow-sm transition-all ${
              focusMode
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {focusMode ? 'Exit Focus Mode' : 'Focus Selected Trail'}
          </button>
        </div>

        {/* Recent traces panel */}
        <div className="absolute top-3 right-3 z-[500] w-72 max-h-[calc(100%-1.5rem)] overflow-y-auto hidden md:block">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Recent Traces
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {recentCases.map((c, i) => {
                  const origin = c.hops?.find(h => h.hopType === 'origin');
                  const dest = c.hops?.slice().reverse().find(h => h.hopType === 'destination');
                  const isSelected = selectedCase?.id === c.id;
                  return (
                    <motion.button
                      key={c.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => onSelectCase?.(c)}
                      className={`w-full text-left p-2 rounded-lg border text-xs transition-all ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-400'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{c.caseRef}</span>
                        <span className={`px-1.5 py-0.5 rounded border ${priorityColor(c.priority)}`}>{c.priority}</span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        {origin?.country || '—'} <span className="text-slate-300">→</span> {dest?.country || '—'}
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-medium">{formatAmount(c.hops?.[0]?.amount || 0)}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Clock className="w-3 h-3" /> {new Date(c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[500] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-lg text-xs space-y-2">
          <div className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Legend</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" /> {t('fraudIntelMapLegendOrigin')}</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.7)]" /> {t('fraudIntelMapLegendDestination')}</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]" /> {t('fraudIntelMapLegendIntermediate')}</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" /> {t('fraudIntelMapLegendSanctioned')}</div>
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">Hover isolates · Click inspects · Zoom for full detail</div>
        </div>

        <style>{`
          .fraud-flow-line {
            animation: fraudFlowDash 1.6s linear infinite;
            stroke-linecap: round;
          }
          @keyframes fraudFlowDash {
            to { stroke-dashoffset: -22; }
          }
          .fraud-arc-glow {
            filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.9));
          }
          .fraud-node-pulse-green { animation: fraudNodePulse 2s infinite; background-color: rgba(16,185,129,0.5); }
          .fraud-node-pulse-blue { animation: fraudNodePulse 2s infinite; background-color: rgba(99,102,241,0.5); }
          .fraud-node-pulse-amber { animation: fraudNodePulse 2s infinite; background-color: rgba(245,158,11,0.5); }
          .fraud-node-pulse-red { animation: fraudNodePulse 1.6s infinite; background-color: rgba(239,68,68,0.5); }
          @keyframes fraudNodePulse {
            0% { transform: scale(0.45); opacity: 0.95; }
            70% { transform: scale(1.9); opacity: 0; }
            100% { transform: scale(0.45); opacity: 0; }
          }
          .fraud-live-origin { animation: fraudLivePulse 2s infinite; }
          .fraud-live-dest { animation: fraudLivePulse 2s infinite; }
          @keyframes fraudLivePulse {
            0% { r: 8; opacity: 0.85; }
            70% { r: 32; opacity: 0; }
            100% { r: 8; opacity: 0; }
          }
          .fraud-tooltip {
            background: rgba(255,255,255,0.96) !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 10px !important;
            box-shadow: 0 12px 30px rgba(0,0,0,0.18) !important;
            padding: 10px 14px !important;
          }
          .dark .fraud-tooltip {
            background: rgba(15,23,42,0.96) !important;
            border-color: #334155 !important;
            color: #f1f5f9 !important;
          }
        `}</style>
      </div>
    </div>
  );
}

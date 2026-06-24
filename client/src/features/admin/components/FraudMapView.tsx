import { useEffect, useRef, useState } from 'react';
import { Map as MapIcon, Loader2 } from 'lucide-react';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { FraudCase, FraudHop } from '@/features/admin/lib/fraudTypes';

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

interface Props {
  cases: FraudCase[];
  loading: boolean;
  highlightCases?: FraudCase[];
}

export default function FraudMapView({ cases, loading, highlightCases = [] }: Props) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);
  const pulseRef = useRef<any[]>([]);
  const [leafletReady, setLeafletReady] = useState(false);
  const darkMode = useWealthStore(s => s.darkMode);

  useEffect(() => {
    let mounted = true;
    loadLeaflet().then((L) => {
      if (!mounted || !containerRef.current) return;
      const map = L.map(containerRef.current).setView([20.5937, 78.9629], 4);
      mapRef.current = map;
      L.tileLayer(darkMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 19 }
      ).addTo(map);
      setLeafletReady(true);
      setTimeout(() => map.invalidateSize(), 200);
    }).catch(err => console.error(err));

    return () => {
      mounted = false;
      if (mapRef.current) { try { mapRef.current.remove(); } catch { /* ignore */ } mapRef.current = null; }
    };
  }, [darkMode]);

  useEffect(() => {
    if (!leafletReady || !mapRef.current || !cases.length) return;
    const L = (window as any).L;
    const map = mapRef.current;

    // clear previous layers
    layersRef.current.forEach(l => { try { map.removeLayer(l); } catch { /* ignore */ } });
    layersRef.current = [];

    const renderedCases = cases.slice(0, 100);

    renderedCases.forEach(c => {
      const hops = (c.hops || []).filter((h): h is FraudHop => typeof h.lat === 'number' && typeof h.lon === 'number');
      if (hops.length < 2) return;

      const isCritical = c.riskScore >= 80;
      const color = isCritical ? '#ef4444' : c.riskScore >= 60 ? '#f97316' : '#6366f1';
      const latlngs = hops.map(h => [h.lat, h.lon]);

      const polyline = L.polyline(latlngs, {
        color,
        weight: isCritical ? 3 : 2,
        opacity: 0.8,
        dashArray: isCritical ? undefined : '6, 6',
        className: 'fraud-hop-vector'
      }).addTo(map);
      layersRef.current.push(polyline);

      hops.forEach((h) => {
        const isOrigin = h.hopType === 'origin';
        const isDestination = h.hopType === 'destination';
        const marker = L.circleMarker([h.lat!, h.lon!], {
          radius: isOrigin || isDestination ? 6 : 4,
          fillColor: h.isSanctioned ? '#ef4444' : isOrigin ? '#10b981' : isDestination ? '#6366f1' : '#f59e0b',
          color: '#fff',
          weight: 1,
          fillOpacity: 0.9
        }).addTo(map);
        marker.bindTooltip(`<b>${h.nodeName}</b><br/>${h.institution || h.entityType}<br/>${h.amount.toLocaleString('en-IN')} ${h.currency}<br/>Case: ${c.caseRef}`, { direction: 'top' });
        layersRef.current.push(marker);
      });
    });

  }, [leafletReady, cases]);

  // Pulse animation for live/highlighted cases
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return;
    const L = (window as any).L;
    const map = mapRef.current;

    // clear old pulse markers
    pulseRef.current.forEach(m => { try { map.removeLayer(m); } catch { /* ignore */ } });
    pulseRef.current = [];

    highlightCases.slice(0, 20).forEach(c => {
      const origin = c.hops?.find(h => h.hopType === 'origin');
      const dest = c.hops?.slice().reverse().find(h => h.hopType === 'destination');
      if (origin?.lat && origin?.lon) {
        const m = L.circleMarker([origin.lat, origin.lon], {
          radius: 12, fillColor: '#10b981', color: '#fff', weight: 2, fillOpacity: 0.4, opacity: 0.8
        }).addTo(map);
        const el = m.getElement?.();
        if (el) {
          el.style.transition = 'r 1s ease-out, opacity 1s ease-out';
          el.style.animation = 'fraud-pulse 2s infinite';
        }
        pulseRef.current.push(m);
      }
      if (dest?.lat && dest?.lon) {
        const m = L.circleMarker([dest.lat, dest.lon], {
          radius: 12, fillColor: '#ef4444', color: '#fff', weight: 2, fillOpacity: 0.4, opacity: 0.8
        }).addTo(map);
        const el = m.getElement?.();
        if (el) {
          el.style.animation = 'fraud-pulse 2s infinite';
        }
        pulseRef.current.push(m);
      }
    });

    const timer = window.setTimeout(() => {
      pulseRef.current.forEach(m => { try { map.removeLayer(m); } catch { /* ignore */ } });
      pulseRef.current = [];
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [leafletReady, highlightCases]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-indigo-500" />
          {t('fraudIntelMapTitle')}
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {cases.length > 100 ? 'Showing top 100 cases' : `${cases.length} cases plotted`}
        </span>
      </div>
      <div className="relative h-[500px] md:h-[650px]">
        <div ref={containerRef} className="absolute inset-0 z-0" />
        {(loading || !leafletReady) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
            <div className="flex flex-col items-center text-slate-500 dark:text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm">Loading map...</p>
            </div>
          </div>
        )}
        <style>{`
          @keyframes fraud-pulse {
            0% { r: 6; opacity: 0.9; }
            70% { r: 24; opacity: 0; }
            100% { r: 6; opacity: 0; }
          }
        `}</style>
        <div className="absolute bottom-3 left-3 z-[500] bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg border border-slate-200 dark:border-slate-800 p-2 text-xs space-y-1">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /> {t('fraudIntelMapLegendOrigin')}</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500" /> {t('fraudIntelMapLegendDestination')}</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500" /> {t('fraudIntelMapLegendIntermediate')}</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /> {t('fraudIntelMapLegendSanctioned')}</div>
        </div>
      </div>
    </div>
  );
}

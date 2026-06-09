import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PerfSnapshot {
  dns: number | null;
  connection: number | null;
  ttfb: number | null;
  domContentLoaded: number | null;
  fullLoad: number | null;
  firstPaint: number | null;
  firstContentfulPaint: number | null;
  usedJSHeapSize: number | null;
  totalJSHeapSize: number | null;
  jsHeapSizeLimit: number | null;
}

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return 'N/A';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatMs(ms: number | null): string {
  if (ms === null || ms === undefined) return 'N/A';
  return `${ms.toFixed(1)} ms`;
}

export default function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerfSnapshot | null>(null);
  const [supported, setSupported] = useState(true);

  const captureMetrics = useCallback(() => {
    if (typeof performance === 'undefined') {
      setSupported(false);
      return;
    }

    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const paintEntries = performance.getEntriesByType('paint');

    let fp: number | null = null;
    let fcp: number | null = null;

    for (const entry of paintEntries) {
      if (entry.name === 'first-paint') {
        fp = entry.startTime;
      } else if (entry.name === 'first-contentful-paint') {
        fcp = entry.startTime;
      }
    }

    const mem = (performance as unknown as Record<string, unknown>).memory as
      | { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number }
      | undefined;

    if (!nav) {
      setSupported(false);
      return;
    }

    setMetrics({
      dns: nav.domainLookupEnd - nav.domainLookupStart,
      connection: nav.connectEnd - nav.connectStart,
      ttfb: nav.responseStart - nav.startTime,
      domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
      fullLoad: nav.loadEventEnd - nav.startTime,
      firstPaint: fp,
      firstContentfulPaint: fcp,
      usedJSHeapSize: mem?.usedJSHeapSize ?? null,
      totalJSHeapSize: mem?.totalJSHeapSize ?? null,
      jsHeapSizeLimit: mem?.jsHeapSizeLimit ?? null,
    });
  }, []);

  useEffect(() => {
    // Defer capture to ensure navigation timing is complete
    const timer = setTimeout(captureMetrics, 500);
    return () => clearTimeout(timer);
  }, [captureMetrics]);

  if (!supported) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="card"
      >
        <h3 className="section-title mb-4 flex items-center gap-2">
          <i className="fas fa-gauge-high text-sky-500" /> Performance Metrics
        </h3>
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
            <i className="fas fa-circle-info mr-1.5" />
            Performance Navigation Timing API is not supported in this browser.
          </p>
        </div>
      </motion.div>
    );
  }

  const items = metrics
    ? [
        { label: 'DNS Lookup', value: formatMs(metrics.dns), icon: 'fa-globe', color: 'sky' },
        { label: 'Connection', value: formatMs(metrics.connection), icon: 'fa-link', color: 'emerald' },
        { label: 'TTFB', value: formatMs(metrics.ttfb), icon: 'fa-server', color: 'violet' },
        { label: 'DOM Content Loaded', value: formatMs(metrics.domContentLoaded), icon: 'fa-code', color: 'amber' },
        { label: 'Full Page Load', value: formatMs(metrics.fullLoad), icon: 'fa-spinner', color: 'rose' },
        { label: 'First Paint', value: formatMs(metrics.firstPaint), icon: 'fa-paintbrush', color: 'cyan' },
        { label: 'First Contentful Paint', value: formatMs(metrics.firstContentfulPaint), icon: 'fa-image', color: 'pink' },
        { label: 'Used JS Heap', value: formatBytes(metrics.usedJSHeapSize), icon: 'fa-memory', color: 'orange' },
        { label: 'Total JS Heap', value: formatBytes(metrics.totalJSHeapSize), icon: 'fa-microchip', color: 'teal' },
        { label: 'JS Heap Limit', value: formatBytes(metrics.jsHeapSizeLimit), icon: 'fa-database', color: 'primary' },
      ]
    : [];

  const colorMap: Record<string, { bg: string; text: string }> = {
    sky: { bg: 'bg-sky-500/10', text: 'text-sky-500' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-500' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-500' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
    pink: { bg: 'bg-pink-500/10', text: 'text-pink-500' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-500' },
    teal: { bg: 'bg-teal-500/10', text: 'text-teal-500' },
    primary: { bg: 'bg-primary/10', text: 'text-primary' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.55 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="section-title flex items-center gap-2">
            <i className="fas fa-gauge-high text-sky-500" /> Performance Metrics
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real browser performance data via the Performance API
          </p>
        </div>
        <button
          onClick={captureMetrics}
          className="text-[10px] px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5"
        >
          <i className="fas fa-rotate-right" /> Refresh
        </button>
      </div>

      {metrics ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {items.map((item) => {
            const styles = colorMap[item.color] || colorMap.primary;
            return (
              <motion.div
                key={item.label}
                className="card-stat text-center"
                whileHover={{ y: -2 }}
              >
                <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-2 ${styles.bg}`}>
                  <i className={`fas ${item.icon} text-xs ${styles.text}`} />
                </div>
                <p className="text-base font-bold text-slate-800 dark:text-white">{item.value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.label}</p>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <i className="fas fa-spinner fa-spin text-primary text-xl mr-3" />
          <span className="text-sm text-slate-500 dark:text-slate-400">Capturing metrics…</span>
        </div>
      )}
    </motion.div>
  );
}

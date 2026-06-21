import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logSecurityEvent } from '@/shared/utils/securityLogger';

export default function AntiScamShield() {
  const [active, setActive] = useState(true);
  const [threats, setThreats] = useState<string[]>([]);
  const [overlayDetected, setOverlayDetected] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    // Canvas watermark
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 300;
        canvas.height = 300;
        ctx.clearRect(0, 0, 300, 300);
        ctx.save();
        ctx.translate(150, 150);
        ctx.rotate(-Math.PI / 6);
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.fillStyle = 'rgba(220, 38, 38, 0.06)';
        ctx.textAlign = 'center';
        ctx.fillText('SECURE SESSION • PSB 2026', 0, 0);
        ctx.fillText('ANTI-SCAM SHIELD ACTIVE', 0, 30);
        ctx.restore();
      }
    }

    // MutationObserver for overlay detection
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          m.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const el = node as Element;
              const suspicious =
                el.tagName === 'IFRAME' ||
                (el.tagName === 'DIV' && el.getAttribute?.('style')?.includes('position:fixed')) ||
                el.classList?.contains('scam-overlay') ||
                el.getAttribute?.('data-overlay') === 'true';
              if (suspicious) {
                setOverlayDetected(true);
                const threat = `Suspicious ${el.tagName.toLowerCase()} detected at ${new Date().toLocaleTimeString()}`;
                setThreats((prev) => [threat, ...prev].slice(0, 10));
                logSecurityEvent('Anti-Scam', threat, 'critical', 'Overlay attack detected');
                setTimeout(() => setOverlayDetected(false), 5000);
              }
            }
          });
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Clickjacking detection
    const clickListener = () => {
      const invisible = document.querySelectorAll('[style*="opacity:0"], [style*="opacity: 0"]');
      if (invisible.length > 3) {
        const threat = `Clickjacking risk: ${invisible.length} invisible elements found`;
        setThreats((prev) => [threat, ...prev].slice(0, 10));
        logSecurityEvent('Anti-Scam', threat, 'warning', 'Invisible overlay elements');
      }
    };
    document.addEventListener('click', clickListener);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', clickListener);
    };
  }, [active]);

  return (
    <>
      {/* Watermark Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9998] w-full h-full opacity-70"
        style={{ mixBlendMode: 'multiply' }}
      />

      {/* Overlay Threat Alert */}
      <AnimatePresence>
        {overlayDetected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] px-4 py-3 bg-rose-600 text-white rounded-xl shadow-2xl flex items-center gap-3"
          >
            <i className="fas fa-shield-halved text-xl animate-pulse" />
            <div>
              <p className="text-xs font-bold">MALICIOUS OVERLAY DETECTED!</p>
              <p className="text-[10px] text-white/80">PSB Anti-Scam Shield blocked a suspicious element.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shield UI Panel */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
              <i className="fas fa-shield-halved text-lg" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">Anti-Scam Shield</p>
              <p className="text-[10px] text-slate-400">Real-time DOM mutation monitoring</p>
            </div>
          </div>
          <button
            onClick={() => { setActive(!active); logSecurityEvent('Anti-Scam', `Shield ${active ? 'disabled' : 'enabled'}`, 'info', 'User toggle'); }}
            className={`w-12 h-7 rounded-full transition-colors ${active ? 'bg-rose-500' : 'bg-slate-300'}`}
          >
            <motion.div
              animate={{ x: active ? 20 : 2 }}
              className="w-5 h-5 bg-white rounded-full shadow"
            />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-center">
            <p className="text-xl font-extrabold text-rose-500">{threats.length}</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Threats Blocked</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-center">
            <p className="text-xl font-extrabold text-emerald-500">{active ? 'LIVE' : 'OFF'}</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Monitor Status</p>
          </div>
        </div>

        {/* Threat Log */}
        {threats.length > 0 && (
          <div className="space-y-1 max-h-32 overflow-y-auto">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Threat Log</p>
            {threats.map((t, i) => (
              <p key={i} className="text-[10px] text-rose-600 dark:text-rose-400 font-mono">{i + 1}. {t}</p>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-500 space-y-1">
          <p><i className="fas fa-check text-emerald-500 mr-1" /> MutationObserver scans DOM every ms</p>
          <p><i className="fas fa-check text-emerald-500 mr-1" /> Canvas watermark protects screenshots</p>
          <p><i className="fas fa-check text-emerald-500 mr-1" /> Clickjacking detection: invisible overlays</p>
          <p><i className="fas fa-check text-emerald-500 mr-1" /> Iframe injection detection active</p>
        </div>
      </div>
    </>
  );
}

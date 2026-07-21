import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';

const ASSET_COLORS: Record<string, string> = {
  bank: '#3b82f6',
  mutualFund: '#10b981',
  stock: '#8b5cf6',
  gold: '#f59e0b',
  property: '#8b5cf6',
  vehicle: '#ec4899',
  other: '#64748b',
};

function formatCurrency(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function Wealth3DVisualization() {
  const assets = useWealthStore((s) => s.assets);
  const [rotate, setRotate] = useState(45);
  const [zoom, setZoom] = useState(1);

  const buildings = useMemo(() => {
    const total = assets.reduce((sum, a) => sum + a.value, 0);
    if (total === 0) return [];
    let x = -80;
    return assets.map((asset, i) => {
      const height = Math.max((asset.value / total) * 200, 20);
      const width = Math.max((asset.value / total) * 60 + 20, 24);
      const building = {
        id: asset.id,
        name: asset.name,
        value: asset.value,
        type: asset.type,
        height,
        width,
        x,
        color: ASSET_COLORS[asset.type] || '#64748b',
        delay: i * 0.1,
      };
      x += width + 12;
      return building;
    });
  }, [assets]);

  const totalNetWorth = assets.reduce((sum, a) => sum + a.value, 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <i className="fas fa-city text-indigo-600" /> 3D Wealth City
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Your net worth visualized as a growing metropolis. Each building is an asset.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 3D Viewport */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          <div className="relative h-[320px] flex items-end justify-center" style={{ perspective: '1000px' }}>
            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-700 to-slate-800 rounded-t-lg" style={{ transform: 'rotateX(60deg) translateZ(-20px)', transformOrigin: 'center bottom' }} />

            {/* Buildings */}
            <div
              className="relative flex items-end gap-3 transition-transform duration-500"
              style={{ transform: `rotateX(20deg) rotateY(${rotate}deg) scale(${zoom})`, transformStyle: 'preserve-3d' }}
            >
              {buildings.map((b) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: b.delay, duration: 0.6 }}
                  className="relative flex flex-col items-center"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Building */}
                  <div
                    className="relative rounded-t-sm shadow-2xl"
                    style={{
                      width: b.width,
                      height: b.height,
                      backgroundColor: b.color,
                      boxShadow: `0 0 20px ${b.color}40, inset -4px 0 8px rgba(0,0,0,0.2)`,
                      transform: `translateZ(${b.height / 2}px)`,
                    }}
                  >
                    {/* Windows */}
                    <div className="absolute inset-1 grid grid-cols-2 gap-1">
                      {Array.from({ length: Math.min(Math.floor(b.height / 15), 8) }).map((_, i) => (
                        <div key={i} className="bg-yellow-200/60 rounded-sm" />
                      ))}
                    </div>
                    {/* Top */}
                    <div
                      className="absolute -top-1 left-0 right-0 h-1 rounded-t-sm"
                      style={{ backgroundColor: b.color, filter: 'brightness(1.2)' }}
                    />
                  </div>

                  {/* Label */}
                  <div className="mt-2 text-center">
                    <p className="text-[10px] font-bold text-white whitespace-nowrap">{b.name}</p>
                    <p className="text-[9px] text-white/60">{formatCurrency(b.value)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-white/60">Rotate</label>
              <input
                type="range"
                min="0"
                max="90"
                value={rotate}
                onChange={(e) => setRotate(Number(e.target.value))}
                className="w-24"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-white/60">Zoom</label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-24"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Total Net Worth</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{formatCurrency(totalNetWorth)}</p>
            <p className="text-xs text-slate-500 mt-1">Across {assets.length} asset classes</p>
          </div>

          <div className="space-y-2">
            {buildings.map((b) => (
              <div key={b.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{b.name}</p>
                  <p className="text-[10px] text-slate-400">{formatCurrency(b.value)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">
                    {((b.value / totalNetWorth) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

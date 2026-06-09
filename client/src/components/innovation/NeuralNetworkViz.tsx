import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Neuron {
  x: number;
  y: number;
  layer: number;
  active: boolean;
  pulse: number;
}

interface Signal {
  from: number;
  to: number;
  progress: number;
  speed: number;
}

const LAYER_CONFIG = [6, 8, 10, 8, 6];
const LAYER_LABELS = ['Input', 'Pattern', 'Analysis', 'Decision', 'Output'];
const LAYER_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

function generateNeurons(): Neuron[] {
  const neurons: Neuron[] = [];
  LAYER_CONFIG.forEach((count, layerIdx) => {
    for (let i = 0; i < count; i++) {
      neurons.push({
        x: layerIdx,
        y: i,
        layer: layerIdx,
        active: Math.random() > 0.7,
        pulse: Math.random() * Math.PI * 2,
      });
    }
  });
  return neurons;
}

function generateSignals(_neurons: Neuron[]): Signal[] {
  const signals: Signal[] = [];
  for (let layer = 0; layer < LAYER_CONFIG.length - 1; layer++) {
    const fromStart = LAYER_CONFIG.slice(0, layer).reduce((a, b) => a + b, 0);
    const toStart = LAYER_CONFIG.slice(0, layer + 1).reduce((a, b) => a + b, 0);
    for (let i = 0; i < LAYER_CONFIG[layer]; i++) {
      for (let j = 0; j < Math.min(3, LAYER_CONFIG[layer + 1]); j++) {
        if (Math.random() > 0.6) {
          signals.push({
            from: fromStart + i,
            to: toStart + Math.floor(Math.random() * LAYER_CONFIG[layer + 1]),
            progress: Math.random(),
            speed: 0.005 + Math.random() * 0.01,
          });
        }
      }
    }
  }
  return signals;
}

export default function NeuralNetworkViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeNeurons, setActiveNeurons] = useState(0);
  const [signalCount, setSignalCount] = useState(0);
  const neuronsRef = useRef<Neuron[]>(generateNeurons());
  const signalsRef = useRef<Signal[]>(generateSignals(neuronsRef.current));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const neurons = neuronsRef.current;
    const signals = signalsRef.current;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    const getPos = (n: Neuron) => {
      const paddingX = canvas.width * 0.12;
      const paddingY = canvas.height * 0.1;
      const availW = canvas.width - paddingX * 2;
      const availH = canvas.height - paddingY * 2;
      const x = paddingX + (n.x / (LAYER_CONFIG.length - 1)) * availW;
      const layerCount = LAYER_CONFIG[n.layer];
      const spacing = availH / (layerCount + 1);
      const y = paddingY + (n.y + 1) * spacing;
      return { x, y };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      signals.forEach((sig) => {
        const fromN = neurons[sig.from];
        const toN = neurons[sig.to];
        const p1 = getPos(fromN);
        const p2 = getPos(toN);

        sig.progress += sig.speed;
        if (sig.progress > 1) sig.progress = 0;

        const cx = p1.x + (p2.x - p1.x) * sig.progress;
        const cy = p1.y + (p2.y - p1.y) * sig.progress;

        // Connection line
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(100,116,139,0.08)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Signal pulse
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fillStyle = LAYER_COLORS[fromN.layer];
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw neurons
      let active = 0;
      neurons.forEach((n) => {
        n.pulse += 0.03;
        const pos = getPos(n);
        const isActive = n.active || Math.sin(n.pulse) > 0.6;
        if (isActive) active++;

        const radius = isActive ? 5 : 3.5;
        const glow = isActive ? Math.sin(n.pulse) * 8 + 8 : 0;

        if (glow > 0) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius + glow, 0, Math.PI * 2);
          ctx.fillStyle = LAYER_COLORS[n.layer];
          ctx.globalAlpha = 0.1;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? LAYER_COLORS[n.layer] : `${LAYER_COLORS[n.layer]}40`;
        ctx.fill();

        if (isActive) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius - 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
        }
      });

      setActiveNeurons(active);
      setSignalCount(signals.length);
      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Neurons Active', value: activeNeurons, icon: 'fa-circle-nodes', color: 'bg-violet-50 text-violet-600' },
          { label: 'Signals/sec', value: signalCount * 60, icon: 'fa-bolt', color: 'bg-amber-50 text-amber-600' },
          { label: 'Layers Deep', value: '5', icon: 'fa-layer-group', color: 'bg-blue-50 text-blue-600' },
          { label: 'Confidence', value: '94.2%', icon: 'fa-brain', color: 'bg-pink-50 text-pink-600' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="card-psb flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
              <i className={`fas ${stat.icon}`} />
            </div>
            <div>
              <p className="text-lg font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-[10px] text-gray-500 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card-psb overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-brain text-pink-600" /> BHAVISHYA Neural Core
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Real-time visualization of the AI analyzing your financial signals — watch it think
            </p>
          </div>
        </div>

        <div className="relative h-[400px] bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          
          {/* Layer Labels */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-around px-4">
            {LAYER_LABELS.map((label, idx) => (
              <div key={label} className="text-center">
                <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: LAYER_COLORS[idx] }} />
                <p className="text-[9px] text-gray-400">{label}</p>
                <p className="text-[8px] text-gray-600">{LAYER_CONFIG[idx]} nodes</p>
              </div>
            ))}
          </div>

          {/* Top info bar */}
          <div className="absolute top-3 left-3 right-3 flex justify-between">
            <div className="px-2 py-1 bg-black/30 backdrop-blur-sm rounded-lg text-[9px] text-gray-300">
              <i className="fas fa-microchip mr-1 text-green-400" /> Processing: Live
            </div>
            <div className="px-2 py-1 bg-black/30 backdrop-blur-sm rounded-lg text-[9px] text-gray-300">
              <i className="fas fa-satellite-dish mr-1 text-amber-400" /> Signals: 174
            </div>
          </div>
        </div>

        {/* Signal Feed */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Input Layer', signals: ['Transaction history', 'Market data', 'Biometric data', 'Social signals', 'Macro trends', 'Emotional state'], color: '#3B82F6' },
            { label: 'Hidden Layers', signals: ['Pattern recognition', 'Anomaly detection', 'Correlation analysis', 'Trend forecasting', 'Risk modeling', 'Behavioral prediction'], color: '#EC4899' },
            { label: 'Output Layer', signals: ['Life event alerts', 'Crisis warnings', 'Market timing', 'Auto-instruments', 'Wealth projection', 'Emotional coaching'], color: '#10B981' },
          ].map((layer, idx) => (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-3 rounded-xl border border-gray-100 bg-gray-50/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }} />
                <p className="text-[11px] font-bold text-gray-800">{layer.label}</p>
              </div>
              <div className="space-y-1">
                {layer.signals.map((sig, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <i className="fas fa-chevron-right text-[6px]" style={{ color: layer.color }} />
                    {sig}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

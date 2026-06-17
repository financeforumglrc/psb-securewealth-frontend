import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, CheckCircle } from 'lucide-react';

function sha256Like(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const chr = input.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0').repeat(2).slice(0, 64);
}

interface Block {
  id: number;
  ref: string;
  timestamp: string;
  hash: string;
  prev: string;
}

export default function BlockchainAudit({ referenceId, action }: { referenceId?: string; action?: string }) {
  const [chain, setChain] = useState<Block[]>([]);

  useEffect(() => {
    if (!referenceId) return;
    const ts = new Date().toLocaleTimeString();
    const prev = chain.length ? chain[chain.length - 1].hash : '0'.repeat(64);
    const payload = `${referenceId}:${action}:${ts}:${prev}`;
    const hash = sha256Like(payload);
    setChain((c) => [...c.slice(-4), { id: Date.now(), ref: referenceId, timestamp: ts, hash, prev }]);
  }, [referenceId, action]);

  if (!chain.length) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-sm">
        Run a protection check to see an immutable audit block being forged.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
        <Link2 className="w-4 h-4" /> Immutable Audit Chain
      </h4>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        <AnimatePresence>
          {chain.map((block, idx) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, x: 30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: idx * 0.1 }}
              className="flex-shrink-0 w-56 p-4 rounded-xl bg-slate-900/60 border border-slate-700 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <CheckCircle className="w-16 h-16 text-emerald-500" />
              </div>
              <p className="text-[10px] text-slate-500 mb-1">Block #{idx + 1}</p>
              <p className="text-xs font-mono text-cyan-400 truncate">{block.ref}</p>
              <p className="text-[10px] text-slate-500 mt-2">Timestamp</p>
              <p className="text-[10px] text-slate-300">{block.timestamp}</p>
              <p className="text-[10px] text-slate-500 mt-2">Hash</p>
              <p className="text-[9px] font-mono text-emerald-400 truncate">{block.hash}</p>
              {idx > 0 && (
                <>
                  <p className="text-[10px] text-slate-500 mt-2">Prev Hash</p>
                  <p className="text-[9px] font-mono text-slate-600 truncate">{block.prev}</p>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

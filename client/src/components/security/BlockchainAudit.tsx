import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChain, verifyChainIntegrity, getChainStats, type Block } from '../../services/blockchainService';

export default function BlockchainAudit() {
  const [chain, setChain] = useState<Block[]>([]);
  const [verified, setVerified] = useState<{ valid: boolean; brokenAt?: number } | null>(null);
  const [stats, setStats] = useState({ totalBlocks: 0, firstBlock: null as string | null, lastBlock: null as string | null });
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  const refresh = useCallback(() => {
    setChain(getChain());
    setStats(getChainStats());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleVerify = async () => {
    const result = await verifyChainIntegrity();
    setVerified(result);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500">
            <i className="fas fa-cubes" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Blockchain Audit Trail</h3>
            <p className="text-[10px] text-slate-400">SHA-256 immutable transaction logs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleVerify}
            className="px-3 py-1.5 bg-orange-500/10 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-500/20 transition-colors"
          >
            <i className="fas fa-shield-halved mr-1" /> Verify Chain
          </button>
          <button
            onClick={refresh}
            className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <i className="fas fa-rotate" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
          <p className="text-lg font-bold text-slate-800 dark:text-white">{stats.totalBlocks}</p>
          <p className="text-[10px] text-slate-400">Blocks</p>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
          <p className="text-lg font-bold text-slate-800 dark:text-white">{stats.totalBlocks > 0 ? new Date(stats.firstBlock || '').toLocaleDateString() : '—'}</p>
          <p className="text-[10px] text-slate-400">First Block</p>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
          <p className="text-lg font-bold text-slate-800 dark:text-white">{stats.totalBlocks > 0 ? new Date(stats.lastBlock || '').toLocaleDateString() : '—'}</p>
          <p className="text-[10px] text-slate-400">Last Block</p>
        </div>
      </div>

      {/* Verification Result */}
      <AnimatePresence>
        {verified && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className={`p-3 rounded-xl border ${
              verified.valid
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
            }`}>
              <p className={`text-sm font-bold ${verified.valid ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                <i className={`fas ${verified.valid ? 'fa-check-circle' : 'fa-triangle-exclamation'} mr-1`} />
                {verified.valid ? 'Chain integrity verified — all hashes match' : `Chain broken at block #${verified.brokenAt}`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chain List */}
      {chain.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <i className="fas fa-cube text-3xl mb-2 opacity-30" />
          <p className="text-sm">No blocks yet. Make a transaction to create the genesis block.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {chain.slice().reverse().map((block) => (
            <button
              key={block.index}
              onClick={() => setSelectedBlock(selectedBlock?.index === block.index ? null : block)}
              className="w-full text-left p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/10 text-orange-600 rounded font-bold">#{block.index}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{block.txId}</span>
                </div>
                <i className={`fas fa-chevron-${selectedBlock?.index === block.index ? 'up' : 'down'} text-slate-400 text-xs`} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{new Date(block.timestamp).toLocaleString()}</p>

              <AnimatePresence>
                {selectedBlock?.index === block.index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 overflow-hidden"
                  >
                    <div className="space-y-1.5 text-[10px] font-mono">
                      <p className="text-slate-500">
                        <span className="text-slate-400">Previous Hash:</span>{' '}
                        <span className="break-all text-orange-500">{block.previousHash.slice(0, 32)}...</span>
                      </p>
                      <p className="text-slate-500">
                        <span className="text-slate-400">Block Hash:</span>{' '}
                        <span className="break-all text-emerald-500">{block.hash.slice(0, 32)}...</span>
                      </p>
                      <p className="text-slate-500">
                        <span className="text-slate-400">Data:</span>{' '}
                        <span className="break-all text-slate-600 dark:text-slate-300">{block.txData.slice(0, 100)}...</span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

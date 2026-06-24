import { useTranslation } from '@/shared/hooks/useTranslation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

interface Qubit {
  id: number;
  state: '0' | '1' | 'superposition';
  entangled: boolean;
}

const ENCRYPTION_STEPS = [
  { step: 1, name: 'Key Generation', detail: '256-bit quantum random key generated', status: 'complete', icon: 'fa-key' },
  { step: 2, name: 'Qubit Allocation', detail: 'Qubits placed in superposition states', status: 'complete', icon: 'fa-atom' },
  { step: 3, name: 'Entanglement', detail: 'Financial data entangled with key qubits', status: 'complete', icon: 'fa-link' },
  { step: 4, name: 'Quantum Channel', detail: 'Data transmitted via quantum-secure channel', status: 'active', icon: 'fa-satellite-dish' },
  { step: 5, name: 'Decoherence Check', detail: 'Eavesdropper detection via state collapse', status: 'pending', icon: 'fa-shield-halved' },
  { step: 6, name: 'Vault Seal', detail: 'Post-quantum lattice encryption applied', status: 'pending', icon: 'fa-lock' },
];

export default function QuantumLock() {
  const { t } = useTranslation();
  const [qubits, setQubits] = useState<Qubit[]>([]);
  const [lockStatus, setLockStatus] = useState<'unlocked' | 'locking' | 'locked'>('unlocked');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const initial: Qubit[] = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      state: 'superposition',
      entangled: false,
    }));
    setQubits(initial);
  }, []);

  const startLock = () => {
    if (lockStatus !== 'unlocked') return;
    setLockStatus('locking');
    setProgress(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgress(step * (100 / 6));
      
      setQubits(prev => prev.map((q, i) => ({
        ...q,
        state: Math.random() > 0.5 ? '0' : '1',
        entangled: i < step * 3,
      })));

      if (step >= 6) {
        clearInterval(interval);
        setLockStatus('locked');
        setQubits(prev => prev.map(q => ({ ...q, entangled: true })));
      }
    }, 800);
  };

  const resetLock = () => {
    setLockStatus('unlocked');
    setProgress(0);
    setQubits(prev => prev.map(q => ({ ...q, state: 'superposition', entangled: false })));
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('quantumQubits'), value: '16', icon: 'fa-atom', color: 'bg-blue-50 text-blue-600' },
          { label: t('quantumEntropy'), value: '99.9%', icon: 'fa-shuffle', color: 'bg-violet-50 text-violet-600' },
          { label: t('quantumEncryption'), value: 'PQ-Lattice', icon: 'fa-lock', color: 'bg-green-50 text-green-600' },
          { label: t('quantumThreat'), value: '0', icon: 'fa-shield-halved', color: 'bg-rose-50 text-rose-600' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="card-psb flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
              <i className={`fas ${stat.icon}`} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-[10px] text-gray-500 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card-psb">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-atom text-blue-600" aria-hidden="true" /> {t('quantumTitle')}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {t('quantumSubtitle')}
            </p>
          </div>
        </div>

        {/* Qubit Grid */}
        <div className="p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl mb-4">
          <div className="grid grid-cols-4 gap-3 mb-3">
            {qubits.map((qubit) => (
              <motion.div
                key={qubit.id}
                animate={prefersReducedMotion ? false : {
                  scale: qubit.entangled ? [1, 1.1, 1] : 1,
                  rotate: qubit.state === 'superposition' ? [0, 180, 360] : 0,
                }}
                transition={prefersReducedMotion ? undefined : { duration: 2, repeat: qubit.entangled ? Infinity : 0 }}
                className={`aspect-square rounded-lg flex items-center justify-center text-lg font-bold ${
                  qubit.state === 'superposition' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' :
                  qubit.state === '0' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                  'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {qubit.state === 'superposition' ? '?' : qubit.state}
                {qubit.entangled && (
                  <div className={`absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full ${prefersReducedMotion ? '' : 'animate-pulse'}`} aria-label="Entangled" />
                )}
              </motion.div>
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span><i className="fas fa-circle text-violet-400 mr-1 text-[6px]" aria-hidden="true" /> {t('quantumSuperposition')}</span>
            <span><i className="fas fa-circle text-blue-400 mr-1 text-[6px]" aria-hidden="true" /> {t('quantumState0')}</span>
            <span><i className="fas fa-circle text-rose-400 mr-1 text-[6px]" aria-hidden="true" /> {t('quantumState1')}</span>
            <span><i className="fas fa-circle text-green-400 mr-1 text-[6px]" aria-hidden="true" /> {t('quantumEntangled')}</span>
          </div>
        </div>

        {/* Lock Control */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={startLock}
            disabled={lockStatus !== 'unlocked'}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              lockStatus === 'locked'
                ? 'bg-green-100 text-green-700 cursor-default'
                : lockStatus === 'locking'
                ? 'bg-amber-100 text-amber-700 cursor-wait'
                : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'
            }`}
          >
            <i className={`fas fa-${lockStatus === 'locked' ? 'check-circle' : lockStatus === 'locking' ? 'spinner fa-spin' : 'lock'} mr-2`} aria-hidden="true" />
            {lockStatus === 'locked' ? t('quantumSecured') : lockStatus === 'locking' ? t('quantumEncrypting') : t('quantumActivate')}
          </button>
          {lockStatus === 'locked' && (
            <button
              onClick={resetLock}
              className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-rotate-left mr-1" aria-hidden="true" /> {t('quantumReset')}
            </button>
          )}
        </div>

        {/* Progress */}
        {lockStatus !== 'unlocked' && (
          <div className="mb-4">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-green-500"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 text-right">{Math.round(progress)}% {t('quantumEncrypted')}</p>
          </div>
        )}

        {/* Encryption Steps */}
        <div className="space-y-2">
          {ENCRYPTION_STEPS.map((step, idx) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                step.status === 'complete' ? 'bg-green-50/50 border border-green-100' :
                step.status === 'active' ? 'bg-amber-50/50 border border-amber-100' :
                'bg-gray-50/50 border border-gray-100'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                step.status === 'complete' ? 'bg-green-100 text-green-600' :
                step.status === 'active' ? 'bg-amber-100 text-amber-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                <i className={`fas ${step.status === 'complete' ? 'fa-check' : step.status === 'active' ? 'fa-spinner fa-spin' : step.icon}`} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className={`text-[11px] font-bold ${
                  step.status === 'complete' ? 'text-green-700' :
                  step.status === 'active' ? 'text-amber-700' :
                  'text-gray-400'
                }`}>{step.name}</p>
                <p className="text-[10px] text-gray-500">{step.detail}</p>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                step.status === 'complete' ? 'bg-green-100 text-green-700' :
                step.status === 'active' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-400'
              }`}>
                {step.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

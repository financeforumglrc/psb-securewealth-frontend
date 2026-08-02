import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, XCircle, CheckCircle2, Zap, UserX, Globe, Phone, CreditCard, Clock } from 'lucide-react';

interface AttackEvent {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  payload: string;
  riskScore: number;
  category: 'phishing' | 'social' | 'transaction' | 'impulse';
}

const ATTACK_SCENARIOS: AttackEvent[] = [
  {
    id: 'fake-otp',
    name: 'Fake OTP Request',
    icon: Phone,
    description: 'Attacker poses as bank support and asks for OTP to "verify account".',
    payload: 'Dear customer, your account will be blocked. Share OTP 847291 immediately to avoid suspension. - PSB Support',
    riskScore: 92,
    category: 'social',
  },
  {
    id: 'phishing-link',
    name: 'Phishing Link',
    icon: Globe,
    description: 'Malicious link mimicking the bank portal to steal credentials.',
    payload: 'https://psb-securewealth-login-verify.tk/confirm?session=xyz123',
    riskScore: 88,
    category: 'phishing',
  },
  {
    id: 'fake-upi-collect',
    name: 'Fake UPI Collect',
    icon: CreditCard,
    description: 'Fraudulent UPI collect request from an unknown merchant.',
    payload: 'UPI COLLECT REQUEST: scammer@upi wants ₹25,000. Approve?',
    riskScore: 76,
    category: 'transaction',
  },
  {
    id: 'impulse-transfer',
    name: 'Impulse High-Value Transfer',
    icon: Zap,
    description: 'User attempts a large transfer at 2:30 AM after just 3 seconds of review.',
    payload: 'Transfer ₹5,00,000 to "Crypto Trader" — Decision time: 3s, Time: 02:30 AM',
    riskScore: 68,
    category: 'impulse',
  },
  {
    id: 'sim-swap',
    name: 'SIM Swap Attempt',
    icon: UserX,
    description: 'Device change + SIM swap detected before login attempt.',
    payload: 'Login from new device: iPhone 16 Pro, SIM changed 2 hours ago, Location: Lagos, Nigeria',
    riskScore: 95,
    category: 'social',
  },
];

function riskColor(score: number) {
  if (score >= 85) return 'text-rose-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-emerald-500';
}

function riskBg(score: number) {
  if (score >= 85) return 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800';
  if (score >= 60) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
  return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
}

function riskAction(score: number) {
  if (score >= 85) return { label: 'BLOCKED', icon: XCircle, color: 'text-rose-600' };
  if (score >= 60) return { label: 'COOLING OFF', icon: Clock, color: 'text-amber-600' };
  return { label: 'ALLOWED', icon: CheckCircle2, color: 'text-emerald-600' };
}

export default function LiveFraudSimulator() {
  const [selectedAttack, setSelectedAttack] = useState<AttackEvent | null>(null);
  const [defenseLog, setDefenseLog] = useState<{ time: string; msg: string; type: 'info' | 'warn' | 'block' }[]>([]);
  const [attackCount, setAttackCount] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string, type: 'info' | 'warn' | 'block') => {
    setDefenseLog((prev) => [{ time: new Date().toLocaleTimeString('en-IN'), msg, type }, ...prev].slice(0, 8));
  };

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = 0;
    }
  }, [defenseLog]);

  const triggerAttack = (attack: AttackEvent) => {
    setSelectedAttack(attack);
    setAttackCount((c) => c + 1);
    addLog(`Attack detected: ${attack.name}`, 'warn');
    setTimeout(() => {
      const action = riskAction(attack.riskScore);
      if (attack.riskScore >= 85) {
        addLog(`Risk score ${attack.riskScore}/100 — ${action.label}`, 'block');
        setBlockedCount((c) => c + 1);
      } else if (attack.riskScore >= 60) {
        addLog(`Risk score ${attack.riskScore}/100 — ${action.label}`, 'warn');
      } else {
        addLog(`Risk score ${attack.riskScore}/100 — ${action.label}`, 'info');
      }
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-rose-600" /> Live Fraud Attack Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Trigger attacks and watch the AI defense layer react in real-time.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xl font-black text-slate-800 dark:text-white">{attackCount}</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Attacks</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-rose-600">{blockedCount}</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Blocked</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attacker Panel */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider">Attacker Console</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {ATTACK_SCENARIOS.map((attack) => {
              const Icon = attack.icon;
              return (
                <button
                  key={attack.id}
                  onClick={() => triggerAttack(attack)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedAttack?.id === attack.id
                      ? 'bg-rose-500/10 border-rose-500/50'
                      : 'bg-slate-800/50 border-slate-700 hover:border-rose-500/30 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-slate-200">{attack.name}</span>
                    <span className={`ml-auto text-[10px] font-black ${riskColor(attack.riskScore)}`}>
                      {attack.riskScore}/100
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{attack.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Defense Panel */}
        <div className="space-y-3">
          {/* Current Attack */}
          <AnimatePresence mode="wait">
            {selectedAttack && (
              <motion.div
                key={selectedAttack.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`p-4 rounded-2xl border ${riskBg(selectedAttack.riskScore)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">Incoming Threat</span>
                  <span className={`text-xs font-black ${riskColor(selectedAttack.riskScore)}`}>
                    Risk: {selectedAttack.riskScore}/100
                  </span>
                </div>
                <p className="text-sm font-mono text-slate-800 dark:text-slate-200 bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg">
                  {selectedAttack.payload}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  {(() => {
                    const action = riskAction(selectedAttack.riskScore);
                    const ActionIcon = action.icon;
                    return (
                      <>
                        <ActionIcon className={`w-4 h-4 ${action.color}`} />
                        <span className={`text-xs font-black ${action.color}`}>{action.label}</span>
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Defense Log */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-slate-800 dark:text-white">AI Defense Log</h3>
            </div>
            <div ref={logRef} className="space-y-2 max-h-[220px] overflow-y-auto">
              {defenseLog.length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center">Trigger an attack to see the defense layer in action.</div>
              ) : (
                defenseLog.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-xs font-mono border-l-2 pl-2 ${
                      log.type === 'block' ? 'border-rose-500 text-rose-700 dark:text-rose-300' :
                      log.type === 'warn' ? 'border-amber-500 text-amber-700 dark:text-amber-300' :
                      'border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    <span className="opacity-60">[{log.time}]</span> {log.msg}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

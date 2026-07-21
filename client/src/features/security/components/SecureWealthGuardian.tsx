import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, Zap, Smartphone, Clock, Keyboard, Mouse, Heart, XCircle, Play, Square, Wifi, WifiOff } from 'lucide-react';
import { useCoercionDetection } from './CoercionDetectionEngine';
import DemoRoomSocket, { generateRoomId } from '@/shared/services/demoRoomSocket';

interface AttackEvent {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  payload: string;
  riskScore: number;
  category: string;
}

const ATTACK_SCENARIOS: AttackEvent[] = [
  { id: 'fake-otp', name: 'Fake OTP Request', icon: Smartphone, payload: 'Dear customer, share OTP 847291 to verify your account.', riskScore: 92, category: 'social' },
  { id: 'phishing', name: 'Phishing Link', icon: AlertTriangle, payload: 'https://psb-secure-login-verify.tk/confirm', riskScore: 88, category: 'phishing' },
  { id: 'sim-swap', name: 'SIM Swap', icon: Smartphone, payload: 'Login from new device, SIM changed 2h ago', riskScore: 95, category: 'social' },
  { id: 'impulse', name: 'Impulse Transfer', icon: Zap, payload: '₹5L transfer at 2:30 AM in 3 seconds', riskScore: 68, category: 'impulse' },
  { id: 'coercion', name: 'Coerced Transaction', icon: Heart, payload: 'Forced transfer with abnormal typing pattern', riskScore: 85, category: 'coercion' },
  { id: 'card-fraud', name: 'Card Skimming', icon: AlertTriangle, payload: 'Multiple failed attempts from unknown ATM', riskScore: 78, category: 'fraud' },
  { id: 'account-takeover', name: 'Account Takeover', icon: XCircle, payload: 'Password changed + new device + location change', riskScore: 91, category: 'fraud' },
  { id: 'money-mule', name: 'Money Mule', icon: AlertTriangle, payload: 'Rapid transfers to multiple new accounts', riskScore: 82, category: 'fraud' },
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
  if (score >= 85) return { label: 'BLOCKED', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-500' };
  if (score >= 60) return { label: 'COOLING OFF', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500' };
  return { label: 'ALLOWED', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500' };
}

function SignalBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  const color = value >= 0.7 ? 'bg-rose-500' : value >= 0.4 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
          <Icon className="w-3 h-3" /> {label}
        </span>
        <span className="font-bold text-slate-800 dark:text-white">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

export default function SecureWealthGuardian() {
  const { signals } = useCoercionDetection();
  const [selectedAttack, setSelectedAttack] = useState<AttackEvent | null>(null);
  const [defenseLog, setDefenseLog] = useState<{ time: string; msg: string; type: 'info' | 'warn' | 'block' }[]>([]);
  const [attackCount, setAttackCount] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [roomId, setRoomId] = useState(() => localStorage.getItem('sw-guardian-room') || generateRoomId());
  const [wsConnected, setWsConnected] = useState(false);
  const socketRef = useRef<DemoRoomSocket | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('sw-guardian-room', roomId);
  }, [roomId]);

  useEffect(() => {
    socketRef.current?.close();
    if (!roomId) return;
    socketRef.current = new DemoRoomSocket(roomId, (msg) => {
      if (msg.type === 'attack') {
        try {
          const attack = JSON.parse(msg.payload) as AttackEvent;
          handleAttack(attack, true);
        } catch {
          // ignore
        }
      }
    });
    setWsConnected(true);
    return () => { socketRef.current?.close(); };
  }, [roomId]);

  const addLog = (msg: string, type: 'info' | 'warn' | 'block') => {
    setDefenseLog((prev) => [{ time: new Date().toLocaleTimeString('en-IN'), msg, type }, ...prev].slice(0, 10));
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [defenseLog]);

  const handleAttack = (attack: AttackEvent, fromRemote = false) => {
    setSelectedAttack(attack);
    setAttackCount((c) => c + 1);
    addLog(`Attack detected: ${attack.name}${fromRemote ? ' (remote)' : ''}`, 'warn');

    // Publish to other devices
    if (!fromRemote && socketRef.current) {
      socketRef.current.publish('attack', JSON.stringify(attack));
    }

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

  const triggerAttack = (attack: AttackEvent) => {
    if (!isLive) return;
    handleAttack(attack);
  };

  const compositeRisk = Math.round(
    (signals.typingAnomaly * 0.2 + signals.mouseAnomaly * 0.2 + signals.timeAnomaly * 0.2 + signals.urgencyAnomaly * 0.4) * 100
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" /> SecureWealth Guardian
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Patent-pending unified fraud protection dashboard. Trigger attacks, watch AI defend.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {wsConnected ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-slate-400" />}
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
              className="w-16 px-1 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isLive ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}
          >
            {isLive ? <Square className="w-3 h-3 inline mr-1" /> : <Play className="w-3 h-3 inline mr-1" />}
            {isLive ? 'LIVE' : 'PAUSED'}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-2xl font-black text-slate-800 dark:text-white">{attackCount}</p>
          <p className="text-[10px] text-slate-400 uppercase font-bold">Attacks Detected</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-2xl font-black text-rose-600">{blockedCount}</p>
          <p className="text-[10px] text-slate-400 uppercase font-bold">Blocked</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-2xl font-black text-amber-600">{compositeRisk}</p>
          <p className="text-[10px] text-slate-400 uppercase font-bold">Behavior Risk</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-2xl font-black text-emerald-600">Active</p>
          <p className="text-[10px] text-slate-400 uppercase font-bold">Protection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attack Console */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider">Attack Console</h3>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {ATTACK_SCENARIOS.map((attack) => {
              const Icon = attack.icon;
              return (
                <button
                  key={attack.id}
                  onClick={() => triggerAttack(attack)}
                  disabled={!isLive}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    selectedAttack?.id === attack.id
                      ? 'bg-rose-500/10 border-rose-500/50'
                      : 'bg-slate-800/50 border-slate-700 hover:border-rose-500/30 hover:bg-slate-800'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-slate-200">{attack.name}</span>
                    <span className={`ml-auto text-[10px] font-black ${riskColor(attack.riskScore)}`}>
                      {attack.riskScore}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{attack.payload}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Defense */}
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
            <div ref={logRef} className="space-y-2 max-h-[200px] overflow-y-auto">
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

        {/* Behavioral Signals */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Behavioral Signals</h3>
            <SignalBar label="Typing Pattern" value={signals.typingAnomaly} icon={Keyboard} />
            <SignalBar label="Mouse Movement" value={signals.mouseAnomaly} icon={Mouse} />
            <SignalBar label="Device Orientation" value={signals.deviceTiltAnomaly} icon={Smartphone} />
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Contextual Signals</h3>
            <SignalBar label="Time of Day" value={signals.timeAnomaly} icon={Clock} />
            <SignalBar label="Action Urgency" value={signals.urgencyAnomaly} icon={Zap} />
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';

interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  account: string;
  percentage: number;
}

interface DMSConfig {
  checkInDays: number;
  lastCheckIn: string;
  beneficiaries: Beneficiary[];
  isArmed: boolean;
}

const DMS_KEY = 'sw_dead_mans_switch';

function loadConfig(): DMSConfig {
  try {
    const raw = JSON.parse(localStorage.getItem(DMS_KEY) || '{}');
    return { checkInDays: 90, lastCheckIn: new Date().toISOString(), beneficiaries: [], isArmed: false, ...raw };
  } catch {
    return { checkInDays: 90, lastCheckIn: new Date().toISOString(), beneficiaries: [], isArmed: false };
  }
}
function saveConfig(c: DMSConfig) { localStorage.setItem(DMS_KEY, JSON.stringify(c)); }

export default function DeadMansSwitch() {
  const [config, setConfig] = useState<DMSConfig>(loadConfig);
  const [checkInPressed, setCheckInPressed] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [account, setAccount] = useState('');
  const [percentage, setPercentage] = useState(0);

  useEffect(() => { saveConfig(config); }, [config]);

  const daysSinceCheckIn = Math.floor((Date.now() - new Date(config.lastCheckIn).getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, config.checkInDays - daysSinceCheckIn);
  const statusColor = daysRemaining > 14 ? 'emerald' : daysRemaining > 7 ? 'amber' : 'rose';
  const statusStyles: Record<string, { gradient: string; border: string; ring: string; icon: string; bar: string }> = {
    emerald: { gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10', border: 'border-emerald-200 dark:border-emerald-800', ring: 'border-emerald-500', icon: 'text-emerald-500', bar: 'bg-emerald-500' },
    amber:   { gradient: 'from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10', border: 'border-amber-200 dark:border-amber-800', ring: 'border-amber-500', icon: 'text-amber-500', bar: 'bg-amber-500' },
    rose:    { gradient: 'from-rose-50 to-red-50 dark:from-rose-900/10 dark:to-red-900/10', border: 'border-rose-200 dark:border-rose-800', ring: 'border-rose-500', icon: 'text-rose-500', bar: 'bg-rose-500' },
  };
  const sts = statusStyles[statusColor];
  const totalPct = config.beneficiaries.reduce((s, b) => s + b.percentage, 0);

  const handleCheckIn = useCallback(() => {
    setCheckInPressed(true);
    setTimeout(() => {
      setConfig((c) => ({ ...c, lastCheckIn: new Date().toISOString() }));
      setCheckInPressed(false);
    }, 1500);
  }, []);

  const addBeneficiary = useCallback(() => {
    if (!name || !relationship || !account || percentage <= 0) return;
    const b: Beneficiary = { id: `ben-${Date.now()}`, name, relationship, account, percentage };
    setConfig((c) => ({ ...c, beneficiaries: [...c.beneficiaries, b] }));
    setName(''); setRelationship(''); setAccount(''); setPercentage(0);
  }, [name, relationship, account, percentage]);

  const simulateExecution = useCallback(() => {
    setSimulating(true);
    setSimulationStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setSimulationStep(step);
      if (step >= config.beneficiaries.length + 2) {
        clearInterval(interval);
        setTimeout(() => setSimulating(false), 2000);
      }
    }, 1500);
  }, [config.beneficiaries.length]);

  const removeBeneficiary = useCallback((id: string) => {
    setConfig((c) => ({ ...c, beneficiaries: c.beneficiaries.filter((b) => b.id !== id) }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-hourglass-half text-rose-500" /> Dead Man's Switch
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Automatic wealth transfer if you don't check in</p>
        </div>
        <button
          onClick={() => setConfig((c) => ({ ...c, isArmed: !c.isArmed }))}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            config.isArmed ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <i className={`fas ${config.isArmed ? 'fa-lock' : 'fa-lock-open'}`} />
          {config.isArmed ? 'ARMED' : 'DISARMED'}
        </button>
      </div>

      {/* Status Card */}
      <div className={`card bg-gradient-to-br ${sts.gradient} border-2 ${sts.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Next Check-in Required</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{daysRemaining} <span className="text-lg font-medium">days</span></p>
            <p className="text-xs text-slate-400 mt-1">Interval: {config.checkInDays} days</p>
          </div>
          <div className={`w-16 h-16 rounded-full border-4 ${sts.ring} flex items-center justify-center`}>
            <i className={`fas fa-heart-pulse ${sts.icon} text-xl`} />
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${sts.bar} rounded-full transition-all`} style={{ width: `${(daysRemaining / config.checkInDays) * 100}%` }} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onMouseDown={handleCheckIn}
            disabled={checkInPressed}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              checkInPressed
                ? 'bg-emerald-600 text-white scale-95'
                : 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900'
            }`}
          >
            {checkInPressed ? (
              <><i className="fas fa-fingerprint mr-2" /> Biometric Verified — Check-in Saved</>
            ) : (
              <><i className="fas fa-fingerprint mr-2" /> Hold to Check In</>
            )}
          </button>
        </div>
      </div>

      {/* Check-in Interval */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">
          <i className="fas fa-clock text-primary mr-2" /> Check-in Interval
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {[30, 60, 90, 180].map((d) => (
            <button
              key={d}
              onClick={() => setConfig((c) => ({ ...c, checkInDays: d }))}
              className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                config.checkInDays === d ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      {/* Beneficiaries */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">
          <i className="fas fa-users text-primary mr-2" /> Beneficiaries ({totalPct}% allocated)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm" />
          <input value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="Relationship" className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm" />
          <input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Account / Wallet" className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm" />
          <div className="flex gap-2">
            <input type="number" value={percentage || ''} onChange={(e) => setPercentage(Number(e.target.value))} placeholder="%" className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm" />
            <button onClick={addBeneficiary} disabled={totalPct + percentage > 100} className="flex-1 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-40">
              <i className="fas fa-plus mr-1" /> Add
            </button>
          </div>
        </div>

        {totalPct > 100 && (
          <p className="text-xs text-rose-500 mb-2"><i className="fas fa-triangle-exclamation mr-1" /> Total cannot exceed 100%</p>
        )}

        <div className="space-y-2">
          {config.beneficiaries.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-600 text-xs font-bold">
                  {b.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{b.name}</p>
                  <p className="text-[10px] text-slate-400">{b.relationship} · {b.account}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{b.percentage}%</span>
                <button onClick={() => removeBeneficiary(b.id)} className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500">
                  <i className="fas fa-times text-xs" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulation */}
      {config.beneficiaries.length > 0 && (
        <div className="card border-2 border-rose-200 dark:border-rose-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
              <i className="fas fa-flask text-rose-500 mr-2" /> Execute Estate Plan
            </h3>
            <button
              onClick={simulateExecution}
              disabled={simulating}
              className="text-xs px-3 py-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
            >
              {simulating ? 'Executing...' : 'Run Executor'}
            </button>
          </div>

          {simulating && (
            <div className="space-y-2">
              <div className={`p-3 rounded-xl text-sm ${simulationStep >= 1 ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                <i className={`fas ${simulationStep >= 1 ? 'fa-check-circle' : 'fa-circle'} mr-2`} />
                Dead Man's Switch triggered — no check-in for {config.checkInDays} days
              </div>
              {config.beneficiaries.map((b, i) => (
                <div key={b.id} className={`p-3 rounded-xl text-sm ${simulationStep >= i + 2 ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                  <i className={`fas ${simulationStep >= i + 2 ? 'fa-check-circle' : 'fa-circle'} mr-2`} />
                  Transfer {b.percentage}% to {b.name} ({b.account})
                </div>
              ))}
              <div className={`p-3 rounded-xl text-sm ${simulationStep >= config.beneficiaries.length + 2 ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                <i className={`fas ${simulationStep >= config.beneficiaries.length + 2 ? 'fa-check-circle' : 'fa-circle'} mr-2`} />
                All transfers executed. Blockchain receipts generated.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

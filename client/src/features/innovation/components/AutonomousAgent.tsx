import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentAction {
  id: string;
  action: string;
  result: string;
  savings: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface AgentToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: string;
}

export default function AutonomousAgent() {
  const [toggles, setToggles] = useState<AgentToggle[]>([
    { id: 'auto-fd', label: 'Auto FD Hunter', description: 'Automatically move idle savings to highest FD rate across all banks', enabled: true, icon: 'fa-building-columns' },
    { id: 'auto-bill', label: 'Bill Negotiator', description: 'Auto-negotiate credit card fees, insurance premiums, subscription rates', enabled: true, icon: 'fa-file-invoice-dollar' },
    { id: 'auto-tax', label: 'Tax Optimizer', description: 'Auto-purchase ELSS/PPF in March if 80C limit not exhausted', enabled: false, icon: 'fa-receipt' },
    { id: 'auto-sip', label: 'SIP Booster', description: 'Auto-increase SIP by 10% every year on your birthday', enabled: true, icon: 'fa-chart-line' },
    { id: 'auto-claim', label: 'Claim Hunter', description: 'Auto-file claims for flight delays, price drops, warranty issues', enabled: false, icon: 'fa-hand-holding-dollar' },
    { id: 'auto-switch', label: 'Loan Refinancer', description: 'Monitor home loan rates and auto-refinance when savings > ₹50K', enabled: false, icon: 'fa-house' },
    { id: 'auto-donate', label: 'Smart Charity', description: 'Round up transactions and auto-donate to 80G-certified causes', enabled: true, icon: 'fa-hand-holding-heart' },
    { id: 'auto-insure', label: 'Insurance Auditor', description: 'Annual audit of all policies — cancel duplicates, upgrade coverage gaps', enabled: false, icon: 'fa-shield-halved' },
  ]);

  const [guardrails, setGuardrails] = useState({
    maxAutoMove: 50000,
    preferredBankType: 'psu',
    minBalance: 200000,
    notifyBefore: true,
    maxMonthlyDonation: 1000,
  });

  const [actions] = useState<AgentAction[]>([
    { id: 'a1', action: 'Found IDFC First FD @ 8.1%', result: 'Moved ₹45,000 from SBI Savings (3.5%) to IDFC FD', savings: 2025, date: 'Today, 9:42 AM', status: 'completed' },
    { id: 'a2', action: 'Negotiated HDFC credit card fee', result: 'Annual fee waived + ₹2,000 statement credit', savings: 3500, date: 'Yesterday, 3:15 PM', status: 'completed' },
    { id: 'a3', action: 'SIP auto-boost triggered', result: 'Axis Bluechip SIP increased from ₹15,000 → ₹16,500', savings: 0, date: 'Yesterday, 12:00 AM', status: 'completed' },
    { id: 'a4', action: 'Round-up donation executed', result: '₹47 donated to PM CARES (80G receipt generated)', savings: 0, date: 'Yesterday, 11:58 PM', status: 'completed' },
    { id: 'a5', action: 'Price drop protection claim', result: '₹1,200 refunded for Amazon purchase (price dropped within 7 days)', savings: 1200, date: '2 days ago', status: 'completed' },
    { id: 'a6', action: 'Auto-refinance home loan scan', result: 'Current rate 8.5% — no better offers found. Retry in 30 days.', savings: 0, date: '3 days ago', status: 'pending' },
  ]);

  const totalSavings = actions.filter((a) => a.status === 'completed').reduce((s, a) => s + a.savings, 0);
  const activeCount = toggles.filter((t) => t.enabled).length;

  const toggleAction = (id: string) => {
    setToggles((prev) => prev.map((t) => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-robot text-primary" /> Autonomous Financial Agent
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Your personal CFO that never sleeps. Negotiates, switches, and optimizes 24/7.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Active Tasks</p>
          <p className="text-2xl font-extrabold text-primary">{activeCount}<span className="text-sm text-slate-400">/{toggles.length}</span></p>
        </div>
      </div>

      {/* Savings Hero */}
      <div className="p-5 bg-gradient-to-r from-primary to-primary-dark rounded-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70 font-medium uppercase tracking-wider">Money Saved by Agent</p>
            <p className="text-3xl font-extrabold mt-1">₹{totalSavings.toLocaleString()}</p>
            <p className="text-xs text-white/70 mt-1">This month • {actions.filter((a) => a.status === 'completed').length} actions completed</p>
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <i className="fas fa-robot text-3xl text-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Agent Toggles */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <i className="fas fa-sliders text-primary text-sm" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Agent Capabilities</h4>
        </div>
        <div className="space-y-3">
          {toggles.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                t.enabled ? 'bg-primary/10 text-primary' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}>
                <i className={`fas ${t.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${t.enabled ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{t.label}</p>
                <p className="text-[10px] text-slate-500 truncate">{t.description}</p>
              </div>
              <button
                onClick={() => toggleAction(t.id)}
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                  t.enabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
                  animate={{ left: t.enabled ? '25px' : '2px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Guardrails */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <i className="fas fa-shield-halved text-emerald-500 text-sm" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Guardrails & Limits</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase">Max Auto-Move Amount</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="range"
                min={10000}
                max={200000}
                step={10000}
                value={guardrails.maxAutoMove}
                onChange={(e) => setGuardrails((g) => ({ ...g, maxAutoMove: parseInt(e.target.value) }))}
                className="flex-1 accent-primary"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-white w-20 text-right">₹{(guardrails.maxAutoMove / 1000).toFixed(0)}K</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase">Minimum Liquid Balance</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="range"
                min={50000}
                max={1000000}
                step={50000}
                value={guardrails.minBalance}
                onChange={(e) => setGuardrails((g) => ({ ...g, minBalance: parseInt(e.target.value) }))}
                className="flex-1 accent-primary"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-white w-20 text-right">₹{(guardrails.minBalance / 100000).toFixed(1)}L</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase">Preferred Bank Type</label>
            <select
              value={guardrails.preferredBankType}
              onChange={(e) => setGuardrails((g) => ({ ...g, preferredBankType: e.target.value }))}
              className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs dark:text-white"
            >
              <option value="psu">PSU Banks (SBI, PNB, Bank of Baroda)</option>
              <option value="private">Private Banks (HDFC, ICICI, Axis)</option>
              <option value="any">Any RBI-Regulated Bank</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase">Max Monthly Donation</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="range"
                min={100}
                max={10000}
                step={100}
                value={guardrails.maxMonthlyDonation}
                onChange={(e) => setGuardrails((g) => ({ ...g, maxMonthlyDonation: parseInt(e.target.value) }))}
                className="flex-1 accent-primary"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-white w-20 text-right">₹{guardrails.maxMonthlyDonation}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <input
            type="checkbox"
            id="notify-before"
            checked={guardrails.notifyBefore}
            onChange={(e) => setGuardrails((g) => ({ ...g, notifyBefore: e.target.checked }))}
            className="w-4 h-4 accent-primary"
          />
          <label htmlFor="notify-before" className="text-xs text-slate-700 dark:text-slate-300">
            Notify me 24 hours before any auto-action above ₹{guardrails.maxAutoMove.toLocaleString()}
          </label>
        </div>
      </div>

      {/* Activity Log */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <i className="fas fa-clock-rotate-left text-primary text-sm" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Agent Activity Log</h4>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {actions.map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  a.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                  a.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                  'bg-rose-100 text-rose-600'
                }`}>
                  <i className={`fas ${a.status === 'completed' ? 'fa-check' : a.status === 'pending' ? 'fa-clock' : 'fa-xmark'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{a.action}</p>
                  <p className="text-[10px] text-slate-500 truncate">{a.result}</p>
                </div>
                {a.savings > 0 && (
                  <span className="text-xs font-bold text-emerald-500 flex-shrink-0">+₹{a.savings.toLocaleString()}</span>
                )}
                <span className="text-[10px] text-slate-400 flex-shrink-0 min-w-[80px] text-right">{a.date}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

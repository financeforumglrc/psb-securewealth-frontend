import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';

interface DataCategory {
  id: string;
  label: string;
  icon: string;
  local: boolean;
  size: string;
  description: string;
}

export default function SovereignVault() {
  const assets = useWealthStore((s) => s.assets);
  const transactions = useWealthStore((s) => s.transactions);
  const netWorth = assets.reduce((sum, a) => sum + a.value, 0);

  const [categories] = useState<DataCategory[]>([
    { id: 'transactions', label: 'Transaction History', icon: 'fa-list', local: true, size: `${transactions.length} records`, description: 'Every transaction narrative, merchant, amount, timestamp — stored only on your device. Bank sees only aggregated risk scores.' },
    { id: 'spending', label: 'Spending Patterns', icon: 'fa-chart-pie', local: true, size: '12 categories', description: 'AI categorization, behavioral insights, predictive models — all computed locally. Zero-knowledge proof sent to bank.' },
    { id: 'goals', label: 'Financial Goals', icon: 'fa-bullseye', local: true, size: '3 active goals', description: 'Target amounts, deadlines, progress — never leaves your phone. Bank only verifies you have a goal plan.' },
    { id: 'biometrics', label: 'Biometric Templates', icon: 'fa-fingerprint', local: true, size: 'Encrypted', description: 'Face scan, voice print, behavioral typing pattern — stored in secure enclave. Bank receives only match/not-match.' },
    { id: 'networth', label: 'Net Worth', icon: 'fa-gem', local: false, size: formatCurrency(netWorth), description: 'Aggregated net worth is shared with bank for product eligibility. Individual asset breakdown stays local.' },
    { id: 'kyc', label: 'KYC Documents', icon: 'fa-id-card', local: false, size: 'PAN, Aadhaar', description: 'Required by RBI KYC norms. Stored encrypted on bank servers with consent. You control access duration.' },
  ]);

  const localCount = categories.filter((c) => c.local).length;
  const privacyScore = Math.round((localCount / categories.length) * 100);

  const [proofDemo, setProofDemo] = useState(false);

  function formatCurrency(n: number) {
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
    return `₹${n.toLocaleString()}`;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-vault text-primary" /> Sovereign Data Vault
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Your financial history never leaves your device. The bank sees proofs, not data.</p>
        </div>
      </div>

      {/* Privacy Score Hero */}
      <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70 font-medium uppercase tracking-wider">Privacy Score</p>
            <p className="text-4xl font-extrabold mt-1">{privacyScore}<span className="text-lg text-white/50">/100</span></p>
            <p className="text-xs text-white/70 mt-1">{localCount} of {categories.length} data categories fully local</p>
          </div>
          <div className="hidden sm:flex flex-col items-center">
            <svg viewBox="0 0 100 100" className="w-20 h-20">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none" stroke="#10b981"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${privacyScore * 2.64} 264`}
                transform="rotate(-90 50 50)"
                initial={{ strokeDasharray: '0 264' }}
                animate={{ strokeDasharray: `${privacyScore * 2.64} 264` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <span className="text-[10px] text-white/60 mt-1">{privacyScore >= 80 ? 'SOVEREIGN' : privacyScore >= 50 ? 'GUARDED' : 'EXPOSED'}</span>
          </div>
        </div>
      </div>

      {/* Data Locality Grid */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <i className="fas fa-database text-primary text-sm" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Data Locality Audit</h4>
        </div>
        <div className="space-y-3">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                cat.local ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
              }`}>
                <i className={`fas ${cat.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{cat.label}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    cat.local
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'
                  }`}>
                    {cat.local ? 'DEVICE ONLY' : 'BANK COPY'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">{cat.size} • {cat.description}</p>
              </div>
              <div className="flex-shrink-0">
                <i className={`fas ${cat.local ? 'fa-lock text-emerald-500' : 'fa-lock-open text-amber-500'} text-sm`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Zero-Knowledge Proof Demo */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <i className="fas fa-key text-violet-500 text-sm" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Zero-Knowledge Proof Demo</h4>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Prove something to the bank without revealing the underlying data. Try it:
        </p>
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
          {!proofDemo ? (
            <div className="text-center">
              <p className="text-sm text-slate-700 dark:text-slate-200 mb-3">
                <strong>Scenario:</strong> You want to prove your net worth is above ₹50L to qualify for a premium credit card,
                <em> without revealing your exact net worth or individual assets.</em>
              </p>
              <button
                onClick={() => setProofDemo(true)}
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                <i className="fas fa-wand-magic-sparkles mr-2" />
                Generate ZK Proof
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <i className="fas fa-check text-lg" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Proof Validated</p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                    Verified: Net Worth ≥ ₹50,00,000 • Actual: {formatCurrency(netWorth)} • Proof ID: ZK-{Math.random().toString(36).slice(2, 10).toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                  <p className="text-[10px] text-slate-500">What Bank Sees</p>
                  <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">VALID: ≥ ₹50L</p>
                </div>
                <div className="p-2 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                  <p className="text-[10px] text-slate-500">What Bank Does NOT See</p>
                  <p className="font-mono text-rose-500 font-bold line-through">{formatCurrency(netWorth)}</p>
                  <p className="font-mono text-rose-500 font-bold line-through">6 asset details</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                <i className="fas fa-circle-info mr-1" />
                Mathematical guarantee: It is computationally impossible for the bank to reverse-engineer your actual net worth from this proof.
              </p>
              <button
                onClick={() => setProofDemo(false)}
                className="text-xs text-primary font-bold hover:underline"
              >
                Reset Demo
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card text-center">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-500 mx-auto mb-2">
            <i className="fas fa-mobile-screen text-xl" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-white">Your Device</p>
          <p className="text-[10px] text-slate-500 mt-1">All raw data, AI models, and biometric templates live here</p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center text-violet-500 mx-auto mb-2">
            <i className="fas fa-shield-halved text-xl" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-white">ZK Prover</p>
          <p className="text-[10px] text-slate-500 mt-1">Generates cryptographic proofs without revealing underlying data</p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-500 mx-auto mb-2">
            <i className="fas fa-building-columns text-xl" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-white">Bank Server</p>
          <p className="text-[10px] text-slate-500 mt-1">Only receives verified proofs, never raw personal data</p>
        </div>
      </div>

      {/* Regulatory */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Regulatory Alignment</p>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'RBI-DPDP', text: 'RBI — Digital Personal Data Protection Act 2023 (Consent & Purpose Limitation)' },
            { id: 'RBI-AA', text: 'RBI — Account Aggregator Framework (Data Minimization Principle)' },
            { id: 'SEBI-Cyber', text: 'SEBI — Cyber Security Framework (Data Localization Mandate)' },
            { id: 'CERT-In', text: 'CERT-In — Guidelines on Data Storage & Incident Reporting' },
          ].map((c) => (
            <div key={c.id} className="flex items-start gap-2 bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-200 dark:border-slate-600 flex-1 min-w-[200px]">
              <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-bold flex-shrink-0">{c.id}</span>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

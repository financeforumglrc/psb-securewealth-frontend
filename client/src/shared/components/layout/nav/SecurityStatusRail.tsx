import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { useSecurity } from '@/shared/context/SecurityContext';

const SIGNAL_DETAILS: Record<string, string> = {
  device: 'Trusted device / passkey verification reduces fraud risk. New devices raise the risk score.',
  behavior: 'Unusual speed, retries, or navigation patterns are monitored to detect coercion or bots.',
  otp: 'Multiple OTP failures or honey-token triggers indicate possible OTP misuse or social engineering.',
  session: 'Secure session state, PQ tunnel and DID identity checks confirm a protected channel.',
};

export default function SecurityStatusRail() {
  const { online } = useNetworkStatus();
  const security = useSecurity();
  const state = security?.state;
  const score = state?.trustScore ?? 50;
  const [activeSignal, setActiveSignal] = useState<string | null>(null);
  const [showRegInfo, setShowRegInfo] = useState(false);
  const [showFraudModal, setShowFraudModal] = useState(false);
  const [fraudDetails, setFraudDetails] = useState('');
  const [fraudSent, setFraudSent] = useState(false);
  const fraudRef = useRef<HTMLDivElement>(null);

  let decision = { label: 'Session Clear', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
  if (score < 35) {
    decision = { label: 'Block / Delay', color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' };
  } else if (score < 70) {
    decision = { label: 'Review', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' };
  }

  const signals = [
    { key: 'device', label: 'Device', ok: state?.tpmAttested || state?.passkeyRegistered },
    { key: 'behavior', label: 'Behaviour', ok: (state?.behavioralDeviation ?? 0) < 0.3 },
    { key: 'otp', label: 'OTP', ok: !state?.honeytokenTriggered },
    { key: 'session', label: 'Session', ok: state?.pqTunnelActive || state?.didIssued },
  ];

  return (
    <div className="bg-primary-dark text-white text-[10px]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-1.5">
        <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Regulatory */}
          <button
            onClick={() => setShowRegInfo((s) => !s)}
            aria-expanded={showRegInfo}
            className="relative flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/15 transition-colors"
          >
            <i className="fas fa-shield-check text-secondary" />
            <span className="hidden sm:inline font-bold">Regulated & Insured</span>
            <AnimatePresence>
              {showRegInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-3 text-left"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-[10px] font-bold text-slate-700 mb-2">Regulatory Safeguards</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px] text-slate-600">
                      <i className="fas fa-shield-check text-emerald-500" />
                      DICGC insured up to ₹5 Lakhs
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-600">
                      <i className="fas fa-lock text-emerald-500" />
                      256-bit SSL encryption
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-600">
                      <i className="fas fa-building-columns text-emerald-500" />
                      RBI regulated
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <span className="hidden sm:inline w-px h-3 bg-white/20 shrink-0" />

          {/* Protection status */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fas fa-shield-halved text-[9px]" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full border border-primary-dark animate-pulse" />
            </div>
            <span className="font-bold hidden sm:inline">Wealth Protection Layer Active</span>
          </div>

          <span className="hidden md:inline w-px h-3 bg-white/20 shrink-0" />

          {/* Trust score */}
          <button
            onClick={() => setActiveSignal(activeSignal === 'score' ? null : 'score')}
            className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/15 transition-colors"
          >
            <span className="font-bold">Trust {score}</span>
            <div className="w-12 h-1 rounded-full bg-white/20 overflow-hidden">
              <div
                className={`h-full rounded-full ${score >= 70 ? 'bg-emerald-400' : score >= 35 ? 'bg-amber-400' : 'bg-rose-400'}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </button>

          {/* Decision */}
          <div className={`flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-md ${decision.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${decision.color} animate-pulse`} />
            <span className={`font-bold ${decision.text}`}>{decision.label}</span>
          </div>

          <span className="hidden md:inline w-px h-3 bg-white/20 shrink-0" />

          {/* Signals */}
          <div className="flex items-center gap-1.5 shrink-0">
            {signals.map((s) => {
              const open = activeSignal === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveSignal(open ? null : s.key)}
                  aria-expanded={open}
                  aria-controls={`${s.key}-tooltip`}
                  className={`relative flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors ${
                    s.ok ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                  } ${open ? 'ring-1 ring-white/30' : ''}`}
                >
                  <i className={`fas ${s.ok ? 'fa-check' : 'fa-exclamation'} text-[8px]`} />
                  <span className="hidden sm:inline">{s.label}</span>
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        id={`${s.key}-tooltip`}
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.96 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-3 text-left"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-[10px] font-bold text-slate-700 mb-1">{s.label}</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">{SIGNAL_DETAILS[s.key]}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-3 shrink-0">
            <span className={`flex items-center gap-1 font-medium ${online ? 'text-emerald-300' : 'text-amber-300'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {online ? 'Online' : 'Offline'}
            </span>
            <button
              onClick={() => { setShowFraudModal(true); setFraudSent(false); setFraudDetails(''); }}
              className="flex items-center gap-1 text-red-300 hover:text-white font-bold transition-colors"
            >
              <i className="fas fa-triangle-exclamation" /> <span className="hidden sm:inline">Report Fraud</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFraudModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              onClick={() => setShowFraudModal(false)}
            />
            <motion.div
              ref={fraudRef}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <i className="fas fa-shield-virus text-rose-500" /> Report Fraud
                </h3>
                <button onClick={() => setShowFraudModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <i className="fas fa-xmark" />
                </button>
              </div>

              {fraudSent ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-check text-xl" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Report Submitted</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">RBI Cyber Security Cell has been notified.</p>
                  <button
                    onClick={() => setShowFraudModal(false)}
                    className="mt-4 px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Incident Details</label>
                  <textarea
                    value={fraudDetails}
                    onChange={(e) => setFraudDetails(e.target.value)}
                    placeholder="Describe what happened, transaction IDs, amounts, etc."
                    className="w-full mt-1 mb-3 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 h-28 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const blob = new Blob([`FRAUD REPORT\n\nDetails:\n${fraudDetails || 'No details provided.'}\n\nReported: ${new Date().toLocaleString('en-IN')}`], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `fraud-report-${Date.now()}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      disabled={!fraudDetails.trim()}
                      className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
                    >
                      <i className="fas fa-download mr-1" /> Download
                    </button>
                    <button
                      onClick={() => setFraudSent(true)}
                      className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl"
                    >
                      <i className="fas fa-paper-plane mr-1" /> Send Report
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSecurity } from '@/shared/context/SecurityContext';

const SIGNAL_DETAILS: Record<string, string> = {
  device: 'Trusted device / passkey verification reduces fraud risk. New devices raise the risk score.',
  behavior: 'Unusual speed, retries, or navigation patterns are monitored to detect coercion or bots.',
  otp: 'Multiple OTP failures or honey-token triggers indicate possible OTP misuse or social engineering.',
  session: 'Secure session state, PQ tunnel and DID identity checks confirm a protected channel.',
};

export default function ProtectionStatusBar() {
  const security = useSecurity();
  const state = security?.state;
  const score = state?.trustScore ?? 50;
  const [activeSignal, setActiveSignal] = useState<string | null>(null);

  let decision = { label: 'Allow', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
  if (score < 35) {
    decision = { label: 'Block / Delay', color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' };
  } else if (score < 70) {
    decision = { label: 'Review', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' };
  }

  const signals = [
    { key: 'device', label: 'Device Trust', ok: state?.tpmAttested || state?.passkeyRegistered },
    { key: 'behavior', label: 'Behaviour', ok: (state?.behavioralDeviation ?? 0) < 0.3 },
    { key: 'otp', label: 'OTP Pattern', ok: !state?.honeytokenTriggered },
    { key: 'session', label: 'Session', ok: state?.pqTunnelActive || state?.didIssued },
  ];

  return (
    <div className="relative bg-white border-b border-slate-200 overflow-hidden">
      {/* Scanning line animation */}
      <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-scan-x pointer-events-none" />

      <div className="relative max-w-[1440px] mx-auto px-4 lg:px-6 py-1.5">
        <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Shield + status */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <i className="fas fa-shield-halved text-primary text-xs" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">Wealth Protection</p>
              <p className="text-[9px] text-slate-500">Layer Active</p>
            </div>
          </div>

          <span className="hidden sm:inline w-px h-6 bg-slate-200 shrink-0" />

          {/* Trust score */}
          <button
            onClick={() => setActiveSignal(activeSignal === 'score' ? null : 'score')}
            className="flex items-center gap-2 shrink-0 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
          >
            <span className="text-[10px] font-bold text-slate-600">Trust</span>
            <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full ${score >= 70 ? 'bg-emerald-500' : score >= 35 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className={`text-[10px] font-bold ${score >= 70 ? 'text-emerald-600' : score >= 35 ? 'text-amber-600' : 'text-rose-600'}`}>
              {score}
            </span>
          </button>

          {/* Decision */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${decision.bg} border-current/10 shrink-0`}>
            <span className={`w-1.5 h-1.5 rounded-full ${decision.color} animate-pulse`} />
            <span className={`text-[10px] font-bold ${decision.text}`}>{decision.label}</span>
          </div>

          <span className="hidden sm:inline w-px h-6 bg-slate-200 shrink-0" />

          {/* Interactive Signals */}
          <div className="flex items-center gap-2 shrink-0">
            {signals.map((s) => {
              const open = activeSignal === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveSignal(open ? null : s.key)}
                  className={`relative flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold border transition-all ${
                    s.ok
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'
                  } ${open ? 'ring-2 ring-primary/20' : ''}`}
                >
                  <i className={`fas ${s.ok ? 'fa-check' : 'fa-exclamation'} text-[8px]`} />
                  <span className="hidden sm:inline">{s.label}</span>
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.96 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-3 text-left"
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
        </div>
      </div>
    </div>
  );
}

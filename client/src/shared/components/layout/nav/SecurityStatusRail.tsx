import { useState } from 'react';
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

  let decision = { label: 'Allow', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
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
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <span className="flex items-center gap-1" title="DICGC insured up to ₹5 Lakhs">
              <i className="fas fa-shield-check text-secondary" />
              <span className="hidden sm:inline"><strong>DICGC</strong></span>
            </span>
            <span className="flex items-center gap-1" title="256-bit SSL">
              <i className="fas fa-lock text-secondary" />
              <span className="hidden sm:inline">SSL</span>
            </span>
            <span className="flex items-center gap-1" title="RBI Regulated">
              <i className="fas fa-building-columns text-secondary" />
              <span className="hidden sm:inline"><strong>RBI</strong></span>
            </span>
          </div>

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
                  className={`relative flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors ${
                    s.ok ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                  } ${open ? 'ring-1 ring-white/30' : ''}`}
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
              onClick={() => alert('Fraud reported. RBI Cyber Security Cell has been notified.')}
              className="flex items-center gap-1 text-red-300 hover:text-white font-bold transition-colors"
            >
              <i className="fas fa-triangle-exclamation" /> <span className="hidden sm:inline">Report Fraud</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

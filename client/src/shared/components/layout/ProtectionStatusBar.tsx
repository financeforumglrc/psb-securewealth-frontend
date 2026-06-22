import { useSecurity } from '@/shared/context/SecurityContext';

export default function ProtectionStatusBar() {
  const security = useSecurity();
  const state = security?.state;
  const score = state?.trustScore ?? 50;

  let decision = { label: 'Allow', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
  if (score < 35) {
    decision = { label: 'Block / Delay', color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' };
  } else if (score < 70) {
    decision = { label: 'Review', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' };
  }

  const signals = [
    { key: 'device', label: 'Device Trust', ok: state?.tpmAttested || state?.passkeyRegistered, warn: !state?.tpmAttested && !state?.passkeyRegistered },
    { key: 'behavior', label: 'Behaviour', ok: (state?.behavioralDeviation ?? 0) < 0.3, warn: (state?.behavioralDeviation ?? 0) >= 0.3 },
    { key: 'otp', label: 'OTP Pattern', ok: !state?.honeytokenTriggered, warn: state?.honeytokenTriggered },
    { key: 'session', label: 'Session', ok: state?.pqTunnelActive || state?.didIssued, warn: !state?.pqTunnelActive && !state?.didIssued },
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-2">
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
          <div className="flex items-center gap-2 shrink-0 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-600">Trust</span>
            <div className={`w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden`}>
              <div
                className={`h-full rounded-full ${score >= 70 ? 'bg-emerald-500' : score >= 35 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className={`text-[10px] font-bold ${score >= 70 ? 'text-emerald-600' : score >= 35 ? 'text-amber-600' : 'text-rose-600'}`}>
              {score}
            </span>
          </div>

          {/* Decision */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${decision.bg} border-current/10 shrink-0`}>
            <span className={`w-1.5 h-1.5 rounded-full ${decision.color} animate-pulse`} />
            <span className={`text-[10px] font-bold ${decision.text}`}>{decision.label}</span>
          </div>

          <span className="hidden sm:inline w-px h-6 bg-slate-200 shrink-0" />

          {/* Signals */}
          <div className="flex items-center gap-2 shrink-0">
            {signals.map((s) => (
              <div
                key={s.key}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold border ${
                  s.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}
                title={s.label}
              >
                <i className={`fas ${s.ok ? 'fa-check' : 'fa-exclamation'} text-[8px]`} />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

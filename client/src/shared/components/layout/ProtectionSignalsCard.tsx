import { useSecurity } from '@/shared/context/SecurityContext';

export default function ProtectionSignalsCard() {
  const security = useSecurity();
  const state = security?.state;

  const signals = [
    {
      label: 'Trusted Device',
      ok: state?.tpmAttested || state?.passkeyRegistered,
      detail: state?.tpmAttested ? 'TPM attested' : state?.passkeyRegistered ? 'Passkey registered' : 'No trusted key',
    },
    {
      label: 'Behaviour',
      ok: (state?.behavioralDeviation ?? 0) < 0.3,
      detail: (state?.behavioralDeviation ?? 0) < 0.3 ? 'Normal pattern' : 'Deviation detected',
    },
    {
      label: 'OTP Pattern',
      ok: !state?.honeytokenTriggered,
      detail: state?.honeytokenTriggered ? 'Honeytoken triggered' : 'No OTP misuse',
    },
    {
      label: 'Action Amount',
      ok: !state?.trapTriggered,
      detail: state?.trapTriggered ? 'Unusual amount pattern' : 'Within normal range',
    },
  ];

  return (
    <div className="m-3 p-3 rounded-2xl bg-gradient-to-br from-rose-50 to-white border border-rose-100">
      <div className="flex items-center gap-2 mb-2">
        <i className="fas fa-shield-virus text-rose-500 text-xs" />
        <p className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider">Protection Signals</p>
      </div>
      <div className="space-y-2">
        {signals.map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className={`fas fa-circle text-[6px] ${s.ok ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="text-[10px] font-bold text-slate-700">{s.label}</span>
            </div>
            <span className={`text-[9px] font-medium ${s.ok ? 'text-emerald-600' : 'text-amber-600'}`}>{s.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

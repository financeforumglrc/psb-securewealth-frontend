import { useState } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useAuth } from '@/shared/context/AuthContext';
import { backendApi } from '@/shared/lib/backendApi';

interface Props {
  show: boolean;
  onClose: () => void;
  onVerified?: () => void;
  purpose?: string;
}

export default function KYCModal({ show, onClose, onVerified, purpose = 'investment' }: Props) {
  const [step, setStep] = useState<'intro' | 'pan' | 'aadhaar' | 'verify' | 'success'>('intro');
  const [pan, setPan] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setKycVerified = useWealthStore((s: any) => s.setKycVerified);
  const kycVerified = useWealthStore((s: any) => s.kycVerified);
  const { state: authState } = useAuth();

  if (!show) return null;

  async function verify() {
    setStep('verify');
    setLoading(true);
    setError(null);

    try {
      const submitRes = await backendApi.submitKyc({
        panNumber: pan,
        aadhaarMasked: aadhaar,
      });

      if (!submitRes.ok || !submitRes.data?.success) {
        throw new Error(submitRes.data?.error || 'KYC submission failed');
      }

      // In a real flow the eKYC provider would verify the user. Here we call the
      // backend verify endpoint to mark the record as verified after the mock OTP.
      const verifyRes = await backendApi.verifyKyc(`ekyc-${authState.userId || Date.now()}`);
      if (!verifyRes.ok || !verifyRes.data?.success) {
        throw new Error(verifyRes.data?.error || 'KYC verification failed');
      }

      setKycVerified(true);
      setStep('success');
      onVerified?.();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
      setStep('aadhaar');
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setStep('intro');
    setPan('');
    setAadhaar('');
    setOtp('');
    setError(null);
    onClose();
  }

  const purposeText = purpose === 'investment' ? 'start investments' : 'perform this action';
  const steps = ['intro', 'pan', 'aadhaar', 'verify'];
  const currentIdx = steps.indexOf(step);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={close}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-primary to-secondary p-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">
              {step === 'intro' && 'KYC Verification Required'}
              {step === 'pan' && 'Enter PAN Details'}
              {step === 'aadhaar' && 'Aadhaar Verification'}
              {step === 'verify' && 'Verifying...'}
              {step === 'success' && 'KYC Verified!'}
            </h3>
            <p className="text-xs text-white/80 mt-0.5">
              {step === 'intro' && `KYC is mandatory before you can ${purposeText}.`}
              {step === 'pan' && 'Permanent Account Number (PAN) is required for all investments.'}
              {step === 'aadhaar' && 'Link your Aadhaar for eKYC verification.'}
              {step === 'verify' && 'Connecting to CKYC registry...'}
              {step === 'success' && 'You can now proceed with your investment.'}
            </p>
          </div>
          <button onClick={close} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        <div className="p-6">
          {step !== 'success' && (
            <div className="flex items-center gap-2 mb-5">
              {steps.map((s, i) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === s ? 'bg-primary text-white' : currentIdx > i ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {currentIdx > i ? <i className="fas fa-check" /> : i + 1}
                  </div>
                  {i < 3 && <div className={`flex-1 h-0.5 ${currentIdx > i ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400">
              <i className="fas fa-circle-exclamation mr-1" /> {error}
            </div>
          )}

          {step === 'intro' && kycVerified && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">KYC Already Verified</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Your KYC is complete. You can proceed with investments.</p>
                  </div>
                </div>
              </div>
              <button onClick={close} className="w-full py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                Continue
              </button>
            </div>
          )}

          {step === 'intro' && !kycVerified && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <i className="fas fa-triangle-exclamation text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">KYC Required</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      As per RBI and SEBI regulations, Know Your Customer (KYC) verification is mandatory for all investment-related activities. This is a one-time process.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2"><i className="fas fa-check text-emerald-500" /> PAN card verification</div>
                <div className="flex items-center gap-2"><i className="fas fa-check text-emerald-500" /> Aadhaar eKYC via OTP</div>
                <div className="flex items-center gap-2"><i className="fas fa-check text-emerald-500" /> CKYC registry check</div>
                <div className="flex items-center gap-2"><i className="fas fa-check text-emerald-500" /> Digital signature capture</div>
              </div>
              <button onClick={() => setStep('pan')} className="w-full py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                Start KYC Verification
              </button>
              <p className="text-[10px] text-slate-400 text-center">
                <i className="fas fa-shield-halved mr-1" /> Your data is encrypted and stored as per DPDP Act 2023.
              </p>
            </div>
          )}

          {step === 'pan' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1.5">PAN Number</label>
                <input
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm uppercase tracking-wider"
                />
                <p className="text-[10px] text-slate-400 mt-1">Format: ABCDE1234F</p>
              </div>
              <button
                onClick={() => setStep('aadhaar')}
                disabled={pan.length < 10}
                className="w-full py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {step === 'aadhaar' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1.5">Aadhaar Number</label>
                <input
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234 5678 9012"
                  maxLength={12}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm tracking-wider"
                />
                <p className="text-[10px] text-slate-400 mt-1">12-digit Aadhaar number</p>
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1.5">OTP</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm tracking-wider"
                />
                <p className="text-[10px] text-slate-400 mt-1">Demo OTP: 123456</p>
              </div>
              <button
                onClick={verify}
                disabled={aadhaar.length < 12 || otp.length < 6 || loading}
                className="w-full py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                {loading ? <i className="fas fa-spinner fa-spin mr-1" /> : null}
                Verify & Complete KYC
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Verifying with CKYC registry...</p>
              <p className="text-xs text-slate-400 mt-1">Cross-checking PAN with Income Tax database</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center py-6">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-check-circle text-3xl text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-white">KYC Verified Successfully!</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">
                Your identity has been verified.<br />You can now proceed with investments.
              </p>
              <div className="mt-4 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-medium">
                <i className="fas fa-shield-halved mr-1" /> CKYC Compliant
              </div>
              <button onClick={close} className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                Proceed
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

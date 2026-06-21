import { useState } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import KYCModal from '@/features/compliance/components/KYCModal';

export default function KYCStatusCard() {
  const kycVerified = useWealthStore((s: any) => s.kycVerified);
  const [showKYC, setShowKYC] = useState(false);

  if (kycVerified) {
    return (
      <div className="card border border-emerald-200 bg-emerald-50/30 dark:bg-emerald-900/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
            <i className="fas fa-shield-halved" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">KYC Verified</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">You can invest and transact freely.</p>
          </div>
          <span className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full font-medium">CKYC</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setShowKYC(true)} className="card border border-amber-200 bg-amber-50/30 dark:bg-amber-900/10 text-left hover:shadow-md transition-shadow w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white">
            <i className="fas fa-triangle-exclamation" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">KYC Pending</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400">Complete KYC to unlock investments.</p>
          </div>
          <span className="text-xs px-3 py-1.5 bg-amber-500 text-white rounded-lg font-medium">Complete KYC</span>
        </div>
      </button>
      <KYCModal show={showKYC} onClose={() => setShowKYC(false)} />
    </>
  );
}

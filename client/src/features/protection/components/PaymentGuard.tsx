import { useState } from 'react';
import { checkPayee, type FlaggedPayee } from '@/shared/services/fraudDatabase';

interface PaymentGuardProps {
  payeeName: string;
  upiId?: string;
  phone?: string;
  amount?: number;
  onAllow: () => void;
  onBlock: () => void;
}

export default function PaymentGuard({ payeeName, upiId, phone, onAllow, onBlock }: PaymentGuardProps) {
  const [checked, setChecked] = useState(false);
  const [flagged, setFlagged] = useState<FlaggedPayee | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleCheck = () => {
    setScanning(true);
    setTimeout(() => {
      const match = checkPayee(payeeName, upiId, phone);
      setFlagged(match);
      setChecked(true);
      setScanning(false);
    }, 800);
  };

  if (!checked) {
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">Payment Guard</p>
            <p className="text-xs text-slate-500">Verify payee against national fraud database before sending.</p>
          </div>
          <button
            onClick={handleCheck}
            disabled={scanning}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {scanning ? (
              <span className="flex items-center gap-1">
                <i className="fas fa-circle-notch animate-spin" /> Scanning...
              </span>
            ) : (
              'Verify Payee'
            )}
          </button>
        </div>
      </div>
    );
  }

  if (flagged) {
    return (
      <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border-2 border-rose-200 dark:border-rose-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white animate-pulse">
            <i className="fas fa-triangle-exclamation text-lg" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">Transaction Blocked</h4>
            <p className="text-[10px] text-rose-500">National Fraud Database Match</p>
          </div>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-rose-100 dark:border-rose-800 mb-3">
          <p className="text-xs text-slate-700 dark:text-slate-300">
            <strong>Payee:</strong> {flagged.name}
          </p>
          <p className="text-xs text-slate-500 mt-1">{flagged.reason}</p>
          <p className="text-[10px] text-slate-400 mt-1">
            <i className="fas fa-database mr-1" />
            Source: {flagged.source}
          </p>
        </div>
        <p className="text-xs text-rose-600 font-bold mb-3">
          This payee is flagged in our national fraud database. Transaction blocked for your safety.
        </p>
        <button
          onClick={onBlock}
          className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-xl transition-colors"
        >
          <i className="fas fa-shield-halved mr-1" /> Block & Report
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800">
      <div className="flex items-center gap-2 mb-2">
        <i className="fas fa-check-circle text-emerald-500 text-lg" />
        <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Payee Verified</h4>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
        No matches found in national fraud databases. Proceed with caution.
      </p>
      <button
        onClick={onAllow}
        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors"
      >
        Proceed with Payment
      </button>
    </div>
  );
}

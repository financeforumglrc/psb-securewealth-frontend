import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface TransactionFailure {
  id: string;
  amount: number;
  recipient: string;
  reason: string;
  timestamp: number;
  requiresFaceID: boolean;
}

export default function TransactionFailureFaceID() {
  const [failures, setFailures] = useState<TransactionFailure[]>([]);
  const [showFaceID, setShowFaceID] = useState(false);
  const [currentFailure, setCurrentFailure] = useState<TransactionFailure | null>(null);

  // Simulate transaction failure detection
  useEffect(() => {
    const simulateFailure = () => {
      const failure: TransactionFailure = {
        id: Math.random().toString(36).slice(2, 10),
        amount: 50000,
        recipient: 'Unknown Recipient',
        reason: 'Transaction failed due to network error',
        timestamp: Date.now(),
        requiresFaceID: true,
      };
      setFailures((prev) => [failure, ...prev.slice(0, 4)]);
      setCurrentFailure(failure);
      setShowFaceID(true);
    };

    // Simulate failure every 30 seconds (for demo)
    const interval = setInterval(simulateFailure, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    setShowFaceID(false);
    setCurrentFailure(null);
    // Simulate successful retry
    setTimeout(() => {
      setFailures((prev) => prev.filter((f) => f.id !== currentFailure?.id));
    }, 1000);
  };

  const handleCancel = () => {
    setShowFaceID(false);
    setCurrentFailure(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" /> Transaction Failure Face ID
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">If a transaction fails, trigger a pop-up for face recognition to verify your identity before retrying.</p>
      </div>

      {/* Failed Transactions List */}
      <div className="space-y-2">
        {failures.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No failed transactions. All transactions are processing successfully.
          </div>
        ) : (
          failures.map((failure) => (
            <motion.div
              key={failure.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">₹{failure.amount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-500">{failure.recipient}</p>
                    <p className="text-[10px] text-rose-500">{failure.reason}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCurrentFailure(failure);
                    setShowFaceID(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                >
                  Verify & Retry
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Face ID Verification Modal */}
      <AnimatePresence>
        {showFaceID && currentFailure && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-rose-600 p-5 text-white">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Transaction Failed</h3>
                </div>
                <p className="text-xs text-white/80 mt-1">Face verification required to retry</p>
              </div>

              <div className="p-5 space-y-4">
                {/* Transaction Details */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Amount</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">₹{currentFailure.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Recipient</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{currentFailure.recipient}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Reason</span>
                    <span className="text-xs text-rose-500">{currentFailure.reason}</span>
                  </div>
                </div>

                {/* Face ID Prompt */}
                <div className="text-center py-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center mb-3">
                    <Shield className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Face ID Verification</h4>
                  <p className="text-xs text-slate-500">
                    Look at the camera to verify your identity. This is required to retry the failed transaction.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleRetry}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Verify & Retry
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 text-center">
                  <RefreshCw className="w-3 h-3 inline mr-1" />
                  Transaction will be retried after successful verification
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

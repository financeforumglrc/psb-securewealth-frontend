import { useState, useCallback } from 'react';
import { useSecurityActions } from '@/shared/context/SecurityContext';

export default function HoneytokenManager() {
  const { state, triggerHoneytoken, resetHoneytoken } = useSecurityActions();
  const [showInfo, setShowInfo] = useState(false);

  const handleClaim = useCallback(() => {
    triggerHoneytoken();
  }, [triggerHoneytoken]);

  const handleTransfer = useCallback(() => {
    triggerHoneytoken();
  }, [triggerHoneytoken]);

  return (
    <div className="relative">
      {/* Decoy Goal Card */}
      <div className="card border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-flask" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Internal Test Fund</h3>
          </div>
          <span className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full">
            <i className="fas fa-eye-slash mr-1" /> Hidden
          </span>
        </div>

        <div className="mb-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Target Amount</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">₹10,00,000</p>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full mt-2">
            <div className="h-2 bg-indigo-500 rounded-full" style={{ width: '85%' }} />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">85% completed • ₹8,50,000 saved</p>
        </div>

        {state.honeytokenTriggered ? (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <i className="fas fa-lock text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Account Frozen</p>
              <p className="text-[10px] text-red-600 dark:text-red-400">Unauthorized access detected on decoy asset.</p>
            </div>
            <button
              onClick={resetHoneytoken}
              className="text-xs px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <i className="fas fa-rotate-left mr-1" /> Admin Reset
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleClaim}
              className="flex-1 text-xs px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
            >
              <i className="fas fa-gift mr-1" /> Claim
            </button>
            <button
              onClick={handleTransfer}
              className="flex-1 text-xs px-3 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              <i className="fas fa-arrow-right-arrow-left mr-1" /> Transfer
            </button>
          </div>
        )}
      </div>

      {/* Honeytoken Info Section */}
      <div className="mt-4">
        <button
          onClick={() => setShowInfo((s) => !s)}
          className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <i className={`fas fa-chevron-${showInfo ? 'down' : 'right'} text-[10px]`} />
          <span className="font-medium">What are honeytokens?</span>
        </button>
        {showInfo && (
          <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <i className="fas fa-bee mr-1" />
              <strong>Honeytokens</strong> are decoy assets or credentials placed in your system to detect unauthorized access.
              They appear real to attackers but have no actual value. Any interaction with them immediately triggers an alert,
              freezes the account, and logs the intrusion attempt for forensic analysis.
            </p>
          </div>
        )}
      </div>

      {/* Full-screen overlay when triggered */}
      {state.honeytokenTriggered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-600/95 backdrop-blur-sm">
          <div className="text-center px-6 max-w-lg">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <i className="fas fa-triangle-exclamation text-4xl text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">HONEYTOKEN TRIGGERED</h2>
            <p className="text-lg text-red-100 mb-8">Unauthorized access attempt detected.</p>

            <div className="bg-white/10 rounded-xl p-6 mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <i className="fas fa-lock text-white" />
                <span className="text-white font-medium">Account Status: Frozen</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <i className="fas fa-fingerprint text-white" />
                <span className="text-red-100">Intruder fingerprint captured</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fas fa-bell text-white" />
                <span className="text-red-100">Security team alerted</span>
              </div>
            </div>

            <button
              onClick={resetHoneytoken}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors"
            >
              <i className="fas fa-rotate-left" /> Admin Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

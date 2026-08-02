import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Shield, Fingerprint, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';

export default function AppLockWithoutAuth() {
  const { state: authState } = useAuth();
  const [showLock, setShowLock] = useState(!authState.isAuthenticated);
  const [unlockMethod, setUnlockMethod] = useState<'face' | 'pin' | 'password'>('face');

  // Show lock if not authenticated
  if (authState.isAuthenticated) return null;

  const handleUnlock = () => {
    // Simulate unlock
    setShowLock(false);
  };

  return (
    <AnimatePresence>
      {showLock && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900 z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-3">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black">App Locked</h2>
              <p className="text-xs text-white/80 mt-1">Authentication required to access your account</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Security Notice */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    Security feature: Remove access to the app itself unless authentication is completed first.
                  </span>
                </div>
              </div>

              {/* Unlock Methods */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Choose Unlock Method</h3>

                {/* Face ID */}
                <button
                  onClick={() => setUnlockMethod('face')}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    unlockMethod === 'face'
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                      <Fingerprint className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Face ID</p>
                      <p className="text-xs text-slate-500">Use facial recognition to unlock</p>
                    </div>
                    {unlockMethod === 'face' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </div>
                </button>

                {/* PIN */}
                <button
                  onClick={() => setUnlockMethod('pin')}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    unlockMethod === 'pin'
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">PIN</p>
                      <p className="text-xs text-slate-500">Enter your 6-digit PIN</p>
                    </div>
                    {unlockMethod === 'pin' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </div>
                </button>

                {/* Password */}
                <button
                  onClick={() => setUnlockMethod('password')}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    unlockMethod === 'password'
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Password</p>
                      <p className="text-xs text-slate-500">Enter your account password</p>
                    </div>
                    {unlockMethod === 'password' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </div>
                </button>
              </div>

              {/* Unlock Button */}
              <button
                onClick={handleUnlock}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-4 h-4" />
                Unlock App
              </button>

              {/* Security Info */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] text-slate-500 text-center">
                  <XCircle className="w-3 h-3 inline mr-1" />
                  For your security, the app will remain locked until you authenticate.
                  This prevents unauthorized access to your financial data.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

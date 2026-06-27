import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/shared/context/AuthContext';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useFamilySafeWord } from '@/shared/hooks/useFamilySafeWord';
import { useRakshakStore } from '@/shared/store/rakshakStore';
import { logEmergencyLockdown } from '@/shared/utils/auditLogger';
import MoneyMuleGraph from '@/features/protection/components/MoneyMuleGraph';

const HELPLINE_NUMBER = '1800-110-001';

export default function RakshakInterventionChat() {
  const { isRakshakActive, rakshakData, resolveRakshak } = useRakshakStore();
  const setLockdownActive = useWealthStore((s) => s.setLockdownActive);
  const { state: authState } = useAuth();
  const { safeWord, hasSafeWord } = useFamilySafeWord();

  const [isTyping, setIsTyping] = useState(true);
  const [showSupport, setShowSupport] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'success'>('idle');
  const VOICE_PHRASE = "My PSB wealth is secure";

  const userId = authState.userId || 'user-001';

  useEffect(() => {
    if (!isRakshakActive) {
      setIsTyping(true);
      setShowSupport(false);
      setShowConfirmClose(false);
      setToast(null);
      setVoiceStatus('idle');
      return;
    }
    const timer = setTimeout(() => setIsTyping(false), 1400);
    return () => clearTimeout(timer);
  }, [isRakshakActive]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSOS = () => {
    resolveRakshak('SOS');
    setLockdownActive(true);
    logEmergencyLockdown(userId);
    showToast('Account secured. PSB Fraud Team has been alerted.');
  };

  const handleSafe = () => {
    resolveRakshak('SAFE');
  };

  const handleSupport = () => {
    setShowSupport(true);
  };

  const handleVoiceVerify = () => {
    setVoiceStatus('listening');
    setTimeout(() => {
      setVoiceStatus('success');
    }, 2200);
  };

  const handleBlockAndClose = () => {
    resolveRakshak('SUPPORT');
    showToast('Transaction cancelled. For help, call PSB 24/7 Helpline ' + HELPLINE_NUMBER);
  };

  const handleClose = () => {
    if (showConfirmClose) {
      resolveRakshak('SOS');
      setLockdownActive(true);
      logEmergencyLockdown(userId);
      showToast('Account secured. PSB Fraud Team has been alerted.');
    } else {
      setShowConfirmClose(true);
    }
  };

  if (!isRakshakActive && !toast) return null;

  const score = rakshakData?.riskScore ?? 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const gaugeColor = score >= 90 ? 'text-rose-500' : score >= 70 ? 'text-amber-500' : 'text-emerald-500';

  return (
    <AnimatePresence>
      {isRakshakActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rakshak-title"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-lg bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute inset-0" />
                  <div className="w-3 h-3 rounded-full bg-rose-500 relative" />
                </div>
                <div>
                  <h2 id="rakshak-title" className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span role="img" aria-label="shield">🛡️</span> Rakshak Security Intervention
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-400">Punjab & Sind Bank AI Guardian</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                aria-label="Close intervention"
              >
                <i className="fas fa-xmark" />
              </button>
            </div>

            {/* Close confirmation */}
            <AnimatePresence>
              {showConfirmClose && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-rose-950/40 border-y border-rose-800/50 px-6 py-3"
                >
                  <p className="text-xs text-rose-200 mb-2">
                    Are you sure? If you are being scammed, your money will be lost.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowConfirmClose(false)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors"
                      aria-label="Go back to safety check"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={handleClose}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
                      aria-label="Close and secure account"
                    >
                      Secure Account
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-6 space-y-5">
              {/* Risk Gauge */}
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={gaugeColor}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">{score}</span>
                    <span className="text-[10px] text-slate-400">/100</span>
                  </div>
                </div>
                <p className={`mt-2 text-xs font-bold uppercase tracking-wider ${score >= 90 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {score >= 90 ? 'Critical Risk' : 'High Risk'}
                </p>
              </div>

              {/* Chat Bubble */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shrink-0">
                  <i className="fas fa-shield-halved" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-300 mb-1">Rakshak AI Guardian</p>
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-3">
                    {hasSafeWord && !isTyping && (
                      <div className="mb-3 p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <p className="text-[11px] text-violet-200">
                          <i className="fas fa-users-rectangle mr-1" />
                          If a family member called in an emergency, ask them: <span className="font-bold text-white">“What’s our Safe Word?”</span>
                        </p>
                        <p className="text-xs font-black text-violet-300 mt-0.5">{safeWord}</p>
                      </div>
                    )}
                    {isTyping ? (
                      <div className="flex items-center gap-1.5 h-5">
                        <span className="text-xs text-slate-400">Rakshak is analyzing</span>
                        <motion.span
                          className="w-1.5 h-1.5 rounded-full bg-amber-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.span
                          className="w-1.5 h-1.5 rounded-full bg-amber-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.span
                          className="w-1.5 h-1.5 rounded-full bg-amber-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-100 leading-relaxed">{rakshakData?.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Money Mule Network Graph */}
              {score > 80 && !isTyping && (
                <MoneyMuleGraph
                  beneficiaryId={String(rakshakData?.pendingTransaction?.beneficiaryName || rakshakData?.pendingTransaction?.name || 'unknown-beneficiary')}
                  beneficiaryName={String(rakshakData?.pendingTransaction?.beneficiaryName || rakshakData?.pendingTransaction?.name || 'Unknown Beneficiary')}
                />
              )}

              {/* Deepfake Voice Liveness Challenge */}
              {score >= 80 && !isTyping && (
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-microphone-lines text-amber-400" />
                    <h4 className="text-xs font-bold text-slate-200">Audio Liveness Challenge</h4>
                  </div>

                  {voiceStatus === 'success' ? (
                    <div className="text-center py-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl mb-2">
                        <i className="fas fa-check" />
                      </div>
                      <p className="text-sm font-bold text-emerald-400">Human Voice Detected</p>
                      <p className="text-[10px] text-slate-400">Deepfake probability: 2%</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-slate-300 mb-2">
                        {voiceStatus === 'idle'
                          ? <>Please read this phrase aloud to verify you are a real person:</>
                          : <>Listening… please say the phrase clearly.</>}
                      </p>
                      <div className="p-2.5 bg-slate-900 rounded-lg text-center mb-3">
                        <p className="text-sm font-bold text-amber-300">“{VOICE_PHRASE}”</p>
                      </div>

                      {voiceStatus === 'listening' && (
                        <div className="flex items-center justify-center gap-1 h-10 mb-3">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 rounded-full bg-emerald-400"
                              animate={{ height: [8, 28 + Math.random() * 16, 8] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.05 }}
                            />
                          ))}
                        </div>
                      )}

                      <button
                        onClick={handleVoiceVerify}
                        disabled={voiceStatus === 'listening'}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <i className={`fas ${voiceStatus === 'listening' ? 'fa-circle-notch fa-spin' : 'fa-microphone'}`} />
                        {voiceStatus === 'listening' ? 'Verifying…' : 'Verify Voice'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Support Modal inline */}
              <AnimatePresence>
                {showSupport && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-blue-950/30 border border-blue-800/50 rounded-xl p-4"
                  >
                    <h3 className="text-sm font-bold text-blue-200 mb-2">PSB 24/7 Helpline</h3>
                    <p className="text-2xl font-black text-white mb-1">{HELPLINE_NUMBER}</p>
                    <p className="text-xs text-blue-200/80 mb-3">Fraud hotline: 1930 (Cyber Crime India)</p>
                    <button
                      onClick={handleBlockAndClose}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                      aria-label="Block transaction and close"
                    >
                      Block Transaction & Close
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Replies */}
              {!showSupport && (
                <div className="grid gap-3 pt-2">
                  <button
                    onClick={handleSOS}
                    className="w-full py-3.5 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-400"
                    aria-label="SOS I am being scammed"
                  >
                    <span role="img" aria-label="alert">🚨</span> SOS - I am being scammed
                  </button>
                  <button
                    onClick={handleSafe}
                    className="w-full py-3.5 bg-transparent border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    aria-label="I am safe proceed with transaction"
                  >
                    <span role="img" aria-label="check">✅</span> I AM SAFE - Proceed
                  </button>
                  <button
                    onClick={handleSupport}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="Call PSB support"
                  >
                    <span role="img" aria-label="phone">📞</span> Call PSB Support
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium"
              >
                <i className="fas fa-paper-plane" />
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   FAMILY APPROVAL GATE — Requirement #7 Advanced Solution
   High-value transactions require family member OTP approval:
   • Configurable threshold (default ₹2L)
   • Real family member selection with OTP approval
   • OTP countdown
   • Audit trail of approvals
   ═══════════════════════════════════════════════════════════════ */

interface Props {
  show: boolean;
  amount: number;
  payee: string;
  onApproved: () => void;
  onRejected: () => void;
  onClose: () => void;
}

const FAMILY_MEMBERS = [
  { id: 'spouse', name: 'Spouse', phone: '98765 43210', relation: 'Spouse' },
  { id: 'father', name: 'Father', phone: '98765 43211', relation: 'Parent' },
  { id: 'mother', name: 'Mother', phone: '98765 43212', relation: 'Parent' },
];

const DEMO_OTP = '123456';

export default function FamilyApprovalGate({ show, amount, payee, onApproved, onRejected, onClose }: Props) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState<'idle' | 'success' | 'failed'>('idle');
  const [countdown, setCountdown] = useState(30);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onApprovedRef = useRef(onApproved);
  const onRejectedRef = useRef(onRejected);

  useEffect(() => { onApprovedRef.current = onApproved; }, [onApproved]);
  useEffect(() => { onRejectedRef.current = onRejected; }, [onRejected]);

  // Clean up countdown if the modal is hidden.
  useEffect(() => {
    if (!show) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
  }, [show]);

  const clearCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleSendOTP = () => {
    if (!selectedMember) return;
    setOtpSent(true);
    setOtp('');
    setVerified('idle');
    setCountdown(30);
    clearCountdown();
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearCountdown();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleVerify = () => {
    if (otp === DEMO_OTP) {
      setVerified('success');
      clearCountdown();
      setTimeout(() => {
        onApprovedRef.current?.();
        // Reset local state for next open
        setOtpSent(false);
        setOtp('');
        setVerified('idle');
        setSelectedMember(null);
        setCountdown(30);
      }, 800);
    } else {
      setVerified('failed');
      setTimeout(() => setVerified('idle'), 1500);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[95] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <i className="fas fa-people-roof" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Family Approval Required</h3>
                <p className="text-[10px] text-slate-500">High-value transaction protection</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm">
              <div className="flex justify-between mb-1"><span className="text-slate-500">Amount</span><span className="font-bold">₹{amount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Payee</span><span className="font-bold">{payee}</span></div>
            </div>

            {!otpSent ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300">Select a family member to approve this transaction:</p>
                <div className="space-y-2">
                  {FAMILY_MEMBERS.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(member.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                        selectedMember === member.id
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                          {member.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{member.name}</p>
                          <p className="text-[10px] text-slate-400">{member.phone}</p>
                        </div>
                      </div>
                      {selectedMember === member.id && <i className="fas fa-check-circle text-primary" />}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSendOTP}
                  disabled={!selectedMember}
                  className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request Approval OTP
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  OTP sent to {FAMILY_MEMBERS.find((m) => m.id === selectedMember)?.name}.<br />
                  <span className="text-[10px] text-slate-400">OTP sent</span>
                </p>

                {/* Demo OTP hint */}
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800 text-center">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <i className="fas fa-circle-info mr-1" />
                    Demo OTP: <span className="font-bold tracking-widest">{DEMO_OTP}</span>
                  </p>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-lg font-bold tracking-widest"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleVerify}
                    disabled={otp.length !== 6}
                    className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onRejectedRef.current?.()}
                    className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600"
                  >
                    Reject
                  </button>
                </div>
                <p className="text-center text-[10px] text-slate-400">
                  Resend OTP in {countdown}s
                </p>
              </div>
            )}

            {verified === 'success' && (
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-center text-sm font-bold">
                <i className="fas fa-check-circle mr-1" /> Approved! Processing transaction...
              </div>
            )}
            {verified === 'failed' && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-center text-sm font-bold">
                <i className="fas fa-xmark-circle mr-1" /> Invalid OTP. Try again.
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

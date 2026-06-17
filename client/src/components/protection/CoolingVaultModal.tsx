import { useState, useEffect, useCallback, useRef } from 'react';
import { logAudit } from '../../utils/auditLogger';
import { useWealthStore } from '../../store/wealthStore';
import { useAuth } from '../../context/AuthContext';
import { lockFunds, isLocked, releaseLock, type SmartContractLock } from '../../services/blockchainService';

interface Props {
  show: boolean;
  onClose: () => void;
  amount?: number;
  payee?: string;
  durationSec?: number;
}

const TOTAL_SECONDS = 30;

export default function CoolingVaultModal({ show, onClose, amount = 250000, payee = 'new payee', durationSec = TOTAL_SECONDS }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(durationSec);
  const [phase, setPhase] = useState<'holding' | 'ready' | 'completed' | 'cancelled'>('holding');
  const [checked, setChecked] = useState(false);
  const [smartLock, setSmartLock] = useState<SmartContractLock | null>(null);
  const addTransaction = useWealthStore((s) => s.addTransaction);
  const { state: authState } = useAuth();
  const txIdRef = useRef('tx-' + Date.now());
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!show) {
      setSecondsLeft(TOTAL_SECONDS);
      setPhase('holding');
      setChecked(false);
      return;
    }
    const refId = 'CV-' + Date.now().toString(36).toUpperCase();
    txIdRef.current = 'tx-' + Date.now();
    const summary = `Cooling vault activated for transfer of ₹${amount.toLocaleString()} to ${payee}`;
    logAudit(
      summary,
      { newDevice: false, rushedAction: true, unusualAmount: true, otpRetries: false, firstTimeInvest: false, abnormalBehavior: false },
      55,
      {
        level: 'MEDIUM',
        action: 'WARN',
        cooldown: durationSec,
        message: summary,
        referenceId: refId,
      }
    );
    // Add DELAYED transaction once when the modal opens.
    addTransaction({
      id: txIdRef.current,
      date: new Date().toISOString().split('T')[0],
      description: `Delayed: ₹${amount.toLocaleString()} to ${payee}`,
      category: 'Transfer',
      amount,
      type: 'debit',
      status: 'DELAYED',
      riskLevel: 'MEDIUM',
      score: 55,
      signals: { newDevice: false, rushedAction: true, unusualAmount: true, otpRetries: false, firstTimeInvest: false, abnormalBehavior: false },
      decision: { level: 'MEDIUM', action: 'WARN', cooldown: durationSec, message: summary, referenceId: refId },
      referenceId: refId,
    });

    // Deploy a virtual smart-contract timelock
    lockFunds(authState.userId || 'demo-user', amount, durationSec, txIdRef.current).then((lock) => {
      setSmartLock(lock);
    });
  }, [show, addTransaction, authState.userId, amount, payee, durationSec]);

  useEffect(() => {
    if (!show || phase !== 'holding') return;
    if (secondsLeft <= 0) {
      setPhase('ready');
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [show, phase, secondsLeft]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const scheduleClose = (ms: number) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      onCloseRef.current?.();
      // Reset state after close animation
      setTimeout(() => {
        setSecondsLeft(durationSec);
        setPhase('holding');
        setChecked(false);
      }, 300);
    }, ms);
  };

  const progress = ((durationSec - secondsLeft) / durationSec) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleProceed = useCallback(() => {
    if (smartLock && isLocked(smartLock.contractId)) {
      // Timelock still active — support override via checked confirmation
      if (!checked) return;
    }
    if (smartLock) releaseLock(smartLock.contractId);
    setPhase('completed');
    const refId = 'CV-PASS-' + Date.now().toString(36).toUpperCase();
    logAudit(
      'Cooling Vault - Transaction Proceed',
      { newDevice: false, rushedAction: true, unusualAmount: true, otpRetries: false, firstTimeInvest: false, abnormalBehavior: false },
      55,
      {
        level: 'MEDIUM',
        action: 'ALLOW',
        message: 'User proceeded with transfer after 30s cooling-off period.',
        referenceId: refId,
      }
    );
    addTransaction({
      id: txIdRef.current + '-complete',
      date: new Date().toISOString().split('T')[0],
      description: `Transfer: ₹${amount.toLocaleString()} to ${payee} (post cooling vault)`,
      category: 'Transfer',
      amount,
      type: 'debit',
      status: 'ALLOWED',
      riskLevel: 'LOW',
      referenceId: refId,
    });
    scheduleClose(1500);
  }, [addTransaction]);

  const handleCancel = useCallback(() => {
    setPhase('cancelled');
    const refId = 'CV-CANCEL-' + Date.now().toString(36).toUpperCase();
    logAudit(
      'Cooling Vault - Transaction Cancelled',
      { newDevice: false, rushedAction: true, unusualAmount: true, otpRetries: false, firstTimeInvest: false, abnormalBehavior: false },
      55,
      {
        level: 'LOW',
        action: 'BLOCK',
        message: 'User cancelled transfer during cooling-off period.',
        referenceId: refId,
      }
    );
    addTransaction({
      id: txIdRef.current + '-cancel',
      date: new Date().toISOString().split('T')[0],
      description: `Blocked: ₹${amount.toLocaleString()} to ${payee} (cancelled in cooling vault)`,
      category: 'Transfer',
      amount,
      type: 'debit',
      status: 'BLOCKED',
      riskLevel: 'MEDIUM',
      score: 55,
      signals: { newDevice: false, rushedAction: true, unusualAmount: true, otpRetries: false, firstTimeInvest: false, abnormalBehavior: false },
      decision: { level: 'LOW', action: 'BLOCK', message: 'User cancelled transfer during cooling-off period.', referenceId: refId },
      referenceId: refId,
    });
    scheduleClose(1200);
  }, [addTransaction]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[80] flex items-center justify-center p-4 animate-fade-in">
      <div
        className={`relative bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-md w-full overflow-hidden ${
          phase === 'holding' ? 'animate-pulse-border' : ''
        }`}
        style={{
          boxShadow: phase === 'holding' ? '0 0 0 4px rgba(245, 158, 11, 0.4), 0 25px 50px -12px rgba(0,0,0,0.5)' : undefined,
        }}
      >
        {/* Amber pulsing border effect */}
        {phase === 'holding' && (
          <div className="absolute inset-0 rounded-2xl border-4 border-accent/60 animate-ping pointer-events-none" />
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fas fa-hourglass-half text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Cooling Vault Active</h3>
              <p className="text-xs text-white/80">₹{amount.toLocaleString()} to {payee} held for security verification</p>
            </div>
          </div>
          <button onClick={handleCancel} className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Transaction details */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">
                <i className="fas fa-money-bill-transfer" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Transfer to New Payee</p>
                <p className="text-xs text-slate-500">Deepanshu Sharma → Vikram Mehta</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-slate-600">
              <span className="text-xs text-slate-500">Amount</span>
              <span className="text-lg font-bold text-slate-800 dark:text-white">₹2,50,000</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-slate-600">
              <span className="text-xs text-slate-500">Risk Level</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">MEDIUM</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-slate-600">
              <span className="text-xs text-slate-500">Triggers</span>
              <span className="text-xs text-rose-600 font-medium">New Payee + High Amount</span>
            </div>
            {smartLock && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                  <i className="fas fa-cube text-orange-500" /> Smart Contract Timelock
                </p>
                <p className="text-[10px] font-mono text-slate-600 dark:text-slate-300 break-all">
                  {smartLock.contractId}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Funds locked until {new Date(smartLock.expiresAt).toLocaleTimeString()}. The contract enforces the cooling-off period at code level.
                </p>
              </div>
            )}
          </div>

          {/* Countdown circle */}
          {phase === 'holding' && (
            <div className="flex flex-col items-center">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-amber-600">{secondsLeft}</span>
                  <span className="text-[10px] text-slate-400">seconds</span>
                </div>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium mt-3 animate-pulse">
                <i className="fas fa-shield-halved mr-1" />
                This transaction is on hold while we verify
              </p>
            </div>
          )}

          {phase === 'ready' && (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                <i className="fas fa-check-circle text-3xl text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Verification Complete</p>
              <p className="text-xs text-slate-500 mt-1">The 30-second cooling-off period has ended.</p>
              <label className="flex items-start gap-2 mt-4 cursor-pointer">
                <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 accent-primary" />
                <span className="text-xs text-slate-600 dark:text-slate-300">I confirm this is a legitimate transaction and I am not under duress.</span>
              </label>
            </div>
          )}

          {phase === 'completed' && (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                <i className="fas fa-check-circle text-3xl text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Transaction Approved</p>
              <p className="text-xs text-slate-500 mt-1">₹2,50,000 transfer processed successfully.</p>
            </div>
          )}

          {phase === 'cancelled' && (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-3">
                <i className="fas fa-times-circle text-3xl text-rose-500" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Transaction Cancelled</p>
              <p className="text-xs text-slate-500 mt-1">Your funds are safe. No money was transferred.</p>
            </div>
          )}

          {/* Statistic */}
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <i className="fas fa-chart-line text-primary mr-1" />
              <strong>67%</strong> of impulse fraud attempts are prevented by cooling-off delays
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {phase === 'holding' && (
              <>
                <button onClick={handleCancel} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                  Cancel Transaction
                </button>
                <button onClick={() => alert('Support team has been notified. A representative will contact you within 5 minutes.')} className="flex-1 py-2.5 border border-primary text-primary rounded-xl text-sm font-medium hover:bg-primary/5 transition-colors">
                  Contact Support
                </button>
              </>
            )}
            {phase === 'ready' && (
              <>
                <button onClick={handleCancel} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleProceed} disabled={!checked} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Proceed
                </button>
              </>
            )}
            {(phase === 'completed' || phase === 'cancelled') && (
              <button onClick={() => onCloseRef.current?.()} className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6); }
          50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
        }
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

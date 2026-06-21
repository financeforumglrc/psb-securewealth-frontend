import { useState, useEffect, useCallback } from 'react';
import { useSecurityActions } from '@/shared/context/SecurityContext';
import { performAttestation } from '@/shared/services/attestationService';

export default function TpmAttestation() {
  const { attestTpm, failTpm } = useSecurityActions();
  const [status, setStatus] = useState<'loading' | 'verified' | 'failed'>('loading');
  const [handle, setHandle] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const runAttestation = useCallback(async () => {
    try {
      const result = await performAttestation('tpm');
      setHandle(result.keyHandle);
      setChallenge(result.challenge);
      setSignature(result.signature);
      setStatus(result.verified ? 'verified' : 'failed');
      if (result.verified) {
        attestTpm(result.keyHandle);
      } else {
        failTpm();
      }
    } catch {
      setStatus('failed');
      failTpm();
    }
  }, [attestTpm, failTpm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runAttestation();
    }, 1500);
    return () => clearTimeout(timer);
  }, [runAttestation]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <i className="fas fa-microchip text-lg text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            TPM 2.0 Attestation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hardware root-of-trust verification
          </p>
        </div>
      </div>

      {status === 'loading' && (
        <div className="flex items-center gap-3 py-4">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Initializing TPM attestation…
          </span>
        </div>
      )}

      {status === 'verified' && (
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <i className="fas fa-check-circle" />
            TPM Attestation Verified
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              TPM Key Handle
            </p>
            <p className="font-mono text-sm text-slate-800 dark:text-slate-200">
              {handle}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Challenge
            </p>
            <p className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all">
              {challenge}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Attestation Signature (ECDSA P-256)
            </p>
            <p className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all">
              {signature}
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <i className="fas fa-lock mr-1" /> Private key is non-exportable; signature verified against generated public key.
          </p>
        </div>
      )}

      {status === 'failed' && (
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
            <i className="fas fa-exclamation-triangle" />
            TPM Attestation Failed
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Web Crypto could not generate a non-exportable attestation key. Possible unsupported context.
          </p>
        </div>
      )}
    </div>
  );
}

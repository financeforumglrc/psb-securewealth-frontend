import { useState, useEffect, useCallback } from 'react';
import { useSecurityActions } from '@/shared/context/SecurityContext';
import { performAttestation, isSecureContext } from '@/shared/services/attestationService';

export default function SecureEnclaveCheck() {
  const { verifyEnclave, failEnclave } = useSecurityActions();
  const [checking, setChecking] = useState(true);
  const [verified, setVerified] = useState(false);
  const [failed, setFailed] = useState(false);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [secureContext, setSecureContext] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const secure = isSecureContext();
        setSecureContext(secure);
        const result = await performAttestation('enclave');
        if (cancelled) return;
        setChallenge(result.challenge);
        setSignature(result.signature);
        setVerified(result.verified && secure);
        setChecking(false);
        if (result.verified && secure) {
          verifyEnclave();
        } else {
          failEnclave();
        }
      } catch {
        if (cancelled) return;
        setVerified(false);
        setFailed(true);
        setChecking(false);
        failEnclave();
      }
    }, 1000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [verifyEnclave, failEnclave]);

  const handleCompromised = useCallback(() => {
    setVerified(false);
    setFailed(true);
    setChecking(false);
    failEnclave();
  }, [failEnclave]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-dark-light">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
          <i className="fas fa-shield-alt" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Secure Enclave Attestation
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Hardware-backed key verification
          </p>
        </div>
      </div>

      {checking && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <i className="fas fa-circle-notch fa-spin" />
          Checking Secure Enclave…
        </div>
      )}

      {verified && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-success/10 p-3 text-success dark:bg-success/20">
          <i className="fas fa-check-circle mt-0.5" />
          <div className="text-sm font-medium">
            Secure Enclave Verified — keys are hardware-protected
          </div>
        </div>
      )}

      {failed && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-danger dark:bg-danger/20">
          <i className="fas fa-exclamation-triangle mt-0.5" />
          <div className="text-sm font-medium">
            Enclave attestation FAILED — possible jailbreak/root or insecure context
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-dark">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Secure Context (HTTPS)
          </p>
          <p className="break-all font-mono text-sm text-gray-800 dark:text-gray-200">
            {secureContext ? 'Verified' : 'Not verified'}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3 dark:bg-dark">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Attestation Challenge
          </p>
          <p className="break-all font-mono text-sm text-gray-800 dark:text-gray-200">
            {challenge ? `0x${challenge}` : '—'}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3 dark:bg-dark">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Signed Challenge
          </p>
          <p className="break-all font-mono text-sm text-gray-800 dark:text-gray-200">
            {signature ? `0x${signature}` : '—'}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={handleCompromised}
          disabled={checking}
          className="inline-flex items-center gap-2 rounded-lg border border-danger px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-danger dark:hover:bg-danger/20"
        >
          <i className="fas fa-bug" />
          Mark Compromised
        </button>

        {verified && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success dark:bg-success/20">
            <i className="fas fa-lock" />
            Hardware Protected
          </span>
        )}

        {failed && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-xs font-semibold text-danger dark:bg-danger/20">
            <i className="fas fa-unlock" />
            Compromised
          </span>
        )}
      </div>
    </div>
  );
}

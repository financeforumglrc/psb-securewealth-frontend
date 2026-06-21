import { useState, useCallback } from 'react';
import { useSecurityActions } from '@/shared/context/SecurityContext';
import { runRealPqTunnel } from '@/shared/services/postQuantumService';

export default function PostQuantumCrypto() {
  const { setPqTunnel } = useSecurityActions();
  const [loading, setLoading] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [ciphertext, setCiphertext] = useState<string | null>(null);
  const [sharedSecret, setSharedSecret] = useState<string | null>(null);
  const [encryptedPayload, setEncryptedPayload] = useState<string | null>(null);
  const [decryptedPayload, setDecryptedPayload] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRun = useCallback(async () => {
    setLoading(true);
    setSuccess(false);
    try {
      const result = await runRealPqTunnel();
      setPublicKey(result.publicKeyHex);
      setCiphertext(result.ciphertextHex);
      setSharedSecret(result.sharedSecretHex);
      setEncryptedPayload(result.encryptedPayloadHex);
      setDecryptedPayload(result.decryptedPayload);
      setSuccess(true);
      setPqTunnel(true);
    } catch (e) {
      console.error('ML-KEM tunnel failed', e);
    } finally {
      setLoading(false);
    }
  }, [setPqTunnel]);

  const mask = (val: string | null, visible = 8): string => {
    if (!val) return '—';
    if (val.length <= visible * 2) return val;
    return val.slice(0, visible) + '…' + val.slice(-visible);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-dark-light">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
          <i className="fas fa-key" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Post-Quantum Key Exchange
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real ML-KEM-768 (NIST FIPS 203) KEM + AES-GCM
          </p>
        </div>
      </div>

      {success && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-success/10 p-3 text-success dark:bg-success/20">
          <i className="fas fa-check-circle mt-0.5" />
          <div>
            <p className="text-sm font-medium">
              Quantum-Safe Tunnel Established — ML-KEM-768 successful
            </p>
            <p className="text-xs opacity-80 mt-0.5">
              Payload encrypted, transmitted, and decrypted end-to-end.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-dark">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Public Key
          </p>
          <p className="break-all font-mono text-sm text-gray-800 dark:text-gray-200">
            {mask(publicKey, 16)}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3 dark:bg-dark">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Ciphertext
          </p>
          <p className="break-all font-mono text-sm text-gray-800 dark:text-gray-200">
            {mask(ciphertext, 16)}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3 dark:bg-dark">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Shared Secret
          </p>
          <p className="break-all font-mono text-sm text-gray-800 dark:text-gray-200">
            {mask(sharedSecret, 12)}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3 dark:bg-dark">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Encrypted Payload (AES-GCM)
          </p>
          <p className="break-all font-mono text-sm text-gray-800 dark:text-gray-200">
            {mask(encryptedPayload, 16)}
          </p>
        </div>

        {decryptedPayload && (
          <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
              Decrypted Payload
            </p>
            <p className="break-all font-mono text-sm text-emerald-700 dark:text-emerald-200">
              {decryptedPayload}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handleRun}
        disabled={loading}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-secondary dark:text-dark dark:hover:bg-secondary/90"
      >
        {loading ? (
          <>
            <i className="fas fa-circle-notch fa-spin" />
            Running ML-KEM Exchange…
          </>
        ) : (
          <>
            <i className="fas fa-play" />
            Run Key Exchange
          </>
        )}
      </button>
    </div>
  );
}

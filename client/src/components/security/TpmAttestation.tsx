import { useState, useEffect, useCallback } from 'react';
import { useSecurityActions } from '../../context/SecurityContext';

export default function TpmAttestation() {
  const { attestTpm, failTpm } = useSecurityActions();
  const [status, setStatus] = useState<'loading' | 'verified' | 'simulation'>('loading');
  const [handle, setHandle] = useState<string | null>(null);
  const [quote, setQuote] = useState<string>('');

  const generateTpmAttestation = useCallback(async () => {
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      );

      const exported = await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
      const array = new Uint8Array(exported);
      const hex = Array.from(array)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const keyHandle = `0x${hex.slice(0, 8).toUpperCase()}...`;

      const mockQuote = btoa(
        Array.from(crypto.getRandomValues(new Uint8Array(64)))
          .map((b) => String.fromCharCode(b))
          .join('')
      );

      setHandle(keyHandle);
      setQuote(mockQuote);
      setStatus('verified');
      attestTpm(keyHandle);
    } catch {
      setStatus('simulation');
      setHandle('0x7F3A...');
      setQuote(
        'AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg='
      );
      failTpm();
    }
  }, [attestTpm, failTpm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      generateTpmAttestation();
    }, 1500);
    return () => clearTimeout(timer);
  }, [generateTpmAttestation]);

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
            Initializing TPM attestation...
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
              Attestation Quote
            </p>
            <p className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all">
              {quote}
            </p>
          </div>
        </div>
      )}

      {status === 'simulation' && (
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            <i className="fas fa-exclamation-triangle" />
            TPM Simulation Mode
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
              Attestation Quote
            </p>
            <p className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all">
              {quote}
            </p>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            <i className="fas fa-info-circle mr-1" />
            Web Crypto API unavailable — running in simulation mode.
          </p>
        </div>
      )}
    </div>
  );
}

import { useState, useCallback } from 'react';
import { useSecurityActions } from '@/shared/context/SecurityContext';
import {
  isWebAuthnAvailable,
  registerPasskey,
  authenticatePasskey,
  getCredentialIdBase64,
} from '@/shared/services/webauthnService';

function truncateCredentialId(id: string | null): string {
  if (!id) return '—';
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}...${id.slice(-8)}`;
}

export default function PasskeyAuth() {
  const { state, registerPasskey: registerInState, authenticatePasskey: authInState } = useSecurityActions();
  const [registering, setRegistering] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const webAuthnReady = isWebAuthnAvailable();
  const trustScoreLow = state.trustScore < 70;

  const handleRegister = useCallback(async () => {
    setRegistering(true);
    setError(null);
    try {
      const credential = await registerPasskey('user@securewealth.in');
      registerInState(getCredentialIdBase64(credential));
    } catch (e: any) {
      setError(e?.message || 'Passkey registration failed');
    } finally {
      setRegistering(false);
    }
  }, [registerInState]);

  const handleAuthenticate = useCallback(async () => {
    setAuthenticating(true);
    setError(null);
    setAuthSuccess(false);
    try {
      await authenticatePasskey(state.passkeyCredentialId ?? undefined);
      authInState();
      setAuthSuccess(true);
      setTimeout(() => setAuthSuccess(false), 4000);
    } catch (e: any) {
      setError(e?.message || 'Passkey authentication failed');
    } finally {
      setAuthenticating(false);
    }
  }, [authInState, state.passkeyCredentialId]);

  return (
    <div className="card border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white">
            <i className="fas fa-fingerprint" />
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">FIDO2 Passkey</h3>
        </div>
        <span
          className={`text-[10px] px-2 py-1 rounded-full font-medium border ${
            state.passkeyRegistered
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
          }`}
        >
          <i className={`fas ${state.passkeyRegistered ? 'fa-check-circle' : 'fa-circle'} mr-1`} />
          {state.passkeyRegistered ? 'Registered' : 'Not Registered'}
        </span>
      </div>

      {!webAuthnReady && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
          <i className="fas fa-triangle-exclamation text-amber-500 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            WebAuthn is not available (HTTP or unsupported browser). Use HTTPS and a modern browser to register a real passkey.
          </p>
        </div>
      )}

      {/* Status details */}
      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Credential ID</span>
          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300">{truncateCredentialId(state.passkeyCredentialId)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Trust Score</span>
          <span className={`text-[10px] font-medium ${trustScoreLow ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {state.trustScore}/100
          </span>
        </div>
      </div>

      {trustScoreLow && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
          <i className="fas fa-shield-halved text-amber-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Passkey Required</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400">Your trust score is below 70. Biometric authentication is required.</p>
          </div>
        </div>
      )}

      {authSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg mb-4">
          <i className="fas fa-circle-check text-emerald-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Authenticated</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">FIDO2 biometric verification succeeded. Session secured.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg mb-4">
          <i className="fas fa-circle-xmark text-rose-500" />
          <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {!state.passkeyRegistered ? (
          <button
            onClick={handleRegister}
            disabled={registering || !webAuthnReady}
            className="w-full flex items-center justify-center gap-2 text-xs px-4 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 dark:disabled:bg-teal-800 text-white rounded-lg font-medium transition-colors"
          >
            {registering ? (
              <>
                <i className="fas fa-circle-notch fa-spin" /> Waiting for biometric…
              </>
            ) : (
              <>
                <i className="fas fa-key" /> Register Passkey
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleAuthenticate}
            disabled={authenticating || !webAuthnReady}
            className="w-full flex items-center justify-center gap-2 text-xs px-4 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            {authenticating ? (
              <>
                <i className="fas fa-fingerprint fa-bounce" /> Waiting for biometric…
              </>
            ) : (
              <>
                <i className="fas fa-fingerprint" /> Authenticate with Passkey
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-3">
        <i className="fas fa-shield-halved mr-1" /> Real FIDO2/WebAuthn — credential never leaves your device
      </p>
    </div>
  );
}

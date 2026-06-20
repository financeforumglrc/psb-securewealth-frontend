import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { backendApi } from '../../lib/backendApi';

interface Props {
  onComplete: () => void;
}

export default function AACallbackHandler({ onComplete }: Props) {
  const [status, setStatus] = useState<'processing' | 'active' | 'error'>('processing');
  const [message, setMessage] = useState('Verifying your Account Aggregator consent...');
  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get('requestId');
    const setError = (msg: string) => {
      if (cancelled) return;
      setStatus('error');
      setMessage(msg);
    };

    async function run() {
      if (!requestId) {
        setError('No consent request ID found in the callback URL.');
        return;
      }

      // Find the local consent that matches the SETU request ID.
      const consentsRes = await backendApi.getAaConsents();
      if (cancelled) return;
      const match = (consentsRes.data?.data || []).find(
        (c: any) => c.setu_request_id === requestId || c.consent_id === requestId
      );
      if (!match) {
        setError('Consent not found. Please try linking your account again.');
        return;
      }

      // Poll status up to ~30 seconds.
      let attempts = 0;
      const maxAttempts = 15;
      while (attempts < maxAttempts) {
        const statusRes = await backendApi.getAaConsentStatus(match.id);
        if (cancelled) return;
        const consentStatus = statusRes.data?.data?.status;
        if (consentStatus === 'active') {
          break;
        }
        if (consentStatus === 'revoked') {
          setError('Consent was rejected or revoked. Please try again.');
          return;
        }
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }

      if (cancelled) return;

      // Sync accounts + transactions.
      const syncRes = await backendApi.aaSync();
      if (!cancelled) {
        if (syncRes.ok) {
          setStatus('active');
          setMessage('Consent approved! Your SecureWealth Twin is now syncing your accounts.');
          // Give the user a moment to read the success message.
          setTimeout(() => completeRef.current(), 1500);
        } else {
          setError(syncRes.data?.error || 'Sync failed after consent approval.');
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-psb-bg dark:bg-[#0b1120] flex flex-col items-center justify-center p-6 text-psb-text dark:text-slate-100">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-primary-dark shadow-2xl shadow-primary/30 flex items-center justify-center mb-8"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-secondary/30 border-t-secondary"
        />
        {status === 'error' ? (
          <AlertCircle className="w-10 h-10 text-white" />
        ) : status === 'active' ? (
          <CheckCircle2 className="w-10 h-10 text-white" />
        ) : (
          <Shield className="w-10 h-10 text-white" />
        )}
      </motion.div>

      <h2 className="text-2xl font-bold mb-2 text-center">Account Aggregator Callback</h2>
      <p className="text-sm text-psb-muted dark:text-slate-400 mb-6 text-center max-w-md">
        {message}
      </p>

      {status === 'processing' && (
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      )}

      {status === 'error' && (
        <button
          onClick={() => completeRef.current()}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90"
        >
          Continue to Dashboard
        </button>
      )}
    </div>
  );
}

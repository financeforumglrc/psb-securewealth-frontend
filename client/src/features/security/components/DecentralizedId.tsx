import { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { useSecurityActions } from '@/shared/context/SecurityContext';
import {
  createDidCredential,
  loadStoredCredential,
  verifyDidCredential,
  getDidQrData,
  type DidCredential,
} from '@/shared/services/didService';

export default function DecentralizedId() {
  const { state, issueDid } = useSecurityActions();
  const [verified, setVerified] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [stored, setStored] = useState<DidCredential | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const existing = loadStoredCredential();
    if (existing) {
      setStored(existing);
      issueDid(existing.did);
    }
  }, [issueDid]);

  useEffect(() => {
    if (stored && canvasRef.current) {
      const data = getDidQrData(stored);
      QRCode.toCanvas(canvasRef.current, data, { width: 160, margin: 2 })
        .catch((err) => console.error('QR generation failed', err));
      QRCode.toDataURL(data, { width: 320, margin: 2 })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(null));
    }
  }, [stored]);

  const handleIssue = useCallback(async () => {
    const credential = await createDidCredential();
    setStored(credential);
    issueDid(credential.did);
  }, [issueDid]);

  const handleVerify = useCallback(async () => {
    if (!stored) return;
    setScanning(true);
    const ok = await verifyDidCredential(stored);
    setScanning(false);
    setVerified(ok);
  }, [stored]);

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
        <i className="fas fa-id-card text-primary mr-2" />
        Decentralized Identity
      </h3>

      {!stored ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
            <i className="fas fa-fingerprint text-2xl" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            No verifiable credential issued yet.
          </p>
          <button
            onClick={handleIssue}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <i className="fas fa-plus-circle mr-2" />
            Issue Verifiable Credential
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <canvas
              ref={canvasRef}
              width={160}
              height={160}
              className="w-40 h-40 rounded-lg border border-slate-200 dark:border-slate-600"
            />
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <i className="fas fa-shield-halved" />
              ECDSA P-256 Signed VC
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">DID URI</p>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">
              {state.didUri}
            </p>
          </div>

          {!verified ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-center">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-2">
                <i className="fas fa-qrcode text-lg" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                Scan to Verify
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Verify the cryptographic signature on this credential.
              </p>
              <button
                onClick={handleVerify}
                disabled={scanning}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {scanning ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin mr-2" />
                    Verifying signature…
                  </>
                ) : (
                  <>
                    <i className="fas fa-mobile-screen-button mr-2" />
                    Verify Identity
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center animate-fade-in">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-2">
                <i className="fas fa-check text-lg" />
              </div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                Cryptographic Signature Verified
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                DID verified with ECDSA P-256 — no personal data revealed.
              </p>
            </div>
          )}

          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download="securewealth-did.png"
              className="block text-center text-xs text-primary hover:underline"
            >
              <i className="fas fa-download mr-1" /> Download VC QR
            </a>
          )}
        </div>
      )}
    </div>
  );
}

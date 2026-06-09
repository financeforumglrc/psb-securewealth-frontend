import { useState, useRef, useEffect } from 'react';
import { useSecurityActions } from '../../context/SecurityContext';

function drawFakeQR(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const size = canvas.width;
  const cells = 25;
  const cellSize = size / cells;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  const drawFinder = (row: number, col: number) => {
    // Outer black 7x7
    ctx.fillStyle = '#000000';
    ctx.fillRect(col * cellSize, row * cellSize, 7 * cellSize, 7 * cellSize);
    // White ring 5x5
    ctx.fillStyle = '#ffffff';
    ctx.fillRect((col + 1) * cellSize, (row + 1) * cellSize, 5 * cellSize, 5 * cellSize);
    // Black ring 3x3
    ctx.fillStyle = '#000000';
    ctx.fillRect((col + 2) * cellSize, (row + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    // White center 1x1
    ctx.fillStyle = '#ffffff';
    ctx.fillRect((col + 3) * cellSize, (row + 3) * cellSize, cellSize, cellSize);
  };

  drawFinder(0, 0);
  drawFinder(0, cells - 7);
  drawFinder(cells - 7, 0);

  // Random data modules
  ctx.fillStyle = '#000000';
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (
        (r < 7 && c < 7) ||
        (r < 7 && c >= cells - 7) ||
        (r >= cells - 7 && c < 7)
      ) {
        continue;
      }
      if (Math.random() > 0.5) {
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }
}

export default function DecentralizedId() {
  const { state, issueDid } = useSecurityActions();
  const [verified, setVerified] = useState(false);
  const [scanning, setScanning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (state.didIssued && canvasRef.current) {
      drawFakeQR(canvasRef.current);
    }
  }, [state.didIssued]);

  const handleIssue = () => {
    const id = Math.random().toString(36).substring(2, 14);
    const uri = `did:securewealth:${id}`;
    issueDid(uri);
  };

  const handleVerify = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setVerified(true);
    }, 1500);
  };

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
        <i className="fas fa-id-card text-primary mr-2" />
        Decentralized Identity
      </h3>

      {!state.didIssued ? (
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
              VC Signed by: SecureWealth Bank
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
                Simulate a verifier scanning your credential.
              </p>
              <button
                onClick={handleVerify}
                disabled={scanning}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {scanning ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin mr-2" />
                    Verifying...
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
                Zero-Knowledge Proof Accepted
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                DID verified — no personal data revealed
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RegulatoryDisclaimer from '@/shared/components/ui/RegulatoryDisclaimer';

interface TxRequest {
  id: string;
  amount: number;
  recipient: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  deviceA: string;
  deviceB?: string;
  timestamp: number;
  riskScore: number;
}

const CHANNEL_NAME = 'psb-cross-device-approval';

function generateId() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function formatCurrency(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function deviceName() {
  const ua = navigator.userAgent;
  if (ua.includes('Mobile')) return 'Mobile Browser';
  if (ua.includes('Mac')) return 'MacBook / Safari';
  if (ua.includes('Win')) return 'Windows Desktop';
  return 'Trusted Device';
}

export default function CrossDeviceApproval() {
  const [role, setRole] = useState<'initiator' | 'approver'>('initiator');
  const [amount, setAmount] = useState('500000');
  const [recipient, setRecipient] = useState('Vendor Pvt Ltd');
  const [purpose, setPurpose] = useState('Medical equipment purchase');
  const [request, setRequest] = useState<TxRequest | null>(null);
  const [inputId, setInputId] = useState('');
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const [showPasskey, setShowPasskey] = useState(false);

  const channel = useMemo(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return null;
    return new BroadcastChannel(CHANNEL_NAME);
  }, []);

  useEffect(() => {
    if (!channel) return;
    channel.onmessage = (event) => {
      const data = event.data as { type: string; payload: TxRequest | string };
      if (data.type === 'tx-request') {
        setRequest(data.payload as TxRequest);
        addAudit(`Received request ${(data.payload as TxRequest).id}`);
      } else if (data.type === 'tx-update') {
        const updated = data.payload as TxRequest;
        setRequest((prev) => (prev?.id === updated.id ? updated : prev));
        addAudit(`Status updated: ${updated.status.toUpperCase()}`);
      }
    };
    return () => channel.close();
  }, [channel]);

  useEffect(() => {
    const saved = localStorage.getItem('psb-cross-device-request');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as TxRequest;
        if (parsed.status === 'pending') setRequest(parsed);
      } catch {}
    }
  }, []);

  const addAudit = (message: string) => {
    setAuditLog((prev) => [`${new Date().toLocaleTimeString('en-IN')} — ${message}`, ...prev].slice(0, 8));
  };

  const riskScore = useMemo(() => {
    const num = Number(amount) || 0;
    if (num >= 500000) return 78;
    if (num >= 100000) return 52;
    return 28;
  }, [amount]);

  const initiateRequest = () => {
    const newRequest: TxRequest = {
      id: generateId(),
      amount: Number(amount) || 0,
      recipient,
      purpose,
      status: 'pending',
      deviceA: deviceName(),
      timestamp: Date.now(),
      riskScore,
    };
    setRequest(newRequest);
    localStorage.setItem('psb-cross-device-request', JSON.stringify(newRequest));
    channel?.postMessage({ type: 'tx-request', payload: newRequest });
    addAudit(`Initiated request ${newRequest.id}`);
  };

  const loadRequestById = () => {
    const saved = localStorage.getItem('psb-cross-device-request');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as TxRequest;
      if (parsed.id.toLowerCase() === inputId.trim().toLowerCase()) {
        setRequest(parsed);
        addAudit(`Loaded request ${parsed.id}`);
      }
    } catch {}
  };

  const updateStatus = (status: 'approved' | 'rejected') => {
    if (!request) return;
    const updated: TxRequest = {
      ...request,
      status,
      deviceB: deviceName(),
    };
    setRequest(updated);
    localStorage.setItem('psb-cross-device-request', JSON.stringify(updated));
    channel?.postMessage({ type: 'tx-update', payload: updated });
    setShowPasskey(false);
    addAudit(`Approver ${status.toUpperCase()} request ${updated.id}`);
  };

  return (
    <div className="space-y-4">
      <RegulatoryDisclaimer compact />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-mobile-screen-button text-primary" /> Cross-Device Approval
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Initiate a high-risk transfer on one device and approve it on another.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setRole('initiator')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              role === 'initiator' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'
            }`}
          >
            Device A: Initiate
          </button>
          <button
            onClick={() => setRole('approver')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              role === 'approver' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'
            }`}
          >
            Device B: Approve
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {role === 'initiator' ? (
          <motion.div
            key="initiator"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-paper-plane text-blue-500" /> Initiate Transfer
              </h3>
              <div>
                <label className="text-xs text-slate-500 font-bold block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold block mb-1">Recipient</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold block mb-1">Purpose</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button
                onClick={initiateRequest}
                disabled={!!request && request.status === 'pending'}
                className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow disabled:opacity-50"
              >
                {request && request.status === 'pending' ? 'Approval Request Sent' : 'Request Approval'}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-black text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <i className="fas fa-shield-halved text-emerald-500" /> Device A Status
              </h3>
              {request ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Request ID</p>
                    <p className="text-base font-black text-slate-800 dark:text-white tracking-widest">{request.id}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Status</p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold ${
                        request.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : request.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${request.status === 'pending' ? 'bg-amber-500 animate-pulse' : request.status === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Details</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{formatCurrency(request.amount)} → {request.recipient}</p>
                    <p className="text-xs text-slate-500">{request.purpose}</p>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-400 text-xs">
                  No pending request. Create one on the left.
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="approver"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-check-double text-emerald-500" /> Approve Transfer
              </h3>
              {!request ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">Open this page on Device B in the same browser, or enter the Request ID from Device A.</p>
                  <input
                    type="text"
                    value={inputId}
                    onChange={(e) => setInputId(e.target.value)}
                    placeholder="Request ID (e.g. A1B2C3D4)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    onClick={loadRequestById}
                    className="w-full py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-sm font-black hover:bg-slate-700 transition-colors"
                  >
                    Load Request
                  </button>
                </div>
              ) : request.status !== 'pending' ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                  <p className="text-sm font-black text-slate-800 dark:text-white">Request {request.id}</p>
                  <p className="text-xs text-slate-500 mt-1">Already {request.status} on {request.deviceB || 'another device'}.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Risk Score</span>
                      <span className="text-sm font-black text-amber-700 dark:text-amber-300">{request.riskScore}/100</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-amber-200 dark:bg-amber-900/30 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${request.riskScore}%` }}
                        className="h-full bg-amber-500"
                      />
                    </div>
                    <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-1">
                      {request.amount >= 500000 ? 'High-value transaction. Second-device approval required.' : 'Standard verification.'}
                    </p>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Amount</span><span className="font-bold text-slate-800 dark:text-white">{formatCurrency(request.amount)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Recipient</span><span className="font-bold text-slate-800 dark:text-white">{request.recipient}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Purpose</span><span className="font-bold text-slate-800 dark:text-white">{request.purpose}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Initiated from</span><span className="font-bold text-slate-800 dark:text-white">{request.deviceA}</span></div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowPasskey(true)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-black shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-shadow"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus('rejected')}
                      className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-black shadow-lg shadow-rose-600/20 hover:shadow-rose-600/30 transition-shadow"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-black text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <i className="fas fa-list-check text-slate-500" /> Audit Trail
              </h3>
              {auditLog.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-slate-400 text-xs">No activity yet.</div>
              ) : (
                <ul className="space-y-2">
                  {auditLog.map((entry, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-300 font-mono border-l-2 border-primary pl-2">
                      {entry}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPasskey && request && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <i className="fas fa-fingerprint text-primary text-2xl" />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white mb-1">Approve with Passkey</h3>
              <p className="text-xs text-slate-500 mb-4">Verify your identity on Device B to release {formatCurrency(request.amount)}.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => updateStatus('approved')}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-black"
                >
                  Verify & Approve
                </button>
                <button
                  onClick={() => setShowPasskey(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

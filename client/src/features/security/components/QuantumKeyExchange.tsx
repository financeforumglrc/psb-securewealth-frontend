import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MlKem768 } from 'mlkem';
import RegulatoryDisclaimer from '@/shared/components/ui/RegulatoryDisclaimer';
import QuantumSocket, { generateRoomId } from '@/shared/services/quantumSocket';

const CHANNEL_NAME = 'psb-quantum-key-exchange';

function bufToHex(buf: Uint8Array | ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  }
  return new Uint8Array(bytes);
}

async function deriveAesKey(sharedSecret: Uint8Array): Promise<CryptoKey> {
  const keyBytes = await crypto.subtle.digest('SHA-256', sharedSecret as BufferSource);
  return crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function encryptMessage(sharedSecret: Uint8Array, message: string): Promise<string> {
  const aesKey = await deriveAesKey(sharedSecret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    new TextEncoder().encode(message)
  );
  const payload = new Uint8Array(iv.length + encrypted.byteLength);
  payload.set(iv, 0);
  payload.set(new Uint8Array(encrypted), iv.length);
  return bufToHex(payload);
}

async function decryptMessage(sharedSecret: Uint8Array, encryptedHex: string): Promise<string> {
  const aesKey = await deriveAesKey(sharedSecret);
  const payload = hexToBuf(encryptedHex);
  const iv = payload.slice(0, 12);
  const ciphertext = payload.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, ciphertext);
  return new TextDecoder().decode(decrypted);
}

interface QuantumState {
  publicKey?: string;
  secretKey?: string;
  ciphertext?: string;
  sharedSecretA?: string;
  sharedSecretB?: string;
  encryptedMessage?: string;
  decryptedMessage?: string;
  plainMessage?: string;
  receivedPublicKey?: string;
  receivedCiphertext?: string;
  receivedMessage?: string;
}

const LS_KEYS = {
  role: 'psb-qk-role',
  room: 'psb-qk-room',
  publicKey: 'psb-qk-public-key',
  ciphertext: 'psb-qk-ciphertext',
  message: 'psb-qk-message',
};

export default function QuantumKeyExchange() {
  const [role, setRole] = useState<'alice' | 'bob'>(() => {
    if (typeof window === 'undefined') return 'alice';
    return localStorage.getItem(LS_KEYS.role) === 'bob' ? 'bob' : 'alice';
  });
  const [roomId, setRoomId] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(LS_KEYS.room) || generateRoomId();
  });
  const [state, setState] = useState<QuantumState>(() => {
    if (typeof window === 'undefined') return {};
    return {
      receivedPublicKey: localStorage.getItem(LS_KEYS.publicKey) || undefined,
      receivedCiphertext: localStorage.getItem(LS_KEYS.ciphertext) || undefined,
      receivedMessage: localStorage.getItem(LS_KEYS.message) || undefined,
    };
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Hello from the quantum-safe future 🔐');
  const [logs, setLogs] = useState<string[]>([]);
  const [integrity, setIntegrity] = useState<'passed' | 'failed' | null>(null);
  const [tampered, setTampered] = useState(false);

  const publicKeyRef = useRef<HTMLTextAreaElement>(null);
  const ciphertextRef = useRef<HTMLTextAreaElement>(null);
  const encryptedMsgRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<QuantumSocket | null>(null);

  const handleRemoteMessage = (data: { type: string; payload: string }) => {
    if (data.type === 'public-key') {
      localStorage.setItem(LS_KEYS.publicKey, data.payload);
      setState((s) => ({ ...s, receivedPublicKey: data.payload }));
      addLog('Received public key from Device A');
    } else if (data.type === 'ciphertext') {
      localStorage.setItem(LS_KEYS.ciphertext, data.payload);
      setState((s) => ({ ...s, receivedCiphertext: data.payload }));
      addLog('Received ciphertext from Device B');
    } else if (data.type === 'message') {
      localStorage.setItem(LS_KEYS.message, data.payload);
      setState((s) => ({ ...s, receivedMessage: data.payload }));
      setIntegrity(null);
      setTampered(false);
      addLog(`Received encrypted message: ${data.payload.slice(0, 24)}…`);
    }
  };

  const channel = useMemo(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return null;
    return new BroadcastChannel(CHANNEL_NAME);
  }, []);

  const addLog = (msg: string) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString('en-IN')} — ${msg}`, ...prev].slice(0, 10));
  };

  useEffect(() => {
    localStorage.setItem(LS_KEYS.role, role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.room, roomId);
  }, [roomId]);

  useEffect(() => {
    socketRef.current?.close();
    if (!roomId) return;
    socketRef.current = new QuantumSocket(roomId, handleRemoteMessage);
    return () => { socketRef.current?.close(); };
  }, [roomId]);

  // Keep manual textarea refs in sync with received/auto-sync state so values
  // survive Framer Motion remounts and page refreshes.
  useEffect(() => {
    if (publicKeyRef.current && state.receivedPublicKey) {
      publicKeyRef.current.value = state.receivedPublicKey;
    }
  }, [state.receivedPublicKey]);

  useEffect(() => {
    if (ciphertextRef.current && state.receivedCiphertext) {
      ciphertextRef.current.value = state.receivedCiphertext;
    }
  }, [state.receivedCiphertext]);

  useEffect(() => {
    if (encryptedMsgRef.current && state.receivedMessage) {
      encryptedMsgRef.current.value = state.receivedMessage;
    }
  }, [state.receivedMessage]);

  useEffect(() => {
    if (!channel) return;
    channel.onmessage = (event) => {
      const data = event.data as { type: string; payload: string };
      handleRemoteMessage(data);
    };
    return () => channel.close();
  }, [channel]);

  const generateAliceKeys = async () => {
    setLoading(true);
    try {
      const kem = new MlKem768();
      const [publicKey, secretKey] = await kem.generateKeyPair();
      const publicKeyHex = bufToHex(publicKey);
      const secretKeyHex = bufToHex(secretKey);
      setState((s) => ({ ...s, publicKey: publicKeyHex, secretKey: secretKeyHex }));
      localStorage.setItem(LS_KEYS.publicKey, publicKeyHex);
      channel?.postMessage({ type: 'public-key', payload: publicKeyHex });
      socketRef.current?.publish('public-key', publicKeyHex);
      addLog('Device A generated ML-KEM-768 keypair');
    } catch (_) {
      addLog('Key generation failed');
    } finally {
      setLoading(false);
    }
  };

  const bobEncapsulate = async () => {
    const pk = publicKeyRef.current?.value.trim() || '';
    if (!pk) return;
    setLoading(true);
    try {
      const kem = new MlKem768();
      const [ciphertext, sharedSecret] = await kem.encap(hexToBuf(pk));
      const ciphertextHex = bufToHex(ciphertext);
      const sharedSecretHex = bufToHex(sharedSecret);
      setState((s) => ({ ...s, ciphertext: ciphertextHex, sharedSecretB: sharedSecretHex }));
      localStorage.setItem(LS_KEYS.ciphertext, ciphertextHex);
      channel?.postMessage({ type: 'ciphertext', payload: ciphertextHex });
      socketRef.current?.publish('ciphertext', ciphertextHex);
      addLog('Device B encapsulated shared secret with public key');
    } catch (_) {
      addLog('Encapsulation failed — check public key');
    } finally {
      setLoading(false);
    }
  };

  const aliceDecapsulate = async () => {
    const ct = ciphertextRef.current?.value.trim() || '';
    if (!ct || !state.secretKey) return;
    setLoading(true);
    try {
      const kem = new MlKem768();
      const sharedSecret = await kem.decap(hexToBuf(ct), hexToBuf(state.secretKey));
      const sharedSecretHex = bufToHex(sharedSecret);
      setState((s) => ({ ...s, sharedSecretA: sharedSecretHex }));
      addLog('Device A decapsulated shared secret from ciphertext');
    } catch (_) {
      addLog('Decapsulation failed');
    } finally {
      setLoading(false);
    }
  };

  const bobEncryptAndSend = async () => {
    if (!state.sharedSecretB) return;
    setLoading(true);
    try {
      const encrypted = await encryptMessage(hexToBuf(state.sharedSecretB), message);
      setState((s) => ({ ...s, encryptedMessage: encrypted, plainMessage: message }));
      localStorage.setItem(LS_KEYS.message, encrypted);
      channel?.postMessage({ type: 'message', payload: encrypted });
      socketRef.current?.publish('message', encrypted);
      addLog('Device B encrypted message with AES-GCM derived from shared secret');
    } catch (_) {
      addLog('Encryption failed');
    } finally {
      setLoading(false);
    }
  };

  const aliceDecrypt = async () => {
    const em = encryptedMsgRef.current?.value.trim() || state.encryptedMessage || '';
    if (!state.sharedSecretA || !em) return;
    setLoading(true);
    try {
      const decrypted = await decryptMessage(hexToBuf(state.sharedSecretA), em);
      setState((s) => ({ ...s, decryptedMessage: decrypted }));
      setIntegrity('passed');
      addLog('Device A decrypted message with AES-GCM');
    } catch (_) {
      setState((s) => ({ ...s, decryptedMessage: undefined }));
      setIntegrity('failed');
      addLog('AES-GCM authentication failed — ciphertext rejected');
    } finally {
      setLoading(false);
    }
  };

  const simulateTamper = () => {
    const current = encryptedMsgRef.current?.value.trim() || state.receivedMessage || state.encryptedMessage || '';
    if (!/^[0-9a-f]+$/i.test(current) || current.length < 16) return;
    const hexChars = '0123456789abcdef';
    const idx = Math.floor(current.length * 0.6);
    const orig = current[idx].toLowerCase();
    const flipped = hexChars[(hexChars.indexOf(orig) + 1) % 16];
    const tamperedHex = current.slice(0, idx) + flipped + current.slice(idx + 1);
    if (encryptedMsgRef.current) encryptedMsgRef.current.value = tamperedHex;
    setTampered(true);
    setIntegrity(null);
    setState((s) => ({ ...s, decryptedMessage: undefined }));
    addLog(`⚠️ Attacker modified 1 hex nibble at position ${idx} — ciphertext tampered`);
  };

  const secretsMatch = state.sharedSecretA && state.sharedSecretB && state.sharedSecretA === state.sharedSecretB;

  return (
    <div className="space-y-4">
      <RegulatoryDisclaimer compact />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-atom text-primary" /> Quantum Key Exchange
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Real ML-KEM-768 (NIST FIPS 203) key exchange between two devices.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setRole('alice')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              role === 'alice' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'
            }`}
          >
            Device A: Alice
          </button>
          <button
            onClick={() => setRole('bob')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              role === 'bob' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'
            }`}
          >
            Device B: Bob
          </button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <label className="text-[10px] text-indigo-600 dark:text-indigo-300 uppercase font-bold block mb-1">Demo Room ID</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                placeholder="Enter room ID"
                className="flex-1 px-3 py-2 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-900 text-sm font-mono font-bold text-indigo-800 dark:text-indigo-200 outline-none focus:ring-2 focus:ring-indigo-400/30"
              />
              <button
                onClick={() => { setRoomId(generateRoomId()); addLog('New room created'); }}
                className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                New
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(roomId); addLog('Room ID copied'); }}
                disabled={!roomId}
                className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs font-bold disabled:opacity-50"
              >
                Copy
              </button>
            </div>
          </div>
          <p className="text-xs text-indigo-700 dark:text-indigo-300 sm:max-w-[220px]">
            Open this same room on Device B. Both devices can be on different networks/IPs.
          </p>
        </div>
      </div>

      {secretsMatch && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2"
        >
          <i className="fas fa-check-circle" />
          <span><strong>Quantum-safe tunnel established:</strong> both devices derived the identical shared secret.</span>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {role === 'alice' ? (
          <motion.div
            key="alice"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-key text-blue-500" /> Alice — Key Generation
              </h3>
              <button
                onClick={generateAliceKeys}
                disabled={loading || !!state.publicKey}
                className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow disabled:opacity-50"
              >
                {state.publicKey ? 'Keypair Generated' : 'Generate ML-KEM-768 Keypair'}
              </button>
              {state.publicKey && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Public Key (share with Bob)</p>
                    <p className="break-all font-mono text-xs text-slate-700 dark:text-slate-200 mt-1">{state.publicKey}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Ciphertext from Bob</p>
                    <textarea
                      ref={ciphertextRef}
                      placeholder="Paste Bob's ciphertext here..."
                      className="w-full mt-1 h-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>
                  <button
                    onClick={aliceDecapsulate}
                    disabled={loading || !state.secretKey}
                    className="w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-black disabled:opacity-50"
                  >
                    Decapsulate Shared Secret
                  </button>
                  {state.sharedSecretA && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-300 uppercase font-bold">Alice's Shared Secret</p>
                      <p className="break-all font-mono text-xs text-emerald-700 dark:text-emerald-300 mt-1">{state.sharedSecretA.slice(0, 32)}…</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-lock-open text-emerald-500" /> Alice — Decrypt Message
              </h3>
              {state.sharedSecretA ? (
                <>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Encrypted message from Bob</p>
                    <textarea
                      ref={encryptedMsgRef}
                      placeholder="Paste encrypted message here..."
                      className="w-full mt-1 h-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={aliceDecrypt}
                      disabled={loading}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black disabled:opacity-50"
                    >
                      Decrypt with AES-GCM
                    </button>
                    <button
                      onClick={simulateTamper}
                      disabled={loading}
                      title="Flip 1 hex nibble to simulate an attacker modifying the ciphertext in transit"
                      className="px-3 py-2 rounded-xl bg-amber-500 text-white text-xs font-black shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-shadow disabled:opacity-50"
                    >
                      ⚠️ Tamper
                    </button>
                  </div>
                  {tampered && integrity !== 'failed' && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                      <p className="text-[10px] text-amber-600 dark:text-amber-300 uppercase font-bold">Attacker Modified the Ciphertext</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">1 hex nibble flipped. Hit Decrypt to see AEAD reject it.</p>
                    </div>
                  )}
                  {integrity === 'failed' && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800"
                    >
                      <p className="text-[10px] text-rose-600 dark:text-rose-300 uppercase font-bold flex items-center gap-1">
                        <i className="fas fa-shield-halved" /> Integrity Check FAILED — Message Rejected
                      </p>
                      <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                        AES-GCM authentication tag mismatch. The tampered ciphertext was <strong>detected and rejected</strong> —
                        no forged data can ever be decrypted under this key.
                      </p>
                    </motion.div>
                  )}
                  {state.decryptedMessage && integrity === 'passed' && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-300 uppercase font-bold flex items-center gap-1">
                        <i className="fas fa-check-circle" /> Decrypted Message — Integrity Verified
                      </p>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-1">{state.decryptedMessage}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-400 text-xs">
                  Decapsulate the shared secret first.
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="bob"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-shield-halved text-rose-500" /> Bob — Encapsulate Secret
              </h3>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Alice's Public Key</p>
                <textarea
                  ref={publicKeyRef}
                  placeholder="Paste Alice's public key here..."
                  className="w-full mt-1 h-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <button
                onClick={bobEncapsulate}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-rose-600 text-white text-sm font-black shadow-lg shadow-rose-600/20 hover:shadow-rose-600/30 transition-shadow disabled:opacity-50"
              >
                Encapsulate Shared Secret
              </button>
              {state.ciphertext && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Ciphertext (send to Alice)</p>
                  <p className="break-all font-mono text-xs text-slate-700 dark:text-slate-200 mt-1">{state.ciphertext}</p>
                </div>
              )}
              {state.sharedSecretB && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-300 uppercase font-bold">Bob's Shared Secret</p>
                  <p className="break-all font-mono text-xs text-emerald-700 dark:text-emerald-300 mt-1">{state.sharedSecretB.slice(0, 32)}…</p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-lock text-emerald-500" /> Bob — Send Encrypted Message
              </h3>
              {state.sharedSecretB ? (
                <>
                  <div>
                    <label className="text-xs text-slate-500 font-bold block mb-1">Message</label>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <button
                    onClick={bobEncryptAndSend}
                    disabled={loading}
                    className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-black disabled:opacity-50"
                  >
                    Encrypt & Send
                  </button>
                  {state.encryptedMessage && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Encrypted Payload (AES-GCM)</p>
                      <p className="break-all font-mono text-xs text-slate-700 dark:text-slate-200 mt-1">{state.encryptedMessage.slice(0, 64)}…</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-400 text-xs">
                  Encapsulate the shared secret first.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-black text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <i className="fas fa-list-check text-slate-500" /> Protocol Log
        </h3>
        {logs.length === 0 ? (
          <div className="text-xs text-slate-400">No activity yet.</div>
        ) : (
          <ul className="space-y-2">
            {logs.map((log, i) => (
              <li key={i} className="text-xs text-slate-600 dark:text-slate-300 font-mono border-l-2 border-primary pl-2">
                {log}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

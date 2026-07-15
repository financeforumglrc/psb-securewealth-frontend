import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MlKem768 } from 'mlkem';
import RegulatoryDisclaimer from '@/shared/components/ui/RegulatoryDisclaimer';

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
}

export default function QuantumKeyExchange() {
  const [role, setRole] = useState<'alice' | 'bob'>('alice');
  const [state, setState] = useState<QuantumState>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Hello from the quantum-safe future 🔐');
  const [inputPublicKey, setInputPublicKey] = useState('');
  const [inputCiphertext, setInputCiphertext] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const channel = useMemo(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return null;
    return new BroadcastChannel(CHANNEL_NAME);
  }, []);

  useEffect(() => {
    if (!channel) return;
    channel.onmessage = (event) => {
      const data = event.data as { type: string; payload: string };
      if (data.type === 'public-key') {
        setInputPublicKey(data.payload);
        addLog('Received public key from Device A');
      } else if (data.type === 'ciphertext') {
        setInputCiphertext(data.payload);
        addLog('Received ciphertext from Device B');
      } else if (data.type === 'message') {
        addLog(`Received encrypted message: ${data.payload.slice(0, 24)}…`);
      }
    };
    return () => channel.close();
  }, [channel]);

  const addLog = (msg: string) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString('en-IN')} — ${msg}`, ...prev].slice(0, 10));
  };

  const generateAliceKeys = async () => {
    setLoading(true);
    try {
      const kem = new MlKem768();
      const [publicKey, secretKey] = await kem.generateKeyPair();
      const publicKeyHex = bufToHex(publicKey);
      const secretKeyHex = bufToHex(secretKey);
      setState((s) => ({ ...s, publicKey: publicKeyHex, secretKey: secretKeyHex }));
      localStorage.setItem('psb-qk-public-key', publicKeyHex);
      channel?.postMessage({ type: 'public-key', payload: publicKeyHex });
      addLog('Device A generated ML-KEM-768 keypair');
    } catch (e) {
      addLog('Key generation failed');
    } finally {
      setLoading(false);
    }
  };

  const bobEncapsulate = async () => {
    if (!inputPublicKey) return;
    setLoading(true);
    try {
      const kem = new MlKem768();
      const [ciphertext, sharedSecret] = await kem.encap(hexToBuf(inputPublicKey));
      const ciphertextHex = bufToHex(ciphertext);
      const sharedSecretHex = bufToHex(sharedSecret);
      setState((s) => ({ ...s, ciphertext: ciphertextHex, sharedSecretB: sharedSecretHex }));
      localStorage.setItem('psb-qk-ciphertext', ciphertextHex);
      channel?.postMessage({ type: 'ciphertext', payload: ciphertextHex });
      addLog('Device B encapsulated shared secret with public key');
    } catch (e) {
      addLog('Encapsulation failed — check public key');
    } finally {
      setLoading(false);
    }
  };

  const aliceDecapsulate = async () => {
    if (!inputCiphertext || !state.secretKey) return;
    setLoading(true);
    try {
      const kem = new MlKem768();
      const sharedSecret = await kem.decap(hexToBuf(inputCiphertext), hexToBuf(state.secretKey));
      const sharedSecretHex = bufToHex(sharedSecret);
      setState((s) => ({ ...s, sharedSecretA: sharedSecretHex }));
      addLog('Device A decapsulated shared secret from ciphertext');
    } catch (e) {
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
      localStorage.setItem('psb-qk-message', encrypted);
      channel?.postMessage({ type: 'message', payload: encrypted });
      addLog('Device B encrypted message with AES-GCM derived from shared secret');
    } catch (e) {
      addLog('Encryption failed');
    } finally {
      setLoading(false);
    }
  };

  const aliceDecrypt = async () => {
    if (!state.sharedSecretA || !state.encryptedMessage) return;
    setLoading(true);
    try {
      const decrypted = await decryptMessage(hexToBuf(state.sharedSecretA), state.encryptedMessage);
      setState((s) => ({ ...s, decryptedMessage: decrypted }));
      addLog('Device A decrypted message with AES-GCM');
    } catch (e) {
      addLog('Decryption failed');
    } finally {
      setLoading(false);
    }
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
                      value={inputCiphertext}
                      onChange={(e) => setInputCiphertext(e.target.value)}
                      placeholder="Paste Bob's ciphertext here..."
                      className="w-full mt-1 h-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>
                  <button
                    onClick={aliceDecapsulate}
                    disabled={loading || !inputCiphertext || !state.secretKey}
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
                      value={state.encryptedMessage || ''}
                      onChange={(e) => setState((s) => ({ ...s, encryptedMessage: e.target.value }))}
                      placeholder="Paste encrypted message here..."
                      className="w-full mt-1 h-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>
                  <button
                    onClick={aliceDecrypt}
                    disabled={loading || !state.encryptedMessage}
                    className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-black disabled:opacity-50"
                  >
                    Decrypt with AES-GCM
                  </button>
                  {state.decryptedMessage && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-300 uppercase font-bold">Decrypted Message</p>
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
                  value={inputPublicKey}
                  onChange={(e) => setInputPublicKey(e.target.value)}
                  placeholder="Paste Alice's public key here..."
                  className="w-full mt-1 h-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <button
                onClick={bobEncapsulate}
                disabled={loading || !inputPublicKey}
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

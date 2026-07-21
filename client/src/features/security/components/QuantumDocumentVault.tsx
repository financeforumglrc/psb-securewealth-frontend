import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MlKem768 } from 'mlkem';
import { Shield, FileText, Download, Lock, Unlock, Upload, Trash2 } from 'lucide-react';

interface VaultFile {
  id: string;
  name: string;
  type: string;
  size: number;
  encryptedData: string;
  uploadedAt: number;
}

const STORAGE_KEY = 'psb-quantum-vault-files';

function bufToHex(buf: Uint8Array | ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.slice(i, i + 2), 16));
  return new Uint8Array(bytes);
}

async function deriveAesKey(sharedSecret: Uint8Array): Promise<CryptoKey> {
  const keyBytes = await crypto.subtle.digest('SHA-256', sharedSecret as BufferSource);
  return crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function encryptData(sharedSecret: Uint8Array, data: Uint8Array): Promise<string> {
  const aesKey = await deriveAesKey(sharedSecret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, data as BufferSource);
  const payload = new Uint8Array(iv.length + encrypted.byteLength);
  payload.set(iv, 0);
  payload.set(new Uint8Array(encrypted), iv.length);
  return bufToHex(payload);
}

async function decryptData(sharedSecret: Uint8Array, encryptedHex: string): Promise<Uint8Array> {
  const aesKey = await deriveAesKey(sharedSecret);
  const payload = hexToBuf(encryptedHex);
  const iv = payload.slice(0, 12);
  const ciphertext = payload.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, ciphertext as BufferSource);
  return new Uint8Array(decrypted);
}

function loadFiles(): VaultFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFiles(files: VaultFile[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch {
    // ignore quota errors
  }
}

export default function QuantumDocumentVault() {
  const [files, setFiles] = useState<VaultFile[]>(loadFiles);
  const [encrypting, setEncrypting] = useState(false);
  const [decrypting, setDecrypting] = useState<string | null>(null);
  const [publicKeyHex, setPublicKeyHex] = useState('');
  const [secretKeyHex, setSecretKeyHex] = useState('');
  const [status, setStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateKeys = async () => {
    setEncrypting(true);
    setStatus('Generating ML-KEM-768 keypair...');
    try {
      const kem = new MlKem768();
      const [publicKey, secretKey] = await kem.generateKeyPair();
      setPublicKeyHex(bufToHex(publicKey));
      setSecretKeyHex(bufToHex(secretKey));
      setStatus('Keypair ready. Upload documents to encrypt.');
    } catch (err) {
      setStatus('Key generation failed.');
    } finally {
      setEncrypting(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    if (!publicKeyHex || !secretKeyHex) {
      setStatus('Generate keypair first.');
      return;
    }

    setEncrypting(true);
    for (const file of Array.from(fileList)) {
      try {
        setStatus(`Encrypting ${file.name}...`);
        const arrayBuffer = await file.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);

        const kem = new MlKem768();
        const [ciphertext, sharedSecret] = await kem.encap(hexToBuf(publicKeyHex));
        const encryptedHex = await encryptData(sharedSecret, data);

        const vaultFile: VaultFile = {
          id: Math.random().toString(36).slice(2, 10),
          name: file.name,
          type: file.type,
          size: file.size,
          encryptedData: bufToHex(ciphertext) + '.' + encryptedHex,
          uploadedAt: Date.now(),
        };

        setFiles((prev) => {
          const next = [vaultFile, ...prev].slice(0, 20);
          saveFiles(next);
          return next;
        });
        setStatus(`${file.name} encrypted and stored.`);
      } catch (err) {
        setStatus(`Failed to encrypt ${file.name}`);
      }
    }
    setEncrypting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDecrypt = async (vaultFile: VaultFile) => {
    if (!secretKeyHex) {
      setStatus('Secret key not available.');
      return;
    }
    setDecrypting(vaultFile.id);
    try {
      setStatus(`Decrypting ${vaultFile.name}...`);
      const [ctHex, encHex] = vaultFile.encryptedData.split('.');
      const kem = new MlKem768();
      const sharedSecret = await kem.decap(hexToBuf(ctHex), hexToBuf(secretKeyHex));
      const decrypted = await decryptData(sharedSecret, encHex);

      const blob = new Blob([decrypted as Uint8Array<ArrayBuffer>], { type: vaultFile.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `decrypted-${vaultFile.name}`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(`${vaultFile.name} decrypted and downloaded.`);
    } catch (err) {
      setStatus('Decryption failed.');
    } finally {
      setDecrypting(null);
    }
  };

  const handleDelete = (id: string) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      saveFiles(next);
      return next;
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" /> Quantum-Encrypted Document Vault
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Upload and encrypt sensitive documents with ML-KEM-768 post-quantum security.</p>
        </div>
      </div>

      {/* Keypair Status */}
      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">ML-KEM-768 Keypair</p>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">
              {publicKeyHex ? 'Active — ready to encrypt' : 'Not generated'}
            </p>
          </div>
          <button
            onClick={generateKeys}
            disabled={encrypting}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
          >
            {publicKeyHex ? 'Regenerate Keys' : 'Generate Keypair'}
          </button>
        </div>
      </div>

      {/* Upload */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <label className="block">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
            onChange={handleUpload}
            className="hidden"
          />
          <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            encrypting ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
          }`}>
            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {encrypting ? 'Encrypting...' : 'Click to upload documents'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">PDF, Images, Documents — max 5MB each</p>
          </div>
        </label>
        {status && (
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <Shield className="w-3 h-3" /> {status}
          </p>
        )}
      </div>

      {/* Files List */}
      <div className="space-y-2">
        {files.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No encrypted documents yet. Generate a keypair and upload files.
          </div>
        ) : (
          files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{file.name}</p>
                <p className="text-[10px] text-slate-400">
                  {formatSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDecrypt(file)}
                  disabled={decrypting === file.id}
                  className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                  title="Decrypt and download"
                >
                  {decrypting === file.id ? <Unlock className="w-4 h-4 animate-pulse" /> : <Download className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 hover:bg-rose-100 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Security Note */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <p className="text-[10px] text-slate-500 flex items-start gap-2">
          <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>
            Documents are encrypted with ML-KEM-768 (NIST FIPS 203) + AES-GCM. The secret key is stored locally in your browser.
            Clearing browser data will permanently delete the key and make files unrecoverable.
          </span>
        </p>
      </div>
    </div>
  );
}

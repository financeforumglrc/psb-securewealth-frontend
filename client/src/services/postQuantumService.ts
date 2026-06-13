/* ═══════════════════════════════════════════════════════════════
   POST-QUANTUM CRYPTO SERVICE — Real ML-KEM (CRYSTALS-Kyber) KEM
   Uses the `mlkem` library for NIST FIPS 203 ML-KEM-768 key
   encapsulation, then derives an AES-GCM key from the shared secret.
   ═══════════════════════════════════════════════════════════════ */

import { MlKem768 } from 'mlkem';

export interface PqTunnelResult {
  publicKeyHex: string;
  ciphertextHex: string;
  sharedSecretHex: string;
  encryptedPayloadHex: string;
  decryptedPayload: string;
}

function bufToHex(buf: Uint8Array | ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function deriveAesKey(sharedSecret: Uint8Array): Promise<CryptoKey> {
  const keyBytes = await crypto.subtle.digest('SHA-256', sharedSecret as BufferSource);
  return crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
}

export async function runRealPqTunnel(): Promise<PqTunnelResult> {
  const payload = 'SecureWealth Quantum Tunnel v1.0 — ML-KEM-768 + AES-GCM';

  // 1. Alice generates keypair
  const recipient = new MlKem768();
  const [publicKey, secretKey] = await recipient.generateKeyPair();

  // 2. Bob encapsulates a shared secret using Alice's public key
  const sender = new MlKem768();
  const [ciphertext, sharedSecretEncap] = await sender.encap(publicKey);

  // 3. Alice decapsulates the same shared secret
  const sharedSecretDecap = await recipient.decap(ciphertext, secretKey);

  // Verify both sides derive identical secret
  if (bufToHex(sharedSecretEncap) !== bufToHex(sharedSecretDecap)) {
    throw new Error('ML-KEM shared secret mismatch');
  }

  // 4. Encrypt payload with AES-GCM using derived key
  const aesKey = await deriveAesKey(sharedSecretEncap);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    new TextEncoder().encode(payload)
  );

  // 5. Decrypt to prove end-to-end tunnel works
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    encrypted
  );

  const encryptedPayload = new Uint8Array(iv.length + encrypted.byteLength);
  encryptedPayload.set(iv, 0);
  encryptedPayload.set(new Uint8Array(encrypted), iv.length);

  return {
    publicKeyHex: bufToHex(publicKey),
    ciphertextHex: bufToHex(ciphertext),
    sharedSecretHex: bufToHex(sharedSecretEncap),
    encryptedPayloadHex: bufToHex(encryptedPayload),
    decryptedPayload: new TextDecoder().decode(decrypted),
  };
}

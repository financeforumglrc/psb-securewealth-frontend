/* ═══════════════════════════════════════════════════════════════
   CRYPTO ATTESTATION SERVICE — Real non-exportable ECDSA signing
   Generates a hardware-backed-style non-exportable key pair,
   signs a challenge, and verifies the signature with Web Crypto.
   ═══════════════════════════════════════════════════════════════ */

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface AttestationResult {
  keyHandle: string;
  challenge: string;
  signature: string;
  publicKeyHex: string;
  verified: boolean;
}

export async function performAttestation(label = 'device'): Promise<AttestationResult> {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, // non-exportable private key
    ['sign', 'verify']
  );

  const publicKeyBuffer = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const publicKeyHex = arrayBufferToHex(publicKeyBuffer);
  const keyHandle = `${label}-${publicKeyHex.slice(0, 16).toUpperCase()}`;

  const challengeBytes = crypto.getRandomValues(new Uint8Array(32));
  const challenge = arrayBufferToHex(challengeBytes.buffer);

  const signatureBuffer = await crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    keyPair.privateKey,
    challengeBytes
  );
  const signature = arrayBufferToHex(signatureBuffer);

  const verified = await crypto.subtle.verify(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    keyPair.publicKey,
    signatureBuffer,
    challengeBytes
  );

  return { keyHandle, challenge, signature, publicKeyHex, verified };
}

export function isSecureContext(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext;
}

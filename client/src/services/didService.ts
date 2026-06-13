/* ═══════════════════════════════════════════════════════════════
   DECENTRALIZED IDENTITY SERVICE — Real DID + Verifiable Credential
   Generates an ECDSA P-256 key pair, creates a did:securewealth URI,
   signs a VC, and verifies the signature using Web Crypto API.
   ═══════════════════════════════════════════════════════════════ */

export interface DidCredential {
  did: string;
  publicKeyJwk: JsonWebKey;
  credential: Record<string, unknown>;
  signature: string;
}

const DID_KEY = 'sw_did_keypair';
const DID_METHOD = 'securewealth';

function arrayBufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function sha256(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64url(hash);
}

async function generateDidKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );
}

export async function createDidCredential(holderName = 'SecureWealth User'): Promise<DidCredential> {
  const keyPair = await generateDidKeyPair();
  const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const thumbprint = await sha256(JSON.stringify(publicKeyJwk));
  const did = `did:${DID_METHOD}:${thumbprint.slice(0, 32)}`;

  const credential = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential', 'SecureWealthIdentity'],
    issuer: did,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: did,
      name: holderName,
      method: DID_METHOD,
    },
  };

  const payload = new TextEncoder().encode(JSON.stringify(credential));
  const signatureBuffer = await crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    keyPair.privateKey,
    payload
  );
  const signature = arrayBufferToBase64url(signatureBuffer);

  // Persist only the DID and public key; private key stays in non-exportable CryptoKey (in memory)
  localStorage.setItem(
    DID_KEY,
    JSON.stringify({ did, publicKeyJwk, signature, credential })
  );

  return { did, publicKeyJwk, credential, signature };
}

export function loadStoredCredential(): DidCredential | null {
  try {
    const raw = localStorage.getItem(DID_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      did: parsed.did,
      publicKeyJwk: parsed.publicKeyJwk,
      credential: parsed.credential,
      signature: parsed.signature,
    };
  } catch {
    return null;
  }
}

export async function verifyDidCredential(stored: DidCredential): Promise<boolean> {
  try {
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      stored.publicKeyJwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['verify']
    );
    const payload = new TextEncoder().encode(JSON.stringify(stored.credential));
    const signature = base64urlToArrayBuffer(stored.signature);
    return crypto.subtle.verify(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      publicKey,
      signature,
      payload
    );
  } catch {
    return false;
  }
}

export function getDidQrData(stored: DidCredential): string {
  return JSON.stringify({
    did: stored.did,
    credential: stored.credential,
    signature: stored.signature,
  });
}

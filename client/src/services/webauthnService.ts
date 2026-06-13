/* ═══════════════════════════════════════════════════════════════
   WEBAUTHN / FIDO2 SERVICE — Real passkey registration & auth
   ═══════════════════════════════════════════════════════════════ */

const RP_NAME = 'SecureWealth';
const RP_ID = window.location.hostname;

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function isWebAuthnAvailable(): boolean {
  return typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'credentials' in navigator &&
    typeof (navigator as any).credentials.create === 'function';
}

export async function registerPasskey(username: string): Promise<PublicKeyCredential> {
  if (!isWebAuthnAvailable()) {
    throw new Error('WebAuthn not available in this browser');
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));

  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: { name: RP_NAME, id: RP_ID },
    user: {
      id: userId,
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },   // ES256
      { type: 'public-key', alg: -257 }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      residentKey: 'required',
    },
    attestation: 'none',
    timeout: 120000,
  };

  const credential = await navigator.credentials.create({ publicKey });
  if (!credential) throw new Error('Passkey registration was cancelled');
  return credential as PublicKeyCredential;
}

export async function authenticatePasskey(credentialId?: string): Promise<PublicKeyCredential> {
  if (!isWebAuthnAvailable()) {
    throw new Error('WebAuthn not available in this browser');
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const allowCredentials: PublicKeyCredentialDescriptor[] = credentialId
    ? [{ id: base64urlToBuffer(credentialId), type: 'public-key' }]
    : [];

  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge,
    rpId: RP_ID,
    allowCredentials,
    userVerification: 'required',
    timeout: 120000,
  };

  const assertion = await navigator.credentials.get({ publicKey });
  if (!assertion) throw new Error('Passkey authentication was cancelled');
  return assertion as PublicKeyCredential;
}

export function getCredentialIdBase64(credential: PublicKeyCredential): string {
  return bufferToBase64url(credential.rawId);
}

const PASSKEY_STORAGE_KEY = 'sw_passkey_credential_id';
const PASSKEY_USER_KEY = 'sw_passkey_user';

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join('');
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64urlDecode(str: string): Uint8Array {
  const padding = '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined'
  );
}

export function hasRegisteredPasskey(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(PASSKEY_STORAGE_KEY);
}

export function getPasskeyUser(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PASSKEY_USER_KEY);
}

export function clearPasskey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PASSKEY_STORAGE_KEY);
  localStorage.removeItem(PASSKEY_USER_KEY);
}

export async function registerPasskey(username: string): Promise<void> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser.');
  }

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions =
    {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: 'SecureWealth Twin', id: location.hostname },
      user: {
        id: Uint8Array.from(username, (c) => c.charCodeAt(0)),
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
      },
      timeout: 60000,
      attestation: 'none',
    };

  const credential = (await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions,
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error('Passkey registration was cancelled or failed.');
  }

  const credentialId = base64urlEncode(credential.rawId);
  localStorage.setItem(PASSKEY_STORAGE_KEY, credentialId);
  localStorage.setItem(PASSKEY_USER_KEY, username);
}

export async function authenticateWithPasskey(): Promise<string> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser.');
  }

  const credentialId = localStorage.getItem(PASSKEY_STORAGE_KEY);
  if (!credentialId) {
    throw new Error('No passkey found. Please register a passkey first.');
  }

  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
    {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [
        {
          id: base64urlDecode(credentialId) as BufferSource,
          type: 'public-key',
          transports: ['internal'],
        },
      ],
      userVerification: 'required',
      timeout: 60000,
    };

  const credential = (await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions,
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error('Passkey authentication was cancelled or failed.');
  }

  const user = getPasskeyUser();
  if (!user) {
    throw new Error('Passkey user not found.');
  }

  return user;
}

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import { logSecurityEvent } from '../utils/securityLogger';

export interface SecurityState {
  trustScore: number;
  tpmAttested: boolean;
  tpmKeyHandle: string | null;
  passkeyRegistered: boolean;
  passkeyCredentialId: string | null;
  enclaveVerified: boolean;
  honeytokenTriggered: boolean;
  behavioralBaseline: number | null;
  behavioralDeviation: number;
  lastEbpfAlert: string | null;
  didIssued: boolean;
  didUri: string | null;
  pqTunnelActive: boolean;
  blockchainHeadHash: string | null;
  trapTriggered: boolean;
  trapLockdownUntil: number | null;
  accountFrozen: boolean;
}

type SecurityAction =
  | { type: 'SET_TRUST_SCORE'; score: number }
  | { type: 'TPM_ATTEST'; handle: string }
  | { type: 'TPM_FAIL' }
  | { type: 'PASSKEY_REGISTER'; credentialId: string }
  | { type: 'PASSKEY_AUTH' }
  | { type: 'ENCLAVE_VERIFY' }
  | { type: 'ENCLAVE_FAIL' }
  | { type: 'HONEYTOKEN_TRIGGER' }
  | { type: 'HONEYTOKEN_RESET' }
  | { type: 'BEHAVIORAL_UPDATE'; deviation: number }
  | { type: 'EBPF_ALERT'; alert: string }
  | { type: 'DID_ISSUE'; uri: string }
  | { type: 'PQ_TUNNEL'; active: boolean }
  | { type: 'BLOCKCHAIN_UPDATE'; hash: string }
  | { type: 'TRAP_TRIGGER' }
  | { type: 'TRAP_RESET' }
  | { type: 'FREEZE_ACCOUNT' }
  | { type: 'UNFREEZE_ACCOUNT' }
  | { type: 'INIT'; state: SecurityState };

const SECURITY_KEY = 'sw_security_state';

function getStoredState(): Partial<SecurityState> | null {
  try {
    return JSON.parse(localStorage.getItem(SECURITY_KEY) || '{}');
  } catch {
    return null;
  }
}

function saveState(state: SecurityState) {
  try {
    localStorage.setItem(SECURITY_KEY, JSON.stringify(state));
  } catch { /* noop */ }
}

function computeTrustScore(s: SecurityState): number {
  let score = 50;
  if (s.tpmAttested) score += 10;
  if (s.passkeyRegistered) score += 15;
  if (s.enclaveVerified) score += 10;
  if (!s.honeytokenTriggered) score += 5;
  if (s.behavioralDeviation < 0.3) score += 10;
  else if (s.behavioralDeviation > 0.5) score -= 20;
  if (s.pqTunnelActive) score += 5;
  if (s.didIssued) score += 5;
  if (!s.trapTriggered) score += 5;
  if (s.accountFrozen || s.trapTriggered || s.honeytokenTriggered) score = Math.min(score, 20);
  return Math.max(0, Math.min(100, score));
}

function securityReducer(state: SecurityState, action: SecurityAction): SecurityState {
  let next: SecurityState;
  switch (action.type) {
    case 'SET_TRUST_SCORE':
      next = { ...state, trustScore: action.score };
      break;
    case 'TPM_ATTEST':
      next = { ...state, tpmAttested: true, tpmKeyHandle: action.handle };
      logSecurityEvent('TPM', 'TPM Attestation Verified', 'info', `Key handle ${action.handle} bound successfully`);
      break;
    case 'TPM_FAIL':
      next = { ...state, tpmAttested: false, tpmKeyHandle: null };
      logSecurityEvent('TPM', 'TPM Attestation Failed', 'warning', 'Hardware root of trust could not be verified');
      break;
    case 'PASSKEY_REGISTER':
      next = { ...state, passkeyRegistered: true, passkeyCredentialId: action.credentialId };
      logSecurityEvent('Passkey', 'FIDO2 Passkey Registered', 'info', `Credential ID: ${action.credentialId.slice(0, 16)}...`);
      break;
    case 'PASSKEY_AUTH':
      logSecurityEvent('Passkey', 'FIDO2 Passkey Authentication', 'info', 'Biometric verification succeeded');
      next = { ...state };
      break;
    case 'ENCLAVE_VERIFY':
      next = { ...state, enclaveVerified: true };
      logSecurityEvent('Enclave', 'Secure Enclave Verified', 'info', 'ARM TrustZone / Apple Secure Enclave attestation passed');
      break;
    case 'ENCLAVE_FAIL':
      next = { ...state, enclaveVerified: false };
      logSecurityEvent('Enclave', 'Secure Enclave Failed', 'warning', 'Hardware-backed key storage unavailable');
      break;
    case 'HONEYTOKEN_TRIGGER':
      next = { ...state, honeytokenTriggered: true, accountFrozen: true };
      logSecurityEvent('Honeytoken', 'HONEYTOKEN TRIGGERED', 'critical', 'Unauthorized access attempt detected on decoy asset. Account frozen.');
      break;
    case 'HONEYTOKEN_RESET':
      next = { ...state, honeytokenTriggered: false, accountFrozen: false };
      logSecurityEvent('Honeytoken', 'Honeytoken Reset', 'info', 'Admin reset performed — account restored');
      break;
    case 'BEHAVIORAL_UPDATE':
      next = { ...state, behavioralDeviation: action.deviation };
      if (action.deviation > 0.3) {
        logSecurityEvent('Biometrics', 'Behavioral Anomaly Detected', 'warning', `Deviation ${(action.deviation * 100).toFixed(0)}% exceeds threshold`);
      }
      break;
    case 'EBPF_ALERT':
      next = { ...state, lastEbpfAlert: action.alert };
      logSecurityEvent('eBPF', 'Runtime Threat Detected', 'critical', action.alert);
      break;
    case 'DID_ISSUE':
      next = { ...state, didIssued: true, didUri: action.uri };
      logSecurityEvent('DID', 'Verifiable Credential Issued', 'info', `DID URI: ${action.uri}`);
      break;
    case 'PQ_TUNNEL':
      next = { ...state, pqTunnelActive: action.active };
      logSecurityEvent('PQ-Crypto', action.active ? 'Quantum-Safe Tunnel Active' : 'PQ Tunnel Closed', 'info', 'ML-KEM-768 key encapsulation active');
      break;
    case 'BLOCKCHAIN_UPDATE':
      next = { ...state, blockchainHeadHash: action.hash };
      break;
    case 'TRAP_TRIGGER':
      next = { ...state, trapTriggered: true, trapLockdownUntil: Date.now() + 24 * 60 * 60 * 1000, accountFrozen: true };
      logSecurityEvent('Trap', 'PHISHING TRAP ACTIVATED', 'critical', 'Fake confirmation code entered. Fraud attempt detected. Account locked 24h.');
      break;
    case 'TRAP_RESET':
      next = { ...state, trapTriggered: false, trapLockdownUntil: null, accountFrozen: false };
      logSecurityEvent('Trap', 'Transaction Trap Reset', 'info', 'Lockdown cleared by admin');
      break;
    case 'FREEZE_ACCOUNT':
      next = { ...state, accountFrozen: true };
      logSecurityEvent('Security Beast', 'Account Frozen', 'critical', 'Manual freeze activated');
      break;
    case 'UNFREEZE_ACCOUNT':
      next = { ...state, accountFrozen: false };
      logSecurityEvent('Security Beast', 'Account Unfrozen', 'info', 'Manual unfreeze performed');
      break;
    case 'INIT':
      next = action.state;
      break;
    default:
      next = state;
  }
  next.trustScore = computeTrustScore(next);
  saveState(next);
  return next;
}

const defaultState: SecurityState = {
  trustScore: 50,
  tpmAttested: false,
  tpmKeyHandle: null,
  passkeyRegistered: false,
  passkeyCredentialId: null,
  enclaveVerified: false,
  honeytokenTriggered: false,
  behavioralBaseline: null,
  behavioralDeviation: 0,
  lastEbpfAlert: null,
  didIssued: false,
  didUri: null,
  pqTunnelActive: false,
  blockchainHeadHash: null,
  trapTriggered: false,
  trapLockdownUntil: null,
  accountFrozen: false,
};

const SecurityContext = createContext<{
  state: SecurityState;
  dispatch: React.Dispatch<SecurityAction>;
} | null>(null);

export function SecurityProvider({ children }: { children: ReactNode }) {
  const stored = getStoredState();
  const [state, dispatch] = useReducer(securityReducer, { ...defaultState, ...stored });

  useEffect(() => {
    if (!stored) {
      dispatch({ type: 'INIT', state: defaultState });
    }
  }, []);

  return (
    <SecurityContext.Provider value={{ state, dispatch }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error('useSecurity must be used within SecurityProvider');
  return ctx;
}

export function useSecurityActions() {
  const { state, dispatch } = useSecurity();

  const attestTpm = useCallback((handle: string) => dispatch({ type: 'TPM_ATTEST', handle }), [dispatch]);
  const failTpm = useCallback(() => dispatch({ type: 'TPM_FAIL' }), [dispatch]);
  const registerPasskey = useCallback((credentialId: string) => dispatch({ type: 'PASSKEY_REGISTER', credentialId }), [dispatch]);
  const authenticatePasskey = useCallback(() => dispatch({ type: 'PASSKEY_AUTH' }), [dispatch]);
  const verifyEnclave = useCallback(() => dispatch({ type: 'ENCLAVE_VERIFY' }), [dispatch]);
  const failEnclave = useCallback(() => dispatch({ type: 'ENCLAVE_FAIL' }), [dispatch]);
  const triggerHoneytoken = useCallback(() => dispatch({ type: 'HONEYTOKEN_TRIGGER' }), [dispatch]);
  const resetHoneytoken = useCallback(() => dispatch({ type: 'HONEYTOKEN_RESET' }), [dispatch]);
  const updateBehavioral = useCallback((deviation: number) => dispatch({ type: 'BEHAVIORAL_UPDATE', deviation }), [dispatch]);
  const ebpfAlert = useCallback((alert: string) => dispatch({ type: 'EBPF_ALERT', alert }), [dispatch]);
  const issueDid = useCallback((uri: string) => dispatch({ type: 'DID_ISSUE', uri }), [dispatch]);
  const setPqTunnel = useCallback((active: boolean) => dispatch({ type: 'PQ_TUNNEL', active }), [dispatch]);
  const updateBlockchain = useCallback((hash: string) => dispatch({ type: 'BLOCKCHAIN_UPDATE', hash }), [dispatch]);
  const triggerTrap = useCallback(() => dispatch({ type: 'TRAP_TRIGGER' }), [dispatch]);
  const resetTrap = useCallback(() => dispatch({ type: 'TRAP_RESET' }), [dispatch]);
  const freezeAccount = useCallback(() => dispatch({ type: 'FREEZE_ACCOUNT' }), [dispatch]);
  const unfreezeAccount = useCallback(() => dispatch({ type: 'UNFREEZE_ACCOUNT' }), [dispatch]);

  return {
    state,
    attestTpm, failTpm,
    registerPasskey, authenticatePasskey,
    verifyEnclave, failEnclave,
    triggerHoneytoken, resetHoneytoken,
    updateBehavioral,
    ebpfAlert,
    issueDid,
    setPqTunnel,
    updateBlockchain,
    triggerTrap, resetTrap,
    freezeAccount, unfreezeAccount,
  };
}

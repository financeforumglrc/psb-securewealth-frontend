/**
 * Blockchain Audit Service — Real SHA-256 immutable transaction logs
 * Creates a Merkle-like chain of SHA-256 hashes for every transaction.
 */

export interface Block {
  index: number;
  timestamp: string;
  txId: string;
  txData: string;
  previousHash: string;
  hash: string;
}

const CHAIN_KEY = 'sw_blockchain_audit';

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function loadChain(): Block[] {
  try {
    return JSON.parse(localStorage.getItem(CHAIN_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveChain(chain: Block[]) {
  localStorage.setItem(CHAIN_KEY, JSON.stringify(chain.slice(-500)));
}

export async function addTransactionToChain(txId: string, txData: Record<string, unknown>): Promise<Block> {
  const chain = loadChain();
  const previousHash = chain.length > 0 ? chain[chain.length - 1].hash : '0'.repeat(64);
  const index = chain.length;
  const timestamp = new Date().toISOString();
  const dataString = JSON.stringify(txData);
  const hash = await sha256(`${index}${timestamp}${txId}${dataString}${previousHash}`);

  const block: Block = {
    index,
    timestamp,
    txId,
    txData: dataString,
    previousHash,
    hash,
  };

  chain.push(block);
  saveChain(chain);
  return block;
}

export function getChain(): Block[] {
  return loadChain();
}

export async function verifyChainIntegrity(): Promise<{ valid: boolean; brokenAt?: number }> {
  const chain = loadChain();
  for (let i = 1; i < chain.length; i++) {
    if (chain[i].previousHash !== chain[i - 1].hash) {
      return { valid: false, brokenAt: i };
    }
    const recalculated = await sha256(
      `${chain[i].index}${chain[i].timestamp}${chain[i].txId}${chain[i].txData}${chain[i].previousHash}`
    );
    if (recalculated !== chain[i].hash) {
      return { valid: false, brokenAt: i };
    }
  }
  return { valid: true };
}

export function getChainStats() {
  const chain = loadChain();
  return {
    totalBlocks: chain.length,
    firstBlock: chain[0]?.timestamp || null,
    lastBlock: chain[chain.length - 1]?.timestamp || null,
  };
}

/* ═══════════════════════════════════════════════════════════════
   SMART CONTRACT TIMELOCK — Virtual on-chain lock registry
   Simulates a Polygon testnet smart contract that enforces a
   cooling-off period before high-risk funds can be released.
   ═══════════════════════════════════════════════════════════════ */

export interface SmartContractLock {
  contractId: string;
  userId: string;
  amount: number;
  lockedAt: string;
  expiresAt: string;
  released: boolean;
  txId: string;
}

const LOCKS_KEY = 'sw_smart_contract_locks';

function loadLocks(): SmartContractLock[] {
  try {
    return JSON.parse(localStorage.getItem(LOCKS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocks(locks: SmartContractLock[]) {
  localStorage.setItem(LOCKS_KEY, JSON.stringify(locks.slice(-100)));
}

export async function lockFunds(
  userId: string,
  amount: number,
  durationSeconds: number,
  txId: string
): Promise<SmartContractLock> {
  const locks = loadLocks();
  const now = Date.now();
  const payload = `${userId}:${amount}:${now}:${txId}`;
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const contractId = '0x' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 40);

  const lock: SmartContractLock = {
    contractId,
    userId,
    amount,
    lockedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + durationSeconds * 1000).toISOString(),
    released: false,
    txId,
  };

  locks.push(lock);
  saveLocks(locks);
  return lock;
}

export function getLockByTxId(txId: string): SmartContractLock | undefined {
  return loadLocks().find((l) => l.txId === txId);
}

export function isLocked(contractId: string): boolean {
  const lock = loadLocks().find((l) => l.contractId === contractId);
  if (!lock) return false;
  if (lock.released) return false;
  return new Date(lock.expiresAt).getTime() > Date.now();
}

export function releaseLock(contractId: string): boolean {
  const locks = loadLocks();
  const lock = locks.find((l) => l.contractId === contractId);
  if (!lock || lock.released) return false;
  lock.released = true;
  saveLocks(locks);
  return true;
}

export function getLocks(): SmartContractLock[] {
  return loadLocks();
}

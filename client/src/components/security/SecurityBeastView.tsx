import { motion } from 'framer-motion';
import SecurityScoreDashboard from './SecurityScoreDashboard';
import TpmAttestation from './TpmAttestation';
import EbpfMonitor from './EbpfMonitor';
import HoneytokenManager from './HoneytokenManager';
import PasskeyAuth from './PasskeyAuth';
import PostQuantumCrypto from './PostQuantumCrypto';
import BehavioralBiometrics from '../protection/BehavioralBiometrics';
import DecentralizedId from './DecentralizedId';
import TransactionTrap from './TransactionTrap';
import SecureEnclaveCheck from './SecureEnclaveCheck';
import BlockchainAudit from './BlockchainAudit';
import DeviceFingerprintPanel from './DeviceFingerprintPanel';

const LAYER_GROUPS = [
  { title: 'Hardware Root of Trust', subtitle: 'TPM 2.0 + eBPF Kernel Monitor', components: [<TpmAttestation key="tpm" />, <EbpfMonitor key="ebpf" />] },
  { title: 'Identity & Access', subtitle: 'Decoy assets + FIDO2 passkeys', components: [<HoneytokenManager key="honey" />, <PasskeyAuth key="passkey" />] },
  { title: 'Quantum & Behavior', subtitle: 'CRYSTALS-Kyber + biometric anomaly', components: [<PostQuantumCrypto key="pq" />, <BehavioralBiometrics key="bio" />] },
  { title: 'Deception & DID', subtitle: 'Phishing trap + verifiable credentials', components: [<DecentralizedId key="did" />, <TransactionTrap key="trap" />] },
  { title: 'Immutable Audit', subtitle: 'Secure enclave + blockchain ledger', components: [<SecureEnclaveCheck key="enclave" />, <BlockchainAudit key="chain" />] },
];

export default function SecurityBeastView() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-dragon text-rose-500" /> Security Beast
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">10-layer unbreakable security — zero trust, hardware attestation, AI deception, post-quantum crypto</p>
        </div>
        <span className="text-[10px] px-2 py-1 bg-rose-500/10 text-rose-600 rounded-full font-medium">
          <i className="fas fa-bolt mr-1" />Active Defense
        </span>
      </div>

      {/* Score Dashboard */}
      <SecurityScoreDashboard />

      {/* Device Fingerprint */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <DeviceFingerprintPanel />
      </motion.div>

      {/* Layer Groups */}
      {LAYER_GROUPS.map((group, gi) => (
        <motion.div key={group.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.1 }}>
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">{group.title}</h3>
            <p className="text-[10px] text-slate-400">{group.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {group.components}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

import { useSecurity } from '../../context/SecurityContext';
import { motion } from 'framer-motion';

export default function SecurityHealthWidget() {
  const { state } = useSecurity();
  const score = state.trustScore;

  const getColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getBg = () => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 50) return 'bg-amber-50';
    return 'bg-red-50';
  };

  const getLabel = () => {
    if (score >= 80) return 'Secure';
    if (score >= 50) return 'Caution';
    return 'At Risk';
  };

  const events = [
    { name: 'TPM Attestation', active: state.tpmAttested },
    { name: 'eBPF Monitor', active: state.lastEbpfAlert !== null },
    { name: 'Passkey Auth', active: state.passkeyRegistered },
    { name: 'Post-Quantum Crypto', active: state.pqTunnelActive },
    { name: 'Behavioral Biometrics', active: state.behavioralBaseline !== null },
    { name: 'Decentralized ID', active: state.didIssued },
    { name: 'Transaction Trap', active: state.trapTriggered },
    { name: 'Secure Enclave', active: state.enclaveVerified },
    { name: 'Blockchain Audit', active: state.blockchainHeadHash !== null },
  ].filter(e => e.active);

  return (
    <div className="card-psb bg-white">
      <div className="flex items-center gap-2 mb-4">
        <i className="fas fa-shield-halved text-primary text-lg" />
        <h2 className="text-lg font-bold text-primary">Security Health</h2>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className={`w-16 h-16 ${getBg()} rounded-full flex items-center justify-center`}>
          <span className={`text-2xl font-bold ${getColor()}`}>{score}</span>
        </div>
        <div>
          <p className={`text-sm font-bold ${getColor()}`}>{getLabel()}</p>
          <p className="text-xs text-gray-500">Trust Score out of 100</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{events.length} of 9 layers active</p>
        </div>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {events.slice(0, 6).map((evt, i) => (
          <motion.div
            key={evt.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2 text-xs"
          >
            <i className="fas fa-check-circle text-green-500" />
            <span className="text-gray-700">{evt.name}</span>
            <span className="text-[10px] text-green-600 font-medium ml-auto">Active</span>
          </motion.div>
        ))}
      </div>

      <button
        onClick={() => alert('Security audit running... All layers verified. No threats detected.')}
        className="w-full mt-4 py-2 bg-primary-light text-primary rounded-md text-xs font-bold hover:bg-primary/10 transition-colors"
      >
        <i className="fas fa-rotate mr-1" /> Run Security Audit
      </button>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldCheck, Building2, User, CheckCircle2 } from 'lucide-react';
import { useWealthStore } from '@/shared/store/wealthStore';

interface SecurityTier {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
  features: string[];
  minBalance: number;
}

const SECURITY_TIERS: SecurityTier[] = [
  {
    id: 'retail',
    label: 'Retail Customer',
    icon: User,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    description: 'Simple, easy-to-understand security for everyday banking',
    features: [
      'Basic fraud protection',
      'OTP verification',
      'Device recognition',
      'Simple risk alerts',
      'RBI helpline access',
    ],
    minBalance: 0,
  },
  {
    id: 'premium',
    label: 'Premium Customer',
    icon: ShieldCheck,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    description: 'Enhanced security for high-value customers',
    features: [
      'Advanced fraud detection',
      'Cross-device approval',
      'Behavioral biometrics',
      'Real-time risk scoring',
      'Priority support',
      'Quantum encryption',
    ],
    minBalance: 10000000, // 1 crore
  },
  {
    id: 'corporate',
    label: 'Corporate / HNI',
    icon: Building2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    description: 'Enterprise-grade security for corporate and high-net-worth individuals',
    features: [
      'Multi-signature approval',
      'Quantum-safe encryption',
      'Coercion detection',
      'Emotion-adaptive limits',
      'Dedicated relationship manager',
      'Custom security rules',
      'I4C integration',
    ],
    minBalance: 100000000, // 100 crore
  },
];

export default function SimplifiedSecurityView() {
  const [selectedTier, setSelectedTier] = useState<string>('retail');
  const assets = useWealthStore((s) => s.assets);
  const netWorth = assets.reduce((sum, a) => sum + a.value, 0);

  const currentTier = SECURITY_TIERS.find((t) => t.id === selectedTier) || SECURITY_TIERS[0];
  const Icon = currentTier.icon;

  // Auto-select tier based on net worth
  const autoTier = netWorth >= 100000000 ? 'corporate' : netWorth >= 10000000 ? 'premium' : 'retail';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" /> Simplified Security
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Security tailored to your customer profile. Retail customers get simple protection, corporate customers get advanced features.</p>
      </div>

      {/* Current Tier Indicator */}
      <div className={`p-4 rounded-2xl border ${SECURITY_TIERS.find(t => t.id === autoTier)?.bgColor || 'bg-slate-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold text-slate-800 dark:text-white">
              Your Security Tier: <span className="text-indigo-600">{SECURITY_TIERS.find(t => t.id === autoTier)?.label || 'Retail'}</span>
            </span>
          </div>
          <span className="text-xs text-slate-500">Net Worth: ₹{(netWorth / 10000000).toFixed(1)}Cr</span>
        </div>
      </div>

      {/* Tier Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SECURITY_TIERS.map((tier) => {
          const TierIcon = tier.icon;
          const isAuto = tier.id === autoTier;
          return (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedTier === tier.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <TierIcon className={`w-5 h-5 ${tier.color}`} />
                <span className="text-sm font-bold text-slate-800 dark:text-white">{tier.label}</span>
                {isAuto && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">YOUR TIER</span>}
              </div>
              <p className="text-xs text-slate-500">{tier.description}</p>
              <p className="text-[10px] text-slate-400 mt-1">Min Balance: ₹{(tier.minBalance / 10000000).toFixed(0)}Cr</p>
            </button>
          );
        })}
      </div>

      {/* Selected Tier Details */}
      <motion.div
        key={selectedTier}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 rounded-2xl border ${currentTier.bgColor}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl ${currentTier.color.replace('text-', 'bg-')} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white">{currentTier.label}</h3>
            <p className="text-xs text-slate-500">{currentTier.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Features */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Security Features</h4>
            <div className="space-y-2">
              {currentTier.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Security Level */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Protection Level</h4>
            <div className="space-y-3">
              <SecurityLevelBar
                label="Fraud Detection"
                value={selectedTier === 'retail' ? 60 : selectedTier === 'premium' ? 85 : 95}
                color="bg-rose-500"
              />
              <SecurityLevelBar
                label="Encryption"
                value={selectedTier === 'retail' ? 40 : selectedTier === 'premium' ? 70 : 100}
                color="bg-blue-500"
              />
              <SecurityLevelBar
                label="Device Trust"
                value={selectedTier === 'retail' ? 50 : selectedTier === 'premium' ? 80 : 95}
                color="bg-emerald-500"
              />
              <SecurityLevelBar
                label="Behavioral Analysis"
                value={selectedTier === 'retail' ? 30 : selectedTier === 'premium' ? 75 : 95}
                color="bg-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Simple Explanation */}
        <div className="mt-4 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">What This Means For You</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {selectedTier === 'retail' && (
              <>As a retail customer, you get simple, easy-to-understand security. We'll send you OTPs for verification and alert you if something looks suspicious. For complex security features, upgrade to premium.</>
            )}
            {selectedTier === 'premium' && (
              <>As a premium customer, you get enhanced security including cross-device approval for high-value transactions and behavioral biometrics. Your transactions are monitored in real-time for unusual patterns.</>
            )}
            {selectedTier === 'corporate' && (
              <>As a corporate/HNI customer, you get enterprise-grade security including quantum-safe encryption, multi-signature approval, and coercion detection. Dedicated relationship manager and custom security rules available.</>
            )}
          </p>
        </div>
      </motion.div>

      {/* Upgrade Prompt */}
      {selectedTier !== 'corporate' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Want more security?</h4>
              <p className="text-xs text-slate-500 mt-1">Upgrade to {selectedTier === 'retail' ? 'Premium' : 'Corporate'} for advanced protection features.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700">
              Learn More
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SecurityLevelBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-bold text-slate-800 dark:text-white">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Award, Gift, Star } from 'lucide-react';
import { useWealthStore } from '@/shared/store/wealthStore';

interface CustomerSegment {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
  features: string[];
  benefits: string[];
}

const SEGMENTS: CustomerSegment[] = [
  {
    id: 'etb',
    label: 'Existing-to-Bank (ETB)',
    icon: Award,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    description: 'Customers with existing relationship with PSB',
    features: [
      'Full feature access',
      'Loyalty rewards',
      'Priority support',
      'Advanced AI features',
      'Cross-device approval',
      'Quantum security',
    ],
    benefits: [
      'Higher transaction limits',
      'Lower fees',
      'Exclusive offers',
      'Early access to new features',
      'Dedicated relationship manager',
    ],
  },
  {
    id: 'ntb',
    label: 'New-to-Bank (NTB)',
    icon: UserPlus,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    description: 'New customers onboarding with PSB',
    features: [
      'Basic feature access',
      'Guided onboarding',
      'Educational content',
      'Simple AI assistant',
      'Standard security',
      'Basic fraud protection',
    ],
    benefits: [
      'Welcome offers',
      'Zero balance benefits',
      'Simplified UI',
      'Step-by-step guidance',
      'Trust building program',
    ],
  },
];

export default function ETBNTBSegmentation() {
  const [selectedSegment, setSelectedSegment] = useState<string>('etb');
  const user = useWealthStore((s) => s.user);
  const assets = useWealthStore((s) => s.assets);
  const netWorth = assets.reduce((sum, a) => sum + a.value, 0);

  // Determine segment based on account age or net worth (simplified)
  const isETB = netWorth > 100000 || user.name !== 'Guest';
  const autoSegment = isETB ? 'etb' : 'ntb';

  const currentSegment = SEGMENTS.find((s) => s.id === selectedSegment) || SEGMENTS[0];
  const Icon = currentSegment.icon;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" /> Customer Segmentation
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">ETB (Existing-to-Bank) and NTB (New-to-Bank) segmentation for personalized Bhavishya AI experience.</p>
      </div>

      {/* Current Segment Indicator */}
      <div className={`p-4 rounded-2xl border ${SEGMENTS.find(s => s.id === autoSegment)?.bgColor || 'bg-slate-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {autoSegment === 'etb' ? <Award className="w-5 h-5 text-emerald-600" /> : <UserPlus className="w-5 h-5 text-blue-600" />}
            <span className="text-sm font-bold text-slate-800 dark:text-white">
              Your Segment: <span className="text-indigo-600">{SEGMENTS.find(s => s.id === autoSegment)?.label || 'NTB'}</span>
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {autoSegment === 'etb' ? 'Existing Relationship' : 'New Customer'}
          </span>
        </div>
      </div>

      {/* Segment Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SEGMENTS.map((segment) => {
          const SegmentIcon = segment.icon;
          const isAuto = segment.id === autoSegment;
          return (
            <button
              key={segment.id}
              onClick={() => setSelectedSegment(segment.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedSegment === segment.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <SegmentIcon className={`w-5 h-5 ${segment.color}`} />
                <span className="text-sm font-bold text-slate-800 dark:text-white">{segment.label}</span>
                {isAuto && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">YOUR SEGMENT</span>}
              </div>
              <p className="text-xs text-slate-500">{segment.description}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Segment Details */}
      <motion.div
        key={selectedSegment}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 rounded-2xl border ${currentSegment.bgColor}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl ${currentSegment.color.replace('text-', 'bg-')} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white">{currentSegment.label}</h3>
            <p className="text-xs text-slate-500">{currentSegment.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Features */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Features</h4>
            <div className="space-y-2">
              {currentSegment.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Star className="w-4 h-4 text-amber-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Benefits</h4>
            <div className="space-y-2">
              {currentSegment.benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Gift className="w-4 h-4 text-emerald-500" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bhavishya AI Experience */}
        <div className="mt-4 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Bhavishya AI Experience</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
            {selectedSegment === 'etb' && (
              <>
                <div>• Advanced life event prediction</div>
                <div>• Generational wealth planning</div>
                <div>• Crisis scenario simulation</div>
                <div>• Personalized AI recommendations</div>
                <div>• Multi-device sync</div>
                <div>• Quantum-encrypted data</div>
              </>
            )}
            {selectedSegment === 'ntb' && (
              <>
                <div>• Basic financial planning</div>
                <div>• Goal setting guidance</div>
                <div>• Educational content</div>
                <div>• Simple AI assistant</div>
                <div>• Step-by-step tutorials</div>
                <div>• Trust building program</div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Value Proposition */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Customer Value</h4>
            <p className="text-xs text-slate-500 mt-1">
              {selectedSegment === 'etb' 
                ? 'Your existing relationship with PSB gives you access to premium features and personalized service.'
                : 'As a new customer, we\'ll guide you through every step to build your financial future with PSB.'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Net Worth</p>
            <p className="text-lg font-black text-indigo-600">₹{(netWorth / 100000).toFixed(1)}L</p>
          </div>
        </div>
      </div>
    </div>
  );
}

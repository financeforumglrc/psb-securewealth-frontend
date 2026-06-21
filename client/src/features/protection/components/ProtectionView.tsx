import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/shared/hooks/useTranslation';
import RiskMeter from '@/features/protection/components/RiskMeter';
import FraudDetectionEngine from '@/features/protection/components/FraudDetectionEngine';
import PanicButton from '@/features/protection/components/PanicButton';
import DuressModeToggle from '@/features/protection/components/DuressMode';
import ThreatIntel from '@/features/protection/components/ThreatIntel';
import StressTestSimulator from '@/features/protection/components/StressTestSimulator';
import ScamCallerID from '@/features/protection/components/ScamCallerID';
import BehavioralBiometrics from '@/features/protection/components/BehavioralBiometrics';
import DuressPinSetup from '@/features/protection/components/DuressPinSetup';
import PaymentGuard from '@/features/protection/components/PaymentGuard';
import SecurityLog from '@/features/protection/components/SecurityLog';
import OTPSimulation from '@/features/protection/components/OTPSimulation';
import SecureCheckout from '@/features/protection/components/SecureCheckout';
import URLSafetyChecker from '@/features/protection/components/URLSafetyChecker';
import DemoCreditCard from '@/features/credit/components/DemoCreditCard';
import CosmosCard from '@/shared/components/ui/CosmosCard';
import type { RiskSignals } from '@/shared/types';

export default function ProtectionView() {
  const [showOTP, setShowOTP] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPaymentGuard, setShowPaymentGuard] = useState(false);
  const [payeeName, setPayeeName] = useState('');
  const [signals, setSignals] = useState<RiskSignals>({
    newDevice: false, rushedAction: false, unusualAmount: false,
    otpRetries: false, firstTimeInvest: false, abnormalBehavior: false,
  });
  const [auditTrigger, setAuditTrigger] = useState(0);
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Protection Center</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time fraud detection, panic response, and behavioral shielding</p>
        </div>
      </div>

      {/* Top Row: Risk + Fraud */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <RiskMeter signals={signals} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <FraudDetectionEngine onSignalsChange={setSignals} onAudit={() => setAuditTrigger((n) => n + 1)} />
        </motion.div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: 'fa-mobile-screen-button', title: t('otpSimulation'), desc: t('demoTransaction'), onClick: () => setShowOTP(true), color: 'text-primary' },
          { icon: 'fa-fingerprint', title: t('runSecureCheckout'), desc: t('seeSecurityFlow'), onClick: () => setShowCheckout(true), color: 'text-emerald-500' },
          { icon: 'fa-shield-halved', title: 'Payment Guard', desc: 'Fraud DB check', onClick: () => setShowPaymentGuard(!showPaymentGuard), color: 'text-amber-500' },
          { icon: 'fa-credit-card', title: 'Card Shield', desc: 'Virtual card demo', onClick: () => {}, color: 'text-rose-500', component: <DemoCreditCard /> },
        ].map((item, i) => (
          <motion.div key={item.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            {item.component ? (
              item.component
            ) : (
              <CosmosCard variant="default" hover onClick={item.onClick}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${item.color}`}>
                    <i className={`fas ${item.icon}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.title}</p>
                    <p className="text-[10px] text-slate-400">{item.desc}</p>
                  </div>
                </div>
              </CosmosCard>
            )}
          </motion.div>
        ))}
      </div>

      {/* URL Safety Scanner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <URLSafetyChecker />
      </motion.div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}><PanicButton /></motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}><DuressModeToggle /></motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}><ThreatIntel /></motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StressTestSimulator />
        <ScamCallerID />
        <BehavioralBiometrics />
      </div>

      <DuressPinSetup />

      {/* Coercion Response System */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CosmosCard variant="default" header={{ icon: 'fa-shield-halved', iconColor: '#dc2626', title: 'Anti-Scam Shield' }}>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Real-time DOM mutation monitoring detects overlay attacks, clickjacking, and iframe injection.
            A subtle canvas watermark is rendered across the screen to protect screenshots.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-md"><i className="fas fa-eye mr-1" />MutationObserver</span>
            <span className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-md"><i className="fas fa-fingerprint mr-1" />Canvas Watermark</span>
            <span className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-md"><i className="fas fa-mouse-pointer mr-1" />Clickjacking Guard</span>
          </div>
        </CosmosCard>
        <CosmosCard variant="default" header={{ icon: 'fa-microphone-lines', iconColor: '#0f766e', title: 'Voice Command Bar' }}>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Hands-free banking with Web Speech API. Say <em>"show balance"</em>, <em>"pay bill"</em>, or <em>"duress"</em>.
            The mic button floats in the bottom-right corner across every screen.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-teal-50 text-teal-600 text-[10px] font-bold rounded-md"><i className="fas fa-language mr-1" />en-IN</span>
            <span className="px-2 py-1 bg-teal-50 text-teal-600 text-[10px] font-bold rounded-md"><i className="fas fa-wave-square mr-1" />Live Waveform</span>
            <span className="px-2 py-1 bg-teal-50 text-teal-600 text-[10px] font-bold rounded-md"><i className="fas fa-bolt mr-1" />8 Commands</span>
          </div>
        </CosmosCard>
      </div>

      {/* Payment Guard Section */}
      {showPaymentGuard && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <CosmosCard variant="default" header={{ icon: 'fa-shield-halved', iconColor: '#f59e0b', title: 'Payment Guard' }}>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Real-time check against the national fraud database before processing payments.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                placeholder="Enter payee name (try 'Quick Rich Scheme')..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
              />
              {payeeName.trim().length > 0 && (
                <PaymentGuard
                  payeeName={payeeName}
                  amount={50000}
                  onAllow={() => { alert('Payment allowed (demo)'); setPayeeName(''); }}
                  onBlock={() => setPayeeName('')}
                />
              )}
            </div>
          </CosmosCard>
        </motion.div>
      )}

      <SecurityLog refreshTrigger={auditTrigger} />

      {showOTP && <OTPSimulation actionType="Transfer" amount={50000} onConfirm={() => setShowOTP(false)} onCancel={() => setShowOTP(false)} />}
      <SecureCheckout show={showCheckout} onComplete={() => setShowCheckout(false)} />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { calculateProtectionScore, getProtectionDecision } from '@/shared/hooks/useProtectionEngine';
import DashboardWidget from '@/features/dashboard/components/DashboardWidget';
import RiskMeter from '@/features/protection/components/RiskMeter';
import FraudDetectionEngine from '@/features/protection/components/FraudDetectionEngine';
import PanicButton from '@/features/protection/components/PanicButton';
import DuressModeToggle from '@/features/protection/components/DuressMode';
import ThreatIntel from '@/features/protection/components/ThreatIntel';
import StressTestSimulator from '@/features/protection/components/StressTestSimulator';
import ScamCallerID from '@/features/protection/components/ScamCallerID';
import BehavioralBiometrics from '@/features/protection/components/BehavioralBiometrics';
import DuressPinSetup from '@/features/protection/components/DuressPinSetup';
import FamilySafeWord from '@/features/protection/components/FamilySafeWord';
import PaymentGuard from '@/features/protection/components/PaymentGuard';
import SecurityLog from '@/features/protection/components/SecurityLog';
import OTPSimulation from '@/features/protection/components/OTPSimulation';
import SecureCheckout from '@/features/protection/components/SecureCheckout';
import URLSafetyChecker from '@/features/protection/components/URLSafetyChecker';
import DemoCreditCard from '@/features/credit/components/DemoCreditCard';
import CosmosCard from '@/shared/components/ui/CosmosCard';
import type { RiskSignals, ProtectionDecision } from '@/shared/types';

const STEPS = [
  { id: 'signals', label: 'Signals', icon: 'fa-tower-broadcast' },
  { id: 'score', label: 'Score', icon: 'fa-gauge-high' },
  { id: 'decision', label: 'Decision', icon: 'fa-gavel' },
  { id: 'action', label: 'Action', icon: 'fa-shield-halved' },
];

function StepConnector({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="hidden md:flex items-center justify-between relative mb-6">
      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-700" />
      {STEPS.map((step, i) => {
        const active = i <= activeIndex;
        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                active
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <i className={`fas ${step.icon}`} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wide ${active ? 'text-primary' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DecisionCard({ decision, score }: { decision: ProtectionDecision; score: number }) {
  const config =
    decision.action === 'ALLOW'
      ? {
          gradient: 'from-emerald-500 to-teal-600',
          bg: 'bg-emerald-50 dark:bg-emerald-900/10',
          border: 'border-emerald-200 dark:border-emerald-800',
          text: 'text-emerald-700 dark:text-emerald-300',
          icon: 'fa-check-circle',
        }
      : decision.action === 'WARN'
      ? {
          gradient: 'from-amber-500 to-orange-600',
          bg: 'bg-amber-50 dark:bg-amber-900/10',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-700 dark:text-amber-300',
          icon: 'fa-triangle-exclamation',
        }
      : {
          gradient: 'from-rose-500 to-red-600',
          bg: 'bg-rose-50 dark:bg-rose-900/10',
          border: 'border-rose-200 dark:border-rose-800',
          text: 'text-rose-700 dark:text-rose-300',
          icon: 'fa-ban',
        };

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-4 text-center`}>
      <div
        className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${config.gradient} text-white flex items-center justify-center text-2xl shadow-lg mb-3`}
      >
        <i className={`fas ${config.icon}`} />
      </div>
      <h4 className={`text-2xl font-extrabold ${config.text} mb-1`}>{decision.action}</h4>
      <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">{decision.message}</p>
      <div className="space-y-1 text-[10px] text-slate-500 dark:text-slate-400">
        <p>
          <span className="font-bold">Score:</span> {score}/100
        </p>
        {decision.cooldown && (
          <p>
            <i className="fas fa-hourglass-half mr-1" />
            Cooldown: {decision.cooldown}s
          </p>
        )}
        {decision.delay && (
          <p>
            <i className="fas fa-clock mr-1" />
            Delay: {decision.delay}s
          </p>
        )}
        <p className="font-mono opacity-70">{decision.referenceId}</p>
      </div>
    </div>
  );
}

export default function ProtectionView() {
  const [signals, setSignals] = useState<RiskSignals>({
    newDevice: false,
    rushedAction: false,
    unusualAmount: false,
    otpRetries: false,
    firstTimeInvest: false,
    abnormalBehavior: false,
  });
  const [auditTrigger, setAuditTrigger] = useState(0);
  const [showOTP, setShowOTP] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [payeeName, setPayeeName] = useState('');
  const [amount, setAmount] = useState('50000');
  const [paymentRun, setPaymentRun] = useState(false);
  const { t } = useTranslation();

  const score = useMemo(() => calculateProtectionScore(signals), [signals]);
  const decision = useMemo(() => getProtectionDecision(score), [score]);
  const activeStep = useMemo(() => {
    if (score === 0) return 0;
    if (decision.action === 'ALLOW') return 3;
    if (decision.action === 'WARN') return 2;
    return 2;
  }, [score, decision.action]);

  const actionColor =
    decision.action === 'ALLOW' ? 'text-emerald-600' : decision.action === 'WARN' ? 'text-amber-600' : 'text-rose-600';

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Protection Center</h2>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-extrabold rounded-full border border-primary/20">
              MANDATORY LAYER
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Signals → Score → Decision → Action. Every transaction is evaluated by the Wealth Protection Layer.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
            <i className="fas fa-database mr-1" />
            National Fraud DB
          </span>
          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
            <i className="fas fa-fingerprint mr-1" />
            Behavioral Bio
          </span>
        </div>
      </div>

      {/* Stepper */}
      <StepConnector activeIndex={activeStep} />

      {/* Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <DashboardWidget title="1. Live Signals" icon="fa-tower-broadcast">
          <FraudDetectionEngine onSignalsChange={setSignals} onAudit={() => setAuditTrigger((n) => n + 1)} />
        </DashboardWidget>

        <DashboardWidget title="2. Risk Score" icon="fa-gauge-high">
          <RiskMeter signals={signals} />
        </DashboardWidget>

        <DashboardWidget
          title="3. Decision"
          icon="fa-gavel"
          action={
            <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 ${actionColor}`}>
              {decision.action}
            </span>
          }
        >
          <DecisionCard decision={decision} score={score} />
        </DashboardWidget>
      </div>

      {/* Action Simulation */}
      <DashboardWidget
        title="4. Action Simulation"
        icon="fa-flask"
        action={
          <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Sandbox
          </span>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Test a payment. The current risk decision ({' '}
              <span className={`font-bold ${actionColor}`}>{decision.action}</span> ) is applied automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={payeeName}
                onChange={(e) => {
                  setPayeeName(e.target.value);
                  setPaymentRun(false);
                }}
                placeholder="Payee name (try 'Quick Rich Scheme')..."
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
              />
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setPaymentRun(false);
                }}
                placeholder="Amount (₹)"
                className="w-full sm:w-36 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
              />
              <button
                onClick={() => setPaymentRun(true)}
                disabled={!payeeName.trim() || Number(amount) <= 0}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Run Check
              </button>
            </div>
            {paymentRun && Number(amount) > 0 && (
              <PaymentGuard
                payeeName={payeeName}
                amount={Number(amount)}
                onAllow={() => {
                  setPayeeName('');
                  setPaymentRun(false);
                }}
                onBlock={() => {
                  setPayeeName('');
                  setPaymentRun(false);
                }}
              />
            )}
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Other Actions</p>
            <button
              onClick={() => setShowOTP(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors"
            >
              <i className="fas fa-mobile-screen-button" />
              {t('otpSimulation')}
            </button>
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors"
            >
              <i className="fas fa-fingerprint" />
              {t('runSecureCheckout')}
            </button>
          </div>
        </div>
      </DashboardWidget>

      {/* Toolkit */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <i className="fas fa-toolbox text-primary" />
          Protection Toolkit
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            {
              icon: 'fa-shield-halved',
              title: 'Payment Guard',
              desc: 'Fraud DB check',
              onClick: () => document.getElementById('action-simulation')?.scrollIntoView({ behavior: 'smooth' }),
              color: 'text-amber-500',
            },
            {
              icon: 'fa-mobile-screen-button',
              title: t('otpSimulation'),
              desc: t('demoTransaction'),
              onClick: () => setShowOTP(true),
              color: 'text-primary',
            },
            {
              icon: 'fa-fingerprint',
              title: t('runSecureCheckout'),
              desc: t('seeSecurityFlow'),
              onClick: () => setShowCheckout(true),
              color: 'text-emerald-500',
            },
            {
              icon: 'fa-credit-card',
              title: 'Card Shield',
              desc: 'Virtual card demo',
              component: <DemoCreditCard />,
              color: 'text-rose-500',
            },
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <URLSafetyChecker />
          <PanicButton />
          <DuressModeToggle />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <ThreatIntel />
          <StressTestSimulator />
          <ScamCallerID />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <BehavioralBiometrics />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FamilySafeWord />
            <CosmosCard
              variant="default"
              header={{ icon: 'fa-microphone-lines', iconColor: '#0f766e', title: 'Voice Command Bar' }}
            >
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Hands-free banking with Web Speech API. Say <em>"show balance"</em>, <em>"pay bill"</em>, or <em>"duress"</em>.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-teal-50 text-teal-600 text-[10px] font-bold rounded-md">en-IN</span>
                <span className="px-2 py-1 bg-teal-50 text-teal-600 text-[10px] font-bold rounded-md">8 Commands</span>
              </div>
            </CosmosCard>
          </div>
        </div>

        <DuressPinSetup />
      </div>

      {/* Audit trail */}
      <SecurityLog refreshTrigger={auditTrigger} />

      {showOTP && <OTPSimulation actionType="Transfer" amount={50000} onConfirm={() => setShowOTP(false)} onCancel={() => setShowOTP(false)} />}
      <SecureCheckout show={showCheckout} onComplete={() => setShowCheckout(false)} />
    </div>
  );
}

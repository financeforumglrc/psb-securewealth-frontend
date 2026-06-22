import { motion } from 'framer-motion';
import UPIPaymentSimulator from '@/features/payments/components/UPIPaymentSimulator';
import CashbackPiggy from '@/features/payments/components/CashbackPiggy';
import StreakFire from '@/features/payments/components/StreakFire';
import BillSplitter from '@/features/payments/components/BillSplitter';
import PaymentRequests from '@/features/payments/components/PaymentRequests';
import SpinWheel from '@/features/payments/components/SpinWheel';
import MoodMeter from '@/features/payments/components/MoodMeter';
import GroupJar from '@/features/payments/components/GroupJar';
import VoicePayment from '@/features/payments/components/VoicePayment';
import DashboardWidget from '@/features/dashboard/components/DashboardWidget';
import { staggerContainer, staggerItem } from '@/shared/utils/animations';

const PAYMENT_STEPS = [
  { id: 'method', label: 'Method', icon: 'fa-credit-card' },
  { id: 'details', label: 'Details', icon: 'fa-pen-to-square' },
  { id: 'risk', label: 'Risk Scan', icon: 'fa-shield-virus' },
  { id: 'auth', label: 'Authenticate', icon: 'fa-fingerprint' },
  { id: 'complete', label: 'Complete', icon: 'fa-circle-check' },
];

const PROTECTION_CHECKS = [
  { icon: 'fa-shield-halved', label: 'Real-time Fraud DB', desc: 'Payee scanned against flagged accounts' },
  { icon: 'fa-brain', label: 'Behavioural Engine', desc: 'Anomaly detection on amount, time & device' },
  { icon: 'fa-lock', label: 'MPIN + OTP', desc: 'Two-factor authentication before debit' },
  { icon: 'fa-hourglass-half', label: 'Cooling Vault', desc: 'High-risk payments delayed for review' },
  { icon: 'fa-link', label: 'Blockchain Receipt', desc: 'Immutable audit trail on success' },
];

function PaymentStepper() {
  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-5 h-0.5 bg-slate-200 dark:bg-slate-700" />
      <div className="relative flex justify-between">
        {PAYMENT_STEPS.map((step) => (
          <div key={step.id} className="flex flex-col items-center gap-2 z-10">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-primary text-primary flex items-center justify-center text-sm font-bold shadow-sm">
              <i className={`fas ${step.icon}`} />
            </div>
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide hidden sm:block">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-bolt text-primary" />
              Payments Hub
            </h1>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-extrabold border border-emerald-200">
              PROTECTION-FIRST
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Every payment runs the Wealth Protection Layer: scan → score → decide → pay.
          </p>
        </div>
      </motion.div>

      {/* Stepper */}
      <motion.div variants={staggerItem} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <PaymentStepper />
      </motion.div>

      {/* Main payment flow + protection rail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={staggerItem}>
            <UPIPaymentSimulator />
          </motion.div>
        </div>

        <div className="space-y-6">
          <DashboardWidget title="Protection Checklist" icon="fa-shield-halved">
            <div className="space-y-3">
              {PROTECTION_CHECKS.map((check) => (
                <div key={check.label} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0">
                    <i className={`fas ${check.icon}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{check.label}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{check.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardWidget>

          <motion.div variants={staggerItem}>
            <SpinWheel />
          </motion.div>
          <motion.div variants={staggerItem}>
            <BillSplitter />
          </motion.div>
        </div>
      </div>

      {/* Rewards & Engagement Row */}
      <motion.div variants={staggerItem}>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <i className="fas fa-gift text-primary" />
          Rewards & Extras
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CashbackPiggy />
          <StreakFire />
          <VoicePayment onPay={(amt, payee) => alert(`Voice: Pay ₹${amt} to ${payee} — use the payment bar above!`)} />
          <MoodMeter />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={staggerItem}>
          <PaymentRequests />
        </motion.div>
        <motion.div variants={staggerItem}>
          <GroupJar />
        </motion.div>
      </div>

      {/* Cost-Neutral Info Footer */}
      <motion.div variants={staggerItem} className="card rounded-3xl shadow-xl p-6">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
          <i className="fas fa-scale-balanced text-primary" />
          How Cashback Is Cost-Neutral
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            { icon: 'fa-store', color: 'text-green-500', title: 'Merchant Commissions', desc: 'Swiggy, Amazon, Zomato pay 2-5% per transaction. Bank shares 0.5-2% as cashback.' },
            { icon: 'fa-credit-card', color: 'text-blue-500', title: 'MDR Savings', desc: 'UPI costs ~0% MDR vs 0.5-2% on cards. Savings passed to user as reward.' },
            { icon: 'fa-bullhorn', color: 'text-purple-500', title: 'Ad Revenue', desc: 'Partner ads generate revenue. A fraction is redistributed as user cashback.' },
            { icon: 'fa-user-group', color: 'text-amber-500', title: 'Referral Savings', desc: 'Organic referrals replace paid ads. CAC savings fund ₹50 referral bonuses.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <i className={`fas ${item.icon} ${item.color} mt-0.5`} />
              <div>
                <p className="font-medium text-slate-800 dark:text-white">{item.title}</p>
                <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

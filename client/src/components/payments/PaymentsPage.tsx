import { motion } from 'framer-motion';
import UPIPaymentSimulator from './UPIPaymentSimulator';
import CashbackPiggy from './CashbackPiggy';
import StreakFire from './StreakFire';
import BillSplitter from './BillSplitter';
import PaymentRequests from './PaymentRequests';
import SpinWheel from './SpinWheel';
import MoodMeter from './MoodMeter';
import GroupJar from './GroupJar';
import VoicePayment from './VoicePayment';
import { staggerContainer, staggerItem } from '../../utils/animations';

export default function PaymentsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 max-w-5xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="text-center mb-2">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center justify-center gap-2">
          <i className="fas fa-bolt text-primary" />
          Payments Hub
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pay, split, request, and earn — all in one place
        </p>
      </motion.div>

      {/* Top Row: Piggy + Streak + Voice + Mood */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CashbackPiggy />
        <StreakFire />
        <VoicePayment onPay={(amt, payee) => alert(`Voice: Pay ₹${amt} to ${payee} — use the payment bar above!`)} />
        <MoodMeter />
      </motion.div>

      {/* Main Row: Payment Simulator + Side Features */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={staggerItem}>
            <UPIPaymentSimulator />
          </motion.div>
        </div>
        <div className="space-y-6">
          <motion.div variants={staggerItem}>
            <SpinWheel />
          </motion.div>
          <motion.div variants={staggerItem}>
            <BillSplitter />
          </motion.div>
          <motion.div variants={staggerItem}>
            <PaymentRequests />
          </motion.div>
          <motion.div variants={staggerItem}>
            <GroupJar />
          </motion.div>
        </div>
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

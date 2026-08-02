import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Percent, Star, TrendingUp, Award, Zap, Shield, CheckCircle2 } from 'lucide-react';
import { useWealthStore } from '@/shared/store/wealthStore';

interface Offer {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  benefit: string;
  validUntil: string;
  minBalance: number;
}

const OFFERS: Offer[] = [
  {
    id: 'zero-fees',
    title: 'Zero Account Fees',
    description: 'No monthly maintenance charges for zero-balance accounts',
    icon: Shield,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    benefit: 'Save ₹500/year',
    validUntil: '31 Dec 2026',
    minBalance: 0,
  },
  {
    id: 'cashback',
    title: '2% Cashback on UPI',
    description: 'Get 2% cashback on all UPI transactions',
    icon: Percent,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    benefit: 'Up to ₹500/month',
    validUntil: 'Limited period',
    minBalance: 0,
  },
  {
    id: 'fd-rates',
    title: 'Higher FD Rates',
    description: 'Special 7.5% FD rate for zero-balance customers',
    icon: TrendingUp,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    benefit: '+0.5% extra',
    validUntil: '30 Sep 2026',
    minBalance: 0,
  },
  {
    id: 'free-insurance',
    title: 'Free Insurance',
    description: 'Complimentary ₹1L accident insurance cover',
    icon: Award,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    benefit: '₹1L coverage',
    validUntil: 'Always',
    minBalance: 0,
  },
  {
    id: 'referral',
    title: 'Referral Bonus',
    description: '₹500 for each successful referral',
    icon: Zap,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
    benefit: '₹500/referral',
    validUntil: 'Ongoing',
    minBalance: 0,
  },
];

export default function ZeroBalanceRetention() {
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const assets = useWealthStore((s) => s.assets);
  const netWorth = assets.reduce((sum, a) => sum + a.value, 0);
  const isZeroBalance = netWorth < 1000;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Gift className="w-5 h-5 text-indigo-600" /> Zero-Balance Retention
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Special offers and discounts for zero-balance and low-balance customers. New customer acquisition cost in banking is high — we value you.</p>
      </div>

      {/* Current Status */}
      <div className={`p-4 rounded-2xl border ${isZeroBalance ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isZeroBalance ? <Star className="w-5 h-5 text-amber-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            <span className="text-sm font-bold text-slate-800 dark:text-white">
              {isZeroBalance ? 'Zero-Balance Customer' : 'Active Customer'}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {isZeroBalance ? 'Eligible for all offers' : 'Keep growing your balance'}
          </span>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {OFFERS.map((offer) => {
          const Icon = offer.icon;
          return (
            <motion.button
              key={offer.id}
              onClick={() => setSelectedOffer(selectedOffer === offer.id ? null : offer.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedOffer === offer.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 ${offer.color}`} />
                <span className="text-sm font-bold text-slate-800 dark:text-white">{offer.title}</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">{offer.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600">{offer.benefit}</span>
                <span className="text-[10px] text-slate-400">{offer.validUntil}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Offer Details */}
      {selectedOffer && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-2xl border ${OFFERS.find(o => o.id === selectedOffer)?.bgColor || 'bg-slate-50'}`}
        >
          {(() => {
            const offer = OFFERS.find((o) => o.id === selectedOffer);
            if (!offer) return null;
            const Icon = offer.icon;
            return (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl ${offer.color.replace('text-', 'bg-')} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white">{offer.title}</h3>
                    <p className="text-xs text-slate-500">{offer.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50">
                    <p className="text-slate-500">Benefit</p>
                    <p className="font-bold text-slate-800 dark:text-white">{offer.benefit}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50">
                    <p className="text-slate-500">Valid Until</p>
                    <p className="font-bold text-slate-800 dark:text-white">{offer.validUntil}</p>
                  </div>
                </div>
                <button className="mt-3 w-full py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700">
                  Claim Offer
                </button>
              </>
            );
          })()}
        </motion.div>
      )}

      {/* Why We Offer This */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-black text-slate-800 dark:text-white mb-2">Why We Value Zero-Balance Customers</h3>
        <p className="text-xs text-slate-500">
          New customer acquisition cost in banking is ₹2,000-5,000 per customer. Once you're with us, we want to keep you.
          These offers are designed to help you start your financial journey with PSB and grow your wealth over time.
        </p>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { useRewards } from '../../context/RewardsContext';

const MAX_PIGGY = 500; // Visual max

export default function CashbackPiggy() {
  const { cashbackBalance } = useRewards();
  const fillPercent = Math.min((cashbackBalance / MAX_PIGGY) * 100, 100);

  return (
    <div className="card rounded-3xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <i className="fas fa-piggy-bank text-pink-500" />
          Cashback Piggy
        </h3>
        <span className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-2 py-1 rounded-lg">
          Merchant-funded
        </span>
      </div>

      <div className="flex items-center gap-5">
        {/* Piggy Visual */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Body */}
            <ellipse cx="50" cy="55" rx="38" ry="32" fill="#fce7f3" className="dark:fill-slate-700" />
            {/* Fill level */}
            <motion.ellipse
              cx="50"
              cy={55 + (32 * (1 - fillPercent / 100))}
              rx={38 * (fillPercent / 100) ** 0.3 + 5}
              ry={32 * (fillPercent / 100)}
              fill="#ec4899"
              initial={{ ry: 0 }}
              animate={{ ry: 32 * (fillPercent / 100) }}
              transition={{ duration: 1, ease: 'easeOut' }}
              opacity={0.6}
            />
            {/* Snout */}
            <ellipse cx="78" cy="52" rx="10" ry="8" fill="#fce7f3" className="dark:fill-slate-600" />
            <circle cx="75" cy="50" r="2" fill="#be185d" />
            <circle cx="81" cy="50" r="2" fill="#be185d" />
            {/* Eye */}
            <circle cx="35" cy="42" r="4" fill="#be185d" />
            {/* Ear */}
            <ellipse cx="25" cy="32" rx="8" ry="12" fill="#fce7f3" className="dark:fill-slate-600" transform="rotate(-20 25 32)" />
            {/* Legs */}
            <rect x="28" y="80" width="10" height="12" rx="3" fill="#fce7f3" className="dark:fill-slate-600" />
            <rect x="62" y="80" width="10" height="12" rx="3" fill="#fce7f3" className="dark:fill-slate-600" />
            {/* Coin slot */}
            <rect x="42" y="28" width="16" height="4" rx="2" fill="#be185d" />
          </svg>
          {/* Floating coin */}
          {fillPercent < 100 && (
            <motion.div
              animate={{ y: [0, -6, 0], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[8px] font-bold text-amber-800 shadow"
            >
              ₹
            </motion.div>
          )}
        </div>

        <div className="flex-1">
          <p className="text-xs text-slate-400 mb-1">Balance</p>
          <motion.p
            key={cashbackBalance}
            initial={{ scale: 1.2, color: '#ec4899' }}
            animate={{ scale: 1, color: '#1e293b' }}
            className="text-3xl font-bold text-slate-800 dark:text-white"
          >
            ₹{cashbackBalance.toFixed(2)}
          </motion.p>
          <div className="mt-2 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${fillPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{fillPercent.toFixed(0)}% towards ₹{MAX_PIGGY} goal</p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useRewards } from '@/shared/context/RewardsContext';

interface Props {
  compact?: boolean;
}

export default function CashbackWallet({ compact }: Props) {
  const { cashbackBalance, cashbackHistory, redeemCashback } = useRewards();
  const [redeeming, setRedeeming] = useState(false);

  const handleRedeem = () => {
    if (cashbackBalance < 10) return;
    setRedeeming(true);
    setTimeout(() => {
      redeemCashback();
      setRedeeming(false);
    }, 1500);
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80">Cashback Wallet</p>
            <p className="text-xl font-bold">₹{cashbackBalance.toFixed(2)}</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <i className="fas fa-wallet" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card rounded-3xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <i className="fas fa-wallet text-green-500" />
          Cashback Wallet
        </h3>
        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-lg">
          Zero cost to bank
        </span>
      </div>

      {/* Balance */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <p className="text-sm opacity-80 mb-1">Available Balance</p>
        <p className="text-4xl font-bold">₹{cashbackBalance.toFixed(2)}</p>
        <p className="text-xs opacity-70 mt-2">Merchant-funded & partner-funded only</p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={handleRedeem}
          disabled={cashbackBalance < 10 || redeeming}
          className="py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {redeeming ? <i className="fas fa-circle-notch fa-spin" /> : <i className="fas fa-arrow-right-to-bracket" />}
          {redeeming ? 'Processing...' : 'Redeem to Bank'}
        </button>
        <button
          onClick={() => alert('Use for next payment — applied automatically at checkout!')}
          className="py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
        >
          <i className="fas fa-bolt" />
          Use for Payment
        </button>
      </div>

      {/* History */}
      {cashbackHistory.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Recent Earnings</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {cashbackHistory.slice(0, 20).map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <i className="fas fa-plus text-green-500 text-xs" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-800 dark:text-white capitalize">{entry.source.replace('-', ' ')}</p>
                    {entry.merchant && <p className="text-xs text-slate-400">{entry.merchant}</p>}
                  </div>
                </div>
                <p className="text-sm font-bold text-green-500">+₹{entry.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
        <i className="fas fa-circle-info mt-0.5" />
        <div>
          <p className="font-medium">How is this cost-neutral?</p>
          <p className="mt-1 opacity-80">Cashback comes from merchant commissions (2-5%), ad revenue, and operational savings — never from bank capital.</p>
        </div>
      </div>
    </div>
  );
}

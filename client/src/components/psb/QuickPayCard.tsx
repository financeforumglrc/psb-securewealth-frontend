import { useState } from 'react';
import { motion } from 'framer-motion';

export default function QuickPayCard({ onExpand }: { onExpand?: () => void }) {
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    if (!payee || !amount) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPayee('');
      setAmount('');
      alert(`Payment of ₹${amount} to ${payee} successful!`);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="card-psb relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm shadow-primary/20">
              <i className="fas fa-bolt text-white text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Quick Pay</h3>
              <p className="text-[11px] text-gray-400">Instant UPI transfer</p>
            </div>
          </div>
          <button
            onClick={onExpand}
            className="text-[11px] font-semibold text-primary hover:text-primary-dark flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-primary-light transition-colors"
          >
            Full Hub <i className="fas fa-arrow-right text-[10px]" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">UPI ID / Mobile Number</label>
            <input
              type="text"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              placeholder="name@upi or mobile number"
              className="input-psb text-sm"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input-psb text-sm"
              max={200000}
            />
          </div>
          <div className="flex gap-2 text-[11px]">
            {['₹100', '₹500', '₹1000', '₹5000'].map((quick) => (
              <button
                key={quick}
                onClick={() => setAmount(quick.replace('₹', ''))}
                className="px-3 py-1.5 bg-primary-light/60 text-primary text-[11px] font-bold rounded-md hover:bg-primary/10 transition-colors border border-primary/10"
              >
                {quick}
              </button>
            ))}
          </div>
          {amount && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-[11px] text-success font-semibold flex items-center gap-1.5 bg-green-50 px-3 py-2 rounded-md"
            >
              <i className="fas fa-gift text-xs" /> ₹{Math.round(Number(amount) * 0.02)} cashback will be credited instantly
            </motion.p>
          )}
          <button
            onClick={handlePay}
            disabled={isProcessing || !payee || !amount}
            className="btn-psb btn-psb-primary w-full text-sm h-11 mt-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            {isProcessing ? (
              <><i className="fas fa-circle-notch fa-spin" /> Securing Payment...</>
            ) : (
              <><i className="fas fa-shield-halved" /> Pay Securely via UPI</>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

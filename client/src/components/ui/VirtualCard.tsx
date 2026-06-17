import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';

export default function VirtualCard() {
  const [hidden, setHidden] = useState(true);
  const [copied, setCopied] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [showLimits, setShowLimits] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(100000);
  const [monthlyLimit, setMonthlyLimit] = useState(500000);
  const setView = useWealthStore((s) => s.setView);

  const cardData = {
    number: '4532 1234 5678 1111',
    expiry: '12/28',
    cvv: '123',
    name: 'RAHUL SHARMA',
  };

  const handleCopy = () => {
    const text = `Card: ${cardData.number}\nExpiry: ${cardData.expiry}\nCVV: ${cardData.cvv}\nName: ${cardData.name}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleFreeze = () => {
    setFrozen((f) => {
      const next = !f;
       
      alert(next ? 'Card frozen. No transactions can be made until unfrozen.' : 'Card unfrozen. Transactions are enabled.');
      return next;
    });
  };

  const handlePay = () => {
    setView('payments');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="card-psb relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">My Card</h3>
        <button
          onClick={() => setHidden(!hidden)}
          className="text-[11px] font-semibold text-primary hover:text-primary-dark flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors"
        >
          <i className={`fas fa-${hidden ? 'eye' : 'eye-slash'}`} />
          {hidden ? 'Show' : 'Hide'}
        </button>
      </div>

      <div className="relative">
        {/* Card background */}
        <div className={`rounded-xl p-5 text-white relative overflow-hidden transition-all duration-300 ${frozen ? 'grayscale opacity-80' : ''}`} style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #0D3B10 50%, #1B5E20 100%)' }}>
          {frozen && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
              <div className="text-center">
                <i className="fas fa-lock text-3xl mb-1" />
                <p className="text-xs font-bold uppercase tracking-widest">Frozen</p>
              </div>
            </div>
          )}
          {/* Card pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <pattern id="card-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="white" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#card-pattern)" />
            </svg>
          </div>
          {/* Glow effect */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 40 40" className="w-8 h-8">
                  <circle cx="20" cy="20" r="18" fill="white" />
                  <circle cx="20" cy="20" r="14" fill="#FFD700" />
                  <text x="20" y="24" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#1B5E20">PSB</text>
                </svg>
                <span className="font-bold text-sm tracking-wider">PUNJAB & SIND BANK</span>
              </div>
              <i className="fab fa-cc-visa text-2xl opacity-80" />
            </div>

            {/* Card Number */}
            <div className="font-mono text-lg tracking-[0.15em] mb-4 min-h-[1.5em]">
              <AnimatePresence mode="wait">
                {hidden ? (
                  <motion.span
                    key="hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    **** **** **** 1111
                  </motion.span>
                ) : (
                  <motion.span
                    key="visible"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {cardData.number}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] uppercase opacity-60 mb-0.5">Card Holder</p>
                <div className="min-h-[1.2em]">
                  <AnimatePresence mode="wait">
                    {hidden ? (
                      <motion.p
                        key="name-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-semibold text-sm tracking-wide"
                      >
                        R**** S****
                      </motion.p>
                    ) : (
                      <motion.p
                        key="name-visible"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-semibold text-sm tracking-wide"
                      >
                        {cardData.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase opacity-60 mb-0.5">Expires</p>
                <div className="min-h-[1.2em]">
                  <AnimatePresence mode="wait">
                    {hidden ? (
                      <motion.p
                        key="exp-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-mono text-sm"
                      >
                        **/**
                      </motion.p>
                    ) : (
                      <motion.p
                        key="exp-visible"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-mono text-sm"
                      >
                        {cardData.expiry}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase opacity-60 mb-0.5">CVV</p>
                <div className="min-h-[1.2em]">
                  <AnimatePresence mode="wait">
                    {hidden ? (
                      <motion.p
                        key="cvv-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-mono text-sm"
                      >
                        ***
                      </motion.p>
                    ) : (
                      <motion.p
                        key="cvv-visible"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-mono text-sm"
                      >
                        {cardData.cvv}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <button
          onClick={handleFreeze}
          className={`py-2 text-[11px] font-bold rounded-lg transition-colors ${
            frozen
              ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
              : 'bg-primary-light text-primary hover:bg-primary/10'
          }`}
        >
          <i className={`fas fa-${frozen ? 'lock' : 'lock-open'} mr-1`} /> {frozen ? 'Unfreeze' : 'Freeze'}
        </button>
        <button
          onClick={() => setShowLimits((s) => !s)}
          className="py-2 bg-primary-light text-primary text-[11px] font-bold rounded-lg hover:bg-primary/10 transition-colors"
        >
          <i className="fas fa-sliders mr-1" /> Limits
        </button>
        <button
          onClick={handlePay}
          className="py-2 bg-primary-light text-primary text-[11px] font-bold rounded-lg hover:bg-primary/10 transition-colors"
        >
          <i className="fas fa-paper-plane mr-1" /> Pay
        </button>
        <button
          onClick={handleCopy}
          className="py-2 bg-primary-light text-primary text-[11px] font-bold rounded-lg hover:bg-primary/10 transition-colors"
        >
          <i className={`fas fa-${copied ? 'check' : 'copy'} mr-1`} />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Limits editor */}
      <AnimatePresence>
        {showLimits && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Daily limit</span>
                  <span className="font-bold">₹{dailyLimit.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={500000}
                  step={10000}
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Monthly limit</span>
                  <span className="font-bold">₹{monthlyLimit.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={2000000}
                  step={50000}
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <p className="text-[10px] text-slate-400">Limits are stored locally for this demo.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

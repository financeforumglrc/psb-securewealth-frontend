import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VirtualCard() {
  const [hidden, setHidden] = useState(true);
  const [copied, setCopied] = useState(false);

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
        <div className="rounded-xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #0D3B10 50%, #1B5E20 100%)' }}>
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
        <button className="py-2 bg-primary-light text-primary text-[11px] font-bold rounded-lg hover:bg-primary/10 transition-colors">
          <i className="fas fa-lock mr-1" /> Freeze
        </button>
        <button className="py-2 bg-primary-light text-primary text-[11px] font-bold rounded-lg hover:bg-primary/10 transition-colors">
          <i className="fas fa-sliders mr-1" /> Limits
        </button>
        <button className="py-2 bg-primary-light text-primary text-[11px] font-bold rounded-lg hover:bg-primary/10 transition-colors">
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
    </motion.div>
  );
}

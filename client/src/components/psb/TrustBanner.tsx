import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrustBanner() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-primary-light border-b border-primary/15 overflow-hidden"
      >
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[11px] text-primary-dark/85 flex-wrap">
            <span className="flex items-center gap-1.5">
              <i className="fas fa-shield-check text-secondary-dark text-xs" />
              <span className="font-bold">DICGC Insured</span>
              <span>Deposits up to ₹5 Lakhs</span>
            </span>
            <span className="hidden md:inline w-px h-4 bg-primary/20" />
            <span className="flex items-center gap-1.5">
              <i className="fas fa-lock text-secondary-dark text-xs" />
              <span className="font-bold">256-bit SSL</span>
              <span>Bank-grade encryption</span>
            </span>
            <span className="hidden md:inline w-px h-4 bg-primary/20" />
            <span className="flex items-center gap-1.5">
              <i className="fas fa-building-columns text-secondary-dark text-xs" />
              <span className="font-bold">RBI Regulated</span>
              <span>Licence No. 90</span>
            </span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-primary/50 hover:text-primary transition-colors shrink-0">
            <i className="fas fa-xmark" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

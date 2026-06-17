import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  show: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  amount?: number;
  onClose: () => void;
}

export default function AnimatedTransactionToast({ show, type, title, message, amount, onClose }: Props) {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => onCloseRef.current?.(), 4000);
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 350 }}
          className={`fixed bottom-6 right-6 z-[70] max-w-sm rounded-2xl shadow-2xl p-5 border-l-4 ${
            type === 'success'
              ? 'bg-white dark:bg-slate-800 border-green-500'
              : 'bg-white dark:bg-slate-800 border-rose-500'
          }`}
        >
          <div className="flex items-start gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.15 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                type === 'success' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'
              }`}
            >
              <i className={`fas fa-${type === 'success' ? 'check' : 'xmark'} text-lg`} />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 dark:text-white text-sm">{title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{message}</p>
              {amount !== undefined && amount > 0 && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm font-bold text-green-600 mt-1"
                >
                  +₹{amount.toFixed(2)} cashback
                </motion.p>
              )}
            </div>
            <button onClick={() => onCloseRef.current?.()} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <i className="fas fa-xmark" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

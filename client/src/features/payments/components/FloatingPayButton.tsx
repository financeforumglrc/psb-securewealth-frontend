import { motion } from 'framer-motion';

export default function FloatingPayButton() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('sw-open-payment-hub'));
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        boxShadow: [
          '0 4px 20px rgba(59, 130, 246, 0.3)',
          '0 4px 30px rgba(59, 130, 246, 0.5)',
          '0 4px 20px rgba(59, 130, 246, 0.3)',
        ],
      }}
      transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
      className="md:hidden fixed bottom-6 right-6 z-50 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center"
    >
      <i className="fas fa-bolt text-xl" />
    </motion.button>
  );
}

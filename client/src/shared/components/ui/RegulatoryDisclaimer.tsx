import { useTranslation } from '@/shared/hooks/useTranslation';
import { motion } from 'framer-motion';

interface Props {
  className?: string;
  compact?: boolean;
}

export default function RegulatoryDisclaimer({ className = '', compact = false }: Props) {
  const { language } = useTranslation();

  const hiText = compact
    ? 'सिमुलेशन/डेमो केवल। कोई गारंटीड रिटर्न नहीं। बाजार जोखिमों के अधीन है।'
    : 'सिमुलेशन / डेमो केवल। कोई गारंटीड रिटर्न नहीं। निवेश बाजार जोखिमों के अधीन हैं। कृपया निवेश करने से पहले सभी योजना संबंधी दस्तावेज़ ध्यान से पढ़ें। सिक्योरवेल्थ ट्विन कोई लाइसेंस प्राप्त बैंक, SEBI-पंजीकृत निवेश सलाहकार या बीमा प्रदाता नहीं है।';

  const enText = compact
    ? 'Simulation/demo only. No guaranteed returns. Subject to market risks.'
    : 'Simulation / demo only. No guaranteed returns. Investments are subject to market risks. Please read all scheme-related documents carefully before investing. SecureWealth Twin is not a licensed bank, SEBI-registered investment advisor, or insurance provider.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/70 dark:bg-amber-900/10 px-3 py-2 ${compact ? '' : 'flex items-start gap-2'} ${className}`}
    >
      <i className="fas fa-triangle-exclamation text-amber-500 text-[10px] mt-0.5 shrink-0" />
      <p className={`text-amber-700 dark:text-amber-300 ${compact ? 'text-[9px]' : 'text-[10px] leading-relaxed'}`}>
        <strong>{language === 'hi' ? 'अस्वीकरण:' : 'Disclaimer:'}</strong>{' '}
        {language === 'hi' ? hiText : enText}
      </p>
    </motion.div>
  );
}

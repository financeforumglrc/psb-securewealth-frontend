import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { VIEW_TITLES } from '@/shared/config/navigation';
import AccessibleFooter from '@/features/psb/components/AccessibleFooter';

interface PageProps {
  view: string;
  children: React.ReactNode;
}

export default function Page({ view, children }: PageProps) {
  const { language } = useTranslation();
  const pageTitle = VIEW_TITLES[view] || 'Dashboard';

  return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      {/* Page header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-gray-200 dark:border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{pageTitle}</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              SecureWealth Twin · Built-in fraud protection for every wealth action
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <i className="fas fa-shield-halved text-emerald-500" /> Protected
            </span>
          </div>
        </div>
      </div>

      {/* View content */}
      <div className="p-3 sm:p-5 lg:p-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Regulatory / simulation disclaimer */}
      <div className="mt-4 mx-4 lg:mx-8 mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          <strong className="text-slate-700 dark:text-slate-300">
            {language === 'hi' ? 'सिमुलेशन / डेमो केवल।' : 'Simulation / Demo Only.'}
          </strong>{' '}
          {language === 'hi'
            ? 'सिक्योरवेल्थ ट्विन एक हैकथॉन प्रोटोटाइप है। यह कोई लाइसेंस प्राप्त बैंक, SEBI-पंजीकृत निवेश सलाहकार या बीमा प्रदाता नहीं है। सभी अनुमान, सिफारिशें और बाजार डेटा केवल प्रदर्शन उद्देश्यों के लिए हैं।'
            : 'SecureWealth Twin is a hackathon prototype. It is not a licensed bank, SEBI-registered investment advisor, or insurance provider. All projections, recommendations, and market data are for demonstration purposes only.'}
        </p>
      </div>

      <AccessibleFooter />
    </main>
  );
}

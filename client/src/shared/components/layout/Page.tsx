import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { findGroupForView, findItemForView, VIEW_TITLES } from '@/shared/config/navigation';
import DecisionFlowStrip from './DecisionFlowStrip';
import AccessibleFooter from '@/features/psb/components/AccessibleFooter';

interface PageProps {
  view: string;
  children: React.ReactNode;
}

export default function Page({ view, children }: PageProps) {
  const { language } = useTranslation();
  const user = useWealthStore((s) => s.user);
  const pageTitle = VIEW_TITLES[view] || 'Dashboard';
  const item = findItemForView(view);
  const group = findGroupForView(view);

  const greeting = user?.name
    ? `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${user.name.split(' ')[0]}`
    : 'Welcome back';

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-psb-bg dark:bg-slate-950">
      {/* Sticky page header */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
            <button
              onClick={() => useWealthStore.getState().setView('dashboard')}
              className="hover:text-primary transition-colors"
            >
              Home
            </button>
            {group && (
              <>
                <i className="fas fa-chevron-right text-[8px]" />
                <span className="font-medium">{group.title}</span>
              </>
            )}
            <i className="fas fa-chevron-right text-[8px]" />
            <span className="font-bold text-slate-700 dark:text-slate-300">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-3">
            {item && (
              <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <i className={`fas ${item.icon} text-sm`} />
              </span>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">
                {pageTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {greeting} · SecureWealth Twin with built-in fraud protection
              </p>
            </div>
          </div>
        </div>
      </div>

      <DecisionFlowStrip currentView={view} />

      {/* View content */}
      <div className="px-3 sm:px-5 lg:px-6 pt-3 sm:pt-4 pb-5 sm:pb-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Regulatory / simulation disclaimer */}
      <div className="mx-4 lg:mx-8 mb-6 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 text-center">
        <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
          <i className="fas fa-triangle-exclamation mr-1.5" />
          <strong>
            {language === 'hi' ? 'सिमुलेशन / डेमो केवल — कोई गारंटीड रिटर्न नहीं।' : 'Simulation / Demo Only — No Guaranteed Returns.'}
          </strong>{' '}
          {language === 'hi'
            ? 'सिक्योरवेल्थ ट्विन एक हैकथॉन प्रोटोटाइप है। यह कोई लाइसेंस प्राप्त बैंक, SEBI-पंजीकृत निवेश सलाहकार या बीमा प्रदाता नहीं है। सभी अनुमान, सिफारिशें और बाजार डेटा केवल प्रदर्शन उद्देश्यों के लिए हैं। निवेश बाजार जोखिमों के अधीन हैं।'
            : 'SecureWealth Twin is a hackathon prototype. It is not a licensed bank, SEBI-registered investment advisor, or insurance provider. All projections, recommendations, and market data are for demonstration purposes only. Investments are subject to market risks.'}
        </p>
      </div>

      <AccessibleFooter />
    </main>
  );
}

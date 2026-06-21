import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { findGroupForView, findItemForView, VIEW_TITLES } from '@/shared/config/navigation';
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
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mb-1">
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

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                {item && (
                  <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <i className={`fas ${item.icon} text-sm`} />
                  </span>
                )}
                {pageTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {greeting} · SecureWealth Twin with built-in fraud protection
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => useWealthStore.getState().setView('payments')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
              >
                <i className="fas fa-paper-plane" /> Pay
              </button>
              <button
                onClick={() => useWealthStore.getState().setView('transactions')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <i className="fas fa-list" /> History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View content */}
      <div className="p-3 sm:p-5 lg:p-6 max-w-7xl mx-auto">
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
      <div className="mx-4 lg:mx-8 mb-6 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center">
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

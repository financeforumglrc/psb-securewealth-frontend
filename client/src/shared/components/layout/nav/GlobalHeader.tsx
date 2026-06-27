import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/shared/context/AuthContext';
import { useSecurity } from '@/shared/context/SecurityContext';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useWealthStore } from '@/shared/store/wealthStore';
import { clearAuth } from '@/shared/services/authService';
import PSBLogo from '@/features/psb/components/PSBLogo';
import SearchBar from './SearchBar';
import NotificationCenter from '@/features/dashboard/components/NotificationCenter';

interface GlobalHeaderProps {
  onOpenMobileSidebar: () => void;
  onNavigate: (view: string) => void;
}

function TrustScorePill({ score }: { score: number }) {
  let color = 'bg-emerald-500';
  let label = 'Low Risk';
  if (score < 40) {
    color = 'bg-rose-500';
    label = 'High Risk';
  } else if (score < 75) {
    color = 'bg-amber-500';
    label = 'Medium Risk';
  }
  return (
    <div
      className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100"
      title="Wealth Protection Trust Score"
    >
      <div className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
      <span className="text-[10px] font-bold text-emerald-800">{score}</span>
      <span className="text-[10px] text-emerald-700 hidden xl:inline">{label}</span>
    </div>
  );
}

export default function GlobalHeader({ onOpenMobileSidebar, onNavigate }: GlobalHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const { state: authState, dispatch: authDispatch } = useAuth();
  const user = useWealthStore((s) => s.user);
  const darkMode = useWealthStore((s) => s.darkMode);
  const { setLanguage, isHindi } = useTranslation();
  const security = useSecurity();
  const trustScore = security?.state?.trustScore ?? 50;

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const handleLogout = () => {
    clearAuth();
    authDispatch({ type: 'LOGOUT' });
    setProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-[60px] gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileSidebar}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label="Open menu"
            >
              <i className="fas fa-bars text-lg" />
            </button>
            <PSBLogo variant="dark" />
          </div>

          <SearchBar />

          <div className="flex items-center gap-1 sm:gap-2">
            <TrustScorePill score={trustScore} />

            <button
              onClick={() => setLanguage(isHindi() ? 'en' : 'hi')}
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              title="Toggle language"
              aria-label="Toggle language"
            >
              <span className="text-[11px] font-bold">{isHindi() ? 'EN' : 'हि'}</span>
            </button>

            <button
              onClick={() => window.open('/demo', '_blank')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/20 text-primary-dark text-[11px] font-bold hover:bg-secondary/30 transition-colors"
              title="Try the judge demo"
            >
              <i className="fas fa-rocket" /> Demo
            </button>

            <NotificationCenter />

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                  {userInitials}
                </div>
                <span className="hidden sm:block text-xs font-bold text-slate-700 max-w-[90px] truncate">
                  {user?.name || 'User'}
                </span>
                <i className="fas fa-chevron-down text-[10px] text-slate-400 hidden sm:block" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-sm font-bold text-slate-800 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate">{authState.userEmail || 'demo@psb.co.in'}</p>
                      </div>
                      <button
                        onClick={() => { onNavigate('profile'); setProfileOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                      >
                        <i className="fas fa-user text-slate-400 w-4" /> Profile
                      </button>
                      <button
                        onClick={() => { useWealthStore.getState().toggleDarkMode(); setProfileOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                      >
                        <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-slate-400 w-4`} />
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                      </button>
                      <button
                        onClick={() => { onNavigate('accessibility'); setProfileOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                      >
                        <i className="fas fa-universal-access text-slate-400 w-4" /> Accessibility
                      </button>
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => { window.location.href = '/admin'; setProfileOpen(false); }}
                          className="w-full px-4 py-2.5 text-left text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-3"
                        >
                          <i className="fas fa-shield-alt text-emerald-400 w-4" /> Admin Portal
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-3"
                        >
                          <i className="fas fa-sign-out-alt text-rose-400 w-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

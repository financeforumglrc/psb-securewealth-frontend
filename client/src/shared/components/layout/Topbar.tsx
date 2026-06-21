import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useSecurity } from '@/shared/context/SecurityContext';
import { clearAuth } from '@/shared/services/authService';
import { useAuth } from '@/shared/context/AuthContext';
import PSBLogo from '@/features/psb/components/PSBLogo';
import { MEGA_MENU } from '@/shared/config/navigation';
import type { NavGroup, NavItem } from '@/shared/config/navigation';

interface TopbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenMobileSidebar: () => void;
  queuedCount: number;
}

function NetworkStatusBadge() {
  const { online } = useNetworkStatus();
  return (
    <span
      className={`flex items-center gap-1.5 text-[10px] font-medium ${
        online ? 'text-emerald-600' : 'text-amber-600'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-amber-500'} ${online ? 'animate-pulse' : ''}`} />
      {online ? 'Online' : 'Offline'}
    </span>
  );
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

function SearchBar() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('sw-open-command-palette'))}
      className="hidden md:flex items-center gap-2 w-64 xl:w-80 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-medium transition-colors"
    >
      <i className="fas fa-magnifying-glass" />
      <span className="flex-1 text-left">Search anything…</span>
      <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded bg-white text-[10px] font-bold text-slate-400 border border-slate-200">⌘K</kbd>
    </button>
  );
}

function MegaMenuPanel({
  category,
  currentView,
  onNavigate,
  onClose,
}: {
  category: (typeof MEGA_MENU)[number];
  currentView: string;
  onNavigate: (view: string) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.18 }}
      className="absolute left-0 right-0 top-full z-40 px-4 sm:px-6 lg:px-8 pt-2"
      onMouseLeave={onClose}
    >
      <div className="max-w-[1440px] mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Feature highlight */}
          <div className="hidden lg:flex lg:col-span-3 flex-col justify-between p-6 bg-gradient-to-br from-primary to-primary-dark text-white">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <i className={`fas ${category.icon} text-xl text-secondary`} />
              </div>
              <h3 className="text-lg font-bold mb-2">{category.label}</h3>
              <p className="text-sm text-white/80 leading-relaxed">{category.description}</p>
            </div>
            <button
              onClick={() => {
                onNavigate(category.groups[0]?.items[0]?.view || 'dashboard');
                onClose();
              }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-primary-dark text-xs font-bold hover:bg-secondary-light transition-colors"
            >
              Open {category.groups[0]?.items[0]?.label || 'Dashboard'} <i className="fas fa-arrow-right" />
            </button>
          </div>

          {/* Menu tree */}
          <div className="col-span-1 lg:col-span-9 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {category.groups.map((group: NavGroup) => (
                <div key={group.id}>
                  <div className={`flex items-center gap-2 mb-3 pb-2 border-b border-slate-100`}>
                    <i className={`fas fa-folder-open ${group.colorClass} text-xs`} />
                    <p className={`text-[11px] font-extrabold uppercase tracking-widest ${group.colorClass}`}>
                      {group.title}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item: NavItem) => {
                      const active = currentView === item.view;
                      return (
                        <button
                          key={item.view}
                          onClick={() => {
                            onNavigate(item.view);
                            onClose();
                          }}
                          className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                            active
                              ? 'bg-primary/10 text-primary-dark'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <i className={`fas ${item.icon} text-xs`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold">{item.label}</span>
                              {item.badge && (
                                <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700">
                                  {item.badge}
                                </span>
                              )}
                              {item.alert && !active && (
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                              )}
                            </div>
                            {item.description && (
                              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Topbar({ currentView, onNavigate, onOpenMobileSidebar, queuedCount }: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { state: authState, dispatch: authDispatch } = useAuth();
  const user = useWealthStore((s) => s.user);
  const darkMode = useWealthStore((s) => s.darkMode);
  const { setLanguage, isHindi } = useTranslation();
  const security = useSecurity();
  const trustScore = security?.state?.trustScore ?? 50;

  const handleLogout = () => {
    clearAuth();
    authDispatch({ type: 'LOGOUT' });
    setProfileOpen(false);
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const activeCategoryId = MEGA_MENU.find((cat) =>
    cat.groups.some((g) => g.items.some((i) => i.view === currentView))
  )?.id;

  const openMenu = (id: string) => {
    if (menuTimeout.current) clearTimeout(menuTimeout.current);
    setActiveMenu(id);
  };

  const closeMenuSoon = () => {
    menuTimeout.current = setTimeout(() => setActiveMenu(null), 120);
  };

  return (
    <>
      {/* Regulatory / trust strip */}
      <div className="bg-primary-dark text-white text-[10px] sm:text-[11px]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-1.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-5 overflow-hidden whitespace-nowrap">
            <span className="flex items-center gap-1.5">
              <i className="fas fa-shield-check text-secondary text-[10px]" />
              <span><strong>DICGC</strong> Insured</span>
            </span>
            <span className="hidden sm:inline w-px h-3 bg-white/20" />
            <span className="hidden sm:flex items-center gap-1.5">
              <i className="fas fa-lock text-secondary text-[10px]" />
              <span>256-bit SSL</span>
            </span>
            <span className="hidden md:inline w-px h-3 bg-white/20" />
            <span className="hidden md:flex items-center gap-1.5">
              <i className="fas fa-building-columns text-secondary text-[10px]" />
              <span><strong>RBI</strong> Regulated</span>
            </span>
            {queuedCount > 0 && (
              <>
                <span className="hidden lg:inline w-px h-3 bg-white/20" />
                <span className="hidden lg:flex items-center gap-1.5 text-amber-300">
                  <i className="fas fa-clock-rotate-left" />
                  <span><strong>Queue:</strong> {queuedCount} pending</span>
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <NetworkStatusBadge />
            <button
              onClick={() => alert('Fraud reported. RBI Cyber Security Cell has been notified.')}
              className="flex items-center gap-1 text-[10px] text-red-300 hover:text-white font-semibold transition-colors"
            >
              <i className="fas fa-triangle-exclamation" /> <span className="hidden sm:inline">Report Fraud</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-[64px] gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenMobileSidebar}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
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

              <button className="relative flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
                <i className="fas fa-bell" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
              </button>

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

      {/* Category navigation bar with mega menus */}
      <nav className="hidden lg:block bg-primary-dark border-t border-white/10 sticky top-[64px] z-40">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
          <div className="flex items-center gap-1 h-[44px]">
            {MEGA_MENU.map((cat) => {
              const isActive = activeCategoryId === cat.id || activeMenu === cat.id;
              return (
                <div
                  key={cat.id}
                  className="relative h-full"
                  onMouseEnter={() => openMenu(cat.id)}
                  onMouseLeave={closeMenuSoon}
                >
                  <button
                    onClick={() => openMenu(activeMenu === cat.id ? '' : cat.id)}
                    className={`flex items-center gap-2 px-4 h-full text-[12px] font-bold tracking-tight transition-colors border-b-2 ${
                      isActive
                        ? 'text-white border-secondary bg-white/10'
                        : 'text-white/80 border-transparent hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <i className={`fas ${cat.icon} ${isActive ? 'text-secondary' : 'text-white/60'}`} />
                    {cat.label}
                    <i className={`fas fa-chevron-down text-[9px] transition-transform ${isActive ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              );
            })}

            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={() => onNavigate('payments')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-primary-dark text-[11px] font-bold hover:bg-secondary-light transition-colors"
              >
                <i className="fas fa-paper-plane" /> Pay Now
              </button>
            </div>
          </div>
        </div>

        {/* Mega menu dropdown */}
        <AnimatePresence>
          {activeMenu && (
            <MegaMenuPanel
              category={MEGA_MENU.find((c) => c.id === activeMenu)!}
              currentView={currentView}
              onNavigate={onNavigate}
              onClose={() => setActiveMenu(null)}
            />
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

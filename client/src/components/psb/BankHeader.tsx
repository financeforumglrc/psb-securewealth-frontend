import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { clearAuth } from '../../services/authService';
import { useWealthStore } from '../../store/wealthStore';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import PSBLogo from './PSBLogo';
import CommandPalette from '../ui/CommandPalette';
import CreateAccountModal from '../auth/CreateAccountModal';

const NAV_LINKS = [
  { view: 'dashboard', label: 'Home' },
  { view: 'payments', label: 'Payments' },
  { view: 'goals', label: 'Goals' },
  { view: 'portfolio', label: 'Portfolio' },
  { view: 'subscriptions', label: 'Subscriptions' },
  { view: 'security-beast', label: 'Security' },
  { view: 'innovation-lab', label: 'Innovation' },
];

export default function BankHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const { dispatch: authDispatch } = useAuth();
  const currentView = useWealthStore((s) => s.currentView);
  const darkMode = useWealthStore((s) => s.darkMode);
  const user = useWealthStore((s) => s.user);

  const handleNav = (view: string) => {
    useWealthStore.getState().setView(view as any);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Scrolling header bars */}
      <header className="bg-primary text-white shadow-sm">
        {/* Top bar - dark green */}
        <div className="bg-primary-dark border-b border-white/10">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 flex items-center justify-between h-6 text-[10px]">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5"><i className="fas fa-phone text-[10px]" /> Toll Free: 1800-11-2211</span>
              <span className="hidden sm:flex items-center gap-1.5"><i className="fas fa-envelope text-[10px]" /> care@psbindia.co.in</span>
              <span className="hidden md:flex items-center gap-1.5"><i className="fas fa-building-columns text-[10px]" /> RBI Licensed Bank</span>
            </div>
            <div className="flex items-center gap-4">
              <NetworkStatusBadge />
              <button className="hover:text-white/80 transition-colors hidden sm:block text-[10px]">Internet Banking</button>
              <button
                onClick={() => alert('Fraud reported. RBI Cyber Security Cell has been notified.')}
                className="flex items-center gap-1 text-red-300 hover:text-white font-semibold transition-colors"
              >
                <i className="fas fa-triangle-exclamation text-[10px]" /> Report Fraud
              </button>
            </div>
          </div>
        </div>

        {/* Yellow strip - scrolling Punjab & Sind Bank tagline */}
        <div className="bg-secondary border-t border-secondary-dark/20 overflow-hidden">
          <div className="max-w-[1440px] mx-auto h-6 flex items-center relative">
            <div className="flex whitespace-nowrap animate-[ticker_25s_linear_infinite] hover:[animation-play-state:paused]">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-center gap-6 sm:gap-10 px-6 sm:px-10">
                  <span className="text-[11px] font-bold text-primary-dark tracking-wide">
                    जहाँ सेवा ही जीवन-ध्येय है | Where service is a way of life
                  </span>
                  <span className="text-[10px] text-primary-dark/70">
                    Est. 1908 · 1550+ Branches · Government of India Undertaking
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Sticky main navigation */}
      <div className="sticky top-0 z-50 bg-primary shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-[52px]">
            <PSBLogo />

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.view}
                  onClick={() => handleNav(link.view)}
                  className={`px-3 py-1.5 rounded-sm text-[12px] font-semibold transition-colors tracking-tight ${
                    currentView === link.view
                      ? 'bg-white/15 text-white'
                      : 'text-white/85 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <CommandPalette />
              <button
                onClick={() => window.open('/demo', '_blank')}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400 text-primary-dark text-xs font-bold hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20"
                title="Try the judge demo"
              >
                <i className="fas fa-rocket" /> Demo Mode
              </button>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-sm hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center text-sm font-bold border border-white/20">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-[12px] font-semibold leading-tight">{user.name}</p>
                    <p className="text-[10px] text-white/60 leading-tight">CIF: 9876543210</p>
                  </div>
                  <i className="fas fa-chevron-down text-[10px] text-white/50" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-md shadow-xl border border-gray-200 py-2 z-50 text-gray-800"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-bold text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.name.toLowerCase().replace(/\s+/g, '.') + '@psbsecurewealth.com'}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-primary-light text-primary text-[10px] font-bold rounded-sm">Premium</span>
                            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-sm">KYC Verified</span>
                          </div>
                        </div>
                        <div className="py-1">
                          <button onClick={() => { useWealthStore.getState().setView('kids-mode'); setProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3">
                            <i className="fas fa-child text-amber-500 w-4" /> Kids Mode
                          </button>
                          <button onClick={() => { useWealthStore.getState().toggleDarkMode(); setProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3">
                            <i className={`fas fa-${darkMode ? 'sun' : 'moon'} text-gray-400 w-4`} /> {darkMode ? 'Light Mode' : 'Dark Mode'}
                          </button>
                          <button onClick={() => { useWealthStore.getState().setView('family'); setProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3">
                            <i className="fas fa-people-group text-primary w-4" /> Family Dashboard
                          </button>
                          <button onClick={() => { useWealthStore.getState().setView('profile'); setProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3">
                            <i className="fas fa-user-gear text-slate-500 w-4" /> Profile & Settings
                          </button>
                          <button onClick={() => { setProfileOpen(false); setCreateOpen(true); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3">
                            <i className="fas fa-user-plus text-emerald-600 w-4" /> Create New Account
                          </button>
                          <button onClick={() => { useWealthStore.getState().setView('admin'); setProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3">
                            <i className="fas fa-user-shield text-violet-600 w-4" /> Admin Panel
                          </button>
                        </div>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={() => { clearAuth(); authDispatch({ type: 'LOGOUT' }); setProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-red-50 flex items-center gap-3">
                            <i className="fas fa-right-from-bracket w-4" /> Switch Account
                          </button>
                        </div>
                      </motion.div>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="xl:hidden w-8 h-8 flex items-center justify-center rounded-sm hover:bg-white/10"
              >
                <i className={`fas fa-${mobileOpen ? 'xmark' : 'bars'} text-lg`} />
              </button>
            </div>
          </div>
        </div>

        <CreateAccountModal open={createOpen} onClose={() => setCreateOpen(false)} />

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="xl:hidden bg-primary-dark border-t border-white/10 overflow-hidden"
            >
              <div className="px-4 py-2 space-y-0.5">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.view}
                    onClick={() => handleNav(link.view)}
                    className={`w-full text-left px-4 py-2.5 rounded-sm text-sm font-semibold transition-colors ${
                      currentView === link.view
                        ? 'bg-white/15 text-white'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function NetworkStatusBadge() {
  const { online, connectionType, downlink } = useNetworkStatus();
  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium ${
      online ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
      <span className="hidden sm:inline">{online ? (connectionType !== 'unknown' ? `${connectionType.toUpperCase()} ${downlink ? `• ${downlink} Mbps` : ''}` : 'Online') : 'Offline'}</span>
      <span className="sm:hidden">{online ? '●' : '✕'}</span>
    </div>
  );
}

import { useState } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useSecurity } from '@/shared/context/SecurityContext';
import { clearAuth } from '@/shared/services/authService';
import { useAuth } from '@/shared/context/AuthContext';
import CommandPalette from '@/shared/components/ui/CommandPalette';
import PSBLogo from '@/features/psb/components/PSBLogo';
import { TOP_NAV_LINKS } from '@/shared/config/navigation';

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
        online ? 'text-emerald-300' : 'text-amber-300'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-400' : 'bg-amber-400'}`} />
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
      className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/10"
      title="Wealth Protection Trust Score"
    >
      <div className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
      <span className="text-[10px] font-bold text-white/90">{score}</span>
      <span className="text-[10px] text-white/70 hidden lg:inline">{label}</span>
    </div>
  );
}

export default function Topbar({ currentView, onNavigate, onOpenMobileSidebar, queuedCount }: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [trustBannerOpen, setTrustBannerOpen] = useState(true);
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

  return (
    <>
      {/* Trust / regulatory strip */}
      {trustBannerOpen && (
        <div className="bg-primary-light border-b border-primary/15">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-1.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-[10px] text-primary-dark/85 overflow-x-auto whitespace-nowrap">
              <span className="flex items-center gap-1.5">
                <i className="fas fa-shield-check text-secondary-dark text-[10px]" />
                <span className="font-bold">DICGC Insured</span>
                <span className="hidden sm:inline">Deposits up to ₹5 Lakhs</span>
              </span>
              <span className="hidden md:inline w-px h-4 bg-primary/20" />
              <span className="flex items-center gap-1.5">
                <i className="fas fa-lock text-secondary-dark text-[10px]" />
                <span className="font-bold">256-bit SSL</span>
              </span>
              <span className="hidden md:inline w-px h-4 bg-primary/20" />
              <span className="flex items-center gap-1.5">
                <i className="fas fa-building-columns text-secondary-dark text-[10px]" />
                <span className="font-bold">RBI Regulated</span>
              </span>
              {queuedCount > 0 && (
                <>
                  <span className="hidden md:inline w-px h-4 bg-primary/20" />
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <i className="fas fa-clock-rotate-left" />
                    <span>
                      <strong>Queue:</strong> {queuedCount} pending
                    </span>
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <NetworkStatusBadge />
              <button
                onClick={() => alert('Fraud reported. RBI Cyber Security Cell has been notified.')}
                className="flex items-center gap-1 text-[10px] text-red-700 hover:text-red-800 font-semibold transition-colors"
              >
                <i className="fas fa-triangle-exclamation" /> Report Fraud
              </button>
              <button
                onClick={() => setTrustBannerOpen(false)}
                className="text-primary/50 hover:text-primary transition-colors"
                aria-label="Close trust banner"
              >
                <i className="fas fa-xmark" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky main navigation */}
      <header className="sticky top-0 z-50 bg-primary shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-[52px]">
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenMobileSidebar}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-md text-white hover:bg-white/10"
                aria-label="Open menu"
              >
                <i className="fas fa-bars" />
              </button>
              <PSBLogo />
            </div>

            {/* Desktop top nav */}
            <nav className="hidden xl:flex items-center gap-0.5">
              {TOP_NAV_LINKS.map((link) => (
                <button
                  key={link.view}
                  onClick={() => onNavigate(link.view)}
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

            <div className="flex items-center gap-2 sm:gap-3">
              <TrustScorePill score={trustScore} />

              <CommandPalette />

              <button
                onClick={() => window.open('/demo', '_blank')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-primary-dark text-[11px] font-bold hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20"
                title="Try the judge demo"
              >
                <i className="fas fa-rocket" /> Demo
              </button>

              <button
                onClick={() => setLanguage(isHindi() ? 'en' : 'hi')}
                className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-sm text-[11px] font-semibold text-white/90 hover:bg-white/10 transition-colors"
                aria-label="Toggle language"
              >
                <i className="fas fa-language" />
                {isHindi() ? 'EN' : 'हि'}
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 transition-colors"
                >
                  <div className="w-7 h-7 bg-white/15 rounded-full flex items-center justify-center text-xs font-bold border border-white/20 text-white">
                    {userInitials}
                  </div>
                  <span className="hidden sm:block text-xs font-semibold text-white/90 max-w-[100px] truncate">
                    {user?.name || 'User'}
                  </span>
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-800 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{authState.userEmail || 'demo@psb.co.in'}</p>
                      </div>
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setProfileOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <i className="fas fa-user text-gray-400" /> Profile
                      </button>
                      <button
                        onClick={() => {
                          useWealthStore.getState().toggleDarkMode();
                          setProfileOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-gray-400`} />
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('accessibility');
                          setProfileOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <i className="fas fa-universal-access text-gray-400" /> Accessibility
                      </button>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <i className="fas fa-sign-out-alt text-rose-400" /> Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

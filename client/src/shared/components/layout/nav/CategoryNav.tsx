import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MEGA_MENU } from '@/shared/config/navigation';
import UnifiedMegaMenu from './UnifiedMegaMenu';

interface CategoryNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function CategoryNav({ currentView, onNavigate }: CategoryNavProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setActiveMenu(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const activeCategoryId = MEGA_MENU.find((cat) =>
    cat.groups.some((g) => g.items.some((i) => i.view === currentView))
  )?.id;

  return (
    <nav ref={navRef} className="hidden lg:block bg-primary-dark sticky top-[60px] z-40">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-2 h-[44px]">
          {MEGA_MENU.map((cat) => {
            const isOpen = activeMenu === cat.id;
            const isActive = !isOpen && activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveMenu(isOpen ? null : cat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold tracking-tight transition-all ${
                  isOpen
                    ? 'text-primary-dark bg-secondary shadow-sm'
                    : isActive
                    ? 'text-primary-dark bg-secondary/70 shadow-sm'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <i className={`fas ${cat.icon}`} />
                {cat.label}
                <i className={`fas fa-chevron-down text-[9px] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
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

      <AnimatePresence>
        {activeMenu && (
          <UnifiedMegaMenu
            activeCategory={activeMenu}
            currentView={currentView}
            onNavigate={(view) => { onNavigate(view); setActiveMenu(null); }}
            onClose={() => setActiveMenu(null)}
          />
        )}
      </AnimatePresence>
    </nav>
  );
}

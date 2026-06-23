import { useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MEGA_MENU } from '@/shared/config/navigation';
import UnifiedMegaMenu from './UnifiedMegaMenu';

interface CategoryNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function CategoryNav({ currentView, onNavigate }: CategoryNavProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const activeCategoryId = MEGA_MENU.find((cat) =>
    cat.groups.some((g) => g.items.some((i) => i.view === currentView))
  )?.id;

  const openMenu = (id: string) => {
    if (timeout.current) clearTimeout(timeout.current);
    setActiveMenu(id);
  };

  const closeMenuSoon = () => {
    timeout.current = setTimeout(() => setActiveMenu(null), 300);
  };

  const keepMenuOpen = () => {
    if (timeout.current) clearTimeout(timeout.current);
  };

  return (
    <nav ref={navRef} className="hidden lg:block bg-primary-dark sticky top-[60px] z-40">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-2 h-[44px]">
          {MEGA_MENU.map((cat) => {
            const isActive = activeCategoryId === cat.id || activeMenu === cat.id;
            return (
              <div
                key={cat.id}
                className="relative h-full flex items-center"
                onMouseEnter={() => openMenu(cat.id)}
                onMouseLeave={closeMenuSoon}
              >
                <button
                  onClick={() => openMenu(activeMenu === cat.id ? '' : cat.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold tracking-tight transition-all ${
                    isActive
                      ? 'text-primary-dark bg-secondary shadow-sm'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <i className={`fas ${cat.icon}`} />
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

      <AnimatePresence>
        {activeMenu && (
          <UnifiedMegaMenu
            activeCategory={activeMenu}
            currentView={currentView}
            onNavigate={onNavigate}
            onClose={() => setActiveMenu(null)}
            onKeepOpen={keepMenuOpen}
          />
        )}
      </AnimatePresence>
    </nav>
  );
}

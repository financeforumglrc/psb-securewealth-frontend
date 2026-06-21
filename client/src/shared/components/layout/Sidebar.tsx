import { SIDEBAR_GROUPS } from '@/shared/config/navigation';
import type { NavItem } from '@/shared/config/navigation';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function SidebarItem({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-semibold transition-all duration-150 text-left relative ${
        isActive
          ? 'bg-primary text-white shadow-sm shadow-primary/20'
          : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
      }`}
    >
      <i
        className={`fas ${item.icon} w-4 text-center ${
          isActive ? 'text-white' : 'text-gray-400'
        }`}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span
          className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
            isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {item.badge}
        </span>
      )}
      {item.alert && !isActive && (
        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
      )}
    </button>
  );
}

function SidebarContent({ currentView, onNavigate }: Pick<SidebarProps, 'currentView' | 'onNavigate'>) {
  return (
    <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
      {SIDEBAR_GROUPS.map((group, index) => (
        <div key={group.id} className={index > 0 ? 'mt-2 pt-2 border-t border-gray-100' : ''}>
          <div className="px-3 py-2">
            <p className={`text-[9px] font-extrabold uppercase tracking-widest ${group.colorClass}`}>
              {group.title}
            </p>
          </div>
          {group.items.map((item) => (
            <SidebarItem
              key={item.view}
              item={item}
              isActive={currentView === item.view}
              onClick={() => onNavigate(item.view)}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}

export default function Sidebar({ currentView, onNavigate, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-[240px] flex-shrink-0 hidden md:flex flex-col bg-white border-r border-gray-200/80 sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto">
        <SidebarContent currentView={currentView} onNavigate={onNavigate} />
        <div className="mt-auto p-3 border-t border-gray-100">
          <div className="p-3 bg-primary-light/60 rounded-lg border border-primary/10">
            <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-1">Need Help?</p>
            <p className="text-[11px] text-gray-600">Call 1800-11-2211</p>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60] md:hidden"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="fixed top-0 left-0 h-full w-[280px] bg-white z-[70] flex flex-col shadow-2xl md:hidden animate-slide-in-left">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-landmark text-white text-sm" />
                </div>
                <span className="font-bold text-sm text-gray-800">PSB Banking</span>
              </div>
              <button
                onClick={onCloseMobile}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800"
                aria-label="Close menu"
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
              {SIDEBAR_GROUPS.map((group, index) => (
                <div key={group.id} className={index > 0 ? 'mt-2 pt-2 border-t border-gray-100' : ''}>
                  <div className="px-3 py-2">
                    <p className={`text-[9px] font-extrabold uppercase tracking-widest ${group.colorClass}`}>
                      {group.title}
                    </p>
                  </div>
                  {group.items.map((item) => (
                    <SidebarItem
                      key={item.view}
                      item={item}
                      isActive={currentView === item.view}
                      onClick={() => {
                        onNavigate(item.view);
                        onCloseMobile();
                      }}
                    />
                  ))}
                </div>
              ))}
            </nav>
            <div className="p-3 border-t border-gray-100">
              <div className="p-3 bg-primary-light/60 rounded-lg border border-primary/10">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-1">Need Help?</p>
                <p className="text-[11px] text-gray-600">Call 1800-11-2211</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

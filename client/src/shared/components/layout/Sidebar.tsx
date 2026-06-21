import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useSecurity } from '@/shared/context/SecurityContext';
import { SIDEBAR_GROUPS, findGroupForView, VIEW_DESCRIPTIONS } from '@/shared/config/navigation';
import type { NavGroup, NavItem } from '@/shared/config/navigation';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function TrustScoreRing({ score }: { score: number }) {
  let color = 'text-emerald-500';
  let label = 'Low Risk';
  if (score < 40) {
    color = 'text-rose-500';
    label = 'High Risk';
  } else if (score < 75) {
    color = 'text-amber-500';
    label = 'Medium Risk';
  }
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
      <div className="relative w-9 h-9 flex items-center justify-center">
        <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-slate-200"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className={color}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[9px] font-bold text-slate-700">{score}</span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-700">Trust Score</p>
        <p className={`text-[9px] font-bold ${color}`}>{label}</p>
      </div>
    </div>
  );
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
      className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 relative overflow-hidden ${
        isActive
          ? 'bg-primary/10 text-primary-dark shadow-sm'
          : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
        />
      )}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
          isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-primary'
        }`}
      >
        <i className={`fas ${item.icon} text-xs`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold truncate">{item.label}</span>
          {item.badge && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700 shrink-0">
              {item.badge}
            </span>
          )}
          {item.alert && !isActive && (
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shrink-0" />
          )}
        </div>
        {item.description && (
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.description}</p>
        )}
      </div>
    </button>
  );
}

function SidebarGroupTree({
  group,
  currentView,
  expanded,
  onToggle,
  onNavigate,
}: {
  group: NavGroup;
  currentView: string;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: (view: string) => void;
}) {
  const hasActive = group.items.some((i) => i.view === currentView);
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
          hasActive ? 'bg-slate-50' : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <i className={`fas fa-folder-open ${group.colorClass} text-xs`} />
          <span className={`text-[10px] font-extrabold uppercase tracking-widest ${group.colorClass}`}>
            {group.title}
          </span>
        </div>
        <i
          className={`fas fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-2 pr-1 py-1 space-y-0.5 border-l border-slate-100 ml-4">
              {group.items.map((item) => (
                <SidebarItem
                  key={item.view}
                  item={item}
                  isActive={currentView === item.view}
                  onClick={() => onNavigate(item.view)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarContent({ currentView, onNavigate }: Pick<SidebarProps, 'currentView' | 'onNavigate'>) {
  const user = useWealthStore((s) => s.user);
  const security = useSecurity();
  const trustScore = security?.state?.trustScore ?? 50;
  const activeGroupId = findGroupForView(currentView)?.id;

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    SIDEBAR_GROUPS.forEach((g, idx) => {
      initial[g.id] = g.id === activeGroupId || idx === 0;
    });
    return initial;
  });

  useEffect(() => {
    if (activeGroupId && !expanded[activeGroupId]) {
      setExpanded((prev) => ({ ...prev, [activeGroupId]: true }));
    }
  }, [activeGroupId]);

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const greeting = user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'Welcome back';
  const currentDesc = VIEW_DESCRIPTIONS[currentView] || 'SecureWealth Twin';

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm">
            {user?.name
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{greeting}</p>
            <p className="text-[10px] text-slate-500 truncate">{currentDesc}</p>
          </div>
        </div>
        <TrustScoreRing score={trustScore} />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {SIDEBAR_GROUPS.map((group) => (
          <SidebarGroupTree
            key={group.id}
            group={group}
            currentView={currentView}
            expanded={!!expanded[group.id]}
            onToggle={() => toggle(group.id)}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <div className="p-3 border-t border-slate-100">
        <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/10">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-1">Need Help?</p>
          <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
            <i className="fas fa-phone text-primary text-[10px]" /> 1800-11-2211
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ currentView, onNavigate, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Desktop tree sidebar */}
      <aside className="w-[280px] flex-shrink-0 hidden lg:flex flex-col bg-white border-r border-slate-200/80 h-[calc(100vh-108px)] sticky top-[108px] overflow-hidden shadow-sm">
        <SidebarContent currentView={currentView} onNavigate={onNavigate} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[60] lg:hidden"
              onClick={onCloseMobile}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 left-0 h-full w-[300px] bg-white z-[70] flex flex-col shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <i className="fas fa-landmark text-white text-sm" />
                  </div>
                  <span className="font-bold text-sm text-slate-800">PSB SecureWealth</span>
                </div>
                <button
                  onClick={onCloseMobile}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContent
                  currentView={currentView}
                  onNavigate={(view) => {
                    onNavigate(view);
                    onCloseMobile();
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

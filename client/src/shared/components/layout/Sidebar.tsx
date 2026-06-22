import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useSecurity } from '@/shared/context/SecurityContext';
import { clearAuth } from '@/shared/services/authService';
import { SIDEBAR_GROUPS, MEGA_MENU, findGroupForView, VIEW_DESCRIPTIONS } from '@/shared/config/navigation';
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
          <path className="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
          <path className={color} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${score}, 100`} strokeLinecap="round" />
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

function SidebarItem({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 relative overflow-hidden ${
        isActive ? 'bg-primary/10 text-primary-dark shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
      }`}
    >
      {isActive && <motion.div layoutId="activeIndicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-primary'}`}>
        <i className={`fas ${item.icon} text-xs`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold truncate">{item.label}</span>
          {item.badge && <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700 shrink-0">{item.badge}</span>}
          {item.alert && !isActive && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shrink-0" />}
        </div>
        {item.description && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.description}</p>}
      </div>
    </button>
  );
}

function SidebarGroupTree({ group, currentView, expanded, onToggle, onNavigate }: { group: NavGroup; currentView: string; expanded: boolean; onToggle: () => void; onNavigate: (view: string) => void }) {
  const hasActive = group.items.some((i) => i.view === currentView);
  return (
    <div className="mb-1">
      <button onClick={onToggle} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${hasActive ? 'bg-slate-50' : 'hover:bg-slate-50'}`}>
        <div className="flex items-center gap-2">
          <i className={`fas fa-folder-open ${group.colorClass} text-xs`} />
          <span className={`text-[10px] font-extrabold uppercase tracking-widest ${group.colorClass}`}>{group.title}</span>
        </div>
        <i className={`fas fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="pl-2 pr-1 py-1 space-y-0.5 border-l border-slate-100 ml-4">
              {group.items.map((item) => (
                <SidebarItem key={item.view} item={item} isActive={currentView === item.view} onClick={() => onNavigate(item.view)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileDrawer({ currentView, onNavigate, open, onClose }: { currentView: string; onNavigate: (view: string) => void; open: boolean; onClose: () => void }) {
  const user = useWealthStore((s) => s.user);
  const security = useSecurity();
  const trustScore = security?.state?.trustScore ?? 50;
  const activeGroupId = findGroupForView(currentView)?.id;
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    SIDEBAR_GROUPS.forEach((g, idx) => { initial[g.id] = g.id === activeGroupId || idx === 0; });
    return initial;
  });

  useEffect(() => {
    if (activeGroupId && !expanded[activeGroupId]) setExpanded((prev) => ({ ...prev, [activeGroupId]: true }));
  }, [activeGroupId]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-[60] lg:hidden" onClick={onClose} aria-hidden="true" />
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.25 }} className="fixed top-0 left-0 h-full w-[300px] bg-white z-[70] flex flex-col lg:hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><i className="fas fa-landmark text-white text-sm" /></div>
                <span className="font-bold text-sm text-slate-800">PSB SecureWealth</span>
              </div>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Close menu"><i className="fas fa-times" /></button>
            </div>
            <div className="p-3 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm">
                  {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">Hi, {user?.name?.split(' ')[0] || 'User'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{VIEW_DESCRIPTIONS[currentView] || 'SecureWealth Twin'}</p>
                </div>
              </div>
              <TrustScoreRing score={trustScore} />
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {SIDEBAR_GROUPS.map((group) => (
                <SidebarGroupTree key={group.id} group={group} currentView={currentView} expanded={!!expanded[group.id]} onToggle={() => setExpanded((p) => ({ ...p, [group.id]: !p[group.id] }))} onNavigate={(v) => { onNavigate(v); onClose(); }} />
              ))}
            </div>
            <div className="p-3 border-t border-slate-100">
              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/10">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-1">Need Help?</p>
                <p className="text-[11px] text-slate-600 flex items-center gap-1.5"><i className="fas fa-phone text-primary text-[10px]" /> 1800-11-2211</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function RailFlyout({
  categoryId,
  currentView,
  onNavigate,
  onClose,
}: {
  categoryId: string;
  currentView: string;
  onNavigate: (view: string) => void;
  onClose: () => void;
}) {
  const category = MEGA_MENU.find((c) => c.id === categoryId);
  if (!category) return null;
  const allItems = category.groups.flatMap((g) => g.items);

  return (
    <motion.div
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -10, opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="absolute left-full top-0 h-full w-[280px] bg-white border-r border-slate-200 shadow-2xl z-50 flex flex-col"
      onMouseLeave={onClose}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center ${category.colorClass}`}>
            <i className={`fas ${category.icon}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{category.label}</h3>
            <p className="text-[10px] text-slate-500">{category.description}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" aria-label="Close menu"><i className="fas fa-times" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {allItems.map((item) => (
          <SidebarItem key={item.view} item={item} isActive={currentView === item.view} onClick={() => { onNavigate(item.view); onClose(); }} />
        ))}
      </div>

      <div className="p-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <button onClick={() => { onNavigate('payments'); onClose(); }} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-[11px] font-bold hover:bg-primary-dark"><i className="fas fa-paper-plane" /> Pay</button>
        <button onClick={() => { onNavigate('transactions'); onClose(); }} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-bold hover:bg-slate-200"><i className="fas fa-list" /> History</button>
      </div>
    </motion.div>
  );
}

export default function Sidebar({ currentView, onNavigate, mobileOpen, onCloseMobile }: SidebarProps) {
  const [flyout, setFlyout] = useState<string | null>(null);
  const user = useWealthStore((s) => s.user);
  const security = useSecurity();
  const trustScore = security?.state?.trustScore ?? 50;
  const activeCategoryId = MEGA_MENU.find((cat) => cat.groups.some((g) => g.items.some((i) => i.view === currentView)))?.id;

  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

  return (
    <>
      {/* Desktop Smart Rail */}
      <aside className="hidden lg:flex flex-col w-[72px] bg-white border-r border-slate-200/80 h-full relative z-30">
        {/* Logo */}
        <div className="h-[60px] flex items-center justify-center border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <i className="fas fa-landmark text-white text-sm" />
          </div>
        </div>

        {/* User */}
        <button onClick={() => onNavigate('profile')} className="mx-auto mt-3 w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm hover:ring-2 ring-primary/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" title="Profile" aria-label="Open profile">
          {initials}
        </button>

        <div className="px-3 py-2">
          <div className="h-px bg-slate-100" />
        </div>

        {/* Category icons */}
        <div className="flex-1 overflow-y-auto py-1 space-y-1 px-2">
          {MEGA_MENU.map((cat) => {
            const active = activeCategoryId === cat.id;
            const open = flyout === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFlyout(open ? null : cat.id)}
                onMouseEnter={() => { if (!flyout) setFlyout(cat.id); }}
                className={`relative w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                  active || open ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-primary'
                }`}
                title={cat.label}
                aria-label={cat.label}
              >
                <i className={`fas ${cat.icon} text-sm`} />
                <span className="text-[8px] font-bold leading-none text-center px-0.5 line-clamp-2">{cat.label}</span>
                {active && <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-secondary rounded-l-full" />}
              </button>
            );
          })}
        </div>

        {/* Trust score mini */}
        <div className="p-2 border-t border-slate-100">
          <button
            onClick={() => onNavigate('security-beast')}
            className="w-full flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            title={`Trust score ${trustScore}`}
            aria-label={`Trust score ${trustScore}`}
          >
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className={trustScore >= 70 ? 'text-emerald-500' : trustScore >= 35 ? 'text-amber-500' : 'text-rose-500'} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${trustScore}, 100`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-700">{trustScore}</span>
            </div>
            <span className="text-[7px] font-bold text-slate-500 uppercase">Trust</span>
          </button>
        </div>

        {/* Bottom actions */}
        <div className="p-2 border-t border-slate-100 space-y-1">
          <button onClick={() => onNavigate('accessibility')} className="w-full aspect-square rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" title="Accessibility" aria-label="Accessibility settings"><i className="fas fa-universal-access" /></button>
          <button onClick={() => { clearAuth(); window.location.reload(); }} className="w-full aspect-square rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50" title="Logout" aria-label="Logout"><i className="fas fa-sign-out-alt" /></button>
        </div>

        {/* Flyout */}
        <AnimatePresence>
          {flyout && (
            <RailFlyout
              categoryId={flyout}
              currentView={currentView}
              onNavigate={onNavigate}
              onClose={() => setFlyout(null)}
            />
          )}
        </AnimatePresence>
      </aside>

      <MobileDrawer currentView={currentView} onNavigate={onNavigate} open={mobileOpen} onClose={onCloseMobile} />
    </>
  );
}

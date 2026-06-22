import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MEGA_MENU } from '@/shared/config/navigation';
import type { NavGroup, NavItem } from '@/shared/config/navigation';

interface UnifiedMegaMenuProps {
  activeCategory: string;
  currentView: string;
  onNavigate: (view: string) => void;
  onClose: () => void;
}

const FEATURED: Record<string, { label: string; view: string; cta: string }> = {
  wealth: { label: 'BHAVISHYA AI', view: 'bhavishya', cta: 'Open Flagship AI' },
  'pay-protect': { label: 'Security Beast', view: 'security-beast', cta: 'Check Threat Radar' },
  plan: { label: 'Tax Planner', view: 'tax', cta: 'Plan Taxes' },
  life: { label: 'Family Dashboard', view: 'family', cta: 'Manage Family' },
  innovation: { label: 'Innovation Lab', view: 'innovation-lab', cta: 'Explore Lab' },
};

export default function UnifiedMegaMenu({ activeCategory, currentView, onNavigate, onClose }: UnifiedMegaMenuProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const category = MEGA_MENU.find((c) => c.id === activeCategory);
  if (!category) return null;

  const allItems = category.groups.flatMap((g: NavGroup) => g.items);
  const featured = FEATURED[category.id];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 top-[104px] z-30 bg-slate-900/10 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.15 }}
        className="absolute left-0 right-0 top-full z-40 px-4 sm:px-6 lg:px-8 pt-1"
        onMouseLeave={onClose}
      >
        <div className="max-w-[1100px] mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left: category intro + featured */}
            <div className="lg:col-span-4 p-5 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center ${category.colorClass}`}>
                  <i className={`fas ${category.icon} text-lg`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{category.label}</h3>
                  <p className="text-[11px] text-slate-500">{category.description}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  onNavigate(featured?.view || 'dashboard');
                  onClose();
                }}
                className="w-full mt-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-primary hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-primary-dark">{featured?.label || 'Dashboard'}</span>
                  <i className="fas fa-arrow-right text-[10px] text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-[10px] text-slate-500">{featured?.cta || 'Open'}</span>
              </button>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Send Money', view: 'payments', icon: 'fa-paper-plane' },
                    { label: 'History', view: 'transactions', icon: 'fa-list' },
                    { label: 'Goals', view: 'goals', icon: 'fa-bullseye' },
                  ].map((q) => (
                    <button
                      key={q.view}
                      onClick={() => { onNavigate(q.view); onClose(); }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:border-primary hover:text-primary transition-colors"
                    >
                      <i className={`fas ${q.icon} text-[9px]`} /> {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: items grid */}
            <div className="lg:col-span-8 p-4">
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">All pages in {category.label}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allItems.map((item: NavItem) => {
                  const active = currentView === item.view;
                  return (
                    <button
                      key={item.view}
                      onClick={() => { onNavigate(item.view); onClose(); }}
                      className={`group flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        active
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-slate-100 hover:border-primary/30 hover:bg-slate-50 hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-primary group-hover:text-white'
                      }`}>
                        <i className={`fas ${item.icon} text-xs`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold truncate ${active ? 'text-primary-dark' : 'text-slate-800'}`}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700 shrink-0">
                              {item.badge}
                            </span>
                          )}
                          {item.alert && !active && (
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shrink-0" />
                          )}
                        </div>
                        {item.description && (
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      <i className="fas fa-chevron-right text-[10px] text-slate-300 self-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

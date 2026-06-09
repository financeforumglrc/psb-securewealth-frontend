import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';

interface Command {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
  category: string;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const setView = useWealthStore((s) => s.setView);

  const commands: Command[] = [
    { id: 'dash', title: 'Dashboard', subtitle: 'Main overview', icon: 'fa-chart-pie', category: 'Navigation', action: () => setView('dashboard') },
    { id: 'wealth', title: 'Wealth Twin', subtitle: 'AI-powered financial projections', icon: 'fa-brain', category: 'Navigation', action: () => setView('wealth-twin') },
    { id: 'innovation', title: 'Innovation Lab', subtitle: '10 world-first features', icon: 'fa-flask', category: 'Navigation', action: () => setView('innovation-lab') },
    { id: 'goals', title: 'Goals', subtitle: 'Track financial goals', icon: 'fa-bullseye', category: 'Navigation', action: () => setView('goals') },
    { id: 'portfolio', title: 'Portfolio', subtitle: 'Asset allocation', icon: 'fa-layer-group', category: 'Navigation', action: () => setView('portfolio') },
    { id: 'market', title: 'Market', subtitle: 'Live prices & outlook', icon: 'fa-globe', category: 'Navigation', action: () => setView('market') },
    { id: 'tax', title: 'Tax', subtitle: 'Tax optimization', icon: 'fa-file-invoice-dollar', category: 'Navigation', action: () => setView('tax') },
    { id: 'credit', title: 'Credit Health', subtitle: 'CIBIL & score analysis', icon: 'fa-file-invoice', category: 'Navigation', action: () => setView('credit-health') },
    { id: 'protection', title: 'Protection', subtitle: 'Security dashboard', icon: 'fa-shield-halved', category: 'Navigation', action: () => setView('protection') },
    { id: 'privacy', title: 'Privacy', subtitle: 'Data controls', icon: 'fa-lock', category: 'Navigation', action: () => setView('privacy') },
    { id: 'ai-tax', title: 'Ask: How do I save tax?', subtitle: 'AI Tax Optimization', icon: 'fa-receipt', category: 'AI Queries', action: () => { setView('wealth-twin'); setTimeout(() => window.dispatchEvent(new CustomEvent('sw-ai-query', { detail: 'How do I save tax?' })), 400); } },
    { id: 'ai-sip', title: 'Ask: SIP recommendations', subtitle: 'AI Investment Planning', icon: 'fa-chart-line', category: 'AI Queries', action: () => { setView('wealth-twin'); setTimeout(() => window.dispatchEvent(new CustomEvent('sw-ai-query', { detail: 'SIP recommendations' })), 400); } },
    { id: 'ai-spend', title: 'Ask: Analyze my spending', subtitle: 'AI Spending Intelligence', icon: 'fa-wallet', category: 'AI Queries', action: () => { setView('wealth-twin'); setTimeout(() => window.dispatchEvent(new CustomEvent('sw-ai-query', { detail: 'Analyze my spending' })), 400); } },
    { id: 'ai-market', title: 'Ask: Market outlook?', subtitle: 'AI Market Analysis', icon: 'fa-globe', category: 'AI Queries', action: () => { setView('wealth-twin'); setTimeout(() => window.dispatchEvent(new CustomEvent('sw-ai-query', { detail: 'Market outlook?' })), 400); } },
    { id: 'ai-cibil', title: 'Ask: How is my CIBIL?', subtitle: 'AI Credit Health', icon: 'fa-star', category: 'AI Queries', action: () => { setView('wealth-twin'); setTimeout(() => window.dispatchEvent(new CustomEvent('sw-ai-query', { detail: 'How is my CIBIL?' })), 400); } },
    { id: 'ai-neuro', title: 'Ask: Neuro-friction status', subtitle: 'AI Biometric Banking', icon: 'fa-heart-pulse', category: 'AI Queries', action: () => { setView('wealth-twin'); setTimeout(() => window.dispatchEvent(new CustomEvent('sw-ai-query', { detail: 'Neuro-friction status' })), 400); } },
    { id: 'ai-monte', title: 'Ask: Run Monte Carlo simulation', subtitle: 'AI Life Simulation', icon: 'fa-dice', category: 'AI Queries', action: () => { setView('wealth-twin'); setTimeout(() => window.dispatchEvent(new CustomEvent('sw-ai-query', { detail: 'Run Monte Carlo simulation' })), 400); } },
    { id: 'dark', title: 'Toggle Dark Mode', subtitle: 'Switch theme', icon: 'fa-moon', category: 'Settings', action: () => useWealthStore.getState().toggleDarkMode() },
  ];

  const filtered = query.trim()
    ? commands.filter((c) =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const grouped = filtered.reduce((acc, cmd) => {
    acc[cmd.category] = acc[cmd.category] || [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  const flat = Object.values(grouped).flat();

  const execute = useCallback(
    (cmd: Command) => {
      cmd.action();
      setOpen(false);
      setQuery('');
    },
    []
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((s) => (s + 1) % flat.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => (s - 1 + flat.length) % flat.length);
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (flat[selected]) execute(flat[selected]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, flat, selected, execute]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <i className="fas fa-magnifying-glass text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                placeholder="Search pages, AI queries, settings..."
                className="flex-1 bg-transparent text-sm outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
              />
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded">ESC</span>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto py-2">
              {flat.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">No results found</p>
              ) : (
                Object.entries(grouped).map(([category, cmds]) => (
                  <div key={category}>
                    <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{category}</p>
                    {cmds.map((cmd) => {
                      const idx = flat.indexOf(cmd);
                      const isSelected = idx === selected;
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => execute(cmd)}
                          onMouseEnter={() => setSelected(idx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            isSelected
                              ? 'bg-primary/10 text-primary'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary/20' : 'bg-slate-100 dark:bg-slate-700'} flex-shrink-0`}>
                            <i className={`fas ${cmd.icon} text-xs ${isSelected ? 'text-primary' : 'text-slate-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{cmd.title}</p>
                            <p className="text-[11px] text-slate-400 truncate">{cmd.subtitle}</p>
                          </div>
                          {isSelected && <i className="fas fa-arrow-turn-down-left text-xs text-primary rotate-90" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="px-1 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-[9px]">↑↓</span>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="px-1 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-[9px]">↵</span>
                <span>Select</span>
              </div>
              <div className="flex-1" />
              <span className="text-[10px] text-slate-400">{flat.length} results</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

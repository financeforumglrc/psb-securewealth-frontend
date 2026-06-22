export default function SearchBar() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('sw-open-command-palette'))}
      className="hidden md:flex items-center gap-2 w-64 xl:w-80 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      aria-label="Open search command palette"
    >
      <i className="fas fa-magnifying-glass" />
      <span className="flex-1 text-left">Search anything…</span>
      <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded bg-white text-[10px] font-bold text-slate-400 border border-slate-200">⌘K</kbd>
    </button>
  );
}

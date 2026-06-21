import { useState, useRef, useEffect } from 'react';
import { explainLikeImFive, type ELI5Response } from '@/shared/services/llmService';

interface ELI5TooltipProps {
  term: string;
  children?: React.ReactNode;
}

export default function ELI5Tooltip({ term, children }: ELI5TooltipProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ELI5Response | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = async () => {
    setOpen(true);
    if (!data) {
      setLoading(true);
      const res = await explainLikeImFive(term);
      setData(res);
      setLoading(false);
    }
  };

  return (
    <span ref={ref} className="relative inline-block">
      {children || (
        <button
          onClick={handleClick}
          className="ml-1 text-[10px] px-1.5 py-0.5 bg-violet-100 text-violet-600 rounded-full font-bold hover:bg-violet-200 transition-colors align-middle"
          title="Explain like I'm 5"
        >
          🧠 Explain
        </button>
      )}

      {open && (
        <div className="absolute z-50 left-0 bottom-full mb-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-violet-200 dark:border-violet-800 p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1">
              <span className="text-sm">🧠</span> ELI5: {term}
            </h4>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs">
              <i className="fas fa-xmark" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
            </div>
          ) : data ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{data.explanation}</p>
              <div className="p-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  <i className="fas fa-lightbulb text-amber-500 mr-1" />
                  {data.analogy}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </span>
  );
}

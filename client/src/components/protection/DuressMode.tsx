import { useState } from 'react';

export function useDuressMode() {
  const [active, setActive] = useState(() => localStorage.getItem('sw_duress') === 'active');

  const toggle = () => {
    if (active) {
      localStorage.removeItem('sw_duress');
      setActive(false);
    } else {
      localStorage.setItem('sw_duress', 'active');
      setActive(true);
    }
  };

  return { active, toggle };
}

export default function DuressModeToggle() {
  const { active, toggle } = useDuressMode();

  return (
    <>
      {active && (
        <div className="fixed top-0 left-0 right-0 bg-rose-600 text-white text-center py-1.5 text-xs z-[80] font-medium">
          <i className="fas fa-shield-halved mr-1" />Duress Mode Active — Showing sanitized view
        </div>
      )}
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-3 text-sm"><i className="fas fa-user-secret text-rose-500 mr-2" />Duress Mode</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          When activated, all sensitive financial figures are masked. Useful when someone is watching your screen.
        </p>
        <button
          onClick={toggle}
          className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'}`}
        >
          {active ? 'Deactivate Duress Mode' : 'Activate Duress Mode'}
        </button>
        <p className="text-[10px] text-slate-400 mt-2">All balances will show as ₹45,000 when active.</p>
      </div>
    </>
  );
}

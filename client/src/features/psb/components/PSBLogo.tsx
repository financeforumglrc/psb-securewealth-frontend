import { useWealthStore } from '@/shared/store/wealthStore';

interface PSBLogoProps {
  variant?: 'light' | 'dark';
}

export default function PSBLogo({ variant = 'light' }: PSBLogoProps) {
  const isDark = variant === 'dark';
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        useWealthStore?.getState()?.setView('dashboard');
      }}
      className="flex items-center gap-3 select-none"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white relative overflow-hidden shadow-sm ring-1 ring-black/5">
        {/* Punjab & Sind Bank Logo */}
        <svg viewBox="0 0 40 40" className="w-9 h-9">
          {/* Outer ring - dark green */}
          <circle cx="20" cy="20" r="18" fill="#1B5E20" />
          {/* Inner circle - gold */}
          <circle cx="20" cy="20" r="14" fill="#FFD700" />
          {/* Center circle - white */}
          <circle cx="20" cy="20" r="10" fill="white" />
          {/* Stylized wheat/plant motif */}
          <path d="M15 25 L20 15 L25 25" stroke="#1B5E20" strokeWidth="1.5" fill="none" />
          <path d="M14 22 L20 18 L26 22" stroke="#1B5E20" strokeWidth="1.2" fill="none" />
          <circle cx="20" cy="15" r="2" fill="#B71C1C" />
          {/* PSB text */}
          <text x="20" y="24" textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="#1B5E20">PSB</text>
        </svg>
      </div>
      <div className="leading-tight">
        <p className={`text-[13px] font-extrabold tracking-tight leading-none ${isDark ? 'text-primary-dark' : 'text-white'}`}>
          PUNJAB & SIND
        </p>
        <p className={`text-[10px] font-bold tracking-widest leading-none mt-0.5 ${isDark ? 'text-primary/80' : 'text-white/80'}`}>
          BANK
        </p>
      </div>
    </a>
  );
}

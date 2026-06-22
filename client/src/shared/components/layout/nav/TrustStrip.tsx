import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';

interface TrustStripProps {
  queuedCount: number;
}

export default function TrustStrip({ queuedCount }: TrustStripProps) {
  const { online } = useNetworkStatus();

  return (
    <div className="bg-primary-dark text-white text-[10px] sm:text-[11px]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-1.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-5 overflow-hidden whitespace-nowrap">
          <span className="flex items-center gap-1.5">
            <i className="fas fa-shield-check text-secondary text-[10px]" />
            <span><strong>DICGC</strong> Insured</span>
          </span>
          <span className="hidden sm:inline w-px h-3 bg-white/20" />
          <span className="hidden sm:flex items-center gap-1.5">
            <i className="fas fa-lock text-secondary text-[10px]" />
            <span>256-bit SSL</span>
          </span>
          <span className="hidden md:inline w-px h-3 bg-white/20" />
          <span className="hidden md:flex items-center gap-1.5">
            <i className="fas fa-building-columns text-secondary text-[10px]" />
            <span><strong>RBI</strong> Regulated</span>
          </span>
          {queuedCount > 0 && (
            <>
              <span className="hidden lg:inline w-px h-3 bg-white/20" />
              <span className="hidden lg:flex items-center gap-1.5 text-amber-300">
                <i className="fas fa-clock-rotate-left" />
                <span><strong>Queue:</strong> {queuedCount} pending</span>
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <span className={`flex items-center gap-1.5 text-[10px] font-medium ${online ? 'text-emerald-300' : 'text-amber-300'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-400' : 'bg-amber-400'} ${online ? 'animate-pulse' : ''}`} />
            {online ? 'Online' : 'Offline'}
          </span>
          <button
            onClick={() => alert('Fraud reported. RBI Cyber Security Cell has been notified.')}
            className="flex items-center gap-1 text-[10px] text-red-300 hover:text-white font-semibold transition-colors"
          >
            <i className="fas fa-triangle-exclamation" /> <span className="hidden sm:inline">Report Fraud</span>
          </button>
        </div>
      </div>
    </div>
  );
}

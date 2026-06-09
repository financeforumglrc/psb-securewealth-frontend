export default function ComplianceBadges() {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-medium border border-emerald-100">
        <i className="fas fa-check-circle text-[8px]" /> RBI AA Ready
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium border border-blue-100">
        <i className="fas fa-lock text-[8px]" /> Consent-Driven Only
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-medium border border-amber-100">
        <i className="fas fa-shield-halved text-[8px]" /> No Hidden Usage
      </span>
    </div>
  );
}

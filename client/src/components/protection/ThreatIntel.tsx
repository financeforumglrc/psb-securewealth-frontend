import { useState, useEffect } from 'react';

const ALERTS = [
  { icon: 'fa-phone-slash', text: 'Fake TRAI calls up 300% in your area. Remember: Banks never ask for OTPs.', color: 'amber', detail: 'Scammers impersonate TRAI officials claiming your number will be disconnected. They demand immediate payment or KYC update. Real TRAI never calls customers for payments.' },
  { icon: 'fa-envelope', text: 'Phishing emails impersonating RBI are circulating. Always verify sender addresses.', color: 'rose', detail: 'Check sender email domain carefully. RBI official emails end with @rbi.org.in. Never click links or download attachments from unknown sources.' },
  { icon: 'fa-mobile-screen', text: 'Fake UPI "₹1 verification" payment requests detected. Do not approve unknown requests.', color: 'amber', detail: 'Fraudsters send UPI collect requests disguised as verification. Approving any UPI request, even for ₹1, can grant access to your account.' },
  { icon: 'fa-globe', text: 'Fraudulent investment apps promising 50% guaranteed returns reported. Stay cautious.', color: 'rose', detail: 'Any investment promising guaranteed high returns is likely a Ponzi scheme. Verify SEBI registration before investing. Report suspicious apps to cybercrime.gov.in.' },
  { icon: 'fa-credit-card', text: 'Card skimming devices found at ATMs in metro cities. Cover keypad while entering PIN.', color: 'amber', detail: 'Skimmers copy card data from magnetic strips. Always wiggle the card slot before inserting. Prefer chip-based or contactless transactions when possible.' },
  { icon: 'fa-whatsapp', text: 'WhatsApp impersonation scams targeting bank customers. Verify via official channels.', color: 'rose', detail: 'Scammers hack or clone WhatsApp accounts of friends/family to ask for money. Always verify urgent requests via a voice call to the actual person.' },
];

export default function ThreatIntel() {
  const [index, setIndex] = useState(0);
  const [showDetail, setShowDetail] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setIndex((i) => (i + 1) % ALERTS.length), 6000);
    return () => clearInterval(interval);
  }, []);

  const alert = ALERTS[index];
  const colorMap: Record<string, string> = {
    amber: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800',
    rose: 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800',
  };

  return (
    <>
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-3 text-sm"><i className="fas fa-radar text-rose-500 mr-2" />Threat Intelligence</h3>
        <div className={`flex items-start gap-2 p-2.5 rounded-lg border ${colorMap[alert.color]} transition-all duration-500`}>
          <i className={`fas ${alert.icon} mt-0.5 text-xs flex-shrink-0`} />
          <div className="flex-1">
            <p className="text-[11px] leading-relaxed">{alert.text}</p>
            <button onClick={() => setShowDetail(index)} className="text-[10px] text-primary hover:underline mt-1">Learn more</button>
          </div>
        </div>
        <div className="flex justify-center gap-1 mt-1.5">
          {ALERTS.map((_, i) => (
            <div key={i} className={`w-1 h-1 rounded-full ${i === index ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`} />
          ))}
        </div>
      </div>

      {showDetail !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setShowDetail(null)}>
          <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-sm w-full p-5 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ALERTS[showDetail].color === 'amber' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                <i className={`fas ${ALERTS[showDetail].icon} text-xs`} />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Scam Alert Details</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">{ALERTS[showDetail].text}</p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-[11px] text-slate-500 leading-relaxed">{ALERTS[showDetail].detail}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowDetail(null)} className="flex-1 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90">Got it</button>
              <button onClick={() => window.open('https://cybercrime.gov.in', '_blank')} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50">Report</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

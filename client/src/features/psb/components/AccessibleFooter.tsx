import { useState } from 'react';

export default function AccessibleFooter() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
      {/* Top strip - green */}
      <div className="bg-primary">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/90">
          <a href="https://www.dicgc.org.in/" target="_blank" rel="noopener noreferrer" className="hover:underline">
            <i className="fas fa-shield-check mr-1.5" /> <strong>DICGC Insured</strong> — Deposits up to ₹5 Lakhs
          </a>
          <a href="https://www.rbi.org.in/" target="_blank" rel="noopener noreferrer" className="hover:underline">
            <i className="fas fa-building-columns mr-1.5" /> <strong>RBI Licensed</strong> — Regulated Bank
          </a>
          <span><i className="fas fa-lock mr-1.5" /> <strong>256-bit SSL</strong> Encryption</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-[12px] font-bold text-gray-800 dark:text-slate-200 mb-3 uppercase tracking-wider">About PSB</h4>
            <ul className="space-y-2 text-[11px] text-gray-500">
              <li><a href="https://www.psbindia.co.in/about-us" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="https://www.psbindia.co.in/history" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Our History</a></li>
              <li><a href="https://www.psbindia.co.in/board-of-directors" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Board of Directors</a></li>
              <li><a href="https://www.psbindia.co.in/financial-results" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Financial Results</a></li>
              <li><a href="https://www.psbindia.co.in/careers" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-gray-800 dark:text-slate-200 mb-3 uppercase tracking-wider">Customer Services</h4>
            <ul className="space-y-2 text-[11px] text-gray-500">
              <li><a href="https://www.psbindia.co.in/internet-banking" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Internet Banking</a></li>
              <li><a href="https://www.psbindia.co.in/mobile-banking" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Mobile Banking</a></li>
              <li><a href="https://www.psbindia.co.in/upi-services" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">UPI Services</a></li>
              <li><a href="https://www.psbindia.co.in/atm-branch-locator" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">ATM/Branch Locator</a></li>
              <li><a href="https://www.psbindia.co.in/download-forms" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Download Forms</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-gray-800 dark:text-slate-200 mb-3 uppercase tracking-wider">Important Links</h4>
            <ul className="space-y-2 text-[11px] text-gray-500">
              <li><a href="https://www.rbi.org.in/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">RBI Website</a></li>
              <li><a href="https://www.npci.org.in/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">NPCI</a></li>
              <li><a href="https://www.dicgc.org.in/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">DICGC</a></li>
              <li><a href="https://cms.rbi.org.in/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">RBI Ombudsman</a></li>
              <li><a href="https://www.psbindia.co.in/grievance-redressal" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Grievance Redressal</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-gray-800 dark:text-slate-200 mb-3 uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-2 text-[11px] text-gray-500">
              <li className="flex items-start gap-2">
                <i className="fas fa-phone text-primary mt-0.5 text-[10px]" />
                <span>Toll Free: <strong className="text-gray-700">1800-11-2211</strong><br/>Chargeable: 0120-2490000</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-envelope text-primary mt-0.5 text-[10px]" />
                <span>care@psbindia.co.in</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-location-dot text-primary mt-0.5 text-[10px]" />
                <span>Head Office: 21, Rajendra Place, New Delhi - 110008 (<a href="https://maps.google.com/?q=21+Rajendra+Place+New+Delhi+110008" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View on Map</a>)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-gray-400 dark:text-slate-500">
              &copy; 2025 Punjab & Sind Bank. Government of India Undertaking. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowDisclaimer(!showDisclaimer)} className="text-[11px] text-primary dark:text-primary/90 font-semibold hover:underline">
                Disclaimer
              </button>
              <span className="text-[11px] text-gray-400">|</span>
              <span className="text-[11px] text-gray-400 dark:text-slate-500">CIN: U74140HR2021FTC096642</span>
            </div>
          </div>
          {showDisclaimer && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-sm text-[10px] text-gray-500 dark:text-slate-400 leading-relaxed">
              Punjab & Sind Bank is a government-owned bank established in 1908. Your financial data is encrypted and stored securely in your browser.
              For account-specific services, please visit your nearest PSB branch or use our official Internet Banking portal. 
              Deposits are insured under DICGC up to ₹5,00,000 per depositor. The bank is regulated by the Reserve Bank of India.
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

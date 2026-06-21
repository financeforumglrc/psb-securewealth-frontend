import { useState } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';

export default function ConsentModal() {
  const hasConsent = useWealthStore((s) => s.hasConsent);
  const setHasConsent = useWealthStore((s) => s.setHasConsent);
  const addConsent = useWealthStore((s) => s.addConsent);
  const [visible, setVisible] = useState(!hasConsent);

  if (!visible || hasConsent) return null;

  function agree() {
    const consent = {
      consentId: 'CON-' + Date.now(),
      dataScope: ['Net Worth', 'Transaction History', 'Investment Holdings', 'Goal Progress'],
      purpose: 'Personalized wealth insights, fraud protection, and AI-powered recommendations',
      validityDays: 30,
      status: 'ACTIVE' as const,
      grantedAt: new Date().toISOString(),
    };
    addConsent(consent);
    setHasConsent(true);
    setVisible(false);
  }

  function decline() {
    setHasConsent(false);
    setVisible(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" style={{ animation: 'modalIn 0.4s ease-out' }}>
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
          <h3 className="text-xl font-bold"><i className="fas fa-shield-halved mr-2" />Privacy & Consent</h3>
          <p className="text-sm text-white/80 mt-1">SecureWealth Twin - PSB Hackathon 2026</p>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            SecureWealth Twin uses your financial data to provide personalized wealth insights, fraud protection, and AI-powered recommendations. All data is encrypted in your browser and never shared with third parties.
          </p>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2"><i className="fas fa-check text-success" /> On-device encryption</div>
            <div className="flex items-center gap-2"><i className="fas fa-check text-success" /> RBI Account Aggregator compliant</div>
            <div className="flex items-center gap-2"><i className="fas fa-check text-success" /> No data sold to advertisers</div>
            <div className="flex items-center gap-2"><i className="fas fa-check text-success" /> You can withdraw consent anytime</div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={agree} className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
              <i className="fas fa-check mr-1" /> I Agree
            </button>
            <button onClick={decline} className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-300 transition-colors">
              Disagree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

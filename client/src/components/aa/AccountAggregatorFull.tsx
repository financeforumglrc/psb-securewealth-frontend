import { useState } from 'react';
import { useWealthStore } from '../../store/wealthStore';

const BANKS = [
  { id: 'sbi', name: 'State Bank of India', code: 'SBI', color: 'bg-blue-600', initial: 'S', mockBalance: 245000, mockTxs: [
    { desc: 'UPI Transfer', amount: 2500, date: '2026-05-18' },
    { desc: 'Interest Credit', amount: 420, date: '2026-05-15', type: 'credit' as const },
    { desc: 'ATM Withdrawal', amount: 10000, date: '2026-05-12' },
  ]},
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC', color: 'bg-indigo-700', initial: 'H', mockBalance: 380000, mockTxs: [
    { desc: 'Salary Credit', amount: 125000, date: '2026-05-22', type: 'credit' as const },
    { desc: 'Amazon Purchase', amount: 3499, date: '2026-05-20' },
    { desc: 'SIP Auto-debit', amount: 15000, date: '2026-05-05' },
  ]},
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI', color: 'bg-rose-700', initial: 'I', mockBalance: 120000, mockTxs: [
    { desc: 'Electricity Bill', amount: 3200, date: '2026-05-18' },
    { desc: 'Cash Deposit', amount: 20000, date: '2026-05-10', type: 'credit' as const },
  ]},
  { id: 'axis', name: 'Axis Bank', code: 'AXIS', color: 'bg-emerald-600', initial: 'A', mockBalance: 195000, mockTxs: [
    { desc: 'BigBasket Grocery', amount: 2400, date: '2026-05-21' },
    { desc: 'FD Interest', amount: 1800, date: '2026-05-01', type: 'credit' as const },
  ]},
];

const CONSENT_SCOPES = ['Account Balance', 'Transaction History', 'Fixed Deposits'];

function CrossBankFraudPanel({ transactions, linkedAssets }: { transactions: any[]; linkedAssets: any[] }) {
  const aaTxs = transactions.filter((t) =>
    linkedAssets.some((a) => t.description && t.description.toLowerCase().includes(a.name.split(' ')[0].toLowerCase()))
  );

  const alerts: { type: string; severity: 'low' | 'medium' | 'high'; message: string; detail: string }[] = [];

  // Duplicate amount across banks same day
  const byDateAmount: Record<string, any[]> = {};
  aaTxs.filter((t) => t.type === 'debit').forEach((t) => {
    const key = `${t.date}-${t.amount}`;
    if (!byDateAmount[key]) byDateAmount[key] = [];
    byDateAmount[key].push(t);
  });
  Object.values(byDateAmount).forEach((group) => {
    if (group.length > 1) {
      alerts.push({
        type: 'Duplicate Debit Pattern',
        severity: 'high',
        message: `₹${group[0].amount.toLocaleString()} debited ${group.length} times on ${group[0].date}`,
        detail: group.map((t) => t.description).join(' • '),
      });
    }
  });

  // Round-number high debits
  aaTxs.filter((t) => t.type === 'debit' && t.amount >= 50000 && t.amount % 10000 === 0).forEach((t) => {
    alerts.push({
      type: 'Round-Number High Debit',
      severity: 'medium',
      message: `₹${t.amount.toLocaleString()} from ${t.description}`,
      detail: 'Round-figure high-value outflow detected across linked accounts.',
    });
  });

  // High velocity day
  const txDates: Record<string, number> = {};
  aaTxs.filter((t) => t.type === 'debit').forEach((t) => {
    txDates[t.date] = (txDates[t.date] || 0) + t.amount;
  });
  Object.entries(txDates).forEach(([date, total]) => {
    if (total >= 100000) {
      alerts.push({
        type: 'High Velocity Day',
        severity: 'medium',
        message: `₹${total.toLocaleString()} outflow on ${date}`,
        detail: 'Aggregate debits across linked banks crossed ₹1 lakh in a single day.',
      });
    }
  });

  if (alerts.length === 0) {
    return (
      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
        <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
          <i className="fas fa-check-circle mr-1" /> No cross-bank anomalies detected
        </p>
        <p className="text-[10px] text-emerald-600/80 mt-0.5">
          Comparing {aaTxs.length} AA-synced transactions across {linkedAssets.length} linked banks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.slice(0, 4).map((alert, i) => (
        <div
          key={i}
          className={`p-3 rounded-xl border text-xs ${
            alert.severity === 'high'
              ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`font-bold ${alert.severity === 'high' ? 'text-rose-700' : 'text-amber-700'}`}>{alert.type}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                alert.severity === 'high' ? 'bg-rose-200 text-rose-700' : 'bg-amber-200 text-amber-700'
              }`}
            >
              {alert.severity.toUpperCase()}
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-200 mt-1 font-medium">{alert.message}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{alert.detail}</p>
        </div>
      ))}
    </div>
  );
}

export default function AccountAggregatorFull() {
  const assets = useWealthStore((s) => s.assets);
  const consents = useWealthStore((s) => s.consents);
  const transactions = useWealthStore((s) => s.transactions);
  const addAsset = useWealthStore((s) => s.addAsset);
  const addConsent = useWealthStore((s) => s.addConsent);
  const removeAsset = useWealthStore((s) => s.removeAsset);
  const revokeConsent = useWealthStore((s) => s.revokeConsent);
  const addTransaction = useWealthStore((s) => s.addTransaction);

  const [linkingBank, setLinkingBank] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState<typeof BANKS[0] | null>(null);
  const [consentDuration, setConsentDuration] = useState(6);

  const linkedAssets = assets.filter((a) => a.linkedViaAA);
  const activeConsents = consents.filter((c) => c.status === 'ACTIVE');

  const isLinked = (bankName: string) => linkedAssets.some((a) => a.name.includes(bankName));

  const handleLink = (bank: typeof BANKS[0]) => {
    setLinkingBank(bank.id);
    setTimeout(() => {
      const newAsset = {
        id: 'aa-' + Date.now(),
        name: bank.name + ' (Linked)',
        type: 'bank' as const,
        value: bank.mockBalance,
        liquidity: 'high' as const,
        linkedViaAA: true,
      };
      const consent = {
        consentId: 'AA-' + Date.now().toString(36).toUpperCase(),
        dataScope: CONSENT_SCOPES,
        purpose: `Account aggregation from ${bank.name}`,
        validityDays: consentDuration * 30,
        status: 'ACTIVE' as const,
        grantedAt: new Date().toISOString(),
      };
      addAsset(newAsset);
      addConsent(consent);

      // Add mock transactions
      bank.mockTxs.forEach((tx) => {
        addTransaction({
          id: 'aa-tx-' + Math.random().toString(36).slice(2),
          date: tx.date,
          description: `${bank.code} - ${tx.desc}`,
          category: tx.desc.includes('Salary') ? 'Income' : tx.desc.includes('Interest') ? 'Investment' : 'Utilities',
          amount: tx.amount,
          type: tx.type || 'debit',
          status: 'ALLOWED',
          riskLevel: 'LOW',
        });
      });

      setLinkingBank(null);
      setShowConsent(null);
    }, 2000);
  };

  const handleRevoke = (assetId: string, consentId: string) => {
    removeAsset(assetId);
    revokeConsent(consentId);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-link text-primary" /> Account Aggregator
            </h2>
            <p className="text-xs text-slate-400">RBI regulated consent-based framework</p>
          </div>
          <span className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full font-medium">
            {linkedAssets.length} Linked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BANKS.map((bank) => {
            const linked = isLinked(bank.name);
            const asset = linkedAssets.find((a) => a.name.includes(bank.name));
            const consent = activeConsents.find((c) => c.purpose.includes(bank.name));
            return (
              <div
                key={bank.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  linked
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/5'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${bank.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                    {bank.initial}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{bank.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {linked ? `Balance: ₹${asset?.value.toLocaleString()}` : 'Not linked'}
                    </p>
                  </div>
                  {linked ? (
                    <span className="text-[10px] px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold">
                      <i className="fas fa-check mr-1" /> Active
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowConsent(bank)}
                      disabled={linkingBank === bank.id}
                      className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
                    >
                      {linkingBank === bank.id ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-link mr-1" />}
                      Link
                    </button>
                  )}
                </div>

                {linked && asset && consent && (
                  <div className="space-y-2">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Latest Transactions</p>
                      {bank.mockTxs.slice(0, 2).map((tx, i) => (
                        <div key={i} className="flex items-center justify-between text-xs mt-1">
                          <span className="text-slate-600 dark:text-slate-300">{tx.desc}</span>
                          <span className={tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-200'}>
                            {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleRevoke(asset.id, consent.consentId)}
                      className="w-full py-1.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors"
                    >
                      <i className="fas fa-unlink mr-1" /> Revoke Access
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {activeConsents.length > 0 && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-xs text-primary font-medium">
              <i className="fas fa-shield-halved mr-1" /> Sahamati AA Network
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {activeConsents.length} active consent{activeConsents.length > 1 ? 's' : ''}. Data is fetched securely via RBI regulated Account Aggregator framework. You can revoke access anytime.
            </p>
          </div>
        )}

        {/* Cross-Bank Fraud Intelligence */}
        {linkedAssets.length > 1 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                <i className="fas fa-network-wired text-rose-500 mr-1" /> Cross-Bank Fraud Radar
              </h4>
              <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">AA-POWERED</span>
            </div>
            <CrossBankFraudPanel transactions={transactions} linkedAssets={linkedAssets} />
          </div>
        )}
      </div>

      {/* Consent Modal */}
      {showConsent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={() => setShowConsent(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-primary to-secondary p-5 text-white rounded-xl mb-4">
              <h3 className="text-lg font-bold">RBI Account Aggregator Consent</h3>
              <p className="text-xs text-white/80">{showConsent.name}</p>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1 block">Consent Duration</label>
                <div className="flex gap-2">
                  {[6, 12].map((m) => (
                    <button
                      key={m}
                      onClick={() => setConsentDuration(m)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                        consentDuration === m ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      {m} Months
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1 block">Data Types</label>
                {CONSENT_SCOPES.map((scope) => (
                  <div key={scope} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg mb-1">
                    <i className="fas fa-check-circle text-emerald-500 text-xs" />
                    <span className="text-xs text-slate-700 dark:text-slate-200">{scope}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowConsent(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold">
                Cancel
              </button>
              <button
                onClick={() => handleLink(showConsent)}
                disabled={linkingBank === showConsent.id}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
              >
                {linkingBank === showConsent.id ? <i className="fas fa-spinner fa-spin mr-1" /> : <i className="fas fa-check mr-1" />}
                Approve & Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useWealthStore } from '../../store/wealthStore';
import { AA_BANKS } from '../../data/aaBanks';
import { backendApi } from '../../lib/backendApi';

export default function AccountAggregatorWidget() {
  const assets = useWealthStore((s) => s.assets);
  const consents = useWealthStore((s) => s.consents);
  const linkedAssetIds = new Set(assets.filter((a) => a.linkedViaAA).map((a) => a.name));
  const [linking, setLinking] = useState<string | null>(null);
  const addAsset = useWealthStore((s) => s.addAsset);
  const addConsent = useWealthStore((s) => s.addConsent);

  const activeConsents = consents.filter((c) => c.status === 'ACTIVE');

  async function linkBank(bank: typeof AA_BANKS[0]) {
    setLinking(bank.id);
    const consentRes = await backendApi.createAaConsent({
      bankName: bank.name,
      scopes: ['Account Balance', 'Transaction History', 'Fixed Deposits', 'Recurring Deposits'],
    });

    setTimeout(() => {
      const newAsset = {
        id: 'aa-' + Date.now(),
        name: bank.name + ' (Linked)',
        type: 'bank' as const,
        value: Math.round(150000 + Math.random() * 350000),
        liquidity: 'high' as const,
        linkedViaAA: true,
      };
      const consent = {
        consentId: consentRes.data?.data?.consentId || 'AA-' + Date.now().toString(36).toUpperCase(),
        dataScope: ['Account Balance', 'Transaction History', 'Fixed Deposits', 'Recurring Deposits'],
        purpose: 'Account aggregation from ' + bank.name,
        validityDays: 30,
        status: 'ACTIVE' as const,
        grantedAt: new Date().toISOString(),
      };
      addAsset(newAsset);
      addConsent(consent);
      setLinking(null);
    }, 1500);
  }

  const linkedCount = assets.filter((a) => a.linkedViaAA).length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-link text-primary" /> Account Aggregator
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Link external bank accounts via RBI AA framework</p>
        </div>
        <span className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full font-medium">
          {linkedCount} Linked
        </span>
      </div>

      <div className="space-y-2">
        {AA_BANKS.map((bank) => {
          const isLinked = Array.from(linkedAssetIds).some((name) => name.includes(bank.name));
          return (
            <div key={bank.id} className={'flex items-center gap-3 p-3 rounded-xl border ' + (isLinked ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800')}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: bank.color }}>
                {bank.shortName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-white">{bank.name}</p>
                <p className="text-[10px] text-slate-400">{isLinked ? 'Active consent | Daily fetch' : 'Not linked'}</p>
              </div>
              {isLinked ? (
                <span className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full font-medium shrink-0">
                  <i className="fas fa-check mr-1" />Linked
                </span>
              ) : (
                <button
                  onClick={() => linkBank(bank)}
                  disabled={linking === bank.id}
                  className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 shrink-0"
                >
                  {linking === bank.id ? <i className="fas fa-spinner fa-spin mr-1" /> : <i className="fas fa-link mr-1" />}Link
                </button>
              )}
            </div>
          );
        })}
      </div>

      {activeConsents.length > 0 && (
        <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
          <p className="text-xs text-primary font-medium"><i className="fas fa-shield-halved mr-1" />Sahamati AA Network</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{activeConsents.length} active consent{activeConsents.length > 1 ? 's' : ''}. Data is fetched securely via RBI regulated Account Aggregator framework.</p>
        </div>
      )}
    </div>
  );
}

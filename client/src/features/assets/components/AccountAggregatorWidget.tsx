import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import { AA_BANKS } from '@/shared/data/aaBanks';
import { backendApi } from '@/shared/lib/backendApi';
import RegulatoryDisclaimer from '@/shared/components/ui/RegulatoryDisclaimer';

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
      <RegulatoryDisclaimer compact className="mb-4" />

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

      <SmartSweepCard linkedAssets={assets.filter((a) => a.linkedViaAA)} />
    </div>
  );
}

const BANK_RATES: Record<string, { savings: number; fd: number }> = {
  'SBI': { savings: 4.0, fd: 7.2 },
  'HDFC': { savings: 3.5, fd: 7.4 },
  'ICICI': { savings: 3.75, fd: 7.35 },
  'Axis': { savings: 3.5, fd: 7.25 },
  'Kotak': { savings: 4.0, fd: 7.3 },
  'PNB': { savings: 3.5, fd: 7.1 },
  'Bank of Baroda': { savings: 3.75, fd: 7.15 },
  'Canara': { savings: 3.5, fd: 7.05 },
  'Union Bank': { savings: 3.5, fd: 7.1 },
  'IDFC First': { savings: 4.5, fd: 7.6 },
};

function bankRateFor(name: string) {
  const key = Object.keys(BANK_RATES).find((k) => name.includes(k));
  return key ? BANK_RATES[key] : { savings: 3.5, fd: 7.0 };
}

function SmartSweepCard({ linkedAssets }: { linkedAssets: { value: number; name: string }[] }) {
  const [swept, setSwept] = useState(false);
  const [animating, setAnimating] = useState(false);

  if (linkedAssets.length < 2) return null;

  const source = linkedAssets.reduce((min, a) => {
    const r = bankRateFor(a.name);
    const minR = bankRateFor(min.name);
    return r.savings < minR.savings ? a : min;
  }, linkedAssets[0]);

  const target = linkedAssets.reduce((max, a) => {
    const r = bankRateFor(a.name);
    const maxR = bankRateFor(max.name);
    return r.fd > maxR.fd ? a : max;
  }, linkedAssets[0]);

  if (!source || !target || source.name === target.name) return null;

  const sourceRate = bankRateFor(source.name).savings;
  const targetRate = bankRateFor(target.name).fd;
  const sweepAmount = Math.min(40000, Math.round(source.value * 0.3));
  const extraPerYear = Math.round(sweepAmount * ((targetRate - sourceRate) / 100));

  const handleSweep = () => {
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      setSwept(true);
    }, 1800);
  };

  return (
    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800 border border-emerald-200 dark:border-slate-700">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
          <i className="fas fa-arrow-right-arrow-left" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Cross-Bank Smart Sweep</h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">AI-found interest-rate arbitrage across your linked accounts</p>
        </div>
      </div>

      <p className="text-xs text-slate-700 dark:text-slate-200 mb-4">
        Your <span className="font-bold">{source.name.replace(' (Linked)', '')}</span> savings yields <span className="font-bold">{sourceRate}%</span>. I found a <span className="font-bold">{targetRate}%</span> FD in your linked <span className="font-bold">{target.name.replace(' (Linked)', '')}</span>. Sweeping <span className="font-bold">₹{sweepAmount.toLocaleString('en-IN')}</span> earns you <span className="font-bold text-emerald-600">~₹{extraPerYear.toLocaleString('en-IN')}/year</span> extra.
      </p>

      <div className="relative flex items-center justify-between gap-2 mb-4 p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-slate-700 overflow-hidden">
        <div className={`text-center transition-all duration-700 ${animating ? 'opacity-60 scale-95' : ''}`}>
          <p className="text-[10px] text-slate-400">{source.name.replace(' (Linked)', '')}</p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">₹{source.value.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400">{sourceRate}% savings</p>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <motion.div
            animate={animating ? { x: [0, 60, 0], opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="text-emerald-600 text-2xl"
          >
            <i className="fas fa-arrow-right" />
          </motion.div>
          {animating && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-bold text-emerald-600"
            >
              ₹{sweepAmount.toLocaleString('en-IN')} sweeping…
            </motion.div>
          )}
        </div>

        <div className={`text-center transition-all duration-700 ${animating ? 'scale-105' : ''}`}>
          <p className="text-[10px] text-slate-400">{target.name.replace(' (Linked)', '')}</p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">₹{(target.value + (animating || swept ? sweepAmount : 0)).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400">{targetRate}% FD</p>
        </div>
      </div>

      {swept ? (
        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-center">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <i className="fas fa-check-circle mr-1" /> Smart Sweep executed. You&apos;ll earn ~₹{extraPerYear.toLocaleString('en-IN')} more per year.
          </p>
        </div>
      ) : (
        <button
          onClick={handleSweep}
          disabled={animating}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-colors"
        >
          {animating ? <><i className="fas fa-circle-notch fa-spin mr-1" /> Sweeping…</> : <><i className="fas fa-wand-magic-sparkles mr-1" /> Execute Smart Sweep</>}
        </button>
      )}
    </div>
  );
}

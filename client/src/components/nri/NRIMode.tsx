import { useState } from 'react';
import { useWealthStore } from '../../store/wealthStore';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧' },
  { code: 'AED', symbol: 'د.إ', flag: '🇦🇪' },
];

function formatInr(amount: number): string {
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)}Cr`;
  if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(2)}L`;
  return `₹${amount.toLocaleString()}`;
}

function formatCurrency(amount: number, currency: string, rates: Record<string, number>): string {
  const c = CURRENCIES.find((c) => c.code === currency);
  if (!c) return `₹${amount.toLocaleString()}`;
  if (currency === 'INR') return `${c.symbol}${amount.toLocaleString()}`;
  const converted = amount * (rates[currency] || 0);
  if (converted >= 1e6) return `${c.symbol}${(converted / 1e6).toFixed(2)}M`;
  if (converted >= 1e3) return `${c.symbol}${(converted / 1e3).toFixed(2)}K`;
  return `${c.symbol}${converted.toFixed(2)}`;
}

function dualDisplay(amount: number, rates: Record<string, number>): string {
  const inr = formatInr(amount);
  const usd = formatCurrency(amount, 'USD', rates);
  return `${inr} (≈ ${usd})`;
}

export default function NRIMode() {
  const nriAccounts = useWealthStore((s) => s.nriAccounts);
  const remittances = useWealthStore((s) => s.remittances);
  const nriInvestmentRules = useWealthStore((s) => s.nriInvestmentRules);
  const preferredCurrency = useWealthStore((s) => s.preferredCurrency);
  const exchangeRates = useWealthStore((s) => s.exchangeRates);
  const exchangeRatesLastUpdated = useWealthStore((s) => s.exchangeRatesLastUpdated);
  const assets = useWealthStore((s) => s.assets);
  const cycleCurrency = useWealthStore((s) => s.cycleCurrency);
  const netWorth = assets.reduce((sum, a) => sum + a.value, 0);

  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'tax' | 'remittance' | 'rules'>('overview');

  const currentCurrency = CURRENCIES.find((c) => c.code === preferredCurrency) || CURRENCIES[0];
  const totalNRE = nriAccounts.filter((a) => a.type === 'NRE').reduce((s, a) => s + a.balance, 0);
  const totalNRO = nriAccounts.filter((a) => a.type === 'NRO').reduce((s, a) => s + a.balance, 0);
  const totalFCNR = nriAccounts.filter((a) => a.type === 'FCNR').reduce((s, a) => s + a.balance, 0);

  // Remittance analysis
  const bestRate = Math.max(...remittances.map((r) => r.rate));
  const lastRemittance = remittances[0];
  const lostAmount = lastRemittance ? Math.round((bestRate - lastRemittance.rate) * lastRemittance.amount) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg">
              <i className="fas fa-globe" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">NRI Wealth Center</h2>
              <p className="text-xs text-slate-500">Built for Global Indians</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-400">Exchange rates updated</p>
              <p className="text-[10px] text-slate-500">{new Date(exchangeRatesLastUpdated).toLocaleString('en-IN')}</p>
            </div>
            <button
              onClick={cycleCurrency}
              className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-700 rounded-xl text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <span className="text-lg">{currentCurrency.flag}</span>
              <span>{currentCurrency.code}</span>
              <i className="fas fa-rotate text-xs" />
            </button>
          </div>
        </div>

        {/* Currency rates strip */}
        <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
          {CURRENCIES.map((c) => (
            <div
              key={c.code}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                c.code === preferredCurrency
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{c.flag}</span>
              <span>1 INR = {exchangeRates[c.code]?.toFixed(4) || '-'} {c.code}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Net Worth Dual Display */}
      <div className="card border-2 border-blue-100">
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-1">Total Net Worth</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">
            {dualDisplay(netWorth, exchangeRates)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            In {currentCurrency.code}: {formatCurrency(netWorth, currentCurrency.code, exchangeRates)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'overview' as const, label: 'Overview', icon: 'fa-chart-pie' },
          { id: 'accounts' as const, label: 'Accounts', icon: 'fa-building-columns' },
          { id: 'tax' as const, label: 'Tax Comparison', icon: 'fa-file-invoice-dollar' },
          { id: 'remittance' as const, label: 'Remittance', icon: 'fa-money-bill-transfer' },
          { id: 'rules' as const, label: 'NRI Rules', icon: 'fa-scale-balanced' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
            }`}
          >
            <i className={`fas ${tab.icon}`} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white"><i className="fas fa-plane-departure" /></div>
                <div>
                  <p className="text-xs text-emerald-600 font-medium">NRE Total</p>
                  <p className="text-lg font-bold text-emerald-700">{formatInr(totalNRE)}</p>
                </div>
              </div>
              <p className="text-xs text-emerald-500">Fully repatriable • Tax-free interest</p>
              <p className="text-[10px] text-emerald-400 mt-1">≈ {formatCurrency(totalNRE, 'USD', exchangeRates)} USD</p>
            </div>
            <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white"><i className="fas fa-lock" /></div>
                <div>
                  <p className="text-xs text-amber-600 font-medium">NRO Total</p>
                  <p className="text-lg font-bold text-amber-700">{formatInr(totalNRO)}</p>
                </div>
              </div>
              <p className="text-xs text-amber-500">₹1L/year repatriation limit</p>
              <p className="text-[10px] text-amber-400 mt-1">≈ {formatCurrency(totalNRO, 'USD', exchangeRates)} USD</p>
            </div>
            <div className="card bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white"><i className="fas fa-dollar-sign" /></div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">FCNR Deposit</p>
                  <p className="text-lg font-bold text-blue-700">${totalFCNR.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-xs text-blue-500">USD fixed deposit • 4.8% p.a.</p>
              <p className="text-[10px] text-blue-400 mt-1">≈ {formatInr(totalFCNR / exchangeRates['USD'])}</p>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="space-y-4">
            {nriAccounts.map((acc) => (
              <div key={acc.id} className="card border-2 border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg ${
                      acc.type === 'NRE' ? 'bg-emerald-500' : acc.type === 'NRO' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}>
                      <i className={`fas ${acc.type === 'FCNR' ? 'fa-dollar-sign' : 'fa-building-columns'}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{acc.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          acc.type === 'NRE' ? 'bg-emerald-100 text-emerald-700' :
                          acc.type === 'NRO' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{acc.type}</span>
                        {acc.repatriable ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                            <i className="fas fa-plane-departure mr-0.5" /> Repatriable
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full">
                            <i className="fas fa-lock mr-0.5" /> Limited
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-800 dark:text-white">
                      {acc.currency === 'USD' ? `$${acc.balance.toLocaleString()}` : formatInr(acc.balance)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {acc.currency === 'USD'
                        ? `≈ ${formatInr(acc.balance / exchangeRates['USD'])}`
                        : `≈ ${formatCurrency(acc.balance, 'USD', exchangeRates)}`}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400">Interest Rate</p>
                    <p className="text-sm font-bold text-slate-700">{acc.interestRate}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400">Repatriation</p>
                    <p className="text-sm font-bold text-slate-700">{acc.repatriationLimit || 'Full'}</p>
                  </div>
                  {acc.maturityDate && (
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400">Matures</p>
                      <p className="text-sm font-bold text-slate-700">{new Date(acc.maturityDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tax' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card border-2 border-rose-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🇮🇳</span>
                  <h3 className="font-bold text-slate-800 dark:text-white">In India</h3>
                </div>
                <p className="text-2xl font-bold text-rose-600">₹2,34,000</p>
                <p className="text-xs text-rose-500">Annual tax liability</p>
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-1"><i className="fas fa-check text-emerald-500 text-[10px]" /> Section 80C: ₹1.5L deduction</p>
                  <p className="flex items-center gap-1"><i className="fas fa-check text-emerald-500 text-[10px]" /> NRE interest: Tax-free</p>
                  <p className="flex items-center gap-1"><i className="fas fa-xmark text-rose-500 text-[10px]" /> NRO interest: Taxable at 30%</p>
                </div>
              </div>
              <div className="card border-2 border-sky-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🇦🇪</span>
                  <h3 className="font-bold text-slate-800 dark:text-white">In UAE</h3>
                </div>
                <p className="text-2xl font-bold text-emerald-600">₹0</p>
                <p className="text-xs text-emerald-500">No personal income tax</p>
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-1"><i className="fas fa-check text-emerald-500 text-[10px]" /> Zero income tax</p>
                  <p className="flex items-center gap-1"><i className="fas fa-xmark text-rose-500 text-[10px]" /> No Section 80C benefits</p>
                  <p className="flex items-center gap-1"><i className="fas fa-xmark text-rose-500 text-[10px]" /> Cannot claim Indian deductions</p>
                </div>
              </div>
              <div className="card border-2 border-emerald-200 bg-emerald-50/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🎯</span>
                  <h3 className="font-bold text-slate-800 dark:text-white">AI Recommendation</h3>
                </div>
                <p className="text-sm font-bold text-emerald-700">Maintain Indian tax residency</p>
                <p className="text-xs text-emerald-500">for 80C benefits</p>
                <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-200">
                  <p className="text-xs text-slate-600">
                    <i className="fas fa-lightbulb text-amber-500 mr-1" />
                    By staying <strong>RNOR</strong> (Resident Not Ordinarily Resident) for 2 more years, you save ₹46,800/year in 80C benefits while paying minimal tax on foreign income.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'remittance' && (
          <div className="space-y-4">
            {lostAmount > 0 && (
              <div className="card border-2 border-amber-200 bg-amber-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                    <i className="fas fa-triangle-exclamation" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-800">You lost ₹{lostAmount.toLocaleString()} by not timing your last transfer</p>
                    <p className="text-xs text-amber-600">Best rate this month: {bestRate} (vs your {lastRemittance.rate})</p>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <h4 className="font-bold text-slate-800 dark:text-white mb-4">Transfer History</h4>
              <div className="space-y-3">
                {remittances.map((rem) => (
                  <div key={rem.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <i className="fas fa-money-bill-transfer" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          ${rem.amount.toLocaleString()} → ₹{(rem.amount * rem.rate).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400">{new Date(rem.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Rate: {rem.rate}</p>
                      <p className="text-xs text-slate-400">Fee: ${rem.fee}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        rem.rate >= bestRate - 0.1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {rem.rate >= bestRate - 0.1 ? 'Best Rate!' : 'Average'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="card border-2 border-emerald-200">
              <h4 className="font-bold text-emerald-700 mb-3 flex items-center gap-2">
                <i className="fas fa-circle-check" /> Allowed Investments
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nriInvestmentRules.filter((r) => r.allowed).map((rule) => (
                  <div key={rule.id} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                      <i className="fas fa-check" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{rule.name}</p>
                      <p className="text-xs text-slate-500">{rule.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card border-2 border-rose-200">
              <h4 className="font-bold text-rose-700 mb-3 flex items-center gap-2">
                <i className="fas fa-ban" /> Not Allowed
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nriInvestmentRules.filter((r) => !r.allowed).map((rule) => (
                  <div key={rule.id} className="flex items-start gap-3 p-3 bg-rose-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white flex-shrink-0">
                      <i className="fas fa-xmark" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{rule.name}</p>
                      <p className="text-xs text-slate-500">{rule.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                  <i className="fas fa-shield-halved" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-800">FEMA Compliance</h4>
                  <p className="text-xs text-blue-600">All investments within permissible limit</p>
                </div>
                <span className="ml-auto px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                  <i className="fas fa-check mr-1" /> Compliant
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

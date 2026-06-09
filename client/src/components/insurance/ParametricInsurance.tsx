import { useState, useEffect, useCallback } from 'react';

interface Policy {
  id: string;
  type: 'flight' | 'border' | 'weather';
  name: string;
  trigger: string;
  payout: number;
  status: 'active' | 'triggered' | 'paid';
  premium: number;
  createdAt: string;
  triggeredAt?: string;
}

const POLICY_KEY = 'sw_parametric_policies';
const HISTORY_KEY = 'sw_parametric_history';

function loadPolicies(): Policy[] {
  try { return JSON.parse(localStorage.getItem(POLICY_KEY) || '[]'); } catch { return []; }
}
function savePolicies(p: Policy[]) { localStorage.setItem(POLICY_KEY, JSON.stringify(p)); }
function loadHistory(): { action: string; amount: number; date: string }[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveHistory(h: { action: string; amount: number; date: string }[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

export default function ParametricInsurance() {
  const [policies, setPolicies] = useState<Policy[]>(loadPolicies);
  const [history, setHistory] = useState(loadHistory);
  const [flightNum, setFlightNum] = useState('');
  const [location, setLocation] = useState('');
  const [borderCountry, setBorderCountry] = useState('Nepal');
  const [activeTab, setActiveTab] = useState<'flight' | 'border' | 'weather'>('flight');
  const [simulating, setSimulating] = useState<string | null>(null);

  useEffect(() => { savePolicies(policies); }, [policies]);
  useEffect(() => { saveHistory(history); }, [history]);

  const addPolicy = useCallback((type: Policy['type'], name: string, trigger: string, payout: number, premium: number) => {
    const p: Policy = { id: `pol-${Date.now()}`, type, name, trigger, payout, status: 'active', premium, createdAt: new Date().toISOString() };
    setPolicies((prev) => [p, ...prev]);
  }, []);

  const simulateTrigger = useCallback((id: string) => {
    setSimulating(id);
    setTimeout(() => {
      setPolicies((prev) => prev.map((p) => {
        if (p.id !== id) return p;
        const now = new Date().toISOString();
        setHistory((h) => [{ action: `Payout: ${p.name}`, amount: p.payout, date: now }, ...h]);
        return { ...p, status: 'paid', triggeredAt: now };
      }));
      setSimulating(null);
    }, 2000);
  }, []);

  const totalPaid = history.reduce((s, h) => s + h.amount, 0);
  const activeCount = policies.filter((p) => p.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-bolt text-amber-500" /> Parametric Insurance
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">No claims. No forms. Data triggers instant payouts.</p>
        </div>
        <span className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full font-medium">
          <i className="fas fa-check-circle mr-1" />{activeCount} Active
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10">
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">₹{totalPaid.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-500">Total Payouts</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{activeCount}</p>
          <p className="text-[10px] text-slate-400">Active Policies</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{history.length}</p>
          <p className="text-[10px] text-slate-400">Claims Paid</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['flight', 'border', 'weather'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t === 'flight' && <i className="fas fa-plane mr-1.5" />}
            {t === 'border' && <i className="fas fa-globe mr-1.5" />}
            {t === 'weather' && <i className="fas fa-cloud-showers-heavy mr-1.5" />}
            {t === 'flight' ? 'Flight Delay' : t === 'border' ? 'Border Cross' : 'Weather'}
          </button>
        ))}
      </div>

      {/* Flight Delay */}
      {activeTab === 'flight' && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-sky-500/10 rounded-lg flex items-center justify-center text-sky-600">
              <i className="fas fa-plane-departure" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white">Flight Delay Cover</h3>
              <p className="text-[10px] text-slate-400">Auto-payout if delay exceeds 45 minutes</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={flightNum}
              onChange={(e) => setFlightNum(e.target.value)}
              placeholder="Flight number (e.g. AI302)"
              className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
            />
            <button
              onClick={() => { if (flightNum) { addPolicy('flight', `Flight ${flightNum}`, 'Delay > 45 mins', 5000, 149); setFlightNum(''); } }}
              className="px-4 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors"
            >
              <i className="fas fa-shield-halved mr-1.5" /> Activate Cover — ₹149
            </button>
          </div>
          <div className="p-3 bg-sky-50 dark:bg-sky-900/10 rounded-xl border border-sky-100 dark:border-sky-800">
            <p className="text-xs text-sky-700 dark:text-sky-300">
              <i className="fas fa-circle-info mr-1" /> Demo: Enter any flight number. If you click "Simulate Trigger" below, it pays ₹5,000 instantly.
            </p>
          </div>
        </div>
      )}

      {/* Border Cross */}
      {activeTab === 'border' && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center text-violet-600">
              <i className="fas fa-globe-asia" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white">Auto Border Insurance</h3>
              <p className="text-[10px] text-slate-400">GPS-activated. Pay only for hours abroad.</p>
            </div>
          </div>
          <select
            value={borderCountry}
            onChange={(e) => setBorderCountry(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
          >
            <option>Nepal</option>
            <option>Bhutan</option>
            <option>Thailand</option>
            <option>Sri Lanka</option>
          </select>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Coverage: ₹50,00,000</p>
            <p className="text-xs text-slate-400">Rate: ₹12/hour while abroad</p>
          </div>
          <button
            onClick={() => addPolicy('border', `${borderCountry} Border Cover`, 'GPS border cross detected', 5000000, 0)}
            className="w-full px-4 py-3 bg-violet-500 text-white rounded-xl font-medium hover:bg-violet-600 transition-colors"
          >
            <i className="fas fa-location-crosshairs mr-1.5" /> Activate Geo-Cover
          </button>
        </div>
      )}

      {/* Weather */}
      {activeTab === 'weather' && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-600">
              <i className="fas fa-cloud-showers-heavy" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white">Weather Parametric Cover</h3>
              <p className="text-[10px] text-slate-400">Satellite + rainfall data triggers payout</p>
            </div>
          </div>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your location (e.g. Mumbai, Kerala)"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
              <p className="text-xs text-slate-400">Trigger</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Rainfall {'>'} 100mm/24h</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
              <p className="text-xs text-slate-400">Payout</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">₹25,000</p>
            </div>
          </div>
          <button
            onClick={() => { if (location) { addPolicy('weather', `Weather: ${location}`, 'Rainfall > 100mm/24h', 25000, 299); setLocation(''); } }}
            className="w-full px-4 py-3 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors"
          >
            <i className="fas fa-cloud-bolt mr-1.5" /> Activate Weather Cover — ₹299
          </button>
        </div>
      )}

      {/* Active Policies */}
      {policies.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">
            <i className="fas fa-file-shield text-primary mr-2" /> Active Policies
          </h3>
          <div className="space-y-2">
            {policies.map((p) => (
              <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border ${
                p.status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' :
                p.status === 'triggered' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
                'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    p.type === 'flight' ? 'bg-sky-100 text-sky-600' :
                    p.type === 'border' ? 'bg-violet-100 text-violet-600' :
                    'bg-cyan-100 text-cyan-600'
                  }`}>
                    <i className={`fas ${p.type === 'flight' ? 'fa-plane' : p.type === 'border' ? 'fa-globe' : 'fa-cloud-rain'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.trigger}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">₹{p.payout.toLocaleString()}</span>
                  {p.status === 'active' && (
                    <button
                      onClick={() => simulateTrigger(p.id)}
                      disabled={simulating === p.id}
                      className="text-xs px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
                    >
                      {simulating === p.id ? 'Processing...' : 'Simulate Trigger'}
                    </button>
                  )}
                  {p.status === 'paid' && (
                    <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full font-medium">
                      <i className="fas fa-check mr-1" /> Paid
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payout History */}
      {history.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">
            <i className="fas fa-clock-rotate-left text-primary mr-2" /> Payout History
          </h3>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-xs text-slate-600 dark:text-slate-300">{h.action}</span>
                <span className="text-xs font-bold text-emerald-600">+₹{h.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

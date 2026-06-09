import { useState, useMemo, useCallback } from 'react';

interface Vouch {
  id: string;
  name: string;
  relation: string;
  trustScore: number;
  vouchAmount: number;
  avatar: string;
}

interface Loan {
  id: string;
  amount: number;
  purpose: string;
  interestRate: number;
  emi: number;
  tenure: number;
  backedBy: number;
  status: 'active' | 'repaid';
}

const VOUCH_KEY = 'sw_social_loans';

const MOCK_FRIENDS: Vouch[] = [
  { id: 'v1', name: 'Arjun Mehta', relation: 'College Friend', trustScore: 92, vouchAmount: 50000, avatar: 'AM' },
  { id: 'v2', name: 'Priya Sharma', relation: 'Colleague', trustScore: 88, vouchAmount: 75000, avatar: 'PS' },
  { id: 'v3', name: 'Vikram Rao', relation: 'Childhood Friend', trustScore: 95, vouchAmount: 100000, avatar: 'VR' },
  { id: 'v4', name: 'Neha Gupta', relation: 'Sister', trustScore: 98, vouchAmount: 150000, avatar: 'NG' },
];

const PURPOSES = ['Medical Emergency', 'Education', 'Business', 'Home Renovation', 'Travel', 'Wedding'];

function loadLoans(): Loan[] {
  try { return JSON.parse(localStorage.getItem(VOUCH_KEY) || '[]'); } catch { return []; }
}
function saveLoans(l: Loan[]) { localStorage.setItem(VOUCH_KEY, JSON.stringify(l)); }

export default function SocialCollateralLoan() {
  const [vouches, setVouches] = useState<Vouch[]>([]);
  const [loans, setLoans] = useState<Loan[]>(loadLoans);
  const [loanAmount, setLoanAmount] = useState(100000);
  const [purpose, setPurpose] = useState('Medical Emergency');
  const [showRequest, setShowRequest] = useState(false);

  const socialScore = useMemo(() => {
    const base = 450;
    const vouchBonus = vouches.reduce((s, v) => s + v.trustScore * 0.5, 0);
    return Math.min(1000, Math.round(base + vouchBonus));
  }, [vouches]);

  const maxLoan = useMemo(() => {
    const base = 50000;
    const vouchTotal = vouches.reduce((s, v) => s + v.vouchAmount, 0);
    return base + vouchTotal * 0.8;
  }, [vouches]);

  const interestRate = useMemo(() => {
    const base = 14;
    const reduction = (socialScore / 1000) * 6;
    return Math.max(8, base - reduction);
  }, [socialScore]);

  const addVouch = useCallback((friend: Vouch) => {
    setVouches((prev) => [...prev, friend]);
  }, []);

  const removeVouch = useCallback((id: string) => {
    setVouches((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const requestLoan = useCallback(() => {
    if (loanAmount > maxLoan) return;
    const tenure = 24;
    const r = interestRate / 1200;
    const emi = Math.round((loanAmount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1));
    const loan: Loan = {
      id: `loan-${Date.now()}`,
      amount: loanAmount,
      purpose,
      interestRate,
      emi,
      tenure,
      backedBy: vouches.length,
      status: 'active',
    };
    setLoans((prev) => [loan, ...prev]);
    saveLoans([loan, ...loans]);
    setShowRequest(false);
  }, [loanAmount, purpose, interestRate, maxLoan, vouches.length, loans]);

  const availableFriends = MOCK_FRIENDS.filter((f) => !vouches.some((v) => v.id === f.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-people-group text-orange-500" /> Social Collateral Loans
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Your network's trust = your collateral</p>
        </div>
      </div>

      {/* Social Credit Score */}
      <div className="card bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium uppercase tracking-wide">Social Credit Score</p>
            <p className="text-4xl font-bold text-orange-800 dark:text-orange-300">{socialScore}</p>
            <p className="text-xs text-orange-500 mt-1">out of 1000</p>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-orange-300 flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path className="text-orange-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              <path className="text-orange-500" strokeDasharray={`${(socialScore / 1000) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div><p className="text-sm font-bold text-orange-700 dark:text-orange-400">+{Math.round(socialScore * 0.34)}</p><p className="text-[10px] text-orange-500">Payment History</p></div>
          <div><p className="text-sm font-bold text-orange-700 dark:text-orange-400">+{Math.round(socialScore * 0.21)}</p><p className="text-[10px] text-orange-500">Network Strength</p></div>
          <div><p className="text-sm font-bold text-orange-700 dark:text-orange-400">+{Math.round(socialScore * 0.15)}</p><p className="text-[10px] text-orange-500">Account Age</p></div>
        </div>
      </div>

      {/* Loan Eligibility */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
            <i className="fas fa-hand-holding-dollar text-primary mr-2" /> Loan Eligibility
          </h3>
          <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full font-medium">
            {vouches.length} vouches · Max ₹{Math.round(maxLoan).toLocaleString()}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
            <p className="text-lg font-bold text-slate-800 dark:text-white">₹{Math.round(maxLoan).toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Max Loan</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{interestRate.toFixed(1)}%</p>
            <p className="text-[10px] text-slate-400">Interest Rate</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
            <p className="text-lg font-bold text-slate-800 dark:text-white">24 mo</p>
            <p className="text-[10px] text-slate-400">Tenure</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
            <p className="text-lg font-bold text-slate-800 dark:text-white">{vouches.length}</p>
            <p className="text-[10px] text-slate-400">Backers</p>
          </div>
        </div>
        <button
          onClick={() => setShowRequest(true)}
          className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
        >
          <i className="fas fa-paper-plane mr-2" /> Request Loan
        </button>
      </div>

      {/* Request Modal */}
      {showRequest && (
        <div className="card border-2 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white">New Loan Request</h3>
            <button onClick={() => setShowRequest(false)} className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
              <i className="fas fa-times" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Amount (₹)</label>
              <input
                type="range" min={10000} max={maxLoan} step={5000}
                value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>₹10K</span>
                <span className="font-bold text-orange-600">₹{loanAmount.toLocaleString()}</span>
                <span>₹{Math.round(maxLoan).toLocaleString()}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Purpose</label>
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm">
                {PURPOSES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Interest Rate:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{interestRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-500">Est. EMI:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  ₹{Math.round((loanAmount * (interestRate / 1200) * Math.pow(1 + interestRate / 1200, 24)) / (Math.pow(1 + interestRate / 1200, 24) - 1)).toLocaleString()}/mo
                </span>
              </div>
            </div>
            <button
              onClick={requestLoan}
              disabled={loanAmount > maxLoan}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-40"
            >
              Confirm Request
            </button>
          </div>
        </div>
      )}

      {/* Vouch Network */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">
          <i className="fas fa-handshake text-primary mr-2" /> Your Vouch Network
        </h3>

        {vouches.length > 0 && (
          <div className="space-y-2 mb-4">
            {vouches.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold">
                    {v.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{v.name}</p>
                    <p className="text-[10px] text-slate-400">{v.relation} · Trust: {v.trustScore}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-emerald-600">₹{v.vouchAmount.toLocaleString()}</span>
                  <button onClick={() => removeVouch(v.id)} className="text-xs text-slate-400 hover:text-rose-500">
                    <i className="fas fa-times" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {availableFriends.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-2">Available to vouch:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableFriends.map((f) => (
                <button
                  key={f.id}
                  onClick={() => addVouch(f)}
                  className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold">
                    {f.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{f.name}</p>
                    <p className="text-[10px] text-slate-400">{f.relation}</p>
                  </div>
                  <span className="text-xs text-orange-500 font-medium">+₹{f.vouchAmount.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Network Graph Visual */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">
          <i className="fas fa-circle-nodes text-primary mr-2" /> Trust Network
        </h3>
        <div className="relative h-48 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden">
          {/* Center node - You */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg z-10">
            You
          </div>
          {/* Friend nodes */}
          {vouches.map((v, i) => {
            const angle = (i / Math.max(vouches.length, 1)) * 2 * Math.PI - Math.PI / 2;
            const x = 50 + 35 * Math.cos(angle);
            const y = 50 + 35 * Math.sin(angle);
            return (
              <div key={v.id}>
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line x1="50%" y1="50%" x2={`${x}%`} y2={`${y}%`} stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.5" />
                </svg>
                <div
                  className="absolute w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md"
                  style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {v.avatar}
                </div>
              </div>
            );
          })}
          {availableFriends.map((f, i) => {
            const angle = ((i + vouches.length) / Math.max(vouches.length + availableFriends.length, 1)) * 2 * Math.PI - Math.PI / 2;
            const x = 50 + 35 * Math.cos(angle);
            const y = 50 + 35 * Math.sin(angle);
            return (
              <div key={f.id}>
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line x1="50%" y1="50%" x2={`${x}%`} y2={`${y}%`} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
                </svg>
                <div
                  className="absolute w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 text-[10px] font-bold"
                  style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {f.avatar}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-2">
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full" /> Vouched</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-300 rounded-full" /> Available</span>
        </div>
      </div>

      {/* Active Loans */}
      {loans.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">
            <i className="fas fa-file-invoice-dollar text-primary mr-2" /> Active Loans
          </h3>
          <div className="space-y-2">
            {loans.map((loan) => (
              <div key={loan.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-white">{loan.purpose}</span>
                  <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full">
                    {loan.backedBy} backers
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>₹{loan.amount.toLocaleString()}</span>
                  <span>{loan.interestRate.toFixed(1)}%</span>
                  <span>₹{loan.emi.toLocaleString()}/mo</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

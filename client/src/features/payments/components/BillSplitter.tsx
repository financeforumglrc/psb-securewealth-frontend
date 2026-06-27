import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useToast } from '@/shared/components/ui/ToastProvider';
import type { Transaction } from '@/shared/types';

interface SplitPerson {
  id: string;
  name: string;
  amount: number;
  percentage: number;
}

const uid = () => Math.random().toString(36).slice(2);

export default function BillSplitter() {
  const { showToast } = useToast();
  const assets = useWealthStore((s) => s.assets);
  const addTransaction = useWealthStore((s) => s.addTransaction);
  const updateAsset = useWealthStore((s) => s.updateAsset);
  const addAsset = useWealthStore((s) => s.addAsset);

  const [amount, setAmount] = useState('');
  const [payee, setPayee] = useState('');
  const [people, setPeople] = useState<SplitPerson[]>([
    { id: uid(), name: 'You', amount: 0, percentage: 50 },
    { id: uid(), name: 'Friend 1', amount: 0, percentage: 50 },
  ]);
  const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'custom'>('equal');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const total = parseFloat(amount) || 0;

  const bankAssets = useMemo(
    () => assets.filter((a) => a.type === 'bank' || a.liquidity === 'high'),
    [assets]
  );

  const selectedAsset = bankAssets.find((a) => a.id === selectedAssetId);

  const percentageSum = people.reduce((sum, p) => sum + (p.percentage || 0), 0);
  const customSum = people.reduce((sum, p) => sum + (p.amount || 0), 0);

  const canPay = useMemo(() => {
    if (!total || total <= 0) return false;
    if (!payee.trim()) return false;
    if (!selectedAsset) return false;
    if (selectedAsset.value < total) return false;
    if (splitType === 'percentage' && Math.abs(percentageSum - 100) > 0.01) return false;
    if (splitType === 'custom' && Math.abs(customSum - total) > 0.01) return false;
    return true;
  }, [total, payee, selectedAsset, splitType, percentageSum, customSum]);

  const calculateSplit = () => {
    if (!total) return;

    if (splitType === 'percentage' && Math.abs(percentageSum - 100) > 0.01) {
      showToast(`Percentages must add up to 100% (currently ${percentageSum.toFixed(2)}%)`, 'warning');
      return;
    }

    if (splitType === 'custom' && Math.abs(customSum - total) > 0.01) {
      showToast(`Custom shares must add up to ₹${total.toLocaleString('en-IN')}`, 'warning');
      return;
    }

    const updated = people.map((p) => {
      if (splitType === 'equal') {
        return { ...p, amount: total / people.length, percentage: 100 / people.length };
      }
      if (splitType === 'percentage') {
        return { ...p, amount: (total * (p.percentage || 0)) / 100 };
      }
      return p;
    });

    setPeople(updated);
    setShowResult(true);
    setPaid(false);
  };

  const addPerson = () => {
    const nextCount = people.length + 1;
    setPeople([
      ...people,
      {
        id: uid(),
        name: `Friend ${people.length}`,
        amount: 0,
        percentage: parseFloat((100 / nextCount).toFixed(2)),
      },
    ]);
    setShowResult(false);
  };

  const removePerson = (id: string) => {
    if (people.length <= 2) return;
    const next = people.filter((p) => p.id !== id);
    if (splitType === 'equal') {
      const share = 100 / next.length;
      setPeople(next.map((p) => ({ ...p, percentage: parseFloat(share.toFixed(2)) })));
    }
    setShowResult(false);
  };

  const updatePerson = (index: number, updates: Partial<SplitPerson>) => {
    const next = [...people];
    next[index] = { ...next[index], ...updates };
    setPeople(next);
    if (splitType !== 'custom') setShowResult(false);
  };

  const redistributePercentages = () => {
    const share = parseFloat((100 / people.length).toFixed(2));
    const remainder = parseFloat((100 - share * people.length).toFixed(2));
    setPeople(
      people.map((p, i) => ({
        ...p,
        percentage: i === 0 ? parseFloat((share + remainder).toFixed(2)) : share,
      }))
    );
  };

  const createDemoAccount = () => {
    const id = `bank-${uid()}`;
    addAsset({
      id,
      name: 'SBI Privilege Savings',
      type: 'bank',
      value: 500000,
      liquidity: 'high',
    });
    setSelectedAssetId(id);
    showToast('Demo bank account added with ₹5,00,000 balance', 'success');
  };

  const handlePay = () => {
    if (!canPay || !selectedAsset) return;

    setPaying(true);

    // Deduct the full amount once from the selected source account.
    updateAsset(selectedAsset.id, { value: selectedAsset.value - total });

    // Record a debit transaction for each participant's share.
    people.forEach((p) => {
      if (p.amount <= 0) return;
      const tx: Transaction = {
        id: `split-${uid()}`,
        date: new Date().toISOString().split('T')[0],
        description: `${p.name === 'You' ? 'Your' : `${p.name}'s`} share — ${payee.trim()}`,
        category: 'Transfer',
        amount: parseFloat(p.amount.toFixed(2)),
        type: 'debit',
        status: 'ALLOWED',
        riskLevel: 'LOW',
      };
      addTransaction(tx);
    });

    setPaying(false);
    setPaid(true);
    showToast(`Paid ₹${total.toLocaleString('en-IN')} to ${payee.trim()} and split across ${people.length} people`, 'success');
  };

  const shareText = people
    .filter((p) => p.amount > 0)
    .map((p) => `${p.name}: ₹${Math.round(p.amount)}`)
    .join('\n');

  return (
    <div className="card rounded-3xl shadow-xl p-6">
      <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
        <i className="fas fa-users text-teal-500" />
        AI Bill Split
      </h3>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400">Total Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setShowResult(false); setPaid(false); }}
            placeholder="e.g. 4500"
            className="w-full mt-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-lg font-bold outline-none border border-transparent focus:border-teal-500 dark:text-white"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400">Payee / Expense (e.g. Trip Rent)</label>
          <input
            type="text"
            value={payee}
            onChange={(e) => { setPayee(e.target.value); setPaid(false); }}
            placeholder="Owner / Merchant name"
            className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-teal-500 dark:text-white"
          />
        </div>

        {/* Source account */}
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400">Debit From Account</label>
          {bankAssets.length === 0 ? (
            <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>No bank account linked.</span>
              <button
                onClick={createDemoAccount}
                className="text-teal-600 font-bold hover:underline"
              >
                Add demo account
              </button>
            </div>
          ) : (
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-teal-500 dark:text-white"
            >
              <option value="">Select account</option>
              {bankAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — ₹{a.value.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          )}
          {selectedAsset && total > selectedAsset.value && (
            <p className="text-[10px] text-rose-500 mt-1">Insufficient balance in selected account.</p>
          )}
        </div>

        {/* Split type tabs */}
        <div className="flex gap-2">
          {(['equal', 'percentage', 'custom'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setSplitType(t);
                setShowResult(false);
                setPaid(false);
                if (t === 'equal') redistributePercentages();
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
                splitType === t
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {splitType === 'percentage' && (
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span>Total percentage: {percentageSum.toFixed(2)}%</span>
            <button onClick={redistributePercentages} className="text-teal-600 font-medium hover:underline">
              Equalize
            </button>
          </div>
        )}

        {/* People list */}
        <div className="space-y-2">
          {people.map((person, i) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 text-xs font-bold">
                {person.name.charAt(0)}
              </div>
              <input
                value={person.name}
                onChange={(e) => updatePerson(i, { name: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm outline-none dark:text-white"
              />
              {splitType === 'percentage' ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={person.percentage || ''}
                    onChange={(e) => updatePerson(i, { percentage: parseFloat(e.target.value) || 0 })}
                    placeholder="%"
                    className="w-16 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-right outline-none dark:text-white"
                  />
                  <span className="text-xs text-slate-400">%</span>
                </div>
              ) : splitType === 'custom' ? (
                <input
                  type="number"
                  value={person.amount || ''}
                  onChange={(e) => updatePerson(i, { amount: parseFloat(e.target.value) || 0 })}
                  placeholder="₹"
                  className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-right outline-none dark:text-white"
                />
              ) : (
                <span className="w-20 text-right text-sm font-medium text-slate-600 dark:text-slate-300">
                  {showResult ? `₹${Math.round(person.amount)}` : '—'}
                </span>
              )}
              {people.length > 2 && (
                <button onClick={() => removePerson(person.id)} className="text-rose-400 hover:text-rose-600">
                  <i className="fas fa-trash text-xs" />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        <button
          onClick={addPerson}
          className="text-xs text-teal-600 font-medium flex items-center gap-1 hover:underline"
        >
          <i className="fas fa-plus" /> Add person
        </button>

        <button
          onClick={calculateSplit}
          className="w-full py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors"
        >
          Calculate Split
        </button>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-teal-700 dark:text-teal-400">Split Summary</p>
                <p className="text-[10px] text-teal-600 dark:text-teal-300">
                  Total: ₹{total.toLocaleString('en-IN')}
                </p>
              </div>
              <pre className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{shareText}</pre>

              <button
                onClick={handlePay}
                disabled={!canPay || paying || paid}
                className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  paid
                    ? 'bg-emerald-500 text-white'
                    : canPay
                    ? 'bg-slate-800 text-white hover:bg-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400'
                }`}
              >
                <i className={`fas ${paid ? 'fa-check' : paying ? 'fa-circle-notch fa-spin' : 'fa-paper-plane'}`} />
                {paid ? 'Paid & Split' : paying ? 'Processing...' : `Pay ₹${total.toLocaleString('en-IN')} & Split`}
              </button>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(`Bill Split for ${payee || 'expense'}:\n${shareText}\n\nvia SecureWealth`);
                  showToast('Split details copied to clipboard', 'success');
                }}
                className="w-full py-2 bg-teal-500 text-white rounded-lg text-xs font-bold hover:bg-teal-600"
              >
                <i className="fas fa-share mr-1" /> Copy & Share
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

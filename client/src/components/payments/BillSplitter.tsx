import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplitPerson {
  id: string;
  name: string;
  amount: number;
}

export default function BillSplitter() {
  const [amount, setAmount] = useState('');
  const [people, setPeople] = useState<SplitPerson[]>([
    { id: '1', name: 'You', amount: 0 },
    { id: '2', name: 'Friend 1', amount: 0 },
  ]);
  const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'custom'>('equal');
  const [showResult, setShowResult] = useState(false);

  const total = parseFloat(amount) || 0;

  const calculateSplit = () => {
    if (!total) return;
    const updated = people.map((p, i) => {
      if (splitType === 'equal') {
        return { ...p, amount: total / people.length };
      }
      if (splitType === 'percentage') {
        const pct = i === 0 ? 60 : 40 / (people.length - 1);
        return { ...p, amount: (total * pct) / 100 };
      }
      return p;
    });
    setPeople(updated);
    setShowResult(true);
  };

  const addPerson = () => {
    setPeople([...people, { id: Date.now().toString(), name: `Friend ${people.length}`, amount: 0 }]);
  };

  const removePerson = (id: string) => {
    if (people.length <= 2) return;
    setPeople(people.filter((p) => p.id !== id));
  };

  const shareText = people
    .filter((p) => p.amount > 0)
    .map((p) => `${p.name}: ₹${Math.round(p.amount)}`)
    .join('\n');

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
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
            onChange={(e) => { setAmount(e.target.value); setShowResult(false); }}
            placeholder="e.g. 4500"
            className="w-full mt-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-lg font-bold outline-none border border-transparent focus:border-teal-500 dark:text-white"
          />
        </div>

        {/* Split type tabs */}
        <div className="flex gap-2">
          {(['equal', 'percentage', 'custom'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setSplitType(t); setShowResult(false); }}
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
                onChange={(e) => {
                  const updated = [...people];
                  updated[i].name = e.target.value;
                  setPeople(updated);
                }}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm outline-none dark:text-white"
              />
              {splitType === 'custom' ? (
                <input
                  type="number"
                  value={person.amount || ''}
                  onChange={(e) => {
                    const updated = [...people];
                    updated[i].amount = parseFloat(e.target.value) || 0;
                    setPeople(updated);
                  }}
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
              className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl"
            >
              <p className="text-xs font-bold text-teal-700 dark:text-teal-400 mb-2">Split Summary</p>
              <pre className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{shareText}</pre>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(`Bill Split:\n${shareText}\n\nvia SecureWealth`);
                  alert('Copied to clipboard!');
                }}
                className="mt-3 w-full py-2 bg-teal-500 text-white rounded-lg text-xs font-bold hover:bg-teal-600"
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

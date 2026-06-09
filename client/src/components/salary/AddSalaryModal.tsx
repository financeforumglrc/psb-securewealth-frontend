import { useState } from 'react';
import { useWealthStore } from '../../store/wealthStore';

export interface SalaryEntry {
  id: string;
  amount: number;
  date: string;
  description: string;
}

const SALARY_KEY = 'sw_salary_history';

export function getSalaryHistory(): SalaryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(SALARY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addSalaryEntry(entry: SalaryEntry) {
  const history = getSalaryHistory();
  history.unshift(entry);
  localStorage.setItem(SALARY_KEY, JSON.stringify(history.slice(0, 12)));
}

interface Props {
  show: boolean;
  onClose: () => void;
}

export default function AddSalaryModal({ show, onClose }: Props) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  if (!show) return null;

  const handleSubmit = () => {
    const val = parseInt(amount);
    if (!val || val <= 0) return;

    const entry: SalaryEntry = {
      id: `sal-${Date.now()}`,
      amount: val,
      date,
      description: description || 'Salary Credit',
    };
    addSalaryEntry(entry);

    // Update store user monthlyIncome
    const current = useWealthStore.getState().user;
    useWealthStore.setState({
      user: { ...current, monthlyIncome: val },
    });

    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-plus text-emerald-500" /> Add Salary
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fas fa-xmark" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 font-medium mb-1 block">Monthly Salary (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="125000"
                className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium mb-1 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium mb-1 block">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Acme Corp Salary"
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!amount}
          className="w-full mt-4 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-40 transition-colors"
        >
          <i className="fas fa-check mr-2" /> Update Salary
        </button>
      </div>
    </div>
  );
}

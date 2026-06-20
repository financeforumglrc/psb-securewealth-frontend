import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { backendApi } from '../../lib/backendApi';
import { mockRecurring } from '../../data/mockBankingData';
import { useToast } from '../../components/ui/ToastProvider';

interface RecurringPayment {
  id: number;
  name: string;
  amount: number;
  frequency: string;
  category: string;
  status: string;
  next_execution: string;
  last_executed: string | null;
  account_id: number | null;
  beneficiary_id: number | null;
  start_date: string;
  end_date: string | null;
}

const categoryMeta: Record<string, { icon: string; color: string }> = {
  Investment: { icon: 'fa-chart-line', color: 'text-emerald-500 bg-emerald-50' },
  Savings: { icon: 'fa-piggy-bank', color: 'text-blue-500 bg-blue-50' },
  Bill: { icon: 'fa-file-invoice', color: 'text-amber-500 bg-amber-50' },
  Subscription: { icon: 'fa-calendar-check', color: 'text-violet-500 bg-violet-50' },
  Insurance: { icon: 'fa-shield-halved', color: 'text-rose-500 bg-rose-50' },
};

const frequencyMeta: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export default function RecurringPayments() {
  const [items, setItems] = useState<RecurringPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '', amount: '', frequency: 'monthly', category: 'Investment', nextExecution: '',
  });

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const res = await backendApi.getRecurring();
      const data = res.data?.data;
      if (data && data.length > 0) {
        setItems(data);
      } else if (!res.ok) {
        setItems(mockRecurring as any);
      } else {
        setItems([]);
      }
    } catch {
      setItems(mockRecurring as any);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await backendApi.createRecurring({
        name: form.name, amount: Number(form.amount),
        frequency: form.frequency, category: form.category,
        nextExecution: form.nextExecution,
      });
      showToast('Recurring payment created', 'success');
      setShowForm(false);
      setForm({ name: '', amount: '', frequency: 'monthly', category: 'Investment', nextExecution: '' });
      loadItems();
    } catch (e: any) {
      showToast(e.message || 'Creation failed', 'error');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this recurring payment?')) return;
    try {
      await backendApi.deleteRecurring(id);
      showToast('Deleted', 'success');
      loadItems();
    } catch (e: any) {
      showToast(e.message || 'Delete failed', 'error');
    }
  }

  async function handleToggleStatus(item: RecurringPayment) {
    const newStatus = item.status === 'active' ? 'paused' : 'active';
    try {
      await backendApi.updateRecurring(item.id, { status: newStatus });
      showToast(`Payment ${newStatus}`, 'success');
      loadItems();
    } catch (e: any) {
      showToast(e.message || 'Update failed', 'error');
    }
  }

  async function handleExecute(id: number, name: string) {
    try {
      const res = await backendApi.executeRecurring(id);
      if (res.ok && res.data?.success) {
        showToast(`SIP executed: ₹${res.data.data.amount.toLocaleString()} invested in ${name}`, 'success');
      } else {
        showToast(res.data?.error || 'Execution failed', 'error');
      }
      loadItems();
    } catch (e: any) {
      showToast(e.message || 'Execution failed', 'error');
    }
  }

  const totalMonthly = items.filter(i => i.status === 'active' && i.frequency === 'monthly').reduce((sum, i) => sum + i.amount, 0);
  const activeCount = items.filter(i => i.status === 'active').length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-rotate text-primary" /> Recurring Payments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">SIPs, auto-debits, subscriptions and scheduled transfers</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2">
          <i className="fas fa-plus" />{showForm ? 'Cancel' : 'Add New'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <p className="text-xs opacity-80">Active Recurring</p>
          <p className="text-2xl font-bold mt-1">{activeCount}</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-xs opacity-80">Monthly Outgo</p>
          <p className="text-2xl font-bold mt-1">₹{totalMonthly.toLocaleString()}</p>
        </div>
        <div className="card bg-gradient-to-br from-violet-500 to-violet-600 text-white">
          <p className="text-xs opacity-80">Total Scheduled</p>
          <p className="text-2xl font-bold mt-1">{items.length}</p>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="card border-2 border-primary/20">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">New Recurring Payment</h3>
              <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Name</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Axis Bluechip SIP" className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Amount (₹)</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="15000" className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Frequency</label>
                  <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm">
                    <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option><option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm">
                    <option value="Investment">Investment</option><option value="Savings">Savings</option>
                    <option value="Bill">Bill</option><option value="Subscription">Subscription</option><option value="Insurance">Insurance</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Next Execution Date</label>
                  <input type="date" value={form.nextExecution} onChange={e => setForm(f => ({ ...f, nextExecution: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm" required />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button type="submit" className="px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
                    Create Recurring Payment
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {items.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-rotate text-slate-400 text-2xl" />
          </div>
          <h3 className="font-bold text-slate-700 dark:text-slate-300">No Recurring Payments</h3>
          <p className="text-sm text-slate-500 mt-1">Set up SIPs, auto-debits, or scheduled transfers</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const meta = categoryMeta[item.category] || categoryMeta.Investment;
            const isActive = item.status === 'active';
            const isOverdue = isActive && new Date(item.next_execution) < new Date();
            return (
              <motion.div key={item.id} layout className="card flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${meta.color}`}>
                  <i className={`fas ${meta.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-slate-800 dark:text-white truncate">{item.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{item.status}</span>
                    {isOverdue && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-rose-100 text-rose-700">Overdue</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                    <span>₹{item.amount.toLocaleString()}</span><span>·</span>
                    <span>{frequencyMeta[item.frequency] || item.frequency}</span><span>·</span>
                    <span>Next: {new Date(item.next_execution).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isActive && (
                    <button onClick={() => handleExecute(item.id, item.name)}
                      className="px-3 h-8 rounded-lg flex items-center gap-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors text-xs font-semibold"
                      title="Execute this SIP now">
                      <i className="fas fa-bolt" /> Execute
                    </button>
                  )}
                  <button onClick={() => handleToggleStatus(item)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                    title={isActive ? 'Pause' : 'Activate'}>
                    <i className={`fas ${isActive ? 'fa-pause' : 'fa-play'}`} />
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors" title="Delete">
                    <i className="fas fa-trash-alt" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

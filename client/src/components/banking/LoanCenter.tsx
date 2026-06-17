import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { backendApi } from '../../lib/backendApi';
import { mockLoans } from '../../data/mockBankingData';
import { useToast } from '../../components/ui/ToastProvider';

interface Loan {
  id: number;
  loan_type: string;
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  emi_amount: number;
  total_payable: number;
  amount_paid: number;
  status: string;
  next_due_date: string;
  purpose: string;
  created_at: string;
  disbursed_at: string | null;
  closed_at: string | null;
}

const loanTypeMeta: Record<string, { label: string; icon: string; color: string }> = {
  personal: { label: 'Personal Loan', icon: 'fa-user', color: 'bg-blue-500' },
  home: { label: 'Home Loan', icon: 'fa-house', color: 'bg-emerald-500' },
  car: { label: 'Car Loan', icon: 'fa-car', color: 'bg-amber-500' },
  education: { label: 'Education Loan', icon: 'fa-graduation-cap', color: 'bg-violet-500' },
  business: { label: 'Business Loan', icon: 'fa-briefcase', color: 'bg-rose-500' },
};

export default function LoanCenter() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [payingEmi, setPayingEmi] = useState<number | null>(null);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    loanType: 'personal',
    principalAmount: '',
    interestRate: '',
    tenureMonths: '',
    purpose: '',
  });

  useEffect(() => { loadLoans(); }, []);

  async function loadLoans() {
    setLoading(true);
    try {
      const res = await backendApi.getLoans();
      const data = res.data?.data;
      if (data && data.length > 0) {
        setLoans(data);
      } else if (!res.ok) {
        // Backend unreachable — use mock data for demo
        setLoans(mockLoans);
      } else {
        setLoans([]);
      }
    } catch {
      setLoans(mockLoans);
    } finally {
      setLoading(false);
    }
  }

  async function handlePayEmi(loanId: number) {
    setPayingEmi(loanId);
    try {
      await backendApi.payLoanEmi(loanId);
      showToast('EMI paid successfully', 'success');
      loadLoans();
    } catch (e: any) {
      showToast(e.message || 'Payment failed', 'error');
    } finally {
      setPayingEmi(null);
    }
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    try {
      await backendApi.createLoan({
        loanType: form.loanType,
        principalAmount: Number(form.principalAmount),
        interestRate: Number(form.interestRate),
        tenureMonths: Number(form.tenureMonths),
        purpose: form.purpose,
      });
      showToast('Loan application submitted', 'success');
      setShowApplyForm(false);
      setForm({ loanType: 'personal', principalAmount: '', interestRate: '', tenureMonths: '', purpose: '' });
      loadLoans();
    } catch (e: any) {
      showToast(e.message || 'Application failed', 'error');
    }
  }

  const totalOutstanding = loans.reduce((sum, l) => sum + (l.total_payable - l.amount_paid), 0);
  const totalEmiMonthly = loans.filter(l => l.status === 'active').reduce((sum, l) => sum + l.emi_amount, 0);
  const activeLoans = loans.filter(l => l.status === 'active');

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
            <i className="fas fa-file-contract text-primary" /> Loan Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage loans, pay EMIs, and apply for new credit</p>
        </div>
        <button
          onClick={() => setShowApplyForm(!showApplyForm)}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus" />
          {showApplyForm ? 'Cancel' : 'Apply for Loan'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-xs opacity-80">Active Loans</p>
          <p className="text-2xl font-bold mt-1">{activeLoans.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-rose-500 to-rose-600 text-white">
          <p className="text-xs opacity-80">Total Outstanding</p>
          <p className="text-2xl font-bold mt-1">₹{totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <p className="text-xs opacity-80">Monthly EMI Outgo</p>
          <p className="text-2xl font-bold mt-1">₹{totalEmiMonthly.toLocaleString()}</p>
        </div>
      </div>

      <AnimatePresence>
        {showApplyForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card border-2 border-primary/20">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">New Loan Application</h3>
              <form onSubmit={handleApply} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Loan Type</label>
                  <select
                    value={form.loanType}
                    onChange={e => setForm(f => ({ ...f, loanType: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="personal">Personal Loan</option>
                    <option value="home">Home Loan</option>
                    <option value="car">Car Loan</option>
                    <option value="education">Education Loan</option>
                    <option value="business">Business Loan</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Principal Amount (₹)</label>
                  <input type="number" value={form.principalAmount}
                    onChange={e => setForm(f => ({ ...f, principalAmount: e.target.value }))}
                    placeholder="500000"
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Interest Rate (% p.a.)</label>
                  <input type="number" step="0.1" value={form.interestRate}
                    onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))}
                    placeholder="11.5"
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Tenure (Months)</label>
                  <input type="number" value={form.tenureMonths}
                    onChange={e => setForm(f => ({ ...f, tenureMonths: e.target.value }))}
                    placeholder="36"
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Purpose</label>
                  <input type="text" value={form.purpose}
                    onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                    placeholder="Home renovation, car purchase, etc."
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm" />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button type="submit" className="px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loans.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-file-contract text-slate-400 text-2xl" />
          </div>
          <h3 className="font-bold text-slate-700 dark:text-slate-300">No Loans Found</h3>
          <p className="text-sm text-slate-500 mt-1">Apply for a loan to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loans.map(loan => {
            const meta = loanTypeMeta[loan.loan_type] || loanTypeMeta.personal;
            const progress = loan.total_payable > 0 ? (loan.amount_paid / loan.total_payable) * 100 : 0;
            const isActive = loan.status === 'active';
            return (
              <motion.div key={loan.id} layout
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedLoan(selectedLoan?.id === loan.id ? null : loan)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${meta.color} rounded-lg flex items-center justify-center text-white`}>
                      <i className={`fas ${meta.icon}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-800 dark:text-white">{meta.label}</p>
                      <p className="text-xs text-slate-500">{loan.purpose || 'General Purpose'}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isActive ? 'bg-emerald-100 text-emerald-700' :
                    loan.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{loan.status.toUpperCase()}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">Principal</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">₹{loan.principal_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">EMI</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">₹{loan.emi_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">Rate</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{loan.interest_rate}%</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>Repaid: ₹{loan.amount_paid.toLocaleString()}</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                {isActive && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      <i className="fas fa-calendar-day mr-1" />
                      Next due: {new Date(loan.next_due_date).toLocaleDateString('en-IN')}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePayEmi(loan.id); }}
                      disabled={payingEmi === loan.id}
                      className="px-4 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {payingEmi === loan.id ? <i className="fas fa-spinner fa-spin" /> : <>Pay EMI ₹{loan.emi_amount.toLocaleString()}</>}
                    </button>
                  </div>
                )}
                <AnimatePresence>
                  {selectedLoan?.id === loan.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-[10px] text-slate-500">Total Payable</p>
                          <p className="font-medium text-slate-800 dark:text-white">₹{loan.total_payable.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Tenure</p>
                          <p className="font-medium text-slate-800 dark:text-white">{loan.tenure_months} months</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Applied On</p>
                          <p className="font-medium text-slate-800 dark:text-white">{new Date(loan.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Loan ID</p>
                          <p className="font-medium text-slate-800 dark:text-white">#{loan.id}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

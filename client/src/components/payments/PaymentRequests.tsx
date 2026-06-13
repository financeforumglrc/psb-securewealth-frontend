import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentRequest {
  id: string;
  from: string;
  amount: number;
  message: string;
  dueDate: string;
  status: 'pending' | 'paid';
}

export default function PaymentRequests() {
  const [requests, setRequests] = useState<PaymentRequest[]>(() => {
    try { return JSON.parse(localStorage.getItem('sw_payment_requests') || '[]'); }
    catch { return []; }
  });
  const [showCreate, setShowCreate] = useState(false);
  const [newReq, setNewReq] = useState({ to: '', amount: '', message: '', dueDate: '' });

  const save = (r: PaymentRequest[]) => {
    setRequests(r);
    localStorage.setItem('sw_payment_requests', JSON.stringify(r));
  };

  const createRequest = () => {
    const amount = parseFloat(newReq.amount);
    if (!newReq.to || !amount) return;
    const req: PaymentRequest = {
      id: 'REQ' + Date.now(),
      from: newReq.to,
      amount,
      message: newReq.message,
      dueDate: newReq.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'pending',
    };
    save([req, ...requests]);
    setNewReq({ to: '', amount: '', message: '', dueDate: '' });
    setShowCreate(false);
  };

  const payRequest = (id: string) => {
    save(requests.map((r) => (r.id === id ? { ...r, status: 'paid' as const } : r)));
  };

  const pending = requests.filter((r) => r.status === 'pending');

  return (
    <div className="card rounded-3xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <i className="fas fa-hand-holding-dollar text-blue-500" />
          Payment Requests
        </h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600"
        >
          {showCreate ? 'Cancel' : 'Request'}
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 mb-4"
          >
            <input
              value={newReq.to}
              onChange={(e) => setNewReq({ ...newReq, to: e.target.value })}
              placeholder="Request from (UPI ID / Name)"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm outline-none dark:text-white"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={newReq.amount}
                onChange={(e) => setNewReq({ ...newReq, amount: e.target.value })}
                placeholder="Amount"
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm outline-none dark:text-white"
              />
              <input
                type="date"
                value={newReq.dueDate}
                onChange={(e) => setNewReq({ ...newReq, dueDate: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm outline-none dark:text-white"
              />
            </div>
            <input
              value={newReq.message}
              onChange={(e) => setNewReq({ ...newReq, message: e.target.value })}
              placeholder="Message (e.g. Dinner last night)"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm outline-none dark:text-white"
            />
            <button onClick={createRequest} className="w-full py-2 bg-blue-500 text-white rounded-lg text-xs font-bold">
              Send Request
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {pending.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">No pending requests</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {pending.map((req) => (
            <motion.div
              key={req.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
            >
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white">{req.from}</p>
                {req.message && <p className="text-[10px] text-slate-400">{req.message}</p>}
                <p className="text-[10px] text-slate-400">Due: {req.dueDate}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 dark:text-white">₹{req.amount}</p>
                <button
                  onClick={() => payRequest(req.id)}
                  className="mt-1 px-3 py-1 bg-green-500 text-white rounded-lg text-[10px] font-bold hover:bg-green-600"
                >
                  Pay
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

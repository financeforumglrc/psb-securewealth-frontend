import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { backendApi } from '@/shared/lib/backendApi';
import { mockAuditLogs } from '@/shared/data/mockBankingData';


interface AuditEntry {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

const actionMeta: Record<string, { icon: string; color: string; label: string }> = {
  CREATE: { icon: 'fa-plus', color: 'text-emerald-500 bg-emerald-50', label: 'Created' },
  UPDATE: { icon: 'fa-pen', color: 'text-blue-500 bg-blue-50', label: 'Updated' },
  DELETE: { icon: 'fa-trash', color: 'text-rose-500 bg-rose-50', label: 'Deleted' },
  TRANSFER: { icon: 'fa-right-left', color: 'text-violet-500 bg-violet-50', label: 'Transfer' },
  LOGIN: { icon: 'fa-sign-in-alt', color: 'text-amber-500 bg-amber-50', label: 'Login' },
  LOGOUT: { icon: 'fa-sign-out-alt', color: 'text-gray-500 bg-gray-50', label: 'Logout' },
  PAYMENT: { icon: 'fa-credit-card', color: 'text-primary bg-primary/5', label: 'Payment' },
  SEED: { icon: 'fa-database', color: 'text-teal-500 bg-teal-50', label: 'Seed' },
};

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');

  useEffect(() => { loadLogs(); }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await backendApi.getAuditLogs(200);
      const data = res.data?.data;
      if (data && data.length > 0) {
        setLogs(data);
      } else if (!res.ok) {
        setLogs(mockAuditLogs.map(l => ({ ...l, entity_type: l.entity })) as any);
      } else {
        setLogs([]);
      }
    } catch {
      setLogs(mockAuditLogs.map(l => ({ ...l, entity_type: l.entity })) as any);
    } finally {
      setLoading(false);
    }
  }

  const filtered = logs.filter(l => {
    const actionMatch = !filterAction || l.action === filterAction;
    const entityMatch = !filterEntity || l.entity_type === filterEntity;
    return actionMatch && entityMatch;
  });

  const actions = Array.from(new Set(logs.map(l => l.action)));
  const entities = Array.from(new Set(logs.map(l => l.entity_type)));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-shield-halved text-primary" /> Audit Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Immutable trail of all balance-changing operations</p>
        </div>
        <button onClick={loadLogs}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2">
          <i className="fas fa-rotate-right" /> Refresh
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Action</label>
            <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
              className="w-40 mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm">
              <option value="">All Actions</option>
              {actions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Entity</label>
            <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)}
              className="w-40 mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm">
              <option value="">All Entities</option>
              {entities.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <button onClick={() => { setFilterAction(''); setFilterEntity(''); }}
            className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors">
            Clear Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{logs.length}</p>
          <p className="text-[10px] text-slate-500 uppercase mt-1">Total Events</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-emerald-600">{logs.filter(l => l.action === 'CREATE').length}</p>
          <p className="text-[10px] text-slate-500 uppercase mt-1">Creations</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-violet-600">{logs.filter(l => l.action === 'TRANSFER').length}</p>
          <p className="text-[10px] text-slate-500 uppercase mt-1">Transfers</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-rose-600">{logs.filter(l => l.action === 'DELETE').length}</p>
          <p className="text-[10px] text-slate-500 uppercase mt-1">Deletions</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-shield-halved text-slate-400 text-2xl" />
          </div>
          <h3 className="font-bold text-slate-700 dark:text-slate-300">No Audit Events</h3>
          <p className="text-sm text-slate-500 mt-1">Audit trail is empty or filters are too restrictive</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry, idx) => {
            const meta = actionMeta[entry.action] || { icon: 'fa-circle', color: 'text-gray-500 bg-gray-50', label: entry.action };
            let details: any = {};
            try { details = JSON.parse(entry.details); } catch { details = { note: entry.details }; }
            return (
              <motion.div key={entry.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }}
                className="card flex items-start gap-4 py-3 hover:shadow-md transition-shadow">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                  <i className={`fas ${meta.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">{entry.action}</span>
                    <span className="text-[10px] text-slate-400">{entry.entity_type} #{entry.entity_id}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
                    {details.description || details.note || entry.details.slice(0, 100)}
                  </p>
                  {details.amount && <p className="text-xs text-slate-500 mt-0.5">Amount: ₹{details.amount.toLocaleString?.() || details.amount}</p>}
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                    <span><i className="fas fa-clock mr-1" />{new Date(entry.created_at).toLocaleString('en-IN')}</span>
                    <span><i className="fas fa-network-wired mr-1" />{entry.ip_address}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

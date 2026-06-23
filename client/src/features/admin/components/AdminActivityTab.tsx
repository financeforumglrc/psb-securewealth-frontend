import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, UserCog, ShieldCheck, ShieldOff, UserX, Trash2, CheckCheck, RefreshCw } from 'lucide-react';
import { adminActivityService, type AdminActivity } from '@/shared/services/adminActivityService';

const actionIcons: Record<string, React.ElementType> = {
  'Acknowledge Alert': CheckCheck,
  'Acknowledge All': CheckCheck,
  'Block User': UserX,
  'Whitelist IP': ShieldCheck,
  'Mark False Positive': ShieldOff,
  'Clear All Alerts': Trash2,
  'Role Switched': UserCog,
};

const actionColors: Record<string, string> = {
  'Acknowledge Alert': 'text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
  'Acknowledge All': 'text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
  'Block User': 'text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
  'Whitelist IP': 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  'Mark False Positive': 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-700',
  'Clear All Alerts': 'text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
  'Role Switched': 'text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
};

function fmtTime(ts: string) {
  return new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function AdminActivityTab() {
  const [activities, setActivities] = useState<AdminActivity[]>([]);

  useEffect(() => {
    const unsub = adminActivityService.subscribe(setActivities);
    return () => { unsub(); };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Activity</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Audit trail of actions performed in the admin portal</p>
        </div>
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl">
          {activities.length} events logged
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 dark:bg-slate-800/50/50 dark:bg-slate-800/50 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Activity Feed</span>
        </div>
        <div className="max-h-[600px] overflow-y-auto p-2 space-y-1">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-slate-400 dark:text-slate-500">
              <ClipboardList className="w-10 h-10 opacity-50" />
              <p className="text-sm font-medium">No admin activity yet</p>
            </div>
          ) : (
            activities.map((a, idx) => {
              const Icon = actionIcons[a.action] || ClipboardList;
              const colors = actionColors[a.action] || 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-700';
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:bg-slate-900/20 dark:hover:bg-slate-800/50 dark:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:border-slate-800"
                >
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${colors}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{a.action}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium">{a.role}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.target}{a.details ? ` · ${a.details}` : ''}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">{fmtTime(a.timestamp)}</span>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}

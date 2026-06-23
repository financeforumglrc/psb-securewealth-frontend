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
  'Acknowledge Alert': 'text-emerald-600 bg-emerald-50 border-emerald-200',
  'Acknowledge All': 'text-emerald-600 bg-emerald-50 border-emerald-200',
  'Block User': 'text-rose-600 bg-rose-50 border-rose-200',
  'Whitelist IP': 'text-blue-600 bg-blue-50 border-blue-200',
  'Mark False Positive': 'text-slate-600 bg-slate-100 border-slate-200',
  'Clear All Alerts': 'text-rose-600 bg-rose-50 border-rose-200',
  'Role Switched': 'text-amber-600 bg-amber-50 border-amber-200',
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
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Admin Activity</h2>
          </div>
          <p className="text-sm text-slate-500">Audit trail of actions performed in the admin portal</p>
        </div>
        <div className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-xl">
          {activities.length} events logged
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Activity Feed</span>
        </div>
        <div className="max-h-[600px] overflow-y-auto p-2 space-y-1">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-slate-400">
              <ClipboardList className="w-10 h-10 opacity-50" />
              <p className="text-sm font-medium">No admin activity yet</p>
            </div>
          ) : (
            activities.map((a, idx) => {
              const Icon = actionIcons[a.action] || ClipboardList;
              const colors = actionColors[a.action] || 'text-slate-600 bg-slate-100 border-slate-200';
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                >
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${colors}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-800">{a.action}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">{a.role}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{a.target}{a.details ? ` · ${a.details}` : ''}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{fmtTime(a.timestamp)}</span>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}

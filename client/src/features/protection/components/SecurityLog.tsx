import { useState, useEffect } from 'react';
import { getAuditLogs, exportAuditLogs, clearAuditLogs } from '@/shared/utils/auditLogger';

interface Props {
  refreshTrigger?: number;
}

export default function SecurityLog({ refreshTrigger }: Props) {
  const [logs, setLogs] = useState(getAuditLogs());

  function refresh() {
    setLogs(getAuditLogs());
  }

  useEffect(() => {
    refresh();
  }, [refreshTrigger]);

  function exportLogs() {
    const blob = new Blob([exportAuditLogs()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-white">
          <i className="fas fa-clipboard-list text-primary mr-2" /> Security Audit Log
        </h3>
        <div className="flex gap-2">
          <button onClick={refresh} className="text-xs px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
            <i className="fas fa-rotate mr-1" /> Refresh
          </button>
          <button onClick={exportLogs} className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90">
            <i className="fas fa-download mr-1" /> Export
          </button>
        </div>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {logs.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">No audit records yet. Run a fraud simulation to generate logs.</p>
        )}
        {logs.map((log, i) => {
          const active = Object.entries(log.signals).filter(([, v]) => v).map(([k]) => k.replace(/([A-Z])/g, ' $1'));
          const isEmergency = log.action.includes('Emergency lockdown');
          return (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg text-xs ${isEmergency ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
              <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${isEmergency ? 'bg-rose-500 animate-pulse' : log.decision.level === 'LOW' ? 'bg-emerald-500' : log.decision.level === 'MEDIUM' ? 'bg-amber-500' : 'bg-rose-500'}`} />
              <div className="flex-1">
                <p className={`font-medium ${isEmergency ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>
                  {isEmergency && <i className="fas fa-shield-halved mr-1" />}
                  {log.action}
                </p>
                <p className="text-slate-400 mt-0.5">{new Date(log.timestamp).toLocaleString('en-IN')} • Ref: {log.decision.referenceId}</p>
                <p className="text-slate-500 mt-1">Score: {log.score}/100 • Decision: {log.decision.level} ({log.decision.action})</p>
                {active.length > 0 && !isEmergency && (
                  <p className="text-rose-500 dark:text-rose-400 mt-1">
                    <i className="fas fa-triangle-exclamation mr-1" />Signals: {active.join(', ')}
                  </p>
                )}
                {isEmergency && (
                  <p className="text-rose-500 dark:text-rose-400 mt-1 text-[10px] uppercase tracking-wider font-semibold">
                    <i className="fas fa-lock mr-1" />Account Frozen • Contact Notified
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {logs.length > 0 && (
        <button onClick={() => { clearAuditLogs(); refresh(); }} className="mt-3 text-[10px] text-rose-500 hover:text-rose-600">
          Clear All Logs
        </button>
      )}
    </div>
  );
}

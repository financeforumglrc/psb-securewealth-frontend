import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, FileText, Link2, Zap } from 'lucide-react';

interface I4CCase {
  id: string;
  caseId: string;
  type: string;
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  amount: number;
  date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const I4C_CASES: I4CCase[] = [
  {
    id: '1',
    caseId: 'I4C-2026-001234',
    type: 'Online Fraud',
    status: 'investigating',
    amount: 250000,
    date: '2026-07-20',
    priority: 'high',
  },
  {
    id: '2',
    caseId: 'I4C-2026-001235',
    type: 'SIM Swap',
    status: 'reported',
    amount: 500000,
    date: '2026-07-21',
    priority: 'critical',
  },
  {
    id: '3',
    caseId: 'I4C-2026-001236',
    type: 'Phishing',
    status: 'resolved',
    amount: 75000,
    date: '2026-07-19',
    priority: 'medium',
  },
];

function statusColor(status: string) {
  if (status === 'reported') return 'bg-amber-500';
  if (status === 'investigating') return 'bg-blue-500';
  if (status === 'resolved') return 'bg-emerald-500';
  return 'bg-slate-500';
}

function priorityColor(priority: string) {
  if (priority === 'critical') return 'text-rose-600';
  if (priority === 'high') return 'text-amber-600';
  if (priority === 'medium') return 'text-yellow-600';
  return 'text-emerald-600';
}

export default function I4CIntegration() {
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'report'>('overview');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" /> I4C Integration
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Indian Cyber Crime Coordination Centre (I4C) integration for fraud reporting and tracking.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'cases', label: 'I4C Cases' },
          { id: 'report', label: 'Report to I4C' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 text-xs font-bold rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* I4C Info */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-indigo-800 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black">I4C Integration Active</h3>
                <p className="text-xs text-white/70">Connected to Indian Cyber Crime Coordination Centre</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Active Cases', value: '3' },
                { label: 'Resolved', value: '98%' },
                { label: 'Response Time', value: '2.4h' },
                { label: 'Success Rate', value: '94%' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-lg font-black text-white">{stat.value}</p>
                  <p className="text-[10px] text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { title: 'Automatic Reporting', desc: 'FRI-4 and MRI-4 cases automatically reported to I4C', icon: Zap },
              { title: 'Real-time Tracking', desc: 'Track case status and investigation progress', icon: FileText },
              { title: 'Direct Communication', desc: 'Secure channel with I4C for case updates', icon: Link2 },
              { title: 'Compliance', desc: 'Meets government guidelines for fraud reporting', icon: CheckCircle2 },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{feature.title}</span>
                  </div>
                  <p className="text-xs text-slate-500">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Cases Tab */}
      {activeTab === 'cases' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {I4C_CASES.map((caseItem) => (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${statusColor(caseItem.status)}`} />
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{caseItem.caseId}</span>
                </div>
                <span className={`text-xs font-bold ${priorityColor(caseItem.priority)}`}>
                  {caseItem.priority.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-slate-400">Type</p>
                  <p className="font-bold text-slate-800 dark:text-white">{caseItem.type}</p>
                </div>
                <div>
                  <p className="text-slate-400">Amount</p>
                  <p className="font-bold text-slate-800 dark:text-white">₹{caseItem.amount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-slate-400">Date</p>
                  <p className="font-bold text-slate-800 dark:text-white">{caseItem.date}</p>
                </div>
                <div>
                  <p className="text-slate-400">Status</p>
                  <p className="font-bold text-slate-800 dark:text-white capitalize">{caseItem.status}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Report Tab */}
      {activeTab === 'report' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-black text-slate-800 dark:text-white mb-3">Report Fraud to I4C</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 font-bold block mb-1">Fraud Type</label>
                <select className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white">
                  <option>Online Fraud</option>
                  <option>SIM Swap</option>
                  <option>Phishing</option>
                  <option>Card Skimming</option>
                  <option>Account Takeover</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold block mb-1">Description</label>
                <textarea
                  placeholder="Describe the fraud incident..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white"
                />
              </div>
              <button className="w-full py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700">
                Report to I4C
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Important</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              FRI-4 and MRI-4 cases are automatically reported to I4C. Manual reporting is for additional cases or supplementary information.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

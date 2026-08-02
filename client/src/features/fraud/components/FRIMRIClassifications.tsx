import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, XCircle, FileText, BarChart3 } from 'lucide-react';

interface FraudClassification {
  id: string;
  code: string;
  name: string;
  description: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  examples: string[];
}

const FRI_CLASSIFICATIONS: FraudClassification[] = [
  {
    id: 'fri-1',
    code: 'FRI-1',
    name: 'Low Risk Fraud',
    description: 'Minor suspicious activity, no financial loss',
    level: 'low',
    action: 'Monitor and log',
    examples: ['Unusual login time', 'Small amount transfer'],
  },
  {
    id: 'fri-2',
    code: 'FRI-2',
    name: 'Medium Risk Fraud',
    description: 'Moderate suspicious activity, potential financial loss',
    level: 'medium',
    action: 'Warn and verify',
    examples: ['New device login', 'Unusual recipient'],
  },
  {
    id: 'fri-3',
    code: 'FRI-3',
    name: 'High Risk Fraud',
    description: 'Serious suspicious activity, likely financial loss',
    level: 'high',
    action: 'Delay and investigate',
    examples: ['Large transfer to unknown', 'Multiple failed attempts'],
  },
  {
    id: 'fri-4',
    code: 'FRI-4',
    name: 'Critical Risk Fraud',
    description: 'Severe fraudulent activity, confirmed financial loss',
    level: 'critical',
    action: 'Block and report',
    examples: ['Account takeover', 'Coerced transaction'],
  },
];

const MRI_CLASSIFICATIONS: FraudClassification[] = [
  {
    id: 'mri-1',
    code: 'MRI-1',
    name: 'Minor Money Risk',
    description: 'Small amount at risk, recoverable',
    level: 'low',
    action: 'Track and recover',
    examples: ['Small unauthorized charge', 'Duplicate payment'],
  },
  {
    id: 'mri-2',
    code: 'MRI-2',
    name: 'Moderate Money Risk',
    description: 'Medium amount at risk, partially recoverable',
    level: 'medium',
    action: 'Freeze and investigate',
    examples: ['Medium transfer fraud', 'Card skimming'],
  },
  {
    id: 'mri-3',
    code: 'MRI-3',
    name: 'Major Money Risk',
    description: 'Large amount at risk, difficult to recover',
    level: 'high',
    action: 'Block and escalate',
    examples: ['Large investment scam', 'Property fraud'],
  },
  {
    id: 'mri-4',
    code: 'MRI-4',
    name: 'Critical Money Risk',
    description: 'Very large amount at risk, likely unrecoverable',
    level: 'critical',
    action: 'Immediate block and report to I4C',
    examples: ['Corporate account takeover', 'Large scale fraud'],
  },
];

function levelColor(level: string) {
  if (level === 'critical') return 'bg-rose-500';
  if (level === 'high') return 'bg-amber-500';
  if (level === 'medium') return 'bg-yellow-500';
  return 'bg-emerald-500';
}

function levelText(level: string) {
  if (level === 'critical') return 'text-rose-600';
  if (level === 'high') return 'text-amber-600';
  if (level === 'medium') return 'text-yellow-600';
  return 'text-emerald-600';
}

export default function FRIMRIClassifications() {
  const [activeTab, setActiveTab] = useState<'fri' | 'mri'>('fri');

  const classifications = activeTab === 'fri' ? FRI_CLASSIFICATIONS : MRI_CLASSIFICATIONS;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" /> FRI & MRI Fraud Classifications
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Government guidelines for fraud classification: FRI (Fraud Risk Indicator) and MRI (Money Risk Indicator).</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('fri')}
          className={`flex-1 px-4 py-2 text-xs font-bold rounded-md transition-colors ${
            activeTab === 'fri'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
              : 'text-slate-500'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-1" />
          FRI (Fraud Risk Indicator)
        </button>
        <button
          onClick={() => setActiveTab('mri')}
          className={`flex-1 px-4 py-2 text-xs font-bold rounded-md transition-colors ${
            activeTab === 'mri'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
              : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-1" />
          MRI (Money Risk Indicator)
        </button>
      </div>

      {/* Classifications */}
      <div className="space-y-3">
        {classifications.map((classification) => (
          <motion.div
            key={classification.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${levelColor(classification.level)} flex items-center justify-center`}>
                  <span className="text-white text-xs font-black">{classification.code.split('-')[1]}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{classification.name}</p>
                  <p className="text-xs text-slate-500">{classification.description}</p>
                </div>
              </div>
              <span className={`text-xs font-bold ${levelText(classification.level)}`}>
                {classification.level.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Action Required</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white">{classification.action}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Examples</p>
                <div className="flex flex-wrap gap-1">
                  {classification.examples.map((example, i) => (
                    <span key={i} className="text-xs text-slate-600 dark:text-slate-400">
                      {example}{i < classification.examples.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Government Guidelines */}
      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
        <h3 className="text-sm font-black text-indigo-800 dark:text-indigo-300 mb-2">Government Guidelines</h3>
        <div className="space-y-2 text-xs text-indigo-600 dark:text-indigo-400">
          <p>• FRI and MRI classifications are mandatory for all banking institutions in India.</p>
          <p>• All fraud cases must be classified and reported to I4C (Indian Cyber Crime Coordination Centre).</p>
          <p>• FRI-4 and MRI-4 cases require immediate reporting and blocking.</p>
          <p>• Regular audits ensure compliance with RBI and government guidelines.</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Cases', value: '1,245', icon: FileText, color: 'text-blue-600' },
          { label: 'FRI-4 Critical', value: '23', icon: AlertTriangle, color: 'text-rose-600' },
          { label: 'MRI-4 Critical', value: '18', icon: XCircle, color: 'text-rose-600' },
          { label: 'Resolved', value: '98%', icon: CheckCircle2, color: 'text-emerald-600' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[10px] text-slate-400 uppercase font-bold">{stat.label}</span>
              </div>
              <p className="text-lg font-black text-slate-800 dark:text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

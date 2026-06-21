import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProactiveInstrument {
  id: string;
  name: string;
  type: 'SIP' | 'RD' | 'Insurance' | 'FD' | 'Emergency Fund' | 'NPS';
  monthlyAmount: number;
  targetCorpus: number;
  timeline: string;
  triggeredBy: string;
  status: 'recommended' | 'auto-created' | 'active';
  bank: string;
  interestRate: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  taxBenefit: string;
  icon: string;
  color: string;
}

const INSTRUMENTS: ProactiveInstrument[] = [
  {
    id: 'pi-1',
    name: 'Child Education SIP',
    type: 'SIP',
    monthlyAmount: 45000,
    targetCorpus: 2500000,
    timeline: '14 months to goal',
    triggeredBy: 'Predicted education need in Aug 2027',
    status: 'recommended',
    bank: 'PSB Mutual Fund',
    interestRate: '12.4% CAGR (est.)',
    riskLevel: 'Medium',
    taxBenefit: 'ELSS eligible — ₹1.5L/year under 80C',
    icon: 'fa-graduation-cap',
    color: '#2196F3',
  },
  {
    id: 'pi-2',
    name: 'Family Health Buffer',
    type: 'Emergency Fund',
    monthlyAmount: 15000,
    targetCorpus: 500000,
    timeline: '8 months to build',
    triggeredBy: '67% probability of medical event detected',
    status: 'auto-created',
    bank: 'PSB Savings',
    interestRate: '4.5% p.a.',
    riskLevel: 'Low',
    taxBenefit: 'Interest exempt up to ₹10,000',
    icon: 'fa-kit-medical',
    color: '#EF4444',
  },
  {
    id: 'pi-3',
    name: 'Home Down-Payment RD Ladder',
    type: 'RD',
    monthlyAmount: 25000,
    targetCorpus: 1200000,
    timeline: '22 months to goal',
    triggeredBy: 'Home purchase opportunity predicted for Jun 2028',
    status: 'recommended',
    bank: 'PSB Recurring Deposit',
    interestRate: '7.2% p.a.',
    riskLevel: 'Low',
    taxBenefit: 'TDS applicable above ₹40,000 interest',
    icon: 'fa-house',
    color: '#10B981',
  },
  {
    id: 'pi-4',
    name: 'Retirement NPS Tier-I',
    type: 'NPS',
    monthlyAmount: 8000,
    targetCorpus: 45000000,
    timeline: '28 years to retirement',
    triggeredBy: 'Retirement corpus gap detected in projection',
    status: 'active',
    bank: 'PSB Pension Fund',
    interestRate: '10.8% CAGR (est.)',
    riskLevel: 'Medium',
    taxBenefit: 'Additional ₹50,000 under 80CCD(1B)',
    icon: 'fa-umbrella-beach',
    color: '#8B5CF6',
  },
  {
    id: 'pi-5',
    name: 'Career Gap Insurance',
    type: 'Insurance',
    monthlyAmount: 3200,
    targetCorpus: 900000,
    timeline: 'Coverage: 6 months income',
    triggeredBy: '52% probability of career transition detected',
    status: 'recommended',
    bank: 'PSB Life Insurance',
    interestRate: 'N/A',
    riskLevel: 'Low',
    taxBenefit: 'Premium eligible under 80C',
    icon: 'fa-briefcase',
    color: '#F59E0B',
  },
];

const STATUS_CONFIG = {
  recommended: { label: 'AI Recommended', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100' },
  'auto-created': { label: 'Auto-Created', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', badge: 'bg-green-100' },
  active: { label: 'Active', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', badge: 'bg-violet-100' },
};

const RISK_COLORS = {
  Low: '#10B981',
  Medium: '#F59E0B',
  High: '#EF4444',
};

export default function AutoInstrumentGenerator() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? INSTRUMENTS : INSTRUMENTS.filter(i => i.status === filter);

  const totalMonthly = INSTRUMENTS.reduce((sum, i) => sum + i.monthlyAmount, 0);
  const activeMonthly = INSTRUMENTS.filter(i => i.status === 'active' || i.status === 'auto-created').reduce((sum, i) => sum + i.monthlyAmount, 0);

  return (
    <div className="card-psb">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <i className="fas fa-robot text-emerald-600" /> Proactive Instrument Generator
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            AI auto-creates financial instruments before you need them — world's first predictive banking
          </p>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="mt-3 grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10 text-center">
          <p className="text-lg font-extrabold text-primary">{INSTRUMENTS.length}</p>
          <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wide">Instruments Ready</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-100 text-center">
          <p className="text-lg font-extrabold text-emerald-700">₹{activeMonthly.toLocaleString()}</p>
          <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wide">Auto-Committed/Month</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-100 text-center">
          <p className="text-lg font-extrabold text-amber-700">₹{totalMonthly.toLocaleString()}</p>
          <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wide">Recommended/Month</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['all', 'recommended', 'auto-created', 'active'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : STATUS_CONFIG[f as keyof typeof STATUS_CONFIG].label}
          </button>
        ))}
      </div>

      {/* Instrument Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((inst, idx) => {
            const status = STATUS_CONFIG[inst.status];
            const isOpen = selected === inst.id;
            return (
              <motion.div
                key={inst.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-xl border transition-all duration-200 ${
                  isOpen ? 'border-gray-300 shadow-md' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div
                  className="p-3 cursor-pointer"
                  onClick={() => setSelected(isOpen ? null : inst.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: inst.color + '12' }}
                      >
                        <i className={`fas ${inst.icon}`} style={{ color: inst.color, fontSize: '15px' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-gray-800">{inst.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${status.badge} ${status.text}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          <i className="fas fa-wand-magic-sparkles text-violet-400 mr-1" />
                          {inst.triggeredBy}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-gray-900">₹{inst.monthlyAmount.toLocaleString()}</p>
                      <p className="text-[9px] text-gray-400">/month</p>
                    </div>
                  </div>

                  {/* Quick stats row */}
                  <div className="flex items-center gap-4 mt-2.5 text-[10px] text-gray-500">
                    <span><i className="fas fa-bullseye mr-1" />₹{(inst.targetCorpus / 1e5).toFixed(1)}L target</span>
                    <span><i className="fas fa-clock mr-1" />{inst.timeline}</span>
                    <span>
                      <i className="fas fa-shield-halved mr-1" style={{ color: RISK_COLORS[inst.riskLevel] }} />
                      {inst.riskLevel} Risk
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-dashed border-gray-200"
                    >
                      <div className="p-3 grid grid-cols-2 gap-3">
                        <div className="p-2.5 bg-gray-50 rounded-lg">
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide">Provider</p>
                          <p className="text-[11px] font-semibold text-gray-700">{inst.bank}</p>
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded-lg">
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide">Expected Returns</p>
                          <p className="text-[11px] font-semibold text-gray-700">{inst.interestRate}</p>
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded-lg">
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide">Tax Benefit</p>
                          <p className="text-[11px] font-semibold text-gray-700">{inst.taxBenefit}</p>
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded-lg">
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide">Risk Level</p>
                          <p className="text-[11px] font-semibold" style={{ color: RISK_COLORS[inst.riskLevel] }}>
                            {inst.riskLevel}
                          </p>
                        </div>
                      </div>
                      <div className="px-3 pb-3 flex gap-2">
                        {inst.status === 'recommended' && (
                          <button className="flex-1 py-2 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary-dark transition-colors">
                            <i className="fas fa-check mr-1" /> Activate Now
                          </button>
                        )}
                        {inst.status === 'auto-created' && (
                          <button className="flex-1 py-2 bg-emerald-600 text-white text-[11px] font-bold rounded-lg">
                            <i className="fas fa-check-circle mr-1" /> Already Active
                          </button>
                        )}
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-[11px] font-bold rounded-lg hover:bg-gray-50 transition-colors">
                          <i className="fas fa-pen mr-1" /> Customize
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

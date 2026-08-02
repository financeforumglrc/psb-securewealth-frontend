import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  ShieldCheck,
  Eye,
  Scale,
  Building2,
  User,
  AlertTriangle,
  CheckCircle2,
  RefreshCcw,
  Landmark,
  ArrowRight,
  Sparkles,
  FileText,
  TrendingUp,
  BarChart3,
  Download,
  Gavel,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Filter,
  Percent,
  Calendar,
  IndianRupee,
  BadgeCheck,
  X,
  Zap,
  AlertOctagon,
  Smile,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useToast } from '@/shared/components/ui/ToastProvider';
import CosmosCard from '@/shared/components/ui/CosmosCard';
import type { ScoreResult, ScoreFactor, RetailInputs, MSMEInputs, ReasonCode } from '@/features/credit/services/creditBridgeEngine';
import type { ReviewCase, ConsentItem, ScorecardItem } from '@/features/credit/services/ethicsEngine';
import type { MatchedOffer, LoanPurpose } from '@/features/credit/services/lenderMarketplace';
import {
  calculateResult,
  formatINR,
  getBand,
  generateReasonCodes,
  calculateCounterfactual,
  calculateBureauOnlyScore,
  calculateConfidence,
  buildWaterfall,
  estimateCoverageGain,
} from '@/features/credit/services/creditBridgeEngine';
import {
  generateAdverseActionNotice,
  generateSampleReviewQueue,
  getConsentLedger,
  calculateAccountabilityScorecard,
  GOVERNANCE_INFO,
} from '@/features/credit/services/ethicsEngine';
import {
  matchProducts,
  calculateEMI,
} from '@/features/credit/services/lenderMarketplace';

const CHART_COLORS = [
  '#1e40af',
  '#2563eb',
  '#3b82f6',
  '#60a5fa',
  '#93c5fd',
  '#f59e0b',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#6366f1',
];

const RETAIL_DEFAULTS: RetailInputs = {
  monthlyIncome: 45000,
  incomeStability: 'salaried',
  existingEmis: 8000,
  creditUtilization: 35,
  paymentHistory: 90,
  bankingVintage: 36,
  upiVolume: 25000,
  upiConsistency: 80,
  savingsRate: 15,
  employmentTenure: 24,
  age: 32,
  hasBureauScore: false,
  bureauScore: 650,
};

const MSME_DEFAULTS: MSMEInputs = {
  businessVintage: 48,
  annualTurnover: 2500000,
  gstFiling: 'quarterly',
  gstGrowth: 15,
  digitalPaymentShare: 40,
  avgBankBalance: 300000,
  receivablesCycle: 45,
  sector: 'manufacturing',
  existingLoans: 1,
  udyamRegistered: true,
  hasCollateral: true,
  womenLed: false,
};

function SectionTitle({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
  );
}

function Gauge({ score }: { score: number }) {
  const radius = 80;
  const stroke = 14;
  const normalizedScore = (score - 300) / 600;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - normalizedScore);
  const band = getBand(score);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="220" height="130" viewBox="0 0 220 130" className="overflow-visible">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path d="M 30 110 A 80 80 0 0 1 190 110" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth={stroke} strokeLinecap="round" />
        <motion.path
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          d="M 30 110 A 80 80 0 0 1 190 110"
          fill="none"
          stroke={band.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          filter="url(#glow)"
        />
      </svg>
      <div className="absolute top-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="text-5xl font-bold text-slate-800 dark:text-white tabular-nums"
        >
          {score}
        </motion.div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">CreditBridge Score</div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  unit?: string;
  hint?: string;
}) {
  const display = unit === '₹' ? formatINR(value) : `${value}${unit ?? ''}`;
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</label>
        <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
      />
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
}) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${checked ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function RetailForm({ inputs, setInputs }: { inputs: RetailInputs; setInputs: React.Dispatch<React.SetStateAction<RetailInputs>> }) {
  const update = <K extends keyof RetailInputs>(key: K, val: RetailInputs[K]) => setInputs((p) => ({ ...p, [key]: val }));
  return (
    <div className="grid md:grid-cols-2 gap-x-8">
      <div>
        <Slider label="Monthly Income" value={inputs.monthlyIncome} min={10000} max={500000} step={5000} unit="₹" onChange={(v) => update('monthlyIncome', v)} hint="Gross monthly income" />
        <Select label="Income Stability" value={inputs.incomeStability} options={[
          { value: 'salaried', label: 'Salaried' },
          { value: 'self-employed', label: 'Self-employed' },
          { value: 'gig', label: 'Gig / Freelance' },
          { value: 'unemployed', label: 'Unemployed / Irregular' },
        ]} onChange={(v) => update('incomeStability', v as RetailInputs['incomeStability'])} />
        <Slider label="Existing EMIs" value={inputs.existingEmis} min={0} max={200000} step={1000} unit="₹" onChange={(v) => update('existingEmis', v)} hint="Total monthly EMI outgo" />
        <Slider label="Credit Utilization" value={inputs.creditUtilization} min={0} max={100} step={5} unit="%" onChange={(v) => update('creditUtilization', v)} hint="% of credit limit used" />
        <Slider label="Payment History (On-time %)" value={inputs.paymentHistory} min={0} max={100} step={5} unit="%" onChange={(v) => update('paymentHistory', v)} />
      </div>
      <div>
        <Slider label="Banking Vintage" value={inputs.bankingVintage} min={0} max={240} step={6} unit=" mo" onChange={(v) => update('bankingVintage', v)} hint="Months with primary bank" />
        <Slider label="Monthly UPI Volume" value={inputs.upiVolume} min={0} max={200000} step={5000} unit="₹" onChange={(v) => update('upiVolume', v)} hint="Digital transaction footprint" />
        <Slider label="UPI Consistency" value={inputs.upiConsistency} min={0} max={100} step={5} unit="%" onChange={(v) => update('upiConsistency', v)} hint="% months with active UPI usage" />
        <Slider label="Savings Rate" value={inputs.savingsRate} min={0} max={60} step={2} unit="%" onChange={(v) => update('savingsRate', v)} hint="% of income saved/invested" />
        <Slider label="Employment Tenure" value={inputs.employmentTenure} min={0} max={240} step={6} unit=" mo" onChange={(v) => update('employmentTenure', v)} />
        <Slider label="Age" value={inputs.age} min={18} max={70} step={1} unit=" yrs" onChange={(v) => update('age', v)} />
        <Toggle label="I have a bureau/CIBIL score" checked={inputs.hasBureauScore} onChange={(v) => update('hasBureauScore', v)} />
        {inputs.hasBureauScore && (
          <Slider label="Bureau Score" value={inputs.bureauScore} min={300} max={900} step={1} unit="" onChange={(v) => update('bureauScore', v)} hint="Optional — alternate data works without this" />
        )}
      </div>
    </div>
  );
}

function MSMEForm({ inputs, setInputs }: { inputs: MSMEInputs; setInputs: React.Dispatch<React.SetStateAction<MSMEInputs>> }) {
  const update = <K extends keyof MSMEInputs>(key: K, val: MSMEInputs[K]) => setInputs((p) => ({ ...p, [key]: val }));
  return (
    <div className="grid md:grid-cols-2 gap-x-8">
      <div>
        <Slider label="Business Vintage" value={inputs.businessVintage} min={0} max={360} step={6} unit=" mo" onChange={(v) => update('businessVintage', v)} />
        <Slider label="Annual Turnover" value={inputs.annualTurnover} min={100000} max={50000000} step={100000} unit="₹" onChange={(v) => update('annualTurnover', v)} />
        <Select label="GST Filing Regularity" value={inputs.gstFiling} options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'quarterly', label: 'Quarterly' },
          { value: 'irregular', label: 'Irregular' },
          { value: 'none', label: 'No GST filing' },
        ]} onChange={(v) => update('gstFiling', v as MSMEInputs['gstFiling'])} />
        <Slider label="GST Turnover Growth" value={inputs.gstGrowth} min={-20} max={100} step={1} unit="%" onChange={(v) => update('gstGrowth', v)} hint="Year-over-year GST turnover growth" />
        <Slider label="Digital Payment Share" value={inputs.digitalPaymentShare} min={0} max={100} step={5} unit="%" onChange={(v) => update('digitalPaymentShare', v)} />
      </div>
      <div>
        <Slider label="Avg Bank Balance" value={inputs.avgBankBalance} min={0} max={5000000} step={25000} unit="₹" onChange={(v) => update('avgBankBalance', v)} />
        <Slider label="Receivables Cycle" value={inputs.receivablesCycle} min={0} max={180} step={5} unit=" days" onChange={(v) => update('receivablesCycle', v)} hint="Average days to collect payments" />
        <Select label="Sector" value={inputs.sector} options={[
          { value: 'manufacturing', label: 'Manufacturing' },
          { value: 'services', label: 'Services / IT' },
          { value: 'trading', label: 'Trading' },
          { value: 'agriculture', label: 'Agriculture / Food' },
          { value: 'construction', label: 'Construction' },
          { value: 'hospitality', label: 'Hospitality' },
        ]} onChange={(v) => update('sector', v as MSMEInputs['sector'])} />
        <Slider label="Existing Loans" value={inputs.existingLoans} min={0} max={10} step={1} unit="" onChange={(v) => update('existingLoans', v)} />
        <Toggle label="Udyam Registered" checked={inputs.udyamRegistered} onChange={(v) => update('udyamRegistered', v)} />
        <Toggle label="Collateral Available" checked={inputs.hasCollateral} onChange={(v) => update('hasCollateral', v)} />
        <Toggle label="Women-Led Enterprise" checked={inputs.womenLed} onChange={(v) => update('womenLed', v)} />
      </div>
    </div>
  );
}

function FactorBar({ name, impact, reason, maxAbs }: ScoreFactor & { maxAbs: number }) {
  const positive = impact >= 0;
  const width = Math.min(100, (Math.abs(impact) / maxAbs) * 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700 dark:text-slate-200">{name}</span>
        <span className={`font-bold ${positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {impact > 0 ? '+' : ''}{impact}
        </span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`h-2.5 rounded-full ${positive ? 'bg-green-500' : 'bg-red-500'}`}
        />
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{reason}</div>
    </div>
  );
}

function LenderMarketplace({ result, inputs }: { result: ScoreResult; inputs: RetailInputs | MSMEInputs }) {
  const [selectedOffer, setSelectedOffer] = useState<MatchedOffer | null>(null);
  const [filterPurpose, setFilterPurpose] = useState<LoanPurpose | 'all'>('all');
  const [filterCollateral, setFilterCollateral] = useState<'all' | 'no' | 'yes'>('all');
  const [filterWomen, setFilterWomen] = useState(false);

  const matched = useMemo(() => matchProducts(result, inputs), [result, inputs]);
  const eligible = matched.filter((m) => m.eligible);
  const filtered = eligible.filter((m) => {
    if (filterPurpose !== 'all' && m.product.purpose !== filterPurpose) return false;
    if (filterCollateral === 'no' && m.product.collateralRequired) return false;
    if (filterCollateral === 'yes' && !m.product.collateralRequired) return false;
    if (filterWomen && !m.product.womenLedBoost) return false;
    return true;
  });

  const purposes: LoanPurpose[] = ['Working Capital', 'Term Loan', 'Invoice Financing', 'Equipment Finance', 'Start-up Loan', 'Personal Loan'];

  return (
    <div className="mt-8">
      <SectionTitle icon={Landmark} title="Lender Marketplace" subtitle="Personalized offers matched on score, sector, collateral and profile. No broker fees." />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <Filter className="w-4 h-4 text-primary" />
          <span className="font-semibold">Filters:</span>
        </div>
        <select
          value={filterPurpose}
          onChange={(e) => setFilterPurpose(e.target.value as LoanPurpose | 'all')}
          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100"
        >
          <option value="all">All purposes</option>
          {purposes.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={filterCollateral}
          onChange={(e) => setFilterCollateral(e.target.value as 'all' | 'no' | 'yes')}
          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100"
        >
          <option value="all">Any collateral</option>
          <option value="no">Collateral-free</option>
          <option value="yes">Collateral-backed</option>
        </select>
        <button
          onClick={() => setFilterWomen((v) => !v)}
          className={`px-3 py-2 rounded-xl text-sm font-semibold border transition ${filterWomen ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'}`}
        >
          Women-led offers
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m, i) => (
          <motion.div
            key={m.product.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <CosmosCard variant="elevated" className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white">{m.product.lender}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{m.product.type}</div>
                  </div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full ${m.matchScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300' : m.matchScore >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                  {m.matchScore}% match
                </div>
              </div>

              <div className="text-sm font-semibold text-primary mb-2">{m.product.productName}</div>
              <div className="flex flex-wrap gap-1 mb-3">
                {m.product.tags.map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-semibold">{t}</span>
                ))}
              </div>

              <div className="space-y-1 text-sm mb-4 flex-1">
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><Percent className="w-3 h-3" /> Est. rate</span><span className="font-semibold text-slate-800 dark:text-slate-100">{m.estimatedRate.toFixed(2)}%</span></div>
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Max</span><span className="font-semibold text-slate-800 dark:text-slate-100">{formatINR(m.estimatedMaxAmount)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Tenure</span><span className="font-semibold text-slate-800 dark:text-slate-100">{m.product.tenureMonthsMin}-{m.product.tenureMonthsMax} mo</span></div>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">{m.reason}</div>

              <button
                onClick={() => setSelectedOffer(m)}
                className="w-full py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition"
              >
                View Offer
              </button>
            </CosmosCard>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-600 dark:text-slate-400 text-sm">
            No marketplace matches with current filters. Try relaxing filters or improving your score.
          </div>
        )}
      </div>

      {selectedOffer && <OfferDetailModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} result={result} />}
    </div>
  );
}

function OfferDetailModal({ offer, onClose, result }: { offer: MatchedOffer; onClose: () => void; result: ScoreResult }) {
  const [amount, setAmount] = useState(Math.min(500000, offer.estimatedMaxAmount));
  const [tenure, setTenure] = useState(offer.product.tenureMonthsMin + Math.floor((offer.product.tenureMonthsMax - offer.product.tenureMonthsMin) / 2));
  const [applied, setApplied] = useState(false);
  const { showToast } = useToast();
  const emi = useMemo(() => calculateEMI(amount, offer.estimatedRate, tenure), [amount, offer.estimatedRate, tenure]);

  const handleApply = () => {
    setApplied(true);
    showToast(`Application to ${offer.product.lender} simulated successfully.`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{offer.product.productName}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{offer.product.lender} • {offer.product.type}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Est. Rate</div>
              <div className="text-xl font-bold text-slate-800 dark:text-white">{offer.estimatedRate.toFixed(2)}%</div>
            </div>
            <div className="card text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Max Eligible</div>
              <div className="text-xl font-bold text-slate-800 dark:text-white">{formatINR(offer.estimatedMaxAmount)}</div>
            </div>
            <div className="card text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Match Score</div>
              <div className="text-xl font-bold text-primary">{offer.matchScore}%</div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">EMI Calculator</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Slider label="Loan Amount" value={amount} min={50000} max={offer.estimatedMaxAmount} step={25000} unit="₹" onChange={setAmount} />
                <Slider label="Tenure" value={tenure} min={offer.product.tenureMonthsMin} max={offer.product.tenureMonthsMax} step={1} unit=" mo" onChange={setTenure} />
              </div>
              <div className="card flex flex-col items-center justify-center text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Estimated EMI</div>
                <div className="text-3xl font-bold text-primary">{formatINR(emi)}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tenure} months @ {offer.estimatedRate.toFixed(2)}%</div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Eligibility Checklist</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-green-700 dark:text-green-400"><BadgeCheck className="w-4 h-4" /> CreditBridge score {result.score} ≥ {offer.product.minScore}</li>
              <li className={`flex items-center gap-2 ${offer.estimatedMaxAmount > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}><BadgeCheck className="w-4 h-4" /> Estimated eligible amount {formatINR(offer.estimatedMaxAmount)}</li>
              <li className={`flex items-center gap-2 ${offer.product.collateralRequired ? 'text-yellow-700 dark:text-yellow-400' : 'text-green-700 dark:text-green-400'}`}><BadgeCheck className="w-4 h-4" /> {offer.product.collateralRequired ? 'Collateral required' : 'Collateral-free'}</li>
              {offer.product.womenLedBoost && <li className="flex items-center gap-2 text-green-700 dark:text-green-400"><BadgeCheck className="w-4 h-4" /> Women-led concession available</li>}
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Features</h4>
            <div className="flex flex-wrap gap-2">
              {offer.product.features.map((f, i) => <span key={i} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full">{f}</span>)}
            </div>
          </div>

          {applied ? (
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-900 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <div className="font-bold text-green-900 dark:text-green-100">Application simulated</div>
              <div className="text-sm text-green-800 dark:text-green-200">Lender will verify documents and disburse within {offer.product.tenureMonthsMin} working days.</div>
            </div>
          ) : (
            <button onClick={handleApply} className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition">
              Apply for {formatINR(amount)}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

type TabId = 'breakdown' | 'rejection' | 'recommendations' | 'bias' | 'reason-codes' | 'what-if' | 'compare' | 'ethics';

const RETAIL_PERSONAS: { label: string; icon: React.ElementType; inputs: RetailInputs }[] = [
  {
    label: 'Strong Profile',
    icon: Smile,
    inputs: {
      monthlyIncome: 90000, incomeStability: 'salaried', existingEmis: 5000, creditUtilization: 15, paymentHistory: 98,
      bankingVintage: 72, upiVolume: 60000, upiConsistency: 95, savingsRate: 25, employmentTenure: 60, age: 34,
      hasBureauScore: true, bureauScore: 780,
    },
  },
  {
    label: 'Average Profile',
    icon: User,
    inputs: RETAIL_DEFAULTS,
  },
  {
    label: 'Risky Profile',
    icon: AlertOctagon,
    inputs: {
      monthlyIncome: 25000, incomeStability: 'gig', existingEmis: 12000, creditUtilization: 85, paymentHistory: 55,
      bankingVintage: 12, upiVolume: 8000, upiConsistency: 40, savingsRate: 0, employmentTenure: 6, age: 22,
      hasBureauScore: false, bureauScore: 650,
    },
  },
];

const MSME_PERSONAS: { label: string; icon: React.ElementType; inputs: MSMEInputs }[] = [
  {
    label: 'Strong MSME',
    icon: Smile,
    inputs: {
      businessVintage: 96, annualTurnover: 10000000, gstFiling: 'monthly', gstGrowth: 35, digitalPaymentShare: 70,
      avgBankBalance: 1200000, receivablesCycle: 30, sector: 'manufacturing', existingLoans: 0, udyamRegistered: true,
      hasCollateral: true, womenLed: true,
    },
  },
  {
    label: 'Average MSME',
    icon: Building2,
    inputs: MSME_DEFAULTS,
  },
  {
    label: 'Risky MSME',
    icon: AlertOctagon,
    inputs: {
      businessVintage: 12, annualTurnover: 600000, gstFiling: 'none', gstGrowth: -5, digitalPaymentShare: 10,
      avgBankBalance: 50000, receivablesCycle: 120, sector: 'construction', existingLoans: 3, udyamRegistered: false,
      hasCollateral: false, womenLed: false,
    },
  },
];

function DemoPersonas({
  mode,
  onSelect,
}: {
  mode: 'retail' | 'msme';
  onSelect: (inputs: RetailInputs | MSMEInputs) => void;
}) {
  const personas = mode === 'retail' ? RETAIL_PERSONAS : MSME_PERSONAS;
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Quick-fill demo personas</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {personas.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.label}
              onClick={() => onSelect(p.inputs)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary transition"
            >
              <Icon className="w-3.5 h-3.5" /> {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InputSummary({ inputs, mode }: { inputs: RetailInputs | MSMEInputs; mode: 'retail' | 'msme' }) {
  const items = mode === 'retail'
    ? [
        { label: 'Income', value: formatINR((inputs as RetailInputs).monthlyIncome) },
        { label: 'Stability', value: (inputs as RetailInputs).incomeStability },
        { label: 'EMIs', value: formatINR((inputs as RetailInputs).existingEmis) },
        { label: 'Utilization', value: `${(inputs as RetailInputs).creditUtilization}%` },
        { label: 'Payments', value: `${(inputs as RetailInputs).paymentHistory}%` },
      ]
    : [
        { label: 'Turnover', value: formatINR((inputs as MSMEInputs).annualTurnover) },
        { label: 'Vintage', value: `${(inputs as MSMEInputs).businessVintage} mo` },
        { label: 'GST', value: (inputs as MSMEInputs).gstFiling },
        { label: 'Digital', value: `${(inputs as MSMEInputs).digitalPaymentShare}%` },
        { label: 'Sector', value: (inputs as MSMEInputs).sector },
      ];
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {items.map((it) => (
        <div key={it.label} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300">
          <span className="font-semibold">{it.label}:</span> {it.value}
        </div>
      ))}
    </div>
  );
}

function ScoreBadge({ item }: { item: ScorecardItem }) {
  const color = item.status === 'pass' ? 'text-green-600 dark:text-green-400' : item.status === 'warn' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';
  const bg = item.status === 'pass' ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900' : item.status === 'warn' ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900' : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900';
  return (
    <div className={`card ${bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-slate-800 dark:text-white">{item.dimension}</span>
        <span className={`text-lg font-bold ${color}`}>{item.score}/{item.max}</span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
    </div>
  );
}

function ConsentRow({ item }: { item: ConsentItem }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div>
        <div className="font-medium text-slate-800 dark:text-white text-sm">{item.source}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{item.purpose}</div>
      </div>
      <div className="text-right">
        <div className={`text-xs font-bold ${item.consent === 'granted' ? 'text-green-600 dark:text-green-400' : item.consent === 'optional' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
          {item.consent === 'granted' ? 'Consent granted' : item.consent === 'optional' ? 'Optional' : 'Not applicable'}
        </div>
        {item.required && <div className="text-[10px] text-slate-400">Required</div>}
      </div>
    </div>
  );
}

function EthicsDashboard({ result }: { result: ScoreResult }) {
  const [queue, setQueue] = useState<ReviewCase[]>(() => generateSampleReviewQueue());
  const notice = useMemo(() => generateAdverseActionNotice(result), [result]);
  const scorecard = useMemo(() => calculateAccountabilityScorecard(result), [result]);
  const consent = useMemo(() => getConsentLedger(result.mode), [result.mode]);
  const overallScore = Math.round(scorecard.reduce((acc, s) => acc + s.score, 0) / scorecard.length);

  const updateCase = (id: string, status: ReviewCase['status']) => {
    setQueue((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card text-center md:col-span-1">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Accountability Score</div>
          <div className={`text-3xl font-bold ${overallScore >= 90 ? 'text-green-600 dark:text-green-400' : overallScore >= 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>{overallScore}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">out of 100</div>
        </div>
        <div className="card md:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Gavel className="w-4 h-4 text-primary" /> Model Governance</h4>
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-semibold">{GOVERNANCE_INFO.modelVersion}</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500 dark:text-slate-400">Model:</span> <span className="font-medium text-slate-800 dark:text-white">{GOVERNANCE_INFO.modelName}</span></div>
            <div><span className="text-slate-500 dark:text-slate-400">Deployed:</span> <span className="font-medium text-slate-800 dark:text-white">{GOVERNANCE_INFO.deployedAt}</span></div>
            <div><span className="text-slate-500 dark:text-slate-400">Last audit:</span> <span className="font-medium text-slate-800 dark:text-white">{GOVERNANCE_INFO.lastAuditDate}</span></div>
            <div><span className="text-slate-500 dark:text-slate-400">Approved by:</span> <span className="font-medium text-slate-800 dark:text-white">{GOVERNANCE_INFO.approvedBy}</span></div>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400"><strong>Explainability:</strong> {GOVERNANCE_INFO.explainabilityMethod}</div>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-slate-800 dark:text-white mb-3">Accountability Scorecard</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scorecard.map((s, i) => <ScoreBadge key={i} item={s} />)}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <CosmosCard variant="default">
          <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-primary" /> Consent & Data Provenance</h4>
          {consent.map((c, i) => <ConsentRow key={i} item={c} />)}
        </CosmosCard>

        <CosmosCard variant="default">
          <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><UserCheck className="w-4 h-4 text-primary" /> Human Review Queue</h4>
          <div className="space-y-3">
            {queue.map((c) => (
              <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800 dark:text-white text-sm">{c.applicantName}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.status === 'approved' ? 'bg-green-100 text-green-700' : c.status === 'rejected' ? 'bg-red-100 text-red-700' : c.status === 'escalated' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{c.id} • {c.mode} • Score {c.score} • {c.submittedAt}</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {c.flags.map((f, idx) => <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">{f}</span>)}
                </div>
                {c.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateCase(c.id, 'approved')} className="flex-1 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> Approve</button>
                    <button onClick={() => updateCase(c.id, 'rejected')} className="flex-1 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 flex items-center justify-center gap-1"><XCircle className="w-3 h-3" /> Reject</button>
                    <button onClick={() => updateCase(c.id, 'escalated')} className="flex-1 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> Escalate</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CosmosCard>
      </div>

      <CosmosCard variant="default">
        <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Adverse Action Notice</h4>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 space-y-2">
          <div><strong>Decision:</strong> {notice.decision}</div>
          <div><strong>Score:</strong> {notice.score} ({notice.band})</div>
          <div><strong>Max eligible:</strong> {notice.maxEligible}</div>
          <div><strong>Generated:</strong> {notice.generatedAt}</div>
          {notice.reasonCodes.length > 0 && (
            <div>
              <strong>Reason codes:</strong>
              <ul className="list-disc ml-5 mt-1">
                {notice.reasonCodes.map((r, i) => <li key={i}>{r.code}: {r.message}</li>)}
              </ul>
            </div>
          )}
          <div>
            <strong>Your rights:</strong>
            <ul className="list-disc ml-5 mt-1">
              {notice.applicantRights.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </div>
      </CosmosCard>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-100">
        <strong>Fairness note:</strong> CreditBridge does not use gender, caste, religion, or geography in scoring. The dashboard above demonstrates institutional oversight required by the EAA framework.
      </div>
    </div>
  );
}

function ScoreCard({ result, onReset, inputs }: { result: ScoreResult; onReset: () => void; inputs: RetailInputs | MSMEInputs }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('breakdown');
  const { score, band, factors, maxLoan, mode } = result;
  const maxAbs = Math.max(...factors.map((f) => Math.abs(f.impact)), 1);
  const rejectionReasons = factors.filter((f) => f.impact < -20 || (f.name === 'Bureau Score' && f.impact === 0));
  const recommendationReasons = factors.filter((f) => f.impact >= 20);
  const positiveData = useMemo(() => factors.filter((f) => f.impact > 0).map((f) => ({ name: f.name, value: f.impact })), [factors]);
  const confidence = useMemo(() => calculateConfidence(result), [result]);
  const isRetail = mode === 'retail';
  const retailInputs = isRetail ? (inputs as RetailInputs) : null;

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'breakdown', label: 'Breakdown', icon: Eye },
    { id: 'rejection', label: 'Risk Drivers', icon: AlertTriangle },
    { id: 'recommendations', label: 'Improve', icon: CheckCircle2 },
    { id: 'reason-codes', label: 'Reason Codes', icon: FileText },
    { id: 'what-if', label: 'What-If', icon: TrendingUp },
    { id: 'compare', label: 'Compare', icon: BarChart3 },
    { id: 'bias', label: 'Bias Audit', icon: Scale },
    { id: 'ethics', label: 'Ethics', icon: Gavel },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <CosmosCard variant="gradient" className="overflow-hidden p-0">
        <div className={`p-6 md:p-8 ${band.tailwindBg} ${band.tailwindBorder} border-b`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Your CreditBridge Score</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm">Deterministic, explainable, bias-audited credit assessment</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full text-sm font-bold text-white" style={{ background: band.color }}>{band.label}</span>
                <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{band.approval}</span>
                <span className="px-2 py-1 rounded-full text-xs font-bold text-white" style={{ background: confidence.color }}>{confidence.label} ({confidence.value}%)</span>
              </div>
            </div>
            <Gauge score={score} />
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="card text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Max Eligible</div>
              <div className="text-xl font-bold text-slate-800 dark:text-white mt-1">{formatINR(maxLoan)}</div>
            </div>
            <div className="card text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Indicative Interest</div>
              <div className="text-xl font-bold text-slate-800 dark:text-white mt-1">{band.interest}</div>
            </div>
            <div className="card text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Model Type</div>
              <div className="text-xl font-bold text-slate-800 dark:text-white mt-1 capitalize">{mode}</div>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                    activeTab === tab.id ? 'bg-primary text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'breakdown' && (
              <motion.div key="breakdown" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">SHAP-Style Factor Breakdown</h3>
                  {factors.map((f, i) => (
                    <FactorBar key={i} {...f} maxAbs={maxAbs} />
                  ))}
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Score Waterfall</h3>
                    <WaterfallChart factors={factors} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Positive Contributors</h3>
                  {positiveData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={positiveData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name }) => (name ? (name.length > 12 ? name.slice(0, 12) + '...' : name) : '')}
                          >
                            {positiveData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No strong positive contributors detected.</p>
                  )}
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-100">
                    <strong>Why this matters:</strong> Each factor's impact is calculated independently and summed to produce a 300-900 score. No hidden weights.
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'rejection' && (
              <motion.div key="rejection" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Rejection / Risk Drivers</h3>
                {rejectionReasons.length === 0 ? (
                  <p className="text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30 p-4 rounded-xl border border-green-200 dark:border-green-900">No severe risk drivers detected. This application looks healthy.</p>
                ) : (
                  <div className="space-y-3">
                    {rejectionReasons.map((f, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900">
                        <div className="text-red-600 dark:text-red-400 font-bold text-lg">−</div>
                        <div>
                          <div className="font-semibold text-red-900 dark:text-red-100">{f.name}</div>
                          <div className="text-sm text-red-800 dark:text-red-200">{f.reason} — pulled score by {Math.abs(f.impact)} points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'recommendations' && (
              <motion.div key="recommendations" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Improvement Recommendations</h3>
                <ul className="space-y-3">
                  {recommendationReasons.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-100 dark:border-green-900">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-green-900 dark:text-green-100">Keep {f.name} strong</div>
                        <div className="text-sm text-green-800 dark:text-green-200">{f.reason} — added {f.impact} points</div>
                      </div>
                    </li>
                  ))}
                  {isRetail && retailInputs && retailInputs.existingEmis / retailInputs.monthlyIncome > 0.4 && (
                    <li className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-xl border border-yellow-100 dark:border-yellow-900">
                      <AlertTriangle className="w-5 h-5 text-yellow-700 dark:text-yellow-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-yellow-900 dark:text-yellow-100">Reduce EMI burden</div>
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">Your EMIs exceed 40% of income. Lowering this improves eligibility.</div>
                      </div>
                    </li>
                  )}
                </ul>
              </motion.div>
            )}

            {activeTab === 'bias' && (
              <motion.div key="bias" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Ethical Accountability Audit</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="card">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Protected Attributes Used</div>
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">None</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">CreditBridge never uses gender, caste, religion, or location as inputs.</div>
                  </div>
                  <div className="card">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Right to Explanation</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">Enabled</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Every score change has a traceable reason shown above.</div>
                  </div>
                  <div className="card">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Human Review Trigger</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{score < 650 ? 'Auto-queued' : 'Available on request'}</div>
                  </div>
                  <div className="card">
                    <div className="text-sm text-slate-500 dark:text-slate-400">DPDP / RBI Alignment</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">Compliant</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Consent-first alternate data; no black-box decisions.</div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Inspired by the EAA framework (Saxena et al., 2025): Explainable AI + institutional oversight + user right to challenge. If you believe this decision is unfair, you can request a human-led review with the factors above.
                </p>
              </motion.div>
            )}

            {activeTab === 'reason-codes' && (
              <motion.div key="reason-codes" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Regulatory Reason Codes</h3>
                <ReasonCodesPanel result={result} />
              </motion.div>
            )}

            {activeTab === 'what-if' && (
              <motion.div key="what-if" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Counterfactual Simulator</h3>
                <WhatIfSimulator mode={mode} originalInputs={inputs} />
              </motion.div>
            )}

            {activeTab === 'compare' && (
              <motion.div key="compare" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">CreditBridge vs Bureau-Only</h3>
                <ComparePanel inputs={inputs} result={result} />
              </motion.div>
            )}

            {activeTab === 'ethics' && (
              <motion.div key="ethics" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Ethics & Accountability Dashboard</h3>
                <EthicsDashboard result={result} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button onClick={onReset} className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm font-semibold flex items-center gap-1">
              <RefreshCcw className="w-4 h-4" /> Edit Inputs
            </button>
            <div className="flex items-center gap-3">
              <ExportReportButton result={result} />
              <button
                onClick={() => showToast('Human review request simulated. A loan officer will contact you within 24 hours.', 'info')}
                className="px-5 py-2.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 dark:hover:bg-slate-600 transition"
              >
                Request Human Review
              </button>
            </div>
          </div>
        </div>
      </CosmosCard>
    </motion.div>
  );
}

export default function CreditBridgeAI() {
  const [mode, setMode] = useState<'retail' | 'msme'>('retail');
  const [retailInputs, setRetailInputs] = useState<RetailInputs>(RETAIL_DEFAULTS);
  const [msmeInputs, setMsmeInputs] = useState<MSMEInputs>(MSME_DEFAULTS);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [showResearch, setShowResearch] = useState(false);
  const { showToast } = useToast();

  const cibilScore = useWealthStore((s) => s.cibilScore);

  // Pre-fill bureau score from existing CIBIL data if available.
  useEffect(() => {
    if (cibilScore && cibilScore > 300) {
      setRetailInputs((p) => ({ ...p, hasBureauScore: true, bureauScore: cibilScore }));
    }
  }, [cibilScore]);

  const inputs = mode === 'retail' ? retailInputs : msmeInputs;

  const runScoring = () => {
    const res = calculateResult(mode, inputs);
    setResult(res);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F2557] via-[#1e3a8a] to-[#b45309] text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />
        <div className="relative px-6 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold mb-4">
                <Sparkles className="w-3 h-3" />
                Ethical Algorithm Accountability (EAA) Framework
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">CreditBridge AI</h1>
              <p className="mt-3 text-base md:text-lg text-blue-100 max-w-xl">
                Explainable, bias-audited credit scoring for thin-file retail borrowers and MSMEs.
              </p>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4 text-right">
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                <div className="text-2xl font-bold">82%</div>
                <div className="text-xs text-blue-100">thin-file coverage</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                <div className="text-2xl font-bold">17 min</div>
                <div className="text-xs text-blue-100">avg decision time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {result ? (
        <>
          <ScoreCard result={result} onReset={() => setResult(null)} inputs={inputs} />
          <LenderMarketplace result={result} inputs={inputs} />
        </>
      ) : (
        <>
          <CosmosCard variant="elevated">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {mode === 'retail' ? 'Retail Credit Application' : 'MSME Credit Application'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">All fields are alternate-data friendly. No bureau score required.</p>
              </div>
              <button
                onClick={() => setShowResearch(!showResearch)}
                className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1"
              >
                <FileText className="w-4 h-4" /> Research basis
              </button>
            </div>

            {showResearch && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">
                Based on <em>"Algorithmic Accountability in AI-Driven Credit Scoring"</em> (Saxena, Sharma, Mohanty & Sharma, 2025) and the Abhirva 3.0 pitch deck. Key findings: ~85% repayment prediction accuracy, 73% of fintechs use device data, 45–60% rejection rate, women face 2.4× higher rejection. Proposed EAA framework: Explainable AI + institutional oversight + user right to challenge, aligned with RBI digital lending guidelines and DPDP Act 2023.
              </div>
            )}

            {/* MODE SWITCH */}
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
              <button
                onClick={() => { setMode('retail'); setResult(null); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
                  mode === 'retail' ? 'bg-primary text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <User className="w-4 h-4" /> Retail / Individual
              </button>
              <button
                onClick={() => { setMode('msme'); setResult(null); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
                  mode === 'msme' ? 'bg-primary text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Building2 className="w-4 h-4" /> MSME / Business
              </button>
            </div>

            <DemoPersonas
              mode={mode}
              onSelect={(p) => {
                if (mode === 'retail') setRetailInputs(p as RetailInputs);
                else setMsmeInputs(p as MSMEInputs);
                showToast('Demo persona loaded. Click Generate Score to see result.', 'info');
              }}
            />

            <InputSummary inputs={inputs} mode={mode} />

            {mode === 'retail' ? (
              <RetailForm inputs={retailInputs} setInputs={setRetailInputs} />
            ) : (
              <MSMEForm inputs={msmeInputs} setInputs={setMsmeInputs} />
            )}

            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={runScoring}
                className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-primary/90 transition"
              >
                Generate CreditBridge Score <ArrowRight className="w-5 h-5" />
              </button>
              <span className="text-xs text-slate-500 dark:text-slate-400">No data leaves your browser. Scoring logic runs entirely client-side.</span>
            </div>
          </CosmosCard>

          <div className="grid md:grid-cols-3 gap-6">
            <CosmosCard variant="default" className="text-center md:text-left">
              <div className="w-12 h-12 mx-auto md:mx-0 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary mb-4">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">Explainable by Design</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Every factor that moves your score is shown with magnitude and reason. No black boxes.</p>
            </CosmosCard>
            <CosmosCard variant="default" className="text-center md:text-left">
              <div className="w-12 h-12 mx-auto md:mx-0 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">Bias Audited</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Protected attributes are never inputs. Built-in audit panel for fairness and DPDP compliance.</p>
            </CosmosCard>
            <CosmosCard variant="default" className="text-center md:text-left">
              <div className="w-12 h-12 mx-auto md:mx-0 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">Lender Marketplace</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Get matched to banks, NBFCs and fintechs that fit your score — transparently.</p>
            </CosmosCard>
          </div>
        </>
      )}
    </div>
  );
}

function WaterfallChart({ factors }: { factors: ScoreFactor[] }) {
  const data = useMemo(() => buildWaterfall(factors), [factors]);
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" domain={[300, 900]} hide />
          <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
          <RechartsTooltip formatter={(value) => [`${Number(value) > 0 ? '+' : ''}${value ?? 0} pts`, 'Impact']} />
          <Bar dataKey="runningTotal" fill="#e2e8f0" radius={[4, 4, 4, 4]} isAnimationActive={false} />
          <Bar dataKey="impact" fill="#3b82f6" radius={[4, 4, 4, 4]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.impact >= 0 ? '#16a34a' : '#dc2626'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ReasonCodesPanel({ result }: { result: ScoreResult }) {
  const codes = useMemo(() => generateReasonCodes(result), [result]);
  if (codes.length === 0) {
    return (
      <div className="p-6 bg-green-50 dark:bg-green-950/30 rounded-2xl border border-green-200 dark:border-green-900 text-center">
        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
        <h3 className="font-bold text-green-900 dark:text-green-100">No adverse reason codes</h3>
        <p className="text-sm text-green-800 dark:text-green-200">CreditBridge did not generate any rejection reason codes for this profile.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {codes.map((c, i) => (
        <div key={i} className="card border-l-4 border-l-primary">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded">{c.code}</span>
                <span className="font-semibold text-slate-800 dark:text-white">{c.factor}</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{c.message}</div>
            </div>
            <SeverityBadge severity={c.severity} />
          </div>
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-sm text-blue-900 dark:text-blue-100">
            <strong>Actionable step:</strong> {c.action}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">Impact: {c.impact > 0 ? '+' : ''}{c.impact} points</div>
        </div>
      ))}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: ReasonCode['severity'] }) {
  const map = {
    critical: { text: 'Critical', class: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300' },
    warning: { text: 'Warning', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300' },
    info: { text: 'Info', class: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' },
  };
  const s = map[severity];
  return <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.class}`}>{s.text}</span>;
}

function WhatIfSimulator({ mode, originalInputs }: { mode: 'retail' | 'msme'; originalInputs: RetailInputs | MSMEInputs }) {
  const [changes, setChanges] = useState<Partial<RetailInputs> | Partial<MSMEInputs>>({});
  const counterfactual = useMemo(() => calculateCounterfactual(mode, originalInputs, changes), [mode, originalInputs, changes]);
  const isRetail = mode === 'retail';

  const update = <K extends string>(key: K, val: number) => {
    setChanges((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Original Score</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{counterfactual.originalScore}</div>
        </div>
        <div className="card text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Simulated Score</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{counterfactual.newScore}</div>
          <div className={`text-sm font-bold ${counterfactual.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {counterfactual.delta >= 0 ? '+' : ''}{counterfactual.delta} pts
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-x-8">
        {isRetail ? (
          <>
            <Slider label="Reduce EMIs to" value={(changes as Partial<RetailInputs>).existingEmis ?? (originalInputs as RetailInputs).existingEmis} min={0} max={100000} step={1000} unit="₹" onChange={(v) => update('existingEmis', v)} />
            <Slider label="Credit Utilization" value={(changes as Partial<RetailInputs>).creditUtilization ?? (originalInputs as RetailInputs).creditUtilization} min={0} max={100} step={5} unit="%" onChange={(v) => update('creditUtilization', v)} />
            <Slider label="Payment History" value={(changes as Partial<RetailInputs>).paymentHistory ?? (originalInputs as RetailInputs).paymentHistory} min={0} max={100} step={5} unit="%" onChange={(v) => update('paymentHistory', v)} />
            <Slider label="Savings Rate" value={(changes as Partial<RetailInputs>).savingsRate ?? (originalInputs as RetailInputs).savingsRate} min={0} max={60} step={2} unit="%" onChange={(v) => update('savingsRate', v)} />
            <Slider label="UPI Volume" value={(changes as Partial<RetailInputs>).upiVolume ?? (originalInputs as RetailInputs).upiVolume} min={0} max={200000} step={5000} unit="₹" onChange={(v) => update('upiVolume', v)} />
          </>
        ) : (
          <>
            <Slider label="GST Growth" value={(changes as Partial<MSMEInputs>).gstGrowth ?? (originalInputs as MSMEInputs).gstGrowth} min={-20} max={100} step={1} unit="%" onChange={(v) => update('gstGrowth', v)} />
            <Slider label="Digital Payment Share" value={(changes as Partial<MSMEInputs>).digitalPaymentShare ?? (originalInputs as MSMEInputs).digitalPaymentShare} min={0} max={100} step={5} unit="%" onChange={(v) => update('digitalPaymentShare', v)} />
            <Slider label="Avg Bank Balance" value={(changes as Partial<MSMEInputs>).avgBankBalance ?? (originalInputs as MSMEInputs).avgBankBalance} min={0} max={5000000} step={25000} unit="₹" onChange={(v) => update('avgBankBalance', v)} />
            <Slider label="Receivables Cycle" value={(changes as Partial<MSMEInputs>).receivablesCycle ?? (originalInputs as MSMEInputs).receivablesCycle} min={0} max={180} step={5} unit=" days" onChange={(v) => update('receivablesCycle', v)} />
            <Slider label="Existing Loans" value={(changes as Partial<MSMEInputs>).existingLoans ?? (originalInputs as MSMEInputs).existingLoans} min={0} max={10} step={1} unit="" onChange={(v) => update('existingLoans', v)} />
          </>
        )}
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900 text-sm text-blue-900 dark:text-blue-100">
        <strong>Simulator note:</strong> Each slider overrides one input while keeping all others constant. This shows the marginal effect of improving that single factor.
      </div>
    </div>
  );
}

function ComparePanel({ inputs, result }: { inputs: RetailInputs | MSMEInputs; result: ScoreResult }) {
  if (result.mode !== 'retail') {
    return (
      <div className="text-center p-6">
        <p className="text-slate-600 dark:text-slate-300">Comparison view is optimized for retail individual mode where traditional bureau-only models often reject thin-file applicants.</p>
      </div>
    );
  }
  const retail = inputs as RetailInputs;
  const bureauOnly = calculateBureauOnlyScore(retail);
  const creditbridge = result.score;
  const coverageGain = estimateCoverageGain(retail);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">CreditBridge AI</div>
          <div className="text-2xl font-bold text-primary">{creditbridge}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Alternate + bureau data</div>
        </div>
        <div className="card text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Bureau-Only Model</div>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">{bureauOnly > 0 ? bureauOnly : 'N/A'}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{bureauOnly > 0 ? 'CIBIL available' : 'Thin file — no score'}</div>
        </div>
        <div className="card text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Coverage Gain</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">+{coverageGain}%</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Thin-file inclusion</div>
        </div>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">
        <strong>Why this matters:</strong> Traditional bureau-only models leave out ~80% of thin-file Indians. CreditBridge uses cash-flow, UPI, GST and savings behaviour to score applicants even when they have no CIBIL history.
      </div>
    </div>
  );
}

function ExportReportButton({ result }: { result: ScoreResult }) {
  const handleExport = () => {
    const doc = new jsPDF();
    let y = 16;
    doc.setFontSize(18);
    doc.text('CreditBridge AI — Explanation Report', 14, y);
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, y);
    y += 8;
    doc.text(`Mode: ${result.mode}`, 14, y);
    y += 8;
    doc.text(`CreditBridge Score: ${result.score} (${result.band.label})`, 14, y);
    y += 8;
    doc.text(`Max Eligible Loan: ${formatINR(result.maxLoan)}`, 14, y);
    y += 12;

    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.text('Factor Breakdown', 14, y);
    y += 8;
    doc.setFontSize(10);
    for (const f of result.factors) {
      const line = `${f.name}: ${f.impact > 0 ? '+' : ''}${f.impact} pts — ${f.reason}`;
      const split = doc.splitTextToSize(line, 180);
      doc.text(split, 14, y);
      y += split.length * 5 + 2;
      if (y > 270) {
        doc.addPage();
        y = 16;
      }
    }

    y += 8;
    doc.setFontSize(13);
    doc.text('Reason Codes', 14, y);
    y += 8;
    doc.setFontSize(10);
    const codes = generateReasonCodes(result);
    if (codes.length === 0) {
      doc.text('No adverse reason codes generated.', 14, y);
    } else {
      for (const c of codes) {
        const line = `${c.code} [${c.severity}] ${c.factor}: ${c.message} Action: ${c.action}`;
        const split = doc.splitTextToSize(line, 180);
        doc.text(split, 14, y);
        y += split.length * 5 + 3;
        if (y > 270) {
          doc.addPage();
          y = 16;
        }
      }
    }

    y += 12;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('This report is generated client-side for transparency. It is not a final lending decision.', 14, y);

    doc.save(`CreditBridge_Report_${result.score}.pdf`);
  };

  return (
    <button
      onClick={handleExport}
      className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition flex items-center gap-2"
    >
      <Download className="w-4 h-4" /> Export Report
    </button>
  );
}

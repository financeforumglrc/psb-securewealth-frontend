import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useToast } from '@/shared/components/ui/ToastProvider';
import CosmosCard from '@/shared/components/ui/CosmosCard';
import { formatCurrency } from '@/shared/utils/demoMode';
import type { MSMEApplication, MSMECreditScore, MSMEOffer } from '@/shared/types';
import { assessApplication, type MSMEScoreInput, type MSMEScoreFactor } from '@/features/msme/services/msmeScoreEngine';
import { backendApi } from '@/shared/lib/backendApi';

const ENTERPRISE_TYPES = [
  { value: 'micro', label: 'Micro (turnover < ₹5 Cr)' },
  { value: 'small', label: 'Small (turnover < ₹50 Cr)' },
  { value: 'medium', label: 'Medium (turnover < ₹250 Cr)' },
];

const INITIAL_FORM: MSMEScoreInput = {
  businessName: '',
  enterpriseType: 'small',
  annualTurnover: 2500000,
  employees: 12,
  requestedAmount: 500000,
  requestedTenure: 24,
  gstin: '',
  gstComplianceScore: 78,
  cashFlowStabilityScore: 72,
  transactionVolumeScore: 65,
  digitalAdoptionScore: 60,
  creditHistoryScore: 55,
};

const MOCK_ADMIN_STATS = {
  totalLoansDisbursed: 842,
  activeMSMEs: 1240,
  totalApplications: 3156,
  approved: 2034,
  rejected: 1122,
  averageTicketSize: 875000,
  portfolioPAR: 2.4,
  recoveryRate: 96.8,
  womenLedMSMEs: 38,
  ruralReach: 44,
  cgstmseClaims: 127,
};

function generateRef() {
  return `MSME${Date.now().toString(36).toUpperCase()}`;
}

function scoreColorClass(score: number) {
  if (score >= 800) return 'text-emerald-600';
  if (score >= 650) return 'text-amber-500';
  if (score >= 500) return 'text-orange-500';
  return 'text-red-500';
}


function decisionBadge(decision: string) {
  switch (decision) {
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'APPROVED_WITH_CONDITIONS':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
    case 'PARTIAL_APPROVAL':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
    default:
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
  }
}

export default function MSMEcreditbridgeView() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [form, setForm] = useState<MSMEScoreInput>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<'apply' | 'status' | 'admin'>('apply');
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState(MOCK_ADMIN_STATS);
  const [adminLoading, setAdminLoading] = useState(false);

  const msmeApplications = useWealthStore((s) => s.msmeApplications);
  const msmeScores = useWealthStore((s) => s.msmeScores);
  const msmeOffers = useWealthStore((s) => s.msmeOffers);
  const addMsmeApplication = useWealthStore((s) => s.addMsmeApplication);
  const setMsmeScore = useWealthStore((s) => s.setMsmeScore);
  const setMsmeOffers = useWealthStore((s) => s.setMsmeOffers);

  const isAdmin = useMemo(() => {
    if (typeof sessionStorage === 'undefined') return false;
    return !!sessionStorage.getItem('sw-admin-token');
  }, [showAdmin]);

  useEffect(() => {
    if (tab === 'admin' && isAdmin) {
      loadAdminStats();
    }
  }, [tab, isAdmin]);

  const currentApplication = useMemo(
    () => msmeApplications.find((a) => a.id === selectedAppId) || msmeApplications[0] || null,
    [msmeApplications, selectedAppId]
  );

  const currentScore = currentApplication ? msmeScores[currentApplication.id] || null : null;
  const currentOffers = currentApplication ? msmeOffers[currentApplication.id] || [] : [];

  async function loadAdminStats() {
    setAdminLoading(true);
    try {
      const res = await backendApi.msmeAdminPortfolio();
      if (res.ok && res.data?.data) {
        setAdminStats(res.data.data);
      } else {
        setAdminStats(MOCK_ADMIN_STATS);
      }
    } catch {
      setAdminStats(MOCK_ADMIN_STATS);
    } finally {
      setAdminLoading(false);
    }
  }

  function handleInputChange<T extends keyof MSMEScoreInput>(field: T, value: MSMEScoreInput[T]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.businessName.trim()) {
      showToast(t('msme.businessNameRequired', 'Business name is required'), 'error');
      return;
    }
    if (form.requestedAmount < 50000 || form.requestedAmount > 50000000) {
      showToast(t('msme.amountRange', 'Requested amount must be between ₹50,000 and ₹5 Cr'), 'error');
      return;
    }
    setSubmitting(true);

    const result = assessApplication(form);

    const application: MSMEApplication = {
      id: Date.now(),
      applicationRef: generateRef(),
      businessName: form.businessName,
      udyamNumber: '',
      gstin: form.gstin || '',
      panNumber: '',
      enterpriseType: form.enterpriseType,
      annualTurnover: form.annualTurnover,
      employees: form.employees,
      requestedAmount: form.requestedAmount,
      requestedTenure: form.requestedTenure,
      purpose: 'Working capital / business expansion',
      status: result.decision === 'REJECTED' ? 'rejected' : 'approved',
      decision: result.decision,
      decisionReason: result.conditions.join('; '),
      consentGst: true,
      consentAa: true,
      consentUpi: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const scoreRecord: MSMECreditScore = {
      id: Date.now(),
      applicationId: application.id,
      score: result.score,
      category: result.category,
      factors: result.factors,
      eli5: result.eli5,
      recommendations: result.recommendations,
      fraudSignals: result.fraudSignals,
    };

    const offers: MSMEOffer[] = result.offers.map((o, idx) => ({
      id: Date.now() + idx,
      ...o,
      status: 'pending',
    })) as MSMEOffer[];

    try {
      await backendApi.msmeApply({
        businessName: form.businessName,
        udyamNumber: '',
        gstin: form.gstin || undefined,
        panNumber: '',
        enterpriseType: form.enterpriseType,
        annualTurnover: form.annualTurnover,
        employees: form.employees,
        requestedAmount: form.requestedAmount,
        requestedTenure: form.requestedTenure,
        purpose: 'Working capital / business expansion',
        consentGst: true,
        consentAa: true,
        consentUpi: true,
        gstComplianceScore: form.gstComplianceScore,
        cashFlowStabilityScore: form.cashFlowStabilityScore,
        transactionVolumeScore: form.transactionVolumeScore,
        digitalAdoptionScore: form.digitalAdoptionScore,
        creditHistoryScore: form.creditHistoryScore,
      });
    } catch {
      // offline/demo fallback — keep local result
    }

    addMsmeApplication(application);
    setMsmeScore(application.id, scoreRecord);
    setMsmeOffers(application.id, offers);
    setSelectedAppId(application.id);
    setTab('status');
    showToast(t('msme.applicationSubmitted', 'Application submitted successfully'), 'success');
    setSubmitting(false);
  }

  function handleAcceptOffer(offer: MSMEOffer) {
    setMsmeOffers(currentApplication!.id, currentOffers.map((o) => (o.id === offer.id ? { ...o, status: 'accepted' } : o)));
    showToast(t('msme.offerAccepted', 'Offer accepted. Disbursement will be processed within 48 hours.'), 'success');
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 bg-psb-bg min-h-screen dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary/60 text-white p-6 md:p-8"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wide">AI Powered</span>
            <span className="px-2 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wide">CGTMSE Enabled</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-2">MSME CreditBridge AI</h1>
          <p className="max-w-2xl text-white/90 text-sm md:text-base">
            Collateral-free business loans scored from GST, cash-flow, UPI and digital footprints — with explainable AI so every decision is transparent.
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10 pointer-events-none">
          <i className="fas fa-bridge text-[220px]" />
        </div>
      </motion.div>

      <CosmosCard variant="elevated" header={{ title: 'Why MSME CreditBridge AI Wins', icon: 'fa-trophy' }}>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">The Problem</p>
            <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-200">
              <li className="flex items-start gap-2"><i className="fas fa-circle-exclamation text-red-500 mt-1 text-xs" /> ₹15.7 lakh Cr market, yet $300B credit demand unmet</li>
              <li className="flex items-start gap-2"><i className="fas fa-circle-exclamation text-red-500 mt-1 text-xs" /> 85% rejected for vague “generic risk” reasons</li>
              <li className="flex items-start gap-2"><i className="fas fa-circle-exclamation text-red-500 mt-1 text-xs" /> 62% women-led &amp; 71% rural MSMEs left out</li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">How We Support MSMEs</p>
            <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-200">
              <li className="flex items-start gap-2"><i className="fas fa-shield-halved text-emerald-500 mt-1 text-xs" /> Collateral-free loans via CGTMSE guarantee</li>
              <li className="flex items-start gap-2"><i className="fas fa-brain text-primary mt-1 text-xs" /> 0–1000 score from GST, cash-flow, UPI &amp; digital data</li>
              <li className="flex items-start gap-2"><i className="fas fa-eye text-primary mt-1 text-xs" /> Explainable AI — every rejection tells the real reason</li>
              <li className="flex items-start gap-2"><i className="fas fa-bolt text-amber-500 mt-1 text-xs" /> Disbursement within 48 hours of offer acceptance</li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Why We Win</p>
            <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-200">
              <li className="flex items-start gap-2"><i className="fas fa-book-open text-indigo-500 mt-1 text-xs" /> Backed by INFINITY 2025 published research</li>
              <li className="flex items-start gap-2"><i className="fas fa-award text-indigo-500 mt-1 text-xs" /> NMIMS Abhirva 3.0 finalist</li>
              <li className="flex items-start gap-2"><i className="fas fa-scale-balanced text-indigo-500 mt-1 text-xs" /> Gender &amp; geography-agnostic bias audits</li>
              <li className="flex items-start gap-2"><i className="fas fa-landmark text-indigo-500 mt-1 text-xs" /> RBI Account Aggregator &amp; UPI-ready consent stack</li>
            </ul>
          </div>
        </div>
      </CosmosCard>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTab('apply')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === 'apply' ? 'bg-primary text-white shadow' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
        >
          <i className="fas fa-file-signature mr-2" />
          Apply / Score
        </button>
        <button
          onClick={() => setTab('status')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === 'status' ? 'bg-primary text-white shadow' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
        >
          <i className="fas fa-chart-line mr-2" />
          My Status ({msmeApplications.length})
        </button>
        {isAdmin && (
          <button
            onClick={() => setTab('admin')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === 'admin' ? 'bg-primary text-white shadow' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
          >
            <i className="fas fa-user-shield mr-2" />
            Admin
          </button>
        )}
        {!isAdmin && (
          <button
            onClick={() => setShowAdmin((s) => !s)}
            className="ml-auto text-xs text-slate-400 hover:text-primary underline"
          >
            {showAdmin ? 'Hide admin gate' : 'Admin gate'}
          </button>
        )}
      </div>

      {showAdmin && !isAdmin && (
        <CosmosCard variant="default" header={{ title: 'Admin Access', icon: 'fa-user-shield' }}>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
            Admin dashboard requires an active admin session token. Log in via the admin portal to unlock.
          </p>
          <button
            onClick={() => {
              sessionStorage.setItem('sw-admin-token', 'sw-demo-admin-token');
              setShowAdmin(true);
              showToast('Demo admin session activated', 'info');
            }}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold"
          >
            Unlock Demo Admin
          </button>
        </CosmosCard>
      )}

      <AnimatePresence mode="wait">
        {tab === 'apply' && (
          <motion.div key="apply" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <CosmosCard variant="elevated" header={{ title: t('msme.businessDetails', 'Business Details'), icon: 'fa-building' }}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Business Name</label>
                      <input
                        value={form.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. Shree Enterprises"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Enterprise Type</label>
                      <select
                        value={form.enterpriseType}
                        onChange={(e) => handleInputChange('enterpriseType', e.target.value as MSMEScoreInput['enterpriseType'])}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                      >
                        {ENTERPRISE_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Annual Turnover (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={form.annualTurnover}
                        onChange={(e) => handleInputChange('annualTurnover', Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Employees</label>
                      <input
                        type="number"
                        min={0}
                        value={form.employees}
                        onChange={(e) => handleInputChange('employees', Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Requested Amount (₹)</label>
                      <input
                        type="number"
                        min={50000}
                        max={50000000}
                        value={form.requestedAmount}
                        onChange={(e) => handleInputChange('requestedAmount', Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tenure (months)</label>
                      <input
                        type="number"
                        min={6}
                        max={60}
                        value={form.requestedTenure}
                        onChange={(e) => handleInputChange('requestedTenure', Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">GSTIN (optional)</label>
                      <input
                        value={form.gstin}
                        onChange={(e) => handleInputChange('gstin', e.target.value.toUpperCase())}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                        placeholder="22AAAAA0000A1Z5"
                        maxLength={15}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Alternative-data signals (auto-fetched when consents are given)</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { label: 'GST Compliance', key: 'gstComplianceScore' },
                        { label: 'Cash Flow', key: 'cashFlowStabilityScore' },
                        { label: 'Transactions', key: 'transactionVolumeScore' },
                        { label: 'Digital', key: 'digitalAdoptionScore' },
                        { label: 'Credit History', key: 'creditHistoryScore' },
                      ].map((item) => (
                        <div key={item.key}>
                          <label className="block text-[10px] uppercase tracking-wide text-slate-400 mb-1">{item.label}</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={form[item.key as keyof MSMEScoreInput] as number}
                            onChange={(e) => handleInputChange(item.key as keyof MSMEScoreInput, Number(e.target.value))}
                            className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <input type="checkbox" defaultChecked readOnly className="accent-primary" />
                    <span>I consent to GST, Account Aggregator and UPI data being used for credit assessment.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full md:w-auto px-6 py-3 rounded-xl bg-primary text-white font-bold shadow hover:shadow-lg disabled:opacity-60"
                  >
                    {submitting ? 'Assessing…' : 'Score & Apply'}
                  </button>
                </form>
              </CosmosCard>
            </div>

            <div className="space-y-6">
              <CosmosCard variant="glass" header={{ title: 'How It Works', icon: 'fa-wand-magic-sparkles' }}>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex gap-3"><span className="font-bold text-primary">1.</span> Link GST, bank and UPI consents.</li>
                  <li className="flex gap-3"><span className="font-bold text-primary">2.</span> AI scores 0–1000 from 5 alternative signals.</li>
                  <li className="flex gap-3"><span className="font-bold text-primary">3.</span> Get CGTMSE-backed collateral-free offers.</li>
                  <li className="flex gap-3"><span className="font-bold text-primary">4.</span> Accept online; disbursement in 48 hours.</li>
                </ul>
              </CosmosCard>

              <CosmosCard variant="stat" header={{ title: 'Eligible Schemes', icon: 'fa-landmark' }}>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-300">CGTMSE Guarantee</span><span className="font-bold text-emerald-600">Up to ₹5 Cr</span></div>
                  <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-300">PM MUDRA</span><span className="font-bold text-emerald-600">Up to ₹10 L</span></div>
                  <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-300">PSB Loan in 59m</span><span className="font-bold text-emerald-600">₹1 Cr – ₹5 Cr</span></div>
                  <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-300">Stand-Up India</span><span className="font-bold text-emerald-600">₹10 L – ₹1 Cr</span></div>
                </div>
              </CosmosCard>
            </div>
          </motion.div>
        )}

        {tab === 'status' && (
          <motion.div key="status" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-6">
            {msmeApplications.length === 0 ? (
              <CosmosCard variant="default" header={{ title: 'No applications yet', icon: 'fa-inbox' }}>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">Submit your business details to see your AI credit score and offers.</p>
                <button onClick={() => setTab('apply')} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold">Start Application</button>
              </CosmosCard>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {msmeApplications.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedAppId(app.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${selectedAppId === app.id || (selectedAppId === null && app === msmeApplications[0]) ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                    >
                      {app.applicationRef}
                    </button>
                  ))}
                </div>

                {currentApplication && currentScore && (
                  <div className="grid lg:grid-cols-3 gap-6">
                    <CosmosCard variant="gradient" className="lg:col-span-1" header={{ title: 'Credit Score', icon: 'fa-gauge-high' }}>
                      <div className="flex flex-col items-center py-4">
                        <div className="relative w-40 h-40">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" fill="none" />
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              stroke="currentColor"
                              strokeWidth="8"
                              strokeDasharray={`${(currentScore.score / 1000) * 264} 264`}
                              strokeLinecap="round"
                              className={scoreColorClass(currentScore.score)}
                              fill="none"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-3xl font-black ${scoreColorClass(currentScore.score)}`}>{currentScore.score}</span>
                            <span className="text-[10px] uppercase text-slate-400">of 1000</span>
                          </div>
                        </div>
                        <span className={`mt-4 px-3 py-1 rounded-full text-xs font-bold ${decisionBadge(currentApplication.decision || '')}`}>
                          {currentApplication.decision?.replace(/_/g, ' ')}
                        </span>
                        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">{currentScore.category.replace(/_/g, ' ')}</p>
                      </div>
                    </CosmosCard>

                    <CosmosCard variant="elevated" className="lg:col-span-2" header={{ title: 'Explainable AI (XAI)', icon: 'fa-lightbulb' }}>
                      <p className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border-l-4 border-primary mb-4">
                        {currentScore.eli5}
                      </p>
                      <div className="space-y-3">
                        {currentScore.factors.map((f) => (
                          <FactorBar key={f.factor} factor={f} />
                        ))}
                      </div>
                    </CosmosCard>

                    <CosmosCard variant="default" className="lg:col-span-3" header={{ title: 'Conditions & Next Steps', icon: 'fa-clipboard-check' }}>
                      <ul className="grid md:grid-cols-2 gap-2">
                        {currentApplication.decisionReason?.split('; ').map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                            <i className="fas fa-check text-emerald-500 mt-0.5" /> {c}
                          </li>
                        ))}
                      </ul>
                    </CosmosCard>

                    <CosmosCard variant="default" className="lg:col-span-2" header={{ title: 'Improvement Roadmap', icon: 'fa-person-walking-arrow-right' }}>
                      <div className="space-y-3">
                        {currentScore.recommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{rec.action}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Timeline: {rec.timeline}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${rec.priority === 'HIGH' ? 'bg-red-100 text-red-700' : rec.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                              {rec.impact}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CosmosCard>

                    <CosmosCard variant="glass" header={{ title: 'Fraud & Fairness Signals', icon: 'fa-shield-halved' }}>
                      {currentScore.fraudSignals.length === 0 ? (
                        <p className="text-sm text-emerald-600 font-medium"><i className="fas fa-check-circle mr-1" /> No adverse signals detected.</p>
                      ) : (
                        <ul className="space-y-2">
                          {currentScore.fraudSignals.map((s, i) => (
                            <li key={i} className={`text-sm p-2 rounded border-l-4 ${s.severity === 'high' ? 'bg-red-50 border-red-500 text-red-700' : s.severity === 'medium' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-blue-50 border-blue-500 text-blue-700'}`}>
                              {s.message}
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                        Bias audit: gender, geography and caste-agnostic scoring. Model fairness monitored continuously.
                      </p>
                    </CosmosCard>

                    {currentOffers.length > 0 && (
                      <div className="lg:col-span-3">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">CGTMSE-Backed Loan Offers</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {currentOffers.map((offer) => (
                            <OfferCard key={offer.id} offer={offer} onAccept={() => handleAcceptOffer(offer)} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {tab === 'admin' && isAdmin && (
          <motion.div key="admin" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
            {adminLoading ? (
              <div className="p-12 text-center text-slate-400">Loading admin metrics…</div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatTile label="Loans Disbursed" value={adminStats.totalLoansDisbursed.toLocaleString('en-IN')} icon="fa-hand-holding-dollar" />
                  <StatTile label="Active MSMEs" value={adminStats.activeMSMEs.toLocaleString('en-IN')} icon="fa-users" />
                  <StatTile label="Avg Ticket Size" value={formatCurrency(adminStats.averageTicketSize)} icon="fa-sack-dollar" />
                  <StatTile label="Portfolio PAR" value={`${adminStats.portfolioPAR}%`} icon="fa-chart-pie" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <StatTile label="Total Applications" value={adminStats.totalApplications.toLocaleString('en-IN')} icon="fa-file-lines" />
                  <StatTile label="Approved" value={adminStats.approved.toLocaleString('en-IN')} icon="fa-circle-check" color="text-emerald-600" />
                  <StatTile label="Rejected" value={adminStats.rejected.toLocaleString('en-IN')} icon="fa-circle-xmark" color="text-red-500" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <StatTile label="Women-led MSMEs" value={`${adminStats.womenLedMSMEs}%`} icon="fa-venus" />
                  <StatTile label="Rural Reach" value={`${adminStats.ruralReach}%`} icon="fa-map-location-dot" />
                  <StatTile label="CGTMSE Claims" value={adminStats.cgstmseClaims.toLocaleString('en-IN')} icon="fa-shield-heart" />
                </div>

                <CosmosCard variant="elevated" header={{ title: 'Recent Applications', icon: 'fa-list' }}>
                  {msmeApplications.length === 0 ? (
                    <p className="text-sm text-slate-500">No applications in this session yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700">
                            <th className="py-2">Ref</th>
                            <th className="py-2">Business</th>
                            <th className="py-2">Type</th>
                            <th className="py-2">Amount</th>
                            <th className="py-2">Score</th>
                            <th className="py-2">Decision</th>
                          </tr>
                        </thead>
                        <tbody>
                          {msmeApplications.map((app) => {
                            const sc = msmeScores[app.id];
                            return (
                              <tr key={app.id} className="border-b border-slate-50 dark:border-slate-800">
                                <td className="py-2 font-mono text-xs">{app.applicationRef}</td>
                                <td className="py-2">{app.businessName}</td>
                                <td className="py-2 capitalize">{app.enterpriseType}</td>
                                <td className="py-2">{formatCurrency(app.requestedAmount)}</td>
                                <td className="py-2 font-bold">{sc?.score ?? '—'}</td>
                                <td className="py-2">
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${decisionBadge(app.decision || '')}`}>
                                    {app.decision?.replace(/_/g, ' ')}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CosmosCard>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FactorBar({ factor }: { factor: MSMEScoreFactor }) {
  const pct = Math.min(100, Math.max(0, (factor.score / factor.maxScore) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-semibold text-slate-700 dark:text-slate-200">{factor.factor}</span>
        <span className="text-slate-500 dark:text-slate-400">{factor.score}/{factor.maxScore} · {factor.weight}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
        />
      </div>
    </div>
  );
}

function OfferCard({ offer, onAccept }: { offer: MSMEOffer; onAccept: () => void }) {
  return (
    <CosmosCard variant="elevated" header={{ title: offer.offerType === 'primary' ? 'Recommended Offer' : 'Lower EMI Option', icon: 'fa-file-invoice-dollar' }}>
      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div><p className="text-xs text-slate-400">Principal</p><p className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(offer.principalAmount)}</p></div>
        <div><p className="text-xs text-slate-400">Interest</p><p className="font-bold text-slate-800 dark:text-slate-100">{offer.interestRate}% p.a.</p></div>
        <div><p className="text-xs text-slate-400">EMI</p><p className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(offer.emiAmount)}/mo</p></div>
        <div><p className="text-xs text-slate-400">Tenure</p><p className="font-bold text-slate-800 dark:text-slate-100">{offer.tenureMonths} months</p></div>
        <div><p className="text-xs text-slate-400">CGTMSE Cover</p><p className="font-bold text-emerald-600">{offer.cgtmseGuaranteePercent}%</p></div>
        <div><p className="text-xs text-slate-400">Collateral</p><p className="font-bold text-emerald-600">{offer.collateralRequired ? 'Required' : 'Not required'}</p></div>
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Total repayment {formatCurrency(offer.totalRepayment)} · Interest {formatCurrency(offer.totalInterest)} · Processing fee {formatCurrency(offer.processingFee)}
      </div>
      <button
        onClick={onAccept}
        disabled={offer.status === 'accepted'}
        className={`w-full py-2 rounded-lg font-bold text-sm ${offer.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-primary text-white hover:shadow'}`}
      >
        {offer.status === 'accepted' ? 'Accepted' : 'Accept Offer'}
      </button>
    </CosmosCard>
  );
}

function StatTile({ label, value, icon, color = 'text-primary' }: { label: string; value: string; icon: string; color?: string }) {
  return (
    <CosmosCard variant="stat" className="flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-black text-slate-800 dark:text-slate-100">{value}</p>
      </div>
      <i className={`fas ${icon} text-2xl ${color}`} />
    </CosmosCard>
  );
}

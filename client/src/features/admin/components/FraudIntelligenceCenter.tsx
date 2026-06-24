import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, List, Share2, Clock, ShieldAlert, FileDown, ScrollText, BarChart3,
  RefreshCw, AlertTriangle, CheckCircle2, Eye, HelpCircle
} from 'lucide-react';
import { useFraudCases } from '@/features/admin/hooks/useFraudCases';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { FraudCase } from '@/features/admin/lib/fraudTypes';
import FraudCaseExplorer from './FraudCaseExplorer';
import FraudCaseDetail from './FraudCaseDetail';
import FraudMapView from './FraudMapView';
import FraudTraceGraph from './FraudTraceGraph';
import FraudTimeline from './FraudTimeline';
import FraudRiskExplainer from './FraudRiskExplainer';
import FraudExportPanel from './FraudExportPanel';
import FraudRulesPanel from './FraudRulesPanel';

export default function FraudIntelligenceCenter() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'map' | 'cases' | 'trace' | 'timeline' | 'risk' | 'rules' | 'reports'>('cases');
  const [selectedCase, setSelectedCase] = useState<FraudCase | null>(null);
  const { cases, loading, error, filters, setFilters, pagination, setPage, refresh, stats, statsLoading } = useFraudCases({ limit: 25 });

  const tabs = [
    { key: 'map', label: t('fraudIntelTabMap'), icon: Map },
    { key: 'cases', label: t('fraudIntelTabCases'), icon: List },
    { key: 'trace', label: t('fraudIntelTabTrace'), icon: Share2 },
    { key: 'timeline', label: t('fraudIntelTabTimeline'), icon: Clock },
    { key: 'risk', label: t('fraudIntelTabRisk'), icon: HelpCircle },
    { key: 'rules', label: t('fraudIntelTabRules'), icon: ShieldAlert },
    { key: 'reports', label: t('fraudIntelTabReports'), icon: FileDown },
  ] as const;

  const statCards = [
    { label: t('fraudIntelTotalCases'), value: stats?.totalCases ?? 0, icon: ScrollText, color: 'text-blue-500' },
    { label: t('fraudIntelCriticalRisk'), value: stats?.highRiskCases ?? 0, icon: AlertTriangle, color: 'text-red-500' },
    { label: t('fraudIntelSanctionedHops'), value: stats?.sanctionedCases ?? 0, icon: ShieldAlert, color: 'text-amber-500' },
    { label: t('fraudIntelTotalInrTraced'), value: `₹${((stats?.totalInrAmount ?? 0) / 100000).toFixed(1)}L`, icon: BarChart3, color: 'text-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Eye className="w-7 h-7 text-indigo-500" />
              {t('fraudIntelTitle')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {t('fraudIntelSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {t('fraudIntelRefresh')}
            </button>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {t('fraudIntelSyntheticBadge')}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{s.label}</p>
                  <p className="text-xl md:text-2xl font-bold mt-1">
                    {statsLoading ? '—' : s.value}
                  </p>
                </div>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'map' && <FraudMapView cases={cases} loading={loading} />}
            {activeTab === 'cases' && (
              <FraudCaseExplorer
                cases={cases}
                loading={loading}
                error={error}
                filters={filters}
                setFilters={setFilters}
                pagination={pagination}
                onPageChange={setPage}
                onSelectCase={setSelectedCase}
                selectedCase={selectedCase}
              />
            )}
            {activeTab === 'trace' && <FraudTraceGraph cases={cases} selectedCase={selectedCase} onSelectCase={setSelectedCase} />}
            {activeTab === 'timeline' && <FraudTimeline cases={cases} selectedCase={selectedCase} onSelectCase={setSelectedCase} />}
            {activeTab === 'risk' && <FraudRiskExplainer cases={cases} selectedCase={selectedCase} />}
            {activeTab === 'rules' && <FraudRulesPanel />}
            {activeTab === 'reports' && <FraudExportPanel />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Case detail drawer */}
      <AnimatePresence>
        {selectedCase && (
          <FraudCaseDetail
            caseData={selectedCase}
            onClose={() => setSelectedCase(null)}
            onUpdate={refresh}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

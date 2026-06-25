import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map as MapIcon, List, Share2, Clock, ShieldAlert, FileDown, ScrollText, BarChart3,
  RefreshCw, AlertTriangle, Eye, HelpCircle, Radio, Zap,
  Activity, Sparkles, ChevronRight, Bell
} from 'lucide-react';
import { useFraudCases } from '@/features/admin/hooks/useFraudCases';
import { fraudService } from '@/features/admin/services/fraudService';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { generateLiveMockCase } from '@/features/admin/lib/fraudDataGenerator';
import type { FraudCase, FraudTimeRange } from '@/features/admin/lib/fraudTypes';
import FraudCaseExplorer from './FraudCaseExplorer';
import FraudCaseDetail from './FraudCaseDetail';
import FraudMapView from './FraudMapView';
import FraudTraceGraph from './FraudTraceGraph';
import FraudTimeline from './FraudTimeline';
import FraudRiskExplainer from './FraudRiskExplainer';
import FraudExportPanel from './FraudExportPanel';
import FraudRulesPanel from './FraudRulesPanel';

interface LiveLogEntry {
  id: string;
  caseRef: string;
  message: string;
  time: string;
}

export default function FraudIntelligenceCenter() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'map' | 'cases' | 'trace' | 'timeline' | 'risk' | 'rules' | 'reports'>('cases');
  const [selectedCase, setSelectedCase] = useState<FraudCase | null>(null);
  const [liveMode, setLiveMode] = useState(false);
  const [liveCases, setLiveCases] = useState<FraudCase[]>([]);
  const [liveLog, setLiveLog] = useState<LiveLogEntry[]>([]);
  const [simulating, setSimulating] = useState(false);
  const { cases, loading, error, filters, setFilters, pagination, setPage, refresh, stats, statsLoading, isLocalMock, mutateLocalCase } = useFraudCases({ limit: 25 });
  const liveIntervalRef = useRef<number | null>(null);

  const TIME_RANGES: { key: FraudTimeRange; label: string }[] = [
    { key: 'live', label: 'Live' },
    { key: '7d', label: '7D' },
    { key: '1m', label: '1M' },
    { key: '1y', label: '1Y' },
    { key: '10y', label: '10Y' },
    { key: 'all', label: 'All' },
  ];

  const setTimeRange = (range: FraudTimeRange) => {
    setFilters(prev => ({ ...prev, timeRange: range, page: 1 }));
    setLiveMode(range === 'live');
  };

  const allCases = useCallback(() => {
    const map = new Map<number, FraudCase>();
    liveCases.forEach(c => map.set(c.id, c));
    cases.forEach(c => { if (!map.has(c.id)) map.set(c.id, c); });
    return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [liveCases, cases]);

  const addLiveLog = useCallback((caseRef: string, message: string) => {
    const entry = { id: `${Date.now()}-${Math.random()}`, caseRef, message, time: new Date().toLocaleTimeString('en-IN') };
    setLiveLog(prev => [entry, ...prev].slice(0, 30));
  }, []);

  useEffect(() => {
    if (activeTab === 'map' && filters.timeRange !== 'live') {
      setTimeRange('live');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (!liveMode) {
      if (liveIntervalRef.current) {
        window.clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }
      return;
    }

    injectMockCases(1);

    liveIntervalRef.current = window.setInterval(() => {
      injectMockCases(1);
      fetchRecentLive();
    }, 4000);

    return () => {
      if (liveIntervalRef.current) {
        window.clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }
    };
  }, [liveMode]);

  function mergeLiveCases(created: FraudCase[]) {
    setLiveCases(prev => {
      const map = new Map(prev.map(c => [c.id, c]));
      created.forEach(c => map.set(c.id, c));
      return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 200);
    });
    created.forEach(c => {
      const dest = c.hops?.[c.hops.length - 1]?.nodeName || 'unknown';
      addLiveLog(c.caseRef, `Traced to ${dest} · Risk ${c.riskScore}`);
    });
  }

  async function injectMockCases(count = 1) {
    setSimulating(true);
    try {
      const created = await fraudService.simulateCases(count);
      mergeLiveCases(created);
    } catch (err: any) {
      console.warn('Backend simulation unavailable, using client-side mock', err);
      const localCreated = Array.from({ length: count }, (_, i) =>
        generateLiveMockCase(-(Date.now() + i))
      );
      mergeLiveCases(localCreated);
    } finally {
      setSimulating(false);
    }
  }

  async function fetchRecentLive() {
    if (isLocalMock) return;
    try {
      const recent = await fraudService.getLiveCases(10);
      if (recent.length) {
        setLiveCases(prev => {
          const map = new Map(prev.map(c => [c.id, c]));
          recent.forEach(c => map.set(c.id, c));
          return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 200);
        });
      }
    } catch (err) {
      console.error('Live feed poll error', err);
    }
  }

  const tabs = [
    { key: 'map', label: t('fraudIntelTabMap'), icon: MapIcon },
    { key: 'cases', label: t('fraudIntelTabCases'), icon: List },
    { key: 'trace', label: t('fraudIntelTabTrace'), icon: Share2 },
    { key: 'timeline', label: t('fraudIntelTabTimeline'), icon: Clock },
    { key: 'risk', label: t('fraudIntelTabRisk'), icon: HelpCircle },
    { key: 'rules', label: t('fraudIntelTabRules'), icon: ShieldAlert },
    { key: 'reports', label: t('fraudIntelTabReports'), icon: FileDown },
  ] as const;

  const statCards = [
    { label: t('fraudIntelTotalCases'), value: stats?.totalCases ?? 0, sub: 'active investigations', icon: ScrollText, gradient: 'from-blue-500 to-indigo-600' },
    { label: t('fraudIntelCriticalRisk'), value: stats?.highRiskCases ?? 0, sub: 'require immediate action', icon: AlertTriangle, gradient: 'from-rose-500 to-red-600' },
    { label: t('fraudIntelSanctionedHops'), value: stats?.sanctionedCases ?? 0, sub: 'jurisdictional alerts', icon: ShieldAlert, gradient: 'from-amber-500 to-orange-600' },
    { label: t('fraudIntelTotalInrTraced'), value: `₹${((stats?.totalInrAmount ?? 0) / 100000).toFixed(1)}L`, sub: 'flowing across trails', icon: BarChart3, gradient: 'from-emerald-500 to-teal-600' },
  ];

  const displayCases = allCases();
  const tickerItems = liveLog.slice(0, 12);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-5">
        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl"
        >
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(99,102,241,0.4) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(239,68,68,0.25) 0%, transparent 40%)' }} />
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" /> {t('fraudIntelSyntheticBadge')}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
                <Eye className="w-8 h-8 text-indigo-400" />
                {t('fraudIntelTitle')}
              </h1>
              <p className="text-indigo-100/80 text-sm max-w-xl">
                {t('fraudIntelSubtitle')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isLocalMock && (
                <span className="text-xs px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/30 flex items-center gap-1.5 backdrop-blur">
                  <Bell className="w-3 h-3" /> {t('fraudIntelLocalMockWarning')}
                </span>
              )}
              <button
                onClick={() => setLiveMode(v => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all shadow-lg ${
                  liveMode
                    ? 'bg-red-500/15 text-red-100 border-red-400/40 shadow-red-500/20 hover:bg-red-500/25'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur'
                }`}
              >
                <Radio className={`w-4 h-4 ${liveMode ? 'animate-pulse' : ''}`} />
                {liveMode ? t('fraudIntelStopLive') : t('fraudIntelStartLive')}
              </button>
              <button
                onClick={() => injectMockCases(10)}
                disabled={simulating}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-slate-900 text-sm font-semibold shadow-lg shadow-amber-500/25 hover:bg-amber-400 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                {t('fraudIntelSimulateBurst')}
              </button>
              <button
                onClick={refresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 text-sm font-semibold hover:bg-white/20 disabled:opacity-50 backdrop-blur"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {t('fraudIntelRefresh')}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Time range pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-fit"
        >
          <span className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Window
          </span>
          {TIME_RANGES.map((r) => {
            const active = filters.timeRange === r.key || (r.key === 'all' && !filters.timeRange);
            return (
              <button
                key={r.key}
                onClick={() => setTimeRange(r.key)}
                className={`relative px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {r.key === 'live' && active && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
                {r.label}
              </button>
            );
          })}
        </motion.div>

        {/* Live marquee ticker */}
        <AnimatePresence>
          {liveMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="relative rounded-2xl bg-slate-900 border border-indigo-500/30 overflow-hidden shadow-lg">
                <div className="flex items-center gap-3 px-4 py-2 bg-indigo-600/10 border-b border-indigo-500/20">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    <Activity className="w-3.5 h-3.5" /> {t('fraudIntelLiveTraceFeed')}
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                  </span>
                  <button onClick={() => setLiveLog([])} className="ml-auto text-[10px] text-indigo-300 hover:text-white transition-colors">{t('fraudIntelLiveClear')}</button>
                </div>
                <div className="py-2.5 overflow-hidden">
                  {tickerItems.length === 0 ? (
                    <div className="px-4 text-xs text-slate-500">{t('fraudIntelLiveWaiting')}</div>
                  ) : (
                    <div className="whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
                      {tickerItems.map((entry, i) => (
                        <span key={entry.id} className="inline-flex items-center gap-2 px-3 py-1.5 mx-2 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-bold text-indigo-300">{entry.caseRef}</span>
                          <span className="text-slate-300">{entry.message}</span>
                          <span className="text-[10px] text-slate-500">{entry.time}</span>
                          {i < tickerItems.length - 1 && <ChevronRight className="w-3 h-3 text-slate-600" />}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s, idx) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.05 }}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${s.gradient}`} />
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${s.gradient} opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl md:text-3xl font-extrabold mt-1">
                    {statsLoading ? '—' : s.value}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-lg`}>
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md scale-105'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'map' && <FraudMapView cases={displayCases} loading={loading} highlightCases={liveCases} />}
            {activeTab === 'cases' && (
              <FraudCaseExplorer
                cases={displayCases}
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
            {activeTab === 'trace' && <FraudTraceGraph cases={displayCases} selectedCase={selectedCase} onSelectCase={setSelectedCase} />}
            {activeTab === 'timeline' && <FraudTimeline cases={displayCases} selectedCase={selectedCase} onSelectCase={setSelectedCase} />}
            {activeTab === 'risk' && <FraudRiskExplainer cases={displayCases} selectedCase={selectedCase} />}
            {activeTab === 'rules' && <FraudRulesPanel />}
            {activeTab === 'reports' && <FraudExportPanel />}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
      `}</style>

      {/* Case detail drawer */}
      <AnimatePresence>
        {selectedCase && (
          <FraudCaseDetail
            caseData={selectedCase}
            onClose={() => setSelectedCase(null)}
            onUpdate={refresh}
            isMock={isLocalMock}
            onLocalUpdate={(updated) => {
              mutateLocalCase(updated.id, updated);
              setSelectedCase(prev => (prev?.id === updated.id ? updated : prev));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

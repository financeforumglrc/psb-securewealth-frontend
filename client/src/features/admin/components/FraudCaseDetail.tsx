import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, MapPin, Banknote, User, Globe, ShieldAlert, Clock, MessageSquare,
  CheckCircle2, AlertTriangle, FileText, Flag
} from 'lucide-react';
import { fraudService, statusColor, priorityColor, categoryLabel } from '@/features/admin/services/fraudService';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { FraudCase, FraudHop, FraudNote, FraudStatus } from '@/features/admin/lib/fraudTypes';

interface Props {
  caseData: FraudCase;
  onClose: () => void;
  onUpdate: () => void;
  isMock?: boolean;
  onLocalUpdate?: (updated: FraudCase) => void;
}

const ACTION_OPTIONS = [
  { key: 'acknowledge', label: 'Acknowledge', icon: CheckCircle2 },
  { key: 'investigate', label: 'Start Investigation', icon: FileText },
  { key: 'escalate', label: 'Escalate', icon: AlertTriangle },
  { key: 'close', label: 'Close Case', icon: CheckCircle2 },
  { key: 'false_positive', label: 'False Positive', icon: Flag },
];

function HopRow({ hop, isLast }: { hop: FraudHop; isLast: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${hop.isSanctioned ? 'bg-red-500' : hop.hopType === 'origin' ? 'bg-emerald-500' : hop.hopType === 'destination' ? 'bg-indigo-500' : 'bg-amber-500'}`} />
        {!isLast && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 my-1" />}
      </div>
      <div className="pb-5 flex-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm">{hop.nodeName}</p>
          {hop.isSanctioned && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
              Sanctioned
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {categoryLabel(hop.hopType)} · {hop.institution || hop.entityType} · {hop.entityValue}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
          {hop.amount.toLocaleString('en-IN')} {hop.currency} · Confidence {hop.confidence}% · {new Date(hop.timestamp).toLocaleString('en-IN')}
        </p>
        {hop.evidenceJson?.txId && (
          <p className="text-[10px] text-slate-400 mt-1">TX: {hop.evidenceJson.txId}</p>
        )}
      </div>
    </div>
  );
}

export default function FraudCaseDetail({ caseData, onClose, onUpdate, isMock, onLocalUpdate }: Props) {
  const { t } = useTranslation();
  const [fullCase, setFullCase] = useState<FraudCase>(caseData);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'hops' | 'accounts' | 'notes' | 'actions'>('overview');
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isMock) {
      setFullCase(caseData);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    fraudService.getCase(caseData.id).then(c => {
      if (mounted) setFullCase(c);
    }).catch(err => {
      console.error('Failed to load full case', err);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [caseData.id, isMock]);

  const handleAction = async (action: string) => {
    setActionLoading(true);
    try {
      if (isMock) {
        const statusMap: Record<string, FraudStatus> = {
          acknowledge: 'investigating',
          investigate: 'investigating',
          escalate: 'escalated',
          close: 'closed',
          false_positive: 'false_positive',
        };
        const updated: FraudCase = {
          ...fullCase,
          status: statusMap[action] || fullCase.status,
          updatedAt: new Date().toISOString(),
        };
        setFullCase(updated);
        onLocalUpdate?.(updated);
        setNote('');
        onUpdate();
        return;
      }
      await fraudService.applyAction(fullCase.id, action, note || undefined);
      const updated = await fraudService.getCase(fullCase.id);
      setFullCase(updated);
      setNote('');
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setActionLoading(true);
    try {
      if (isMock) {
        const text = note.trim();
        const entry: FraudNote = {
          id: Date.now(),
          fraudCaseId: fullCase.id,
          adminId: 'admin_local',
          note: text,
          createdAt: new Date().toISOString(),
        };
        const updated: FraudCase = {
          ...fullCase,
          notes: [...(fullCase.notes || []), entry],
          updatedAt: new Date().toISOString(),
        };
        setFullCase(updated);
        onLocalUpdate?.(updated);
        setNote('');
        setActiveTab('notes');
        return;
      }
      await fraudService.addNote(fullCase.id, note.trim());
      const updated = await fraudService.getCase(fullCase.id);
      setFullCase(updated);
      setNote('');
      setActiveTab('notes');
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    { key: 'overview', label: t('fraudIntelOverview'), icon: FileText },
    { key: 'hops', label: `${t('fraudIntelMoneyTrail')} (${fullCase.hops?.length || 0})`, icon: MapPin },
    { key: 'accounts', label: `${t('fraudIntelAccounts')} (${fullCase.accounts?.length || 0})`, icon: Banknote },
    { key: 'notes', label: `${t('fraudIntelNotes')} (${fullCase.notes?.length || 0})`, icon: MessageSquare },
    { key: 'actions', label: t('fraudIntelActions'), icon: ShieldAlert },
  ] as const;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000]"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-[10001] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              {fullCase.caseRef}
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor(fullCase.status)}`}>
                {fullCase.status.replace(/_/g, ' ')}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{categoryLabel(fullCase.category)} · Risk {fullCase.riskScore}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {loading && (
            <div className="space-y-3">
              <div className="h-32 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />
              <div className="h-48 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />
            </div>
          )}

          {!loading && (
            <>
              {/* Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                        active ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-sm leading-relaxed">{fullCase.summary}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('fraudIntelPriority')}</p>
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded border ${priorityColor(fullCase.priority)}`}>{fullCase.priority}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('fraudIntelAssigned')}</p>
                      <p className="text-sm font-medium mt-1">{fullCase.assignedAdminId || t('fraudIntelUnassigned')}</p>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('fraudIntelCreated')}</p>
                      <p className="text-sm font-medium mt-1">{new Date(fullCase.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('date')}</p>
                      <p className="text-sm font-medium mt-1">{new Date(fullCase.updatedAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t('fraudIntelRiskFactors')}</p>
                    <div className="flex flex-wrap gap-2">
                      {fullCase.riskFactors.map(f => (
                        <span key={f} className="text-xs px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                          {f.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t('fraudIntelCountryRiskTags')}</p>
                    <div className="flex flex-wrap gap-2">
                      {fullCase.countryRiskTags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'hops' && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  {(fullCase.hops || []).map((hop, i, arr) => (
                    <HopRow key={hop.id} hop={hop} isLast={i === arr.length - 1} />
                  ))}
                </div>
              )}

              {activeTab === 'accounts' && (
                <div className="space-y-3">
                  {(fullCase.accounts || []).map(acc => (
                    <div key={acc.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-500" />
                          {acc.holderName}
                        </p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase">
                          {acc.accountType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{acc.bankName} · {acc.branch}</p>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div><span className="text-slate-400">Account:</span> {acc.maskedAccount}</div>
                        <div><span className="text-slate-400">Country:</span> {acc.country}</div>
                        {acc.ifsc && <div><span className="text-slate-400">IFSC:</span> {acc.ifsc}</div>}
                        {acc.swiftBic && <div><span className="text-slate-400">SWIFT:</span> {acc.swiftBic}</div>}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {acc.riskFlags.map(flag => (
                          <span key={flag} className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                            {flag.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t('fraudIntelAddNotePlaceholder')}
                      className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={actionLoading || !note.trim()}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-50"
                    >
                      {t('fraudIntelAddNote')}
                    </button>
                  </div>
                  {(fullCase.notes || []).length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">{t('fraudIntelNoNotes')}</p>
                  ) : (
                    (fullCase.notes || []).map(n => (
                      <div key={n.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {n.adminId || 'System'} · {new Date(n.createdAt).toLocaleString('en-IN')}
                        </p>
                        <p className="text-sm mt-1">{n.note}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'actions' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-medium mb-2">{t('fraudIntelUpdateStatus')}</p>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t('fraudIntelStatusNotePlaceholder')}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm mb-3"
                      rows={3}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ACTION_OPTIONS.map(a => {
                        const Icon = a.icon;
                        return (
                          <button
                            key={a.key}
                            onClick={() => handleAction(a.key)}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium disabled:opacity-50"
                          >
                            <Icon className="w-4 h-4 text-indigo-500" />
                            {a.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}

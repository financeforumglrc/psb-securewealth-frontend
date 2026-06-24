import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Plus, Trash2, ToggleLeft, ToggleRight, AlertTriangle, Bell, Ban, Flag } from 'lucide-react';
import { fraudService } from '@/features/admin/services/fraudService';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { FraudRule } from '@/features/admin/lib/fraudTypes';

const ACTION_ICONS: Record<string, React.ElementType> = {
  flag: Flag,
  notify: Bell,
  block: Ban,
};

export default function FraudRulesPanel() {
  const { t } = useTranslation();
  const [rules, setRules] = useState<FraudRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', severity: 'high' as const, action: 'flag' as const, minRisk: 75, enabled: true });

  const load = async () => {
    setLoading(true);
    try {
      const data = await fraudService.getRules();
      setRules(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      await fraudService.createRule({
        name: form.name,
        severity: form.severity,
        action: form.action,
        enabled: form.enabled,
        conditionJson: { riskScore: { gte: form.minRisk }, categories: ['mule_transfer', 'account_takeover'] },
      });
      setForm({ name: '', severity: 'high', action: 'flag', minRisk: 75, enabled: true });
      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to create rule');
    }
  };

  const toggleRule = async (rule: FraudRule) => {
    try {
      await fraudService.updateRule(rule.id, { enabled: !rule.enabled });
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to update rule');
    }
  };

  const deleteRule = async (id: number) => {
    if (!confirm('Delete this rule?')) return;
    try {
      await fraudService.deleteRule(id);
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to delete rule');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-500" />
            {t('fraudIntelRulesTitle')}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('fraudIntelRulesSubtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          {t('fraudIntelNewRule')}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={t('fraudIntelRuleName')}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              />
              <select
                value={form.severity}
                onChange={(e) => setForm(f => ({ ...f, severity: e.target.value as any }))}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              >
                <option value="low">{t('riskLow')}</option>
                <option value="medium">{t('riskMedium')}</option>
                <option value="high">{t('riskHigh')}</option>
                <option value="critical">{t('riskHigh')}</option>
              </select>
              <select
                value={form.action}
                onChange={(e) => setForm(f => ({ ...f, action: e.target.value as any }))}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              >
                <option value="flag">{t('fraudIntelFlagCase')}</option>
                <option value="notify">{t('fraudIntelNotifyAdmin')}</option>
                <option value="block">{t('fraudIntelBlockTransaction')}</option>
              </select>
              <input
                type="number"
                value={form.minRisk}
                onChange={(e) => setForm(f => ({ ...f, minRisk: parseInt(e.target.value, 10) || 0 }))}
                placeholder={t('fraudIntelMinRiskScore')}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="ruleEnabled"
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm(f => ({ ...f, enabled: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300"
              />
              <label htmlFor="ruleEnabled" className="text-sm">{t('fraudIntelEnableRule')}</label>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium">{t('fraudIntelCreateRule')}</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">{t('fraudIntelCancel')}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <AlertTriangle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500 dark:text-slate-400">{t('fraudIntelNoRules')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => {
            const Icon = ACTION_ICONS[rule.action] || Flag;
            return (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${rule.enabled ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{rule.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {rule.action} · {rule.severity} · {rule.enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRule(rule)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title={rule.enabled ? 'Disable' : 'Enable'}
                  >
                    {rule.enabled ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

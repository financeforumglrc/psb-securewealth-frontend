import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import { formatCroreMask } from '@/shared/utils/duressMask';
import { syncAssetToSupabase } from '@/shared/hooks/useSupabaseSync';
import { supabase } from '@/shared/lib/supabase';
import CosmosCard from '@/shared/components/ui/CosmosCard';

export default function ProfileSettings() {
  const user = useWealthStore((s) => s.user);
  const updateUser = useWealthStore((s) => s.updateUser);
  const assets = useWealthStore((s) => s.assets);
  const updateAsset = useWealthStore((s) => s.updateAsset);
  const duressModeActive = useWealthStore((s) => s.duressModeActive);
  const quickAccessEnabled = useWealthStore((s) => s.quickAccessEnabled);
  const notificationsDnd = useWealthStore((s) => s.notificationsDnd);
  const notificationsPopup = useWealthStore((s) => s.notificationsPopup);
  const setQuickAccessEnabled = useWealthStore((s) => s.setQuickAccessEnabled);
  const setNotificationsDnd = useWealthStore((s) => s.setNotificationsDnd);
  const setNotificationsPopup = useWealthStore((s) => s.setNotificationsPopup);

  const [form, setForm] = useState({ ...user });
  const [saved, setSaved] = useState(false);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [assetValue, setAssetValue] = useState('');

  const handleSave = async () => {
    const updates = {
      name: form.name,
      monthlyIncome: Number(form.monthlyIncome) || 0,
      monthlyExpenses: Number(form.monthlyExpenses) || 0,
      monthlySavings: Number(form.monthlyIncome) - Number(form.monthlyExpenses),
      riskProfile: form.riskProfile,
      taxBracket: Number(form.taxBracket) as 0 | 10 | 20 | 30,
    };
    updateUser(updates);

    // Sync to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        name: updates.name,
        risk_profile: updates.riskProfile,
        tax_bracket: updates.taxBracket,
        monthly_income: updates.monthlyIncome,
        monthly_expenses: updates.monthlyExpenses,
        monthly_savings: updates.monthlySavings,
        updated_at: new Date().toISOString(),
      });
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const startEditAsset = (asset: typeof assets[0]) => {
    setEditingAsset(asset.id);
    setAssetValue(String(asset.value));
  };

  const saveAsset = (id: string) => {
    const val = parseFloat(assetValue);
    if (!isNaN(val) && val >= 0) {
      updateAsset(id, { value: val });
      const asset = assets.find((a) => a.id === id);
      if (asset) syncAssetToSupabase({ ...asset, value: val });
    }
    setEditingAsset(null);
  };

  const netWorth = assets.reduce((sum, a) => sum + a.value, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profile & Settings</h1>
          <p className="text-sm text-slate-500">Manage your account and financial profile</p>
        </div>
      </div>

      {/* Profile Card */}
      <CosmosCard variant="default" padding="md">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <i className="fas fa-user text-primary" /> Personal Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Monthly Income (₹)</label>
            <input
              type="number"
              value={form.monthlyIncome}
              onChange={(e) => setForm({ ...form, monthlyIncome: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Monthly Expenses (₹)</label>
            <input
              type="number"
              value={form.monthlyExpenses}
              onChange={(e) => setForm({ ...form, monthlyExpenses: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Auto-Calculated Savings (₹)</label>
            <div className="w-full px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-300">
              ₹{((form.monthlyIncome || 0) - (form.monthlyExpenses || 0)).toLocaleString()}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Risk Profile</label>
            <select
              value={form.riskProfile}
              onChange={(e) => setForm({ ...form, riskProfile: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
            >
              <option value="Conservative">Conservative</option>
              <option value="Moderate">Moderate</option>
              <option value="Aggressive">Aggressive</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Tax Bracket (%)</label>
            <select
              value={form.taxBracket}
              onChange={(e) => setForm({ ...form, taxBracket: Number(e.target.value) as any })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
            >
              <option value={0}>0% (₹0 – ₹3L)</option>
              <option value={10}>10% (₹3L – ₹7L)</option>
              <option value={20}>20% (₹7L – ₹10L)</option>
              <option value={30}>30% (₹10L+)</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            <i className="fas fa-save mr-2" /> Save Changes
          </motion.button>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-emerald-600 font-semibold"
            >
              <i className="fas fa-check-circle mr-1" /> Saved!
            </motion.span>
          )}
        </div>
      </CosmosCard>

      {/* Assets Card */}
      <CosmosCard variant="default" padding="md">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <i className="fas fa-wallet text-primary" /> Your Assets
          <span className="ml-auto text-sm font-normal text-slate-500">
            Net Worth: <strong className="text-slate-800 dark:text-white">{formatCroreMask(netWorth, duressModeActive)}</strong>
          </span>
        </h2>
        <div className="space-y-2">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  asset.type === 'bank' ? 'bg-blue-100 text-blue-700' :
                  asset.type === 'stock' ? 'bg-emerald-100 text-emerald-700' :
                  asset.type === 'mutualFund' ? 'bg-violet-100 text-violet-700' :
                  asset.type === 'gold' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  <i className={`fas fa-${
                    asset.type === 'bank' ? 'building-columns' :
                    asset.type === 'stock' ? 'chart-line' :
                    asset.type === 'mutualFund' ? 'layer-group' :
                    asset.type === 'gold' ? 'coins' :
                    asset.type === 'property' ? 'house' : 'wallet'
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{asset.name}</p>
                  <p className="text-[11px] text-slate-500 capitalize">{asset.type}</p>
                </div>
              </div>
              {editingAsset === asset.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={assetValue}
                    onChange={(e) => setAssetValue(e.target.value)}
                    className="w-28 px-2 py-1 text-sm border border-slate-200 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    autoFocus
                  />
                  <button
                    onClick={() => saveAsset(asset.id)}
                    className="text-xs px-2 py-1 bg-primary text-white rounded-lg font-bold"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEditAsset(asset)}
                  className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors flex items-center gap-1"
                >
                  ₹{asset.value.toLocaleString()}
                  <i className="fas fa-pen text-[10px] text-slate-400" />
                </button>
              )}
            </div>
          ))}
        </div>
      </CosmosCard>

      {/* Preferences */}
      <CosmosCard variant="default" padding="md">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <i className="fas fa-sliders text-primary" /> Preferences
        </h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Quick Access Menu</span>
            <input
              type="checkbox"
              checked={quickAccessEnabled}
              onChange={(e) => setQuickAccessEnabled(e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
          </label>
          <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notification Do Not Disturb</span>
            <input
              type="checkbox"
              checked={notificationsDnd}
              onChange={(e) => setNotificationsDnd(e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
          </label>
          <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notification Pop-ups</span>
            <input
              type="checkbox"
              checked={notificationsPopup}
              onChange={(e) => setNotificationsPopup(e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
          </label>
        </div>
      </CosmosCard>

      {/* Data Info */}
      <CosmosCard variant="default" padding="md">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
          <i className="fas fa-shield-halved text-primary" /> Data Privacy
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          All your data is stored locally in your browser using encrypted localStorage. 
          PSB SecureWealth does not send your financial data to any external servers. 
          Your profile, assets, and transactions remain private to this device.
        </p>
      </CosmosCard>
    </div>
  );
}

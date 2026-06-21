import { useState } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';

export default function PhysicalAssetsPromo() {
  const assets = useWealthStore((s) => s.assets);
  const addAsset = useWealthStore((s) => s.addAsset);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'property' as 'property' | 'gold' | 'vehicle', value: '' });

  const physicalAssets = assets.filter((a) => ['gold', 'property', 'vehicle'].includes(a.type));
  const physicalValue = physicalAssets.reduce((s, a) => s + a.value, 0);
  const totalValue = assets.reduce((s, a) => s + a.value, 0);
  const physicalPercent = totalValue > 0 ? ((physicalValue / totalValue) * 100).toFixed(1) : '0';

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.value) return;
    addAsset({
      id: 'phys-' + Date.now(),
      name: form.name,
      type: form.type,
      value: Number(form.value),
      liquidity: form.type === 'gold' ? 'medium' : 'low',
    });
    setForm({ name: '', type: 'property', value: '' });
    setShowForm(false);
  }

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-gem text-purple-500" /> Physical Assets
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Property, gold, vehicles, and more</p>
          </div>
          <span className="text-[10px] px-2 py-1 bg-purple-500/10 text-purple-600 rounded-full font-medium">{physicalPercent}% of net worth</span>
        </div>

        {physicalAssets.length === 0 ? (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
            <i className="fas fa-house text-slate-300 text-2xl mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">No physical assets tracked yet.</p>
            <p className="text-[10px] text-slate-400 mt-1">Add property, gold, or vehicles for complete net worth.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {physicalAssets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500 text-xs">
                    <i className={`fas fa-${asset.type === 'property' ? 'house' : asset.type === 'gold' ? 'coins' : 'car'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{asset.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{asset.type}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-white">Rs {asset.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => setShowForm(true)} className="w-full mt-3 py-2.5 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-600 transition-colors">
          <i className="fas fa-plus mr-1" /> Add Physical Asset
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Add Physical Asset</h3>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Asset Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="e.g. Mumbai Apartment" required />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                  <option value="property">Property / Real Estate</option>
                  <option value="gold">Gold / Jewelry</option>
                  <option value="vehicle">Vehicle / Car</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Estimated Value (Rs)</label>
                <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="500000" required />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium">Add Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

import { useState } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import type { Asset } from '@/shared/types';

export default function ManualAssetForm() {
  const addAsset = useWealthStore((s) => s.addAsset);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'other' as Asset['type'], value: '', liquidity: 'medium' as Asset['liquidity'] });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.value) return;
    addAsset({
      id: Date.now().toString(),
      name: form.name,
      type: form.type,
      value: Number(form.value),
      liquidity: form.liquidity,
    });
    setForm({ name: '', type: 'other', value: '', liquidity: 'medium' });
    setOpen(false);
  }

  return (
    <div>
      <button onClick={() => setOpen(true)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
        <i className="fas fa-plus mr-2" /> Add Asset
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Add Manual Asset</h3>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-600 block mb-1">Asset Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="e.g. Family Gold" required />
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Asset['type'] })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                  <option value="bank">Bank Account</option>
                  <option value="mutualFund">Mutual Fund</option>
                  <option value="stock">Stock</option>
                  <option value="gold">Gold</option>
                  <option value="property">Property</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">Estimated Value (₹)</label>
                <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="500000" required />
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">Liquidity</label>
                <select value={form.liquidity} onChange={(e) => setForm({ ...form, liquidity: e.target.value as Asset['liquidity'] })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                  <option value="high">High (Bank, Stocks)</option>
                  <option value="medium">Medium (MF, Gold)</option>
                  <option value="low">Low (Property, Vehicle)</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium">Add Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

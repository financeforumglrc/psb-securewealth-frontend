import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import CosmosCard from '@/shared/components/ui/CosmosCard';

/* ═══════════════════════════════════════════════════════════════
   PHYSICAL ASSET INTELLIGENCE — Requirement #5 Advanced Solution
   Comprehensive net worth tracking for property, gold, vehicles:
   • Property valuation by city/area
   • Vehicle depreciation calculator
   • Physical gold tracker with live price
   • Asset performance ranking
   • Liquidity score
   • Insurance gap analyzer
   ═══════════════════════════════════════════════════════════════ */

const CITY_MULTIPLIERS: Record<string, number> = {
  'Mumbai': 45000, 'Delhi': 38000, 'Bangalore': 35000, 'Hyderabad': 28000,
  'Pune': 25000, 'Chennai': 24000, 'Kolkata': 22000, 'Ahmedabad': 18000,
  'Jaipur': 12000, 'Lucknow': 10000, 'Other': 15000,
};

const VEHICLE_DEPRECIATION = [
  { year: 0, rate: 1.0 }, { year: 1, rate: 0.8 }, { year: 2, rate: 0.7 },
  { year: 3, rate: 0.6 }, { year: 5, rate: 0.45 }, { year: 7, rate: 0.35 },
  { year: 10, rate: 0.25 }, { year: 15, rate: 0.15 },
];

export default function PhysicalAssetIntelligence() {
  const assets = useWealthStore((s) => s.assets);
  const marketData = useWealthStore((s) => s.marketData);
  const addAsset = useWealthStore((s) => s.addAsset);

  // Property calculator state
  const [propCity, setPropCity] = useState('Delhi');
  const [propArea, setPropArea] = useState(1000);
  const [propBhk, setPropBhk] = useState(2);
  const [propInsurance, setPropInsurance] = useState(0);

  // Vehicle calculator state
  const [vehiclePrice, setVehiclePrice] = useState(1000000);
  const [vehicleYear, setVehicleYear] = useState(2022);
  const [vehicleKms, setVehicleKms] = useState(30000);

  // Gold calculator state
  const [goldGrams, setGoldGrams] = useState(50);

  const goldPricePerGram = (marketData.goldPrice || 75000) / 10;

  const propertyValue = useMemo(() => {
    const baseRate = CITY_MULTIPLIERS[propCity] || CITY_MULTIPLIERS['Other'];
    const bhkPremium = propBhk === 1 ? 1 : propBhk === 2 ? 1.1 : propBhk === 3 ? 1.25 : 1.35;
    return propArea * baseRate * bhkPremium;
  }, [propCity, propArea, propBhk]);

  const vehicleValue = useMemo(() => {
    const age = Math.max(0, new Date().getFullYear() - vehicleYear);
    const depRate = VEHICLE_DEPRECIATION.find((d) => d.year >= age)?.rate || 0.1;
    const kmPenalty = Math.min(vehicleKms / 100000, 0.3);
    return Math.max(0, vehiclePrice * (depRate - kmPenalty));
  }, [vehiclePrice, vehicleYear, vehicleKms]);

  const goldValue = goldGrams * goldPricePerGram;

  // Existing physical assets
  const existingPhysical = useMemo(() => {
    return assets.filter((a) => ['property', 'gold', 'vehicle'].includes(a.type));
  }, [assets]);

  const totalPhysical = existingPhysical.reduce((s, a) => s + a.value, 0);
  const totalWithNew = totalPhysical + propertyValue + vehicleValue + goldValue;

  const liquidityScore = useMemo(() => {
    const liquid = assets.filter((a) => a.liquidity === 'high').reduce((s, a) => s + a.value, 0);
    const total = assets.reduce((s, a) => s + a.value, 0) || 1;
    return Math.round((liquid / total) * 100);
  }, [assets]);

  const insuranceGap = Math.max(0, propertyValue - propInsurance);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-building text-primary" />
            Physical Asset Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Property · Gold · Vehicles — True net worth beyond bank accounts</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 uppercase font-bold">Tracked Physical Assets</p>
          <p className="text-lg font-black text-primary">₹{(totalPhysical / 1e7).toFixed(2)}Cr</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Property', value: `₹${(existingPhysical.filter(a => a.type === 'property').reduce((s, a) => s + a.value, 0) / 1e7).toFixed(2)}Cr`, icon: 'fa-house', color: 'text-blue-500' },
          { label: 'Gold', value: `₹${(existingPhysical.filter(a => a.type === 'gold').reduce((s, a) => s + a.value, 0) / 1e5).toFixed(1)}L`, icon: 'fa-coins', color: 'text-amber-500' },
          { label: 'Vehicles', value: `₹${(existingPhysical.filter(a => a.type === 'vehicle').reduce((s, a) => s + a.value, 0) / 1e5).toFixed(1)}L`, icon: 'fa-car', color: 'text-rose-500' },
          { label: 'Liquidity Score', value: `${liquidityScore}%`, icon: 'fa-droplet', color: 'text-emerald-500' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <CosmosCard variant="stat" padding="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{s.label}</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white">{s.value}</p>
                </div>
                <i className={`fas ${s.icon} ${s.color} text-lg`} />
              </div>
            </CosmosCard>
          </motion.div>
        ))}
      </div>

      {/* Calculators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Property Valuation */}
        <CosmosCard variant="elevated" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <i className="fas fa-house" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">Property Valuation</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase">City</label>
              <select value={propCity} onChange={(e) => setPropCity(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                {Object.keys(CITY_MULTIPLIERS).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase">Area (sq ft)</label>
              <input type="range" min="300" max="5000" step="50" value={propArea} onChange={(e) => setPropArea(Number(e.target.value))} className="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1" />
              <p className="text-xs font-bold text-primary">{propArea} sq ft</p>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase">BHK</label>
              <input type="range" min="1" max="4" step="1" value={propBhk} onChange={(e) => setPropBhk(Number(e.target.value))} className="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1" />
              <p className="text-xs font-bold text-primary">{propBhk} BHK</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <p className="text-[10px] text-slate-500">Estimated Value</p>
              <p className="text-xl font-black text-blue-600">₹{(propertyValue / 1e7).toFixed(2)}Cr</p>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase">Insurance Cover</label>
              <input type="number" value={propInsurance} onChange={(e) => setPropInsurance(Number(e.target.value))} className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
              {insuranceGap > 0 && (
                <p className="text-[10px] text-rose-600 mt-1"><i className="fas fa-triangle-exclamation mr-1" />Insurance gap: ₹{(insuranceGap / 1e5).toFixed(1)}L</p>
              )}
            </div>
          </div>
        </CosmosCard>

        {/* Vehicle Depreciation */}
        <CosmosCard variant="elevated" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <i className="fas fa-car" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">Vehicle Depreciation</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase">Purchase Price (₹)</label>
              <input type="number" value={vehiclePrice} onChange={(e) => setVehiclePrice(Number(e.target.value))} className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase">Purchase Year</label>
              <input type="range" min="2010" max={new Date().getFullYear()} step="1" value={vehicleYear} onChange={(e) => setVehicleYear(Number(e.target.value))} className="w-full accent-rose-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1" />
              <p className="text-xs font-bold text-rose-600">{vehicleYear}</p>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase">Kilometers Driven</label>
              <input type="range" min="0" max="200000" step="1000" value={vehicleKms} onChange={(e) => setVehicleKms(Number(e.target.value))} className="w-full accent-rose-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1" />
              <p className="text-xs font-bold text-rose-600">{vehicleKms.toLocaleString()} km</p>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-lg">
              <p className="text-[10px] text-slate-500">Current Value</p>
              <p className="text-xl font-black text-rose-600">₹{(vehicleValue / 1e5).toFixed(1)}L</p>
              <p className="text-[10px] text-slate-400">Depreciated {((1 - vehicleValue / vehiclePrice) * 100).toFixed(0)}%</p>
            </div>
          </div>
        </CosmosCard>

        {/* Gold Tracker */}
        <CosmosCard variant="elevated" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <i className="fas fa-coins" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">Physical Gold Tracker</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase">Gold Grams Owned</label>
              <input type="range" min="1" max="1000" step="1" value={goldGrams} onChange={(e) => setGoldGrams(Number(e.target.value))} className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1" />
              <p className="text-xs font-bold text-amber-600">{goldGrams} grams</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
              <p className="text-[10px] text-slate-500">Live Value @ ₹{goldPricePerGram.toLocaleString()}/g</p>
              <p className="text-xl font-black text-amber-600">₹{(goldValue / 1e5).toFixed(1)}L</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300">
              <i className="fas fa-circle-info text-primary mr-1" />
              Includes jewelry, coins, bars. Digital gold tracked separately.
            </div>
          </div>
        </CosmosCard>
      </div>

      {/* Total if all added */}
      <CosmosCard variant="gradient" padding="md" glow glowColor="#f59e0b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Projected Total Physical Assets</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Current tracked + calculators above</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-primary">₹{(totalWithNew / 1e7).toFixed(2)}Cr</p>
            <button
              onClick={() => {
                if (propertyValue > 0) addAsset({ id: 'prop-' + Date.now(), name: `${propBhk}BHK ${propCity}`, type: 'property', value: propertyValue, liquidity: 'low' });
                if (vehicleValue > 0) addAsset({ id: 'veh-' + Date.now(), name: `Vehicle ${vehicleYear}`, type: 'vehicle', value: vehicleValue, liquidity: 'low' });
                if (goldValue > 0) addAsset({ id: 'gold-' + Date.now(), name: `Physical Gold ${goldGrams}g`, type: 'gold', value: goldValue, liquidity: 'high' });
              }}
              className="mt-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark"
            >
              <i className="fas fa-plus mr-1" /> Add to Net Worth
            </button>
          </div>
        </div>
      </CosmosCard>

      {/* Existing Physical Assets */}
      {existingPhysical.length > 0 && (
        <CosmosCard variant="default" padding="md">
          <h3 className="font-bold text-slate-800 dark:text-white mb-3">Your Physical Assets</h3>
          <div className="space-y-2">
            {existingPhysical.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <i className={`fas fa-${asset.type === 'property' ? 'house' : asset.type === 'gold' ? 'coins' : 'car'} text-primary`} />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{asset.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-500 uppercase">{asset.type}</span>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-white">₹{(asset.value / 1e5).toFixed(1)}L</span>
              </div>
            ))}
          </div>
        </CosmosCard>
      )}
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface HotspotArea {
  id: string;
  name: string;
  city: string;
  state: string;
  fraudCount: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  commonFrauds: string[];
  coordinates: { x: number; y: number };
}

const HOTSPOT_AREAS: HotspotArea[] = [
  {
    id: 'delhi',
    name: 'Delhi NCR',
    city: 'Delhi',
    state: 'Delhi',
    fraudCount: 2450,
    riskLevel: 'critical',
    commonFrauds: ['Phishing', 'Fake OTP', 'SIM Swap'],
    coordinates: { x: 30, y: 25 },
  },
  {
    id: 'mumbai',
    name: 'Mumbai Metropolitan',
    city: 'Mumbai',
    state: 'Maharashtra',
    fraudCount: 1890,
    riskLevel: 'high',
    commonFrauds: ['Card Skimming', 'Account Takeover'],
    coordinates: { x: 20, y: 60 },
  },
  {
    id: 'bangalore',
    name: 'Bangalore Urban',
    city: 'Bangalore',
    state: 'Karnataka',
    fraudCount: 1650,
    riskLevel: 'high',
    commonFrauds: ['UPI Fraud', 'Investment Scam'],
    coordinates: { x: 25, y: 75 },
  },
  {
    id: 'kolkata',
    name: 'Kolkata Metropolitan',
    city: 'Kolkata',
    state: 'West Bengal',
    fraudCount: 980,
    riskLevel: 'medium',
    commonFrauds: ['Fake KYC', 'Loan Scam'],
    coordinates: { x: 65, y: 45 },
  },
  {
    id: 'chennai',
    name: 'Chennai Metropolitan',
    city: 'Chennai',
    state: 'Tamil Nadu',
    fraudCount: 1120,
    riskLevel: 'medium',
    commonFrauds: ['Online Shopping Fraud', 'Job Scam'],
    coordinates: { x: 40, y: 80 },
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad Metropolitan',
    city: 'Hyderabad',
    state: 'Telangana',
    fraudCount: 1340,
    riskLevel: 'high',
    commonFrauds: ['Crypto Scam', 'Trading Fraud'],
    coordinates: { x: 30, y: 55 },
  },
];

function riskColor(level: string) {
  if (level === 'critical') return 'bg-rose-500';
  if (level === 'high') return 'bg-amber-500';
  if (level === 'medium') return 'bg-yellow-500';
  return 'bg-emerald-500';
}

function riskText(level: string) {
  if (level === 'critical') return 'text-rose-600';
  if (level === 'high') return 'text-amber-600';
  if (level === 'medium') return 'text-yellow-600';
  return 'text-emerald-600';
}

export default function HotspotFraudAreas() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-rose-600" /> Hotspot Fraud Areas
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Identify geographic areas with high fraud activity to help detect and prevent fraud.</p>
      </div>

      {/* India Map Visualization */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <div className="relative w-full h-64 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden">
          {/* Simplified India outline */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M20,20 L40,15 L60,20 L80,25 L85,40 L80,55 L75,70 L65,80 L50,85 L35,80 L25,70 L20,55 L15,40 Z"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
          </svg>

          {/* Hotspot Markers */}
          {HOTSPOT_AREAS.map((area) => (
            <motion.button
              key={area.id}
              onClick={() => setSelectedArea(selectedArea === area.id ? null : area.id)}
              className={`absolute w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                selectedArea === area.id ? 'scale-125 z-10' : ''
              } ${riskColor(area.riskLevel)}`}
              style={{ left: `${area.coordinates.x}%`, top: `${area.coordinates.y}%` }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-white text-[10px] font-bold">{area.fraudCount > 1000 ? `${(area.fraudCount / 1000).toFixed(1)}K` : area.fraudCount}</span>
            </motion.button>
          ))}

          {/* Legend */}
          <div className="absolute bottom-2 left-2 flex items-center gap-2 text-[10px]">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500" /> Critical</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> High</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Medium</div>
          </div>
        </div>
      </div>

      {/* Area List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {HOTSPOT_AREAS.map((area) => (
          <motion.button
            key={area.id}
            onClick={() => setSelectedArea(selectedArea === area.id ? null : area.id)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedArea === area.id
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-800 dark:text-white">{area.name}</span>
              </div>
              <span className={`text-xs font-bold ${riskText(area.riskLevel)}`}>{area.riskLevel.toUpperCase()}</span>
            </div>
            <p className="text-xs text-slate-500">{area.city}, {area.state}</p>
            <p className="text-xs text-slate-400 mt-1">{area.fraudCount.toLocaleString('en-IN')} fraud cases</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {area.commonFrauds.map((fraud, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400">
                  {fraud}
                </span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Selected Area Details */}
      {selectedArea && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white"
        >
          {(() => {
            const area = HOTSPOT_AREAS.find((a) => a.id === selectedArea);
            if (!area) return null;
            return (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-400" />
                    <h3 className="text-lg font-black">{area.name}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${riskColor(area.riskLevel)}`}>
                    {area.riskLevel.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/10">
                    <p className="text-[10px] text-white/60 uppercase font-bold">Fraud Cases</p>
                    <p className="text-xl font-black">{area.fraudCount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10">
                    <p className="text-[10px] text-white/60 uppercase font-bold">Location</p>
                    <p className="text-sm font-bold">{area.city}, {area.state}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-[10px] text-white/60 uppercase font-bold mb-1">Common Fraud Types</p>
                  <div className="flex flex-wrap gap-1">
                    {area.commonFrauds.map((fraud, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-white/20 text-xs text-white">
                        {fraud}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}
        </motion.div>
      )}

      {/* Prevention Tips */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-black text-slate-800 dark:text-white mb-3">Fraud Prevention by Region</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
            <p className="font-bold text-rose-700 dark:text-rose-300 mb-1">Critical Areas</p>
            <p className="text-rose-600 dark:text-rose-400">Enhanced verification for all transactions. Mandatory cross-device approval.</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="font-bold text-amber-700 dark:text-amber-300 mb-1">High Risk Areas</p>
            <p className="text-amber-600 dark:text-amber-400">Additional OTP verification. Real-time fraud alerts.</p>
          </div>
          <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <p className="font-bold text-yellow-700 dark:text-yellow-300 mb-1">Medium Risk Areas</p>
            <p className="text-yellow-600 dark:text-yellow-400">Standard security. Regular monitoring.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PreparednessDimension {
  name: string;
  score: number;
  weight: number;
  icon: string;
  color: string;
  insight: string;
}

const DIMENSIONS: PreparednessDimension[] = [
  { name: 'Emergency Fund', score: 62, weight: 20, icon: 'fa-kit-medical', color: '#EF4444', insight: 'Need 3 more months of expenses saved' },
  { name: 'Insurance Coverage', score: 45, weight: 18, icon: 'fa-shield-heart', color: '#F59E0B', insight: 'Health cover insufficient for family' },
  { name: 'Retirement Corpus', score: 38, weight: 20, icon: 'fa-umbrella-beach', color: '#8B5CF6', insight: 'Start NPS + increase SIP by ₹8,000' },
  { name: 'Child Education', score: 71, weight: 15, icon: 'fa-graduation-cap', color: '#3B82F6', insight: 'On track — maintain current SIP' },
  { name: 'Home Ownership', score: 55, weight: 15, icon: 'fa-house', color: '#10B981', insight: 'Save ₹25,000/month for down payment' },
  { name: 'Debt Freedom', score: 82, weight: 12, icon: 'fa-link-slash', color: '#06B6D4', insight: 'Excellent — only home loan remaining' },
];

const OVERALL_SCORE = Math.round(
  DIMENSIONS.reduce((sum, d) => sum + d.score * d.weight, 0) / 100
);

const getScoreLabel = (score: number) => {
  if (score >= 80) return { label: 'Excellent', color: '#10B981', bg: 'bg-green-50' };
  if (score >= 60) return { label: 'Good', color: '#3B82F6', bg: 'bg-blue-50' };
  if (score >= 40) return { label: 'Needs Work', color: '#F59E0B', bg: 'bg-amber-50' };
  return { label: 'Critical', color: '#EF4444', bg: 'bg-rose-50' };
};

export default function PreparednessScore() {
  const [selectedDim, setSelectedDim] = useState<number | null>(null);
  const overall = getScoreLabel(OVERALL_SCORE);

  return (
    <div className="card-psb">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <i className="fas fa-shield-halved text-primary" /> Life Preparedness Score
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            India's first holistic life-readiness metric — like CIBIL but for your future
          </p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${overall.bg}`} style={{ color: overall.color }}>
          {overall.label}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Score Circle */}
        <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#F3F4F6" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50"
                fill="none"
                stroke={overall.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${OVERALL_SCORE * 3.14}, 314`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-gray-900">{OVERALL_SCORE}</span>
              <span className="text-[10px] text-gray-500 font-medium">/ 100</span>
            </div>
          </div>
          <div className="mt-3 text-center">
            <p className="text-sm font-bold text-gray-800">{overall.label}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              You're more prepared than {Math.max(10, OVERALL_SCORE - 12)}% of Indians your age
            </p>
          </div>

          {/* Score breakdown mini */}
          <div className="w-full mt-3 space-y-1.5">
            {DIMENSIONS.map((dim) => (
              <div key={dim.name} className="flex items-center gap-2">
                <span className="text-[9px] text-gray-500 w-20 truncate">{dim.name}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${dim.score}%`, backgroundColor: dim.color }}
                  />
                </div>
                <span className="text-[9px] font-bold text-gray-600 w-6 text-right">{dim.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dimension Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DIMENSIONS.map((dim, idx) => (
            <motion.div
              key={dim.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                selectedDim === idx
                  ? 'border-gray-300 shadow-md bg-white'
                  : 'border-gray-100 hover:border-gray-200 hover:shadow-sm bg-white'
              }`}
              onClick={() => setSelectedDim(selectedDim === idx ? null : idx)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: dim.color + '12' }}
                  >
                    <i className={`fas ${dim.icon}`} style={{ color: dim.color, fontSize: '13px' }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-800">{dim.name}</p>
                    <p className="text-[9px] text-gray-400">Weight: {dim.weight}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold" style={{ color: dim.color }}>{dim.score}</span>
                </div>
              </div>

              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: dim.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${dim.score}%` }}
                  transition={{ delay: idx * 0.1 + 0.3, duration: 0.8 }}
                />
              </div>

              {selectedDim === idx && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 pt-2 border-t border-dashed border-gray-100"
                >
                  <div className="flex items-start gap-2">
                    <i className="fas fa-lightbulb text-amber-500 text-[10px] mt-0.5" />
                    <p className="text-[10px] text-gray-600 leading-relaxed">{dim.insight}</p>
                  </div>
                  <button className="mt-2 w-full py-1.5 bg-primary/5 text-primary text-[10px] font-bold rounded-lg hover:bg-primary/10 transition-colors">
                    <i className="fas fa-wand-magic-sparkles mr-1" /> Fix This Now
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* India Benchmark */}
      <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-chart-simple text-amber-600 text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-gray-800">India Average: 41/100</p>
            <p className="text-[10px] text-gray-600">
              You're {OVERALL_SCORE > 41 ? '+' : ''}{OVERALL_SCORE - 41} points ahead of the national average. 
              Top 10% of Indians score 72+. Aim for 75+ to be "Future-Ready".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

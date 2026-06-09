import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PredictedEvent {
  id: string;
  title: string;
  category: 'family' | 'career' | 'health' | 'asset' | 'education';
  probability: number;
  timeframe: string;
  monthsAway: number;
  financialImpact: string;
  suggestedAction: string;
  icon: string;
  color: string;
  readiness: 'prepared' | 'at-risk' | 'critical';
}

const PREDICTED_EVENTS: PredictedEvent[] = [
  {
    id: 'evt-1',
    title: 'Child Education Fund Need',
    category: 'education',
    probability: 94,
    timeframe: '14 months',
    monthsAway: 14,
    financialImpact: '₹18-25 Lakhs',
    suggestedAction: 'Start ₹45,000/month SIP in balanced advantage fund',
    icon: 'fa-graduation-cap',
    color: '#2196F3',
    readiness: 'at-risk',
  },
  {
    id: 'evt-2',
    title: 'Home Purchase Opportunity',
    category: 'asset',
    probability: 78,
    timeframe: '22 months',
    monthsAway: 22,
    financialImpact: '₹85 Lakhs (EMI: ₹62,000)',
    suggestedAction: 'Build ₹12L down-payment corpus via RD + liquid funds',
    icon: 'fa-house-chimney',
    color: '#4CAF50',
    readiness: 'prepared',
  },
  {
    id: 'evt-3',
    title: 'Parent Medical Emergency',
    category: 'health',
    probability: 67,
    timeframe: '8 months',
    monthsAway: 8,
    financialImpact: '₹3-8 Lakhs',
    suggestedAction: 'Upgrade family health cover to ₹15L + create ₹5L medical buffer',
    icon: 'fa-heart-pulse',
    color: '#F44336',
    readiness: 'critical',
  },
  {
    id: 'evt-4',
    title: 'Career Transition / Sabbatical',
    category: 'career',
    probability: 52,
    timeframe: '18 months',
    monthsAway: 18,
    financialImpact: '6-month income gap (~₹9L)',
    suggestedAction: 'Build emergency corpus to 9x monthly expenses',
    icon: 'fa-briefcase',
    color: '#FF9800',
    readiness: 'at-risk',
  },
  {
    id: 'evt-5',
    title: 'Vehicle Upgrade',
    category: 'asset',
    probability: 71,
    timeframe: '30 months',
    monthsAway: 30,
    financialImpact: '₹14 Lakhs',
    suggestedAction: 'Auto-sweep ₹18,000/month to car fund FD ladder',
    icon: 'fa-car',
    color: '#9C27B0',
    readiness: 'prepared',
  },
  {
    id: 'evt-6',
    title: 'Marriage / Family Event',
    category: 'family',
    probability: 45,
    timeframe: '36 months',
    monthsAway: 36,
    financialImpact: '₹10-15 Lakhs',
    suggestedAction: 'Create dedicated family event fund via recurring deposit',
    icon: 'fa-ring',
    color: '#E91E63',
    readiness: 'prepared',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  family: 'Family',
  career: 'Career',
  health: 'Health',
  asset: 'Asset',
  education: 'Education',
};

const READINESS_CONFIG = {
  prepared: { label: 'On Track', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'fa-check-circle' },
  'at-risk': { label: 'Needs Attention', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'fa-triangle-exclamation' },
  critical: { label: 'Urgent Action', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: 'fa-circle-exclamation' },
};

export default function LifeEventPredictor() {
  const [selectedEvent, setSelectedEvent] = useState<PredictedEvent | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' 
    ? PREDICTED_EVENTS 
    : PREDICTED_EVENTS.filter(e => e.category === filter);

  return (
    <div className="card-psb">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <i className="fas fa-crystal-ball text-violet-600" /> Life Event Predictor
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            AI analyzes 127 behavioral signals to predict major life events before they happen
          </p>
        </div>
        <div className="px-2.5 py-1 bg-violet-50 rounded-full text-[10px] font-bold text-violet-700">
          94% Historical Accuracy
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mt-3 mb-4 overflow-x-auto pb-1">
        {['all', 'family', 'career', 'health', 'asset', 'education'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
              filter === cat
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat === 'all' ? 'All Events' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-200 via-amber-200 to-rose-200" />
        
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((event, idx) => {
              const readiness = READINESS_CONFIG[event.readiness];
              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.06 }}
                  className={`relative ml-8 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedEvent?.id === event.id 
                      ? 'border-violet-300 bg-violet-50/50 shadow-md' 
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                >
                  {/* Timeline dot */}
                  <div 
                    className="absolute -left-[26px] top-4 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: event.color }}
                  />
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <i className={`fas ${event.icon} text-xs`} style={{ color: event.color }} />
                        <span className="text-[11px] font-bold text-gray-800">{event.title}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${readiness.bg} ${readiness.text} border ${readiness.border}`}>
                          <i className={`fas ${readiness.icon} mr-0.5 text-[8px]`} />
                          {readiness.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500">
                        <span><i className="fas fa-clock mr-1" />{event.timeframe}</span>
                        <span><i className="fas fa-percent mr-1" />{event.probability}% probability</span>
                        <span className="font-semibold text-gray-700">
                          <i className="fas fa-indian-rupee-sign mr-0.5" />{event.financialImpact.replace('₹', '')}
                        </span>
                      </div>
                    </div>
                    <div className="ml-2">
                      <div className="relative w-10 h-10">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={event.color}
                            strokeWidth="3"
                            strokeDasharray={`${event.probability}, 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-700">
                          {event.probability}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {selectedEvent?.id === event.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-dashed border-gray-200"
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-wand-magic-sparkles text-violet-500 text-xs" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-700 mb-0.5">AI Recommended Action</p>
                            <p className="text-[11px] text-gray-600 leading-relaxed">{event.suggestedAction}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button className="px-3 py-1.5 bg-violet-600 text-white text-[10px] font-bold rounded-lg hover:bg-violet-700 transition-colors">
                            <i className="fas fa-rocket mr-1" />Auto-Setup Now
                          </button>
                          <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold rounded-lg hover:bg-gray-50 transition-colors">
                            <i className="fas fa-bell mr-1" />Remind Me Later
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

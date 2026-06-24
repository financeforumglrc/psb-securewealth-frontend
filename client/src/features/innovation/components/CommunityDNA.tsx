import { useTranslation } from '@/shared/hooks/useTranslation';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PEER_BENCHMARK = [
  { metric: 'Savings Rate', you: 28, peerAvg: 18, top10: 42 },
  { metric: 'Emergency Fund', you: 4.2, peerAvg: 2.1, top10: 8.5 },
  { metric: 'Investment %', you: 35, peerAvg: 22, top10: 55 },
  { metric: 'Debt Freedom', you: 82, peerAvg: 45, top10: 95 },
  { metric: 'Insurance Cover', you: 12, peerAvg: 5, top10: 25 },
  { metric: 'Retirement %', you: 15, peerAvg: 8, top10: 28 },
];

const COMMUNITY_INSIGHTS = [
  { insight: 'People in your pincode save 23% more during harvest season', trend: 'up', value: '+23%', category: 'Seasonal' },
  { insight: 'Your age group (30-35) is 2.1x more likely to buy EVs next year', trend: 'up', value: '2.1x', category: 'Trend' },
  { insight: 'Women in your income bracket start SIPs 18% earlier than men', trend: 'neutral', value: '18%', category: 'Demographic' },
  { insight: 'IT professionals in Bangalore saw 34% salary growth post-AI boom', trend: 'up', value: '+34%', category: 'Industry' },
  { insight: 'Your community prefers gold over equity by 3:1 ratio', trend: 'neutral', value: '3:1', category: 'Cultural' },
  { insight: 'Freelancers in your city lack health insurance 4x more than salaried', trend: 'down', value: '4x', category: 'Risk' },
];

const CROWD_PREDICTIONS = [
  { event: 'Real Estate Correction', consensus: '67%', yourVote: 'agree', financialImpact: 'Wait 8 months to buy', voters: 12400 },
  { event: 'Gold Price Surge', consensus: '78%', yourVote: 'agree', financialImpact: 'Buy before July', voters: 28700 },
  { event: 'IT Salary Stagnation', consensus: '54%', yourVote: 'disagree', financialImpact: 'Upskill in AI/ML', voters: 15600 },
  { event: 'Crypto Regulation', consensus: '82%', yourVote: 'agree', financialImpact: 'Move to compliant exchanges', voters: 8900 },
  { event: 'EV Subsidy Extension', consensus: '71%', yourVote: 'neutral', financialImpact: 'Delay car purchase to Q3', voters: 19200 },
];

const LOCAL_ECONOMY = [
  { indicator: 'Property Prices', yourArea: '+8.2%', cityAvg: '+5.4%', trend: 'up' },
  { indicator: 'Rental Yield', yourArea: '3.8%', cityAvg: '3.2%', trend: 'up' },
  { indicator: 'Job Openings', yourArea: '+12%', cityAvg: '+7%', trend: 'up' },
  { indicator: 'New Business', yourArea: '+23%', cityAvg: '+15%', trend: 'up' },
  { indicator: 'School Quality', yourArea: '8.4/10', cityAvg: '7.1/10', trend: 'up' },
  { indicator: 'Hospital Access', yourArea: '6.2/10', cityAvg: '7.5/10', trend: 'down' },
];

export default function CommunityDNA() {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('communityDnaPeersAnalyzed'), value: '2.4M', icon: 'fa-users', color: 'bg-blue-50 text-blue-600' },
          { label: t('communityDnaPercentile'), value: '87th', icon: 'fa-ranking-star', color: 'bg-amber-50 text-amber-600' },
          { label: t('communityDnaLocalInsights'), value: '12', icon: 'fa-lightbulb', color: 'bg-green-50 text-green-600' },
          { label: t('communityDnaCrowdAccuracy'), value: '74%', icon: 'fa-bullseye', color: 'bg-violet-50 text-violet-600' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="card-psb flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
              <i className={`fas ${stat.icon}`} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-[10px] text-gray-500 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Peer Benchmark Chart */}
      <div className="card-psb">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-users text-blue-600" aria-hidden="true" /> {t('communityDnaChartTitle')}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {t('communityDnaChartSubtitle')}
            </p>
          </div>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PEER_BENCHMARK} margin={{ top: 5, right: 5, left: 0, bottom: 5 }} barGap={4}>
              <XAxis dataKey="metric" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px' }}
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              />
              <Bar dataKey="peerAvg" name="Peer Average" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="you" name="You" fill="#1B5E20" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="top10" name="Top 10%" fill="#FFD700" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-500">
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-200" aria-hidden="true" /><span className="sr-only">Gray</span>{t('communityDnaPeerAvg')}</span>
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary" aria-hidden="true" /><span className="sr-only">Green</span>{t('communityDnaYou')}</span>
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-400" aria-hidden="true" /><span className="sr-only">Amber</span>{t('communityDnaTop10')}</span>
        </div>
      </div>

      {/* Community Insights Grid */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <i className="fas fa-lightbulb text-amber-500" aria-hidden="true" /> {t('communityDnaInsightsTitle')}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMMUNITY_INSIGHTS.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3 rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  insight.trend === 'up' ? 'bg-green-50 text-green-700' : insight.trend === 'down' ? 'bg-rose-50 text-rose-700' : 'bg-gray-50 text-gray-600'
                }`}>
                  {insight.category}
                </span>
                <span className={`text-[10px] font-bold ${insight.trend === 'up' ? 'text-green-600' : insight.trend === 'down' ? 'text-rose-600' : 'text-gray-600'}`}>
                  {insight.value}
                </span>
              </div>
              <p className="text-[11px] text-gray-700 leading-relaxed">{insight.insight}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Crowd Predictions */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <i className="fas fa-users-viewfinder text-violet-600" aria-hidden="true" /> {t('communityDnaPredictionsTitle')}
        </h4>
        <div className="space-y-3">
          {CROWD_PREDICTIONS.map((pred, idx) => (
            <motion.div
              key={pred.event}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="p-3 rounded-xl border border-gray-100 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-gray-800">{pred.event}</span>
                    <span className="text-[10px] text-gray-400">{pred.voters.toLocaleString()} {t('communityDnaVoters')}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-2">{pred.financialImpact}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{ width: pred.consensus }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-violet-600">{pred.consensus} agree</span>
                  </div>
                </div>
                <div className="ml-3">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                    pred.yourVote === 'agree' ? 'bg-green-50 text-green-700' : pred.yourVote === 'disagree' ? 'bg-rose-50 text-rose-700' : 'bg-gray-50 text-gray-600'
                  }`}>
                    {t('communityDnaYouVote')} {pred.yourVote}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Local Economy Heatmap */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <i className="fas fa-map-location-dot text-primary" aria-hidden="true" /> {t('communityDnaPincodeTitle')}
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {LOCAL_ECONOMY.map((item, idx) => (
            <motion.div
              key={item.indicator}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3 rounded-xl border border-gray-100 bg-gray-50/50"
            >
              <p className="text-[10px] text-gray-400 mb-1">{item.indicator}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-extrabold text-gray-900">{item.yourArea}</p>
                  <p className="text-[10px] text-gray-400">{t('communityDnaCityAvg')} {item.cityAvg}</p>
                </div>
                <i className={`fas fa-arrow-${item.trend} ${item.trend === 'up' ? 'text-green-500' : 'text-rose-500'} text-xs`} aria-hidden="true" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

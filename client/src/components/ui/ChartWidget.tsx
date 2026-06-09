import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const netWorthData = [
  { month: 'Jan', value: 85 },
  { month: 'Feb', value: 88 },
  { month: 'Mar', value: 86 },
  { month: 'Apr', value: 92 },
  { month: 'May', value: 90 },
  { month: 'Jun', value: 95 },
  { month: 'Jul', value: 93 },
  { month: 'Aug', value: 99 },
];

const spendingData = [
  { category: 'Food', amount: 12000, color: '#1B5E20' },
  { category: 'Rent', amount: 25000, color: '#2E7D32' },
  { category: 'Travel', amount: 8000, color: '#FFD700' },
  { category: 'Shopping', amount: 15000, color: '#C9A227' },
  { category: 'Bills', amount: 10000, color: '#B71C1C' },
];

const assetData = [
  { name: 'Bank', value: 35, color: '#1B5E20' },
  { name: 'Mutual Funds', value: 25, color: '#2E7D32' },
  { name: 'Stocks', value: 20, color: '#FFD700' },
  { name: 'Gold', value: 12, color: '#C9A227' },
  { name: 'Property', value: 8, color: '#B71C1C' },
];

export default function ChartWidget({ type = 'area' }: { type?: 'area' | 'bar' | 'pie' }) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (type === 'area') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card-psb"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="section-title">Net Worth Growth</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Last 8 months (₹ Lakhs)</p>
          </div>
          <span className="badge badge-premium">
            <i className="fas fa-arrow-trend-up mr-1" /> +16.4%
          </span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={netWorthData}>
            <defs>
              <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1B5E20" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9AAA9B' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9AAA9B' }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #E0E8E1', fontSize: 12 }}
              formatter={(v) => [`₹${v}L`, 'Net Worth']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#1B5E20"
              strokeWidth={2.5}
              fill="url(#netWorthGrad)"
              dot={{ r: 4, fill: '#1B5E20', stroke: 'white', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#1B5E20', stroke: 'white', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  if (type === 'bar') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="card-psb"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="section-title">Monthly Spending</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Top 5 categories</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={spendingData} layout="vertical">
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9AAA9B' }} />
            <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#5C6B5D' }} width={70} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #E0E8E1', fontSize: 12 }}
              formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Amount']}
            />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={20}>
              {spendingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  if (type === 'pie') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card-psb"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="section-title">Asset Allocation</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Portfolio breakdown</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie
                data={assetData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, idx) => setHovered(assetData[idx].name)}
                onMouseLeave={() => setHovered(null)}
              >
                {assetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={hovered === null || hovered === entry.name ? 1 : 0.4} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E0E8E1', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2">
            {assetData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-600 flex-1">{item.name}</span>
                <span className="text-xs font-bold text-gray-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}

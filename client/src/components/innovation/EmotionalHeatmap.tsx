import { useState } from 'react';
import { motion } from 'framer-motion';

interface DayData {
  day: number;
  month: string;
  mood: number;
  spend: number;
  emotion: string;
  color: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateYearData(): DayData[][] {
  const data: DayData[][] = [];
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  for (let m = 0; m < 12; m++) {
    const monthData: DayData[] = [];
    for (let d = 1; d <= daysInMonth[m]; d++) {
      const mood = Math.floor(Math.random() * 100);
      const spend = Math.floor(500 + Math.random() * 4000);
      let emotion = 'Neutral';
      let color = '#E5E7EB';
      
      if (mood > 80) { emotion = 'Joyful'; color = '#10B981'; }
      else if (mood > 60) { emotion = 'Happy'; color = '#34D399'; }
      else if (mood > 40) { emotion = 'Calm'; color = '#6EE7B7'; }
      else if (mood > 20) { emotion = 'Stressed'; color = '#FBBF24'; }
      else { emotion = 'Anxious'; color = '#F87171'; }
      
      monthData.push({ day: d, month: MONTHS[m], mood, spend, emotion, color });
    }
    data.push(monthData);
  }
  return data;
}

const YEAR_DATA = generateYearData();

const EMOTION_LEGEND = [
  { label: 'Joyful (80-100)', color: '#10B981' },
  { label: 'Happy (60-80)', color: '#34D399' },
  { label: 'Calm (40-60)', color: '#6EE7B7' },
  { label: 'Stressed (20-40)', color: '#FBBF24' },
  { label: 'Anxious (0-20)', color: '#F87171' },
];

export default function EmotionalHeatmap() {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  const totalSpend = YEAR_DATA.flat().reduce((s, d) => s + d.spend, 0);
  const avgMood = Math.round(YEAR_DATA.flat().reduce((s, d) => s + d.mood, 0) / 365);
  const worstDay = YEAR_DATA.flat().reduce((w, d) => d.mood < w.mood ? d : w, YEAR_DATA[0][0]);
  const bestDay = YEAR_DATA.flat().reduce((b, d) => d.mood > b.mood ? d : b, YEAR_DATA[0][0]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Days Tracked', value: '365', icon: 'fa-calendar-check', color: 'bg-blue-50 text-blue-600' },
          { label: 'Avg Mood', value: `${avgMood}%`, icon: 'fa-face-smile', color: 'bg-green-50 text-green-600' },
          { label: 'Total Spend', value: `₹${(totalSpend / 100000).toFixed(1)}L`, icon: 'fa-wallet', color: 'bg-amber-50 text-amber-600' },
          { label: 'Mood-Spend Corr', value: '-0.74', icon: 'fa-link', color: 'bg-rose-50 text-rose-600' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="card-psb flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
              <i className={`fas ${stat.icon}`} />
            </div>
            <div>
              <p className="text-lg font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-[10px] text-gray-500 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card-psb">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-fire text-rose-500" /> Emotional Spending Heatmap
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              365-day visualization of your emotional state and spending patterns — discover your hidden triggers
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4">
          {EMOTION_LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] text-gray-500">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-2">
          {YEAR_DATA.map((monthData, monthIdx) => (
            <div key={monthIdx} className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 w-8 text-right">{MONTHS[monthIdx]}</span>
              <div className="flex-1 flex gap-[2px]">
                {monthData.map((day) => (
                  <motion.div
                    key={day.day}
                    className="flex-1 aspect-square rounded-[2px] cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-primary transition-all"
                    style={{ backgroundColor: day.color }}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (monthIdx * 31 + day.day) * 0.0003 }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Day Tooltip */}
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-gray-900 text-white rounded-xl text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: hoveredDay.color }}>
                <span className="text-lg">
                  {hoveredDay.mood > 80 ? '😄' : hoveredDay.mood > 60 ? '🙂' : hoveredDay.mood > 40 ? '😐' : hoveredDay.mood > 20 ? '😟' : '😰'}
                </span>
              </div>
              <div>
                <p className="font-bold">{hoveredDay.month} {hoveredDay.day}</p>
                <p className="text-gray-300">Mood: {hoveredDay.mood}% · {hoveredDay.emotion}</p>
                <p className="text-gray-300">Spend: ₹{hoveredDay.spend.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">😄</span>
            <div>
              <p className="text-sm font-bold text-green-800">Best Financial Day</p>
              <p className="text-[11px] text-green-600">{bestDay.month} {bestDay.day} · Mood: {bestDay.mood}%</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-600">You made your best decisions on this day. Replicate the conditions.</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">😰</span>
            <div>
              <p className="text-sm font-bold text-rose-800">Worst Financial Day</p>
              <p className="text-[11px] text-rose-600">{worstDay.month} {worstDay.day} · Mood: {worstDay.mood}%</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-600">You spent ₹{worstDay.spend.toLocaleString()} while stressed. Set a stress-lock for similar days.</p>
        </div>
      </div>
    </div>
  );
}

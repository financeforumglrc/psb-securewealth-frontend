import { useState } from 'react';
import { motion } from 'framer-motion';

const MOODS = [
  { emoji: '😊', label: 'Happy', color: 'bg-green-100 text-green-600', bonus: 2 },
  { emoji: '😐', label: 'Neutral', color: 'bg-slate-100 text-slate-600', bonus: 0 },
  { emoji: '😢', label: 'Regret', color: 'bg-blue-100 text-blue-600', bonus: 0 },
  { emoji: '🤩', label: 'Excited', color: 'bg-amber-100 text-amber-600', bonus: 3 },
  { emoji: '😤', label: 'Angry', color: 'bg-rose-100 text-rose-600', bonus: 0 },
];

export default function MoodMeter() {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState<{ mood: string; date: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem('sw_mood_history') || '[]'); }
    catch { return []; }
  });

  const submit = (idx: number) => {
    setSelected(idx);
    setSubmitted(true);
    const mood = MOODS[idx];
    const entry = { mood: mood.label, date: new Date().toISOString() };
    const updated = [entry, ...history].slice(0, 30);
    setHistory(updated);
    localStorage.setItem('sw_mood_history', JSON.stringify(updated));

    // Bonus for happy/excited after savings
    if (mood.bonus > 0) {
      // Dispatch event for rewards context
      window.dispatchEvent(new CustomEvent('sw-mood-bonus', { detail: { amount: mood.bonus, mood: mood.label } }));
    }
  };

  const happyCount = history.filter((h) => h.mood === 'Happy' || h.mood === 'Excited').length;

  return (
    <div className="card rounded-3xl shadow-xl p-6">
      <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
        <i className="fas fa-face-smile text-amber-500" />
        How do you feel?
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Track your financial mood. Happy savers get surprise rewards!
      </p>

      {!submitted ? (
        <div className="flex justify-center gap-2">
          {MOODS.map((m, i) => (
            <motion.button
              key={m.label}
              whileHover={{ scale: 1.2, y: -4 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => submit(i)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${m.color} transition-colors`}
              title={m.label}
            >
              {m.emoji}
            </motion.button>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-2xl mb-1">{MOODS[selected!].emoji}</p>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Thanks for sharing!</p>
          {MOODS[selected!].bonus > 0 && (
            <p className="text-xs text-green-500 mt-1">+₹{MOODS[selected!].bonus} good-habit reward!</p>
          )}
          <button
            onClick={() => setSubmitted(false)}
            className="mt-3 text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Log another
          </button>
        </motion.div>
      )}

      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">This week: {happyCount} happy entries</span>
            <span className="text-amber-500 font-medium">
              {happyCount >= 5 ? '🔥 On fire!' : happyCount >= 3 ? '👍 Good streak' : 'Keep going!'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

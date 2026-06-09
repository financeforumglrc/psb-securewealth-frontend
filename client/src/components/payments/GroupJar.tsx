import { useState } from 'react';
import { motion } from 'framer-motion';

interface Jar {
  id: string;
  name: string;
  target: number;
  current: number;
  members: string[];
}

export default function GroupJar() {
  const [jars, setJars] = useState<Jar[]>(() => {
    try { return JSON.parse(localStorage.getItem('sw_group_jars') || '[]'); }
    catch { return []; }
  });
  const [showCreate, setShowCreate] = useState(false);
  const [newJar, setNewJar] = useState({ name: '', target: '', members: '' });

  const saveJars = (j: Jar[]) => {
    setJars(j);
    localStorage.setItem('sw_group_jars', JSON.stringify(j));
  };

  const createJar = () => {
    const target = parseFloat(newJar.target);
    if (!newJar.name || !target) return;
    const jar: Jar = {
      id: 'JAR' + Date.now(),
      name: newJar.name,
      target,
      current: 0,
      members: newJar.members.split(',').map((m) => m.trim()).filter(Boolean),
    };
    saveJars([jar, ...jars]);
    setNewJar({ name: '', target: '', members: '' });
    setShowCreate(false);
  };

  const contribute = (id: string, amount: number) => {
    saveJars(jars.map((j) => (j.id === id ? { ...j, current: Math.min(j.current + amount, j.target) } : j)));
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <i className="fas fa-jar text-indigo-500" />
          Group Jars
        </h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600"
        >
          {showCreate ? 'Cancel' : 'New Jar'}
        </button>
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2 mb-4"
        >
          <input
            value={newJar.name}
            onChange={(e) => setNewJar({ ...newJar, name: e.target.value })}
            placeholder="Jar name (e.g. Trip to Goa)"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm outline-none dark:text-white"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={newJar.target}
              onChange={(e) => setNewJar({ ...newJar, target: e.target.value })}
              placeholder="Target amount"
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm outline-none dark:text-white"
            />
            <button onClick={createJar} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold">
              Create
            </button>
          </div>
          <input
            value={newJar.members}
            onChange={(e) => setNewJar({ ...newJar, members: e.target.value })}
            placeholder="Members (comma separated)"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm outline-none dark:text-white"
          />
        </motion.div>
      )}

      {jars.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">Create a jar for your next group goal!</p>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {jars.map((jar) => {
            const pct = Math.min((jar.current / jar.target) * 100, 100);
            return (
              <motion.div
                key={jar.id}
                layout
                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{jar.name}</p>
                  <span className="text-xs text-slate-400">
                    ₹{jar.current.toLocaleString()} / ₹{jar.target.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                  <motion.div
                    className="h-full bg-indigo-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-1">
                    {jar.members.map((m, i) => (
                      <div key={i} className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-[10px] text-indigo-600 border-2 border-white dark:border-slate-800">
                        {m.charAt(0)}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {[50, 100, 500].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => contribute(jar.id, amt)}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold hover:bg-indigo-200"
                      >
                        +₹{amt}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

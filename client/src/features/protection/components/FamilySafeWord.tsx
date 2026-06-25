import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFamilySafeWord } from '@/shared/hooks/useFamilySafeWord';

export default function FamilySafeWord() {
  const { safeWord, members, hasSafeWord, setSafeWord, addMember, removeMember, hydrated } = useFamilySafeWord();
  const [editMode, setEditMode] = useState(false);
  const [draftWord, setDraftWord] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberRelation, setMemberRelation] = useState('');

  if (!hydrated) return null;

  const handleSaveWord = () => {
    if (draftWord.trim().length < 2) return;
    setSafeWord(draftWord.trim());
    setEditMode(false);
  };

  const handleAddMember = () => {
    addMember(memberName, memberRelation);
    setMemberName('');
    setMemberRelation('');
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 border border-violet-200 dark:border-slate-700">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500 text-white flex items-center justify-center">
          <i className="fas fa-users-rectangle" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-violet-800 dark:text-violet-200">Family Safe Word</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Fight AI voice-cloning scams. Ask for the secret word before sending emergency money.
          </p>
        </div>
        <button
          onClick={() => { setEditMode((s) => !s); setDraftWord(safeWord); }}
          className="text-[10px] font-bold text-violet-600 hover:text-violet-700"
        >
          {editMode ? 'Cancel' : hasSafeWord ? 'Edit' : 'Set Up'}
        </button>
      </div>

      <AnimatePresence>
        {editMode ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Safe Word</label>
              <input
                value={draftWord}
                onChange={(e) => setDraftWord(e.target.value)}
                placeholder="e.g. Blue Mango"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-violet-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-violet-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Pick a word only your real family knows.</p>
            </div>
            <button
              onClick={handleSaveWord}
              disabled={draftWord.trim().length < 2}
              className="w-full py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Save Safe Word
            </button>

            <div className="pt-2 border-t border-violet-100 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-2">Family Members</p>
              <div className="flex gap-2 mb-2">
                <input
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="Name"
                  className="flex-1 px-2 py-1.5 rounded-lg border border-violet-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs outline-none"
                />
                <input
                  value={memberRelation}
                  onChange={(e) => setMemberRelation(e.target.value)}
                  placeholder="Relation"
                  className="flex-1 px-2 py-1.5 rounded-lg border border-violet-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs outline-none"
                />
                <button
                  onClick={handleAddMember}
                  disabled={!memberName.trim() || !memberRelation.trim()}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs bg-white/60 dark:bg-slate-900/40 px-2 py-1 rounded-md">
                    <span className="text-slate-700 dark:text-slate-200">{m.name} <span className="text-slate-400">({m.relation})</span></span>
                    <button onClick={() => removeMember(m.id)} className="text-rose-500 hover:text-rose-600 text-[10px]">
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                ))}
                {members.length === 0 && <p className="text-[10px] text-slate-400">No members added yet.</p>}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {hasSafeWord ? (
              <>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-violet-100 dark:border-slate-700">
                  <div>
                    <p className="text-[10px] text-slate-400">Your Safe Word</p>
                    <p className="text-lg font-black text-violet-700 dark:text-violet-300">{safeWord}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">Family Members</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{members.length}</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  During any emergency transfer request, ask: <span className="font-bold text-violet-700 dark:text-violet-300">“What’s our Safe Word?”</span> If they don&apos;t know it, it&apos;s a scam.
                </p>
              </>
            ) : (
              <div className="text-center py-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">No Safe Word configured.</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg text-xs font-bold"
                >
                  Set Safe Word Now
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

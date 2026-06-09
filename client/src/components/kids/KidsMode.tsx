import { useState, useEffect } from 'react';
import { useWealthStore } from '../../store/wealthStore';

const AVATARS = [
  { id: 'lion', emoji: '🦁', name: 'Leo the Lion', color: 'from-amber-400 to-orange-500' },
  { id: 'rabbit', emoji: '🐰', name: 'Ruby the Rabbit', color: 'from-pink-400 to-rose-500' },
  { id: 'elephant', emoji: '🐘', name: 'Ella the Elephant', color: 'from-slate-400 to-slate-600' },
  { id: 'panda', emoji: '🐼', name: 'Pip the Panda', color: 'from-emerald-400 to-green-600' },
  { id: 'fox', emoji: '🦊', name: 'Finn the Fox', color: 'from-orange-400 to-red-500' },
  { id: 'penguin', emoji: '🐧', name: 'Penny the Penguin', color: 'from-sky-400 to-blue-600' },
];

const NEEDS_WANTS_ITEMS = [
  { id: '1', text: 'School Books', category: 'need' as const },
  { id: '2', text: 'Video Game', category: 'want' as const },
  { id: '3', text: 'Fruits & Vegetables', category: 'need' as const },
  { id: '4', text: 'Designer Shoes', category: 'want' as const },
  { id: '5', text: 'Medicine', category: 'need' as const },
  { id: '6', text: 'Candy', category: 'want' as const },
  { id: '7', text: 'Water Bottle', category: 'need' as const },
  { id: '8', text: 'Movie Tickets', category: 'want' as const },
];

export default function KidsMode() {
  const kidProfile = useWealthStore((s) => s.kidProfile);
  const kidTasks = useWealthStore((s) => s.kidTasks);
  const spendRequests = useWealthStore((s) => s.spendRequests);
  const setKidProfile = useWealthStore((s) => s.setKidProfile);
  const toggleKidTask = useWealthStore((s) => s.toggleKidTask);
  const addSpendRequest = useWealthStore((s) => s.addSpendRequest);
  const updateSpendRequest = useWealthStore((s) => s.updateSpendRequest);
  const addKidTask = useWealthStore((s) => s.addKidTask);
  const [activeTab, setActiveTab] = useState<'jar' | 'earn' | 'spend' | 'learn'>('jar');
  const [showParentPanel, setShowParentPanel] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(kidProfile?.avatar || '');
  const [showAvatarPicker, setShowAvatarPicker] = useState(!kidProfile);
  const [kidName, setKidName] = useState(kidProfile?.name || '');
  const [spendAmount, setSpendAmount] = useState('');
  const [spendReason, setSpendReason] = useState('');
  const [needsWantsItems, setNeedsWantsItems] = useState(NEEDS_WANTS_ITEMS.map(i => ({ ...i, userChoice: null as 'need' | 'want' | null })));
  const [compoundMonthly, setCompoundMonthly] = useState(500);
  const [compoundYears, setCompoundYears] = useState(10);
  const [showCompoundResult, setShowCompoundResult] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskReward, setNewTaskReward] = useState('50');
  const [coinBurst, setCoinBurst] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const jarFillPercent = Math.min((kidProfile?.currentSavings || 0) / (kidProfile?.savingsGoal || 5000) * 100, 100);

  useEffect(() => {
    if (coinBurst) {
      const t = setTimeout(() => setCoinBurst(false), 1500);
      return () => clearTimeout(t);
    }
  }, [coinBurst]);

  useEffect(() => {
    if (confetti) {
      const t = setTimeout(() => setConfetti(false), 3000);
      return () => clearTimeout(t);
    }
  }, [confetti]);

  const handleAvatarSelect = () => {
    if (kidName && selectedAvatar) {
      setKidProfile({
        name: kidName,
        avatar: selectedAvatar,
        age: 10,
        savingsGoal: 5000,
        currentSavings: 1250,
      });
      setShowAvatarPicker(false);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    toggleKidTask(taskId);
    setCoinBurst(true);
    const completedCount = kidTasks.filter(t => t.completed).length + 1;
    if (completedCount >= 3) {
      setConfetti(true);
    }
  };

  const handleSpendRequest = () => {
    const amount = parseInt(spendAmount);
    if (!amount || !spendReason) return;
    addSpendRequest({
      id: `req-${Date.now()}`,
      amount,
      reason: spendReason,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    });
    setSpendAmount('');
    setSpendReason('');
  };

  const handleNeedsWantsChoice = (itemId: string, choice: 'need' | 'want') => {
    setNeedsWantsItems(prev => prev.map(i => i.id === itemId ? { ...i, userChoice: choice } : i));
  };

  const isNeedsWantsComplete = needsWantsItems.every(i => i.userChoice !== null);
  const needsWantsCorrect = needsWantsItems.filter(i => i.userChoice === i.category).length;

  const compoundResult = (() => {
    const r = 0.08 / 12;
    const n = compoundYears * 12;
    const fv = compoundMonthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    return Math.round(fv);
  })();

  const compoundData = Array.from({ length: compoundYears + 1 }, (_, i) => {
    const r = 0.08 / 12;
    const n = i * 12;
    const fv = i === 0 ? 0 : compoundMonthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    return { year: i, amount: Math.round(fv) };
  });

  const handleParentAddTask = () => {
    if (!newTaskName || !newTaskReward) return;
    addKidTask({
      id: `task-${Date.now()}`,
      title: newTaskName,
      description: 'Set by parent',
      reward: parseInt(newTaskReward),
      completed: false,
      approved: false,
    });
    setNewTaskName('');
    setNewTaskReward('50');
  };

  if (showAvatarPicker) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 border-4 border-amber-200 animate-fade-in">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🏦</div>
            <h2 className="text-2xl font-bold text-slate-800">Welcome to Smart Piggy Bank!</h2>
            <p className="text-slate-500 text-sm mt-1">Let's set up your profile first</p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
            <input
              value={kidName}
              onChange={(e) => setKidName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-lg"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">Pick Your Avatar</label>
            <div className="grid grid-cols-3 gap-3">
              {AVATARS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAvatar(a.id)}
                  className={`p-4 rounded-2xl border-2 transition-all ${selectedAvatar === a.id ? 'border-amber-400 bg-amber-50 scale-105' : 'border-slate-100 hover:border-amber-200'}`}
                >
                  <div className="text-4xl mb-1">{a.emoji}</div>
                  <div className="text-[10px] font-medium text-slate-600">{a.name}</div>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleAvatarSelect}
            disabled={!kidName || !selectedAvatar}
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
          >
            Start Saving! 🚀
          </button>
        </div>
      </div>
    );
  }

  const avatar = AVATARS.find(a => a.id === kidProfile?.avatar) || AVATARS[0];

  return (
    <div className="relative min-h-[calc(100vh-120px)]">
      {/* Confetti overlay */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-start justify-center pt-20">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            >
              <span className="text-2xl">{['🎉', '🎊', '⭐', '💰', '🪙', '🏆'][i % 6]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Coin burst */}
      {coinBurst && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl"
              style={{
                left: '50%',
                top: '50%',
                animation: `coinFly 1.2s ease-out forwards`,
                animationDelay: `${i * 0.05}s`,
                transform: `rotate(${i * 30}deg) translateY(-120px)`,
              }}
            >
              🪙
            </div>
          ))}
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatar.color} flex items-center justify-center text-3xl shadow-lg`}>
            {avatar.emoji}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Hi, {kidProfile?.name}! 👋</h2>
            <p className="text-sm text-slate-500">Smart Piggy Bank</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowParentPanel(!showParentPanel)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-600 transition-colors"
          >
            👨‍👩‍👧 Parent View
          </button>
        </div>
      </div>

      {/* Savings summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-4 border-2 border-amber-200">
          <div className="text-2xl mb-1">💰</div>
          <p className="text-xs text-amber-700 font-medium">My Savings</p>
          <p className="text-lg font-bold text-amber-800">₹{kidProfile?.currentSavings.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-sky-100 to-blue-100 rounded-2xl p-4 border-2 border-sky-200">
          <div className="text-2xl mb-1">🎯</div>
          <p className="text-xs text-sky-700 font-medium">Goal</p>
          <p className="text-lg font-bold text-sky-800">₹{kidProfile?.savingsGoal.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl p-4 border-2 border-emerald-200">
          <div className="text-2xl mb-1">📈</div>
          <p className="text-xs text-emerald-700 font-medium">Progress</p>
          <p className="text-lg font-bold text-emerald-800">{Math.round(jarFillPercent)}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { id: 'jar' as const, label: 'My Jar', icon: '🏺' },
          { id: 'earn' as const, label: 'Earn', icon: '✅' },
          { id: 'spend' as const, label: 'Spend', icon: '🛒' },
          { id: 'learn' as const, label: 'Learn', icon: '📚' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg scale-105'
                : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-amber-200'
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'jar' && (
          <div className="space-y-6">
            {/* Savings Jar Visual */}
            <div className="bg-white rounded-3xl p-8 border-2 border-amber-100 shadow-sm flex flex-col items-center">
              <h3 className="text-lg font-bold text-slate-800 mb-6">My Savings Jar</h3>
              <div className="relative w-48 h-64">
                {/* Jar body */}
                <div className="absolute inset-0 rounded-b-full bg-gradient-to-b from-amber-50 to-amber-100 border-4 border-amber-300 overflow-hidden">
                  {/* Fill level */}
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-400 via-yellow-400 to-yellow-300 transition-all duration-1000 ease-out"
                    style={{ height: `${jarFillPercent}%` }}
                  >
                    {/* Coins inside */}
                    {Array.from({ length: Math.floor(jarFillPercent / 8) }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute text-lg"
                        style={{
                          left: `${15 + (i % 5) * 18}%`,
                          bottom: `${10 + Math.floor(i / 5) * 20}%`,
                          transform: `rotate(${i * 37}deg)`,
                        }}
                      >
                        🪙
                      </div>
                    ))}
                  </div>
                </div>
                {/* Jar neck */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-amber-200 rounded-full border-4 border-amber-300" />
                {/* Jar lid */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-36 h-6 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full border-2 border-amber-600 shadow-md" />
                {/* Shine */}
                <div className="absolute top-8 left-4 w-3 h-16 bg-white/30 rounded-full rotate-12" />
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">You're {Math.round(jarFillPercent)}% to your goal!</p>
                <div className="mt-3 w-64 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000"
                    style={{ width: `${jarFillPercent}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">₹{(kidProfile?.savingsGoal || 0) - (kidProfile?.currentSavings || 0)} more to go!</p>
              </div>
            </div>

            {/* Recent savings activity */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {kidTasks.filter(t => t.completed).slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">✅</span>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{task.title}</p>
                        <p className="text-xs text-slate-400">Task completed</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">+₹{task.reward}</span>
                  </div>
                ))}
                {kidTasks.filter(t => t.completed).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">Complete tasks to fill your jar! 🏺</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'earn' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border-2 border-emerald-200">
              <p className="text-sm text-emerald-700 font-medium">💡 Complete tasks set by your parents to earn coins for your jar!</p>
            </div>
            {kidTasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-5 border-2 transition-all ${
                  task.completed ? 'border-emerald-200 opacity-75' : 'border-slate-100 hover:border-amber-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${task.completed ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      {task.completed ? '✅' : '📋'}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                          🪙 +₹{task.reward}
                        </span>
                        {task.approved && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                            Approved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!task.completed && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-green-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-shadow"
                    >
                      Done! ✅
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'spend' && (
          <div className="space-y-6">
            {/* Request Form */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4">🛒 Ask Parents</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">What do you want to buy?</label>
                  <input
                    value={spendReason}
                    onChange={(e) => setSpendReason(e.target.value)}
                    placeholder="e.g. New cricket bat"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">How much? (₹)</label>
                  <input
                    type="number"
                    value={spendAmount}
                    onChange={(e) => setSpendAmount(e.target.value)}
                    placeholder="500"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-sm"
                  />
                </div>
                <button
                  onClick={handleSpendRequest}
                  disabled={!spendAmount || !spendReason}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl disabled:opacity-50 transition-shadow hover:shadow-lg"
                >
                  Send Request 📨
                </button>
              </div>
            </div>

            {/* Requests List */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4">My Requests</h3>
              <div className="space-y-3">
                {spendRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                        req.status === 'rejected' ? 'bg-rose-100 text-rose-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {req.status === 'approved' ? '✅' : req.status === 'rejected' ? '❌' : '⏳'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{req.reason}</p>
                        <p className="text-xs text-slate-400">{req.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">₹{req.amount}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        req.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status === 'pending' ? 'Waiting' : req.status === 'approved' ? 'Approved!' : 'Not now'}
                      </span>
                    </div>
                  </div>
                ))}
                {spendRequests.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">No requests yet. Ask your parents! 📨</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'learn' && (
          <div className="space-y-6">
            {/* Needs vs Wants */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧠</span>
                <h3 className="text-lg font-bold text-slate-800">Needs vs Wants</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Click each item and decide: Is it a NEED (must have) or a WANT (nice to have)?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {needsWantsItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border-2 border-slate-100 bg-slate-50">
                    <p className="text-sm font-medium text-slate-700 mb-3">{item.text}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleNeedsWantsChoice(item.id, 'need')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                          item.userChoice === 'need'
                            ? item.category === 'need' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        NEED
                      </button>
                      <button
                        onClick={() => handleNeedsWantsChoice(item.id, 'want')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                          item.userChoice === 'want'
                            ? item.category === 'want' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        WANT
                      </button>
                    </div>
                    {item.userChoice !== null && (
                      <p className={`text-[10px] mt-2 font-medium ${item.userChoice === item.category ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.userChoice === item.category ? '✅ Correct!' : `❌ It's actually a ${item.category}!`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {isNeedsWantsComplete && (
                <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 text-center">
                  <p className="text-lg font-bold text-amber-800">
                    {needsWantsCorrect === needsWantsItems.length ? '🏆 Perfect Score!' : `⭐ ${needsWantsCorrect}/${needsWantsItems.length} Correct!`}
                  </p>
                  <p className="text-sm text-amber-600 mt-1">
                    {needsWantsCorrect === needsWantsItems.length
                      ? 'Amazing! You really understand money!'
                      : 'Keep practicing — understanding needs vs wants is the first step to smart spending!'}
                  </p>
                </div>
              )}
            </div>

            {/* Compound Interest Magic */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✨</span>
                <h3 className="text-lg font-bold text-slate-800">Compound Interest Magic</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">See how your money grows when you save regularly!</p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                    <span>Save every month</span>
                    <span className="text-amber-600 font-bold">₹{compoundMonthly}</span>
                  </label>
                  <input
                    type="range"
                    min={100}
                    max={5000}
                    step={100}
                    value={compoundMonthly}
                    onChange={(e) => { setCompoundMonthly(parseInt(e.target.value)); setShowCompoundResult(false); }}
                    className="w-full accent-amber-500"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                    <span>For how many years?</span>
                    <span className="text-amber-600 font-bold">{compoundYears} years</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    step={1}
                    value={compoundYears}
                    onChange={(e) => { setCompoundYears(parseInt(e.target.value)); setShowCompoundResult(false); }}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowCompoundResult(true)}
                className="w-full py-3 bg-gradient-to-r from-violet-400 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg transition-shadow mb-6"
              >
                🔮 Show the Magic!
              </button>
              {showCompoundResult && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-violet-50 rounded-xl text-center">
                      <p className="text-xs text-violet-500">You Put In</p>
                      <p className="text-xl font-bold text-violet-700">₹{(compoundMonthly * compoundYears * 12).toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl text-center border-2 border-amber-200">
                      <p className="text-xs text-amber-600">You Get Back</p>
                      <p className="text-xl font-bold text-amber-700">₹{compoundResult.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl text-center border-2 border-emerald-200">
                    <p className="text-sm text-emerald-700 font-bold">
                      ✨ Magic Money: ₹{(compoundResult - compoundMonthly * compoundYears * 12).toLocaleString()}
                    </p>
                    <p className="text-xs text-emerald-500 mt-1">That's free money from compound interest!</p>
                  </div>
                  {/* Simple bar chart */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500">Growth Over Time</p>
                    <div className="flex items-end gap-1 h-32">
                      {compoundData.filter((_, i) => i % Math.max(1, Math.floor(compoundYears / 10)) === 0 || i === compoundYears).map((d) => (
                        <div key={d.year} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-gradient-to-t from-violet-400 to-purple-300 rounded-t-lg transition-all duration-700"
                            style={{ height: `${Math.max(4, (d.amount / compoundResult) * 100)}%` }}
                          />
                          <span className="text-[9px] text-slate-400">Y{d.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Parent Panel */}
      {showParentPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">👨‍👩‍👧 Parent Dashboard</h3>
                <p className="text-xs text-slate-400">Manage {kidProfile?.name}'s progress</p>
              </div>
              <button onClick={() => setShowParentPanel(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200">
                <i className="fas fa-xmark text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl text-center">
                  <p className="text-lg font-bold text-emerald-700">{kidTasks.filter(t => t.completed).length}</p>
                  <p className="text-[10px] text-emerald-500">Tasks Done</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl text-center">
                  <p className="text-lg font-bold text-amber-700">₹{kidProfile?.currentSavings}</p>
                  <p className="text-[10px] text-amber-500">Saved</p>
                </div>
                <div className="p-3 bg-sky-50 rounded-xl text-center">
                  <p className="text-lg font-bold text-sky-700">{spendRequests.filter(r => r.status === 'pending').length}</p>
                  <p className="text-[10px] text-sky-500">Pending Requests</p>
                </div>
              </div>

              {/* Pending Requests */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3">Pending Spend Requests</h4>
                {spendRequests.filter(r => r.status === 'pending').length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No pending requests 🎉</p>
                ) : (
                  <div className="space-y-2">
                    {spendRequests.filter(r => r.status === 'pending').map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{req.reason}</p>
                          <p className="text-xs text-slate-400">₹{req.amount}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { updateSpendRequest(req.id, 'approved'); setCoinBurst(true); }}
                            className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateSpendRequest(req.id, 'rejected')}
                            className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Task */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3">Add New Task</h4>
                <div className="space-y-2">
                  <input
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="Task name (e.g. Finish Homework)"
                    className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newTaskReward}
                      onChange={(e) => setNewTaskReward(e.target.value)}
                      placeholder="Reward ₹"
                      className="flex-1 px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-sm"
                    />
                    <button
                      onClick={handleParentAddTask}
                      disabled={!newTaskName}
                      className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold rounded-xl disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* All Requests History */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3">Request History</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {spendRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-2 text-xs">
                      <span className="text-slate-600">{req.reason}</span>
                      <span className={`font-bold ${req.status === 'approved' ? 'text-emerald-600' : req.status === 'rejected' ? 'text-rose-600' : 'text-amber-600'}`}>
                        {req.status === 'approved' ? '✅' : req.status === 'rejected' ? '❌' : '⏳'} ₹{req.amount}
                      </span>
                    </div>
                  ))}
                  {spendRequests.length === 0 && <p className="text-xs text-slate-400">No requests yet</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes coinFly {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: translate(-50%, -200%) scale(1.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

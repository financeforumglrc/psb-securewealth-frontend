import { useState, useEffect, useRef, useCallback } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import { formatCurrencyMask } from '@/shared/utils/duressMask';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  shortcut: string;
  color: string;
  action: () => void;
}

export default function QuickActions({ children }: { children: React.ReactNode }) {
  const assets = useWealthStore((s) => s.assets);
  const transactions = useWealthStore((s) => s.transactions);
  const setView = useWealthStore((s) => s.setView);
  const toggleDarkMode = useWealthStore((s) => s.toggleDarkMode);
  const darkMode = useWealthStore((s) => s.darkMode);
  const duressModeActive = useWealthStore((s) => s.duressModeActive);

  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendTo, setSendTo] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recentTx = transactions.find((t) => t.status === 'ALLOWED' && t.type === 'debit');

  const menuItems: MenuItem[] = [
    {
      id: 'balance', label: 'Balance', icon: 'fa-scale-balanced', shortcut: 'B',
      color: 'bg-emerald-500 hover:bg-emerald-600',
      action: () => { setMenuPos(null); setActiveModal('balance'); },
    },
    {
      id: 'send', label: 'Send', icon: 'fa-paper-plane', shortcut: 'S',
      color: 'bg-primary hover:bg-primary/90',
      action: () => { setMenuPos(null); setActiveModal('send'); },
    },
    {
      id: 'portfolio', label: 'Portfolio', icon: 'fa-chart-pie', shortcut: 'P',
      color: 'bg-secondary hover:bg-secondary/90',
      action: () => { setMenuPos(null); setView('portfolio'); },
    },
    {
      id: 'fraud', label: 'Fraud', icon: 'fa-shield-virus', shortcut: 'F',
      color: 'bg-rose-500 hover:bg-rose-600',
      action: () => { setMenuPos(null); setActiveModal('fraud'); },
    },
    {
      id: 'support', label: 'Support', icon: 'fa-headset', shortcut: 'H',
      color: 'bg-amber-500 hover:bg-amber-600',
      action: () => { setMenuPos(null); setActiveModal('support'); },
    },
    {
      id: 'theme', label: darkMode ? 'Light' : 'Dark', icon: darkMode ? 'fa-sun' : 'fa-moon', shortcut: 'T',
      color: 'bg-slate-600 hover:bg-slate-700',
      action: () => { setMenuPos(null); toggleDarkMode(); },
    },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toUpperCase();
      if (key === '?') {
        e.preventDefault();
        setShowShortcuts((s) => !s);
        return;
      }
      if (key === 'ESCAPE') {
        setMenuPos(null);
        setActiveModal(null);
        setShowShortcuts(false);
        return;
      }
      const item = menuItems.find((m) => m.shortcut === key);
      if (item) {
        e.preventDefault();
        item.action();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [menuItems, toggleDarkMode, darkMode]);

  // Close menu on click outside
  useEffect(() => {
    if (!menuPos) return;
    const close = () => setMenuPos(null);
    setTimeout(() => window.addEventListener('click', close, { once: true }), 10);
    return () => window.removeEventListener('click', close);
  }, [menuPos]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    longPressTimer.current = setTimeout(() => {
      const touch = e.touches[0];
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect && touch) {
        setMenuPos({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
      }
    }, 600);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const handleSend = () => {
    if (!sendAmount || !sendTo) return;
    setActiveModal(null);
    setSendAmount('');
    setSendTo('');
  };

  return (
    <div
      ref={containerRef}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {children}

      {/* Radial Menu */}
      {menuPos && (
        <div
          className="absolute z-[90]"
          style={{ left: menuPos.x, top: menuPos.y, transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative w-56 h-56">
            {/* Center dismiss button */}
            <button
              onClick={() => setMenuPos(null)}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-xl z-10 hover:bg-slate-700 transition-colors"
            >
              <i className="fas fa-xmark" />
            </button>
            {/* Menu items in a circle */}
            {menuItems.map((item, i) => {
              const angle = (i * 60 - 90) * (Math.PI / 180);
              const radius = 80;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              return (
                <button
                  key={item.id}
                  onClick={(e) => { e.stopPropagation(); item.action(); }}
                  className={`absolute w-14 h-14 rounded-full ${item.color} text-white flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 animate-fade-in`}
                  style={{
                    left: `calc(50% + ${x}px - 28px)`,
                    top: `calc(50% + ${y}px - 28px)`,
                    animationDelay: `${i * 30}ms`,
                  }}
                  title={`${item.label} (${item.shortcut})`}
                >
                  <i className={`fas ${item.icon} text-sm`} />
                  <span className="text-[8px] font-medium mt-0.5">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Balance Modal */}
      {activeModal === 'balance' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
          <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-sm w-full p-5 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3"><i className="fas fa-scale-balanced text-emerald-500 mr-2" />Quick Balance</h3>
            <div className="space-y-2">
              {assets.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <i className={`fas fa-${a.type === 'bank' ? 'building-columns' : a.type === 'property' ? 'house' : a.type === 'gold' ? 'coins' : 'chart-pie'} text-slate-400 text-xs`} />
                    <span className="text-sm text-slate-700 dark:text-slate-200">{a.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{formatCurrencyMask(a.value, duressModeActive)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100">
                <span className="text-sm font-medium text-emerald-700">Total Net Worth</span>
                <span className="text-sm font-bold text-emerald-700">{formatCurrencyMask(assets.reduce((s, a) => s + a.value, 0), duressModeActive)}</span>
              </div>
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full mt-3 py-2 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-400">Close</button>
          </div>
        </div>
      )}

      {/* Send Money Modal */}
      {activeModal === 'send' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
          <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-sm w-full p-5 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3"><i className="fas fa-paper-plane text-primary mr-2" />Quick Transfer</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">To</label>
                <input
                  type="text"
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  placeholder="UPI ID / Account Number"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {['100', '500', '1000', '5000'].map((amt) => (
                  <button key={amt} onClick={() => setSendAmount(amt)} className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 hover:bg-slate-200 transition-colors">
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!sendAmount || !sendTo}
              className="w-full mt-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              <i className="fas fa-paper-plane mr-2" /> Send Money
            </button>
          </div>
        </div>
      )}

      {/* Fraud Report Modal */}
      {activeModal === 'fraud' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
          <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-md w-full p-5 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3"><i className="fas fa-shield-virus text-rose-500 mr-2" />Report Fraud</h3>
            {recentTx ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Pre-filled from recent transaction:</p>
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{recentTx.description}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{recentTx.date} · {recentTx.category}</p>
                  <p className="text-sm font-bold text-rose-600 mt-1">₹{recentTx.amount.toLocaleString()}</p>
                </div>
                <textarea
                  placeholder="Describe the issue..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 h-20 resize-none"
                  defaultValue="I did not authorize this transaction. Please investigate immediately."
                />
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors"
                >
                  <i className="fas fa-flag mr-2" /> Submit Fraud Report
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No recent transactions to report.</p>
            )}
          </div>
        </div>
      )}

      {/* Support Modal */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
          <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-sm w-full p-5 animate-fade-in text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
              <i className="fas fa-headset text-2xl text-amber-500" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-1">Customer Support</h3>
            <p className="text-xs text-slate-400 mb-4">24x7 Priority Banking Support</p>
            <div className="space-y-2">
              <a href="tel:18001234567" className="block w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
                <i className="fas fa-phone mr-2" /> 1800-123-4567
              </a>
              <a href="mailto:support@securewealth.in" className="block w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                <i className="fas fa-envelope mr-2" /> support@securewealth.in
              </a>
            </div>
            <p className="text-[10px] text-slate-400 mt-3">Average response time: 2 minutes</p>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white"><i className="fas fa-keyboard text-primary mr-2" />Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400"><i className="fas fa-xmark" /></button>
            </div>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <i className={`fas ${item.icon} text-slate-400 w-4`} />
                    <span className="text-sm text-slate-700 dark:text-slate-200">{item.label}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded font-mono">{item.shortcut}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <div className="flex items-center gap-3">
                  <i className="fas fa-circle-question text-slate-400 w-4" />
                  <span className="text-sm text-slate-700 dark:text-slate-200">Show shortcuts</span>
                </div>
                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded font-mono">?</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <div className="flex items-center gap-3">
                  <i className="fas fa-xmark text-slate-400 w-4" />
                  <span className="text-sm text-slate-700 dark:text-slate-200">Close / Cancel</span>
                </div>
                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded font-mono">Esc</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 text-center">Right-click or long-press anywhere for quick actions menu</p>
          </div>
        </div>
      )}
    </div>
  );
}

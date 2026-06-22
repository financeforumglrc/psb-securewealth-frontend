import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';

const PRESETS = [
  { label: 'How do I save tax?', icon: 'fa-receipt' },
  { label: 'SIP recommendations', icon: 'fa-chart-line' },
  { label: 'Analyze my spending', icon: 'fa-wallet' },
  { label: 'Is this payment safe?', icon: 'fa-shield-halved' },
];

export default function WealthTwinAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hi! I am your Wealth Twin. Ask me anything about your money, goals, or safety.' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const setView = useWealthStore((s) => s.setView);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setTimeout(() => {
      let reply = 'I have analysed your profile. Based on your goals and risk appetite, this looks manageable. Want me to simulate the outcome?';
      if (text.toLowerCase().includes('tax')) reply = 'You can save up to ₹1,50,000 under Section 80C via ELSS, PPF, and NPS. I can show a tax planner breakdown.';
      else if (text.toLowerCase().includes('sip')) reply = 'A diversified SIP mix across large-cap, mid-cap, and debt funds aligns with your profile. Want me to open the portfolio view?';
      else if (text.toLowerCase().includes('spend')) reply = 'Your top spend category is shopping this month. I notice a 12% increase vs average — would you like a nudge budget?';
      else if (text.toLowerCase().includes('safe') || text.toLowerCase().includes('fraud')) reply = 'I ran a quick protection check: trust score is healthy and no new device detected. For high-value transfers, I will add a cooling-off reminder.';
      setMessages((m) => [...m, { role: 'ai', text: reply }]);
    }, 600);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-white shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <i className="fas fa-robot text-xs" />
        </div>
        <span className="text-xs font-bold hidden sm:inline">Wealth Twin</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="bg-gradient-to-br from-primary to-primary-dark px-4 py-3 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <i className="fas fa-robot" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">BHAVISHYA AI</p>
                    <p className="text-[10px] text-white/80">Your Wealth Twin</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
                  <i className="fas fa-times" />
                </button>
              </div>

              <div className="h-72 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="p-3 border-t border-slate-100 bg-white">
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2" style={{ scrollbarWidth: 'none' }}>
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        handleSend(p.label);
                        if (p.label.includes('safe')) setView('security-beast');
                        else if (p.label.includes('tax')) setView('tax');
                        else setView('wealth-twin');
                      }}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <i className={`fas ${p.icon} text-[9px]`} /> {p.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                    placeholder="Ask your Wealth Twin…"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-100 text-xs outline-none placeholder:text-slate-400"
                  />
                  <button
                    onClick={() => handleSend(input)}
                    className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors"
                  >
                    <i className="fas fa-paper-plane text-xs" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

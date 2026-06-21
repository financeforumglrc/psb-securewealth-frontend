import { useState, useRef, useEffect } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import { askTwin, generateMonthSummary, addMessage, getChatHistory, type TwinMessage } from '@/shared/services/twinService';
import ELI5Tooltip from '@/features/ai/components/ELI5Tooltip';

export default function FinancialTwinChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<TwinMessage[]>(getChatHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const user = useWealthStore((s) => s.user);
  const goals = useWealthStore((s) => s.goals);
  const transactions = useWealthStore((s) => s.transactions);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: TwinMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const context = {
      monthlyIncome: user.monthlyIncome,
      monthlySavings: user.monthlySavings,
      goals: goals.map((g) => ({ name: g.name, progress: Math.round((g.currentAmount / g.targetAmount) * 100) })),
      recentTransactions: transactions.slice(0, 3).map((t) => ({ desc: t.description, amount: t.amount, type: t.type })),
      fraudEvents: transactions.filter((t) => t.status === 'BLOCKED').length,
    };

    const twinMsg = await askTwin(userMsg.text, context);
    addMessage(twinMsg);
    setMessages((prev) => [...prev, twinMsg]);
    setLoading(false);
  };

  const handleMonthSummary = async () => {
    setLoading(true);
    const context = {
      monthlyIncome: user.monthlyIncome,
      monthlySavings: user.monthlySavings,
      goals: goals.map((g) => ({ name: g.name, progress: Math.round((g.currentAmount / g.targetAmount) * 100) })),
      recentTransactions: transactions.slice(0, 3).map((t) => ({ desc: t.description, amount: t.amount, type: t.type })),
      fraudEvents: transactions.filter((t) => t.status === 'BLOCKED').length,
    };
    const summary = await generateMonthSummary(context);
    const twinMsg: TwinMessage = {
      id: `twin-${Date.now()}`,
      role: 'twin',
      text: summary,
      timestamp: new Date().toISOString(),
    };
    addMessage(twinMsg);
    setMessages((prev) => [...prev, twinMsg]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
        title="Financial Twin"
      >
        <i className="fas fa-robot text-xl" />
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-40 right-6 z-40 w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-fade-in" style={{ maxHeight: '70vh' }}>
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-sm" />
              </div>
              <div>
                <p className="text-sm font-bold">Financial Twin</p>
                <p className="text-[10px] text-white/70">AI-powered wealth companion</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <i className="fas fa-xmark" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-robot text-violet-500" />
                </div>
                <p className="text-xs text-slate-500">Ask me anything about your money!</p>
                <div className="flex flex-wrap gap-2 justify-center mt-3">
                  <button onClick={handleMonthSummary} className="px-2 py-1 bg-violet-50 text-violet-600 text-[10px] font-bold rounded-lg border border-violet-200">
                    📊 Month Summary
                  </button>
                  <button onClick={() => { setInput('What if I save ₹5,000 more?'); }} className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200">
                    💰 What if I save more?
                  </button>
                  <button onClick={() => { setInput('Explain my blocked transactions'); }} className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200">
                    🛡️ Fraud Help
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <ELI5Tooltip term="SIP"><span className="text-[10px] px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full border border-violet-200 cursor-pointer">🧠 SIP</span></ELI5Tooltip>
              <ELI5Tooltip term="P/E Ratio"><span className="text-[10px] px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full border border-violet-200 cursor-pointer">🧠 P/E</span></ELI5Tooltip>
              <ELI5Tooltip term="Compound Interest"><span className="text-[10px] px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full border border-violet-200 cursor-pointer">🧠 Compounding</span></ELI5Tooltip>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your Financial Twin..."
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-violet-500 text-white rounded-xl flex items-center justify-center hover:bg-violet-600 transition-colors disabled:opacity-50"
              >
                <i className="fas fa-paper-plane text-xs" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

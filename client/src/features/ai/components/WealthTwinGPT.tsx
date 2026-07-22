import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Send, Mic, MicOff, Sparkles, TrendingUp, Shield, Target, Home, GraduationCap, Heart } from 'lucide-react';
import { useWealthStore } from '@/shared/store/wealthStore';
import { callLocalAI } from '@/shared/services/localAI';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type?: 'text' | 'insight' | 'warning' | 'action';
  data?: any;
}

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  query: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { icon: TrendingUp, label: 'Wealth Forecast', query: 'What will my wealth be in 5 years?', color: 'bg-blue-500' },
  { icon: Target, label: 'Goal Analysis', query: 'Am I on track to meet my goals?', color: 'bg-emerald-500' },
  { icon: Shield, label: 'Risk Check', query: 'Is my portfolio too risky?', color: 'bg-rose-500' },
  { icon: Home, label: 'Buy House?', query: 'Should I buy a house now or invest?', color: 'bg-amber-500' },
  { icon: GraduationCap, label: 'Child Education', query: 'How much should I save for my child education?', color: 'bg-violet-500' },
  { icon: Heart, label: 'Retirement', query: 'When can I retire comfortably?', color: 'bg-pink-500' },
];

function formatCurrency(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function useTypewriter(text: string, speed: number = 8, enabled: boolean = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!enabled) { setDisplayed(text); setDone(true); return; }
    setDisplayed(''); setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(interval); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, enabled]);
  return { displayed, done };
}

function MessageBubble({ message, isLatest }: { message: Message; isLatest: boolean }) {
  const { displayed, done } = useTypewriter(message.content, 4, isLatest);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] p-3 rounded-2xl ${
        message.role === 'user'
          ? 'bg-indigo-600 text-white'
          : message.type === 'warning'
          ? 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-slate-800 dark:text-slate-200'
          : message.type === 'insight'
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200'
          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
      }`}>
        {message.role === 'assistant' && (
          <div className="flex items-center gap-1 mb-1">
            <Brain className="w-3 h-3 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Wealth Twin AI</span>
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap">{displayed}{!done && isLatest ? '▊' : ''}</p>
        {message.data && (
          <div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-xs font-mono">
            {JSON.stringify(message.data, null, 2)}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function WealthTwinGPT() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your Wealth Twin AI. I know everything about your finances — your goals, spending, investments, and risk profile. Ask me anything about your wealth journey.',
      timestamp: Date.now(),
      type: 'text',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const user = useWealthStore((s) => s.user);
  const assets = useWealthStore((s) => s.assets);
  const goals = useWealthStore((s) => s.goals);
  const transactions = useWealthStore((s) => s.transactions);
  const kycVerified = useWealthStore((s) => s.kycVerified);

  const financialContext = useMemo(() => {
    const netWorth = assets.reduce((sum, a) => sum + a.value, 0);
    const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount).length;
    const monthlySavings = user.monthlySavings;
    const savingsRate = user.monthlyIncome > 0 ? (monthlySavings / user.monthlyIncome) * 100 : 0;
    const recentSpending = transactions.slice(0, 10).reduce((sum, t) => sum + (t.type === 'debit' ? t.amount : 0), 0);

    return {
      netWorth,
      activeGoals,
      monthlySavings,
      monthlyIncome: user.monthlyIncome,
      savingsRate,
      recentSpending,
      kycVerified,
      assetCount: assets.length,
      goalCount: goals.length,
    };
  }, [user, assets, goals, transactions, kycVerified]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN';
      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[event.results.length - 1][0].transcript;
        setInput(text);
      };
      recognitionRef.current.onend = () => setListening(false);
    }
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let responseText = '';
      try {
        // Call backend AI endpoint with financial context
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://psb-securewealth-backend.onrender.com/api/v1'}/ai/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: text,
            context: {
              name: user.name,
              monthlyIncome: financialContext.monthlyIncome,
              monthlySavings: financialContext.monthlySavings,
              netWorth: financialContext.netWorth,
              activeGoals: financialContext.activeGoals,
              savingsRate: financialContext.savingsRate,
            },
          }),
        });
        const data = await res.json();
        if (data.success && data.data?.answer) {
          responseText = data.data.answer;
        } else {
          throw new Error(data.error || 'AI service unavailable');
        }
      } catch {
        // Fallback to local AI when backend AI fails
        const localRes = await callLocalAI(text, {
          name: user.name,
          income: financialContext.monthlyIncome,
          expenses: financialContext.monthlyIncome - financialContext.monthlySavings,
          savings: financialContext.monthlySavings,
          netWorth: financialContext.netWorth,
          goals: goals.map((g) => ({ name: g.name, targetAmount: g.targetAmount, currentAmount: g.currentAmount })),
        });
        responseText = localRes.text;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText || 'I apologize, but I am unable to process your request at the moment. Please try again.',
        timestamp: Date.now(),
        type: 'text',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (_err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or rephrase your question.',
        timestamp: Date.now(),
        type: 'warning',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (query: string) => {
    sendMessage(query);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" /> Wealth Twin GPT
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive AI that knows your complete financial life. Ask anything.</p>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] text-slate-500">GPT-4 powered</span>
        </div>
      </div>

      {/* Financial Context Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] text-slate-400 uppercase font-bold">Net Worth</p>
          <p className="text-sm font-black text-slate-800 dark:text-white">{formatCurrency(financialContext.netWorth)}</p>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] text-slate-400 uppercase font-bold">Savings Rate</p>
          <p className="text-sm font-black text-emerald-600">{financialContext.savingsRate.toFixed(1)}%</p>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] text-slate-400 uppercase font-bold">Active Goals</p>
          <p className="text-sm font-black text-slate-800 dark:text-white">{financialContext.activeGoals}</p>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] text-slate-400 uppercase font-bold">KYC</p>
          <p className="text-sm font-black text-slate-800 dark:text-white">{financialContext.kycVerified ? 'Verified' : 'Pending'}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.query)}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-left hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center text-white`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{action.label}</p>
                  <p className="text-[10px] text-slate-500">{action.query}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chat Interface */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <MessageBubble key={msg.id} message={msg} isLatest={i === messages.length - 1} />
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <button
              onClick={listening ? stopListening : startListening}
              className={`p-2 rounded-lg ${listening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask about your wealth, goals, investments, risks..."
              className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400/30"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

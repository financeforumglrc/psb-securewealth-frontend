import { useTranslation } from '@/shared/hooks/useTranslation';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
  emotion?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'init-1',
    role: 'ai',
    text: 'Namaste! I am your Future Self from 2035. I have lived through the financial decisions you are making today. Ask me anything — I have 10 years of hindsight. 🕉️',
    timestamp: 'Just now',
    emotion: 'peaceful',
  },
];

const AI_RESPONSES: Record<string, string[]> = {
  default: [
    "In 2032, you'll look back and wish you had started that SIP today. The power of compounding is invisible until it's undeniable.",
    "Your Future Self says: The ₹45,000/month education SIP you hesitated on? It became ₹28 lakhs by 2030. Trust the math.",
    "I remember 2025 like yesterday. That impulse car purchase seemed important then. Today, I'd trade it for 2 more years of financial freedom.",
    "Your children will thank you for the decisions you make this year. Generational wealth starts with a single disciplined choice.",
    "In 2035, your Financial DNA score is 94. But it was 67 in 2025. The difference? You started listening to your future self.",
  ],
  save: [
    "By 2031, your emergency fund saved you during the recession. That 6-month buffer felt excessive in 2025 — until it didn't.",
    "Your Future Self is grateful you automated savings. We never felt the money leave — but we definitely felt it grow.",
  ],
  invest: [
    "That NPS contribution you almost skipped? It's funding our retirement travel now. Small pain, massive gain.",
    "The equity SIP you started in 2025? By 2033, it was generating more passive income than your active salary. Patience wins.",
  ],
  spend: [
    "Your Future Self has a confession: We barely remember what we bought in 2025. But we remember every missed investment opportunity.",
    "That 'limited edition' purchase felt urgent in 2025. In 2030, we don't even know where it is. Time > Things.",
  ],
  fear: [
    "I understand your fear. In 2025, we were terrified of market crashes too. But you know what was scarier? Not investing at all.",
    "Your Future Self wants to hug you. The anxiety you feel about money today? It transforms into peace — but only if you act.",
  ],
  goal: [
    "That home you dream of? We bought it in 2030. The down payment fund you started in 2025 made it possible. Visualize. Execute. Achieve.",
    "Your child's education fund seemed impossible in 2025. In 2036, we paid their IIT fees without a loan. Start now.",
  ],
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('save') || lower.includes('emergency')) return randomFrom(AI_RESPONSES.save);
  if (lower.includes('invest') || lower.includes('sip') || lower.includes('fund')) return randomFrom(AI_RESPONSES.invest);
  if (lower.includes('spend') || lower.includes('buy') || lower.includes('purchase')) return randomFrom(AI_RESPONSES.spend);
  if (lower.includes('fear') || lower.includes('scared') || lower.includes('worried') || lower.includes('anxious')) return randomFrom(AI_RESPONSES.fear);
  if (lower.includes('goal') || lower.includes('home') || lower.includes('education') || lower.includes('child')) return randomFrom(AI_RESPONSES.goal);
  return randomFrom(AI_RESPONSES.default);
}

function randomFrom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function AIFutureTwin() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(userMsg.text);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: response,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        emotion: 'wise',
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const quickQuestions = [
    t('aiFutureTwinQuestionSip'),
    t('aiFutureTwinQuestionHouse'),
    t('aiFutureTwinQuestionSaving'),
    t('aiFutureTwinQuestionRetirement'),
    t('aiFutureTwinQuestionCar'),
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('aiFutureTwinConversations'), value: messages.length - 1, icon: 'fa-comments', color: 'bg-violet-50 text-violet-600' },
          { label: t('aiFutureTwinWisdomScore'), value: '94%', icon: 'fa-star', color: 'bg-amber-50 text-amber-600' },
          { label: t('aiFutureTwinFutureYear'), value: '2035', icon: 'fa-calendar', color: 'bg-blue-50 text-blue-600' },
          { label: t('aiFutureTwinHindsightValue'), value: '₹42L', icon: 'fa-gem', color: 'bg-emerald-50 text-emerald-600' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="card-psb flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
              <i className={`fas ${stat.icon}`} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-[10px] text-gray-500 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chat Interface */}
      <div className="card-psb overflow-hidden">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-xl shadow-lg">
            👑
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{t('aiFutureTwinTitle')}</h3>
            <p className="text-[11px] text-gray-500">{t('aiFutureTwinSubtitle')}</p>
          </div>
          <div className="ml-auto px-2.5 py-1 bg-green-50 rounded-full text-[10px] font-bold text-green-700 flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" aria-label="Online" />
            {t('aiFutureTwinOnline')}
          </div>
        </div>

        {/* Messages */}
        <div className="h-[400px] overflow-y-auto space-y-4 pr-2 mb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 shadow-sm">
                        👑
                      </div>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-[12px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-tr-sm'
                          : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                  <p className={`text-[10px] text-gray-400 mt-1 ${msg.role === 'user' ? 'text-right mr-1' : 'ml-10'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                👑
              </div>
              <div className="px-4 py-3 bg-gray-100 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  <motion.div animate={prefersReducedMotion ? false : { y: [0, -4, 0] }} transition={prefersReducedMotion ? undefined : { repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                  <motion.div animate={prefersReducedMotion ? false : { y: [0, -4, 0] }} transition={prefersReducedMotion ? undefined : { repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                  <motion.div animate={prefersReducedMotion ? false : { y: [0, -4, 0] }} transition={prefersReducedMotion ? undefined : { repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Quick Questions */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => { setInput(q); }}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-[10px] font-medium text-gray-600 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={t('aiFutureTwinPlaceholder')}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[12px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 bg-primary text-white rounded-xl text-[12px] font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <i className="fas fa-paper-plane" aria-hidden="true" />
            {t('aiFutureTwinAsk')}
          </button>
        </div>
      </div>

      {/* Future Self Insights */}
      <div className="card-psb">
        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <i className="fas fa-lightbulb text-amber-500" aria-hidden="true" /> {t('aiFutureTwinWisdomTitle')}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { quote: "The best time to start was yesterday. The second best time is today.", year: '2030', category: 'Investing' },
            { quote: "That home seemed impossible in 2025. The ₹25K/month RD made it inevitable by 2030.", year: '2030', category: 'Goals' },
            { quote: "Your emergency fund felt like dead money. Then 2028 happened. You slept peacefully while others panicked.", year: '2028', category: 'Safety' },
            { quote: "Teaching your child about SIPs at age 8 was the best ₹500/month you ever spent.", year: '2034', category: 'Legacy' },
            { quote: "The crypto you FOMO'd into? Gone. The NPS you doubted? Funding your freedom.", year: '2033', category: 'Discipline' },
            { quote: "Your parents' medical emergency cost ₹8L. Because you planned, love didn't become debt.", year: '2029', category: 'Family' },
          ].map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="p-3 rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full">{insight.category}</span>
                <span className="text-[10px] text-gray-400">Year {insight.year}</span>
              </div>
              <p className="text-[11px] text-gray-700 leading-relaxed italic">"{insight.quote}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

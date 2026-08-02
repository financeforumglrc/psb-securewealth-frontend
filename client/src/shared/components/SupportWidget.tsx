import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, X, Headset, ShieldAlert } from 'lucide-react';

const RBI_HELPLINE = '14440';
const BANK_HELPLINE = '1800-123-4567';

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'helpline'>('chat');
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([
    { text: 'Hello! How can I help you today?', sender: 'bot' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, sender: 'user' }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [...prev, { text: 'Thank you for your query. Our support team will respond shortly. For urgent issues, please call RBI helpline 14440.', sender: 'bot' }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center z-50 hover:bg-indigo-700 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Headset className="w-6 h-6" />
      </motion.button>

      {/* Support Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-indigo-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-white" />
                <span className="text-white font-bold">Support & Helpline</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${
                  activeTab === 'chat' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'text-slate-500'
                }`}
              >
                <MessageCircle className="w-4 h-4" /> Live Chat
              </button>
              <button
                onClick={() => setActiveTab('helpline')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${
                  activeTab === 'helpline' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'text-slate-500'
                }`}
              >
                <Phone className="w-4 h-4" /> Helpline
              </button>
            </div>

            {/* Content */}
            <div className="h-80 overflow-y-auto p-4">
              {activeTab === 'chat' ? (
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-xl text-sm ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                      <span className="text-sm font-bold text-rose-700 dark:text-rose-300">RBI Helpline</span>
                    </div>
                    <p className="text-2xl font-black text-rose-600">{RBI_HELPLINE}</p>
                    <p className="text-xs text-rose-500 mt-1">For banking complaints and fraud reporting</p>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">PSB Helpline</span>
                    </div>
                    <p className="text-xl font-black text-indigo-600">{BANK_HELPLINE}</p>
                    <p className="text-xs text-indigo-500 mt-1">24x7 customer support</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500">
                      <strong>Note:</strong> For digital fraud complaints, call RBI helpline 14440 immediately.
                      Your call will be recorded for quality and training purposes.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Input (only for chat) */}
            {activeTab === 'chat' && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400/30"
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

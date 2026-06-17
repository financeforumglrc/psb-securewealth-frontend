import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Volume2, VolumeX, Minimize2, Maximize2, PlayCircle, MessageSquare } from 'lucide-react';

interface DemoAssistantProps {
  message: string;
  speaking: boolean;
  onToggleSpeak: () => void;
  onStartTour: () => void;
  onStopTour: () => void;
  tourActive: boolean;
}

export default function DemoAssistant({ message, speaking, onToggleSpeak, onStartTour, onStopTour, tourActive }: DemoAssistantProps) {
  const [minimized, setMinimized] = useState(false);
  const [typed, setTyped] = useState('');
  const [showDots, setShowDots] = useState(true);
  const indexRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const lastMessageRef = useRef(message);

  useEffect(() => {
    if (message === lastMessageRef.current && typed.length) return;
    lastMessageRef.current = message;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTyped('');
    setShowDots(true);
    indexRef.current = 0;

    const typeNext = () => {
      if (indexRef.current >= message.length) {
        setShowDots(false);
        if (speaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(message);
          utter.rate = 1.05;
          utter.pitch = 1;
          utter.lang = 'en-IN';
          window.speechSynthesis.speak(utter);
        }
        return;
      }
      const next = message.slice(0, indexRef.current + 1);
      setTyped(next);
      indexRef.current += 1;
      timeoutRef.current = window.setTimeout(typeNext, 18);
    };
    timeoutRef.current = window.setTimeout(typeNext, 300);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [message, speaking]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="fixed bottom-14 left-4 z-50 flex flex-col items-start pointer-events-none">
      <AnimatePresence>
        {!minimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-3 w-80 p-4 rounded-2xl bg-slate-900/90 border border-slate-700 backdrop-blur-xl shadow-2xl pointer-events-auto"
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-100">Wealth Twin Guide</p>
                <p className="text-[10px] text-cyan-400">{tourActive ? 'Judge tour in progress…' : 'Ask me anything, or start the tour.'}</p>
              </div>
            </div>
            <div className="min-h-[4.5rem] text-sm text-slate-300 leading-relaxed mb-3">
              {typed}
              {showDots && <span className="inline-block w-1 h-1 bg-cyan-400 rounded-full ml-1 animate-pulse" />}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={tourActive ? onStopTour : onStartTour}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  tourActive ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                {tourActive ? <MessageSquare className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                {tourActive ? 'Stop Judge Tour' : 'Start Judge Tour'}
              </button>
              <button
                onClick={onToggleSpeak}
                title={speaking ? 'Mute voice' : 'Voice narration'}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                {speaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setMinimized((m) => !m)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/50 text-xs font-bold backdrop-blur-md pointer-events-auto"
      >
        {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
        {minimized ? 'Open Guide' : 'Hide'}
      </button>
    </div>
  );
}

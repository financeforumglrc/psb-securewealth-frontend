import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Shield, AlertTriangle } from 'lucide-react';
import { useWealthStore } from '@/shared/store/wealthStore';

const PANIC_WORDS = ['help', 'emergency', 'danger', 'bachao', 'madad', 'stop'];

export default function VoicePanicTrigger() {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [triggered, setTriggered] = useState(false);
  const [customWord, setCustomWord] = useState('bachao');
  const recognitionRef = useRef<any>(null);
  const duressModeActive = useWealthStore((s) => s.duressModeActive);
  const setDuressModeActive = useWealthStore((s) => s.setDuressModeActive);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const last = event.results[event.results.length - 1];
        const text = last[0].transcript.toLowerCase();
        setTranscript(text);
        const words = [...PANIC_WORDS, customWord.toLowerCase()];
        if (words.some((w) => text.includes(w))) {
          triggerPanic();
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.warn('[VoicePanic] Speech recognition error:', event.error);
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        if (listening) {
          try { recognitionRef.current.start(); } catch { /* ignore */ }
        }
      };
    }
    return () => {
      recognitionRef.current?.stop();
    };
  }, [customWord, listening]);

  const triggerPanic = () => {
    if (!duressModeActive) {
      setDuressModeActive(true);
      setTriggered(true);
      setTimeout(() => setTriggered(false), 3000);
    }
  };

  const toggleListening = () => {
    if (!supported || !recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
        setTranscript('');
      } catch {
        setListening(false);
      }
    }
  };

  const simulatePanic = () => {
    setTranscript(customWord);
    triggerPanic();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Mic className="w-5 h-5 text-rose-600" /> Voice Panic Trigger
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Say your secret word to instantly activate duress mode and show a fake balance.</p>
      </div>

      {!supported && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Speech recognition is not supported in this browser. Use the simulate button for demo.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Voice Control */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Voice Control</span>
            <button
              onClick={toggleListening}
              disabled={!supported}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                listening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              } disabled:opacity-40`}
            >
              {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 min-h-[80px]">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Listening for panic word...</p>
            <p className="text-sm font-mono text-slate-700 dark:text-slate-200">
              {transcript || (listening ? 'Speak now...' : 'Click mic to start listening')}
            </p>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-bold block mb-1">Custom Panic Word</label>
            <input
              type="text"
              value={customWord}
              onChange={(e) => setCustomWord(e.target.value)}
              placeholder="e.g. bachao, help, emergency"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-rose-400/30"
            />
          </div>

          <button
            onClick={simulatePanic}
            className="w-full py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
          >
            Simulate Panic Word
          </button>
        </div>

        {/* Status */}
        <div className="space-y-3">
          <div className={`p-4 rounded-2xl border ${
            duressModeActive
              ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
              : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className={`w-5 h-5 ${duressModeActive ? 'text-rose-600' : 'text-emerald-600'}`} />
              <span className="text-sm font-black uppercase tracking-wider">
                {duressModeActive ? 'Duress Mode: ACTIVE' : 'Duress Mode: Inactive'}
              </span>
            </div>
            <p className="text-xs">
              {duressModeActive
                ? 'Your real balance is hidden. A fake low balance is displayed to protect you.'
                : 'Say your panic word to activate duress mode and protect your account.'}
            </p>
          </div>

          {triggered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-rose-600 text-white"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-black">PANIC WORD DETECTED</span>
              </div>
              <p className="text-xs mt-1 text-white/80">Duress mode activated. Showing fake balance to potential attacker.</p>
            </motion.div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">How it works</p>
            <ul className="text-[10px] text-slate-500 space-y-0.5">
              <li>• Say your secret word (e.g. "bachao")</li>
              <li>• App instantly switches to fake balance view</li>
              <li>• Real data is hidden, attacker sees decoy</li>
              <li>• Silent alert can be sent to trusted contacts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

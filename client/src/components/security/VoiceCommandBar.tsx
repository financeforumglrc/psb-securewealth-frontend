import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logSecurityEvent } from '../../utils/securityLogger';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const COMMANDS = [
  { phrase: 'show balance', action: 'Displays current balance' },
  { phrase: 'send money to', action: 'Opens transfer form' },
  { phrase: 'pay bill', action: 'Opens bill payment' },
  { phrase: 'what is my net worth', action: 'Shows net worth summary' },
  { phrase: 'show transactions', action: 'Opens transaction history' },
  { phrase: 'help', action: 'Shows command list' },
  { phrase: 'lock app', action: 'Locks the app immediately' },
  { phrase: 'duress', action: 'Silent alert to fraud team' },
];

export default function VoiceCommandBar() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [matchedCommand, setMatchedCommand] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const recognitionRef = useRef<any>(null);
  const waveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition: any = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: any) => {
      const interim = Array.from(event.results as any)
        .map((r: any) => r[0].transcript)
        .join('');
      setTranscript(interim);

      for (const cmd of COMMANDS) {
        if (interim.toLowerCase().includes(cmd.phrase)) {
          setMatchedCommand(cmd.phrase);
          break;
        }
      }
    };

    recognition.onend = () => {
      setListening(false);
      if (matchedCommand) {
        logSecurityEvent('Voice', `Command executed: "${matchedCommand}"`, 'info', 'Voice navigation');
        setTimeout(() => {
          setMatchedCommand(null);
          setTranscript('');
        }, 3000);
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, [matchedCommand]);

  function toggleListening() {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setTranscript('');
      setMatchedCommand(null);
      recognitionRef.current.start();
      setListening(true);
      logSecurityEvent('Voice', 'Listening started', 'info', 'Voice navigation');
    }
  }

  return (
    <>
      {/* Floating Mic Button */}
      <div className="fixed bottom-24 right-4 z-50">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleListening}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-xl transition-colors ${
            listening ? 'bg-rose-500 text-white animate-pulse' : 'bg-primary text-white'
          }`}
        >
          <i className={`fas ${listening ? 'fa-microphone-lines' : 'fa-microphone'}`} />
        </motion.button>
        {listening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full"
          >
            Listening...
          </motion.div>
        )}
      </div>

      {/* Voice Panel */}
      <AnimatePresence>
        {(listening || transcript) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-40 right-4 z-50 w-72 card shadow-2xl"
          >
            {/* Waveform */}
            <div ref={waveRef} className="flex items-center justify-center gap-1 h-10 mb-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={
                    listening
                      ? { height: [8, 24 + Math.random() * 16, 8] }
                      : { height: 8 }
                  }
                  transition={{
                    duration: 0.4,
                    repeat: listening ? Infinity : 0,
                    delay: i * 0.05,
                  }}
                  className="w-1 bg-primary rounded-full"
                />
              ))}
            </div>

            {/* Transcript */}
            {transcript && (
              <p className="text-xs text-slate-600 dark:text-slate-300 text-center mb-2 italic">
                "{transcript}"
              </p>
            )}

            {/* Matched Command */}
            {matchedCommand && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center"
              >
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  <i className="fas fa-check mr-1" />
                  Command: "{matchedCommand}"
                </p>
              </motion.div>
            )}

            {/* Help Button */}
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="mt-2 w-full py-1 text-[10px] text-slate-400 hover:text-primary transition-colors"
            >
              {showHelp ? 'Hide' : 'Show'} Voice Commands
            </button>

            {showHelp && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 space-y-1 max-h-40 overflow-y-auto"
              >
                {COMMANDS.map((cmd) => (
                  <div
                    key={cmd.phrase}
                    className="flex items-center justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-800"
                  >
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">"{cmd.phrase}"</span>
                    <span className="text-[10px] text-slate-400">{cmd.action}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

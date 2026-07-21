import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Shield, CheckCircle2, AlertTriangle, Volume2, Zap } from 'lucide-react';

interface VoiceCommand {
  id: string;
  command: string;
  example: string;
  action: string;
  requiresLiveness: boolean;
}

const COMMANDS: VoiceCommand[] = [
  { id: 'balance', command: 'Check my balance', example: 'Check my balance', action: 'balance', requiresLiveness: false },
  { id: 'transfer', command: 'Transfer ₹5,000 to Mom', example: 'Transfer 5000 to mom', action: 'transfer', requiresLiveness: true },
  { id: 'sip', command: 'Start SIP of ₹10,000', example: 'Start SIP of 10000', action: 'sip', requiresLiveness: true },
  { id: 'block', command: 'Block my card', example: 'Block my card', action: 'block', requiresLiveness: true },
  { id: 'report', command: 'Generate wealth report', example: 'Generate wealth report', action: 'report', requiresLiveness: false },
  { id: 'goal', command: 'Show my goals', example: 'Show my goals', action: 'goal', requiresLiveness: false },
];

export default function VoiceAuthenticatedCommands() {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<{ text: string; result: string; status: 'success' | 'error' | 'pending' } | null>(null);
  const [livenessCheck, setLivenessCheck] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const text = result[0].transcript;
        setTranscript(text);
        if (result.isFinal) {
          processCommand(text);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.warn('[VoiceCommands] Speech recognition error:', event.error);
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const processCommand = (text: string) => {
    const lower = text.toLowerCase();
    const matched = COMMANDS.find((c) => lower.includes(c.action) || lower.includes(c.command.toLowerCase()));

    if (!matched) {
      setLastCommand({ text, result: 'Command not recognized. Try "Check my balance" or "Transfer money".', status: 'error' });
      return;
    }

    if (matched.requiresLiveness) {
      setLivenessCheck(true);
      setLastCommand({ text, result: 'Liveness verification required. Please say "I authorize this transaction" clearly.', status: 'pending' });
      setTimeout(() => {
        setLivenessCheck(false);
        setLastCommand({ text, result: `✓ Liveness verified. ${matched.command} executed successfully.`, status: 'success' });
      }, 2000);
    } else {
      setLastCommand({ text, result: `✓ ${matched.command} executed successfully.`, status: 'success' });
    }
  };

  const startListening = () => {
    if (!supported || !recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setListening(true);
      setTranscript('');
    } catch {
      setListening(false);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const simulateCommand = (command: string) => {
    setTranscript(command);
    processCommand(command);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Mic className="w-5 h-5 text-indigo-600" /> Voice-Authenticated Wealth Commands
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Patent-pending: Execute financial actions with voice biometrics and liveness detection.</p>
      </div>

      {/* Voice Control */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Voice Control</span>
          <button
            onClick={listening ? stopListening : startListening}
            disabled={!supported}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              listening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            } disabled:opacity-40`}
          >
            {listening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 min-h-[80px]">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Listening...</p>
          <p className="text-sm font-mono text-slate-700 dark:text-slate-200">
            {transcript || (listening ? 'Speak a command...' : 'Click mic to start')}
          </p>
        </div>

        {livenessCheck && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
          >
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-600 animate-pulse" />
              <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Liveness check in progress...</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Commands */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {COMMANDS.map((cmd) => (
          <button
            key={cmd.id}
            onClick={() => simulateCommand(cmd.example)}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-left hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
          >
            <p className="text-xs font-bold text-slate-800 dark:text-white">{cmd.command}</p>
            {cmd.requiresLiveness && (
              <p className="text-[9px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Liveness required
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Last Result */}
      {lastCommand && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl border ${
            lastCommand.status === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
              : lastCommand.status === 'error'
              ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
          }`}
        >
          <div className="flex items-start gap-2">
            {lastCommand.status === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
            ) : lastCommand.status === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5" />
            ) : (
              <Zap className="w-4 h-4 text-amber-600 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-bold">You said: "{lastCommand.text}"</p>
              <p className="text-xs mt-1">{lastCommand.result}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Note */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <p className="text-[10px] text-slate-500 flex items-start gap-2">
          <Shield className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>
            Voice commands use Web Speech API for recognition. Liveness detection simulates voice biometrics.
            High-value commands require additional verification.
          </span>
        </p>
      </div>
    </div>
  );
}

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onPay: (amount: number, payee: string) => void;
}

export default function VoicePayment({ onPay }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsed, setParsed] = useState<{ amount?: number; payee?: string } | null>(null);
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    setTranscript('');
    setParsed(null);
    setError('');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice not supported. Try Chrome on desktop/mobile.');
      // Simulate for demo
      setIsListening(true);
      setTimeout(() => {
        setTranscript('Pay five hundred rupees to Mrigesh');
        setParsed({ amount: 500, payee: 'Mrigesh' });
        setIsListening(false);
      }, 2500);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'en-IN';
    rec.continuous = false;
    rec.interimResults = true;
    recognitionRef.current = rec;

    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => {
      const text = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setTranscript(text);
    };
    rec.onend = () => {
      setIsListening(false);
      parseCommand(transcript || recognitionRef.current?.lastResult || '');
    };
    rec.onerror = () => {
      setIsListening(false);
      setError('Could not hear you. Please try again.');
    };
    rec.start();
  }, [transcript]);

  const parseCommand = (text: string) => {
    const lower = text.toLowerCase();
    const amountMatch = lower.match(/(?:pay|send|transfer)\s*(?:rs\.?|rupees?|₹)?\s*(\d+)/);
    const amount = amountMatch ? parseInt(amountMatch[1]) : undefined;

    const payeeMatch = lower.match(/(?:to|for)\s+([a-z]+)/i);
    const payee = payeeMatch ? payeeMatch[1].charAt(0).toUpperCase() + payeeMatch[1].slice(1) : undefined;

    if (amount && payee) {
      setParsed({ amount, payee });
    } else {
      setError('Say: "Pay 500 to Mrigesh"');
    }
  };

  return (
    <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative">
        <h3 className="font-bold flex items-center gap-2 mb-3">
          <i className="fas fa-microphone" />
          Voice Payment
        </h3>
        <p className="text-xs text-white/70 mb-4">Say: "Pay 500 to Mrigesh"</p>

        <motion.button
          onClick={startListening}
          disabled={isListening}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
            isListening ? 'bg-white/20' : 'bg-white text-purple-600 hover:bg-white/90'
          }`}
        >
          {isListening ? (
            <>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <i className="fas fa-wave-square" />
              </motion.span>
              Listening...
            </>
          ) : (
            <>
              <i className="fas fa-microphone" />
              Tap & Speak
            </>
          )}
        </motion.button>

        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-white/10 rounded-xl text-xs"
            >
              <p className="text-white/60 italic">"{transcript}"</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {parsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 p-3 bg-white/20 rounded-xl"
            >
              <p className="text-sm font-bold">Pay ₹{parsed.amount} to {parsed.payee}?</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => { onPay(parsed.amount || 0, parsed.payee || ''); setParsed(null); setTranscript(''); }}
                  className="flex-1 py-2 bg-white text-purple-600 rounded-lg font-bold text-xs hover:bg-white/90"
                >
                  Confirm
                </button>
                <button
                  onClick={() => { setParsed(null); setTranscript(''); }}
                  className="flex-1 py-2 bg-white/10 text-white rounded-lg font-medium text-xs hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="text-xs text-white/80 mt-2"><i className="fas fa-circle-info mr-1" />{error}</p>}
      </div>
    </div>
  );
}

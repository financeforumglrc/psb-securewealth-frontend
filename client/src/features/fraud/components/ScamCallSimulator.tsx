import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ScamScript {
  id: string;
  caller: string;
  number: string;
  lines: { speaker: 'caller' | 'user' | 'ai'; text: string; delay: number }[];
  riskScore: number;
  verdict: 'scam' | 'suspicious' | 'safe';
  redFlags: string[];
}

const SCAM_SCRIPTS: ScamScript[] = [
  {
    id: 'bank-otp',
    caller: 'PSB Bank Support',
    number: '+91 98765 43210',
    lines: [
      { speaker: 'caller', text: 'Hello, this is Priya from PSB Bank fraud department.', delay: 800 },
      { speaker: 'caller', text: 'We have detected a suspicious transaction of ₹50,000 on your account.', delay: 1500 },
      { speaker: 'caller', text: 'Your account will be blocked in 30 minutes unless you verify your identity.', delay: 2000 },
      { speaker: 'caller', text: 'Please share the OTP sent to your registered mobile number immediately.', delay: 2000 },
      { speaker: 'ai', text: '⚠️ Red flag: Bank never asks for OTP on call. Urgency + OTP request = scam.', delay: 1000 },
      { speaker: 'caller', text: 'Sir/Madam, please hurry! Your money is at risk. Share the 6-digit OTP now.', delay: 2000 },
      { speaker: 'ai', text: '🚨 SCAM DETECTED: Impersonating bank, creating urgency, requesting OTP.', delay: 1000 },
    ],
    riskScore: 95,
    verdict: 'scam',
    redFlags: ['Impersonating bank official', 'Creating urgency', 'Requesting OTP', 'Threatening account block'],
  },
  {
    id: 'kyc-update',
    caller: 'KYC Verification Team',
    number: '+91 87654 32109',
    lines: [
      { speaker: 'caller', text: 'This is an automated call from KYC verification center.', delay: 800 },
      { speaker: 'caller', text: 'Your KYC has expired. Click the link sent via SMS to update within 24 hours.', delay: 2000 },
      { speaker: 'caller', text: 'Failure to update will result in account suspension and penalty.', delay: 2000 },
      { speaker: 'ai', text: '⚠️ Red flag: KYC never expires. Legitimate banks send official letters, not SMS links.', delay: 1000 },
      { speaker: 'caller', text: 'To avoid legal action, please verify your Aadhaar and PAN immediately.', delay: 2000 },
      { speaker: 'ai', text: '🚨 SCAM DETECTED: Fake KYC expiry, phishing link, threatening legal action.', delay: 1000 },
    ],
    riskScore: 88,
    verdict: 'scam',
    redFlags: ['Fake KYC expiry', 'Phishing SMS link', 'Threatening legal action', 'Requesting Aadhaar/PAN'],
  },
  {
    id: 'cashback',
    caller: 'Cashback Rewards Dept',
    number: '+91 76543 21098',
    lines: [
      { speaker: 'caller', text: 'Congratulations! You have won a cashback of ₹25,000 from PSB Bank.', delay: 1000 },
      { speaker: 'caller', text: 'To claim your reward, please pay a small processing fee of ₹500.', delay: 2000 },
      { speaker: 'caller', text: 'Share your UPI ID and we will send the collect request for the fee.', delay: 2000 },
      { speaker: 'ai', text: '⚠️ Red flag: No genuine bank asks for fee to give cashback. Collect request = scam.', delay: 1000 },
      { speaker: 'caller', text: 'This offer is valid only for today. Act fast!', delay: 1500 },
      { speaker: 'ai', text: '🚨 SCAM DETECTED: Fake cashback, upfront fee request, UPI collect scam.', delay: 1000 },
    ],
    riskScore: 91,
    verdict: 'scam',
    redFlags: ['Fake cashback offer', 'Upfront fee request', 'UPI collect scam', 'Creating urgency'],
  },
];

function verdictColor(verdict: string) {
  if (verdict === 'scam') return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800';
  if (verdict === 'suspicious') return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
  return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
}

export default function ScamCallSimulator() {
  const [activeCall, setActiveCall] = useState<ScamScript | null>(null);
  const [currentLine, setCurrentLine] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [aiAlert, setAiAlert] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startCall = (script: ScamScript) => {
    setActiveCall(script);
    setCurrentLine(0);
    setIsPlaying(true);
    setCompleted(false);
    setAiAlert(false);
  };

  const stopCall = () => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setCompleted(true);
  };

  useEffect(() => {
    if (!isPlaying || !activeCall) return;
    if (currentLine >= activeCall.lines.length) {
      setIsPlaying(false);
      setCompleted(true);
      setAiAlert(true);
      return;
    }
    const line = activeCall.lines[currentLine];
    timerRef.current = setTimeout(() => {
      setCurrentLine((c) => c + 1);
      if (line.speaker === 'ai') setAiAlert(true);
    }, line.delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, currentLine, activeCall]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Phone className="w-5 h-5 text-rose-600" /> AI Scam Call Detection
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Simulate receiving a scam call and watch the AI detect red flags in real-time.</p>
      </div>

      {/* Call Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SCAM_SCRIPTS.map((script) => (
          <button
            key={script.id}
            onClick={() => startCall(script)}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-left hover:border-rose-300 dark:hover:border-rose-700 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-white">{script.caller}</span>
            </div>
            <p className="text-[10px] text-slate-400">{script.number}</p>
            <p className="text-[10px] text-slate-500 mt-1">Risk: {script.riskScore}/100</p>
          </button>
        ))}
      </div>

      {/* Active Call */}
      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {/* Phone UI */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center mb-2">
                  <Phone className="w-6 h-6 text-rose-400" />
                </div>
                <p className="text-sm font-bold text-white">{activeCall.caller}</p>
                <p className="text-[10px] text-slate-400">{activeCall.number}</p>
                <p className="text-[10px] text-rose-400 mt-1 font-bold">{isPlaying ? 'Incoming call...' : 'Call ended'}</p>
              </div>

              {/* Transcript */}
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {activeCall.lines.slice(0, currentLine).map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: line.speaker === 'caller' ? -8 : line.speaker === 'ai' ? 8 : 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-2 rounded-lg text-xs ${
                      line.speaker === 'caller'
                        ? 'bg-slate-800 text-slate-200 ml-4'
                        : line.speaker === 'ai'
                        ? 'bg-indigo-900/30 text-indigo-300 border border-indigo-700/50 mr-4'
                        : 'bg-slate-800 text-slate-200 mr-4'
                    }`}
                  >
                    <p className="text-[9px] uppercase font-bold opacity-60 mb-0.5">
                      {line.speaker === 'caller' ? 'Caller' : line.speaker === 'ai' ? 'AI Defense' : 'You'}
                    </p>
                    <p>{line.text}</p>
                  </motion.div>
                ))}
              </div>

              {isPlaying && (
                <button
                  onClick={stopCall}
                  className="w-full py-2 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <PhoneOff className="w-4 h-4" /> End Call
                </button>
              )}
            </div>

            {/* AI Analysis */}
            <div className="space-y-3">
              <AnimatePresence>
                {aiAlert && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-2xl border ${verdictColor(activeCall.verdict)}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="text-sm font-black uppercase tracking-wider">AI Verdict: {activeCall.verdict.toUpperCase()}</span>
                    </div>
                    <p className="text-xs mb-3">Risk Score: {activeCall.riskScore}/100</p>
                    <div className="space-y-1">
                      {activeCall.redFlags.map((flag, i) => (
                        <p key={i} className="text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {flag}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              {completed && (
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1">
                    <Shield className="w-4 h-4" /> Block Number
                  </button>
                  <button className="p-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Report Fraud
                  </button>
                </div>
              )}

              {/* Tips */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">Safety Tips</p>
                <ul className="text-[10px] text-slate-500 space-y-0.5">
                  <li>• Bank never asks for OTP, PIN, or password on call</li>
                  <li>• Never share Aadhaar/PAN on unsolicited calls</li>
                  <li>• Urgency is the #1 scam indicator</li>
                  <li>• Verify by calling the official bank number</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

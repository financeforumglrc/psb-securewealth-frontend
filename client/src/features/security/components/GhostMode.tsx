import { useState, useEffect, useCallback, useRef } from 'react';

interface ScamCall {
  id: string;
  number: string;
  type: string;
  startedAt: string;
  status: 'ringing' | 'ghosting' | 'blocked';
}

interface GhostStats {
  totalBlocked: number;
  totalMinutesWasted: number;
  moneySaved: number;
  calls: ScamCall[];
  transcripts: { id: string; lines: { speaker: 'scammer' | 'ghost'; text: string; delay: number }[] }[];
}

const GHOST_KEY = 'sw_ghost_stats';

const SCAM_TYPES = [
  { type: 'KYC Update', script: ['Your KYC has expired. Provide PAN and Aadhaar.', 'Oh no! Which one is PAN again? Is that the yellow card or blue?', 'The yellow card sir. Send photo immediately.', 'I have so many cards. Let me find my wallet... *rustling sounds*'] },
  { type: 'Lottery Win', script: ['Congratulations! You won ₹25 lakh in lucky draw.', 'Wow! Is it more than my FD? I have ₹3 lakh in SBI.', 'Much more sir. Just pay ₹5,000 processing fee.', 'I will ask my son. He is in America. What time is it there?'] },
  { type: 'Tax Refund', script: ['This is Income Tax Department. You have refund pending.', 'Which year? I filed 2019, 2020, 2021, 2022, 2023...', '2023 sir. Click link to claim.', 'My grandson handles computer. He is in school now. Can you call at 4pm?'] },
  { type: 'Bank Block', script: ['Your account will be blocked in 2 hours.', 'Which account? I have 7 accounts. SBI, HDFC, ICICI...', 'All accounts sir. Urgently verify OTP.', 'My OTP comes to old number. I changed to Jio last month. Do you have new number?'] },
];

function loadStats(): GhostStats {
  try {
    const raw = JSON.parse(localStorage.getItem(GHOST_KEY) || '{}');
    return { totalBlocked: 0, totalMinutesWasted: 0, moneySaved: 0, calls: [], transcripts: [], ...raw };
  } catch {
    return { totalBlocked: 0, totalMinutesWasted: 0, moneySaved: 0, calls: [], transcripts: [] };
  }
}
function saveStats(s: GhostStats) { localStorage.setItem(GHOST_KEY, JSON.stringify(s)); }

export default function GhostMode() {
  const [enabled, setEnabled] = useState(() => {
    const s = loadStats();
    return (s.totalBlocked || 0) > 0;
  });
  const [stats, setStats] = useState<GhostStats>(loadStats);
  const [activeCall, setActiveCall] = useState<ScamCall | null>(null);
  const [transcript, setTranscript] = useState<{ speaker: 'scammer' | 'ghost'; text: string }[]>([]);
  const [ringing, setRinging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { saveStats(stats); }, [stats]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [transcript]);

  const simulateIncoming = useCallback(() => {
    const scam = SCAM_TYPES[Math.floor(Math.random() * SCAM_TYPES.length)];
    const num = `+91 ${Math.floor(70000 + Math.random() * 29999)} ${Math.floor(10000 + Math.random() * 89999)}`;
    const call: ScamCall = { id: `call-${Date.now()}`, number: num, type: scam.type, startedAt: new Date().toISOString(), status: 'ringing' };
    setActiveCall(call);
    setRinging(true);
    setTranscript([]);

    setTimeout(() => {
      if (!enabled) {
        setRinging(false);
        setActiveCall(null);
        return;
      }
      setRinging(false);
      setActiveCall((c) => (c ? { ...c, status: 'ghosting' } : c));

      // Play transcript
      let lineIdx = 0;
      const lines: { speaker: 'scammer' | 'ghost'; text: string; delay: number }[] = scam.script.map((text, i) => ({ speaker: i % 2 === 0 ? 'scammer' : 'ghost', text, delay: 1500 + i * 2500 }));
      lines.forEach((line) => {
        setTimeout(() => {
          setTranscript((prev) => [...prev, line]);
          lineIdx++;
          if (lineIdx >= lines.length) {
            setTimeout(() => {
              setStats((s) => ({
                ...s,
                totalBlocked: s.totalBlocked + 1,
                totalMinutesWasted: s.totalMinutesWasted + 3,
                moneySaved: s.moneySaved + 25000,
                calls: [call, ...s.calls].slice(0, 20),
                transcripts: [{ id: call.id, lines }, ...s.transcripts].slice(0, 10),
              }));
              setActiveCall((c) => (c ? { ...c, status: 'blocked' } : c));
            }, 2000);
          }
        }, line.delay);
      });
    }, 3000);
  }, [enabled]);

  const scamCounts = SCAM_TYPES.map((s) => ({
    type: s.type,
    count: stats.calls.filter((c) => c.type === s.type).length,
  }));
  const maxCount = Math.max(...scamCounts.map((c) => c.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-ghost text-violet-500" /> Ghost Mode
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">AI that wastes scammers' time while you live your life</p>
        </div>
        <button
          onClick={() => setEnabled((e) => !e)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            enabled ? 'bg-violet-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <i className={`fas ${enabled ? 'fa-power-off' : 'fa-circle'}`} />
          {enabled ? 'ARMED' : 'STANDBY'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10">
          <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">{stats.totalBlocked}</p>
          <p className="text-[10px] text-violet-500">Scams Blocked</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalMinutesWasted}</p>
          <p className="text-[10px] text-slate-400">Mins Wasted</p>
        </div>
        <div className="card bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10">
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">₹{stats.moneySaved.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-500">Money Saved</p>
        </div>
      </div>

      {/* Incoming Call Simulation */}
      <div className="card bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center">
              <i className="fas fa-phone-volume text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold">Incoming Call Simulator</h3>
              <p className="text-[10px] text-slate-400">Test how Ghost Mode handles scam calls</p>
            </div>
          </div>
          <button
            onClick={simulateIncoming}
            disabled={!!activeCall && activeCall.status !== 'blocked'}
            className="px-4 py-2 bg-violet-500 hover:bg-violet-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
          >
            <i className="fas fa-play mr-1.5" /> Simulate Call
          </button>
        </div>

        {ringing && activeCall && (
          <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">{activeCall.number}</p>
                <p className="text-xs text-slate-400">{activeCall.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                <span className="text-sm text-red-400 font-medium">Ringing...</span>
              </div>
            </div>
          </div>
        )}

        {activeCall && activeCall.status === 'ghosting' && (
          <div className="p-4 bg-slate-700/30 rounded-xl border border-violet-500/30">
            <div className="flex items-center gap-2 mb-3">
              <i className="fas fa-robot text-violet-400" />
              <span className="text-sm font-medium text-violet-300">Ghost AI is engaging...</span>
            </div>
            <div ref={scrollRef} className="space-y-2 max-h-48 overflow-y-auto">
              {transcript.map((line, i) => (
                <div key={i} className={`flex gap-2 ${line.speaker === 'scammer' ? '' : 'flex-row-reverse'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${
                    line.speaker === 'scammer'
                      ? 'bg-slate-600 text-slate-200 rounded-tl-none'
                      : 'bg-violet-500/20 text-violet-200 rounded-tr-none'
                  }`}>
                    <span className="text-[10px] opacity-60 block mb-0.5">{line.speaker === 'scammer' ? 'Scammer' : 'Ghost AI'}</span>
                    {line.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeCall && activeCall.status === 'blocked' && (
          <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30 flex items-center gap-3">
            <i className="fas fa-shield-halved text-emerald-400 text-xl" />
            <div>
              <p className="text-sm font-medium text-emerald-300">Call Neutralized</p>
              <p className="text-xs text-emerald-400/70">Scammer wasted 3 minutes. No data exposed.</p>
            </div>
          </div>
        )}
      </div>

      {/* Scam Pattern Analysis */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">
          <i className="fas fa-chart-pie text-primary mr-2" /> Scam Pattern Analysis
        </h3>
        <div className="space-y-3">
          {scamCounts.map((s) => (
            <div key={s.type} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-24 flex-shrink-0">{s.type}</span>
              <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all" style={{ width: `${(s.count / maxCount) * 100}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 w-6 text-right">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Calls */}
      {stats.calls.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">
            <i className="fas fa-list text-primary mr-2" /> Recent Interceptions
          </h3>
          <div className="space-y-2">
            {stats.calls.slice(0, 8).map((call) => (
              <div key={call.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <i className="fas fa-phone-slash text-rose-500 text-xs" />
                  <span className="text-xs text-slate-600 dark:text-slate-300">{call.number}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-500">{call.type}</span>
                </div>
                <span className="text-[10px] text-slate-400">{new Date(call.startedAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

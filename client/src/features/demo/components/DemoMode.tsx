import { useState, useEffect, useCallback } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';

const PHASES = [
  { id: 0, name: 'Introduction', duration: 10, caption: 'SecureWealth Twin — Your AI Wealth Guardian' },
  { id: 1, name: 'Wealth Intelligence', duration: 15, caption: 'AI-powered insights for every financial decision' },
  { id: 2, name: 'Fraud Protection', duration: 20, caption: 'Real-time fraud protection — ₹3.75L protected this month' },
  { id: 3, name: 'Resilience', duration: 10, caption: 'Financial stress testing for life\'s uncertainties' },
  { id: 4, name: 'Vision', duration: 5, caption: 'Built for scale — React, Python AI, PostgreSQL, Redis' },
];

const TOTAL_DURATION = PHASES.reduce((s, p) => s + p.duration, 0);

function AnimatedCounter({ target, duration }: { target: number; duration: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration * 30);
    const interval = setInterval(() => {
      start += increment;
      if (start >= target) {
        setValue(target);
        clearInterval(interval);
      } else {
        setValue(Math.floor(start));
      }
    }, 33);
    return () => clearInterval(interval);
  }, [target, duration]);
  return <span>₹{(value / 1e5).toFixed(1)}L</span>;
}

export default function DemoMode() {
  const demoModeActive = useWealthStore((s) => s.demoModeActive);
  const demoPhase = useWealthStore((s) => s.demoPhase);
  const demoPaused = useWealthStore((s) => s.demoPaused);
  const setDemoModeActive = useWealthStore((s) => s.setDemoModeActive);
  const setDemoPhase = useWealthStore((s) => s.setDemoPhase);
  const toggleDemoPaused = useWealthStore((s) => s.toggleDemoPaused);
  const setView = useWealthStore((s) => s.setView);

  const [elapsed, setElapsed] = useState(0);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [showScamCall, setShowScamCall] = useState(false);
  const [showFinalSlide, setShowFinalSlide] = useState(false);

  // Navigate views based on phase
  useEffect(() => {
    if (!demoModeActive) return;
    if (demoPhase === 0 || demoPhase === 1) setView('dashboard');
    if (demoPhase === 2) setView('protection');
    if (demoPhase === 3) setView('calculators');
    if (demoPhase === 4) setView('architecture');
  }, [demoPhase, demoModeActive, setView]);

  // Phase timing logic
  useEffect(() => {
    if (!demoModeActive || demoPaused) return;

    const phaseStartTime = PHASES.slice(0, demoPhase).reduce((s, p) => s + p.duration, 0);
    const phaseEndTime = phaseStartTime + PHASES[demoPhase].duration;

    const timer = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 0.1;
        if (next >= phaseEndTime) {
          if (demoPhase < PHASES.length - 1) {
            setDemoPhase(demoPhase + 1);
          } else {
            setShowFinalSlide(true);
          }
          return next;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [demoModeActive, demoPaused, demoPhase, setDemoPhase]);

  // Phase-specific effects
  useEffect(() => {
    if (!demoModeActive) return;
    if (demoPhase === 2) {
      const t1 = setTimeout(() => setShowBlockedModal(true), 6000);
      const t2 = setTimeout(() => setShowBlockedModal(false), 12000);
      const t3 = setTimeout(() => setShowScamCall(true), 13000);
      const t4 = setTimeout(() => setShowScamCall(false), 18000);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }
  }, [demoPhase, demoModeActive]);

  // Keyboard controls
  useEffect(() => {
    if (!demoModeActive) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); toggleDemoPaused(); }
      if (e.code === 'ArrowRight') {
        if (demoPhase < PHASES.length - 1) setDemoPhase(demoPhase + 1);
        else setShowFinalSlide(true);
      }
      if (e.code === 'Escape') { setDemoModeActive(false); setShowFinalSlide(false); }
      if (e.key === 'r' || e.key === 'R') {
        setElapsed(0);
        setDemoPhase(0);
        setShowFinalSlide(false);
        setShowBlockedModal(false);
        setShowScamCall(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [demoModeActive, demoPhase, setDemoModeActive, setDemoPhase, toggleDemoPaused]);

  const progress = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
  const currentPhase = PHASES[demoPhase];

  const exitDemo = useCallback(() => {
    setDemoModeActive(false);
    setElapsed(0);
    setDemoPhase(0);
    setShowFinalSlide(false);
    setShowBlockedModal(false);
    setShowScamCall(false);
    setView('dashboard');
  }, [setDemoModeActive, setDemoPhase, setView]);

  if (!demoModeActive) return null;

  if (showFinalSlide) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center text-white animate-fade-in">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
            <i className="fas fa-shield-halved text-white text-4xl" />
          </div>
          <h1 className="text-5xl font-bold">Thank You</h1>
          <p className="text-2xl text-slate-300">SecureWealth Twin</p>
          <div className="flex items-center justify-center gap-6 text-slate-400">
            <span><i className="fab fa-github mr-2" />github.com/securewealth</span>
            <span><i className="fas fa-globe mr-2" />securewealth-twin.surge.sh</span>
          </div>
          <p className="text-sm text-slate-500">Team: Deepanshu Sharma, Priya Sharma, Aarav Sharma</p>
          <button onClick={exitDemo} className="mt-8 px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-lg transition-colors">
            Exit Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dark overlay with spotlight */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Spotlight effect */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl transition-all duration-[2000ms]"
        style={{
          top: demoPhase === 0 || demoPhase === 1 ? '10%' : demoPhase === 2 ? '20%' : '30%',
          left: demoPhase === 0 || demoPhase === 1 ? '50%' : demoPhase === 2 ? '30%' : '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Phase visual content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {demoPhase === 0 && (
          <div className="text-center text-white animate-fade-in">
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <i className="fas fa-shield-halved text-white text-5xl" />
            </div>
            <h1 className="text-6xl font-bold mb-4">SecureWealth Twin</h1>
            <p className="text-3xl text-slate-300 mb-8">Your AI Wealth Guardian</p>
            <div className="text-5xl font-bold text-emerald-400">
              <AnimatedCounter target={9900000} duration={8} />
            </div>
            <p className="text-lg text-slate-400 mt-2">Net Worth Protected</p>
          </div>
        )}

        {demoPhase === 1 && (
          <div className="w-full max-w-4xl px-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* What-If Simulator mock */}
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <i className="fas fa-wand-magic-sparkles text-accent" /> What-If Simulator
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-slate-300 mb-1">
                      <span>Monthly SIP</span>
                      <span className="text-accent">₹15,000 → ₹25,000</span>
                    </div>
                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all duration-[3000ms]" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-slate-300 mb-1">
                      <span>Years</span>
                      <span className="text-accent">10 years</span>
                    </div>
                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-[3000ms]" style={{ width: '60%' }} />
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                    <p className="text-emerald-300 text-sm font-bold">
                      <i className="fas fa-arrow-trend-up mr-1" /> Extra wealth: ₹84.3L
                    </p>
                  </div>
                </div>
              </div>

              {/* Goals mock */}
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <i className="fas fa-bullseye text-secondary" /> Financial Goals
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Emergency Fund', current: 60, target: '₹6L / ₹10L', color: 'bg-emerald-500' },
                    { name: 'Dream Home', current: 34, target: '₹8.5L / ₹25L', color: 'bg-blue-500' },
                    { name: "Child's Education", current: 28, target: '₹4.2L / ₹15L', color: 'bg-violet-500' },
                  ].map((g) => (
                    <div key={g.name}>
                      <div className="flex justify-between text-sm text-slate-300 mb-1">
                        <span>{g.name}</span>
                        <span>{g.target}</span>
                      </div>
                      <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${g.color} rounded-full transition-all duration-[2000ms]`} style={{ width: `${g.current}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {demoPhase === 2 && (
          <div className="w-full max-w-3xl px-6 animate-fade-in">
            {!showBlockedModal && !showScamCall && (
              <div className="text-center text-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-rose-500/20 border-2 border-rose-500/50 rounded-2xl p-5 animate-pulse">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-mobile-screen text-rose-400 text-2xl" />
                      <div className="text-left">
                        <p className="text-rose-300 font-bold">New Device</p>
                        <p className="text-rose-400 text-sm">Login from Dubai detected</p>
                      </div>
                      <div className="ml-auto w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center">
                        <i className="fas fa-check text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-500/20 border-2 border-amber-500/50 rounded-2xl p-5 animate-pulse">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-money-bill-wave text-amber-400 text-2xl" />
                      <div className="text-left">
                        <p className="text-amber-300 font-bold">Unusual Amount</p>
                        <p className="text-amber-400 text-sm">₹50,000 transfer request</p>
                      </div>
                      <div className="ml-auto w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                        <i className="fas fa-check text-white" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-slate-300 text-sm">Protection Score</p>
                      <p className="text-4xl font-bold text-white">94/100</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-300 text-sm">Amount Protected</p>
                      <p className="text-4xl font-bold text-emerald-400">₹3.75L</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showBlockedModal && (
              <div className="bg-white rounded-3xl p-8 max-w-lg mx-auto shadow-2xl animate-fade-in">
                <div className="text-center">
                  <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-shield-virus text-rose-500 text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-rose-600 mb-2">Action Blocked</h3>
                  <p className="text-slate-600 mb-4">High-risk transaction detected and automatically blocked.</p>
                  <div className="p-4 bg-rose-50 rounded-xl text-left mb-4">
                    <p className="text-sm text-slate-600"><strong>Amount:</strong> ₹50,000</p>
                    <p className="text-sm text-slate-600"><strong>To:</strong> Unknown payee</p>
                    <p className="text-sm text-slate-600"><strong>Risk:</strong> New device + Unusual amount</p>
                    <p className="text-sm text-slate-600"><strong>Reference:</strong> AUD-LX9KP2</p>
                  </div>
                  <p className="text-sm text-rose-500 font-medium">Your money is safe.</p>
                </div>
              </div>
            )}

            {showScamCall && (
              <div className="bg-white rounded-3xl p-6 max-w-md mx-auto shadow-2xl animate-fade-in">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-rose-500 rounded-full flex items-center justify-center animate-pulse">
                    <i className="fas fa-phone text-white text-2xl" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-800">Incoming Call</p>
                    <p className="text-rose-500 font-bold">+91 98765 43210</p>
                    <p className="text-xs text-slate-400">Claimed: SBI Bank Manager</p>
                  </div>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl border-2 border-rose-200">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-triangle-exclamation text-rose-500" />
                    <p className="font-bold text-rose-700">Vishing Attack Detected!</p>
                  </div>
                  <p className="text-sm text-rose-600">This number has been reported for impersonating bank officials. Call blocked automatically.</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl">
                    <i className="fas fa-ban mr-2" /> Block & Report
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {demoPhase === 3 && (
          <div className="w-full max-w-2xl px-6 animate-fade-in">
            <div className="bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/20 text-white text-center">
              <h3 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2">
                <i className="fas fa-chart-line text-accent" /> Job Loss Scenario
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-white/10 rounded-xl">
                  <p className="text-sm text-slate-300">Monthly Expenses</p>
                  <p className="text-2xl font-bold">₹72,000</p>
                </div>
                <div className="p-4 bg-white/10 rounded-xl">
                  <p className="text-sm text-slate-300">Emergency Fund</p>
                  <p className="text-2xl font-bold text-emerald-400">₹8.5L</p>
                </div>
                <div className="p-4 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                  <p className="text-sm text-emerald-300">Cash Runway</p>
                  <p className="text-3xl font-bold text-emerald-400">11.8 months</p>
                </div>
              </div>
              <div className="p-4 bg-amber-500/20 rounded-xl border border-amber-500/30 text-left">
                <p className="text-amber-300 font-bold mb-1">
                  <i className="fas fa-lightbulb mr-2" /> AI Recommendation
                </p>
                <p className="text-slate-300">You can survive 11.8 months without income. Increase emergency fund to ₹10L for 14-month safety net.</p>
              </div>
            </div>
          </div>
        )}

        {demoPhase === 4 && (
          <div className="w-full max-w-4xl px-6 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'React 18', icon: 'fa-react', color: 'from-cyan-400 to-blue-500' },
                { name: 'Python AI', icon: 'fa-python', color: 'from-yellow-400 to-blue-500' },
                { name: 'PostgreSQL', icon: 'fa-database', color: 'from-blue-400 to-indigo-500' },
                { name: 'Redis', icon: 'fa-server', color: 'from-red-400 to-rose-500' },
              ].map((tech) => (
                <div key={tech.name} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tech.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                    <i className={`fab ${tech.icon} text-white text-2xl`} />
                  </div>
                  <p className="text-white font-bold">{tech.name}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-2xl text-white font-bold">Microservices Architecture</p>
              <p className="text-slate-400">Account Aggregator · RBI KYC · UPI Integration · AI/ML Pipeline</p>
            </div>
          </div>
        )}
      </div>

      {/* Caption bar */}
      <div className="absolute bottom-24 left-0 right-0 flex justify-center px-6">
        <div className="bg-black/80 backdrop-blur px-8 py-4 rounded-2xl text-center max-w-2xl">
          <p className="text-white text-xl font-medium">{currentPhase?.caption}</p>
          {demoPaused && (
            <p className="text-amber-400 text-sm mt-1 animate-pulse">
              <i className="fas fa-pause mr-1" /> Paused — Press Space to continue
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-12 left-6 right-6">
        <div className="flex items-center gap-3 mb-2">
          {PHASES.map((p, idx) => (
            <div key={p.id} className="flex-1 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${idx <= demoPhase ? 'bg-primary' : 'bg-slate-600'}`} />
              <span className={`text-[10px] ${idx <= demoPhase ? 'text-white' : 'text-slate-500'}`}>{p.name}</span>
            </div>
          ))}
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 text-[10px] text-slate-500">
        <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono">Space</kbd> Pause</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono">→</kbd> Skip</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono">Esc</kbd> Exit</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono">R</kbd> Restart</span>
      </div>

      {/* Phase timer badge */}
      <div className="absolute top-6 right-6 px-3 py-1.5 bg-black/60 backdrop-blur rounded-full text-white text-xs font-mono">
        {Math.ceil(PHASES[demoPhase].duration - (elapsed - PHASES.slice(0, demoPhase).reduce((s, p) => s + p.duration, 0)))}s
      </div>

      {/* Exit button */}
      <button
        onClick={exitDemo}
        className="absolute top-6 left-6 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full text-white text-sm transition-colors pointer-events-auto"
      >
        <i className="fas fa-xmark mr-1" /> Exit Demo
      </button>
    </div>
  );
}

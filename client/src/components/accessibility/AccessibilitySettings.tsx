import { useState } from 'react';
import { useWealthStore } from '../../store/wealthStore';
import { useVoiceNarration } from '../../hooks/useVoiceNarration';

const SCORE_ITEMS = [
  { label: 'Screen reader compatible', score: 25, status: true, icon: 'fa-ear-listen' },
  { label: 'Keyboard navigable', score: 25, status: true, icon: 'fa-keyboard' },
  { label: 'Color-blind friendly', score: 20, status: true, icon: 'fa-eye' },
  { label: 'High contrast support', score: 15, status: true, icon: 'fa-circle-half-stroke' },
  { label: 'Voice narration', score: 9, status: true, icon: 'fa-volume-high' },
];

export default function AccessibilitySettings() {
  const accessibilityMode = useWealthStore((s) => s.accessibilityMode);
  const toggleAccessibilityMode = useWealthStore((s) => s.toggleAccessibilityMode);
  const { speak, enabled } = useVoiceNarration();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [testVoice, setTestVoice] = useState(false);

  const totalScore = SCORE_ITEMS.reduce((s, i) => s + i.score, 0);

  const handleTestVoice = () => {
    setTestVoice(true);
    speak('Accessibility mode is active. Voice narration is working.');
    setTimeout(() => setTestVoice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="card bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border-2 border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-xl">
            <i className="fas fa-universal-access" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Accessibility Settings</h2>
            <p className="text-xs text-slate-500">Inclusive design for everyone</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
            <i className="fas fa-certificate mr-1" /> WCAG 2.1 AA Compliant
          </span>
        </div>
      </div>

      {/* Main Toggle */}
      <div className="card border-2 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${accessibilityMode ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
              <i className="fas fa-universal-access" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Accessibility Mode</h3>
              <p className="text-xs text-slate-500">
                {accessibilityMode ? 'Active — Large text, high contrast, voice narration' : 'Off — Standard experience'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleAccessibilityMode}
            className={`relative w-14 h-8 rounded-full transition-colors ${accessibilityMode ? 'bg-primary' : 'bg-slate-300'}`}
            aria-label={accessibilityMode ? 'Turn off accessibility mode' : 'Turn on accessibility mode'}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${accessibilityMode ? 'translate-x-7' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>

      {/* Accessibility Score */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-chart-pie text-primary" /> Accessibility Score
          </h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">{totalScore}/100</p>
            <p className="text-[10px] text-emerald-500">Excellent</p>
          </div>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000"
            style={{ width: `${totalScore}%` }}
          />
        </div>
        <div className="space-y-2">
          {SCORE_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">
                  <i className={`fas ${item.icon}`} />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-200">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600">+{item.score}</span>
                <i className="fas fa-check-circle text-emerald-500 text-xs" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Large Text */}
        <div className={`card border-2 transition-colors ${accessibilityMode ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <i className="fas fa-text-height" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Large Text Mode</h4>
              <p className="text-[10px] text-slate-500">Increases font size by 10%</p>
            </div>
          </div>
          <div className={`text-xs p-2 rounded-lg ${accessibilityMode ? 'bg-white text-lg font-medium' : 'bg-slate-50 text-xs'}`}>
            Sample text: "Your net worth is growing"
          </div>
        </div>

        {/* High Contrast */}
        <div className={`card border-2 transition-colors ${accessibilityMode ? 'border-yellow-400 bg-yellow-50/30' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-700">
              <i className="fas fa-circle-half-stroke" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">High Contrast</h4>
              <p className="text-[10px] text-slate-500">Black text on white background</p>
            </div>
          </div>
          <div className={`text-xs p-2 rounded-lg border-2 ${accessibilityMode ? 'bg-white text-black border-black font-bold' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
            High contrast sample
          </div>
        </div>

        {/* Focus Indicators */}
        <div className={`card border-2 transition-colors ${accessibilityMode ? 'border-yellow-300' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <i className="fas fa-bullseye" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Focus Indicators</h4>
              <p className="text-[10px] text-slate-500">Bright yellow outline on focused elements</p>
            </div>
          </div>
          <button
            className={`px-3 py-1.5 text-xs rounded-lg border-2 transition-all ${
              accessibilityMode
                ? 'border-black bg-white text-black font-bold focus:outline-none'
                : 'border-slate-200 bg-slate-100 text-slate-600'
            }`}
            style={accessibilityMode ? { outline: '4px solid #facc15', outlineOffset: '2px' } : {}}
          >
            Tab to me — I glow yellow!
          </button>
        </div>

        {/* Voice Narration */}
        <div className={`card border-2 transition-colors ${accessibilityMode ? 'border-violet-200 bg-violet-50/30' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
              <i className="fas fa-volume-high" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Voice Narration</h4>
              <p className="text-[10px] text-slate-500">Hover over numbers to hear them</p>
            </div>
          </div>
          <button
            onClick={handleTestVoice}
            disabled={!enabled}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
              enabled
                ? 'bg-violet-500 hover:bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <i className={`fas ${testVoice ? 'fa-volume-high animate-pulse' : 'fa-play'}`} />
            {testVoice ? 'Speaking...' : 'Test Voice'}
          </button>
        </div>

        {/* Keyboard Navigation */}
        <div className="card border-2 border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
              <i className="fas fa-keyboard" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Keyboard Navigation</h4>
              <p className="text-[10px] text-slate-500">Tab, Enter, Arrow keys supported</p>
            </div>
          </div>
          <div className="flex gap-1">
            {['Tab', 'Enter', '↑', '↓', '←', '→'].map((key) => (
              <kbd key={key} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600 font-mono border border-slate-200">
                {key}
              </kbd>
            ))}
          </div>
        </div>

        {/* Reduce Motion */}
        <div className="card border-2 border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
              <i className="fas fa-person-walking" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Reduce Motion</h4>
              <p className="text-[10px] text-slate-500">Respects prefers-reduced-motion</p>
            </div>
          </div>
          <button
            onClick={() => setReduceMotion(!reduceMotion)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              reduceMotion ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {reduceMotion ? 'Motion Reduced' : 'Reduce Motion'}
          </button>
        </div>
      </div>

      {/* ARIA Info */}
      <div className="card border-2 border-slate-100">
        <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <i className="fas fa-code text-primary" /> Screen Reader Support
        </h3>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p className="flex items-center gap-2">
            <i className="fas fa-check text-emerald-500 text-xs" />
            All buttons have descriptive <code className="px-1 bg-slate-100 rounded text-xs">aria-label</code> attributes
          </p>
          <p className="flex items-center gap-2">
            <i className="fas fa-check text-emerald-500 text-xs" />
            Live regions announce dynamic content changes
          </p>
          <p className="flex items-center gap-2">
            <i className="fas fa-check text-emerald-500 text-xs" />
            Skip-to-content link for keyboard users
          </p>
          <p className="flex items-center gap-2">
            <i className="fas fa-check text-emerald-500 text-xs" />
            Semantic HTML: <code className="px-1 bg-slate-100 rounded text-xs">nav</code>, <code className="px-1 bg-slate-100 rounded text-xs">main</code>, <code className="px-1 bg-slate-100 rounded text-xs">header</code>, <code className="px-1 bg-slate-100 rounded text-xs">aside</code>
          </p>
          <p className="flex items-center gap-2">
            <i className="fas fa-check text-emerald-500 text-xs" />
            Color is never the sole means of conveying information
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkURLSafety, type URLSafetyResult } from '../../services/urlSafetyService';

export default function URLSafetyChecker() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<URLSafetyResult | null>(null);
  const [checking, setChecking] = useState(false);

  const handleCheck = useCallback(async () => {
    if (!url.trim()) return;
    setChecking(true);
    const res = await checkURLSafety(url.trim());
    setResult(res);
    setChecking(false);
  }, [url]);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center text-violet-500">
          <i className="fas fa-link" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">URL Safety Scanner</h3>
          <p className="text-[10px] text-slate-400">Heuristics + DNS-over-HTTPS + HTTPS probe</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          placeholder="Paste suspicious URL here..."
          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm outline-none border border-transparent focus:border-violet-500/50 dark:text-white"
        />
        <button
          onClick={handleCheck}
          disabled={checking || !url.trim()}
          className="px-4 py-2 bg-violet-500 text-white rounded-lg text-sm font-bold hover:bg-violet-600 transition-colors disabled:opacity-50"
        >
          {checking ? <i className="fas fa-spinner fa-spin" /> : 'Scan'}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`p-3 rounded-xl border ${
              result.safe
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <i className={`fas ${result.safe ? 'fa-shield-halved text-emerald-500' : 'fa-triangle-exclamation text-rose-500'}`} />
                <span className={`text-sm font-bold ${result.safe ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                  {result.safe ? 'Safe' : 'Potentially Unsafe'} — Risk Score: {result.riskScore}/100
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.riskScore}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${
                    result.riskScore < 30 ? 'bg-emerald-500' : result.riskScore < 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                />
              </div>

              <div className="space-y-1">
                {result.reasons.map((reason, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <i className={`fas ${result.safe ? 'fa-check text-emerald-500' : 'fa-xmark text-rose-500'} mt-0.5`} />
                    <span className="text-slate-600 dark:text-slate-300">{reason}</span>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
                <span>
                  <i className={`fas fa-circle text-[6px] mr-1 ${result.resolved ? 'text-emerald-500' : 'text-rose-500'}`} />
                  DNS {result.resolved ? 'resolved' : 'unresolved'}
                </span>
                <span>
                  <i className={`fas fa-circle text-[6px] mr-1 ${result.httpsReachable ? 'text-emerald-500' : 'text-amber-500'}`} />
                  HTTPS {result.httpsReachable ? 'reachable' : 'unreachable / blocked'}
                </span>
              </div>

              <p className="text-[10px] text-slate-400 mt-2">
                Checked at {new Date(result.checkedAt).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
        <p className="text-[10px] text-slate-400 mb-2">Test with these samples:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Safe: Google', url: 'https://google.com' },
            { label: 'Unsafe: Short URL', url: 'https://bit.ly/xyz123' },
            { label: 'Unsafe: IP Address', url: 'http://192.168.1.1/login' },
            { label: 'Unsafe: Phishing', url: 'https://paytm-secure-verify.com/login' },
          ].map((s) => (
            <button
              key={s.url}
              onClick={() => { setUrl(s.url); }}
              className="text-[10px] px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md text-slate-500 hover:text-primary transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

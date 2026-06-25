import { Component, type ReactNode } from 'react';
import { isChunkError } from '@/shared/utils/lazyWithRetry';
import { AlertTriangle, RotateCcw, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string | null;
  showDetails: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo: errorInfo.componentStack });

    if (isChunkError(error)) {
      const alreadyReloaded = sessionStorage.getItem('sw-chunk-reload') === '1';
      if (!alreadyReloaded) {
        sessionStorage.setItem('sw-chunk-reload', '1');
        this.clearStorageAndReload();
      }
    }
  }

  clearStorageAndReload = () => {
    try {
      localStorage.removeItem('sw-wealth-store');
      localStorage.removeItem('sw_auth_state');
      localStorage.removeItem('sw_security_state');
      localStorage.removeItem('sw_coerced_mode');
      localStorage.removeItem('sw_duress_locked_until');
      localStorage.removeItem('sw_duress_pin');
      localStorage.removeItem('sw-trust-device');
      sessionStorage.removeItem('sw-cleared');
    } catch { /* ignore */ }

    if ('caches' in window) {
      try {
        caches.keys().then((names) => names.forEach((name) => caches.delete(name)));
      } catch { /* ignore */ }
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }

    const url = new URL(window.location.href);
    url.searchParams.set('r', String(Date.now()));
    window.location.href = url.toString();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, showDetails: false });
  };

  toggleDetails = () => {
    this.setState((s) => ({ showDetails: !s.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails } = this.state;
      const chunkError = isChunkError(error);

      return (
        <div className="min-h-screen flex items-center justify-center bg-psb-bg dark:bg-slate-950 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="px-8 pt-8 pb-6 text-center">
              <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-10 h-10 text-rose-500" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                {chunkError ? 'App update in progress' : 'Something went wrong'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {chunkError
                  ? 'A new version of the app was just published. We are refreshing you with the latest build.'
                  : 'An unexpected error occurred. You can try reloading the current view, or clear cached data and restart.'}
              </p>
            </div>

            {error && (
              <div className="px-6 mb-4">
                <button
                  onClick={this.toggleDetails}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span>Technical details</span>
                  {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {showDetails && (
                  <div className="mt-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 p-3 text-left">
                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 mb-1">Error:</p>
                    <p className="break-all text-xs text-rose-600 dark:text-rose-400">{error.name}: {error.message}</p>
                    {errorInfo && (
                      <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-white dark:bg-slate-950 p-3 text-[10px] text-slate-600 dark:text-slate-400">
                        {errorInfo}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="px-6 pb-8 space-y-3">
              {!chunkError && (
                <button
                  onClick={this.handleReset}
                  className="w-full py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Try again
                </button>
              )}
              <button
                onClick={this.clearStorageAndReload}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Clear cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

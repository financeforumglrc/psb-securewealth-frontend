import { Component, type ReactNode } from 'react';
import { isChunkError } from '../../utils/lazyWithRetry';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo: errorInfo.componentStack });

    if (isChunkError(error)) {
      const alreadyReloaded = sessionStorage.getItem('sw-chunk-reload') === '1';
      if (!alreadyReloaded) {
        // Auto-recover from stale chunk URLs after a fresh deploy.
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

    // Clear Cache Storage & unregister service workers when available.
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

    // Hard reload with a cache-busting query string to bypass stale CDN/edge caches.
    const url = new URL(window.location.href);
    url.searchParams.set('r', String(Date.now()));
    window.location.href = url.toString();
  };

  handleReset = () => {
    this.clearStorageAndReload();
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const chunkError = isChunkError(error);

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-triangle-exclamation text-rose-500 text-2xl" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {chunkError
                ? 'A part of the app failed to load, usually because a new version was just published. We are reloading with a fresh copy.'
                : 'The app encountered an unexpected error. This can happen when cached data is out of date.'}
            </p>

            {error && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-left dark:border-rose-800 dark:bg-rose-900/20">
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">Error:</p>
                <p className="break-all text-xs text-rose-600 dark:text-rose-400">{error.name}: {error.message}</p>
                {errorInfo && (
                  <pre className="mt-2 max-h-32 overflow-auto rounded bg-white p-2 text-[10px] text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                    {errorInfo}
                  </pre>
                )}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
            >
              <i className="fas fa-rotate-right mr-2" /> Clear cache & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

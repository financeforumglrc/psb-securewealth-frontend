import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
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
  }

  handleReset = () => {
    // Clear potentially corrupted localStorage
    try {
      localStorage.removeItem('sw-wealth-store');
      localStorage.removeItem('sw_auth_state');
      localStorage.removeItem('sw_security_state');
      localStorage.removeItem('sw_coerced_mode');
      localStorage.removeItem('sw_duress_locked_until');
      localStorage.removeItem('sw_duress_pin');
    } catch { /* ignore */ }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-triangle-exclamation text-rose-500 text-2xl" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              The app encountered an unexpected error. This can happen when cached data is out of date.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
            >
              <i className="fas fa-rotate-right mr-2" /> Reset & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

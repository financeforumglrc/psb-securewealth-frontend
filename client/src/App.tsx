import { Suspense, useEffect, useRef, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { lazyWithRetry } from './utils/lazyWithRetry';
import { backendApi } from './lib/backendApi';
import { collectFingerprint } from './services/fingerprintService';
import DemoShowcase from './components/demo/DemoShowcase';

const LoginPortal = lazyWithRetry(() => import('./components/auth/LoginPortal'));
const AuthenticatedApp = lazyWithRetry(() => import('./AuthenticatedApp'));

// Loading fallback component
function ViewLoader() {
  const [showRefresh, setShowRefresh] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    const refreshTimer = setTimeout(() => setShowRefresh(true), 12000);
    return () => {
      clearInterval(dotTimer);
      clearTimeout(refreshTimer);
    };
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-psb-bg dark:bg-slate-950 p-6">
      <div className="flex flex-col items-center gap-4 max-w-sm text-center">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-black text-primary">PSB</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Loading your secure workspace{dots}
          </p>
          <p className="text-xs text-slate-400">
            First visit may take a few seconds while we fetch the latest modules.
          </p>
        </div>
        {showRefresh && (
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
          >
            Still loading? Refresh
          </button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  // Public demo route — no auth required, ideal for judges & pitch links
  const [demoPath] = useState(() => {
    const p = window.location.pathname;
    return p === '/demo' || p === '/demo/';
  });

  const { state: authState } = useAuth();
  const warmed = useRef(false);

  // Initialize FingerprintJS visitor id early so X-Device-Id is available for auth calls
  useEffect(() => {
    collectFingerprint().catch(() => {});
  }, []);

  // Warm the Render backend as soon as we know the user is logged out, and
  // prefetch the authenticated shell so the post-login transition is snappy.
  useEffect(() => {
    if (authState.loading || authState.isAuthenticated || warmed.current) return;
    warmed.current = true;

    const warmTimer = setTimeout(() => {
      backendApi.health().catch(() => {});
    }, 800);

    const prefetchTimer = setTimeout(() => {
      try {
        import('./AuthenticatedApp').catch(() => {});
      } catch {
        // ignore prefetch errors
      }
    }, 2000);

    return () => {
      clearTimeout(warmTimer);
      clearTimeout(prefetchTimer);
    };
  }, [authState.loading, authState.isAuthenticated]);

  if (demoPath) {
    return <DemoShowcase />;
  }

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <Suspense fallback={<ViewLoader />}>
        <LoginPortal />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<ViewLoader />}>
      <AuthenticatedApp />
    </Suspense>
  );
}

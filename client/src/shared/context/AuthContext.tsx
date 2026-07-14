import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { hasRegisteredPasskey, getPasskeyUser } from '@/shared/services/passkeyService';

interface AuthStateCtx {
  isAuthenticated: boolean;
  userId: string | null;
  userEmail: string | null;
  lockoutUntil: number | null;
  failedAttempts: number;
  loading: boolean;
  deviceFingerprint: string | null;
  passkeyRegistered: boolean;
  passkeyUserId: string | null;
}

type AuthAction =
  | { type: 'LOGIN'; userId: string; userEmail: string | null }
  | { type: 'LOGOUT' }
  | { type: 'FAIL_ATTEMPT' }
  | { type: 'SET_LOCKOUT'; until: number | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INIT'; state: AuthStateCtx }
  | { type: 'REGISTER_PASSKEY'; userId: string };

function authReducer(state: AuthStateCtx, action: AuthAction): AuthStateCtx {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: true, userId: action.userId, userEmail: action.userEmail, failedAttempts: 0, lockoutUntil: null };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, userId: null, userEmail: null, failedAttempts: 0, passkeyRegistered: false, passkeyUserId: null };
    case 'FAIL_ATTEMPT': {
      const attempts = state.failedAttempts + 1;
      if (attempts >= 3) {
        const until = Date.now() + 60000;
        return { ...state, failedAttempts: attempts, lockoutUntil: until };
      }
      return { ...state, failedAttempts: attempts };
    }
    case 'SET_LOCKOUT':
      return { ...state, lockoutUntil: action.until };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'INIT':
      return { ...action.state, loading: false };
    case 'REGISTER_PASSKEY':
      return { ...state, passkeyRegistered: true, passkeyUserId: action.userId };
    default:
      return state;
  }
}

const AuthContext = createContext<{
  state: AuthStateCtx;
  dispatch: React.Dispatch<AuthAction>;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    userId: null,
    userEmail: null,
    lockoutUntil: null,
    failedAttempts: 0,
    loading: true,
    deviceFingerprint: null,
    passkeyRegistered: false,
    passkeyUserId: null,
  });

  // Listen to Supabase auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        dispatch({
          type: 'LOGIN',
          userId: session.user.id,
          userEmail: session.user.email ?? null,
        });
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' });
      }
    });

    // Check initial session (Supabase only; demo sessions are no longer auto-restored)
    supabase.auth.getSession().then(({ data: { session } }) => {
      const passkeyRegistered = hasRegisteredPasskey();
      const passkeyUserId = getPasskeyUser();
      if (session?.user) {
        dispatch({
          type: 'INIT',
          state: {
            isAuthenticated: true,
            userId: session.user.id,
            userEmail: session.user.email ?? null,
            lockoutUntil: null,
            failedAttempts: 0,
            loading: false,
            deviceFingerprint: null,
            passkeyRegistered,
            passkeyUserId,
          },
        });
        return;
      }

      // Stop auto-restoring demo sessions so the login/portal page is always shown first.
      // Existing stored demo credentials are cleared for a clean slate.
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('sw-demo-user');
      }

      dispatch({
        type: 'INIT',
        state: {
          isAuthenticated: false,
          userId: null,
          userEmail: null,
          lockoutUntil: null,
          failedAttempts: 0,
          loading: false,
          deviceFingerprint: null,
          passkeyRegistered,
          passkeyUserId,
        },
      });
    }).catch((err) => {
      console.error('Auth session init failed:', err);
      dispatch({ type: 'SET_LOADING', payload: false });
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check lockout expiry periodically
  useEffect(() => {
    if (!state.lockoutUntil) return;
    const timer = setInterval(() => {
      if (Date.now() > state.lockoutUntil!) {
        dispatch({ type: 'SET_LOCKOUT', until: null });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [state.lockoutUntil]);

  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

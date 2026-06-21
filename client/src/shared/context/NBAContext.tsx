import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { getInsights, dismissInsight, snoozeInsight, acceptInsight, type NBAInsight } from '@/shared/services/nbaService';

interface NBAState {
  insights: NBAInsight[];
  loading: boolean;
}

type NBAAction =
  | { type: 'SET_INSIGHTS'; payload: NBAInsight[] }
  | { type: 'DISMISS'; id: string }
  | { type: 'SNOOZE'; id: string }
  | { type: 'ACCEPT'; id: string }
  | { type: 'SET_LOADING'; payload: boolean };

function nbaReducer(state: NBAState, action: NBAAction): NBAState {
  switch (action.type) {
    case 'SET_INSIGHTS':
      return { ...state, insights: action.payload };
    case 'DISMISS':
      dismissInsight(action.id);
      return { ...state, insights: state.insights.filter((i) => i.id !== action.id) };
    case 'SNOOZE':
      snoozeInsight(action.id);
      return { ...state, insights: state.insights.filter((i) => i.id !== action.id) };
    case 'ACCEPT':
      acceptInsight(action.id);
      return { ...state, insights: state.insights.filter((i) => i.id !== action.id) };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

const NBAContext = createContext<{
  state: NBAState;
  dispatch: React.Dispatch<NBAAction>;
} | null>(null);

export function NBAProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(nbaReducer, { insights: [], loading: true });

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    setTimeout(() => {
      dispatch({ type: 'SET_INSIGHTS', payload: getInsights() });
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 600);
  }, []);

  return <NBAContext.Provider value={{ state, dispatch }}>{children}</NBAContext.Provider>;
}

export function useNBA() {
  const ctx = useContext(NBAContext);
  if (!ctx) throw new Error('useNBA must be used within NBAProvider');
  return ctx;
}

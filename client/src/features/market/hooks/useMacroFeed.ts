import { useEffect, useState } from 'react';
import { backendApi } from '@/shared/lib/backendApi';

export interface MacroSignal {
  indicator: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
  change: string;
  note: string;
}

export interface MacroRecommendation {
  id: string;
  title: string;
  description: string;
  trigger: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  icon: string;
}

export interface MacroFeed {
  signals: MacroSignal[];
  recommendations: MacroRecommendation[];
  lastUpdated: string;
}

export function useMacroFeed() {
  const [feed, setFeed] = useState<MacroFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    backendApi
      .getMacroSignals()
      .then((res) => {
        if (!mounted) return;
        if (res.ok && res.data?.data) {
          setFeed(res.data.data);
        } else {
          setError(res.data?.error || 'Failed to load macro signals');
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Network error');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return { feed, loading, error };
}

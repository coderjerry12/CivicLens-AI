import { useState, useEffect, useCallback } from 'react';
import { fetchAnalytics } from '@/services/analyticsService';
import type { AnalyticsData } from '@/types/analytics';

interface AnalyticsState {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
}

export function useAnalytics() {
  const [state, setState] = useState<AnalyticsState>({ data: null, loading: true, error: null });

  const fetch = useCallback(async () => {
    setState((p) => ({ ...p, loading: true, error: null }));
    try {
      const data = await fetchAnalytics();
      setState({ data, loading: false, error: null });
    } catch (err) {
      console.error('[Analytics] Fetch failed:', err);
      setState({ data: null, loading: false, error: 'Could not load analytics.' });
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { ...state, refresh: fetch };
}

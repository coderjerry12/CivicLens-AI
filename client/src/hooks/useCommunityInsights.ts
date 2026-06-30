import { useState, useEffect, useCallback } from 'react';
import { fetchCommunityInsights } from '@/services/communityInsightsService';
import type { CommunityInsights } from '@/types/communityInsight';

interface CommunityInsightsState {
  insights: CommunityInsights | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for fetching community-level analytics and insights.
 */
export function useCommunityInsights() {
  const [state, setState] = useState<CommunityInsightsState>({
    insights: null,
    loading: true,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const insights = await fetchCommunityInsights();
      setState({ insights, loading: false, error: null });
    } catch (err) {
      console.error('[CommunityInsights] Fetch failed:', err);
      setState({ insights: null, loading: false, error: 'Could not load community insights.' });
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...state, refresh: fetch };
}

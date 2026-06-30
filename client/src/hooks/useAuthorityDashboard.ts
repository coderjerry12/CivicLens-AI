import { useState, useEffect, useCallback } from 'react';
import { fetchAuthorityDashboard } from '@/services/authorityDashboardService';
import type { AuthorityDashboardData } from '@/types/authorityDashboard';

interface AuthorityDashboardState {
  data: AuthorityDashboardData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for fetching authority dashboard data.
 */
export function useAuthorityDashboard() {
  const [state, setState] = useState<AuthorityDashboardState>({
    data: null,
    loading: true,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchAuthorityDashboard();
      setState({ data, loading: false, error: null });
    } catch (err) {
      console.error('[AuthorityDashboard] Fetch failed:', err);
      setState({ data: null, loading: false, error: 'Could not load dashboard data.' });
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...state, refresh: fetch };
}

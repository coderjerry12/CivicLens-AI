import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardStats } from '@/services/dashboardService';
import { useAuth } from '@/features/auth';
import type { DashboardState } from '@/types/dashboard';

/**
 * Hook for fetching and managing dashboard statistics.
 * Automatically fetches on mount when user is authenticated.
 */
export function useDashboardStats() {
  const { user } = useAuth();
  const [state, setState] = useState<DashboardState>({
    stats: null,
    loading: true,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    if (!user) {
      setState({ stats: null, loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const stats = await fetchDashboardStats(user.uid);
      setState({ stats, loading: false, error: null });
    } catch (err) {
      console.error('[Dashboard] Stats fetch failed:', err);
      setState({
        stats: null,
        loading: false,
        error: 'Could not load statistics. Pull to refresh.',
      });
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { ...state, refresh: fetchStats };
}

import { useState, useEffect, useCallback } from 'react';
import { fetchRecentReports } from '@/services/reportsService';
import { useAuth } from '@/features/auth';
import type { ReportCardData } from '@/types/reportCard';

interface RecentReportsState {
  reports: ReportCardData[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook for fetching the user's recent reports from Firestore.
 */
export function useRecentReports(count: number = 5) {
  const { user } = useAuth();
  const [state, setState] = useState<RecentReportsState>({
    reports: [],
    loading: true,
    error: null,
  });

  const fetch = useCallback(async () => {
    if (!user) {
      setState({ reports: [], loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const reports = await fetchRecentReports(user.uid, count);
      setState({ reports, loading: false, error: null });
    } catch (err) {
      console.error('[Reports] Fetch failed:', err);
      setState({
        reports: [],
        loading: false,
        error: 'Could not load your reports.',
      });
    }
  }, [user, count]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...state, refresh: fetch };
}

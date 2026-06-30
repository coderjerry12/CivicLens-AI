import { useState, useEffect, useCallback } from 'react';
import { fetchIssueQueue } from '@/services/issueQueueService';
import type { QueueIssue } from '@/types/issueQueue';

interface IssueQueueState {
  issues: QueueIssue[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook for fetching the complete issue queue.
 */
export function useIssueQueue() {
  const [state, setState] = useState<IssueQueueState>({
    issues: [],
    loading: true,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const issues = await fetchIssueQueue();
      setState({ issues, loading: false, error: null });
    } catch (err) {
      console.error('[IssueQueue] Fetch failed:', err);
      setState({ issues: [], loading: false, error: 'Could not load issues.' });
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refresh: fetch };
}

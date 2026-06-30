import { useState, useEffect, useCallback } from 'react';
import { fetchIssueWorkspace } from '@/services/issueWorkspaceService';
import type { IssueWorkspaceData } from '@/types/issueWorkspace';

interface WorkspaceState {
  data: IssueWorkspaceData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for loading issue workspace data (detail + similar issues).
 */
export function useIssueWorkspace(issueId: string | undefined) {
  const [state, setState] = useState<WorkspaceState>({
    data: null,
    loading: true,
    error: null,
  });

  const fetch = useCallback(async () => {
    if (!issueId) {
      setState({ data: null, loading: false, error: 'No issue ID provided.' });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchIssueWorkspace(issueId);
      if (data) {
        setState({ data, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: 'Issue not found.' });
      }
    } catch (err) {
      console.error('[Workspace] Fetch failed:', err);
      setState({ data: null, loading: false, error: 'Failed to load issue.' });
    }
  }, [issueId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refresh: fetch };
}

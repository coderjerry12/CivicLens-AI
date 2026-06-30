import { useState, useCallback } from 'react';
import { bulkUpdateStatus, bulkAssignDepartment, bulkUpdateSeverity } from '@/services/bulkActionService';
import { exportIssuesToCSV } from '@/services/exportService';
import { useAuth } from '@/features/auth';
import type { BulkState } from '@/types/bulkAction';
import type { QueueIssue } from '@/types/issueQueue';

/**
 * Hook for managing bulk operations on issues.
 */
export function useBulkActions(onComplete?: () => void) {
  const { user } = useAuth();
  const [state, setState] = useState<BulkState>({
    executing: false,
    progress: 0,
    result: null,
    error: null,
  });

  const performerName = user?.displayName || 'Authority';

  const updateStatus = useCallback(async (issueIds: string[], newStatus: string) => {
    setState({ executing: true, progress: 0, result: null, error: null });
    try {
      const result = await bulkUpdateStatus(issueIds, newStatus, performerName, (p) => setState((s) => ({ ...s, progress: p })));
      setState({ executing: false, progress: 100, result, error: null });
      onComplete?.();
    } catch {
      setState({ executing: false, progress: 0, result: null, error: 'Bulk status update failed.' });
    }
  }, [performerName, onComplete]);

  const assignDepartment = useCallback(async (issueIds: string[], department: string) => {
    setState({ executing: true, progress: 0, result: null, error: null });
    try {
      const result = await bulkAssignDepartment(issueIds, department, performerName, (p) => setState((s) => ({ ...s, progress: p })));
      setState({ executing: false, progress: 100, result, error: null });
      onComplete?.();
    } catch {
      setState({ executing: false, progress: 0, result: null, error: 'Bulk assignment failed.' });
    }
  }, [performerName, onComplete]);

  const updateSeverity = useCallback(async (issueIds: string[], severity: string) => {
    setState({ executing: true, progress: 0, result: null, error: null });
    try {
      const result = await bulkUpdateSeverity(issueIds, severity, performerName, (p) => setState((s) => ({ ...s, progress: p })));
      setState({ executing: false, progress: 100, result, error: null });
      onComplete?.();
    } catch {
      setState({ executing: false, progress: 0, result: null, error: 'Bulk severity update failed.' });
    }
  }, [performerName, onComplete]);

  const exportCSV = useCallback((issues: QueueIssue[]) => {
    exportIssuesToCSV(issues);
  }, []);

  const reset = useCallback(() => {
    setState({ executing: false, progress: 0, result: null, error: null });
  }, []);

  return { bulkState: state, updateStatus, assignDepartment, updateSeverity, exportCSV, reset };
}

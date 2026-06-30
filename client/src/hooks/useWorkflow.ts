import { useState, useCallback } from 'react';
import { transitionStatus, resolveIssue, addInternalNote } from '@/services/workflowService';
import { assignIssue } from '@/services/assignmentService';
import { useAuth } from '@/features/auth';
import type { IssueWorkflowStatus, AssignmentData, ResolutionData, WorkflowState } from '@/types/workflow';

/**
 * Hook for managing issue workflow actions.
 */
export function useWorkflow(issueId: string, onSuccess?: () => void) {
  const { user } = useAuth();
  const [state, setState] = useState<WorkflowState>({
    loading: false,
    error: null,
    success: null,
  });

  const performerName = user?.displayName || 'Authority';

  const changeStatus = useCallback(async (
    currentStatus: IssueWorkflowStatus,
    newStatus: IssueWorkflowStatus,
    note?: string
  ) => {
    setState({ loading: true, error: null, success: null });
    try {
      await transitionStatus(issueId, currentStatus, newStatus, performerName, note);
      setState({ loading: false, error: null, success: `Status updated to "${newStatus}".` });
      onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.';
      setState({ loading: false, error: msg, success: null });
    }
  }, [issueId, performerName, onSuccess]);

  const assign = useCallback(async (assignment: AssignmentData) => {
    setState({ loading: true, error: null, success: null });
    try {
      await assignIssue(issueId, assignment, performerName);
      setState({ loading: false, error: null, success: 'Issue assigned successfully.' });
      onSuccess?.();
    } catch {
      setState({ loading: false, error: 'Failed to assign issue.', success: null });
    }
  }, [issueId, performerName, onSuccess]);

  const resolve = useCallback(async (resolution: ResolutionData) => {
    setState({ loading: true, error: null, success: null });
    try {
      await resolveIssue(issueId, resolution, performerName);
      setState({ loading: false, error: null, success: 'Issue resolved!' });
      onSuccess?.();
    } catch {
      setState({ loading: false, error: 'Failed to resolve issue.', success: null });
    }
  }, [issueId, performerName, onSuccess]);

  const addNote = useCallback(async (note: string) => {
    setState({ loading: true, error: null, success: null });
    try {
      await addInternalNote(issueId, note, performerName);
      setState({ loading: false, error: null, success: 'Note added.' });
      onSuccess?.();
    } catch {
      setState({ loading: false, error: 'Failed to add note.', success: null });
    }
  }, [issueId, performerName, onSuccess]);

  const clearMessages = useCallback(() => {
    setState({ loading: false, error: null, success: null });
  }, []);

  return { ...state, changeStatus, assign, resolve, addNote, clearMessages };
}

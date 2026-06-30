import { useState, useCallback } from 'react';
import { submitIssueReport, type SubmitResult } from '@/services/issueService';
import { validateIssueSubmission, type ValidationError } from '@/utils/issueValidator';
import { useAuth } from '@/features/auth';
import type { SubmissionData } from '@/types/issue';

export interface SubmissionState {
  status: 'idle' | 'validating' | 'submitting' | 'success' | 'error';
  result: SubmitResult | null;
  errors: ValidationError[];
  submitError: string | null;
}

/**
 * Hook for managing issue report submission.
 * Validates, submits to Firestore, and manages state.
 */
export function useIssueSubmission() {
  const { user } = useAuth();
  const [state, setState] = useState<SubmissionState>({
    status: 'idle',
    result: null,
    errors: [],
    submitError: null,
  });

  const submit = useCallback(async (data: SubmissionData) => {
    if (!user) {
      setState({
        status: 'error',
        result: null,
        errors: [],
        submitError: 'You must be signed in to submit a report.',
      });
      return;
    }

    // Validate
    setState({ status: 'validating', result: null, errors: [], submitError: null });
    const errors = validateIssueSubmission(data);

    if (errors.length > 0) {
      setState({ status: 'error', result: null, errors, submitError: null });
      return;
    }

    // Submit
    setState({ status: 'submitting', result: null, errors: [], submitError: null });

    const result = await submitIssueReport({
      data,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userEmail: user.email || '',
    });

    if (result.success) {
      setState({ status: 'success', result, errors: [], submitError: null });
    } else {
      setState({
        status: 'error',
        result: null,
        errors: [],
        submitError: result.error || 'Submission failed. Please try again.',
      });
    }
  }, [user]);

  const reset = useCallback(() => {
    setState({ status: 'idle', result: null, errors: [], submitError: null });
  }, []);

  return { submissionState: state, submit, reset };
}

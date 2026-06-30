/**
 * Types for issue workflow and lifecycle management.
 */

export type IssueWorkflowStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';

export const STATUS_TRANSITIONS: Record<IssueWorkflowStatus, IssueWorkflowStatus[]> = {
  pending: ['assigned', 'rejected'],
  assigned: ['in_progress', 'rejected'],
  in_progress: ['resolved', 'assigned'],
  resolved: [],
  rejected: ['pending'],
};

export const STATUS_LABELS: Record<IssueWorkflowStatus, string> = {
  pending: 'Pending Review',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

export interface StatusTransition {
  from: IssueWorkflowStatus;
  to: IssueWorkflowStatus;
  by: string;
  note?: string;
  timestamp: string;
}

export interface AssignmentData {
  department: string;
  officer?: string;
  note?: string;
}

export interface ResolutionData {
  summary: string;
  completedAt: string;
  imageDataURL?: string;
}

export interface SLAMetrics {
  timeSinceReported: number; // hours
  timeSinceAssigned: number | null;
  timeInProgress: number | null;
  resolutionDuration: number | null;
  slaStatus: 'on_track' | 'warning' | 'breached';
}

export interface WorkflowState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

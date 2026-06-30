/**
 * Types for the Authority Dashboard.
 */

export interface AuthorityDashboardData {
  stats: AuthorityStats;
  priorityIssues: PriorityIssue[];
  workload: DepartmentWorkload;
  recentActivity: ActivityEntry[];
  aiSummary: string;
}

export interface AuthorityStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  critical: number;
}

export interface PriorityIssue {
  documentId: string;
  title: string;
  category: string;
  severity: string;
  department: string;
  reportedAt: Date;
  trackingId: string;
  reporterName: string;
}

export interface DepartmentWorkload {
  assignedToday: number;
  resolvedToday: number;
  avgResolutionHours: number;
  backlog: number;
}

export interface ActivityEntry {
  action: string;
  issueTitle: string;
  time: Date;
  type: 'reported' | 'assigned' | 'status_change' | 'resolved';
}

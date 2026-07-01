/**
 * Types for the issue queue management system.
 */

export interface QueueIssue {
  documentId: string;
  trackingId: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  department: string;
  address: string;
  reporterName: string;
  reporterEmail: string;
  reporterUid: string;
  imageDataURL: string;
  aiConfidence: number;
  validations: number;
  priorityScore: number;
  priorityLabel: PriorityLabel;
  createdAt: Date;
  updatedAt: Date;
}

export type PriorityLabel = 'Critical' | 'High' | 'Medium' | 'Low';

export type ViewMode = 'table' | 'kanban';

export interface QueueFilters {
  search: string;
  status: string | null;
  severity: string | null;
  category: string | null;
  department: string | null;
  sortBy: QueueSortOption;
}

export type QueueSortOption =
  | 'newest'
  | 'oldest'
  | 'severity_high'
  | 'oldest_pending'
  | 'priority_score'
  | 'recently_updated';

export const QUEUE_SORT_OPTIONS: { value: QueueSortOption; label: string }[] = [
  { value: 'priority_score', label: 'Priority Score' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'severity_high', label: 'Highest Severity' },
  { value: 'oldest_pending', label: 'Oldest Pending' },
  { value: 'recently_updated', label: 'Recently Updated' },
];

export const DEPARTMENT_OPTIONS = [
  { value: 'public_works', label: 'Public Works' },
  { value: 'water_supply', label: 'Water Supply' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'sanitation', label: 'Sanitation' },
  { value: 'roads', label: 'Roads & Transport' },
  { value: 'parks', label: 'Parks & Recreation' },
  { value: 'general', label: 'General' },
];

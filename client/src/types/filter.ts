/**
 * Types for report filtering and sorting.
 */

export interface ReportFilters {
  search: string;
  category: string | null;
  status: string | null;
  severity: string | null;
  sortBy: SortOption;
}

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'severity_high'
  | 'recently_updated'
  | 'alphabetical';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'severity_high', label: 'Highest Severity' },
  { value: 'alphabetical', label: 'Alphabetical' },
];

export const CATEGORY_FILTER_OPTIONS = [
  { value: 'pothole', label: '🕳️ Pothole' },
  { value: 'water_leakage', label: '💧 Water' },
  { value: 'garbage', label: '🗑️ Waste' },
  { value: 'streetlight', label: '💡 Streetlight' },
  { value: 'road_hazard', label: '🚧 Road' },
  { value: 'drainage', label: '🌊 Drainage' },
  { value: 'other', label: '📌 Other' },
];

export const STATUS_FILTER_OPTIONS = [
  { value: 'pending', label: '⏳ Pending' },
  { value: 'in_progress', label: '🔄 In Progress' },
  { value: 'resolved', label: '✅ Resolved' },
  { value: 'closed', label: '🔒 Closed' },
];

export const SEVERITY_FILTER_OPTIONS = [
  { value: 'critical', label: '🔴 Critical' },
  { value: 'high', label: '🟠 High' },
  { value: 'medium', label: '🔵 Medium' },
  { value: 'low', label: '⚪ Low' },
];

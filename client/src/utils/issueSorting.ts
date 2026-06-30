import type { QueueIssue, QueueSortOption } from '@/types/issueQueue';

const SEVERITY_ORDER: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

/**
 * Sorts issues by the selected sort option.
 */
export function sortQueueIssues(issues: QueueIssue[], sortBy: QueueSortOption): QueueIssue[] {
  const sorted = [...issues];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case 'oldest':
      return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    case 'severity_high':
      return sorted.sort((a, b) => (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0));
    case 'oldest_pending':
      return sorted
        .filter((i) => i.status === 'pending')
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .concat(sorted.filter((i) => i.status !== 'pending'));
    case 'priority_score':
      return sorted.sort((a, b) => b.priorityScore - a.priorityScore);
    case 'recently_updated':
      return sorted.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    default:
      return sorted;
  }
}

/**
 * Filters issues by search query and active filters.
 */
export function filterQueueIssues(
  issues: QueueIssue[],
  filters: { search: string; status: string | null; severity: string | null; category: string | null; department: string | null }
): QueueIssue[] {
  return issues.filter((issue) => {
    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const searchable = [
        issue.trackingId, issue.title, issue.description,
        issue.category, issue.department, issue.address, issue.reporterName,
      ].join(' ').toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    if (filters.status && issue.status !== filters.status) return false;
    if (filters.severity && issue.severity !== filters.severity) return false;
    if (filters.category && issue.category !== filters.category) return false;
    if (filters.department && issue.department !== filters.department) return false;

    return true;
  });
}

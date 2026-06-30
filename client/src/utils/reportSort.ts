import type { ReportCardData } from '@/types/reportCard';
import type { SortOption } from '@/types/filter';

const SEVERITY_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Sorts reports based on the selected sort option.
 * Returns a new sorted array (does not mutate input).
 */
export function sortReports(reports: ReportCardData[], sortBy: SortOption): ReportCardData[] {
  const sorted = [...reports];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    case 'oldest':
      return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    case 'severity_high':
      return sorted.sort(
        (a, b) => (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0)
      );

    case 'recently_updated':
      // Same as newest for now (updatedAt not tracked on card)
      return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    case 'alphabetical':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));

    default:
      return sorted;
  }
}

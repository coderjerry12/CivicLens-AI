import type { ReportCardData } from '@/types/reportCard';
import type { ReportFilters } from '@/types/filter';

/**
 * Filters reports based on search query and filter selections.
 * All filtering is done client-side for instant responsiveness.
 */
export function filterReports(reports: ReportCardData[], filters: ReportFilters): ReportCardData[] {
  return reports.filter((report) => {
    // Search filter — matches across multiple fields
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const searchable = [
        report.title,
        report.category,
        report.address,
        report.trackingId,
        report.severity,
      ].join(' ').toLowerCase();

      if (!searchable.includes(q)) return false;
    }

    // Category filter
    if (filters.category && report.category !== filters.category) return false;

    // Status filter
    if (filters.status && report.status !== filters.status) return false;

    // Severity filter
    if (filters.severity && report.severity !== filters.severity) return false;

    return true;
  });
}

/**
 * Counts active filters (excluding search and sort).
 */
export function countActiveFilters(filters: ReportFilters): number {
  let count = 0;
  if (filters.category) count++;
  if (filters.status) count++;
  if (filters.severity) count++;
  return count;
}

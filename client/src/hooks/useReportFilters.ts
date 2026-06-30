import { useState, useMemo, useCallback } from 'react';
import { filterReports, countActiveFilters } from '@/utils/reportFilter';
import { sortReports } from '@/utils/reportSort';
import type { ReportCardData } from '@/types/reportCard';
import type { ReportFilters, SortOption } from '@/types/filter';

const DEFAULT_FILTERS: ReportFilters = {
  search: '',
  category: null,
  status: null,
  severity: null,
  sortBy: 'newest',
};

/**
 * Hook for managing report filtering and sorting state.
 * All logic is client-side for instant results.
 */
export function useReportFilters(reports: ReportCardData[]) {
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);

  // Apply filters then sort
  const filteredReports = useMemo(() => {
    const filtered = filterReports(reports, filters);
    return sortReports(filtered, filters.sortBy);
  }, [reports, filters]);

  const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setCategory = useCallback((category: string | null) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const setStatus = useCallback((status: string | null) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setSeverity = useCallback((severity: string | null) => {
    setFilters((prev) => ({ ...prev, severity }));
  }, []);

  const setSortBy = useCallback((sortBy: SortOption) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const clearAll = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const clearFilter = useCallback((key: 'category' | 'status' | 'severity') => {
    setFilters((prev) => ({ ...prev, [key]: null }));
  }, []);

  return {
    filters,
    filteredReports,
    activeCount,
    totalCount: reports.length,
    resultCount: filteredReports.length,
    setSearch,
    setCategory,
    setStatus,
    setSeverity,
    setSortBy,
    clearAll,
    clearFilter,
  };
}

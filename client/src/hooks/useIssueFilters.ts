import { useState, useMemo, useCallback } from 'react';
import { filterQueueIssues, sortQueueIssues } from '@/utils/issueSorting';
import type { QueueIssue, QueueFilters, QueueSortOption } from '@/types/issueQueue';

const DEFAULT_FILTERS: QueueFilters = {
  search: '',
  status: null,
  severity: null,
  category: null,
  department: null,
  sortBy: 'priority_score',
};

/**
 * Hook for managing issue queue filtering and sorting.
 */
export function useIssueFilters(issues: QueueIssue[]) {
  const [filters, setFilters] = useState<QueueFilters>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredIssues = useMemo(() => {
    const filtered = filterQueueIssues(issues, filters);
    return sortQueueIssues(filtered, filters.sortBy);
  }, [issues, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.severity) count++;
    if (filters.category) count++;
    if (filters.department) count++;
    return count;
  }, [filters]);

  const setSearch = useCallback((search: string) => setFilters((p) => ({ ...p, search })), []);
  const setStatus = useCallback((status: string | null) => setFilters((p) => ({ ...p, status })), []);
  const setSeverity = useCallback((severity: string | null) => setFilters((p) => ({ ...p, severity })), []);
  const setCategory = useCallback((category: string | null) => setFilters((p) => ({ ...p, category })), []);
  const setDepartment = useCallback((department: string | null) => setFilters((p) => ({ ...p, department })), []);
  const setSortBy = useCallback((sortBy: QueueSortOption) => setFilters((p) => ({ ...p, sortBy })), []);
  const clearAll = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  // Batch selection
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredIssues.map((i) => i.documentId)));
  }, [filteredIssues]);

  const deselectAll = useCallback(() => setSelectedIds(new Set()), []);

  return {
    filters,
    filteredIssues,
    activeFilterCount,
    totalCount: issues.length,
    resultCount: filteredIssues.length,
    selectedIds,
    setSearch, setStatus, setSeverity, setCategory, setDepartment, setSortBy, clearAll,
    toggleSelect, selectAll, deselectAll,
  };
}

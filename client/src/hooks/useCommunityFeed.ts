import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchCommunityFeed } from '@/services/communityFeedService';
import type { FeedIssue, CommunityFilters } from '@/types/community';

export function useCommunityFeed() {
  const [issues, setIssues] = useState<FeedIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CommunityFilters>({
    search: '', category: null, status: null, severity: null, department: null, sortBy: 'newest',
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCommunityFeed();
      setIssues(data);
    } catch (err) {
      console.error('[Feed] Fetch failed:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const filteredIssues = useMemo(() => {
    let result = issues;

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter((i) =>
        [i.title, i.address, i.trackingId, i.category].join(' ').toLowerCase().includes(q)
      );
    }
    if (filters.category) result = result.filter((i) => i.category === filters.category);
    if (filters.status) result = result.filter((i) => i.status === filters.status);
    if (filters.severity) result = result.filter((i) => i.severity === filters.severity);
    if (filters.department) result = result.filter((i) => i.department === filters.department);

    switch (filters.sortBy) {
      case 'most_verified': return [...result].sort((a, b) => b.verificationCount - a.verificationCount);
      case 'newest': default: return [...result].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }, [issues, filters]);

  return { issues: filteredIssues, allIssues: issues, loading, filters, setFilters, refresh: fetch };
}

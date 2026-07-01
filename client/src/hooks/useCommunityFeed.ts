import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchCommunityFeed } from '@/services/communityFeedService';
import type { FeedIssue, CommunityFilters } from '@/types/community';

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useCommunityFeed() {
  const [issues, setIssues] = useState<FeedIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
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

  // Request user location when "nearest" sort is selected
  const requestLocation = useCallback(() => {
    if (userLocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, [userLocation]);

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
      case 'nearest':
        if (!userLocation) return result;
        return [...result].sort((a, b) => {
          const distA = getDistanceKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
          const distB = getDistanceKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
          return distA - distB;
        });
      case 'newest': default: return [...result].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }, [issues, filters, userLocation]);

  return { issues: filteredIssues, allIssues: issues, loading, filters, setFilters, refresh: fetch, requestLocation, userLocation, locationLoading };
}

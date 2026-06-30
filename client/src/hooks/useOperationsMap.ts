import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchMapIssues } from '@/services/mapService';
import { detectHotspots } from '@/services/hotspotService';
import type { MapIssue, MapFilters, Hotspot } from '@/types/map';

interface MapState {
  issues: MapIssue[];
  hotspots: Hotspot[];
  loading: boolean;
  error: string | null;
}

export function useOperationsMap() {
  const [state, setState] = useState<MapState>({ issues: [], hotspots: [], loading: true, error: null });
  const [filters, setFilters] = useState<MapFilters>({ category: null, severity: null, status: null });

  const fetch = useCallback(async () => {
    setState((p) => ({ ...p, loading: true, error: null }));
    try {
      const issues = await fetchMapIssues();
      const hotspots = detectHotspots(issues);
      setState({ issues, hotspots, loading: false, error: null });
    } catch {
      setState({ issues: [], hotspots: [], loading: false, error: 'Could not load map data.' });
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const filteredIssues = useMemo(() => {
    return state.issues.filter((i) => {
      if (filters.category && i.category !== filters.category) return false;
      if (filters.severity && i.severity !== filters.severity) return false;
      if (filters.status && i.status !== filters.status) return false;
      return true;
    });
  }, [state.issues, filters]);

  return { ...state, filteredIssues, filters, setFilters, refresh: fetch };
}

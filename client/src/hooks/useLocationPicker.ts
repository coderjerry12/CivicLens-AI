import { useState, useCallback } from 'react';
import { getCurrentPosition, buildLocationFromCoords } from '@/services/locationService';
import type { SelectedLocation, LocationState } from '@/types/location';

/**
 * Hook for managing location selection state.
 * Supports GPS, manual map placement, and search.
 */
export function useLocationPicker() {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
  });

  // Get current GPS location
  const detectLocation = useCallback(async () => {
    setState({ location: null, loading: true, error: null });

    try {
      const { lat, lng } = await getCurrentPosition();
      const location = await buildLocationFromCoords(lat, lng, 'gps');
      setState({ location, loading: false, error: null });
      return location;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not get location.';
      setState({ location: null, loading: false, error: message });
      return null;
    }
  }, []);

  // Set location manually (from map click or drag)
  const setManualLocation = useCallback(async (lat: number, lng: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const location = await buildLocationFromCoords(lat, lng, 'manual');
      setState({ location, loading: false, error: null });
      return location;
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
      return null;
    }
  }, []);

  // Set from search result
  const setSearchLocation = useCallback((location: SelectedLocation) => {
    setState({ location, loading: false, error: null });
  }, []);

  // Clear location
  const clearLocation = useCallback(() => {
    setState({ location: null, loading: false, error: null });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    detectLocation,
    setManualLocation,
    setSearchLocation,
    clearLocation,
    clearError,
  };
}

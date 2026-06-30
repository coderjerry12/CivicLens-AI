/**
 * Types for location selection.
 */

export interface SelectedLocation {
  latitude: number;
  longitude: number;
  address: string;
  placeId?: string;
  source: LocationSource;
}

export type LocationSource = 'gps' | 'search' | 'manual';

export interface LocationState {
  location: SelectedLocation | null;
  loading: boolean;
  error: string | null;
}

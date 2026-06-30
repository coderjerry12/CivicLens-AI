import { lazy } from 'react';

export const LocationPicker = lazy(() =>
  import('./LocationPicker').then((mod) => ({ default: mod.LocationPicker }))
);

import type { SelectedLocation } from '@/types/location';

/**
 * Location service — handles GPS, reverse geocoding, and address lookup.
 * Uses browser Geolocation API and Google Maps Geocoding.
 */

// ─── GPS Location ───

export async function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('GPS is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied. Please enable location access in your browser settings.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location unavailable. Please try again or select manually on the map.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out. Please try again.'));
            break;
          default:
            reject(new Error('Could not determine your location. Please select manually.'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

// ─── Reverse Geocoding ───

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();

    if (data.display_name) {
      return data.display_name;
    }

    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

// ─── Build full location from coordinates ───

export async function buildLocationFromCoords(
  lat: number,
  lng: number,
  source: SelectedLocation['source']
): Promise<SelectedLocation> {
  const address = await reverseGeocode(lat, lng);
  return {
    latitude: lat,
    longitude: lng,
    address,
    source,
  };
}

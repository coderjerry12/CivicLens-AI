import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import {
  Navigation,
  Search,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useLocationPicker } from '@/hooks/useLocationPicker';
import type { SelectedLocation } from '@/types/location';

// ─── Custom red marker ───
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ─── Types ───
interface LocationPickerProps {
  value: SelectedLocation | null;
  onChange: (location: SelectedLocation | null) => void;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;
const LOCATED_ZOOM = 16;

// ─── Component ───
export function LocationPicker({ value, onChange, className }: LocationPickerProps) {
  const {
    location,
    loading,
    error,
    detectLocation,
    setManualLocation,
    clearError,
  } = useLocationPicker();

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location) onChange(location);
  }, [location, onChange]);

  const currentLocation = value || location;

  const handleDetectLocation = async () => {
    const result = await detectLocation();
    if (result) onChange(result);
  };

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    const result = await setManualLocation(lat, lng);
    if (result) onChange(result);
  }, [setManualLocation, onChange]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon, display_name, place_id } = data[0];
        onChange({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          address: display_name,
          placeId: String(place_id),
          source: 'search',
        });
      }
    } catch { /* silent */ }
    finally { setSearching(false); }
  };

  const handleClear = () => {
    onChange(null);
    setSearchQuery('');
  };

  const mapCenter: [number, number] = currentLocation
    ? [currentLocation.latitude, currentLocation.longitude]
    : DEFAULT_CENTER;
  const mapZoom = currentLocation ? LOCATED_ZOOM : DEFAULT_ZOOM;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 z-10" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search address or landmark..."
            className="w-full h-10 rounded-[14px] border border-border dark:border-neutral-700 bg-surface dark:bg-neutral-800 pl-9 pr-3 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            aria-label="Search for an address"
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="rounded-[14px] overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-sm relative"
      >
        <MapContainer
          key={`map-${mapCenter[0]}-${mapCenter[1]}`}
          center={mapCenter}
          zoom={mapZoom}
          zoomControl={false}
          attributionControl={false}
          style={{ height: '320px', width: '100%', zIndex: 0 }}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <ZoomControl position="topleft" />
          {currentLocation && (
            <Marker
              position={[currentLocation.latitude, currentLocation.longitude]}
              icon={customIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const latlng = e.target.getLatLng();
                  handleMapClick(latlng.lat, latlng.lng);
                },
              }}
            />
          )}
          <ClickHandler onClick={handleMapClick} />
          <ResizeHandler />
          <FlyToLocation center={mapCenter} zoom={mapZoom} />
        </MapContainer>
      </div>

      {/* Hint */}
      {!currentLocation && (
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 text-center">
          Click on the map to place a pin, search for an address, or use GPS
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-[10px] bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 px-3 py-2.5" role="alert">
          <AlertCircle className="h-4 w-4 text-danger-600 dark:text-danger-400 shrink-0 mt-0.5" />
          <p className="text-xs text-danger-700 dark:text-danger-300 flex-1">{error}</p>
          <button onClick={clearError} className="text-danger-400 hover:text-danger-600"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Selected location info */}
      {currentLocation && (
        <div className="flex items-start gap-3 rounded-[10px] bg-success-100 dark:bg-success-500/10 border border-success-300 dark:border-success-500/20 px-3 py-2.5 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-success-700 dark:text-success-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-success-900 dark:text-success-300">{currentLocation.address}</p>
            <p className="text-[10px] text-success-700 dark:text-success-400 mt-0.5 flex items-center gap-2">
              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              <Badge variant="success" size="sm">
                {currentLocation.source === 'gps' ? '📍 GPS' : currentLocation.source === 'search' ? '🔍 Search' : '👆 Map'}
              </Badge>
            </p>
          </div>
          <button onClick={handleClear} className="text-success-600 hover:text-success-800 dark:text-success-400 dark:hover:text-success-300 shrink-0"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* GPS button */}
      <Button variant="outline" size="sm" onClick={handleDetectLocation} disabled={loading} className="w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
        {loading ? 'Detecting...' : 'Use My Current Location'}
      </Button>
    </div>
  );
}

// ─── Map Helpers ───

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    // Multiple resize calls to ensure tiles load fully
    const timers = [100, 300, 600, 1000].map((ms) =>
      setTimeout(() => map.invalidateSize(), ms)
    );
    return () => timers.forEach(clearTimeout);
  }, [map]);
  return null;
}

function FlyToLocation({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const prev = useRef(center);
  useEffect(() => {
    if (center[0] !== prev.current[0] || center[1] !== prev.current[1]) {
      map.flyTo(center, zoom, { duration: 1 });
      prev.current = center;
    }
  }, [center, zoom, map]);
  return null;
}

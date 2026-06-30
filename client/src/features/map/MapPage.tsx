import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Filter, X, AlertTriangle, Layers } from 'lucide-react';
import { Badge, Button, Spinner, FilterChip } from '@/components/ui';
import { useOperationsMap } from '@/hooks/useOperationsMap';
import { cn } from '@/lib/utils';
import { CATEGORY_FILTER_OPTIONS, STATUS_FILTER_OPTIONS, SEVERITY_FILTER_OPTIONS } from '@/types/filter';

// Severity-colored marker icons
const SEVERITY_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#d97706',
  medium: '#2563eb',
  low: '#6b7280',
};

function createMarkerIcon(severity: string) {
  const color = SEVERITY_COLORS[severity] || '#6b7280';
  return L.divIcon({
    className: '',
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

export default function MapPage() {
  const navigate = useNavigate();
  const { filteredIssues, hotspots, loading, filters, setFilters } = useOperationsMap();
  const [showFilters, setShowFilters] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);

  const center: [number, number] = filteredIssues.length > 0
    ? [filteredIssues[0].latitude, filteredIssues[0].longitude]
    : DEFAULT_CENTER;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Map */}
      <MapContainer
        center={center}
        zoom={filteredIssues.length > 0 ? 12 : DEFAULT_ZOOM}
        zoomControl={false}
        attributionControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <ZoomControl position="bottomright" />
        <MapResizer issues={filteredIssues} />

        {/* Issue Markers */}
        {filteredIssues.map((issue) => (
          <Marker
            key={issue.documentId}
            position={[issue.latitude, issue.longitude]}
            icon={createMarkerIcon(issue.severity)}
          >
            <Popup>
              <div className="min-w-[200px] p-1">
                <p className="font-semibold text-sm">{issue.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{issue.trackingId}</p>
                <div className="flex gap-1 mt-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 capitalize">{issue.category.replace('_', ' ')}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 capitalize">{issue.severity}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{issue.address}</p>
                <button
                  onClick={() => navigate(`/app/issues/${issue.documentId}`)}
                  className="mt-2 text-xs text-blue-600 font-medium hover:underline"
                >
                  View Details →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Hotspot Circles */}
        {showHotspots && hotspots.map((hs, idx) => (
          <Circle
            key={idx}
            center={[hs.latitude, hs.longitude]}
            radius={hs.radius * 1000}
            pathOptions={{
              color: hs.severity === 'high' ? '#dc2626' : hs.severity === 'medium' ? '#d97706' : '#2563eb',
              fillColor: hs.severity === 'high' ? '#dc2626' : hs.severity === 'medium' ? '#d97706' : '#2563eb',
              fillOpacity: 0.1,
              weight: 2,
            }}
          />
        ))}
      </MapContainer>

      {/* Top Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 rounded-[12px] px-4 py-2.5 text-sm font-medium shadow-lg transition-all',
            showFilters
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700'
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {(filters.category || filters.severity || filters.status) && (
            <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full">Active</span>
          )}
        </button>

        <button
          onClick={() => setShowHotspots(!showHotspots)}
          className={cn(
            'flex items-center gap-2 rounded-[12px] px-4 py-2.5 text-sm font-medium shadow-lg transition-all',
            showHotspots
              ? 'bg-danger-600 text-white'
              : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700'
          )}
        >
          <Layers className="h-4 w-4" />
          Hotspots
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-16 left-4 z-[1000] w-72 rounded-[16px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-xl p-4 animate-slide-down">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-white">Filter Issues</h3>
            <button onClick={() => setShowFilters(false)} className="text-neutral-400 hover:text-neutral-600"><X className="h-4 w-4" /></button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_FILTER_OPTIONS.map((o) => (
                  <FilterChip key={o.value} label={o.label} active={filters.category === o.value} onClick={() => setFilters({ ...filters, category: filters.category === o.value ? null : o.value })} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Severity</p>
              <div className="flex flex-wrap gap-1.5">
                {SEVERITY_FILTER_OPTIONS.map((o) => (
                  <FilterChip key={o.value} label={o.label} active={filters.severity === o.value} onClick={() => setFilters({ ...filters, severity: filters.severity === o.value ? null : o.value })} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTER_OPTIONS.map((o) => (
                  <FilterChip key={o.value} label={o.label} active={filters.status === o.value} onClick={() => setFilters({ ...filters, status: filters.status === o.value ? null : o.value })} />
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setFilters({ category: null, severity: null, status: null })}>
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-[12px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg px-4 py-3">
        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Severity</p>
        <div className="flex items-center gap-3">
          {Object.entries(SEVERITY_COLORS).map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-neutral-600 dark:text-neutral-300 capitalize">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-neutral-400 mt-1">{filteredIssues.length} issues on map</p>
      </div>

      {/* Hotspot Stats */}
      {showHotspots && hotspots.length > 0 && (
        <div className="absolute top-4 right-4 z-[1000] w-56 rounded-[12px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg p-3">
          <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-danger-500" /> Hotspots Detected
          </p>
          <div className="space-y-1.5">
            {hotspots.slice(0, 3).map((hs, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-600 dark:text-neutral-300 capitalize">{hs.topCategory.replace('_', ' ')}</span>
                <Badge variant={hs.severity === 'high' ? 'danger' : hs.severity === 'medium' ? 'accent' : 'primary'} size="sm">
                  {hs.issueCount}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Map helper ───

function MapResizer({ issues }: { issues: { latitude: number; longitude: number }[] }) {
  const map = useMap();
  const prevLength = useRef(issues.length);

  useEffect(() => {
    if (issues.length > 0 && issues.length !== prevLength.current) {
      const bounds = L.latLngBounds(issues.map((i) => [i.latitude, i.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      prevLength.current = issues.length;
    }
    // Invalidate size on mount
    setTimeout(() => map.invalidateSize(), 200);
  }, [issues, map]);

  return null;
}

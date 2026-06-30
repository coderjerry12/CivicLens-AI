import type { MapIssue, Hotspot } from '@/types/map';

const CLUSTER_RADIUS_KM = 1.5;

/**
 * Detects hotspot areas by clustering nearby issues.
 * Uses simple density-based clustering.
 */
export function detectHotspots(issues: MapIssue[]): Hotspot[] {
  if (issues.length < 2) return [];

  const visited = new Set<number>();
  const hotspots: Hotspot[] = [];

  for (let i = 0; i < issues.length; i++) {
    if (visited.has(i)) continue;

    const cluster: MapIssue[] = [issues[i]];
    visited.add(i);

    for (let j = i + 1; j < issues.length; j++) {
      if (visited.has(j)) continue;
      const dist = haversine(issues[i].latitude, issues[i].longitude, issues[j].latitude, issues[j].longitude);
      if (dist <= CLUSTER_RADIUS_KM) {
        cluster.push(issues[j]);
        visited.add(j);
      }
    }

    // Only report clusters with 2+ issues
    if (cluster.length >= 2) {
      const avgLat = cluster.reduce((s, c) => s + c.latitude, 0) / cluster.length;
      const avgLng = cluster.reduce((s, c) => s + c.longitude, 0) / cluster.length;

      // Find top category
      const catCounts: Record<string, number> = {};
      cluster.forEach((c) => { catCounts[c.category] = (catCounts[c.category] || 0) + 1; });
      const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0][0];

      const severity: Hotspot['severity'] =
        cluster.length >= 5 ? 'high' : cluster.length >= 3 ? 'medium' : 'low';

      hotspots.push({
        latitude: avgLat,
        longitude: avgLng,
        radius: CLUSTER_RADIUS_KM,
        issueCount: cluster.length,
        topCategory,
        severity,
      });
    }
  }

  return hotspots.sort((a, b) => b.issueCount - a.issueCount);
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

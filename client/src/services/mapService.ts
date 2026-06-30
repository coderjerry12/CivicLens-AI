import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MapIssue } from '@/types/map';

/**
 * Fetches all issues with coordinates for map display.
 */
export async function fetchMapIssues(): Promise<MapIssue[]> {
  const snapshot = await getDocs(collection(db, 'issues'));
  const issues: MapIssue[] = [];

  snapshot.forEach((doc) => {
    const d = doc.data();
    const lat = d.location?.latitude;
    const lng = d.location?.longitude;

    // Only include issues with valid coordinates
    if (lat && lng) {
      issues.push({
        documentId: doc.id,
        trackingId: d.trackingId || '',
        title: d.title || 'Untitled',
        category: d.category || 'other',
        severity: d.severity || 'medium',
        status: d.status || 'pending',
        department: d.department || 'general',
        latitude: lat,
        longitude: lng,
        address: d.location?.address || '',
        reporterName: d.reporter?.name || 'Anonymous',
        createdAt: d.createdAt?.toDate?.() || new Date(),
      });
    }
  });

  return issues;
}

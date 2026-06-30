import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculateDuplicateScore, titleSimilarity } from './ruleEngine';

export interface PotentialDuplicate {
  documentId: string;
  trackingId: string;
  title: string;
  category: string;
  status: string;
  similarityScore: number;
  distance: number;
}

/**
 * Finds potential duplicate issues before submission.
 * Returns issues with similarity score above threshold.
 */
export async function detectDuplicates(
  category: string,
  title: string,
  latitude: number,
  longitude: number,
  threshold: number = 50
): Promise<PotentialDuplicate[]> {
  const snapshot = await getDocs(collection(db, 'issues'));
  const duplicates: PotentialDuplicate[] = [];

  snapshot.forEach((doc) => {
    const d = doc.data();
    const issueLat = d.location?.latitude || 0;
    const issueLng = d.location?.longitude || 0;

    if (!issueLat || !issueLng) return;

    const distance = haversine(latitude, longitude, issueLat, issueLng);
    const simScore = titleSimilarity(title, d.title || '');
    const dupScore = calculateDuplicateScore(category, d.category || '', distance, simScore);

    if (dupScore >= threshold) {
      duplicates.push({
        documentId: doc.id,
        trackingId: d.trackingId || '',
        title: d.title || 'Untitled',
        category: d.category || 'other',
        status: d.status || 'pending',
        similarityScore: dupScore,
        distance: Math.round(distance * 10) / 10,
      });
    }
  });

  return duplicates.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 5);
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

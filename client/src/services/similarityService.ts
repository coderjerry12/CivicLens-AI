import type { SimilarIssue } from '@/types/issueWorkspace';

interface IssueForComparison {
  documentId: string;
  trackingId: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  latitude: number;
  longitude: number;
  aiConfidence: number;
  createdAt: Date;
}

/**
 * Finds similar issues based on category, distance, and AI confidence.
 *
 * Similarity Score (0-100):
 * - Same category: +40 points
 * - Distance < 1km: +30, < 5km: +20, < 10km: +10
 * - Same severity: +15
 * - AI confidence > 80%: +15
 */
export function findSimilarIssues(
  targetId: string,
  targetCategory: string,
  targetLat: number,
  targetLng: number,
  allIssues: IssueForComparison[],
  limit: number = 5
): SimilarIssue[] {
  const results: SimilarIssue[] = [];

  for (const issue of allIssues) {
    if (issue.documentId === targetId) continue;

    let score = 0;

    // Category match (+40)
    if (issue.category === targetCategory) score += 40;

    // Distance (+10-30)
    const distance = haversineDistance(targetLat, targetLng, issue.latitude, issue.longitude);
    if (distance < 1) score += 30;
    else if (distance < 5) score += 20;
    else if (distance < 10) score += 10;

    // Same severity (+15)
    if (issue.severity === issue.severity) score += 15;

    // AI confidence bonus (+15)
    if (issue.aiConfidence > 80) score += 15;

    if (score >= 20) {
      results.push({
        documentId: issue.documentId,
        trackingId: issue.trackingId,
        title: issue.title,
        category: issue.category,
        severity: issue.severity,
        status: issue.status,
        distance: Math.round(distance * 10) / 10,
        similarityScore: Math.min(score, 100),
        createdAt: issue.createdAt,
      });
    }
  }

  return results
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);
}

/**
 * Haversine formula for distance between two points in km.
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

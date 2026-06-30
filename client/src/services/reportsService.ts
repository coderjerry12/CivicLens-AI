import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ReportCardData } from '@/types/reportCard';

/**
 * Fetches the most recent reports for a specific user.
 */
export async function fetchRecentReports(userId: string, count: number = 5): Promise<ReportCardData[]> {
  const issuesRef = collection(db, 'issues');
  // Simple query without orderBy to avoid needing a composite index
  const userQuery = query(
    issuesRef,
    where('reporter.uid', '==', userId)
  );

  const snapshot = await getDocs(userQuery);
  const reports: ReportCardData[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    reports.push({
      documentId: doc.id,
      trackingId: data.trackingId || '',
      title: data.title || 'Untitled Issue',
      category: data.category || 'other',
      severity: data.severity || 'medium',
      status: data.status || 'pending',
      address: data.location?.address || 'Location not set',
      imageDataURL: data.imageDataURL || '',
      createdAt: data.createdAt?.toDate?.() || new Date(),
    });
  });

  // Sort client-side by createdAt descending and limit
  reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return reports.slice(0, count);
}

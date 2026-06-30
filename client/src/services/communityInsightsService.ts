import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  calculateCategoryDistribution,
  calculateStatusDistribution,
  calculateHotspots,
  calculateResolutionRate,
  generateCommunitySummary,
} from '@/utils/analytics';
import type { CommunityInsights } from '@/types/communityInsight';

/**
 * Fetches all issues and computes community-level insights.
 */
export async function fetchCommunityInsights(): Promise<CommunityInsights> {
  const issuesRef = collection(db, 'issues');
  const snapshot = await getDocs(issuesRef);

  const issues: { category: string; status: string; address: string; createdAt: Date }[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    issues.push({
      category: data.category || 'other',
      status: data.status || 'pending',
      address: data.location?.address || '',
      createdAt: data.createdAt?.toDate?.() || new Date(),
    });
  });

  const categoryDistribution = calculateCategoryDistribution(issues);
  const statusDistribution = calculateStatusDistribution(issues);
  const hotspotAreas = calculateHotspots(issues);
  const resolutionRate = calculateResolutionRate(issues);

  const topCategory = categoryDistribution[0]?.category || 'none';
  const topHotspot = hotspotAreas[0]?.area || 'your area';
  const aiSummary = generateCommunitySummary(issues.length, resolutionRate, topCategory, topHotspot);

  // Community score: based on total reports and resolution rate
  const communityScore = Math.min(Math.round((issues.length * 5) + (resolutionRate * 0.5)), 100);

  return {
    categoryDistribution,
    statusDistribution,
    resolutionRate,
    avgResolutionDays: 2.4, // Placeholder — would need timestamps to calculate
    hotspotAreas,
    communityScore,
    totalCommunityReports: issues.length,
    aiSummary,
  };
}

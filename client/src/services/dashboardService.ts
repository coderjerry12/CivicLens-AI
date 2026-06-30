import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DashboardStats, CommunityLevel } from '@/types/dashboard';

/**
 * Fetches dashboard statistics for a specific user from Firestore.
 */
export async function fetchDashboardStats(userId: string): Promise<DashboardStats> {
  const issuesRef = collection(db, 'issues');
  const userQuery = query(issuesRef, where('reporter.uid', '==', userId));
  const snapshot = await getDocs(userQuery);

  let totalReports = 0;
  let pending = 0;
  let inProgress = 0;
  let resolved = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    totalReports++;

    switch (data.status) {
      case 'pending':
      case 'validated':
        pending++;
        break;
      case 'in_progress':
        inProgress++;
        break;
      case 'resolved':
      case 'closed':
        resolved++;
        break;
    }
  });

  const impactScore = calculateImpactScore(totalReports, resolved);
  const level = getContributorLevel(impactScore);

  return {
    totalReports,
    pending,
    inProgress,
    resolved,
    communityImpact: {
      score: impactScore,
      level,
    },
  };
}

/**
 * Calculate community impact score (0-100).
 * Based on: total reports submitted + resolution rate.
 */
function calculateImpactScore(total: number, resolved: number): number {
  if (total === 0) return 0;

  // Base score: each report contributes up to 10 points (max 50)
  const reportScore = Math.min(total * 10, 50);

  // Resolution bonus: percentage of resolved issues (max 50)
  const resolutionRate = resolved / total;
  const resolutionScore = Math.round(resolutionRate * 50);

  return Math.min(reportScore + resolutionScore, 100);
}

/**
 * Determine contributor level based on impact score.
 */
function getContributorLevel(score: number): CommunityLevel {
  if (score >= 80) return 'Civic Leader';
  if (score >= 60) return 'Community Champion';
  if (score >= 40) return 'Active Citizen';
  if (score >= 20) return 'Contributor';
  return 'Newcomer';
}

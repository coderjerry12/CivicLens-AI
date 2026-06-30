import type { CategoryCount, StatusCount, HotspotArea } from '@/types/communityInsight';

interface RawIssue {
  category: string;
  status: string;
  address: string;
  createdAt: Date;
}

/**
 * Calculates category distribution from raw issues.
 */
export function calculateCategoryDistribution(issues: RawIssue[]): CategoryCount[] {
  const counts: Record<string, number> = {};
  issues.forEach((issue) => {
    counts[issue.category] = (counts[issue.category] || 0) + 1;
  });

  const total = issues.length || 1;
  return Object.entries(counts)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculates status distribution from raw issues.
 */
export function calculateStatusDistribution(issues: RawIssue[]): StatusCount[] {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-accent-500' },
    validated: { label: 'Validated', color: 'bg-primary-400' },
    in_progress: { label: 'In Progress', color: 'bg-primary-600' },
    resolved: { label: 'Resolved', color: 'bg-success-500' },
    closed: { label: 'Closed', color: 'bg-neutral-400' },
  };

  const counts: Record<string, number> = {};
  issues.forEach((issue) => {
    counts[issue.status] = (counts[issue.status] || 0) + 1;
  });

  const total = issues.length || 1;
  return Object.entries(counts)
    .map(([status, count]) => ({
      status: statusConfig[status]?.label || status,
      count,
      percentage: Math.round((count / total) * 100),
      color: statusConfig[status]?.color || 'bg-neutral-300',
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Extracts hotspot areas from addresses.
 */
export function calculateHotspots(issues: RawIssue[]): HotspotArea[] {
  const areaCounts: Record<string, number> = {};

  issues.forEach((issue) => {
    // Extract a rough area from address (first meaningful segment)
    const area = extractArea(issue.address);
    if (area) {
      areaCounts[area] = (areaCounts[area] || 0) + 1;
    }
  });

  return Object.entries(areaCounts)
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function extractArea(address: string): string {
  if (!address) return 'Unknown';
  // Take the first 2-3 meaningful parts of the address
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]}, ${parts[1]}`;
  return parts[0] || 'Unknown';
}

/**
 * Calculates resolution rate percentage.
 */
export function calculateResolutionRate(issues: RawIssue[]): number {
  if (issues.length === 0) return 0;
  const resolved = issues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;
  return Math.round((resolved / issues.length) * 100);
}

/**
 * Generates an AI-style community summary from data.
 */
export function generateCommunitySummary(
  total: number,
  resolutionRate: number,
  topCategory: string,
  hotspot: string
): string {
  if (total === 0) {
    return 'No community data available yet. Reports will generate insights once issues are submitted.';
  }

  const rateDesc = resolutionRate > 70 ? 'excellent' : resolutionRate > 40 ? 'moderate' : 'needs improvement';
  return `Your community has reported ${total} issue${total > 1 ? 's' : ''}. Resolution rate is ${rateDesc} at ${resolutionRate}%. The most common category is ${topCategory.replace('_', ' ')} and the busiest area is ${hotspot}.`;
}

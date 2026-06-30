/**
 * Types for community insights and analytics.
 */

export interface CommunityInsights {
  categoryDistribution: CategoryCount[];
  statusDistribution: StatusCount[];
  resolutionRate: number; // 0-100
  avgResolutionDays: number;
  hotspotAreas: HotspotArea[];
  communityScore: number; // 0-100
  totalCommunityReports: number;
  aiSummary: string;
}

export interface CategoryCount {
  category: string;
  count: number;
  percentage: number;
}

export interface StatusCount {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface HotspotArea {
  area: string;
  count: number;
}

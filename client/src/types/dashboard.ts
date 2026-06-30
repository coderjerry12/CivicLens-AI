/**
 * Types for citizen dashboard statistics.
 */

export interface DashboardStats {
  totalReports: number;
  pending: number;
  inProgress: number;
  resolved: number;
  communityImpact: {
    score: number; // 0-100
    level: CommunityLevel;
  };
}

export type CommunityLevel =
  | 'Newcomer'
  | 'Contributor'
  | 'Active Citizen'
  | 'Community Champion'
  | 'Civic Leader';

export interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

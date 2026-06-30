/**
 * Types for authority analytics dashboard.
 */

export interface AnalyticsData {
  kpis: AnalyticsKPIs;
  categoryBreakdown: CategoryMetric[];
  departmentPerformance: DepartmentMetric[];
  priorityDistribution: PriorityMetric[];
  trendData: TrendPoint[];
  hotspots: HotspotMetric[];
  decisions: AIDecision[];
}

export interface AnalyticsKPIs {
  totalIssues: number;
  resolutionRate: number;
  avgResolutionHours: number;
  criticalOpen: number;
  newThisWeek: number;
  resolvedThisWeek: number;
}

export interface CategoryMetric {
  category: string;
  count: number;
  percentage: number;
  resolved: number;
}

export interface DepartmentMetric {
  department: string;
  total: number;
  resolved: number;
  pending: number;
  resolutionRate: number;
}

export interface PriorityMetric {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TrendPoint {
  date: string;
  reported: number;
  resolved: number;
}

export interface HotspotMetric {
  area: string;
  count: number;
  topCategory: string;
}

export interface AIDecision {
  id: string;
  type: 'warning' | 'recommendation' | 'insight';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

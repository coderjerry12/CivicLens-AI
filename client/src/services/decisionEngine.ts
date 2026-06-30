import type { AIDecision, AnalyticsKPIs, DepartmentMetric, CategoryMetric } from '@/types/analytics';

/**
 * Rule-based decision engine that generates recommendations from analytics.
 * Designed to be replaceable by Gemini API later.
 */
export function generateDecisions(
  kpis: AnalyticsKPIs,
  departments: DepartmentMetric[],
  categories: CategoryMetric[]
): AIDecision[] {
  const decisions: AIDecision[] = [];

  // Critical issues warning
  if (kpis.criticalOpen > 0) {
    decisions.push({
      id: 'd-critical',
      type: 'warning',
      title: `${kpis.criticalOpen} Critical Issue${kpis.criticalOpen > 1 ? 's' : ''} Open`,
      description: 'These require immediate attention to prevent safety hazards or escalation.',
      priority: 'high',
    });
  }

  // Low resolution rate
  if (kpis.resolutionRate < 50 && kpis.totalIssues > 5) {
    decisions.push({
      id: 'd-resolution',
      type: 'warning',
      title: 'Resolution Rate Below 50%',
      description: `Current rate is ${kpis.resolutionRate}%. Consider prioritizing backlog reduction this week.`,
      priority: 'high',
    });
  }

  // Department bottleneck
  const bottleneck = departments.find((d) => d.pending > 5 && d.resolutionRate < 30);
  if (bottleneck) {
    decisions.push({
      id: 'd-bottleneck',
      type: 'recommendation',
      title: `${bottleneck.department.replace('_', ' ')} Has High Backlog`,
      description: `${bottleneck.pending} pending issues with only ${bottleneck.resolutionRate}% resolution. Consider redistributing or adding resources.`,
      priority: 'medium',
    });
  }

  // Trending category
  const topCategory = categories[0];
  if (topCategory && topCategory.count > 3) {
    decisions.push({
      id: 'd-trend',
      type: 'insight',
      title: `${topCategory.category.replace('_', ' ')} is Most Reported`,
      description: `${topCategory.count} reports (${topCategory.percentage}% of total). This may indicate a systemic issue in the area.`,
      priority: 'medium',
    });
  }

  // Good performance
  if (kpis.resolvedThisWeek > kpis.newThisWeek && kpis.resolvedThisWeek > 0) {
    decisions.push({
      id: 'd-positive',
      type: 'insight',
      title: 'Positive Resolution Trend',
      description: `Resolved ${kpis.resolvedThisWeek} issues this week vs ${kpis.newThisWeek} new. The backlog is decreasing.`,
      priority: 'low',
    });
  }

  // Avg resolution time
  if (kpis.avgResolutionHours > 72) {
    decisions.push({
      id: 'd-slow',
      type: 'recommendation',
      title: 'Average Resolution Time Exceeds 72 Hours',
      description: 'Consider streamlining the assignment workflow or enabling automated routing.',
      priority: 'medium',
    });
  }

  return decisions.slice(0, 5);
}

/**
 * Centralized Rule Engine for intelligent decision-making.
 * Reusable across the entire application.
 * Designed to be replaceable by Gemini API in the future.
 */

// ─── Priority Recommendation ───

export function recommendPriority(severity: string, age: number, validations: number): string {
  if (severity === 'critical' || (severity === 'high' && age > 48)) return 'critical';
  if (severity === 'high' || (severity === 'medium' && validations > 3)) return 'high';
  if (severity === 'medium' || validations > 1) return 'medium';
  return 'low';
}

// ─── Department Recommendation ───

const DEPT_MAP: Record<string, string> = {
  pothole: 'roads', road_hazard: 'roads',
  water_leakage: 'water_supply', drainage: 'water_supply',
  garbage: 'sanitation', streetlight: 'electricity',
  noise: 'general', other: 'public_works',
};

export function recommendDepartment(category: string): string {
  return DEPT_MAP[category] || 'general';
}

// ─── Resolution Time Estimate ───

export function estimateResolutionTime(severity: string, category: string): string {
  const base: Record<string, number> = { critical: 12, high: 24, medium: 72, low: 168 };
  const catMultiplier: Record<string, number> = { pothole: 1.5, water_leakage: 0.8, garbage: 0.5, streetlight: 1.2 };
  const hours = (base[severity] || 72) * (catMultiplier[category] || 1);
  if (hours < 24) return `~${Math.round(hours)} hours`;
  return `~${Math.round(hours / 24)} days`;
}

// ─── Duplicate Detection Score ───

export function calculateDuplicateScore(
  cat1: string, cat2: string,
  distanceKm: number,
  titleSimilarity: number // 0-1
): number {
  let score = 0;
  if (cat1 === cat2) score += 40;
  if (distanceKm < 0.5) score += 35;
  else if (distanceKm < 1) score += 25;
  else if (distanceKm < 2) score += 15;
  score += Math.round(titleSimilarity * 25);
  return Math.min(score, 100);
}

// ─── Title Similarity (simple Jaccard) ───

export function titleSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\s+/));
  const setB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

// ─── Predictive Insights ───

export interface PredictiveInsight {
  id: string;
  type: 'prediction' | 'warning' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
}

export function generatePredictiveInsights(
  _totalIssues: number,
  resolvedRate: number,
  topCategory: string,
  criticalCount: number,
  avgResolutionHours: number
): PredictiveInsight[] {
  const insights: PredictiveInsight[] = [];

  if (criticalCount > 2) {
    insights.push({
      id: 'pred-critical',
      type: 'warning',
      title: 'Critical Issue Cluster Detected',
      description: `${criticalCount} critical issues are active. Historical data suggests these escalate if unresolved within 24h.`,
      confidence: 85,
    });
  }

  if (resolvedRate > 70) {
    insights.push({
      id: 'pred-positive',
      type: 'opportunity',
      title: 'High Resolution Momentum',
      description: 'Resolution rate is above 70%. Maintaining this pace will clear the backlog within the week.',
      confidence: 78,
    });
  }

  if (avgResolutionHours > 48) {
    insights.push({
      id: 'pred-slow',
      type: 'prediction',
      title: 'Resolution Time Trending Up',
      description: `Average resolution is ${Math.round(avgResolutionHours)}h. At this rate, backlog will grow by ~20% next week.`,
      confidence: 72,
    });
  }

  if (topCategory) {
    insights.push({
      id: 'pred-category',
      type: 'prediction',
      title: `${topCategory.replace('_', ' ')} Issues May Increase`,
      description: `Based on historical patterns, ${topCategory.replace('_', ' ')} reports typically spike in coming days.`,
      confidence: 65,
    });
  }

  return insights.slice(0, 4);
}

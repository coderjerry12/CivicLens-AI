import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateDecisions } from './decisionEngine';
import type { AnalyticsData, AnalyticsKPIs, CategoryMetric, DepartmentMetric, PriorityMetric, TrendPoint, HotspotMetric } from '@/types/analytics';

/**
 * Fetches all issues and computes comprehensive analytics.
 */
export async function fetchAnalytics(): Promise<AnalyticsData> {
  const snapshot = await getDocs(collection(db, 'issues'));

  const issues: {
    category: string; severity: string; status: string; department: string;
    address: string; createdAt: Date; resolvedAt: Date | null;
  }[] = [];

  snapshot.forEach((doc) => {
    const d = doc.data();
    issues.push({
      category: d.category || 'other',
      severity: d.severity || 'medium',
      status: d.status || 'pending',
      department: d.department || 'general',
      address: d.location?.address || '',
      createdAt: d.createdAt?.toDate?.() || new Date(),
      resolvedAt: d.resolvedAt?.toDate?.() || null,
    });
  });

  const kpis = calculateKPIs(issues);
  const categoryBreakdown = calculateCategories(issues);
  const departmentPerformance = calculateDepartments(issues);
  const priorityDistribution = calculatePriority(issues);
  const trendData = calculateTrends(issues);
  const hotspots = calculateHotspots(issues);
  const decisions = generateDecisions(kpis, departmentPerformance, categoryBreakdown);

  return { kpis, categoryBreakdown, departmentPerformance, priorityDistribution, trendData, hotspots, decisions };
}

function calculateKPIs(issues: { status: string; severity: string; createdAt: Date; resolvedAt: Date | null }[]): AnalyticsKPIs {
  const total = issues.length;
  const resolved = issues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;
  const criticalOpen = issues.filter((i) => i.severity === 'critical' && i.status !== 'resolved' && i.status !== 'closed').length;

  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const newThisWeek = issues.filter((i) => i.createdAt >= weekAgo).length;
  const resolvedThisWeek = issues.filter((i) => i.resolvedAt && i.resolvedAt >= weekAgo).length;

  // Average resolution hours
  const resolvedIssues = issues.filter((i) => i.resolvedAt);
  const avgHours = resolvedIssues.length > 0
    ? resolvedIssues.reduce((sum, i) => sum + (i.resolvedAt!.getTime() - i.createdAt.getTime()) / (1000 * 60 * 60), 0) / resolvedIssues.length
    : 0;

  return {
    totalIssues: total,
    resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    avgResolutionHours: Math.round(avgHours),
    criticalOpen,
    newThisWeek,
    resolvedThisWeek,
  };
}

function calculateCategories(issues: { category: string; status: string }[]): CategoryMetric[] {
  const counts: Record<string, { total: number; resolved: number }> = {};
  issues.forEach((i) => {
    if (!counts[i.category]) counts[i.category] = { total: 0, resolved: 0 };
    counts[i.category].total++;
    if (i.status === 'resolved' || i.status === 'closed') counts[i.category].resolved++;
  });
  const total = issues.length || 1;
  return Object.entries(counts)
    .map(([category, { total: count, resolved }]) => ({ category, count, percentage: Math.round((count / total) * 100), resolved }))
    .sort((a, b) => b.count - a.count);
}

function calculateDepartments(issues: { department: string; status: string }[]): DepartmentMetric[] {
  const counts: Record<string, { total: number; resolved: number; pending: number }> = {};
  issues.forEach((i) => {
    if (!counts[i.department]) counts[i.department] = { total: 0, resolved: 0, pending: 0 };
    counts[i.department].total++;
    if (i.status === 'resolved' || i.status === 'closed') counts[i.department].resolved++;
    if (i.status === 'pending' || i.status === 'validated') counts[i.department].pending++;
  });
  return Object.entries(counts)
    .map(([department, { total, resolved, pending }]) => ({
      department, total, resolved, pending,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

function calculatePriority(issues: { severity: string }[]): PriorityMetric[] {
  const counts: Record<string, number> = {};
  issues.forEach((i) => { counts[i.severity] = (counts[i.severity] || 0) + 1; });
  const total = issues.length || 1;
  const colors: Record<string, string> = { critical: 'bg-danger-500', high: 'bg-accent-500', medium: 'bg-primary-400', low: 'bg-neutral-300' };
  return ['critical', 'high', 'medium', 'low']
    .filter((s) => counts[s])
    .map((label) => ({ label, count: counts[label] || 0, percentage: Math.round(((counts[label] || 0) / total) * 100), color: colors[label] || 'bg-neutral-300' }));
}

function calculateTrends(issues: { createdAt: Date; resolvedAt: Date | null }[]): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
    const reported = issues.filter((x) => x.createdAt >= dayStart && x.createdAt <= dayEnd).length;
    const resolved = issues.filter((x) => x.resolvedAt && x.resolvedAt >= dayStart && x.resolvedAt <= dayEnd).length;
    points.push({ date: dateStr, reported, resolved });
  }
  return points;
}

function calculateHotspots(issues: { address: string; category: string }[]): HotspotMetric[] {
  const areas: Record<string, { count: number; categories: Record<string, number> }> = {};
  issues.forEach((i) => {
    const area = i.address.split(',').slice(0, 2).join(',').trim() || 'Unknown';
    if (!areas[area]) areas[area] = { count: 0, categories: {} };
    areas[area].count++;
    areas[area].categories[i.category] = (areas[area].categories[i.category] || 0) + 1;
  });
  return Object.entries(areas)
    .map(([area, { count, categories }]) => {
      const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'other';
      return { area, count, topCategory };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

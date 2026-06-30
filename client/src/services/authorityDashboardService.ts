import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  AuthorityDashboardData,
  AuthorityStats,
  PriorityIssue,
  DepartmentWorkload,
  ActivityEntry,
} from '@/types/authorityDashboard';

const SEVERITY_WEIGHT: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Fetches all issues and computes authority dashboard metrics.
 */
export async function fetchAuthorityDashboard(): Promise<AuthorityDashboardData> {
  const snapshot = await getDocs(collection(db, 'issues'));

  const issues: {
    id: string;
    title: string;
    category: string;
    severity: string;
    status: string;
    department: string;
    trackingId: string;
    reporterName: string;
    createdAt: Date;
  }[] = [];

  snapshot.forEach((doc) => {
    const d = doc.data();
    issues.push({
      id: doc.id,
      title: d.title || 'Untitled',
      category: d.category || 'other',
      severity: d.severity || 'medium',
      status: d.status || 'pending',
      department: d.department || 'general',
      trackingId: d.trackingId || '',
      reporterName: d.reporter?.name || 'Anonymous',
      createdAt: d.createdAt?.toDate?.() || new Date(),
    });
  });

  const stats = calculateStats(issues);
  const priorityIssues = calculatePriorityIssues(issues);
  const workload = calculateWorkload(issues);
  const recentActivity = buildRecentActivity(issues);
  const aiSummary = generateAISummary(stats, issues);

  return { stats, priorityIssues, workload, recentActivity, aiSummary };
}

function calculateStats(issues: { status: string; severity: string }[]): AuthorityStats {
  return {
    total: issues.length,
    pending: issues.filter((i) => i.status === 'pending' || i.status === 'validated').length,
    inProgress: issues.filter((i) => i.status === 'in_progress').length,
    resolved: issues.filter((i) => i.status === 'resolved' || i.status === 'closed').length,
    critical: issues.filter((i) => i.severity === 'critical').length,
  };
}

function calculatePriorityIssues(issues: {
  id: string; title: string; category: string; severity: string; status: string;
  department: string; trackingId: string; reporterName: string; createdAt: Date;
}[]): PriorityIssue[] {
  return issues
    .filter((i) => i.status !== 'resolved' && i.status !== 'closed')
    .sort((a, b) => {
      const sevDiff = (SEVERITY_WEIGHT[b.severity] || 0) - (SEVERITY_WEIGHT[a.severity] || 0);
      if (sevDiff !== 0) return sevDiff;
      return a.createdAt.getTime() - b.createdAt.getTime(); // Oldest first for same severity
    })
    .slice(0, 5)
    .map((i) => ({
      documentId: i.id,
      title: i.title,
      category: i.category,
      severity: i.severity,
      department: i.department,
      reportedAt: i.createdAt,
      trackingId: i.trackingId,
      reporterName: i.reporterName,
    }));
}

function calculateWorkload(issues: { status: string; createdAt: Date }[]): DepartmentWorkload {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const assignedToday = issues.filter((i) =>
    i.status === 'in_progress' && i.createdAt >= today
  ).length;

  const resolvedToday = issues.filter((i) =>
    (i.status === 'resolved' || i.status === 'closed') && i.createdAt >= today
  ).length;

  const backlog = issues.filter((i) =>
    i.status === 'pending' || i.status === 'validated'
  ).length;

  return {
    assignedToday,
    resolvedToday,
    avgResolutionHours: 36, // Placeholder — would need resolved timestamps
    backlog,
  };
}

function buildRecentActivity(issues: { title: string; status: string; createdAt: Date }[]): ActivityEntry[] {
  return issues
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6)
    .map((i) => ({
      action: i.status === 'resolved' ? 'Issue Resolved' : i.status === 'in_progress' ? 'Status Updated' : 'Issue Reported',
      issueTitle: i.title,
      time: i.createdAt,
      type: i.status === 'resolved' ? 'resolved' : i.status === 'in_progress' ? 'status_change' : 'reported',
    }));
}

function generateAISummary(stats: AuthorityStats, issues: { severity: string; status: string; department: string }[]): string {
  if (stats.total === 0) return 'No issues in the system. The community is quiet today.';

  const parts: string[] = [];

  if (stats.critical > 0) {
    parts.push(`${stats.critical} critical issue${stats.critical > 1 ? 's' : ''} require${stats.critical === 1 ? 's' : ''} immediate attention.`);
  }

  if (stats.pending > 3) {
    parts.push(`${stats.pending} reports are awaiting review.`);
  }

  // Find busiest department
  const deptCounts: Record<string, number> = {};
  issues.filter((i) => i.status !== 'resolved' && i.status !== 'closed').forEach((i) => {
    deptCounts[i.department] = (deptCounts[i.department] || 0) + 1;
  });
  const topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0];
  if (topDept) {
    parts.push(`${topDept[0].replace('_', ' ')} has the highest active workload (${topDept[1]} issues).`);
  }

  return parts.length > 0 ? parts.join(' ') : `${stats.total} total issues tracked. ${stats.resolved} resolved. Operations running smoothly.`;
}

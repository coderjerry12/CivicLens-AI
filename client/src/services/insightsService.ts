import type { ReportCardData } from '@/types/reportCard';
import type { DashboardInsights, InsightCard, DailySummary, SuggestedAction } from '@/types/insight';
import type { DashboardStats } from '@/types/dashboard';

/**
 * Generates AI-style insights from existing user data.
 * Designed to be replaced by Gemini API calls in a future phase.
 */
export function generateInsights(
  reports: ReportCardData[],
  stats: DashboardStats | null,
  userName: string
): DashboardInsights {
  const welcomeMessage = buildWelcomeMessage(reports, stats, userName);
  const suggestedAction = buildSuggestedAction(reports, stats);
  const dailySummary = buildDailySummary(reports, stats);
  const insightCards = buildInsightCards(reports, stats);

  return { welcomeMessage, suggestedAction, dailySummary, insightCards };
}

// ─── Welcome Message ───

function buildWelcomeMessage(reports: ReportCardData[], stats: DashboardStats | null, userName: string): string {
  const firstName = userName.split(' ')[0] || 'there';

  if (reports.length === 0) {
    return `Welcome, ${firstName}! Start making an impact by reporting your first community issue.`;
  }

  const resolved = stats?.resolved ?? 0;
  const total = stats?.totalReports ?? reports.length;
  const pending = reports.filter((r) => r.status === 'pending').length;

  if (pending > 0) {
    return `${firstName}, you have ${pending} report${pending > 1 ? 's' : ''} awaiting review. Your ${total} contributions are helping the community!`;
  }

  if (resolved > 0) {
    return `Great work, ${firstName}! ${resolved} of your ${total} reported issues have been resolved. Keep making a difference!`;
  }

  return `${firstName}, you've reported ${total} issue${total > 1 ? 's' : ''}. Your contributions strengthen the community.`;
}

// ─── Suggested Action ───

function buildSuggestedAction(reports: ReportCardData[], stats: DashboardStats | null): SuggestedAction {
  if (reports.length === 0) {
    return {
      label: 'Report Your First Issue',
      description: 'Upload a photo and let AI categorize it for you',
      route: '/app/issues/new',
      icon: 'PlusCircle',
    };
  }

  const pending = stats?.pending ?? 0;
  if (pending > 2) {
    return {
      label: 'Check Issue Updates',
      description: `${pending} of your reports are being reviewed`,
      route: '/app/issues',
      icon: 'ClipboardList',
    };
  }

  return {
    label: 'Report Nearby Issue',
    description: 'Help improve your neighborhood today',
    route: '/app/issues/new',
    icon: 'MapPin',
  };
}

// ─── Daily Summary ───

function buildDailySummary(reports: ReportCardData[], stats: DashboardStats | null): DailySummary {
  // Find most reported category
  const categoryCounts: Record<string, number> = {};
  reports.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });

  const topCategory = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

  const resolved = stats?.resolved ?? 0;
  const total = stats?.totalReports ?? reports.length;
  const resolutionRate = total > 0 ? resolved / total : 0;

  const communityTrend: DailySummary['communityTrend'] =
    resolutionRate > 0.6 ? 'improving' : resolutionRate > 0.3 ? 'stable' : 'declining';

  const confidence = Math.min(60 + reports.length * 5, 95);

  return { topCategory, resolvedCount: resolved, communityTrend, confidence };
}

// ─── Insight Cards ───

function buildInsightCards(reports: ReportCardData[], stats: DashboardStats | null): InsightCard[] {
  const cards: InsightCard[] = [];

  // Trending category
  const categoryCounts: Record<string, number> = {};
  reports.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });
  const topEntry = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  if (topEntry) {
    cards.push({
      id: 'trend-1',
      type: 'trend',
      title: 'Trending in Your Area',
      description: `${topEntry[0].replace('_', ' ')} issues are most reported (${topEntry[1]} reports)`,
      metric: `${topEntry[1]} reports`,
      icon: 'TrendingUp',
      color: 'primary',
    });
  }

  // Community impact
  if (stats) {
    cards.push({
      id: 'impact-1',
      type: 'impact',
      title: 'Your Community Impact',
      description: `You've helped resolve ${stats.resolved} issue${stats.resolved !== 1 ? 's' : ''}. Keep contributing!`,
      metric: `${stats.communityImpact.score}%`,
      icon: 'Heart',
      color: 'success',
    });
  }

  // Recommendation
  const unresolvedCount = reports.filter((r) => r.status === 'pending' || r.status === 'in_progress').length;
  if (unresolvedCount > 0) {
    cards.push({
      id: 'rec-1',
      type: 'recommendation',
      title: 'Follow Up',
      description: `${unresolvedCount} of your reports are still active. Check for updates.`,
      metric: `${unresolvedCount} active`,
      icon: 'Bell',
      color: 'accent',
    });
  }

  // Municipality activity
  cards.push({
    id: 'activity-1',
    type: 'activity',
    title: 'Municipality Response',
    description: 'Average response time in your area is 24-48 hours',
    metric: '24-48h',
    icon: 'Building2',
    color: 'secondary',
  });

  return cards;
}
